// ==================== OTO TOURNAMENT BOT - PROFESSIONAL EDITION ====================
require('dotenv').config();
const Discord = require('discord.js');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ ERROR: No bot token found. Set BOT_TOKEN in .env');
  process.exit(1);
}

// ==================== CLIENT SETUP ====================
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.DirectMessages,
  ],
  partials: [Discord.Partials.Channel],
});

// Express server for uptime
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('🏆 OTO Tournament Bot - Professional Edition Running'));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ==================== CONFIGURATION ====================
const CONFIG = {
  // Channel IDs (Updated)
  ANNOUNCEMENT_CHANNEL: '1438484746165555243',
  TOURNAMENT_SCHEDULE: '1438482561679626303',
  HOW_TO_JOIN: '1438482512296022017',
  RULES_CHANNEL: '1438482342145687643',
  BOT_COMMANDS: '1438483009950191676',
  GENERAL_CHAT: '1438482904018849835',
  OPEN_TICKET: '1438485759891079180',
  MATCH_REPORTS: '1438486113047150714',
  LEADERBOARD_CHANNEL: '1438947356690223347',
  
  // Staff and roles
  STAFF_ROLE: '1438475461977047112',
  OWNER_ROLE: '1438443937588183110', // Set your owner role
  
  // Settings
  MAX_SLOTS: 48,
  MIN_INVITES: 2,
  QR_IMAGE: 'https://ibb.co/jkBSmkM3',
  
  // Rules
  RULES: `📜 **OTO TOURNAMENT RULES**
1️⃣ No teaming or camping allowed
2️⃣ No hacking, cheating, or third-party tools
3️⃣ Follow the room ID and password exactly
4️⃣ Screenshot proof required for top 3 winners
5️⃣ Respect all players and staff
6️⃣ Staff decisions are final
7️⃣ Must have ${2} invites to join (checked automatically)
8️⃣ Join on time - late entries not allowed`,

  // Automated responses
  BOT_RESPONSES: {
    'free tournament': 'Bro, check out <#1438482561679626303> for upcoming tournaments! Show your skills! 🎮🔥',
    'tournament kab': 'Tournament schedule dekho <#1438482561679626303> mein. Daily tournaments hote hain! ⏰',
    'kaise join': 'Join karne ka process <#1438482512296022017> mein hai. Invites complete karo aur ready raho! 💪',
    'invite kaise': 'Server ki permanent invite link share karo. Minimum 2 invites chahiye tournament join karne ke liye! 🔗',
    'prize': 'Prize pool tournaments ke saath announce hota hai. Big prizes har din! 💰',
    'rules': 'Tournament rules <#1438482342145687643> mein check karo! Important hai! 📋',
    'hi': 'Hello! Tournament khelne aaye ho? Check out <#1438482561679626303> 🎮',
    'hello': 'Hey! Ready for action? Tournament schedule <#1438482561679626303> pe dekho! 🔥',
    'help': 'Commands ke liye <#1438483009950191676> check karo! Main tumhari help karunga! 🤖',
  }
};

// ==================== DATA STRUCTURES ====================
let activeTournament = null;
let tournamentHistory = [];
let registeredPlayers = new Map();
let userInvites = new Map();
let userStats = new Map();
let bannedUsers = new Set();
let warnings = new Map();
let tickets = new Map();
let inviteCache = new Map();
let timeouts = new Map();

// Tournament structure
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
    roomPassword: null,
    map: null,
  };
}

// ==================== READY EVENT ====================
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  try {
    await client.user.setActivity('🏆 OTO Tournaments | /help', { 
      type: Discord.ActivityType.Competing 
    });
    
    await registerCommands();
    console.log('✅ Slash commands registered');
    
    await initializeInviteTracking();
    console.log('✅ Invite tracking initialized');
    
    startAutomatedTasks();
    console.log('✅ Automated tasks started');
    
    await setupPersistentMessages();
    console.log('✅ Persistent messages setup complete');
    
  } catch (err) {
    console.error('❌ Initialization error:', err);
  }
});

// ==================== COMMAND REGISTRATION ====================
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    // ===== TOURNAMENT COMMANDS =====
    new SlashCommandBuilder()
      .setName('create-tournament')
      .setDescription('🎮 Create a new tournament (Staff only)')
      .addStringOption(opt => opt.setName('title').setDescription('Tournament name (e.g., Solo Squad)').setRequired(true))
      .addIntegerOption(opt => opt.setName('prize').setDescription('Prize pool amount').setRequired(true))
      .addStringOption(opt => opt.setName('time').setDescription('Start time (e.g., 7pm, 8:30pm)').setRequired(true))
      .addIntegerOption(opt => opt.setName('slots').setDescription('Max players (default 48)'))
      .addStringOption(opt => opt.setName('map').setDescription('Map name (e.g., Bermuda, Purgatory)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('start-tournament')
      .setDescription('▶️ Start the tournament with room details')
      .addStringOption(opt => opt.setName('room-id').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Room password (optional)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('end-tournament')
      .setDescription('🏆 End tournament and declare winners')
      .addUserOption(opt => opt.setName('first').setDescription('1st place winner').setRequired(true))
      .addUserOption(opt => opt.setName('second').setDescription('2nd place winner'))
      .addUserOption(opt => opt.setName('third').setDescription('3rd place winner'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('cancel-tournament')
      .setDescription('❌ Cancel active tournament')
      .addStringOption(opt => opt.setName('reason').setDescription('Cancellation reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('tournament-info')
      .setDescription('📊 View current tournament status'),

    new SlashCommandBuilder()
      .setName('participants')
      .setDescription('👥 View all tournament participants')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // ===== PLAYER MANAGEMENT =====
    new SlashCommandBuilder()
      .setName('approve')
      .setDescription('✅ Manually approve a player')
      .addUserOption(opt => opt.setName('user').setDescription('User to approve').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('reject')
      .setDescription('❌ Reject a player registration')
      .addUserOption(opt => opt.setName('user').setDescription('User to reject').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Rejection reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('kick-participant')
      .setDescription('👢 Remove player from tournament')
      .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Kick reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('block-user')
      .setDescription('🚫 Block user from tournaments')
      .addUserOption(opt => opt.setName('user').setDescription('User to block').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Block reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('unblock-user')
      .setDescription('✅ Unblock user from tournaments')
      .addUserOption(opt => opt.setName('user').setDescription('User to unblock').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // ===== INVITE SYSTEM =====
    new SlashCommandBuilder()
      .setName('invites')
      .setDescription('🔗 Check your invite count')
      .addUserOption(opt => opt.setName('user').setDescription('Check another user\'s invites (Staff only)')),

    new SlashCommandBuilder()
      .setName('add-invites')
      .setDescription('➕ Add bonus invites to a user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Number of invites').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('reset-invites')
      .setDescription('🔄 Reset user invites')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('top-inviters')
      .setDescription('🏅 View top inviters leaderboard'),

    // ===== STATS & LEADERBOARD =====
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('📈 View tournament statistics')
      .addUserOption(opt => opt.setName('user').setDescription('User to check (defaults to you)')),

    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('🏆 View tournament winners leaderboard'),

    new SlashCommandBuilder()
      .setName('history')
      .setDescription('📜 View past tournaments')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number to show (1-20, default 5)')),

    // ===== MODERATION =====
    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('⚠️ Warn a user')
      .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Warning reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('warnings')
      .setDescription('📋 View user warnings')
      .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('clear-warnings')
      .setDescription('🧹 Clear user warnings')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('⏱️ Timeout a user')
      .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
      .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Timeout reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ===== ANNOUNCEMENTS =====
    new SlashCommandBuilder()
      .setName('announce')
      .setDescription('📢 Send announcement')
      .addStringOption(opt => opt.setName('message').setDescription('Announcement text').setRequired(true))
      .addStringOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true)
        .addChoices(
          { name: 'Announcements', value: 'announcement' },
          { name: 'General Chat', value: 'general' },
          { name: 'Tournament Schedule', value: 'schedule' }
        ))
      .addBooleanOption(opt => opt.setName('everyone').setDescription('Ping @everyone?'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    // ===== TICKET SYSTEM =====
    new SlashCommandBuilder()
      .setName('close-ticket')
      .setDescription('🔒 Close a support ticket')
      .addStringOption(opt => opt.setName('reason').setDescription('Reason for closing'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    // ===== UTILITY =====
    new SlashCommandBuilder()
      .setName('rules')
      .setDescription('📋 Display tournament rules'),

    new SlashCommandBuilder()
      .setName('help')
      .setDescription('❓ Show all available commands'),

    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('🏓 Check bot latency'),

    new SlashCommandBuilder()
      .setName('server-info')
      .setDescription('ℹ️ View server information'),
  ];

  const body = commands.map(c => c.toJSON());

  try {
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
        { body }
      );
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
    }
  } catch (error) {
    console.error('Command registration error:', error);
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
    const msg = '❌ An error occurred. Please try again or contact staff.';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    } else {
      await interaction.editReply(msg).catch(() => {});
    }
  }
});

// ==================== COMMAND ROUTER ====================
async function handleCommand(interaction) {
  const { commandName } = interaction;

  // Check if user is blocked
  if (bannedUsers.has(interaction.user.id) && !isStaff(interaction.member)) {
    return interaction.reply({ 
      content: '🚫 You are blocked from tournaments. Contact staff for appeal.', 
      ephemeral: true 
    });
  }

  const commandMap = {
    'create-tournament': handleCreateTournament,
    'start-tournament': handleStartTournament,
    'end-tournament': handleEndTournament,
    'cancel-tournament': handleCancelTournament,
    'tournament-info': handleTournamentInfo,
    'participants': handleParticipants,
    'approve': handleApprove,
    'reject': handleReject,
    'kick-participant': handleKickParticipant,
    'block-user': handleBlockUser,
    'unblock-user': handleUnblockUser,
    'invites': handleInvites,
    'add-invites': handleAddInvites,
    'reset-invites': handleResetInvites,
    'top-inviters': handleTopInviters,
    'stats': handleStats,
    'leaderboard': handleLeaderboard,
    'history': handleHistory,
    'warn': handleWarn,
    'warnings': handleWarnings,
    'clear-warnings': handleClearWarnings,
    'timeout': handleTimeout,
    'announce': handleAnnounce,
    'close-ticket': handleCloseTicket,
    'rules': handleRules,
    'help': handleHelp,
    'ping': handlePing,
    'server-info': handleServerInfo,
  };

  const handler = commandMap[commandName];
  if (handler) {
    await handler(interaction);
  } else {
    await interaction.reply({ content: '❓ Unknown command', ephemeral: true });
  }
}

// ==================== TOURNAMENT COMMANDS ====================
async function handleCreateTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (activeTournament && activeTournament.status !== 'ended') {
    return interaction.editReply('❌ A tournament is already active! End or cancel it first.');
  }

  const title = interaction.options.getString('title');
  const prize = interaction.options.getInteger('prize');
  const time = interaction.options.getString('time');
  const slots = interaction.options.getInteger('slots') || CONFIG.MAX_SLOTS;
  const map = interaction.options.getString('map');

  activeTournament = createTournament(title, prize, time, slots);
  if (map) activeTournament.map = map;
  registeredPlayers.clear();

  // Post to announcement channel
  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  const embed = createTournamentEmbed(activeTournament);
  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN TOURNAMENT')
      .setStyle(Discord.ButtonStyle.Success)
  );

  await announceChannel.send({ 
    content: `@everyone\n\n🔥 **NEW TOURNAMENT ALERT!**\n${title} starts at ${time}!\n💰 Win ${prize}!\n\nJoin now! Limited slots available!`,
    embeds: [embed], 
    components: [row] 
  });

  // Post to schedule
  const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
  await scheduleChannel.send({ embeds: [embed] });

  await interaction.editReply(`✅ Tournament **${title}** created successfully!\n📊 Max slots: ${slots}\n⏰ Time: ${time}`);
}

async function handleStartTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament to start!');
  }

  if (activeTournament.status === 'live') {
    return interaction.editReply('⚠️ Tournament is already live!');
  }

  const roomId = interaction.options.getString('room-id');
  const password = interaction.options.getString('password');

  activeTournament.status = 'live';
  activeTournament.roomId = roomId;
  activeTournament.roomPassword = password;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${activeTournament.title} - LIVE NOW!`)
    .setColor('#00ff00')
    .setDescription(`${CONFIG.RULES}\n\n**🚨 TOURNAMENT STARTED!**`)
    .addFields(
      { name: '🆔 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: password ? `\`\`\`${password}\`\`\`` : '❌ No password', inline: false },
      { name: '👥 Registered Players', value: `${registeredPlayers.size}/${activeTournament.maxSlots}`, inline: true },
      { name: '💰 Prize Pool', value: `${activeTournament.prizePool}`, inline: true },
      { name: '🗺️ Map', value: activeTournament.map || 'TBA', inline: true }
    )
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: '⚠️ Join the room now! Late entries not allowed!' })
    .setTimestamp();

  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await announceChannel.send({ 
    content: `@everyone\n\n🚨 **TOURNAMENT STARTING NOW!**\n${activeTournament.title}`,
    embeds: [embed] 
  });

  // Send DM to all registered players
  for (const [userId, data] of registeredPlayers.entries()) {
    try {
      const user = await client.users.fetch(userId);
      await user.send({
        content: `🎮 **${activeTournament.title}** is starting NOW!\n\n🆔 Room ID: \`${roomId}\`\n🔐 Password: ${password || 'None'}\n\nJoin quickly! Good luck! 🍀`,
        embeds: [embed]
      });
    } catch (err) {
      console.log(`Could not DM user ${userId}`);
    }
  }

  await interaction.editReply('✅ Tournament started! Room details sent to all players.');
}

async function handleEndTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament!');
  }

  const first = interaction.options.getUser('first');
  const second = interaction.options.getUser('second');
  const third = interaction.options.getUser('third');

  activeTournament.status = 'ended';
  activeTournament.winners = [first, second, third].filter(Boolean);

  // Update stats
  activeTournament.winners.forEach((winner, idx) => {
    updatePlayerStats(winner.id, { 
      wins: idx === 0 ? 1 : 0, 
      topThree: 1,
      tournaments: 1
    });
  });

  // Winners announcement
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🏆 ${activeTournament.title} - WINNERS!`)
    .setColor('#ffd700')
    .setDescription(`Congratulations to our champions! 🎉\n\n**Total Players:** ${registeredPlayers.size}`)
    .addFields(
      { name: '🥇 CHAMPION', value: `${first}\n💰 Prize: ${activeTournament.prizePool}`, inline: false }
    )
    .setThumbnail(first.displayAvatarURL({ dynamic: true }))
    .setImage(CONFIG.QR_IMAGE)
    .setTimestamp();

  if (second) embed.addFields({ name: '🥈 Runner Up', value: `${second}`, inline: true });
  if (third) embed.addFields({ name: '🥉 Third Place', value: `${third}`, inline: true });

  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await announceChannel.send({ 
    content: `@everyone\n\n🏆 **WINNERS ANNOUNCED!**`,
    embeds: [embed] 
  });

  // Update leaderboard channel
  await updateLeaderboardChannel();

  tournamentHistory.unshift(activeTournament);
  if (tournamentHistory.length > 100) tournamentHistory.pop();

  await interaction.editReply('✅ Tournament ended! Winners announced to the server.');
  activeTournament = null;
}

async function handleCancelTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament!');
  }

  const reason = interaction.options.getString('reason') || 'No reason provided';

  const embed = new Discord.EmbedBuilder()
    .setTitle('❌ Tournament Cancelled')
    .setDescription(`**${activeTournament.title}** has been cancelled.\n\n**Reason:** ${reason}`)
    .setColor('#ff0000')
    .setTimestamp();

  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await announceChannel.send({ embeds: [embed] });

  activeTournament = null;
  registeredPlayers.clear();

  await interaction.editReply(`✅ Tournament cancelled. Reason: ${reason}`);
}

async function handleTournamentInfo(interaction) {
  if (!activeTournament) {
    return interaction.reply({ 
      content: '❌ No active tournament right now.\nCheck <#' + CONFIG.TOURNAMENT_SCHEDULE + '> for upcoming tournaments!', 
      ephemeral: true 
    });
  }

  const embed = createTournamentEmbed(activeTournament);
  await interaction.reply({ embeds: [embed] });
}

async function handleParticipants(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (registeredPlayers.size === 0) {
    return interaction.editReply('❌ No participants registered yet.');
  }

  const chunks = [];
  let current = '';
  let count = 0;

  for (const [userId, data] of registeredPlayers.entries()) {
    count++;
    const line = `${count}. <@${userId}> - Invites: ${userInvites.get(userId) || 0}\n`;
    if ((current + line).length > 1900) {
      chunks.push(current);
      current = line;
    } else {
      current += line;
    }
  }
  if (current) chunks.push(current);

  await interaction.editReply(`👥 **Tournament Participants (${registeredPlayers.size}/${activeTournament.maxSlots})**\n\n${chunks[0]}`);
  
  for (let i = 1; i < chunks.length; i++) {
    await interaction.followUp({ content: chunks[i], ephemeral: true });
  }
}

// ==================== PLAYER MANAGEMENT ====================
async function handleApprove(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ No tournament in registration phase!');
  }

  if (registeredPlayers.has(user.id)) {
    return interaction.editReply('⚠️ User is already registered!');
  }

  registeredPlayers.set(user.id, {
    user,
    joinedAt: new Date(),
    approved: true,
    bypassedInvites: true
  });

  try {
    await user.send(`✅ You have been manually approved for **${activeTournament.title}**!\n\nTournament starts at ${activeTournament.scheduledTime}. Good luck! 🍀`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Approved ${user.tag} for the tournament!`);
}

async function handleReject(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'Not eligible';

  registeredPlayers.delete(user.id);

  try {
    await user.send(`❌ Your registration for **${activeTournament?.title || 'the tournament'}** was rejected.\n\n**Reason:** ${reason}\n\nContact staff if you have questions.`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Rejected ${user.tag}. Reason: ${reason}`);
}

async function handleKickParticipant(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'Removed by staff';

  if (!registeredPlayers.has(user.id)) {
    return interaction.editReply('❌ User is not registered!');
  }

  registeredPlayers.delete(user.id);

  try {
    await user.send(`👢 You have been removed from **${activeTournament?.title || 'the tournament'}**.\n\n**Reason:** ${reason}`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Kicked ${user.tag} from tournament. Reason: ${reason}`);
}

async function handleBlockUser(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  bannedUsers.add(user.id);
  registeredPlayers.delete(user.id);

  try {
    await user.send(`🚫 You have been blocked from OTO tournaments.\n\n**Reason:** ${reason}\n\nContact server admins for appeal.`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Blocked ${user.tag} from all tournaments.\nReason: ${reason}`);
}

async function handleUnblockUser(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  if (!bannedUsers.has(user.id)) {
    return interaction.editReply('⚠️ User is not blocked!');
  }

  bannedUsers.delete(user.id);

  try {
    await user.send(`✅ You have been unblocked from OTO tournaments!\n\nYou can now participate again. Follow the rules!`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Unblocked ${user.tag}. They can now join tournaments.`);
}

// ==================== INVITE SYSTEM ====================
async function handleInvites(interaction) {
  const targetUser = interaction.options.getUser('user');
  const checkUser = targetUser || interaction.user;

  // Only staff can check others
  if (targetUser && !isStaff(interaction.member)) {
    return interaction.reply({ 
      content: '❌ Only staff can check other users\' invites!', 
      ephemeral: true 
    });
  }

  const inviteCount = userInvites.get(checkUser.id) || 0;
  const needed = CONFIG.MIN_INVITES;
  const canJoin = inviteCount >= needed;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🔗 Invite Stats - ${checkUser.username}`)
    .setColor(canJoin ? '#00ff00' : '#ff9900')
    .addFields(
      { name: '📊 Total Invites', value: `**${inviteCount}**`, inline: true },
      { name: '✅ Required', value: `**${needed}**`, inline: true },
      { name: '🎮 Can Join Tournaments', value: canJoin ? '✅ **YES**' : '❌ **NO**', inline: true }
    )
    .setThumbnail(checkUser.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: canJoin ? 'Ready for tournaments!' : `Invite ${needed - inviteCount} more people!` });

  await interaction.reply({ embeds: [embed], ephemeral: !targetUser });
}

async function handleAddInvites(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('amount');

  const current = userInvites.get(user.id) || 0;
  userInvites.set(user.id, current + amount);

  try {
    await user.send(`🎁 You received **${amount} bonus invite${amount > 1 ? 's' : ''}**!\n\nTotal invites: **${current + amount}** ✨`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Added ${amount} invites to ${user.tag}!\nNew total: ${current + amount}`);
}

async function handleResetInvites(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  
  const oldCount = userInvites.get(user.id) || 0;
  userInvites.set(user.id, 0);

  await interaction.editReply(`✅ Reset invites for ${user.tag}\nPrevious: ${oldCount} → New: 0`);
}

async function handleTopInviters(interaction) {
  await interaction.deferReply();

  const sorted = Array.from(userInvites.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  if (sorted.length === 0) {
    return interaction.editReply('❌ No invite data available yet!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏅 Top Inviters Leaderboard')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, count], i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        return `${medal} <@${userId}> - **${count}** invites`;
      }).join('\n')
    )
    .setFooter({ text: 'Keep inviting to climb the ranks!' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

// ==================== STATS & LEADERBOARD ====================
async function handleStats(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const stats = userStats.get(targetUser.id) || { wins: 0, topThree: 0, tournaments: 0 };
  const invites = userInvites.get(targetUser.id) || 0;
  const warns = warnings.get(targetUser.id)?.length || 0;

  const winRate = stats.tournaments > 0 ? ((stats.wins / stats.tournaments) * 100).toFixed(1) : 0;
  const topThreeRate = stats.tournaments > 0 ? ((stats.topThree / stats.tournaments) * 100).toFixed(1) : 0;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`📊 Tournament Stats - ${targetUser.username}`)
    .setColor('#9b59b6')
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '🏆 Wins', value: `**${stats.wins}**`, inline: true },
      { name: '🥇 Top 3 Finishes', value: `**${stats.topThree}**`, inline: true },
      { name: '🎮 Tournaments', value: `**${stats.tournaments}**`, inline: true },
      { name: '📈 Win Rate', value: `**${winRate}%**`, inline: true },
      { name: '🎯 Top 3 Rate', value: `**${topThreeRate}%**`, inline: true },
      { name: '🔗 Invites', value: `**${invites}**`, inline: true },
      { name: '⚠️ Warnings', value: `**${warns}**`, inline: true },
      { name: '🚫 Status', value: bannedUsers.has(targetUser.id) ? '❌ Blocked' : '✅ Active', inline: true }
    )
    .setFooter({ text: 'Keep grinding to improve your stats!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction) {
  await interaction.deferReply();

  const sorted = Array.from(userStats.entries())
    .sort((a, b) => {
      // Sort by wins first, then top 3, then tournaments
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      if (b[1].topThree !== a[1].topThree) return b[1].topThree - a[1].topThree;
      return b[1].tournaments - a[1].tournaments;
    })
    .slice(0, 15);

  if (sorted.length === 0) {
    return interaction.editReply('❌ No tournament data available yet!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Tournament Champions Leaderboard')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, stats], i) => {
        const medal = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        return `${medal} <@${userId}>\n   🏆 ${stats.wins} Wins | 🥇 ${stats.topThree} Top 3 | 🎮 ${stats.tournaments} Tournaments`;
      }).join('\n\n')
    )
    .setFooter({ text: 'Compete to reach the top!' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleHistory(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  let limit = interaction.options.getInteger('limit') || 5;
  if (limit < 1) limit = 1;
  if (limit > 20) limit = 20;

  if (tournamentHistory.length === 0) {
    return interaction.editReply('❌ No tournament history available yet!');
  }

  const history = tournamentHistory.slice(0, limit);
  const embed = new Discord.EmbedBuilder()
    .setTitle('📜 Tournament History')
    .setColor('#3498db')
    .setDescription(
      history.map((t, i) => {
        const winners = t.winners.map(w => w.username).join(', ') || 'N/A';
        return `**${i + 1}. ${t.title}**\n💰 Prize: ${t.prizePool} | 👥 ${t.participants.length || registeredPlayers.size} players\n🏆 Winners: ${winners}\n📅 ${new Date(t.createdAt).toLocaleDateString()}`;
      }).join('\n\n')
    )
    .setFooter({ text: `Showing ${history.length} of ${tournamentHistory.length} tournaments` });

  await interaction.editReply({ embeds: [embed] });
}

// ==================== MODERATION ====================
async function handleWarn(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  const userWarnings = warnings.get(user.id) || [];
  userWarnings.push({
    reason,
    date: new Date(),
    by: interaction.user.id,
    moderator: interaction.user.tag
  });
  warnings.set(user.id, userWarnings);

  try {
    await user.send(`⚠️ **You received a warning in OTO Tournament!**\n\n**Reason:** ${reason}\n**Total Warnings:** ${userWarnings.length}\n\n⚠️ Multiple warnings may result in a block!`);
  } catch (err) {
    console.log(`Could not DM ${user.tag}`);
  }

  await interaction.editReply(`✅ Warned ${user.tag}\n**Reason:** ${reason}\n**Total warnings:** ${userWarnings.length}`);

  // Auto-block at 3 warnings
  if (userWarnings.length >= 3 && !bannedUsers.has(user.id)) {
    bannedUsers.add(user.id);
    try {
      await user.send(`🚫 You have been automatically blocked from tournaments after receiving 3 warnings.\n\nContact staff for appeal.`);
    } catch (err) {}
  }
}

async function handleWarnings(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const userWarnings = warnings.get(user.id) || [];

  if (userWarnings.length === 0) {
    return interaction.editReply(`✅ ${user.tag} has no warnings!`);
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle(`⚠️ Warnings - ${user.username}`)
    .setColor('#ff9900')
    .setDescription(
      userWarnings.map((w, i) => 
        `**${i + 1}.** ${w.reason}\n   By: ${w.moderator} | ${new Date(w.date).toLocaleDateString()}`
      ).join('\n\n')
    )
    .setFooter({ text: `Total: ${userWarnings.length} warnings` });

  await interaction.editReply({ embeds: [embed] });
}

async function handleClearWarnings(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  
  const count = warnings.get(user.id)?.length || 0;
  warnings.delete(user.id);

  await interaction.editReply(`✅ Cleared ${count} warning(s) for ${user.tag}`);
}

async function handleTimeout(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const duration = interaction.options.getInteger('duration');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  try {
    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(duration * 60 * 1000, reason);
    
    timeouts.set(user.id, {
      until: Date.now() + (duration * 60 * 1000),
      reason,
      by: interaction.user.id
    });

    try {
      await user.send(`⏱️ You have been timed out in OTO Tournament for **${duration} minutes**.\n\n**Reason:** ${reason}`);
    } catch (err) {}

    await interaction.editReply(`✅ Timed out ${user.tag} for ${duration} minutes.\n**Reason:** ${reason}`);
  } catch (err) {
    await interaction.editReply(`❌ Failed to timeout ${user.tag}. Error: ${err.message}`);
  }
}

// ==================== ANNOUNCEMENTS ====================
async function handleAnnounce(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const message = interaction.options.getString('message');
  const channelType = interaction.options.getString('channel');
  const pingEveryone = interaction.options.getBoolean('everyone') || false;

  const channelMap = {
    'announcement': CONFIG.ANNOUNCEMENT_CHANNEL,
    'general': CONFIG.GENERAL_CHAT,
    'schedule': CONFIG.TOURNAMENT_SCHEDULE
  };

  const channelId = channelMap[channelType];
  const channel = await client.channels.fetch(channelId);

  const embed = new Discord.EmbedBuilder()
    .setTitle('📢 ANNOUNCEMENT')
    .setDescription(message)
    .setColor('#e74c3c')
    .setFooter({ text: `By ${interaction.user.tag}` })
    .setTimestamp();

  const content = pingEveryone ? '@everyone' : '';
  await channel.send({ content, embeds: [embed] });

  await interaction.editReply(`✅ Announcement sent to <#${channelId}>!`);
}

// ==================== TICKET SYSTEM ====================
async function handleCloseTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  const reason = interaction.options.getString('reason') || 'Resolved';

  // Check if this is a ticket channel
  if (!channel.name.startsWith('ticket-')) {
    return interaction.editReply('❌ This command only works in ticket channels!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🔒 Ticket Closing')
    .setDescription(`This ticket will be closed in 5 seconds.\n\n**Reason:** ${reason}\n**Closed by:** ${interaction.user.tag}`)
    .setColor('#ff0000')
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });

  setTimeout(async () => {
    try {
      await channel.delete();
    } catch (err) {
      console.error('Error deleting ticket:', err);
    }
  }, 5000);
}

// ==================== UTILITY COMMANDS ====================
async function handleRules(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('📋 OTO TOURNAMENT RULES')
    .setDescription(CONFIG.RULES)
    .setColor('#e74c3c')
    .addFields(
      { name: '📢 Important Channels', value: `<#${CONFIG.ANNOUNCEMENT_CHANNEL}> - Updates\n<#${CONFIG.TOURNAMENT_SCHEDULE}> - Schedule\n<#${CONFIG.HOW_TO_JOIN}> - How to Join` },
      { name: '🎫 Need Help?', value: `Open a ticket in <#${CONFIG.OPEN_TICKET}>` }
    )
    .setImage(CONFIG.QR_IMAGE)
    .setFooter({ text: 'Follow rules to avoid warnings!' });

  await interaction.reply({ embeds: [embed] });
}

async function handleHelp(interaction) {
  const isStaffUser = isStaff(interaction.member);
  
  const userEmbed = new Discord.EmbedBuilder()
    .setTitle('🤖 OTO Tournament Bot - Commands')
    .setColor('#3498db')
    .addFields(
      { name: '🎮 Tournament', value: '`/tournament-info` - View active tournament\n`/rules` - View rules\n`/invites` - Check your invites\n`/stats` - View your stats' },
      { name: '🏆 Leaderboards', value: '`/leaderboard` - Top players\n`/top-inviters` - Top inviters\n`/history` - Past tournaments' },
      { name: '🛠️ Utility', value: '`/ping` - Bot latency\n`/server-info` - Server stats\n`/help` - This message' }
    )
    .setFooter({ text: 'Need help? Open a ticket!' });

  if (isStaffUser) {
    const staffEmbed = new Discord.EmbedBuilder()
      .setTitle('👮 Staff Commands')
      .setColor('#f39c12')
      .addFields(
        { name: '🎮 Tournament Management', value: '`/create-tournament` `/start-tournament` `/end-tournament` `/cancel-tournament` `/participants`' },
        { name: '👥 Player Management', value: '`/approve` `/reject` `/kick-participant` `/block-user` `/unblock-user`' },
        { name: '🔗 Invite Management', value: '`/add-invites` `/reset-invites`' },
        { name: '🛡️ Moderation', value: '`/warn` `/warnings` `/clear-warnings` `/timeout` `/close-ticket`' },
        { name: '📢 Announcements', value: '`/announce` - Send announcements' }
      );

    await interaction.reply({ embeds: [userEmbed, staffEmbed], ephemeral: true });
  } else {
    await interaction.reply({ embeds: [userEmbed], ephemeral: true });
  }
}

async function handlePing(interaction) {
  const ping = client.ws.ping;
  const embed = new Discord.EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setDescription(`**Bot Latency:** ${ping}ms\n**API Latency:** ${Date.now() - interaction.createdTimestamp}ms`)
    .setColor(ping < 100 ? '#00ff00' : ping < 200 ? '#ff9900' : '#ff0000')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleServerInfo(interaction) {
  const guild = interaction.guild;
  const owner = await guild.fetchOwner();

  const embed = new Discord.EmbedBuilder()
    .setTitle(`ℹ️ ${guild.name}`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setColor('#3498db')
    .addFields(
      { name: '👑 Owner', value: `${owner.user.tag}`, inline: true },
      { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
      { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '🎮 Active Tournament', value: activeTournament ? `${activeTournament.title}` : 'None', inline: true },
      { name: '📊 Total Tournaments', value: `${tournamentHistory.length}`, inline: true }
    )
    .setFooter({ text: `Server ID: ${guild.id}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

// ==================== BUTTON HANDLER ====================
async function handleButton(interaction) {
  if (interaction.customId === 'join_tournament') {
    await handleJoinButton(interaction);
  } else if (interaction.customId === 'create_ticket') {
    await handleCreateTicket(interaction);
  }
}

async function handleJoinButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  // Check tournament status
  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ Tournament registration is closed!');
  }

  // Check if already registered
  if (registeredPlayers.has(interaction.user.id)) {
    return interaction.editReply('⚠️ You are already registered for this tournament!');
  }

  // Check if tournament is full
  if (registeredPlayers.size >= activeTournament.maxSlots) {
    return interaction.editReply('❌ Tournament is full! Better luck next time.');
  }

  // Check if user is blocked
  if (bannedUsers.has(interaction.user.id)) {
    return interaction.editReply('🚫 You are blocked from tournaments. Contact staff.');
  }

  // Check invites (staff bypass)
  const inviteCount = userInvites.get(interaction.user.id) || 0;
  if (inviteCount < CONFIG.MIN_INVITES && !isStaff(interaction.member)) {
    return interaction.editReply(
      `❌ You need **${CONFIG.MIN_INVITES} invites** to join tournaments!\n\n` +
      `You currently have: **${inviteCount}** invites\n` +
      `Needed: **${CONFIG.MIN_INVITES - inviteCount}** more\n\n` +
      `💡 Share the server invite link to get more invites!`
    );
  }

  // Register player
  registeredPlayers.set(interaction.user.id, {
    user: interaction.user,
    joinedAt: new Date(),
    approved: true
  });

  updatePlayerStats(interaction.user.id, { tournaments: 1 });

  // Send success message
  const embed = new Discord.EmbedBuilder()
    .setTitle('✅ Registration Successful!')
    .setDescription(`You're registered for **${activeTournament.title}**!`)
    .setColor('#00ff00')
    .addFields(
      { name: '⏰ Start Time', value: activeTournament.scheduledTime, inline: true },
      { name: '💰 Prize Pool', value: `${activeTournament.prizePool}`, inline: true },
      { name: '📊 Your Slot', value: `${registeredPlayers.size}/${activeTournament.maxSlots}`, inline: true }
    )
    .setFooter({ text: 'Room details will be sent when tournament starts!' });

  await interaction.editReply({ embeds: [embed] });

  // Send DM confirmation
  try {
    await interaction.user.send({
      content: `🎮 **Registration Confirmed!**\n\nYou're in for **${activeTournament.title}**!\n\nStarts: ${activeTournament.scheduledTime}\nPrize: ${activeTournament.prizePool}\n\nRoom details will be DMed when the tournament starts. Good luck! 🍀`,
      embeds: [embed]
    });
  } catch (err) {
    console.log(`Could not DM ${interaction.user.tag}`);
  }

  // Notify staff channel about new registration
  try {
    const staffChannel = await client.channels.fetch(CONFIG.BOT_COMMANDS);
    if (registeredPlayers.size % 10 === 0) { // Every 10 registrations
      await staffChannel.send(`📊 **${registeredPlayers.size}/${activeTournament.maxSlots}** players registered for ${activeTournament.title}!`);
    }
  } catch (err) {}
}

async function handleCreateTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const user = interaction.user;

  // Check if user already has a ticket
  for (const [channelId, data] of tickets.entries()) {
    if (data.userId === user.id) {
      return interaction.editReply(`⚠️ You already have an open ticket: <#${channelId}>`);
    }
  }

  try {
    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: Discord.ChannelType.GuildText,
      parent: interaction.channel.parent,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [Discord.PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            Discord.PermissionFlagsBits.ViewChannel,
            Discord.PermissionFlagsBits.SendMessages,
            Discord.PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: CONFIG.STAFF_ROLE,
          allow: [
            Discord.PermissionFlagsBits.ViewChannel,
            Discord.PermissionFlagsBits.SendMessages,
            Discord.PermissionFlagsBits.ReadMessageHistory,
            Discord.PermissionFlagsBits.ManageMessages,
          ],
        },
      ],
    });

    tickets.set(ticketChannel.id, {
      userId: user.id,
      createdAt: new Date()
    });

    const embed = new Discord.EmbedBuilder()
      .setTitle('🎫 Support Ticket')
      .setDescription(`Hello ${user}!\n\nThank you for opening a ticket. Our staff will assist you shortly.\n\n**Please describe your issue clearly.**`)
      .setColor('#3498db')
      .addFields(
        { name: '📝 Guidelines', value: '• Be patient\n• Be respectful\n• Provide details\n• Wait for staff response' }
      )
      .setFooter({ text: 'Staff will be with you soon!' })
      .setTimestamp();

    await ticketChannel.send({ content: `${user} <@&${CONFIG.STAFF_ROLE}>`, embeds: [embed] });

    await interaction.editReply(`✅ Ticket created! Go to <#${ticketChannel.id}>`);
  } catch (err) {
    console.error('Ticket creation error:', err);
    await interaction.editReply('❌ Failed to create ticket. Contact staff directly.');
  }
}

// ==================== HELPER FUNCTIONS ====================
function createTournamentEmbed(tournament) {
  const progress = generateProgressBar(registeredPlayers.size, tournament.maxSlots);
  const statusEmoji = {
    'registration': '📝',
    'live': '🔴',
    'ended': '✅'
  };

  const embed = new Discord.EmbedBuilder()
    .setTitle(`${statusEmoji[tournament.status]} ${tournament.title}`)
    .setColor(tournament.status === 'live' ? '#00ff00' : tournament.status === 'ended' ? '#808080' : '#3498db')
    .addFields(
      { name: '💰 Prize Pool', value: `**${tournament.prizePool}**`, inline: true },
      { name: '⏰ Time', value: `**${tournament.scheduledTime}**`, inline: true },
      { name: '📊 Slots', value: `**${registeredPlayers.size}/${tournament.maxSlots}**`, inline: true }
    );

  if (tournament.map) {
    embed.addFields({ name: '🗺️ Map', value: `**${tournament.map}**`, inline: true });
  }

  if (tournament.status === 'registration') {
    embed.addFields({ name: '📈 Registration Progress', value: progress, inline: false });
    embed.addFields({ name: '🔗 Requirements', value: `Minimum **${CONFIG.MIN_INVITES} invites** required`, inline: false });
  }

  if (tournament.status === 'live' && tournament.roomId) {
    embed.addFields(
      { name: '🆔 Room ID', value: `\`\`\`${tournament.roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: tournament.roomPassword ? `\`\`\`${tournament.roomPassword}\`\`\`` : '❌ No password', inline: false }
    );
  }

  embed.setThumbnail(CONFIG.QR_IMAGE);
  embed.setFooter({ text: `Status: ${tournament.status.toUpperCase()} | ID: ${tournament.id}` });
  embed.setTimestamp();

  return embed;
}

function generateProgressBar(current, max) {
  const percentage = Math.min((current / max) * 100, 100);
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;
  return `${'🟩'.repeat(filled)}${'⬜'.repeat(empty)} **${percentage.toFixed(0)}%** (${current}/${max})`;
}

function isStaff(member) {
  return member?.roles?.cache?.has(CONFIG.STAFF_ROLE) || member?.permissions?.has(Discord.PermissionFlagsBits.Administrator);
}

function updatePlayerStats(userId, updates) {
  const stats = userStats.get(userId) || { wins: 0, topThree: 0, tournaments: 0 };
  userStats.set(userId, {
    wins: stats.wins + (updates.wins || 0),
    topThree: stats.topThree + (updates.topThree || 0),
    tournaments: stats.tournaments + (updates.tournaments || 0)
  });
}

// ==================== INVITE TRACKING ====================
async function initializeInviteTracking() {
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(invite => {
        if (invite.inviter) {
          inviteCache.set(invite.code, invite.uses);
          const current = userInvites.get(invite.inviter.id) || 0;
          userInvites.set(invite.inviter.id, current + invite.uses);
        }
      });
      console.log(`✅ Cached ${invites.size} invites for ${guild.name}`);
    } catch (err) {
      console.warn(`⚠️ Could not fetch invites for ${guild.name}`);
    }
  }
}

// Member join event - track invites
client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    
    // Find which invite was used
    const usedInvite = newInvites.find(inv => {
      const cachedUses = inviteCache.get(inv.code) || 0;
      return inv.uses > cachedUses;
    });

    if (usedInvite && usedInvite.inviter) {
      // Update cache
      inviteCache.set(usedInvite.code, usedInvite.uses);
      
      // Update inviter's count
      const current = userInvites.get(usedInvite.inviter.id) || 0;
      userInvites.set(usedInvite.inviter.id, current + 1);

      // Send congratulation message in general
      const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
      await generalChannel.send(
        `🎉 Welcome ${member}!\n💫 Invited by <@${usedInvite.inviter.id}> (Total invites: **${current + 1}**)`
      );

      // DM the inviter
      try {
        const inviter = await client.users.fetch(usedInvite.inviter.id);
        await inviter.send(
          `🎉 **New Invite!**\n\n${member.user.tag} joined using your invite!\n\n` +
          `Total invites: **${current + 1}**\n` +
          `${current + 1 >= CONFIG.MIN_INVITES ? '✅ You can join tournaments!' : `Need ${CONFIG.MIN_INVITES - current - 1} more to join tournaments!`}`
        );
      } catch (err) {
        console.log(`Could not DM inviter ${usedInvite.inviter.tag}`);
      }
    }

    // Update invite cache
    newInvites.forEach(inv => {
      inviteCache.set(inv.code, inv.uses);
    });

  } catch (err) {
    console.error('Error tracking invite:', err);
  }
});

// Member leave event - decrease invite count
client.on('guildMemberRemove', async (member) => {
  try {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    
    // Find which invite decreased
    const decreasedInvite = newInvites.find(inv => {
      const cachedUses = inviteCache.get(inv.code) || 0;
      return inv.uses < cachedUses;
    });

    if (decreasedInvite && decreasedInvite.inviter) {
      // Update cache
      inviteCache.set(decreasedInvite.code, decreasedInvite.uses);
      
      // Decrease inviter's count
      const current = userInvites.get(decreasedInvite.inviter.id) || 0;
      if (current > 0) {
        userInvites.set(decreasedInvite.inviter.id, current - 1);
      }
    }

    // Update invite cache
    newInvites.forEach(inv => {
      inviteCache.set(inv.code, inv.uses);
    });

  } catch (err) {
    console.error('Error tracking member leave:', err);
  }
});

// ==================== MESSAGE HANDLER - AUTO RESPONSES ====================
client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Only respond in general chat
  if (message.channel.id !== CONFIG.GENERAL_CHAT) return;

  const content = message.content.toLowerCase();

  // Check for keywords and respond
  for (const [keyword, response] of Object.entries(CONFIG.BOT_RESPONSES)) {
    if (content.includes(keyword)) {
      await message.reply(response);
      return; // Only respond once per message
    }
  }

  // Advanced responses based on context
  if (content.includes('how to') && content.includes('join')) {
    await message.reply(
      `Bhai, tournament join karna hai? Easy steps:\n\n` +
      `1️⃣ <#${CONFIG.HOW_TO_JOIN}> padho\n` +
      `2️⃣ Minimum ${CONFIG.MIN_INVITES} invites complete karo\n` +
      `3️⃣ Tournament announcement pe JOIN button dabao\n` +
      `4️⃣ Room details DM mein milegi\n\n` +
      `🔥 Skills dikhao aur jeeto!`
    );
  } else if (content.includes('room') && (content.includes('id') || content.includes('password'))) {
    if (activeTournament && activeTournament.status === 'live' && activeTournament.roomId) {
      if (registeredPlayers.has(message.author.id)) {
        await message.reply(
          `🎮 Room details:\n\n` +
          `🆔 ID: \`${activeTournament.roomId}\`\n` +
          `🔐 Password: ${activeTournament.roomPassword || 'No password'}\n\n` +
          `Join now! ⚡`
        );
      } else {
        await message.reply('❌ Only registered players can see room details! Register next time.');
      }
    } else {
      await message.reply('No tournament is live right now. Check <#' + CONFIG.TOURNAMENT_SCHEDULE + '> for schedule!');
    }
  } else if (content.includes('when') || content.includes('kab')) {
    await message.reply(
      `⏰ Tournament schedule: <#${CONFIG.TOURNAMENT_SCHEDULE}>\n\n` +
      `Daily tournaments hote hain! Check karo! 🔥`
    );
  }
});

// ==================== PERSISTENT MESSAGES ====================
async function setupPersistentMessages() {
  try {
    // Join tournament button in how-to-join channel
    const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
    const joinEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 HOW TO JOIN TOURNAMENTS')
      .setDescription(
        `**Follow these simple steps:**\n\n` +
        `1️⃣ **Get Invites:** Share server link and get minimum ${CONFIG.MIN_INVITES} invites\n` +
        `2️⃣ **Check Announcements:** Watch <#${CONFIG.ANNOUNCEMENT_CHANNEL}> for new tournaments\n` +
        `3️⃣ **Click JOIN:** Click the JOIN button when tournament is announced\n` +
        `4️⃣ **Wait for DM:** Room details will be sent to your DM when tournament starts\n` +
        `5️⃣ **Play & Win:** Join room, play fair, and win prizes! 💰\n\n` +
        `**Important:**\n` +
        `✅ Read rules in <#${CONFIG.RULES_CHANNEL}>\n` +
        `✅ Check your invites: Use \`/invites\`\n` +
        `✅ View stats: Use \`/stats\`\n` +
        `✅ Need help? Open ticket in <#${CONFIG.OPEN_TICKET}>`
      )
      .setColor('#3498db')
      .setImage(CONFIG.QR_IMAGE)
      .setFooter({ text: 'Good luck! 🍀' });

    const messages = await howToJoinChannel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(m => m.author.id === client.user.id);
    if (botMessages.size > 0) {
      console.log('✅ How-to-join message already exists');
    } else {
      await howToJoinChannel.send({ embeds: [joinEmbed] });
      console.log('✅ Posted how-to-join message');
    }

    // Ticket system in open-ticket channel
    const ticketChannel = await client.channels.fetch(CONFIG.OPEN_TICKET);
    const ticketEmbed = new Discord.EmbedBuilder()
      .setTitle('🎫 SUPPORT TICKETS')
      .setDescription(
        `Need help? Create a support ticket!\n\n` +
        `**What can we help with:**\n` +
        `• Tournament issues\n` +
        `• Registration problems\n` +
        `• Invite questions\n` +
        `• Report players\n` +
        `• General queries\n\n` +
        `**Click the button below to create a ticket!**`
      )
      .setColor('#9b59b6')
      .setFooter({ text: 'Our staff will respond quickly!' });

    const ticketButton = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('📩 Create Ticket')
        .setStyle(Discord.ButtonStyle.Primary)
    );

    const ticketMessages = await ticketChannel.messages.fetch({ limit: 10 });
    const ticketBotMessages = ticketMessages.filter(m => m.author.id === client.user.id);
    if (ticketBotMessages.size > 0) {
      console.log('✅ Ticket message already exists');
    } else {
      await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketButton] });
      console.log('✅ Posted ticket creation message');
    }

    // Rules in rules channel
    const rulesChannel = await client.channels.fetch(CONFIG.RULES_CHANNEL);
    const rulesEmbed = new Discord.EmbedBuilder()
      .setTitle('📋 TOURNAMENT RULES')
      .setDescription(CONFIG.RULES)
      .setColor('#e74c3c')
      .addFields(
        { name: '⚠️ Breaking Rules', value: 'Warning → Timeout → Block from tournaments' },
        { name: '✅ Fair Play', value: 'Play clean, respect everyone, have fun!' }
      )
      .setImage(CONFIG.QR_IMAGE)
      .setFooter({ text: 'Rules must be followed!' });

    const rulesMessages = await rulesChannel.messages.fetch({ limit: 10 });
    const rulesBotMessages = rulesMessages.filter(m => m.author.id === client.user.id);
    if (rulesBotMessages.size > 0) {
      console.log('✅ Rules message already exists');
    } else {
      await rulesChannel.send({ embeds: [rulesEmbed] });
      console.log('✅ Posted rules message');
    }

  } catch (err) {
    console.error('Error setting up persistent messages:', err);
  }
}

// ==================== AUTOMATED TASKS ====================
function startAutomatedTasks() {
  // Slot warnings every 10 minutes
  setInterval(async () => {
    if (activeTournament && activeTournament.status === 'registration') {
      const remaining = activeTournament.maxSlots - registeredPlayers.size;
      
      if (remaining === 10) {
        const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        await channel.send(
          `🚨 **HURRY UP!**\n\n` +
          `Only **10 slots** remaining for ${activeTournament.title}!\n` +
          `💰 Prize: ${activeTournament.prizePool}\n` +
          `⏰ Time: ${activeTournament.scheduledTime}\n\n` +
          `Register NOW in <#${CONFIG.ANNOUNCEMENT_CHANNEL}>! 🔥`
        );
      } else if (remaining === 5) {
        const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        await channel.send(
          `🔥 **LAST 5 SLOTS!** 🔥\n\n` +
          `${activeTournament.title} is almost full!\n` +
          `Join now: <#${CONFIG.ANNOUNCEMENT_CHANNEL}>! ⚡`
        );
      }
    }
  }, 600000); // 10 minutes

  // Tournament reminder 30 min before (if time format allows)
  setInterval(async () => {
    if (activeTournament && activeTournament.status === 'registration') {
      const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
      await channel.send(
        `⏰ **REMINDER!**\n\n` +
        `${activeTournament.title} starts soon at ${activeTournament.scheduledTime}!\n` +
        `📊 Current: ${registeredPlayers.size}/${activeTournament.maxSlots} players\n\n` +
        `Last chance to join! 🎮`
      );
    }
  }, 1800000); // 30 minutes

  // Update bot status every 5 minutes
  setInterval(() => {
    if (activeTournament) {
      client.user.setActivity(
        `${activeTournament.title} | ${registeredPlayers.size}/${activeTournament.maxSlots} players`, 
        { type: Discord.ActivityType.Competing }
      );
    } else {
      client.user.setActivity('🏆 OTO Tournaments | /help', { type: Discord.ActivityType.Competing });
    }
  }, 300000); // 5 minutes

  // Leaderboard update every hour
  setInterval(async () => {
    await updateLeaderboardChannel();
  }, 3600000); // 1 hour

  console.log('✅ Automated tasks started');
}

// ==================== LEADERBOARD CHANNEL UPDATE ====================
async function updateLeaderboardChannel() {
  try {
    const channel = await client.channels.fetch(CONFIG.LEADERBOARD_CHANNEL);
    
    // Tournament winners leaderboard
    const topPlayers = Array.from(userStats.entries())
      .sort((a, b) => {
        if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
        if (b[1].topThree !== a[1].topThree) return b[1].topThree - a[1].topThree;
        return b[1].tournaments - a[1].tournaments;
      })
      .slice(0, 10);

    const playersEmbed = new Discord.EmbedBuilder()
      .setTitle('🏆 TOURNAMENT CHAMPIONS')
      .setColor('#ffd700')
      .setDescription(
        topPlayers.length > 0 
          ? topPlayers.map(([userId, stats], i) => {
              const medal = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
              return `${medal} <@${userId}>\n   🏆 ${stats.wins} Wins | 🥇 ${stats.topThree} Top 3 | 🎮 ${stats.tournaments} Played`;
            }).join('\n\n')
          : 'No data yet. Be the first champion!'
      )
      .setFooter({ text: 'Updated every hour' })
      .setTimestamp();

    // Top inviters leaderboard
    const topInviters = Array.from(userInvites.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const invitersEmbed = new Discord.EmbedBuilder()
      .setTitle('🏅 TOP INVITERS')
      .setColor('#3498db')
      .setDescription(
        topInviters.length > 0
          ? topInviters.map(([userId, count], i) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
              return `${medal} <@${userId}> - **${count}** invites`;
            }).join('\n')
          : 'No data yet. Start inviting!'
      )
      .setFooter({ text: 'Keep inviting to rank up!' })
      .setTimestamp();

    // Server stats
    const guild = channel.guild;
    const statsEmbed = new Discord.EmbedBuilder()
      .setTitle('📊 SERVER STATS')
      .setColor('#9b59b6')
      .addFields(
        { name: '👥 Total Members', value: `${guild.memberCount}`, inline: true },
        { name: '🎮 Total Tournaments', value: `${tournamentHistory.length}`, inline: true },
        { name: '🏆 Active Tournament', value: activeTournament ? `${activeTournament.title}` : 'None', inline: true },
        { name: '👑 Total Winners', value: `${userStats.size}`, inline: true },
        { name: '🔗 Total Invites', value: `${Array.from(userInvites.values()).reduce((a, b) => a + b, 0)}`, inline: true },
        { name: '📅 Last Updated', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }));

    // Clear old messages and post new ones
    const messages = await channel.messages.fetch({ limit: 50 });
    const botMessages = messages.filter(m => m.author.id === client.user.id);
    
    if (botMessages.size > 0) {
      await channel.bulkDelete(botMessages).catch(() => {});
    }

    await channel.send({ embeds: [playersEmbed, invitersEmbed, statsEmbed] });
    
  } catch (err) {
    console.error('Error updating leaderboard:', err);
  }
}

// ==================== ERROR HANDLING ====================
client.on('error', (error) => {
  console.error('Client error:', error);
});

client.on('warn', (warning) => {
  console.warn('Client warning:', warning);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => console.log('✅ Bot login initiated'))
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });
