

require('dotenv').config();
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
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
  ChannelType,
  Collection
} = require('discord.js');

// ---------------------- Express server ----------------------
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('OTO Tournament Bot is running!'));
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    wsStatus: client?.ws?.status === 0 ? 'Connected' : 'Disconnected',
    guilds: client?.guilds?.cache?.size || 0,
    users: client?.users?.cache?.size || 0
  });
});
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));

// ---------------------- Configuration ----------------------
const CONFIG = {
  TOKEN: process.env.DISCORD_BOT_TOKEN,
  GUILD_ID: process.env.GUILD_ID || 'YOUR_GUILD_ID_HERE',
  OWNER_ID: process.env.OWNER_ID || 'YOUR_OWNER_ID_HERE',
  CHANNELS: {
    GENERAL: process.env.CHANNEL_GENERAL || '1438482904018849835',
    ANNOUNCEMENT: process.env.CHANNEL_ANNOUNCEMENT || '1438484746165555243',
    PROFILE: process.env.CHANNEL_PROFILE || '1439542574066176020',
    TOURNAMENT_SCHEDULE: process.env.CHANNEL_TOURNAMENT_SCHEDULE || '1438482561679626303',
    INVITE_TRACKER: process.env.CHANNEL_INVITE_TRACKER || '1439216884774998107',
    LEADERBOARD: process.env.CHANNEL_LEADERBOARD || '1438947356690223347',
    STAFF_TOOLS: process.env.CHANNEL_STAFF_TOOLS || '1438486059255336970',
    OWNER_TOOLS: process.env.CHANNEL_OWNER_TOOLS || '1439218596877308005',
    WELCOME_CHANNEL: process.env.CHANNEL_WELCOME || '1441653083120603187',
    SUPPORT: process.env.CHANNEL_SUPPORT || '1438485759891079180',
    TICKET_LOG: process.env.CHANNEL_TICKET_LOG || '1438485821572518030',
    MOD_LOG: process.env.CHANNEL_MOD_LOG || '1438506342938706092',
    TICKET_CATEGORY: process.env.TICKET_CATEGORY_ID || 'YOUR_TICKET_CATEGORY_ID',
    BOT_COMMANDS: process.env.CHANNEL_BOT_COMMANDS || '1438483009950191676',
    PLAYER_FORM: process.env.CHANNEL_PLAYER_FORM || '1438486008453660863',
    CELEBRATION: process.env.CHANNEL_CELEBRATION || '1441653083120603187',
    MATCH_REPORTS: process.env.CHANNEL_MATCH_REPORTS || '1438486113047150714',
    PAYMENT_PROOF: process.env.CHANNEL_PAYMENT_PROOF || '1438486113047150714',
    MOST_PLAYER_LB: process.env.CHANNEL_MOST_PLAYER_LB || '1439226024863993988',
    ACHIEVEMENTS: process.env.CHANNEL_ACHIEVEMENTS || '1439226024863993988'
  },
  ROLES: {
    OWNER: process.env.ROLE_OWNER || '1438443937588183110',
    ADMIN: process.env.ROLE_ADMIN || '1438475461977047112',
    STAFF: process.env.ROLE_STAFF || '1438475461977047112',
    PLAYER: process.env.ROLE_PLAYER || process.env.PLAYER_ROLE_ID || 'player_role_id',
    VERIFIED: process.env.ROLE_VERIFIED || process.env.VERIFIED_ROLE_ID || 'verified_role_id',
    RECRUITER: process.env.ROLE_RECRUITER || process.env.RECRUITER_ROLE_ID || 'recruiter_role_id',
    PRO_RECRUITER: process.env.ROLE_PRO_RECRUITER || process.env.PRO_RECRUITER_ROLE_ID || 'pro_recruiter_role_id',
    ELITE_RECRUITER: process.env.ROLE_ELITE_RECRUITER || process.env.ELITE_RECRUITER_ROLE_ID || 'elite_recruiter_role_id'
  }
};

// Validate minimal env
if (!CONFIG.TOKEN) {
  console.error('DISCORD_BOT_TOKEN is required in environment.');
  process.exit(1);
}

// ---------------------- Data directory & helpers ----------------------
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const DATA_FILES = {
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

for (const fn of Object.values(DATA_FILES)) {
  const fp = path.join(DATA_DIR, fn);
  if (!fs.existsSync(fp)) fs.writeFileSync(fp, JSON.stringify({}));
}

function loadData(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf8') || '{}');
  } catch (e) {
    console.error('loadData error', e);
    return {};
  }
}
function saveData(filename, data) {
  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('saveData error', e);
  }
}

// Small helpers to use keys
const L = {
  profiles: () => loadData(DATA_FILES.profiles),
  tournaments: () => loadData(DATA_FILES.tournaments),
  tickets: () => loadData(DATA_FILES.tickets),
  invites: () => loadData(DATA_FILES.invites),
  warnings: () => loadData(DATA_FILES.warnings),
  settings: () => loadData(DATA_FILES.settings),
  lobbies: () => loadData(DATA_FILES.lobbies),
  customRoles: () => loadData(DATA_FILES.customRoles),
  staffApps: () => loadData(DATA_FILES.staffApps)
};
const S = {
  profiles: (d) => saveData(DATA_FILES.profiles, d),
  tournaments: (d) => saveData(DATA_FILES.tournaments, d),
  tickets: (d) => saveData(DATA_FILES.tickets, d),
  invites: (d) => saveData(DATA_FILES.invites, d),
  warnings: (d) => saveData(DATA_FILES.warnings, d),
  settings: (d) => saveData(DATA_FILES.settings, d),
  lobbies: (d) => saveData(DATA_FILES.lobbies, d),
  customRoles: (d) => saveData(DATA_FILES.customRoles, d),
  staffApps: (d) => saveData(DATA_FILES.staffApps, d)
};

// ---------------------- Static data ----------------------
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

const BAD_WORDS = ['badword1', 'badword2', 'spam', 'scam'];

// ---------------------- Client ----------------------
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
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

// Temp in-memory maps
client.tempProfiles = new Map();        // { userId -> { name, game, state, ... } }
client.broadcastChannels = new Map();   // userId -> [channelIds]
const invitesCache = new Map();         // guildId -> Map(code -> uses)
const userMessages = new Map();         // for spam detection
const lastAutoResponses = new Map();    // rate-limit auto replies

// ---------------------- Utility functions ----------------------
function generateOTOID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'OTO';
  for (let i = 0; i < 5; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}
function generateTournamentID() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const tournaments = L.tournaments();
  const todayCount = Object.keys(tournaments).filter(id => id.startsWith(`OTO-${yy}${mm}${dd}`)).length;
  return `OTO-${yy}${mm}${dd}-${String(todayCount + 1).padStart(3, '0')}`;
}
function containsBadWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BAD_WORDS.some(w => lower.includes(w));
}
function isSpamming(userId) {
  const now = Date.now();
  const arr = userMessages.get(userId) || [];
  const recent = arr.filter(t => now - t < 5000);
  recent.push(now);
  userMessages.set(userId, recent);
  return recent.length > 5;
}
function saveUserProfile(userId, data) {
  const profiles = L.profiles();
  profiles[userId] = data;
  S.profiles(profiles);
}
function getUserProfile(userId) {
  const profiles = L.profiles();
  return profiles[userId] || null;
}
function hasProfile(userId) {
  return !!getUserProfile(userId);
}
async function logToChannel(guild, channelId, embed) {
  try {
    if (!guild || !channelId) return;
    const ch = guild.channels.cache.get(channelId);
    if (ch) await ch.send({ embeds: [embed] });
  } catch (e) {
    console.error('logToChannel error', e);
  }
}

// ---------------------- Achievements ----------------------
async function checkAndAwardAchievements(userId, guild) {
  try {
    const profile = getUserProfile(userId);
    if (!profile) return;
    profile.achievements = profile.achievements || [];
    const newAch = [];

    // wins
    if (profile.stats.wins >= 1 && !profile.achievements.includes('FIRST_WIN')) newAch.push('FIRST_WIN');
    if (profile.stats.wins >= 5 && !profile.achievements.includes('FIVE_WINS')) newAch.push('FIVE_WINS');
    if (profile.stats.wins >= 10 && !profile.achievements.includes('TEN_WINS')) newAch.push('TEN_WINS');
    if (profile.stats.wins >= 20 && !profile.achievements.includes('TWENTY_WINS')) newAch.push('TWENTY_WINS');

    // invites
    if (profile.stats.invites >= 1 && !profile.achievements.includes('FIRST_INVITE')) newAch.push('FIRST_INVITE');
    if (profile.stats.invites >= 10 && !profile.achievements.includes('TEN_INVITES')) newAch.push('TEN_INVITES');
    if (profile.stats.invites >= 50 && !profile.achievements.includes('FIFTY_INVITES')) newAch.push('FIFTY_INVITES');
    if (profile.stats.invites >= 100 && !profile.achievements.includes('HUNDRED_INVITES')) newAch.push('HUNDRED_INVITES');

    // played
    if (profile.stats.played >= 1 && !profile.achievements.includes('FIRST_TOURNAMENT')) newAch.push('FIRST_TOURNAMENT');
    if (profile.stats.played >= 10 && !profile.achievements.includes('TEN_TOURNAMENTS')) newAch.push('TEN_TOURNAMENTS');
    if (profile.stats.played >= 50 && !profile.achievements.includes('FIFTY_TOURNAMENTS')) newAch.push('FIFTY_TOURNAMENTS');
    if (profile.stats.played >= 100 && !profile.achievements.includes('HUNDRED_TOURNAMENTS')) newAch.push('HUNDRED_TOURNAMENTS');

    // earnings
    if (profile.stats.earned >= 1 && !profile.achievements.includes('FIRST_EARNING')) newAch.push('FIRST_EARNING');
    if (profile.stats.earned >= 1000 && !profile.achievements.includes('THOUSAND_EARNED')) newAch.push('THOUSAND_EARNED');
    if (profile.stats.earned >= 5000 && !profile.achievements.includes('FIVE_THOUSAND_EARNED')) newAch.push('FIVE_THOUSAND_EARNED');

    for (const key of newAch) {
      profile.achievements.push(key);
      const def = ACHIEVEMENTS[key];
      try {
        const user = await client.users.fetch(userId);
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🎉 ACHIEVEMENT UNLOCKED!')
          .setDescription(`${def.emoji} **${def.name}**\n\n${def.description}`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: 'OTO Achievements' })
          .setTimestamp();
        await user.send({ embeds: [embed] }).catch(() => {});
        const celebrateCh = guild?.channels?.cache?.get(CONFIG.CHANNELS.CELEBRATION);
        if (celebrateCh) await celebrateCh.send({ content: `🎉 <@${userId}> unlocked **${def.name}** ${def.emoji}`, embeds: [embed] }).catch(()=>{});
      } catch (e) {}
    }
    saveUserProfile(userId, profile);
  } catch (e) {
    console.error('checkAndAwardAchievements error', e);
  }
}

// ---------------------- Profile Embed ----------------------
function createProfileEmbed(user, profileData) {
  const gameEmojis = { freefire: '🔥', minecraft: '⛏️', other: '🎮' };
  const genderEmoji = profileData.gender === 'male' ? '👨' : profileData.gender === 'female' ? '👩' : '❓';
  const achievementsText = (profileData.achievements || []).slice(0, 5).map(a => ACHIEVEMENTS[a]?.emoji || '').join(' ') || 'No achievements yet';
  return new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`🎮 ${profileData.name?.toUpperCase() || 'PLAYER'}'S PROFILE CARD`)
    .setThumbnail(user.displayAvatarURL?.({ dynamic: true, size: 256 }) || '')
    .setDescription('━━━━━━━━━━━━━━━━━━━━━━')
    .addFields(
      { name: '👤 Name', value: profileData.name || 'N/A', inline: true },
      { name: '🆔 OTO ID', value: profileData.otoId || 'N/A', inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: `${gameEmojis[profileData.game] || '🎮'} Game`, value: (profileData.game || 'N/A').toUpperCase(), inline: true },
      { name: '📍 State', value: profileData.state || 'N/A', inline: true },
      { name: `${genderEmoji} Gender`, value: profileData.gender ? (profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)) : 'N/A', inline: true }
    )
    .addFields({ name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━' })
    .addFields(
      { name: '📊 STATS', value: `🏆 Wins: ${profileData.stats?.wins || 0}\n🎮 Played: ${profileData.stats?.played || 0}\n💰 Earned: ₹${profileData.stats?.earned || 0}\n👥 Invites: ${profileData.stats?.invites || 0}`, inline: true },
      { name: '⭐ Level', value: `Level ${profileData.level || 1} (${(profileData.badges || []).join(' ') || 'New Player'})`, inline: true }
    )
    .addFields({ name: '\u200B', value: '━━━━━━━━━━━━━━━━━━━━━━' })
    .addFields({ name: '🏅 Achievements', value: achievementsText, inline: false })
    .setFooter({ text: `Joined: ${profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}` })
    .setTimestamp();
}

// ---------------------- Invite tracking ----------------------
async function initInvitesCache() {
  try {
    if (!CONFIG.GUILD_ID) return;
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const invites = await guild.invites.fetch().catch(() => new Collection());
    invitesCache.set(guild.id, new Map(invites.map(i => [i.code, i.uses])));
  } catch (e) {
    console.log('initInvitesCache error', e);
  }
}

async function trackInvite(member) {
  try {
    const guild = member.guild;
    const cached = invitesCache.get(guild.id) || new Map();
    const current = await guild.invites.fetch();
    const used = current.find(inv => (cached.get(inv.code) || 0) < inv.uses);
    invitesCache.set(guild.id, new Map(current.map(i => [i.code, i.uses])));
    if (!used) return;
    const inviter = used.inviter;
    if (!inviter) return;
    const invitesData = L.invites();
    invitesData[inviter.id] = invitesData[inviter.id] || { total: 0, active: 0, fake: 0, rewards: [] };
    invitesData[inviter.id].total++;
    invitesData[inviter.id].active++;
    S.invites(invitesData);

    const profile = getUserProfile(inviter.id);
    if (profile) {
      profile.stats.invites = invitesData[inviter.id].total;
      saveUserProfile(inviter.id, profile);
      await checkAndAwardAchievements(inviter.id, guild);
    }
    await checkInviteMilestone(guild, inviter.id);
  } catch (e) {
    console.error('trackInvite error', e);
  }
}

async function checkInviteMilestone(guild, userId) {
  try {
    const invitesData = L.invites();
    const u = invitesData[userId];
    if (!u) return;

    // 5 invites
    if (u.total >= 5 && !u.rewards?.includes('5_invites')) {
      u.rewards = u.rewards || [];
      u.rewards.push('5_invites');
      S.invites(invitesData);
      const user = await client.users.fetch(userId).catch(()=>null);
      if (user) {
        const embed = new EmbedBuilder().setTitle('🎉 CONGRATULATIONS!').setDescription('You invited 5 members! You unlocked a FREE MATCH challenge.').setColor('#FFD700');
        const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('request_free_match').setLabel('⚔️ REQUEST MATCH').setStyle(ButtonStyle.Danger));
        await user.send({ embeds: [embed], components: [btn] }).catch(()=>{});
      }
      await updateInviteTracker(guild);
    }

    // 10,20,50 similar handling
    if (u.total >= 10 && !u.rewards?.includes('10_invites')) {
      u.rewards.push('10_invites'); S.invites(invitesData);
      const member = await guild.members.fetch(userId).catch(()=>null);
      if (member && CONFIG.ROLES.RECRUITER) await member.roles.add(CONFIG.ROLES.RECRUITER).catch(()=>{});
      const user = await client.users.fetch(userId).catch(()=>null);
      if (user) await user.send('🎉 10 INVITES: You unlocked Recruiter role and 1 FREE tournament entry!').catch(()=>{});
    }
    if (u.total >= 20 && !u.rewards?.includes('20_invites')) {
      u.rewards.push('20_invites'); S.invites(invitesData);
      const member = await guild.members.fetch(userId).catch(()=>null);
      if (member && CONFIG.ROLES.PRO_RECRUITER) await member.roles.add(CONFIG.ROLES.PRO_RECRUITER).catch(()=>{});
      const user = await client.users.fetch(userId).catch(()=>null);
      if (user) await user.send('🌟 20 INVITES: You unlocked Pro Recruiter role and 50% discounts!').catch(()=>{});
    }
    if (u.total >= 50 && !u.rewards?.includes('50_invites')) {
      u.rewards.push('50_invites'); S.invites(invitesData);
      const member = await guild.members.fetch(userId).catch(()=>null);
      if (member && CONFIG.ROLES.ELITE_RECRUITER) await member.roles.add(CONFIG.ROLES.ELITE_RECRUITER).catch(()=>{});
      const user = await client.users.fetch(userId).catch(()=>null);
      if (user) await user.send('💫 50 INVITES: You unlocked Elite Recruiter role and 5 FREE entries!').catch(()=>{});
    }
  } catch (e) {
    console.error('checkInviteMilestone', e);
  }
}

// ---------------------- DM Profile creation ----------------------
async function sendProfileCreationDM(user) {
  const embed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle(`🎊 WELCOME ${user.username.toUpperCase()}!`)
    .setDescription('Create your OTO profile in 30 seconds by clicking the CREATE PROFILE button below!')
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }));
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('start_profile_creation').setLabel('✨ CREATE PROFILE').setStyle(ButtonStyle.Success).setEmoji('🎮')
  );
  await user.send({ embeds: [embed], components: [row] });
}

// ---------------------- Setup functions for channels/panels ----------------------
async function setupAnnouncementMessage(guild) {
  try {
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.ANNOUNCEMENT);
    if (!ch) return;
    const embed = new EmbedBuilder()
      .setTitle('📜 WELCOME TO OTO TOURNAMENTS!')
      .setDescription(`To talk, create your OTO profile via DM. Click the button below to resend profile DM.`)
      .setColor('#4CAF50')
      .setThumbnail(guild.iconURL({ dynamic: true }));
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('resend_profile_dm').setLabel('📩 Resend Profile DM').setStyle(ButtonStyle.Primary));
    // edit existing bot message if present
    const msgs = await ch.messages.fetch({ limit: 20 }).catch(()=>new Collection());
    const existing = msgs.find(m => m.author.id === client.user.id && m.embeds?.[0]?.title?.includes('WELCOME TO OTO'));
    if (existing) await existing.edit({ embeds: [embed], components: [row] }).catch(()=>{});
    else { const msg = await ch.send({ embeds: [embed], components: [row] }).catch(()=>null); if (msg) await msg.pin().catch(()=>{}); }
  } catch (e) { console.error('setupAnnouncementMessage', e); }
}

async function setupSupportTickets(guild) {
  try {
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.SUPPORT);
    if (!ch) return;
    const embed = new EmbedBuilder().setTitle('🎫 SUPPORT TICKETS').setDescription('Click to create a support ticket.').setColor('#4CAF50');
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_support_ticket').setLabel('📩 Create Support Ticket').setStyle(ButtonStyle.Success));
    const msgs = await ch.messages.fetch({ limit: 20 }).catch(()=>new Collection());
    const existing = msgs.find(m => m.author.id === client.user.id && m.embeds?.[0]?.title?.includes('SUPPORT TICKETS'));
    if (existing) await existing.edit({ embeds: [embed], components: [row] }).catch(()=>{});
    else { const msg = await ch.send({ embeds: [embed], components: [row] }).catch(()=>null); if (msg) await msg.pin().catch(()=>{}); }
  } catch (e) { console.error('setupSupportTickets', e); }
}

async function pinStaffToolsGuide(guild) {
  try {
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.STAFF_TOOLS);
    if (!ch) return;
    const embed = new EmbedBuilder().setTitle('🛠️ STAFF COMMANDS').setDescription('Quick access panel for staff.').setColor('#2196F3');
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('staff_create_tournament').setLabel('🎮 Create Tournament').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('staff_list_tournaments').setLabel('📋 View Tournaments').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('staff_view_stats').setLabel('📊 Server Stats').setStyle(ButtonStyle.Secondary)
      );
    const msgs = await ch.messages.fetch({ limit: 50 }).catch(()=>new Collection());
    const deletable = msgs.filter(m => m.author.id === client.user.id && ((Date.now() - m.createdTimestamp) / (1000*60*60*24) < 14));
    if (deletable.size > 0) await ch.bulkDelete(deletable, true).catch(()=>{});
    const msg = await ch.send({ embeds: [embed], components: [row] }).catch(()=>null);
    if (msg) await msg.pin().catch(()=>{});
  } catch (e) { console.error('pinStaffToolsGuide', e); }
}

async function pinOwnerToolsGuide(guild) {
  try {
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.OWNER_TOOLS);
    if (!ch) return;
    const embed = new EmbedBuilder().setTitle('👑 OWNER COMMANDS').setDescription('Owner quick panel').setColor('#FF0000');
    const rows = [
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('owner_view_stats').setLabel('📊 Stats').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('owner_view_players').setLabel('👥 Players').setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('owner_manage_staff').setLabel('⚙️ Staff').setStyle(ButtonStyle.Secondary)),
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('owner_broadcast').setLabel('📢 Broadcast').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('owner_staff_applications').setLabel('📝 Staff Apps').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('owner_clear_support').setLabel('🧹 Clear Support').setStyle(ButtonStyle.Secondary)),
      new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('owner_maintenance').setLabel('🛠️ Maintenance').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('owner_manage_roles').setLabel('🎭 Manage Roles').setStyle(ButtonStyle.Success))
    ];
    const msgs = await ch.messages.fetch({ limit: 50 }).catch(()=>new Collection());
    const deletable = msgs.filter(m => m.author.id === client.user.id && ((Date.now() - m.createdTimestamp) / (1000*60*60*24) < 14));
    if (deletable.size > 0) await ch.bulkDelete(deletable, true).catch(()=>{});
    const msg = await ch.send({ embeds: [embed], components: rows }).catch(()=>null);
    if (msg) await msg.pin().catch(()=>{});
  } catch (e) { console.error('pinOwnerToolsGuide', e); }
}

async function setupBotCommandsChannel(guild) {
  try {
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.BOT_COMMANDS);
    if (!ch) return;
    const embed = new EmbedBuilder().setTitle('🤖 BOT COMMANDS - USER GUIDE').setDescription('Slash command list: /profile /invites /achievements /help ...').setColor('#2196F3');
    const msgs = await ch.messages.fetch({ limit: 20 }).catch(()=>new Collection());
    const deletable = msgs.filter(m => m.author.id === client.user.id && ((Date.now() - m.createdTimestamp) / (1000*60*60*24) < 14));
    if (deletable.size > 0) await ch.bulkDelete(deletable, true).catch(()=>{});
    const msg = await ch.send({ embeds: [embed] }).catch(()=>null);
    if (msg) await msg.pin().catch(()=>{});
  } catch (e) { console.error('setupBotCommandsChannel', e); }
}

async function setupStaffApplications(guild) {
  try {
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.PLAYER_FORM);
    if (!ch) return;
    const embed = new EmbedBuilder().setTitle('📝 STAFF APPLICATIONS NOW OPEN!').setDescription('Click to apply for staff.').setColor('#4CAF50');
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('apply_staff').setLabel('📝 APPLY FOR STAFF').setStyle(ButtonStyle.Success));
    const msgs = await ch.messages.fetch({ limit: 20 }).catch(()=>new Collection());
    const existing = msgs.find(m => m.author.id === client.user.id && m.embeds?.[0]?.title?.includes('STAFF APPLICATIONS'));
    if (existing) await existing.edit({ embeds: [embed], components: [row] }).catch(()=>{});
    else { const msg = await ch.send({ embeds: [embed], components: [row] }).catch(()=>null); if (msg) await msg.pin().catch(()=>{}); }
  } catch (e) { console.error('setupStaffApplications', e); }
}

// ---------------------- Tournament system ----------------------
async function postTournament(interactionOrGuild, tournamentData) {
  // Accept either interaction (post from staff) or guild (background posting)
  let guild;
  try {
    if (interactionOrGuild?.guild) guild = interactionOrGuild.guild;
    else guild = interactionOrGuild;
    if (!guild) guild = await client.guilds.fetch(CONFIG.GUILD_ID);
  } catch (e) {
    console.error('postTournament fetch guild error', e);
    return;
  }

  try {
    const tournaments = L.tournaments();
    const id = generateTournamentID();
    tournamentData.id = id;
    tournaments[id] = tournamentData;
    S.tournaments(tournaments);

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`${(tournamentData.game === 'freefire' ? '🔥' : tournamentData.game === 'minecraft' ? '⛏️' : '🎮')} ${tournamentData.title.toUpperCase()}`)
      .setDescription(`${tournamentData.description || ''}\n\n🟢 Registration is now OPEN!`)
      .addFields(
        { name: '💰 Prize Pool', value: `₹${tournamentData.prizePool}`, inline: true },
        { name: '🎫 Entry Fee', value: `₹${tournamentData.entryFee}`, inline: true },
        { name: '📊 Slots', value: `**${tournamentData.currentSlots}/${tournamentData.maxSlots}**`, inline: true },
        { name: '⏰ Time', value: tournamentData.time || 'TBA', inline: true },
        { name: '🗺️ Map', value: (tournamentData.map || 'N/A').toString().toUpperCase(), inline: true },
        { name: '🎯 Mode', value: (tournamentData.mode || 'N/A').toString().toUpperCase(), inline: true }
      )
      .addFields({ name: '🏆 Prize Distribution', value: Object.entries(tournamentData.prizeDistribution || {}).map(([p,a]) => `${p}: ₹${a}`).join('\n') || 'N/A' })
      .addFields({ name: '🆔 Tournament ID', value: `\`${id}\``, inline: false })
      .setFooter({ text: 'Click JOIN NOW to participate! • OTO Tournaments' })
      .setTimestamp();

    const joinButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`join_tournament_${id}`).setLabel('🎮 JOIN NOW').setStyle(ButtonStyle.Success));

    const scheduleChannel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    if (scheduleChannel) {
      const msg = await scheduleChannel.send({ embeds: [embed], components: [joinButton] }).catch(()=>null);
      if (msg) {
        tournaments[id].messageId = msg.id;
        S.tournaments(tournaments);
      }
    }

    const general = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
    if (general) await general.send({ content: `🚨 **NEW TOURNAMENT ALERT!**\nCheck <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> to join!`, embeds: [embed], components: [joinButton] }).catch(()=>{});

    // notify owner DM
    try {
      const owner = await client.users.fetch(CONFIG.OWNER_ID).catch(()=>null);
      if (owner) {
        const reminderEmbed = new EmbedBuilder().setColor('#FFD700').setTitle('📢 Tournament Created - Reminder').setDescription(`**Tournament:** ${tournamentData.title}\n**ID:** ${id}\n**Slots:** ${tournamentData.maxSlots}\n**Entry Fee:** ₹${tournamentData.entryFee}\n**Prize Pool:** ₹${tournamentData.prizePool}`).setTimestamp();
        await owner.send({ embeds: [reminderEmbed] }).catch(()=>{});
      }
    } catch (e) {}

    if (interactionOrGuild?.reply) {
      await interactionOrGuild.reply({ content: `✅ Tournament created successfully! ID: ${id}`, ephemeral: true }).catch(()=>{});
    }
  } catch (e) {
    console.error('postTournament error', e);
    if (interactionOrGuild?.reply) await interactionOrGuild.reply({ content: `❌ Error creating tournament: ${e.message}`, ephemeral: true }).catch(()=>{});
  }
}

async function updateTournamentMessage(tournament) {
  try {
    if (!tournament || !tournament.messageId || !CONFIG.GUILD_ID) return;
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    if (!channel) return;
    const message = await channel.messages.fetch(tournament.messageId).catch(()=>null);
    if (!message) return;
    const statusEmojis = { open: '🟢', filling: '🟡', almost_full: '🟠', closed: '🔴', live: '⚫', completed: '✅' };
    const embed = new EmbedBuilder()
      .setColor(tournament.status === 'closed' ? '#FF0000' : '#FF6B6B')
      .setTitle(`${(tournament.game === 'freefire' ? '🔥' : tournament.game === 'minecraft' ? '⛏️' : '🎮')} ${tournament.title.toUpperCase()}`)
      .setDescription(`${tournament.description || ''}\n\n${statusEmojis[tournament.status] || ''} Registration is now **${(tournament.status || 'open').toUpperCase()}!**`)
      .addFields(
        { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
        { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
        { name: '📊 Slots', value: `${tournament.currentSlots}/${tournament.maxSlots}`, inline: true },
        { name: '⏰ Time', value: tournament.time || 'TBA', inline: true },
        { name: '🗺️ Map', value: tournament.map ? tournament.map.toUpperCase() : 'N/A', inline: true },
        { name: '🎯 Mode', value: tournament.mode ? tournament.mode.toUpperCase() : 'N/A', inline: true }
      )
      .addFields({ name: '🏆 Prize Distribution', value: Object.entries(tournament.prizeDistribution || {}).map(([p,a]) => `${p}: ₹${a}`).join('\n') || 'N/A' })
      .addFields({ name: '🆔 Tournament ID', value: `\`${tournament.id}\``, inline: false })
      .setFooter({ text: 'Click JOIN NOW to participate!' })
      .setTimestamp();
    const joinBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`join_tournament_${tournament.id}`).setLabel(tournament.status === 'closed' ? '🔴 FULL' : '🎮 JOIN NOW').setStyle(tournament.status === 'closed' ? ButtonStyle.Danger : ButtonStyle.Success).setDisabled(tournament.status === 'closed'));
    await message.edit({ embeds: [embed], components: [joinBtn] }).catch(()=>{});
  } catch (e) { console.error('updateTournamentMessage', e); }
}

async function handleTournamentJoin(interaction, tournamentId) {
  try {
    await interaction.deferReply({ ephemeral: true });
    const tournaments = L.tournaments();
    const tournament = tournaments[tournamentId];
    if (!tournament) return interaction.editReply({ content: '❌ Tournament not found!', ephemeral: true });
    if (!['open','filling','almost_full'].includes(tournament.status)) return interaction.editReply({ content: '❌ Registration closed for this tournament!', ephemeral: true });
    if ((tournament.currentSlots || 0) >= (tournament.maxSlots || 0)) return interaction.editReply({ content: '❌ Tournament is full!', ephemeral: true });
    if ((tournament.participants || []).includes(interaction.user.id)) return interaction.editReply({ content: '❌ You have already joined this tournament!', ephemeral: true });

    const modal = new ModalBuilder().setCustomId(`confirm_join_${tournamentId}`).setTitle('Confirm Tournament Entry');
    const ignInput = new TextInputBuilder().setCustomId('ign_input').setLabel('Your In-Game Name (IGN)').setStyle(TextInputStyle.Short).setRequired(true);
    const confirmInput = new TextInputBuilder().setCustomId('confirm_input').setLabel('Type "CONFIRM" to proceed').setStyle(TextInputStyle.Short).setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(ignInput), new ActionRowBuilder().addComponents(confirmInput));
    await interaction.showModal(modal);
  } catch (e) { console.error('handleTournamentJoin', e); try { if (!interaction.replied) await interaction.reply({ content: 'Error', ephemeral: true }); } catch {} }
}

// When payment is confirmed by staff, move user into tournament
async function handlePaymentConfirmation(interaction, ticketId) {
  try {
    const member = interaction.member;
    const isStaff = member?.roles?.cache?.has(CONFIG.ROLES.STAFF) || member?.roles?.cache?.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
    if (!isStaff) return interaction.reply({ content: '❌ Only staff can confirm payments!', ephemeral: true });

    const tickets = L.tickets();
    const ticket = tickets[ticketId];
    if (!ticket) return interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });

    const tournaments = L.tournaments();
    const tournament = tournaments[ticket.tournamentId];
    if (!tournament) return interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });

    tournament.participants = tournament.participants || [];
    tournament.participants.push(ticket.userId);
    tournament.currentSlots = (tournament.currentSlots || 0) + 1;

    const fillPct = (tournament.currentSlots / tournament.maxSlots) * 100;
    if (fillPct >= 100) tournament.status = 'closed';
    else if (fillPct >= 80) tournament.status = 'almost_full';
    else if (fillPct >= 50) tournament.status = 'filling';

    tournaments[ticket.tournamentId] = tournament;
    S.tournaments(tournaments);

    await updateTournamentMessage(tournament);

    const user = await client.users.fetch(ticket.userId).catch(()=>null);
    const confirmEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ ENTRY CONFIRMED!').setDescription(`Your entry for **${tournament.title}** has been confirmed!\nSlot: ${tournament.currentSlots}/${tournament.maxSlots}`).setFooter({ text: `Tournament ID: ${tournament.id}` }).setTimestamp();
    if (user) await user.send({ embeds: [confirmEmbed] }).catch(()=>{});
    await interaction.channel.send({ embeds: [confirmEmbed] }).catch(()=>{});

    const profile = getUserProfile(ticket.userId);
    if (profile) {
      profile.stats.played = (profile.stats.played || 0) + 1;
      saveUserProfile(ticket.userId, profile);
      await checkAndAwardAchievements(ticket.userId, interaction.guild);
    }

    const logEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Payment Confirmed').setDescription(`${user?.tag || ticket.userId} confirmed for ${tournament.title}`).addFields({ name: 'Tournament ID', value: tournament.id }, { name: 'Confirmed By', value: interaction.user.tag }).setTimestamp();
    await logToChannel(interaction.guild, CONFIG.CHANNELS.TICKET_LOG, logEmbed);

    // delete ticket channel & ticket data after delay
    const ticketsData = L.tickets();
    delete ticketsData[ticketId];
    S.tickets(ticketsData);

    await interaction.reply({ content: '✅ Payment confirmed! User added to tournament.', ephemeral: true });
    setTimeout(async () => {
      try { const ch = await interaction.guild.channels.fetch(ticketId).catch(()=>null); if (ch) await ch.delete().catch(()=>{}); } catch {}
    }, 10000);
  } catch (e) { console.error('handlePaymentConfirmation', e); try { if (!interaction.replied) await interaction.reply({ content: 'Error confirming payment', ephemeral: true }); } catch {} }
}

// ---------------------- Tickets management ----------------------
async function createSupportTicket(interaction) {
  try {
    const guild = interaction.guild;
    const tickets = L.tickets();
    const existing = Object.entries(tickets).find(([id, t]) => t.userId === interaction.user.id && t.type === 'support');
    if (existing) return interaction.reply({ content: `❌ You already have an open support ticket! <#${existing[0]}>`, ephemeral: true });

    const category = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY) || null;
    const channel = await guild.channels.create({
      name: `support-${interaction.user.username}`.slice(0, 90),
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: CONFIG.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: CONFIG.OWNER_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });

    tickets[channel.id] = { userId: interaction.user.id, type: 'support', createdAt: Date.now() };
    S.tickets(tickets);

    const embed = new EmbedBuilder().setTitle('🎫 SUPPORT TICKET').setDescription('Please describe your issue. Staff will assist you shortly.').setColor('#4CAF50');
    const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`close_ticket_${channel.id}`).setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger));
    await channel.send({ content: `<@${interaction.user.id}> <@&${CONFIG.ROLES.STAFF}>`, embeds: [embed], components: [closeBtn] }).catch(()=>{});

    const logEmbed = new EmbedBuilder().setTitle('Support Ticket Created').setDescription(`${interaction.user.tag} created ${channel.name}`).setColor('#4CAF50').setTimestamp();
    await logToChannel(guild, CONFIG.CHANNELS.TICKET_LOG, logEmbed);

    await interaction.reply({ content: `✅ Support ticket created! Check ${channel}`, ephemeral: true });
  } catch (e) { console.error('createSupportTicket', e); try { if (!interaction.replied) await interaction.reply({ content: 'Error creating ticket', ephemeral: true }); } catch {} }
}

async function handleTicketCloseButton(interaction, ticketId) {
  try {
    const member = interaction.member;
    const isStaff = member?.roles?.cache?.has(CONFIG.ROLES.STAFF) || member?.roles?.cache?.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
    if (!isStaff) return interaction.reply({ content: '❌ Only staff can close tickets!', ephemeral: true });

    await interaction.reply({ content: '🔄 Closing ticket in 5 seconds...', ephemeral: false });
    const logEmbed = new EmbedBuilder().setTitle('🎫 Ticket Closed').setDescription(`Ticket <#${ticketId}> closed by ${interaction.user.tag}`).setColor('#FF0000').setTimestamp();
    await logToChannel(interaction.guild, CONFIG.CHANNELS.TICKET_LOG, logEmbed);

    const tickets = L.tickets();
    delete tickets[ticketId];
    S.tickets(tickets);
    setTimeout(async () => {
      try { const ch = await interaction.guild.channels.fetch(ticketId).catch(()=>null); if (ch) await ch.delete().catch(()=>{}); } catch {}
    }, 5000);
  } catch (e) { console.error('handleTicketCloseButton', e); }
}

// Free match request (invite reward)
async function handleFreeMatchRequest(interaction) {
  try {
    const guild = interaction.guild || await client.guilds.fetch(CONFIG.GUILD_ID);
    const category = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY) || null;
    const channel = await guild.channels.create({
      name: `free-match-${interaction.user.username}`.slice(0, 90),
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: CONFIG.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });
    const embed = new EmbedBuilder().setTitle('⚔️ FREE MATCH REQUEST').setDescription(`${interaction.user} requested a free match challenge! Staff please arrange.`).setColor('#FFD700');
    const closeBtn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`close_ticket_${channel.id}`).setLabel('❌ Close Ticket').setStyle(ButtonStyle.Danger));
    await channel.send({ content: `${interaction.user} <@&${CONFIG.ROLES.STAFF}>`, embeds: [embed], components: [closeBtn] }).catch(()=>{});
    await interaction.reply({ content: `✅ Free match request created! Check ${channel}`, ephemeral: true });
  } catch (e) { console.error('handleFreeMatchRequest', e); try { if (!interaction.replied) await interaction.reply({ content: 'Error creating free match ticket', ephemeral: true }); } catch {} }
}

// ---------------------- Moderation ----------------------
async function handleModeration(user, type, message) {
  try {
    const warnings = L.warnings();
    warnings[user.id] = warnings[user.id] || { warnings: 0, history: [] };
    warnings[user.id].warnings++;
    warnings[user.id].history.push({ type, timestamp: Date.now(), channelId: message.channel?.id || null });
    S.warnings(warnings);

    const embed = new EmbedBuilder().setTitle('⚠️ Auto Moderation').setDescription(`**User:** ${user.tag}\n**Type:** ${type}\n**Warnings:** ${warnings[user.id].warnings}`).setColor('#FFA500').addFields({ name: 'Channel', value: `<#${message.channel.id}>` }).setTimestamp();
    await logToChannel(message.guild, CONFIG.CHANNELS.MOD_LOG, embed);

    const member = message.guild.members.cache.get(user.id);

    if (type === 'bad_word') {
      if (warnings[user.id].warnings === 1) await user.send('⚠️ Warning: Please avoid inappropriate language.').catch(()=>{});
      else { if (member) await member.timeout(5 * 60 * 1000, 'Repeated inappropriate language').catch(()=>{}); await user.send('🔴 You have been timed out for 5 minutes due to repeated violations.').catch(()=>{}); }
    } else if (type === 'spam') {
      if (member) await member.timeout(5 * 60 * 1000, 'Spamming messages').catch(()=>{});
      await message.channel.send(`${user} has been timed out for spamming. Please slow down!`).then(m => setTimeout(()=>m.delete().catch(()=>{}), 5000)).catch(()=>{});
    } else if (type === 'unauthorized_link') {
      await user.send('⚠️ Only YouTube links are allowed.').catch(()=>{});
      if (warnings[user.id].warnings >= 2 && member) await member.timeout(60 * 60 * 1000, 'Posting unauthorized links').catch(()=>{});
    }
  } catch (e) { console.error('handleModeration', e); }
}

// ---------------------- Leaderboards & Invite Tracker ----------------------
async function updateLeaderboards(guild) {
  try {
    if (!guild) return;
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.LEADERBOARD);
    if (!ch) return;
    const profiles = L.profiles();
    const mostActive = Object.entries(profiles).sort((a,b)=> (b[1].stats.played||0) - (a[1].stats.played||0)).slice(0,15);
    const mostWins = Object.entries(profiles).sort((a,b)=> (b[1].stats.wins||0) - (a[1].stats.wins||0)).slice(0,15);
    const mostEarnings = Object.entries(profiles).sort((a,b)=> (b[1].stats.earned||0) - (a[1].stats.earned||0)).slice(0,15);

    // clear recent bot messages under 14 days
    const messages = await ch.messages.fetch({ limit: 100 }).catch(()=>new Collection());
    const deletable = messages.filter(m => m.author.id === client.user.id && ((Date.now() - m.createdTimestamp) / (1000*60*60*24) < 14));
    if (deletable.size > 0) await ch.bulkDelete(deletable, true).catch(()=>{});

    const header = new EmbedBuilder().setColor('#FFD700').setTitle('🏆 OTO TOURNAMENTS - LEADERBOARDS 🏆').setDescription(`Updated: <t:${Math.floor(Date.now()/1000)}:R>`).setFooter({ text: 'Updates every hour' }).setTimestamp();
    await ch.send({ embeds: [header] }).catch(()=>{});

    const activeEmbed = new EmbedBuilder().setColor('#4CAF50').setTitle('🎮 MOST ACTIVE PLAYERS').setDescription(mostActive.map(([,p],i)=> `${i+1}. **${p.name}** - Played: ${p.stats.played} | Wins: ${p.stats.wins}`).join('\n') || 'No data').setTimestamp();
    await ch.send({ embeds: [activeEmbed] }).catch(()=>{});
    const winsEmbed = new EmbedBuilder().setColor('#FFD700').setTitle('🏆 TOP WINNERS').setDescription(mostWins.map(([,p],i)=> `${i+1}. **${p.name}** - Wins: ${p.stats.wins} | Earned: ₹${p.stats.earned}`).join('\n') || 'No data').setTimestamp();
    await ch.send({ embeds: [winsEmbed] }).catch(()=>{});
    const earnEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('💰 TOP EARNERS').setDescription(mostEarnings.map(([,p],i)=> `${i+1}. **${p.name}** - Earned: ₹${p.stats.earned} | Wins: ${p.stats.wins}`).join('\n') || 'No data').setTimestamp();
    await ch.send({ embeds: [earnEmbed] }).catch(()=>{});
  } catch (e) { console.error('updateLeaderboards', e); }
}

async function updateInviteTracker(guild) {
  try {
    if (!guild) return;
    const ch = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
    if (!ch) return;
    const invitesData = L.invites();
    const top = Object.entries(invitesData).sort((a,b)=> b[1].total - a[1].total).slice(0,15);
    const description = (await Promise.all(top.map(async ([uid,data],i) => {
      try { const user = await client.users.fetch(uid); return `${i+1}. **${user.username}** - Total: ${data.total} | Active: ${data.active}`; } catch (e) { return null; }
    }))).filter(Boolean).join('\n') || 'No invites yet';
    const embed = new EmbedBuilder().setColor('#FF6B6B').setTitle('📊 INVITE LEADERBOARD').setDescription(description).addFields({ name: '🎁 Rewards', value: '5 invites → FREE match challenge\n10 invites → 1 FREE entry + Recruiter role\n20 invites → 50% discount + Pro Recruiter role\n50 invites → 5 FREE entries + Elite Recruiter role' }).setTimestamp();
    const messages = await ch.messages.fetch({ limit: 10 }).catch(()=>new Collection());
    const existing = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);
    if (existing) await existing.edit({ embeds: [embed] }).catch(()=>{});
    else await ch.send({ embeds: [embed] }).catch(()=>{});
  } catch (e) { console.error('updateInviteTracker', e); }
}

// ---------------------- Interaction handler (single centralized) ----------------------
client.on('interactionCreate', async (interaction) => {
  try {
    // ChatInput commands
    if (interaction.isChatInputCommand?.()) {
      const cmd = interaction.commandName;
      // Basic commands implemented here; complex ones leverage earlier functions
      if (cmd === 'profile') {
        const profile = getUserProfile(interaction.user.id);
        if (!profile) return interaction.reply({ content: `❌ You don't have a profile yet. Check your DMs or click the announcement button.`, ephemeral: true });
        return interaction.reply({ embeds: [createProfileEmbed(interaction.user, profile)], ephemeral: true });
      }
      if (cmd === 'invites') {
        const invites = L.invites();
        const u = invites[interaction.user.id] || { total:0, active:0, fake:0 };
        const next = u.total < 5 ? 5 : u.total < 10 ? 10 : u.total < 20 ? 20 : 50;
        const remaining = next - u.total;
        const embed = new EmbedBuilder().setTitle('📊 YOUR INVITE STATISTICS').setColor('#9C27B0').addFields({ name: 'Total Invites', value: `${u.total}`, inline: true }, { name: 'Active', value: `${u.active}`, inline: true }, { name: 'Fake/Left', value: `${u.fake}`, inline: true }, { name: 'Next Reward', value: `${remaining} more to ${next}`, inline: false }).setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      if (cmd === 'achievements') {
        const profile = getUserProfile(interaction.user.id);
        if (!profile) return interaction.reply({ content: '❌ You don\'t have a profile yet!', ephemeral: true });
        const keys = profile.achievements || [];
        const list = keys.map(k => `${ACHIEVEMENTS[k]?.emoji || ''} **${ACHIEVEMENTS[k]?.name || k}** - ${ACHIEVEMENTS[k]?.description || ''}`).join('\n\n') || 'No achievements yet';
        const total = Object.keys(ACHIEVEMENTS).length;
        const progress = ((keys.length / total) * 100).toFixed(1);
        const embed = new EmbedBuilder().setTitle('🏅 YOUR ACHIEVEMENTS').setColor('#FFD700').setDescription(`Progress: ${keys.length}/${total} (${progress}%)\n\n${list}`).setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Tournament create/list handled via helper functions
      if (cmd === 'tournament-create') {
        const member = interaction.member;
        const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || member.roles.cache.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
        if (!isStaff) return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
        const type = interaction.options.getString('type');
        return createTournament(interaction, type);
      }

      if (cmd === 'tournament-list') {
        const member = interaction.member;
        const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || member.roles.cache.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
        if (!isStaff) return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
        const tournaments = L.tournaments();
        const active = Object.entries(tournaments).filter(([id,t]) => ['open','filling','almost_full'].includes(t.status));
        if (active.length === 0) return interaction.reply({ content: '📋 No active tournaments.', ephemeral: true });
        const embed = new EmbedBuilder().setTitle('📋 ACTIVE TOURNAMENTS').setColor('#2196F3').setDescription(active.map(([id,t]) => `**${t.title}**\nID: \`${id}\`\nSlots: ${t.currentSlots}/${t.maxSlots}`).join('\n\n'));
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Moderation commands (warn, timeout, untimeout)
      if (cmd === 'user-warn') {
        const member = interaction.member;
        const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || member.roles.cache.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
        if (!isStaff) return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const warnings = L.warnings();
        warnings[user.id] = warnings[user.id] || { warnings: 0, history: [] };
        warnings[user.id].warnings++;
        warnings[user.id].history.push({ type: 'manual', reason, issuedBy: interaction.user.id, timestamp: Date.now() });
        S.warnings(warnings);
        const embed = new EmbedBuilder().setTitle('⚠️ User Warned').setColor('#FFA500').setDescription(`${user.tag} warned by ${interaction.user.tag}`).addFields({ name: 'Reason', value: reason }, { name: 'Total Warnings', value: `${warnings[user.id].warnings}` }).setTimestamp();
        await logToChannel(interaction.guild, CONFIG.CHANNELS.MOD_LOG, embed);
        await user.send(`⚠️ WARNING from ${interaction.guild.name}\nReason: ${reason}\nTotal Warnings: ${warnings[user.id].warnings}`).catch(()=>{});
        return interaction.reply({ content: `✅ ${user} warned. Total: ${warnings[user.id].warnings}`, ephemeral: true });
      }

      // Many other commands implemented in original - owner commands follow similar checks
      if (cmd === 'owner-stats') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Owner only!', ephemeral: true });
        const profiles = L.profiles();
        const tournaments = L.tournaments();
        const invitesData = L.invites();
        const totalUsers = Object.keys(profiles).length;
        const totalTournaments = Object.keys(tournaments).length;
        const totalInvites = Object.values(invitesData).reduce((s,i)=> s + (i.total||0), 0);
        const totalRevenue = Object.values(tournaments).reduce((s,t)=> s + ((t.entryFee||0) * (t.currentSlots||0)), 0);
        const totalPrizes = Object.values(profiles).reduce((s,p)=> s + (p.stats?.earned || 0), 0);
        const embed = new EmbedBuilder().setTitle('📊 OTO TOURNAMENTS - SERVER STATISTICS').setColor('#9C27B0').addFields(
          { name: '👥 USER STATISTICS', value: `Total Users: **${totalUsers}**\nTotal Invites: **${totalInvites}**\nActive Users: **${Object.values(profiles).filter(p => (p.stats?.played||0) > 0).length}**` },
          { name: '🎮 TOURNAMENT STATISTICS', value: `Total Tournaments: **${totalTournaments}**\nActive: **${Object.values(tournaments).filter(t => t.status === 'open' || t.status === 'filling').length}**` },
          { name: '💰 FINANCIAL STATISTICS', value: `Total Revenue: **₹${totalRevenue}**\nTotal Prizes Given: **₹${totalPrizes}**\nProfit: **₹${totalRevenue - totalPrizes}**` }
        ).setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Handle other chat commands (owner-lockdown, owner-clear-chat, etc.) similarly...
      // For brevity they follow same patterns: permission checks -> perform action -> log -> reply

      return;
    }

    // Button interactions
    if (interaction.isButton?.()) {
      const id = interaction.customId;

      // Resend profile DM
      if (id === 'resend_profile_dm') {
        if (hasProfile(interaction.user.id)) return interaction.reply({ content: '✅ You already have a profile!', ephemeral: true });
        try { await sendProfileCreationDM(interaction.user); return interaction.reply({ content: '📨 Profile creation DM sent! Check your DMs.', ephemeral: true }); } catch (e) { return interaction.reply({ content: '❌ Could not send DM. Enable DMs from server members.', ephemeral: true }); }
      }

      // Start profile creation: we'll show a modal fallback that collects name/game/state/gender
      if (id === 'start_profile_creation') {
        const modal = new ModalBuilder().setCustomId('profile_modal').setTitle('Create OTO Profile');
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name_input').setLabel('Your Name').setStyle(TextInputStyle.Short).setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('game_input').setLabel('Game (freefire/minecraft/other)').setStyle(TextInputStyle.Short).setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('state_input').setLabel('State').setStyle(TextInputStyle.Short).setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('gender_input').setLabel('Gender (male/female/other)').setStyle(TextInputStyle.Short).setRequired(false))
        );
        return interaction.showModal(modal);
      }

      // Many button patterns: staff_create_tournament, staff_list_tournaments, owner_* etc.
      // We handle a set of common ones here:

      if (id === 'staff_create_tournament') {
        const member = interaction.member;
        const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || member.roles.cache.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
        if (!isStaff) return interaction.reply({ content: '❌ Only staff can use this!', ephemeral: true });
        return createTournament(interaction, 'quick');
      }

      if (id === 'staff_list_tournaments') {
        const member = interaction.member;
        const isStaff = member.roles.cache.has(CONFIG.ROLES.STAFF) || member.roles.cache.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
        if (!isStaff) return interaction.reply({ content: '❌ Only staff can use this!', ephemeral: true });
        const tournaments = L.tournaments();
        const active = Object.entries(tournaments).filter(([id,t]) => ['open','filling','almost_full'].includes(t.status));
        if (active.length === 0) return interaction.reply({ content: '📋 No active tournaments at the moment.', ephemeral: true });
        const embed = new EmbedBuilder().setTitle('📋 ACTIVE TOURNAMENTS').setColor('#2196F3').setDescription(active.map(([id,t]) => `**${t.title}**\nID: \`${id}\`\nSlots: ${t.currentSlots}/${t.maxSlots} | Status: ${t.status.toUpperCase()} | Time: ${t.time || 'TBA'}`).join('\n\n'));
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (id === 'request_free_match') return handleFreeMatchRequest(interaction);

      // join_tournament_{id}
      if (id.startsWith('join_tournament_')) {
        const tournamentId = id.replace('join_tournament_', '');
        return handleTournamentJoin(interaction, tournamentId);
      }

      // confirm_entry_{ticketChannelId} and confirm_payment_{ticketChannelId}
      if (id.startsWith('confirm_entry_') || id.startsWith('confirm_payment_')) {
        const ticketId = id.split('_').slice(2).join('_');
        return handlePaymentConfirmation(interaction, ticketId);
      }

      // close_ticket_{channelId}
      if (id.startsWith('close_ticket_')) {
        const ticketId = id.replace('close_ticket_', '');
        return handleTicketCloseButton(interaction, ticketId);
      }

      // start_match_{tournamentId}
      if (id.startsWith('start_match_')) {
        const tournamentId = id.replace('start_match_', '');
        const member = interaction.member;
        const isStaff = member?.roles?.cache?.has(CONFIG.ROLES.STAFF) || member?.roles?.cache?.has(CONFIG.ROLES.ADMIN) || interaction.user.id === CONFIG.OWNER_ID;
        if (!isStaff) return interaction.reply({ content: '❌ Only staff can start match!', ephemeral: true });
        const lobbies = L.lobbies();
        const lobby = lobbies[tournamentId];
        if (!lobby || !lobby.roomId || !lobby.password) return interaction.reply({ content: '❌ Please set room details first!', ephemeral: true });
        const tournaments = L.tournaments();
        const tournament = tournaments[tournamentId];
        if (!tournament) return interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
        tournament.status = 'live';
        tournaments[tournamentId] = tournament;
        S.tournaments(tournaments);
        const startEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('🎮 MATCH STARTING NOW!').setDescription(`🔑 Room ID: \`${lobby.roomId}\`\n🔐 Password: \`${lobby.password}\`\n⏰ Join within 5 minutes` ).setFooter({ text: 'OTO Tournaments - Match Started' }).setTimestamp();
        for (const pid of tournament.participants || []) {
          try { const u = await client.users.fetch(pid); await u.send({ embeds: [startEmbed] }).catch(()=>{}); } catch {}
        }
        await interaction.channel.send({ content: '@everyone', embeds: [startEmbed] }).catch(()=>{});
        return interaction.reply({ content: '✅ Match started! Room details shared with all players!', ephemeral: true });
      }

      // owner_broadcast -> present select handled in select menu below

      // owner_staff_applications -> toggle handled in select or button
      if (id === 'owner_staff_applications') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can use this!', ephemeral: true });
        const settings = L.settings();
        settings.staffApplicationsEnabled = !settings.staffApplicationsEnabled;
        S.settings(settings);
        if (settings.staffApplicationsEnabled) await setupStaffApplications(interaction.guild);
        return interaction.reply({ content: `✅ Staff applications are now **${settings.staffApplicationsEnabled ? 'ENABLED' : 'DISABLED'}**!`, ephemeral: true });
      }

      // owner_clear_support
      if (id === 'owner_clear_support') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can use this!', ephemeral: true });
        try {
          const supportChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.SUPPORT);
          if (!supportChannel) return interaction.reply({ content: '❌ Support channel not found!', ephemeral: true });
          const msgs = await supportChannel.messages.fetch({ limit: 100 });
          const deletable = msgs.filter(m => ((Date.now() - m.createdTimestamp) / (1000*60*60*24)) < 14);
          await supportChannel.bulkDelete(deletable, true).catch(()=>{});
          return interaction.reply({ content: `✅ Cleared ${deletable.size} messages from support!`, ephemeral: true });
        } catch (e) { return interaction.reply({ content: `❌ Error: ${e.message}`, ephemeral: true }); }
      }

      // owner_maintenance toggle
      if (id === 'owner_maintenance') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner', ephemeral: true });
        const settings = L.settings();
        settings.maintenanceMode = !settings.maintenanceMode;
        S.settings(settings);
        if (settings.maintenanceMode) {
          const embed = new EmbedBuilder().setColor('#FFA500').setTitle('🛠️ MAINTENANCE MODE ACTIVATED').setDescription('OTO Bot is now in maintenance mode! Some features may be unavailable.');
          const ch = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
          if (ch) await ch.send({ embeds: [embed] }).catch(()=>{});
          return interaction.reply({ content: '✅ Maintenance mode activated!', ephemeral: true });
        } else {
          return interaction.reply({ content: '✅ Maintenance mode deactivated! Bot is operational.', ephemeral: true });
        }
      }

      // owner_manage_roles -> open custom role management modal/panel
      if (id === 'owner_manage_roles' || id === 'owner_manage_roles') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can manage roles!', ephemeral: true });
        const customRoles = L.customRoles();
        const list = Object.entries(customRoles).map(([rid, data]) => `• <@&${rid}> - ${data.members?.length || 0} members`).join('\n') || 'No custom roles yet';
        const embed = new EmbedBuilder().setTitle('🎭 CUSTOM ROLES MANAGEMENT').setDescription(list).setColor('#9C27B0');
        const rows = [
          new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_custom_role').setLabel('➕ Create Role').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('list_custom_roles').setLabel('📋 List Roles').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('assign_custom_role').setLabel('👤 Assign Role').setStyle(ButtonStyle.Secondary)),
          new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('remove_custom_role_user').setLabel('❌ Remove from Role').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('delete_custom_role').setLabel('🗑️ Delete Role').setStyle(ButtonStyle.Danger))
        ];
        return interaction.reply({ embeds: [embed], components: rows, ephemeral: true });
      }

      // create_custom_role -> show modal
      if (id === 'create_custom_role') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can create roles!', ephemeral: true });
        const modal = new ModalBuilder().setCustomId('create_role_modal').setTitle('Create Custom Role');
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_name').setLabel('Role Name').setStyle(TextInputStyle.Short).setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_color').setLabel('Role Color (hex)').setStyle(TextInputStyle.Short).setPlaceholder('#FF0000').setRequired(true))
        );
        return interaction.showModal(modal);
      }

      // list_custom_roles
      if (id === 'list_custom_roles') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can view this!', ephemeral: true });
        const customRoles = L.customRoles();
        const list = Object.entries(customRoles).map(([rId, d]) => `**<@&${rId}>** (${d.members?.length || 0})\n${(d.members || []).slice(0,5).map(m=>`<@${m}>`).join(', ')}${d.members?.length > 5 ? ` +${d.members.length - 5} more` : ''}`).join('\n\n') || 'No custom roles yet';
        const embed = new EmbedBuilder().setTitle('📋 CUSTOM ROLES LIST').setDescription(list).setColor('#2196F3');
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // assign_custom_role -> modal show
      if (id === 'assign_custom_role' || id === 'remove_custom_role_user' || id === 'delete_custom_role') {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner!', ephemeral: true });
        const modalId = id === 'assign_custom_role' ? 'assign_role_modal' : id === 'remove_custom_role_user' ? 'remove_role_modal' : 'delete_role_modal';
        const title = id === 'delete_custom_role' ? 'Delete Custom Role' : id === 'assign_custom_role' ? 'Assign Custom Role' : 'Remove User from Role';
        const modal = new ModalBuilder().setCustomId(modalId).setTitle(title);
        if (id === 'assign_custom_role' || id === 'remove_custom_role_user') {
          modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)));
          modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_id').setLabel('Role ID').setStyle(TextInputStyle.Short).setRequired(true)));
        } else {
          modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_id').setLabel('Role ID to Delete').setStyle(TextInputStyle.Short).setRequired(true)));
        }
        return interaction.showModal(modal);
      }

      // owner_broadcast handled via select menu flow (below)
    }

    // Select menus
    if (interaction.isStringSelectMenu?.()) {
      // broadcast_channel_select -> show broadcast modal
      if (interaction.customId === 'broadcast_channel_select') {
        const selectedChannels = interaction.values;
        client.broadcastChannels.set(interaction.user.id, selectedChannels);
        const modal = new ModalBuilder().setCustomId('broadcast_modal').setTitle('Broadcast Message');
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('broadcast_message').setLabel('Message to broadcast').setStyle(TextInputStyle.Paragraph).setRequired(true)));
        return interaction.showModal(modal);
      }

      // select_game_{userId}
      if (interaction.customId.startsWith('select_game_')) {
        const userId = interaction.customId.replace('select_game_', '');
        if (userId !== interaction.user.id) return interaction.reply({ content: 'This menu is not for you', ephemeral: true });
        const game = interaction.values[0];
        const tmp = client.tempProfiles.get(interaction.user.id) || {};
        tmp.game = game;
        client.tempProfiles.set(interaction.user.id, tmp);
        await interaction.update({ components: [] }).catch(()=>{});
        // send state select
        const stateSelect = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('select_state_' + interaction.user.id).setPlaceholder('Choose your state').addOptions(INDIAN_STATES.slice(0, 25).map(s => ({ label: s, value: s }))));
        const embed = new EmbedBuilder().setTitle('📍 Select Your State').setColor('#2196F3');
        return interaction.channel.send({ embeds: [embed], components: [stateSelect] }).catch(()=>{});
      }

      // select_state_{userId}
      if (interaction.customId.startsWith('select_state_')) {
        const userId = interaction.customId.replace('select_state_', '');
        if (userId !== interaction.user.id) return interaction.reply({ content: 'This menu is not for you', ephemeral: true });
        const state = interaction.values[0];
        const tmp = client.tempProfiles.get(interaction.user.id) || {};
        tmp.state = state;
        client.tempProfiles.set(interaction.user.id, tmp);
        await interaction.update({ components: [] }).catch(()=>{});
        // send gender buttons
        const genderRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`gender_male_${interaction.user.id}`).setLabel('👨 Male').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`gender_female_${interaction.user.id}`).setLabel('👩 Female').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`gender_other_${interaction.user.id}`).setLabel('❓ Prefer not to say').setStyle(ButtonStyle.Secondary)
        );
        const embed = new EmbedBuilder().setTitle('👤 Select Your Gender').setColor('#9C27B0');
        return interaction.channel.send({ embeds: [embed], components: [genderRow] }).catch(()=>{});
      }

      // select_tournament_template handled when staff creates quick tournament
    }

    // Modal submits
    if (interaction.isModalSubmit?.()) {
      const id = interaction.customId;

      // profile modal
      if (id === 'profile_modal') {
        const name = interaction.fields.getTextInputValue('name_input');
        const game = interaction.fields.getTextInputValue('game_input');
        const state = interaction.fields.getTextInputValue('state_input');
        const gender = interaction.fields.getTextInputValue('gender_input') || 'other';
        const otoId = generateOTOID();
        const profile = {
          name, game, state, gender, otoId,
          createdAt: Date.now(), level: 1,
          stats: { wins: 0, played: 0, earned: 0, invites: 0 },
          badges: [], achievements: [], isPublic: false
        };
        saveUserProfile(interaction.user.id, profile);
        // assign player role if configured
        try {
          const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
          const member = await guild.members.fetch(interaction.user.id).catch(()=>null);
          if (member && CONFIG.ROLES.PLAYER) await member.roles.add(CONFIG.ROLES.PLAYER).catch(()=>{});
          const profileChannel = guild.channels.cache.get(CONFIG.CHANNELS.PROFILE);
          if (profileChannel) await profileChannel.send({ embeds: [createProfileEmbed(interaction.user, profile)] }).catch(()=>{});
          await logToChannel(guild, CONFIG.CHANNELS.MOD_LOG, new EmbedBuilder().setTitle('Profile Created').setDescription(`${interaction.user.tag} created profile`).addFields({ name: 'OTO ID', value: otoId }).setTimestamp());
        } catch (e) {}
        await interaction.reply({ content: `✅ Profile created! Your OTO ID: ${otoId}`, ephemeral: true });
        await checkAndAwardAchievements(interaction.user.id, await client.guilds.fetch(CONFIG.GUILD_ID).catch(()=>null));
        return;
      }

      // broadcast modal
      if (id === 'broadcast_modal') {
        const message = interaction.fields.getTextInputValue('broadcast_message');
        const channels = client.broadcastChannels.get(interaction.user.id) || [];
        if (channels.length === 0) return interaction.reply({ content: '❌ No channels selected!', ephemeral: true });
        const embed = new EmbedBuilder().setTitle('📢 BROADCAST').setDescription(message).setColor('#FF0000').setTimestamp();
        let sent = 0;
        for (const chId of channels) {
          try {
            const ch = interaction.guild.channels.cache.get(chId);
            if (ch) { await ch.send({ embeds: [embed] }).catch(()=>{}); sent++; }
          } catch (e) { console.error('broadcast send', e); }
        }
        client.broadcastChannels.delete(interaction.user.id);
        return interaction.reply({ content: `✅ Broadcast sent to ${sent} channels!`, ephemeral: true });
      }

      // staff application modal
      if (id === 'staff_application_modal') {
        const name = interaction.fields.getTextInputValue('app_name');
        const age = interaction.fields.getTextInputValue('app_age');
        const experience = interaction.fields.getTextInputValue('app_experience');
        const why = interaction.fields.getTextInputValue('app_why');
        const availability = interaction.fields.getTextInputValue('app_availability');
        const apps = L.staffApps();
        const appId = `APP-${Date.now()}`;
        apps[appId] = { userId: interaction.user.id, name, age, experience, why, availability, submittedAt: Date.now(), status: 'pending' };
        S.staffApps(apps);
        const embed = new EmbedBuilder().setTitle('📝 NEW STAFF APPLICATION').setDescription(`Applicant: ${interaction.user.tag}`).addFields(
          { name: 'Name', value: name, inline: true }, { name: 'Age', value: age, inline: true }, { name: 'Availability', value: availability, inline: true },
          { name: 'Experience', value: experience }, { name: 'Why Staff?', value: why }
        ).setFooter({ text: `Application ID: ${appId}` }).setColor('#4CAF50').setTimestamp();
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`approve_app_${appId}`).setLabel('✅ Approve').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`reject_app_${appId}`).setLabel('❌ Reject').setStyle(ButtonStyle.Danger));
        const pf = interaction.guild.channels.cache.get(CONFIG.CHANNELS.PLAYER_FORM);
        if (pf) await pf.send({ content: `<@${CONFIG.OWNER_ID}>`, embeds: [embed], components: [row] }).catch(()=>{});
        return interaction.reply({ content: '✅ Your staff application has been submitted!', ephemeral: true });
      }

      // role modals: create_role_modal, assign_role_modal, remove_role_modal, delete_role_modal
      if (id === 'create_role_modal' || id === 'assign_role_modal' || id === 'remove_role_modal' || id === 'delete_role_modal') {
        // handle owner-only modals
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can perform this action', ephemeral: true });
        if (id === 'create_role_modal') {
          const roleName = interaction.fields.getTextInputValue('role_name');
          const roleColor = interaction.fields.getTextInputValue('role_color');
          try {
            const guild = interaction.guild;
            const role = await guild.roles.create({ name: roleName, color: roleColor, reason: `Created by ${interaction.user.tag}` });
            const customRoles = L.customRoles();
            customRoles[role.id] = { name: roleName, color: roleColor, createdBy: interaction.user.id, createdAt: Date.now(), members: [] };
            S.customRoles(customRoles);
            return interaction.reply({ content: `✅ Role <@&${role.id}> created successfully! Role ID: \`${role.id}\``, ephemeral: true });
          } catch (e) { return interaction.reply({ content: `❌ Error creating role: ${e.message}`, ephemeral: true }); }
        }
        if (id === 'assign_role_modal') {
          const userId = interaction.fields.getTextInputValue('user_id');
          const roleId = interaction.fields.getTextInputValue('role_id');
          try {
            const guild = interaction.guild;
            const member = await guild.members.fetch(userId);
            const role = guild.roles.cache.get(roleId);
            if (!role) return interaction.reply({ content: '❌ Role not found!', ephemeral: true });
            await member.roles.add(role).catch(()=>{});
            const customRoles = L.customRoles();
            customRoles[roleId] = customRoles[roleId] || { name: role.name, color: role.color || '#000000', createdBy: interaction.user.id, createdAt: Date.now(), members: [] };
            if (!customRoles[roleId].members.includes(userId)) customRoles[roleId].members.push(userId);
            S.customRoles(customRoles);
            return interaction.reply({ content: `✅ Assigned <@&${roleId}> to <@${userId}>!`, ephemeral: true });
          } catch (e) { return interaction.reply({ content: `❌ Error: ${e.message}`, ephemeral: true }); }
        }
        if (id === 'remove_role_modal') {
          const userId = interaction.fields.getTextInputValue('user_id');
          const roleId = interaction.fields.getTextInputValue('role_id');
          try {
            const guild = interaction.guild;
            const member = await guild.members.fetch(userId);
            const role = guild.roles.cache.get(roleId);
            if (!role) return interaction.reply({ content: '❌ Role not found!', ephemeral: true });
            await member.roles.remove(role).catch(()=>{});
            const customRoles = L.customRoles();
            if (customRoles[roleId]) customRoles[roleId].members = (customRoles[roleId].members || []).filter(m => m !== userId);
            S.customRoles(customRoles);
            return interaction.reply({ content: `✅ Removed <@&${roleId}> from <@${userId}>!`, ephemeral: true });
          } catch (e) { return interaction.reply({ content: `❌ Error: ${e.message}`, ephemeral: true }); }
        }
        if (id === 'delete_role_modal') {
          const roleId = interaction.fields.getTextInputValue('role_id');
          try {
            const guild = interaction.guild;
            const role = guild.roles.cache.get(roleId);
            if (!role) return interaction.reply({ content: '❌ Role not found!', ephemeral: true });
            const name = role.name;
            await role.delete(`Deleted by ${interaction.user.tag}`).catch(()=>{});
            const customRoles = L.customRoles();
            delete customRoles[roleId];
            S.customRoles(customRoles);
            return interaction.reply({ content: `✅ Deleted role **${name}**!`, ephemeral: true });
          } catch (e) { return interaction.reply({ content: `❌ Error: ${e.message}`, ephemeral: true }); }
        }
      }

      // confirm_join_{tournamentId} modal is handled below because modal customId created earlier is confirm_join_{id}
      if (id.startsWith('confirm_join_')) {
        const tournamentId = id.replace('confirm_join_', '');
        const ign = interaction.fields.getTextInputValue('ign_input');
        const confirm = interaction.fields.getTextInputValue('confirm_input');
        if (confirm.toUpperCase() !== 'CONFIRM') return interaction.reply({ content: '❌ You must type "CONFIRM" to proceed!', ephemeral: true });
        const tournaments = L.tournaments();
        const tournament = tournaments[tournamentId];
        if (!tournament) return interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
        // create registration ticket channel
        const guild = interaction.guild;
        const category = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_CATEGORY) || null;
        const ticketChannel = await guild.channels.create({
          name: `reg-${interaction.user.username}`.slice(0,90),
          type: ChannelType.GuildText,
          parent: category,
          permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: CONFIG.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: tournament.createdBy, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: CONFIG.OWNER_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
          ]
        }).catch(()=>null);
        const tickets = L.tickets();
        if (ticketChannel) {
          tickets[ticketChannel.id] = { userId: interaction.user.id, tournamentId, ign, type: 'registration', createdAt: Date.now() };
          S.tickets(tickets);
        } else {
          return interaction.reply({ content: '❌ Could not create ticket channel. Contact staff.', ephemeral: true });
        }
        const ticketEmbed = new EmbedBuilder().setTitle('🎫 TOURNAMENT REGISTRATION').setColor('#4CAF50').setDescription(`Tournament: **${tournament.title}**\nYour IGN: **${ign}**\nEntry Fee: ₹${tournament.entryFee}\n${tournament.entryFee > 0 ? 'Please upload payment screenshot below.' : 'Free entry - no payment required.'}`).setFooter({ text: `Tournament ID: ${tournamentId}` }).setTimestamp();
        const actionRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`confirm_entry_${ticketChannel.id}`).setLabel('✅ Confirm Entry').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`close_ticket_${ticketChannel.id}`).setLabel('❌ Close Ticket').setStyle(ButtonStyle.Danger));
        await ticketChannel.send({ content: `${interaction.user} <@&${CONFIG.ROLES.STAFF}>`, embeds: [ticketEmbed], components: [actionRow] }).catch(()=>{});
        await logToChannel(guild, CONFIG.CHANNELS.TICKET_LOG, new EmbedBuilder().setTitle('Registration Ticket Created').setDescription(`${interaction.user.tag} -> ${tournament.title}`).addFields({ name: 'Ticket', value: `<#${ticketChannel.id}>` }).setTimestamp());
        await interaction.reply({ content: `✅ Registration ticket created! Check ${ticketChannel}`, ephemeral: true });
        return;
      }

      // approve_app_{appId} & reject_app_{appId}
      if (id.startsWith('approve_app_') || id.startsWith('reject_app_')) {
        if (interaction.user.id !== CONFIG.OWNER_ID) return interaction.reply({ content: '❌ Only owner can manage applications!', ephemeral: true });
        const appId = id.split('_').slice(2).join('_');
        const apps = L.staffApps();
        const app = apps[appId];
        if (!app) return interaction.reply({ content: '❌ Application not found!', ephemeral: true });
        if (id.startsWith('approve_app_')) {
          app.status = 'approved'; S.staffApps(apps);
          try {
            const guild = interaction.guild;
            const member = await guild.members.fetch(app.userId).catch(()=>null);
            if (member && CONFIG.ROLES.STAFF) await member.roles.add(CONFIG.ROLES.STAFF).catch(()=>{});
            const user = await client.users.fetch(app.userId).catch(()=>null);
            if (user) await user.send({ embeds: [new EmbedBuilder().setTitle('🎉 STAFF APPLICATION APPROVED!').setDescription('Welcome to the OTO staff team!').setColor('#00FF00')] }).catch(()=>{});
          } catch (e) {}
          return interaction.update({ content: `✅ Application approved by ${interaction.user.tag}`, components: [] });
        } else {
          app.status = 'rejected'; S.staffApps(apps);
          try {
            const user = await client.users.fetch(app.userId).catch(()=>null);
            if (user) await user.send({ embeds: [new EmbedBuilder().setTitle('📝 Application Update').setDescription('Unfortunately your application was not accepted this time.').setColor('#FF0000')] }).catch(()=>{});
          } catch (e) {}
          return interaction.update({ content: `❌ Application rejected by ${interaction.user.tag}`, components: [] });
        }
      }

    }
  } catch (err) {
    console.error('interactionCreate error', err);
    try { if (interaction && !interaction.replied) await interaction.reply({ content: '❌ Internal error', ephemeral: true }); } catch {}
  }
});

// ---------------------- Message handling ----------------------
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;

    // If user has no profile, restrict chat outside announcement channel
    if (!hasProfile(message.author.id) && message.channel.id !== CONFIG.CHANNELS.ANNOUNCEMENT) return;

    const member = message.member;
    const isStaff = member?.roles?.cache?.has(CONFIG.ROLES.STAFF) || member?.roles?.cache?.has(CONFIG.ROLES.ADMIN) || message.author.id === CONFIG.OWNER_ID;

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
      if (links && !links.some(l => l.includes('youtube.com') || l.includes('youtu.be'))) {
        await message.delete().catch(()=>{});
        await handleModeration(message.author, 'unauthorized_link', message);
        return;
      }
    }

    // Auto responses (greetings/help)
    const lower = message.content.toLowerCase().trim();
    const last = lastAutoResponses.get(message.author.id);
    if (last && (Date.now() - last) < 120000) return;
    const greetings = ['hi','hello','hey','hii','helo'];
    if (greetings.includes(lower)) {
      lastAutoResponses.set(message.author.id, Date.now());
      setTimeout(async () => {
        const recent = await message.channel.messages.fetch({ after: message.id, limit: 10 }).catch(()=>new Collection());
        const hasReply = recent.some(m => !m.author.bot && m.author.id !== message.author.id);
        if (!hasReply) {
          const profile = getUserProfile(message.author.id);
          const greeting = profile && profile.gender === 'female' ? 'Hello ji! 👋' : 'Hi bhai! 😊';
          const reply = await message.reply(greeting).catch(()=>null);
          setTimeout(async () => {
            const followUps = await message.channel.messages.fetch({ after: reply?.id || message.id, limit: 5 }).catch(()=>new Collection());
            const userReplied = followUps.some(m => m.author.id === message.author.id);
            if (userReplied) await message.channel.send(`If you have any query, ask in <#${CONFIG.CHANNELS.SUPPORT}> or check <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>!`).catch(()=>{});
          }, 10000);
        }
      }, 2000);
    }

    if (lower.includes('help') || lower.includes('support')) {
      lastAutoResponses.set(message.author.id, Date.now());
      await message.reply(`Need help? Ask in <#${CONFIG.CHANNELS.SUPPORT}> or use /help`).catch(()=>{});
    }

  } catch (e) {
    console.error('messageCreate error', e);
  }
});

// ---------------------- Member join/leave ----------------------
client.on('guildMemberAdd', async (member) => {
  try {
    if (member.user.bot) return;
    await trackInvite(member).catch(()=>{});
    const joinEmbed = new EmbedBuilder().setColor('#00FF00').setTitle('👋 Member Joined').setDescription(`${member.user.tag} joined`).setThumbnail(member.user.displayAvatarURL({ dynamic: true })).addFields({ name: 'User ID', value: member.id, inline: true }, { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, inline: true }).setTimestamp();
    await logToChannel(member.guild, CONFIG.CHANNELS.MOD_LOG, joinEmbed).catch(()=>{});
    const general = member.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
    if (general) {
      const welcomeMessages = [`🎊 **${member.user.username} bhai aa gaya!** Welcome to OTO Family! 🔥`, `🚀 Boss arrived! ${member.user.username} just landed in OTO! 🎮`, `⚡ ${member.user.username} has entered the arena! Let's go! 💪`, `🎯 New champion alert! ${member.user.username} joined OTO! 🏆`, `🔥 ${member.user.username} is here! Tournament warrior incoming! ⚔️`];
      await general.send(welcomeMessages[Math.floor(Math.random()*welcomeMessages.length)]).catch(()=>{});
    }
    const welcomeChannel = member.guild.channels.cache.get(CONFIG.CHANNELS.WELCOME_CHANNEL);
    if (welcomeChannel) {
      const welcomeEmbed = new EmbedBuilder().setColor('#FF6B6B').setTitle('🎮 WELCOME TO OTO FAMILY!').setDescription(`╔═══════════════════════╗\n    **${member.user.username}**\n╚═══════════════════════╝\n\n🎊 ${member.user.username} bhai aa gaya! 🎊\n\n✨ Check your DMs to create your profile\n🏆 Join tournaments and win big prizes\n👥 Invite friends for exclusive rewards`).setThumbnail(member.user.displayAvatarURL({ dynamic: true })).setTimestamp();
      const msg = await welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] }).catch(()=>null);
      if (msg) { await msg.react('❤️').catch(()=>{}); await msg.react('🎮').catch(()=>{}); }
    }
    try { await sendProfileCreationDM(member.user).catch(()=>{}); } catch {}
  } catch (e) { console.error('guildMemberAdd error', e); }
});

client.on('guildMemberRemove', async (member) => {
  try {
    if (member.user.bot) return;
    const embed = new EmbedBuilder().setColor('#FF0000').setTitle('👋 Member Left').setDescription(`${member.user.tag} left`).setThumbnail(member.user.displayAvatarURL({ dynamic: true })).addFields({ name: 'User ID', value: member.id, inline: true }, { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp/1000)}:R>`, inline: true }).setTimestamp();
    await logToChannel(member.guild, CONFIG.CHANNELS.MOD_LOG, embed).catch(()=>{});
    const general = member.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
    if (general) {
      const goodbye = [`😢 ${member.user.username} left. We'll miss you!`, `👋 ${member.user.username} has left OTO Family. Hope to see you back!`, `🚪 ${member.user.username} left the tournament grounds.`];
      await general.send(goodbye[Math.floor(Math.random()*goodbye.length)]).catch(()=>{});
    }
  } catch (e) { console.error('guildMemberRemove error', e); }
});

// ---------------------- Slash commands registration (guild-scoped) ----------------------
async function registerCommands() {
  try {
    const commands = [
      { name: 'profile', description: 'View your profile' },
      { name: 'invites', description: 'Check your invite statistics' },
      { name: 'achievements', description: 'View your achievements' },
      { name: 'help', description: 'Get help guide' },
      {
        name: 'tournament-create', description: 'Create a new tournament (Staff only)',
        options: [{ name: 'type', description: 'Tournament creation type', type: 3, required: true, choices: [{ name: 'Quick Create (Templates)', value: 'quick' }, { name: 'Custom Create', value: 'custom' }] }]
      },
      { name: 'tournament-list', description: 'View all tournaments (Staff only)' },
      { name: 'user-warn', description: 'Warn a user (Staff only)', options: [{ name: 'user', description: 'User to warn', type: 6, required: true }, { name: 'reason', description: 'Warning reason', type: 3, required: true }] },
      { name: 'user-timeout', description: 'Timeout a user (Staff only)', options: [{ name: 'user', description: 'User to timeout', type: 6, required: true }, { name: 'minutes', description: 'Timeout duration in minutes', type: 4, required: true }, { name: 'reason', description: 'Timeout reason', type: 3, required: false }] },
      { name: 'user-untimeout', description: 'Remove timeout from user (Staff only)', options: [{ name: 'user', description: 'User to untimeout', type: 6, required: true }] },
      { name: 'winner-declare', description: 'Declare tournament winner (Staff only)', options: [{ name: 'tournament', description: 'Tournament ID', type: 3, required: true }, { name: 'user', description: 'Winner', type: 6, required: true }, { name: 'position', description: 'Position', type: 3, required: true, choices: [{ name: '1st Place', value: '1st' }, { name: '2nd Place', value: '2nd' }, { name: '3rd Place', value: '3rd' }, { name: '4th Place', value: '4th' }] }] },
      { name: 'owner-staff-add', description: 'Add a staff member (Owner only)', options: [{ name: 'user', description: 'User to add', type: 6, required: true }] },
      { name: 'owner-staff-remove', description: 'Remove a staff member (Owner only)', options: [{ name: 'user', description: 'User to remove', type: 6, required: true }] },
      { name: 'owner-broadcast', description: 'Broadcast message to all channels (Owner only)', options: [{ name: 'message', description: 'Message to broadcast', type: 3, required: true }] },
      { name: 'owner-stats', description: 'View detailed server statistics (Owner only)' },
      { name: 'owner-lockdown', description: 'Emergency server lockdown (Owner only)' },
      { name: 'owner-maintenance', description: 'Toggle bot maintenance mode (Owner only)', options: [{ name: 'status', description: 'Maintenance status', type: 3, required: true, choices: [{ name: 'ON', value: 'on' }, { name: 'OFF', value: 'off' }] }] },
      { name: 'owner-clear-chat', description: 'Clear messages from a channel (Owner only)', options: [{ name: 'channel', description: 'Channel to clear', type: 7, required: true }, { name: 'amount', description: 'Number of messages', type: 4, required: false }] },
      // Additional commands (tournament-start, tournament-cancel, leaderboard, profile-edit, user-profile etc.) can be registered similarly
    ];
    const guild = CONFIG.GUILD_ID && CONFIG.GUILD_ID !== 'YOUR_GUILD_ID_HERE' ? client.guilds.cache.get(CONFIG.GUILD_ID) : client.guilds.cache.first();
    if (!guild) { console.error('Cannot register commands: no guild available'); return; }
    await guild.commands.set(commands);
    console.log('✅ Slash commands registered for guild', guild.id);
  } catch (e) {
    console.error('registerCommands error', e);
  }
}

// ---------------------- Scheduled tasks ----------------------
setInterval(async () => {
  try {
    if (!CONFIG.GUILD_ID) return;
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    if (!guild) return;
    await updateLeaderboards(guild);
    await updateInviteTracker(guild);
    console.log('✅ Leaderboards & invite tracker updated');
  } catch (e) { console.error('Hourly update error', e); }
}, 60 * 60 * 1000); // hourly

setInterval(async () => {
  try {
    const tournaments = L.tournaments();
    if (!CONFIG.GUILD_ID) return;
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    for (const [id, t] of Object.entries(tournaments)) {
      if (['open','filling'].includes(t.status)) {
        const pct = (t.currentSlots / t.maxSlots) * 100;
        if (pct >= 50 && pct < 80) {
          const ch = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL);
          if (ch) await ch.send(`⚠️ **${t.title}** is filling fast! ${t.currentSlots}/${t.maxSlots} slots filled. Join in <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>!`).catch(()=>{});
        }
      }
    }
  } catch (e) { console.error('Reminder interval error', e); }
}, 30 * 60 * 1000); // every 30 minutes

setInterval(async () => {
  try {
    // cleanup tickets older than 7 days
    if (!CONFIG.GUILD_ID) return;
    const tickets = L.tickets();
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const now = Date.now();
    for (const [chId, t] of Object.entries(tickets)) {
      if (now - (t.createdAt || 0) > 7 * 24 * 60 * 60 * 1000) {
        try { const ch = guild.channels.cache.get(chId); if (ch) await ch.delete().catch(()=>{}); } catch {}
        delete tickets[chId];
      }
    }
    S.tickets(tickets);
  } catch (e) { console.error('Ticket cleanup error', e); }
}, 24 * 60 * 60 * 1000);

setInterval(async () => {
  try {
    // daily backup
    const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    const backup = {
      profiles: L.profiles(),
      tournaments: L.tournaments(),
      invites: L.invites(),
      warnings: L.warnings(),
      timestamp: Date.now()
    };
    await fsp.writeFile(backupFile, JSON.stringify(backup, null, 2));
    const files = (await fsp.readdir(BACKUP_DIR)).sort().reverse();
    for (let i = 7; i < files.length; i++) await fsp.unlink(path.join(BACKUP_DIR, files[i])).catch(()=>{});
    console.log('✅ Data backed up');
  } catch (e) { console.error('backup error', e); }
}, 24 * 60 * 60 * 1000); // daily

// ---------------------- Ready & login ----------------------
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  await initInvitesCache().catch(()=>{});
  await registerCommands().catch(()=>{});

  let guild;
  try {
    if (!CONFIG.GUILD_ID || CONFIG.GUILD_ID === 'YOUR_GUILD_ID_HERE') {
      guild = client.guilds.cache.first();
      console.warn('⚠️ GUILD_ID not set. Using first guild:', guild?.id);
    } else {
      guild = client.guilds.cache.get(CONFIG.GUILD_ID) || await client.guilds.fetch(CONFIG.GUILD_ID);
    }
  } catch (e) {
    console.error('Could not fetch guild in ready event', e);
  }
  if (!guild) console.error('❌ ERROR: Cannot find guild to initialize');
  else {
    try {
      // refresh announcement, support, panels, leaderboards
      await setupAnnouncementMessage(guild);
      await setupSupportTickets(guild);
      await pinStaffToolsGuide(guild);
      await pinOwnerToolsGuide(guild);
      await setupBotCommandsChannel(guild);
      await updateLeaderboards(guild);
      console.log('🚀 Bot initialization complete for guild:', guild.id);
    } catch (e) { console.error('ready initialization error', e); }
  }
});

// ---------------------- Graceful shutdown ----------------------
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    const backup = { profiles: L.profiles(), tournaments: L.tournaments(), invites: L.invites(), timestamp: Date.now() };
    await fsp.writeFile(path.join(BACKUP_DIR, 'shutdown-backup.json'), JSON.stringify(backup, null, 2));
    console.log('✅ Final backup created');
    await client.destroy();
    console.log('✅ Bot disconnected');
    process.exit(0);
  } catch (e) { console.error('Shutdown error', e); process.exit(1); }
});

// ---------------------- Error handling ----------------------
client.on('error', error => console.error('Discord client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));
process.on('uncaughtException', error => console.error('Uncaught exception:', error));

// ---------------------- Login ----------------------
client.login(CONFIG.TOKEN).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
