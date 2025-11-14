// Enhanced OTO Tournament Bot - Professional Version
require('dotenv').config();
const Discord = require('discord.js');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
if (!BOT_TOKEN) {
  console.error('ERROR: No bot token found. Set BOT_TOKEN in .env');
  process.exit(1);
}

// ==================== CLIENT SETUP ====================
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildInvites
  ],
});

// Express server
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('OTO Tournament Bot - Professional Edition'));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ==================== CONFIGURATION ====================
const CONFIG = {
  STAFF_TOOL_CHANNEL: '1438486059255336970',
  TOURNAMENT_UPDATES: '1438484997177606145',
  GENERAL_CHANNEL: '1438482904018849835',
  WINNERS_CHANNEL: '1438485128698658919',
  STAFF_ROLE: '1438475461977047112',
  JOIN_QUEUE: '1438483158665646091',
  QR_IMAGE: 'https://ibb.co/jkBSmkM3',
  MAX_SLOTS: 48,
  MIN_INVITES: 3,
  RULES: `📜 **TOURNAMENT RULES:**
1️⃣ No teaming or camping
2️⃣ No hacking or cheating tools
3️⃣ Follow room ID exactly as given
4️⃣ Screenshot proof required for winners
5️⃣ Staff decision is final`
};

// ==================== DATA STRUCTURES ====================
let activeTournament = null;
let tournamentHistory = [];
let registeredPlayers = new Map();
let pendingApprovals = new Map();
let userInvites = new Map();
let userStats = new Map();
let bannedUsers = new Set();
let warnings = new Map();

// Tournament object structure
function createTournament(title, prizePool, time, slots = CONFIG.MAX_SLOTS) {
  return {
    id: Date.now().toString(),
    title,
    prizePool,
    scheduledTime: time,
    maxSlots: slots,
    status: 'registration', // registration, live, ended
    createdAt: new Date(),
    participants: [],
    winners: [],
    roomId: null,
    roomPassword: null
  };
}

// ==================== READY EVENT ====================
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  
  try {
    await client.user.setActivity('🏆 OTO Tournaments', { 
      type: Discord.ActivityType.Competing 
    });
    
    await registerCommands();
    console.log('✅ Commands registered successfully');
    
    // Fetch existing invites
    await fetchServerInvites();
    
    // Start automated tasks
    startAutomatedTasks();
    
  } catch (err) {
    console.error('Initialization error:', err);
  }
});

// ==================== COMMAND REGISTRATION ====================
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    // ===== TOURNAMENT MANAGEMENT =====
    new SlashCommandBuilder()
      .setName('create-tournament')
      .setDescription('📅 Create a new tournament')
      .addStringOption(opt => opt.setName('title').setDescription('Tournament name').setRequired(true))
      .addIntegerOption(opt => opt.setName('prize').setDescription('Prize pool amount').setRequired(true))
      .addStringOption(opt => opt.setName('time').setDescription('Time (e.g., 7pm)').setRequired(true))
      .addIntegerOption(opt => opt.setName('slots').setDescription('Max players (default 48)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('start-tournament')
      .setDescription('🎮 Start the tournament and set room details')
      .addStringOption(opt => opt.setName('room-id').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Room password'))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('end-tournament')
      .setDescription('🏁 End tournament and declare winners')
      .addUserOption(opt => opt.setName('winner1').setDescription('1st place').setRequired(true))
      .addUserOption(opt => opt.setName('winner2').setDescription('2nd place'))
      .addUserOption(opt => opt.setName('winner3').setDescription('3rd place'))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('cancel-tournament')
      .setDescription('❌ Cancel active tournament')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('tournament-status')
      .setDescription('📊 View current tournament status'),

    // ===== PLAYER MANAGEMENT =====
    new SlashCommandBuilder()
      .setName('approve-player')
      .setDescription('✅ Approve a player manually')
      .addUserOption(opt => opt.setName('user').setDescription('Player to approve').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('reject-player')
      .setDescription('❌ Reject a player')
      .addUserOption(opt => opt.setName('user').setDescription('Player to reject').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Rejection reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('kick-player')
      .setDescription('👢 Remove player from tournament')
      .addUserOption(opt => opt.setName('user').setDescription('Player to kick').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Kick reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // ===== USER COMMANDS =====
    new SlashCommandBuilder()
      .setName('check-invites')
      .setDescription('🔗 Check your invite count'),

    new SlashCommandBuilder()
      .setName('my-stats')
      .setDescription('📈 View your tournament statistics'),

    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('🏆 View top players'),

    // ===== MODERATION =====
    new SlashCommandBuilder()
      .setName('warn-player')
      .setDescription('⚠️ Warn a player')
      .addUserOption(opt => opt.setName('user').setDescription('Player to warn').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Warning reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('ban-player')
      .setDescription('🚫 Ban player from tournaments')
      .addUserOption(opt => opt.setName('user').setDescription('Player to ban').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Ban reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('unban-player')
      .setDescription('✅ Unban player from tournaments')
      .addUserOption(opt => opt.setName('user').setDescription('Player to unban').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // ===== UTILITY =====
    new SlashCommandBuilder()
      .setName('announce')
      .setDescription('📢 Send announcement to general chat')
      .addStringOption(opt => opt.setName('message').setDescription('Announcement text').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('participants')
      .setDescription('👥 List all tournament participants')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('history')
      .setDescription('📜 View tournament history')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number of tournaments to show (default 5)')),

    new SlashCommandBuilder()
      .setName('rules')
      .setDescription('📋 Display tournament rules'),

    new SlashCommandBuilder()
      .setName('help')
      .setDescription('❓ Show all bot commands'),
  ];

  const body = commands.map(c => c.toJSON());

  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body }
    );
  } else {
    await rest.put(Routes.applicationCommands(client.user.id), { body });
  }
}

// ==================== INTERACTION HANDLER ====================
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  } catch (err) {
    console.error('Interaction error:', err);
    const reply = { content: '❌ An error occurred. Please try again.', ephemeral: true };
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(reply).catch(() => {});
    } else {
      await interaction.editReply(reply).catch(() => {});
    }
  }
});

// ==================== COMMAND HANDLERS ====================
async function handleCommand(interaction) {
  const { commandName } = interaction;

  // Check if user is banned
  if (bannedUsers.has(interaction.user.id) && !isStaff(interaction.member)) {
    return interaction.reply({ 
      content: '🚫 You are banned from tournaments.', 
      ephemeral: true 
    });
  }

  switch (commandName) {
    case 'create-tournament':
      await handleCreateTournament(interaction);
      break;
    case 'start-tournament':
      await handleStartTournament(interaction);
      break;
    case 'end-tournament':
      await handleEndTournament(interaction);
      break;
    case 'cancel-tournament':
      await handleCancelTournament(interaction);
      break;
    case 'tournament-status':
      await handleTournamentStatus(interaction);
      break;
    case 'approve-player':
      await handleApprovePlayer(interaction);
      break;
    case 'reject-player':
      await handleRejectPlayer(interaction);
      break;
    case 'kick-player':
      await handleKickPlayer(interaction);
      break;
    case 'check-invites':
      await handleCheckInvites(interaction);
      break;
    case 'my-stats':
      await handleMyStats(interaction);
      break;
    case 'leaderboard':
      await handleLeaderboard(interaction);
      break;
    case 'warn-player':
      await handleWarnPlayer(interaction);
      break;
    case 'ban-player':
      await handleBanPlayer(interaction);
      break;
    case 'unban-player':
      await handleUnbanPlayer(interaction);
      break;
    case 'announce':
      await handleAnnounce(interaction);
      break;
    case 'participants':
      await handleParticipants(interaction);
      break;
    case 'history':
      await handleHistory(interaction);
      break;
    case 'rules':
      await handleRules(interaction);
      break;
    case 'help':
      await handleHelp(interaction);
      break;
    default:
      await interaction.reply({ content: '❓ Unknown command', ephemeral: true });
  }
}

// ===== CREATE TOURNAMENT =====
async function handleCreateTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const title = interaction.options.getString('title');
  const prize = interaction.options.getInteger('prize');
  const time = interaction.options.getString('time');
  const slots = interaction.options.getInteger('slots') || CONFIG.MAX_SLOTS;

  if (activeTournament && activeTournament.status !== 'ended') {
    return interaction.editReply('❌ A tournament is already active!');
  }

  activeTournament = createTournament(title, prize, time, slots);
  registeredPlayers.clear();
  pendingApprovals.clear();

  // Post to tournament-updates
  const updatesChannel = await client.channels.fetch(CONFIG.TOURNAMENT_UPDATES);
  const embed = createTournamentEmbed(activeTournament);
  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('JOIN NOW')
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji('🎮')
  );

  const msg = await updatesChannel.send({ embeds: [embed], components: [row] });

  // Announce in general
  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
  await generalChannel.send({
    content: `@everyone\n🔥 **${title}** is now open for registration!\n💰 Prize: ${prize}\n⏰ Time: ${time}\n\nHead to <#${CONFIG.TOURNAMENT_UPDATES}> to join!`,
    embeds: [embed]
  });

  await interaction.editReply(`✅ Tournament created: **${title}**\nMax slots: ${slots}`);
}

// ===== START TOURNAMENT =====
async function handleStartTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament to start!');
  }

  const roomId = interaction.options.getString('room-id');
  const password = interaction.options.getString('password');

  activeTournament.status = 'live';
  activeTournament.roomId = roomId;
  activeTournament.roomPassword = password;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${activeTournament.title} - NOW LIVE!`)
    .setColor('#00ff00')
    .addFields(
      { name: '🆔 Room ID', value: `\`${roomId}\``, inline: true },
      { name: '🔐 Password', value: password ? `\`${password}\`` : 'None', inline: true },
      { name: '👥 Players', value: `${registeredPlayers.size}`, inline: true }
    )
    .setDescription(CONFIG.RULES)
    .setTimestamp();

  const updatesChannel = await client.channels.fetch(CONFIG.TOURNAMENT_UPDATES);
  await updatesChannel.send({ content: '@everyone 🚨 TOURNAMENT STARTING NOW!', embeds: [embed] });

  await interaction.editReply('✅ Tournament started!');
}

// ===== END TOURNAMENT =====
async function handleEndTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament!');
  }

  const winner1 = interaction.options.getUser('winner1');
  const winner2 = interaction.options.getUser('winner2');
  const winner3 = interaction.options.getUser('winner3');

  activeTournament.status = 'ended';
  activeTournament.winners = [winner1, winner2, winner3].filter(Boolean);

  // Update stats
  activeTournament.winners.forEach((winner, idx) => {
    updatePlayerStats(winner.id, { 
      wins: idx === 0 ? 1 : 0, 
      topThree: 1,
      tournaments: 1
    });
  });

  // Post winners
  const winnersChannel = await client.channels.fetch(CONFIG.WINNERS_CHANNEL);
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🏆 ${activeTournament.title} - WINNERS!`)
    .setColor('#ffd700')
    .addFields(
      { name: '🥇 First Place', value: `${winner1}`, inline: false },
      winner2 ? { name: '🥈 Second Place', value: `${winner2}`, inline: false } : null,
      winner3 ? { name: '🥉 Third Place', value: `${winner3}`, inline: false } : null,
    ).filter(Boolean)
    .setThumbnail(CONFIG.QR_IMAGE)
    .setTimestamp();

  await winnersChannel.send({ embeds: [embed] });

  tournamentHistory.unshift(activeTournament);
  if (tournamentHistory.length > 50) tournamentHistory.pop();

  await interaction.editReply('✅ Tournament ended and winners announced!');
  activeTournament = null;
}

// ===== BUTTON HANDLER =====
async function handleButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (interaction.customId === 'join_tournament') {
    if (!activeTournament || activeTournament.status !== 'registration') {
      return interaction.editReply('❌ Tournament registration is closed.');
    }

    if (registeredPlayers.has(interaction.user.id)) {
      return interaction.editReply('⚠️ You are already registered!');
    }

    if (registeredPlayers.size >= activeTournament.maxSlots) {
      return interaction.editReply('❌ Tournament is full!');
    }

    const inviteCount = userInvites.get(interaction.user.id) || 0;
    if (inviteCount < CONFIG.MIN_INVITES && !isStaff(interaction.member)) {
      return interaction.editReply(`❌ You need ${CONFIG.MIN_INVITES} invites to join. You have ${inviteCount}.`);
    }

    registeredPlayers.set(interaction.user.id, {
      user: interaction.user,
      joinedAt: new Date(),
      approved: true
    });

    updatePlayerStats(interaction.user.id, { tournaments: 1 });

    await interaction.editReply('✅ Successfully registered for the tournament!');

    // Update tournament message
    const updatesChannel = await client.channels.fetch(CONFIG.TOURNAMENT_UPDATES);
    const embed = createTournamentEmbed(activeTournament);
    await updatesChannel.send({ embeds: [embed] });
  }
}

// ===== UTILITY FUNCTIONS =====
function createTournamentEmbed(tournament) {
  const progress = generateProgressBar(registeredPlayers.size, tournament.maxSlots);
  
  return new Discord.EmbedBuilder()
    .setTitle(`🏆 ${tournament.title}`)
    .setColor(tournament.status === 'live' ? '#00ff00' : '#3498db')
    .addFields(
      { name: '💰 Prize Pool', value: `${tournament.prizePool}`, inline: true },
      { name: '⏰ Time', value: tournament.scheduledTime, inline: true },
      { name: '📊 Slots', value: `${registeredPlayers.size}/${tournament.maxSlots}`, inline: true },
      { name: '📈 Progress', value: progress, inline: false }
    )
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: `Status: ${tournament.status.toUpperCase()}` })
    .setTimestamp();
}

function generateProgressBar(current, max) {
  const percentage = (current / max) * 100;
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;
  return `${'🟩'.repeat(filled)}${'⬜'.repeat(empty)} ${percentage.toFixed(0)}%`;
}

function isStaff(member) {
  return member?.roles?.cache?.has(CONFIG.STAFF_ROLE);
}

function updatePlayerStats(userId, updates) {
  const stats = userStats.get(userId) || { wins: 0, topThree: 0, tournaments: 0 };
  userStats.set(userId, {
    wins: stats.wins + (updates.wins || 0),
    topThree: stats.topThree + (updates.topThree || 0),
    tournaments: stats.tournaments + (updates.tournaments || 0)
  });
}

async function fetchServerInvites() {
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) userInvites.set(inv.inviter.id, inv.uses || 0);
      });
    } catch (err) {
      console.warn(`Could not fetch invites for ${guild.name}`);
    }
  }
}

// ===== ADDITIONAL COMMAND HANDLERS =====
async function handleCheckInvites(interaction) {
  const count = userInvites.get(interaction.user.id) || 0;
  await interaction.reply({ 
    content: `🔗 You have **${count}** invites!\n${count >= CONFIG.MIN_INVITES ? '✅ You can join tournaments!' : `❌ You need ${CONFIG.MIN_INVITES} invites to join.`}`,
    ephemeral: true 
  });
}

async function handleMyStats(interaction) {
  const stats = userStats.get(interaction.user.id) || { wins: 0, topThree: 0, tournaments: 0 };
  const embed = new Discord.EmbedBuilder()
    .setTitle(`📊 ${interaction.user.username}'s Stats`)
    .setColor('#9b59b6')
    .addFields(
      { name: '🏆 Wins', value: `${stats.wins}`, inline: true },
      { name: '🥇 Top 3 Finishes', value: `${stats.topThree}`, inline: true },
      { name: '🎮 Tournaments Played', value: `${stats.tournaments}`, inline: true }
    )
    .setThumbnail(interaction.user.displayAvatarURL());
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleRules(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('📜 OTO Tournament Rules')
    .setDescription(CONFIG.RULES)
    .setColor('#e74c3c')
    .setImage(CONFIG.QR_IMAGE);
  
  await interaction.reply({ embeds: [embed] });
}

async function handleHelp(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('🤖 OTO Tournament Bot - Commands')
    .setColor('#3498db')
    .addFields(
      { name: '👤 User Commands', value: '`/check-invites` `/my-stats` `/tournament-status` `/rules` `/leaderboard`' },
      { name: '🎮 Tournament', value: '`/create-tournament` `/start-tournament` `/end-tournament` `/cancel-tournament`' },
      { name: '👥 Management', value: '`/approve-player` `/reject-player` `/kick-player` `/participants`' },
      { name: '🛡️ Moderation', value: '`/warn-player` `/ban-player` `/unban-player`' },
      { name: '⚙️ Utility', value: '`/announce` `/history` `/help`' }
    )
    .setFooter({ text: 'Use commands to manage tournaments professionally!' });
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Additional handlers (stub implementations - expand as needed)
async function handleTournamentStatus(interaction) {
  if (!activeTournament) {
    return interaction.reply({ content: '❌ No active tournament', ephemeral: true });
  }
  const embed = createTournamentEmbed(activeTournament);
  await interaction.reply({ embeds: [embed] });
}

async function handleCancelTournament(interaction) {
  if (!activeTournament) {
    return interaction.reply({ content: '❌ No active tournament', ephemeral: true });
  }
  activeTournament = null;
  registeredPlayers.clear();
  await interaction.reply({ content: '✅ Tournament cancelled', ephemeral: true });
}

async function handleApprovePlayer(interaction) {
  const user = interaction.options.getUser('user');
  registeredPlayers.set(user.id, { user, joinedAt: new Date(), approved: true });
  await interaction.reply({ content: `✅ Approved ${user.tag}`, ephemeral: true });
}

async function handleRejectPlayer(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  registeredPlayers.delete(user.id);
  await interaction.reply({ content: `❌ Rejected ${user.tag}: ${reason}`, ephemeral: true });
}

async function handleKickPlayer(interaction) {
  const user = interaction.options.getUser('user');
  registeredPlayers.delete(user.id);
  await interaction.reply({ content: `👢 Kicked ${user.tag}`, ephemeral: true });
}

async function handleWarnPlayer(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');
  const warns = warnings.get(user.id) || [];
  warns.push({ reason, date: new Date(), by: interaction.user.id });
  warnings.set(user.id, warns);
  await interaction.reply({ content: `⚠️ Warned ${user.tag} (Total: ${warns.length})`, ephemeral: true });
}

async function handleBanPlayer(interaction) {
  const user = interaction.options.getUser('user');
  bannedUsers.add(user.id);
  registeredPlayers.delete(user.id);
  await interaction.reply({ content: `🚫 Banned ${user.tag} from tournaments`, ephemeral: true });
}

async function handleUnbanPlayer(interaction) {
  const user = interaction.options.getUser('user');
  bannedUsers.delete(user.id);
  await interaction.reply({ content: `✅ Unbanned ${user.tag}`, ephemeral: true });
}

async function handleAnnounce(interaction) {
  const message = interaction.options.getString('message');
  const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
  await channel.send(`📢 **ANNOUNCEMENT**\n${message}`);
  await interaction.reply({ content: '✅ Announcement sent', ephemeral: true });
}

async function handleParticipants(interaction) {
  if (registeredPlayers.size === 0) {
    return interaction.reply({ content: '❌ No participants', ephemeral: true });
  }
  const list = Array.from(registeredPlayers.values())
    .map((p, i) => `${i + 1}. ${p.user.tag}`)
    .join('\n');
  await interaction.reply({ content: `👥 **Participants (${registeredPlayers.size})**\n${list}`, ephemeral: true });
}

async function handleHistory(interaction) {
  const limit = interaction.options.getInteger('limit') || 5;
  if (tournamentHistory.length === 0) {
    return interaction.reply({ content: '❌ No tournament history', ephemeral: true });
  }
  const history = tournamentHistory.slice(0, limit)
    .map((t, i) => `${i + 1}. **${t.title}** - ${t.winners.length} winners`)
    .join('\n');
  await interaction.reply({ content: `📜 **Tournament History**\n${history}`, ephemeral: true });
}

async function handleLeaderboard(interaction) {
  const sorted = Array.from(userStats.entries())
    .sort((a, b) => b[1].wins - a[1].wins)
    .slice(0, 10);
  
  if (sorted.length === 0) {
    return interaction.reply({ content: '❌ No stats available', ephemeral: true });
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Tournament Leaderboard')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, stats], i) => 
        `${i + 1}. <@${userId}> - ${stats.wins} wins, ${stats.tournaments} tournaments`
      ).join('\n')
    );
  
  await interaction.reply({ embeds: [embed] });
}

// ===== AUTOMATED TASKS =====
function startAutomatedTasks() {
  // Slot announcements
  setInterval(async () => {
    if (activeTournament && activeTournament.status === 'registration') {
      const remaining = activeTournament.maxSlots - registeredPlayers.size;
      if (remaining <= 10 && remaining > 0) {
        const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL);
        await channel.send(`🚨 **HURRY!** Only ${remaining} slots remaining for ${activeTournament.title}!`);
      }
    }
  }, 300000); // Every 5 minutes

  console.log('✅ Automated tasks started');
}

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => console.log('✅ Bot login initiated'))
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });
