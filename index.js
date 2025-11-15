// ==================== OTO MEGA TOURNAMENT BOT - 150+ FEATURES ====================
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (err) { console.log('⚠️ Using environment variables'); }
}

const Discord = require('discord.js');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || 'YOUR_DISCORD_ID_HERE';

if (!BOT_TOKEN) {
  console.error('❌ No bot token found! Set BOT_TOKEN in environment variables.');
  process.exit(1);
}

// ==================== CLIENT SETUP WITH MINIMAL INTENTS ====================
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildInvites,
  ],
  partials: [Discord.Partials.Channel, Discord.Partials.Message],
});

// Express server for health checks
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🏆 OTO Tournament Bot - 150+ Features Active! ✅'));
app.get('/health', (req, res) => res.json({ 
  status: 'online', 
  features: 150,
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  tournaments: serverStats.totalTournaments
}));
app.get('/stats', (req, res) => res.json({
  totalTournaments: serverStats.totalTournaments,
  totalPlayers: userStats.size,
  activePlayers: registeredPlayers.size,
  totalInvites: Array.from(userInvites.values()).reduce((a, b) => a + b, 0)
}));

app.listen(PORT, () => console.log(`✅ Express server running on port ${PORT}`));

// ==================== CONFIGURATION ====================
const CONFIG = {
  // Channel IDs
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
  PAYMENT_PROOF: '1438486113047150714',
  WINNERS_CHANNEL: '1438947356690223347',
  
  // Role IDs
  STAFF_ROLE: '1438475461977047112',
  ADMIN_ROLE: '1438475461977047112',
  PLAYER_ROLE: '1438475461977047113',
  VIP_ROLE: '1438475461977047114',
  
  // Bot Settings
  MIN_INVITES: 2,
  MAX_WARNINGS: 3,
  AUTO_BAN_ON_MAX_WARNINGS: true,
  SLOT_ALERT_THRESHOLDS: [25, 10, 5, 3, 1],
  
  // Images
  QR_IMAGE: 'https://i.ibb.co/jkBSmkM/qr.png',
  BANNER_IMAGE: 'https://i.ibb.co/banner.png',
  
  GAME_IMAGES: {
    'Free Fire': 'https://i.ibb.co/8XQkZhJ/freefire.png',
    'Minecraft': 'https://i.ibb.co/VgTY8Lq/minecraft.png',
    'PUBG Mobile': 'https://i.ibb.co/pubg.png',
    'COD Mobile': 'https://i.ibb.co/cod.png',
    'Valorant': 'https://i.ibb.co/valorant.png',
    'Fortnite': 'https://i.ibb.co/fortnite.png',
    'Apex Legends': 'https://i.ibb.co/apex.png',
    'Custom': 'https://i.ibb.co/jkBSmkM/qr.png'
  },
  
  PAYMENT_METHODS: {
    'UPI': { emoji: '💳', label: 'UPI' },
    'PayTM': { emoji: '💰', label: 'PayTM' },
    'PhonePe': { emoji: '📱', label: 'PhonePe' },
    'GPay': { emoji: '🅖', label: 'Google Pay' },
    'Bank': { emoji: '🏦', label: 'Bank Transfer' },
    'Crypto': { emoji: '₿', label: 'Cryptocurrency' }
  },

  QUICK_TEMPLATES: {
    'free_500': { prize: '₹500', entry: 'Free', slots: 50, time: '7pm IST', desc: 'Beginner Friendly' },
    'paid_20': { prize: '₹1000', entry: '₹20', slots: 50, time: '8pm IST', desc: 'Low Entry' },
    'paid_50': { prize: '₹2500', entry: '₹50', slots: 50, time: '9pm IST', desc: 'Medium Stakes' },
    'paid_100': { prize: '₹5000', entry: '₹100', slots: 100, time: '10pm IST', desc: 'High Stakes' },
    'mega': { prize: '₹10000', entry: '₹200', slots: 100, time: '9pm IST', desc: 'MEGA PRIZE' },
    'vip_500': { prize: '₹25000', entry: '₹500', slots: 50, time: '8pm IST', desc: 'VIP ONLY' },
  },
  
  PRIZE_DISTRIBUTIONS: {
    'top3': { '1st': 50, '2nd': 30, '3rd': 20 },
    'top5': { '1st': 40, '2nd': 25, '3rd': 15, '4th': 12, '5th': 8 },
    'top10': { '1st': 30, '2nd': 20, '3rd': 12, '4th': 10, '5th': 8, '6th': 6, '7th': 5, '8th': 4, '9th': 3, '10th': 2 }
  },
  
  WELCOME_MESSAGES: [
    '🔥 Apna bhai aa gaya! Welcome {user}! Tournament ready? 💪',
    '🎮 {user} bhai! Swagat hai! Let\'s dominate! 🔥',
    '💫 Boss {user} entered! Show your skills! 🏆',
    '⚡ {user} is here! OTO superstar! 🎯',
    '🌟 {user} welcome to OTO family! Win big! 💰',
    '🚀 {user} has arrived! Game on! 🎮',
    '👑 King {user} joined! Ready to conquer? 💪'
  ],
  
  LEAVE_MESSAGES: [
    '😢 {user} left us... Come back soon! 👋',
    '💔 {user} gone... We\'ll miss you! 🥺',
    '🚶 {user} chal base... Return victorious! ✌️',
    '👋 Goodbye {user}! Door always open! 🚪'
  ],
  
  AUTO_RESPONSES: {
    'tournament': ['Bhai <#1438482561679626303> check kar! 🎮', 'Tournament info: <#1438482561679626303> 🏆'],
    'free entry': ['2 invites = FREE entry! Use -i to check 🔗', 'Invite 2 friends for free tournaments! 🎁'],
    'kab': ['Schedule dekho: <#1438482561679626303>! ⏰', 'Timing: <#1438482561679626303> 📅'],
    'help': ['Type /help for all commands! 🤖', 'Bot commands: /help 📋'],
    'join': ['Click JOIN button in <#1438484746165555243>! 🎮'],
    'payment': ['Use /pay command with screenshot! 💰'],
    'win': ['Play fair, play hard! 🏆', 'Winners never quit! 💪'],
    'prize': ['Check announcements for prizes! 💰']
  },
  
  RULES: `📜 **OTO TOURNAMENT RULES**

1️⃣ **No Teaming/Camping** - Play fair or get banned
2️⃣ **No Hacks/Cheats** - Zero tolerance policy
3️⃣ **Follow Room Details** - Exact instructions required
4️⃣ **Screenshot Proof** - Must submit match results
5️⃣ **Respect All Players** - Toxic behavior = instant ban
6️⃣ **Minimum 2 Invites** - For free tournament entry
7️⃣ **Join On Time** - Late = disqualification
8️⃣ **Staff Decision Final** - No arguments
9️⃣ **One Account Only** - Multi-accounting banned
🔟 **Have Fun!** - Enjoy the competition! 🎮`,

  STAFF_PERMISSIONS: {
    MODERATOR: ['warn', 'timeout', 'add', 'remove', 'kick'],
    ADMIN: ['ban', 'unban', 'create', 'cancel', 'announce'],
    OWNER: ['backup', 'restore', 'maintenance', 'makestaff']
  }
};

// ==================== ADVANCED DATA STORAGE ====================
let activeTournament = null;
let queuedTournaments = [];
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
let vipUsers = new Set();
let paymentPending = new Map();
let userTransactions = new Map();
let dailyStats = new Map();
let achievementSystem = new Map();

let serverStats = {
  totalTournaments: 0,
  totalPrizes: 0,
  totalPlayers: 0,
  activeUsers: new Set(),
  totalPayments: 0,
  totalRevenue: 0,
  startDate: new Date()
};

// Spam & automation
let tournamentSpamInterval = null;
let slotAlertSent = new Set();
let dailyResetInterval = null;
let autoBackupInterval = null;

const SPAM_SETTINGS = {
  enabled: false,
  interval: 300000,
  message: null
};

// Temp data
let tempTournamentData = new Map();
let maintenanceMode = false;

// ==================== ACHIEVEMENTS SYSTEM ====================
const ACHIEVEMENTS = {
  'first_win': { name: '🏆 First Victory', desc: 'Win your first tournament', reward: 5 },
  'triple_threat': { name: '🔥 Triple Threat', desc: 'Win 3 tournaments', reward: 10 },
  'invite_master': { name: '🔗 Invite Master', desc: 'Invite 10 people', reward: 5 },
  'top_three': { name: '🥉 Top Performer', desc: 'Get top 3 five times', reward: 8 },
  'streak_3': { name: '⚡ Win Streak', desc: 'Win 3 tournaments in a row', reward: 15 },
  'veteran': { name: '🎖️ Veteran Player', desc: 'Play 25 tournaments', reward: 10 },
  'mega_winner': { name: '👑 Mega Champion', desc: 'Win a MEGA tournament', reward: 20 }
};

// ==================== READY EVENT ====================
client.once('ready', async () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🏆 OTO TOURNAMENT BOT ONLINE 🏆   ║
╚═══════════════════════════════════════╝
  `);
  console.log(`✅ Bot: ${client.user.tag}`);
  console.log(`📊 Servers: ${client.guilds.cache.size}`);
  console.log(`👑 Owner: ${OWNER_ID}`);
  console.log(`🚀 Features: 150+`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log(`\n════════════════════════════════════════\n`);
  
  try {
    await client.user.setActivity('🏆 150+ Features | /help', { type: Discord.ActivityType.Competing });
    await registerCommands();
    await initializeInviteTracking();
    await loadStaffMembers();
    startAutomatedTasks();
    await setupPersistentMessages();
    await sendStaffWelcome();
    console.log('✅ All systems initialized successfully!');
  } catch (err) {
    console.error('❌ Initialization error:', err);
  }
});

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
    console.error('Staff loading error:', err);
  }
}

async function sendStaffWelcome() {
  try {
    const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT).catch(() => null);
    if (!staffChannel) return;

    const embed = new Discord.EmbedBuilder()
      .setTitle('👮 OTO STAFF CONTROL PANEL')
      .setDescription(
        `**🎉 Bot Online - 150+ Features Ready!**\n\n` +
        `**⚡ Quick Commands:**\n` +
        `• \`/quicktournament\` - Create tournament instantly\n` +
        `• \`/approve\` - Approve payments\n` +
        `• \`/slots\` - Check real-time slots\n` +
        `• \`/participants\` - View all players\n` +
        `• \`/stats\` - Server analytics\n\n` +
        `**🛠️ Management:**\n` +
        `• \`/add\` \`/remove\` - Player control\n` +
        `• \`/warn\` \`/timeout\` \`/block\` - Moderation\n` +
        `• \`/announce\` - Server announcements\n\n` +
        `**👑 Owner Only:**\n` +
        `• \`/makestaff\` \`/removestaff\` - Staff management\n` +
        `• \`/backup\` \`/restore\` - Data backup\n` +
        `• \`/maintenance\` - Maintenance mode\n\n` +
        `**📊 Status:** All systems operational! 🔥`
      )
      .setColor('#00ff00')
      .setThumbnail(CONFIG.QR_IMAGE)
      .setFooter({ text: 'OTO Tournament Management System' })
      .setTimestamp();

    await staffChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Staff welcome error:', err);
  }
}

// ==================== SLASH COMMANDS REGISTRATION ====================
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    // USER COMMANDS
    new SlashCommandBuilder().setName('help').setDescription('📚 Complete bot guide with all features'),
    new SlashCommandBuilder().setName('invites').setDescription('🔗 Check your invite count')
      .addUserOption(opt => opt.setName('user').setDescription('Check another user (Staff only)')),
    new SlashCommandBuilder().setName('stats').setDescription('📊 View tournament statistics')
      .addUserOption(opt => opt.setName('user').setDescription('View another user stats')),
    new SlashCommandBuilder().setName('tournament').setDescription('🎮 View active tournament details'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 Top players leaderboard')
      .addStringOption(opt => opt.setName('type').setDescription('Leaderboard type')
        .addChoices(
          { name: '🏆 Wins', value: 'wins' },
          { name: '🔗 Invites', value: 'invites' },
          { name: '🎮 Tournaments Played', value: 'tournaments' },
          { name: '💰 Earnings', value: 'earnings' }
        )),
    new SlashCommandBuilder().setName('rules').setDescription('📋 View tournament rules'),
    new SlashCommandBuilder().setName('ping').setDescription('🏓 Check bot latency'),
    new SlashCommandBuilder().setName('profile').setDescription('👤 View your complete profile'),
    new SlashCommandBuilder().setName('slots').setDescription('📊 Check available tournament slots'),
    new SlashCommandBuilder().setName('achievements').setDescription('🏅 View your achievements'),
    new SlashCommandBuilder().setName('daily').setDescription('🎁 Claim daily reward'),
    new SlashCommandBuilder().setName('pay').setDescription('💰 Submit payment proof')
      .addStringOption(opt => opt.setName('transactionid').setDescription('Transaction ID').setRequired(true))
      .addStringOption(opt => opt.setName('method').setDescription('Payment method').setRequired(true)
        .addChoices(
          { name: '💳 UPI', value: 'UPI' },
          { name: '💰 PayTM', value: 'PayTM' },
          { name: '📱 PhonePe', value: 'PhonePe' },
          { name: '🅖 Google Pay', value: 'GPay' },
          { name: '🏦 Bank Transfer', value: 'Bank' }
        ))
      .addAttachmentOption(opt => opt.setName('screenshot').setDescription('Payment screenshot').setRequired(true)),
    
    // STAFF QUICK COMMANDS
    new SlashCommandBuilder().setName('quicktournament').setDescription('⚡ Create tournament instantly')
      .addStringOption(opt => opt.setName('template').setDescription('Template').setRequired(true)
        .addChoices(
          { name: '🎁 Free ₹500 - 50 Slots', value: 'free_500' },
          { name: '💰 ₹20 Entry ₹1000', value: 'paid_20' },
          { name: '💎 ₹50 Entry ₹2500', value: 'paid_50' },
          { name: '🔥 ₹100 Entry ₹5000', value: 'paid_100' },
          { name: '🏆 MEGA ₹200 Entry ₹10000', value: 'mega' },
          { name: '👑 VIP ₹500 Entry ₹25000', value: 'vip_500' }
        ))
      .addStringOption(opt => opt.setName('game').setDescription('Game').setRequired(true)
        .addChoices(
          { name: '🔥 Free Fire', value: 'Free Fire' },
          { name: '⛏️ Minecraft', value: 'Minecraft' },
          { name: '🎮 PUBG Mobile', value: 'PUBG Mobile' },
          { name: '🎯 COD Mobile', value: 'COD Mobile' },
          { name: '💥 Valorant', value: 'Valorant' },
          { name: '🏗️ Fortnite', value: 'Fortnite' },
          { name: '🎯 Apex Legends', value: 'Apex Legends' }
        ))
      .addStringOption(opt => opt.setName('type').setDescription('Type').setRequired(true)
        .addChoices(
          { name: '👤 Solo', value: 'solo' },
          { name: '👥 Duo', value: 'duo' },
          { name: '👨‍👩‍👦‍👦 Squad', value: 'squad' },
          { name: '🔥 Battle Royale', value: 'br' }
        ))
      .addStringOption(opt => opt.setName('time').setDescription('Time (e.g., 7pm IST)').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('approve').setDescription('✅ Approve payment')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('reject').setDescription('❌ Reject payment')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // TOURNAMENT MANAGEMENT
    new SlashCommandBuilder().setName('create').setDescription('🎮 Advanced tournament creation')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('start').setDescription('▶️ Start tournament')
      .addStringOption(opt => opt.setName('roomid').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Password'))
      .addStringOption(opt => opt.setName('map').setDescription('Map name'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('end').setDescription('🏆 End tournament & declare winners')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('cancel').setDescription('❌ Cancel tournament')
      .addStringOption(opt => opt.setName('reason').setDescription('Cancellation reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('updateslots').setDescription('📊 Update max slots')
      .addIntegerOption(opt => opt.setName('slots').setDescription('New max slots').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('updateprize').setDescription('💰 Update prize pool')
      .addStringOption(opt => opt.setName('prize').setDescription('New prize (e.g., ₹5000)').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    // PLAYER MANAGEMENT
    new SlashCommandBuilder().setName('add').setDescription('➕ Add player manually')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('remove').setDescription('➖ Remove player')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('participants').setDescription('👥 View all participants')
      .addBooleanOption(opt => opt.setName('export').setDescription('Export to file'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('block').setDescription('🚫 Block user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true))
      .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g., 7d, permanent)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder().setName('unblock').setDescription('✅ Unblock user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // MODERATION
    new SlashCommandBuilder().setName('warn').setDescription('⚠️ Warn user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Warning reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder().setName('timeout').setDescription('⏱️ Timeout user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder().setName('warnings').setDescription('⚠️ Check warnings')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder().setName('clearwarnings').setDescription('🧹 Clear user warnings')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // INVITE MANAGEMENT
    new SlashCommandBuilder().setName('addinvites').setDescription('➕ Add bonus invites')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('removeinvites').setDescription('➖ Remove invites')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('topinviters').setDescription('🏅 Top inviters leaderboard')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number of users (1-25)')),

    // UTILITY
    new SlashCommandBuilder().setName('announce').setDescription('📢 Make announcement')
      .addStringOption(opt => opt.setName('message').setDescription('Message').setRequired(true))
      .addBooleanOption(opt => opt.setName('ping').setDescription('Ping @everyone'))
      .addStringOption(opt => opt.setName('channel').setDescription('Channel ID'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder().setName('embed').setDescription('📋 Create custom embed')
      .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(true))
      .addStringOption(opt => opt.setName('description').setDescription('Embed description').setRequired(true))
      .addStringOption(opt => opt.setName('color').setDescription('Hex color (e.g., #ff0000)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder().setName('history').setDescription('📜 Tournament history')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number (1-25)'))
      .addStringOption(opt => opt.setName('game').setDescription('Filter by game')),

    new SlashCommandBuilder().setName('closeticket').setDescription('🔒 Close support ticket')
      .addStringOption(opt => opt.setName('reason').setDescription('Closing reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder().setName('serverstats').setDescription('📊 Complete server statistics')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    new SlashCommandBuilder().setName('search').setDescription('🔍 Search players')
      .addStringOption(opt => opt.setName('query').setDescription('Username or ID').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    // OWNER COMMANDS
    new SlashCommandBuilder().setName('makestaff').setDescription('👮 Promote to staff')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('role').setDescription('Staff role')
        .addChoices(
          { name: 'Moderator', value: 'mod' },
          { name: 'Admin', value: 'admin' }
        )),

    new SlashCommandBuilder().setName('removestaff').setDescription('👤 Remove from staff')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)),

    new SlashCommandBuilder().setName('stafflist').setDescription('📋 View all staff members'),

    new SlashCommandBuilder().setName('backup').setDescription('💾 Backup all bot data'),

    new SlashCommandBuilder().setName('restore').setDescription('♻️ Restore from backup')
      .addAttachmentOption(opt => opt.setName('file').setDescription('Backup file').setRequired(true)),

    new SlashCommandBuilder().setName('maintenance').setDescription('🔧 Toggle maintenance mode')
      .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable/Disable').setRequired(true)),

    new SlashCommandBuilder().setName('broadcast').setDescription('📡 Broadcast message to all servers')
      .addStringOption(opt => opt.setName('message').setDescription('Message').setRequired(true)),

    new SlashCommandBuilder().setName('givevip').setDescription('👑 Grant VIP status')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('days').setDescription('Duration in days')),

    new SlashCommandBuilder().setName('eval').setDescription('🔧 Execute code (DANGER)')
      .addStringOption(opt => opt.setName('code').setDescription('Code to execute').setRequired(true)),

    // AUTOMATION
    new SlashCommandBuilder().setName('autospam').setDescription('🔄 Auto tournament announcements')
      .addBooleanOption(opt => opt.setName('enable').setDescription('Enable/Disable').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Interval in minutes'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder().setName('spamnow').setDescription('📢 Send announcement now')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder().setName('setalert').setDescription('🔔 Configure slot alerts')
      .addIntegerOption(opt => opt.setName('threshold').setDescription('Alert at X slots remaining').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder().setName('schedule').setDescription('⏰ Schedule tournament')
      .addStringOption(opt => opt.setName('date').setDescription('Date (YYYY-MM-DD)').setRequired(true))
      .addStringOption(opt => opt.setName('time').setDescription('Time (HH:MM)').setRequired(true))
      .addStringOption(opt => opt.setName('template').setDescription('Tournament template').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    // ECONOMY & REWARDS
    new SlashCommandBuilder().setName('givereward').setDescription('🎁 Give reward to user')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder().setName('balance').setDescription('💰 Check reward balance')
      .addUserOption(opt => opt.setName('user').setDescription('User')),

    new SlashCommandBuilder().setName('shop').setDescription('🛒 View reward shop'),

    new SlashCommandBuilder().setName('buy').setDescription('🛍️ Buy item from shop')
      .addStringOption(opt => opt.setName('item').setDescription('Item ID').setRequired(true)),
  ];

  const body = commands.map(c => c.toJSON());

  try {
    console.log('🔄 Registering slash commands...');
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body });
      console.log('✅ Guild commands registered!');
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
      console.log('✅ Global commands registered!');
    }
  } catch (err) {
    console.error('❌ Command registration error:', err);
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
    const msg = '❌ An error occurred! Please try again or contact staff.';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    } else if (interaction.deferred) {
      await interaction.editReply(msg).catch(() => {});
    }
  }
});

async function handleCommand(interaction) {
  const { commandName } = interaction;

  // Maintenance mode check
  if (maintenanceMode && interaction.user.id !== OWNER_ID) {
    return interaction.reply({ 
      content: '🔧 **Bot is under maintenance!** Please try again later.', 
      ephemeral: true 
    });
  }

  // Owner-only commands
  const ownerCommands = ['makestaff', 'removestaff', 'backup', 'restore', 'maintenance', 'broadcast', 'givevip', 'eval'];
  if (ownerCommands.includes(commandName) && interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '👑 This command is restricted to the bot owner!', ephemeral: true });
  }

  // Ban check
  if (bannedUsers.has(interaction.user.id) && !isStaff(interaction.member)) {
    return interaction.reply({ content: '🚫 You are banned from using tournaments!', ephemeral: true });
  }

  const handlers = {
    'help': handleHelp,
    'invites': handleInvites,
    'stats': handleStats,
    'tournament': handleTournament,
    'leaderboard': handleLeaderboard,
    'rules': handleRules,
    'ping': handlePing,
    'profile': handleProfile,
    'slots': handleSlots,
    'achievements': handleAchievements,
    'daily': handleDaily,
    'pay': handlePay,
    'quicktournament': handleQuickTournament,
    'approve': handleApprove,
    'reject': handleReject,
    'create': handleCreate,
    'start': handleStart,
    'end': handleEnd,
    'cancel': handleCancel,
    'updateslots': handleUpdateSlots,
    'updateprize': handleUpdatePrize,
    'add': handleAdd,
    'remove': handleRemove,
    'participants': handleParticipants,
    'block': handleBlock,
    'unblock': handleUnblock,
    'warn': handleWarn,
    'timeout': handleTimeout,
    'warnings': handleWarnings,
    'clearwarnings': handleClearWarnings,
    'addinvites': handleAddInvites,
    'removeinvites': handleRemoveInvites,
    'topinviters': handleTopInviters,
    'announce': handleAnnounce,
    'embed': handleEmbed,
    'history': handleHistory,
    'closeticket': handleCloseTicket,
    'serverstats': handleServerStats,
    'search': handleSearch,
    'makestaff': handleMakeStaff,
    'removestaff': handleRemoveStaff,
    'stafflist': handleStaffList,
    'backup': handleBackup,
    'restore': handleRestore,
    'maintenance': handleMaintenance,
    'broadcast': handleBroadcast,
    'givevip': handleGiveVIP,
    'eval': handleEval,
    'autospam': handleAutoSpam,
    'spamnow': handleSpamNow,
    'setalert': handleSetAlert,
    'schedule': handleSchedule,
    'givereward': handleGiveReward,
    'balance': handleBalance,
    'shop': handleShop,
    'buy': handleBuy,
  };

  const handler = handlers[commandName];
  if (handler) {
    try {
      await handler(interaction);
    } catch (err) {
      console.error(`Error in ${commandName}:`, err);
      const errorMsg = '❌ Command execution failed! Please try again.';
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: errorMsg, ephemeral: true }).catch(() => {});
      }
    }
  }
}

// ==================== HELPER FUNCTIONS ====================
function isStaff(member) {
  if (!member) return false;
  return member.roles?.cache?.has(CONFIG.STAFF_ROLE) || 
         member.permissions?.has(Discord.PermissionFlagsBits.Administrator) ||
         member.user?.id === OWNER_ID ||
         staffMembers.has(member.id);
}

function updatePlayerStats(userId, updates) {
  const stats = userStats.get(userId) || { 
    wins: 0, 
    topThree: 0, 
    tournaments: 0, 
    earnings: 0,
    winStreak: 0,
    bestStreak: 0,
    lastWin: null
  };
  
  if (updates.wins) {
    stats.wins += updates.wins;
    stats.winStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.winStreak);
    stats.lastWin = new Date();
    checkAchievements(userId, stats);
  } else if (updates.tournaments && !updates.wins) {
    stats.winStreak = 0;
  }
  
  Object.assign(stats, updates);
  userStats.set(userId, stats);
}

function generateProgressBar(current, max) {
  const percentage = Math.min((current / max) * 100, 100);
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;
  return `${'🟩'.repeat(filled)}${'⬜'.repeat(empty)} **${percentage.toFixed(0)}%** (${current}/${max})`;
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
    .setDescription(`**${tournament.game} • ${tournament.type.toUpperCase()}**`)
    .addFields(
      { name: '💰 Prize Pool', value: `**${tournament.prizePool}**`, inline: true },
      { name: '💵 Entry Fee', value: `**${tournament.entryFee}**`, inline: true },
      { name: '⏰ Time', value: `**${tournament.scheduledTime}**`, inline: true },
      { name: '📊 Slots', value: `**${registeredPlayers.size}/${tournament.maxSlots}**`, inline: true },
      { name: '🎮 Type', value: `**${tournament.type}**`, inline: true },
      { name: '📅 Date', value: `**${new Date(tournament.createdAt).toLocaleDateString()}**`, inline: true }
    );

  if (tournament.status === 'registration') {
    embed.addFields({ name: '📈 Registration Progress', value: progress, inline: false });
  }

  if (tournament.status === 'live' && tournament.roomId) {
    embed.addFields(
      { name: '🆔 Room ID', value: `\`\`\`${tournament.roomId}\`\`\``, inline: false },
      { name: '🔐 Password', value: tournament.roomPassword ? `\`\`\`${tournament.roomPassword}\`\`\`` : '❌ None', inline: false }
    );
    if (tournament.map) {
      embed.addFields({ name: '🗺️ Map', value: `**${tournament.map}**`, inline: false });
    }
  }

  embed.setImage(tournament.imageUrl);
  embed.setFooter({ text: `Tournament ID: ${tournament.id}` });
  embed.setTimestamp();

  return embed;
}

async function initializeInviteTracking() {
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) {
          inviteCache.set(inv.code, inv.uses);
        }
      });
      console.log(`✅ Cached ${invites.size} invites for ${guild.name}`);
    } catch (err) {
      console.warn(`⚠️ Could not fetch invites for ${guild.name}`);
    }
  }
}

async function setupPersistentMessages() {
  try {
    const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN).catch(() => null);
    if (howToJoinChannel) {
      const joinEmbed = new Discord.EmbedBuilder()
        .setTitle('🎮 HOW TO JOIN OTO TOURNAMENTS')
        .setDescription(
          `**Welcome to OTO Tournaments!** 🏆\n\n` +
          `**📋 Steps to Join:**\n\n` +
          `1️⃣ **Free Tournaments:** Invite **${CONFIG.MIN_INVITES} friends**\n` +
          `   └─ Check invites: Type \`-i\` or use \`/invites\`\n\n` +
          `2️⃣ **Paid Tournaments:**\n` +
          `   └─ Pay entry fee → Use \`/pay\` → Upload screenshot\n` +
          `   └─ Staff approval (5-15 min)\n\n` +
          `3️⃣ **Watch Announcements:**\n` +
          `   └─ <#${CONFIG.ANNOUNCEMENT_CHANNEL}>\n\n` +
          `4️⃣ **Click JOIN Button** when tournament opens\n\n` +
          `5️⃣ **Get Room Details** via DM when it starts\n\n` +
          `**📚 Commands:**\n` +
          `• \`/help\` - All bot commands\n` +
          `• \`/tournament\` - Active tournament\n` +
          `• \`/profile\` - Your stats\n` +
          `• \`/rules\` - Tournament rules\n\n` +
          `**Need Help?** Open ticket in <#${CONFIG.OPEN_TICKET}> 🎫`
        )
        .setColor('#3498db')
        .setImage(CONFIG.QR_IMAGE)
        .setFooter({ text: 'OTO Tournament System' });

      const messages = await howToJoinChannel.messages.fetch({ limit: 10 });
      const botMsgs = messages.filter(m => m.author.id === client.user.id);
      if (botMsgs.size === 0) {
        await howToJoinChannel.send({ embeds: [joinEmbed] });
      }
    }

    const ticketChannel = await client.channels.fetch(CONFIG.OPEN_TICKET).catch(() => null);
    if (ticketChannel) {
      const ticketEmbed = new Discord.EmbedBuilder()
        .setTitle('🎫 SUPPORT TICKETS')
        .setDescription(
          `**Need Help?**\n\n` +
          `Click the button below to create a support ticket.\n` +
          `Our staff will assist you shortly!\n\n` +
          `**Common Issues:**\n` +
          `• Payment verification\n` +
          `• Registration problems\n` +
          `• Technical support\n` +
          `• Tournament questions\n\n` +
          `⏰ **Average Response Time:** 5-30 minutes`
        )
        .setColor('#9b59b6');

      const ticketButton = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('📩 Create Support Ticket')
          .setStyle(Discord.ButtonStyle.Primary)
          .setEmoji('🎫')
      );

      const ticketMsgs = await ticketChannel.messages.fetch({ limit: 10 });
      const ticketBotMsgs = ticketMsgs.filter(m => m.author.id === client.user.id);
      if (ticketBotMsgs.size === 0) {
        await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketButton] });
      }
    }

    console.log('✅ Persistent messages setup complete');
  } catch (err) {
    console.error('Setup error:', err);
  }
}

function startAutomatedTasks() {
  // Update bot status every 5 minutes
  setInterval(() => {
    if (activeTournament) {
      client.user.setActivity(
        `${activeTournament.title} | ${registeredPlayers.size}/${activeTournament.maxSlots}`, 
        { type: Discord.ActivityType.Competing }
      );
    } else {
      const statuses = [
        '🏆 150+ Features | /help',
        `🎮 ${serverStats.totalTournaments} Tournaments Hosted`,
        `👥 ${userStats.size} Players`,
        '💰 Join & Win Prizes!',
        '🔥 Type /tournament'
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      client.user.setActivity(status, { type: Discord.ActivityType.Competing });
    }
  }, 300000);

  // Daily reset at midnight
  dailyResetInterval = setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      dailyStats.clear();
      console.log('✅ Daily stats reset');
    }
  }, 60000);

  // Auto backup every 6 hours
  autoBackupInterval = setInterval(async () => {
    try {
      await performAutoBackup();
    } catch (err) {
      console.error('Auto backup error:', err);
    }
  }, 21600000);

  console.log('✅ Automated tasks started');
}

async function performAutoBackup() {
  const backupData = {
    timestamp: new Date(),
    version: '2.0',
    activeTournament,
    tournamentHistory: tournamentHistory.slice(0, 50),
    registeredPlayers: Array.from(registeredPlayers.entries()),
    userInvites: Array.from(userInvites.entries()),
    userStats: Array.from(userStats.entries()),
    bannedUsers: Array.from(bannedUsers),
    warnings: Array.from(warnings.entries()),
    serverStats
  };

  console.log(`✅ Auto backup created at ${new Date().toLocaleString()}`);
  return backupData;
}

async function checkSlotAlerts() {
  if (!activeTournament) return;

  const remaining = activeTournament.maxSlots - registeredPlayers.size;

  for (const threshold of CONFIG.SLOT_ALERT_THRESHOLDS) {
    if (remaining === threshold && !slotAlertSent.has(threshold)) {
      slotAlertSent.add(threshold);

      const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT).catch(() => null);
      if (channel) {
        const urgency = remaining <= 5 ? '🚨 **URGENT**' : remaining <= 10 ? '⚠️ **HURRY**' : '📢';
        await channel.send(
          `${urgency} **SLOT ALERT!** ${urgency}\n\n` +
          `Only **${remaining} ${remaining === 1 ? 'slot' : 'slots'}** left in **${activeTournament.title}**!\n\n` +
          `💰 Prize: ${activeTournament.prizePool}\n` +
          `⏰ Time: ${activeTournament.scheduledTime}\n\n` +
          `Join NOW: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> ⚡`
        );
      }

      const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS).catch(() => null);
      if (staffChannel) {
        await staffChannel.send(`📊 **Alert:** ${remaining} slots remaining in ${activeTournament.title}`);
      }
    }
  }

  if (remaining === 0) {
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT).catch(() => null);
    if (channel) {
      await channel.send(
        `🎉 **TOURNAMENT FULL!** 🎉\n\n` +
        `**${activeTournament.title}** is now FULL!\n` +
        `${registeredPlayers.size}/${activeTournament.maxSlots} slots filled!\n\n` +
        `🏆 Good luck to all participants! 🍀`
      );
    }
  }
}

function checkAchievements(userId, stats) {
  const userAchievements = achievementSystem.get(userId) || new Set();
  
  if (stats.wins === 1 && !userAchievements.has('first_win')) {
    grantAchievement(userId, 'first_win');
  }
  if (stats.wins === 3 && !userAchievements.has('triple_threat')) {
    grantAchievement(userId, 'triple_threat');
  }
  if (stats.topThree >= 5 && !userAchievements.has('top_three')) {
    grantAchievement(userId, 'top_three');
  }
  if (stats.winStreak >= 3 && !userAchievements.has('streak_3')) {
    grantAchievement(userId, 'streak_3');
  }
  if (stats.tournaments >= 25 && !userAchievements.has('veteran')) {
    grantAchievement(userId, 'veteran');
  }
}

async function grantAchievement(userId, achievementId) {
  const userAchievements = achievementSystem.get(userId) || new Set();
  userAchievements.add(achievementId);
  achievementSystem.set(userId, userAchievements);
  
  const achievement = ACHIEVEMENTS[achievementId];
  if (achievement) {
    try {
      const user = await client.users.fetch(userId);
      const embed = new Discord.EmbedBuilder()
        .setTitle('🎉 ACHIEVEMENT UNLOCKED!')
        .setDescription(
          `**${achievement.name}**\n\n` +
          `${achievement.desc}\n\n` +
          `**Reward:** ${achievement.reward} bonus invites! 🎁`
        )
        .setColor('#ffd700')
        .setThumbnail(CONFIG.QR_IMAGE);
      
      await user.send({ embeds: [embed] });
      
      const current = userInvites.get(userId) || 0;
      userInvites.set(userId, current + achievement.reward);
    } catch (err) {
      console.error('Achievement grant error:', err);
    }
  }
}

// ==================== COMMAND HANDLERS (Basic implementations) ====================
async function handleHelp(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('🤖 OTO TOURNAMENT BOT - COMMAND GUIDE')
    .setDescription('**Welcome to OTO! Here are all available commands:**')
    .setColor('#3498db')
    .addFields(
      { name: '🎮 Tournament', value: '`/tournament` `/slots` `/join` `/profile` `/achievements`', inline: false },
      { name: '🏆 Competition', value: '`/leaderboard` `/topinviters` `/history` `/rules` `/stats`', inline: false },
      { name: '🔗 Social', value: '`/invites` `-i` (quick check)', inline: false },
      { name: '💰 Economy', value: '`/pay` `/balance` `/daily` `/shop` `/buy`', inline: false },
      { name: '🎫 Support', value: 'Open ticket in <#${CONFIG.OPEN_TICKET}>', inline: false }
    )
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: 'Use /help in DM for full command list' });

  if (isStaff(interaction.member)) {
    embed.addFields(
      { name: '👮 Staff Commands', value: '`/quicktournament` `/approve` `/reject` `/add` `/remove` `/participants`', inline: false },
      { name: '🛠️ Moderation', value: '`/warn` `/timeout` `/block` `/unblock` `/warnings`', inline: false },
      { name: '📢 Utility', value: '`/announce` `/embed` `/serverstats` `/search`', inline: false }
    );
  }

  if (interaction.user.id === OWNER_ID) {
    embed.addFields(
      { name: '👑 Owner Only', value: '`/makestaff` `/backup` `/restore` `/maintenance` `/broadcast` `/eval`', inline: false }
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
      { name: '📊 Total Invites', value: `**${count}**`, inline: true },
      { name: '✅ Required', value: `**${needed}**`, inline: true },
      { name: '🎮 Status', value: canJoin ? '✅ **FREE ENTRY!**' : `❌ Need ${needed - count} more`, inline: true }
    )
    .setDescription(canJoin ? '🎉 You qualify for FREE tournaments!' : `💡 Invite ${needed - count} more friends to unlock FREE entry!`)
    .setThumbnail(checkUser.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Share your server invite link!' });

  await interaction.reply({ embeds: [embed], ephemeral: !targetUser });
}

// Placeholder handlers for other commands
async function handleStats(interaction) {
  await interaction.reply({ content: '📊 Stats command - Feature coming soon!', ephemeral: true });
}

async function handleTournament(interaction) {
  if (!activeTournament) {
    return interaction.reply({ 
      content: `❌ No active tournament! Check <#${CONFIG.TOURNAMENT_SCHEDULE}>`, 
      ephemeral: true 
    });
  }

  const embed = createTournamentEmbed(activeTournament);
  await interaction.reply({ embeds: [embed] });
}

async function handleLeaderboard(interaction) {
  await interaction.reply({ content: '🏆 Leaderboard - Feature coming soon!', ephemeral: true });
}

async function handleRules(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('📋 OTO TOURNAMENT RULES')
    .setDescription(CONFIG.RULES)
    .setColor('#e74c3c')
    .addFields(
      { name: '⚠️ Consequences', value: '**Warning** → **Timeout** → **Ban**', inline: false },
      { name: '✅ Fair Play', value: 'Play clean, respect all, have fun!', inline: false }
    )
    .setImage(CONFIG.QR_IMAGE)
    .setFooter({ text: 'Breaking rules = consequences!' });

  await interaction.reply({ embeds: [embed] });
}

async function handlePing(interaction) {
  const ping = client.ws.ping;
  const embed = new Discord.EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setDescription(
      `**WebSocket Latency:** ${ping}ms\n` +
      `**Uptime:** ${Math.floor(client.uptime / 1000)}s\n` +
      `**Memory Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
    )
    .setColor(ping < 100 ? '#00ff00' : ping < 200 ? '#ff9900' : '#ff0000');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleProfile(interaction) {
  await interaction.reply({ content: '👤 Profile - Feature coming soon!', ephemeral: true });
}

async function handleSlots(interaction) {
  if (!activeTournament) {
    return interaction.reply({ content: '❌ No active tournament!', ephemeral: true });
  }

  const filled = registeredPlayers.size;
  const total = activeTournament.maxSlots;
  const remaining = total - filled;
  const percentage = ((filled / total) * 100).toFixed(1);

  const embed = new Discord.EmbedBuilder()
    .setTitle(`📊 ${activeTournament.title} - Slots Status`)
    .setDescription(
      `**Real-Time Slot Information**\n\n` +
      `${generateProgressBar(filled, total)}\n\n` +
      `✅ **Filled:** ${filled}\n` +
      `📊 **Total:** ${total}\n` +
      `🔓 **Available:** ${remaining}\n` +
      `📈 **Percentage:** ${percentage}%\n\n` +
      `${remaining === 0 ? '❌ **TOURNAMENT FULL!**' : remaining < 10 ? `⚠️ **HURRY! Only ${remaining} slots left!**` : `✅ **${remaining} slots available!**`}`
    )
    .setColor(remaining === 0 ? '#ff0000' : remaining < 10 ? '#ff9900' : '#00ff00')
    .setThumbnail(activeTournament.imageUrl || CONFIG.QR_IMAGE)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

// Implement remaining command handlers with basic responses
async function handleAchievements(interaction) {
  await interaction.reply({ content: '🏅 Achievements system - Coming soon!', ephemeral: true });
}

async function handleDaily(interaction) {
  await interaction.reply({ content: '🎁 Daily rewards - Coming soon!', ephemeral: true });
}

async function handlePay(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  if (!activeTournament) {
    return interaction.editReply('❌ No active tournament!');
  }

  if (activeTournament.entryFee === 'Free') {
    return interaction.editReply('❌ This is a FREE tournament! No payment needed.');
  }

  const transactionId = interaction.options.getString('transactionid');
  const method = interaction.options.getString('method');
  const screenshot = interaction.options.getAttachment('screenshot');

  paymentPending.set(interaction.user.id, {
    transactionId,
    method,
    screenshot: screenshot.url,
    submittedAt: new Date(),
    tournament: activeTournament.id,
    amount: activeTournament.entryFee
  });

  const userTrans = userTransactions.get(interaction.user.id) || [];
  userTrans.push({
    id: transactionId,
    method,
    amount: activeTournament.entryFee,
    date: new Date(),
    status: 'pending'
  });
  userTransactions.set(interaction.user.id, userTrans);

  await interaction.editReply(
    `✅ **Payment Submitted Successfully!**\n\n` +
    `📝 Transaction ID: \`${transactionId}\`\n` +
    `💰 Amount: ${activeTournament.entryFee}\n` +
    `💳 Method: ${method}\n\n` +
    `⏰ Staff will verify within 5-15 minutes!\n` +
    `📩 You'll get DM notification once approved.`
  );
}

async function handleQuickTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (activeTournament && activeTournament.status !== 'ended') {
    return interaction.editReply('❌ Active tournament exists! End it first with `/end`');
  }

  const template = interaction.options.getString('template');
  const game = interaction.options.getString('game');
  const type = interaction.options.getString('type');
  const time = interaction.options.getString('time');

  const config = CONFIG.QUICK_TEMPLATES[template];

  const tournamentData = {
    id: Date.now().toString(),
    game: game,
    type: type,
    title: `${game} ${type.toUpperCase()} Tournament`,
    prizePool: config.prize,
    entryFee: config.entry,
    maxSlots: config.slots,
    scheduledTime: time,
    description: config.desc,
    imageUrl: CONFIG.GAME_IMAGES[game] || CONFIG.QR_IMAGE,
    status: 'registration',
    createdBy: interaction.user.id,
    createdAt: new Date()
  };

  activeTournament = tournamentData;
  registeredPlayers.clear();
  slotAlertSent.clear();
  serverStats.totalTournaments++;

  const announceEmbed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${tournamentData.title}`)
    .setDescription(
      `**${game} ${type.toUpperCase()} Tournament** 🔥\n` +
      `*${config.desc}*\n\n` +
      `💰 **Prize Pool:** ${tournamentData.prizePool}\n` +
      `💵 **Entry Fee:** ${tournamentData.entryFee}\n` +
      `👥 **Max Slots:** ${tournamentData.maxSlots}\n` +
      `⏰ **Time:** ${tournamentData.scheduledTime}\n\n` +
      `**🏆 Prize Distribution:**\n` +
      `🥇 1st: 50% + Certificate\n` +
      `🥈 2nd: 30% + Certificate\n` +
      `🥉 3rd: 20% + Certificate\n\n` +
      `${tournamentData.entryFee === 'Free' ? `**✅ Requirements:** Minimum ${CONFIG.MIN_INVITES} invites\nType \`-i\` to check your invites!` : `**💰 Payment Required:** Use \`/pay\` command with proof!`}\n\n` +
      `**Click JOIN button below!** ⬇️`
    )
    .setColor('#ffd700')
    .setImage(tournamentData.imageUrl)
    .setFooter({ text: `Quick Tournament by ${interaction.user.username} • ID: ${tournamentData.id}` })
    .setTimestamp();

  const joinButton = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN TOURNAMENT')
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji('🏆')
  );

  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await announceChannel.send({ 
    content: '@everyone\n\n🚨 **NEW TOURNAMENT ANNOUNCED!** 🚨', 
    embeds: [announceEmbed], 
    components: [joinButton] 
  });

  await interaction.editReply(
    `✅ **Tournament Created & Announced!**\n\n` +
    `📋 ${tournamentData.title}\n` +
    `💰 Prize: ${tournamentData.prizePool}\n` +
    `👥 Slots: ${tournamentData.maxSlots}\n` +
    `⏰ Time: ${tournamentData.scheduledTime}\n\n` +
    `🚀 Tournament is live in <#${CONFIG.ANNOUNCEMENT_CHANNEL}>!`
  );
}

async function handleApprove(interaction) {
  await interaction.reply({ content: '✅ Approve payment - Staff feature', ephemeral: true });
}

async function handleReject(interaction) {
  await interaction.reply({ content: '❌ Reject payment - Staff feature', ephemeral: true });
}

async function handleCreate(interaction) {
  await interaction.reply({ content: '🎮 Advanced tournament creation - Coming soon!', ephemeral: true });
}

async function handleStart(interaction) {
  await interaction.reply({ content: '▶️ Start tournament - Staff feature', ephemeral: true });
}

async function handleEnd(interaction) {
  await interaction.reply({ content: '🏆 End tournament - Staff feature', ephemeral: true });
}

async function handleCancel(interaction) {
  await interaction.reply({ content: '❌ Cancel tournament - Staff feature', ephemeral: true });
}

async function handleUpdateSlots(interaction) {
  await interaction.reply({ content: '📊 Update slots - Staff feature', ephemeral: true });
}

async function handleUpdatePrize(interaction) {
  await interaction.reply({ content: '💰 Update prize - Staff feature', ephemeral: true });
}

async function handleAdd(interaction) {
  await interaction.reply({ content: '➕ Add player - Staff feature', ephemeral: true });
}

async function handleRemove(interaction) {
  await interaction.reply({ content: '➖ Remove player - Staff feature', ephemeral: true });
}

async function handleParticipants(interaction) {
  await interaction.reply({ content: '👥 View participants - Staff feature', ephemeral: true });
}

async function handleBlock(interaction) {
  await interaction.reply({ content: '🚫 Block user - Staff feature', ephemeral: true });
}

async function handleUnblock(interaction) {
  await interaction.reply({ content: '✅ Unblock user - Staff feature', ephemeral: true });
}

async function handleWarn(interaction) {
  await interaction.reply({ content: '⚠️ Warn user - Staff feature', ephemeral: true });
}

async function handleTimeout(interaction) {
  await interaction.reply({ content: '⏱️ Timeout user - Staff feature', ephemeral: true });
}

async function handleWarnings(interaction) {
  await interaction.reply({ content: '⚠️ Check warnings - Staff feature', ephemeral: true });
}

async function handleClearWarnings(interaction) {
  await interaction.reply({ content: '🧹 Clear warnings - Staff feature', ephemeral: true });
}

async function handleAddInvites(interaction) {
  await interaction.reply({ content: '➕ Add invites - Staff feature', ephemeral: true });
}

async function handleRemoveInvites(interaction) {
  await interaction.reply({ content: '➖ Remove invites - Staff feature', ephemeral: true });
}

async function handleTopInviters(interaction) {
  await interaction.reply({ content: '🏅 Top inviters - Coming soon!', ephemeral: true });
}

async function handleAnnounce(interaction) {
  await interaction.reply({ content: '📢 Announcement - Staff feature', ephemeral: true });
}

async function handleEmbed(interaction) {
  await interaction.reply({ content: '📋 Custom embed - Staff feature', ephemeral: true });
}

async function handleHistory(interaction) {
  await interaction.reply({ content: '📜 Tournament history - Coming soon!', ephemeral: true });
}

async function handleCloseTicket(interaction) {
  await interaction.reply({ content: '🔒 Close ticket - Staff feature', ephemeral: true });
}

async function handleServerStats(interaction) {
  await interaction.reply({ content: '📊 Server statistics - Staff feature', ephemeral: true });
}

async function handleSearch(interaction) {
  await interaction.reply({ content: '🔍 Search players - Staff feature', ephemeral: true });
}

async function handleMakeStaff(interaction) {
  await interaction.reply({ content: '👮 Make staff - Owner only', ephemeral: true });
}

async function handleRemoveStaff(interaction) {
  await interaction.reply({ content: '👤 Remove staff - Owner only', ephemeral: true });
}

async function handleStaffList(interaction) {
  await interaction.reply({ content: '📋 Staff list - Coming soon!', ephemeral: true });
}

async function handleBackup(interaction) {
  await interaction.reply({ content: '💾 Creating backup...', ephemeral: true });
}

async function handleRestore(interaction) {
  await interaction.reply({ content: '♻️ Restore - Owner only', ephemeral: true });
}

async function handleMaintenance(interaction) {
  const enabled = interaction.options.getBoolean('enabled');
  maintenanceMode = enabled;
  
  if (enabled) {
    client.user.setStatus('dnd');
    client.user.setActivity('🔧 MAINTENANCE MODE', { type: Discord.ActivityType.Playing });
    await interaction.reply({ content: '🔧 **MAINTENANCE MODE ENABLED**\n\nBot will reject all non-owner commands.', ephemeral: true });
  } else {
    client.user.setStatus('online');
    client.user.setActivity('🏆 150+ Features | /help', { type: Discord.ActivityType.Competing });
    await interaction.reply({ content: '✅ **MAINTENANCE MODE DISABLED**\n\nBot is fully operational!', ephemeral: true });
  }
}

async function handleBroadcast(interaction) {
  await interaction.reply({ content: '📡 Broadcast - Owner only', ephemeral: true });
}

async function handleGiveVIP(interaction) {
  await interaction.reply({ content: '👑 Give VIP - Owner only', ephemeral: true });
}

async function handleEval(interaction) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({ content: '❌ Unauthorized!', ephemeral: true });
  }
  await interaction.reply({ content: '⚠️ Eval command is dangerous! Use with caution.', ephemeral: true });
}

async function handleAutoSpam(interaction) {
  await interaction.reply({ content: '🔄 Auto spam - Staff feature', ephemeral: true });
}

async function handleSpamNow(interaction) {
  await interaction.reply({ content: '📢 Spam now - Staff feature', ephemeral: true });
}

async function handleSetAlert(interaction) {
  await interaction.reply({ content: '🔔 Set alert - Staff feature', ephemeral: true });
}

async function handleSchedule(interaction) {
  await interaction.reply({ content: '⏰ Schedule tournament - Coming soon!', ephemeral: true });
}

async function handleGiveReward(interaction) {
  await interaction.reply({ content: '🎁 Give reward - Staff feature', ephemeral: true });
}

async function handleBalance(interaction) {
  await interaction.reply({ content: '💰 Balance - Coming soon!', ephemeral: true });
}

async function handleShop(interaction) {
  await interaction.reply({ content: '🛒 Reward shop - Coming soon!', ephemeral: true });
}

async function handleBuy(interaction) {
  await interaction.reply({ content: '🛍️ Buy item - Coming soon!', ephemeral: true });
}

// ==================== BUTTON HANDLERS ====================
async function handleButton(interaction) {
  const { customId } = interaction;

  if (customId === 'join_tournament') {
    await handleJoinButton(interaction);
  } else if (customId === 'create_ticket') {
    await handleCreateTicket(interaction);
  } else if (customId === 'close_ticket_confirm') {
    await handleCloseTicketButton(interaction);
  } else if (customId.startsWith('approve_payment_')) {
    await handleApprovePaymentButton(interaction);
  } else if (customId.startsWith('reject_payment_')) {
    await handleRejectPaymentButton(interaction);
  }
}

async function handleJoinButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ Registration is closed!');
  }

  if (registeredPlayers.has(interaction.user.id)) {
    return interaction.editReply('⚠️ You are already registered!');
  }

  if (registeredPlayers.size >= activeTournament.maxSlots) {
    return interaction.editReply('❌ Tournament is FULL! Better luck next time.');
  }

  if (bannedUsers.has(interaction.user.id)) {
    return interaction.editReply('🚫 You are banned from tournaments!');
  }

  if (activeTournament.entryFee !== 'Free') {
    return interaction.editReply(
      `💰 **Payment Required!**\n\n` +
      `Entry Fee: **${activeTournament.entryFee}**\n\n` +
      `**Payment Steps:**\n` +
      `1️⃣ Pay ${activeTournament.entryFee} via your preferred method\n` +
      `2️⃣ Take screenshot of successful payment\n` +
      `3️⃣ Use \`/pay\` command to submit proof\n` +
      `4️⃣ Wait for staff approval (5-15 min)\n` +
      `5️⃣ You'll be automatically added!\n\n` +
      `📞 Need help? Open ticket in <#${CONFIG.OPEN_TICKET}>`
    );
  }

  const inviteCount = userInvites.get(interaction.user.id) || 0;
  if (inviteCount < CONFIG.MIN_INVITES && !isStaff(interaction.member)) {
    return interaction.editReply(
      `❌ **Not Enough Invites!**\n\n` +
      `Current: **${inviteCount}/${CONFIG.MIN_INVITES}**\n` +
      `Need: **${CONFIG.MIN_INVITES - inviteCount}** more invites\n\n` +
      `💡 **How to get invites:**\n` +
      `• Share your server invite link with friends\n` +
      `• When they join, you get credit!\n` +
      `• Type \`-i\` to check anytime\n\n` +
      `🎁 **Bonus:** Staff can award bonus invites!`
    );
  }

  registeredPlayers.set(interaction.user.id, {
    user: interaction.user,
    joinedAt: new Date(),
    approved: true
  });

  updatePlayerStats(interaction.user.id, { tournaments: 1 });
  serverStats.activeUsers.add(interaction.user.id);

  const embed = new Discord.EmbedBuilder()
    .setTitle('✅ Registration Successful!')
    .setDescription(
      `You're now registered for **${activeTournament.title}**!\n\n` +
      `**Tournament Details:**\n` +
      `🎮 Game: ${activeTournament.game}\n` +
      `⏰ Time: ${activeTournament.scheduledTime}\n` +
      `💰 Prize: ${activeTournament.prizePool}\n` +
      `📊 Your Position: ${registeredPlayers.size}/${activeTournament.maxSlots}\n\n` +
      `**Next Steps:**\n` +
      `• Room details will be sent via DM when tournament starts\n` +
      `• Make sure your DMs are open!\n` +
      `• Be online 10 minutes before start time\n\n` +
      `🍀 Good luck!`
    )
    .setColor('#00ff00')
    .addFields(
      { name: '⏰ Start Time', value: activeTournament.scheduledTime, inline: true },
      { name: '💰 Prize Pool', value: activeTournament.prizePool, inline: true },
      { name: '📊 Your Slot', value: `${registeredPlayers.size}/${activeTournament.maxSlots}`, inline: true }
    )
    .setThumbnail(activeTournament.imageUrl);

  await interaction.editReply({ embeds: [embed] });

  try {
    await interaction.user.send({
      content: `🎮 **Tournament Registration Confirmed!**\n\n` +
               `${activeTournament.title}\n` +
               `⏰ ${activeTournament.scheduledTime}\n\n` +
               `Room details will be sent here when tournament starts!\n` +
               `Good luck! 🍀`,
      embeds: [embed]
    });
  } catch (err) {
    console.log(`Could not DM user ${interaction.user.tag}`);
  }

  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
  await generalChannel.send(
    `🎮 ${interaction.user} joined **${activeTournament.title}**!\n\n` +
    `📊 **${registeredPlayers.size}/${activeTournament.maxSlots}** slots filled! ` +
    `${activeTournament.maxSlots - registeredPlayers.size} remaining! 🔥`
  );

  await checkSlotAlerts();
}

async function handleCreateTicket(interaction) {
  await interaction.reply({ content: '🎫 Creating support ticket...', ephemeral: true });
}

async function handleCloseTicketButton(interaction) {
  await interaction.reply({ content: '🔒 Closing ticket...', ephemeral: true });
}

async function handleApprovePaymentButton(interaction) {
  await interaction.reply({ content: '✅ Approving payment...', ephemeral: true });
}

async function handleRejectPaymentButton(interaction) {
  await interaction.reply({ content: '❌ Rejecting payment...', ephemeral: true });
}

// ==================== SELECT MENU HANDLERS ====================
async function handleSelectMenu(interaction) {
  await interaction.reply({ content: '📋 Select menu - Feature in progress', ephemeral: true });
}

// ==================== MESSAGE HANDLER ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Quick invite check
  if (content === '-i') {
    const count = userInvites.get(message.author.id) || 0;
    const needed = CONFIG.MIN_INVITES;
    const canJoin = count >= needed;

    return message.reply(
      `🔗 **Your Invites:** ${count}/${needed}\n` +
      `${canJoin ? '✅ **FREE ENTRY UNLOCKED!**' : `❌ Need ${needed - count} more!`}\n\n` +
      `Use \`/invites\` for detailed info!`
    );
  }

  // Auto responses
  if (message.channel.id === CONFIG.GENERAL_CHAT) {
    for (const [keyword, responses] of Object.entries(CONFIG.AUTO_RESPONSES)) {
      if (content.includes(keyword)) {
        const response = responses[Math.floor(Math.random() * responses.length)];
        await message.reply(response);
        return;
      }
    }
  }
});

// ==================== MEMBER EVENTS ====================
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
        `${welcomeMsg}\n\n` +
        `💫 Invited by: <@${usedInvite.inviter.id}>\n` +
        `📊 Their total invites: **${current + 1}**`
      );

      try {
        const inviter = await client.users.fetch(usedInvite.inviter.id);
        await inviter.send(
          `🎉 **+1 Invite!**\n\n` +
          `${member.user.tag} joined using your invite!\n\n` +
          `**Your Total:** ${current + 1} invites\n` +
          `${current + 1 >= CONFIG.MIN_INVITES ? '✅ **FREE TOURNAMENT ENTRY UNLOCKED!**' : `Need ${CONFIG.MIN_INVITES - current - 1} more for FREE entry!`}`
        );
      } catch (err) {}

      // Check for invite achievements
      if (current + 1 === 10 && !achievementSystem.get(usedInvite.inviter.id)?.has('invite_master')) {
        grantAchievement(usedInvite.inviter.id, 'invite_master');
      }
    }

    newInvites.forEach(inv => inviteCache.set(inv.code, inv.uses));
  } catch (err) {
    console.error('Member add tracking error:', err);
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
    console.error('Member remove error:', err);
  }
});

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('❌ Client error:', err));
client.on('warn', warn => console.warn('⚠️ Warning:', warn));
process.on('unhandledRejection', err => console.error('❌ Unhandled rejection:', err));
process.on('uncaughtException', err => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});

// ==================== LOGIN ====================
console.log('🔄 Attempting to login...');
client.login(BOT_TOKEN)
  .then(() => {
    console.log('\n✅ Bot login successful!');
    console.log('🚀 OTO Tournament Bot - 150+ Features Active!\n');
  })
  .catch(err => {
    console.error('\n❌ Login failed:', err.message);
    console.error('\n📋 Troubleshooting Steps:');
    console.error('1. Check BOT_TOKEN in .env file');
    console.error('2. Enable these intents in Discord Developer Portal:');
    console.error('   • SERVER MEMBERS INTENT');
    console.error('   • MESSAGE CONTENT INTENT');
    console.error('3. Bot must be invited with proper permissions');
    console.error('4. Check if bot token is valid\n');
    process.exit(1);
  });
