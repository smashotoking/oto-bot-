// ═══════════════════════════════════════════════════════════════
// 🎮 OTO TOURNAMENT BOT - ULTIMATE DISCORD BOT
// ═══════════════════════════════════════════════════════════════
// Features: 50+ Advanced Features, No Database Required
// Storage: JSON Files Only
// Version: 2.0.0
// ═══════════════════════════════════════════════════════════════

const { 
  Client, 
  GatewayIntentBits, 
  Partials,
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
  ChannelType,
  AttachmentBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// 📝 CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // Channel IDs
  CHANNELS: {
    MINECRAFT: '1439223955960627421',
    LEADERBOARD_TOP_PLAYERS: '1439226024863993988',
    TICKET_LOG: '1438485821572518030',
    MATCH_REPORTS: '1438486113047150714',
    ANNOUNCEMENT: '1438484746165555243',
    TOURNAMENT_SCHEDULE: '1438482561679626303',
    HOW_TO_JOIN: '1438482512296022017',
    RULES: '1438482342145687643',
    BOT_COMMANDS: '1438483009950191676',
    GENERAL_CHAT: '1438482904018849835',
    OPEN_TICKET: '1438485759891079180',
    LEADERBOARD_INVITES: '1438947356690223347',
    STAFF_TOOLS: '1438486059255336970',
    STAFF_CHAT: '1438486059255336970',
    PAYMENT_PROOF: '1438486113047150714',
    PLAYER_FORM: '1438486008453660863',
    PROFILE_SECTION: '1439542574066176020',
    INVITE_TRACKER: '1439216884774998107'
  },
  
  // Role IDs
  ROLES: {
    OWNER: '1438443937588183110',
    STAFF: '1438475461977047112',
    ADMIN: '1438475461977047112',
    VERIFIED: 'auto_create',
    PLAYER: 'auto_create',
    VIP: 'auto_create',
    // Dynamic invite roles
    BEGINNER_RECRUITER: 'auto_create',
    RECRUITER: 'auto_create',
    PRO_RECRUITER: 'auto_create',
    ELITE_RECRUITER: 'auto_create',
    MASTER_RECRUITER: 'auto_create',
    LEGEND_RECRUITER: 'auto_create'
  },

  // Bot Settings
  BOT: {
    PREFIX: '-',
    COLOR: '#FF6B6B',
    FOOTER: 'OTO Tournaments | Play • Win • Earn',
    THUMBNAIL: 'https://i.imgur.com/placeholder.png',
    AUTO_RESPONSE_DELAY: 120000, // 2 minutes
    TICKET_AUTO_CLOSE: 600000, // 10 minutes
    SLOT_RELEASE_TIME: 900000 // 15 minutes for payment
  },

  // Invite Rewards
  INVITE_REWARDS: {
    5: { role: 'BEGINNER_RECRUITER', reward: 'Role: 🌱 Beginner Recruiter' },
    10: { role: 'RECRUITER', reward: 'FREE Tournament Entry + Role: 📢 Recruiter' },
    15: { discount: 50, reward: '50% discount on next entry' },
    20: { role: 'PRO_RECRUITER', reward: 'FREE Tournament + Role: ⭐ Pro Recruiter' },
    25: { freeChoice: true, reward: 'Choose any tournament free' },
    30: { role: 'ELITE_RECRUITER', reward: 'FREE Premium Tournament + Role: 💎 Elite Recruiter' },
    50: { role: 'MASTER_RECRUITER', reward: 'Custom Role + 3 FREE entries + Role: 👑 Master Recruiter' },
    100: { role: 'LEGEND_RECRUITER', lifetimeDiscount: 50, reward: 'Lifetime 50% discount + Role: 🔥 Legend Recruiter' }
  },

  // Bad Words (Moderation)
  BAD_WORDS: {
    LEVEL_1: ['noob', 'trash', 'bad', 'weak', 'loser'],
    LEVEL_2: ['idiot', 'stupid', 'dumb', 'fool'],
    LEVEL_3: ['mc', 'bc', 'dm', 'bkl', 'lawde'],
    LEVEL_4: ['maa ki chut', 'tmkc', 'extreme_abuse']
  }
};

// ═══════════════════════════════════════════════════════════════
// 🗄️ DATA STORAGE (JSON FILES)
// ═══════════════════════════════════════════════════════════════

class DataStore {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.files = {
      users: 'users.json',
      tournaments: 'tournaments.json',
      tickets: 'tickets.json',
      invites: 'invites.json',
      warnings: 'warnings.json',
      leaderboard: 'leaderboard.json',
      stats: 'stats.json',
      squads: 'squads.json',
      achievements: 'achievements.json'
    };
    
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    for (const [key, filename] of Object.entries(this.files)) {
      const filepath = path.join(this.dataDir, filename);
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify({}));
      }
    }
  }

  load(type) {
    try {
      const filepath = path.join(this.dataDir, this.files[type]);
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      return {};
    }
  }

  save(type, data) {
    try {
      const filepath = path.join(this.dataDir, this.files[type]);
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  }

  // Auto-save every 5 minutes
  startAutoSave() {
    setInterval(() => {
      console.log('🔄 Auto-saving data...');
      // Data is saved on every change, this is just a checkpoint
    }, 300000);
  }
}

// ═══════════════════════════════════════════════════════════════
// 🤖 BOT INITIALIZATION
// ═══════════════════════════════════════════════════════════════

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.Reaction]
});

const dataStore = new DataStore();

// ═══════════════════════════════════════════════════════════════
// 🎨 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const Utils = {
  // Generate unique ID
  generateId: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Generate OTO ID
  generateOtoId: (username) => {
    const prefix = 'OTO';
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  },

  // Format currency
  formatCurrency: (amount) => `₹${amount.toLocaleString('en-IN')}`,

  // Time formatting
  formatTime: (date) => {
    return new Date(date).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  // Random element from array
  random: (array) => array[Math.floor(Math.random() * array.length)],

  // Create embed
  createEmbed: (title, description, color = CONFIG.BOT.COLOR) => {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setFooter({ text: CONFIG.BOT.FOOTER })
      .setTimestamp();
  },

  // Create error embed
  errorEmbed: (message) => {
    return new EmbedBuilder()
      .setTitle('❌ Error')
      .setDescription(message)
      .setColor('#FF0000')
      .setFooter({ text: CONFIG.BOT.FOOTER })
      .setTimestamp();
  },

  // Create success embed
  successEmbed: (message) => {
    return new EmbedBuilder()
      .setTitle('✅ Success')
      .setDescription(message)
      .setColor('#00FF00')
      .setFooter({ text: CONFIG.BOT.FOOTER })
      .setTimestamp();
  },

  // Wait function
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// ═══════════════════════════════════════════════════════════════
// 👤 USER PROFILE SYSTEM
// ═══════════════════════════════════════════════════════════════

class ProfileManager {
  constructor() {
    this.welcomeMessages = [
      "🔥 Yo! Welcome to OTO Tournaments! Ready to win big?",
      "💪 A new warrior has arrived! Let's goooo!",
      "🎮 Welcome bro! Your journey to ₹₹₹ starts now!",
      "⚡ New player detected! Tournament kheloge?",
      "🌟 Welcome to the squad! Time to dominate!",
      "👑 A future champion just joined! Let's go!",
      "🎯 Ready to become a legend? Welcome!",
      "💎 Welcome! Your winning streak starts here!",
      "🚀 Blast off! New player ready to conquer!",
      "🔥 Aag laga denge! Welcome warrior!"
    ];
  }

  async createProfile(user, guild) {
    const users = dataStore.load('users');
    
    if (users[user.id]) {
      return { exists: true, profile: users[user.id] };
    }

    // Send DM to create profile
    try {
      const embed = Utils.createEmbed(
        '🎮 Welcome to OTO Tournaments!',
        `Hey ${user.username}! 👋\n\n` +
        `To start your journey, please complete your profile.\n\n` +
        `Click the button below to start! 🚀`
      );

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_profile_start')
            .setLabel('📝 Complete Profile')
            .setStyle(ButtonStyle.Primary)
        );

      await user.send({ embeds: [embed], components: [row] });

      return { exists: false, dmSent: true };
    } catch (error) {
      console.error('Could not send DM:', error);
      return { exists: false, dmSent: false, error: 'DM_FAILED' };
    }
  }

  async handleProfileCreation(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('profile_modal')
      .setTitle('🎮 Create Your OTO Profile');

    const nameInput = new TextInputBuilder()
      .setCustomId('profile_name')
      .setLabel('Your Name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter your name')
      .setRequired(true)
      .setMaxLength(50);

    const stateInput = new TextInputBuilder()
      .setCustomId('profile_state')
      .setLabel('Your State')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g., Maharashtra, Delhi')
      .setRequired(true)
      .setMaxLength(50);

    const genderInput = new TextInputBuilder()
      .setCustomId('profile_gender')
      .setLabel('Gender (Male/Female/Other)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Male, Female, or Other')
      .setRequired(true)
      .setMaxLength(10);

    const gameInput = new TextInputBuilder()
      .setCustomId('profile_game')
      .setLabel('Favorite Game')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g., Free Fire, Minecraft')
      .setRequired(true)
      .setMaxLength(50);

    const ageInput = new TextInputBuilder()
      .setCustomId('profile_age')
      .setLabel('Your Age')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter your age')
      .setRequired(true)
      .setMaxLength(2);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(stateInput),
      new ActionRowBuilder().addComponents(genderInput),
      new ActionRowBuilder().addComponents(gameInput),
      new ActionRowBuilder().addComponents(ageInput)
    );

    await interaction.showModal(modal);
  }

  async saveProfile(interaction) {
    const users = dataStore.load('users');
    const userId = interaction.user.id;

    const profile = {
      id: userId,
      otoId: Utils.generateOtoId(interaction.user.username),
      name: interaction.fields.getTextInputValue('profile_name'),
      state: interaction.fields.getTextInputValue('profile_state'),
      gender: interaction.fields.getTextInputValue('profile_gender').toLowerCase(),
      game: interaction.fields.getTextInputValue('profile_game'),
      age: parseInt(interaction.fields.getTextInputValue('profile_age')),
      createdAt: Date.now(),
      level: 0,
      tournaments: {
        played: 0,
        won: 0,
        earnings: 0
      },
      invites: {
        count: 0,
        valid: 0,
        rewards: []
      },
      badges: ['🎖️ First Timer'],
      warnings: 0,
      stats: {
        kills: 0,
        deaths: 0,
        winRate: 0,
        avgPlacement: 0
      },
      preferences: {
        language: 'hinglish',
        dmNotifications: true,
        tournamentReminders: true
      }
    };

    users[userId] = profile;
    dataStore.save('users', users);

    // Send profile to profile section channel
    const guild = interaction.guild;
    const profileChannel = guild.channels.cache.get(CONFIG.CHANNELS.PROFILE_SECTION);
    
    if (profileChannel) {
      const profileEmbed = Utils.createEmbed(
        `👤 New Player Profile - ${profile.name}`,
        `**OTO ID:** ${profile.otoId}\n` +
        `**State:** ${profile.state}\n` +
        `**Game:** ${profile.game}\n` +
        `**Gender:** ${profile.gender}\n` +
        `**Age:** ${profile.age}\n` +
        `**Joined:** ${Utils.formatTime(profile.createdAt)}`
      );
      
      await profileChannel.send({ embeds: [profileEmbed] });
    }

    // Give verified role
    const member = guild.members.cache.get(userId);
    if (member) {
      try {
        const verifiedRole = guild.roles.cache.find(r => r.name === '✅ Verified') ||
          await guild.roles.create({ name: '✅ Verified', color: '#00FF00' });
        
        await member.roles.add(verifiedRole);
      } catch (error) {
        console.error('Could not add verified role:', error);
      }
    }

    // Success message
    const successEmbed = Utils.successEmbed(
      `🎉 Profile Created Successfully!\n\n` +
      `**Your OTO ID:** ${profile.otoId}\n\n` +
      `✅ You can now access all channels!\n` +
      `🎮 Ready to join tournaments!\n` +
      `💰 Start earning by inviting friends!\n\n` +
      `Head over to the server and check out the tournaments! 🚀`
    );

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    // Send welcome in general chat
    const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
    if (generalChannel) {
      const welcomeMsg = Utils.random(this.welcomeMessages);
      const genderEmoji = profile.gender === 'female' ? '👸' : '👑';
      
      await generalChannel.send(
        `${genderEmoji} **${profile.name}** just joined OTO Tournaments! ` +
        `${welcomeMsg} ` +
        `Invite your friends and earn rewards! 🎁`
      );
    }

    return profile;
  }

  getProfile(userId) {
    const users = dataStore.load('users');
    return users[userId] || null;
  }

  updateProfile(userId, updates) {
    const users = dataStore.load('users');
    if (users[userId]) {
      users[userId] = { ...users[userId], ...updates };
      dataStore.save('users', users);
      return users[userId];
    }
    return null;
  }
}

const profileManager = new ProfileManager();

// ═══════════════════════════════════════════════════════════════
// 🎫 TOURNAMENT MANAGEMENT SYSTEM
// ═══════════════════════════════════════════════════════════════

class TournamentManager {
  constructor() {
    this.templates = {
      'Free Fire - Solo': {
        game: 'Free Fire',
        mode: 'Solo',
        map: 'Bermuda',
        defaultSlots: 12,
        defaultEntry: 50,
        prizeDistribution: {
          1: 50,
          2: 30,
          3: 20
        }
      },
      'Free Fire - Duo': {
        game: 'Free Fire',
        mode: 'Duo',
        map: 'Bermuda',
        defaultSlots: 12,
        defaultEntry: 100,
        prizeDistribution: {
          1: 50,
          2: 30,
          3: 20
        }
      },
      'Free Fire - Squad': {
        game: 'Free Fire',
        mode: 'Squad',
        map: 'Bermuda',
        defaultSlots: 12,
        defaultEntry: 200,
        prizeDistribution: {
          1: 50,
          2: 30,
          3: 20
        }
      },
      'Minecraft - Survival': {
        game: 'Minecraft',
        mode: 'Survival Games',
        defaultSlots: 16,
        defaultEntry: 50,
        prizeDistribution: {
          1: 50,
          2: 30,
          3: 20
        }
      },
      'Minecraft - Bed Wars': {
        game: 'Minecraft',
        mode: 'Bed Wars',
        defaultSlots: 16,
        defaultEntry: 75,
        prizeDistribution: {
          1: 50,
          2: 30,
          3: 20
        }
      }
    };
  }

  async createTournament(interaction, tournamentData) {
    const tournaments = dataStore.load('tournaments');
    const tournamentId = Utils.generateId();

    const prizePool = tournamentData.entryFee * tournamentData.slots;
    
    const tournament = {
      id: tournamentId,
      title: tournamentData.title,
      game: tournamentData.game,
      mode: tournamentData.mode,
      entryFee: tournamentData.entryFee,
      prizePool: prizePool,
      slots: tournamentData.slots,
      slotsRemaining: tournamentData.slots,
      map: tournamentData.map || 'Default',
      time: tournamentData.time,
      prizeDistribution: tournamentData.prizeDistribution || this.calculatePrizeDistribution(prizePool),
      participants: [],
      confirmedParticipants: [],
      status: 'open',
      createdBy: interaction.user.id,
      createdAt: Date.now(),
      imageUrl: tournamentData.imageUrl || null,
      roomId: null,
      roomPassword: null,
      winner: null,
      killLeader: null
    };

    tournaments[tournamentId] = tournament;
    dataStore.save('tournaments', tournaments);

    // Post to tournament schedule
    await this.postTournamentToSchedule(interaction.guild, tournament);

    // Post to general chat
    await this.announceTournament(interaction.guild, tournament);

    return tournament;
  }

  calculatePrizeDistribution(prizePool) {
    return {
      1: Math.floor(prizePool * 0.5),
      2: Math.floor(prizePool * 0.3),
      3: Math.floor(prizePool * 0.2)
    };
  }

  async postTournamentToSchedule(guild, tournament) {
    const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(`🎮 ${tournament.title}`)
      .setDescription(
        `**${tournament.game} - ${tournament.mode}**\n\n` +
        `💰 **Prize Pool:** ${Utils.formatCurrency(tournament.prizePool)}\n` +
        `🎫 **Entry Fee:** ${Utils.formatCurrency(tournament.entryFee)}\n` +
        `📊 **Slots:** ${tournament.slotsRemaining}/${tournament.slots}\n` +
        `⏰ **Time:** ${tournament.time}\n` +
        `🗺️ **Map:** ${tournament.map}\n\n` +
        `🏆 **Prize Distribution:**\n` +
        `🥇 1st: ${Utils.formatCurrency(tournament.prizeDistribution[1])}\n` +
        `🥈 2nd: ${Utils.formatCurrency(tournament.prizeDistribution[2])}\n` +
        `🥉 3rd: ${Utils.formatCurrency(tournament.prizeDistribution[3])}`
      )
      .setColor(CONFIG.BOT.COLOR)
      .setFooter({ text: `Tournament ID: ${tournament.id}` })
      .setTimestamp();

    if (tournament.imageUrl) {
      embed.setImage(tournament.imageUrl);
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`join_tournament_${tournament.id}`)
          .setLabel('🎮 JOIN TOURNAMENT')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`view_tournament_${tournament.id}`)
          .setLabel('👁️ View Details')
          .setStyle(ButtonStyle.Primary)
      );

    const message = await channel.send({ embeds: [embed], components: [row] });
    
    // Store message ID
    const tournaments = dataStore.load('tournaments');
    tournaments[tournament.id].messageId = message.id;
    dataStore.save('tournaments', tournaments);
  }

  async announceTournament(guild, tournament) {
    const channel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
    if (!channel) return;

    const announcements = [
      `🔥 **NEW TOURNAMENT ALERT!** 🔥\n${tournament.title} is now open!\nPrize Pool: ${Utils.formatCurrency(tournament.prizePool)} 💰\nJoin now!`,
      `⚡ **TOURNAMENT LIVE!** ⚡\n${tournament.game} - ${tournament.mode}\nWin up to ${Utils.formatCurrency(tournament.prizeDistribution[1])}! 🏆`,
      `🎮 **READY TO WIN?** 🎮\n${tournament.title}\nEntry: ${Utils.formatCurrency(tournament.entryFee)} | Prize: ${Utils.formatCurrency(tournament.prizePool)}\nLet's gooo! 🚀`
    ];

    await channel.send(Utils.random(announcements));

    // Spam announcement every 2 minutes until tournament starts or fills
    this.startTournamentReminders(guild, tournament.id);
  }

  startTournamentReminders(guild, tournamentId) {
    const interval = setInterval(async () => {
      const tournaments = dataStore.load('tournaments');
      const tournament = tournaments[tournamentId];

      if (!tournament || tournament.status !== 'open' || tournament.slotsRemaining === 0) {
        clearInterval(interval);
        return;
      }

      const channel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
      if (channel) {
        const urgency = tournament.slotsRemaining <= 3 ? '🔴 **LAST FEW SLOTS!**' : '📢';
        await channel.send(
          `${urgency} ${tournament.title} - ${tournament.slotsRemaining}/${tournament.slots} slots left! Join now! 💪`
        );
      }
    }, 120000); // 2 minutes
  }

  async joinTournament(interaction) {
    const tournamentId = interaction.customId.split('_')[2];
    const tournaments = dataStore.load('tournaments');
    const tournament = tournaments[tournamentId];

    if (!tournament) {
      return interaction.reply({ 
        embeds: [Utils.errorEmbed('Tournament not found!')], 
        ephemeral: true 
      });
    }

    if (tournament.slotsRemaining === 0) {
      return interaction.reply({ 
        embeds: [Utils.errorEmbed('Tournament is full!')], 
        ephemeral: true 
      });
    }

    // Check if user has profile
    const profile = profileManager.getProfile(interaction.user.id);
    if (!profile) {
      return interaction.reply({ 
        embeds: [Utils.errorEmbed('Please create your profile first! Check your DMs.')], 
        ephemeral: true 
      });
    }

    // Check if already joined
    if (tournament.participants.includes(interaction.user.id)) {
      return interaction.reply({ 
        embeds: [Utils.errorEmbed('You have already joined this tournament!')], 
        ephemeral: true 
      });
    }

    // Create registration ticket
    await this.createRegistrationTicket(interaction, tournament);
  }

  async createRegistrationTicket(interaction, tournament) {
    const guild = interaction.guild;
    const user = interaction.user;

    // Create private ticket channel
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}-${tournament.id.slice(-4)}`,
      type: ChannelType.GuildText,
      parent: guild.channels.cache.get(CONFIG.CHANNELS.OPEN_TICKET)?.parent,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        {
          id: CONFIG.ROLES.STAFF,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }
      ]
    });

    // Store ticket info
    const tickets = dataStore.load('tickets');
    const ticketId = Utils.generateId();
    
    tickets[ticketId] = {
      id: ticketId,
      channelId: ticketChannel.id,
      userId: user.id,
      tournamentId: tournament.id,
      type: 'registration',
      status: 'pending_payment',
      createdAt: Date.now()
    };
    dataStore.save('tickets', tickets);

    // Send ticket message
    const embed = Utils.createEmbed(
      `🎫 Tournament Registration - ${tournament.title}`,
      `Hey ${user}! Welcome to your registration ticket!\n\n` +
      `**Tournament:** ${tournament.game} - ${tournament.mode}\n` +
      `**Entry Fee:** ${Utils.formatCurrency(tournament.entryFee)}\n\n` +
      `📝 **Please provide:**\n` +
      `1️⃣ Your In-Game Name/ID\n` +
      (tournament.mode.includes('Squad') ? `2️⃣ Squad Name & Member Names\n` : '') +
      `${tournament.mode.includes('Squad') ? '3️⃣' : '2️⃣'} Payment Screenshot\n\n` +
      `A staff member will generate your payment QR code shortly! 💳`
    );

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`provide_ign_${ticketId}`)
          .setLabel('📝 Provide In-Game Details')
          .setStyle(ButtonStyle.Primary)
      );

    await ticketChannel.send({ 
      content: `${user} <@&${CONFIG.ROLES.STAFF}>`, 
      embeds: [embed], 
      components: [row] 
    });

    await interaction.reply({ 
      content: `✅ Registration ticket created! Check ${ticketChannel}`, 
      ephemeral: true 
    });

    // Notify staff
    const staffChannel = guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
    if (staffChannel) {
      await staffChannel.send(
        `🎫 **New Registration Ticket**\n` +
        `User: ${user}\n` +
        `Tournament: ${tournament.title}\n` +
        `Ticket: ${ticketChannel}`
      );
    }

    // Auto-release slot after 15 minutes if payment not done
    setTimeout(async () => {
      const currentTickets = dataStore.load('tickets');
      if (currentTickets[ticketId] && currentTickets[ticketId].status === 'pending_payment') {
        await ticketChannel.send('⏰ Payment timeout! Slot released. Ticket will close in 1 minute.');
        setTimeout(() => ticketChannel.delete(), 60000);
      }
    }, CONFIG.BOT.SLOT_RELEASE_TIME);
  }

  updateTournamentSlots(tournamentId) {
    const tournaments = dataStore.load('tournaments');
    if (tournaments[tournamentId]) {
      tournaments[tournamentId].slotsRemaining -= 1;
      dataStore.save('tournaments', tournaments);
      return tournaments[tournamentId];
    }
    return null;
  }
}

const tournamentManager = new TournamentManager();

// ═══════════════════════════════════════════════════════════════
// 📨 INVITE TRACKING SYSTEM
// ═══════════════════════════════════════════════════════════════

class InviteTracker {
  constructor() {
    this.invites = new Map();
  }

  async initialize(guild) {
    const invites = await guild.invites.fetch();
    invites.forEach(invite => {
      this.invites.set(invite.code, invite.uses);
    });
  }

  async trackInvite(member) {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    
    let usedInvite = null;
    
    newInvites.forEach(invite => {
      const oldUses = this.invites.get(invite.code) || 0;
      if (invite.uses > oldUses) {
        usedInvite = invite;
        this.invites.set(invite.code, invite.uses);
      }
    });

    if (usedInvite && usedInvite.inviter) {
      await this.processInvite(member, usedInvite.inviter, guild);
    }
  }

  async processInvite(member, inviter, guild) {
    const inviteData = dataStore.load('invites');
    
    if (!inviteData[inviter.id]) {
      inviteData[inviter.id] = {
        userId: inviter.id,
        invites: [],
        totalInvites: 0,
        validInvites: 0,
        rewards: []
      };
    }

    inviteData[inviter.id].invites.push({
      userId: member.id,
      joinedAt: Date.now(),
      valid: false // Will be validated later
    });
    inviteData[inviter.id].totalInvites++;

    dataStore.save('invites', inviteData);

    // Post to invite tracker
    const inviteChannel = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
    if (inviteChannel) {
      const embed = Utils.createEmbed(
        '📨 New Member Invited',
        `**${member.user.tag}** joined!\n` +
        `**Invited by:** ${inviter.tag}\n` +
        `**Total Invites:** ${inviteData[inviter.id].totalInvites}\n` +
        `**Valid Invites:** ${inviteData[inviter.id].validInvites}`
      );
      await inviteChannel.send({ embeds: [embed] });
    }

    // Post to general with custom message
    const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
    if (generalChannel) {
      await generalChannel.send(
        `👋 **${member}** joined! Invited by **${inviter.tag}**\n` +
        `Complete your profile to unlock all channels! 🎮`
      );
    }

    // Schedule validation check (3 days later)
    setTimeout(() => this.validateInvite(member.id, inviter.id, guild), 259200000);
  }

  async validateInvite(memberId, inviterId, guild) {
    const inviteData = dataStore.load('invites');
    const member = await guild.members.fetch(memberId).catch(() => null);
    
    if (!member) return; // Member left

    const profile = profileManager.getProfile(memberId);
    
    // Validation criteria
    const accountAge = Date.now() - member.user.createdTimestamp;
    const hasProfile = profile !== null;
    const stayedInServer = true; // They're still here
    
    if (accountAge >= 604800000 && hasProfile && stayedInServer) {
      // Valid invite
      const invite = inviteData[inviterId].invites.find(i => i.userId === memberId);
      if (invite) {
        invite.valid = true;
        inviteData[inviterId].validInvites++;
        dataStore.save('invites', inviteData);

        // Check for rewards
        await this.checkInviteRewards(inviterId, inviteData[inviterId].validInvites, guild);
      }
    }
  }

  async checkInviteRewards(userId, validInvites, guild) {
    const rewards = CONFIG.INVITE_REWARDS;
    const userData = dataStore.load('users');
    const user = userData[userId];

    if (!user) return;

    const inviteData = dataStore.load('invites');
    const userInvites = inviteData[userId];

    for (const [count, reward] of Object.entries(rewards)) {
      const requiredCount = parseInt(count);
      
      if (validInvites === requiredCount && !userInvites.rewards.includes(requiredCount)) {
        // Grant reward
        userInvites.rewards.push(requiredCount);
        dataStore.save('invites', inviteData);

        // Give role if applicable
        if (reward.role) {
          const member = await guild.members.fetch(userId).catch(() => null);
          if (member) {
            let role = guild.roles.cache.find(r => r.name.includes(reward.role.split('_').join(' ')));
            if (!role) {
              role = await guild.roles.create({
                name: reward.reward.split('+')[1]?.trim() || reward.role,
                color: this.getRoleColor(requiredCount)
              });
            }
            await member.roles.add(role);
          }
        }

        // Send DM notification
        const discordUser = await client.users.fetch(userId).catch(() => null);
        if (discordUser) {
          const embed = Utils.successEmbed(
            `🎉 Invite Milestone Reached!\n\n` +
            `You've reached **${requiredCount} valid invites**!\n\n` +
            `**Reward:** ${reward.reward}\n\n` +
            `Keep inviting to unlock more rewards! 🚀`
          );

          if (requiredCount === 10 || requiredCount === 20 || requiredCount === 30) {
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('claim_free_tournament')
                  .setLabel('🎮 Claim Free Tournament')
                  .setStyle(ButtonStyle.Success)
              );
            
            await discordUser.send({ embeds: [embed], components: [row] });
          } else {
            await discordUser.send({ embeds: [embed] });
          }
        }

        // Announce in invite tracker
        const inviteChannel = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
        if (inviteChannel) {
          await inviteChannel.send(
            `🎉 **${discordUser?.tag || 'User'}** reached **${requiredCount} invites**!\n` +
            `Reward: ${reward.reward} 🏆`
          );
        }
      }
    }
  }

  getRoleColor(count) {
    const colors = {
      5: '#95D5B2',
      10: '#52B788',
      20: '#2D6A4F',
      30: '#1B4332',
      50: '#081C15',
      100: '#FFD700'
    };
    return colors[count] || '#95D5B2';
  }

  async updateLeaderboard(guild) {
    const inviteData = dataStore.load('invites');
    const leaderboardChannel = guild.channels.cache.get(CONFIG.CHANNELS.LEADERBOARD_INVITES);
    
    if (!leaderboardChannel) return;

    // Sort by valid invites
    const sorted = Object.values(inviteData)
      .sort((a, b) => b.validInvites - a.validInvites)
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setTitle('👑 Top Inviters Leaderboard')
      .setDescription('Top 10 members who brought the most valid invites!')
      .setColor('#FFD700')
      .setTimestamp();

    let leaderboardText = '';
    
    for (let i = 0; i < sorted.length; i++) {
      const userData = sorted[i];
      const user = await client.users.fetch(userData.userId).catch(() => null);
      const medals = ['🥇', '🥈', '🥉'];
      const medal = i < 3 ? medals[i] : `${i + 1}.`;
      
      leaderboardText += `${medal} **${user?.tag || 'Unknown User'}**\n`;
      leaderboardText += `   Valid Invites: **${userData.validInvites}** | Total: **${userData.totalInvites}**\n\n`;
    }

    embed.setDescription(leaderboardText || 'No invites yet! Be the first!');

    // Delete old messages and send new
    const messages = await leaderboardChannel.messages.fetch({ limit: 10 });
    await leaderboardChannel.bulkDelete(messages);
    await leaderboardChannel.send({ embeds: [embed] });
  }
}

const inviteTracker = new InviteTracker();

// ═══════════════════════════════════════════════════════════════
// 🤖 AUTO RESPONSE SYSTEM
// ═══════════════════════════════════════════════════════════════

class AutoResponse {
  constructor() {
    this.lastResponse = new Map();
    this.greetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'kya haal', 'kaise ho'];
    this.questions = {
      join: ['how to join', 'kaise join', 'join kaise', 'tournament kaise join'],
      time: ['time kya hai', 'when', 'kab hai', 'timing'],
      prize: ['prize', 'paisa', 'kitna milega', 'reward'],
      payment: ['payment', 'pay kaise', 'paytm', 'upi']
    };
  }

  async handleMessage(message) {
    if (message.author.bot) return;
    if (message.channel.id !== CONFIG.CHANNELS.GENERAL_CHAT) return;

    const content = message.content.toLowerCase();
    const profile = profileManager.getProfile(message.author.id);

    // Check if someone already responded
    const lastMsgTime = this.lastResponse.get(message.author.id) || 0;
    
    if (Date.now() - lastMsgTime < 120000) return; // Cooldown

    // Wait 2 minutes to see if anyone responds
    setTimeout(async () => {
      const replies = await message.channel.messages.fetch({ after: message.id, limit: 5 });
      const hasReply = replies.some(m => 
        m.author.id !== message.author.id && 
        m.author.id !== client.user.id &&
        m.reference?.messageId === message.id
      );

      if (!hasReply) {
        await this.respondToMessage(message, content, profile);
        this.lastResponse.set(message.author.id, Date.now());
      }
    }, 120000);
  }

  async respondToMessage(message, content, profile) {
    let response = '';
    const isMale = profile?.gender === 'male';
    const isFemale = profile?.gender === 'female';
    const name = profile?.name || message.author.username;

    // Greeting responses
    if (this.greetings.some(g => content.includes(g))) {
      const greetings = isFemale 
        ? [
          `Hello ${name} ji! 👸 Tournament khelogi aaj?`,
          `Hey ${name}! 🌟 Kaise ho? Tournament dekh liya?`,
          `Hi ${name}! 💫 Ready to win some prizes?`
        ]
        : [
          `Hey ${name} bro! 💪 Tournament kheloge aaj?`,
          `Yo ${name}! 🔥 What's up? Tournament check karo!`,
          `Hi ${name}! ⚡ Kaise ho bhai? Ready to win?`
        ];
      
      response = Utils.random(greetings);
    }

    // Question responses
    else if (this.questions.join.some(q => content.includes(q))) {
      response = `Tournament join karna simple hai bro! 🎮\n\n` +
        `1️⃣ <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> pe jao\n` +
        `2️⃣ JOIN button dabao\n` +
        `3️⃣ In-game ID aur payment karo\n` +
        `4️⃣ Confirmation milega, phir lobby mein entry!\n\n` +
        `Easy peasy! 🚀`;
    }

    else if (this.questions.time.some(q => content.includes(q))) {
      const tournaments = dataStore.load('tournaments');
      const openTournaments = Object.values(tournaments).filter(t => t.status === 'open');
      
      if (openTournaments.length > 0) {
        const next = openTournaments[0];
        response = `🕒 **Next Tournament:**\n` +
          `${next.title}\n` +
          `Time: **${next.time}**\n` +
          `Slots: ${next.slotsRemaining}/${next.slots} remaining!\n\n` +
          `Jaldi join karo, filling fast! 🔥`;
      } else {
        response = `Abhi koi tournament open nahi hai bro!\n` +
          `New tournaments soon announce honge! 📢`;
      }
    }

    else if (this.questions.prize.some(q => content.includes(q))) {
      response = `💰 **Prize Pool bhi kaafi hai bro!**\n\n` +
        `Tournaments mein ₹500 to ₹5000 tak prize pools hote hain!\n` +
        `1st place = 50% 🥇\n` +
        `2nd place = 30% 🥈\n` +
        `3rd place = 20% 🥉\n\n` +
        `Plus, invite friends and get FREE entries! 🎁`;
    }

    else if (this.questions.payment.some(q => content.includes(q))) {
      response = `💳 **Payment Process:**\n\n` +
        `1️⃣ Tournament join karo\n` +
        `2️⃣ Staff QR code generate karenge\n` +
        `3️⃣ UPI se pay karo (PhonePe/GPay/Paytm)\n` +
        `4️⃣ Screenshot upload karo\n` +
        `5️⃣ Staff confirm karenge\n` +
        `6️⃣ Lobby mein entry! ✅\n\n` +
        `Safe aur secure! 🔒`;
    }

    // Random encouragement
    else if (content.length > 10) {
      const encouragements = [
        `Aaj ka tournament miss mat karna bro! Prize pool dekha? 💰`,
        `Tournament dekha? Slots kam ho rahe hain! Join karo! 🔥`,
        `Friends ko invite karo, free entries milenge! 🎁`,
        `Aaj kheloge? Tournament schedule check karo! 🎮`,
        `Practice kar rahe ho? Tournament ready rehna! ⚡`
      ];
      
      // 30% chance to respond
      if (Math.random() < 0.3) {
        response = Utils.random(encouragements);
      }
    }

    if (response) {
      await message.reply(response);
    }
  }
}

const autoResponse = new AutoResponse();

// ═══════════════════════════════════════════════════════════════
// 🛡️ MODERATION SYSTEM
// ═══════════════════════════════════════════════════════════════

class ModerationSystem {
  constructor() {
    this.userMessageTimestamps = new Map();
  }

  async checkMessage(message) {
    if (message.author.bot) return;
    if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const content = message.content.toLowerCase();
    let violationType = null;
    let level = 0;

    // Check bad words
    for (const word of CONFIG.BAD_WORDS.LEVEL_4) {
      if (content.includes(word)) {
        violationType = 'extreme_abuse';
        level = 4;
        break;
      }
    }

    if (!violationType) {
      for (const word of CONFIG.BAD_WORDS.LEVEL_3) {
        if (content.includes(word) && !this.isGameContext(content, word)) {
          violationType = 'severe_abuse';
          level = 3;
          break;
        }
      }
    }

    if (!violationType) {
      for (const word of CONFIG.BAD_WORDS.LEVEL_2) {
        if (content.includes(word)) {
          violationType = 'moderate_abuse';
          level = 2;
          break;
        }
      }
    }

    if (!violationType) {
      for (const word of CONFIG.BAD_WORDS.LEVEL_1) {
        if (content.includes(word)) {
          violationType = 'mild_abuse';
          level = 1;
          break;
        }
      }
    }

    // Check spam
    if (!violationType) {
      const spam = await this.checkSpam(message);
      if (spam) {
        violationType = spam.type;
        level = spam.level;
      }
    }

    if (violationType) {
      await this.handleViolation(message, violationType, level);
    }
  }

  isGameContext(content, word) {
    const gameContexts = {
      'mc': ['minecraft', 'mc championship', 'mcyt'],
      'bc': ['pubg bc', 'before christ', 'british columbia']
    };

    if (gameContexts[word]) {
      return gameContexts[word].some(context => content.includes(context));
    }
    return false;
  }

  async checkSpam(message) {
    const userId = message.author.id;
    const now = Date.now();
    
    if (!this.userMessageTimestamps.has(userId)) {
      this.userMessageTimestamps.set(userId, []);
    }

    const timestamps = this.userMessageTimestamps.get(userId);
    timestamps.push(now);

    // Keep only last 10 seconds
    const recentTimestamps = timestamps.filter(t => now - t < 10000);
    this.userMessageTimestamps.set(userId, recentTimestamps);

    // 5 messages in 3 seconds
    const veryRecent = recentTimestamps.filter(t => now - t < 3000);
    if (veryRecent.length >= 5) {
      return { type: 'message_spam', level: 2 };
    }

    // Emoji spam
    const emojiCount = (message.content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount > 10) {
      return { type: 'emoji_spam', level: 2 };
    }

    // Caps spam
    if (message.content.length > 20 && message.content === message.content.toUpperCase()) {
      return { type: 'caps_spam', level: 1 };
    }

    // Mention spam
    if (message.mentions.users.size >= 5) {
      return { type: 'mention_spam', level: 3 };
    }

    return null;
  }

  async handleViolation(message, type, level) {
    const warnings = dataStore.load('warnings');
    const userId = message.author.id;

    if (!warnings[userId]) {
      warnings[userId] = {
        count: 0,
        violations: [],
        lastWarning: 0
      };
    }

    warnings[userId].count++;
    warnings[userId].violations.push({
      type,
      level,
      content: message.content.substring(0, 100),
      timestamp: Date.now(),
      channelId: message.channel.id
    });
    warnings[userId].lastWarning = Date.now();

    dataStore.save('warnings', warnings);

    // Delete message
    await message.delete().catch(() => {});

    const warningCount = warnings[userId].count;
    const member = message.member;

    // Actions based on level and warning count
    if (level === 4) {
      // Instant ban
      await this.banUser(member, type);
      return;
    }

    if (level === 3 || warningCount >= 3) {
      // Timeout 1 hour
      await this.timeoutUser(member, 3600000, type);
    } else if (level === 2 || warningCount === 2) {
      // Timeout 5 minutes
      await this.timeoutUser(member, 300000, type);
    } else {
      // Warning only
      await this.warnUser(member, type);
    }

    // Reset warnings after 7 days
    if (Date.now() - warnings[userId].lastWarning > 604800000) {
      warnings[userId].count = 1;
      dataStore.save('warnings', warnings);
    }
  }

  async warnUser(member, reason) {
    const embed = Utils.createEmbed(
      '⚠️ Warning',
      `${member}, you have been warned for: **${reason}**\n\n` +
      `Please follow the server rules. Repeated violations will result in timeout or ban.`
    ).setColor('#FFA500');

    await member.send({ embeds: [embed] }).catch(() => {});
  }

  async timeoutUser(member, duration, reason) {
    try {
      await member.timeout(duration, reason);
      
      const durationText = duration === 300000 ? '5 minutes' : '1 hour';
      const embed = Utils.createEmbed(
        '⏰ Timeout',
        `${member} has been timed out for **${durationText}**\n\n` +
        `Reason: **${reason}**`
      ).setColor('#FF6B00');

      await member.send({ embeds: [embed] }).catch(() => {});

      // Log to staff
      const staffChannel = client.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
      if (staffChannel) {
        await staffChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Could not timeout user:', error);
    }
  }

  async banUser(member, reason) {
    try {
      await member.ban({ reason });
      
      const embed = Utils.createEmbed(
        '🔨 Banned',
        `${member.user.tag} has been banned from the server.\n\n` +
        `Reason: **${reason}**`
      ).setColor('#FF0000');

      // Log to staff
      const staffChannel = client.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
      if (staffChannel) {
        await staffChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Could not ban user:', error);
    }
  }
}

const moderationSystem = new ModerationSystem();

// ═══════════════════════════════════════════════════════════════
// 🎮 STAFF TOOLS SYSTEM
// ═══════════════════════════════════════════════════════════════

class StaffTools {
  async createStaffPanel(channel) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ OTO Staff Tools Panel')
      .setDescription(
        '**Welcome to Staff Tools!**\n\n' +
        'Use the buttons below to access various staff functions:\n\n' +
        '🎮 **Tournament Tools** - Create, edit, delete tournaments\n' +
        '🎫 **Ticket Management** - View and manage tickets\n' +
        '📊 **Analytics** - View server and bot statistics\n' +
        '👥 **User Management** - Ban, timeout, warn users\n' +
        '🏆 **Winner Declaration** - Declare winners and send prizes\n' +
        '💰 **Payment Verification** - Verify payment proofs\n\n' +
        'Select an option to get started!'
      )
      .setColor(CONFIG.BOT.COLOR)
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('staff_create_tournament')
          .setLabel('🎮 Create Tournament')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('staff_manage_tournaments')
          .setLabel('📋 Manage Tournaments')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('staff_view_tickets')
          .setLabel('🎫 View Tickets')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('staff_analytics')
          .setLabel('📊 Analytics')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('staff_declare_winner')
          .setLabel('🏆 Declare Winner')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('staff_user_management')
          .setLabel('👥 User Management')
          .setStyle(ButtonStyle.Danger)
      );

    await channel.send({ embeds: [embed], components: [row1, row2] });
  }

  async showCreateTournamentMenu(interaction) {
    const templates = Object.keys(tournamentManager.templates);
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_tournament_template')
      .setPlaceholder('Choose a tournament template')
      .addOptions(
        templates.map(template => ({
          label: template,
          value: template,
          description: `Create a ${template} tournament`
        })),
        {
          label: '🎨 Custom Tournament',
          value: 'custom',
          description: 'Create a fully custom tournament'
        }
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = Utils.createEmbed(
      '🎮 Create Tournament',
      'Select a template or create a custom tournament:'
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  async showAnalytics(interaction) {
    const users = dataStore.load('users');
    const tournaments = dataStore.load('tournaments');
    const tickets = dataStore.load('tickets');
    const invites = dataStore.load('invites');

    const totalUsers = Object.keys(users).length;
    const activePlayers = Object.values(users).filter(u => u.tournaments.played > 0).length;
    const openTournaments = Object.values(tournaments).filter(t => t.status === 'open').length;
    const totalTournaments = Object.keys(tournaments).length;
    const openTickets = Object.values(tickets).filter(t => t.status !== 'closed').length;
    const totalInvites = Object.values(invites).reduce((sum, i) => sum + i.totalInvites, 0);
    const validInvites = Object.values(invites).reduce((sum, i) => sum + i.validInvites, 0);

    const totalEarnings = Object.values(tournaments)
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.entryFee * (t.slots - t.slotsRemaining)), 0);

    const embed = new EmbedBuilder()
      .setTitle('📊 OTO Bot Analytics Dashboard')
      .setDescription(
        `\`\`\`\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👥 USER STATISTICS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Total Users:     ${totalUsers}\n` +
        `Active Players:  ${activePlayers}\n` +
        `Verified Users:  ${Object.values(users).filter(u => u.level >= 0).length}\n\n` +
        `🎮 TOURNAMENT STATISTICS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Total Tournaments: ${totalTournaments}\n` +
        `Open Tournaments:  ${openTournaments}\n` +
        `Completed:         ${Object.values(tournaments).filter(t => t.status === 'completed').length}\n\n` +
        `🎫 TICKET STATISTICS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Open Tickets:    ${openTickets}\n` +
        `Total Tickets:   ${Object.keys(tickets).length}\n\n` +
        `📨 INVITE STATISTICS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Total Invites:   ${totalInvites}\n` +
        `Valid Invites:   ${validInvites}\n` +
        `Validation Rate: ${totalInvites > 0 ? ((validInvites/totalInvites)*100).toFixed(1) : 0}%\n\n` +
        `💰 FINANCIAL STATISTICS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Total Revenue:   ₹${totalEarnings}\n` +
        `Avg Entry Fee:   ₹${totalTournaments > 0 ? Math.round(totalEarnings/totalTournaments) : 0}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `\`\`\``
      )
      .setColor(CONFIG.BOT.COLOR)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

const staffTools = new StaffTools();

// ═══════════════════════════════════════════════════════════════
// 🎯 EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`🎮 Serving ${client.guilds.cache.size} servers`);
  
  client.user.setActivity('🎮 OTO Tournaments | -help', { type: 'PLAYING' });

  // Initialize invite tracking for all guilds
  for (const guild of client.guilds.cache.values()) {
    await inviteTracker.initialize(guild);
    console.log(`📨 Invite tracking initialized for ${guild.name}`);
  }

  // Start auto-save
  dataStore.startAutoSave();
  console.log('💾 Auto-save enabled');

  // Update leaderboards every hour
  setInterval(async () => {
    for (const guild of client.guilds.cache.values()) {
      await inviteTracker.updateLeaderboard(guild);
    }
  }, 3600000);

  console.log('🚀 All systems operational!');
});

// Member Join Event
client.on('guildMemberAdd', async (member) => {
  console.log(`👋 ${member.user.tag} joined ${member.guild.name}`);

  // Track invite
  await inviteTracker.trackInvite(member);

  // Create profile prompt
  await profileManager.createProfile(member.user, member.guild);
});

// Member Leave Event
client.on('guildMemberRemove', async (member) => {
  console.log(`👋 ${member.user.tag} left ${member.guild.name}`);
  
  // Mark invites as invalid
  const inviteData = dataStore.load('invites');
  for (const inviter of Object.values(inviteData)) {
    const invite = inviter.invites.find(i => i.userId === member.id);
    if (invite && invite.valid) {
      invite.valid = false;
      inviter.validInvites--;
    }
  }
  dataStore.save('invites', inviteData);
});

// Message Create Event
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Moderation check
  await moderationSystem.checkMessage(message);

  // Auto response
  await autoResponse.handleMessage(message);

  // Commands
  if (message.content.startsWith(CONFIG.BOT.PREFIX)) {
    await handleCommand(message);
  }
});

// Interaction Create Event
client.on('interactionCreate', async (interaction) => {
  try {
    // Button interactions
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // Profile creation
      if (customId === 'create_profile_start') {
        await profileManager.handleProfileCreation(interaction);
      }

      // Join tournament
      if (customId.startsWith('join_tournament_')) {
        await tournamentManager.joinTournament(interaction);
      }

      // Claim free tournament
      if (customId === 'claim_free_tournament') {
        await handleFreeEntry(interaction);
      }

      // Staff panel buttons
      if (customId === 'staff_create_tournament') {
        await staffTools.showCreateTournamentMenu(interaction);
      }

      if (customId === 'staff_analytics') {
        await staffTools.showAnalytics(interaction);
      }

      if (customId === 'staff_manage_tournaments') {
        await showManageTournaments(interaction);
      }

      if (customId === 'staff_view_tickets') {
        await showOpenTickets(interaction);
      }

      if (customId === 'staff_declare_winner') {
        await showWinnerDeclaration(interaction);
      }

      if (customId === 'staff_user_management') {
        await showUserManagement(interaction);
      }

      // Provide IGN
      if (customId.startsWith('provide_ign_')) {
        await showIgnModal(interaction);
      }

      // Payment confirmation (staff)
      if (customId.startsWith('confirm_payment_')) {
        await confirmPayment(interaction);
      }

      if (customId.startsWith('reject_payment_')) {
        await rejectPayment(interaction);
      }
    }

    // Modal submissions
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'profile_modal') {
        await profileManager.saveProfile(interaction);
      }

      if (interaction.customId.startsWith('ign_modal_')) {
        await saveIgnDetails(interaction);
      }

      if (interaction.customId.startsWith('tournament_modal_')) {
        await createTournamentFromModal(interaction);
      }
    }

    // Select menu interactions
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_tournament_template') {
        await handleTournamentTemplate(interaction);
      }

      if (interaction.customId === 'select_tournament_to_manage') {
        await showTournamentManagement(interaction);
      }

      if (interaction.customId === 'select_winner_tournament') {
        await showWinnerForm(interaction);
      }
    }

  } catch (error) {
    console.error('Interaction error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        embeds: [Utils.errorEmbed('An error occurred. Please try again.')], 
        ephemeral: true 
      }).catch(console.error);
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// 💬 COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleCommand(message) {
  const args = message.content.slice(CONFIG.BOT.PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const commands = {
    'help': cmdHelp,
    'profile': cmdProfile,
    'invite': cmdInvite,
    'i': cmdInvite,
    'leaderboard': cmdLeaderboard,
    'lb': cmdLeaderboard,
    'tournaments': cmdTournaments,
    't': cmdTournaments,
    'stats': cmdStats,
    'claim': cmdClaim,
    // Staff commands
    'panel': cmdStaffPanel,
    'ban': cmdBan,
    'timeout': cmdTimeout,
    'warn': cmdWarn,
    'unban': cmdUnban,
    'addstaff': cmdAddStaff,
    'removestaff': cmdRemoveStaff,
    'announce': cmdAnnounce
  };

  if (commands[command]) {
    await commands[command](message, args);
  }
}

async function cmdHelp(message) {
  const embed = new EmbedBuilder()
    .setTitle('📚 OTO Tournament Bot - Command List')
    .setDescription('Here are all available commands:')
    .addFields(
      {
        name: '👤 Profile Commands',
        value: '`-profile` - View your profile\n`-claim` - Claim invite rewards',
        inline: false
      },
      {
        name: '📨 Invite Commands',
        value: '`-invite` or `-i` - View your invite stats\n`-leaderboard` or `-lb` - View invite leaderboard',
        inline: false
      },
      {
        name: '🎮 Tournament Commands',
        value: '`-tournaments` or `-t` - View active tournaments\n`-stats` - View your tournament stats',
        inline: false
      },
      {
        name: '🛠️ Staff Commands (Staff Only)',
        value: '`-panel` - Open staff panel\n`-ban @user <reason>` - Ban user\n`-timeout @user <duration> <reason>` - Timeout user\n`-warn @user <reason>` - Warn user\n`-unban <userID>` - Unban user\n`-addstaff @user` - Add staff member\n`-removestaff @user` - Remove staff\n`-announce <channel> <message>` - Send announcement',
        inline: false
      }
    )
    .setColor(CONFIG.BOT.COLOR)
    .setFooter({ text: CONFIG.BOT.FOOTER })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function cmdProfile(message) {
  const profile = profileManager.getProfile(message.author.id);

  if (!profile) {
    return message.reply('❌ You need to create a profile first! Check your DMs.');
  }

  const embed = new EmbedBuilder()
    .setTitle(`👤 ${profile.name}'s Profile`)
    .setDescription(`**OTO ID:** ${profile.otoId}`)
    .addFields(
      { name: '📍 State', value: profile.state, inline: true },
      { name: '🎮 Favorite Game', value: profile.game, inline: true },
      { name: '⭐ Level', value: `${profile.level}`, inline: true },
      { name: '🏆 Tournaments Played', value: `${profile.tournaments.played}`, inline: true },
      { name: '👑 Tournaments Won', value: `${profile.tournaments.won}`, inline: true },
      { name: '💰 Total Earnings', value: Utils.formatCurrency(profile.tournaments.earnings), inline: true },
      { name: '📨 Invites', value: `${profile.invites.valid}/${profile.invites.count}`, inline: true },
      { name: '⚠️ Warnings', value: `${profile.warnings}`, inline: true },
      { name: '🎖️ Badges', value: profile.badges.join(' ') || 'None', inline: false }
    )
    .setColor(CONFIG.BOT.COLOR)
    .setThumbnail(message.author.displayAvatarURL())
    .setFooter({ text: `Joined: ${Utils.formatTime(profile.createdAt)}` })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function cmdInvite(message) {
  const inviteData = dataStore.load('invites');
  const userInvites = inviteData[message.author.id];

  if (!userInvites || userInvites.totalInvites === 0) {
    return message.reply('📨 You haven\'t invited anyone yet! Share the server link to earn rewards!');
  }

  const nextReward = Object.keys(CONFIG.INVITE_REWARDS)
    .map(Number)
    .find(count => count > userInvites.validInvites);

  const embed = new EmbedBuilder()
    .setTitle('📨 Your Invite Statistics')
    .setDescription(
      `**Total Invites:** ${userInvites.totalInvites}\n` +
      `**Valid Invites:** ${userInvites.validInvites}\n` +
      `**Success Rate:** ${userInvites.totalInvites > 0 ? ((userInvites.validInvites/userInvites.totalInvites)*100).toFixed(1) : 0}%\n\n` +
      (nextReward ? `**Next Reward at:** ${nextReward} invites\n${CONFIG.INVITE_REWARDS[nextReward].reward}` : '🎉 You\'ve unlocked all rewards!')
    )
    .setColor(CONFIG.BOT.COLOR)
    .setFooter({ text: 'Keep inviting to unlock more rewards!' })
    .setTimestamp();

  if (userInvites.rewards.length > 0) {
    embed.addFields({
      name: '🎁 Rewards Claimed',
      value: userInvites.rewards.map(r => `✅ ${r} invites`).join('\n')
    });
  }

  await message.reply({ embeds: [embed] });
}

async function cmdLeaderboard(message) {
  const inviteData = dataStore.load('invites');
  const sorted = Object.values(inviteData)
    .sort((a, b) => b.validInvites - a.validInvites)
    .slice(0, 10);

  if (sorted.length === 0) {
    return message.reply('📊 No invite data yet! Be the first to invite!');
  }

  let description = '';
  const medals = ['🥇', '🥈', '🥉'];

  for (let i = 0; i < sorted.length; i++) {
    const userData = sorted[i];
    const user = await client.users.fetch(userData.userId).catch(() => null);
    const medal = i < 3 ? medals[i] : `**${i + 1}.**`;
    
    description += `${medal} ${user?.tag || 'Unknown'} - **${userData.validInvites}** invites\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle('👑 Top Inviters Leaderboard')
    .setDescription(description)
    .setColor('#FFD700')
    .setFooter({ text: 'Invite friends to climb the leaderboard!' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function cmdTournaments(message) {
  const tournaments = dataStore.load('tournaments');
  const openTournaments = Object.values(tournaments).filter(t => t.status === 'open');

  if (openTournaments.length === 0) {
    return message.reply('🎮 No tournaments open right now! Check back soon!');
  }

  const embed = new EmbedBuilder()
    .setTitle('🎮 Active Tournaments')
    .setDescription('Here are the currently open tournaments:')
    .setColor(CONFIG.BOT.COLOR)
    .setTimestamp();

  for (const tournament of openTournaments.slice(0, 5)) {
    embed.addFields({
      name: `${tournament.title}`,
      value: `**Game:** ${tournament.game} - ${tournament.mode}\n` +
             `**Entry:** ${Utils.formatCurrency(tournament.entryFee)} | **Prize:** ${Utils.formatCurrency(tournament.prizePool)}\n` +
             `**Slots:** ${tournament.slotsRemaining}/${tournament.slots} | **Time:** ${tournament.time}\n` +
             `[Join in Tournament Schedule](<#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>)`,
      inline: false
    });
  }

  await message.reply({ embeds: [embed] });
}

async function cmdStats(message) {
  const profile = profileManager.getProfile(message.author.id);

  if (!profile) {
    return message.reply('❌ Create your profile first!');
  }

  const winRate = profile.tournaments.played > 0 
    ? ((profile.tournaments.won / profile.tournaments.played) * 100).toFixed(1) 
    : 0;

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${profile.name}'s Tournament Stats`)
    .addFields(
      { name: '🎮 Tournaments Played', value: `${profile.tournaments.played}`, inline: true },
      { name: '🏆 Tournaments Won', value: `${profile.tournaments.won}`, inline: true },
      { name: '📈 Win Rate', value: `${winRate}%`, inline: true },
      { name: '💰 Total Earnings', value: Utils.formatCurrency(profile.tournaments.earnings), inline: true },
      { name: '🎯 Kills', value: `${profile.stats.kills}`, inline: true },
      { name: '💀 Deaths', value: `${profile.stats.deaths}`, inline: true }
    )
    .setColor(CONFIG.BOT.COLOR)
    .setThumbnail(message.author.displayAvatarURL())
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function cmdClaim(message) {
  const inviteData = dataStore.load('invites');
  const userInvites = inviteData[message.author.id];

  if (!userInvites) {
    return message.reply('📨 No invite rewards to claim yet!');
  }

  const claimable = Object.keys(CONFIG.INVITE_REWARDS)
    .map(Number)
    .filter(count => 
      userInvites.validInvites >= count && 
      !userInvites.rewards.includes(count)
    );

  if (claimable.length === 0) {
    return message.reply('✅ All available rewards claimed! Keep inviting for more!');
  }

  // Auto-claim all available rewards
  for (const count of claimable) {
    await inviteTracker.checkInviteRewards(message.author.id, count, message.guild);
  }

  await message.reply(`🎉 Claimed ${claimable.length} reward(s)! Check your DMs for details!`);
}

// ═══════════════════════════════════════════════════════════════
// 🛡️ STAFF COMMANDS
// ═══════════════════════════════════════════════════════════════

async function cmdStaffPanel(message) {
  if (!message.member.roles.cache.has(CONFIG.ROLES.STAFF) && 
      !message.member.roles.cache.has(CONFIG.ROLES.ADMIN)) {
    return message.reply('❌ You need staff permissions to use this command!');
  }

  const staffChannel = message.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_TOOLS);
  if (staffChannel) {
    await staffTools.createStaffPanel(staffChannel);
    await message.reply(`✅ Staff panel created in ${staffChannel}!`);
  } else {
    await message.reply('❌ Staff tools channel not found!');
  }
}

async function cmdBan(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply('❌ You don\'t have permission to ban members!');
  }

  const user = message.mentions.users.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!user) {
    return message.reply('❌ Please mention a user to ban!');
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    return message.reply('❌ User not found in this server!');
  }

  if (!member.bannable) {
    return message.reply('❌ I cannot ban this user!');
  }

  await moderationSystem.banUser(member, reason);
  await message.reply(`✅ ${user.tag} has been banned. Reason: ${reason}`);
}

async function cmdTimeout(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply('❌ You don\'t have permission to timeout members!');
  }

  const user = message.mentions.users.first();
  const duration = args[1]; // in minutes
  const reason = args.slice(2).join(' ') || 'No reason provided';

  if (!user || !duration) {
    return message.reply('❌ Usage: `-timeout @user <minutes> <reason>`');
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    return message.reply('❌ User not found!');
  }

  const durationMs = parseInt(duration) * 60000;
  await moderationSystem.timeoutUser(member, durationMs, reason);
  await message.reply(`✅ ${user.tag} has been timed out for ${duration} minutes.`);
}

async function cmdWarn(message, args) {
  if (!message.member.roles.cache.has(CONFIG.ROLES.STAFF)) {
    return message.reply('❌ Staff only command!');
  }

  const user = message.mentions.users.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!user) {
    return message.reply('❌ Please mention a user to warn!');
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    return message.reply('❌ User not found!');
  }

  await moderationSystem.warnUser(member, reason);
  await message.reply(`✅ ${user.tag} has been warned.`);
}

async function cmdUnban(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply('❌ You don\'t have permission to unban members!');
  }

  const userId = args[0];
  if (!userId) {
    return message.reply('❌ Please provide a user ID!');
  }

  try {
    await message.guild.bans.remove(userId);
    await message.reply(`✅ User ${userId} has been unbanned.`);
  } catch (error) {
    await message.reply('❌ Could not unban user. Make sure they are banned and the ID is correct.');
  }
}

async function cmdAddStaff(message) {
  if (!message.member.roles.cache.has(CONFIG.ROLES.ADMIN) && 
      message.author.id !== CONFIG.ROLES.OWNER) {
    return message.reply('❌ Only admins can add staff!');
  }

  const user = message.mentions.users.first();
  if (!user) {
    return message.reply('❌ Please mention a user!');
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    return message.reply('❌ User not found!');
  }

  const staffRole = message.guild.roles.cache.get(CONFIG.ROLES.STAFF);
  if (!staffRole) {
    return message.reply('❌ Staff role not found!');
  }

  await member.roles.add(staffRole);
  
  const welcomeMessages = [
    `🎉 Welcome to the team ${user}! Tumhe hard work karna hai! 💪`,
    `👑 ${user} ab staff member hai! Let's make OTO great! 🔥`,
    `⚡ Welcome ${user}! Show your dedication and rise! 🚀`,
    `🌟 ${user} joined the staff! Let's work together! 💼`
  ];

  await message.channel.send(Utils.random(welcomeMessages));
}

async function cmdRemoveStaff(message) {
  if (!message.member.roles.cache.has(CONFIG.ROLES.ADMIN) && 
      message.author.id !== CONFIG.ROLES.OWNER) {
    return message.reply('❌ Only admins can remove staff!');
  }

  const user = message.mentions.users.first();
  if (!user) {
    return message.reply('❌ Please mention a user!');
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    return message.reply('❌ User not found!');
  }

  const staffRole = message.guild.roles.cache.get(CONFIG.ROLES.STAFF);
  if (!staffRole) {
    return message.reply('❌ Staff role not found!');
  }

  await member.roles.remove(staffRole);
  await message.reply(`✅ ${user.tag} has been removed from staff.`);
}

async function cmdAnnounce(message, args) {
  if (!message.member.roles.cache.has(CONFIG.ROLES.ADMIN)) {
    return message.reply('❌ Admin only command!');
  }

  const channelMention = message.mentions.channels.first();
  if (!channelMention) {
    return message.reply('❌ Please mention a channel!');
  }

  const announcement = args.slice(1).join(' ');
  if (!announcement) {
    return message.reply('❌ Please provide an announcement message!');
  }

  const embed = Utils.createEmbed(
    '📢 Announcement',
    announcement
  );

  await channelMention.send({ content: '@everyone', embeds: [embed] });
  await message.reply(`✅ Announcement sent to ${channelMention}!`);
}

// ═══════════════════════════════════════════════════════════════
// 🎮 HELPER FUNCTIONS FOR INTERACTIONS
// ═══════════════════════════════════════════════════════════════

async function handleFreeEntry(interaction) {
  const inviteData = dataStore.load('invites');
  const userInvites = inviteData[interaction.user.id];

  if (!userInvites || userInvites.validInvites < 10) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('You need at least 10 valid invites to claim a free entry!')],
      ephemeral: true
    });
  }

  // Show available tournaments
  const tournaments = dataStore.load('tournaments');
  const openTournaments = Object.values(tournaments).filter(t => t.status === 'open');

  if (openTournaments.length === 0) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('No tournaments available right now!')],
      ephemeral: true
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_free_tournament')
    .setPlaceholder('Choose a tournament')
    .addOptions(
      openTournaments.slice(0, 10).map(t => ({
        label: t.title,
        value: t.id,
        description: `${t.game} - ${Utils.formatCurrency(t.entryFee)}`
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: '🎮 Select a tournament to join for FREE:',
    components: [row],
    ephemeral: true
  });
}

async function showManageTournaments(interaction) {
  const tournaments = dataStore.load('tournaments');
  const allTournaments = Object.values(tournaments);

  if (allTournaments.length === 0) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('No tournaments found!')],
      ephemeral: true
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_tournament_to_manage')
    .setPlaceholder('Select a tournament to manage')
    .addOptions(
      allTournaments.slice(0, 20).map(t => ({
        label: t.title,
        value: t.id,
        description: `${t.status} - ${t.slotsRemaining}/${t.slots} slots`,
        emoji: t.status === 'open' ? '🟢' : t.status === 'ongoing' ? '🔵' : '⚫'
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: '📋 Select a tournament to manage:',
    components: [row],
    ephemeral: true
  });
}

async function showOpenTickets(interaction) {
  const tickets = dataStore.load('tickets');
  const openTickets = Object.values(tickets).filter(t => t.status !== 'closed');

  if (openTickets.length === 0) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('No open tickets!')],
      ephemeral: true
    });
  }

  let description = '';
  for (const ticket of openTickets.slice(0, 10)) {
    const channel = interaction.guild.channels.cache.get(ticket.channelId);
    const user = await client.users.fetch(ticket.userId).catch(() => null);
    
    description += `🎫 ${channel || 'Deleted'} - ${user?.tag || 'Unknown'}\n`;
    description += `   Status: ${ticket.status} | Type: ${ticket.type}\n\n`;
  }

  const embed = Utils.createEmbed('🎫 Open Tickets', description);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showWinnerDeclaration(interaction) {
  const tournaments = dataStore.load('tournaments');
  const completedTournaments = Object.values(tournaments)
    .filter(t => t.status === 'completed' && !t.winner);

  if (completedTournaments.length === 0) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('No tournaments ready for winner declaration!')],
      ephemeral: true
    });
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_winner_tournament')
    .setPlaceholder('Select tournament to declare winner')
    .addOptions(
      completedTournaments.slice(0, 10).map(t => ({
        label: t.title,
        value: t.id,
        description: `Prize: ${Utils.formatCurrency(t.prizePool)}`
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: '🏆 Select tournament to declare winner:',
    components: [row],
    ephemeral: true
  });
}

async function showUserManagement(interaction) {
  const embed = Utils.createEmbed(
    '👥 User Management',
    'Use these commands in chat:\n\n' +
    '`-ban @user <reason>` - Ban a user\n' +
    '`-timeout @user <minutes> <reason>` - Timeout\n' +
    '`-warn @user <reason>` - Warn a user\n' +
    '`-unban <userID>` - Unban a user'
  );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function showIgnModal(interaction) {
  const ticketId = interaction.customId.split('_')[2];
  const tickets = dataStore.load('tickets');
  const ticket = tickets[ticketId];

  if (!ticket) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('Ticket not found!')],
      ephemeral: true
    });
  }

  const tournaments = dataStore.load('tournaments');
  const tournament = tournaments[ticket.tournamentId];

  const modal = new ModalBuilder()
    .setCustomId(`ign_modal_${ticketId}`)
    .setTitle('In-Game Details');

  const ignInput = new TextInputBuilder()
    .setCustomId('ign')
    .setLabel('In-Game Name/ID')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter your in-game name or ID')
    .setRequired(true);

  let components = [new ActionRowBuilder().addComponents(ignInput)];

  if (tournament.mode.includes('Squad')) {
    const squadNameInput = new TextInputBuilder()
      .setCustomId('squad_name')
      .setLabel('Squad Name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter your squad name')
      .setRequired(true);

    const squadMembersInput = new TextInputBuilder()
      .setCustomId('squad_members')
      .setLabel('Squad Member Names (comma separated)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Player1, Player2, Player3, Player4')
      .setRequired(true);

    components.push(
      new ActionRowBuilder().addComponents(squadNameInput),
      new ActionRowBuilder().addComponents(squadMembersInput)
    );
  }

  modal.addComponents(...components);
  await interaction.showModal(modal);
}

async function saveIgnDetails(interaction) {
  const ticketId = interaction.customId.split('_')[2];
  const tickets = dataStore.load('tickets');
  const ticket = tickets[ticketId];

  if (!ticket) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('Ticket not found!')],
      ephemeral: true
    });
  }

  const tournaments = dataStore.load('tournaments');
  const tournament = tournaments[ticket.tournamentId];

  ticket.ign = interaction.fields.getTextInputValue('ign');
  
  if (tournament.mode.includes('Squad')) {
    ticket.squadName = interaction.fields.getTextInputValue('squad_name');
    ticket.squadMembers = interaction.fields.getTextInputValue('squad_members');
  }

  dataStore.save('tickets', tickets);

  // Generate payment QR (simulated with embed)
  const channel = interaction.guild.channels.cache.get(ticket.channelId);
  if (channel) {
    const paymentEmbed = Utils.createEmbed(
      '💳 Payment Required',
      `**Tournament:** ${tournament.title}\n` +
      `**Amount:** ${Utils.formatCurrency(tournament.entryFee)}\n\n` +
      `**Payment Methods:**\n` +
      `📱 UPI ID: \`oto-tournaments@upi\`\n` +
      `📱 Phone Pe: \`9876543210\`\n` +
      `📱 Google Pay: \`9876543210\`\n\n` +
      `⚠️ **Important:**\n` +
      `1. Make payment to the above UPI\n` +
      `2. Take screenshot of payment\n` +
      `3. Upload screenshot here\n` +
      `4. Wait for staff confirmation\n\n` +
      `⏰ **Time Limit:** 15 minutes\n` +
      `Reference ID: \`${ticketId.slice(-8)}\``
    );

    await channel.send({ embeds: [paymentEmbed] });
  }

  await interaction.reply({
    embeds: [Utils.successEmbed('✅ Details saved! Please make payment and upload screenshot.')],
    ephemeral: true
  });

  // Notify staff
  const staffChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
  if (staffChannel) {
    const notifyEmbed = Utils.createEmbed(
      '🎫 Payment Pending',
      `**User:** <@${ticket.userId}>\n` +
      `**Tournament:** ${tournament.title}\n` +
      `**IGN:** ${ticket.ign}\n` +
      (ticket.squadName ? `**Squad:** ${ticket.squadName}\n` : '') +
      `**Ticket:** <#${ticket.channelId}>\n\n` +
      `Waiting for payment screenshot...`
    );

    await staffChannel.send({ embeds: [notifyEmbed] });
  }
}

async function confirmPayment(interaction) {
  const ticketId = interaction.customId.split('_')[2];
  const tickets = dataStore.load('tickets');
  const ticket = tickets[ticketId];

  if (!ticket) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('Ticket not found!')],
      ephemeral: true
    });
  }

  const tournaments = dataStore.load('tournaments');
  const tournament = tournaments[ticket.tournamentId];

  // Add user to tournament participants
  tournament.participants.push(ticket.userId);
  tournament.confirmedParticipants.push(ticket.userId);
  tournament.slotsRemaining--;
  dataStore.save('tournaments', tournaments);

  // Update profile
  const profile = profileManager.getProfile(ticket.userId);
  if (profile) {
    profile.tournaments.played++;
    profileManager.updateProfile(ticket.userId, profile);
  }

  // Update ticket status
  ticket.status = 'confirmed';
  dataStore.save('tickets', tickets);

  // Notify user
  const channel = interaction.guild.channels.cache.get(ticket.channelId);
  if (channel) {
    const confirmEmbed = Utils.successEmbed(
      `🎉 Payment Confirmed!\n\n` +
      `You're now registered for **${tournament.title}**!\n\n` +
      `You'll be moved to the lobby channel soon.\n` +
      `Room ID and password will be shared 10 minutes before match starts.\n\n` +
      `Good luck! 🎮🔥`
    );

    await channel.send({ embeds: [confirmEmbed] });
  }

  // Create lobby ticket if all slots filled or create individual lobby
  await createLobbyTicket(interaction.guild, tournament, ticket.userId);

  // Update tournament message
  await updateTournamentMessage(interaction.guild, tournament);

  await interaction.reply({
    embeds: [Utils.successEmbed('✅ Payment confirmed! User added to tournament.')],
    ephemeral: true
  });
}

async function rejectPayment(interaction) {
  const ticketId = interaction.customId.split('_')[2];
  const tickets = dataStore.load('tickets');
  const ticket = tickets[ticketId];

  if (!ticket) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('Ticket not found!')],
      ephemeral: true
    });
  }

  const modal = new ModalBuilder()
    .setCustomId(`reject_reason_${ticketId}`)
    .setTitle('Rejection Reason');

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Why is the payment rejected?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Enter reason...')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
  await interaction.showModal(modal);
}

async function createLobbyTicket(guild, tournament, userId) {
  // Check if lobby already exists
  const lobbyName = `lobby-${tournament.id.slice(-4)}`;
  let lobbyChannel = guild.channels.cache.find(c => c.name === lobbyName);

  if (!lobbyChannel) {
    // Create lobby channel
    lobbyChannel = await guild.channels.create({
      name: lobbyName,
      type: ChannelType.GuildText,
      parent: guild.channels.cache.get(CONFIG.CHANNELS.OPEN_TICKET)?.parent,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: CONFIG.ROLES.STAFF,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }
      ]
    });

    // Send lobby welcome message
    const lobbyEmbed = Utils.createEmbed(
      `🎮 Tournament Lobby - ${tournament.title}`,
      `Welcome to the tournament lobby!\n\n` +
      `**Tournament Details:**\n` +
      `🎮 Game: ${tournament.game} - ${tournament.mode}\n` +
      `⏰ Time: ${tournament.time}\n` +
      `💰 Prize Pool: ${Utils.formatCurrency(tournament.prizePool)}\n` +
      `🗺️ Map: ${tournament.map}\n\n` +
      `**Rules:**\n` +
      `✅ Be ready 10 minutes before start time\n` +
      `✅ Room ID & Password will be shared here\n` +
      `✅ No teaming or cheating\n` +
      `✅ Record gameplay if possible\n\n` +
      `**Confirmed Players:**\n` +
      `Will be updated as players join...`
    );

    await lobbyChannel.send({ embeds: [lobbyEmbed] });
  }

  // Add user to lobby
  await lobbyChannel.permissionOverwrites.create(userId, {
    ViewChannel: true,
    SendMessages: true
  });

  // Notify user
  const user = await guild.members.fetch(userId).catch(() => null);
  if (user) {
    await lobbyChannel.send(`${user} has joined the lobby! Welcome! 🎮`);
  }

  // Update confirmed players list
  const messages = await lobbyChannel.messages.fetch({ limit: 10 });
  const lobbyMessage = messages.find(m => m.embeds[0]?.title?.includes('Tournament Lobby'));
  
  if (lobbyMessage) {
    const confirmedUsers = await Promise.all(
      tournament.confirmedParticipants.map(id => guild.members.fetch(id).catch(() => null))
    );
    
    const playerList = confirmedUsers
      .filter(m => m)
      .map((m, i) => `${i + 1}. ${m.user.tag}`)
      .join('\n');

    const updatedEmbed = EmbedBuilder.from(lobbyMessage.embeds[0])
      .setDescription(
        lobbyMessage.embeds[0].description.split('**Confirmed Players:**')[0] +
        `**Confirmed Players:** (${tournament.confirmedParticipants.length}/${tournament.slots})\n` +
        `${playerList || 'None yet'}`
      );

    await lobbyMessage.edit({ embeds: [updatedEmbed] });
  }
}

async function updateTournamentMessage(guild, tournament) {
  if (!tournament.messageId) return;

  const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
  if (!channel) return;

  try {
    const message = await channel.messages.fetch(tournament.messageId);
    const embed = EmbedBuilder.from(message.embeds[0]);
    
    // Update slots
    embed.setDescription(
      embed.data.description.replace(
        /📊 \*\*Slots:\*\* \d+\/\d+/,
        `📊 **Slots:** ${tournament.slotsRemaining}/${tournament.slots}`
      )
    );

    // Add status indicator
    if (tournament.slotsRemaining === 0) {
      embed.setColor('#FF0000');
      embed.setTitle(`🔴 FULL - ${tournament.title}`);
    } else if (tournament.slotsRemaining <= 3) {
      embed.setColor('#FFA500');
      embed.setTitle(`🟠 FILLING FAST - ${tournament.title}`);
    }

    await message.edit({ embeds: [embed] });
  } catch (error) {
    console.error('Could not update tournament message:', error);
  }
}

async function handleTournamentTemplate(interaction) {
  const template = interaction.values[0];

  if (template === 'custom') {
    // Show custom tournament modal
    const modal = new ModalBuilder()
      .setCustomId('tournament_modal_custom')
      .setTitle('Create Custom Tournament');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Tournament Title')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('game')
          .setLabel('Game (Free Fire/Minecraft)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('mode')
          .setLabel('Mode (Solo/Duo/Squad)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('entry_slots')
          .setLabel('Entry Fee | Slots (e.g., 50|12)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('50|12')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('time')
          .setLabel('Time (e.g., 8:00 PM)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

    await interaction.showModal(modal);
  } else {
    // Use template
    const templateData = tournamentManager.templates[template];
    
    const modal = new ModalBuilder()
      .setCustomId(`tournament_modal_${template}`)
      .setTitle(`Create ${template} Tournament`);

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Tournament Title')
          .setStyle(TextInputStyle.Short)
          .setValue(`${template} Tournament`)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('entry_fee')
          .setLabel('Entry Fee (₹)')
          .setStyle(TextInputStyle.Short)
          .setValue(templateData.defaultEntry.toString())
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('slots')
          .setLabel('Number of Slots')
          .setStyle(TextInputStyle.Short)
          .setValue(templateData.defaultSlots.toString())
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('time')
          .setLabel('Time (e.g., 8:00 PM)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image_url')
          .setLabel('Image URL (optional)')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );

    await interaction.showModal(modal);
  }
}

async function createTournamentFromModal(interaction) {
  const modalId = interaction.customId;
  
  let tournamentData;

  if (modalId === 'tournament_modal_custom') {
    const entrySlots = interaction.fields.getTextInputValue('entry_slots').split('|');
    
    tournamentData = {
      title: interaction.fields.getTextInputValue('title'),
      game: interaction.fields.getTextInputValue('game'),
      mode: interaction.fields.getTextInputValue('mode'),
      entryFee: parseInt(entrySlots[0]),
      slots: parseInt(entrySlots[1]),
      time: interaction.fields.getTextInputValue('time'),
      map: 'Default'
    };
  } else {
    const template = modalId.split('_')[2];
    const templateData = tournamentManager.templates[template];

    tournamentData = {
      title: interaction.fields.getTextInputValue('title'),
      game: templateData.game,
      mode: templateData.mode,
      entryFee: parseInt(interaction.fields.getTextInputValue('entry_fee')),
      slots: parseInt(interaction.fields.getTextInputValue('slots')),
      time: interaction.fields.getTextInputValue('time'),
      map: templateData.map || 'Default',
      imageUrl: interaction.fields.getTextInputValue('image_url') || null
    };
  }

  // Create tournament
  const tournament = await tournamentManager.createTournament(interaction, tournamentData);

  await interaction.reply({
    embeds: [Utils.successEmbed(
      `✅ Tournament Created!\n\n` +
      `**${tournament.title}**\n` +
      `Prize Pool: ${Utils.formatCurrency(tournament.prizePool)}\n` +
      `Slots: ${tournament.slots}\n\n` +
      `Tournament has been posted to schedule and general chat!`
    )],
    ephemeral: true
  });
}

async function showTournamentManagement(interaction) {
  const tournamentId = interaction.values[0];
  const tournaments = dataStore.load('tournaments');
  const tournament = tournaments[tournamentId];

  if (!tournament) {
    return interaction.reply({
      embeds: [Utils.errorEmbed('Tournament not found!')],
      ephemeral: true
    });
  }

  const embed = Utils.createEmbed(
    `🎮 Manage: ${tournament.title}`,
    `**Status:** ${tournament.status}\n` +
    `**Slots:** ${tournament.slotsRemaining}/${tournament.slots}\n` +
    `**Participants:** ${tournament.confirmedParticipants.length}\n` +
    `**Created:** ${Utils.formatTime(tournament.createdAt)}`
  );

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`tournament_start_${tournamentId}`)
        .setLabel('▶️ Start Tournament')
        .setStyle(ButtonStyle.Success)
        .setDisabled(tournament.status !== 'open'),
      new ButtonBuilder()
        .setCustomId(`tournament_cancel_${tournamentId}`)
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`tournament_edit_${tournamentId}`)
        .setLabel('✏️ Edit')
        .setStyle(ButtonStyle.Primary)
    );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function showWinnerForm(interaction) {
  const tournamentId = interaction.values[0];
  
  const modal = new ModalBuilder()
    .setCustomId(`winner_modal_${tournamentId}`)
    .setTitle('Declare Winner');

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('first_place')
        .setLabel('1st Place (User ID or mention)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('second_place')
        .setLabel('2nd Place (User ID or mention)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('third_place')
        .setLabel('3rd Place (User ID or mention)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('screenshot_url')
        .setLabel('Result Screenshot URL (optional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    )
  );

  await interaction.showModal(modal);
}

// ═══════════════════════════════════════════════════════════════
// 🚀 BOT LOGIN
// ═══════════════════════════════════════════════════════════════

const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ Error: BOT_TOKEN not found in environment variables!');
  console.error('Please set BOT_TOKEN in your Render environment variables.');
  process.exit(1);
}

client.login(token)
  .then(() => {
    console.log('🎮 OTO Tournament Bot starting...');
  })
  .catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  });

// ═══════════════════════════════════════════════════════════════
// ⚠️ ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// ═══════════════════════════════════════════════════════════════
// 📊 KEEP-ALIVE FOR RENDER (24/7 UPTIME)
// ═══════════════════════════════════════════════════════════════

const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      bot: client.user?.tag || 'Starting...',
      uptime: process.uptime(),
      servers: client.guilds.cache.size,
      users: client.users.cache.size
    }));
  } else if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
