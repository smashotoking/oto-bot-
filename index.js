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
let pendingTickets = new Map();
let userInvites = new Map();
let tournamentMessages = { updates: null, general: null };
let tournamentParticipants = [];

// ===== CONFIG =====
const CONFIG = {
  STAFF_TOOL_CHANNEL: '1438486059255336970',
  TOURNAMENT_UPDATES: '1438484997177606145',
  GENERAL_CHANNEL: '1438482904018849835',
  WINNERS_CHANNEL: '1438485128698658919',
  STAFF_ROLE: '1438475461977047112',
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

// ===== BOT READY (FIXED DEPRECATION) =====
client.once('clientReady', async () => {
  console.log(`🚀 ${client.user.tag} ONLINE!`);
  client.user.setActivity('OTO Tournaments', { type: Discord.ActivityType.Competing });
  
  try {
    await registerCommands();
    
    // Track invites
    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        invites.forEach(invite => {
          if (invite.inviter) {
            userInvites.set(invite.inviter.id, invite.uses);
          }
        });
      } catch (err) {
        console.error(`Failed to fetch invites for guild ${guild.id}:`, err);
      }
    }
    
    // Auto announcements every 1 min
    setInterval(autoSlotAnnouncements, 60000);
  } catch (error) {
    console.error('Error in ready event:', error);
  }
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
  try {
    const guild = member.guild;
    const invites = await guild.invites.fetch();
    
    invites.forEach(invite => {
      if (!invite.inviter) return;
      
      const oldUses = userInvites.get(invite.inviter.id) || 0;
      if (invite.uses > oldUses) {
        userInvites.set(invite.inviter.id, invite.uses);
        
        if (invite.uses >= 2) {
          const channel = guild.channels.cache.get(CONFIG.GENERAL_CHANNEL);
          if (channel) {
            channel.send(`🎉 <@${invite.inviter.id}> invited ${invite.uses} people! **FREE ENTRY UNLOCKED!** 🎟️`);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error tracking invite:', error);
  }
});

// ===== SLASH COMMANDS =====
client.on('interactionCreate', async (interaction) => {
  try {
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
  } catch (error) {
    console.error('Interaction error:', error);
    
    // Try to respond to user
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ An error occurred. Please try again.', ephemeral: true });
      } else {
        await interaction.followUp({ content: '❌ An error occurred. Please try again.', ephemeral: true });
      }
    } catch (replyError) {
      console.error('Failed to send error message:', replyError);
    }
  }
});

// ===== CREATE TOURNAMENT (FIXED WITH DEFER) =====
async function createTournament(interaction) {
  // DEFER IMMEDIATELY TO PREVENT TIMEOUT
  await interaction.deferReply({ ephemeral: true });

  try {
    const title = interaction.options.getString('title');
    const prize = interaction.options.getString('prize');
    const entry = interaction.options.getString('entry');
    const mode = interaction.options.getString('mode');
    const time = interaction.options.getString('time');

    activeTournament = { title, prize, entry, mode, time };
    slots = 0;
    tournamentParticipants = [];

    // POST TO TOURNAMENT UPDATES
    await postToTournamentUpdates();

    // POST TO GENERAL CHAT
    await postToGeneralChat();

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

    await interaction.editReply({ embeds: [staffEmbed] });
  } catch (error) {
    console.error('Error creating tournament:', error);
    await interaction.editReply({ content: '❌ Failed to create tournament. Check logs.' });
  }
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

// ===== JOIN BUTTON HANDLER (FIXED WITH DEFER) =====
async function handleJoinButton(interaction) {
  // DEFER TO PREVENT TIMEOUT
  await interaction.deferReply({ ephemeral: true });

  try {
    if (slots >= MAX_SLOTS) {
      return interaction.editReply({ content: '❌ Tournament is FULL!' });
    }

    if (tournamentParticipants.some(p => p.userId === interaction.user.id)) {
      return interaction.editReply({ content: '⚠️ You already registered!' });
    }

    // Create private ticket thread
    const channel = interaction.channel;
    const thread = await channel.threads.create({
      name: `🎟️ ${interaction.user.username}-ticket`,
      autoArchiveDuration: 60,
      type: Discord.ChannelType.PrivateThread,
      reason: 'Tournament registration'
    });

    await thread.members.add(interaction.user.id);

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

    await interaction.editReply({ content: `✅ Ticket created: <#${thread.id}>` });

    // Auto-collect messages
    const collector = thread.createMessageCollector({ time: 600000 });

    collector.on('collect', async (msg) => {
      if (msg.author.bot) return;
      
      const ticket = pendingTickets.get(interaction.user.id);
      if (!ticket) return;

      try {
        if (!ticket.uid && /^\d{9,12}$/.test(msg.content)) {
          ticket.uid = msg.content;
          await msg.react('✅');
        }
        else if (!ticket.ign && msg.content.length > 2 && msg.content.length < 20) {
          ticket.ign = msg.content;
          await msg.react('✅');
        }
        else if (!ticket.payment && (msg.attachments.size > 0 || ticket.freeEntry)) {
          if (ticket.freeEntry) {
            ticket.payment = 'FREE_ENTRY';
          } else {
            ticket.payment = msg.attachments.first()?.url || 'PENDING';
          }
          await msg.react('✅');
          
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
      } catch (err) {
        console.error('Error in message collector:', err);
      }
    });
  } catch (error) {
    console.error('Error in handleJoinButton:', error);
    await interaction.editReply({ content: '❌ Failed to create ticket. Please try again or contact staff.' });
  }
}

// ===== USER CONFIRMS DETAILS =====
async function handleConfirmation(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const ticket = pendingTickets.get(interaction.user.id);
    if (!ticket) {
      return interaction.editReply({ content: '❌ Ticket not found!' });
    }

    const thread = interaction.channel;

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

    await interaction.editReply({ content: '✅ Sent to staff for verification!' });
  } catch (error) {
    console.error('Error in handleConfirmation:', error);
    await interaction.editReply({ content: '❌ Error sending for verification.' });
  }
}

// ===== STAFF APPROVE =====
async function handleApprove(interaction) {
  await interaction.deferReply();

  try {
    const userId = interaction.customId.split('_')[1];
    const ticket = pendingTickets.get(userId);
    
    if (!ticket) {
      return interaction.editReply({ content: '❌ Ticket not found' });
    }

    slots++;
    tournamentParticipants.push({
      userId,
      uid: ticket.uid,
      ign: ticket.ign,
      freeEntry: ticket.freeEntry
    });

    pendingTickets.delete(userId);

    await interaction.editReply({ content: `✅ <@${userId}> APPROVED! Slot: ${slots}/${MAX_SLOTS}` });

    await updateAllEmbeds();

    const thread = await client.channels.fetch(ticket.threadId);
    await thread.send(`🎉 **REGISTRATION CONFIRMED!**\n\n✅ You're in slot #${slots}\n🎮 Get ready for ${activeTournament.title}!\n⏰ Time: ${activeTournament.time}`);
    setTimeout(() => thread.setArchived(true), 5000);
  } catch (error) {
    console.error('Error in handleApprove:', error);
    await interaction.editReply({ content: '❌ Error approving registration.' });
  }
}

// ===== STAFF REJECT =====
async function handleReject(interaction) {
  await interaction.deferReply();

  try {
    const userId = interaction.customId.split('_')[1];
    const ticket = pendingTickets.get(userId);
    
    if (!ticket) {
      return interaction.editReply({ content: '❌ Ticket not found' });
    }

    pendingTickets.delete(userId);

    await interaction.editReply({ content: `❌ <@${userId}> REJECTED.` });

    const thread = await client.channels.fetch(ticket.threadId);
    await thread.send('❌ **Registration rejected.** Contact staff for details.');
    setTimeout(() => thread.setArchived(true), 5000);
  } catch (error) {
    console.error('Error in handleReject:', error);
    await interaction.editReply({ content: '❌ Error rejecting registration.' });
  }
}

// ===== UPDATE ALL EMBEDS =====
async function updateAllEmbeds() {
  try {
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

    if (tournamentMessages.general) {
      const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
      const msg = await channel.messages.fetch(tournamentMessages.general);
      
      const embed = Discord.EmbedBuilder.from(msg.embeds[0])
        .setFields(
          { name: '📊 Slots Available', value: generateSlotUI(), inline: false }
        );

      await msg.edit({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error updating embeds:', error);
  }
}

// ===== AUTO ANNOUNCEMENTS (1 MIN) =====
async function autoSlotAnnouncements() {
  if (!activeTournament || slots >= MAX_SLOTS) return;

  try {
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
    const remaining = MAX_SLOTS - slots;
    
    if (slots === 0) {
      await channel.send(`🔥 **${activeTournament.title} IS LIVE!**\n\n💰 Prize: ${activeTournament.prize}\n⏰ Time: ${activeTournament.time}\n\n${generateSlotUI()}\n\n👉 Click JOIN button above!`);
    } else if (remaining <= 10) {
      await channel.send(`🚨 **HURRY! Only ${remaining} slots left!**\n\n${generateSlotUI()}`);
    } else if (slots % 10 === 0) {
      await channel.send(`📢 **${remaining} slots remaining!**\n\n${generateSlotUI()}`);
    }
  } catch (error) {
    console.error('Error in auto announcements:', error);
  }
}

// ===== UPLOAD LEADERBOARD (FIXED WITH DEFER) =====
async function uploadLeaderboard(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const attachment = interaction.options.getAttachment('image');
    
    if (!attachment || !attachment.contentType?.startsWith('image/')) {
      return interaction.editReply({ content: '❌ Please upload an image!' });
    }

    const winnersChannel = await client.channels.fetch(CONFIG.WINNERS_CHANNEL);
    
    const embed = new Discord.EmbedBuilder()
      .setTitle(`🏆 ${activeTournament.title} - RESULTS`)
      .setDescription('**Congratulations to all winners!**')
      .setImage(attachment.url)
      .setColor('#FFD700')
      .setTimestamp();

    await winnersChannel.send({ embeds: [embed] });

    const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
    await generalChannel.send(`🏆 **${activeTournament.title} WINNERS ANNOUNCED!**\n\nCheck <#${CONFIG.WINNERS_CHANNEL}> for full leaderboard! 🎉`);

    await interaction.editReply({ content: '✅ Leaderboard posted!' });
  } catch (error) {
    console.error('Error uploading leaderboard:', error);
    await interaction.editReply({ content: '❌ Failed to upload leaderboard.' });
  }
}

// ===== RESET TOURNAMENT =====
async function resetTournament(interaction) {
  try {
    activeTournament = null;
    slots = 0;
    tournamentParticipants = [];
    tournamentMessages = { updates: null, general: null };
    pendingTickets.clear();
    
    await interaction.reply({ content: '🔄 Tournament reset!', ephemeral: true });
  } catch (error) {
    console.error('Error resetting tournament:', error);
    await interaction.reply({ content: '❌ Error resetting tournament.', ephemeral: true });
  }
}

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
