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
  ChannelType
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Bot Token from Environment Variable
  TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID || '1438443817799045141',
  
  // Channel IDs
  CHANNELS: {
    GENERAL: '1438482904018849835',
    ANNOUNCEMENT: '1438484746165555243',
    PROFILE: '1439542574066176020',
    TOURNAMENT_SCHEDULE: '1438482561679626303',
    INVITE_TRACKER: '1439216884774998107',
    LEADERBOARD: '1438947356690223347',
    STAFF_TOOLS: '1438486059255336970',
    OWNER_TOOLS: '1438486059255336970',
    MINECRAFT_CHAT: '1439223955960627421',
    TICKET_CATEGORY: process.env.TICKET_CATEGORY_ID || 'YOUR_TICKET_CATEGORY_ID',
    
    // Additional Channels
    HOW_TO_JOIN: '1438482512296022017',
    RULES_CHANNEL: '1438482342145687643',
    BOT_COMMANDS: '1438483009950191676',
    OPEN_TICKET: '1438485759891079180',
    TICKET_LOG: '1438485821572518030',
    MATCH_REPORTS: '1438486113047150714',
    PAYMENT_PROOF: '1438486113047150714',
    PLAYER_FORM: '1438486008453660863',
    STAFF_CHAT: '1438486059255336970',
    MOST_PLAYER_LB: '1439226024863993988',
    CELEBRATION: '1441653083120603187',
    WELCOME_CHANNEL: '1438482904018849835'
  },
  
  // Role IDs
  ROLES: {
    OWNER: '1438443937588183110',
    ADMIN: '1438475461977047112',
    STAFF: '1438475461977047112',
    PLAYER: process.env.PLAYER_ROLE_ID || 'player_role_id',
    VERIFIED: process.env.VERIFIED_ROLE_ID || 'verified_role_id',
    RECRUITER: process.env.RECRUITER_ROLE_ID || 'recruiter_role_id',
    PRO_RECRUITER: process.env.PRO_RECRUITER_ROLE_ID || 'pro_recruiter_role_id',
    ELITE_RECRUITER: process.env.ELITE_RECRUITER_ROLE_ID || 'elite_recruiter_role_id'
  },
  
  // Owner ID from Environment Variable
  OWNER_ID: process.env.OWNER_ID || '1438443937588183110'
};

// ============================================
// DATA MANAGEMENT
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files
const dataFiles = {
  profiles: 'profiles.json',
  tournaments: 'tournaments.json',
  tickets: 'tickets.json',
  invites: 'invites.json',
  warnings: 'warnings.json',
  leaderboard: 'leaderboard.json',
  settings: 'settings.json',
  badges: 'badges.json'
};

// Create data files if they don't exist
Object.entries(dataFiles).forEach(([key, filename]) => {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify({}));
  }
});

// Data loaders
const loadData = (filename) => {
  try {
    const data = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const saveData = (filename, data) => {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
};

// ============================================
// INDIAN STATES DATA
// ============================================
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry'
];

// ============================================
// BAD WORDS FILTER (Hindi + English)
// ============================================
const BAD_WORDS = [
  // Add your bad words here (keeping it clean for this example)
  'badword1', 'badword2', 'spam', 'scam'
];

// ============================================
// BOT INITIALIZATION
// ============================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Channel, Partials.Message]
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate OTO ID
function generateOTOID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'OTO';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Generate Tournament ID
function generateTournamentID() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const tournaments = loadData('tournaments.json');
  const todayTournaments = Object.keys(tournaments).filter(id => 
    id.startsWith(`OTO-${year}${month}${day}`)
  ).length;
  
  const count = String(todayTournaments + 1).padStart(3, '0');
  return `OTO-${year}${month}${day}-${count}`;
}

// Create beautiful profile embed
function createProfileEmbed(user, profileData) {
  const gameEmojis = {
    freefire: '🔥',
    minecraft: '⛏️',
    other: '🎮'
  };
  
  const genderEmoji = profileData.gender === 'male' ? '👨' : profileData.gender === 'female' ? '👩' : '❓';
  
  return new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`🎮 ${profileData.name.toUpperCase()}'S PROFILE CARD`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setDescription('━━━━━━━━━━━━━━━━━━━━━━')
    .addFields(
      { name: '👤 Name', value: profileData.name, inline: true },
      { name: '🆔 OTO ID', value: profileData.otoId, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: `${gameEmojis[profileData.game] || '🎮'} Game`, value: profileData.game.toUpperCase(), inline: true },
      { name: '📍 State', value: profileData.state, inline: true },
      { name: `${genderEmoji} Gender`, value: profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1), inline: true }
    )
    .addFields(
      { name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━' }
    )
    .addFields(
      { name: '📊 STATS', value: 
        `🏆 Wins: ${profileData.stats.wins}\n` +
        `🎮 Played: ${profileData.stats.played}\n` +
        `💰 Earned: ₹${profileData.stats.earned}\n` +
        `👥 Invites: ${profileData.stats.invites}`,
        inline: true
      },
      { name: '⭐ Level', value: `Level ${profileData.level} (New Player)`, inline: true }
    )
    .addFields(
      { name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━' }
    )
    .setFooter({ text: `Joined: ${new Date(profileData.createdAt).toLocaleDateString()}` })
    .setTimestamp();
}

// Check if user has profile
function hasProfile(userId) {
  const profiles = loadData('profiles.json');
  return !!profiles[userId];
}

// Get user profile
function getUserProfile(userId) {
  const profiles = loadData('profiles.json');
  return profiles[userId] || null;
}

// Save user profile
function saveUserProfile(userId, data) {
  const profiles = loadData('profiles.json');
  profiles[userId] = data;
  saveData('profiles.json', profiles);
}

// Check for bad words
function containsBadWords(message) {
  const lowerMessage = message.toLowerCase();
  return BAD_WORDS.some(word => lowerMessage.includes(word));
}

// Detect spam
const userMessages = new Map();
function isSpamming(userId) {
  const now = Date.now();
  const userMsgs = userMessages.get(userId) || [];
  
  // Filter messages from last 5 seconds
  const recentMsgs = userMsgs.filter(time => now - time < 5000);
  
  // Add current message
  recentMsgs.push(now);
  userMessages.set(userId, recentMsgs);
  
  // If more than 5 messages in 5 seconds = spam
  return recentMsgs.length > 5;
}

// ============================================
// BOT READY EVENT
// ============================================
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    
    // Pin rules and how to join in announcement channel
    const announcementChannel = guild.channels.cache.get(CONFIG.CHANNELS.ANNOUNCEMENT);
    if (announcementChannel) {
      const rulesEmbed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('📜 WELCOME TO OTO TOURNAMENTS!')
        .setDescription(
          '**To talk in server, you need to create your OTO profile!**\n\n' +
          '📱 **Check your DMs** for profile creation\n' +
          '❌ **Didn\'t get DM?** Click the button below to resend!\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '**🎯 How to Join Tournaments:**\n' +
          '1️⃣ Complete your profile\n' +
          '2️⃣ Check <#' + CONFIG.CHANNELS.TOURNAMENT_SCHEDULE + '>\n' +
          '3️⃣ Click "JOIN NOW" button\n' +
          '4️⃣ Provide IGN and payment proof\n' +
          '5️⃣ Win big prizes! 💰\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '**🎁 Invite Rewards:**\n' +
          '• 5 invites = FREE match vs Pro Player\n' +
          '• Win 1 match = FREE tournament entry!\n\n' +
          '**Need help?** Ask in support channel!'
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'OTO Tournaments - Win Big, Play Fair!' })
        .setTimestamp();
      
      const resendButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('resend_profile_dm')
            .setLabel('📩 Resend Profile DM')
            .setStyle(ButtonStyle.Primary)
        );
      
      const messages = await announcementChannel.messages.fetch({ limit: 10 });
      const existingMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
      
      if (existingMessage) {
        await existingMessage.edit({ embeds: [rulesEmbed], components: [resendButton] });
      } else {
        const msg = await announcementChannel.send({ embeds: [rulesEmbed], components: [resendButton] });
        await msg.pin();
      }
    }
    
    // Send profile creation DM to all existing members without profiles
    const members = await guild.members.fetch();
    let dmsSent = 0;
    
    for (const [memberId, member] of members) {
      if (member.user.bot) continue;
      if (hasProfile(memberId)) continue;
      
      try {
        await sendProfileCreationDM(member.user);
        dmsSent++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit protection
      } catch (error) {
        console.log(`Could not DM ${member.user.tag}`);
      }
    }
    
    console.log(`📨 Sent profile creation DMs to ${dmsSent} members`);
    
    // Pin staff tools guide
    await pinStaffToolsGuide(guild);
    
    // Pin owner tools guide
    await pinOwnerToolsGuide(guild);
    
    // Update leaderboards
    await updateLeaderboards(guild);
    
  } catch (error) {
    console.error('Error in ready event:', error);
  }
});

// ============================================
// PROFILE CREATION DM SYSTEM
// ============================================
async function sendProfileCreationDM(user) {
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle('🎮 Welcome to OTO Tournaments!')
    .setDescription(
      `Hey **${user.username}**! 👋\n\n` +
      `To unlock the server and start playing tournaments, you need to create your profile first!\n\n` +
      `Click the **JOIN** button below to get started! 🚀`
    )
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'Complete your profile to unlock all channels!' })
    .setTimestamp();
  
  const joinButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('start_profile_creation')
        .setLabel('✨ JOIN - Create Profile')
        .setStyle(ButtonStyle.Success)
    );
  
  await user.send({ embeds: [welcomeEmbed], components: [joinButton] });
}

// ============================================
// MEMBER JOIN EVENT
// ============================================
client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  
  const guild = member.guild;
  
  // Send welcome message in general
  const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
  if (generalChannel) {
    const welcomeMessages = [
      `🎉 Welcome ${member} to OTO Family! Complete your profile to unlock tournaments! 🏆`,
      `🔥 ${member} aa gaya! Machayenge ab! Check DMs for profile setup! 🎮`,
      `👋 Hello ${member}! Ready to win big? Tournaments waiting for you! 💰`
    ];
    
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    await generalChannel.send(randomWelcome);
  }
  
  // Send profile creation DM
  try {
    await sendProfileCreationDM(member.user);
  } catch (error) {
    console.log(`Could not DM ${member.user.tag}`);
  }
  
  // Track invite
  trackInvite(member);
});

// ============================================
// MEMBER LEAVE EVENT
// ============================================
client.on('guildMemberRemove', async (member) => {
  if (member.user.bot) return;
  
  const generalChannel = member.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
  if (generalChannel) {
    const goodbyeMessages = [
      `😢 ${member.user.username} left the server. We'll miss you! 💔`,
      `👋 ${member.user.username} has left OTO Family. Hope to see you back! 🏆`,
      `🚪 ${member.user.username} left the tournament grounds. Miss you bro! 😞`
    ];
    
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
    await generalChannel.send(randomGoodbye);
  }
});

// ============================================
// INVITE TRACKING
// ============================================
const invites = new Map();

client.on('ready', async () => {
  const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
  const guildInvites = await guild.invites.fetch();
  invites.set(guild.id, new Map(guildInvites.map(invite => [invite.code, invite.uses])));
});

async function trackInvite(member) {
  const guild = member.guild;
  const cachedInvites = invites.get(guild.id);
  const newInvites = await guild.invites.fetch();
  
  const usedInvite = newInvites.find(invite => {
    const cachedUses = cachedInvites.get(invite.code) || 0;
    return invite.uses > cachedUses;
  });
  
  if (usedInvite) {
    const inviter = usedInvite.inviter;
    const invitesData = loadData('invites.json');
    
    if (!invitesData[inviter.id]) {
      invitesData[inviter.id] = {
        total: 0,
        active: 0,
        fake: 0,
        rewards: []
      };
    }
    
    invitesData[inviter.id].total++;
    invitesData[inviter.id].active++;
    saveData('invites.json', invitesData);
    
    // Check for milestone rewards
    await checkInviteMilestone(guild, inviter.id);
  }
  
  // Update cached invites
  invites.set(guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
}

// Check invite milestones
async function checkInviteMilestone(guild, userId) {
  const invitesData = loadData('invites.json');
  const userData = invitesData[userId];
  
  if (userData.total === 5 && !userData.rewards.includes('5_invites')) {
    userData.rewards.push('5_invites');
    saveData('invites.json', invitesData);
    
    // Send congratulations DM
    const user = await client.users.fetch(userId);
    const rewardEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎉 CONGRATULATIONS!')
      .setDescription(
        `You've invited **5 members**! 🔥\n\n` +
        `**You unlocked: FREE MATCH vs OTO Pro Player!**\n\n` +
        `🎯 **Challenge Rules:**\n` +
        `• Best of 3 matches\n` +
        `• Win 1 match → Get FREE SQUAD/DUO/SOLO entry\n` +
        `• Choose: Free Fire or Minecraft\n` +
        `• 2 chances to win!\n\n` +
        `Click **REQUEST MATCH** to challenge!`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'OTO Invite Rewards' })
      .setTimestamp();
    
    const requestButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('request_free_match')
          .setLabel('⚔️ REQUEST MATCH')
          .setStyle(ButtonStyle.Danger)
      );
    
    await user.send({ embeds: [rewardEmbed], components: [requestButton] });
    
    // Update invite tracker
    await updateInviteTracker(guild);
  }
}

// ============================================
// MESSAGE HANDLING
// ============================================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  
  // Check if user has profile
  if (!hasProfile(message.author.id) && message.channel.id !== CONFIG.CHANNELS.ANNOUNCEMENT) {
    return; // User can only see announcement until profile complete
  }
  
  // Moderation checks
  const member = message.member;
  const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                  member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                  member.id === CONFIG.OWNER_ID;
  
  if (!isStaff) {
    // Check for bad words
    if (containsBadWords(message.content)) {
      await message.delete();
      await handleModeration(message.author, 'bad_word', message);
      return;
    }
    
    // Check for spam
    if (isSpamming(message.author.id)) {
      await message.delete();
      await handleModeration(message.author, 'spam', message);
      return;
    }
    
    // Check for unauthorized links
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkRegex);
    if (links) {
      const hasYoutube = links.some(link => link.includes('youtube.com') || link.includes('youtu.be'));
      if (!hasYoutube) {
        await message.delete();
        await handleModeration(message.author, 'unauthorized_link', message);
        return;
      }
    }
  }
  
  // Auto-responses
  await handleAutoResponses(message);
});

// ============================================
// AUTO-RESPONSE SYSTEM
// ============================================
const lastResponses = new Map();

async function handleAutoResponses(message) {
  const lowerContent = message.content.toLowerCase().trim();
  const profile = getUserProfile(message.author.id);
  
  // Check if bot already responded recently to this user
  const lastResponse = lastResponses.get(message.author.id);
  if (lastResponse && Date.now() - lastResponse < 120000) {
    return; // Don't respond if responded in last 2 minutes
  }
  
  // Greetings
  const greetings = ['hi', 'hello', 'hey', 'hii', 'helo'];
  if (greetings.includes(lowerContent)) {
    // Wait 2 minutes to see if someone else responds
    await new Promise(resolve => setTimeout(resolve, 120000));
    
    // Check if anyone replied
    const messages = await message.channel.messages.fetch({ after: message.id, limit: 10 });
    const hasReply = messages.some(m => !m.author.bot && m.author.id !== message.author.id);
    
    if (!hasReply) {
      const greeting = profile && profile.gender === 'female' ? 'Hello ji! 👋' : 'Hi bhai! 😊';
      const reply = await message.reply(greeting);
      
      lastResponses.set(message.author.id, Date.now());
      
      // Follow-up after user responds
      setTimeout(async () => {
        const followUpMessages = await message.channel.messages.fetch({ after: reply.id, limit: 5 });
        const userReplied = followUpMessages.some(m => m.author.id === message.author.id);
        
        if (userReplied) {
          await message.channel.send(
            `If you have any query, you can ask in support channel and check out <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> channel! 🎮`
          );
        }
      }, 10000);
    }
  }
  
  // Help requests
  if (lowerContent.includes('help') || lowerContent.includes('support')) {
    await message.reply(
      `Need help? 🤔\n` +
      `📞 Ask in support channel\n` +
      `🏆 Check <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> for tournaments\n` +
      `📊 View your stats: /profile`
    );
    lastResponses.set(message.author.id, Date.now());
  }
}

// ============================================
// MODERATION HANDLER
// ============================================
async function handleModeration(user, type, message) {
  const warningsData = loadData('warnings.json');
  
  if (!warningsData[user.id]) {
    warningsData[user.id] = {
      warnings: 0,
      history: []
    };
  }
  
  const userData = warningsData[user.id];
  userData.warnings++;
  userData.history.push({
    type,
    timestamp: Date.now(),
    channelId: message.channel.id
  });
  
  saveData('warnings.json', warningsData);
  
  const member = message.guild.members.cache.get(user.id);
  
  // Moderate action based on type
  if (type === 'bad_word') {
    if (userData.warnings === 1) {
      await user.send('⚠️ Warning: Please avoid using inappropriate language in OTO server.');
    } else if (userData.warnings >= 2) {
      await member.timeout(5 * 60 * 1000, 'Repeated inappropriate language');
      await user.send('🔴 You have been timed out for 5 minutes due to repeated violations.');
    }
  } else if (type === 'spam') {
    await member.timeout(5 * 60 * 1000, 'Spamming messages');
    await message.channel.send(`${user} has been timed out for spamming. Please slow down!`).then(msg => {
      setTimeout(() => msg.delete(), 5000);
    });
  } else if (type === 'unauthorized_link') {
    await user.send('⚠️ Warning: Only YouTube links are allowed. Discord invites and other links are not permitted.');
    if (userData.warnings >= 2) {
      await member.timeout(60 * 60 * 1000, 'Posting unauthorized links');
    }
  }
}

// ============================================
// BUTTON INTERACTION HANDLER
// ============================================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  // Resend profile DM
  if (interaction.customId === 'resend_profile_dm') {
    if (hasProfile(interaction.user.id)) {
      await interaction.reply({ content: '✅ You already have a profile!', ephemeral: true });
      return;
    }
    
    try {
      await sendProfileCreationDM(interaction.user);
      await interaction.reply({ content: '📨 Profile creation DM sent! Check your DMs.', ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: '❌ Could not send DM. Please enable DMs from server members.', ephemeral: true });
    }
    return;
  }
  
  // Start profile creation
  if (interaction.customId === 'start_profile_creation') {
    await interaction.reply({ content: '📝 Let\'s create your profile! What\'s your name?', ephemeral: false });
    
    // Wait for name response
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    
    collector.on('collect', async (nameMsg) => {
      const name = nameMsg.content.trim();
      
      // Ask for game
      const gameEmbed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('🎮 Select Your Favorite Game')
        .setDescription('Choose the game you play the most:');
      
      const gameSelect = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_game_' + interaction.user.id)
            .setPlaceholder('Choose your game')
            .addOptions([
              { label: 'Free Fire', value: 'freefire', emoji: '🔥' },
              { label: 'Minecraft', value: 'minecraft', emoji: '⛏️' },
              { label: 'Other Games', value: 'other', emoji: '🎮' },
              { label: 'Custom', value: 'custom', emoji: '✏️' }
            ])
        );
      
      await interaction.channel.send({ embeds: [gameEmbed], components: [gameSelect] });
      
      // Store name temporarily
      client.tempProfiles = client.tempProfiles || new Map();
      client.tempProfiles.set(interaction.user.id, { name });
    });
  }
  
  // Join tournament
  if (interaction.customId.startsWith('join_tournament_')) {
    const tournamentId = interaction.customId.replace('join_tournament_', '');
    await handleTournamentJoin(interaction, tournamentId);
    return;
  }
  
  // Request free match
  if (interaction.customId === 'request_free_match') {
    await handleFreeMatchRequest(interaction);
    return;
  }
  
  // Staff confirm payment
  if (interaction.customId.startsWith('confirm_payment_')) {
    await handlePaymentConfirmation(interaction);
    return;
  }
  
  // Staff close ticket
  if (interaction.customId.startsWith('close_ticket_')) {
    await handleTicketClose(interaction);
    return;
  }
});

// ============================================
// SELECT MENU HANDLER
// ============================================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  
  // Game selection
  if (interaction.customId.startsWith('select_game_')) {
    const userId = interaction.customId.replace('select_game_', '');
    if (userId !== interaction.user.id) return;
    
    const game = interaction.values[0];
    const tempProfile = client.tempProfiles.get(interaction.user.id);
    tempProfile.game = game;
    
    await interaction.update({ components: [] });
    
    // Ask for state
    const stateEmbed = new EmbedBuilder()
      .setColor('#2196F3')
      .setTitle('📍 Select Your State')
      .setDescription('Choose your state from the dropdown:');
    
    // Split states into chunks of 25 (Discord limit)
    const stateChunks = [];
    for (let i = 0; i < INDIAN_STATES.length; i += 25) {
      stateChunks.push(INDIAN_STATES.slice(i, i + 25));
    }
    
    const stateSelect = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_state_' + interaction.user.id)
          .setPlaceholder('Choose your state')
          .addOptions(
            stateChunks[0].map(state => ({ label: state, value: state }))
          )
      );
    
    await interaction.channel.send({ embeds: [stateEmbed], components: [stateSelect] });
    return;
  }
  
  // State selection
  if (interaction.customId.startsWith('select_state_')) {
    const userId = interaction.customId.replace('select_state_', '');
    if (userId !== interaction.user.id) return;
    
    const state = interaction.values[0];
    const tempProfile = client.tempProfiles.get(interaction.user.id);
    tempProfile.state = state;
    
    await interaction.update({ components: [] });
    
    // Ask for gender
    const genderEmbed = new EmbedBuilder()
      .setColor('#9C27B0')
      .setTitle('👤 Select Your Gender')
      .setDescription('Choose your gender:');
    
    const genderButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('gender_male_' + interaction.user.id)
          .setLabel('👨 Male')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('gender_female_' + interaction.user.id)
          .setLabel('👩 Female')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('gender_other_' + interaction.user.id)
          .setLabel('❓ Prefer not to say')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await interaction.channel.send({ embeds: [genderEmbed], components: [genderButtons] });
    return;
  }
});

// ============================================
// GENDER SELECTION HANDLER
// ============================================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  if (interaction.customId.startsWith('gender_')) {
    const parts = interaction.customId.split('_');
    const gender = parts[1];
    const userId = parts[2];
    
    if (userId !== interaction.user.id) return;
    
    const tempProfile = client.tempProfiles.get(interaction.user.id);
    tempProfile.gender = gender;
    
    await interaction.update({ components: [] });
    
    // Create profile
    const otoId = generateOTOID();
    const profileData = {
      name: tempProfile.name,
      game: tempProfile.game,
      state: tempProfile.state,
      gender: gender,
      otoId: otoId,
      createdAt: Date.now(),
      level: 1,
      stats: {
        wins: 0,
        played: 0,
        earned: 0,
        invites: 0
      },
      badges: []
    };
    
    saveUserProfile(interaction.user.id, profileData);
    client.tempProfiles.delete(interaction.user.id);
    
    // Send confirmation
    const confirmEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ PROFILE CREATED SUCCESSFULLY!')
      .setDescription(
        `Congratulations! Your OTO profile has been created! 🎉\n\n` +
        `**Your OTO ID:** ${otoId}\n\n` +
        `You can now access all channels and join tournaments! 🏆`
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Welcome to OTO Family!' })
      .setTimestamp();
    
    await interaction.channel.send({ embeds: [confirmEmbed] });
    
    // Assign player role and unlock server
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const member = await guild.members.fetch(interaction.user.id);
    const playerRole = guild.roles.cache.get(CONFIG.ROLES.PLAYER);
    
    if (playerRole) {
      await member.roles.add(playerRole);
    }
    
    // Post profile in profile channel
    const profileChannel = guild.channels.cache.get(CONFIG.CHANNELS.PROFILE);
    if (profileChannel) {
      const profileEmbed = createProfileEmbed(interaction.user, profileData);
      await profileChannel.send({ embeds: [profileEmbed] });
    }
    
    // Welcome announcement in general
    const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
    if (generalChannel) {
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎊 NEW PLAYER JOINED!')
        .setDescription(
          `Welcome ${interaction.user} to OTO Family! 🎉\n\n` +
          `**Name:** ${tempProfile.name}\n` +
          `**Game:** ${tempProfile.game.toUpperCase()}\n` +
          `**State:** ${tempProfile.state}\n` +
          `**OTO ID:** ${otoId}\n\n` +
          `Let's dominate the tournaments together! 🏆💪`
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      
      await generalChannel.send({ content: `${interaction.user}`, embeds: [welcomeEmbed] });
    }
    
    return;
  }
});

// ============================================
// TOURNAMENT SYSTEM
// ============================================

// Create tournament (Staff/Owner only)
async function createTournament(interaction, type) {
  // Verify permissions
  const member = interaction.member;
  const isAuthorized = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                       member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                       member.id === CONFIG.OWNER_ID;
  
  if (!isAuthorized) {
    await interaction.reply({ content: '❌ You do not have permission to create tournaments.', ephemeral: true });
    return;
  }
  
  if (type === 'quick') {
    // Quick create with template
    const templateEmbed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('⚡ Quick Tournament Templates')
      .setDescription('Select a template to create tournament quickly:');
    
    const templateSelect = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_tournament_template')
          .setPlaceholder('Choose tournament template')
          .addOptions([
            {
              label: 'Free Fire Solo - Quick Fire',
              value: 'ff_solo_quick',
              description: '12 slots, ₹50 entry, ₹500 prize',
              emoji: '🔥'
            },
            {
              label: 'Free Fire Squad - Mega Event',
              value: 'ff_squad_mega',
              description: '48 slots, ₹100 entry, ₹2000 prize',
              emoji: '💎'
            },
            {
              label: 'Minecraft - Free Practice',
              value: 'mc_free',
              description: 'Free entry, practice tournament',
              emoji: '⛏️'
            }
          ])
      );
    
    await interaction.reply({ embeds: [templateEmbed], components: [templateSelect], ephemeral: true });
    
  } else if (type === 'custom') {
    // Custom tournament creation modal
    const modal = new ModalBuilder()
      .setCustomId('custom_tournament_modal')
      .setTitle('Create Custom Tournament');
    
    const titleInput = new TextInputBuilder()
      .setCustomId('tournament_title')
      .setLabel('Tournament Title')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Friday Night Free Fire')
      .setRequired(true);
    
    const descInput = new TextInputBuilder()
      .setCustomId('tournament_description')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Epic tournament with amazing prizes!')
      .setRequired(false);
    
    const detailsInput = new TextInputBuilder()
      .setCustomId('tournament_details')
      .setLabel('Details (Format: slots,entry,prize,time,mode,map)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('12,50,500,8:00 PM,solo,bermuda')
      .setRequired(true);
    
    const prizeDistInput = new TextInputBuilder()
      .setCustomId('prize_distribution')
      .setLabel('Prize Distribution (Format: 1st:250,2nd:150,3rd:100)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('1st:250,2nd:150,3rd:100')
      .setRequired(true);
    
    const gameInput = new TextInputBuilder()
      .setCustomId('tournament_game')
      .setLabel('Game (freefire/minecraft)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('freefire')
      .setRequired(true);
    
    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descInput),
      new ActionRowBuilder().addComponents(detailsInput),
      new ActionRowBuilder().addComponents(prizeDistInput),
      new ActionRowBuilder().addComponents(gameInput)
    );
    
    await interaction.showModal(modal);
  }
}

// Handle tournament template selection
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  
  if (interaction.customId === 'select_tournament_template') {
    const template = interaction.values[0];
    let tournamentData = {};
    
    if (template === 'ff_solo_quick') {
      tournamentData = {
        title: 'Friday Night Free Fire',
        description: 'Quick Fire Solo Tournament',
        game: 'freefire',
        mode: 'solo',
        map: 'bermuda',
        maxSlots: 12,
        currentSlots: 0,
        entryFee: 50,
        prizePool: 500,
        time: '8:00 PM',
        prizeDistribution: {
          '1st': 250,
          '2nd': 150,
          '3rd': 100
        },
        participants: [],
        status: 'open',
        createdBy: interaction.user.id,
        createdAt: Date.now()
      };
    } else if (template === 'ff_squad_mega') {
      tournamentData = {
        title: 'Mega Squad Event',
        description: 'Epic Squad Tournament with Big Prizes!',
        game: 'freefire',
        mode: 'squad',
        map: 'bermuda',
        maxSlots: 48,
        currentSlots: 0,
        entryFee: 100,
        prizePool: 2000,
        time: '8:00 PM',
        prizeDistribution: {
          '1st': 1000,
          '2nd': 600,
          '3rd': 400
        },
        participants: [],
        status: 'open',
        createdBy: interaction.user.id,
        createdAt: Date.now()
      };
    } else if (template === 'mc_free') {
      tournamentData = {
        title: 'Minecraft Practice Tournament',
        description: 'Free entry practice tournament for all!',
        game: 'minecraft',
        mode: 'solo',
        map: 'survival',
        maxSlots: 20,
        currentSlots: 0,
        entryFee: 0,
        prizePool: 100,
        time: '6:00 PM',
        prizeDistribution: {
          '1st': 50,
          '2nd': 30,
          '3rd': 20
        },
        participants: [],
        status: 'open',
        createdBy: interaction.user.id,
        createdAt: Date.now()
      };
    }
    
    await postTournament(interaction, tournamentData);
  }
});

// Handle custom tournament modal
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  
  if (interaction.customId === 'custom_tournament_modal') {
    const title = interaction.fields.getTextInputValue('tournament_title');
    const description = interaction.fields.getTextInputValue('tournament_description') || 'Custom Tournament';
    const details = interaction.fields.getTextInputValue('tournament_details');
    const prizeDist = interaction.fields.getTextInputValue('prize_distribution');
    const game = interaction.fields.getTextInputValue('tournament_game').toLowerCase();
    
    // Parse details
    const [slots, entry, prize, time, mode, map] = details.split(',').map(s => s.trim());
    
    // Parse prize distribution
    const prizeDistribution = {};
    prizeDist.split(',').forEach(item => {
      const [place, amount] = item.split(':');
      prizeDistribution[place] = parseInt(amount);
    });
    
    const tournamentData = {
      title,
      description,
      game,
      mode,
      map,
      maxSlots: parseInt(slots),
      currentSlots: 0,
      entryFee: parseInt(entry),
      prizePool: parseInt(prize),
      time,
      prizeDistribution,
      participants: [],
      status: 'open',
      createdBy: interaction.user.id,
      createdAt: Date.now()
    };
    
    await postTournament(interaction, tournamentData);
  }
});

// Post tournament
async function postTournament(interaction, tournamentData) {
  const tournamentId = generateTournamentID();
  tournamentData.id = tournamentId;
  
  // Save tournament
  const tournaments = loadData('tournaments.json');
  tournaments[tournamentId] = tournamentData;
  saveData('tournaments.json', tournaments);
  
  // Create tournament embed
  const gameEmojis = { freefire: '🔥', minecraft: '⛏️', other: '🎮' };
  const statusEmojis = { open: '🟢', filling: '🟡', almost_full: '🟠', closed: '🔴', live: '⚫', completed: '✅' };
  
  const tournamentEmbed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`${gameEmojis[tournamentData.game] || '🎮'} ${tournamentData.title.toUpperCase()}`)
    .setDescription(
      `${tournamentData.description}\n\n` +
      `${statusEmojis[tournamentData.status]} Registration is now **OPEN!**`
    )
    .addFields(
      { name: '💰 Prize Pool', value: `₹${tournamentData.prizePool}`, inline: true },
      { name: '🎫 Entry Fee', value: `₹${tournamentData.entryFee}`, inline: true },
      { name: '📊 Slots', value: `${tournamentData.currentSlots}/${tournamentData.maxSlots}`, inline: true },
      { name: '⏰ Time', value: tournamentData.time, inline: true },
      { name: '🗺️ Map', value: tournamentData.map.toUpperCase(), inline: true },
      { name: '🎯 Mode', value: tournamentData.mode.toUpperCase(), inline: true }
    )
    .addFields({
      name: '🏆 Prize Distribution',
      value: Object.entries(tournamentData.prizeDistribution)
        .map(([place, amount]) => `${place === '1st' ? '🥇' : place === '2nd' ? '🥈' : place === '3rd' ? '🥉' : '🏅'} ${place}: ₹${amount}`)
        .join('\n')
    })
    .addFields({
      name: '🆔 Tournament ID',
      value: `\`${tournamentId}\``,
      inline: false
    })
    .setFooter({ text: 'Click JOIN NOW to participate!' })
    .setTimestamp();
  
  const joinButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`join_tournament_${tournamentId}`)
        .setLabel('🎮 JOIN NOW')
        .setStyle(ButtonStyle.Success)
    );
  
  // Post in tournament schedule
  const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
  const tournamentChannel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
  
  if (tournamentChannel) {
    const msg = await tournamentChannel.send({ embeds: [tournamentEmbed], components: [joinButton] });
    tournamentData.messageId = msg.id;
    tournaments[tournamentId] = tournamentData;
    saveData('tournaments.json', tournaments);
  }
  
  // Post in general
  const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
  if (generalChannel) {
    await generalChannel.send({
      content: `🚨 **NEW TOURNAMENT ALERT!** 🚨\n\nCheck <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> to join!`,
      embeds: [tournamentEmbed],
      components: [joinButton]
    });
  }
  
  await interaction.reply({ content: `✅ Tournament created successfully! ID: ${tournamentId}`, ephemeral: true });
}

// Handle tournament join
async function handleTournamentJoin(interaction, tournamentId) {
  const tournaments = loadData('tournaments.json');
  const tournament = tournaments[tournamentId];
  
  if (!tournament) {
    await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
    return;
  }
  
  if (tournament.status !== 'open') {
    await interaction.reply({ content: '❌ Registration is closed for this tournament!', ephemeral: true });
    return;
  }
  
  if (tournament.currentSlots >= tournament.maxSlots) {
    await interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
    return;
  }
  
  if (tournament.participants.includes(interaction.user.id)) {
    await interaction.reply({ content: '❌ You have already joined this tournament!', ephemeral: true });
    return;
  }
  
  // Create private registration ticket
  const guild = interaction.guild;
  const ticketCategory = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY);
  
  const ticketChannel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: ticketCategory,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: CONFIG.ROLES.STAFF,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: tournament.createdBy,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }
    ]
  });
  
  // Save ticket data
  const tickets = loadData('tickets.json');
  tickets[ticketChannel.id] = {
    userId: interaction.user.id,
    tournamentId: tournamentId,
    type: 'registration',
    createdAt: Date.now()
  };
  saveData('tickets.json', tickets);
  
  // Send ticket welcome message
  const ticketEmbed = new EmbedBuilder()
    .setColor('#4CAF50')
    .setTitle('🎫 TOURNAMENT REGISTRATION')
    .setDescription(
      `Welcome ${interaction.user}! 👋\n\n` +
      `**Tournament:** ${tournament.title}\n` +
      `**Entry Fee:** ₹${tournament.entryFee}\n\n` +
      `Please provide the following:\n` +
      `1️⃣ Your **In-Game ID (IGN)**\n` +
      `2️⃣ Payment screenshot (if entry fee required)\n\n` +
      `Staff will verify and confirm your entry! ✅`
    )
    .setFooter({ text: `Tournament ID: ${tournamentId}` })
    .setTimestamp();
  
  await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.ROLES.STAFF}>`, embeds: [ticketEmbed] });
  
  // Generate payment QR if entry fee exists
  if (tournament.entryFee > 0) {
    const paymentEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💳 PAYMENT INFORMATION')
      .setDescription(
        `**Amount to Pay:** ₹${tournament.entryFee}\n\n` +
        `**Payment Methods:**\n` +
        `• UPI ID: \`oto@upi\`\n` +
        `• Phone Pay / Google Pay\n\n` +
        `After payment, upload screenshot here! 📸`
      )
      .setFooter({ text: 'Payment verification is required' });
    
    await ticketChannel.send({ embeds: [paymentEmbed] });
  }
  
  // Staff action buttons
  const actionButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_payment_${ticketChannel.id}`)
        .setLabel('✅ Confirm Entry')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`close_ticket_${ticketChannel.id}`)
        .setLabel('❌ Close Ticket')
        .setStyle(ButtonStyle.Danger)
    );
  
  await ticketChannel.send({ content: '**Staff Actions:**', components: [actionButtons] });
  
  await interaction.reply({ 
    content: `✅ Registration ticket created! Check ${ticketChannel}`, 
    ephemeral: true 
  });
}

// Handle payment confirmation
async function handlePaymentConfirmation(interaction) {
  const ticketId = interaction.customId.replace('confirm_payment_', '');
  
  // Verify staff permission
  const member = interaction.member;
  const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                  member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                  member.id === CONFIG.OWNER_ID;
  
  if (!isStaff) {
    await interaction.reply({ content: '❌ Only staff can confirm payments!', ephemeral: true });
    return;
  }
  
  const tickets = loadData('tickets.json');
  const ticket = tickets[ticketId];
  
  if (!ticket) {
    await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
    return;
  }
  
  const tournaments = loadData('tournaments.json');
  const tournament = tournaments[ticket.tournamentId];
  
  // Add participant
  tournament.participants.push(ticket.userId);
  tournament.currentSlots++;
  
  // Update tournament status
  const fillPercentage = (tournament.currentSlots / tournament.maxSlots) * 100;
  if (fillPercentage >= 80) {
    tournament.status = 'almost_full';
  } else if (fillPercentage >= 50) {
    tournament.status = 'filling';
  }
  
  if (tournament.currentSlots >= tournament.maxSlots) {
    tournament.status = 'closed';
  }
  
  tournaments[ticket.tournamentId] = tournament;
  saveData('tournaments.json', tournaments);
  
  // Update tournament message
  await updateTournamentMessage(tournament);
  
  // Confirm to user
  const user = await client.users.fetch(ticket.userId);
  const confirmEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ ENTRY CONFIRMED!')
    .setDescription(
      `Congratulations! Your entry has been confirmed! 🎉\n\n` +
      `**Tournament:** ${tournament.title}\n` +
      `**Your Slot:** ${tournament.currentSlots}/${tournament.maxSlots}\n\n` +
      `You will be moved to the lobby soon where room details will be shared! 🎮`
    )
    .setFooter({ text: `Tournament ID: ${tournament.id}` })
    .setTimestamp();
  
  await user.send({ embeds: [confirmEmbed] });
  await interaction.channel.send({ embeds: [confirmEmbed] });
  
  await interaction.reply({ content: '✅ Payment confirmed! User added to tournament.', ephemeral: true });
  
  // Close ticket after 10 seconds
  setTimeout(async () => {
    await interaction.channel.delete();
    delete tickets[ticketId];
    saveData('tickets.json', tickets);
  }, 10000);
}

// Update tournament message
async function updateTournamentMessage(tournament) {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    const message = await channel.messages.fetch(tournament.messageId);
    
    const gameEmojis = { freefire: '🔥', minecraft: '⛏️', other: '🎮' };
    const statusEmojis = { open: '🟢', filling: '🟡', almost_full: '🟠', closed: '🔴', live: '⚫', completed: '✅' };
    
    const updatedEmbed = new EmbedBuilder()
      .setColor(tournament.status === 'closed' ? '#FF0000' : '#FF6B6B')
      .setTitle(`${gameEmojis[tournament.game] || '🎮'} ${tournament.title.toUpperCase()}`)
      .setDescription(
        `${tournament.description}\n\n` +
        `${statusEmojis[tournament.status]} Registration is now **${tournament.status.toUpperCase()}!**`
      )
      .addFields(
        { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
        { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
        { name: '📊 Slots', value: `${tournament.currentSlots}/${tournament.maxSlots}`, inline: true },
        { name: '⏰ Time', value: tournament.time, inline: true },
        { name: '🗺️ Map', value: tournament.map.toUpperCase(), inline: true },
        { name: '🎯 Mode', value: tournament.mode.toUpperCase(), inline: true }
      )
      .addFields({
        name: '🏆 Prize Distribution',
        value: Object.entries(tournament.prizeDistribution)
          .map(([place, amount]) => `${place === '1st' ? '🥇' : place === '2nd' ? '🥈' : place === '3rd' ? '🥉' : '🏅'} ${place}: ₹${amount}`)
          .join('\n')
      })
      .addFields({
        name: '🆔 Tournament ID',
        value: `\`${tournament.id}\``,
        inline: false
      })
      .setFooter({ text: 'Click JOIN NOW to participate!' })
      .setTimestamp();
    
    const joinButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`join_tournament_${tournament.id}`)
          .setLabel(tournament.status === 'closed' ? '🔴 FULL' : '🎮 JOIN NOW')
          .setStyle(tournament.status === 'closed' ? ButtonStyle.Danger : ButtonStyle.Success)
          .setDisabled(tournament.status === 'closed')
      );
    
    await message.edit({ embeds: [updatedEmbed], components: [joinButton] });
  } catch (error) {
    console.error('Error updating tournament message:', error);
  }
}

// Handle ticket close
async function handleTicketClose(interaction) {
  const ticketId = interaction.customId.replace('close_ticket_', '');
  
  // Verify staff permission
  const member = interaction.member;
  const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                  member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                  member.id === CONFIG.OWNER_ID;
  
  if (!isStaff) {
    await interaction.reply({ content: '❌ Only staff can close tickets!', ephemeral: true });
    return;
  }
  
  await interaction.reply({ content: '🔄 Closing ticket in 5 seconds...', ephemeral: false });
  
  setTimeout(async () => {
    const tickets = loadData('tickets.json');
    delete tickets[ticketId];
    saveData('tickets.json', tickets);
    await interaction.channel.delete();
  }, 5000);
}

// Handle free match request
async function handleFreeMatchRequest(interaction) {
  const guild = interaction.guild || await client.guilds.fetch(CONFIG.GUILD_ID);
  const ticketCategory = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY);
  
  const ticketChannel = await guild.channels.create({
    name: `free-match-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: ticketCategory,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: CONFIG.ROLES.STAFF,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }
    ]
  });
  
  const freeMatchEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('⚔️ FREE MATCH REQUEST')
    .setDescription(
      `${interaction.user} has requested a free match challenge! 🎮\n\n` +
      `**Challenge Details:**\n` +
      `• Best of 3 matches\n` +
      `• Player needs to win 1 match\n` +
      `• Reward: FREE tournament entry\n` +
      `• Game: Free Fire or Minecraft\n\n` +
      `Staff, please arrange the match and update here!`
    )
    .setFooter({ text: 'Invite Reward Match' })
    .setTimestamp();
  
  const closeButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`close_ticket_${ticketChannel.id}`)
        .setLabel('❌ Close Ticket')
        .setStyle(ButtonStyle.Danger)
    );
  
  await ticketChannel.send({ 
    content: `${interaction.user} <@&${CONFIG.ROLES.STAFF}>`, 
    embeds: [freeMatchEmbed],
    components: [closeButton]
  });
  
  await interaction.reply({ 
    content: `✅ Free match request created! Check ${ticketChannel}`, 
    ephemeral: true 
  });
}

// ============================================
// LEADERBOARD SYSTEM
// ============================================
async function updateLeaderboards(guild) {
  const leaderboardChannel = guild.channels.cache.get(CONFIG.CHANNELS.LEADERBOARD);
  if (!leaderboardChannel) return;
  
  const profiles = loadData('profiles.json');
  const invitesData = loadData('invites.json');
  const badges = loadData('badges.json');
  
  // Most Active Players (by games played)
  const mostActive = Object.entries(profiles)
    .sort((a, b) => b[1].stats.played - a[1].stats.played)
    .slice(0, 10);
  
  // Most Wins
  const mostWins = Object.entries(profiles)
    .sort((a, b) => b[1].stats.wins - a[1].stats.wins)
    .slice(0, 10);
  
  // Most Earnings
  const mostEarnings = Object.entries(profiles)
    .sort((a, b) => b[1].stats.earned - a[1].stats.earned)
    .slice(0, 10);
  
  // Most Invites
  const mostInvites = Object.entries(invitesData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);
  
  // Create embeds
  const activeEmbed = new EmbedBuilder()
    .setColor('#4CAF50')
    .setTitle('🎮 MOST ACTIVE PLAYERS')
    .setDescription(
      mostActive.map((entry, i) => {
        const [userId, profile] = entry;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${i + 1}. **${profile.name}** ${badge}\n   Games Played: ${profile.stats.played}`;
      }).join('\n\n') || 'No data yet'
    )
    .setTimestamp();
  
  const winsEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🏆 TOP WINNERS')
    .setDescription(
      mostWins.map((entry, i) => {
        const [userId, profile] = entry;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${i + 1}. **${profile.name}** ${badge}\n   Wins: ${profile.stats.wins}`;
      }).join('\n\n') || 'No data yet'
    )
    .setTimestamp();
  
  const earningsEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 TOP EARNERS')
    .setDescription(
      mostEarnings.map((entry, i) => {
        const [userId, profile] = entry;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${i + 1}. **${profile.name}** ${badge}\n   Earned: ₹${profile.stats.earned}`;
      }).join('\n\n') || 'No data yet'
    )
    .setTimestamp();
  
  const invitesEmbed = new EmbedBuilder()
    .setColor('#9C27B0')
    .setTitle('👥 TOP RECRUITERS')
    .setDescription(
      await Promise.all(mostInvites.map(async (entry, i) => {
        const [userId, data] = entry;
        try {
          const user = await client.users.fetch(userId);
          return `${i + 1}. **${user.username}**\n   Invites: ${data.total} (Active: ${data.active})`;
        } catch {
          return '';
        }
      })).then(arr => arr.filter(Boolean).join('\n\n')) || 'No data yet'
    )
    .setTimestamp();
  
  // Clear channel and post new leaderboards
  const messages = await leaderboardChannel.messages.fetch({ limit: 100 });
  await leaderboardChannel.bulkDelete(messages);
  
  await leaderboardChannel.send({ embeds: [activeEmbed] });
  await leaderboardChannel.send({ embeds: [winsEmbed] });
  await leaderboardChannel.send({ embeds: [earningsEmbed] });
  await leaderboardChannel.send({ embeds: [invitesEmbed] });
}

// Update invite tracker
async function updateInviteTracker(guild) {
  const inviteChannel = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
  if (!inviteChannel) return;
  
  const invitesData = loadData('invites.json');
  
  const topInvites = Object.entries(invitesData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);
  
  const inviteEmbed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle('📊 INVITE LEADERBOARD')
    .setDescription(
      '**Top Recruiters:**\n\n' +
      await Promise.all(topInvites.map(async (entry, i) => {
        const [userId, data] = entry;
        try {
          const user = await client.users.fetch(userId);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          return `${medal} **${user.username}**\n   Total: ${data.total} | Active: ${data.active} | Fake: ${data.fake}`;
        } catch {
          return '';
        }
      })).then(arr => arr.filter(Boolean).join('\n\n')) || 'No invites yet'
    )
    .addFields({
      name: '🎁 Rewards',
      value: '5 invites → FREE match challenge\n10 invites → 1 FREE entry\n20 invites → 50% discount + role'
    })
    .setFooter({ text: 'Updates every hour' })
    .setTimestamp();
  
  const messages = await inviteChannel.messages.fetch({ limit: 10 });
  const existingMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
  
  if (existingMessage) {
    await existingMessage.edit({ embeds: [inviteEmbed] });
  } else {
    await inviteChannel.send({ embeds: [inviteEmbed] });
  }
}

// Auto-update leaderboards every hour
setInterval(async () => {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    await updateLeaderboards(guild);
    await updateInviteTracker(guild);
  } catch (error) {
    console.error('Error updating leaderboards:', error);
  }
}, 3600000); // 1 hour

// ============================================
// STAFF TOOLS
// ============================================
async function pinStaffToolsGuide(guild) {
  const staffChannel = guild.channels.cache.get(CONFIG.CHANNELS.STAFF_TOOLS);
  if (!staffChannel) return;
  
  const guideEmbed = new EmbedBuilder()
    .setColor('#2196F3')
    .setTitle('🛠️ OTO STAFF COMMANDS QUICK GUIDE')
    .setDescription('Complete command list for staff members:')
    .addFields(
      {
        name: '🎯 TOURNAMENT MANAGEMENT',
        value: 
          '`/tournament-create` - Create new tournament\n' +
          '`/tournament-manage` - Edit/cancel tournaments\n' +
          '`/tournament-start [id]` - Start tournament\n' +
          '`/tournament-list` - View all tournaments'
      },
      {
        name: '👥 PLAYER MANAGEMENT',
        value: 
          '`/payment-confirm` - Confirm payment (use in tickets)\n' +
          '`/ticket-close` - Close support ticket\n' +
          '`/user-profile @user` - View user profile\n' +
          '`/user-stats @user` - View user statistics'
      },
      {
        name: '⚡ MODERATION',
        value: 
          '`/user-warn @user [reason]` - Warn user\n' +
          '`/user-timeout @user [minutes]` - Timeout user\n' +
          '`/user-untimeout @user` - Remove timeout\n' +
          '`/user-ban @user [reason]` - Ban user'
      },
      {
        name: '🏆 WINNER DECLARATION',
        value: 
          '`/winner-declare [tournament] @user [position]` - Declare winner\n' +
          '`/badge-give @user [badge]` - Give badge to user\n' +
          '`/prize-distribute [tournament]` - Distribute prizes'
      },
      {
        name: '📊 ANALYTICS',
        value: 
          '`/server-stats` - View server statistics\n' +
          '`/tournament-report [id]` - Tournament report\n' +
          '`/user-invites @user` - Check invite count'
      }
    )
    .setFooter({ text: 'Use these commands to manage OTO Tournaments efficiently!' })
    .setTimestamp();
  
  const messages = await staffChannel.messages.fetch({ limit: 10 });
  const existingMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
  
  if (existingMessage) {
    await existingMessage.edit({ embeds: [guideEmbed] });
    await existingMessage.pin();
  } else {
    const msg = await staffChannel.send({ embeds: [guideEmbed] });
    await msg.pin();
  }
}

// ============================================
// OWNER TOOLS
// ============================================
async function pinOwnerToolsGuide(guild) {
  const ownerChannel = guild.channels.cache.get(CONFIG.CHANNELS.OWNER_TOOLS);
  if (!ownerChannel) return;
  
  const guideEmbed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('👑 OWNER CONTROL PANEL')
    .setDescription('Exclusive commands for server owner:')
    .addFields(
      {
        name: '👥 STAFF MANAGEMENT',
        value: 
          '`/owner-staff-add @user` - Add new staff member\n' +
          '`/owner-staff-remove @user` - Remove staff member\n' +
          '`/owner-staff-list` - View all staff\n' +
          '`/owner-staff-stats @user` - Staff performance'
      },
      {
        name: '📢 BROADCAST SYSTEM',
        value: 
          '`/owner-broadcast [message]` - Announce to all channels\n' +
          '`/owner-dm-all [message]` - DM all members\n' +
          '`/owner-notify-winners` - Notify tournament winners'
      },
      {
        name: '📊 ANALYTICS & REPORTS',
        value: 
          '`/owner-stats` - Detailed server analytics\n' +
          '`/owner-revenue` - Total revenue report\n' +
          '`/owner-user-growth` - User growth statistics'
      },
      {
        name: '🚨 EMERGENCY CONTROLS',
        value: 
          '`/owner-lockdown` - Emergency server lockdown\n' +
          '`/owner-maintenance [on/off]` - Bot maintenance mode\n' +
          '`/owner-reset [type]` - Reset specific data'
      },
      {
        name: '🎮 TOURNAMENT FEATURES',
        value: 
          '`/owner-tournament-followsubscribe` - Enable follow/subscribe reminder\n' +
          '`/owner-auto-create-tournament` - Schedule recurring tournaments'
      }
    )
    .setFooter({ text: 'Owner commands - Use with care!' })
    .setTimestamp();
  
  const messages = await ownerChannel.messages.fetch({ limit: 10 });
  const existingMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
  
  if (existingMessage) {
    await existingMessage.edit({ embeds: [guideEmbed] });
    await existingMessage.pin();
  } else {
    const msg = await ownerChannel.send({ embeds: [guideEmbed] });
    await msg.pin();
  }
}

// ============================================
// SLASH COMMANDS REGISTRATION
// ============================================
client.on('ready', async () => {
  const commands = [
    // User Commands
    {
      name: 'profile',
      description: 'View your profile',
    },
    {
      name: 'invites',
      description: 'Check your invite statistics',
    },
    {
      name: 'help',
      description: 'Get help guide',
    },
    
    // Staff Commands
    {
      name: 'tournament-create',
      description: 'Create a new tournament (Staff only)',
      options: [
        {
          name: 'type',
          description: 'Tournament creation type',
          type: 3,
          required: true,
          choices: [
            { name: 'Quick Create (Templates)', value: 'quick' },
            { name: 'Custom Create', value: 'custom' }
          ]
        }
      ]
    },
    {
      name: 'tournament-list',
      description: 'View all tournaments (Staff only)',
    },
    {
      name: 'user-warn',
      description: 'Warn a user (Staff only)',
      options: [
        {
          name: 'user',
          description: 'User to warn',
          type: 6,
          required: true
        },
        {
          name: 'reason',
          description: 'Warning reason',
          type: 3,
          required: true
        }
      ]
    },
    {
      name: 'user-timeout',
      description: 'Timeout a user (Staff only)',
      options: [
        {
          name: 'user',
          description: 'User to timeout',
          type: 6,
          required: true
        },
        {
          name: 'minutes',
          description: 'Timeout duration in minutes',
          type: 4,
          required: true
        },
        {
          name: 'reason',
          description: 'Timeout reason',
          type: 3,
          required: false
        }
      ]
    },
    {
      name: 'user-untimeout',
      description: 'Remove timeout from user (Staff only)',
      options: [
        {
          name: 'user',
          description: 'User to untimeout',
          type: 6,
          required: true
        }
      ]
    },
    {
      name: 'winner-declare',
      description: 'Declare tournament winner (Staff only)',
      options: [
        {
          name: 'tournament',
          description: 'Tournament ID',
          type: 3,
          required: true
        },
        {
          name: 'user',
          description: 'Winner',
          type: 6,
          required: true
        },
        {
          name: 'position',
          description: 'Position (1st, 2nd, 3rd, 4th)',
          type: 3,
          required: true,
          choices: [
            { name: '1st Place', value: '1st' },
            { name: '2nd Place', value: '2nd' },
            { name: '3rd Place', value: '3rd' },
            { name: '4th Place', value: '4th' }
          ]
        }
      ]
    },
    
    // Owner Commands
    {
      name: 'owner-staff-add',
      description: 'Add a staff member (Owner only)',
      options: [
        {
          name: 'user',
          description: 'User to add as staff',
          type: 6,
          required: true
        }
      ]
    },
    {
      name: 'owner-staff-remove',
      description: 'Remove a staff member (Owner only)',
      options: [
        {
          name: 'user',
          description: 'Staff member to remove',
          type: 6,
          required: true
        }
      ]
    },
    {
      name: 'owner-broadcast',
      description: 'Broadcast message to all channels (Owner only)',
      options: [
        {
          name: 'message',
          description: 'Message to broadcast',
          type: 3,
          required: true
        }
      ]
    },
    {
      name: 'owner-stats',
      description: 'View detailed server statistics (Owner only)',
    },
    {
      name: 'owner-lockdown',
      description: 'Emergency server lockdown (Owner only)',
    },
    {
      name: 'owner-maintenance',
      description: 'Toggle bot maintenance mode (Owner only)',
      options: [
        {
          name: 'status',
          description: 'Maintenance status',
          type: 3,
          required: true,
          choices: [
            { name: 'ON', value: 'on' },
            { name: 'OFF', value: 'off' }
          ]
        }
      ]
    }
  ];
  
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    await guild.commands.set(commands);
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

// ============================================
// SLASH COMMAND HANDLER
// ============================================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const { commandName } = interaction;
  
  // User Commands
  if (commandName === 'profile') {
    const profile = getUserProfile(interaction.user.id);
    if (!profile) {
      await interaction.reply({ content: '❌ You don\'t have a profile yet! Complete profile creation first.', ephemeral: true });
      return;
    }
    
    const profileEmbed = createProfileEmbed(interaction.user, profile);
    await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
    return;
  }
  
  if (commandName === 'invites') {
    const invitesData = loadData('invites.json');
    const userData = invitesData[interaction.user.id] || { total: 0, active: 0, fake: 0 };
    
    const nextMilestone = userData.total < 5 ? 5 : userData.total < 10 ? 10 : userData.total < 20 ? 20 : 50;
    const remaining = nextMilestone - userData.total;
    
    const inviteEmbed = new EmbedBuilder()
      .setColor('#9C27B0')
      .setTitle('📊 YOUR INVITE STATISTICS')
      .setDescription(`Hey ${interaction.user.username}! Here are your invite stats:`)
      .addFields(
        { name: '👥 Total Invites', value: `${userData.total}`, inline: true },
        { name: '✅ Active Invites', value: `${userData.active}`, inline: true },
        { name: '❌ Fake/Left', value: `${userData.fake}`, inline: true },
        { name: '🎯 Next Reward', value: `${remaining} more invites to reach ${nextMilestone}`, inline: false }
      )
      .setFooter({ text: 'Keep inviting to unlock rewards!' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [inviteEmbed], ephemeral: true });
    return;
  }
  
  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#4CAF50')
      .setTitle('📚 OTO TOURNAMENTS - HELP GUIDE')
      .setDescription('Everything you need to know about OTO Tournaments!')
      .addFields(
        {
          name: '🎮 How to Join Tournaments',
          value: '1. Complete your profile\n2. Check <#' + CONFIG.CHANNELS.TOURNAMENT_SCHEDULE + '>\n3. Click "JOIN NOW"\n4. Provide IGN and payment\n5. Win prizes!'
        },
        {
          name: '🎁 Invite Rewards',
          value: '• 5 invites → FREE match vs Pro\n• 10 invites → 1 FREE entry\n• 20 invites → 50% discount'
        },
        {
          name: '📊 Commands',
          value: '`/profile` - View your profile\n`/invites` - Check invite stats\n`/help` - This message'
        },
        {
          name: '❓ Need Support?',
          value: 'Ask in support channel or DM staff members!'
        }
      )
      .setFooter({ text: 'OTO Tournaments - Win Big, Play Fair!' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    return;
  }
  
  // Staff Commands
  const member = interaction.member;
  const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                  member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                  member.id === CONFIG.OWNER_ID;
  
  if (commandName === 'tournament-create') {
    if (!isStaff) {
      await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
      return;
    }
    
    const type = interaction.options.getString('type');
    await createTournament(interaction, type);
    return;
  }
  
  if (commandName === 'tournament-list') {
    if (!isStaff) {
      await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
      return;
    }
    
    const tournaments = loadData('tournaments.json');
    const activeTournaments = Object.entries(tournaments).filter(([id, t]) => 
      t.status === 'open' || t.status === 'filling' || t.status === 'almost_full'
    );
    
    if (activeTournaments.length === 0) {
      await interaction.reply({ content: '📋 No active tournaments at the moment.', ephemeral: true });
      return;
    }
    
    const listEmbed = new EmbedBuilder()
      .setColor('#2196F3')
      .setTitle('📋 ACTIVE TOURNAMENTS')
      .setDescription(
        activeTournaments.map(([id, t]) => 
          `**${t.title}**\nID: \`${id}\`\nSlots: ${t.currentSlots}/${t.maxSlots} | Status: ${t.status.toUpperCase()}`
        ).join('\n\n')
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [listEmbed], ephemeral: true });
    return;
  }
  
  if (commandName === 'user-warn') {
    if (!isStaff) {
      await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
      return;
    }
    
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    
    // Check if target is staff/owner
    const targetMember = await interaction.guild.members.fetch(user.id);
    const isTargetProtected = targetMember.roles.cache.has(CONFIG.ROLES.STAFF) || 
                              targetMember.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                              user.id === CONFIG.OWNER_ID;
    
    if (isTargetProtected) {
      await interaction.reply({ content: '❌ You cannot warn staff members or the owner!', ephemeral: true });
      return;
    }
    
    const warningsData = loadData('warnings.json');
    if (!warningsData[user.id]) {
      warningsData[user.id] = { warnings: 0, history: [] };
    }
    
    warningsData[user.id].warnings++;
    warningsData[user.id].history.push({
      type: 'manual',
      reason: reason,
      issuedBy: interaction.user.id,
      timestamp: Date.now()
    });
    
    saveData('warnings.json', warningsData);
    
    await user.send(`⚠️ **WARNING** from ${interaction.guild.name}\n**Reason:** ${reason}\n**Total Warnings:** ${warningsData[user.id].warnings}`);
    await interaction.reply({ content: `✅ ${user} has been warned. Total warnings: ${warningsData[user.id].warnings}`, ephemeral: true });
    return;
  }
  
  if (commandName === 'user-timeout') {
    if (!isStaff) {
      await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
      return;
    }
    
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const targetMember = await interaction.guild.members.fetch(user.id);
    const isTargetProtected = targetMember.roles.cache.has(CONFIG.ROLES.STAFF) || 
                              targetMember.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                              user.id === CONFIG.OWNER_ID;
    
    if (isTargetProtected) {
      await interaction.reply({ content: '❌ You cannot timeout staff members or the owner!', ephemeral: true });
      return;
    }
    
    await targetMember.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({ content: `✅ ${user} has been timed out for ${minutes} minutes.\nReason: ${reason}`, ephemeral: true });
    return;
  }
  
  if (commandName === 'user-untimeout') {
    if (!isStaff) {
      await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
      return;
    }
    
    const user = interaction.options.getUser('user');
    const targetMember = await interaction.guild.members.fetch(user.id);
    
    await targetMember.timeout(null);
    await interaction.reply({ content: `✅ Timeout removed from ${user}`, ephemeral: true });
    return;
  }
  
  if (commandName === 'winner-declare') {
    if (!isStaff) {
      await interaction.reply({ content: '❌ You do not have permission to use this command!', ephemeral: true });
      return;
    }
    
    const tournamentId = interaction.options.getString('tournament');
    const winner = interaction.options.getUser('user');
    const position = interaction.options.getString('position');
    
    const tournaments = loadData('tournaments.json');
    const tournament = tournaments[tournamentId];
    
    if (!tournament) {
      await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
      return;
    }
    
    const prizeAmount = tournament.prizeDistribution[position];
    
    // Update user profile
    const profile = getUserProfile(winner.id);
    if (profile) {
      profile.stats.wins++;
      profile.stats.earned += prizeAmount;
      
      // Add badge
      const badgeEmoji = position === '1st' ? '🥇' : position === '2nd' ? '🥈' : position === '3rd' ? '🥉' : '🏅';
      if (!profile.badges.includes(badgeEmoji)) {
        profile.badges.push(badgeEmoji);
      }
      
      saveUserProfile(winner.id, profile);
    }
    
    // Winner announcement
    const winnerEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${position === '1st' ? '🥇' : position === '2nd' ? '🥈' : position === '3rd' ? '🥉' : '🏅'} TOURNAMENT WINNER!`)
      .setDescription(
        `**Tournament:** ${tournament.title}\n` +
        `**Winner:** ${winner}\n` +
        `**Position:** ${position}\n` +
        `**Prize:** ₹${prizeAmount}\n\n` +
        `Congratulations! 🎉🎊`
      )
      .setThumbnail(winner.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: `Tournament ID: ${tournamentId}` })
      .setTimestamp();
    
    const generalChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
    if (generalChannel) {
      await generalChannel.send({ content: `🎉 ${winner}`, embeds: [winnerEmbed] });
    }
    
    // DM winner
    await winner.send({ embeds: [winnerEmbed] });
    
    // DM all lobby participants with follow/subscribe reminder
    const settings = loadData('settings.json');
    if (settings.followSubscribeEnabled) {
      for (const participantId of tournament.participants) {
        if (participantId !== winner.id) {
          try {
            const participant = await client.users.fetch(participantId);
            const reminderEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('📢 SUPPORT OTO TOURNAMENTS!')
              .setDescription(
                `Thanks for participating in **${tournament.title}**! 🎮\n\n` +
                `**Please support us by:**\n` +
                `📺 Subscribe to our YouTube channel\n` +
                `👥 Follow us on social media\n\n` +
                `More tournaments coming soon! 🔥`
              )
              .setFooter({ text: 'OTO Tournaments' })
              .setTimestamp();
            
            await participant.send({ embeds: [reminderEmbed] });
          } catch (error) {
            console.log(`Could not DM participant ${participantId}`);
          }
        }
      }
    }
    
    await interaction.reply({ content: `✅ Winner declared successfully! ${winner} won ${position} place and ₹${prizeAmount}`, ephemeral: true });
    
    // Update leaderboards
    await updateLeaderboards(interaction.guild);
    return;
  }
  
  // Owner Commands
  const isOwner = interaction.user.id === CONFIG.OWNER_ID;
  
  if (commandName === 'owner-staff-add') {
    if (!isOwner) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const user = interaction.options.getUser('user');
    const targetMember = await interaction.guild.members.fetch(user.id);
    const staffRole = interaction.guild.roles.cache.get(CONFIG.ROLES.STAFF);
    
    await targetMember.roles.add(staffRole);
    
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 WELCOME TO OTO STAFF TEAM!')
      .setDescription(
        `Hey ${user}! 👋\n\n` +
        `You've been added to the OTO staff team! 🛠️\n\n` +
        `**Your Responsibilities:**\n` +
        `• Manage tournaments\n` +
        `• Verify payments\n` +
        `• Help users\n` +
        `• Moderate chat\n\n` +
        `**Work hard and make OTO great!** 💪`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'OTO Staff Team' })
      .setTimestamp();
    
    await user.send({ embeds: [welcomeEmbed] });
    await interaction.reply({ content: `✅ ${user} has been added to the staff team!`, ephemeral: true });
    return;
  }
  
  if (commandName === 'owner-staff-remove') {
    if (!isOwner) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const user = interaction.options.getUser('user');
    const targetMember = await interaction.guild.members.fetch(user.id);
    const staffRole = interaction.guild.roles.cache.get(CONFIG.ROLES.STAFF);
    
    await targetMember.roles.remove(staffRole);
    await interaction.reply({ content: `✅ ${user} has been removed from the staff team.`, ephemeral: true });
    return;
  }
  
  if (commandName === 'owner-broadcast') {
    if (!isOwner) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const message = interaction.options.getString('message');
    
    const broadcastEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📢 ANNOUNCEMENT FROM OTO TOURNAMENTS')
      .setDescription(message)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: 'Official OTO Announcement' })
      .setTimestamp();
    
    const channels = [
      CONFIG.CHANNELS.GENERAL,
      CONFIG.CHANNELS.ANNOUNCEMENT,
      CONFIG.CHANNELS.TOURNAMENT_SCHEDULE
    ];
    
    let sent = 0;
    for (const channelId of channels) {
      try {
        const channel = interaction.guild.channels.cache.get(channelId);
        if (channel) {
          await channel.send({ embeds: [broadcastEmbed] });
          sent++;
        }
      } catch (error) {
        console.error(`Could not send to channel ${channelId}`);
      }
    }
    
    await interaction.reply({ content: `✅ Broadcast sent to ${sent} channels!`, ephemeral: true });
    return;
  }
  
  if (commandName === 'owner-stats') {
    if (!isOwner) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const profiles = loadData('profiles.json');
    const tournaments = loadData('tournaments.json');
    const invitesData = loadData('invites.json');
    
    const totalUsers = Object.keys(profiles).length;
    const totalTournaments = Object.keys(tournaments).length;
    const activeTournaments = Object.values(tournaments).filter(t => t.status === 'open' || t.status === 'filling').length;
    const completedTournaments = Object.values(tournaments).filter(t => t.status === 'completed').length;
    
    const totalRevenue = Object.values(tournaments).reduce((sum, t) => {
      return sum + (t.entryFee * t.currentSlots);
    }, 0);
    
    const totalPrizesGiven = Object.values(profiles).reduce((sum, p) => {
      return sum + p.stats.earned;
    }, 0);
    
    const totalInvites = Object.values(invitesData).reduce((sum, i) => sum + i.total, 0);
    
    const statsEmbed = new EmbedBuilder()
      .setColor('#9C27B0')
      .setTitle('📊 OTO TOURNAMENTS - SERVER STATISTICS')
      .setDescription('Detailed analytics and performance metrics:')
      .addFields(
        {
          name: '👥 USER STATISTICS',
          value: 
            `Total Users: **${totalUsers}**\n` +
            `Total Invites: **${totalInvites}**\n` +
            `Active Users: **${Object.values(profiles).filter(p => p.stats.played > 0).length}**`
        },
        {
          name: '🎮 TOURNAMENT STATISTICS',
          value: 
            `Total Tournaments: **${totalTournaments}**\n` +
            `Active: **${activeTournaments}**\n` +
            `Completed: **${completedTournaments}**`
        },
        {
          name: '💰 FINANCIAL STATISTICS',
          value: 
            `Total Revenue: **₹${totalRevenue}**\n` +
            `Total Prizes Given: **₹${totalPrizesGiven}**\n` +
            `Profit: **₹${totalRevenue - totalPrizesGiven}**`
        },
        {
          name: '🏆 TOP PERFORMERS',
          value: 
            `Most Wins: **${Object.values(profiles).sort((a, b) => b.stats.wins - a.stats.wins)[0]?.name || 'N/A'}**\n` +
            `Most Earned: **${Object.values(profiles).sort((a, b) => b.stats.earned - a.stats.earned)[0]?.name || 'N/A'}**\n` +
            `Most Active: **${Object.values(profiles).sort((a, b) => b.stats.played - a.stats.played)[0]?.name || 'N/A'}**`
        }
      )
      .setFooter({ text: 'Generated at' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
    return;
  }
  
  if (commandName === 'owner-lockdown') {
    if (!isOwner) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const channels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
    
    for (const [id, channel] of channels) {
      try {
        await channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: false
        });
      } catch (error) {
        console.error(`Could not lock ${channel.name}`);
      }
    }
    
    const lockdownEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🚨 EMERGENCY LOCKDOWN ACTIVATED')
      .setDescription(
        '**The server is now in lockdown mode!**\n\n' +
        'All channels have been locked.\n' +
        'Only staff can send messages.\n\n' +
        'This is a temporary measure for server safety.'
      )
      .setFooter({ text: 'OTO Tournaments - Emergency Mode' })
      .setTimestamp();
    
    const generalChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
    if (generalChannel) {
      await generalChannel.send({ embeds: [lockdownEmbed] });
    }
    
    await interaction.reply({ content: '✅ Server lockdown activated! All channels locked.', ephemeral: true });
    return;
  }
  
  if (commandName === 'owner-maintenance') {
    if (!isOwner) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const status = interaction.options.getString('status');
    const settings = loadData('settings.json');
    
    settings.maintenanceMode = status === 'on';
    saveData('settings.json', settings);
    
    if (status === 'on') {
      const maintenanceEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🛠️ MAINTENANCE MODE ACTIVATED')
        .setDescription(
          '**OTO Bot is now in maintenance mode!**\n\n' +
          'Some features may be temporarily unavailable.\n' +
          'We\'ll be back soon! ⏰'
        )
        .setFooter({ text: 'OTO Tournaments' })
        .setTimestamp();
      
      const generalChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
      if (generalChannel) {
        await generalChannel.send({ embeds: [maintenanceEmbed] });
      }
      
      await interaction.reply({ content: '✅ Maintenance mode activated!', ephemeral: true });
    } else {
      await interaction.reply({ content: '✅ Maintenance mode deactivated! Bot is now operational.', ephemeral: true });
    }
    return;
  }
});

// ============================================
// ADDITIONAL OWNER FEATURES
// ============================================

// Enable/Disable Follow & Subscribe Feature
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'owner-tournament-followsubscribe') {
    if (interaction.user.id !== CONFIG.OWNER_ID) {
      await interaction.reply({ content: '❌ Only the owner can use this command!', ephemeral: true });
      return;
    }
    
    const settings = loadData('settings.json');
    settings.followSubscribeEnabled = !settings.followSubscribeEnabled;
    saveData('settings.json', settings);
    
    await interaction.reply({ 
      content: `✅ Follow/Subscribe reminder is now **${settings.followSubscribeEnabled ? 'ENABLED' : 'DISABLED'}**!`, 
      ephemeral: true 
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

// ============================================
// AUTO-SAVE SYSTEM
// ============================================
setInterval(() => {
  console.log('💾 Auto-saving data...');
  // Data is already saved on each operation
  // This is just a heartbeat log
}, 300000); // Every 5 minutes

// ============================================
// MAINTENANCE MODE CHECK
// ============================================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const settings = loadData('settings.json');
  if (settings.maintenanceMode) {
    const isOwner = message.author.id === CONFIG.OWNER_ID;
    const isStaff = message.member?.roles.cache.has(CONFIG.ROLES.STAFF) || 
                    message.member?.roles.cache.has(CONFIG.ROLES.ADMIN);
    
    if (!isOwner && !isStaff) {
      await message.delete();
      const maintenanceMsg = await message.channel.send('🛠️ Bot is currently in maintenance mode. Please try again later!');
      setTimeout(() => maintenanceMsg.delete(), 5000);
    }
  }
});

// ============================================
// WELCOME NEW STAFF MEMBERS
// ============================================
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const staffRole = newMember.guild.roles.cache.get(CONFIG.ROLES.STAFF);
  
  // Check if staff role was added
  if (!oldMember.roles.cache.has(staffRole?.id) && newMember.roles.cache.has(staffRole?.id)) {
    const staffChannel = newMember.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_TOOLS);
    if (staffChannel) {
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎉 NEW STAFF MEMBER!')
        .setDescription(
          `Welcome ${newMember} to the OTO Staff Team! 🛠️\n\n` +
          `**Work hard and help us grow!** 💪\n\n` +
          `Check pinned messages for command guide.`
        )
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      
      await staffChannel.send({ embeds: [welcomeEmbed] });
    }
  }
});

// ============================================
// SUPPORT TICKET MONITORING
// ============================================
setInterval(async () => {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const tickets = loadData('tickets.json');
    
    for (const [ticketId, ticketData] of Object.entries(tickets)) {
      const channel = guild.channels.cache.get(ticketId);
      if (!channel) continue;
      
      const messages = await channel.messages.fetch({ limit: 10 });
      const lastStaffMessage = messages.find(m => {
        const member = guild.members.cache.get(m.author.id);
        return member?.roles.cache.has(CONFIG.ROLES.STAFF) || 
               member?.roles.cache.has(CONFIG.ROLES.ADMIN) ||
               m.author.id === CONFIG.OWNER_ID;
      });
      
      // If no staff reply in last 10 messages
      if (!lastStaffMessage) {
        const staffChannel = guild.channels.cache.get(CONFIG.CHANNELS.STAFF_TOOLS);
        if (staffChannel) {
          await staffChannel.send(
            `🎫 **Ticket Alert!**\n<@&${CONFIG.ROLES.STAFF}> Please check ${channel} - User needs assistance!`
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in ticket monitoring:', error);
  }
}, 600000); // Check every 10 minutes

// ============================================
// BOT LOGIN
// ============================================
client.login(CONFIG.TOKEN).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});
