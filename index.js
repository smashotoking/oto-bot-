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
  
  STAFF_ROLE: '1438475461977047112',
  
  MIN_INVITES: 2,
  QR_IMAGE: 'https://i.ibb.co/jkBSmkM/qr.png',
  
  // Funny welcome messages
  WELCOME_MESSAGES: [
    '🔥 Apna bhai aa gaya! Welcome to OTO {user}! Tournament khelega? 💪',
    '🎮 Areee {user} bhai! Swagat hai! Free Fire ke liye ready ho jao! 🔥',
    '💫 Boss {user} has entered the chat! Tournament mein dikha apna talent! 🏆',
    '⚡ {user} bhai aa gaye! OTO ka asli player aa gaya! Welcome! 🎯',
    '🌟 {user} welcome to OTO family! Tournaments mein participate karo aur jeeto! 💰',
  ],
  
  // Funny leave messages
  LEAVE_MESSAGES: [
    '😢 {user} bhai chale gaye... Bye bye! 👋',
    '💔 {user} ne server chhod diya... Come back soon bro! 🥺',
    '🚶 {user} bhai to chal base... Later dude! ✌️',
  ],
  
  // Auto responses
  AUTO_RESPONSES: {
    'tournament': [
      'Bhai tournament ke liye <#1438482561679626303> check kar! Daily naye tournaments! 🎮',
      'Tournament join karna hai? <#1438484746165555243> pe jao bhai! 🔥',
      'Abhi tournament chal raha hai kya? <#1438482561679626303> dekho schedule! 📅',
    ],
    'free entry': [
      'Free entry chahiye? Bas 2 logo ko invite karo aur free mein khelo! 🎁',
      'Bhai 2 invites complete kar, phir free entry milegi! Use -i to check invites 🔗',
      'Brother, invite 2 people and get FREE tournament entry! Simple! 💪',
    ],
    'free tournament': [
      'Free mein khelna hai? 2 logo ko invite karo! Bas itna hi! 🎉',
      'Brother, 2 invites = FREE entry! Copy server link, share karo, done! ✅',
      'Bhai free tournament entry ke liye sirf 2 log bulao server mein! Ez! 🔥',
      'Free entry unlock karo: Just invite 2 friends to the server! Type -i to check progress! 🚀',
    ],
    'kab': [
      'Tournament schedule <#1438482561679626303> pe hai bhai! Check kar le! ⏰',
      'Timing ke liye tournament-schedule channel dekh lo! 📅',
      'Bhai daily tournaments hote hain! Schedule <#1438482561679626303> mein dekh! 🎮',
    ],
    'kaise': [
      'Join karna easy hai! <#1438482512296022017> mein sab steps hain! 💡',
      'Bhai simple hai: 2 log invite karo → tournament join karo → jeeto! 💰',
      'How to join? <#1438482512296022017> channel mein complete guide hai! 📖',
    ],
    'how to join': [
      'Full guide: <#1438482512296022017>\n2 invites chahiye, then join button press karo! 🎯',
      'Easy steps: 1) Get 2 invites 2) Wait for tournament 3) Click JOIN 4) Win prizes! 🏆',
    ],
    'rules': [
      'Rules important hain bro! <#1438482342145687643> mein padh lo! 📋',
      'Sare rules <#1438482342145687643> channel mein hain! Follow karo! ✅',
      'Tournament rules: <#1438482342145687643> - Must read bhai! ⚠️',
    ],
    'invite': [
      'Invites ke liye type karo: -i ya /invites 🔗',
      'Apne invites check karne ke liye -i likh do! 📊',
      'Brother, -i type karo to check invites instantly! ⚡',
      'Invite kaise milegi? Server link share karo friends ko! Simple! 🔗',
    ],
    'hi': [
      'Hello bhai! Tournament khelne aaye ho? 🎮', 
      'Hey! Kya haal hai? Ready for tournaments? 🔥',
      'Hi bro! OTO mein swagat hai! Invites check kar lo -i se! 👋',
    ],
    'hello': [
      'Hi bro! OTO mein welcome! 💪', 
      'Hello! Tournament join kar lo! 🏆',
      'Hey! Daily tournaments hote hain yahan! Check karo! 🎮',
    ],
    'prize': [
      'Prize pool tournaments ke saath announce hota hai! Big rewards! 💰',
      'Bhai prizes bohot bade hain! Check announcements! 💵',
      'Prize? Daily big amounts! <#1438484746165555243> pe dekho! 💎',
    ],
    'help': [
      'Commands ke liye type karo: /help 🤖',
      'Help chahiye? /help use karo! ℹ️',
      'Need help? Type /help ya ticket kholo <#1438485759891079180> mein! 🎫',
    ],
    'jeetna': [
      'Jeetna hai? Practice karo, rules follow karo, aur play smart! 🧠',
      'Winning tips: Be on time, play fair, take screenshots! 📸',
    ],
    'win': [
      'Win karne ke liye best skills dikhao! Practice makes perfect! 🏆',
      'Winners ko prizes milte hain! Keep playing and improving! 💪',
    ],
    'prize pool': [
      'Prize pool har tournament ke saath announce hota hai bhai! 💰',
      'Check <#1438484746165555243> for latest tournament prizes! Big money! 💵',
    ],
    'room id': [
      'Room ID tournament start hone pe DM mein milegi! Patient raho! ⏰',
      'Room details sirf registered players ko milti hai DM mein! 🔐',
    ],
    'password': [
      'Password tournament live hone pe milega DM mein! Wait karo! 🔒',
      'Room pass registered players ko DM mein bheja jayega! Chill! ✅',
    ],
    'register': [
      'Register karo <#1438484746165555243> se! JOIN button dabao! 🎮',
      'Registration ke liye announcements dekho aur JOIN click karo! 🔥',
    ],
    'slot': [
      'Slots bharne se pehle jaldi register karo! Limited seats! ⚡',
      'Tournament slots <#1438482561679626303> mein bataye jate hain! 📊',
    ],
    'invite kaise': [
      'Bhai server ka invite link copy karo aur friends ko send karo! Simple! 📤',
      'Server invite link share karo WhatsApp, Instagram pe! 2 log join karenge = free entry! 🎁',
    ],
    'link': [
      'Server link copy karke friends ko bhejo! Invite karo unhe! 🔗',
      'Permanent invite link banao aur share karo maximum logo ke saath! 📲',
    ],
    'when': [
      'Tournament timing <#1438482561679626303> mein check karo! Daily updates! 📅',
      'Next tournament ka time announcements mein dikhega! Stay tuned! ⏰',
    ],
    'time': [
      'Exact timing tournament schedule channel mein hai! <#1438482561679626303> 🕐',
      'Time check karne ke liye schedule dekho! Daily multiple tournaments! ⚡',
    ],
    'map': [
      'Map tournament announcement ke saath bataya jayega! 🗺️',
      'Kaunsa map hoga ye tournament start se pehle announce hoga! 📢',
    ],
    'squad': [
      'Squad tournament hai ya solo? <#1438482561679626303> dekho details! 👥',
      'Tournament type (solo/duo/squad) announcements mein milegi! 🎮',
    ],
    'winner': [
      'Winners ko DM mein inform kiya jayega aur prizes milenge! 🏆',
      'Top 3 winners ka naam <#1438484746165555243> pe announce hoga! 👑',
    ],
    'proof': [
      'Winners ko screenshot proof dena padega! Important hai! 📸',
      'Top 3 finish ke screenshots ready rakho! Required hai! ⚠️',
    ],
    'cheat': [
      'Cheating strictly prohibited hai! Permanent ban milega! 🚫',
      'Hacks use kiye to lifetime ban! Play fair, play clean! ✅',
    ],
    'hack': [
      'Hacking not allowed! Caught = instant ban from all tournaments! 🚫',
      'No hacks, no cheats! Fair play only! Break rules = blocked forever! ⚠️',
    ],
    'ban': [
      'Rules break kiye to ban ho jaoge! Follow guidelines! 📋',
      'Ban avoid karne ke liye rules follow karo aur fair khelo! ✅',
    ],
    'support': [
      'Support chahiye? Ticket kholo: <#1438485759891079180> 🎫',
      'Help ke liye ticket create karo ya /help use karo! 💬',
    ],
    'ticket': [
      'Ticket kholne ke liye <#1438485759891079180> jao aur button click karo! 🎫',
      'Issues ke liye ticket system use karo! Staff help karegi! 👨‍💼',
    ],
    'admin': [
      'Admins se baat karni hai? Ticket kholo <#1438485759891079180> mein! 📨',
      'Admin/staff help ke liye proper ticket create karo! 🎫',
    ],
    'problem': [
      'Problem hai? Ticket kholo <#1438485759891079180> ya /help dekho! 🔧',
      'Issues face kar rahe ho? Support ticket create karo! Staff help karegi! 💪',
    ],
    'discord': [
      'Ye OTO tournament ka official Discord hai! Welcome bhai! 🎮',
      'Server mein maze karo, tournaments khelo, prizes jeeto! 🏆',
    ],
    'leave': [
      'Bhai mat jao! Stay and win prizes! Regular tournaments! 😢',
      'Leaving? At least 2 log invite kar jao bhai! Help the community! 🙏',
    ],
    'noob': [
      'Noob nahi ho! Practice karo, better ban jao! Everyone starts somewhere! 💪',
      'Skills improve hoti hain bhai! Keep playing tournaments! 🎯',
    ],
    'pro': [
      'Pro banna hai? Regular tournaments khelo aur practice karo! 🔥',
      'Pro players bhi yahan se start karte hain! Consistency is key! 🎮',
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

// ==================== READY EVENT ====================
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is ONLINE!`);
  
  try {
    await client.user.setActivity('🏆 /help | OTO Tournaments', { type: Discord.ActivityType.Competing });
    await registerCommands();
    await initializeInviteTracking();
    startAutomatedTasks();
    await setupPersistentMessages();
    console.log('✅ Bot fully initialized!');
  } catch (err) {
    console.error('❌ Init error:', err);
  }
});

// ==================== SLASH COMMANDS ====================
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    // ===== USER COMMANDS (Simple & Easy) =====
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('❓ Show all commands'),

    new SlashCommandBuilder()
      .setName('invites')
      .setDescription('🔗 Check your invites')
      .addUserOption(opt => opt.setName('user').setDescription('Check someone else (Staff only)')),

    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('📊 View your tournament stats')
      .addUserOption(opt => opt.setName('user').setDescription('Check someone else')),

    new SlashCommandBuilder()
      .setName('tournament')
      .setDescription('🎮 View active tournament info'),

    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('🏆 View top players'),

    new SlashCommandBuilder()
      .setName('rules')
      .setDescription('📋 View tournament rules'),

    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('🏓 Check bot speed'),

    // ===== STAFF COMMANDS - TOURNAMENT CATEGORY =====
    new SlashCommandBuilder()
      .setName('create')
      .setDescription('🎮 Create tournament with advanced options (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('start')
      .setDescription('▶️ Start the tournament (Staff)')
      .addStringOption(opt => opt.setName('roomid').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Password (optional)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('end')
      .setDescription('🏆 End tournament and declare winners (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('cancel')
      .setDescription('❌ Cancel tournament (Staff)')
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    // ===== PLAYER MANAGEMENT CATEGORY =====
    new SlashCommandBuilder()
      .setName('add')
      .setDescription('➕ Add player to tournament (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User to add').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('remove')
      .setDescription('➖ Remove player from tournament (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('block')
      .setDescription('🚫 Block user from tournaments (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User to block').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('unblock')
      .setDescription('✅ Unblock user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User to unblock').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('participants')
      .setDescription('👥 View all participants (Staff)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // ===== MODERATION CATEGORY =====
    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('⚠️ Warn a user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('⏱️ Timeout a user (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ===== INVITE MANAGEMENT CATEGORY =====
    new SlashCommandBuilder()
      .setName('addinvites')
      .setDescription('➕ Add bonus invites (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Number of invites').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('resetinvites')
      .setDescription('🔄 Reset invites (Staff)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
      .setName('topinviters')
      .setDescription('🏅 View top inviters'),

    // ===== UTILITY CATEGORY =====
    new SlashCommandBuilder()
      .setName('announce')
      .setDescription('📢 Send announcement (Staff)')
      .addStringOption(opt => opt.setName('message').setDescription('Message').setRequired(true))
      .addStringOption(opt => opt.setName('channel').setDescription('Channel').setRequired(true)
        .addChoices(
          { name: '📢 Announcements', value: 'announcement' },
          { name: '💬 General', value: 'general' },
          { name: '📅 Schedule', value: 'schedule' }
        ))
      .addBooleanOption(opt => opt.setName('ping').setDescription('Ping @everyone?'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('history')
      .setDescription('📜 View past tournaments')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number to show (1-10)')),

    new SlashCommandBuilder()
      .setName('closeticket')
      .setDescription('🔒 Close support ticket (Staff)')
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
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
    console.error('Command registration error:', err);
  }
}

// ==================== INTERACTION HANDLER ====================
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
    const msg = '❌ Oops! Something went wrong. Try again bhai!';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

// ==================== COMMAND HANDLERS ====================
async function handleCommand(interaction) {
  const { commandName } = interaction;

  // Block banned users
  if (bannedUsers.has(interaction.user.id) && !isStaff(interaction.member)) {
    return interaction.reply({ content: '🚫 You are blocked from tournaments bhai!', ephemeral: true });
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
    'resetinvites': handleResetInvites,
    'topinviters': handleTopInviters,
    'announce': handleAnnounce,
    'history': handleHistory,
    'closeticket': handleCloseTicket,
  };

  const handler = handlers[commandName];
  if (handler) await handler(interaction);
}

// ===== USER COMMANDS =====
async function handleHelp(interaction) {
  const isStaffUser = isStaff(interaction.member);
  
  const userEmbed = new Discord.EmbedBuilder()
    .setTitle('🤖 OTO Tournament Bot - Commands')
    .setColor('#3498db')
    .addFields(
      { name: '🎮 Tournament Commands', value: '`/tournament` - Active tournament\n`/invites` - Check your invites\n`/stats` - Your statistics\n`/rules` - Tournament rules', inline: false },
      { name: '🏆 Leaderboards', value: '`/leaderboard` - Top players\n`/topinviters` - Top inviters\n`/history` - Past tournaments', inline: false },
      { name: '⚡ Quick Commands', value: '`-i` - Check invites (quick)\n`/ping` - Bot speed\n`/help` - This menu', inline: false }
    )
    .setFooter({ text: 'Need help? Open ticket in #open-ticket!' })
    .setThumbnail(CONFIG.QR_IMAGE);

  if (isStaffUser) {
    const staffEmbed = new Discord.EmbedBuilder()
      .setTitle('👮 Staff Commands')
      .setColor('#f39c12')
      .addFields(
        { name: '🎮 Tournament Management', value: '`/create` - Create tournament\n`/start <roomid>` - Start tournament\n`/end` - End tournament\n`/cancel` - Cancel tournament', inline: false },
        { name: '👥 Player Management', value: '`/add <user>` - Add player\n`/remove <user>` - Remove player\n`/block <user>` - Block user\n`/unblock <user>` - Unblock user\n`/participants` - View all players', inline: false },
        { name: '🛡️ Moderation', value: '`/warn <user>` - Warn player\n`/timeout <user>` - Timeout player\n`/closeticket` - Close ticket', inline: false },
        { name: '🔗 Invite Management', value: '`/addinvites <user>` - Add bonus invites\n`/resetinvites <user>` - Reset invites', inline: false },
        { name: '📢 Utility', value: '`/announce` - Send announcement', inline: false }
      );

    await interaction.reply({ embeds: [userEmbed, staffEmbed], ephemeral: true });
  } else {
    await interaction.reply({ embeds: [userEmbed], ephemeral: true });
  }
}

async function handleInvites(interaction) {
  const targetUser = interaction.options.getUser('user');
  const checkUser = targetUser || interaction.user;

  if (targetUser && !isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Only staff can check others\' invites!', ephemeral: true });
  }

  const count = userInvites.get(checkUser.id) || 0;
  const needed = CONFIG.MIN_INVITES;
  const canJoin = count >= needed;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🔗 Invites - ${checkUser.username}`)
    .setColor(canJoin ? '#00ff00' : '#ff9900')
    .addFields(
      { name: '📊 Total Invites', value: `**${count}**`, inline: true },
      { name: '✅ Required', value: `**${needed}**`, inline: true },
      { name: '🎮 Tournament Entry', value: canJoin ? '✅ **FREE ENTRY!**' : `❌ Invite ${needed - count} more`, inline: true }
    )
    .setDescription(canJoin ? '🎉 You can join tournaments for FREE!' : `💡 **How to get invites:**\n1️⃣ Copy server invite link\n2️⃣ Share with friends\n3️⃣ Get ${needed - count} more people to join\n4️⃣ Enjoy free tournament entry!`)
    .setThumbnail(checkUser.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Use -i for quick check!' });

  await interaction.reply({ embeds: [embed], ephemeral: !targetUser });
}

async function handleStats(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const stats = userStats.get(targetUser.id) || { wins: 0, topThree: 0, tournaments: 0 };
  const invites = userInvites.get(targetUser.id) || 0;
  const warns = warnings.get(targetUser.id)?.length || 0;

  const winRate = stats.tournaments > 0 ? ((stats.wins / stats.tournaments) * 100).toFixed(1) : 0;
  const topRate = stats.tournaments > 0 ? ((stats.topThree / stats.tournaments) * 100).toFixed(1) : 0;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`📊 ${targetUser.username}'s Stats`)
    .setColor('#9b59b6')
    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '🏆 Total Wins', value: `**${stats.wins}**`, inline: true },
      { name: '🥇 Top 3 Finishes', value: `**${stats.topThree}**`, inline: true },
      { name: '🎮 Tournaments', value: `**${stats.tournaments}**`, inline: true },
      { name: '📈 Win Rate', value: `**${winRate}%**`, inline: true },
      { name: '🎯 Top 3 Rate', value: `**${topRate}%**`, inline: true },
      { name: '🔗 Invites', value: `**${invites}**`, inline: true },
      { name: '⚠️ Warnings', value: `**${warns}**`, inline: true },
      { name: '🚫 Status', value: bannedUsers.has(targetUser.id) ? '❌ Blocked' : '✅ Active', inline: true }
    )
    .setFooter({ text: 'Keep playing to improve!' });

  await interaction.reply({ embeds: [embed] });
}

async function handleTournament(interaction) {
  if (!activeTournament) {
    const embed = new Discord.EmbedBuilder()
      .setTitle('❌ No Active Tournament')
      .setDescription(`Bhai abhi koi tournament nahi hai!\n\n📅 Next tournament ke liye check karo:\n<#${CONFIG.TOURNAMENT_SCHEDULE}>`)
      .setColor('#ff0000')
      .setThumbnail(CONFIG.QR_IMAGE);
    
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const embed = createTournamentEmbed(activeTournament);
  await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction) {
  await interaction.deferReply();

  const sorted = Array.from(userStats.entries())
    .sort((a, b) => {
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      if (b[1].topThree !== a[1].topThree) return b[1].topThree - a[1].topThree;
      return b[1].tournaments - a[1].tournaments;
    })
    .slice(0, 15);

  if (sorted.length === 0) {
    return interaction.editReply('❌ No tournament data yet! Be the first champion! 🏆');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 OTO Champions Leaderboard')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, stats], i) => {
        const medals = ['👑', '🥈', '🥉'];
        const medal = medals[i] || `**${i + 1}.**`;
        return `${medal} <@${userId}>\n   🏆 ${stats.wins} Wins | 🥇 ${stats.topThree} Top 3 | 🎮 ${stats.tournaments} Played`;
      }).join('\n\n')
    )
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: 'Play more to reach the top!' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleRules(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('📋 OTO TOURNAMENT RULES')
    .setDescription(CONFIG.RULES)
    .setColor('#e74c3c')
    .addFields(
      { name: '📢 Important Channels', value: `<#${CONFIG.ANNOUNCEMENT_CHANNEL}> - Updates\n<#${CONFIG.TOURNAMENT_SCHEDULE}> - Schedule\n<#${CONFIG.HOW_TO_JOIN}> - How to Join\n<#${CONFIG.RULES_CHANNEL}> - Rules` },
      { name: '🎫 Need Help?', value: `Open ticket: <#${CONFIG.OPEN_TICKET}>` },
      { name: '⚠️ Breaking Rules', value: 'Warning → Timeout → Block' }
    )
    .setImage(CONFIG.QR_IMAGE)
    .setFooter({ text: 'Follow rules to enjoy tournaments!' });

  await interaction.reply({ embeds: [embed] });
}

async function handlePing(interaction) {
  const ping = client.ws.ping;
  const embed = new Discord.EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setDescription(`**Bot Latency:** ${ping}ms\n**API Response:** ${Date.now() - interaction.createdTimestamp}ms`)
    .setColor(ping < 100 ? '#00ff00' : ping < 200 ? '#ff9900' : '#ff0000')
    .setFooter({ text: ping < 100 ? 'Super fast! ⚡' : ping < 200 ? 'Good speed! 👍' : 'A bit slow... 🐌' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ===== STAFF TOURNAMENT COMMANDS =====
async function handleCreate(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (activeTournament && activeTournament.status !== 'ended') {
    return interaction.editReply('❌ Tournament already active! End it first.');
  }

  // Show tournament creation menu with dropdowns
  const embed = new Discord.EmbedBuilder()
    .setTitle('🎮 Create New Tournament')
    .setDescription('Select tournament options below:')
    .setColor('#3498db')
    .addFields(
      { name: '📝 Steps', value: '1️⃣ Select tournament type\n2️⃣ Choose entry fee\n3️⃣ Set prize distribution\n4️⃣ Select map\n5️⃣ Set slots\n6️⃣ Confirm and create!' }
    );

  const row1 = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('tournament_type')
      .setPlaceholder('🎮 Select Tournament Type')
      .addOptions([
        { label: 'Solo Squad', value: 'solo_squad', emoji: '👤', description: '1 player per team' },
        { label: 'Duo', value: 'duo', emoji: '👥', description: '2 players per team' },
        { label: 'Squad', value: 'squad', emoji: '👨‍👩‍👦‍👦', description: '4 players per team' },
        { label: 'Custom', value: 'custom', emoji: '⚙️', description: 'Custom format' },
      ])
  );

  const row2 = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('entry_fee')
      .setPlaceholder('💰 Select Entry Fee')
      .addOptions([
        { label: 'Free Entry', value: 'free', emoji: '🎁', description: 'No entry fee' },
        { label: '₹10 Entry', value: '10', emoji: '💵', description: '₹10 per player' },
        { label: '₹20 Entry', value: '20', emoji: '💵', description: '₹20 per player' },
        { label: '₹50 Entry', value: '50', emoji: '💵', description: '₹50 per player' },
        { label: '₹100 Entry', value: '100', emoji: '💵', description: '₹100 per player' },
        { label: 'Custom Amount', value: 'custom', emoji: '⚙️', description: 'Set custom fee' },
      ])
  );

  const row3 = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('prize_distribution')
      .setPlaceholder('🏆 Select Prize Distribution')
      .addOptions([
        { label: 'Winner Takes All', value: 'winner_all', emoji: '👑', description: '100% to 1st place' },
        { label: 'Top 3 Split', value: 'top3', emoji: '🥇', description: '60% / 25% / 15%' },
        { label: 'Top 5 Split', value: 'top5', emoji: '🏅', description: '50% / 25% / 15% / 7% / 3%' },
        { label: 'Top 10 Split', value: 'top10', emoji: '🎯', description: 'Prize for top 10' },
        { label: 'Custom Split', value: 'custom', emoji: '⚙️', description: 'Set custom distribution' },
      ])
  );

  await interaction.editReply({ embeds: [embed], components: [row1, row2, row3] });
}

async function handleStart(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No tournament to start!');
  }

  if (activeTournament.status === 'live') {
    return interaction.editReply('⚠️ Tournament already live!');
  }

  const roomId = interaction.options.getString('roomid');
  const password = interaction.options.getString('password');

  activeTournament.status = 'live';
  activeTournament.roomId = roomId;
  activeTournament.roomPassword = password;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${activeTournament.title} - LIVE NOW!`)
    .setColor('#00ff00')
    .setDescription(`${CONFIG.RULES}\n\n**🚨 TOURNAMENT STARTED! JOIN NOW!**`)
    .addFields(
      { name: '🆔 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: password ? `\`\`\`${password}\`\`\`` : '❌ No password', inline: false },
      { name: '👥 Players', value: `${registeredPlayers.size}/${activeTournament.maxSlots}`, inline: true },
      { name: '💰 Prize', value: `${activeTournament.prizePool}`, inline: true },
      { name: '🗺️ Map', value: activeTournament.map || 'TBA', inline: true }
    )
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: '⚠️ Join room NOW! Late entries not allowed!' })
    .setTimestamp();

  const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await channel.send({ content: '@everyone\n\n🚨 **TOURNAMENT STARTING NOW!**', embeds: [embed] });

  // DM all registered players
  for (const [userId] of registeredPlayers.entries()) {
    try {
      const user = await client.users.fetch(userId);
      await user.send({
        content: `🎮 **${activeTournament.title}** is LIVE!\n\n🆔 Room: \`${roomId}\`\n🔐 Pass: ${password || 'None'}\n\n⚡ JOIN NOW! Good luck bhai! 🍀`,
        embeds: [embed]
      });
    } catch (err) {}
  }

  await interaction.editReply('✅ Tournament started! Room details sent to all players! 🔥');
}

async function handleEnd(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament!');
  }

  // Show winner selection menu
  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Select Winners')
    .setDescription(`Select top 3 players from **${activeTournament.title}**\n\n📊 Registered Players: ${registeredPlayers.size}`)
    .setColor('#ffd700');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('select_winners')
      .setLabel('🏆 Select Winners')
      .setStyle(Discord.ButtonStyle.Success)
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleCancel(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament!');
  }

  const reason = interaction.options.getString('reason') || 'Technical issues';

  const embed = new Discord.EmbedBuilder()
    .setTitle('❌ Tournament Cancelled')
    .setDescription(`**${activeTournament.title}** has been cancelled.\n\n**Reason:** ${reason}\n\nSorry for inconvenience bhai! Next tournament jaldi aayega! 🙏`)
    .setColor('#ff0000')
    .setTimestamp();

  const channel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await channel.send({ embeds: [embed] });

  activeTournament = null;
  registeredPlayers.clear();

  await interaction.editReply(`✅ Tournament cancelled. Reason: ${reason}`);
}

// ===== PLAYER MANAGEMENT =====
async function handleAdd(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ No tournament in registration!');
  }

  if (registeredPlayers.has(user.id)) {
    return interaction.editReply('⚠️ Player already registered!');
  }

  if (registeredPlayers.size >= activeTournament.maxSlots) {
    return interaction.editReply('❌ Tournament full!');
  }

  registeredPlayers.set(user.id, {
    user,
    joinedAt: new Date(),
    approved: true,
    addedByStaff: true
  });

  try {
    await user.send(`✅ You were manually added to **${activeTournament.title}** by staff!\n\n⏰ Starts: ${activeTournament.scheduledTime}\n💰 Prize: ${activeTournament.prizePool}\n\nGood luck bro! 🍀`);
  } catch (err) {}

  await interaction.editReply(`✅ Added ${user.tag} to tournament! Total: ${registeredPlayers.size}/${activeTournament.maxSlots}`);
}

async function handleRemove(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'Removed by staff';

  if (!registeredPlayers.has(user.id)) {
    return interaction.editReply('❌ Player not registered!');
  }

  registeredPlayers.delete(user.id);

  try {
    await user.send(`👢 You were removed from **${activeTournament?.title || 'the tournament'}**\n\n**Reason:** ${reason}`);
  } catch (err) {}

  await interaction.editReply(`✅ Removed ${user.tag}. Reason: ${reason}`);
}

async function handleBlock(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  bannedUsers.add(user.id);
  registeredPlayers.delete(user.id);

  try {
    await user.send(`🚫 You are BLOCKED from OTO tournaments!\n\n**Reason:** ${reason}\n\nContact admins for appeal.`);
  } catch (err) {}

  await interaction.editReply(`✅ Blocked ${user.tag} from all tournaments.\n**Reason:** ${reason}`);
}

async function handleUnblock(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  if (!bannedUsers.has(user.id)) {
    return interaction.editReply('⚠️ User not blocked!');
  }

  bannedUsers.delete(user.id);

  try {
    await user.send(`✅ You are UNBLOCKED from OTO tournaments!\n\nWelcome back bro! Follow rules this time! 💪`);
  } catch (err) {}

  await interaction.editReply(`✅ Unblocked ${user.tag}!`);
}

async function handleParticipants(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (registeredPlayers.size === 0) {
    return interaction.editReply('❌ No participants yet!');
  }

  let msg = `👥 **Tournament Participants (${registeredPlayers.size}/${activeTournament?.maxSlots || '?'})**\n\n`;
  let count = 0;

  for (const [userId, data] of registeredPlayers.entries()) {
    count++;
    const invites = userInvites.get(userId) || 0;
    msg += `${count}. <@${userId}> - ${invites} invites${data.addedByStaff ? ' (Staff added)' : ''}\n`;
    
    if (msg.length > 1800) {
      await interaction.editReply(msg);
      msg = '';
    }
  }

  if (msg) await interaction.editReply(msg);
}

// ===== MODERATION =====
async function handleWarn(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  const userWarns = warnings.get(user.id) || [];
  userWarns.push({ reason, date: new Date(), by: interaction.user.tag });
  warnings.set(user.id, userWarns);

  try {
    await user.send(`⚠️ **WARNING!**\n\n**Reason:** ${reason}\n**Total Warnings:** ${userWarns.length}\n\n⚠️ 3 warnings = Auto block!`);
  } catch (err) {}

  await interaction.editReply(`✅ Warned ${user.tag} (Total: ${userWarns.length})`);

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
      await user.send(`⏱️ You are TIMED OUT for **${minutes} minutes**!\n\n**Reason:** ${reason}`);
    } catch (err) {}

    await interaction.editReply(`✅ Timed out ${user.tag} for ${minutes} minutes.`);
  } catch (err) {
    await interaction.editReply(`❌ Failed to timeout. Error: ${err.message}`);
  }
}

// ===== INVITE MANAGEMENT =====
async function handleAddInvites(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('amount');

  const current = userInvites.get(user.id) || 0;
  userInvites.set(user.id, current + amount);

  try {
    await user.send(`🎁 **BONUS INVITES!**\n\nYou got **${amount} bonus invites**!\n\nTotal: **${current + amount}** ✨`);
  } catch (err) {}

  await interaction.editReply(`✅ Added ${amount} invites to ${user.tag}! New total: ${current + amount}`);
}

async function handleResetInvites(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');
  
  const old = userInvites.get(user.id) || 0;
  userInvites.set(user.id, 0);

  await interaction.editReply(`✅ Reset invites for ${user.tag}\nOld: ${old} → New: 0`);
}

async function handleTopInviters(interaction) {
  await interaction.deferReply();

  const sorted = Array.from(userInvites.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  if (sorted.length === 0) {
    return interaction.editReply('❌ No invite data yet!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏅 Top Inviters - OTO')
    .setColor('#ffd700')
    .setDescription(
      sorted.map(([userId, count], i) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[i] || `${i + 1}.`;
        return `${medal} <@${userId}> - **${count}** invites`;
      }).join('\n')
    )
    .setFooter({ text: 'Keep inviting to get rewards!' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

// ===== UTILITY =====
async function handleAnnounce(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const message = interaction.options.getString('message');
  const channelType = interaction.options.getString('channel');
  const ping = interaction.options.getBoolean('ping') || false;

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

  await channel.send({ content: ping ? '@everyone' : '', embeds: [embed] });
  await interaction.editReply(`✅ Announcement sent to <#${channelId}>!`);
}

async function handleHistory(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  let limit = interaction.options.getInteger('limit') || 5;
  if (limit < 1) limit = 1;
  if (limit > 10) limit = 10;

  if (tournamentHistory.length === 0) {
    return interaction.editReply('❌ No tournament history yet!');
  }

  const history = tournamentHistory.slice(0, limit);
  const embed = new Discord.EmbedBuilder()
    .setTitle('📜 Tournament History')
    .setColor('#3498db')
    .setDescription(
      history.map((t, i) => {
        const winners = t.winners?.map(w => w.username).join(', ') || 'N/A';
        return `**${i + 1}. ${t.title}**\n💰 ${t.prizePool} | 👥 ${t.participants?.length || 0} players\n🏆 ${winners}`;
      }).join('\n\n')
    )
    .setFooter({ text: `Showing ${history.length} of ${tournamentHistory.length}` });

  await interaction.editReply({ embeds: [embed] });
}

async function handleCloseTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const channel = interaction.channel;
  const reason = interaction.options.getString('reason') || 'Resolved';

  if (!channel.name.startsWith('ticket-')) {
    return interaction.editReply('❌ This only works in ticket channels!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🔒 Ticket Closing')
    .setDescription(`Closing in 5 seconds...\n\n**Reason:** ${reason}\n**Closed by:** ${interaction.user.tag}`)
    .setColor('#ff0000');

  await interaction.editReply({ embeds: [embed] });

  setTimeout(async () => {
    try {
      await channel.delete();
      tickets.delete(channel.id);
    } catch (err) {}
  }, 5000);
}

// ==================== BUTTON HANDLERS ====================
async function handleButton(interaction) {
  const { customId } = interaction;

  if (customId === 'join_tournament') {
    await handleJoinButton(interaction);
  } else if (customId === 'create_ticket') {
    await handleCreateTicket(interaction);
  } else if (customId === 'select_winners') {
    await handleSelectWinners(interaction);
  }
}

async function handleJoinButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ Registration closed bhai!');
  }

  if (registeredPlayers.has(interaction.user.id)) {
    return interaction.editReply('⚠️ Already registered! Relax bro! 😎');
  }

  if (registeredPlayers.size >= activeTournament.maxSlots) {
    return interaction.editReply('❌ Tournament FULL! Next time bhai! 😢');
  }

  if (bannedUsers.has(interaction.user.id)) {
    return interaction.editReply('🚫 You are blocked from tournaments!');
  }

  const inviteCount = userInvites.get(interaction.user.id) || 0;
  if (inviteCount < CONFIG.MIN_INVITES && !isStaff(interaction.member)) {
    const embed = new Discord.EmbedBuilder()
      .setTitle('❌ Not Enough Invites!')
      .setDescription(
        `Bhai, tournament join karne ke liye **${CONFIG.MIN_INVITES} invites** chahiye!\n\n` +
        `**Your Invites:** ${inviteCount}/${CONFIG.MIN_INVITES}\n` +
        `**Need:** ${CONFIG.MIN_INVITES - inviteCount} more\n\n` +
        `💡 **How to get invites:**\n` +
        `1️⃣ Copy server invite link\n` +
        `2️⃣ Share with ${CONFIG.MIN_INVITES - inviteCount} friends\n` +
        `3️⃣ They join server\n` +
        `4️⃣ You get FREE tournament entry! 🎉`
      )
      .setColor('#ff0000')
      .setFooter({ text: 'Use -i to check invites anytime!' });

    return interaction.editReply({ embeds: [embed] });
  }

  registeredPlayers.set(interaction.user.id, {
    user: interaction.user,
    joinedAt: new Date(),
    approved: true
  });

  updatePlayerStats(interaction.user.id, { tournaments: 1 });

  const embed = new Discord.EmbedBuilder()
    .setTitle('✅ Registration Successful!')
    .setDescription(`**${activeTournament.title}** mein registered ho gaye bhai! 🎉`)
    .setColor('#00ff00')
    .addFields(
      { name: '⏰ Start Time', value: activeTournament.scheduledTime, inline: true },
      { name: '💰 Prize', value: `${activeTournament.prizePool}`, inline: true },
      { name: '📊 Your Position', value: `${registeredPlayers.size}/${activeTournament.maxSlots}`, inline: true }
    )
    .setFooter({ text: 'Room details will be DMed when tournament starts!' });

  await interaction.editReply({ embeds: [embed] });

  try {
    await interaction.user.send({
      content: `🎮 **Registration Confirmed!**\n\n${activeTournament.title}\n⏰ ${activeTournament.scheduledTime}\n💰 ${activeTournament.prizePool}\n\nBas wait karo, room details DM mein milegi! All the best bhai! 🍀`,
      embeds: [embed]
    });
  } catch (err) {}
}

async function handleCreateTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  // Check existing ticket
  for (const [channelId, data] of tickets.entries()) {
    if (data.userId === interaction.user.id) {
      return interaction.editReply(`⚠️ You already have a ticket: <#${channelId}>`);
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
      .setTitle('🎫 Support Ticket Created')
      .setDescription(
        `Hello ${interaction.user}!\n\n` +
        `Staff will help you shortly. Please explain your issue clearly!\n\n` +
        `**Common Issues:**\n` +
        `• Tournament registration problems\n` +
        `• Invite count issues\n` +
        `• Report players\n` +
        `• General queries`
      )
      .setColor('#3498db')
      .setFooter({ text: 'Be patient! Staff will respond soon.' });

    await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.STAFF_ROLE}>`, embeds: [embed] });
    await interaction.editReply(`✅ Ticket created! <#${ticketChannel.id}>`);
  } catch (err) {
    await interaction.editReply('❌ Could not create ticket! Contact staff directly.');
  }
}

async function handleSelectWinners(interaction) {
  await interaction.deferUpdate();

  if (!activeTournament) {
    return;
  }

  // Create a modal or use buttons to select winners
  const participants = Array.from(registeredPlayers.values()).slice(0, 25);
  
  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Select 1st Place Winner')
    .setDescription('Select the champion:')
    .setColor('#ffd700');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('winner_first')
      .setPlaceholder('Select 1st Place')
      .addOptions(
        participants.map((p, i) => ({
          label: p.user.username,
          value: p.user.id,
          description: `Position ${i + 1}`
        }))
      )
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

// ==================== SELECT MENU HANDLERS ====================
async function handleSelectMenu(interaction) {
  const { customId, values } = interaction;

  if (customId === 'tournament_type') {
    await interaction.deferUpdate();
    // Store selection and continue creation flow
    const type = values[0];
    const typeNames = {
      'solo_squad': 'Solo Squad',
      'duo': 'Duo',
      'squad': 'Squad',
      'custom': 'Custom'
    };
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('✅ Tournament Type Selected')
      .setDescription(`Selected: **${typeNames[type]}**\n\nNow select entry fee from the menu above!`)
      .setColor('#00ff00');
    
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  } else if (customId === 'winner_first') {
    await handleWinnerSelection(interaction, values[0], 1);
  }
}

async function handleWinnerSelection(interaction, winnerId, place) {
  await interaction.deferUpdate();

  if (place === 1) {
    // After selecting 1st, show 2nd place selection
    const participants = Array.from(registeredPlayers.values())
      .filter(p => p.user.id !== winnerId)
      .slice(0, 25);

    const embed = new Discord.EmbedBuilder()
      .setTitle('🥈 Select 2nd Place Winner')
      .setDescription(`1st Place: <@${winnerId}>\n\nSelect 2nd place:`)
      .setColor('#c0c0c0');

    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.StringSelectMenuBuilder()
        .setCustomId(`winner_second_${winnerId}`)
        .setPlaceholder('Select 2nd Place')
        .addOptions(
          participants.map((p, i) => ({
            label: p.user.username,
            value: p.user.id,
            description: `Position ${i + 1}`
          }))
        )
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
}

// ==================== MESSAGE HANDLER - AUTO RESPONSES ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Quick invite check command: -i
  if (content === '-i' && message.channel.id === CONFIG.GENERAL_CHAT) {
    const count = userInvites.get(message.author.id) || 0;
    const needed = CONFIG.MIN_INVITES;
    const canJoin = count >= needed;

    return message.reply(
      `🔗 **Your Invites:** ${count}/${needed}\n` +
      `${canJoin ? '✅ You can join tournaments for FREE!' : `❌ Invite ${needed - count} more people to get free entry!`}\n\n` +
      `Type \`/invites\` for detailed info!`
    );
  }

  // Only auto-respond in general chat
  if (message.channel.id !== CONFIG.GENERAL_CHAT) return;

  // Check for keywords and respond
  for (const [keyword, responses] of Object.entries(CONFIG.AUTO_RESPONSES)) {
    if (content.includes(keyword)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(response);
      return;
    }
  }

  // Advanced contextual responses
  if ((content.includes('room') || content.includes('id')) && (content.includes('kya') || content.includes('what'))) {
    if (activeTournament && activeTournament.status === 'live' && activeTournament.roomId) {
      if (registeredPlayers.has(message.author.id)) {
        await message.reply(
          `🎮 **Room Details:**\n\n` +
          `🆔 ID: \`${activeTournament.roomId}\`\n` +
          `🔐 Password: ${activeTournament.roomPassword || 'No password'}\n\n` +
          `Join quickly bro! ⚡`
        );
      } else {
        await message.reply('❌ Only registered players can see room details! Register next time bhai!');
      }
    } else {
      await message.reply('No tournament live right now. Check <#' + CONFIG.TOURNAMENT_SCHEDULE + '> for schedule!');
    }
  }
});

// ==================== MEMBER JOIN - INVITE TRACKING ====================
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

      // Funny welcome message
      const welcomeMsg = CONFIG.WELCOME_MESSAGES[Math.floor(Math.random() * CONFIG.WELCOME_MESSAGES.length)]
        .replace('{user}', `${member}`);

      const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
      await channel.send(
        `${welcomeMsg}\n💫 Invited by: <@${usedInvite.inviter.id}> (Total: **${current + 1}** invites) 🔥`
      );

      // DM the inviter
      try {
        const inviter = await client.users.fetch(usedInvite.inviter.id);
        await inviter.send(
          `🎉 **New Invite Credited!**\n\n` +
          `${member.user.tag} joined using your link!\n\n` +
          `**Total Invites:** ${current + 1}\n` +
          `${current + 1 >= CONFIG.MIN_INVITES ? '✅ FREE TOURNAMENT ENTRY UNLOCKED! 🎮' : `Need ${CONFIG.MIN_INVITES - current - 1} more for free entry!`}`
        );
      } catch (err) {}

      // Check if first time user
      if (!firstTimeUsers.has(member.id)) {
        firstTimeUsers.add(member.id);
        
        // DM welcome message to new member
        setTimeout(async () => {
          try {
            const welcomeEmbed = new Discord.EmbedBuilder()
              .setTitle('🎉 Welcome to OTO Tournament!')
              .setDescription(
                `Hey ${member.user.username}! 👋\n\n` +
                `**Get Started:**\n` +
                `1️⃣ Invite **2 people** to get FREE tournament entry!\n` +
                `2️⃣ Check <#${CONFIG.HOW_TO_JOIN}> for full guide\n` +
                `3️⃣ Read rules in <#${CONFIG.RULES_CHANNEL}>\n` +
                `4️⃣ Watch <#${CONFIG.ANNOUNCEMENT_CHANNEL}> for tournaments\n\n` +
                `**Quick Commands:**\n` +
                `• Type \`-i\` in general chat to check invites\n` +
                `• Use \`/help\` to see all commands\n` +
                `• Use \`/tournament\` to see active tournament\n\n` +
                `💰 Big prizes daily! Good luck bro! 🏆`
              )
              .setColor('#3498db')
              .setThumbnail(CONFIG.QR_IMAGE)
              .setFooter({ text: 'Invite 2 people = FREE ENTRY! 🎁' });

            await member.send({ embeds: [welcomeEmbed] });
          } catch (err) {
            console.log(`Could not DM ${member.user.tag}`);
          }
        }, 3000);
      }
    }

    // Update cache
    newInvites.forEach(inv => inviteCache.set(inv.code, inv.uses));

  } catch (err) {
    console.error('Invite tracking error:', err);
  }
});

// ==================== MEMBER LEAVE ====================
client.on('guildMemberRemove', async (member) => {
  try {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    
    const decreasedInvite = newInvites.find(inv => {
      const cached = inviteCache.get(inv.code) || 0;
      return inv.uses < cached;
    });

    if (decreasedInvite && decreasedInvite.inviter) {
      inviteCache.set(decreasedInvite.code, decreasedInvite.uses);
      
      const current = userInvites.get(decreasedInvite.inviter.id) || 0;
      if (current > 0) {
        userInvites.set(decreasedInvite.inviter.id, current - 1);
      }
    }

    // Funny leave message
    const leaveMsg = CONFIG.LEAVE_MESSAGES[Math.floor(Math.random() * CONFIG.LEAVE_MESSAGES.length)]
      .replace('{user}', member.user.username);

    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    await channel.send(leaveMsg);

    // Update cache
    newInvites.forEach(inv => inviteCache.set(inv.code, inv.uses));

    // Remove from active tournament if registered
    if (registeredPlayers.has(member.id)) {
      registeredPlayers.delete(member.id);
      
      if (activeTournament && activeTournament.status === 'registration') {
        const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS);
        await staffChannel.send(
          `⚠️ <@${member.id}> left the server and was removed from **${activeTournament.title}**\n` +
          `Current players: ${registeredPlayers.size}/${activeTournament.maxSlots}`
        );
      }
    }

  } catch (err) {
    console.error('Member leave error:', err);
  }
});

// ==================== HELPER FUNCTIONS ====================
async function initializeInviteTracking() {
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) {
          inviteCache.set(inv.code, inv.uses);
          const current = userInvites.get(inv.inviter.id) || 0;
          userInvites.set(inv.inviter.id, current + inv.uses);
        }
      });
      console.log(`✅ Cached ${invites.size} invites for ${guild.name}`);
    } catch (err) {
      console.warn(`⚠️ Could not fetch invites for ${guild.name}`);
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
      { name: '💰 Prize Pool', value: `**${tournament.prizePool}**`, inline: true },
      { name: '⏰ Time', value: `**${tournament.scheduledTime}**`, inline: true },
      { name: '📊 Slots', value: `**${registeredPlayers.size}/${tournament.maxSlots}**`, inline: true }
    );

  if (tournament.map) {
    embed.addFields({ name: '🗺️ Map', value: `**${tournament.map}**`, inline: true });
  }

  if (tournament.entryFee) {
    embed.addFields({ name: '💵 Entry Fee', value: `**${tournament.entryFee}**`, inline: true });
  }

  if (tournament.type) {
    embed.addFields({ name: '🎮 Type', value: `**${tournament.type}**`, inline: true });
  }

  if (tournament.status === 'registration') {
    embed.addFields({ 
      name: '📈 Registration Progress', 
      value: progress, 
      inline: false 
    });
    embed.addFields({ 
      name: '🔗 Requirements', 
      value: `Minimum **${CONFIG.MIN_INVITES} invites** required to join\nUse \`-i\` to check your invites!`, 
      inline: false 
    });
  }

  if (tournament.status === 'live' && tournament.roomId) {
    embed.addFields(
      { name: '🆔 Room ID', value: `\`\`\`${tournament.roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: tournament.roomPassword ? `\`\`\`${tournament.roomPassword}\`\`\`` : '❌ No password', inline: false }
    );
  }

  embed.setThumbnail(CONFIG.QR_IMAGE);
  embed.setFooter({ text: `Tournament ID: ${tournament.id}` });
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

// ==================== PERSISTENT MESSAGES ====================
async function setupPersistentMessages() {
  try {
    // How to join channel
    const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
    const joinEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 HOW TO JOIN OTO TOURNAMENTS')
      .setDescription(
        `**Follow these simple steps:**\n\n` +
        `1️⃣ **Get Invites:**\n` +
        `   • Share server invite link with friends\n` +
        `   • Get minimum **${CONFIG.MIN_INVITES} people** to join\n` +
        `   • Type \`-i\` in <#${CONFIG.GENERAL_CHAT}> to check\n\n` +
        `2️⃣ **Watch for Tournaments:**\n` +
        `   • Check <#${CONFIG.ANNOUNCEMENT_CHANNEL}> daily\n` +
        `   • See schedule in <#${CONFIG.TOURNAMENT_SCHEDULE}>\n\n` +
        `3️⃣ **Register:**\n` +
        `   • Click **JOIN** button when tournament is announced\n` +
        `   • Wait for confirmation DM\n\n` +
        `4️⃣ **Play & Win:**\n` +
        `   • Get room details in DM when tournament starts\n` +
        `   • Join room on time\n` +
        `   • Play fair and win big! 💰\n\n` +
        `**Important:**\n` +
        `✅ Read rules: <#${CONFIG.RULES_CHANNEL}>\n` +
        `✅ Quick invite check: Type \`-i\` in general\n` +
        `✅ Need help? Ticket: <#${CONFIG.OPEN_TICKET}>\n` +
        `✅ Commands: Type \`/help\``
      )
      .setColor('#3498db')
      .setImage(CONFIG.QR_IMAGE)
      .setFooter({ text: 'Good luck bhai! 🍀' });

    const messages = await howToJoinChannel.messages.fetch({ limit: 5 });
    const botMsgs = messages.filter(m => m.author.id === client.user.id);
    if (botMsgs.size === 0) {
      await howToJoinChannel.send({ embeds: [joinEmbed] });
      console.log('✅ Posted how-to-join guide');
    }

    // Ticket channel
    const ticketChannel = await client.channels.fetch(CONFIG.OPEN_TICKET);
    const ticketEmbed = new Discord.EmbedBuilder()
      .setTitle('🎫 SUPPORT TICKETS')
      .setDescription(
        `Need help? Create a support ticket!\n\n` +
        `**We can help with:**\n` +
        `• Tournament registration issues\n` +
        `• Invite count problems\n` +
        `• Report rule breakers\n` +
        `• General questions\n` +
        `• Technical support\n\n` +
        `**Click the button below to open a ticket!**`
      )
      .setColor('#9b59b6')
      .setFooter({ text: 'Staff will respond ASAP!' });

    const ticketButton = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('📩 Create Ticket')
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji('🎫')
    );

    const ticketMsgs = await ticketChannel.messages.fetch({ limit: 5 });
    const ticketBotMsgs = ticketMsgs.filter(m => m.author.id === client.user.id);
    if (ticketBotMsgs.size === 0) {
      await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketButton] });
      console.log('✅ Posted ticket system');
    }

    // Rules channel
    const rulesChannel = await client.channels.fetch(CONFIG.RULES_CHANNEL);
    const rulesEmbed = new Discord.EmbedBuilder()
      .setTitle('📋 OTO TOURNAMENT RULES')
      .setDescription(CONFIG.RULES)
      .setColor('#e74c3c')
      .addFields(
        { name: '⚠️ Breaking Rules = Consequences', value: '**1st:** Warning ⚠️\n**2nd:** Timeout ⏱️\n**3rd:** Block from tournaments 🚫', inline: false },
        { name: '✅ Fair Play Policy', value: 'Play clean, respect everyone, have fun! No second chances for cheaters!', inline: false },
        { name: '💡 Pro Tips', value: '• Practice before tournaments\n• Join on time\n• Take screenshots\n• Communicate with staff', inline: false }
      )
      .setImage(CONFIG.QR_IMAGE)
      .setFooter({ text: 'Follow rules = More tournaments = More wins! 🏆' });

    const rulesMsgs = await rulesChannel.messages.fetch({ limit: 5 });
    const rulesBotMsgs = rulesMsgs.filter(m => m.author.id === client.user.id);
    if (rulesBotMsgs.size === 0) {
      await rulesChannel.send({ embeds: [rulesEmbed] });
      console.log('✅ Posted rules');
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
      
      if (remaining === 10 || remaining === 5) {
        const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        await channel.send(
          `🚨 **${remaining === 10 ? 'ONLY 10 SLOTS LEFT' : 'LAST 5 SLOTS'}!** 🚨\n\n` +
          `${activeTournament.title}\n` +
          `💰 Prize: ${activeTournament.prizePool}\n` +
          `⏰ Time: ${activeTournament.scheduledTime}\n\n` +
          `Register NOW: <#${CONFIG.ANNOUNCEMENT_CHANNEL}>! 🔥`
        );
      }
    }
  }, 600000); // 10 minutes

  // Update bot status every 5 minutes
  setInterval(() => {
    if (activeTournament) {
      client.user.setActivity(
        `${activeTournament.title} | ${registeredPlayers.size}/${activeTournament.maxSlots}`, 
        { type: Discord.ActivityType.Competing }
      );
    } else {
      client.user.setActivity('🏆 /help | OTO Tournaments', { type: Discord.ActivityType.Competing });
    }
  }, 300000); // 5 minutes

  // Auto-update leaderboard every hour
  setInterval(async () => {
    await updateLeaderboardChannel();
  }, 3600000); // 1 hour

  console.log('✅ Automated tasks running');
}

// ==================== LEADERBOARD UPDATE ====================
async function updateLeaderboardChannel() {
  try {
    const channel = await client.channels.fetch(CONFIG.LEADERBOARD_CHANNEL);
    
    const topPlayers = Array.from(userStats.entries())
      .sort((a, b) => {
        if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
        return b[1].topThree - a[1].topThree;
      })
      .slice(0, 10);

    const playersEmbed = new Discord.EmbedBuilder()
      .setTitle('🏆 OTO CHAMPIONS')
      .setColor('#ffd700')
      .setDescription(
        topPlayers.length > 0 
          ? topPlayers.map(([userId, stats], i) => {
              const medals = ['👑', '🥈', '🥉'];
              const medal = medals[i] || `${i + 1}.`;
              return `${medal} <@${userId}>\n   🏆 ${stats.wins} | 🥇 ${stats.topThree} | 🎮 ${stats.tournaments}`;
            }).join('\n\n')
          : 'No champions yet! Be the first! 🌟'
      )
      .setFooter({ text: 'Updated hourly' })
      .setTimestamp();

    const topInviters = Array.from(userInvites.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const invitersEmbed = new Discord.EmbedBuilder()
      .setTitle('🏅 TOP INVITERS')
      .setColor('#3498db')
      .setDescription(
        topInviters.length > 0
          ? topInviters.map(([userId, count], i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const medal = medals[i] || `${i + 1}.`;
              return `${medal} <@${userId}> - **${count}** invites`;
            }).join('\n')
          : 'Start inviting to appear here! 🔗'
      );

    const statsEmbed = new Discord.EmbedBuilder()
      .setTitle('📊 SERVER STATS')
      .setColor('#9b59b6')
      .addFields(
        { name: '👥 Members', value: `${channel.guild.memberCount}`, inline: true },
        { name: '🎮 Tournaments', value: `${tournamentHistory.length}`, inline: true },
        { name: '🏆 Active', value: activeTournament ? activeTournament.title : 'None', inline: true },
        { name: '🔗 Total Invites', value: `${Array.from(userInvites.values()).reduce((a, b) => a + b, 0)}`, inline: true },
        { name: '👑 Champions', value: `${userStats.size}`, inline: true },
        { name: '📅 Updated', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      );

    const messages = await channel.messages.fetch({ limit: 10 });
    const botMsgs = messages.filter(m => m.author.id === client.user.id);
    if (botMsgs.size > 0) {
      await channel.bulkDelete(botMsgs).catch(() => {});
    }

    await channel.send({ embeds: [playersEmbed, invitersEmbed, statsEmbed] });
    
  } catch (err) {
    console.error('Leaderboard update error:', err);
  }
}

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('Client error:', err));
client.on('warn', warn => console.warn('Client warning:', warn));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => console.log('✅ Bot login successful'))
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });
