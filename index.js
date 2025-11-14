const Discord = require('discord.js');
const express = require('express');

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildInvites
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// ===== IN-MEMORY STORAGE (NO DATABASE) =====
let activeTournament = null;
let slots = 0;
const MAX_SLOTS = 48;
let pendingTickets = new Map(); // userId -> ticket data
let userInvites = new Map(); // userId -> invite count
let tournamentMessages = { updates: null, general: null }; // Message IDs for auto-update
let tournamentParticipants = []; // Store all registered players

// ===== CONFIG =====
const CONFIG = {
  STAFF_TOOL_CHANNEL: '1438486059255336970', // #staff-tool
  TOURNAMENT_UPDATES: '1438484997177606145', // #tournament-updates
  GENERAL_CHANNEL: '1438482904018849835', // #general-chat
  WINNERS_CHANNEL: '1438485128698658919', // #winners
  STAFF_ROLE: '1438475461977047112', // @Staff
  QR_IMAGE: 'https://ibb.co/rGWqc0xm',
  RULES: `📜 **TOURNAMENT RULES:**
  
1️⃣ No teaming/camping
2️⃣ No hacking/cheating
3️⃣ Follow room ID exactly
4️⃣ Screenshot required
5️⃣ Decision is final

⚠️ Breaking rules = Disqualification`
};

// ===== SERVER ONLINE =====
app.get('/', (req, res) => {
  res.send(`🔥 OTO BOT ONLINE | Slots: ${slots}/${MAX_SLOTS} | Participants: ${tournamentParticipants.length}`);
});

app.listen(PORT, () => {
  console.log(`✅ Server on port ${PORT}`);
});

// ===== BOT READY =====
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} ONLINE!`);
  client.user.setActivity('OTO Tournaments', { type: Discord.ActivityType.Competing });
  
  await registerCommands();
  
  // Track invites
  client.guilds.cache.forEach(async (guild) => {
    const invites = await guild.invites.fetch();
    invites.forEach(invite => {
      userInvites.set(invite.inviter.id, invite.uses);
    });
  });
  
  // Auto announcements every 1 min
  setInterval(autoSlotAnnouncements, 60000);
});

// ===== REGISTER COMMANDS =====
async function registerCommands() {
  const commands = [
    {
      name: 'create-tournament',
      description: '🎮 Create tournament (Staff Tool)',
      options: [
        { name: 'title', type: 3, description: 'Tournament name', required: true },
        { name: 'prize', type: 3, description: 'Prize pool', required: true },
        { name: 'entry', type: 3, description: 'Entry fee', required: true },
        { name: 'mode', type: 3, description: 'Game mode (TPP/FPP)', required: true },
        { name: 'time', type: 3, description: 'Start time', required: true }
      ]
    },
    {
      name: 'leaderboard',
      description: '📊 Upload leaderboard screenshot',
      options: [
        { name: 'image', type: 11, description: 'Leaderboard image', required: true }
      ]
    },
    {
      name: 'check-invites',
      description: '🎟️ Check your invites'
    },
    {
      name: 'reset-tournament',
      description: '🔄 Reset current tournament'
    }
  ];

  await client.application.commands.set(commands);
  console.log('✅ Commands registered');
}

// ===== TRACK INVITES =====
client.on('guildMemberAdd', async (member) => {
  const guild = member.guild;
  const invites = await guild.invites.fetch();
  
  invites.forEach(invite => {
    const oldUses = userInvites.get(invite.inviter.id) || 0;
    if (invite.uses > oldUses) {
      userInvites.set(invite.inviter.id, invite.uses);
      
      // Check if user gets free entry (2+ invites)
      if (invite.uses >= 2) {
        const channel = guild.channels.cache.get(CONFIG.GENERAL_CHANNEL);
        channel.send(`🎉 <@${invite.inviter.id}> invited ${invite.uses} people! **FREE ENTRY UNLOCKED!** 🎟️`);
      }
    }
  });
});

// ===== SLASH COMMANDS =====
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'create-tournament') {
      if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
        return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      }
      await createTournament(interaction);
    }

    if (commandName === 'leaderboard') {
      if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
        return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      }
      await uploadLeaderboard(interaction);
    }

    if (commandName === 'check-invites') {
      const inviteCount = userInvites.get(interaction.user.id) || 0;
      const freeEntry = inviteCount >= 2 ? '✅ FREE ENTRY UNLOCKED!' : '❌ Need 2 invites';
      await interaction.reply({ 
        content: `🎟️ You have **${inviteCount} invites**\n${freeEntry}`, 
        ephemeral: true 
      });
    }

    if (commandName === 'reset-tournament') {
      if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
        return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      }
      await resetTournament(interaction);
    }
  }

  // ===== BUTTON HANDLER =====
  if (interaction.isButton()) {
    const { customId } = interaction;

    if (customId === 'join_tournament') {
      await handleJoinButton(interaction);
    } else if (customId.startsWith('approve_')) {
      await handleApprove(interaction);
    } else if (customId.startsWith('reject_')) {
      await handleReject(interaction);
    } else if (customId === 'confirm_details') {
      await handleConfirmation(interaction);
    }
  }
});

// ===== CREATE TOURNAMENT (STAFF TOOL) =====
async function createTournament(interaction) {
  const title = interaction.options.getString('title');
  const prize = interaction.options.getString('prize');
  const entry = interaction.options.getString('entry');
  const mode = interaction.options.getString('mode');
  const time = interaction.options.getString('time');

  activeTournament = { title, prize, entry, mode, time };
  slots = 0;
  tournamentParticipants = [];

  // STAFF TOOL CONFIRMATION
  const staffEmbed = new Discord.EmbedBuilder()
    .setTitle('✅ Tournament Created!')
    .setColor('#00FF00')
    .addFields(
      { name: '🎮 Title', value: title },
      { name: '💰 Prize', value: prize },
      { name: '🎟️ Entry', value: entry },
      { name: '🎯 Mode', value: mode },
      { name: '⏰ Time', value: time },
      { name: '📊 Status', value: 'Posted to channels!' }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [staffEmbed], ephemeral: true });

  // POST TO TOURNAMENT UPDATES
  await postToTournamentUpdates();

  // POST TO GENERAL CHAT
  await postToGeneralChat();
}

// ===== POST TO TOURNAMENT UPDATES =====
async function postToTournamentUpdates() {
  const channel = await client.channels.fetch(CONFIG.TOURNAMENT_UPDATES);
  
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${activeTournament.title}`)
    .setDescription('**Click JOIN below to participate!**')
    .setColor('#FF6B00')
    .addFields(
      { name: '💰 Prize Pool', value: activeTournament.prize, inline: true },
      { name: '🎟️ Entry Fee', value: activeTournament.entry, inline: true },
      { name: '🎯 Mode', value: activeTournament.mode, inline: true },
      { name: '⏰ Start Time', value: activeTournament.time, inline: true },
      { name: '📊 Slots', value: generateSlotUI(), inline: false }
    )
    .setFooter({ text: '2 invites = FREE entry! Invite friends now!' })
    .setTimestamp();

  const button = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN TOURNAMENT')
      .setStyle(Discord.ButtonStyle.Success)
  );

  const msg = await channel.send({ embeds: [embed], components: [button] });
  tournamentMessages.updates = msg.id;
}

// ===== POST TO GENERAL CHAT =====
async function postToGeneralChat() {
  const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
  
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🔥 NEW TOURNAMENT LIVE!`)
    .setDescription(`**${activeTournament.title}** is now open!\n\n💰 Win ${activeTournament.prize}!\n🎟️ Entry: ${activeTournament.entry}\n⏰ Starts: ${activeTournament.time}`)
    .setColor('#FF0000')
    .addFields(
      { name: '📊 Slots Available', value: generateSlotUI(), inline: false }
    )
    .setFooter({ text: '🎁 Invite 2 friends = FREE ENTRY!' });

  const button = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN NOW')
      .setStyle(Discord.ButtonStyle.Success)
  );

  const msg = await channel.send({ content: '@everyone', embeds: [embed], components: [button] });
  tournamentMessages.general = msg.id;
}

// ===== SLOT UI (VISUAL PROGRESS BAR) =====
function generateSlotUI() {
  const filled = Math.floor((slots / MAX_SLOTS) * 10);
  const empty = 10 - filled;
  const bar = '🟩'.repeat(filled) + '⬜'.repeat(empty);
  return `${bar}\n**${slots}/${MAX_SLOTS}** players registered`;
}

// ===== JOIN BUTTON HANDLER =====
async function handleJoinButton(interaction) {
  if (slots >= MAX_SLOTS) {
    return interaction.reply({ content: '❌ Tournament is FULL!', ephemeral: true });
  }

  // Check if user already registered
  if (tournamentParticipants.some(p => p.userId === interaction.user.id)) {
    return interaction.reply({ content: '⚠️ You already registered!', ephemeral: true });
  }

  // Create private ticket thread
  const channel = interaction.channel;
  const thread = await channel.threads.create({
    name: `🎟️ ${interaction.user.username}-ticket`,
    autoArchiveDuration: 60,
    type: Discord.ChannelType.PrivateThread
  });

  await thread.members.add(interaction.user.id);

  // Check free entry
  const inviteCount = userInvites.get(interaction.user.id) || 0;
  const freeEntry = inviteCount >= 2;

  const embed = new Discord.EmbedBuilder()
    .setTitle('🎟️ Tournament Registration')
    .setDescription(`Welcome <@${interaction.user.id}>!\n\n**Please provide:**`)
    .addFields(
      { name: '1️⃣ UID', value: 'Your game UID', inline: false },
      { name: '2️⃣ IGN', value: 'In-game name', inline: false },
      { name: '3️⃣ Payment', value: freeEntry ? '✅ FREE ENTRY (2+ invites)' : 'Screenshot of payment', inline: false }
    )
    .setColor(freeEntry ? '#00FF00' : '#FFD700')
    .setImage(freeEntry ? null : CONFIG.QR_IMAGE)
    .setFooter({ text: `Slots: ${slots}/${MAX_SLOTS}` });

  const rulesEmbed = new Discord.EmbedBuilder()
    .setTitle('📜 RULES')
    .setDescription(CONFIG.RULES)
    .setColor('#FF0000');

  await thread.send({ 
    content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`, 
    embeds: [embed, rulesEmbed] 
  });

  pendingTickets.set(interaction.user.id, { 
    threadId: thread.id, 
    freeEntry,
    uid: null,
    ign: null,
    payment: null
  });

  await interaction.reply({ content: `✅ Ticket created: <#${thread.id}>`, ephemeral: true });

  // Auto-collect messages
  const collector = thread.createMessageCollector({ time: 600000 });

  collector.on('collect', async (msg) => {
    if (msg.author.bot) return;
    
    const ticket = pendingTickets.get(interaction.user.id);
    if (!ticket) return;

    // Parse UID (9-12 digits)
    if (!ticket.uid && /^\d{9,12}$/.test(msg.content)) {
      ticket.uid = msg.content;
      await msg.react('✅');
    }
    // Parse IGN
    else if (!ticket.ign && msg.content.length > 2 && msg.content.length < 20) {
      ticket.ign = msg.content;
      await msg.react('✅');
    }
    // Parse payment screenshot
    else if (!ticket.payment && (msg.attachments.size > 0 || ticket.freeEntry)) {
      if (ticket.freeEntry) {
        ticket.payment = 'FREE_ENTRY';
      } else {
        ticket.payment = msg.attachments.first()?.url || 'PENDING';
      }
      await msg.react('✅');
      
      // Show confirmation
      if (ticket.uid && ticket.ign && ticket.payment) {
        const confirmEmbed = new Discord.EmbedBuilder()
          .setTitle('✅ Confirm Your Details')
          .addFields(
            { name: 'UID', value: ticket.uid, inline: true },
            { name: 'IGN', value: ticket.ign, inline: true },
            { name: 'Payment', value: ticket.freeEntry ? '🎁 FREE ENTRY' : '✅ Verified', inline: true }
          )
          .setColor('#00FF00');

        const confirmBtn = new Discord.ActionRowBuilder().addComponents(
          new Discord.ButtonBuilder()
            .setCustomId('confirm_details')
            .setLabel('✅ CONFIRM')
            .setStyle(Discord.ButtonStyle.Success)
        );

        await thread.send({ embeds: [confirmEmbed], components: [confirmBtn] });
      }
    }
  });
}

// ===== USER CONFIRMS DETAILS =====
async function handleConfirmation(interaction) {
  const ticket = pendingTickets.get(interaction.user.id);
  if (!ticket) return;

  const thread = interaction.channel;

  // Send to staff for approval
  const staffButtons = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId(`approve_${interaction.user.id}`)
      .setLabel('✅ APPROVE')
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId(`reject_${interaction.user.id}`)
      .setLabel('❌ REJECT')
      .setStyle(Discord.ButtonStyle.Danger)
  );

  await thread.send({ 
    content: `<@&${CONFIG.STAFF_ROLE}> **Review Registration:**\n\nUID: ${ticket.uid}\nIGN: ${ticket.ign}\nPayment: ${ticket.freeEntry ? '🎁 FREE ENTRY' : ticket.payment}`, 
    components: [staffButtons] 
  });

  await interaction.reply({ content: '✅ Sent to staff for verification!', ephemeral: true });
}

// ===== STAFF APPROVE =====
async function handleApprove(interaction) {
  const userId = interaction.customId.split('_')[1];
  const ticket = pendingTickets.get(userId);
  
  if (!ticket) return interaction.reply({ content: '❌ Ticket not found', ephemeral: true });

  slots++;
  tournamentParticipants.push({
    userId,
    uid: ticket.uid,
    ign: ticket.ign,
    freeEntry: ticket.freeEntry
  });

  pendingTickets.delete(userId);

  await interaction.reply({ content: `✅ <@${userId}> APPROVED! Slot: ${slots}/${MAX_SLOTS}` });

  // Update embeds
  await updateAllEmbeds();

  // Close thread
  const thread = await client.channels.fetch(ticket.threadId);
  await thread.send(`🎉 **REGISTRATION CONFIRMED!**\n\n✅ You're in slot #${slots}\n🎮 Get ready for ${activeTournament.title}!\n⏰ Time: ${activeTournament.time}`);
  setTimeout(() => thread.setArchived(true), 5000);
}

// ===== STAFF REJECT =====
async function handleReject(interaction) {
  const userId = interaction.customId.split('_')[1];
  const ticket = pendingTickets.get(userId);
  
  if (!ticket) return interaction.reply({ content: '❌ Ticket not found', ephemeral: true });

  pendingTickets.delete(userId);

  await interaction.reply({ content: `❌ <@${userId}> REJECTED.` });

  const thread = await client.channels.fetch(ticket.threadId);
  await thread.send('❌ **Registration rejected.** Contact staff for details.');
  setTimeout(() => thread.setArchived(true), 5000);
}

// ===== UPDATE ALL EMBEDS =====
async function updateAllEmbeds() {
  // Update Tournament Updates
  if (tournamentMessages.updates) {
    const channel = await client.channels.fetch(CONFIG.TOURNAMENT_UPDATES);
    const msg = await channel.messages.fetch(tournamentMessages.updates);
    
    const embed = Discord.EmbedBuilder.from(msg.embeds[0])
      .setFields(
        { name: '💰 Prize Pool', value: activeTournament.prize, inline: true },
        { name: '🎟️ Entry Fee', value: activeTournament.entry, inline: true },
        { name: '🎯 Mode', value: activeTournament.mode, inline: true },
        { name: '⏰ Start Time', value: activeTournament.time, inline: true },
        { name: '📊 Slots', value: generateSlotUI(), inline: false }
      );

    const button = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('join_tournament')
        .setLabel(slots >= MAX_SLOTS ? '🔴 FULL' : '🎮 JOIN TOURNAMENT')
        .setStyle(slots >= MAX_SLOTS ? Discord.ButtonStyle.Danger : Discord.ButtonStyle.Success)
        .setDisabled(slots >= MAX_SLOTS)
    );

    await msg.edit({ embeds: [embed], components: [button] });
  }

  // Update General Chat
  if (tournamentMessages.general) {
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
    const msg = await channel.messages.fetch(tournamentMessages.general);
    
    const embed = Discord.EmbedBuilder.from(msg.embeds[0])
      .setFields(
        { name: '📊 Slots Available', value: generateSlotUI(), inline: false }
      );

    await msg.edit({ embeds: [embed] });
  }
}

// ===== AUTO ANNOUNCEMENTS (1 MIN) =====
async function autoSlotAnnouncements() {
  if (!activeTournament || slots >= MAX_SLOTS) return;

  const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
  
  const remaining = MAX_SLOTS - slots;
  
  if (slots === 0) {
    await channel.send(`🔥 **${activeTournament.title} IS LIVE!**\n\n💰 Prize: ${activeTournament.prize}\n⏰ Time: ${activeTournament.time}\n\n${generateSlotUI()}\n\n👉 Click JOIN button above!`);
  } else if (remaining <= 10) {
    await channel.send(`🚨 **HURRY! Only ${remaining} slots left!**\n\n${generateSlotUI()}`);
  } else if (slots % 10 === 0) {
    await channel.send(`📢 **${remaining} slots remaining!**\n\n${generateSlotUI()}`);
  }
}

// ===== UPLOAD LEADERBOARD =====
async function uploadLeaderboard(interaction) {
  const attachment = interaction.options.getAttachment('image');
  
  if (!attachment || !attachment.contentType?.startsWith('image/')) {
    return interaction.reply({ content: '❌ Please upload an image!', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  // Post leaderboard in winners channel
  const winnersChannel = await client.channels.fetch(CONFIG.WINNERS_CHANNEL);
  
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🏆 ${activeTournament.title} - RESULTS`)
    .setDescription('**Congratulations to all winners!**')
    .setImage(attachment.url)
    .setColor('#FFD700')
    .setTimestamp();

  await winnersChannel.send({ embeds: [embed] });

  // Announce in general
  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
  await generalChannel.send(`🏆 **${activeTournament.title} WINNERS ANNOUNCED!**\n\nCheck <#${CONFIG.WINNERS_CHANNEL}> for full leaderboard! 🎉`);

  await interaction.editReply({ content: '✅ Leaderboard posted!' });
}

// ===== RESET TOURNAMENT =====
async function resetTournament(interaction) {
  activeTournament = null;
  slots = 0;
  tournamentParticipants = [];
  tournamentMessages = { updates: null, general: null };
  pendingTickets.clear();
  
  await interaction.reply({ content: '🔄 Tournament reset!', ephemeral: true });
}

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
