const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, PermissionsBitField, ChannelType, Events, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { createCanvas, loadImage, registerFont } = require('canvas');
const QRCode = require('qrcode');

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
  WELCOME: '1438482904018849835'
};

// Role IDs
const ROLES = {
  OWNER: '1438443937588183110',
  ADMIN: '1438475461977047112',
  STAFF: '1438475461977047112',
  PLAYER: '1439542574066176021',
  FOUNDER: '1438443937588183110'
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
  INVITE_REWARD_THRESHOLDS: [5, 10, 15, 20, 30, 50, 100]
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
      
      // Store that we've sent welcome message
      this.pendingProfiles.set(member.id, {
        step: 0,
        data: {}
      });
    } catch (error) {
      console.error('Failed to send welcome DM:', error);
    }
  }

  async startProfileCreation(interaction) {
    const member = interaction.member;
    
    const nameEmbed = new EmbedBuilder()
      .setTitle('📝 Profile Creation - Step 1/4')
      .setDescription('**What\'s your name?**\n\nPlease type your real name below:')
      .setColor(0x0099FF)
      .setFooter({ text: 'Profile completion unlocks tournament access!' });

    await interaction.reply({ embeds: [nameEmbed], ephemeral: true });
    
    this.profileStates.set(member.id, {
      step: 1,
      data: { startedAt: Date.now() }
    });

    // Create a collector for name input
    const filter = m => m.author.id === member.id && m.channel.type === ChannelType.DM;
    const collector = interaction.channel.createMessageCollector({ filter, time: 300000 }); // 5 minutes

    collector.on('collect', async (message) => {
      const name = message.content.trim();
      if (name.length < 2 || name.length > 20) {
        await message.reply('❌ Please enter a valid name (2-20 characters):');
        return;
      }

      this.profileStates.get(member.id).data.name = name;
      await this.askGender(member);
      collector.stop();
    });
  }

  async askGender(member) {
    const genderEmbed = new EmbedBuilder()
      .setTitle('📝 Profile Creation - Step 2/4')
      .setDescription('**Select your gender:**')
      .setColor(0x0099FF);

    const genderButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gender_male')
        .setLabel('👨 Male')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('gender_female')
        .setLabel('👩 Female')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('gender_other')
        .setLabel('⚧️ Other')
        .setStyle(ButtonStyle.Secondary)
    );

    await member.send({ embeds: [genderEmbed], components: [genderButtons] });
    this.profileStates.get(member.id).step = 2;
  }

  async askState(member) {
    const stateEmbed = new EmbedBuilder()
      .setTitle('📝 Profile Creation - Step 3/4')
      .setDescription('**Which state are you from?**\n\nPlease type your state name below:')
      .setColor(0x0099FF);

    await member.send({ embeds: [stateEmbed] });
    this.profileStates.get(member.id).step = 3;

    const filter = m => m.author.id === member.id && m.channel.type === ChannelType.DM;
    const collector = member.dmChannel.createMessageCollector({ filter, time: 300000 });

    collector.on('collect', async (message) => {
      const state = message.content.trim();
      if (state.length < 2 || state.length > 30) {
        await message.reply('❌ Please enter a valid state name:');
        return;
      }

      this.profileStates.get(member.id).data.state = state;
      await this.askGame(member);
      collector.stop();
    });
  }

  async askGame(member) {
    const gameEmbed = new EmbedBuilder()
      .setTitle('📝 Profile Creation - Step 4/4')
      .setDescription('**Select your primary game:**')
      .setColor(0x0099FF);

    const gameButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('game_freefire')
        .setLabel('🔥 Free Fire')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('game_minecraft')
        .setLabel('⛏️ Minecraft')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('game_both')
        .setLabel('🎮 Both')
        .setStyle(ButtonStyle.Primary)
    );

    await member.send({ embeds: [gameEmbed], components: [gameButtons] });
    this.profileStates.get(member.id).step = 4;
  }

  async completeProfile(member, gameChoice) {
    const state = this.profileStates.get(member.id);
    if (!state) return;

    const profileData = {
      userId: member.id,
      otoId: this.generateOTOId(),
      name: state.data.name,
      gender: state.data.gender,
      state: state.data.state,
      game: gameChoice,
      level: 1,
      badges: ['🎯 New Player'],
      stats: {
        tournamentsPlayed: 0,
        wins: 0,
        earnings: 0,
        invites: 0,
        joinDate: Date.now()
      },
      verification: 0,
      createdAt: Date.now(),
      completed: true
    };

    // Save profile
    this.profiles[member.id] = profileData;
    dataManager.writeData('profiles.json', this.profiles);

    // Clear state
    this.profileStates.delete(member.id);
    this.pendingProfiles.delete(member.id);

    // Assign Player role
    try {
      const playerRole = member.guild.roles.cache.get(ROLES.PLAYER);
      if (playerRole) {
        await member.roles.add(playerRole);
      }
    } catch (error) {
      console.error('Failed to assign player role:', error);
    }

    // Send completion message
    await this.sendCompletionMessage(member, profileData);
    
    // Post to profile showcase
    await this.postProfileShowcase(member, profileData);

    // Send welcome in general chat
    await this.sendWelcomeAnnouncement(member, profileData);
  }

  async sendCompletionMessage(member, profileData) {
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

    await member.send({ embeds: [completionEmbed], components: [actionButtons] });
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

      const genderGreetings = greetings[profileData.gender] || greetings.other;
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
    // Send DM to existing members who haven't completed profile
    try {
      const profile = this.getProfile(member.id);
      if (!profile || !profile.completed) {
        await this.sendWelcomeDM(member);
      }
    } catch (error) {
      console.error('Error forcing profile completion:', error);
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

    // Store pending validation
    this.pendingInvites.set(invitedId, {
      inviterId: inviterId,
      joinTime: Date.now(),
      validated: false
    });

    dataManager.writeData('invites.json', this.invites);

    // Notify inviter
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

    // Check validation criteria
    const user = await client.users.fetch(userId);
    const profile = profileSystem.getProfile(userId);
    const accountAge = Date.now() - user.createdTimestamp;
    const timeInServer = Date.now() - pending.joinTime;

    // Validation rules
    if (accountAge < 7 * 24 * 60 * 60 * 1000) return false; // 7 days old
    if (!profile || !profile.completed) return false; // Profile completed
    if (timeInServer < 3 * 24 * 60 * 60 * 1000) return false; // 3 days in server

    // Mark as validated
    pending.validated = true;
    this.pendingInvites.set(userId, pending);

    // Update inviter stats
    const inviterId = pending.inviterId;
    if (this.invites[inviterId]) {
      this.invites[inviterId].valid++;
      this.invites[inviterId].pending--;
      
      // Update invited user status
      const invitedUser = this.invites[inviterId].invitedUsers.find(u => u.userId === userId);
      if (invitedUser) {
        invitedUser.status = 'valid';
        invitedUser.validated = true;
        invitedUser.validatedAt = Date.now();
      }

      dataManager.writeData('invites.json', this.invites);

      // Check for reward milestones
      await this.checkRewardMilestones(inviterId);
      
      // Update leaderboards
      this.updateInviteLeaderboards();
      
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

      // Additional reward processing based on type
      switch (reward.type) {
        case 'role':
          await this.assignRecruiterRole(inviterId, reward.value);
          break;
        case 'free_entry':
          // Add free entry to user's profile
          profileSystem.updateProfile(inviterId, {
            freeEntries: (profileSystem.getProfile(inviterId)?.freeEntries || 0) + reward.value
          });
          break;
        case 'discount':
          // Add discount coupon
          profileSystem.updateProfile(inviterId, {
            discounts: [...(profileSystem.getProfile(inviterId)?.discounts || []), reward]
          });
          break;
      }
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
      
      const roleNames = {
        'Beginner Recruiter': 'Beginner Recruiter',
        'Pro Recruiter': 'Pro Recruiter',
        'Elite Recruiter': 'Elite Recruiter',
        'Legend': 'Legend Recruiter'
      };

      // Implementation for role assignment would go here
      // You need to create these roles in your Discord server first
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
      // Show template selection
      await this.showTemplateSelection(interaction);
      return;
    }

    // Create tournament from template
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

    // Show configuration modal
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

    // Update tournament with config
    tournament.title = config.title;
    tournament.prizePool = parseInt(config.prizePool);
    tournament.entryFee = parseInt(config.entryFee);
    tournament.slots = parseInt(config.slots);
    tournament.time = config.time;
    tournament.status = 'open';
    
    // Calculate prize distribution
    tournament.prizeDistribution = this.calculatePrizeDistribution(tournament.prizePool);

    dataManager.writeData('tournaments.json', this.tournaments);

    // Post tournament announcement
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

      // Store message ID for updates
      tournament.announcementMessageId = message.id;
      dataManager.writeData('tournaments.json', this.tournaments);

      // Also post in general chat
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

      // Start spam interval (every 2 minutes while open)
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
        }, 120000); // 2 minutes

        // Store interval reference
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

    // Check if profile is completed
    if (!profile || !profile.completed) {
      await interaction.reply({
        content: '❌ You need to complete your profile before joining tournaments! Check your DMs.',
        ephemeral: true
      });
      // Send profile completion reminder
      await profileSystem.forceProfileCompletion(interaction.member);
      return;
    }

    // Check if already joined
    if (tournament.participants.some(p => p.userId === userId)) {
      await interaction.reply({ content: '❌ You have already joined this tournament!', ephemeral: true });
      return;
    }

    // Check if tournament is full
    if (tournament.slotsFilled >= tournament.slots) {
      await interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
      return;
    }

    // Create payment ticket
    await this.createPaymentTicket(interaction, tournament);
  }

  async createPaymentTicket(interaction, tournament) {
    const userId = interaction.user.id;
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    try {
      // Create ticket in ticket log channel
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

      // Store ticket data
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

      // Send payment instructions to user
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
          { name: '🎫 Reference ID', value: ticketId, inline: true }
        )
        .setFooter({ text: 'Scan QR code or use UPI ID to pay' });

      // Generate QR code
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
        width: 200,
        height: 200,
        margin: 1
      });

      const paymentMessage = await user.send({ 
        embeds: [paymentEmbed],
        files: [{
          attachment: qrCodeBuffer,
          name: 'qrcode.png'
        }]
      });

      // Ask for IGN and Game ID
      const ignEmbed = new EmbedBuilder()
        .setTitle('🎮 Player Information Required')
        .setDescription('**Please provide your in-game details:**\n\n1️⃣ **In-Game Name (IGN)**\n2️⃣ **Game ID**')
        .setColor(0x0099FF)
        .setFooter({ text: 'Type your IGN below to continue' });

      await user.send({ embeds: [ignEmbed] });

      // Set up message collector for IGN
      const filter = m => m.author.id === user.id && m.channel.type === ChannelType.DM;
      const collector = user.dmChannel.createMessageCollector({ filter, time: 300000 });

      collector.on('collect', async (message) => {
        const ign = message.content.trim();
        if (ign.length < 2 || ign.length > 20) {
          await message.reply('❌ Please enter a valid IGN (2-20 characters):');
          return;
        }

        // Store IGN
        this.tickets[ticketId].userInfo.ign = ign;
        dataManager.writeData('tickets.json', this.tickets);

        // Ask for Game ID
        const gameIdEmbed = new EmbedBuilder()
          .setTitle('🎮 Game ID Required')
          .setDescription('**Now please provide your Game ID:**')
          .setColor(0x0099FF)
          .setFooter({ text: 'Type your Game ID below' });

        await user.send({ embeds: [gameIdEmbed] });

        // Set up collector for Game ID
        const gameIdCollector = user.dmChannel.createMessageCollector({ filter, time: 300000 });

        gameIdCollector.on('collect', async (gameIdMessage) => {
          const gameId = gameIdMessage.content.trim();
          
          // Store Game ID
          this.tickets[ticketId].userInfo.gameId = gameId;
          dataManager.writeData('tickets.json', this.tickets);

          // Ask for payment screenshot
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

    // Update ticket status
    ticket.status = 'approved';
    ticket.approvedBy = staffMember.id;
    ticket.approvedAt = Date.now();

    // Add user to tournament participants
    tournament.participants.push({
      userId: ticket.userId,
      ign: ticket.userInfo.ign,
      gameId: ticket.userInfo.gameId,
      joinedAt: Date.now(),
      ticketId: ticketId
    });

    tournament.slotsFilled++;

    // Update data
    dataManager.writeData('tickets.json', this.tickets);
    dataManager.writeData('tournaments.json', this.tournaments);

    // Update tournament announcement
    await this.updateTournamentAnnouncement(tournament);

    // Notify user
    await this.sendApprovalNotification(ticket.userId, tournament);

    // Update ticket embed
    await this.updateTicketEmbed(ticketId, 'approved', staffMember);

    // Create lobby if needed
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

      // Send lobby information if available
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
        
        // Update slots field
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
        
        // Update color and status
        const statusColors = {
          'approved': 0x00FF00,
          'rejected': 0xFF0000,
          'pending': 0x0099FF
        };

        updatedEmbed.setColor(statusColors[status] || 0x0099FF);
        
        // Update footer
        updatedEmbed.setFooter({ 
          text: status === 'approved' ? 
            `Approved by ${staffMember.user.username}` : 
            `Rejected by ${staffMember.user.username}` 
        });

        // Remove buttons
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
      
      // Create lobby channel
      const lobbyChannel = await guild.channels.create({
        name: `lobby-${tournament.id.toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: CHANNELS.STAFF_TOOLS, // Place under staff category
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

      // Send lobby message
      const lobbyEmbed = new EmbedBuilder()
        .setTitle('🏆 TOURNAMENT LOBBY')
        .setDescription(`**${tournament.title}**`)
        .setColor(0x00FF00)
        .addFields(
          { name: '⏰ Starting', value: `${tournament.time} (<t:${Math.floor(Date.now()/1000) + 7200}:R>)`, inline: true }, // 2 hours from now
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

      // Schedule room credential sharing (5 minutes before)
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

      // Generate room credentials
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

      // Auto-delete credentials after 30 minutes
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
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const content = message.content.toLowerCase();
    const userId = message.author.id;

    // Update message count for spam detection
    this.updateMessageCount(userId);

    // Check for bad words
    const badWordLevel = this.checkBadWords(content);
    if (badWordLevel > 0) {
      await this.handleBadWord(message, badWordLevel);
      return;
    }

    // Check for spam
    if (this.isSpam(userId, content)) {
      await this.handleSpam(message);
      return;
    }

    // Check for excessive mentions
    if (this.isMentionSpam(message)) {
      await this.handleMentionSpam(message);
      return;
    }
  }

  checkBadWords(content) {
    for (const [level, words] of Object.entries(this.badWords)) {
      for (const word of words) {
        if (content.includes(word)) {
          // Context check - allow game-related terms
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
    
    // Allow common gaming phrases
    const allowedPhrases = ['pubg bc', 'ff bc', 'game noob'];
    const isAllowedPhrase = allowedPhrases.some(phrase => content.includes(phrase));
    
    return hasGameTerm || isAllowedPhrase;
  }

  isSpam(userId, content) {
    const userData = this.userMessageCount.get(userId);
    if (!userData) return false;

    // Check message frequency (5 messages in 3 seconds)
    if (userData.count >= 5 && Date.now() - userData.firstMessage < 3000) {
      return true;
    }

    // Check emoji spam (10+ emojis)
    const emojiCount = (content.match(/<a?:.+?:\d+>|[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 10) return true;

    // Check caps spam (80% caps)
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
      // Delete the message
      await message.delete();

      // Add warning
      await this.addWarning(userId, `Used inappropriate language (Level ${level})`, message.content);

      // Take action based on level
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

    // Clean old warnings (older than 7 days)
    this.warnings[userId].history = this.warnings[userId].history.filter(
      w => Date.now() - w.timestamp < 7 * 24 * 60 * 60 * 1000
    );
    this.warnings[userId].count = this.warnings[userId].history.length;

    dataManager.writeData('warnings.json', this.warnings);

    // Take action based on warning count
    const warningCount = this.warnings[userId].count;
    
    if (warningCount >= 5) {
      // Permanent ban
      const member = await client.guilds.cache.first().members.fetch(userId).catch(() => null);
      if (member) {
        await member.ban({ reason: 'Excessive warnings' });
      }
    } else if (warningCount >= 4) {
      // 24 hour timeout
      const member = await client.guilds.cache.first().members.fetch(userId).catch(() => null);
      if (member) {
        await this.timeoutUser(member, 24 * 60 * 60 * 1000, 'Excessive warnings');
      }
    } else if (warningCount >= 3) {
      // 1 hour timeout
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

    // Check if bot was mentioned
    const isBotMentioned = message.mentions.has(client.user);

    // Response patterns
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

    // If no specific response and bot was mentioned, send general help
    if (isBotMentioned) {
      await this.sendGeneralHelp(message, profile);
      return;
    }

    // Check for unanswered messages in general chat
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
    const greetings = {
      male: [
        "Kya haal bhai! Tournament kheloge aaj? 🔥",
        "Bro! Slots filling fast, jaldi join karo! ⚡", 
        "Haan bhai, batao kya help chahiye? 💪",
        "Aur bhai! Ready for today's tournament? 🎮"
      ],
      female: [
        "Hello ji! Tournament khelogi? 🎮",
        "Hii! Aaj ka tournament dekha? Slots limited hain! 💎",
        "Ji, batao kya help chahiye? ✨",
        "Namaste ji! Kya aap tournament khelna chahengi? 🌸"
      ],
      other: [
        "Hello there! Ready for some tournaments? 🎮",
        "Hey! Check out today's tournament schedule! ⚡",
        "Hi! Need any help with tournaments? 💫",
        "Greetings! Let me know if you need assistance! 🌟"
      ]
    };

    const gender = profile?.gender || 'other';
    const responses = greetings[gender];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Add time-based greeting
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning! ';
    else if (hour < 17) timeGreeting = 'Good afternoon! ';
    else timeGreeting = 'Good evening! ';

    const fullResponse = `${timeGreeting}${randomResponse}`;

    await message.reply(fullResponse);

    // Set up follow-up question
    setTimeout(async () => {
      try {
        const followUps = {
          male: "Bhai, koi doubt hai? Ya directly tournament join karna hai? 🎯",
          female: "Ji, koi doubt hai? Ya aap directly tournament join karna chahengi? 💎",
          other: "Any questions? Or would you like to join a tournament directly? 🎮"
        };

        await message.channel.send(followUps[gender]);
      } catch (error) {
        // Ignore errors (might be in different channel)
      }
    }, 120000); // 2 minutes later
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

    // Check if message got any replies in 2 minutes
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
    }, 120000); // 2 minutes
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
    
    // Most Wins
    const mostWins = Object.values(profiles)
      .filter(p => p.stats.wins > 0)
      .sort((a, b) => b.stats.wins - a.stats.wins)
      .slice(0, 10)
      .map(p => ({
        userId: p.userId,
        wins: p.stats.wins,
        earnings: p.stats.earnings
      }));

    // Highest Earnings
    const highestEarnings = Object.values(profiles)
      .filter(p => p.stats.earnings > 0)
      .sort((a, b) => b.stats.earnings - a.stats.earnings)
      .slice(0, 10)
      .map(p => ({
        userId: p.userId,
        earnings: p.stats.earnings,
        wins: p.stats.wins
      }));

    // Best Win Rate
    const bestWinRate = Object.values(profiles)
      .filter(p => p.stats.tournamentsPlayed >= 5) // Minimum 5 tournaments
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
    // This would require squad data implementation
    // Placeholder for now
    this.leaderboards.squads.bestSquad = [];
    this.leaderboards.squads.deadliestSquad = [];
    this.leaderboards.squads.richestSquad = [];
  }

  async postLeaderboardUpdates() {
    try {
      const leaderboardChannel = client.channels.cache.get(CHANNELS.LEADERBOARD);
      if (!leaderboardChannel) return;

      // Clear previous leaderboard messages
      const messages = await leaderboardChannel.messages.fetch({ limit: 10 });
      for (const message of messages.values()) {
        if (message.author.id === client.user.id) {
          await message.delete().catch(() => {});
        }
      }

      // Post tournament leaderboard
      await this.postTournamentLeaderboard(leaderboardChannel);
      
      // Post invite leaderboard
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

    // Send report to staff
    await this.sendDailyReport();

    // Reset daily stats
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

// Initialize all systems
const profileSystem = new ProfileSystem();
const inviteSystem = new InviteSystem();
const tournamentSystem = new TournamentSystem();
const moderationSystem = new ModerationSystem();
const autoResponseSystem = new AutoResponseSystem();
const leaderboardSystem = new LeaderboardSystem();
const analyticsSystem = new AnalyticsSystem();

// Command Handling
client.commands = new Collection();

const commands = {
  // Profile Commands
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

  // Invite Commands
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

  // Tournament Commands
  createtournament: {
    execute: async (interaction) => {
      // Check if user has staff role
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

  // Staff Commands
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

  // Moderation Commands
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

  // Analytics Commands
  stats: {
    execute: async (interaction) => {
      const user = interaction.options.getUser('user');

      if (user) {
        // User stats
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
        // Server stats
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

  // Help Command
  help: {
    execute: async (interaction) => {
      const helpEmbed = new EmbedBuilder()
        .setTitle('🤖 OTO Tournament Bot Help')
        .setColor(0x0099FF)
        .setDescription('**Available Commands:**')
        .addFields(
          { name: '👤 Profile Commands', value: '`-profile` - View your profile\n`-profile @user` - View user profile', inline: false },
          { name: '📨 Invite Commands', value: '`-invite` - Your invite stats\n`-invites` - Invite leaderboard', inline: false },
          { name: '🏆 Tournament Commands', value: '`-createtournament` - Create tournament (Staff)\n`-dashboard` - Staff dashboard', inline: false },
          { name: '⚡ Moderation Commands', value: '`-warn @user reason` - Warn user (Staff)\nAuto-moderation is always active', inline: false },
          { name: '📊 Analytics Commands', value: '`-stats` - Server stats\n`-stats @user` - User stats', inline: false }
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

  // Set bot status
  client.user.setActivity('OTO Tournaments | -help', { type: 3 });

  // Start background tasks
  leaderboardSystem.startAutoUpdate();
  
  // Schedule daily report (midnight)
  scheduleDailyReport();

  // Schedule backup every 5 minutes
  setInterval(() => {
    dataManager.backupData();
  }, CONFIG.BACKUP_INTERVAL);

  console.log('🔄 Background tasks started!');

  // Force profile completion for existing members
  setTimeout(async () => {
    await forceExistingMembersProfile();
  }, 10000);
});

client.on('guildMemberAdd', async (member) => {
  console.log(`👋 New member joined: ${member.user.tag}`);
  
  // Send welcome DM
  await profileSystem.sendWelcomeDM(member);
  
  // Track invite if applicable
  await trackInvite(member);
  
  // Update analytics
  analyticsSystem.trackUserJoin();
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Update analytics
  analyticsSystem.trackMessage();

  // Check for commands
  if (message.content.startsWith(CONFIG.PREFIX)) {
    await handleCommand(message);
    return;
  }

  // Auto-response system
  await autoResponseSystem.checkAutoResponse(message);

  // Moderation system
  await moderationSystem.checkMessage(message);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  } else if (interaction.isModalSubmit()) {
    await handleModalSubmit(interaction);
  } else if (interaction.isCommand()) {
    await handleSlashCommand(interaction);
  }
});

// Button Interaction Handler
async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;

  try {
    // Profile creation buttons
    if (customId === 'start_profile') {
      await profileSystem.startProfileCreation(interaction);
    }
    else if (customId.startsWith('gender_')) {
      const gender = customId.replace('gender_', '');
      profileSystem.profileStates.get(interaction.user.id).data.gender = gender;
      await profileSystem.askState(interaction.member);
      await interaction.deferUpdate();
    }
    else if (customId.startsWith('game_')) {
      const game = customId.replace('game_', '');
      await profileSystem.completeProfile(interaction.member, game);
      await interaction.deferUpdate();
    }

    // Tournament buttons
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
      // Implement rejection logic
      await interaction.reply({ content: '❌ Payment rejected!', ephemeral: true });
    }

    // Template selection buttons
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

  } catch (error) {
    console.error('Button interaction error:', error);
    await interaction.reply({ 
      content: '❌ An error occurred while processing your request.', 
      ephemeral: true 
    });
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

  // Simple command handling for legacy prefix commands
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
          { name: '🏆 Tournaments', value: 'Check tournament channels!', inline: true }
        );

      await message.reply({ embeds: [helpEmbed] });
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
  // This would require invite tracking implementation
  // For now, it's a placeholder
  console.log(`Invite tracking for ${member.user.tag}`);
}

function scheduleDailyReport() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    0, 0, 0 // midnight
  );
  
  const msUntilMidnight = night.getTime() - now.getTime();

  setTimeout(() => {
    analyticsSystem.generateDailyReport();
    // Schedule next report
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
        
        // Delay to avoid rate limits
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
