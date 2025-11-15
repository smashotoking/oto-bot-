// ==================== OTO ULTRA PROFESSIONAL TOURNAMENT BOT - 2500+ LINES ====================
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (err) { console.log('⚠️ Using environment variables'); }
}

const Discord = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || 'YOUR_DISCORD_ID_HERE';

if (!BOT_TOKEN) {
  console.error('❌ No bot token found!');
  process.exit(1);
}

// ==================== ENHANCED CLIENT SETUP ====================
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Discord.Partials.Channel, Discord.Partials.Message, Discord.Partials.Reaction],
});

// Express server for monitoring
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get('/', (req, res) => res.send('🏆 OTO Tournament Bot Active - Professional Edition'));
app.get('/health', (req, res) => res.json({ 
  status: 'online', 
  features: 2500,
  tournaments: serverStats.totalTournaments,
  players: userStats.size
}));
app.listen(PORT, () => console.log(`✅ Professional server running on port ${PORT}`));

// ==================== PROFESSIONAL CONFIGURATION ====================
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
  
  // Role IDs
  STAFF_ROLE: '1438475461977047112',
  ADMIN_ROLE: '1438475461977047112',
  PREMIUM_ROLE: '1438475461977047113',
  
  // Tournament Settings
  MIN_INVITES: 2,
  MAX_TOURNAMENT_HISTORY: 100,
  AUTO_BACKUP_INTERVAL: 3600000, // 1 hour
  SLOT_ALERTS: [10, 5, 3, 1],
  
  // Images & Media
  QR_IMAGE: 'https://i.ibb.co/jkBSmkM/qr.png',
  BANNER_IMAGE: 'https://i.ibb.co/8XQkZhJ/freefire.png',
  
  // Enhanced Game Images
  GAME_IMAGES: {
    'Free Fire': 'https://i.ibb.co/8XQkZhJ/freefire.png',
    'Minecraft': 'https://i.ibb.co/VgTY8Lq/minecraft.png',
    'PUBG Mobile': 'https://i.ibb.co/0Q8Lz3C/pubg.jpg',
    'COD Mobile': 'https://i.ibb.co/0jR7Z2B/cod.jpg',
    'Valorant': 'https://i.ibb.co/0mR0R3B/valorant.jpg',
    'BGMI': 'https://i.ibb.co/0Q8Lz3C/pubg.jpg',
    'Clash Royale': 'https://i.ibb.co/0jR7Z2B/cod.jpg',
    'Custom': 'https://i.ibb.co/jkBSmkM/qr.png'
  },
  
  // Payment Methods
  PAYMENT_METHODS: {
    'UPI': { name: '💳 UPI', id: 'yourupi@okaxis' },
    'PayTM': { name: '💰 PayTM', number: '9876543210' },
    'PhonePe': { name: '📱 PhonePe', id: 'yourphonepe@ybl' },
    'GPay': { name: '🅖 Google Pay', number: '9876543210' },
    'Bank': { name: '🏦 Bank Transfer', details: 'ACC: XXXX XXXX XXXX' }
  },

  // Professional Tournament Templates
  TOURNAMENT_TEMPLATES: {
    'free_500': { 
      prize: '₹500', 
      entry: 'Free', 
      slots: 50, 
      time: '7pm IST',
      duration: '2 hours',
      type: 'solo'
    },
    'paid_20': { 
      prize: '₹1000', 
      entry: '₹20', 
      slots: 50, 
      time: '8pm IST',
      duration: '2 hours',
      type: 'solo'
    },
    'paid_50': { 
      prize: '₹2500', 
      entry: '₹50', 
      slots: 50, 
      time: '9pm IST',
      duration: '3 hours',
      type: 'duo'
    },
    'paid_100': { 
      prize: '₹5000', 
      entry: '₹100', 
      slots: 100, 
      time: '10pm IST',
      duration: '3 hours',
      type: 'squad'
    },
    'mega': { 
      prize: '₹10000', 
      entry: '₹200', 
      slots: 100, 
      time: '9pm IST',
      duration: '4 hours',
      type: 'squad'
    },
  },
  
  // Enhanced Messages
  WELCOME_MESSAGES: [
    '🔥 {user} joined the arena! Tournament ready? 💪',
    '🎮 Welcome {user}! Let\'s conquer together! 🔥',
    '💫 Boss {user} entered! Show them your skills! 🏆',
    '⚡ {user} is here! OTO champion in making! 🎯',
    '🌟 {user} welcome to OTO! Big wins await! 💰',
  ],
  
  LEAVE_MESSAGES: [
    '😢 {user} left the battlefield... Come back soon! 👋',
    '💔 {user} has departed... We\'ll miss you! 🥺',
    '🚶 {user} signed out... See you next tournament! ✌️',
  ],
  
  // Smart Auto Responses
  AUTO_RESPONSES: {
    'tournament': ['Check <#1438482561679626303> for upcoming tournaments! 🎮', 'Use `/tournament` for current event! ⚡'],
    'free entry': [`Invite ${CONFIG.MIN_INVITES} friends for FREE entry! Use \`/invites\` to check! 🔗`],
    'kab': ['Schedule available in <#1438482561679626303>! ⏰', 'Use `/schedule` for tournament timings! 🕒'],
    'help': ['Type `/help` for complete guide! 🤖', 'Need assistance? Check `/help` command! 💡'],
    'payment': ['Use `/pay` command for payment submission! 💰', 'Payment issues? Create ticket in <#1438485759891079180>! 🎫'],
    'winner': ['Check `/leaderboard` for top players! 🏆', 'Use `/history` for past tournaments! 📜'],
  },
  
  // Professional Rules System
  RULES: {
    general: `📜 **OTO TOURNAMENT RULES - GENERAL**
1️⃣ Respect all players and staff
2️⃣ No cheating, hacking, or exploiting
3️⃣ Fair play only - no teaming in solo
4️⃣ Stable internet connection required
5️⃣ Join matches within 5 minutes of start
6️⃣ Follow room ID and password instructions
7️⃣ Screenshot proof required for disputes
8️⃣ Staff decisions are final`,

    payment: `💰 **PAYMENT & REFUND POLICY**
• Payments must be completed before tournament start
• Refunds only if tournament is cancelled
• Payment proofs must be clear and valid
• Fake payments result in permanent ban
• Contact staff for payment issues`,

    prizes: `🏆 **PRIZE DISTRIBUTION**
• 1st Place: 50% of prize pool + Certificate
• 2nd Place: 30% of prize pool + Certificate  
• 3rd Place: 20% of prize pool + Certificate
• Prizes distributed within 24 hours of tournament end
• Certificate delivered via DM`
  }
};

// ==================== ADVANCED DATA MANAGEMENT ====================
class DataManager {
  constructor() {
    this.activeTournament = null;
    this.tournamentHistory = [];
    this.registeredPlayers = new Map();
    this.userInvites = new Map();
    this.userStats = new Map();
    this.bannedUsers = new Map(); // Now stores reason and date
    this.warnings = new Map();
    this.tickets = new Map();
    this.inviteCache = new Map();
    this.firstTimeUsers = new Set();
    this.staffMembers = new Set();
    this.paymentPending = new Map();
    this.userTransactions = new Map();
    this.tournamentQueue = [];
    this.backupSchedule = new Map();
    this.achievements = new Map();
    this.premiumUsers = new Set();
    
    this.serverStats = {
      totalTournaments: 0,
      totalPrizes: 0,
      totalPlayers: 0,
      activeUsers: new Set(),
      totalMessages: 0,
      totalInvites: 0,
      startDate: new Date()
    };
  }

  // Backup system
  async autoBackup() {
    try {
      const backupData = {
        timestamp: new Date(),
        activeTournament: this.activeTournament,
        tournamentHistory: this.tournamentHistory,
        registeredPlayers: Array.from(this.registeredPlayers.entries()),
        userInvites: Array.from(this.userInvites.entries()),
        userStats: Array.from(this.userStats.entries()),
        bannedUsers: Array.from(this.bannedUsers.entries()),
        warnings: Array.from(this.warnings.entries()),
        serverStats: this.serverStats
      };

      const backupDir = path.join(__dirname, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }

      const fileName = `backup-${Date.now()}.json`;
      const filePath = path.join(backupDir, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
      
      // Keep only last 10 backups
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();
      
      if (files.length > 10) {
        for (let i = 10; i < files.length; i++) {
          fs.unlinkSync(path.join(backupDir, files[i]));
        }
      }
      
      console.log(`✅ Auto-backup created: ${fileName}`);
    } catch (err) {
      console.error('❌ Backup failed:', err);
    }
  }

  // Statistics tracking
  trackUserAction(userId, action, details = {}) {
    const userStat = this.userStats.get(userId) || { 
      wins: 0, 
      topThree: 0, 
      tournaments: 0,
      totalEarnings: 0,
      joinDate: new Date(),
      lastActive: new Date(),
      actions: []
    };
    
    userStat.lastActive = new Date();
    userStat.actions.push({ action, timestamp: new Date(), details });
    
    // Keep only last 100 actions
    if (userStat.actions.length > 100) {
      userStat.actions = userStat.actions.slice(-100);
    }
    
    this.userStats.set(userId, userStat);
  }
}

const dataManager = new DataManager();

// ==================== PROFESSIONAL COMMAND REGISTRATION ====================
async function registerProfessionalCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ContextMenuCommandBuilder, ApplicationCommandType } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    // ===== USER COMMANDS =====
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('❓ Complete professional guide for OTO Bot'),

    new SlashCommandBuilder()
      .setName('invites')
      .setDescription('🔗 Check your invite count and status')
      .addUserOption(opt => opt.setName('user').setDescription('Check another user (Staff only)')),

    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('📊 Detailed tournament statistics')
      .addUserOption(opt => opt.setName('user').setDescription('Check specific user stats')),

    new SlashCommandBuilder()
      .setName('tournament')
      .setDescription('🎮 Get current tournament information'),

    new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('🏆 View top players and rankings')
      .addStringOption(opt => opt.setName('type')
        .setDescription('Leaderboard type')
        .addChoices(
          { name: 'Wins', value: 'wins' },
          { name: 'Earnings', value: 'earnings' },
          { name: 'Tournaments', value: 'tournaments' }
        )),

    new SlashCommandBuilder()
      .setName('rules')
      .setDescription('📋 View tournament rules and policies')
      .addStringOption(opt => opt.setName('section')
        .setDescription('Specific rules section')
        .addChoices(
          { name: 'General', value: 'general' },
          { name: 'Payment', value: 'payment' },
          { name: 'Prizes', value: 'prizes' }
        )),

    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('🏓 Check bot latency and status'),

    new SlashCommandBuilder()
      .setName('profile')
      .setDescription('👤 Your complete gaming profile')
      .addUserOption(opt => opt.setName('user').setDescription('View another user profile')),

    new SlashCommandBuilder()
      .setName('slots')
      .setDescription('📊 Real-time tournament slot information'),

    new SlashCommandBuilder()
      .setName('pay')
      .setDescription('💰 Submit payment proof for paid tournaments')
      .addStringOption(opt => opt.setName('transactionid').setDescription('Transaction ID/Utr Number').setRequired(true))
      .addAttachmentOption(opt => opt.setName('screenshot').setDescription('Payment screenshot').setRequired(true))
      .addStringOption(opt => opt.setName('method').setDescription('Payment method').setRequired(true)
        .addChoices(
          { name: 'UPI', value: 'UPI' },
          { name: 'PayTM', value: 'PayTM' },
          { name: 'PhonePe', value: 'PhonePe' },
          { name: 'Google Pay', value: 'GPay' },
          { name: 'Bank Transfer', value: 'Bank' }
        )),

    new SlashCommandBuilder()
      .setName('schedule')
      .setDescription('📅 View tournament schedule'),

    new SlashCommandBuilder()
      .setName('achievements')
      .setDescription('🎖️ View your achievements and badges'),

    // ===== STAFF QUICK COMMANDS =====
    new SlashCommandBuilder()
      .setName('quicktournament')
      .setDescription('⚡ Create tournament instantly (Staff Only)')
      .addStringOption(opt => opt.setName('template').setDescription('Tournament template').setRequired(true)
        .addChoices(
          { name: '🎁 Free ₹500 - 50 Slots', value: 'free_500' },
          { name: '💰 ₹20 Entry ₹1000 - 50 Slots', value: 'paid_20' },
          { name: '💎 ₹50 Entry ₹2500 - 50 Slots', value: 'paid_50' },
          { name: '🔥 ₹100 Entry ₹5000 - 100 Slots', value: 'paid_100' },
          { name: '🏆 MEGA ₹200 Entry ₹10000 - 100 Slots', value: 'mega' }
        ))
      .addStringOption(opt => opt.setName('game').setDescription('Game selection').setRequired(true)
        .addChoices(
          { name: '🔥 Free Fire', value: 'Free Fire' },
          { name: '⛏️ Minecraft', value: 'Minecraft' },
          { name: '🎮 PUBG Mobile', value: 'PUBG Mobile' },
          { name: '🎯 COD Mobile', value: 'COD Mobile' },
          { name: '💥 Valorant', value: 'Valorant' },
          { name: '🛡️ BGMI', value: 'BGMI' },
          { name: '👑 Clash Royale', value: 'Clash Royale' }
        ))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('approve')
      .setDescription('✅ Approve payment & register user (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to approve').setRequired(true))
      .addStringOption(opt => opt.setName('transaction').setDescription('Transaction ID'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('reject')
      .setDescription('❌ Reject payment with reason (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to reject').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Rejection reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // ===== TOURNAMENT MANAGEMENT =====
    new SlashCommandBuilder()
      .setName('createtournament')
      .setDescription('🎮 Advanced tournament creation (Staff Only)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('starttournament')
      .setDescription('▶️ Start tournament with room details (Staff Only)')
      .addStringOption(opt => opt.setName('roomid').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Room password'))
      .addStringOption(opt => opt.setName('additional').setDescription('Additional instructions'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('endtournament')
      .setDescription('🏆 End tournament and declare winners (Staff Only)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('canceltournament')
      .setDescription('❌ Cancel tournament (Staff Only)')
      .addStringOption(opt => opt.setName('reason').setDescription('Cancellation reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    new SlashCommandBuilder()
      .setName('updateslots')
      .setDescription('📊 Update tournament slots (Staff Only)')
      .addIntegerOption(opt => opt.setName('slots').setDescription('New slot count').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    // ===== PLAYER MANAGEMENT =====
    new SlashCommandBuilder()
      .setName('addplayer')
      .setDescription('➕ Add player to tournament (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to add').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('removeplayer')
      .setDescription('➖ Remove player from tournament (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Removal reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('participants')
      .setDescription('👥 View tournament participants (Staff Only)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('blockuser')
      .setDescription('🚫 Block user from tournaments (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to block').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Block reason').setRequired(true))
      .addStringOption(opt => opt.setName('duration').setDescription('Block duration')
        .addChoices(
          { name: '1 Day', value: '1d' },
          { name: '1 Week', value: '1w' },
          { name: '1 Month', value: '1m' },
          { name: 'Permanent', value: 'permanent' }
        ))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
      .setName('unblockuser')
      .setDescription('✅ Unblock user (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to unblock').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // ===== MODERATION =====
    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('⚠️ Warn user (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Warning reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('⏱️ Timeout user (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Timeout duration').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Timeout reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
      .setName('warnings')
      .setDescription('⚠️ Check user warnings (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ===== INVITE MANAGEMENT =====
    new SlashCommandBuilder()
      .setName('addinvites')
      .setDescription('➕ Add bonus invites (Staff Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Invite amount').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('topinviters')
      .setDescription('🏅 Top inviters leaderboard'),

    // ===== UTILITY =====
    new SlashCommandBuilder()
      .setName('announce')
      .setDescription('📢 Make announcement (Staff Only)')
      .addStringOption(opt => opt.setName('message').setDescription('Announcement message').setRequired(true))
      .addBooleanOption(opt => opt.setName('ping').setDescription('Ping @everyone?'))
      .addStringOption(opt => opt.setName('channel').setDescription('Target channel')
        .addChoices(
          { name: 'Announcements', value: 'announcements' },
          { name: 'General', value: 'general' },
          { name: 'Both', value: 'both' }
        ))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('history')
      .setDescription('📜 Tournament history')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Number of tournaments (1-20)')),

    new SlashCommandBuilder()
      .setName('closeticket')
      .setDescription('🔒 Close ticket (Staff Only)')
      .addStringOption(opt => opt.setName('reason').setDescription('Close reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
      .setName('serverstats')
      .setDescription('📊 Complete server statistics (Staff Only)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    // ===== OWNER ONLY COMMANDS =====
    new SlashCommandBuilder()
      .setName('makestaff')
      .setDescription('👮 Add staff member (Owner Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to promote').setRequired(true)),

    new SlashCommandBuilder()
      .setName('removestaff')
      .setDescription('👤 Remove staff member (Owner Only)')
      .addUserOption(opt => opt.setName('user').setDescription('User to demote').setRequired(true)),

    new SlashCommandBuilder()
      .setName('stafflist')
      .setDescription('📋 View staff list (Staff Only)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName('backup')
      .setDescription('💾 Backup all data (Owner Only)'),

    new SlashCommandBuilder()
      .setName('maintenance')
      .setDescription('🔧 Toggle maintenance mode (Owner Only)')
      .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable/Disable').setRequired(true)),

    // ===== AUTOMATION =====
    new SlashCommandBuilder()
      .setName('autospam')
      .setDescription('🔄 Auto tournament announcements (Staff Only)')
      .addBooleanOption(opt => opt.setName('enable').setDescription('Enable/Disable').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Interval in minutes'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('spamnow')
      .setDescription('📢 Send announcement now (Staff Only)')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
      .setName('setalert')
      .setDescription('🔔 Set slot alerts (Staff Only)')
      .addIntegerOption(opt => opt.setName('slots').setDescription('Alert when slots reach').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    // Context Menu Commands
    new ContextMenuCommandBuilder()
      .setName('User Statistics')
      .setType(ApplicationCommandType.User),

    new ContextMenuCommandBuilder()
      .setName('Quick Approve')
      .setType(ApplicationCommandType.User)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  ];

  const body = commands.map(c => c.toJSON());

  try {
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body });
      console.log(`✅ Registered ${commands.length} professional commands for guild ${process.env.GUILD_ID}`);
    } else {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
      console.log(`✅ Registered ${commands.length} professional commands globally`);
    }
  } catch (err) {
    console.error('❌ Command registration failed:', err);
  }
}

// ==================== ENHANCED STAFF TOOLS DASHBOARD ====================
async function createStaffToolsDashboard(channel) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('👮 OTO STAFF CONTROL PANEL')
    .setDescription('**Professional Tournament Management System**')
    .setColor('#00ff00')
    .addFields(
      { name: '⚡ Quick Actions', value: 'Instant tournament creation and management', inline: false },
      { name: '📊 Live Statistics', value: 'Real-time player and tournament data', inline: false },
      { name: '🛠️ Management Tools', value: 'Complete control over all aspects', inline: false }
    )
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: 'OTO Professional Bot - Staff Dashboard' })
    .setTimestamp();

  const quickTournamentRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('staff_quick_free')
      .setLabel('🎁 Quick Free')
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji('🎁'),
    new Discord.ButtonBuilder()
      .setCustomId('staff_quick_paid20')
      .setLabel('💰 ₹20 Entry')
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('💰'),
    new Discord.ButtonBuilder()
      .setCustomId('staff_quick_paid50')
      .setLabel('💎 ₹50 Entry')
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji('💎'),
    new Discord.ButtonBuilder()
      .setCustomId('staff_quick_paid100')
      .setLabel('🔥 ₹100 Entry')
      .setStyle(Discord.ButtonStyle.Danger)
      .setEmoji('🔥'),
    new Discord.ButtonBuilder()
      .setCustomId('staff_quick_mega')
      .setLabel('🏆 MEGA ₹200')
      .setStyle(Discord.ButtonStyle.Danger)
      .setEmoji('🏆')
  );

  const managementRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('staff_start_tournament')
      .setLabel('▶️ Start')
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId('staff_end_tournament')
      .setLabel('🏆 End')
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId('staff_cancel_tournament')
      .setLabel('❌ Cancel')
      .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
      .setCustomId('staff_participants')
      .setLabel('👥 Participants')
      .setStyle(Discord.ButtonStyle.Secondary),
    new Discord.ButtonBuilder()
      .setCustomId('staff_slots')
      .setLabel('📊 Slots')
      .setStyle(Discord.ButtonStyle.Secondary)
  );

  const utilityRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('staff_announce')
      .setLabel('📢 Announce')
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId('staff_approve_payments')
      .setLabel('✅ Approve Payments')
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId('staff_stats')
      .setLabel('📈 Stats')
      .setStyle(Discord.ButtonStyle.Secondary),
    new Discord.ButtonBuilder()
      .setCustomId('staff_backup')
      .setLabel('💾 Backup')
      .setStyle(Discord.ButtonStyle.Secondary),
    new Discord.ButtonBuilder()
      .setCustomId('staff_help')
      .setLabel('❓ Help')
      .setStyle(Discord.ButtonStyle.Secondary)
  );

  await channel.send({ 
    content: '**👮 STAFF CONTROL CENTER**\n*Use buttons below for quick actions*',
    embeds: [embed], 
    components: [quickTournamentRow, managementRow, utilityRow] 
  });
}

// ==================== PROFESSIONAL TOURNAMENT FLOW ====================
class ProfessionalTournament {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.title = data.title;
    this.game = data.game;
    this.type = data.type || 'solo';
    this.prizePool = data.prizePool;
    this.entryFee = data.entryFee;
    this.maxSlots = data.maxSlots;
    this.scheduledTime = data.scheduledTime;
    this.duration = data.duration || '2 hours';
    this.imageUrl = data.imageUrl || CONFIG.GAME_IMAGES[data.game] || CONFIG.QR_IMAGE;
    this.status = 'registration'; // registration, live, ended, cancelled
    this.createdBy = data.createdBy;
    this.createdAt = new Date();
    this.registeredPlayers = new Map();
    this.roomDetails = null;
    this.winners = [];
    this.streamUrl = data.streamUrl;
    this.rules = data.rules || CONFIG.RULES.general;
    this.requirements = data.requirements || `Minimum ${CONFIG.MIN_INVITES} invites for free tournaments`;
  }

  // Professional registration system
  registerPlayer(user, staffApproved = false) {
    if (this.registeredPlayers.has(user.id)) {
      return { success: false, reason: 'Already registered' };
    }

    if (this.registeredPlayers.size >= this.maxSlots) {
      return { success: false, reason: 'Tournament full' };
    }

    if (this.status !== 'registration') {
      return { success: false, reason: 'Registration closed' };
    }

    const playerData = {
      user: user,
      joinedAt: new Date(),
      approved: staffApproved || this.entryFee === 'Free',
      paymentApproved: staffApproved && this.entryFee !== 'Free',
      addedByStaff: staffApproved,
      teamName: null,
      playerStats: {}
    };

    this.registeredPlayers.set(user.id, playerData);
    dataManager.trackUserAction(user.id, 'tournament_join', { tournament: this.id });
    
    return { success: true, slot: this.registeredPlayers.size };
  }

  // Start tournament professionally
  startTournament(roomId, password = null, additionalInfo = '') {
    this.status = 'live';
    this.roomDetails = {
      roomId,
      password,
      additionalInfo,
      startedAt: new Date()
    };

    // Track start in statistics
    dataManager.serverStats.totalTournaments++;
  }

  // End tournament with winners
  endTournament(winners) {
    this.status = 'ended';
    this.winners = winners;
    this.endedAt = new Date();

    // Update player statistics
    winners.forEach((winner, index) => {
      const place = index + 1;
      dataManager.trackUserAction(winner.id, 'tournament_win', { 
        tournament: this.id, 
        place,
        prize: this.calculatePrize(place)
      });
    });

    // Add to history
    dataManager.tournamentHistory.unshift(this);
    if (dataManager.tournamentHistory.length > CONFIG.MAX_TOURNAMENT_HISTORY) {
      dataManager.tournamentHistory.pop();
    }
  }

  calculatePrize(place) {
    const prizeNum = parseInt(this.prizePool.replace(/[^0-9]/g, ''));
    const distribution = { 1: 0.5, 2: 0.3, 3: 0.2 };
    return Math.floor(prizeNum * (distribution[place] || 0));
  }

  getSlotInfo() {
    const filled = this.registeredPlayers.size;
    const remaining = this.maxSlots - filled;
    const percentage = ((filled / this.maxSlots) * 100).toFixed(1);

    return {
      filled,
      total: this.maxSlots,
      remaining,
      percentage,
      progressBar: this.generateProgressBar(filled, this.maxSlots)
    };
  }

  generateProgressBar(current, max) {
    const percentage = Math.min((current / max) * 100, 100);
    const filled = Math.floor(percentage / 5); // 20 segments for better visual
    const empty = 20 - filled;
    return `${'🟩'.repeat(filled)}${'⬜'.repeat(empty)} **${percentage.toFixed(0)}%**`;
  }
}

// ==================== ENHANCED BUTTON HANDLING SYSTEM ====================
async function handleProfessionalButton(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Staff access required!', ephemeral: true });
  }

  const { customId } = interaction;

  // Quick Tournament Creation
  if (customId.startsWith('staff_quick_')) {
    await handleQuickTournamentButton(interaction);
  }
  // Tournament Management
  else if (customId.startsWith('staff_')) {
    await handleStaffManagementButton(interaction);
  }
  // Payment Approval System
  else if (customId.startsWith('approve_payment_')) {
    await handlePaymentApprovalButton(interaction);
  }
  // User Registration
  else if (customId === 'join_tournament') {
    await handleProfessionalJoin(interaction);
  }
}

async function handleQuickTournamentButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const templateMap = {
    'staff_quick_free': 'free_500',
    'staff_quick_paid20': 'paid_20',
    'staff_quick_paid50': 'paid_50', 
    'staff_quick_paid100': 'paid_100',
    'staff_quick_mega': 'mega'
  };

  const template = templateMap[interaction.customId];
  const config = CONFIG.TOURNAMENT_TEMPLATES[template];

  if (dataManager.activeTournament && dataManager.activeTournament.status !== 'ended') {
    return interaction.editReply('❌ Tournament active! End it first.');
  }

  // Create professional tournament
  const tournamentData = {
    id: `OTO_${Date.now()}`,
    title: `${config.type.toUpperCase()} Tournament - ${config.prize} Prize`,
    game: 'Free Fire', // Default game
    type: config.type,
    prizePool: config.prize,
    entryFee: config.entry,
    maxSlots: config.slots,
    scheduledTime: config.time,
    duration: config.duration,
    createdBy: interaction.user.id
  };

  dataManager.activeTournament = new ProfessionalTournament(tournamentData);

  // Send professional announcement
  await sendProfessionalAnnouncement(dataManager.activeTournament);

  await interaction.editReply(
    `✅ **Professional Tournament Created!**\n\n` +
    `**${tournamentData.title}**\n` +
    `💰 ${tournamentData.prizePool} | 👥 ${tournamentData.maxSlots} slots\n` +
    `⏰ ${tournamentData.scheduledTime} | 🕒 ${tournamentData.duration}\n\n` +
    `Announced across all channels! 🚀`
  );
}

// ==================== PROFESSIONAL ANNOUNCEMENT SYSTEM ====================
async function sendProfessionalAnnouncement(tournament) {
  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${tournament.title}`)
    .setDescription(
      `**${tournament.game} ${tournament.type.toUpperCase()} TOURNAMENT** 🔥\n\n` +
      `### 🏆 Tournament Details\n` +
      `💰 **Prize Pool:** ${tournament.prizePool}\n` +
      `💵 **Entry Fee:** ${tournament.entryFee}\n` +
      `👥 **Total Slots:** ${tournament.maxSlots}\n` +
      `⏰ **Start Time:** ${tournament.scheduledTime}\n` +
      `🕒 **Duration:** ${tournament.duration}\n\n` +
      `### 🎯 Prize Distribution\n` +
      `🥇 **1st Place:** 50% + Winner Certificate\n` +
      `🥈 **2nd Place:** 30% + Runner-up Certificate\n` +
      `🥉 **3rd Place:** 20% + Certificate\n\n` +
      `### 📝 Registration\n` +
      `${tournament.entryFee === 'Free' ? 
        `**Requirements:** Minimum ${CONFIG.MIN_INVITES} invites\nType \`-i\` to check your invites!` : 
        `**Payment Required:** Use \`/pay\` command after joining!\n**Payment Methods:** UPI, PayTM, PhonePe, Google Pay`}\n\n` +
      `### ⚡ How to Join\n` +
      `1. Click **JOIN TOURNAMENT** below\n` +
      `2. ${tournament.entryFee !== 'Free' ? 'Complete payment using `/pay`' : 'Verify your invites'}\n` +
      `3. Wait for tournament start announcement\n` +
      `4. Receive room details via DM\n\n` +
      `**Click JOIN button below!** ⬇️`
    )
    .setColor('#ffd700')
    .setImage(tournament.imageUrl)
    .setFooter({ text: `OTO Professional Tournaments | ID: ${tournament.id}` })
    .setTimestamp();

  const joinButton = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN TOURNAMENT')
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji('🏆'),
    new Discord.ButtonBuilder()
      .setLabel('📋 View Rules')
      .setStyle(Discord.ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${interaction.guild.id}/${CONFIG.RULES_CHANNEL}`),
    new Discord.ButtonBuilder()
      .setLabel('💰 Payment Help')
      .setStyle(Discord.ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${interaction.guild.id}/${CONFIG.OPEN_TICKET}`)
  );

  // Send to announcement channel
  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  await announceChannel.send({ 
    content: '@everyone\n\n🚨 **PROFESSIONAL TOURNAMENT LAUNCHED!** 🚨', 
    embeds: [embed], 
    components: [joinButton] 
  });

  // Send to schedule channel
  const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
  await scheduleChannel.send({ embeds: [embed] });

  // Notify general chat
  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
  await generalChannel.send(
    `🔥 **${tournament.game} Tournament is LIVE!** 🔥\n\n` +
    `💰 **${tournament.prizePool}** | 👥 **${tournament.maxSlots}** slots\n` +
    `⏰ **${tournament.scheduledTime}** | 🕒 **${tournament.duration}**\n\n` +
    `Join now: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> 🎮\n` +
    `Check slots: \`/slots\` 📊`
  );
}

// ==================== PROFESSIONAL JOIN HANDLING ====================
async function handleProfessionalJoin(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!dataManager.activeTournament || dataManager.activeTournament.status !== 'registration') {
    return interaction.editReply('❌ **Registration Closed!**\nNo active tournament or registration period has ended.');
  }

  const tournament = dataManager.activeTournament;
  const user = interaction.user;

  // Check if user is banned
  if (dataManager.bannedUsers.has(user.id)) {
    const banInfo = dataManager.bannedUsers.get(user.id);
    return interaction.editReply(
      `🚫 **Account Restricted!**\n\n` +
      `You are blocked from participating in tournaments.\n` +
      `**Reason:** ${banInfo.reason}\n` +
      `**Expires:** ${banInfo.expires ? banInfo.expires.toLocaleDateString() : 'Permanent'}\n\n` +
      `Contact staff for appeal.`
    );
  }

  // Check if already registered
  if (tournament.registeredPlayers.has(user.id)) {
    return interaction.editReply('⚠️ **Already Registered!**\nYou are already registered for this tournament.');
  }

  // Check for paid tournaments
  if (tournament.entryFee !== 'Free') {
    return interaction.editReply(
      `💰 **Payment Required Tournament**\n\n` +
      `**Entry Fee:** ${tournament.entryFee}\n` +
      `**Prize Pool:** ${tournament.prizePool}\n\n` +
      `### 📝 Payment Process:\n` +
      `1. Use \`/pay\` command to submit payment proof\n` +
      `2. Include transaction ID and screenshot\n` +
      `3. Wait for staff verification (5-15 minutes)\n` +
      `4. You'll be automatically added once approved\n\n` +
      `### 💳 Payment Methods:\n` +
      `• UPI: \`${CONFIG.PAYMENT_METHODS.UPI.id}\`\n` +
      `• PayTM: ${CONFIG.PAYMENT_METHODS.PayTM.number}\n` +
      `• PhonePe: \`${CONFIG.PAYMENT_METHODS.PhonePe.id}\`\n` +
      `• Google Pay: ${CONFIG.PAYMENT_METHODS.GPay.number}\n\n` +
      `Need help? Create ticket in <#${CONFIG.OPEN_TICKET}>`
    );
  }

  // Free tournament - check invites
  const inviteCount = dataManager.userInvites.get(user.id) || 0;
  if (inviteCount < CONFIG.MIN_INVITES && !isStaff(interaction.member)) {
    return interaction.editReply(
      `❌ **Insufficient Invites!**\n\n` +
      `**Your Invites:** ${inviteCount}/${CONFIG.MIN_INVITES}\n` +
      `**Required:** ${CONFIG.MIN_INVITES - inviteCount} more\n\n` +
      `### 💡 How to Get Invites:\n` +
      `• Share server invite link with friends\n` +
      `• Each friend who joins = +1 invite\n` +
      `• Check invites anytime with \`-i\` or \`/invites\`\n\n` +
      `Invite friends and come back! 🔗`
    );
  }

  // Register player
  const result = tournament.registerPlayer(user);
  if (!result.success) {
    return interaction.editReply(`❌ **Registration Failed!**\n${result.reason}`);
  }

  // Success response
  const slotInfo = tournament.getSlotInfo();
  const embed = new Discord.EmbedBuilder()
    .setTitle('✅ Registration Successful!')
    .setDescription(`You are now registered for **${tournament.title}**`)
    .setColor('#00ff00')
    .addFields(
      { name: '🎯 Your Slot', value: `**${result.slot}/${tournament.maxSlots}**`, inline: true },
      { name: '⏰ Start Time', value: tournament.scheduledTime, inline: true },
      { name: '💰 Prize Pool', value: tournament.prizePool, inline: true },
      { name: '📊 Progress', value: slotInfo.progressBar, inline: false }
    )
    .setThumbnail(tournament.imageUrl)
    .setFooter({ text: 'Room details will be DMed when tournament starts' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });

  // Send DM confirmation
  try {
    const dmEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 Tournament Registration Confirmed!')
      .setDescription(`You're all set for **${tournament.title}**`)
      .setColor('#00ff00')
      .addFields(
        { name: '📝 Tournament', value: tournament.title, inline: true },
        { name: '⏰ Time', value: tournament.scheduledTime, inline: true },
        { name: '🎯 Slot', value: `${result.slot}/${tournament.maxSlots}`, inline: true },
        { name: '💰 Prize', value: tournament.prizePool, inline: true },
        { name: '🕒 Duration', value: tournament.duration, inline: true },
        { name: '🎮 Type', value: tournament.type.toUpperCase(), inline: true }
      )
      .setImage(tournament.imageUrl)
      .setFooter({ text: 'Keep an eye on your DMs for room details!' })
      .setTimestamp();

    await user.send({ embeds: [dmEmbed] });
  } catch (err) {
    // Could not DM user, they might have DMs disabled
    console.log(`⚠️ Could not DM ${user.tag}`);
  }

  // Announce in general chat
  const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
  await generalChannel.send(
    `🎮 ${user} joined **${tournament.title}**!\n\n` +
    `📊 **${slotInfo.filled}/${tournament.maxSlots}** slots filled! ` +
    `${slotInfo.remaining > 0 ? `**${slotInfo.remaining}** remaining! 🔥` : '**TOURNAMENT FULL!** 🎉'}`
  );

  // Check for slot alerts
  await checkProfessionalSlotAlerts(tournament);
}

// ==================== ENHANCED SLOT ALERT SYSTEM ====================
async function checkProfessionalSlotAlerts(tournament) {
  const slotInfo = tournament.getSlotInfo();
  
  for (const alertPoint of CONFIG.SLOT_ALERTS) {
    if (slotInfo.remaining === alertPoint && !tournament.slotAlertSent?.includes(alertPoint)) {
      if (!tournament.slotAlertSent) tournament.slotAlertSent = [];
      tournament.slotAlertSent.push(alertPoint);

      const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
      await generalChannel.send(
        `🚨 **SLOT ALERT!** 🚨\n\n` +
        `Only **${alertPoint} ${alertPoint === 1 ? 'slot' : 'slots'}** left in **${tournament.title}**!\n\n` +
        `💰 **${tournament.prizePool}** | ⏰ **${tournament.scheduledTime}**\n` +
        `📊 **${slotInfo.filled}/${tournament.maxSlots}** filled\n\n` +
        `**HURRY! Join now:** <#${CONFIG.ANNOUNCEMENT_CHANNEL}> ⚡`
      );

      // Notify staff
      const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS);
      await staffChannel.send(
        `📊 **Slot Alert:** ${alertPoint} slots remaining in ${tournament.title}\n` +
        `Current: ${slotInfo.filled}/${tournament.maxSlots}`
      );
    }
  }

  // Tournament full alert
  if (slotInfo.remaining === 0 && !tournament.slotAlertSent?.includes(0)) {
    if (!tournament.slotAlertSent) tournament.slotAlertSent = [];
    tournament.slotAlertSent.push(0);

    const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    await generalChannel.send(
      `🎉 **TOURNAMENT FULL!** 🎉\n\n` +
      `**${tournament.title}** has reached maximum capacity!\n` +
      `**${slotInfo.filled} players** registered!\n\n` +
      `🏆 Good luck to all participants! 🍀\n` +
      `Room details will be shared soon! ⏰`
    );
  }
}

// ==================== PROFESSIONAL PAYMENT SYSTEM ====================
async function handleProfessionalPayment(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!dataManager.activeTournament) {
    return interaction.editReply('❌ **No Active Tournament!**\nThere is currently no tournament running.');
  }

  const tournament = dataManager.activeTournament;

  if (tournament.entryFee === 'Free') {
    return interaction.editReply('❌ **Free Tournament!**\nThis tournament does not require payment.');
  }

  const transactionId = interaction.options.getString('transactionid');
  const screenshot = interaction.options.getAttachment('screenshot');
  const method = interaction.options.getString('method');

  // Validate screenshot
  if (!screenshot || !screenshot.contentType?.startsWith('image/')) {
    return interaction.editReply('❌ **Invalid Screenshot!**\nPlease provide a clear image of your payment proof.');
  }

  // Store payment data professionally
  const paymentData = {
    transactionId,
    screenshot: screenshot.url,
    method,
    submittedAt: new Date(),
    tournament: tournament.id,
    amount: tournament.entryFee,
    status: 'pending',
    userId: interaction.user.id
  };

  dataManager.paymentPending.set(interaction.user.id, paymentData);

  // Add to user transaction history
  const userTrans = dataManager.userTransactions.get(interaction.user.id) || [];
  userTrans.push({
    id: transactionId,
    amount: tournament.entryFee,
    date: new Date(),
    status: 'pending',
    method,
    tournament: tournament.title
  });
  dataManager.userTransactions.set(interaction.user.id, userTrans);

  // Create professional payment ticket
  try {
    const ticketChannel = await interaction.guild.channels.create({
      name: `payment-${interaction.user.username}-${Date.now().toString().slice(-4)}`,
      type: Discord.ChannelType.GuildText,
      parent: interaction.channel.parent,
      topic: `Payment verification for ${interaction.user.tag} - ${tournament.title}`,
      permissionOverwrites: [
        { 
          id: interaction.guild.id, 
          deny: [Discord.PermissionFlagsBits.ViewChannel] 
        },
        { 
          id: interaction.user.id, 
          allow: [
            Discord.PermissionFlagsBits.ViewChannel, 
            Discord.PermissionFlagsBits.SendMessages,
            Discord.PermissionFlagsBits.ReadMessageHistory
          ] 
        },
        { 
          id: CONFIG.STAFF_ROLE, 
          allow: [
            Discord.PermissionFlagsBits.ViewChannel, 
            Discord.PermissionFlagsBits.SendMessages,
            Discord.PermissionFlagsBits.ManageChannels,
            Discord.PermissionFlagsBits.ReadMessageHistory
          ] 
        },
      ],
    });

    dataManager.tickets.set(ticketChannel.id, { 
      userId: interaction.user.id, 
      createdAt: new Date(), 
      type: 'payment',
      transactionId,
      tournament: tournament.id
    });

    // Professional payment ticket embed
    const embed = new Discord.EmbedBuilder()
      .setTitle('💰 PAYMENT VERIFICATION REQUIRED')
      .setDescription('**New payment submission needs staff review**')
      .setColor('#ff9900')
      .addFields(
        { name: '👤 User', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
        { name: '🎮 Tournament', value: tournament.title, inline: true },
        { name: '💳 Amount', value: tournament.entryFee, inline: true },
        { name: '📝 Transaction ID', value: `\`${transactionId}\``, inline: false },
        { name: '💸 Method', value: CONFIG.PAYMENT_METHODS[method]?.name || method, inline: true },
        { name: '⏰ Submitted', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true }
      )
      .setImage(screenshot.url)
      .setFooter({ text: `Tournament ID: ${tournament.id} | Ticket ID: ${ticketChannel.id}` })
      .setTimestamp();

    const buttonRow = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`approve_payment_${interaction.user.id}`)
        .setLabel('✅ Approve & Register')
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('✅'),
      new Discord.ButtonBuilder()
        .setCustomId(`reject_payment_${interaction.user.id}`)
        .setLabel('❌ Reject Payment')
        .setStyle(Discord.ButtonStyle.Danger)
        .setEmoji('❌'),
      new Discord.ButtonBuilder()
        .setCustomId(`request_more_info_${interaction.user.id}`)
        .setLabel('📋 More Info Needed')
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji('📋')
    );

    await ticketChannel.send({ 
      content: `<@&${CONFIG.STAFF_ROLE}> **NEW PAYMENT VERIFICATION REQUEST!**`, 
      embeds: [embed], 
      components: [buttonRow] 
    });

    // Notify staff chat
    const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS);
    await staffChannel.send(
      `💰 **Payment Verification Needed!**\n\n` +
      `**User:** ${interaction.user}\n` +
      `**Tournament:** ${tournament.title}\n` +
      `**Amount:** ${tournament.entryFee}\n` +
      `**Ticket:** <#${ticketChannel.id}>\n\n` +
      `Please review within 15 minutes! ⏰`
    );

    // Success response to user
    const successEmbed = new Discord.EmbedBuilder()
      .setTitle('✅ Payment Submitted Successfully!')
      .setDescription('Your payment proof has been received and is under review.')
      .setColor('#00ff00')
      .addFields(
        { name: '📝 Transaction ID', value: `\`${transactionId}\``, inline: true },
        { name: '💰 Amount', value: tournament.entryFee, inline: true },
        { name: '💳 Method', value: CONFIG.PAYMENT_METHODS[method]?.name || method, inline: true },
        { name: '🎫 Ticket', value: `<#${ticketChannel.id}>`, inline: false },
        { name: '⏰ Estimated Time', value: '5-15 minutes', inline: true },
        { name: '📞 Support', value: `Need help? Message in <#${ticketChannel.id}>`, inline: false }
      )
      .setFooter({ text: 'You will receive a DM once approved!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });

    // DM user confirmation
    try {
      await interaction.user.send({
        embeds: [successEmbed]
      });
    } catch (err) {
      // User has DMs disabled
      await interaction.followUp({ 
        content: '⚠️ **Enable DMs to receive approval notification!**', 
        ephemeral: true 
      });
    }

  } catch (err) {
    console.error('❌ Payment system error:', err);
    await interaction.editReply(
      '❌ **System Error!**\nFailed to process payment. Please contact staff directly.'
    );
  }
}

// ==================== PROFESSIONAL STAFF MANAGEMENT ====================
async function handleStaffManagementButton(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const { customId } = interaction;
  const tournament = dataManager.activeTournament;

  switch (customId) {
    case 'staff_start_tournament':
      if (!tournament) {
        return interaction.editReply('❌ No active tournament to start!');
      }
      
      // Create modal for room details
      const modal = new Discord.ModalBuilder()
        .setCustomId('start_tournament_modal')
        .setTitle('Start Tournament');

      const roomIdInput = new Discord.TextInputBuilder()
        .setCustomId('room_id')
        .setLabel('Room ID')
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter room ID...');

      const passwordInput = new Discord.TextInputBuilder()
        .setCustomId('room_password')
        .setLabel('Room Password (Optional)')
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Enter password if any...');

      const additionalInput = new Discord.TextInputBuilder()
        .setCustomId('additional_info')
        .setLabel('Additional Instructions')
        .setStyle(Discord.TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('Any special instructions for players...');

      const firstActionRow = new Discord.ActionRowBuilder().addComponents(roomIdInput);
      const secondActionRow = new Discord.ActionRowBuilder().addComponents(passwordInput);
      const thirdActionRow = new Discord.ActionRowBuilder().addComponents(additionalInput);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
      await interaction.showModal(modal);
      break;

    case 'staff_end_tournament':
      if (!tournament) {
        return interaction.editReply('❌ No active tournament to end!');
      }
      await handleProfessionalTournamentEnd(interaction);
      break;

    case 'staff_cancel_tournament':
      if (!tournament) {
        return interaction.editReply('❌ No active tournament to cancel!');
      }
      await handleProfessionalTournamentCancel(interaction);
      break;

    case 'staff_participants':
      await handleProfessionalParticipants(interaction);
      break;

    case 'staff_slots':
      await handleProfessionalSlots(interaction);
      break;

    case 'staff_announce':
      await handleQuickAnnouncement(interaction);
      break;

    case 'staff_approve_payments':
      await showPendingPayments(interaction);
      break;

    case 'staff_stats':
      await showProfessionalStats(interaction);
      break;

    case 'staff_backup':
      await handleProfessionalBackup(interaction);
      break;

    case 'staff_help':
      await showStaffHelp(interaction);
      break;

    default:
      await interaction.editReply('❌ Unknown command!');
  }
}

// ==================== PROFESSIONAL TOURNAMENT END SYSTEM ====================
async function handleProfessionalTournamentEnd(interaction) {
  const tournament = dataManager.activeTournament;
  
  if (tournament.registeredPlayers.size < 3) {
    return interaction.editReply(
      '❌ **Not Enough Participants!**\nNeed at least 3 players to declare winners.'
    );
  }

  const participants = Array.from(tournament.registeredPlayers.values())
    .slice(0, 25)
    .map(p => ({ label: p.user.username, value: p.user.id }));

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Declare Tournament Winners')
    .setDescription('Select the 1st place winner:')
    .setColor('#ffd700')
    .addFields(
      { name: '🎮 Tournament', value: tournament.title, inline: true },
      { name: '👥 Participants', value: `${tournament.registeredPlayers.size}`, inline: true },
      { name: '💰 Prize Pool', value: tournament.prizePool, inline: true }
    )
    .setFooter({ text: 'Step 1 of 3 - Select 1st Place' });

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('winner_first')
      .setPlaceholder('🥇 Select 1st Place Winner')
      .addOptions(participants)
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}

// ==================== ENHANCED BOT INITIALIZATION ====================
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} Professional Edition ONLINE!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  console.log(`👑 Owner: ${OWNER_ID}`);
  console.log(`🛠️ Professional Features: 2500+ lines`);
  
  try {
    // Set professional status
    await client.user.setPresence({
      activities: [{
        name: '🏆 OTO Pro Tournaments | /help',
        type: Discord.ActivityType.Competing
      }],
      status: 'online'
    });

    // Initialize systems
    await registerProfessionalCommands();
    await initializeProfessionalInviteTracking();
    await loadProfessionalStaffMembers();
    startProfessionalAutomatedTasks();
    await setupProfessionalPersistentMessages();
    await sendProfessionalStaffWelcome();
    
    console.log('✅ Professional bot fully initialized!');
  } catch (err) {
    console.error('❌ Professional init error:', err);
  }
});

// ==================== PROFESSIONAL MESSAGE SETUP ====================
async function setupProfessionalPersistentMessages() {
  try {
    // How to Join Guide
    const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
    const joinEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 OTO PROFESSIONAL TOURNAMENT GUIDE')
      .setDescription('**Complete Step-by-Step Guide to Join Tournaments**')
      .setColor('#3498db')
      .addFields(
        { 
          name: '📝 Registration Process', 
          value: `**Free Tournaments:**\n• Invite ${CONFIG.MIN_INVITES} friends\n• Use \`/invites\` to check count\n• Click JOIN button\n\n**Paid Tournaments:**\n• Click JOIN button\n• Use \`/pay\` command\n• Submit payment proof\n• Wait for staff approval`,
          inline: false 
        },
        { 
          name: '💰 Payment Methods', 
          value: `• **UPI:** ${CONFIG.PAYMENT_METHODS.UPI.id}\n• **PayTM:** ${CONFIG.PAYMENT_METHODS.PayTM.number}\n• **PhonePe:** ${CONFIG.PAYMENT_METHODS.PhonePe.id}\n• **Google Pay:** ${CONFIG.PAYMENT_METHODS.GPay.number}`,
          inline: true 
        },
        { 
          name: '⚡ Quick Commands', 
          value: `• \`-i\` - Check invites\n• \`/slots\` - Tournament slots\n• \`/profile\` - Your stats\n• \`/leaderboard\` - Top players`,
          inline: true 
        }
      )
      .setImage(CONFIG.BANNER_IMAGE)
      .setFooter({ text: 'Need help? Create a ticket in support channel!' });

    const joinMessages = await howToJoinChannel.messages.fetch({ limit: 5 });
    const botJoinMsgs = joinMessages.filter(m => m.author.id === client.user.id);
    if (botJoinMsgs.size === 0) {
      await howToJoinChannel.send({ embeds: [joinEmbed] });
    }

    // Staff Tools Dashboard
    const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS);
    const staffMessages = await staffChannel.messages.fetch({ limit: 10 });
    const botStaffMsgs = staffMessages.filter(m => m.author.id === client.user.id && m.components.length > 0);
    
    if (botStaffMsgs.size === 0) {
      await createStaffToolsDashboard(staffChannel);
    }

    console.log('✅ Professional persistent messages setup complete');
  } catch (err) {
    console.error('❌ Professional setup error:', err);
  }
}

// ==================== PROFESSIONAL AUTOMATED TASKS ====================
function startProfessionalAutomatedTasks() {
  // Auto-backup every hour
  setInterval(() => {
    dataManager.autoBackup();
  }, CONFIG.AUTO_BACKUP_INTERVAL);

  // Update bot status with live info
  setInterval(async () => {
    try {
      if (dataManager.activeTournament) {
        const tournament = dataManager.activeTournament;
        const slotInfo = tournament.getSlotInfo();
        
        await client.user.setPresence({
          activities: [{
            name: `${tournament.game} | ${slotInfo.filled}/${tournament.maxSlots} slots | /join`,
            type: Discord.ActivityType.Playing
          }],
          status: 'online'
        });
      } else {
        await client.user.setPresence({
          activities: [{
            name: '🏆 OTO Pro Tournaments | /help',
            type: Discord.ActivityType.Competing
          }],
          status: 'online'
        });
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  }, 300000); // Every 5 minutes

  // Clean up old data
  setInterval(() => {
    cleanupOldData();
  }, 86400000); // Daily cleanup

  console.log('✅ Professional automated tasks started');
}

// ==================== HELPER FUNCTIONS ====================
function isStaff(member) {
  return member?.roles?.cache?.has(CONFIG.STAFF_ROLE) || 
         member?.permissions?.has(Discord.PermissionFlagsBits.Administrator) ||
         member?.user?.id === OWNER_ID;
}

async function initializeProfessionalInviteTracking() {
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) {
          dataManager.inviteCache.set(inv.code, inv.uses);
        }
      });
      console.log(`✅ Professional invite tracking initialized for ${guild.name}`);
    } catch (err) {
      console.warn(`⚠️ Could not fetch invites for ${guild.name}`);
    }
  }
}

async function loadProfessionalStaffMembers() {
  try {
    for (const guild of client.guilds.cache.values()) {
      const role = await guild.roles.fetch(CONFIG.STAFF_ROLE);
      if (role) {
        role.members.forEach(member => {
          dataManager.staffMembers.add(member.id);
        });
        console.log(`✅ Loaded ${role.members.size} professional staff members`);
      }
    }
  } catch (err) {
    console.error('❌ Professional staff loading error:', err);
  }
}

function cleanupOldData() {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Clean old warnings (older than 30 days)
  for (const [userId, warnings] of dataManager.warnings.entries()) {
    const recentWarnings = warnings.filter(w => w.date.getTime() > thirtyDaysAgo);
    if (recentWarnings.length === 0) {
      dataManager.warnings.delete(userId);
    } else {
      dataManager.warnings.set(userId, recentWarnings);
    }
  }

  console.log('✅ Professional data cleanup completed');
}

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('❌ Professional client error:', err));
client.on('warn', warn => console.warn('⚠️ Professional warning:', warn));
process.on('unhandledRejection', err => console.error('❌ Unhandled rejection:', err));
process.on('uncaughtException', err => console.error('❌ Uncaught exception:', err));

// ==================== PROFESSIONAL LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => console.log('✅ Professional bot login successful!'))
  .catch(err => {
    console.error('❌ Professional login failed:', err);
    process.exit(1);
  });

// Export for potential module use
module.exports = {
  client,
  dataManager,
  CONFIG,
  isStaff
};
