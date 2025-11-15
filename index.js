// ==================== OTO ULTRA PROFESSIONAL TOURNAMENT BOT ====================
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (err) { console.log('⚠️ Using environment variables'); }
}

const Discord = require('discord.js');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ No bot token found!');
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

// Express server
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('🏆 OTO Tournament Bot Active'));
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));

// ==================== CONFIGURATION ====================
const CONFIG = {
  ANNOUNCEMENT_CHANNEL: '1438484746165555243',
  TOURNAMENT_SCHEDULE: '1438482561679626303',
  HOW_TO_JOIN: '1438482512296022017',
  RULES_CHANNEL: '1438482342145687643',
  BOT_COMMANDS: '1438483009950191676',
  GENERAL_CHAT: '1438482904018849835',
  OPEN_TICKET: '1438485759891079180',
  MATCH_REPORTS: '1438486113047150714',
  LEADERBOARD_CHANNEL: '1438947356690223347',
  STAFF_TOOLS: '1438486059255336970',
  STAFF_CHAT: '1438486059255336970',
  
  STAFF_ROLE: '1438475461977047112',
  ADMIN_ROLE: process.env.ADMIN_ROLE || '1438475461977047112',
  
  MIN_INVITES: 2,
  QR_IMAGE: 'https://i.ibb.co/jkBSmkM/qr.png',
  
  // Game images
  GAME_IMAGES: {
    'Free Fire': 'https://i.ibb.co/8XQkZhJ/freefire.png',
    'Minecraft': 'https://i.ibb.co/VgTY8Lq/minecraft.png',
    'Custom': 'https://i.ibb.co/jkBSmkM/qr.png'
  },
  
  WELCOME_MESSAGES: [
    '🔥 Apna bhai aa gaya! Welcome to OTO {user}! Tournament khelega? 💪',
    '🎮 Areee {user} bhai! Swagat hai! Free Fire ke liye ready ho jao! 🔥',
    '💫 Boss {user} has entered the chat! Tournament mein dikha apna talent! 🏆',
    '⚡ {user} bhai aa gaye! OTO ka asli player aa gaya! Welcome! 🎯',
    '🌟 {user} welcome to OTO family! Tournaments mein participate karo aur jeeto! 💰',
  ],
  
  LEAVE_MESSAGES: [
    '😢 {user} bhai chale gaye... Bye bye! 👋',
    '💔 {user} ne server chhod diya... Come back soon bro! 🥺',
    '🚶 {user} bhai to chal base... Later dude! ✌️',
  ],
  
  AUTO_RESPONSES: {
    'tournament': [
      'Bhai tournament ke liye <#1438482561679626303> check kar! Daily naye tournaments! 🎮',
      'Tournament join karna hai? <#1438484746165555243> pe jao bhai! 🔥',
      'Abhi tournament chal raha hai kya? <#1438482561679626303> dekho schedule! 📅',
    ],
    'free entry': [
      'Free entry chahiye? Bas 2 logo ko invite karo aur free mein khelo! 🎁',
      'Bhai 2 invites complete kar, phir free entry milegi! Use -i to check invites 🔗',
    ],
    'kab': [
      'Tournament schedule <#1438482561679626303> pe hai bhai! Check kar le! ⏰',
    ],
    'help': [
      'Commands ke liye type karo: /help 🤖',
    ],
  },
  
  RULES: `📜 **OTO TOURNAMENT RULES**
1️⃣ No teaming or camping
2️⃣ No hacks, cheats, or third-party tools
3️⃣ Follow room ID and password exactly
4️⃣ Screenshot proof required for top 3
5️⃣ Respect all players and staff
6️⃣ 2 invites minimum to join tournaments
7️⃣ Join on time - no late entries
8️⃣ Staff decisions are final`,
};

// ==================== DATA STORAGE ====================
let activeTournament = null;
let tournamentHistory = [];
let registeredPlayers = new Map();
let userInvites = new Map();
let userStats = new Map();
let bannedUsers = new Set();
let warnings = new Map();
let tickets = new Map();
let inviteCache = new Map();
let firstTimeUsers = new Set();
let staffMembers = new Set();
let closedTickets = new Map();
let tournamentSpamInterval = null;
let tournamentCountdown = null;

// Tournament spam settings
const SPAM_SETTINGS = {
  enabled: false,
  interval: 300000, // 5 minutes
  countdownEnabled: false,
  tournamentTime: null
};

// Temporary tournament creation data
let tempTournamentData = new Map();

// ==================== READY EVENT ====================
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is ONLINE!`);
  console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
  
  try {
    await client.user.setActivity('🏆 /help | OTO Tournaments', { type: Discord.ActivityType.Competing });
    await registerCommands();
    await initializeInviteTracking();
    await loadStaffMembers();
    startAutomatedTasks();
    await setupPersistentMessages();
    await sendStaffWelcome();
    console.log('✅ Bot fully initialized!');
  } catch (err) {
    console.error('❌ Init error:', err);
  }
});

// Load staff members
async function loadStaffMembers() {
  try {
    for (const guild of client.guilds.cache.values()) {
      const role = await guild.roles.fetch(CONFIG.STAFF_ROLE);
      if (role) {
        role.members.forEach(member => staffMembers.add(member.id));
        console.log(`✅ Loaded ${role.members.size} staff members`);
      }
    }
  } catch (err) {
    console.error('Error loading staff:', err);
  }
}

// Send welcome to staff
async function sendStaffWelcome() {
  try {
    const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT).catch(() => null);
    if (!staffChannel) return;

    const embed = new Discord.EmbedBuilder()
      .setTitle('👮 OTO Staff Panel - Welcome!')
      .setDescription(
        `**Bot is now ONLINE and ready!** 🎉\n\n` +
        `**Quick Staff Commands:**\n` +
        `• \`/create\` - Create tournament\n` +
        `• \`/start <roomid>\` - Start tournament\n` +
        `• \`/end\` - End & declare winners\n` +
        `• \`/participants\` - View players\n` +
        `• \`/autospam\` - Auto announcements\n\n` +
        `**All systems ready! 💪**`
      )
      .setColor('#00ff00')
      .setThumbnail(CONFIG.QR_IMAGE)
      .setTimestamp();

    await staffChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Staff welcome error:', err);
  }
}

// ==================== SLASH COMMANDS ====================
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    // User commands
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('❓ Show all commands'),

    new SlashCommandBuilder()
      .setName('invites')
      .setDescription('🔗 Check your invites')
      .addUserOption(opt => opt.setName('user').setDescription('Check someone else (Staff only)')),

    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('📊 View tournament stats')
      .addUserOption(opt => opt.setName('user').setDescription('Check someone else')),

    new SlashCommandBuilder()
      .setName('tournament')
      .setDescription('🎮 View active tournament'),

    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('🏆 View top players'),

    new SlashCommandBuilder()
      .setName('rules')
      .setDescription('📋 Tournament rules'),

    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('🏓 Check bot speed'),

    // Staff tournament commands
    new SlashCommandBuilder()
      .setName('create')
      .setDescription('🎮 Create new tournament (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('start')
      .setDescription('▶️ Start tournament (Staff)')
      .addStringOption(opt => opt.setName('roomid').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Password (optional)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('end')
      .setDescription('🏆 End tournament (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('cancel')
      .setDescription('❌ Cancel tournament (Staff)')
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    // Player management
    new SlashCommandBuilder()
      .setName('add')
      .setDescription('➕ Add player (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('remove')
      .setDescription('➖ Remove player (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('participants')
      .setDescription('👥 View participants (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('block')
      .setDescription('🚫 Block user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('unblock')
      .setDescription('✅ Unblock user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // Moderation
    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('⚠️ Warn user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('⏱️ Timeout user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Minutes').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // Invite management
    new SlashCommandBuilder()
      .setName('addinvites')
      .setDescription('➕ Add bonus invites (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('topinviters')
      .setDescription('🏅 Top inviters'),

    // Utility
    new SlashCommandBuilder()
      .setName('announce')
      .setDescription('📢 Announcement (Staff)')
      .addStringOption(opt => opt.setName('message').setDescription('Message').setRequired(true))
      .addBooleanOption(opt => opt.setName('ping').setDescription('Ping @everyone?'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('history')
      .setDescription('📜 Past tournaments')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number (1-10)')),

    new SlashCommandBuilder()
      .setName('closeticket')
      .setDescription('🔒 Close ticket (Staff)')
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    // Staff management
    new SlashCommandBuilder()
      .setName('makestaff')
      .setDescription('👮 Promote to staff (Admin)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('removestaff')
      .setDescription('👤 Remove staff (Admin)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('stafflist')
      .setDescription('📋 View staff')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // Auto spam
    new SlashCommandBuilder()
      .setName('autospam')
      .setDescription('🔄 Auto announcements (Staff)')
      .addBooleanOption(opt => opt.setName('enable').setDescription('Enable/disable').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Interval (default 5)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('spamnow')
      .setDescription('📢 Spam now (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  ];

  const body = commands.map(c => c.toJSON());

  try {
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body });
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
    }
    console.log('✅ Commands registered');
  } catch (err) {
    console.error('Command error:', err);
  }
}

// ==================== COMMAND HANDLERS ====================
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
  } catch (err) {
    console.error('Interaction error:', err);
    const msg = '❌ Error! Try again bhai!';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

async function handleCommand(interaction) {
  const { commandName } = interaction;

  if (bannedUsers.has(interaction.user.id) && !isStaff(interaction.member)) {
    return interaction.reply({ content: '🚫 You are blocked!', ephemeral: true });
  }

  const handlers = {
    'help': handleHelp,
    'invites': handleInvites,
    'stats': handleStats,
    'tournament': handleTournament,
    'leaderboard': handleLeaderboard,
    'rules': handleRules,
    'ping': handlePing,
    'create': handleCreate,
    'start': handleStart,
    'end': handleEnd,
    'cancel': handleCancel,
    'add': handleAdd,
    'remove': handleRemove,
    'block': handleBlock,
    'unblock': handleUnblock,
    'participants': handleParticipants,
    'warn': handleWarn,
    'timeout': handleTimeout,
    'addinvites': handleAddInvites,
    'topinviters': handleTopInviters,
    'announce': handleAnnounce,
    'history': handleHistory,
    'closeticket': handleCloseTicket,
    'makestaff': handleMakeStaff,
    'removestaff': handleRemoveStaff,
    'stafflist': handleStaffList,
    'autospam': handleAutoSpam,
    'spamnow': handleSpamNow,
  };

  const handler = handlers[commandName];
  if (handler) await handler(interaction);
}

// ===== USER COMMANDS =====
async function handleHelp(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('🤖 OTO Tournament Commands')
    .setColor('#3498db')
    .addFields(
      { name: '🎮 Tournament', value: '`/tournament` `/invites` `/stats` `/rules`', inline: false },
      { name: '🏆 Leaderboard', value: '`/leaderboard` `/topinviters` `/history`', inline: false },
      { name: '⚡ Quick', value: '`-i` (check invites) `/ping` `/help`', inline: false }
    )
    .setFooter({ text: 'Need help? Open ticket!' })
    .setThumbnail(CONFIG.QR_IMAGE);

  if (isStaff(interaction.member)) {
    embed.addFields(
      { name: '👮 Staff', value: '`/create` `/start` `/end` `/add` `/remove` `/participants`', inline: false }
    );
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleInvites(interaction) {
  const targetUser = interaction.options.getUser('user');
  const checkUser = targetUser || interaction.user;

  if (targetUser && !isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
  }

  const count = userInvites.get(checkUser.id) || 0;
  const needed = CONFIG.MIN_INVITES;
  const canJoin = count >= needed;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🔗 Invites - ${checkUser.username}`)
    .setColor(canJoin ? '#00ff00' : '#ff9900')
    .addFields(
      { name: '📊 Total', value: `**${count}**`, inline: true },
      { name: '✅ Required', value: `**${needed}**`, inline: true },
      { name: '🎮 Status', value: canJoin ? '✅ **FREE ENTRY!**' : `❌ Need ${needed - count} more`, inline: true }
    )
    .setThumbnail(checkUser.displayAvatarURL({ dynamic: true }));

  await interaction.reply({ embeds: [embed], ephemeral: !targetUser });
}

async function handleStats(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const stats = userStats.get(targetUser.id) || { wins: 0, topThree: 0, tournaments: 0 };
  const invites = userInvites.get(targetUser.id) || 0;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`📊 ${targetUser.username}'s Stats`)
    .setColor('#9b59b6')
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '🏆 Wins', value: `**${stats.wins}**`, inline: true },
      { name: '🥇 Top 3', value: `**${stats.topThree}**`, inline: true },
      { name: '🎮 Tournaments', value: `**${stats.tournaments}**`, inline: true },
      { name: '🔗 Invites', value: `**${invites}**`, inline: true },
      { name: '🚫 Status', value: bannedUsers.has(targetUser.id) ? '❌ Blocked' : '✅ Active', inline: true }
    );

  await interaction.reply({ embeds: [embed] });
}

async function handleTournament(interaction) {
  if (!activeTournament) {
    return interaction.reply({ 
      content: `❌ No tournament! Check <#${CONFIG.TOURNAMENT_SCHEDULE}>`, 
      ephemeral: true 
    });
  }

  const embed = createTournamentEmbed(activeTournament);
  await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction) {
  await interaction.deferReply();

  const sorted = Array.from(userStats.entries())
    .sort((a, b) => b[1].wins - a[1].wins || b[1].topThree - a[1].topThree)
    .slice(0, 10);

  if (sorted.length === 0) {
    return interaction.editReply('❌ No data yet!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 OTO Champions')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, stats], i) => {
        const medals = ['👑', '🥈', '🥉'];
        const medal = medals[i] || `${i + 1}.`;
        return `${medal} <@${userId}> - 🏆${stats.wins} 🥇${stats.topThree} 🎮${stats.tournaments}`;
      }).join('\n')
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleRules(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('📋 OTO RULES')
    .setDescription(CONFIG.RULES)
    .setColor('#e74c3c')
    .setImage(CONFIG.QR_IMAGE);

  await interaction.reply({ embeds: [embed] });
}

async function handlePing(interaction) {
  const ping = client.ws.ping;
  const embed = new Discord.EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setDescription(`**Latency:** ${ping}ms`)
    .setColor(ping < 100 ? '#00ff00' : '#ff9900');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ===== STAFF - CREATE TOURNAMENT =====
async function handleCreate(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (activeTournament && activeTournament.status !== 'ended') {
    return interaction.editReply('❌ Tournament active! End it first.');
  }

  // Initialize temp data
  tempTournamentData.set(interaction.user.id, {
    createdAt: Date.now()
  });

  const embed = new Discord.EmbedBuilder()
    .setTitle('🎮 Create Tournament - Step 1')
    .setDescription('**Select Game Type:**')
    .setColor('#3498db')
    .addFields(
      { name: '🔥 Free Fire', value: 'Battle Royale tournaments', inline: true },
      { name: '⛏️ Minecraft', value: 'Survival/Creative tournaments', inline: true }
    );

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('game_freefire')
      .setLabel('🔥 Free Fire')
      .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
      .setCustomId('game_minecraft')
      .setLabel('⛏️ Minecraft')
      .setStyle(Discord.ButtonStyle.Success)
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

// ===== REMAINING STAFF COMMANDS =====
async function handleCancel(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) return interaction.editReply('❌ No tournament!');

  const reason = interaction.options.getString('reason') || 'Technical issues';

  const embed = new Discord.EmbedBuilder()
    .setTitle('❌ Tournament Cancelled')
    .setDescription(`**${activeTournament.title}** cancelled.\n\n**Reason:** ${reason}`)
    .setColor('#ff0000');

  const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await channel.send({ embeds: [embed] });

  activeTournament = null;
  registeredPlayers.clear();

  await interaction.editReply('✅ Cancelled!');
}

async function handleAdd(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  if (!activeTournament) return interaction.editReply('❌ No tournament!');
  if (registeredPlayers.has(user.id)) return interaction.editReply('⚠️ Already registered!');

  registeredPlayers.set(user.id, { user, joinedAt: new Date(), approved: true, addedByStaff: true });

  try {
    await user.send(`✅ Added to **${activeTournament.title}** by staff!`);
  } catch (err) {}

  await interaction.editReply(`✅ Added ${user.tag}!`);
}

async function handleRemove(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'Removed by staff';

  if (!registeredPlayers.has(user.id)) return interaction.editReply('❌ Not registered!');

  registeredPlayers.delete(user.id);

  try {
    await user.send(`❌ Removed from tournament.\n**Reason:** ${reason}`);
  } catch (err) {}

  await interaction.editReply(`✅ Removed ${user.tag}`);
}

async function handleBlock(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  bannedUsers.add(user.id);
  registeredPlayers.delete(user.id);

  try {
    await user.send(`🚫 BLOCKED from tournaments!\n**Reason:** ${reason}`);
  } catch (err) {}

  await interaction.editReply(`✅ Blocked ${user.tag}`);
}

async function handleUnblock(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  if (!bannedUsers.has(user.id)) return interaction.editReply('⚠️ Not blocked!');

  bannedUsers.delete(user.id);

  try {
    await user.send(`✅ UNBLOCKED! Welcome back!`);
  } catch (err) {}

  await interaction.editReply(`✅ Unblocked ${user.tag}`);
}

async function handleParticipants(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (registeredPlayers.size === 0) return interaction.editReply('❌ No participants!');

  let msg = `👥 **Participants (${registeredPlayers.size}/${activeTournament?.maxSlots || '?'})**\n\n`;
  let count = 0;

  for (const [userId, data] of registeredPlayers.entries()) {
    count++;
    const invites = userInvites.get(userId) || 0;
    msg += `${count}. <@${userId}> - ${invites} invites\n`;
    
    if (msg.length > 1800) {
      await interaction.editReply(msg);
      msg = '';
    }
  }

  if (msg) await interaction.editReply(msg);
}

async function handleWarn(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  const userWarns = warnings.get(user.id) || [];
  userWarns.push({ reason, date: new Date(), by: interaction.user.tag });
  warnings.set(user.id, userWarns);

  try {
    await user.send(`⚠️ **WARNING!**\n**Reason:** ${reason}\n**Total:** ${userWarns.length}`);
  } catch (err) {}

  await interaction.editReply(`✅ Warned ${user.tag} (${userWarns.length})`);

  if (userWarns.length >= 3) {
    bannedUsers.add(user.id);
    try {
      await user.send(`🚫 AUTO-BLOCKED after 3 warnings!`);
    } catch (err) {}
  }
}

async function handleTimeout(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const minutes = interaction.options.getInteger('minutes');
  const reason = interaction.options.getString('reason') || 'Breaking rules';

  try {
    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(minutes * 60 * 1000, reason);

    try {
      await user.send(`⏱️ TIMED OUT for **${minutes} minutes**!\n**Reason:** ${reason}`);
    } catch (err) {}

    await interaction.editReply(`✅ Timed out ${user.tag} for ${minutes} min`);
  } catch (err) {
    await interaction.editReply(`❌ Failed: ${err.message}`);
  }
}

async function handleAddInvites(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('amount');

  const current = userInvites.get(user.id) || 0;
  userInvites.set(user.id, current + amount);

  try {
    await user.send(`🎁 **BONUS:** +${amount} invites!\nTotal: **${current + amount}**`);
  } catch (err) {}

  await interaction.editReply(`✅ Added ${amount} invites to ${user.tag}`);
}

async function handleTopInviters(interaction) {
  await interaction.deferReply();

  const sorted = Array.from(userInvites.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (sorted.length === 0) return interaction.editReply('❌ No data!');

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏅 Top Inviters')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, count], i) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[i] || `${i + 1}.`;
        return `${medal} <@${userId}> - **${count}**`;
      }).join('\n')
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleAnnounce(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const message = interaction.options.getString('message');
  const ping = interaction.options.getBoolean('ping') || false;

  const embed = new Discord.EmbedBuilder()
    .setTitle('📢 ANNOUNCEMENT')
    .setDescription(message)
    .setColor('#e74c3c')
    .setTimestamp();

  const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await channel.send({ content: ping ? '@everyone' : '', embeds: [embed] });
  
  await interaction.editReply('✅ Announced!');
}

async function handleHistory(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  let limit = interaction.options.getInteger('limit') || 5;
  if (limit < 1) limit = 1;
  if (limit > 10) limit = 10;

  if (tournamentHistory.length === 0) return interaction.editReply('❌ No history!');

  const history = tournamentHistory.slice(0, limit);
  const embed = new Discord.EmbedBuilder()
    .setTitle('📜 Tournament History')
    .setColor('#3498db')
    .setDescription(
      history.map((t, i) => {
        const winners = t.winners?.map(w => w.username).join(', ') || 'N/A';
        return `**${i + 1}. ${t.title}**\n💰 ${t.prizePool} | 🏆 ${winners}`;
      }).join('\n\n')
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleCloseTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  const reason = interaction.options.getString('reason') || 'Resolved';

  if (!channel.name.startsWith('ticket-')) return interaction.editReply('❌ Not a ticket!');

  const ticketData = tickets.get(channel.id);
  if (!ticketData) return interaction.editReply('❌ Ticket data not found!');

  closedTickets.set(channel.id, { ...ticketData, closedBy: interaction.user.id, closedAt: new Date(), reason });

  const embed = new Discord.EmbedBuilder()
    .setTitle('🔒 Ticket Closed')
    .setDescription(`**Reason:** ${reason}\n**By:** ${interaction.user}\n\nDeleting in 10s...`)
    .setColor('#ff0000');

  await interaction.editReply({ embeds: [embed] });

  try {
    const user = await client.users.fetch(ticketData.userId);
    await user.send(`🔒 **Ticket closed!**\n**Reason:** ${reason}`);
  } catch (err) {}

  setTimeout(async () => {
    try {
      await channel.delete();
      tickets.delete(channel.id);
    } catch (err) {}
  }, 10000);
}

async function handleMakeStaff(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  
  try {
    const member = await interaction.guild.members.fetch(user.id);
    const role = await interaction.guild.roles.fetch(CONFIG.STAFF_ROLE);
    
    if (!role) return interaction.editReply('❌ Staff role not found!');
    if (member.roles.cache.has(CONFIG.STAFF_ROLE)) return interaction.editReply('⚠️ Already staff!');

    await member.roles.add(role);
    staffMembers.add(user.id);

    try {
      await user.send(`🎉 You are now **OTO Staff**!\n\nUse \`/help\` to see staff commands!`);
    } catch (err) {}

    await interaction.editReply(`✅ ${user.tag} is now staff!`);
  } catch (err) {
    await interaction.editReply(`❌ Failed: ${err.message}`);
  }
}

async function handleRemoveStaff(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  
  try {
    const member = await interaction.guild.members.fetch(user.id);
    const role = await interaction.guild.roles.fetch(CONFIG.STAFF_ROLE);
    
    if (!role) return interaction.editReply('❌ Role not found!');
    if (!member.roles.cache.has(CONFIG.STAFF_ROLE)) return interaction.editReply('⚠️ Not staff!');

    await member.roles.remove(role);
    staffMembers.delete(user.id);

    try {
      await user.send(`👤 You have been removed from staff.`);
    } catch (err) {}

    await interaction.editReply(`✅ ${user.tag} removed from staff!`);
  } catch (err) {
    await interaction.editReply(`❌ Failed: ${err.message}`);
  }
}

async function handleStaffList(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const role = await interaction.guild.roles.fetch(CONFIG.STAFF_ROLE);
    
    if (!role || role.members.size === 0) return interaction.editReply('❌ No staff!');

    const staffList = role.members
      .map((member, i) => `${i + 1}. ${member.user.tag} - <@${member.id}>`)
      .join('\n');

    const embed = new Discord.EmbedBuilder()
      .setTitle('👮 OTO Staff')
      .setDescription(staffList)
      .setColor('#3498db')
      .addFields({ name: '📊 Total', value: `${role.members.size}`, inline: true });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply('❌ Failed to fetch staff!');
  }
}

async function handleAutoSpam(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const enable = interaction.options.getBoolean('enable');
  const minutes = interaction.options.getInteger('minutes') || 5;

  SPAM_SETTINGS.enabled = enable;
  SPAM_SETTINGS.interval = minutes * 60000;

  if (enable) {
    if (!activeTournament) return interaction.editReply('❌ No tournament!');

    if (tournamentSpamInterval) clearInterval(tournamentSpamInterval);

    tournamentSpamInterval = setInterval(async () => {
      await spamTournamentAnnouncement();
    }, SPAM_SETTINGS.interval);

    await interaction.editReply(`✅ Auto-spam ENABLED! Every ${minutes} minutes.`);
    await spamTournamentAnnouncement();
  } else {
    if (tournamentSpamInterval) {
      clearInterval(tournamentSpamInterval);
      tournamentSpamInterval = null;
    }
    await interaction.editReply('✅ Auto-spam DISABLED!');
  }
}

async function handleSpamNow(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) return interaction.editReply('❌ No tournament!');

  await spamTournamentAnnouncement();
  await interaction.editReply('✅ Announcement sent!');
}

async function spamTournamentAnnouncement() {
  if (!activeTournament || activeTournament.status !== 'registration') return;

  try {
    const remaining = activeTournament.maxSlots - registeredPlayers.size;

    const message = `🔥 **${activeTournament.title}** 🔥\n\n💰 Prize: **${activeTournament.prizePool}**\n⏰ Time: **${activeTournament.scheduledTime}**\n📊 Slots: **${registeredPlayers.size}/${activeTournament.maxSlots}** (${remaining} left)\n\n✅ 2 invites = FREE!\n\n👉 Join: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> 👈`;

    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    await channel.send(message);
  } catch (err) {
    console.error('Spam error:', err);
  }
}

// ===== BUTTON & SELECT MENU HANDLERS =====
async function handleJoinButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ Registration closed!');
  }

  if (registeredPlayers.has(interaction.user.id)) {
    return interaction.editReply('⚠️ Already registered!');
  }

  if (registeredPlayers.size >= activeTournament.maxSlots) {
    return interaction.editReply('❌ Tournament FULL!');
  }

  if (bannedUsers.has(interaction.user.id)) {
    return interaction.editReply('🚫 You are blocked!');
  }

  const inviteCount = userInvites.get(interaction.user.id) || 0;
  if (inviteCount < CONFIG.MIN_INVITES && !isStaff(interaction.member)) {
    return interaction.editReply(`❌ Need ${CONFIG.MIN_INVITES} invites! You have ${inviteCount}.\n\nType \`-i\` to check invites!`);
  }

  registeredPlayers.set(interaction.user.id, {
    user: interaction.user,
    joinedAt: new Date(),
    approved: true
  });

  updatePlayerStats(interaction.user.id, { tournaments: 1 });

  const embed = new Discord.EmbedBuilder()
    .setTitle('✅ Registration Successful!')
    .setDescription(`Registered for **${activeTournament.title}**!`)
    .setColor('#00ff00')
    .addFields(
      { name: '⏰ Time', value: activeTournament.scheduledTime, inline: true },
      { name: '💰 Prize', value: activeTournament.prizePool, inline: true },
      { name: '📊 Position', value: `${registeredPlayers.size}/${activeTournament.maxSlots}`, inline: true }
    );

  await interaction.editReply({ embeds: [embed] });

  try {
    await interaction.user.send({
      content: `🎮 **Registered!**\n\n${activeTournament.title}\n⏰ ${activeTournament.scheduledTime}\n\nRoom details will be DMed! Good luck! 🍀`,
      embeds: [embed]
    });
  } catch (err) {}

  // Announce in general
  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
  await generalChannel.send(
    `🎮 ${interaction.user} joined **${activeTournament.title}**!\n\n📊 **${registeredPlayers.size}/${activeTournament.maxSlots}** slots filled! ${activeTournament.maxSlots - registeredPlayers.size} left! 🔥`
  );
}

async function handleCreateTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  for (const [channelId, data] of tickets.entries()) {
    if (data.userId === interaction.user.id) {
      return interaction.editReply(`⚠️ Ticket exists: <#${channelId}>`);
    }
  }

  try {
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: Discord.ChannelType.GuildText,
      parent: interaction.channel.parent,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [Discord.PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages] },
        { id: CONFIG.STAFF_ROLE, allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ManageChannels] },
      ],
    });

    tickets.set(ticketChannel.id, { userId: interaction.user.id, createdAt: new Date() });

    const embed = new Discord.EmbedBuilder()
      .setTitle('🎫 Support Ticket')
      .setDescription(
        `Hello ${interaction.user}! 👋\n\n` +
        `Staff will assist you shortly!\n\n` +
        `**📝 Please provide:**\n` +
        `• Detailed description\n` +
        `• Screenshots if needed\n\n` +
        `**⏰ Response:** Usually 5-30 minutes`
      )
      .setColor('#3498db')
      .setTimestamp();

    const buttonRow = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('close_ticket_confirm')
        .setLabel('🔒 Close Ticket')
        .setStyle(Discord.ButtonStyle.Danger)
    );

    await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.STAFF_ROLE}>`, embeds: [embed], components: [buttonRow] });
    await interaction.editReply(`✅ Ticket created! <#${ticketChannel.id}>`);
  } catch (err) {
    console.error('Ticket error:', err);
    await interaction.editReply('❌ Failed to create ticket!');
  }
}

async function handleCloseTicketButton(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
  }

  await interaction.deferUpdate();

  const channel = interaction.channel;
  const ticketData = tickets.get(channel.id);

  if (!ticketData) return interaction.followUp({ content: '❌ Data not found!', ephemeral: true });

  const embed = new Discord.EmbedBuilder()
    .setTitle('🔒 Ticket Closed')
    .setDescription(`**By:** ${interaction.user}\n\nDeleting in 10s...`)
    .setColor('#ff0000');

  await channel.send({ embeds: [embed] });

  try {
    const user = await client.users.fetch(ticketData.userId);
    await user.send(`🔒 **Ticket closed!**\n\nNeed help? Open new ticket in <#${CONFIG.OPEN_TICKET}>!`);
  } catch (err) {}

  setTimeout(async () => {
    try {
      await channel.delete();
      tickets.delete(channel.id);
    } catch (err) {}
  }, 10000);
}

// ===== MESSAGE HANDLER =====
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content === '-i' && message.channel.id === CONFIG.GENERAL_CHAT) {
    const count = userInvites.get(message.author.id) || 0;
    const needed = CONFIG.MIN_INVITES;
    const canJoin = count >= needed;

    return message.reply(
      `🔗 **Invites:** ${count}/${needed}\n` +
      `${canJoin ? '✅ FREE ENTRY!' : `❌ Need ${needed - count} more!`}`
    );
  }

  if (message.channel.id !== CONFIG.GENERAL_CHAT) return;

  for (const [keyword, responses] of Object.entries(CONFIG.AUTO_RESPONSES)) {
    if (content.includes(keyword)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(response);
      return;
    }
  }
});

// ===== MEMBER JOIN/LEAVE =====
client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    
    const usedInvite = newInvites.find(inv => {
      const cached = inviteCache.get(inv.code) || 0;
      return inv.uses > cached;
    });

    if (usedInvite && usedInvite.inviter) {
      inviteCache.set(usedInvite.code, usedInvite.uses);
      
      const current = userInvites.get(usedInvite.inviter.id) || 0;
      userInvites.set(usedInvite.inviter.id, current + 1);

      const welcomeMsg = CONFIG.WELCOME_MESSAGES[Math.floor(Math.random() * CONFIG.WELCOME_MESSAGES.length)]
        .replace('{user}', `${member}`);

      const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
      await channel.send(
        `${welcomeMsg}\n💫 Invited by: <@${usedInvite.inviter.id}> (Total: **${current + 1}**) 🔥`
      );

      try {
        const inviter = await client.users.fetch(usedInvite.inviter.id);
        await inviter.send(
          `🎉 **+1 Invite!**\n\n${member.user.tag} joined!\n\n**Total:** ${current + 1}\n${current + 1 >= CONFIG.MIN_INVITES ? '✅ FREE ENTRY!' : `Need ${CONFIG.MIN_INVITES - current - 1} more!`}`
        );
      } catch (err) {}

      if (!firstTimeUsers.has(member.id)) {
        firstTimeUsers.add(member.id);
        
        setTimeout(async () => {
          try {
            const welcomeEmbed = new Discord.EmbedBuilder()
              .setTitle('🎉 Welcome to OTO!')
              .setDescription(
                `Hey ${member.user.username}! 👋\n\n` +
                `**Get Started:**\n` +
                `1️⃣ Invite **2 people** = FREE entry!\n` +
                `2️⃣ Check <#${CONFIG.HOW_TO_JOIN}>\n` +
                `3️⃣ Read <#${CONFIG.RULES_CHANNEL}>\n` +
                `4️⃣ Watch <#${CONFIG.ANNOUNCEMENT_CHANNEL}>\n\n` +
                `Type \`-i\` to check invites!`
              )
              .setColor('#3498db')
              .setThumbnail(CONFIG.QR_IMAGE);

            await member.send({ embeds: [welcomeEmbed] });
          } catch (err) {}
        }, 3000);
      }
    }

    newInvites.forEach(inv => inviteCache.set(inv.code, inv.uses));
  } catch (err) {
    console.error('Join tracking error:', err);
  }
});

client.on('guildMemberRemove', async (member) => {
  try {
    const leaveMsg = CONFIG.LEAVE_MESSAGES[Math.floor(Math.random() * CONFIG.LEAVE_MESSAGES.length)]
      .replace('{user}', member.user.username);

    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    await channel.send(leaveMsg);

    if (registeredPlayers.has(member.id)) {
      registeredPlayers.delete(member.id);
    }
  } catch (err) {
    console.error('Leave error:', err);
  }
});

// ===== HELPER FUNCTIONS =====
async function initializeInviteTracking() {
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) {
          inviteCache.set(inv.code, inv.uses);
        }
      });
      console.log(`✅ Cached ${invites.size} invites`);
    } catch (err) {
      console.warn(`⚠️ Could not fetch invites`);
    }
  }
}

function createTournamentEmbed(tournament) {
  const progress = generateProgressBar(registeredPlayers.size, tournament.maxSlots);
  const statusEmojis = {
    'registration': '📝 REGISTRATION OPEN',
    'live': '🔴 LIVE NOW',
    'ended': '✅ ENDED'
  };

  const embed = new Discord.EmbedBuilder()
    .setTitle(`${statusEmojis[tournament.status]} - ${tournament.title}`)
    .setColor(tournament.status === 'live' ? '#00ff00' : tournament.status === 'ended' ? '#808080' : '#3498db')
    .addFields(
      { name: '💰 Prize', value: `**${tournament.prizePool}**`, inline: true },
      { name: '⏰ Time', value: `**${tournament.scheduledTime}**`, inline: true },
      { name: '📊 Slots', value: `**${registeredPlayers.size}/${tournament.maxSlots}**`, inline: true }
    );

  if (tournament.status === 'registration') {
    embed.addFields({ name: '📈 Progress', value: progress, inline: false });
  }

  if (tournament.status === 'live' && tournament.roomId) {
    embed.addFields(
      { name: '🆔 Room ID', value: `\`\`\`${tournament.roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: tournament.roomPassword ? `\`\`\`${tournament.roomPassword}\`\`\`` : '❌ None', inline: false }
    );
  }

  embed.setImage(tournament.imageUrl);
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
  return member?.roles?.cache?.has(CONFIG.STAFF_ROLE) || 
         member?.permissions?.has(Discord.PermissionFlagsBits.Administrator);
}

function updatePlayerStats(userId, updates) {
  const stats = userStats.get(userId) || { wins: 0, topThree: 0, tournaments: 0 };
  userStats.set(userId, {
    wins: stats.wins + (updates.wins || 0),
    topThree: stats.topThree + (updates.topThree || 0),
    tournaments: stats.tournaments + (updates.tournaments || 0)
  });
}

// ===== PERSISTENT MESSAGES =====
async function setupPersistentMessages() {
  try {
    const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
    const joinEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 HOW TO JOIN')
      .setDescription(
        `**Steps:**\n\n` +
        `1️⃣ Invite **${CONFIG.MIN_INVITES} people**\n` +
        `2️⃣ Watch <#${CONFIG.ANNOUNCEMENT_CHANNEL}>\n` +
        `3️⃣ Click JOIN button\n` +
        `4️⃣ Get room details in DM\n\n` +
        `Type \`-i\` to check invites!`
      )
      .setColor('#3498db')
      .setImage(CONFIG.QR_IMAGE);

    const messages = await howToJoinChannel.messages.fetch({ limit: 5 });
    const botMsgs = messages.filter(m => m.author.id === client.user.id);
    if (botMsgs.size === 0) {
      await howToJoinChannel.send({ embeds: [joinEmbed] });
      console.log('✅ Posted how-to-join');
    }

    const ticketChannel = await client.channels.fetch(CONFIG.OPEN_TICKET);
    const ticketEmbed = new Discord.EmbedBuilder()
      .setTitle('🎫 SUPPORT TICKETS')
      .setDescription('Need help? Click button below!')
      .setColor('#9b59b6');

    const ticketButton = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('📩 Create Ticket')
        .setStyle(Discord.ButtonStyle.Primary)
    );

    const ticketMsgs = await ticketChannel.messages.fetch({ limit: 5 });
    const ticketBotMsgs = ticketMsgs.filter(m => m.author.id === client.user.id);
    if (ticketBotMsgs.size === 0) {
      await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketButton] });
      console.log('✅ Posted ticket system');
    }
  } catch (err) {
    console.error('Setup error:', err);
  }
}

// ===== AUTOMATED TASKS =====
function startAutomatedTasks() {
  setInterval(() => {
    if (activeTournament) {
      client.user.setActivity(
        `${activeTournament.title} | ${registeredPlayers.size}/${activeTournament.maxSlots}`, 
        { type: Discord.ActivityType.Competing }
      );
    } else {
      client.user.setActivity('🏆 /help | OTO Tournaments', { type: Discord.ActivityType.Competing });
    }
  }, 300000);

  console.log('✅ Automated tasks running');
}

// ===== ERROR HANDLING =====
client.on('error', err => console.error('Client error:', err));
client.on('warn', warn => console.warn('Warning:', warn));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

// ===== LOGIN =====
client.login(BOT_TOKEN)
  .then(() => console.log('✅ Bot login successful'))
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });

async function handleGameSelection(interaction) {
  await interaction.deferUpdate();

  const game = interaction.customId.replace('game_', '');
  const gameName = game === 'freefire' ? 'Free Fire' : 'Minecraft';
  
  const data = tempTournamentData.get(interaction.user.id) || {};
  data.game = gameName;
  tempTournamentData.set(interaction.user.id, data);

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 Create ${gameName} Tournament - Step 2`)
    .setDescription('**Enter Tournament Details:**')
    .setColor('#3498db')
    .addFields(
      { name: '📝 Required Info', value: 
        '• Tournament Name\n' +
        '• Prize Pool (e.g., ₹500)\n' +
        '• Entry Fee (e.g., ₹20 or Free)\n' +
        '• Max Slots (e.g., 50)\n' +
        '• Time (e.g., 7pm IST)\n' +
        '• Image URL (optional)'
      }
    );

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('tournament_details')
      .setPlaceholder('Select tournament type')
      .addOptions([
        { label: 'Solo', value: 'solo', description: '1 player per team' },
        { label: 'Duo', value: 'duo', description: '2 players per team' },
        { label: 'Squad', value: 'squad', description: '4 players per team' }
      ])
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleSelectMenu(interaction) {
  const { customId, values } = interaction;

  if (customId === 'tournament_details') {
    await handleTournamentTypeSelection(interaction, values[0]);
  } else if (customId.startsWith('winner_')) {
    await handleWinnerSelection(interaction, values[0]);
  }
}

async function handleTournamentTypeSelection(interaction, type) {
  await interaction.deferUpdate();

  const data = tempTournamentData.get(interaction.user.id) || {};
  data.type = type;
  tempTournamentData.set(interaction.user.id, data);

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 Create ${data.game} Tournament - Final Step`)
    .setDescription(
      `**Game:** ${data.game}\n` +
      `**Type:** ${type.toUpperCase()}\n\n` +
      `**Use buttons below for quick setup or reply with custom details:**\n\n` +
      `Format:\n` +
      `\`Name: Epic Tournament\nPrize: ₹500\nEntry: Free\nSlots: 50\nTime: 7pm\nImage: URL\``
    )
    .setColor('#3498db');

  const row1 = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('quick_free_500')
      .setLabel('Free Entry | ₹500 Prize')
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId('quick_paid_20')
      .setLabel('₹20 Entry | ₹1000 Prize')
      .setStyle(Discord.ButtonStyle.Primary)
  );

  const row2 = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('quick_paid_50')
      .setLabel('₹50 Entry | ₹2500 Prize')
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId('quick_custom')
      .setLabel('⚙️ Custom Details')
      .setStyle(Discord.ButtonStyle.Secondary)
  );

  await interaction.editReply({ embeds: [embed], components: [row1, row2] });
  
  // Listen for custom message
  const filter = m => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, time: 300000, max: 1 });
  
  collector.on('collect', async (message) => {
    await handleCustomTournamentDetails(interaction, message, data);
  });
}

async function handleCustomTournamentDetails(interaction, message, baseData) {
  const content = message.content;
  
  try {
    const lines = content.split('\n');
    const details = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        details[key.trim().toLowerCase()] = value;
      }
    });

    const tournamentData = {
      id: Date.now().toString(),
      game: baseData.game,
      type: baseData.type,
      title: details.name || `${baseData.game} ${baseData.type} Tournament`,
      prizePool: details.prize || '₹500',
      entryFee: details.entry || 'Free',
      maxSlots: parseInt(details.slots) || 50,
      scheduledTime: details.time || 'TBA',
      imageUrl: details.image || CONFIG.GAME_IMAGES[baseData.game] || CONFIG.QR_IMAGE,
      status: 'registration',
      createdBy: interaction.user.id,
      createdAt: new Date()
    };

    await confirmTournamentCreation(interaction, message.channel, tournamentData);
    await message.delete().catch(() => {});
    
  } catch (err) {
    await message.reply('❌ Invalid format! Try again.').then(m => setTimeout(() => m.delete(), 5000));
  }
}

async function confirmTournamentCreation(interaction, channel, tournamentData) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('✅ Tournament Preview')
    .setDescription(
      `**Confirm these details:**\n\n` +
      `🎮 **Game:** ${tournamentData.game}\n` +
      `📝 **Name:** ${tournamentData.title}\n` +
      `🏆 **Type:** ${tournamentData.type.toUpperCase()}\n` +
      `💰 **Prize:** ${tournamentData.prizePool}\n` +
      `💵 **Entry:** ${tournamentData.entryFee}\n` +
      `👥 **Slots:** ${tournamentData.maxSlots}\n` +
      `⏰ **Time:** ${tournamentData.scheduledTime}\n\n` +
      `**Prize Distribution:**\n` +
      `🥇 1st: 50% + Certificate\n` +
      `🥈 2nd: 30% + Certificate\n` +
      `🥉 3rd: 20% + Certificate`
    )
    .setColor('#00ff00')
    .setImage(tournamentData.imageUrl)
    .setFooter({ text: 'Certificates will be sent to winners via DM' });

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId(`confirm_tournament_${tournamentData.id}`)
      .setLabel('✅ Create & Announce')
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId('cancel_tournament')
      .setLabel('❌ Cancel')
      .setStyle(Discord.ButtonStyle.Danger)
  );

  // Store temporarily
  tempTournamentData.set(`final_${tournamentData.id}`, tournamentData);

  await channel.send({ embeds: [embed], components: [row] });
}

async function handleConfirmTournament(interaction) {
  await interaction.deferUpdate();

  const tournamentId = interaction.customId.replace('confirm_tournament_', '');
  const tournamentData = tempTournamentData.get(`final_${tournamentId}`);

  if (!tournamentData) {
    return interaction.followUp({ content: '❌ Tournament data expired!', ephemeral: true });
  }

  // Set as active tournament
  activeTournament = tournamentData;
  registeredPlayers.clear();

  // Create announcement embed
  const announceEmbed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${tournamentData.title}`)
    .setDescription(
      `**${tournamentData.game} ${tournamentData.type.toUpperCase()} Tournament** 🔥\n\n` +
      `💰 **Prize Pool:** ${tournamentData.prizePool}\n` +
      `💵 **Entry Fee:** ${tournamentData.entryFee}\n` +
      `👥 **Slots:** ${tournamentData.maxSlots}\n` +
      `⏰ **Time:** ${tournamentData.scheduledTime}\n\n` +
      `**Prize Distribution:**\n` +
      `🥇 **1st Place:** 50% + Certificate\n` +
      `🥈 **2nd Place:** 30% + Certificate\n` +
      `🥉 **3rd Place:** 20% + Certificate\n\n` +
      `**Requirements:**\n` +
      `✅ Minimum ${CONFIG.MIN_INVITES} invites (Type -i to check)\n` +
      `✅ Follow all rules\n` +
      `✅ Be on time\n\n` +
      `**Click JOIN button below to register!** ⬇️`
    )
    .setColor('#ffd700')
    .setImage(tournamentData.imageUrl)
    .setFooter({ text: `Tournament ID: ${tournamentData.id}` })
    .setTimestamp();

  const joinButton = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN TOURNAMENT')
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji('🏆')
  );

  // Send to announcement channel
  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await announceChannel.send({ 
    content: '@everyone\n\n🚨 **NEW TOURNAMENT ANNOUNCED!** 🚨', 
    embeds: [announceEmbed], 
    components: [joinButton] 
  });

  // Send to schedule channel
  const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
  await scheduleChannel.send({ embeds: [announceEmbed] });

  // Notify general chat
  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
  await generalChannel.send(
    `🔥 **${tournamentData.game} Tournament LIVE!** 🔥\n\n` +
    `💰 Prize: ${tournamentData.prizePool}\n` +
    `⏰ Time: ${tournamentData.scheduledTime}\n` +
    `👥 Slots: ${tournamentData.maxSlots}\n\n` +
    `Join now: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> 🎮`
  );

  // Clean up temp data
  tempTournamentData.delete(interaction.user.id);
  tempTournamentData.delete(`final_${tournamentId}`);

  await interaction.editReply({ 
    embeds: [new Discord.EmbedBuilder()
      .setTitle('✅ Tournament Created!')
      .setDescription(`${tournamentData.title} announced successfully!`)
      .setColor('#00ff00')
    ], 
    components: [] 
  });

  // Notify staff
  const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS);
  await staffChannel.send(
    `✅ **Tournament Created**\n\n` +
    `Name: ${tournamentData.title}\n` +
    `Game: ${tournamentData.game}\n` +
    `Created by: <@${interaction.user.id}>\n` +
    `Max Slots: ${tournamentData.maxSlots}\n\n` +
    `Use \`/start\` to begin when ready!`
  );
}

// ===== QUICK TOURNAMENT TEMPLATES =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  if (interaction.customId.startsWith('quick_')) {
    await handleQuickTemplate(interaction);
  }
});

async function handleQuickTemplate(interaction) {
  await interaction.deferUpdate();

  const template = interaction.customId;
  const data = tempTournamentData.get(interaction.user.id) || {};

  let tournamentData;

  if (template === 'quick_free_500') {
    tournamentData = {
      id: Date.now().toString(),
      game: data.game,
      type: data.type,
      title: `${data.game} ${data.type} Tournament`,
      prizePool: '₹500',
      entryFee: 'Free',
      maxSlots: 50,
      scheduledTime: '7pm IST',
      imageUrl: CONFIG.GAME_IMAGES[data.game] || CONFIG.QR_IMAGE,
      status: 'registration',
      createdBy: interaction.user.id,
      createdAt: new Date()
    };
  } else if (template === 'quick_paid_20') {
    tournamentData = {
      id: Date.now().toString(),
      game: data.game,
      type: data.type,
      title: `${data.game} ${data.type} Premium Tournament`,
      prizePool: '₹1000',
      entryFee: '₹20',
      maxSlots: 50,
      scheduledTime: '8pm IST',
      imageUrl: CONFIG.GAME_IMAGES[data.game] || CONFIG.QR_IMAGE,
      status: 'registration',
      createdBy: interaction.user.id,
      createdAt: new Date()
    };
  } else if (template === 'quick_paid_50') {
    tournamentData = {
      id: Date.now().toString(),
      game: data.game,
      type: data.type,
      title: `${data.game} ${data.type} Mega Tournament`,
      prizePool: '₹2500',
      entryFee: '₹50',
      maxSlots: 50,
      scheduledTime: '9pm IST',
      imageUrl: CONFIG.GAME_IMAGES[data.game] || CONFIG.QR_IMAGE,
      status: 'registration',
      createdBy: interaction.user.id,
      createdAt: new Date()
    };
  }

  if (tournamentData) {
    await confirmTournamentCreation(interaction, interaction.channel, tournamentData);
  }
}

// ===== START TOURNAMENT =====
async function handleStart(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No tournament!');
  }

  if (activeTournament.status === 'live') {
    return interaction.editReply('⚠️ Already live!');
  }

  const roomId = interaction.options.getString('roomid');
  const password = interaction.options.getString('password');

  activeTournament.status = 'live';
  activeTournament.roomId = roomId;
  activeTournament.roomPassword = password;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🔴 ${activeTournament.title} - LIVE NOW!`)
    .setColor('#00ff00')
    .setDescription(`🚨 **TOURNAMENT STARTED!** 🚨`)
    .addFields(
      { name: '🆔 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: password ? `\`\`\`${password}\`\`\`` : '❌ None', inline: false },
      { name: '👥 Players', value: `${registeredPlayers.size}`, inline: true },
      { name: '💰 Prize', value: activeTournament.prizePool, inline: true }
    )
    .setImage(activeTournament.imageUrl)
    .setFooter({ text: '⚠️ JOIN NOW! Late entries not allowed!' });

  const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await channel.send({ content: '@everyone\n\n🚨 **TOURNAMENT LIVE!**', embeds: [embed] });

  // DM all players
  for (const [userId] of registeredPlayers.entries()) {
    try {
      const user = await client.users.fetch(userId);
      await user.send({
        content: `🎮 **${activeTournament.title}** STARTED!\n\n🆔 Room: \`${roomId}\`\n🔐 Pass: ${password || 'None'}\n\n⚡ JOIN NOW! Good luck! 🍀`,
        embeds: [embed]
      });
    } catch (err) {}
  }

  await interaction.editReply('✅ Tournament started! Details sent to players!');
}

// ===== END TOURNAMENT & SEND CERTIFICATES =====
async function handleEnd(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No tournament!');
  }

  const participants = Array.from(registeredPlayers.values()).slice(0, 25);

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Select Winners')
    .setDescription('Select 1st, 2nd, and 3rd place:')
    .setColor('#ffd700');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('winner_first')
      .setPlaceholder('🥇 Select 1st Place')
      .addOptions(
        participants.map((p, i) => ({
          label: p.user.username,
          value: p.user.id,
          description: `Player ${i + 1}`
        }))
      )
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleWinnerSelection(interaction, winnerId) {
  const place = interaction.customId.split('_')[1];

  if (!activeTournament.winners) {
    activeTournament.winners = [];
  }

  const user = await client.users.fetch(winnerId);
  activeTournament.winners.push({ id: winnerId, username: user.username, place });

  if (place === 'first') {
    // Select 2nd
    await showSecondPlaceSelection(interaction, winnerId);
  } else if (place === 'second') {
    // Select 3rd
    await showThirdPlaceSelection(interaction, winnerId);
  } else if (place === 'third') {
    // Finalize
    await finalizeTournament(interaction);
  }
}

async function showSecondPlaceSelection(interaction, firstId) {
  await interaction.deferUpdate();

  const participants = Array.from(registeredPlayers.values())
    .filter(p => p.user.id !== firstId)
    .slice(0, 25);

  const embed = new Discord.EmbedBuilder()
    .setTitle('🥈 Select 2nd Place')
    .setDescription(`1st: <@${firstId}>`)
    .setColor('#c0c0c0');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('winner_second')
      .setPlaceholder('🥈 Select 2nd Place')
      .addOptions(
        participants.map(p => ({
          label: p.user.username,
          value: p.user.id
        }))
      )
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

async function showThirdPlaceSelection(interaction, secondId) {
  await interaction.deferUpdate();

  const firstId = activeTournament.winners[0].id;
  const participants = Array.from(registeredPlayers.values())
    .filter(p => p.user.id !== firstId && p.user.id !== secondId)
    .slice(0, 25);

  const embed = new Discord.EmbedBuilder()
    .setTitle('🥉 Select 3rd Place')
    .setDescription(`1st: <@${firstId}>\n2nd: <@${secondId}>`)
    .setColor('#cd7f32');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('winner_third')
      .setPlaceholder('🥉 Select 3rd Place')
      .addOptions(
        participants.map(p => ({
          label: p.user.username,
          value: p.user.id
        }))
      )
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

async function finalizeTournament(interaction) {
  await interaction.deferUpdate();

  const winners = activeTournament.winners;
  
  // Update stats
  updatePlayerStats(winners[0].id, { wins: 1, topThree: 1, tournaments: 1 });
  updatePlayerStats(winners[1].id, { topThree: 1, tournaments: 1 });
  updatePlayerStats(winners[2].id, { topThree: 1, tournaments: 1 });

  // Calculate prizes
  const prizeNum = parseInt(activeTournament.prizePool.replace(/[^0-9]/g, ''));
  const prizes = {
    first: Math.floor(prizeNum * 0.5),
    second: Math.floor(prizeNum * 0.3),
    third: Math.floor(prizeNum * 0.2)
  };

  // Send certificates
  await sendCertificate(winners[0].id, '1st', prizes.first, activeTournament);
  await sendCertificate(winners[1].id, '2nd', prizes.second, activeTournament);
  await sendCertificate(winners[2].id, '3rd', prizes.third, activeTournament);

  // Announce winners
  const announceEmbed = new Discord.EmbedBuilder()
    .setTitle(`🏆 ${activeTournament.title} - RESULTS`)
    .setDescription(
      `**Winners Announced!** 🎉\n\n` +
      `🥇 **1st Place:** <@${winners[0].id}> - ₹${prizes.first}\n` +
      `🥈 **2nd Place:** <@${winners[1].id}> - ₹${prizes.second}\n` +
      `🥉 **3rd Place:** <@${winners[2].id}> - ₹${prizes.third}\n\n` +
      `**Certificates sent via DM!** 📜\n\n` +
      `Congratulations to all winners! 🎊`
    )
    .setColor('#ffd700')
    .setImage(activeTournament.imageUrl)
    .setFooter({ text: 'Stay tuned for more tournaments!' })
    .setTimestamp();

  const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await channel.send({ content: '@everyone', embeds: [announceEmbed] });

  // Add to history
  activeTournament.status = 'ended';
  activeTournament.endedAt = new Date();
  tournamentHistory.unshift(activeTournament);
  
  if (tournamentHistory.length > 50) tournamentHistory.pop();

  activeTournament = null;
  registeredPlayers.clear();

  await interaction.editReply({ 
    embeds: [new Discord.EmbedBuilder()
      .setTitle('✅ Tournament Ended!')
      .setDescription('Winners announced & certificates sent!')
      .setColor('#00ff00')
    ], 
    components: [] 
  });
}

async function sendCertificate(userId, place, prize, tournament) {
  try {
    const user = await client.users.fetch(userId);
    
    const certificateEmbed = new Discord.EmbedBuilder()
      .setTitle('🏆 WINNER CERTIFICATE')
      .setDescription(
        `**Congratulations ${user.username}!** 🎉\n\n` +
        `You have secured **${place} Place** in:\n` +
        `**${tournament.title}**\n\n` +
        `🏅 **Position:** ${place}\n` +
        `💰 **Prize Won:** ₹${prize}\n` +
        `🎮 **Game:** ${tournament.game}\n` +
        `📅 **Date:** ${new Date().toLocaleDateString()}\n\n` +
        `**This certificate is issued by OTO Tournaments**\n\n` +
        `Keep playing and winning! 💪`
      )
      .setColor(place === '1st' ? '#ffd700' : place === '2nd' ? '#c0c0c0' : '#cd7f32')
      .setImage(tournament.imageUrl)
      .setFooter({ text: `Tournament ID: ${tournament.id}` })
      .setTimestamp();

    await user.send({ embeds: [certificateEmbed] });
    console.log(`✅ Certificate sent to ${user.username}`);
    
  } catch (err) {
    console.error(`❌ Could not send certificate to ${userId}:`, err);
  }
}
