```name=index.js
const express = require('express');
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

// Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('OTO Tournament Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  TOKEN: process.env.DISCORD_BOT_TOKEN,
  GUILD_ID: process.env.GUILD_ID || 'YOUR_GUILD_ID_HERE',
  
  CHANNELS: {
    GENERAL: '1438482904018849835',
    ANNOUNCEMENT: '1438484746165555243',
    PROFILE: '1439542574066176020',
    TOURNAMENT_SCHEDULE: '1438482561679626303',
    INVITE_TRACKER: '1439216884774998107',
    LEADERBOARD: '1438947356690223347',
    STAFF_TOOLS: '1438486059255336970',
    OWNER_TOOLS: '1439218596877308005',
    MINECRAFT_CHAT: '1439223955960627421',
    WELCOME_CHANNEL: '1441653083120603187',
    SUPPORT: '1438485759891079180',
    TICKET_LOG: '1438485821572518030',
    MOD_LOG: '1438506342938706092',
    TICKET_CATEGORY: process.env.TICKET_CATEGORY_ID || 'YOUR_TICKET_CATEGORY_ID',
    HOW_TO_JOIN: '1438482512296022017',
    RULES_CHANNEL: '1438482342145687643',
    BOT_COMMANDS: '1438483009950191676',
    OPEN_TICKET: '1438485759891079180',
    MATCH_REPORTS: '1438486113047150714',
    PAYMENT_PROOF: '1438486113047150714',
    PLAYER_FORM: '1438486008453660863',
    STAFF_CHAT: '1438486059255336970',
    MOST_PLAYER_LB: '1439226024863993988',
    CELEBRATION: '1441653083120603187',
    ACHIEVEMENTS: '1439226024863993988'
  },
  
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
  
  OWNER_ID: process.env.OWNER_ID || 'YOUR_OWNER_ID_HERE'
};

// ============================================
// DATA MANAGEMENT
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dataFiles = {
  profiles: 'profiles.json',
  tournaments: 'tournaments.json',
  tickets: 'tickets.json',
  invites: 'invites.json',
  warnings: 'warnings.json',
  leaderboard: 'leaderboard.json',
  settings: 'settings.json',
  badges: 'badges.json',
  lobbies: 'lobbies.json',
  customRoles: 'custom_roles.json',
  staffApps: 'staff_applications.json',
  achievements: 'achievements.json',
  reminders: 'reminders.json'
};

Object.entries(dataFiles).forEach(([key, filename]) => {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify({}));
  }
});

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
// ACHIEVEMENTS SYSTEM
// ============================================
const ACHIEVEMENTS = {
  FIRST_WIN: { name: 'First Victory', emoji: '🏆', description: 'Win your first tournament' },
  FIVE_WINS: { name: 'Veteran', emoji: '⭐', description: 'Win 5 tournaments' },
  TEN_WINS: { name: 'Champion', emoji: '👑', description: 'Win 10 tournaments' },
  TWENTY_WINS: { name: 'Legend', emoji: '💎', description: 'Win 20 tournaments' },
  FIRST_INVITE: { name: 'Recruiter', emoji: '👥', description: 'Invite your first member' },
  TEN_INVITES: { name: 'Super Recruiter', emoji: '🌟', description: 'Invite 10 members' },
  FIFTY_INVITES: { name: 'Elite Recruiter', emoji: '💫', description: 'Invite 50 members' },
  HUNDRED_INVITES: { name: 'Legendary Recruiter', emoji: '✨', description: 'Invite 100 members' },
  FIRST_TOURNAMENT: { name: 'Beginner', emoji: '🎮', description: 'Join your first tournament' },
  TEN_TOURNAMENTS: { name: 'Active Player', emoji: '🔥', description: 'Join 10 tournaments' },
  FIFTY_TOURNAMENTS: { name: 'Dedicated Player', emoji: '⚡', description: 'Join 50 tournaments' },
  HUNDRED_TOURNAMENTS: { name: 'Tournament Master', emoji: '🎯', description: 'Join 100 tournaments' },
  FIRST_EARNING: { name: 'Money Maker', emoji: '💰', description: 'Earn your first prize' },
  THOUSAND_EARNED: { name: 'Rich Player', emoji: '💵', description: 'Earn ₹1000 total' },
  FIVE_THOUSAND_EARNED: { name: 'Big Winner', emoji: '💸', description: 'Earn ₹5000 total' }
};

// ============================================
// BAD WORDS FILTER
// ============================================
const BAD_WORDS = ['badword1', 'badword2', 'spam', 'scam'];

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

function generateOTOID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'OTO';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

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

function createProfileEmbed(user, profileData) {
  const gameEmojis = { freefire: '🔥', minecraft: '⛏️', other: '🎮' };
  const genderEmoji = profileData.gender === 'male' ? '👨' : profileData.gender === 'female' ? '👩' : '❓';
  
  const achievementsText = profileData.achievements && profileData.achievements.length > 0
    ? profileData.achievements.slice(0, 5).map(a => ACHIEVEMENTS[a]?.emoji || '').join(' ')
    : 'No achievements yet';
  
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
    .addFields({ name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━' })
    .addFields(
      { name: '📊 STATS', value: 
        `🏆 Wins: ${profileData.stats.wins}\n` +
        `🎮 Played: ${profileData.stats.played}\n` +
        `💰 Earned: ₹${profileData.stats.earned}\n` +
        `👥 Invites: ${profileData.stats.invites}`,
        inline: true
      },
      { name: '⭐ Level', value: `Level ${profileData.level} (${profileData.badges.join(' ') || 'New Player'})`, inline: true }
    )
    .addFields({ name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━' })
    .addFields({ name: '🏅 Achievements', value: achievementsText, inline: false })
    .setFooter({ text: `Joined: ${new Date(profileData.createdAt).toLocaleDateString()}` })
    .setTimestamp();
}

function hasProfile(userId) {
  const profiles = loadData('profiles.json');
  return !!profiles[userId];
}

function getUserProfile(userId) {
  const profiles = loadData('profiles.json');
  return profiles[userId] || null;
}

function saveUserProfile(userId, data) {
  const profiles = loadData('profiles.json');
  profiles[userId] = data;
  saveData('profiles.json', profiles);
}

function containsBadWords(message) {
  const lowerMessage = message.toLowerCase();
  return BAD_WORDS.some(word => lowerMessage.includes(word));
}

const userMessages = new Map();
function isSpamming(userId) {
  const now = Date.now();
  const userMsgs = userMessages.get(userId) || [];
  const recentMsgs = userMsgs.filter(time => now - time < 5000);
  recentMsgs.push(now);
  userMessages.set(userId, recentMsgs);
  return recentMsgs.length > 5;
}

async function logToChannel(guild, channelId, embed) {
  try {
    const channel = guild.channels.cache.get(channelId);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Failed to log to channel ${channelId}:`, error.message);
  }
}

// ============================================
// ACHIEVEMENT SYSTEM FUNCTIONS
// ============================================
async function checkAndAwardAchievements(userId, guild) {
  const profile = getUserProfile(userId);
  if (!profile) return;
  
  if (!profile.achievements) profile.achievements = [];
  
  const newAchievements = [];
  
  // Check win-based achievements
  if (profile.stats.wins === 1 && !profile.achievements.includes('FIRST_WIN')) {
    newAchievements.push('FIRST_WIN');
  }
  if (profile.stats.wins === 5 && !profile.achievements.includes('FIVE_WINS')) {
    newAchievements.push('FIVE_WINS');
  }
  if (profile.stats.wins === 10 && !profile.achievements.includes('TEN_WINS')) {
    newAchievements.push('TEN_WINS');
  }
  if (profile.stats.wins === 20 && !profile.achievements.includes('TWENTY_WINS')) {
    newAchievements.push('TWENTY_WINS');
  }
  
  // Check invite-based achievements
  if (profile.stats.invites === 1 && !profile.achievements.includes('FIRST_INVITE')) {
    newAchievements.push('FIRST_INVITE');
  }
  if (profile.stats.invites === 10 && !profile.achievements.includes('TEN_INVITES')) {
    newAchievements.push('TEN_INVITES');
  }
  if (profile.stats.invites === 50 && !profile.achievements.includes('FIFTY_INVITES')) {
    newAchievements.push('FIFTY_INVITES');
  }
  if (profile.stats.invites === 100 && !profile.achievements.includes('HUNDRED_INVITES')) {
    newAchievements.push('HUNDRED_INVITES');
  }
  
  // Check tournament participation achievements
  if (profile.stats.played === 1 && !profile.achievements.includes('FIRST_TOURNAMENT')) {
    newAchievements.push('FIRST_TOURNAMENT');
  }
  if (profile.stats.played === 10 && !profile.achievements.includes('TEN_TOURNAMENTS')) {
    newAchievements.push('TEN_TOURNAMENTS');
  }
  if (profile.stats.played === 50 && !profile.achievements.includes('FIFTY_TOURNAMENTS')) {
    newAchievements.push('FIFTY_TOURNAMENTS');
  }
  if (profile.stats.played === 100 && !profile.achievements.includes('HUNDRED_TOURNAMENTS')) {
    newAchievements.push('HUNDRED_TOURNAMENTS');
  }
  
  // Check earnings-based achievements
  if (profile.stats.earned >= 1 && !profile.achievements.includes('FIRST_EARNING')) {
    newAchievements.push('FIRST_EARNING');
  }
  if (profile.stats.earned >= 1000 && !profile.achievements.includes('THOUSAND_EARNED')) {
    newAchievements.push('THOUSAND_EARNED');
  }
  if (profile.stats.earned >= 5000 && !profile.achievements.includes('FIVE_THOUSAND_EARNED')) {
    newAchievements.push('FIVE_THOUSAND_EARNED');
  }
  
  // Award new achievements
  for (const achievementKey of newAchievements) {
    profile.achievements.push(achievementKey);
    const achievement = ACHIEVEMENTS[achievementKey];
    
    try {
      const user = await client.users.fetch(userId);
      const achievementEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 ACHIEVEMENT UNLOCKED!')
        .setDescription(
          `╔═══════════════════════════╗\n` +
          `    ${achievement.emoji} **${achievement.name}** ${achievement.emoji}\n` +
          `╚═══════════════════════════╝\n\n` +
          `**${achievement.description}**\n\n` +
          `Congratulations on this milestone! 🎊\n` +
          `Keep playing and unlock more achievements!`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ text: 'OTO Achievements' })
        .setTimestamp();
      
      await user.send({ embeds: [achievementEmbed] });
      
      // Announce in celebration channel
      const celebrationChannel = guild.channels.cache.get(CONFIG.CHANNELS.CELEBRATION);
      if (celebrationChannel) {
        await celebrationChannel.send({
          content: `🎉 ${user} unlocked **${achievement.name}**! ${achievement.emoji}`,
          embeds: [achievementEmbed]
        });
      }
    } catch (error) {
      console.log('Could not send achievement notification');
    }
  }
  
  saveUserProfile(userId, profile);
}

// ============================================
// SINGLE READY HANDLER
// ============================================
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  
  console.log('\n📋 Bot is currently in these servers:');
  client.guilds.cache.forEach(guild => {
    console.log(`   - ${guild.name} (ID: ${guild.id})`);
  });
  
  if (client.guilds.cache.size === 0) {
    console.error('\n❌ ERROR: Bot is not in any servers!');
    return;
  }
  
  let targetGuild;
  if (!CONFIG.GUILD_ID || CONFIG.GUILD_ID === 'YOUR_GUILD_ID_HERE') {
    targetGuild = client.guilds.cache.first();
    console.log(`\n⚠️  GUILD_ID not set. Using: ${targetGuild.name} (${targetGuild.id})`);
  } else {
    targetGuild = client.guilds.cache.get(CONFIG.GUILD_ID);
  }

  if (!targetGuild) {
    console.error(`\n❌ ERROR: Cannot find guild with ID: ${CONFIG.GUILD_ID}`);
    return;
  }

  const guild = targetGuild;
  console.log(`\n🎯 Working with server: ${guild.name}`);

  try {
    // Setup announcement message
    await setupAnnouncementMessage(guild);
    
    // Setup panels
    await pinStaffToolsGuide(guild);
    await pinOwnerToolsGuide(guild);
    
    // Setup bot commands channel
    await setupBotCommandsChannel(guild);
    
    // Update leaderboards
    await updateLeaderboards(guild);
    
    // Setup support tickets & staff applications
    await setupSupportTickets(guild);
    await setupStaffApplications(guild);
    
    console.log('\n🚀 Bot is fully operational!\n');
    
  } catch (error) {
    console.error('❌ Error in ready event:', error.message);
  }
});

// ============================================
// INTERACTION HANDLER (ALL-IN-ONE)
// ============================================
client.on('interactionCreate', async (interaction) => {
  try {
    // SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      
      // Basic commands
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
      
      if (commandName === 'achievements') {
        const profile = getUserProfile(interaction.user.id);
        if (!profile) {
          await interaction.reply({ content: '❌ You don\'t have a profile yet!', ephemeral: true });
          return;
        }
        
        const userAchievements = profile.achievements || [];
        const achievementsList = userAchievements.map(key => {
          const achievement = ACHIEVEMENTS[key];
          return `${achievement.emoji} **${achievement.name}**\n   ${achievement.description}`;
        }).join('\n\n') || 'No achievements unlocked yet. Keep playing!';
        
        const totalAchievements = Object.keys(ACHIEVEMENTS).length;
        const progress = ((userAchievements.length / totalAchievements) * 100).toFixed(1);
        
        const achievementsEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🏅 YOUR ACHIEVEMENTS')
          .setDescription(
            `**Progress:** ${userAchievements.length}/${totalAchievements} (${progress}%)\n\n` +
            achievementsList
          )
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: 'Keep playing to unlock more achievements!' })
          .setTimestamp();
        
        await interaction.reply({ embeds: [achievementsEmbed], ephemeral: true });
        return;
      }
      
      if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('📚 OTO TOURNAMENTS - HELP GUIDE')
          .setDescription('Everything you need to know!')
          .addFields(
            {
              name: '🎮 How to Join Tournaments',
              value: '1. Complete profile\n2. Check <#' + CONFIG.CHANNELS.TOURNAMENT_SCHEDULE + '>\n3. Click JOIN NOW\n4. Provide IGN and payment\n5. Win prizes!'
            },
            {
              name: '🎁 Invite Rewards',
              value: '• 5 invites → FREE match vs Pro\n• 10 invites → 1 FREE entry\n• 20 invites → 50% discount\n• 50 invites → 5 FREE entries'
            },
            {
              name: '🏅 Achievements',
              value: 'Unlock badges by winning tournaments, inviting friends, and being active!'
            },
            {
              name: '📊 Commands',
              value: '`/profile` - View profile\n`/invites` - Check invites\n`/achievements` - View achievements\n`/help` - This message'
            }
          )
          .setFooter({ text: 'OTO Tournaments' })
          .setTimestamp();
        
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
        return;
      }
      
      // Staff/Owner checks
      const member = interaction.member;
      const isStaff = member?.roles?.cache?.has(CONFIG.ROLES.STAFF) || 
                      member?.roles?.cache?.has(CONFIG.ROLES.ADMIN) ||
                      interaction.user.id === CONFIG.OWNER_ID;
      
      // Tournament create (slash)
      if (commandName === 'tournament-create') {
        if (!isStaff) {
          await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
          return;
        }
        const type = interaction.options.getString('type');
        await createTournament(interaction, type);
        return;
      }
      
      if (commandName === 'tournament-list') {
        if (!isStaff) {
          await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
          return;
        }
        
        const tournaments = loadData('tournaments.json');
        const activeTournaments = Object.entries(tournaments).filter(([id, t]) => 
          t.status === 'open' || t.status === 'filling' || t.status === 'almost_full'
        );
        
        if (activeTournaments.length === 0) {
          await interaction.reply({ content: '📋 No active tournaments.', ephemeral: true });
          return;
        }
        
        const listEmbed = new EmbedBuilder()
          .setColor('#2196F3')
          .setTitle('📋 ACTIVE TOURNAMENTS')
          .setDescription(
            activeTournaments.map(([id, t]) => 
              `**${t.title}**\nID: \`${id}\`\nSlots: ${t.currentSlots}/${t.maxSlots}`
            ).join('\n\n')
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [listEmbed], ephemeral: true });
        return;
      }
      
      // Moderation commands handled similarly as in original file
      // ... (for brevity this handler keeps the main commands implemented above)
      // Additional command handling (owner actions, etc.) is implemented further down in this file
    }

    // BUTTONS
    if (interaction.isButton()) {
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
      
      if (interaction.customId === 'start_profile_creation') {
        await interaction.reply({ content: '📝 Let\'s create your profile! What\'s your name? (Reply in this channel)', ephemeral: true });
        
        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
        
        collector.on('collect', async (nameMsg) => {
          const name = nameMsg.content.trim();
          
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
                  { label: 'Other Games', value: 'other', emoji: '🎮' }
                ])
            );
          
          await interaction.channel.send({ embeds: [gameEmbed], components: [gameSelect] });
          
          client.tempProfiles = client.tempProfiles || new Map();
          client.tempProfiles.set(interaction.user.id, { name });
        });
        return;
      }
      
      // Owner manage roles panel
      if (interaction.customId === 'owner_manage_roles') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can manage roles!', ephemeral: true });
          return;
        }
        
        const customRoles = loadData('custom_roles.json');
        const rolesList = Object.entries(customRoles).map(([roleId, data]) => 
          `• <@&${roleId}> - ${data.members.length} members`
        ).join('\n') || 'No custom roles yet';
        
        const rolesEmbed = new EmbedBuilder()
          .setColor('#9C27B0')
          .setTitle('🎭 CUSTOM ROLES MANAGEMENT')
          .setDescription(rolesList)
          .setFooter({ text: 'Use buttons below to manage roles' })
          .setTimestamp();
        
        const roleButtons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('create_custom_role')
              .setLabel('➕ Create Role')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('list_custom_roles')
              .setLabel('📋 List Roles')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('assign_custom_role')
              .setLabel('👤 Assign Role')
              .setStyle(ButtonStyle.Secondary)
          );
        
        const roleButtons2 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('remove_custom_role_user')
              .setLabel('❌ Remove from Role')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('delete_custom_role')
              .setLabel('🗑️ Delete Role')
              .setStyle(ButtonStyle.Danger)
          );
        
        await interaction.reply({ embeds: [rolesEmbed], components: [roleButtons, roleButtons2], ephemeral: true });
        return;
      }
      
      // create/list/assign/remove/delete custom roles (owner-only) open modals handled in modal submit section
      if (interaction.customId === 'create_custom_role' || interaction.customId === 'assign_custom_role' || interaction.customId === 'remove_custom_role_user' || interaction.customId === 'delete_custom_role') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can manage roles!', ephemeral: true });
          return;
        }
        if (interaction.customId === 'create_custom_role') {
          const modal = new ModalBuilder()
            .setCustomId('create_role_modal')
            .setTitle('Create Custom Role');
          
          const roleNameInput = new TextInputBuilder()
            .setCustomId('role_name')
            .setLabel('Role Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter role name')
            .setRequired(true);
          
          const roleColorInput = new TextInputBuilder()
            .setCustomId('role_color')
            .setLabel('Role Color (hex code)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('#FF0000')
            .setRequired(true);
          
          modal.addComponents(
            new ActionRowBuilder().addComponents(roleNameInput),
            new ActionRowBuilder().addComponents(roleColorInput)
          );
          
          await interaction.showModal(modal);
          return;
        } else if (interaction.customId === 'assign_custom_role' || interaction.customId === 'remove_custom_role_user') {
          const modal = new ModalBuilder()
            .setCustomId(interaction.customId === 'assign_custom_role' ? 'assign_role_modal' : 'remove_role_modal')
            .setTitle(interaction.customId === 'assign_custom_role' ? 'Assign Custom Role' : 'Remove User from Role');
          
          const userIdInput = new TextInputBuilder()
            .setCustomId('user_id')
            .setLabel('User ID')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter user ID')
            .setRequired(true);
          
          const roleIdInput = new TextInputBuilder()
            .setCustomId('role_id')
            .setLabel('Role ID')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter role ID')
            .setRequired(true);
          
          modal.addComponents(
            new ActionRowBuilder().addComponents(userIdInput),
            new ActionRowBuilder().addComponents(roleIdInput)
          );
          
          await interaction.showModal(modal);
          return;
        } else if (interaction.customId === 'delete_custom_role') {
          const modal = new ModalBuilder()
            .setCustomId('delete_role_modal')
            .setTitle('Delete Custom Role');
          
          const roleIdInput = new TextInputBuilder()
            .setCustomId('role_id')
            .setLabel('Role ID to Delete')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter role ID')
            .setRequired(true);
          
          modal.addComponents(new ActionRowBuilder().addComponents(roleIdInput));
          await interaction.showModal(modal);
          return;
        }
      }
      
      // Tournament join / management buttons
      if (interaction.customId.startsWith('join_tournament_')) {
        const tournamentId = interaction.customId.replace('join_tournament_', '');
        await handleTournamentJoin(interaction, tournamentId);
        return;
      }
      
      if (interaction.customId.startsWith('set_room_')) {
        const tournamentId = interaction.customId.replace('set_room_', '');
        const member = interaction.member;
        const isStaffBtn = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                    member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                    member.id === CONFIG.OWNER_ID;
        if (!isStaffBtn) {
          await interaction.reply({ content: '❌ Only staff can set room details!', ephemeral: true });
          return;
        }
        const modal = new ModalBuilder()
          .setCustomId(`room_modal_${tournamentId}`)
          .setTitle('Set Room Details');
        
        const roomIdInput = new TextInputBuilder()
          .setCustomId('room_id')
          .setLabel('Room ID')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter Room ID')
          .setRequired(true);
        
        const passwordInput = new TextInputBuilder()
          .setCustomId('room_password')
          .setLabel('Room Password')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter Password')
          .setRequired(true);
        
        modal.addComponents(
          new ActionRowBuilder().addComponents(roomIdInput),
          new ActionRowBuilder().addComponents(passwordInput)
        );
        
        await interaction.showModal(modal);
        return;
      }
      
      if (interaction.customId.startsWith('start_match_')) {
        const tournamentId = interaction.customId.replace('start_match_', '');
        const member = interaction.member;
        const isStaffBtn = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                        member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                        member.id === CONFIG.OWNER_ID;
        if (!isStaffBtn) {
          await interaction.reply({ content: '❌ Only staff can start match!', ephemeral: true });
          return;
        }
        const lobbies = loadData('lobbies.json');
        const lobby = lobbies[tournamentId];
        
        if (!lobby || !lobby.roomId || !lobby.password) {
          await interaction.reply({ content: '❌ Please set room details first!', ephemeral: true });
          return;
        }
        
        const tournaments = loadData('tournaments.json');
        const tournament = tournaments[tournamentId];
        
        if (!tournament) {
          await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
          return;
        }
        
        // Update tournament status
        tournament.status = 'live';
        tournaments[tournamentId] = tournament;
        saveData('tournaments.json', tournaments);
        
        const startEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎮 MATCH STARTING NOW!')
          .setDescription(
            `**All players, join the room immediately!**\n\n` +
            `🔑 **Room ID:** \`${lobby.roomId}\`\n` +
            `🔐 **Password:** \`${lobby.password}\`\n\n` +
            `⏰ **Join within 5 minutes or you'll be disqualified!**\n` +
            `📱 **Make sure you're ready!**\n\n` +
            `**Good luck to all players!** 🏆`
          )
          .setFooter({ text: 'OTO Tournaments - Match Started' })
          .setTimestamp();
        
        // Notify all participants
        for (const participantId of tournament.participants) {
          try {
            const participant = await client.users.fetch(participantId);
            await participant.send({ embeds: [startEmbed] });
          } catch (error) {
            console.log(`Could not notify ${participantId}`);
          }
        }
        
        await interaction.channel.send({ content: '@everyone', embeds: [startEmbed] });
        await interaction.reply({ content: '✅ Match started! Room details shared with all players!', ephemeral: true });
        return;
      }
      
      // Ticket related buttons
      if (interaction.customId.startsWith('close_ticket_')) {
        await handleTicketClose(interaction);
        return;
      }
      
      if (interaction.customId.startsWith('confirm_payment_') || interaction.customId.startsWith('confirm_entry_')) {
        const ticketId = interaction.customId.replace('confirm_payment_', '').replace('confirm_entry_', '');
        await handlePaymentConfirmation(interaction, ticketId);
        return;
      }
      
      if (interaction.customId === 'request_free_match') {
        await handleFreeMatchRequest(interaction);
        return;
      }
      
      // Owner / staff panels (owner_view_stats, owner_broadcast, staff_create_tournament, etc.)
      if (interaction.customId === 'staff_create_tournament') {
        const memberBtn = interaction.member;
        const isStaffBtn = memberBtn.roles.cache.has(CONFIG.ROLES.STAFF) || 
                        memberBtn.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                        memberBtn.id === CONFIG.OWNER_ID;
        
        if (!isStaffBtn) {
          await interaction.reply({ content: '❌ Only staff can use this!', ephemeral: true });
          return;
        }
        
        await createTournament(interaction, 'quick');
        return;
      }
      
      if (interaction.customId === 'staff_list_tournaments') {
        const memberBtn = interaction.member;
        const isStaffBtn = memberBtn.roles.cache.has(CONFIG.ROLES.STAFF) || 
                        memberBtn.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                        memberBtn.id === CONFIG.OWNER_ID;
        if (!isStaffBtn) {
          await interaction.reply({ content: '❌ Only staff can use this!', ephemeral: true });
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
              `**${t.title}**\nID: \`${id}\`\nSlots: ${t.currentSlots}/${t.maxSlots} | Status: ${t.status.toUpperCase()}\nTime: ${t.time}`
            ).join('\n\n')
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [listEmbed], ephemeral: true });
        return;
      }
      
      // Owner actions: view stats, view players, manage staff, broadcast, staff applications toggle, clear support, maintenance
      if (interaction.customId === 'owner_view_stats' || interaction.customId === 'owner_view_players' || interaction.customId === 'owner_manage_staff' || interaction.customId === 'owner_broadcast' || interaction.customId === 'owner_staff_applications' || interaction.customId === 'owner_clear_support' || interaction.customId === 'owner_maintenance' || interaction.customId === 'owner_staff_applications') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can use this!', ephemeral: true });
          return;
        }
        // For command-like operations, prefer slash commands. For brevity, reply with ephemeral acknowledgement here.
        await interaction.reply({ content: '✅ Owner action acknowledged. Use owner slash commands for more control.', ephemeral: true });
        return;
      }
    }

    // SELECT MENUS
    if (interaction.isStringSelectMenu()) {
      // Game select for profile creation
      if (interaction.customId.startsWith('select_game_')) {
        const userId = interaction.customId.replace('select_game_', '');
        if (userId !== interaction.user.id) return;
        
        const game = interaction.values[0];
        client.tempProfiles = client.tempProfiles || new Map();
        const tempProfile = client.tempProfiles.get(interaction.user.id) || {};
        tempProfile.game = game;
        client.tempProfiles.set(interaction.user.id, tempProfile);
        
        await interaction.update({ components: [] }).catch(()=>{});
        
        const stateEmbed = new EmbedBuilder()
          .setColor('#2196F3')
          .setTitle('📍 Select Your State')
          .setDescription('Choose your state from the dropdown:');
        
        const stateSelect = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_state_' + interaction.user.id)
              .setPlaceholder('Choose your state')
              .addOptions(
                INDIAN_STATES.slice(0, 25).map(state => ({ label: state, value: state }))
              )
          );
        
        await interaction.channel.send({ embeds: [stateEmbed], components: [stateSelect] });
        return;
      }
      
      if (interaction.customId.startsWith('select_state_')) {
        const userId = interaction.customId.replace('select_state_', '');
        if (userId !== interaction.user.id) return;
        
        const state = interaction.values[0];
        client.tempProfiles = client.tempProfiles || new Map();
        const tempProfile = client.tempProfiles.get(interaction.user.id) || {};
        tempProfile.state = state;
        client.tempProfiles.set(interaction.user.id, tempProfile);
        
        await interaction.update({ components: [] }).catch(()=>{});
        
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
            prizeDistribution: { '1st': 250, '2nd': 150, '3rd': 100 },
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
            prizeDistribution: { '1st': 1000, '2nd': 600, '3rd': 400 },
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
            prizeDistribution: { '1st': 50, '2nd': 30, '3rd': 20 },
            participants: [],
            status: 'open',
            createdBy: interaction.user.id,
            createdAt: Date.now()
          };
        }
        
        await postTournament(interaction, tournamentData);
        return;
      }
      
      if (interaction.customId === 'broadcast_channel_select') {
        const selectedChannels = interaction.values;
        client.broadcastChannels = client.broadcastChannels || new Map();
        client.broadcastChannels.set(interaction.user.id, selectedChannels);
        
        const modal = new ModalBuilder()
          .setCustomId('broadcast_modal')
          .setTitle('Broadcast Message');
        
        const messageInput = new TextInputBuilder()
          .setCustomId('broadcast_message')
          .setLabel('Message to broadcast')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Enter your announcement...')
          .setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
        return;
      }
    }

    // MODAL SUBMITS
    if (interaction.isModalSubmit()) {
      // ROLE MODALS
      if (interaction.customId === 'create_role_modal') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can create roles!', ephemeral: true });
          return;
        }
        
        const roleName = interaction.fields.getTextInputValue('role_name');
        const roleColor = interaction.fields.getTextInputValue('role_color');
        
        try {
          const guild = interaction.guild;
          const newRole = await guild.roles.create({
            name: roleName,
            color: roleColor,
            reason: `Custom role created by ${interaction.user.tag}`
          });
          
          const customRoles = loadData('custom_roles.json');
          customRoles[newRole.id] = {
            name: roleName,
            color: roleColor,
            createdBy: interaction.user.id,
            createdAt: Date.now(),
            members: []
          };
          saveData('custom_roles.json', customRoles);
          
          await interaction.reply({ 
            content: `✅ Role <@&${newRole.id}> created successfully!\nRole ID: \`${newRole.id}\``, 
            ephemeral: true 
          });
        } catch (error) {
          await interaction.reply({ content: `❌ Error creating role: ${error.message}`, ephemeral: true });
        }
        return;
      }
      
      if (interaction.customId === 'assign_role_modal') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can assign roles!', ephemeral: true });
          return;
        }
        
        const userId = interaction.fields.getTextInputValue('user_id');
        const roleId = interaction.fields.getTextInputValue('role_id');
        
        try {
          const guild = interaction.guild;
          const member = await guild.members.fetch(userId);
          const role = guild.roles.cache.get(roleId);
          
          if (!role) {
            await interaction.reply({ content: '❌ Role not found!', ephemeral: true });
            return;
          }
          
          await member.roles.add(role);
          
          const customRoles = loadData('custom_roles.json');
          if (customRoles[roleId]) {
            if (!customRoles[roleId].members.includes(userId)) {
              customRoles[roleId].members.push(userId);
              saveData('custom_roles.json', customRoles);
            }
          }
          
          await interaction.reply({ content: `✅ Assigned <@&${roleId}> to <@${userId}>!`, ephemeral: true });
        } catch (error) {
          await interaction.reply({ content: `❌ Error: ${error.message}`, ephemeral: true });
        }
        return;
      }
      
      if (interaction.customId === 'remove_role_modal') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can remove roles!', ephemeral: true });
          return;
        }
        
        const userId = interaction.fields.getTextInputValue('user_id');
        const roleId = interaction.fields.getTextInputValue('role_id');
        
        try {
          const guild = interaction.guild;
          const member = await guild.members.fetch(userId);
          const role = guild.roles.cache.get(roleId);
          
          if (!role) {
            await interaction.reply({ content: '❌ Role not found!', ephemeral: true });
            return;
          }
          
          await member.roles.remove(role);
          
          const customRoles = loadData('custom_roles.json');
          if (customRoles[roleId]) {
            customRoles[roleId].members = customRoles[roleId].members.filter(id => id !== userId);
            saveData('custom_roles.json', customRoles);
          }
          
          await interaction.reply({ content: `✅ Removed <@&${roleId}> from <@${userId}>!`, ephemeral: true });
        } catch (error) {
          await interaction.reply({ content: `❌ Error: ${error.message}`, ephemeral: true });
        }
        return;
      }
      
      if (interaction.customId === 'delete_role_modal') {
        if (interaction.user.id !== CONFIG.OWNER_ID) {
          await interaction.reply({ content: '❌ Only owner can delete roles!', ephemeral: true });
          return;
        }
        
        const roleId = interaction.fields.getTextInputValue('role_id');
        
        try {
          const guild = interaction.guild;
          const role = guild.roles.cache.get(roleId);
          
          if (!role) {
            await interaction.reply({ content: '❌ Role not found!', ephemeral: true });
            return;
          }
          
          const roleName = role.name;
          await role.delete(`Deleted by ${interaction.user.tag}`);
          
          const customRoles = loadData('custom_roles.json');
          delete customRoles[roleId];
          saveData('custom_roles.json', customRoles);
          
          await interaction.reply({ content: `✅ Deleted role **${roleName}**!`, ephemeral: true });
        } catch (error) {
          await interaction.reply({ content: `❌ Error: ${error.message}`, ephemeral: true });
        }
        return;
      }
      
      if (interaction.customId === 'broadcast_modal') {
        const message = interaction.fields.getTextInputValue('broadcast_message');
        
        const selectedChannels = client.broadcastChannels?.get(interaction.user.id) || [];
        
        if (selectedChannels.length === 0) {
          await interaction.reply({ content: '❌ No channels selected!', ephemeral: true });
          return;
        }
        
        const broadcastEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('📢 ANNOUNCEMENT FROM OTO TOURNAMENTS')
          .setDescription(message)
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setFooter({ text: 'Official OTO Announcement' })
          .setTimestamp();
        
        let sent = 0;
        for (const channelId of selectedChannels) {
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
        
        client.broadcastChannels.delete(interaction.user.id);
        
        await interaction.reply({ content: `✅ Broadcast sent to ${sent} channels!`, ephemeral: true });
        return;
      }
      
      if (interaction.customId === 'staff_application_modal') {
        const name = interaction.fields.getTextInputValue('app_name');
        const age = interaction.fields.getTextInputValue('app_age');
        const experience = interaction.fields.getTextInputValue('app_experience');
        const why = interaction.fields.getTextInputValue('app_why');
        const availability = interaction.fields.getTextInputValue('app_availability');
        
        const staffApps = loadData('staff_applications.json');
        const appId = `APP-${Date.now()}`;
        
        staffApps[appId] = {
          userId: interaction.user.id,
          name, age, experience, why, availability,
          submittedAt: Date.now(),
          status: 'pending'
        };
        
        saveData('staff_applications.json', staffApps);
        
        const appEmbed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('📝 NEW STAFF APPLICATION')
          .setDescription(`**Applicant:** ${interaction.user.tag}`)
          .addFields(
            { name: 'Name', value: name, inline: true },
            { name: 'Age', value: age, inline: true },
            { name: 'Availability', value: availability, inline: true },
            { name: 'Experience', value: experience },
            { name: 'Why Staff?', value: why }
          )
          .setFooter({ text: `Application ID: ${appId}` })
          .setTimestamp();
        
        const appButtons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`approve_app_${appId}`)
              .setLabel('✅ Approve')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`reject_app_${appId}`)
              .setLabel('❌ Reject')
              .setStyle(ButtonStyle.Danger)
          );
        
        const playerFormChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.PLAYER_FORM);
        if (playerFormChannel) {
          await playerFormChannel.send({ content: `<@${CONFIG.OWNER_ID}>`, embeds: [appEmbed], components: [appButtons] });
        }
        
        await interaction.reply({ content: '✅ Your staff application has been submitted! You will be notified of the decision.', ephemeral: true });
        return;
      }
      
      if (interaction.customId === 'custom_tournament_modal') {
        // Handled earlier through createTournament modal flow / not expected as modalId
        return;
      }
      
      if (interaction.customId.startsWith('room_modal_')) {
        // room modals are handled below - but manipulated via modal.customId, so this branch not used
      }
      
      if (interaction.customId.startsWith('confirm_join_')) {
        // confirm_join is a modal submit (handled by modal id)
      }
      
      // Other modal submit cases continue...
    }
  } catch (err) {
    console.error('Error in interaction handler:', err);
  }
});

// ============================================
// GENDER BUTTONS (profile completion) and MODAL SUBMITS HANDLING
// ============================================
client.on('interactionCreate', async (interaction) => {
  // Separate handler for some interactions that require modal data access and are easier isolated
  try {
    if (interaction.isButton() && interaction.customId.startsWith('gender_')) {
      const parts = interaction.customId.split('_');
      const gender = parts[1];
      const userId = parts[2];
      
      if (userId !== interaction.user.id) return;
      
      client.tempProfiles = client.tempProfiles || new Map();
      const tempProfile = client.tempProfiles.get(interaction.user.id);
      if (!tempProfile) {
        await interaction.reply({ content: '❌ Temporary profile not found. Please start again.', ephemeral: true });
        return;
      }
      tempProfile.gender = gender;
      
      await interaction.update({ components: [] }).catch(()=>{});
      
      const otoId = generateOTOID();
      const profileData = {
        name: tempProfile.name,
        game: tempProfile.game,
        state: tempProfile.state,
        gender: gender,
        otoId: otoId,
        createdAt: Date.now(),
        level: 1,
        stats: { wins: 0, played: 0, earned: 0, invites: 0 },
        badges: [],
        achievements: [],
        isPublic: false
      };
      
      saveUserProfile(interaction.user.id, profileData);
      client.tempProfiles.delete(interaction.user.id);
      
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
      
      const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
      const member = await guild.members.fetch(interaction.user.id).catch(()=>null);
      const playerRole = guild.roles.cache.get(CONFIG.ROLES.PLAYER);
      
      if (member && playerRole) await member.roles.add(playerRole).catch(()=>{});
      
      const profileChannel = guild.channels.cache.get(CONFIG.CHANNELS.PROFILE);
      if (profileChannel) {
        const profileEmbed = createProfileEmbed(interaction.user, profileData);
        await profileChannel.send({ embeds: [profileEmbed] }).catch(()=>{});
      }
      
      const welcomeChannel = guild.channels.cache.get(CONFIG.CHANNELS.WELCOME_CHANNEL);
      if (welcomeChannel) {
        const welcomeMsg = await welcomeChannel.send(`🎊 **${profileData.name} bhai aa gaya!** Welcome ${interaction.user}! 🔥`).catch(()=>null);
        if (welcomeMsg) await welcomeMsg.react('❤️').catch(()=>{});
      }
      
      const joinLogEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Profile Created')
        .setDescription(`${interaction.user.tag} completed profile creation`)
        .addFields(
          { name: 'OTO ID', value: otoId, inline: true },
          { name: 'Game', value: profileData.game, inline: true },
          { name: 'State', value: profileData.state, inline: true }
        )
        .setTimestamp();
      
      await logToChannel(guild, CONFIG.CHANNELS.MOD_LOG, joinLogEmbed);
      
      // Award first achievement
      await checkAndAwardAchievements(interaction.user.id, guild);
      
      return;
    }
    
    if (interaction.isModalSubmit()) {
      // Many modal ids are used; handle some important ones here:
      if (interaction.customId.startsWith('room_modal_')) {
        const tournamentId = interaction.customId.replace('room_modal_', '');
        const roomId = interaction.fields.getTextInputValue('room_id');
        const password = interaction.fields.getTextInputValue('room_password');
        
        const lobbies = loadData('lobbies.json');
        if (!lobbies[tournamentId]) {
          lobbies[tournamentId] = { participants: [] };
        }
        
        lobbies[tournamentId].roomId = roomId;
        lobbies[tournamentId].password = password;
        saveData('lobbies.json', lobbies);
        
        const roomEmbed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('🔑 ROOM DETAILS SET!')
          .setDescription(
            `Room details have been set!\n\n` +
            `🔑 **Room ID:** \`${roomId}\`\n` +
            `🔐 **Password:** \`${password}\`\n\n` +
            `Click **START MATCH** when ready!`
          )
          .setFooter({ text: 'Only visible to staff' })
          .setTimestamp();
        
        await interaction.reply({ embeds: [roomEmbed], ephemeral: true });
        return;
      }
      
      if (interaction.customId.startsWith('confirm_join_')) {
        const tournamentId = interaction.customId.replace('confirm_join_', '');
        const ign = interaction.fields.getTextInputValue('ign_input');
        const confirm = interaction.fields.getTextInputValue('confirm_input');
        
        if (confirm.toUpperCase() !== 'CONFIRM') {
          await interaction.reply({ content: '❌ You must type "CONFIRM" to proceed!', ephemeral: true });
          return;
        }
        
        const tournaments = loadData('tournaments.json');
        const tournament = tournaments[tournamentId];
        
        if (!tournament) {
          await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
          return;
        }
        
        const guild = interaction.guild;
        const ticketCategory = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY);
        
        const ticketChannel = await guild.channels.create({
          name: `reg-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: ticketCategory,
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: CONFIG.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: tournament.createdBy, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: CONFIG.OWNER_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
          ]
        }).catch(()=>null);
        
        const tickets = loadData('tickets.json');
        if (ticketChannel) {
          tickets[ticketChannel.id] = {
            userId: interaction.user.id,
            tournamentId: tournamentId,
            ign: ign,
            type: 'registration',
            createdAt: Date.now()
          };
          saveData('tickets.json', tickets);
          
          const ticketLogEmbed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('🎫 Registration Ticket Created')
            .setDescription(`${interaction.user.tag} joined: ${tournament.title}`)
            .addFields(
              { name: 'Tournament ID', value: tournamentId, inline: true },
              { name: 'IGN', value: ign, inline: true },
              { name: 'Ticket', value: `<#${ticketChannel.id}>`, inline: true }
            )
            .setTimestamp();
          
          await logToChannel(guild, CONFIG.CHANNELS.TICKET_LOG, ticketLogEmbed);
          
          const ticketEmbed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('🎫 TOURNAMENT REGISTRATION')
            .setDescription(
              `Welcome ${interaction.user}! 👋\n\n` +
              `**Tournament:** ${tournament.title}\n` +
              `**Your IGN:** ${ign}\n` +
              `**Entry Fee:** ₹${tournament.entryFee}\n\n` +
              `${tournament.entryFee > 0 ? '💳 **Please provide payment screenshot below**\n' : '✅ **Free Entry - No payment required**\n'}` +
              `Staff will verify and confirm your entry! ⏳`
            )
            .setFooter({ text: `Tournament ID: ${tournamentId}` })
            .setTimestamp();
          
          await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.ROLES.STAFF}>`, embeds: [ticketEmbed] }).catch(()=>{});
          
          if (tournament.entryFee > 0) {
            const paymentEmbed = new EmbedBuilder()
              .setColor('#FFD700')
              .setTitle('💳 PAYMENT INFORMATION')
              .setDescription(
                `**Amount to Pay:** ₹${tournament.entryFee}\n\n` +
                `**Payment Methods:**\n` +
                `• UPI ID: \`oto@upi\`\n` +
                `• Phone Pay / Google Pay / Paytm\n\n` +
                `📸 **After payment, upload screenshot here!**\n` +
                `⏰ **Payment must be done within 10 minutes**`
              )
              .setFooter({ text: 'Payment verification required' })
              .setTimestamp();
            
            await ticketChannel.send({ embeds: [paymentEmbed] }).catch(()=>{});
          }
          
          const actionButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`confirm_entry_${ticketChannel.id}`)
                .setLabel('✅ Confirm Entry')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`close_ticket_${ticketChannel.id}`)
                .setLabel('❌ Close Ticket')
                .setStyle(ButtonStyle.Danger)
            );
          
          await ticketChannel.send({ content: '**Staff Actions:**', components: [actionButtons] }).catch(()=>{});
          
          await interaction.reply({ content: `✅ Registration ticket created! Check ${ticketChannel}`, ephemeral: true });
          return;
        } else {
          await interaction.reply({ content: '❌ Could not create ticket channel. Please contact staff.', ephemeral: true });
          return;
        }
      }
      
      // broadcast modal, staff application modal, custom tournament modal handled in previous large handler
    }
  } catch (err) {
    console.error('Error in second interaction handler:', err);
  }
});

// ============================================
// TOURNAMENT SYSTEM FUNCTIONS
// ============================================

async function createTournament(interaction, type) {
  const member = interaction.member;
  const isAuthorized = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                       member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                       member.id === CONFIG.OWNER_ID;
  
  if (!isAuthorized) {
    await interaction.reply({ content: '❌ You do not have permission to create tournaments.', ephemeral: true });
    return;
  }
  
  if (type === 'quick') {
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
            { label: 'Free Fire Solo - Quick Fire', value: 'ff_solo_quick', description: '12 slots, ₹50 entry, ₹500 prize', emoji: '🔥' },
            { label: 'Free Fire Squad - Mega Event', value: 'ff_squad_mega', description: '48 slots, ₹100 entry, ₹2000 prize', emoji: '💎' },
            { label: 'Minecraft - Free Practice', value: 'mc_free', description: 'Free entry, practice tournament', emoji: '⛏️' }
          ])
      );
    
    await interaction.reply({ embeds: [templateEmbed], components: [templateSelect], ephemeral: true }).catch(()=>{});
    
  } else if (type === 'custom') {
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
    
    await interaction.showModal(modal).catch(()=>{});
  }
}

async function postTournament(interaction, tournamentData) {
  const tournamentId = generateTournamentID();
  tournamentData.id = tournamentId;
  
  const tournaments = loadData('tournaments.json');
  tournaments[tournamentId] = tournamentData;
  saveData('tournaments.json', tournaments);
  
  const gameEmojis = { freefire: '🔥', minecraft: '⛏️', other: '🎮' };
  const statusEmojis = { open: '🟢', filling: '🟡', almost_full: '🟠', closed: '🔴', live: '⚫', completed: '✅' };
  
  const tournamentEmbed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`${gameEmojis[tournamentData.game] || '🎮'} ${tournamentData.title.toUpperCase()}`)
    .setDescription(
      `${tournamentData.description}\n\n` +
      `${statusEmojis[tournamentData.status]} **Registration is now OPEN!**`
    )
    .addFields(
      { name: '💰 Prize Pool', value: `₹${tournamentData.prizePool}`, inline: true },
      { name: '🎫 Entry Fee', value: `₹${tournamentData.entryFee}`, inline: true },
      { name: '📊 Slots', value: `**${tournamentData.currentSlots}/${tournamentData.maxSlots}**`, inline: true }
    )
    .addFields(
      { name: '⏰ Time', value: tournamentData.time, inline: true },
      { name: '🗺️ Map', value: tournamentData.map.toUpperCase(), inline: true },
      { name: '🎯 Mode', value: tournamentData.mode.toUpperCase(), inline: true }
    )
    .addFields({
      name: '\u200B',
      value: '━━━━━━━━━━━━━━━━━━━━━━'
    })
    .addFields({
      name: '🏆 Prize Distribution',
      value: Object.entries(tournamentData.prizeDistribution)
        .map(([place, amount]) => `${place === '1st' ? '🥇' : place === '2nd' ? '🥈' : place === '3rd' ? '🥉' : '🏅'} **${place}**: ₹${amount}`)
        .join('\n')
    })
    .addFields({
      name: '\u200B',
      value: '━━━━━━━━━━━━━━━━━━━━━━'
    })
    .addFields({
      name: '🆔 Tournament ID',
      value: `\`${tournamentId}\``,
      inline: false
    })
    .setFooter({ text: 'Click JOIN NOW to participate! • OTO Tournaments' })
    .setTimestamp();
  
  const joinButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`join_tournament_${tournamentId}`)
        .setLabel('🎮 JOIN NOW')
        .setStyle(ButtonStyle.Success)
    );
  
  const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
  const tournamentChannel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
  
  if (tournamentChannel) {
    const msg = await tournamentChannel.send({ embeds: [tournamentEmbed], components: [joinButton] }).catch(()=>null);
    if (msg) {
      tournamentData.messageId = msg.id;
      tournaments[tournamentId] = tournamentData;
      saveData('tournaments.json', tournaments);
    }
  }
  
  const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
  if (generalChannel) {
    await generalChannel.send({
      content: `🚨 **NEW TOURNAMENT ALERT!** 🚨\n\nCheck <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> to join!`,
      embeds: [tournamentEmbed],
      components: [joinButton]
    }).catch(()=>null);
  }
  
  // Send reminder to owner
  try {
    const owner = await client.users.fetch(CONFIG.OWNER_ID);
    const reminderEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📢 Tournament Created - Reminder')
      .setDescription(
        `**Tournament:** ${tournamentData.title}\n` +
        `**ID:** ${tournamentId}\n` +
        `**Slots:** ${tournamentData.maxSlots}\n` +
        `**Entry Fee:** ₹${tournamentData.entryFee}\n` +
        `**Prize Pool:** ₹${tournamentData.prizePool}\n\n` +
        `✅ Tournament has been posted!\n` +
        `📊 Monitor registrations in staff tools.`
      )
      .setTimestamp();
    
    await owner.send({ embeds: [reminderEmbed] }).catch(()=>null);
  } catch (error) {
    console.log('Could not send reminder to owner');
  }
  
  await interaction.reply({ content: `✅ Tournament created successfully! ID: ${tournamentId}`, ephemeral: true }).catch(()=>{});
}

async function handleTournamentJoin(interaction, tournamentId) {
  const tournaments = loadData('tournaments.json');
  const tournament = tournaments[tournamentId];
  
  if (!tournament) {
    await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
    return;
  }
  
  if (tournament.status !== 'open' && tournament.status !== 'filling' && tournament.status !== 'almost_full') {
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
  
  // Create confirmation modal
  const modal = new ModalBuilder()
    .setCustomId(`confirm_join_${tournamentId}`)
    .setTitle('Confirm Tournament Entry');
  
  const ignInput = new TextInputBuilder()
    .setCustomId('ign_input')
    .setLabel('Your In-Game Name (IGN)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter your IGN')
    .setRequired(true);
  
  const confirmInput = new TextInputBuilder()
    .setCustomId('confirm_input')
    .setLabel('Type "CONFIRM" to proceed')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('CONFIRM')
    .setRequired(true);
  
  modal.addComponents(
    new ActionRowBuilder().addComponents(ignInput),
    new ActionRowBuilder().addComponents(confirmInput)
  );
  
  await interaction.showModal(modal).catch(()=>{});
}

async function handlePaymentConfirmation(interaction, ticketId) {
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
  
  if (!tournament) {
    await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
    return;
  }
  
  if (!tournament.participants.includes(ticket.userId)) {
    tournament.participants.push(ticket.userId);
    tournament.currentSlots++;
  }
  
  const fillPercentage = (tournament.currentSlots / tournament.maxSlots) * 100;
  if (fillPercentage >= 80) {
    tournament.status = 'almost_full';
  } else if (fillPercentage >= 50) {
    tournament.status = 'filling';
  } else {
    tournament.status = 'open';
  }
  
  if (tournament.currentSlots >= tournament.maxSlots) {
    tournament.status = 'closed';
  }
  
  tournaments[ticket.tournamentId] = tournament;
  saveData('tournaments.json', tournaments);
  
  await updateTournamentMessage(tournament);
  
  const user = await client.users.fetch(ticket.userId).catch(()=>null);
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
  
  if (user) await user.send({ embeds: [confirmEmbed] }).catch(()=>null);
  if (interaction.channel) await interaction.channel.send({ embeds: [confirmEmbed] }).catch(()=>null);
  
  // Update profile stats
  const profile = getUserProfile(ticket.userId);
  if (profile) {
    profile.stats.played++;
    saveUserProfile(ticket.userId, profile);
    
    // Check for tournament participation achievements
    await checkAndAwardAchievements(ticket.userId, interaction.guild);
  }
  
  // Log confirmation
  const confirmLogEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Payment Confirmed')
    .setDescription(`${user ? user.tag : ticket.userId} confirmed for: ${tournament.title}`)
    .addFields(
      { name: 'Tournament ID', value: tournament.id, inline: true },
      { name: 'Confirmed By', value: interaction.user.tag, inline: true }
    )
    .setTimestamp();
  
  await logToChannel(interaction.guild, CONFIG.CHANNELS.TICKET_LOG, confirmLogEmbed);
  
  await interaction.reply({ content: '✅ Payment confirmed! User added to tournament.', ephemeral: true }).catch(()=>{});
  
  setTimeout(async () => {
    try {
      if (interaction.channel) await interaction.channel.delete().catch(()=>{});
      delete tickets[ticketId];
      saveData('tickets.json', tickets);
    } catch (e) {}
  }, 10000);
}

async function updateTournamentMessage(tournament) {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    if (!channel) return;
    const message = tournament.messageId ? await channel.messages.fetch(tournament.messageId).catch(()=>null) : null;
    if (!message) return;
    
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
      .addFields({ name: '🆔 Tournament ID', value: `\`${tournament.id}\``, inline: false })
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
    
    await message.edit({ embeds: [updatedEmbed], components: [joinButton] }).catch(()=>null);
  } catch (error) {
    console.error('Error updating tournament message:', error);
  }
}

async function handleTicketClose(interaction) {
  const ticketId = interaction.customId.replace('close_ticket_', '');
  
  const member = interaction.member;
  const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                  member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                  member.id === CONFIG.OWNER_ID;
  
  if (!isStaff) {
    await interaction.reply({ content: '❌ Only staff can close tickets!', ephemeral: true });
    return;
  }
  
  await interaction.reply({ content: '🔄 Closing ticket in 5 seconds...', ephemeral: false }).catch(()=>{});
  
  const closeLogEmbed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('🎫 Ticket Closed')
    .setDescription(`Ticket <#${ticketId}> closed by ${interaction.user.tag}`)
    .setTimestamp();
  
  await logToChannel(interaction.guild, CONFIG.CHANNELS.TICKET_LOG, closeLogEmbed);
  
  setTimeout(async () => {
    const tickets = loadData('tickets.json');
    delete tickets[ticketId];
    saveData('tickets.json', tickets);
    try { await interaction.channel.delete().catch(()=>{}); } catch(e){}
  }, 5000);
}

async function handleFreeMatchRequest(interaction) {
  const guild = interaction.guild || await client.guilds.fetch(CONFIG.GUILD_ID);
  const ticketCategory = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY);
  
  const ticketChannel = await guild.channels.create({
    name: `free-match-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: ticketCategory,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: CONFIG.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
    ]
  }).catch(()=>null);
  
  if (!ticketChannel) {
    await interaction.reply({ content: '❌ Could not create free match ticket. Contact staff.', ephemeral: true });
    return;
  }
  
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
  
  await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.ROLES.STAFF}>`, embeds: [freeMatchEmbed], components: [closeButton] }).catch(()=>null);
  
  await interaction.reply({ content: `✅ Free match request created! Check ${ticketChannel}`, ephemeral: true }).catch(()=>null);
}

// ============================================
// LEADERBOARDS, INVITE TRACKING, SETUPS
// ============================================
async function updateLeaderboards(guild) {
  const leaderboardChannel = guild.channels.cache.get(CONFIG.CHANNELS.LEADERBOARD);
  if (!leaderboardChannel) return;
  
  const profiles = loadData('profiles.json');
  const invitesData = loadData('invites.json');
  
  // Most Active Players (by games played)
  const mostActive = Object.entries(profiles)
    .sort((a, b) => b[1].stats.played - a[1].stats.played)
    .slice(0, 15);
  
  // Most Wins
  const mostWins = Object.entries(profiles)
    .sort((a, b) => b[1].stats.wins - a[1].stats.wins)
    .slice(0, 15);
  
  // Top Earners
  const mostEarnings = Object.entries(profiles)
    .sort((a, b) => b[1].stats.earned - a[1].stats.earned)
    .slice(0, 15);
  
  // Top Inviters
  const mostInvites = Object.entries(invitesData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);
  
  // Win Rate Leaders
  const winRate = Object.entries(profiles)
    .filter(([id, p]) => p.stats.played >= 5)
    .map(([id, p]) => [id, p, (p.stats.wins / p.stats.played * 100).toFixed(1)])
    .sort((a, b) => b[2] - a[2])
    .slice(0, 15);
  
  // Clear old messages
  const messages = await leaderboardChannel.messages.fetch({ limit: 100 }).catch(()=>({}));
  if (messages && messages.size) {
    const deletable = messages.filter(m => m.author.id === client.user.id && (Date.now() - m.createdTimestamp) / (1000 * 60 * 60 * 24) < 14);
    if (deletable.size) await leaderboardChannel.bulkDelete(deletable, true).catch(()=>{});
  }
  
  // Header
  const headerEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🏆 OTO TOURNAMENTS - LEADERBOARDS 🏆')
    .setDescription(
      `╔═══════════════════════════╗\n` +
      `    **HALL OF FAME**\n` +
      `╚═══════════════════════════╝\n\n` +
      `Welcome to the OTO Leaderboards!\n` +
      `Compete, climb, and claim your spot! 🚀\n\n` +
      `**Updated:** <t:${Math.floor(Date.now() / 1000)}:R>`
    )
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setFooter({ text: 'Updates every hour • OTO Tournaments' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [headerEmbed] }).catch(()=>{});
  
  // Most Active Players
  const activeEmbed = new EmbedBuilder()
    .setColor('#4CAF50')
    .setTitle('🎮 MOST ACTIVE PLAYERS')
    .setDescription(
      mostActive.map((entry, i) => {
        const [userId, profile] = entry;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${medal} **${profile.name}** ${badge}\n   🎮 Played: **${profile.stats.played}** | 🏆 Wins: **${profile.stats.wins}**`;
      }).join('\n\n') || 'No data yet'
    )
    .setFooter({ text: 'Most tournament participations' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [activeEmbed] }).catch(()=>{});
  
  // Top Winners
  const winsEmbed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🏆 TOP WINNERS')
    .setDescription(
      mostWins.map((entry, i) => {
        const [userId, profile] = entry;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${medal} **${profile.name}** ${badge}\n   🏆 Wins: **${profile.stats.wins}** | 💰 Earned: **₹${profile.stats.earned}**`;
      }).join('\n\n') || 'No data yet'
    )
    .setFooter({ text: 'Most tournament victories' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [winsEmbed] }).catch(()=>{});
  
  // Top Earners
  const earningsEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 TOP EARNERS')
    .setDescription(
      mostEarnings.map((entry, i) => {
        const [userId, profile] = entry;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${medal} **${profile.name}** ${badge}\n   💰 Earned: **₹${profile.stats.earned}** | 🏆 Wins: **${profile.stats.wins}**`;
      }).join('\n\n') || 'No data yet'
    )
    .setFooter({ text: 'Total prize money earned' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [earningsEmbed] }).catch(()=>{});
  
  // Top Recruiters
  const invitesEmbed = new EmbedBuilder()
    .setColor('#9C27B0')
    .setTitle('👥 TOP RECRUITERS')
    .setDescription(
      await Promise.all(mostInvites.map(async (entry, i) => {
        const [userId, data] = entry;
        try {
          const user = await client.users.fetch(userId);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
          return `${medal} **${user.username}**\n   👥 Total: **${data.total}** | ✅ Active: **${data.active}**`;
        } catch {
          return '';
        }
      })).then(arr => arr.filter(Boolean).join('\n\n')) || 'No data yet'
    )
    .setFooter({ text: 'Most members invited' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [invitesEmbed] }).catch(()=>{});
  
  // Win Rate Leaders
  const winRateEmbed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle('📊 WIN RATE LEADERS')
    .setDescription(
      winRate.map((entry, i) => {
        const [userId, profile, rate] = entry;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        const badge = profile.badges.length > 0 ? profile.badges[0] : '';
        return `${medal} **${profile.name}** ${badge}\n   📈 Win Rate: **${rate}%** | 🎮 Played: **${profile.stats.played}**`;
      }).join('\n\n') || 'No data yet (min. 5 games)'
    )
    .setFooter({ text: 'Minimum 5 games played' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [winRateEmbed] }).catch(()=>{});
  
  // Footer
  const footerEmbed = new EmbedBuilder()
    .setColor('#2196F3')
    .setTitle('🎯 HOW TO CLIMB THE LEADERBOARDS')
    .setDescription(
      `**Want to see your name here?** 🚀\n\n` +
      `🎮 **Join Tournaments** - Participate in more tournaments\n` +
      `🏆 **Win Matches** - Win tournaments to boost your wins\n` +
      `💰 **Earn Prizes** - Place in top positions\n` +
      `👥 **Invite Friends** - Grow the OTO family\n` +
      `📈 **Stay Consistent** - Play regularly to maintain rank\n\n` +
      `**Good luck climbing to the top!** 💪`
    )
    .setFooter({ text: 'Leaderboards update every hour' })
    .setTimestamp();
  
  await leaderboardChannel.send({ embeds: [footerEmbed] }).catch(()=>{});
}

async function updateInviteTracker(guild) {
  const inviteChannel = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
  if (!inviteChannel) return;
  
  const invitesData = loadData('invites.json');
  const topInvites = Object.entries(invitesData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);
  
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
      value: '5 invites → FREE match challenge\n10 invites → 1 FREE entry + Recruiter role\n20 invites → 50% discount + Pro Recruiter role\n50 invites → 5 FREE entries + Elite Recruiter role'
    })
    .setFooter({ text: 'Updates every hour' })
    .setTimestamp();
  
  const messages = await inviteChannel.messages.fetch({ limit: 10 }).catch(()=>({}));
  const existingMessage = messages && messages.find ? messages.find(m => m.author.id === client.user.id && m.embeds.length > 0) : null;
  
  if (existingMessage) {
    await existingMessage.edit({ embeds: [inviteEmbed] }).catch(()=>{});
  } else {
    await inviteChannel.send({ embeds: [inviteEmbed] }).catch(()=>{});
  }
}

async function setupSupportTickets(guild) {
  const supportChannel = guild.channels.cache.get(CONFIG.CHANNELS.SUPPORT);
  if (!supportChannel) return;
  
  const supportEmbed = new EmbedBuilder()
    .setColor('#4CAF50')
    .setTitle('🎫 SUPPORT TICKETS')
    .setDescription(
      '**Need help? Create a support ticket!**\n\n' +
      '✅ **What we can help with:**\n' +
      '• Tournament questions\n' +
      '• Payment issues\n' +
      '• Profile problems\n' +
      '• General inquiries\n' +
      '• Report issues\n\n' +
      '⏰ **Response time:** Usually within 10-30 minutes\n\n' +
      'Click the button below to create a ticket!'
    )
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setFooter({ text: 'OTO Support Team' })
    .setTimestamp();
  
  const ticketButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_support_ticket')
        .setLabel('📩 Create Support Ticket')
        .setStyle(ButtonStyle.Success)
    );
  
  try {
    const messages = await supportChannel.messages.fetch({ limit: 10 }).catch(()=>({}));
    const existingMsg = messages && messages.find ? messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('SUPPORT')) : null;
    
    if (existingMsg) {
      await existingMsg.edit({ embeds: [supportEmbed], components: [ticketButton] }).catch(()=>{});
    } else {
      await supportChannel.send({ embeds: [supportEmbed], components: [ticketButton] }).catch(()=>{});
    }
    console.log('✅ Support ticket system setup');
  } catch (error) {
    console.log('⚠️  Could not setup support tickets');
  }
}

async function setupStaffApplications(guild) {
  const playerFormChannel = guild.channels.cache.get(CONFIG.CHANNELS.PLAYER_FORM);
  if (!playerFormChannel) return;
  
  const appEmbed = new EmbedBuilder()
    .setColor('#4CAF50')
    .setTitle('📝 STAFF APPLICATIONS NOW OPEN!')
    .setDescription(
      '**Want to join the OTO Staff Team?**\n\n' +
      '🛠️ Help manage tournaments\n' +
      '✅ Verify players and payments\n' +
      '👥 Support the community\n' +
      '🏆 Get special perks and recognition\n\n' +
      '**Requirements:**\n' +
      '• Active in server\n' +
      '• Responsible and mature\n' +
      '• Available 2+ hours daily\n' +
      '• Good communication skills\n\n' +
      'Click the button below to apply!'
    )
    .setFooter({ text: 'Applications reviewed by owner' })
    .setTimestamp();
  
  const applyButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('apply_staff')
        .setLabel('📝 APPLY FOR STAFF')
        .setStyle(ButtonStyle.Success)
    );
  
  const messages = await playerFormChannel.messages.fetch({ limit: 10 }).catch(()=>({}));
  const existingApp = messages && messages.find ? messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('STAFF APPLICATIONS')) : null;
  
  if (existingApp) {
    await existingApp.edit({ embeds: [appEmbed], components: [applyButton] }).catch(()=>{});
  } else {
    await playerFormChannel.send({ embeds: [appEmbed], components: [applyButton] }).catch(()=>{});
  }
}

// ============================================
// ANNOUNCEMENT & BOT COMMANDS SETUP
// ============================================
async function setupAnnouncementMessage(guild) {
  const announcementChannel = guild.channels.cache.get(CONFIG.CHANNELS.ANNOUNCEMENT);
  if (!announcementChannel) return;
  
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
      '**Need help?** Ask in <#' + CONFIG.CHANNELS.SUPPORT + '>!'
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
  
  try {
    const messages = await announcementChannel.messages.fetch({ limit: 10 }).catch(()=>({}));
    const existingMessage = messages && messages.find ? messages.find(m => m.author.id === client.user.id && m.embeds.length > 0) : null;
    
    if (existingMessage) {
      await existingMessage.edit({ embeds: [rulesEmbed], components: [resendButton] }).catch(()=>{});
    } else {
      const msg = await announcementChannel.send({ embeds: [rulesEmbed], components: [resendButton] }).catch(()=>null);
      if (msg) await msg.pin().catch(()=>{});
    }
    console.log('✅ Announcement message posted');
  } catch (error) {
    console.log('⚠️  Could not setup announcement');
  }
  
  // Setup support ticket channel
  await setupSupportTickets(guild);
}

// ============================================
// BOT COMMANDS CHANNEL SETUP
// ============================================
async function setupBotCommandsChannel(guild) {
  const commandsChannel = guild.channels.cache.get(CONFIG.CHANNELS.BOT_COMMANDS);
  if (!commandsChannel) return;
  
  const commandsEmbed = new EmbedBuilder()
    .setColor('#2196F3')
    .setTitle('🤖 BOT COMMANDS - USER GUIDE')
    .setDescription('Complete list of commands you can use:')
    .addFields(
      {
        name: '👤 Profile Commands',
        value: '`/profile` - View your profile card\n`/profile-edit` - Edit your profile\n`/profile-public` - Make profile public/private\n`/achievements` - View your achievements'
      },
      {
        name: '🎮 Tournament Commands',
        value: '`/tournaments` - View active tournaments\n`/tournament-info [id]` - Get tournament details\n`/my-tournaments` - View your tournament history'
      },
      {
        name: '👥 Invite Commands',
        value: '`/invites` - Check your invite stats\n`/invite-leaderboard` - View top inviters'
      },
      {
        name: '🎫 Support Commands',
        value: '`/ticket` - Create a support ticket\n`/help` - Get help and guide'
      },
      {
        name: '📊 Stats Commands',
        value: '`/leaderboard` - View server leaderboards\n`/stats` - View your detailed stats'
      }
    )
    .setFooter({ text: 'Use commands in any channel!' })
    .setTimestamp();
  
  try {
    const messages = await commandsChannel.messages.fetch({ limit: 10 }).catch(()=>({}));
    if (messages && messages.filter) {
      await commandsChannel.bulkDelete(messages.filter(m => m.author.id === client.user.id && (Date.now() - m.createdTimestamp) / (1000 * 60 * 60 * 24) < 14), true).catch(()=>{});
    }
    
    const msg = await commandsChannel.send({ embeds: [commandsEmbed] }).catch(()=>null);
    if (msg) await msg.pin().catch(()=>{});
    console.log('✅ Bot commands guide posted');
  } catch (error) {
    console.log('⚠️  Could not setup bot commands');
  }
}

// ============================================
// ENHANCED PROFILE CREATION DM SYSTEM
// ============================================
async function sendProfileCreationDM(user) {
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle('🎊 WELCOME TO OTO TOURNAMENTS! 🎊')
    .setDescription(
      `╔═══════════════════════════╗\n` +
      `        **HELLO ${user.username.toUpperCase()}!**\n` +
      `╚═══════════════════════════╝\n\n` +
      `🎮 Welcome to India's **#1 Tournament Platform**!\n\n` +
      `**🌟 What Awaits You:**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏆 **Epic Tournaments** - Win big prizes daily!\n` +
      `💰 **Real Money Rewards** - Get paid instantly!\n` +
      `👥 **Huge Community** - 10,000+ active players!\n` +
      `🎁 **Invite Rewards** - Earn free entries!\n` +
      `🏅 **Achievements** - Unlock exclusive badges!\n` +
      `⚡ **24/7 Support** - We're always here for you!\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `**✨ TO GET STARTED:**\n` +
      `Create your OTO profile in just 30 seconds!\n` +
      `Click the **✨ CREATE PROFILE** button below! 👇\n\n` +
      `**Your gaming journey starts NOW!** 🚀`
    )
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: 'OTO Tournaments - Win Big, Play Fair! 🏆' })
    .setTimestamp();
  
  const joinButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('start_profile_creation')
        .setLabel('✨ CREATE PROFILE')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎮')
    );
  
  await user.send({ embeds: [welcomeEmbed], components: [joinButton] }).catch(()=>{ throw new Error('Could not DM user'); });
}

// ============================================
// MEMBER JOIN / LEAVE, INVITE TRACKING & MESSAGES
// ============================================
client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  
  const guild = member.guild;
  // Track invite
  await trackInvite(member).catch(()=>{});
  
  // Log join event
  const joinEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('👋 Member Joined')
    .setDescription(`${member.user.tag} joined the server`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'User ID', value: member.id, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp();
  
  await logToChannel(guild, CONFIG.CHANNELS.MOD_LOG, joinEmbed);
  
  // Send welcome in general
  const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
  if (generalChannel) {
    const welcomeMessages = [
      `🎊 **${member.user.username} bhai aa gaya!** Welcome to OTO Family! 🔥`,
      `🚀 Boss arrived! ${member.user.username} just landed in OTO! 🎮`,
      `⚡ ${member.user.username} has entered the arena! Let's go! 💪`,
      `🎯 New champion alert! ${member.user.username} joined OTO! 🏆`,
      `🔥 ${member.user.username} is here! Tournament warrior incoming! ⚔️`
    ];
    await generalChannel.send(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]).catch(()=>{});
  }
  
  // Beautiful welcome card in welcome channel
  const welcomeChannel = guild.channels.cache.get(CONFIG.CHANNELS.WELCOME_CHANNEL);
  if (welcomeChannel) {
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('🎮 WELCOME TO OTO FAMILY!')
      .setDescription(
        `╔═══════════════════════╗\n` +
        `    **${member.user.username}**\n` +
        `╚═══════════════════════╝\n\n` +
        `🎊 ${member.user.username} bhai aa gaya! 🎊\n\n` +
        `✨ Check your DMs to create your profile\n` +
        `🏆 Join tournaments and win big prizes\n` +
        `👥 Invite friends for exclusive rewards\n` +
        `🎮 Let's play and dominate together!\n\n` +
        `**Welcome to the OTO Family!** 💙`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setFooter({ text: `Member #${guild.memberCount} • OTO Tournaments` })
      .setTimestamp();
    
    const welcomeMsg = await welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] }).catch(()=>null);
    if (welcomeMsg) {
      await welcomeMsg.react('❤️').catch(()=>{});
      await welcomeMsg.react('🎮').catch(()=>{});
      await welcomeMsg.react('🔥').catch(()=>{});
    }
  }
  
  // Send beautiful profile creation DM
  try {
    await sendProfileCreationDM(member.user);
  } catch (error) {
    console.log(`Could not send DM to ${member.user.tag}`);
  }
});

client.on('guildMemberRemove', async (member) => {
  if (member.user.bot) return;
  
  const leaveEmbed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('👋 Member Left')
    .setDescription(`${member.user.tag} left the server`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'User ID', value: member.id, inline: true },
      { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp();
  
  await logToChannel(member.guild, CONFIG.CHANNELS.MOD_LOG, leaveEmbed);
  
  const generalChannel = member.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
  if (generalChannel) {
    const goodbyeMessages = [
      `😢 ${member.user.username} left the server. We'll miss you! 💔`,
      `👋 ${member.user.username} has left OTO Family. Hope to see you back! 🏆`,
      `🚪 ${member.user.username} left the tournament grounds. Miss you bro! 😞`
    ];
    await generalChannel.send(goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]).catch(()=>{});
  }
});

// ============================================
// INVITE TRACKING
// ============================================
const invites = new Map();

client.on('ready', async () => {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const guildInvites = await guild.invites.fetch().catch(()=>[]);
    invites.set(guild.id, new Map((guildInvites || []).map(invite => [invite.code, invite.uses])));
  } catch (error) {
    console.log('Could not fetch invites');
  }
});

async function trackInvite(member) {
  try {
    const guild = member.guild;
    const cachedInvites = invites.get(guild.id) || new Map();
    const newInvites = await guild.invites.fetch().catch(()=>[]);
    const newInvitesMap = new Map((newInvites || []).map(inv => [inv.code, inv.uses]));
    
    const usedInvite = (newInvites || []).find(invite => {
      const cachedUses = cachedInvites.get(invite.code) || 0;
      return invite.uses > cachedUses;
    });
    
    if (usedInvite) {
      const inviter = usedInvite.inviter;
      if (!inviter) return;
      const invitesData = loadData('invites.json');
      
      if (!invitesData[inviter.id]) {
        invitesData[inviter.id] = { total: 0, active: 0, fake: 0, rewards: [] };
      }
      
      invitesData[inviter.id].total++;
      invitesData[inviter.id].active++;
      saveData('invites.json', invitesData);
      
      // Update profile invite count
      const profile = getUserProfile(inviter.id);
      if (profile) {
        profile.stats.invites = invitesData[inviter.id].total;
        saveUserProfile(inviter.id, profile);
        
        // Check for invite achievements
        await checkAndAwardAchievements(inviter.id, guild);
      }
      
      await checkInviteMilestone(guild, inviter.id);
    }
    
    invites.set(guild.id, newInvitesMap);
  } catch (e) {
    console.log('trackInvite error', e);
  }
}

async function checkInviteMilestone(guild, userId) {
  const invitesData = loadData('invites.json');
  const userData = invitesData[userId];
  if (!userData) return;
  
  const member = await guild.members.fetch(userId).catch(()=>null);
  
  if (userData.total === 5 && !userData.rewards.includes('5_invites')) {
    userData.rewards.push('5_invites');
    saveData('invites.json', invitesData);
    
    const user = await client.users.fetch(userId).catch(()=>null);
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
      .setThumbnail(user ? user.displayAvatarURL({ dynamic: true }) : null)
      .setFooter({ text: 'OTO Invite Rewards' })
      .setTimestamp();
    
    const requestButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('request_free_match')
          .setLabel('⚔️ REQUEST MATCH')
          .setStyle(ButtonStyle.Danger)
      );
    
    if (user) await user.send({ embeds: [rewardEmbed], components: [requestButton] }).catch(()=>{});
    await updateInviteTracker(guild);
  }
  
  if (userData.total === 10 && !userData.rewards.includes('10_invites')) {
    userData.rewards.push('10_invites');
    saveData('invites.json', invitesData);
    
    const user = await client.users.fetch(userId).catch(()=>null);
    const member = await guild.members.fetch(userId).catch(()=>null);
    const recruiterRole = guild.roles.cache.get(CONFIG.ROLES.RECRUITER);
    if (recruiterRole && member) await member.roles.add(recruiterRole).catch(()=>{});
    
    if (user) await user.send('🎉 **10 INVITES MILESTONE!** You unlocked Recruiter role and 1 FREE tournament entry!').catch(()=>{});
  }
  
  if (userData.total === 20 && !userData.rewards.includes('20_invites')) {
    userData.rewards.push('20_invites');
    saveData('invites.json', invitesData);
    
    const user = await client.users.fetch(userId).catch(()=>null);
    const member = await guild.members.fetch(userId).catch(()=>null);
    const proRecruiterRole = guild.roles.cache.get(CONFIG.ROLES.PRO_RECRUITER);
    if (proRecruiterRole && member) await member.roles.add(proRecruiterRole).catch(()=>{});
    
    if (user) await user.send('🌟 **20 INVITES MILESTONE!** You unlocked Pro Recruiter role and 50% discount on all entries!').catch(()=>{});
  }
  
  if (userData.total === 50 && !userData.rewards.includes('50_invites')) {
    userData.rewards.push('50_invites');
    saveData('invites.json', invitesData);
    
    const user = await client.users.fetch(userId).catch(()=>null);
    const member = await guild.members.fetch(userId).catch(()=>null);
    const eliteRecruiterRole = guild.roles.cache.get(CONFIG.ROLES.ELITE_RECRUITER);
    if (eliteRecruiterRole && member) await member.roles.add(eliteRecruiterRole).catch(()=>{});
    
    if (user) await user.send('💫 **50 INVITES MILESTONE!** You unlocked Elite Recruiter role, custom color, and 5 FREE entries!').catch(()=>{});
  }
}

// ============================================
// MESSAGE HANDLING & MODERATION
// ============================================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  
  if (!hasProfile(message.author.id) && message.channel.id !== CONFIG.CHANNELS.ANNOUNCEMENT) {
    return;
  }
  
  const member = message.member;
  const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || 
                  member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
                  member.id === CONFIG.OWNER_ID;
  
  if (!isStaff) {
    if (containsBadWords(message.content)) {
      await message.delete().catch(()=>{});
      await handleModeration(message.author, 'bad_word', message);
      return;
    }
    
    if (isSpamming(message.author.id)) {
      await message.delete().catch(()=>{});
      await handleModeration(message.author, 'spam', message);
      return;
    }
    
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = message.content.match(linkRegex);
    if (links) {
      const hasYoutube = links.some(link => link.includes('youtube.com') || link.includes('youtu.be'));
      if (!hasYoutube) {
        await message.delete().catch(()=>{});
        await handleModeration(message.author, 'unauthorized_link', message);
        return;
      }
    }
  }
  
  await handleAutoResponses(message);
});

// ============================================
// AUTO-RESPONSE SYSTEM
// ============================================
const lastResponses = new Map();

async function handleAutoResponses(message) {
  const lowerContent = message.content.toLowerCase().trim();
  const profile = getUserProfile(message.author.id);
  
  const lastResponse = lastResponses.get(message.author.id);
  if (lastResponse && Date.now() - lastResponse < 120000) {
    return;
  }
  
  const greetings = ['hi', 'hello', 'hey', 'hii', 'helo'];
  if (greetings.includes(lowerContent)) {
    // small delay then reply
    setTimeout(async () => {
      const messages = await message.channel.messages.fetch({ after: message.id, limit: 10 }).catch(()=>({}));
      const hasReply = messages && messages.some ? messages.some(m => !m.author.bot && m.author.id !== message.author.id) : false;
      
      if (!hasReply) {
        const greeting = profile && profile.gender === 'female' ? 'Hello ji! 👋' : 'Hi bhai! 😊';
        const reply = await message.reply(greeting).catch(()=>null);
        lastResponses.set(message.author.id, Date.now());
        
        setTimeout(async () => {
          const followUpMessages = await message.channel.messages.fetch({ after: reply?.id, limit: 5 }).catch(()=>({}));
          const userReplied = followUpMessages && followUpMessages.some ? followUpMessages.some(m => m.author.id === message.author.id) : false;
          
          if (userReplied) {
            await message.channel.send(
              `If you have any query, you can ask in <#${CONFIG.CHANNELS.SUPPORT}> and check out <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>! 🎮`
            ).catch(()=>{});
          }
        }, 10000);
      }
    }, 2000);
  }
  
  if (lowerContent.includes('help') || lowerContent.includes('support')) {
    await message.reply(
      `Need help? 🤔\n` +
      `📞 Ask in <#${CONFIG.CHANNELS.SUPPORT}>\n` +
      `🏆 Check <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> for tournaments\n` +
      `📊 View your stats: /profile`
    ).catch(()=>{});
    lastResponses.set(message.author.id, Date.now());
  }
}

// ============================================
// MODERATION HANDLER
// ============================================
async function handleModeration(user, type, message) {
  const warningsData = loadData('warnings.json');
  
  if (!warningsData[user.id]) {
    warningsData[user.id] = { warnings: 0, history: [] };
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
  
  // Log moderation action
  const modEmbed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⚠️ Auto Moderation')
    .setDescription(`**User:** ${user.tag}\n**Type:** ${type}\n**Warnings:** ${userData.warnings}`)
    .addFields({ name: 'Channel', value: `<#${message.channel.id}>` })
    .setTimestamp();
  
  await logToChannel(message.guild, CONFIG.CHANNELS.MOD_LOG, modEmbed);
  
  try {
    if (type === 'bad_word') {
      if (userData.warnings === 1) {
        await user.send('⚠️ Warning: Please avoid using inappropriate language in OTO server.').catch(()=>{});
      } else if (userData.warnings >= 2 && member) {
        await member.timeout(5 * 60 * 1000, 'Repeated inappropriate language').catch(()=>{});
        await user.send('🔴 You have been timed out for 5 minutes due to repeated violations.').catch(()=>{});
      }
    } else if (type === 'spam') {
      if (member) await member.timeout(5 * 60 * 1000, 'Spamming messages').catch(()=>{});
      await message.channel.send(`${user} has been timed out for spamming. Please slow down!`).then(msg => {
        setTimeout(() => msg.delete().catch(()=>{}), 5000);
      }).catch(()=>{});
    } else if (type === 'unauthorized_link') {
      await user.send('⚠️ Warning: Only YouTube links are allowed. Discord invites and other links are not permitted.').catch(()=>{});
      if (userData.warnings >= 2 && member) {
        await member.timeout(60 * 60 * 1000, 'Posting unauthorized links').catch(()=>{});
      }
    }
  } catch (e) {
    console.log('Moderation action failed', e);
  }
}

// ============================================
// PERIODIC TASKS & BACKUPS
// ============================================

// Update leaderboards and invite tracker every hour
setInterval(async () => {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    await updateLeaderboards(guild).catch(()=>{});
    await updateInviteTracker(guild).catch(()=>{});
    console.log('✅ Leaderboards updated');
  } catch (error) {
    console.error('❌ Error updating leaderboards:', error.message);
  }
}, 3600000);

// Check for tournament reminders every 30 minutes
setInterval(async () => {
  try {
    const tournaments = loadData('tournaments.json');
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    
    for (const [id, tournament] of Object.entries(tournaments)) {
      if (tournament.status === 'open' || tournament.status === 'filling') {
        const fillPercentage = (tournament.currentSlots / tournament.maxSlots) * 100;
        
        if (fillPercentage >= 50 && fillPercentage < 80) {
          // Remind users tournament is filling up
          const reminderChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
          if (reminderChannel) {
            await reminderChannel.send(
              `⚠️ **${tournament.title}** is filling fast! ${tournament.currentSlots}/${tournament.maxSlots} slots filled. Join now in <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>!`
            ).catch(()=>{});
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking tournament reminders:', error.message);
  }
}, 1800000); // Every 30 minutes

// Cleanup old tickets daily
setInterval(async () => {
  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const tickets = loadData('tickets.json');
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    for (const [channelId, ticketData] of Object.entries(tickets)) {
      const age = now - ticketData.createdAt;
      if (age > 7 * dayInMs) {
        try {
          const channel = guild.channels.cache.get(channelId);
          if (channel) await channel.delete().catch(()=>{});
          delete tickets[channelId];
        } catch (error) {
          console.log(`Could not delete old ticket ${channelId}`);
        }
      }
    }
    
    saveData('tickets.json', tickets);
    console.log('✅ Cleaned up old tickets');
  } catch (error) {
    console.error('Error cleaning tickets:', error.message);
  }
}, 86400000); // Every 24 hours

// Backup system daily
setInterval(async () => {
  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    
    const backup = {
      profiles: loadData('profiles.json'),
      tournaments: loadData('tournaments.json'),
      invites: loadData('invites.json'),
      leaderboard: loadData('leaderboard.json'),
      timestamp: Date.now()
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    // Keep only last 7 backups
    const backups = fs.readdirSync(backupDir).sort().reverse();
    if (backups.length > 7) {
      for (let i = 7; i < backups.length; i++) {
        fs.unlinkSync(path.join(backupDir, backups[i]));
      }
    }
    
    console.log('✅ Data backed up');
  } catch (error) {
    console.error('Error creating backup:', error.message);
  }
}, 86400000); // Every 24 hours

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    botStatus: client.ws.status === 0 ? 'Connected' : 'Disconnected',
    guilds: client.guilds.cache.size,
    users: client.users.cache.size
  };
  res.json(health);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  try {
    // Create final backup
    const backup = {
      profiles: loadData('profiles.json'),
      tournaments: loadData('tournaments.json'),
      invites: loadData('invites.json'),
      timestamp: Date.now()
    };
    
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(
      path.join(backupDir, 'shutdown-backup.json'),
      JSON.stringify(backup, null, 2)
    );
    
    console.log('✅ Final backup created');
    
    // Destroy client
    client.destroy();
    console.log('✅ Bot disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

console.log('✅ All bot systems loaded and ready!');

// ============================================
// LOGIN
// ============================================
if (!CONFIG.TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set in environment variables.');
  process.exit(1);
}

client.login(CONFIG.TOKEN).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});
