const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, PermissionsBitField, ChannelType, Events, Partials, StringSelectMenuBuilder, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Initialize Discord Client with all required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

// Channel IDs from your server
const CHANNELS = {
  GENERAL: '1438482904018849835',
  TOURNAMENT_SCHEDULE: '1438482561679626303',
  TICKET_LOG: '1438485821572518030',
  MATCH_REPORTS: '1438486113047150714',
  ANNOUNCEMENT: '1438484746165555243',
  LEADERBOARD: '1438947356690223347',
  INVITE_TRACKER: '1439216884774998107',
  PROFILE_SECTION: '1439542574066176020',
  STAFF_TOOLS: '1438486059255336970',
  MINECRAFT: '1439223955960627421',
  MOST_PLAYER_LEADERBOARD: '1439226024863993988',
  WELCOME: '1438482904018849835',
  SUPPORT: '1438486059255336970'
};

// Role IDs
const ROLES = {
  OWNER: '1438443937588183110',
  ADMIN: '1438475461977047112',
  STAFF: '1438475461977047112',
  PLAYER: '1439542574066176021',
  FOUNDER: '1438443937588183110',
  PREMIUM: '1439542574066176022',
  VERIFIED: '1439542574066176023'
};

// Bot Configuration
const CONFIG = {
  PREFIX: '-',
  OTO_ID_PREFIX: 'OTO-',
  UPI_ID: 'your-upi@paytm',
  SUPPORT_ROLE: '1438475461977047112',
  AUTO_RESPONSE_DELAY: 120000, // 2 minutes
  BACKUP_INTERVAL: 300000, // 5 minutes
  LEADERBOARD_UPDATE_INTERVAL: 600000, // 10 minutes
  INVITE_REWARD_THRESHOLDS: [5, 10, 15, 20, 30, 50, 100],
  DAILY_REWARD_AMOUNT: 50,
  WEEKLY_REWARD_AMOUNT: 200,
  MONTHLY_REWARD_AMOUNT: 500
};

// Data Storage
class DataManager {
  constructor() {
    this.dataPath = './data';
    this.initStorage();
  }

  initStorage() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }

    const defaultFiles = {
      'profiles.json': {},
      'tournaments.json': {},
      'tickets.json': {},
      'invites.json': {},
      'warnings.json': {},
      'leaderboards.json': {
        tournaments: { mostWins: [], highestEarnings: [], bestWinRate: [], currentStreak: [] },
        invites: { allTime: [], monthly: [], weekly: [], daily: [] },
        squads: { bestSquad: [], deadliestSquad: [], richestSquad: [] }
      },
      'staff.json': {},
      'analytics.json': {
        daily: {},
        weekly: {},
        monthly: {}
      },
      'rewards.json': {},
      'economy.json': {},
      'config.json': CONFIG
    };

    Object.entries(defaultFiles).forEach(([filename, defaultData]) => {
      const filePath = path.join(this.dataPath, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      }
    });
  }

  readData(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      if (!fs.existsSync(filePath)) {
        this.initStorage();
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return {};
    }
  }

  writeData(filename, data) {
    try {
      const filePath = path.join(this.dataPath, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  backupData() {
    const backupDir = path.join(this.dataPath, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const files = fs.readdirSync(this.dataPath).filter(file => file.endsWith('.json') && file !== 'backups');

    files.forEach(file => {
      const sourcePath = path.join(this.dataPath, file);
      const backupPath = path.join(backupDir, `${timestamp}_${file}`);
      fs.copyFileSync(sourcePath, backupPath);
    });
  }
}

// Initialize Data Manager
const dataManager = new DataManager();

// Profile System
class ProfileSystem {
  constructor() {
    this.profiles = dataManager.readData('profiles.json');
    this.pendingProfiles = new Map();
    this.profileStates = new Map();
  }

  generateOTOId() {
    const id = Math.floor(1000 + Math.random() * 9000);
    return `OTO-${id}`;
  }

  async sendWelcomeDM(member) {
    try {
      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🎮 Welcome to OTO Tournaments! 🎮')
        .setDescription('**Complete your profile to unlock all features and start playing tournaments!**')
        .setColor(0x00FF00)
        .addFields(
          { name: '📝 Profile Benefits', value: '• Unlock all channels\n• Get Player role\n• Join tournaments\n• Earn rewards\n• Track stats', inline: false },
          { name: '⚡ Quick Start', value: 'Click the button below to create your profile!', inline: false }
        )
        .setFooter({ text: 'OTO Tournaments - Play. Compete. Win.' })
        .setTimestamp();

      const startButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start_profile')
          .setLabel('🎮 Start Profile Creation')
          .setStyle(ButtonStyle.Success)
      );

      await member.send({ embeds: [welcomeEmbed], components: [startButton] });
      
      this.pendingProfiles.set(member.id, {
        step: 0,
        data: {}
      });
    } catch (error) {
      console.error('Failed to send welcome DM:', error);
    }
  }

  async startProfileCreation(interaction) {
    try {
      const member = interaction.member || interaction.user;
      
      const nameEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 1/4')
        .setDescription('**What\'s your name?**\n\nPlease type your real name below:')
        .setColor(0x0099FF)
        .setFooter({ text: 'Profile completion unlocks tournament access!' });

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [nameEmbed], components: [] });
      } else {
        await interaction.reply({ embeds: [nameEmbed], ephemeral: true });
      }
      
      this.profileStates.set(member.id, {
        step: 1,
        data: { startedAt: Date.now() },
        interaction: interaction
      });

      // Create a message collector for name input
      const filter = m => m.author.id === member.id;
      const collector = interaction.channel.createMessageCollector({ 
        filter, 
        time: 300000,
        max: 1
      });

      collector.on('collect', async (message) => {
        const name = message.content.trim();
        if (name.length < 2 || name.length > 20) {
          await message.reply('❌ Please enter a valid name (2-20 characters):');
          collector.resetTimer();
          return;
        }

        this.profileStates.get(member.id).data.name = name;
        await message.reply('✅ Name saved! Moving to next step...');
        await this.askGender(member);
        collector.stop();
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          interaction.followUp({ 
            content: '❌ Profile creation timed out. Please start again.', 
            ephemeral: true 
          });
          this.profileStates.delete(member.id);
        }
      });

    } catch (error) {
      console.error('Error starting profile creation:', error);
      if (!interaction.replied) {
        await interaction.reply({ 
          content: '❌ An error occurred. Please try again.', 
          ephemeral: true 
        });
      }
    }
  }

  async askGender(member) {
    try {
      const genderEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 2/4')
        .setDescription('**Select your gender:**')
        .setColor(0x0099FF);

      const genderButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`gender_male_${member.id}`)
          .setLabel('👨 Male')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`gender_female_${member.id}`)
          .setLabel('👩 Female')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`gender_other_${member.id}`)
          .setLabel('⚧️ Other')
          .setStyle(ButtonStyle.Secondary)
      );

      await member.send({ embeds: [genderEmbed], components: [genderButtons] });
      this.profileStates.get(member.id).step = 2;

    } catch (error) {
      console.error('Error asking gender:', error);
    }
  }

  async handleGenderSelection(interaction) {
    try {
      const customId = interaction.customId;
      const userId = customId.split('_')[2];
      const gender = customId.split('_')[1];

      if (interaction.user.id !== userId) {
        await interaction.reply({ 
          content: '❌ This is not your profile creation!', 
          ephemeral: true 
        });
        return;
      }

      this.profileStates.get(userId).data.gender = gender;
      
      await interaction.update({ 
        content: `✅ Gender selected: ${gender === 'male' ? '👨 Male' : gender === 'female' ? '👩 Female' : '⚧️ Other'}`,
        embeds: [],
        components: [] 
      });

      await this.askState(interaction.user);

    } catch (error) {
      console.error('Error handling gender selection:', error);
    }
  }

  async askState(user) {
    try {
      const stateEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 3/4')
        .setDescription('**Which state are you from?**\n\nPlease type your state name below:')
        .setColor(0x0099FF);

      await user.send({ embeds: [stateEmbed] });
      this.profileStates.get(user.id).step = 3;

      const filter = m => m.author.id === user.id;
      const collector = user.dmChannel.createMessageCollector({ 
        filter, 
        time: 300000,
        max: 1 
      });

      collector.on('collect', async (message) => {
        const state = message.content.trim();
        if (state.length < 2 || state.length > 30) {
          await message.reply('❌ Please enter a valid state name:');
          collector.resetTimer();
          return;
        }

        this.profileStates.get(user.id).data.state = state;
        await message.reply('✅ State saved! Moving to next step...');
        await this.askGame(user);
        collector.stop();
      });

    } catch (error) {
      console.error('Error asking state:', error);
    }
  }

  async askGame(user) {
    try {
      const gameEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 4/4')
        .setDescription('**Select your primary game:**')
        .setColor(0x0099FF);

      const gameButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`game_freefire_${user.id}`)
          .setLabel('🔥 Free Fire')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`game_minecraft_${user.id}`)
          .setLabel('⛏️ Minecraft')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`game_both_${user.id}`)
          .setLabel('🎮 Both')
          .setStyle(ButtonStyle.Primary)
      );

      await user.send({ embeds: [gameEmbed], components: [gameButtons] });
      this.profileStates.get(user.id).step = 4;

    } catch (error) {
      console.error('Error asking game:', error);
    }
  }

  async handleGameSelection(interaction) {
    try {
      const customId = interaction.customId;
      const userId = customId.split('_')[2];
      const gameChoice = customId.split('_')[1];

      if (interaction.user.id !== userId) {
        await interaction.reply({ 
          content: '❌ This is not your profile creation!', 
          ephemeral: true 
        });
        return;
      }

      await this.completeProfile(interaction.user, gameChoice);
      await interaction.update({ 
        content: '✅ Game selected! Completing your profile...',
        embeds: [],
        components: [] 
      });

    } catch (error) {
      console.error('Error handling game selection:', error);
    }
  }

  async completeProfile(user, gameChoice) {
    try {
      const state = this.profileStates.get(user.id);
      if (!state) return;

      const profileData = {
        userId: user.id,
        otoId: this.generateOTOId(),
        name: state.data.name,
        gender: state.data.gender,
        state: state.data.state,
        game: gameChoice,
        level: 1,
        xp: 0,
        badges: ['🎯 New Player'],
        stats: {
          tournamentsPlayed: 0,
          wins: 0,
          earnings: 0,
          invites: 0,
          joinDate: Date.now(),
          totalPlayTime: 0,
          bestStreak: 0,
          currentStreak: 0
        },
        verification: 0,
        createdAt: Date.now(),
        completed: true,
        lastDailyReward: null,
        lastWeeklyReward: null,
        lastMonthlyReward: null
      };

      this.profiles[user.id] = profileData;
      dataManager.writeData('profiles.json', this.profiles);

      this.profileStates.delete(user.id);
      this.pendingProfiles.delete(user.id);

      const guild = client.guilds.cache.first();
      const member = await guild.members.fetch(user.id);
      
      try {
        const playerRole = guild.roles.cache.get(ROLES.PLAYER);
        if (playerRole) {
          await member.roles.add(playerRole);
        }
      } catch (error) {
        console.error('Failed to assign player role:', error);
      }

      await this.sendCompletionMessage(user, profileData);
      await this.postProfileShowcase(member, profileData);
      await this.sendWelcomeAnnouncement(member, profileData);

    } catch (error) {
      console.error('Error completing profile:', error);
    }
  }

  async sendCompletionMessage(user, profileData) {
    try {
      const completionEmbed = new EmbedBuilder()
        .setTitle('✅ Profile Created Successfully!')
        .setDescription(`**Welcome to OTO Tournaments, ${profileData.name}!**`)
        .setColor(0x00FF00)
        .addFields(
          { name: '🎯 Your OTO ID', value: `\`${profileData.otoId}\``, inline: true },
          { name: '👤 Name', value: profileData.name, inline: true },
          { name: '🌍 State', value: profileData.state, inline: true },
          { name: '🎮 Primary Game', value: this.getGameName(profileData.game), inline: true },
          { name: '⭐ Level', value: '1', inline: true },
          { name: '🏆 Badges', value: profileData.badges.join(', '), inline: true }
        )
        .setFooter({ text: 'You can now access all channels and join tournaments!' })
        .setTimestamp();

      const actionButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('view_profile')
          .setLabel('👤 View Profile')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('join_tournament')
          .setLabel('🎮 Join Tournament')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel('📖 Rules')
          .setURL('https://discord.com/channels/1438443937536479245/1438484746165555243')
          .setStyle(ButtonStyle.Link)
      );

      await user.send({ embeds: [completionEmbed], components: [actionButtons] });
    } catch (error) {
      console.error('Error sending completion message:', error);
    }
  }

  async postProfileShowcase(member, profileData) {
    try {
      const profileChannel = client.channels.cache.get(CHANNELS.PROFILE_SECTION);
      if (!profileChannel) return;

      const profileEmbed = new EmbedBuilder()
        .setTitle(`🎮 New Player: ${profileData.name}`)
        .setDescription(`**OTO ID:** ${profileData.otoId}`)
        .setColor(0x0099FF)
        .addFields(
          { name: '👤 Player', value: `<@${member.id}>`, inline: true },
          { name: '🎮 Game', value: this.getGameName(profileData.game), inline: true },
          { name: '🌍 State', value: profileData.state, inline: true },
          { name: '⭐ Level', value: '1', inline: true },
          { name: '🏆 Badges', value: profileData.badges.join(', '), inline: true }
        )
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Welcome to OTO Tournaments!' })
        .setTimestamp();

      await profileChannel.send({ embeds: [profileEmbed] });
    } catch (error) {
      console.error('Failed to post profile showcase:', error);
    }
  }

  async sendWelcomeAnnouncement(member, profileData) {
    try {
      const generalChannel = client.channels.cache.get(CHANNELS.GENERAL);
      if (!generalChannel) return;

      const gender = profileData.gender || 'other';
      const greetings = {
        male: [
          `🔥 ${member} has entered the arena! Ready to dominate?`,
          `💪 A new warrior ${member} joins the battle!`,
          `🎮 ${member} is here! Tournament khelega bro?`,
          `⚡ Welcome ${member}! Let's win some money! 💰`
        ],
        female: [
          `✨ ${member} has joined our gaming family! Welcome ji! 🎮`,
          `🌸 Welcome ${member}! Ready to show your skills?`,
          `💎 ${member} is here! Tournament khelogi? 🔥`,
          `👑 Welcome ${member} to OTO Tournaments! 🎯`
        ],
        other: [
          `🎉 ${member} has joined OTO Tournaments!`,
          `🚀 Welcome ${member}! Get ready to compete!`,
          `🌟 ${member} is here! Let the games begin!`,
          `💫 Welcome ${member} to our gaming community!`
        ]
      };

      const genderGreetings = greetings[gender] || greetings.other;
      const randomGreeting = genderGreetings[Math.floor(Math.random() * genderGreetings.length)];

      await generalChannel.send(randomGreeting);
    } catch (error) {
      console.error('Failed to send welcome announcement:', error);
    }
  }

  getGameName(gameCode) {
    const games = {
      'freefire': '🔥 Free Fire',
      'minecraft': '⛏️ Minecraft',
      'both': '🎮 Both Games'
    };
    return games[gameCode] || gameCode;
  }

  getProfile(userId) {
    return this.profiles[userId];
  }

  updateProfile(userId, updates) {
    if (this.profiles[userId]) {
      this.profiles[userId] = { ...this.profiles[userId], ...updates };
      dataManager.writeData('profiles.json', this.profiles);
      return true;
    }
    return false;
  }

  async forceProfileCompletion(member) {
    try {
      const profile = this.getProfile(member.id);
      if (!profile || !profile.completed) {
        await this.sendWelcomeDM(member);
      }
    } catch (error) {
      console.error('Error forcing profile completion:', error);
    }
  }

  async addXP(userId, xpAmount) {
    const profile = this.getProfile(userId);
    if (!profile) return;

    profile.xp += xpAmount;
    
    // Level up calculation (1000 XP per level)
    const newLevel = Math.floor(profile.xp / 1000) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
      
      // Add badges based on level
      if (newLevel >= 5 && !profile.badges.includes('🌟 Rising Star')) {
        profile.badges.push('🌟 Rising Star');
      }
      if (newLevel >= 10 && !profile.badges.includes('💎 Pro Player')) {
        profile.badges.push('💎 Pro Player');
      }
      if (newLevel >= 20 && !profile.badges.includes('👑 Elite Gamer')) {
        profile.badges.push('👑 Elite Gamer');
      }
      
      this.updateProfile(userId, profile);
      
      // Notify user about level up
      try {
        const user = await client.users.fetch(userId);
        const levelUpEmbed = new EmbedBuilder()
          .setTitle('🎉 Level Up!')
          .setDescription(`**Congratulations! You've reached Level ${newLevel}!**`)
          .setColor(0xFFD700)
          .addFields(
            { name: '⭐ New Level', value: newLevel.toString(), inline: true },
            { name: '📊 Total XP', value: profile.xp.toString(), inline: true },
            { name: '🎖️ New Badges', value: profile.badges.slice(-1)[0] || 'None', inline: true }
          )
          .setFooter({ text: 'Keep playing to earn more rewards!' });
        
        await user.send({ embeds: [levelUpEmbed] });
      } catch (error) {
        console.error('Failed to send level up notification:', error);
      }
    } else {
      this.updateProfile(userId, profile);
    }
  }
}

// Invite System
class InviteSystem {
  constructor() {
    this.invites = dataManager.readData('invites.json');
    this.leaderboards = dataManager.readData('leaderboards.json');
    this.pendingInvites = new Map();
  }

  async trackInvite(inviterId, invitedId) {
    if (!this.invites[inviterId]) {
      this.invites[inviterId] = {
        total: 0,
        valid: 0,
        pending: 0,
        invitedUsers: [],
        rewardsClaimed: [],
        lastInvite: Date.now()
      };
    }

    this.invites[inviterId].total++;
    this.invites[inviterId].pending++;
    this.invites[inviterId].invitedUsers.push({
      userId: invitedId,
      timestamp: Date.now(),
      status: 'pending',
      validated: false
    });

    this.pendingInvites.set(invitedId, {
      inviterId: inviterId,
      joinTime: Date.now(),
      validated: false
    });

    dataManager.writeData('invites.json', this.invites);
    await this.notifyInviter(inviterId, invitedId);
  }

  async notifyInviter(inviterId, invitedId) {
    try {
      const inviter = await client.users.fetch(inviterId);
      const invited = await client.users.fetch(invitedId);
      
      const notificationEmbed = new EmbedBuilder()
        .setTitle('🎉 New Invitation!')
        .setDescription(`**${invited.username}** joined using your invite link!`)
        .setColor(0x00FF00)
        .addFields(
          { name: '📊 Your Stats', value: `Total Invites: ${this.invites[inviterId].total}\nValid Invites: ${this.invites[inviterId].valid}`, inline: true },
          { name: '🎯 Next Reward', value: this.getNextReward(inviterId), inline: true }
        )
        .setFooter({ text: 'Invite more friends to earn amazing rewards!' });

      await inviter.send({ embeds: [notificationEmbed] });
    } catch (error) {
      console.error('Failed to notify inviter:', error);
    }
  }

  getNextReward(inviterId) {
    const userInvites = this.invites[inviterId]?.valid || 0;
    const rewards = {
      5: 'Beginner Recruiter Role',
      10: 'FREE Tournament Entry',
      15: '50% Discount Next Entry',
      20: 'FREE Tournament + Pro Recruiter Role',
      30: 'FREE Premium + Elite Recruiter Role',
      50: 'Custom Role + 3 FREE Entries',
      100: 'Lifetime 50% Discount + Legend Role'
    };

    for (const threshold of CONFIG.INVITE_REWARD_THRESHOLDS) {
      if (userInvites < threshold) {
        return `${threshold - userInvites} more for: ${rewards[threshold]}`;
      }
    }

    return 'Max rewards achieved! 🎉';
  }

  async validateInvite(userId) {
    const pending = this.pendingInvites.get(userId);
    if (!pending || pending.validated) return false;

    const user = await client.users.fetch(userId);
    const profile = profileSystem.getProfile(userId);
    const accountAge = Date.now() - user.createdTimestamp;
    const timeInServer = Date.now() - pending.joinTime;

    if (accountAge < 7 * 24 * 60 * 60 * 1000) return false;
    if (!profile || !profile.completed) return false;
    if (timeInServer < 3 * 24 * 60 * 60 * 1000) return false;

    pending.validated = true;
    this.pendingInvites.set(userId, pending);

    const inviterId = pending.inviterId;
    if (this.invites[inviterId]) {
      this.invites[inviterId].valid++;
      this.invites[inviterId].pending--;
      
      const invitedUser = this.invites[inviterId].invitedUsers.find(u => u.userId === userId);
      if (invitedUser) {
        invitedUser.status = 'valid';
        invitedUser.validated = true;
        invitedUser.validatedAt = Date.now();
      }

      dataManager.writeData('invites.json', this.invites);
      await this.checkRewardMilestones(inviterId);
      this.updateInviteLeaderboards();
      
      // Add XP for successful invite
      await profileSystem.addXP(inviterId, 100);
      
      return true;
    }

    return false;
  }

  async checkRewardMilestones(inviterId) {
    const validInvites = this.invites[inviterId]?.valid || 0;
    const rewards = this.invites[inviterId]?.rewardsClaimed || [];

    const milestoneRewards = {
      5: { type: 'role', value: 'Beginner Recruiter' },
      10: { type: 'free_entry', value: 1 },
      15: { type: 'discount', value: 50 },
      20: { type: 'combo', value: 'free_entry+role' },
      30: { type: 'premium', value: '1_month' },
      50: { type: 'combo', value: 'custom_role+3_entries' },
      100: { type: 'lifetime', value: '50_discount+legend_role' }
    };

    for (const [threshold, reward] of Object.entries(milestoneRewards)) {
      const thresholdNum = parseInt(threshold);
      if (validInvites >= thresholdNum && !rewards.includes(thresholdNum)) {
        await this.giveReward(inviterId, thresholdNum, reward);
        rewards.push(thresholdNum);
        this.invites[inviterId].rewardsClaimed = rewards;
        dataManager.writeData('invites.json', this.invites);
      }
    }
  }

  async giveReward(inviterId, threshold, reward) {
    try {
      const inviter = await client.users.fetch(inviterId);
      
      const rewardEmbed = new EmbedBuilder()
        .setTitle('🎁 Invite Reward Unlocked!')
        .setDescription(`**Congratulations! You've reached ${threshold} valid invites!**`)
        .setColor(0xFFD700)
        .addFields(
          { name: '🎯 Reward', value: this.getRewardDescription(reward), inline: false },
          { name: '📊 Your Invites', value: `Total: ${this.invites[inviterId]?.total || 0}\nValid: ${this.invites[inviterId]?.valid || 0}`, inline: true }
        )
        .setFooter({ text: 'Keep inviting to unlock more amazing rewards!' });

      await inviter.send({ embeds: [rewardEmbed] });

      switch (reward.type) {
        case 'role':
          await this.assignRecruiterRole(inviterId, reward.value);
          break;
        case 'free_entry':
          profileSystem.updateProfile(inviterId, {
            freeEntries: (profileSystem.getProfile(inviterId)?.freeEntries || 0) + reward.value
          });
          break;
        case 'discount':
          profileSystem.updateProfile(inviterId, {
            discounts: [...(profileSystem.getProfile(inviterId)?.discounts || []), reward]
          });
          break;
      }
      
      // Add XP for reaching milestone
      await profileSystem.addXP(inviterId, threshold * 50);
      
    } catch (error) {
      console.error('Failed to give reward:', error);
    }
  }

  getRewardDescription(reward) {
    const descriptions = {
      'role': `🎖️ ${reward.value} Role`,
      'free_entry': `🎫 ${reward.value} FREE Tournament Entry`,
      'discount': `💸 ${reward.value}% Discount on Next Entry`,
      'combo': `🎁 FREE Tournament + Special Role`,
      'premium': `⭐ 1 Month Premium Membership`,
      'lifetime': `👑 Lifetime 50% Discount + Legend Role`
    };
    return descriptions[reward.type] || 'Special Reward';
  }

  async assignRecruiterRole(userId, roleType) {
    try {
      const guild = client.guilds.cache.first();
      const member = await guild.members.fetch(userId);
      console.log(`Would assign ${roleType} role to ${member.user.username}`);
    } catch (error) {
      console.error('Failed to assign recruiter role:', error);
    }
  }

  updateInviteLeaderboards() {
    const allInvites = Object.entries(this.invites)
      .map(([userId, data]) => ({
        userId,
        valid: data.valid,
        total: data.total
      }))
      .sort((a, b) => b.valid - a.valid)
      .slice(0, 10);

    this.leaderboards.invites.allTime = allInvites;
    dataManager.writeData('leaderboards.json', this.leaderboards);
  }

  getInviteStats(userId) {
    return this.invites[userId] || { total: 0, valid: 0, pending: 0, rewardsClaimed: [] };
  }

  async postInviteLeaderboard() {
    try {
      const leaderboardChannel = client.channels.cache.get(CHANNELS.INVITE_TRACKER);
      if (!leaderboardChannel) return;

      const topInvites = this.leaderboards.invites.allTime.slice(0, 5);

      const leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 Top Inviters - All Time')
        .setDescription('**Players with most valid invites:**')
        .setColor(0xFFD700)
        .setTimestamp();

      if (topInvites.length === 0) {
        leaderboardEmbed.addFields({
          name: 'No invites yet',
          value: 'Be the first to invite friends and get on the leaderboard!'
        });
      } else {
        for (let i = 0; i < topInvites.length; i++) {
          const entry = topInvites[i];
          try {
            const user = await client.users.fetch(entry.userId);
            leaderboardEmbed.addFields({
              name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔸'} ${user.username}`,
              value: `Valid: ${entry.valid} | Total: ${entry.total}`,
              inline: false
            });
          } catch (error) {
            leaderboardEmbed.addFields({
              name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔸'} Unknown User`,
              value: `Valid: ${entry.valid} | Total: ${entry.total}`,
              inline: false
            });
          }
        }
      }

      await leaderboardChannel.send({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error('Failed to post invite leaderboard:', error);
    }
  }
}

// Economy System
class EconomySystem {
  constructor() {
    this.economy = dataManager.readData('economy.json');
    this.rewards = dataManager.readData('rewards.json');
  }

  async giveDailyReward(userId) {
    const profile = profileSystem.getProfile(userId);
    if (!profile) return false;

    const now = Date.now();
    const lastDaily = profile.lastDailyReward;
    
    if (lastDaily && this.isSameDay(now, lastDaily)) {
      return false; // Already claimed today
    }

    const rewardAmount = CONFIG.DAILY_REWARD_AMOUNT;
    
    profileSystem.updateProfile(userId, {
      lastDailyReward: now,
      'stats.earnings': (profile.stats.earnings || 0) + rewardAmount
    });

    await profileSystem.addXP(userId, 50);

    try {
      const user = await client.users.fetch(userId);
      const rewardEmbed = new EmbedBuilder()
        .setTitle('🎁 Daily Reward Claimed!')
        .setDescription(`**You received ₹${rewardAmount} as your daily reward!**`)
        .setColor(0x00FF00)
        .addFields(
          { name: '💰 Amount', value: `₹${rewardAmount}`, inline: true },
          { name: '⭐ XP Earned', value: '50', inline: true },
          { name: '📅 Next Reward', value: '<t:' + Math.floor((now + 24 * 60 * 60 * 1000) / 1000) + ':R>', inline: true }
        )
        .setFooter({ text: 'Come back tomorrow for more rewards!' });

      await user.send({ embeds: [rewardEmbed] });
    } catch (error) {
      console.error('Failed to send daily reward notification:', error);
    }

    return true;
  }

  async giveWeeklyReward(userId) {
    const profile = profileSystem.getProfile(userId);
    if (!profile) return false;

    const now = Date.now();
    const lastWeekly = profile.lastWeeklyReward;
    
    if (lastWeekly && this.isSameWeek(now, lastWeekly)) {
      return false; // Already claimed this week
    }

    const rewardAmount = CONFIG.WEEKLY_REWARD_AMOUNT;
    
    profileSystem.updateProfile(userId, {
      lastWeeklyReward: now,
      'stats.earnings': (profile.stats.earnings || 0) + rewardAmount
    });

    await profileSystem.addXP(userId, 200);

    try {
      const user = await client.users.fetch(userId);
      const rewardEmbed = new EmbedBuilder()
        .setTitle('🏆 Weekly Reward Claimed!')
        .setDescription(`**You received ₹${rewardAmount} as your weekly reward!**`)
        .setColor(0xFFD700)
        .addFields(
          { name: '💰 Amount', value: `₹${rewardAmount}`, inline: true },
          { name: '⭐ XP Earned', value: '200', inline: true },
          { name: '📅 Next Reward', value: '<t:' + Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000) + ':R>', inline: true }
        )
        .setFooter({ text: 'Great job staying active this week!' });

      await user.send({ embeds: [rewardEmbed] });
    } catch (error) {
      console.error('Failed to send weekly reward notification:', error);
    }

    return true;
  }

  async giveMonthlyReward(userId) {
    const profile = profileSystem.getProfile(userId);
    if (!profile) return false;

    const now = Date.now();
    const lastMonthly = profile.lastMonthlyReward;
    
    if (lastMonthly && this.isSameMonth(now, lastMonthly)) {
      return false; // Already claimed this month
    }

    const rewardAmount = CONFIG.MONTHLY_REWARD_AMOUNT;
    
    profileSystem.updateProfile(userId, {
      lastMonthlyReward: now,
      'stats.earnings': (profile.stats.earnings || 0) + rewardAmount
    });

    await profileSystem.addXP(userId, 500);

    try {
      const user = await client.users.fetch(userId);
      const rewardEmbed = new EmbedBuilder()
        .setTitle('🎊 Monthly Reward Claimed!')
        .setDescription(`**You received ₹${rewardAmount} as your monthly reward!**`)
        .setColor(0x9B59B6)
        .addFields(
          { name: '💰 Amount', value: `₹${rewardAmount}`, inline: true },
          { name: '⭐ XP Earned', value: '500', inline: true },
          { name: '📅 Next Reward', value: '<t:' + Math.floor((now + 30 * 24 * 60 * 60 * 1000) / 1000) + ':R>', inline: true }
        )
        .setFooter({ text: 'Thank you for being a loyal member!' });

      await user.send({ embeds: [rewardEmbed] });
    } catch (error) {
      console.error('Failed to send monthly reward notification:', error);
    }

    return true;
  }

  isSameDay(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  isSameWeek(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    const startOfWeek1 = new Date(date1.setDate(date1.getDate() - date1.getDay()));
    const startOfWeek2 = new Date(date2.setDate(date2.getDate() - date2.getDay()));
    return startOfWeek1.getTime() === startOfWeek2.getTime();
  }

  isSameMonth(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  async addMoney(userId, amount, reason = '') {
    const profile = profileSystem.getProfile(userId);
    if (!profile) return false;

    profileSystem.updateProfile(userId, {
      'stats.earnings': (profile.stats.earnings || 0) + amount
    });

    if (reason) {
      try {
        const user = await client.users.fetch(userId);
        const moneyEmbed = new EmbedBuilder()
          .setTitle('💰 Money Added!')
          .setDescription(`**You received ₹${amount}**`)
          .setColor(0x00FF00)
          .addFields(
            { name: '💸 Amount', value: `₹${amount}`, inline: true },
            { name: '📝 Reason', value: reason, inline: true },
            { name: '🏦 Total Balance', value: `₹${(profile.stats.earnings || 0) + amount}`, inline: true }
          )
          .setFooter({ text: 'Keep up the great work!' });

        await user.send({ embeds: [moneyEmbed] });
      } catch (error) {
        console.error('Failed to send money notification:', error);
      }
    }

    return true;
  }

  getBalance(userId) {
    const profile = profileSystem.getProfile(userId);
    return profile ? (profile.stats.earnings || 0) : 0;
  }
}

// Tournament System
class TournamentSystem {
  constructor() {
    this.tournaments = dataManager.readData('tournaments.json');
    this.tickets = dataManager.readData('tickets.json');
    this.activeTournaments = new Map();
    this.tournamentTemplates = {
      freefire: {
        solo: {
          title: "Free Fire Solo - Bermuda",
          game: "freefire",
          mode: "solo",
          map: "Bermuda",
          slots: 12,
          duration: "30 minutes",
          rules: "Standard Battle Royale rules apply"
        },
        duo: {
          title: "Free Fire Duo - Purgatory",
          game: "freefire", 
          mode: "duo",
          map: "Purgatory",
          slots: 20,
          duration: "25 minutes",
          rules: "Duo Battle Royale"
        },
        squad: {
          title: "Free Fire Squad - Kalahari",
          game: "freefire",
          mode: "squad", 
          map: "Kalahari",
          slots: 24,
          duration: "35 minutes",
          rules: "4-player squad battle"
        }
      },
      minecraft: {
        survival: {
          title: "Minecraft Survival Games",
          game: "minecraft",
          mode: "solo",
          map: "Classic SG",
          slots: 16,
          duration: "45 minutes",
          rules: "Last player standing wins"
        },
        bedwars: {
          title: "Minecraft Bed Wars",
          game: "minecraft",
          mode: "squad",
          map: "4v4v4v4",
          slots: 16,
          duration: "30 minutes", 
          rules: "Protect your bed, destroy others"
        },
        skywars: {
          title: "Minecraft Sky Wars",
          game: "minecraft",
          mode: "solo",
          map: "Floating Islands",
          slots: 12,
          duration: "20 minutes",
          rules: "Fight on floating islands"
        }
      }
    };
  }

  generateTournamentId() {
    return `T${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }

  async createTournament(interaction, template = null) {
    if (!template) {
      await this.showTemplateSelection(interaction);
      return;
    }

    const tournamentId = this.generateTournamentId();
    const tournamentData = {
      id: tournamentId,
      ...template,
      prizePool: 0,
      entryFee: 0,
      slotsFilled: 0,
      time: "8:00 PM",
      date: moment().add(1, 'day').format('YYYY-MM-DD'),
      prizeDistribution: {},
      type: "scheduled",
      status: "draft",
      participants: [],
      roomId: null,
      roomPassword: null,
      createdBy: interaction.user.id,
      createdAt: Date.now()
    };

    this.tournaments[tournamentId] = tournamentData;
    dataManager.writeData('tournaments.json', this.tournaments);
    await this.showTournamentConfig(interaction, tournamentId);
  }

  async showTemplateSelection(interaction) {
    const templateEmbed = new EmbedBuilder()
      .setTitle('🎮 Tournament Creation')
      .setDescription('**Select a tournament template or create custom:**')
      .setColor(0x0099FF);

    const templateButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('template_freefire')
        .setLabel('🔥 Free Fire')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('template_minecraft')
        .setLabel('⛏️ Minecraft')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('template_custom')
        .setLabel('✏️ Custom')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [templateEmbed], components: [templateButtons], ephemeral: true });
  }

  async showTournamentConfig(interaction, tournamentId) {
    const modal = new ModalBuilder()
      .setCustomId(`tournament_config_${tournamentId}`)
      .setTitle('Tournament Configuration');

    const titleInput = new TextInputBuilder()
      .setCustomId('tournament_title')
      .setLabel('Tournament Title')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(this.tournaments[tournamentId].title);

    const prizeInput = new TextInputBuilder()
      .setCustomId('prize_pool')
      .setLabel('Prize Pool (₹)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('500');

    const entryInput = new TextInputBuilder()
      .setCustomId('entry_fee')
      .setLabel('Entry Fee (₹)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('50');

    const slotsInput = new TextInputBuilder()
      .setCustomId('total_slots')
      .setLabel('Total Slots')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(this.tournaments[tournamentId].slots.toString());

    const timeInput = new TextInputBuilder()
      .setCustomId('start_time')
      .setLabel('Start Time (HH:MM AM/PM)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('8:00 PM');

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(prizeInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(entryInput);
    const fourthActionRow = new ActionRowBuilder().addComponents(slotsInput);
    const fifthActionRow = new ActionRowBuilder().addComponents(timeInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);
    await interaction.showModal(modal);
  }

  async finalizeTournament(interaction, tournamentId, config) {
    const tournament = this.tournaments[tournamentId];
    if (!tournament) return;

    tournament.title = config.title;
    tournament.prizePool = parseInt(config.prizePool);
    tournament.entryFee = parseInt(config.entryFee);
    tournament.slots = parseInt(config.slots);
    tournament.time = config.time;
    tournament.status = 'open';
    tournament.prizeDistribution = this.calculatePrizeDistribution(tournament.prizePool);

    dataManager.writeData('tournaments.json', this.tournaments);
    await this.postTournamentAnnouncement(tournament);

    await interaction.reply({
      content: `✅ Tournament "${tournament.title}" created successfully!`,
      ephemeral: true
    });
  }

  calculatePrizeDistribution(prizePool) {
    if (prizePool <= 300) {
      return { 1: Math.floor(prizePool * 0.5) };
    } else if (prizePool <= 600) {
      return {
        1: Math.floor(prizePool * 0.5),
        2: Math.floor(prizePool * 0.3)
      };
    } else {
      return {
        1: Math.floor(prizePool * 0.5),
        2: Math.floor(prizePool * 0.3),
        3: Math.floor(prizePool * 0.2)
      };
    }
  }

  async postTournamentAnnouncement(tournament) {
    try {
      const scheduleChannel = client.channels.cache.get(CHANNELS.TOURNAMENT_SCHEDULE);
      if (!scheduleChannel) return;

      const announcementEmbed = new EmbedBuilder()
        .setTitle(`🔥 ${tournament.title} 🔥`)
        .setDescription('**New Tournament Alert!**')
        .setColor(0xFF0000)
        .addFields(
          { name: '📱 Game', value: this.getGameDisplayName(tournament.game), inline: true },
          { name: '🎯 Mode', value: tournament.mode.toUpperCase(), inline: true },
          { name: '🗺️ Map', value: tournament.map, inline: true },
          { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
          { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
          { name: '📊 Slots', value: `0/${tournament.slots}`, inline: true },
          { name: '⏰ Time', value: tournament.time, inline: true },
          { name: '📅 Date', value: moment(tournament.date).format('DD MMM YYYY'), inline: true }
        );

      if (Object.keys(tournament.prizeDistribution).length > 0) {
        const prizeText = Object.entries(tournament.prizeDistribution)
          .map(([rank, prize]) => {
            const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
            return `${medals[rank] || '🔸'} ${rank}${this.getOrdinal(rank)}: ₹${prize}`;
          })
          .join('\n');

        announcementEmbed.addFields({
          name: '🏆 Prize Distribution',
          value: prizeText,
          inline: false
        });
      }

      const joinButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`join_tournament_${tournament.id}`)
          .setLabel('🎮 JOIN TOURNAMENT')
          .setStyle(ButtonStyle.Success)
      );

      const message = await scheduleChannel.send({ 
        embeds: [announcementEmbed], 
        components: [joinButton] 
      });

      tournament.announcementMessageId = message.id;
      dataManager.writeData('tournaments.json', this.tournaments);
      await this.postGeneralAnnouncement(tournament);

    } catch (error) {
      console.error('Failed to post tournament announcement:', error);
    }
  }

  async postGeneralAnnouncement(tournament) {
    try {
      const generalChannel = client.channels.cache.get(CHANNELS.GENERAL);
      if (!generalChannel) return;

      const alertEmbed = new EmbedBuilder()
        .setTitle('🚨 NEW TOURNAMENT ALERT! 🚨')
        .setDescription(`**${tournament.title}**\nStarting at ${tournament.time}`)
        .setColor(0x00FF00)
        .addFields(
          { name: '💰 Prize', value: `₹${tournament.prizePool}`, inline: true },
          { name: '🎫 Entry', value: `₹${tournament.entryFee}`, inline: true },
          { name: '📊 Slots', value: `0/${tournament.slots}`, inline: true }
        )
        .setFooter({ text: 'Slots filling fast! Join now!' });

      await generalChannel.send({ embeds: [alertEmbed] });

      if (tournament.status === 'open') {
        const spamInterval = setInterval(async () => {
          const currentTournament = this.tournaments[tournament.id];
          if (!currentTournament || currentTournament.status !== 'open') {
            clearInterval(spamInterval);
            return;
          }

          const spamEmbed = new EmbedBuilder()
            .setTitle('⚡ TOURNAMENT SLOTS FILLING! ⚡')
            .setDescription(`**${currentTournament.title}**\n${currentTournament.slotsFilled}/${currentTournament.slots} slots filled!`)
            .setColor(0xFFA500)
            .setFooter({ text: `Join now before slots fill up! • ${moment().format('HH:mm')}` });

          await generalChannel.send({ embeds: [spamEmbed] });
        }, 120000);

        this.activeTournaments.set(tournament.id, {
          ...tournament,
          spamInterval
        });
      }
    } catch (error) {
      console.error('Failed to post general announcement:', error);
    }
  }

  getGameDisplayName(gameCode) {
    const games = {
      'freefire': '🔥 Free Fire',
      'minecraft': '⛏️ Minecraft'
    };
    return games[gameCode] || gameCode;
  }

  getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  async joinTournament(interaction, tournamentId) {
    const tournament = this.tournaments[tournamentId];
    if (!tournament) {
      await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
      return;
    }

    const userId = interaction.user.id;
    const profile = profileSystem.getProfile(userId);

    if (!profile || !profile.completed) {
      await interaction.reply({
        content: '❌ You need to complete your profile before joining tournaments! Check your DMs.',
        ephemeral: true
      });
      await profileSystem.forceProfileCompletion(interaction.member);
      return;
    }

    if (tournament.participants.some(p => p.userId === userId)) {
      await interaction.reply({ content: '❌ You have already joined this tournament!', ephemeral: true });
      return;
    }

    if (tournament.slotsFilled >= tournament.slots) {
      await interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
      return;
    }

    await this.createPaymentTicket(interaction, tournament);
  }

  async createPaymentTicket(interaction, tournament) {
    const userId = interaction.user.id;
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    try {
      const ticketChannel = client.channels.cache.get(CHANNELS.TICKET_LOG);
      if (!ticketChannel) return;

      const user = interaction.user;
      const profile = profileSystem.getProfile(userId);

      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎫 Tournament Registration Ticket')
        .setColor(0x0099FF)
        .addFields(
          { name: '📋 Ticket ID', value: ticketId, inline: true },
          { name: '👤 Player', value: `${user.username} (${profile.otoId})`, inline: true },
          { name: '🎮 Tournament', value: tournament.title, inline: true },
          { name: '💰 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
          { name: '⏰ Tournament Time', value: `${tournament.time}`, inline: true },
          { name: '📊 Slot', value: `${tournament.slotsFilled + 1}/${tournament.slots}`, inline: true },
          { name: '🕒 Created', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Payment pending verification' });

      const ticketButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${ticketId}`)
          .setLabel('✅ Approve Payment')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${ticketId}`)
          .setLabel('❌ Reject')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`info_${ticketId}`)
          .setLabel('🔄 More Info')
          .setStyle(ButtonStyle.Secondary)
      );

      const ticketMessage = await ticketChannel.send({ 
        content: `<@&${ROLES.STAFF}> New registration ticket!`,
        embeds: [ticketEmbed], 
        components: [ticketButtons] 
      });

      this.tickets[ticketId] = {
        id: ticketId,
        userId: userId,
        tournamentId: tournament.id,
        status: 'pending',
        amount: tournament.entryFee,
        createdAt: Date.now(),
        messageId: ticketMessage.id,
        userInfo: {
          username: user.username,
          otoId: profile.otoId,
          ign: null,
          gameId: null
        }
      };

      dataManager.writeData('tickets.json', this.tickets);
      await this.sendPaymentInstructions(interaction, tournament, ticketId);

    } catch (error) {
      console.error('Failed to create payment ticket:', error);
      await interaction.reply({ content: '❌ Failed to create registration ticket. Please try again.', ephemeral: true });
    }
  }

  async sendPaymentInstructions(interaction, tournament, ticketId) {
    try {
      const user = interaction.user;
      const qrCodeData = `upi://pay?pa=${CONFIG.UPI_ID}&am=${tournament.entryFee}&tn=OTO-${ticketId}`;
      
      const paymentEmbed = new EmbedBuilder()
        .setTitle('💳 Payment Instructions')
        .setDescription(`**Tournament:** ${tournament.title}\n**Entry Fee:** ₹${tournament.entryFee}`)
        .setColor(0xFFD700)
        .addFields(
          { name: '📱 Payment Method', value: 'UPI Payment', inline: false },
          { name: '💎 UPI ID', value: `\`${CONFIG.UPI_ID}\``, inline: true },
          { name: '💰 Amount', value: `₹${tournament.entryFee}`, inline: true },
          { name: '🎫 Reference ID', value: ticketId, inline: true },
          { name: '📲 Quick Pay', value: `\`${qrCodeData}\``, inline: false },
          { name: '📸 Screenshot Required', value: 'After payment, upload screenshot here with visible reference ID', inline: false }
        )
        .setFooter({ text: 'Copy the UPI ID or use any UPI app to pay' });

      await user.send({ embeds: [paymentEmbed] });

      const ignEmbed = new EmbedBuilder()
        .setTitle('🎮 Player Information Required')
        .setDescription('**Please provide your in-game details:**\n\n1️⃣ **In-Game Name (IGN)**\n2️⃣ **Game ID**')
        .setColor(0x0099FF)
        .setFooter({ text: 'Type your IGN below to continue' });

      await user.send({ embeds: [ignEmbed] });

      const filter = m => m.author.id === user.id;
      const collector = user.dmChannel.createMessageCollector({ filter, time: 300000 });

      collector.on('collect', async (message) => {
        const ign = message.content.trim();
        if (ign.length < 2 || ign.length > 20) {
          await message.reply('❌ Please enter a valid IGN (2-20 characters):');
          collector.resetTimer();
          return;
        }

        this.tickets[ticketId].userInfo.ign = ign;
        dataManager.writeData('tickets.json', this.tickets);

        const gameIdEmbed = new EmbedBuilder()
          .setTitle('🎮 Game ID Required')
          .setDescription('**Now please provide your Game ID:**')
          .setColor(0x0099FF)
          .setFooter({ text: 'Type your Game ID below' });

        await user.send({ embeds: [gameIdEmbed] });

        const gameIdCollector = user.dmChannel.createMessageCollector({ filter, time: 300000 });

        gameIdCollector.on('collect', async (gameIdMessage) => {
          const gameId = gameIdMessage.content.trim();
          this.tickets[ticketId].userInfo.gameId = gameId;
          dataManager.writeData('tickets.json', this.tickets);

          const screenshotEmbed = new EmbedBuilder()
            .setTitle('📸 Payment Verification')
            .setDescription('**Please upload screenshot of payment confirmation:**')
            .setColor(0x0099FF)
            .addFields(
              { name: 'ℹ️ Instructions', value: '• Take screenshot of payment success\n• Make sure reference ID is visible\n• Upload the image here', inline: false }
            )
            .setFooter({ text: 'Upload screenshot to complete registration' });

          await user.send({ embeds: [screenshotEmbed] });
          gameIdCollector.stop();
        });

        collector.stop();
      });

      await interaction.reply({ 
        content: '✅ Check your DMs for payment instructions!', 
        ephemeral: true 
      });

    } catch (error) {
      console.error('Failed to send payment instructions:', error);
      await interaction.reply({ 
        content: '❌ Failed to send payment instructions. Please make sure your DMs are open!', 
        ephemeral: true 
      });
    }
  }

  async approvePayment(ticketId, staffMember) {
    const ticket = this.tickets[ticketId];
    if (!ticket) return;

    const tournament = this.tournaments[ticket.tournamentId];
    if (!tournament) return;

    ticket.status = 'approved';
    ticket.approvedBy = staffMember.id;
    ticket.approvedAt = Date.now();

    tournament.participants.push({
      userId: ticket.userId,
      ign: ticket.userInfo.ign,
      gameId: ticket.userInfo.gameId,
      joinedAt: Date.now(),
      ticketId: ticketId
    });

    tournament.slotsFilled++;

    dataManager.writeData('tickets.json', this.tickets);
    dataManager.writeData('tournaments.json', this.tournaments);

    await this.updateTournamentAnnouncement(tournament);
    await this.sendApprovalNotification(ticket.userId, tournament);
    await this.updateTicketEmbed(ticketId, 'approved', staffMember);

    if (tournament.slotsFilled === tournament.slots) {
      await this.createTournamentLobby(tournament);
    }
  }

  async sendApprovalNotification(userId, tournament) {
    try {
      const user = await client.users.fetch(userId);
      const profile = profileSystem.getProfile(userId);

      const approvalEmbed = new EmbedBuilder()
        .setTitle('✅ Payment Approved!')
        .setDescription(`**You're confirmed for:**\n**${tournament.title}**`)
        .setColor(0x00FF00)
        .addFields(
          { name: '📍 Your Slot', value: `#${tournament.slotsFilled}/${tournament.slots}`, inline: true },
          { name: '⏰ Match Time', value: tournament.time, inline: true },
          { name: '🎮 IGN', value: this.tickets[Object.keys(this.tickets).find(t => this.tickets[t].userId === userId && this.tickets[t].tournamentId === tournament.id)]?.userInfo.ign || 'Not provided', inline: true }
        )
        .setFooter({ text: 'Good luck! Prepare for the match.' });

      await user.send({ embeds: [approvalEmbed] });

      if (tournament.lobbyChannel) {
        const lobbyInfo = new EmbedBuilder()
          .setTitle('🏟️ Tournament Lobby')
          .setDescription(`Join the lobby channel: <#${tournament.lobbyChannel}>\n\nYou'll receive room credentials 5 minutes before match start.`)
          .setColor(0x0099FF);

        await user.send({ embeds: [lobbyInfo] });
      }

    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  }

  async updateTournamentAnnouncement(tournament) {
    try {
      const scheduleChannel = client.channels.cache.get(CHANNELS.TOURNAMENT_SCHEDULE);
      if (!scheduleChannel || !tournament.announcementMessageId) return;

      const message = await scheduleChannel.messages.fetch(tournament.announcementMessageId);
      const embed = message.embeds[0];
      
      if (embed) {
        const updatedEmbed = EmbedBuilder.from(embed);
        const fields = updatedEmbed.data.fields;
        
        const slotsFieldIndex = fields.findIndex(f => f.name === '📊 Slots');
        if (slotsFieldIndex !== -1) {
          fields[slotsFieldIndex].value = `${tournament.slotsFilled}/${tournament.slots}`;
        }

        updatedEmbed.setFields(fields);
        await message.edit({ embeds: [updatedEmbed] });
      }
    } catch (error) {
      console.error('Failed to update tournament announcement:', error);
    }
  }

  async updateTicketEmbed(ticketId, status, staffMember) {
    try {
      const ticket = this.tickets[ticketId];
      const ticketChannel = client.channels.cache.get(CHANNELS.TICKET_LOG);
      if (!ticketChannel || !ticket.messageId) return;

      const message = await ticketChannel.messages.fetch(ticket.messageId);
      const embed = message.embeds[0];
      
      if (embed) {
        const updatedEmbed = EmbedBuilder.from(embed);
        
        const statusColors = {
          'approved': 0x00FF00,
          'rejected': 0xFF0000,
          'pending': 0x0099FF
        };

        updatedEmbed.setColor(statusColors[status] || 0x0099FF);
        updatedEmbed.setFooter({ 
          text: status === 'approved' ? 
            `Approved by ${staffMember.user.username}` : 
            `Rejected by ${staffMember.user.username}` 
        });

        await message.edit({ 
          embeds: [updatedEmbed], 
          components: [] 
        });
      }
    } catch (error) {
      console.error('Failed to update ticket embed:', error);
    }
  }

  async createTournamentLobby(tournament) {
    try {
      const guild = client.guilds.cache.first();
      
      const lobbyChannel = await guild.channels.create({
        name: `lobby-${tournament.id.toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: CHANNELS.STAFF_TOOLS,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          ...tournament.participants.map(participant => ({
            id: participant.userId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          })),
          {
            id: ROLES.STAFF,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageMessages]
          }
        ]
      });

      tournament.lobbyChannel = lobbyChannel.id;
      dataManager.writeData('tournaments.json', this.tournaments);

      const lobbyEmbed = new EmbedBuilder()
        .setTitle('🏆 TOURNAMENT LOBBY')
        .setDescription(`**${tournament.title}**`)
        .setColor(0x00FF00)
        .addFields(
          { name: '⏰ Starting', value: `${tournament.time} (<t:${Math.floor(Date.now()/1000) + 7200}:R>)`, inline: true },
          { name: '📊 Slots', value: `${tournament.slotsFilled}/${tournament.slots}`, inline: true },
          { name: '🎮 Mode', value: tournament.mode.toUpperCase(), inline: true }
        );

      const participantsList = tournament.participants.map((p, index) => {
        const user = client.users.cache.get(p.userId);
        return `${index + 1}. ${user ? user.username : 'Unknown'} - ${p.ign}`;
      }).join('\n');

      lobbyEmbed.addFields({
        name: `👥 Confirmed Players (${tournament.participants.length})`,
        value: participantsList || 'No players yet',
        inline: false
      });

      const checklistEmbed = new EmbedBuilder()
        .setTitle('📋 Pre-Match Checklist')
        .setColor(0x0099FF)
        .setDescription('**Ensure you\'re ready for the match:**')
        .addFields(
          { name: '✅', value: 'Device charged', inline: true },
          { name: '✅', value: 'Good internet', inline: true },
          { name: '✅', value: 'Game updated', inline: true },
          { name: '✅', value: 'Notifications on', inline: true },
          { name: '✅', value: 'Ready to play!', inline: true }
        )
        .setFooter({ text: 'Room credentials will be shared 5 minutes before start' });

      await lobbyChannel.send({ 
        content: tournament.participants.map(p => `<@${p.userId}>`).join(' '),
        embeds: [lobbyEmbed, checklistEmbed] 
      });

      const startTime = moment(`${tournament.date} ${tournament.time}`, 'YYYY-MM-DD h:mm A');
      const credentialTime = startTime.subtract(5, 'minutes').valueOf();
      
      setTimeout(async () => {
        await this.shareRoomCredentials(tournament);
      }, credentialTime - Date.now());

    } catch (error) {
      console.error('Failed to create tournament lobby:', error);
    }
  }

  async shareRoomCredentials(tournament) {
    try {
      if (!tournament.lobbyChannel) return;

      const lobbyChannel = client.channels.cache.get(tournament.lobbyChannel);
      if (!lobbyChannel) return;

      const roomId = Math.floor(100000000 + Math.random() * 900000000).toString();
      const roomPassword = `oto${Math.floor(1000 + Math.random() * 9000)}`;

      tournament.roomId = roomId;
      tournament.roomPassword = roomPassword;
      dataManager.writeData('tournaments.json', this.tournaments);

      const credentialEmbed = new EmbedBuilder()
        .setTitle('🚨 MATCH STARTING SOON! 🚨')
        .setDescription('**Room credentials are now available:**')
        .setColor(0xFF0000)
        .addFields(
          { name: '🔐 Room ID', value: `\`${roomId}\``, inline: true },
          { name: '🔑 Password', value: `\`${roomPassword}\``, inline: true }
        )
        .addFields({
          name: '⚠️ IMPORTANT',
          value: '• Do NOT share these credentials\n• Screenshots are disabled\n• Join within 3 minutes\n• Report issues immediately',
          inline: false
        })
        .setFooter({ text: 'Good luck! May the best player win! 🏆' });

      const readyButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ready_check')
          .setLabel('✅ I\'m Ready!')
          .setStyle(ButtonStyle.Success)
      );

      await lobbyChannel.send({ 
        content: tournament.participants.map(p => `<@${p.userId}>`).join(' '),
        embeds: [credentialEmbed],
        components: [readyButton]
      });

      setTimeout(async () => {
        try {
          const messages = await lobbyChannel.messages.fetch({ limit: 10 });
          const credentialMessage = messages.find(m => 
            m.embeds[0] && m.embeds[0].title === '🚨 MATCH STARTING SOON! 🚨'
          );
          if (credentialMessage) {
            await credentialMessage.delete();
          }
        } catch (error) {
          console.error('Failed to delete credentials:', error);
        }
      }, 30 * 60 * 1000);

    } catch (error) {
      console.error('Failed to share room credentials:', error);
    }
  }
}

// Moderation System
class ModerationSystem {
  constructor() {
    this.warnings = dataManager.readData('warnings.json');
    this.badWords = {
      level1: ['noob', 'trash', 'bad', 'loser', 'kid'],
      level2: ['idiot', 'stupid', 'dumb', 'fool', 'moron'],
      level3: ['mc', 'bc', 'dm', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'chutiya', 'bhosdike', 'madarchod'],
      level4: ['kill yourself', 'die', 'suicide', 'nsfw', 'porn', 'nude']
    };
    this.userMessageCount = new Map();
    this.lastWarningTime = new Map();
  }

  async checkMessage(message) {
    if (message.author.bot) return;
    if (!message.member) return; // Fix for null permissions
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const content = message.content.toLowerCase();
    const userId = message.author.id;

    this.updateMessageCount(userId);

    const badWordLevel = this.checkBadWords(content);
    if (badWordLevel > 0) {
      await this.handleBadWord(message, badWordLevel);
      return;
    }

    if (this.isSpam(userId, content)) {
      await this.handleSpam(message);
      return;
    }

    if (this.isMentionSpam(message)) {
      await this.handleMentionSpam(message);
      return;
    }
  }

  checkBadWords(content) {
    for (const [level, words] of Object.entries(this.badWords)) {
      for (const word of words) {
        if (content.includes(word)) {
          if (this.isGameContext(content, word)) {
            return 0;
          }
          return parseInt(level.charAt(level.length - 1));
        }
      }
    }
    return 0;
  }

  isGameContext(content, word) {
    const gameTerms = ['pubg', 'freefire', 'minecraft', 'game', 'play', 'match'];
    const hasGameTerm = gameTerms.some(term => content.includes(term));
    const allowedPhrases = ['pubg bc', 'ff bc', 'game noob'];
    const isAllowedPhrase = allowedPhrases.some(phrase => content.includes(phrase));
    return hasGameTerm || isAllowedPhrase;
  }

  isSpam(userId, content) {
    const userData = this.userMessageCount.get(userId);
    if (!userData) return false;

    if (userData.count >= 5 && Date.now() - userData.firstMessage < 3000) {
      return true;
    }

    const emojiCount = (content.match(/<a?:.+?:\d+>|[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 10) return true;

    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 10) {
      const caps = letters.replace(/[a-z]/g, '').length;
      if (caps / letters.length > 0.8) return true;
    }

    return false;
  }

  isMentionSpam(message) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    return mentionCount > 5;
  }

  updateMessageCount(userId) {
    const now = Date.now();
    const userData = this.userMessageCount.get(userId);

    if (!userData || now - userData.firstMessage > 3000) {
      this.userMessageCount.set(userId, {
        count: 1,
        firstMessage: now
      });
    } else {
      userData.count++;
      this.userMessageCount.set(userId, userData);
    }
  }

  async handleBadWord(message, level) {
    const userId = message.author.id;
    
    try {
      await message.delete();

      await this.addWarning(userId, `Used inappropriate language (Level ${level})`, message.content);

      switch (level) {
        case 1:
          await message.channel.send({
            content: `${message.author}, please maintain a respectful environment! ⚠️`
          });
          break;
        case 2:
          await this.timeoutUser(message.member, 5 * 60 * 1000, 'Inappropriate language');
          break;
        case 3:
          await this.timeoutUser(message.member, 60 * 60 * 1000, 'Severe inappropriate language');
          break;
        case 4:
          await message.member.ban({ reason: 'Extreme inappropriate content' });
          break;
      }

    } catch (error) {
      console.error('Failed to handle bad word:', error);
    }
  }

  async handleSpam(message) {
    try {
      await message.delete();
      await this.timeoutUser(message.member, 10 * 60 * 1000, 'Spam detection');
      await message.channel.send({
        content: `${message.author}, please avoid spamming! ⚠️`
      });
    } catch (error) {
      console.error('Failed to handle spam:', error);
    }
  }

  async handleMentionSpam(message) {
    try {
      await message.delete();
      await this.timeoutUser(message.member, 15 * 60 * 1000, 'Mention spam');
      await message.channel.send({
        content: `${message.author}, please avoid mass mentioning! ⚠️`
      });
    } catch (error) {
      console.error('Failed to handle mention spam:', error);
    }
  }

  async addWarning(userId, reason, evidence = '') {
    if (!this.warnings[userId]) {
      this.warnings[userId] = {
        count: 0,
        history: []
      };
    }

    const warning = {
      reason,
      evidence,
      timestamp: Date.now(),
      mod: 'Auto-Mod'
    };

    this.warnings[userId].count++;
    this.warnings[userId].history.push(warning);

    this.warnings[userId].history = this.warnings[userId].history.filter(
      w => Date.now() - w.timestamp < 7 * 24 * 60 * 60 * 1000
    );
    this.warnings[userId].count = this.warnings[userId].history.length;

    dataManager.writeData('warnings.json', this.warnings);

    const warningCount = this.warnings[userId].count;
    
    if (warningCount >= 5) {
      const member = await client.guilds.cache.first().members.fetch(userId).catch(() => null);
      if (member) {
        await member.ban({ reason: 'Excessive warnings' });
      }
    } else if (warningCount >= 4) {
      const member = await client.guilds.cache.first().members.fetch(userId).catch(() => null);
      if (member) {
        await this.timeoutUser(member, 24 * 60 * 60 * 1000, 'Excessive warnings');
      }
    } else if (warningCount >= 3) {
      const member = await client.guilds.cache.first().members.fetch(userId).catch(() => null);
      if (member) {
        await this.timeoutUser(member, 60 * 60 * 1000, 'Multiple warnings');
      }
    }

    return warning;
  }

  async timeoutUser(member, duration, reason) {
    try {
      await member.timeout(duration, reason);
      
      const timeoutEmbed = new EmbedBuilder()
        .setTitle('⏰ User Timed Out')
        .setColor(0xFFA500)
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Duration', value: `${duration / 1000 / 60} minutes`, inline: true },
          { name: 'Reason', value: reason, inline: true }
        )
        .setTimestamp();

      const logChannel = client.channels.cache.get(CHANNELS.STAFF_TOOLS);
      if (logChannel) {
        await logChannel.send({ embeds: [timeoutEmbed] });
      }
    } catch (error) {
      console.error('Failed to timeout user:', error);
    }
  }

  getWarnings(userId) {
    return this.warnings[userId] || { count: 0, history: [] };
  }

  async clearWarnings(userId, staffMember) {
    if (this.warnings[userId]) {
      delete this.warnings[userId];
      dataManager.writeData('warnings.json', this.warnings);
      
      const logEmbed = new EmbedBuilder()
        .setTitle('✅ Warnings Cleared')
        .setColor(0x00FF00)
        .addFields(
          { name: 'User', value: `<@${userId}>`, inline: true },
          { name: 'Cleared by', value: staffMember.user.tag, inline: true }
        )
        .setTimestamp();

      const logChannel = client.channels.cache.get(CHANNELS.STAFF_TOOLS);
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }
      
      return true;
    }
    return false;
  }
}

// Auto-Response System
class AutoResponseSystem {
  constructor() {
    this.lastResponseTime = new Map();
    this.userMessages = new Map();
    this.conversationContext = new Map();
  }

  async checkAutoResponse(message) {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM && !message.mentions.has(client.user)) return;

    const content = message.content.toLowerCase();
    const userId = message.author.id;
    const profile = profileSystem.getProfile(userId);

    const isBotMentioned = message.mentions.has(client.user);

    if (this.isGreeting(content) || isBotMentioned) {
      await this.sendGreetingResponse(message, profile);
      return;
    }

    if (this.isQuestionAboutJoining(content)) {
      await this.sendJoinGuide(message, profile);
      return;
    }

    if (this.isQuestionAboutTournaments(content)) {
      await this.sendTournamentInfo(message, profile);
      return;
    }

    if (this.isPaymentQuestion(content)) {
      await this.sendPaymentHelp(message, profile);
      return;
    }

    if (isBotMentioned) {
      await this.sendGeneralHelp(message, profile);
      return;
    }

    if (message.channel.id === CHANNELS.GENERAL) {
      await this.checkUnansweredMessage(message);
    }
  }

  isGreeting(content) {
    const greetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'hola', 'namaste', 'kya haal', 'kaise ho'];
    return greetings.some(greet => content.includes(greet));
  }

  isQuestionAboutJoining(content) {
    const keywords = ['how to join', 'how join', 'join tournament', 'register', 'sign up', 'profile create'];
    return keywords.some(keyword => content.includes(keyword));
  }

  isQuestionAboutTournaments(content) {
    const keywords = ['tournament', 'match', 'competition', 'event', 'prize', 'entry fee'];
    return keywords.some(keyword => content.includes(keyword));
  }

  isPaymentQuestion(content) {
    const keywords = ['payment', 'pay', 'fee', 'money', 'upi', 'qr', 'scan', 'payment proof'];
    return keywords.some(keyword => content.includes(keyword));
  }

  async sendGreetingResponse(message, profile) {
    const gender = (profile && profile.gender) ? profile.gender : 'other';
    const greetings = {
      male: [
        "Kya haal bhai! Tournament kheloge aaj? 🔥",
        "Bro! Slots filling fast, jaldi join karo! ⚡", 
        "Haan bhai, batao kya help chahiye? 💪",
        "Aur bhai! Ready for today's tournament? 🎮",
        "Bhai! Aaj ka tournament dekha? Prize pool massive hai! 💰",
        "Kaisa chal raha hai bhai? Tournament join karna hai? 🏆",
        "Hey bro! New tournament starting soon, interested? ⚡",
        "Bhai! Perfect timing, ek naya tournament announce hua hai! 🎯",
        "Bro! Kya plan hai aaj? Tournament khelna hai? 🎮",
        "Bhai! Slots limited hain, jaldi join karo! 🚀"
      ],
      female: [
        "Hello ji! Tournament khelogi? 🎮",
        "Hii! Aaj ka tournament dekha? Slots limited hain! 💎",
        "Ji, batao kya help chahiye? ✨",
        "Namaste ji! Kya aap tournament khelna chahengi? 🌸",
        "Hello! Aaj ka special tournament dekha? Amazing prizes! 🏆",
        "Hi ji! Ready for some competitive gaming? 🔥",
        "Namaste! New tournament with big prize pool! 💰",
        "Hello! Perfect timing for today's tournament! 🎯",
        "Ji! Kya aapko tournament join karna hai? 🎮",
        "Hello! Slots fill ho rahe hain, jaldi join kariye! ⚡"
      ],
      other: [
        "Hello! Ready to join some tournaments? 🎮",
        "Hi there! Check out our latest tournaments! ⚡",
        "Hey! Want to compete and win prizes? 💰",
        "Hello! Perfect time to join a tournament! 🏆",
        "Hi! Slots are filling fast, join now! 🚀",
        "Hey there! Ready for some competitive gaming? 🔥",
        "Hello! New tournaments with amazing prizes! 💎",
        "Hi! Check out our tournament schedule! 📅",
        "Hey! Want to test your skills? 🎯",
        "Hello! Join our gaming community today! 🌟"
      ]
    };

    const responses = greetings[gender] || greetings.other;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning! ';
    else if (hour < 17) timeGreeting = 'Good afternoon! ';
    else timeGreeting = 'Good evening! ';

    const fullResponse = `${timeGreeting}${randomResponse}`;

    await message.reply(fullResponse);

    setTimeout(async () => {
      try {
        const followUps = {
          male: "Bhai, koi doubt hai? Ya directly tournament join karna hai? 🎯",
          female: "Ji, koi doubt hai? Ya aap directly tournament join karna chahengi? 💎",
          other: "Any questions? Or would you like to join a tournament directly? 🎮"
        };

        await message.channel.send(followUps[gender]);
      } catch (error) {
        // Ignore errors
      }
    }, 120000);
  }

  async sendJoinGuide(message, profile) {
    const guideEmbed = new EmbedBuilder()
      .setTitle('🎮 How to Join Tournaments')
      .setColor(0x0099FF)
      .setDescription('**Follow these simple steps:**')
      .addFields(
        { name: '1️⃣ Complete Profile', value: 'Create your profile with `-profile` command', inline: false },
        { name: '2️⃣ Check Schedule', value: 'View upcoming tournaments in <#1438482561679626303>', inline: false },
        { name: '3️⃣ Join Tournament', value: 'Click JOIN button on tournament post', inline: false },
        { name: '4️⃣ Make Payment', value: 'Pay entry fee via UPI QR code', inline: false },
        { name: '5️⃣ Get Confirmed', value: 'Wait for staff approval', inline: false },
        { name: '6️⃣ Play & Win!', value: 'Join match and compete for prizes!', inline: false }
      )
      .setFooter({ text: 'Need more help? Just ask!' });

    await message.reply({ embeds: [guideEmbed] });
  }

  async sendTournamentInfo(message, profile) {
    const tournaments = Object.values(tournamentSystem.tournaments).filter(t => t.status === 'open');
    
    if (tournaments.length === 0) {
      await message.reply('No active tournaments right now! Check back later or check <#1438482561679626303> for schedule. 🕒');
      return;
    }

    const tournamentList = tournaments.slice(0, 3).map(t => 
      `**${t.title}**\n💰 ₹${t.prizePool} | 🎫 ₹${t.entryFee} | 📊 ${t.slotsFilled}/${t.slots}\n⏰ ${t.time}`
    ).join('\n\n');

    const infoEmbed = new EmbedBuilder()
      .setTitle('🏆 Active Tournaments')
      .setColor(0x00FF00)
      .setDescription(tournamentList)
      .setFooter({ text: `Showing ${Math.min(tournaments.length, 3)} of ${tournaments.length} active tournaments` });

    await message.reply({ embeds: [infoEmbed] });
  }

  async sendPaymentHelp(message, profile) {
    const paymentEmbed = new EmbedBuilder()
      .setTitle('💳 Payment Help')
      .setColor(0xFFD700)
      .setDescription('**Payment Process:**')
      .addFields(
        { name: '1️⃣ UPI Payment', value: 'We accept all UPI apps (GPay, Paytm, PhonePe)', inline: false },
        { name: '2️⃣ QR Code', value: 'Scan QR code sent in DMs after registration', inline: false },
        { name: '3️⃣ Screenshot', value: 'Upload payment screenshot for verification', inline: false },
        { name: '4️⃣ Approval', value: 'Staff will approve within 5-10 minutes', inline: false },
        { name: '💎 UPI ID', value: `\`${CONFIG.UPI_ID}\``, inline: true }
      )
      .setFooter({ text: 'Payment issues? Contact staff!' });

    await message.reply({ embeds: [paymentEmbed] });
  }

  async sendGeneralHelp(message, profile) {
    const helpEmbed = new EmbedBuilder()
      .setTitle('🤖 OTO Bot Help')
      .setColor(0x0099FF)
      .setDescription('**Here\'s what I can help you with:**')
      .addFields(
        { name: '🎮 Tournaments', value: 'Join competitions and win prizes', inline: true },
        { name: '👤 Profile', value: 'Create and manage your profile', inline: true },
        { name: '📊 Leaderboards', value: 'Check player rankings', inline: true },
        { name: '🎫 Tickets', value: 'Get support from staff', inline: true },
        { name: '📝 Commands', value: 'Use `-help` for all commands', inline: true },
        { name: '🔗 Links', value: 'Check pins in relevant channels', inline: true }
      )
      .setFooter({ text: 'Need specific help? Just ask!' });

    await message.reply({ embeds: [helpEmbed] });
  }

  async checkUnansweredMessage(message) {
    if (message.channel.id !== CHANNELS.GENERAL) return;

    setTimeout(async () => {
      try {
        const messages = await message.channel.messages.fetch({ limit: 10 });
        const hasReply = messages.some(m => 
          m.reference?.messageId === message.id && !m.author.bot
        );

        if (!hasReply) {
          const responses = [
            "Koi help chahiye is member ko? 🤔",
            "Staff members, please check this! 👀",
            "Kya koi iski help kar sakta hai? 💫",
            "Hey team, need assistance here! 🎯"
          ];

          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          await message.reply(randomResponse);
        }
      } catch (error) {
        // Ignore errors
      }
    }, 120000);
  }
}

// Leaderboard System
class LeaderboardSystem {
  constructor() {
    this.leaderboards = dataManager.readData('leaderboards.json');
    this.updateInterval = null;
  }

  startAutoUpdate() {
    this.updateInterval = setInterval(() => {
      this.updateAllLeaderboards();
      this.postLeaderboardUpdates();
    }, CONFIG.LEADERBOARD_UPDATE_INTERVAL);
  }

  updateAllLeaderboards() {
    this.updateTournamentLeaderboards();
    this.updateInviteLeaderboards();
    this.updateSquadLeaderboards();
    dataManager.writeData('leaderboards.json', this.leaderboards);
  }

  updateTournamentLeaderboards() {
    const profiles = dataManager.readData('profiles.json');
    
    const mostWins = Object.values(profiles)
      .filter(p => p.stats.wins > 0)
      .sort((a, b) => b.stats.wins - a.stats.wins)
      .slice(0, 10)
      .map(p => ({
        userId: p.userId,
        wins: p.stats.wins,
        earnings: p.stats.earnings
      }));

    const highestEarnings = Object.values(profiles)
      .filter(p => p.stats.earnings > 0)
      .sort((a, b) => b.stats.earnings - a.stats.earnings)
      .slice(0, 10)
      .map(p => ({
        userId: p.userId,
        earnings: p.stats.earnings,
        wins: p.stats.wins
      }));

    const bestWinRate = Object.values(profiles)
      .filter(p => p.stats.tournamentsPlayed >= 5)
      .map(p => ({
        userId: p.userId,
        winRate: (p.stats.wins / p.stats.tournamentsPlayed) * 100,
        wins: p.stats.wins,
        played: p.stats.tournamentsPlayed
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10);

    this.leaderboards.tournaments.mostWins = mostWins;
    this.leaderboards.tournaments.highestEarnings = highestEarnings;
    this.leaderboards.tournaments.bestWinRate = bestWinRate;
  }

  updateInviteLeaderboards() {
    const invites = dataManager.readData('invites.json');
    
    const allTime = Object.entries(invites)
      .map(([userId, data]) => ({
        userId,
        valid: data.valid,
        total: data.total
      }))
      .sort((a, b) => b.valid - a.valid)
      .slice(0, 10);

    this.leaderboards.invites.allTime = allTime;
  }

  updateSquadLeaderboards() {
    this.leaderboards.squads.bestSquad = [];
    this.leaderboards.squads.deadliestSquad = [];
    this.leaderboards.squads.richestSquad = [];
  }

  async postLeaderboardUpdates() {
    try {
      const leaderboardChannel = client.channels.cache.get(CHANNELS.LEADERBOARD);
      if (!leaderboardChannel) return;

      const messages = await leaderboardChannel.messages.fetch({ limit: 10 });
      for (const message of messages.values()) {
        if (message.author.id === client.user.id) {
          await message.delete().catch(() => {});
        }
      }

      await this.postTournamentLeaderboard(leaderboardChannel);
      await this.postInviteLeaderboard(leaderboardChannel);

    } catch (error) {
      console.error('Failed to post leaderboard updates:', error);
    }
  }

  async postTournamentLeaderboard(channel) {
    const topWinners = this.leaderboards.tournaments.mostWins.slice(0, 5);

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle('🏆 TOP TOURNAMENT WINNERS')
      .setColor(0xFFD700)
      .setDescription('**Players with most tournament wins:**')
      .setTimestamp();

    if (topWinners.length === 0) {
      leaderboardEmbed.addFields({
        name: 'No winners yet',
        value: 'Join tournaments and be the first to get on the leaderboard!'
      });
    } else {
      for (let i = 0; i < topWinners.length; i++) {
        const entry = topWinners[i];
        try {
          const user = await client.users.fetch(entry.userId);
          const profile = profileSystem.getProfile(entry.userId);
          
          leaderboardEmbed.addFields({
            name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔸'} ${user.username}`,
            value: `Wins: ${entry.wins} | Earnings: ₹${entry.earnings}\nOTO ID: ${profile?.otoId || 'N/A'}`,
            inline: false
          });
        } catch (error) {
          leaderboardEmbed.addFields({
            name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔸'} Unknown Player`,
            value: `Wins: ${entry.wins} | Earnings: ₹${entry.earnings}`,
            inline: false
          });
        }
      }
    }

    await channel.send({ embeds: [leaderboardEmbed] });
  }

  async postInviteLeaderboard(channel) {
    const topInviters = this.leaderboards.invites.allTime.slice(0, 5);

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle('👥 TOP INVITERS')
      .setColor(0x00FF00)
      .setDescription('**Players with most valid invites:**')
      .setTimestamp();

    if (topInviters.length === 0) {
      leaderboardEmbed.addFields({
        name: 'No invites yet',
        value: 'Invite friends and get on the leaderboard!'
      });
    } else {
      for (let i = 0; i < topInviters.length; i++) {
        const entry = topInviters[i];
        try {
          const user = await client.users.fetch(entry.userId);
          
          leaderboardEmbed.addFields({
            name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔸'} ${user.username}`,
            value: `Valid Invites: ${entry.valid} | Total: ${entry.total}`,
            inline: false
          });
        } catch (error) {
          leaderboardEmbed.addFields({
            name: `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔸'} Unknown User`,
            value: `Valid Invites: ${entry.valid} | Total: ${entry.total}`,
            inline: false
          });
        }
      }
    }

    await channel.send({ embeds: [leaderboardEmbed] });
  }

  getLeaderboard(type) {
    return this.leaderboards[type] || null;
  }
}

// Analytics System
class AnalyticsSystem {
  constructor() {
    this.analytics = dataManager.readData('analytics.json');
    this.dailyStats = {
      newUsers: 0,
      tournamentsHeld: 0,
      totalPrizeDistributed: 0,
      ticketsResolved: 0,
      totalMessages: 0,
      startTime: Date.now()
    };
  }

  trackUserJoin() {
    this.dailyStats.newUsers++;
  }

  trackTournamentComplete(tournament) {
    this.dailyStats.tournamentsHeld++;
    this.dailyStats.totalPrizeDistributed += tournament.prizePool;
  }

  trackTicketResolved() {
    this.dailyStats.ticketsResolved++;
  }

  trackMessage() {
    this.dailyStats.totalMessages++;
  }

  async generateDailyReport() {
    const today = moment().format('YYYY-MM-DD');
    
    this.analytics.daily[today] = {
      ...this.dailyStats,
      endTime: Date.now(),
      duration: Date.now() - this.dailyStats.startTime
    };

    dataManager.writeData('analytics.json', this.analytics);
    await this.sendDailyReport();

    this.dailyStats = {
      newUsers: 0,
      tournamentsHeld: 0,
      totalPrizeDistributed: 0,
      ticketsResolved: 0,
      totalMessages: 0,
      startTime: Date.now()
    };
  }

  async sendDailyReport() {
    try {
      const staffChannel = client.channels.cache.get(CHANNELS.STAFF_TOOLS);
      if (!staffChannel) return;

      const today = moment().format('DD MMM YYYY');
      const stats = this.analytics.daily[moment().format('YYYY-MM-DD')] || this.dailyStats;

      const reportEmbed = new EmbedBuilder()
        .setTitle('📊 Daily Analytics Report')
        .setDescription(`**Report for ${today}**`)
        .setColor(0x0099FF)
        .addFields(
          { name: '👥 New Users', value: stats.newUsers.toString(), inline: true },
          { name: '🏆 Tournaments Held', value: stats.tournamentsHeld.toString(), inline: true },
          { name: '💰 Prize Distributed', value: `₹${stats.totalPrizeDistributed}`, inline: true },
          { name: '🎫 Tickets Resolved', value: stats.ticketsResolved.toString(), inline: true },
          { name: '💬 Total Messages', value: stats.totalMessages.toString(), inline: true },
          { name: '⏱️ Uptime', value: this.formatDuration(stats.duration), inline: true }
        )
        .setFooter({ text: 'OTO Tournaments Analytics' })
        .setTimestamp();

      await staffChannel.send({ embeds: [reportEmbed] });
    } catch (error) {
      console.error('Failed to send daily report:', error);
    }
  }

  formatDuration(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getStats(userId = null) {
    if (userId) {
      const profile = profileSystem.getProfile(userId);
      const invites = inviteSystem.getInviteStats(userId);
      const warnings = moderationSystem.getWarnings(userId);

      return {
        profile,
        invites,
        warnings,
        joinDate: profile?.stats?.joinDate ? new Date(profile.stats.joinDate) : null
      };
    }

    return {
      server: {
        totalUsers: Object.keys(profileSystem.profiles).length,
        activeTournaments: Object.values(tournamentSystem.tournaments).filter(t => t.status === 'open').length,
        dailyStats: this.dailyStats
      }
    };
  }
}

// Channel Management System
class ChannelManagementSystem {
  constructor() {
    this.cleanupCooldown = new Map();
  }

  async clearChannel(interaction, amount = 100) {
    if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
      await interaction.reply({ 
        content: '❌ You need staff permissions to clear messages!', 
        ephemeral: true 
      });
      return;
    }

    const channel = interaction.channel;
    
    try {
      const messages = await channel.messages.fetch({ limit: amount });
      const deletableMessages = messages.filter(msg => 
        Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
      );

      if (deletableMessages.size === 0) {
        await interaction.reply({ 
          content: '❌ No messages can be deleted (messages older than 14 days cannot be bulk deleted).', 
          ephemeral: true 
        });
        return;
      }

      await channel.bulkDelete(deletableMessages, true);
      
      const successEmbed = new EmbedBuilder()
        .setTitle('🧹 Channel Cleared')
        .setColor(0x00FF00)
        .addFields(
          { name: '📊 Messages Deleted', value: deletableMessages.size.toString(), inline: true },
          { name: '👤 Cleared by', value: interaction.user.tag, inline: true },
          { name: '📅 Channel', value: channel.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

      const logChannel = client.channels.cache.get(CHANNELS.STAFF_TOOLS);
      if (logChannel) {
        await logChannel.send({ embeds: [successEmbed] });
      }

    } catch (error) {
      console.error('Failed to clear channel:', error);
      await interaction.reply({ 
        content: '❌ Failed to clear messages. Make sure I have the necessary permissions.', 
        ephemeral: true 
      });
    }
  }

  async showClearMenu(interaction) {
    if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
      await interaction.reply({ 
        content: '❌ Staff only command!', 
        ephemeral: true 
      });
      return;
    }

    const clearMenu = new StringSelectMenuBuilder()
      .setCustomId('clear_menu')
      .setPlaceholder('Select number of messages to delete')
      .addOptions([
        {
          label: 'Delete 10 messages',
          description: 'Quick cleanup of recent messages',
          value: 'clear_10'
        },
        {
          label: 'Delete 25 messages',
          description: 'Moderate cleanup',
          value: 'clear_25'
        },
        {
          label: 'Delete 50 messages',
          description: 'Large cleanup',
          value: 'clear_50'
        },
        {
          label: 'Delete 100 messages',
          description: 'Maximum bulk delete (14 days limit)',
          value: 'clear_100'
        },
        {
          label: 'Delete ALL messages',
          description: 'Complete channel purge (creates new channel)',
          value: 'clear_all'
        }
      ]);

    const actionRow = new ActionRowBuilder().addComponents(clearMenu);

    const menuEmbed = new EmbedBuilder()
      .setTitle('🧹 Channel Cleanup')
      .setDescription('**Select how many messages you want to delete:**')
      .setColor(0x0099FF)
      .addFields(
        { name: '⚠️ Important', value: '• Bulk delete limited to messages under 14 days old\n• "Delete ALL" will create a new channel\n• Use with caution!', inline: false }
      )
      .setFooter({ text: 'Staff Tools - OTO Tournaments' });

    await interaction.reply({ 
      embeds: [menuEmbed], 
      components: [actionRow],
      ephemeral: true 
    });
  }

  async handleClearMenu(interaction) {
    const selectedOption = interaction.values[0];
    
    if (selectedOption === 'clear_all') {
      await this.purgeChannel(interaction);
      return;
    }

    const amount = parseInt(selectedOption.split('_')[1]);
    await this.clearChannel(interaction, amount);
  }

  async purgeChannel(interaction) {
    const channel = interaction.channel;
    
    try {
      const confirmationEmbed = new EmbedBuilder()
        .setTitle('⚠️ CHANNEL PURGE CONFIRMATION')
        .setDescription(`**You are about to COMPLETELY PURGE ${channel}**`)
        .setColor(0xFF0000)
        .addFields(
          { name: '🚨 This action will:', value: '• Create a new channel with same settings\n• Delete ALL messages permanently\n• Archive the current channel', inline: false },
          { name: '📝 New channel will:', value: '• Have same name and permissions\n• Be completely empty\n• Replace the current channel', inline: false }
        )
        .setFooter({ text: 'This action cannot be undone!' });

      const confirmButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_purge')
          .setLabel('✅ CONFIRM PURGE')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_purge')
          .setLabel('❌ CANCEL')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.update({ 
        embeds: [confirmationEmbed], 
        components: [confirmButtons] 
      });

    } catch (error) {
      console.error('Failed to show purge confirmation:', error);
    }
  }

  async confirmPurge(interaction) {
    const channel = interaction.channel;
    const guild = channel.guild;

    try {
      await interaction.update({ 
        content: '🔄 Creating new channel...', 
        embeds: [], 
        components: [] 
      });

      const newChannel = await guild.channels.create({
        name: channel.name,
        type: channel.type,
        parent: channel.parent,
        topic: channel.topic,
        position: channel.position,
        permissionOverwrites: channel.permissionOverwrites.cache,
        nsfw: channel.nsfw,
        rateLimitPerUser: channel.rateLimitPerUser
      });

      await channel.delete();

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Channel Purged Successfully')
        .setColor(0x00FF00)
        .addFields(
          { name: '📝 Old Channel', value: `#${channel.name}`, inline: true },
          { name: '🆕 New Channel', value: newChannel.toString(), inline: true },
          { name: '👤 Purged by', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await newChannel.send({ 
        content: `Channel has been purged by ${interaction.user}. All previous messages have been cleared.`,
        embeds: [successEmbed] 
      });

      const logChannel = client.channels.cache.get(CHANNELS.STAFF_TOOLS);
      if (logChannel) {
        await logChannel.send({ embeds: [successEmbed] });
      }

    } catch (error) {
      console.error('Failed to purge channel:', error);
      await interaction.editReply({ 
        content: '❌ Failed to purge channel. Please check my permissions.', 
        embeds: [], 
        components: [] 
      });
    }
  }
}

// Initialize all systems
const profileSystem = new ProfileSystem();
const inviteSystem = new InviteSystem();
const tournamentSystem = new TournamentSystem();
const moderationSystem = new ModerationSystem();
const autoResponseSystem = new AutoResponseSystem();
const leaderboardSystem = new LeaderboardSystem();
const analyticsSystem = new AnalyticsSystem();
const channelManagementSystem = new ChannelManagementSystem();
const economySystem = new EconomySystem();

// Command Handling
client.commands = new Collection();

const commands = {
  profile: {
    execute: async (interaction) => {
      const user = interaction.options.getUser('user') || interaction.user;
      const profile = profileSystem.getProfile(user.id);

      if (!profile || !profile.completed) {
        await interaction.reply({
          content: user.id === interaction.user.id ? 
            'You need to complete your profile first! Check your DMs.' : 
            'This user hasn\'t completed their profile yet.',
          ephemeral: true
        });

        if (user.id === interaction.user.id) {
          await profileSystem.forceProfileCompletion(interaction.member);
        }
        return;
      }

      const profileEmbed = new EmbedBuilder()
        .setTitle(`👤 ${profile.name}'s Profile`)
        .setColor(0x0099FF)
        .addFields(
          { name: '🎯 OTO ID', value: profile.otoId, inline: true },
          { name: '⭐ Level', value: profile.level.toString(), inline: true },
          { name: '📊 XP', value: `${profile.xp}/${profile.level * 1000}`, inline: true },
          { name: '🌍 State', value: profile.state, inline: true },
          { name: '🎮 Primary Game', value: profileSystem.getGameName(profile.game), inline: true },
          { name: '🏆 Tournaments Played', value: profile.stats.tournamentsPlayed.toString(), inline: true },
          { name: '🥇 Wins', value: profile.stats.wins.toString(), inline: true },
          { name: '💰 Total Earnings', value: `₹${profile.stats.earnings}`, inline: true },
          { name: '👥 Invites', value: profile.stats.invites.toString(), inline: true },
          { name: '🎖️ Badges', value: profile.badges.join(', ') || 'None', inline: false }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Joined ${moment(profile.createdAt).fromNow()}` })
        .setTimestamp();

      await interaction.reply({ embeds: [profileEmbed] });
    }
  },

  invite: {
    execute: async (interaction) => {
      const invites = inviteSystem.getInviteStats(interaction.user.id);

      const inviteEmbed = new EmbedBuilder()
        .setTitle('📨 Your Invite Stats')
        .setColor(0x00FF00)
        .addFields(
          { name: '📊 Total Invites', value: invites.total.toString(), inline: true },
          { name: '✅ Valid Invites', value: invites.valid.toString(), inline: true },
          { name: '⏳ Pending', value: invites.pending.toString(), inline: true },
          { name: '🎯 Next Reward', value: inviteSystem.getNextReward(interaction.user.id), inline: false }
        )
        .setFooter({ text: 'Invite more friends to unlock amazing rewards!' });

      await interaction.reply({ embeds: [inviteEmbed], ephemeral: true });
    }
  },

  invites: {
    execute: async (interaction) => {
      await inviteSystem.postInviteLeaderboard();
      await interaction.reply({ content: '✅ Invite leaderboard updated!', ephemeral: true });
    }
  },

  createtournament: {
    execute: async (interaction) => {
      if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
        await interaction.reply({ 
          content: '❌ You need staff permissions to create tournaments!', 
          ephemeral: true 
        });
        return;
      }

      await tournamentSystem.createTournament(interaction);
    }
  },

  dashboard: {
    execute: async (interaction) => {
      if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
        await interaction.reply({ 
          content: '❌ Staff only command!', 
          ephemeral: true 
        });
        return;
      }

      const stats = analyticsSystem.getStats();
      const openTickets = Object.values(tournamentSystem.tickets).filter(t => t.status === 'pending').length;
      const activeTournaments = Object.values(tournamentSystem.tournaments).filter(t => t.status === 'open').length;

      const dashboardEmbed = new EmbedBuilder()
        .setTitle('📊 Staff Dashboard')
        .setColor(0x0099FF)
        .addFields(
          { name: '🎫 Open Tickets', value: openTickets.toString(), inline: true },
          { name: '🏆 Active Tournaments', value: activeTournaments.toString(), inline: true },
          { name: '👥 Online Players', value: 'Calculating...', inline: true },
          { name: '📈 Today\'s Registrations', value: stats.server.dailyStats.newUsers.toString(), inline: true },
          { name: '💰 Today\'s Prize Pool', value: `₹${stats.server.dailyStats.totalPrizeDistributed}`, inline: true },
          { name: '💬 Messages Today', value: stats.server.dailyStats.totalMessages.toString(), inline: true }
        )
        .setFooter({ text: 'OTO Tournaments Staff Tools' })
        .setTimestamp();

      const dashboardButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('staff_create_tournament')
          .setLabel('🎮 Create Tournament')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('staff_view_tickets')
          .setLabel('🎫 View Tickets')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('staff_analytics')
          .setLabel('📊 Full Analytics')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ 
        embeds: [dashboardEmbed], 
        components: [dashboardButtons],
        ephemeral: true 
      });
    }
  },

  warn: {
    execute: async (interaction) => {
      if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
        await interaction.reply({ 
          content: '❌ Staff only command!', 
          ephemeral: true 
        });
        return;
      }

      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      const warning = await moderationSystem.addWarning(user.id, reason, `By ${interaction.user.tag}`);

      const warnEmbed = new EmbedBuilder()
        .setTitle('⚠️ User Warned')
        .setColor(0xFFA500)
        .addFields(
          { name: 'User', value: `${user.tag}`, inline: true },
          { name: 'Warned by', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Total Warnings', value: moderationSystem.getWarnings(user.id).count.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [warnEmbed] });
    }
  },

  stats: {
    execute: async (interaction) => {
      const user = interaction.options.getUser('user');

      if (user) {
        const stats = analyticsSystem.getStats(user.id);
        
        if (!stats.profile) {
          await interaction.reply({ 
            content: 'User not found or profile not completed!', 
            ephemeral: true 
          });
          return;
        }

        const userStatsEmbed = new EmbedBuilder()
          .setTitle(`📊 Stats for ${stats.profile.name}`)
          .setColor(0x0099FF)
          .addFields(
            { name: '🎯 OTO ID', value: stats.profile.otoId, inline: true },
            { name: '🏆 Tournaments', value: stats.profile.stats.tournamentsPlayed.toString(), inline: true },
            { name: '🥇 Wins', value: stats.profile.stats.wins.toString(), inline: true },
            { name: '💰 Earnings', value: `₹${stats.profile.stats.earnings}`, inline: true },
            { name: '👥 Valid Invites', value: stats.invites.valid.toString(), inline: true },
            { name: '⚠️ Warnings', value: stats.warnings.count.toString(), inline: true }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Joined ${moment(stats.profile.createdAt).fromNow()}` });

        await interaction.reply({ embeds: [userStatsEmbed] });
      } else {
        const stats = analyticsSystem.getStats();
        
        const serverStatsEmbed = new EmbedBuilder()
          .setTitle('📊 Server Statistics')
          .setColor(0x0099FF)
          .addFields(
            { name: '👥 Total Players', value: stats.server.totalUsers.toString(), inline: true },
            { name: '🏆 Active Tournaments', value: stats.server.activeTournaments.toString(), inline: true },
            { name: '📈 New Users Today', value: stats.server.dailyStats.newUsers.toString(), inline: true },
            { name: '💰 Prize Distributed Today', value: `₹${stats.server.dailyStats.totalPrizeDistributed}`, inline: true },
            { name: '🎫 Tickets Today', value: stats.server.dailyStats.ticketsResolved.toString(), inline: true },
            { name: '💬 Messages Today', value: stats.server.dailyStats.totalMessages.toString(), inline: true }
          )
          .setFooter({ text: 'OTO Tournaments Analytics' })
          .setTimestamp();

        await interaction.reply({ embeds: [serverStatsEmbed] });
      }
    }
  },

  clear: {
    execute: async (interaction) => {
      const amount = interaction.options.getInteger('amount') || 100;
      await channelManagementSystem.clearChannel(interaction, amount);
    }
  },

  purge: {
    execute: async (interaction) => {
      await channelManagementSystem.showClearMenu(interaction);
    }
  },

  daily: {
    execute: async (interaction) => {
      const userId = interaction.user.id;
      const profile = profileSystem.getProfile(userId);

      if (!profile || !profile.completed) {
        await interaction.reply({
          content: 'You need to complete your profile first!',
          ephemeral: true
        });
        return;
      }

      const claimed = await economySystem.giveDailyReward(userId);
      
      if (claimed) {
        await interaction.reply({
          content: '✅ Daily reward claimed! Check your DMs for details.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ You have already claimed your daily reward today!',
          ephemeral: true
        });
      }
    }
  },

  weekly: {
    execute: async (interaction) => {
      const userId = interaction.user.id;
      const profile = profileSystem.getProfile(userId);

      if (!profile || !profile.completed) {
        await interaction.reply({
          content: 'You need to complete your profile first!',
          ephemeral: true
        });
        return;
      }

      const claimed = await economySystem.giveWeeklyReward(userId);
      
      if (claimed) {
        await interaction.reply({
          content: '✅ Weekly reward claimed! Check your DMs for details.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ You have already claimed your weekly reward this week!',
          ephemeral: true
        });
      }
    }
  },

  monthly: {
    execute: async (interaction) => {
      const userId = interaction.user.id;
      const profile = profileSystem.getProfile(userId);

      if (!profile || !profile.completed) {
        await interaction.reply({
          content: 'You need to complete your profile first!',
          ephemeral: true
        });
        return;
      }

      const claimed = await economySystem.giveMonthlyReward(userId);
      
      if (claimed) {
        await interaction.reply({
          content: '✅ Monthly reward claimed! Check your DMs for details.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ You have already claimed your monthly reward this month!',
          ephemeral: true
        });
      }
    }
  },

  balance: {
    execute: async (interaction) => {
      const userId = interaction.user.id;
      const profile = profileSystem.getProfile(userId);

      if (!profile || !profile.completed) {
        await interaction.reply({
          content: 'You need to complete your profile first!',
          ephemeral: true
        });
        return;
      }

      const balance = economySystem.getBalance(userId);
      
      const balanceEmbed = new EmbedBuilder()
        .setTitle('💰 Your Balance')
        .setColor(0x00FF00)
        .addFields(
          { name: '🏦 Total Earnings', value: `₹${balance}`, inline: true },
          { name: '⭐ Level', value: profile.level.toString(), inline: true },
          { name: '📊 XP', value: `${profile.xp}/${profile.level * 1000}`, inline: true }
        )
        .setFooter({ text: 'Earn more by playing tournaments and inviting friends!' });

      await interaction.reply({ embeds: [balanceEmbed], ephemeral: true });
    }
  },

  help: {
    execute: async (interaction) => {
      const helpEmbed = new EmbedBuilder()
        .setTitle('🤖 OTO Tournament Bot Help')
        .setColor(0x0099FF)
        .setDescription('**Available Commands:**')
        .addFields(
          { name: '👤 Profile Commands', value: '`/profile` - View your profile\n`/profile @user` - View user profile', inline: false },
          { name: '📨 Invite Commands', value: '`/invite` - Your invite stats\n`/invites` - Invite leaderboard', inline: false },
          { name: '🏆 Tournament Commands', value: '`/createtournament` - Create tournament (Staff)\n`/dashboard` - Staff dashboard', inline: false },
          { name: '⚡ Moderation Commands', value: '`/warn @user reason` - Warn user (Staff)\n`/clear [amount]` - Clear messages (Staff)\n`/purge` - Advanced cleanup (Staff)', inline: false },
          { name: '💰 Economy Commands', value: '`/daily` - Claim daily reward\n`/weekly` - Claim weekly reward\n`/monthly` - Claim monthly reward\n`/balance` - Check your balance', inline: false },
          { name: '📊 Analytics Commands', value: '`/stats` - Server stats\n`/stats @user` - User stats', inline: false }
        )
        .setFooter({ text: 'Need help? Mention the bot or ask in general chat!' });

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }
  }
};

// Event Handlers
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log(`🏠 Connected to ${client.guilds.cache.size} servers`);

  client.user.setActivity('OTO Tournaments | /help', { type: 3 });

  leaderboardSystem.startAutoUpdate();
  scheduleDailyReport();

  setInterval(() => {
    dataManager.backupData();
  }, CONFIG.BACKUP_INTERVAL);

  console.log('🔄 Background tasks started!');

  setTimeout(async () => {
    await forceExistingMembersProfile();
  }, 10000);
});

client.on('guildMemberAdd', async (member) => {
  console.log(`👋 New member joined: ${member.user.tag}`);
  await profileSystem.sendWelcomeDM(member);
  await trackInvite(member);
  analyticsSystem.trackUserJoin();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  analyticsSystem.trackMessage();

  if (message.content.startsWith(CONFIG.PREFIX)) {
    await handleCommand(message);
    return;
  }

  await autoResponseSystem.checkAutoResponse(message);
  await moderationSystem.checkMessage(message);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  } else if (interaction.isModalSubmit()) {
    await handleModalSubmit(interaction);
  } else if (interaction.isCommand()) {
    await handleSlashCommand(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
  }
});

// Button Interaction Handler
async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;

  try {
    if (customId === 'start_profile') {
      await profileSystem.startProfileCreation(interaction);
    }
    else if (customId.startsWith('gender_')) {
      await profileSystem.handleGenderSelection(interaction);
    }
    else if (customId.startsWith('game_')) {
      await profileSystem.handleGameSelection(interaction);
    }
    else if (customId.startsWith('join_tournament_')) {
      const tournamentId = customId.replace('join_tournament_', '');
      await tournamentSystem.joinTournament(interaction, tournamentId);
    }
    else if (customId.startsWith('approve_')) {
      if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
        await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
        return;
      }
      const ticketId = customId.replace('approve_', '');
      await tournamentSystem.approvePayment(ticketId, interaction.member);
      await interaction.reply({ content: '✅ Payment approved!', ephemeral: true });
    }
    else if (customId.startsWith('reject_')) {
      if (!interaction.member.roles.cache.has(ROLES.STAFF)) {
        await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
        return;
      }
      const ticketId = customId.replace('reject_', '');
      await interaction.reply({ content: '❌ Payment rejected!', ephemeral: true });
    }
    else if (customId === 'template_freefire') {
      await showFreeFireTemplates(interaction);
    }
    else if (customId === 'template_minecraft') {
      await showMinecraftTemplates(interaction);
    }
    else if (customId.startsWith('template_')) {
      const templateKey = customId.replace('template_', '');
      const [game, mode] = templateKey.split('_');
      const template = tournamentSystem.tournamentTemplates[game]?.[mode];
      if (template) {
        await tournamentSystem.createTournament(interaction, template);
      }
    }
    else if (customId === 'confirm_purge') {
      await channelManagementSystem.confirmPurge(interaction);
    }
    else if (customId === 'cancel_purge') {
      await interaction.update({ 
        content: '❌ Channel purge cancelled.', 
        embeds: [], 
        components: [] 
      });
    }

  } catch (error) {
    console.error('Button interaction error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: '❌ An error occurred while processing your request.', 
        ephemeral: true 
      });
    }
  }
}

// Select Menu Handler
async function handleSelectMenu(interaction) {
  const customId = interaction.customId;

  if (customId === 'clear_menu') {
    await channelManagementSystem.handleClearMenu(interaction);
  }
}

// Modal Submit Handler
async function handleModalSubmit(interaction) {
  const customId = interaction.customId;

  if (customId.startsWith('tournament_config_')) {
    const tournamentId = customId.replace('tournament_config_', '');
    const config = {
      title: interaction.fields.getTextInputValue('tournament_title'),
      prizePool: interaction.fields.getTextInputValue('prize_pool'),
      entryFee: interaction.fields.getTextInputValue('entry_fee'),
      totalSlots: interaction.fields.getTextInputValue('total_slots'),
      startTime: interaction.fields.getTextInputValue('start_time')
    };

    await tournamentSystem.finalizeTournament(interaction, tournamentId, config);
  }
}

// Slash Command Handler
async function handleSlashCommand(interaction) {
  const command = commands[interaction.commandName];
  
  if (!command) {
    await interaction.reply({ 
      content: '❌ Unknown command!', 
      ephemeral: true 
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Command execution error:', error);
    await interaction.reply({ 
      content: '❌ An error occurred while executing this command.', 
      ephemeral: true 
    });
  }
}

// Legacy Command Handler
async function handleCommand(message) {
  const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  switch (commandName) {
    case 'profile':
      const user = message.mentions.users.first() || message.author;
      const profile = profileSystem.getProfile(user.id);
      
      if (!profile || !profile.completed) {
        await message.reply(user.id === message.author.id ? 
          'You need to complete your profile first! Check your DMs.' : 
          'This user hasn\'t completed their profile yet.'
        );
        return;
      }

      const profileEmbed = new EmbedBuilder()
        .setTitle(`👤 ${profile.name}'s Profile`)
        .setColor(0x0099FF)
        .addFields(
          { name: '🎯 OTO ID', value: profile.otoId, inline: true },
          { name: '🏆 Wins', value: profile.stats.wins.toString(), inline: true },
          { name: '💰 Earnings', value: `₹${profile.stats.earnings}`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));

      await message.reply({ embeds: [profileEmbed] });
      break;

    case 'help':
      const helpEmbed = new EmbedBuilder()
        .setTitle('🤖 OTO Bot Help')
        .setColor(0x0099FF)
        .setDescription('Use slash commands (/) for better experience!\n\n**Available Commands:**')
        .addFields(
          { name: '👤 Profile', value: '`-profile` - View your profile', inline: true },
          { name: '📨 Invite', value: '`-invite` - Your invite stats', inline: true },
          { name: '🏆 Tournaments', value: 'Check tournament channels!', inline: true },
          { name: '🧹 Moderation', value: '`-clear [amount]` - Clear messages (Staff)', inline: true },
          { name: '💰 Economy', value: '`-daily` - Claim daily reward', inline: true }
        );

      await message.reply({ embeds: [helpEmbed] });
      break;

    case 'clear':
      if (!message.member.roles.cache.has(ROLES.STAFF)) {
        await message.reply({ 
          content: '❌ You need staff permissions to clear messages!', 
          ephemeral: true 
        });
        return;
      }

      const amount = parseInt(args[0]) || 100;
      await channelManagementSystem.clearChannel({ 
        member: message.member, 
        user: message.author, 
        channel: message.channel, 
        reply: (content) => message.reply(content) 
      }, amount);
      break;

    case 'daily':
      const userId = message.author.id;
      const userProfile = profileSystem.getProfile(userId);

      if (!userProfile || !userProfile.completed) {
        await message.reply('You need to complete your profile first!');
        return;
      }

      const claimed = await economySystem.giveDailyReward(userId);
      
      if (claimed) {
        await message.reply('✅ Daily reward claimed! Check your DMs for details.');
      } else {
        await message.reply('❌ You have already claimed your daily reward today!');
      }
      break;
  }
}

// Helper Functions
async function showFreeFireTemplates(interaction) {
  const templateEmbed = new EmbedBuilder()
    .setTitle('🔥 Free Fire Templates')
    .setDescription('**Select a tournament template:**')
    .setColor(0xFF0000)
    .addFields(
      { name: '🎯 Solo Classic', value: '1v1 Battle Royale on Bermuda', inline: true },
      { name: '👥 Duo Classic', value: '2v2 Battle Royale on Purgatory', inline: true },
      { name: '🪖 Squad Classic', value: '4v4 Squad Battle on Kalahari', inline: true }
    );

  const templateButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('template_freefire_solo')
      .setLabel('Solo Classic')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('template_freefire_duo')
      .setLabel('Duo Classic')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('template_freefire_squad')
      .setLabel('Squad Classic')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.update({ embeds: [templateEmbed], components: [templateButtons] });
}

async function showMinecraftTemplates(interaction) {
  const templateEmbed = new EmbedBuilder()
    .setTitle('⛏️ Minecraft Templates')
    .setDescription('**Select a tournament template:**')
    .setColor(0x00FF00)
    .addFields(
      { name: '⚔️ Survival Games', value: 'Last player standing wins', inline: true },
      { name: '🛏️ Bed Wars', value: 'Protect your bed, destroy others', inline: true },
      { name: '☁️ Sky Wars', value: 'Fight on floating islands', inline: true }
    );

  const templateButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('template_minecraft_survival')
      .setLabel('Survival Games')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('template_minecraft_bedwars')
      .setLabel('Bed Wars')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('template_minecraft_skywars')
      .setLabel('Sky Wars')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.update({ embeds: [templateEmbed], components: [templateButtons] });
}

async function trackInvite(member) {
  console.log(`Invite tracking for ${member.user.tag}`);
}

function scheduleDailyReport() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  );
  
  const msUntilMidnight = night.getTime() - now.getTime();

  setTimeout(() => {
    analyticsSystem.generateDailyReport();
    scheduleDailyReport();
  }, msUntilMidnight);
}

async function forceExistingMembersProfile() {
  try {
    const guild = client.guilds.cache.first();
    const members = await guild.members.fetch();
    
    let processed = 0;
    for (const member of members.values()) {
      if (member.user.bot) continue;
      
      const profile = profileSystem.getProfile(member.id);
      if (!profile || !profile.completed) {
        await profileSystem.forceProfileCompletion(member);
        processed++;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`✅ Sent profile completion reminders to ${processed} existing members`);
  } catch (error) {
    console.error('Error forcing existing members profile:', error);
  }
}

// Error Handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});

console.log('🚀 OTO Tournament Bot starting...');
console.log('📁 Data manager initialized');
console.log('🎮 All systems loaded');
console.log('⏰ Background tasks scheduled');
