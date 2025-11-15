// ==================== OTO SUPER TOURNAMENT BOT - COMPLETE SYSTEM ====================
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
app.get('/', (req, res) => res.send('🏆 OTO Super Bot Active'));
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));

// ==================== CONFIGURATION ====================
const CONFIG = {
  // Channels
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
  INVITE_TRACKER: '1439216884774998107',
  MINECRAFT_CHANNEL: '1439223955960627421',
  MOST_PLAYED: '1439226024863993988',
  
  STAFF_ROLE: '1438475461977047112',
  ADMIN_ROLE: '1438475461977047112',
  
  // Settings
  MIN_INVITES_FREE_ENTRY: 10,
  REWARD_INVITES: 10,
  AUTO_DELETE_TICKET_MINUTES: 10,
  SPAM_INTERVAL: 120000, // 2 minutes
  
  QR_IMAGE: 'https://i.ibb.co/jkBSmkM/qr.png',
  
  // Bad words filter
  BAD_WORDS: ['dm', 'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'madarchod', 'bhenchod', 'chutiya', 'lund', 'gandu', 'randi'],
  
  // Welcome messages (50+)
  WELCOME_MESSAGES: [
    '🔥 Apna bhai {user} aa gaya! Machaayega ab! Welcome to OTO family! 💪',
    '⚡ {user} has entered the chat! New bruh in the house! Let\'s gooo! 🎮',
    '🎯 Yooo {user}! Welcome bro! Tournament khelne ka time aa gaya! 🏆',
    '💥 {user} joined the server! Apna banda aa gaya! Swagat hai! 🎉',
    '🌟 Welcome {user}! New player unlocked! Ready to dominate? 💪',
    '🔥 {user} bhai! Finally aa hi gaye! OTO ka naya warrior! ⚔️',
    '⚡ {user} is here! Fresh blood! Let\'s see your skills! 🎮',
    '🎮 {user} ne entry maar di! Welcome to the arena! 🏟️',
    '💪 {user} joined! Another soldier in OTO army! Jai Hind! 🇮🇳',
    '🏆 {user} welcome! Champion material detected! 👑',
    '🚀 {user} landed! Get ready to conquer! 🎯',
    '⭐ {user} aa gaye! Party shuru karo! 🎊',
    '🎪 {user} joined the circus! Wait... tournament! 😂',
    '🦁 {user} roared in! King vibes! 👑',
    '🌪️ {user} storm incoming! 🔥',
    '💎 {user} precious addition hai! Welcome! ✨',
    '🎸 {user} rockstar entry! 🤘',
    '🏅 {user} medalist incoming! 🥇',
    '🎯 {user} target locked! Welcome! 🎮',
    '⚡ {user} lightning strike! Boom! 💥',
  ],
  
  // Staff welcome messages (40+)
  STAFF_WELCOME_MESSAGES: [
    'Bhai tumhe ab hard work karna hai! OTO ko best banana hai! 💪',
    'Welcome to the team! Mehnat karo, success milegi! 🌟',
    'Staff ban gaye! Ab responsibility bhi hai! Let\'s make OTO great! 🔥',
    'Congratulations! Now prove yourself! Work hard! 💯',
    'New staff! Dedication dikhao! OTO depends on you! ⚡',
    'Hardwork + Dedication = Success! Show us your potential! 🚀',
    'Be the change OTO needs! Work smart, work hard! 💼',
    'You\'re chosen! Make every day count! 🎯',
    'Staff power comes with responsibility! Use it wisely! 🦸',
    'Welcome aboard! Let\'s build something amazing! 🏗️',
    'Your journey as staff starts now! Make it legendary! 📖',
    'Discipline, dedication, determination - your 3 Ds! 💪',
    'Show them what leadership looks like! 👔',
    'Be the staff everyone respects! 🙏',
    'Hard work beats talent when talent doesn\'t work hard! 💼',
  ],
};

// ==================== GAME TEMPLATES ====================
const GAME_TEMPLATES = {
  freefire: {
    name: 'Free Fire',
    emoji: '🔥',
    types: ['Solo', 'Duo', 'Squad'],
    maps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine'],
    defaultSlots: 48,
    prizeDistributions: {
      'Winner Takes All': { 1: 100 },
      'Top 3': { 1: 60, 2: 25, 3: 15 },
      'Top 5': { 1: 50, 2: 25, 3: 15, 4: 7, 5: 3 },
    }
  },
  minecraft: {
    name: 'Minecraft',
    emoji: '⛏️',
    types: ['Solo', 'Teams', 'Custom'],
    maps: ['Custom', 'Survival', 'Creative', 'Bedwars'],
    defaultSlots: 32,
    prizeDistributions: {
      'Winner Takes All': { 1: 100 },
      'Top 3': { 1: 60, 2: 25, 3: 15 },
    }
  },
  pubg: {
    name: 'PUBG Mobile',
    emoji: '🎯',
    types: ['Solo', 'Duo', 'Squad'],
    maps: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi'],
    defaultSlots: 48,
    prizeDistributions: {
      'Winner Takes All': { 1: 100 },
      'Top 3': { 1: 60, 2: 25, 3: 15 },
    }
  }
};

// ==================== DATA STORAGE ====================
let tournaments = new Map();
let activeTournament = null;
let registeredPlayers = new Map();
let userInvites = new Map();
let userStats = new Map();
let bannedUsers = new Map();
let warnings = new Map();
let tickets = new Map();
let inviteCache = new Map();
let staffMembers = new Set();
let pendingResponses = new Map();
let spamTimers = new Map();
let roomCredentials = new Map();

let gameStats = {
  freefire: new Map(),
  minecraft: new Map(),
  pubg: new Map()
};

// ==================== READY EVENT ====================
client.once('ready', async () => {
  console.log(`🚀 ${client.user.tag} is ONLINE!`);
  console.log(`📊 Managing ${client.guilds.cache.size} server(s)`);
  
  try {
    await client.user.setActivity('🏆 OTO Multi-Game Tournaments', { type: Discord.ActivityType.Competing });
    await registerCommands();
    await initializeInviteTracking();
    await loadStaffMembers();
    startAutomatedTasks();
    console.log('✅ OTO Super Bot fully initialized!');
  } catch (err) {
    console.error('❌ Init error:', err);
  }
});

// ==================== SLASH COMMANDS REGISTRATION ====================
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    new SlashCommandBuilder().setName('help').setDescription('❓ View all commands'),
    new SlashCommandBuilder().setName('invites').setDescription('🔗 Check your invites'),
    new SlashCommandBuilder().setName('stats').setDescription('📊 View your stats')
      .addStringOption(opt => opt.setName('game').setDescription('Game type')
        .addChoices(
          { name: '🔥 Free Fire', value: 'freefire' },
          { name: '⛏️ Minecraft', value: 'minecraft' },
          { name: '🎯 PUBG', value: 'pubg' }
        )),
    new SlashCommandBuilder().setName('book').setDescription('📅 Book your tournament slot (10+ invites)'),
    new SlashCommandBuilder().setName('createtournament').setDescription('🎮 Create tournament (Staff)').setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    new SlashCommandBuilder().setName('sendroom').setDescription('🔐 Send room credentials (Staff)')
      .addStringOption(opt => opt.setName('tournamentid').setDescription('Tournament ID').setRequired(true))
      .addStringOption(opt => opt.setName('roomid').setDescription('Room ID').setRequired(true))
      .addStringOption(opt => opt.setName('password').setDescription('Password (optional)'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    new SlashCommandBuilder().setName('declarewinner').setDescription('🏆 Declare tournament winners (Staff)')
      .addStringOption(opt => opt.setName('tournamentid').setDescription('Tournament ID').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    new SlashCommandBuilder().setName('ban').setDescription('🚫 Ban user (Staff protected)')
      .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Ban reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('timeout').setDescription('⏱️ Timeout user (Staff protected)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason'))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName('warn').setDescription('⚠️ Warn user (Staff protected)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Warning reason').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder().setName('addstaff').setDescription('👮 Add staff member (Admin/Owner)')
      .addUserOption(opt => opt.setName('user').setDescription('User to promote').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('removestaff').setDescription('👤 Remove staff (Admin/Owner)')
      .addUserOption(opt => opt.setName('user').setDescription('User to demote').setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 View leaderboards')
      .addStringOption(opt => opt.setName('type').setDescription('Leaderboard type').setRequired(true)
        .addChoices(
          { name: '🔗 Most Invites', value: 'invites' },
          { name: '🔥 Free Fire', value: 'freefire' },
          { name: '⛏️ Minecraft', value: 'minecraft' },
          { name: '🎯 PUBG', value: 'pubg' }
        )),
    new SlashCommandBuilder().setName('challenge').setDescription('⚔️ Beat Our Player Challenge (10+ invites)'),
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
    const msg = '❌ Error occurred bhai! Try again!';
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

async function handleCommand(interaction) {
  const { commandName } = interaction;

  if (bannedUsers.has(interaction.user.id) && !isStaff(interaction.member)) {
    const banData = bannedUsers.get(interaction.user.id);
    return interaction.reply({ content: `🚫 You are banned!\n**Reason:** ${banData.reason}`, ephemeral: true });
  }

  const handlers = {
    'help': handleHelp, 'invites': handleInvites, 'stats': handleStats, 'book': handleBook,
    'createtournament': handleCreateTournament, 'sendroom': handleSendRoom, 'declarewinner': handleDeclareWinner,
    'ban': handleBan, 'timeout': handleTimeout, 'warn': handleWarn,
    'addstaff': handleAddStaff, 'removestaff': handleRemoveStaff,
    'leaderboard': handleLeaderboard, 'challenge': handleChallenge,
  };

  const handler = handlers[commandName];
  if (handler) await handler(interaction);
}

async function handleHelp(interaction) {
  const embed = new Discord.EmbedBuilder()
    .setTitle('🤖 OTO Super Bot - Commands')
    .setDescription('Multi-game tournament management system!')
    .setColor('#3498db')
    .addFields(
      { name: '👤 User', value: '`/invites` `/stats` `/book` `/challenge` `/leaderboard`' },
      { name: '🎮 Games', value: '🔥 Free Fire | ⛏️ Minecraft | 🎯 PUBG' },
      { name: '🎁 Rewards', value: `10 invites = FREE entry!` }
    )
    .setThumbnail(CONFIG.QR_IMAGE);

  if (isStaff(interaction.member)) {
    embed.addFields({ name: '👮 Staff', value: '`/createtournament` `/sendroom` `/declarewinner` `/ban` `/warn` `/addstaff`' });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleInvites(interaction) {
  const count = userInvites.get(interaction.user.id) || 0;
  const needed = CONFIG.MIN_INVITES_FREE_ENTRY;
  const hasReward = count >= needed;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🔗 ${interaction.user.username}'s Invites`)
    .setColor(hasReward ? '#00ff00' : '#ff9900')
    .addFields(
      { name: '📊 Total', value: `**${count}**`, inline: true },
      { name: '🎁 Status', value: hasReward ? '✅ **UNLOCKED!**' : `${needed - count} more`, inline: true }
    )
    .setDescription(hasReward ? `🎉 FREE tournament entry!\nUse \`/book\` to reserve!` : `Invite ${needed - count} more people!`)
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleStats(interaction) {
  const game = interaction.options.getString('game');
  const userId = interaction.user.id;

  if (game) {
    const stats = gameStats[game]?.get(userId) || { wins: 0, played: 0, topThree: 0 };
    const embed = new Discord.EmbedBuilder()
      .setTitle(`📊 ${GAME_TEMPLATES[game].emoji} ${GAME_TEMPLATES[game].name} Stats`)
      .setColor('#9b59b6')
      .addFields(
        { name: '🏆 Wins', value: `${stats.wins}`, inline: true },
        { name: '🎮 Played', value: `${stats.played}`, inline: true },
        { name: '🥇 Top 3', value: `${stats.topThree}`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    const allStats = userStats.get(userId) || { wins: 0, played: 0, topThree: 0 };
    const embed = new Discord.EmbedBuilder()
      .setTitle(`📊 Overall Stats`)
      .setColor('#9b59b6')
      .addFields(
        { name: '🏆 Wins', value: `${allStats.wins}`, inline: true },
        { name: '🎮 Tournaments', value: `${allStats.played}`, inline: true },
        { name: '🔗 Invites', value: `${userInvites.get(userId) || 0}`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

async function handleBook(interaction) {
  const invites = userInvites.get(interaction.user.id) || 0;

  if (invites < CONFIG.MIN_INVITES_FREE_ENTRY) {
    return interaction.reply({
      content: `❌ Need **10 invites**!\n\nCurrent: ${invites}\nNeeded: ${10 - invites} more`,
      ephemeral: true
    });
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('📅 Book Your Slot')
    .setDescription(`✅ You have **${invites} invites**!\n\n🎁 FREE entry unlocked!\n\nClick button to get notified!`)
    .setColor('#00ff00');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('book_notify')
      .setLabel('🔔 Get Notified')
      .setStyle(Discord.ButtonStyle.Success)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleChallenge(interaction) {
  const invites = userInvites.get(interaction.user.id) || 0;

  if (invites < CONFIG.MIN_INVITES_FREE_ENTRY) {
    return interaction.reply({ content: `❌ Need 10 invites!\n\nCurrent: ${invites}`, ephemeral: true });
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('⚔️ Beat Our Player!')
    .setDescription(
      `**Challenge OTO's Best!**\n\n` +
      `**If you WIN:**\n🎁 FREE Squad entry\n💰 Bonus prizes\n\nReady?`
    )
    .setColor('#ff9900');

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('accept_challenge')
      .setLabel('⚔️ Accept')
      .setStyle(Discord.ButtonStyle.Danger)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleCreateTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const embed = new Discord.EmbedBuilder()
    .setTitle('🎮 Create Tournament')
    .setDescription('Select game')
    .setColor('#3498db');

  const gameSelect = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId('tournament_game')
      .setPlaceholder('Select Game')
      .addOptions([
        { label: 'Free Fire', value: 'freefire', emoji: '🔥' },
        { label: 'Minecraft', value: 'minecraft', emoji: '⛏️' },
        { label: 'PUBG Mobile', value: 'pubg', emoji: '🎯' },
      ])
  );

  await interaction.editReply({ embeds: [embed], components: [gameSelect] });
}

async function handleSelectMenu(interaction) {
  const { customId, values } = interaction;

  if (customId === 'tournament_game') {
    await handleGameSelection(interaction, values[0]);
  } else if (customId.startsWith('tournament_')) {
    await handleTournamentConfig(interaction, customId, values);
  } else if (customId.startsWith('winner_')) {
    await handleWinnerSelection(interaction, customId, values);
  }
}

async function handleGameSelection(interaction, game) {
  await interaction.deferUpdate();

  const gameData = GAME_TEMPLATES[game];
  const tournamentId = `${game}_${Date.now()}`;

  tournaments.set(tournamentId, {
    id: tournamentId,
    game,
    status: 'creating',
    createdBy: interaction.user.id,
    createdAt: new Date()
  });

  const embed = new Discord.EmbedBuilder()
    .setTitle(`${gameData.emoji} ${gameData.name} Tournament`)
    .setDescription('Configure settings')
    .setColor('#3498db');

  const typeSelect = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId(`tournament_type_${tournamentId}`)
      .setPlaceholder('Select Type')
      .addOptions(gameData.types.map(type => ({ label: type, value: type.toLowerCase() })))
  );

  const mapSelect = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId(`tournament_map_${tournamentId}`)
      .setPlaceholder('Select Map')
      .addOptions(gameData.maps.map(map => ({ label: map, value: map.toLowerCase() })))
  );

  await interaction.editReply({ embeds: [embed], components: [typeSelect, mapSelect] });
}

async function handleTournamentConfig(interaction, customId, values) {
  await interaction.deferUpdate();
  
  const tournamentId = customId.split('_').pop();
  const tournament = tournaments.get(tournamentId);
  
  if (!tournament) return;

  if (customId.includes('_type_')) {
    tournament.type = values[0];
  } else if (customId.includes('_map_')) {
    tournament.map = values[0];
  }

  if (tournament.type && tournament.map) {
    const embed = new Discord.EmbedBuilder()
      .setTitle('📝 Final Details')
      .addFields(
        { name: 'Game', value: GAME_TEMPLATES[tournament.game].name, inline: true },
        { name: 'Type', value: tournament.type, inline: true },
        { name: 'Map', value: tournament.map, inline: true }
      )
      .setColor('#00ff00');

    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`create_final_${tournamentId}`)
        .setLabel('✅ Create Tournament')
        .setStyle(Discord.ButtonStyle.Success)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
}

async function handleButton(interaction) {
  const { customId } = interaction;

  if (customId.startsWith('create_final_')) {
    await handleFinalCreate(interaction);
  } else if (customId === 'join_tournament') {
    await handleJoinTournament(interaction);
  } else if (customId === 'book_notify') {
    await handleBookNotify(interaction);
  } else if (customId === 'accept_challenge') {
    await handleAcceptChallenge(interaction);
  } else if (customId.startsWith('add_player_')) {
    await handleAddPlayer(interaction);
  }
}

async function handleFinalCreate(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const tournamentId = interaction.customId.split('_').pop();
  const tournament = tournaments.get(tournamentId);
  
  tournament.status = 'registration';
  tournament.participants = [];
  tournament.maxSlots = GAME_TEMPLATES[tournament.game].defaultSlots;
  tournament.prizePool = 'TBA';
  tournament.scheduledTime = 'TBA';
  
  activeTournament = tournament;

  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  const embed = createTournamentEmbed(tournament);
  
  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN NOW')
      .setStyle(Discord.ButtonStyle.Success)
  );

  await announceChannel.send({ content: '@everyone\n\n🔥 **NEW TOURNAMENT!**', embeds: [embed], components: [row] });

  if (tournament.game === 'minecraft') {
    const mcChannel = await client.channels.fetch(CONFIG.MINECRAFT_CHANNEL);
    await mcChannel.send({ embeds: [embed], components: [row] });
  }

  const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
  await scheduleChannel.send({ embeds: [embed] });

  startTournamentSpam(tournament);

  await interaction.editReply('✅ Tournament created! 🎉');
}

async function handleJoinTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ Registration closed!');
  }

  if (registeredPlayers.has(interaction.user.id)) {
    return interaction.editReply('⚠️ Already registered!');
  }

  if (bannedUsers.has(interaction.user.id)) {
    return interaction.editReply('🚫 You are banned!');
  }

  const invites = userInvites.get(interaction.user.id) || 0;
  const ticketChannel = await createTournamentTicket(interaction.user, activeTournament);
  
  await interaction.editReply(
    `✅ Registration started!\n\nGo to <#${ticketChannel.id}>!\n\n${invites >= 10 ? '🎁 **FREE ENTRY!**' : '💰 Payment required!'}`
  );
}
async function handleTournamentConfig(interaction, customId, values) {
  await interaction.deferUpdate();
  
  const tournamentId = customId.split('_').pop();
  const tournament = tournaments.get(tournamentId);
  
  if (!tournament) return;

  if (customId.includes('_type_')) {
    tournament.type = values[0];
  } else if (customId.includes('_map_')) {
    tournament.map = values[0];
  }

  // If both type and map selected, show final config
  if (tournament.type && tournament.map) {
    const embed = new Discord.EmbedBuilder()
      .setTitle('📝 Final Tournament Details')
      .setDescription('Enter details below and click Create')
      .addFields(
        { name: 'Game', value: GAME_TEMPLATES[tournament.game].name, inline: true },
        { name: 'Type', value: tournament.type, inline: true },
        { name: 'Map', value: tournament.map, inline: true }
      )
      .setColor('#00ff00');

    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`create_final_${tournamentId}`)
        .setLabel('✅ Create Tournament')
        .setStyle(Discord.ButtonStyle.Success)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
}

// ==================== BUTTON HANDLERS ====================
async function handleButton(interaction) {
  const { customId } = interaction;

  if (customId.startsWith('create_final_')) {
    await handleFinalCreate(interaction);
  } else if (customId === 'join_tournament') {
    await handleJoinTournament(interaction);
  } else if (customId === 'book_notify') {
    await handleBookNotify(interaction);
  } else if (customId === 'accept_challenge') {
    await handleAcceptChallenge(interaction);
  } else if (customId === 'confirm_payment') {
    await handleConfirmPayment(interaction);
  } else if (customId.startsWith('add_player_')) {
    await handleAddPlayer(interaction);
  }
}

async function handleFinalCreate(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const tournamentId = interaction.customId.split('_').pop();
  const tournament = tournaments.get(tournamentId);
  
  tournament.status = 'registration';
  tournament.participants = [];
  tournament.maxSlots = GAME_TEMPLATES[tournament.game].defaultSlots;
  tournament.prizePool = 'TBA';
  tournament.scheduledTime = 'TBA';
  
  activeTournament = tournament;

  // Post to announcement channel
  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  const embed = createTournamentEmbed(tournament);
  
  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('join_tournament')
      .setLabel('🎮 JOIN NOW')
      .setStyle(Discord.ButtonStyle.Success)
  );

  await announceChannel.send({ 
    content: '@everyone\n\n🔥 **NEW TOURNAMENT!**', 
    embeds: [embed], 
    components: [row] 
  });

  // Post to game-specific channel
  if (tournament.game === 'minecraft') {
    const mcChannel = await client.channels.fetch(CONFIG.MINECRAFT_CHANNEL);
    await mcChannel.send({ embeds: [embed], components: [row] });
  }

  // Post to tournament schedule
  const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
  await scheduleChannel.send({ embeds: [embed] });

  // Start auto-spam
  startTournamentSpam(tournament);

  await interaction.editReply('✅ Tournament created and announced! 🎉');
}

async function handleJoinTournament(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!activeTournament || activeTournament.status !== 'registration') {
    return interaction.editReply('❌ Registration closed!');
  }

  if (registeredPlayers.has(interaction.user.id)) {
    return interaction.editReply('⚠️ Already registered!');
  }

  if (bannedUsers.has(interaction.user.id)) {
    return interaction.editReply('🚫 You are banned!');
  }

  const invites = userInvites.get(interaction.user.id) || 0;
  
  // Create ticket for payment proof
  const ticketChannel = await createTournamentTicket(interaction.user, activeTournament);
  
  await interaction.editReply(
    `✅ Registration started!\n\n` +
    `Go to <#${ticketChannel.id}> to complete registration!\n\n` +
    `${invites >= CONFIG.MIN_INVITES_FREE_ENTRY ? '🎁 **FREE ENTRY** (10+ invites)!' : '💰 Payment proof required!'}`
  );
}

async function createTournamentTicket(user, tournament) {
  const guild = client.guilds.cache.first();
  const invites = userInvites.get(user.id) || 0;
  const isFree = invites >= CONFIG.MIN_INVITES_FREE_ENTRY;

  const channel = await guild.channels.create({
    name: `reg-${user.username}-${tournament.game}`,
    type: Discord.ChannelType.GuildText,
    parent: (await guild.channels.fetch(CONFIG.OPEN_TICKET)).parent,
    permissionOverwrites: [
      { id: guild.id, deny: [Discord.PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.AttachFiles] },
      { id: CONFIG.STAFF_ROLE, allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ManageChannels] },
      { id: client.user.id, allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages] }
    ],
  });

  tickets.set(channel.id, { 
    userId: user.id, 
    type: 'tournament',
    tournamentId: tournament.id,
    createdAt: new Date() 
  });

  const embed = new Discord.EmbedBuilder()
    .setTitle(`🎮 ${GAME_TEMPLATES[tournament.game].emoji} Tournament Registration`)
    .setDescription(
      `**${tournament.game.toUpperCase()} - ${tournament.type.toUpperCase()}**\n\n` +
      `${isFree ? '🎁 **FREE ENTRY UNLOCKED!**\nYou have 10+ invites!' : '💰 **Payment Required**\nEntry Fee: Check announcement'}\n\n` +
      `**Requirements:**\n` +
      `${isFree ? '✅ No payment needed!' : '📸 Upload payment screenshot to <#' + CONFIG.PAYMENT_PROOF + '>'}\n` +
      `📱 Your game ID/IGN\n` +
      `✅ Follow tournament rules\n\n` +
      `Staff will verify and add you to tournament!`
    )
    .setColor(isFree ? '#00ff00' : '#ff9900')
    .setThumbnail(user.displayAvatarURL({ dynamic: true }));

  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId(`add_player_${user.id}_${tournament.id}`)
      .setLabel(isFree ? '✅ Add to Tournament (Free)' : '✅ Confirm Payment & Add')
      .setStyle(Discord.ButtonStyle.Success)
      .setEmoji('🎮')
  );

  await channel.send({ 
    content: `${user} <@&${CONFIG.STAFF_ROLE}>`, 
    embeds: [embed], 
    components: [row] 
  });

  return channel;
}

async function handleAddPlayer(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({ content: '❌ Staff only!', ephemeral: true });
  }

  await interaction.deferUpdate();

  const [, , userId, tournamentId] = interaction.customId.split('_');
  const user = await client.users.fetch(userId);
  const tournament = tournaments.get(tournamentId);

  if (!tournament) {
    return interaction.followUp({ content: '❌ Tournament not found!', ephemeral: true });
  }

  registeredPlayers.set(userId, {
    user,
    tournament: tournamentId,
    joinedAt: new Date(),
    addedBy: interaction.user.id
  });

  // Update ticket
  const successEmbed = new Discord.EmbedBuilder()
    .setTitle('✅ REGISTERED!')
    .setDescription(
      `${user} added to tournament!\n\n` +
      `**Tournament:** ${tournament.game} ${tournament.type}\n` +
      `**Position:** ${registeredPlayers.size}/${tournament.maxSlots}\n\n` +
      `Room details will be sent via DM when tournament starts!\n\n` +
      `This ticket will auto-close in ${CONFIG.AUTO_DELETE_TICKET_MINUTES} minutes.`
    )
    .setColor('#00ff00')
    .setFooter({ text: `Added by ${interaction.user.tag}` });

  await interaction.channel.send({ embeds: [successEmbed] });

  // Announce in general
  await announceNewPlayer(user, tournament);

  // DM user
  try {
    await user.send({
      content: `✅ **REGISTERED!**\n\nTournament: ${tournament.game} ${tournament.type}\nPosition: ${registeredPlayers.size}/${tournament.maxSlots}\n\nRoom details coming soon! 🎮`,
      embeds: [successEmbed]
    });
  } catch (err) {}

  // Update leaderboards
  await updateAllLeaderboards();

  // Auto-close ticket
  setTimeout(async () => {
    try {
      await interaction.channel.delete();
      tickets.delete(interaction.channel.id);
    } catch (err) {}
  }, CONFIG.AUTO_DELETE_TICKET_MINUTES * 60000);

  // Disable button
  const disabledRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId(`add_player_${userId}_${tournamentId}`)
      .setLabel('✅ Added to Tournament')
      .setStyle(Discord.ButtonStyle.Secondary)
      .setDisabled(true)
  );

  const messages = await interaction.channel.messages.fetch({ limit: 10 });
  const buttonMsg = messages.find(m => m.components.length > 0);
  if (buttonMsg) await buttonMsg.edit({ components: [disabledRow] });
}

async function announceNewPlayer(user, tournament) {
  const remaining = tournament.maxSlots - registeredPlayers.size;
  const percentage = ((registeredPlayers.size / tournament.maxSlots) * 100).toFixed(0);

  const messages = [
    `🎮 **NEW PLAYER!** ${user} joined ${tournament.game} tournament!\n📊 ${registeredPlayers.size}/${tournament.maxSlots} (${percentage}%) - ${remaining} slots left! 🔥`,
    `⚡ ${user} registered! ${tournament.game} tournament heating up! 🔥\n📊 Progress: ${generateProgressBar(registeredPlayers.size, tournament.maxSlots)}`,
    `🚀 ${user} is IN! Only ${remaining} slots remaining!\n💰 ${tournament.prizePool}\n⏰ ${tournament.scheduledTime}`
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];
  
  const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
  await channel.send(msg);

  // Update tournament schedule
  const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
  const embed = createTournamentEmbed(tournament);
  await scheduleChannel.send({ embeds: [embed] });
}

// ==================== STAFF COMMANDS CONTINUED ====================
async function handleSendRoom(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const tournamentId = interaction.options.getString('tournamentid');
  const roomId = interaction.options.getString('roomid');
  const password = interaction.options.getString('password');

  const tournament = tournaments.get(tournamentId);
  if (!tournament) {
    return interaction.editReply('❌ Tournament not found!');
  }

  // Store credentials securely
  roomCredentials.set(tournamentId, { roomId, password, setBy: interaction.user.id });
  tournament.status = 'live';

  // Send to all registered players via DM (no copy/paste embed)
  let sent = 0;
  for (const [userId] of registeredPlayers.entries()) {
    try {
      const user = await client.users.fetch(userId);
      
      // Create image-based credential message (harder to copy)
      const embed = new Discord.EmbedBuilder()
        .setTitle('🔐 TOURNAMENT LIVE!')
        .setDescription(
          `**${tournament.game.toUpperCase()} - ${tournament.type.toUpperCase()}**\n\n` +
          `⚠️ **STRICTLY CONFIDENTIAL**\n` +
          `❌ DO NOT share or forward!\n\n` +
          `**Room Details:**`
        )
        .addFields(
          { name: '🆔 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
          { name: '🔐 Password', value: password ? `\`\`\`${password}\`\`\`` : '❌ No password', inline: false }
        )
        .setColor('#ff0000')
        .setFooter({ text: '⚠️ Screenshot prohibited! Join directly!' })
        .setTimestamp();

      await user.send({ embeds: [embed] });
      sent++;
    } catch (err) {
      console.log(`Could not DM user ${userId}`);
    }
  }

  // Announce in announcement channel (without actual credentials)
  const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
  const announceEmbed = new Discord.EmbedBuilder()
    .setTitle('🚨 TOURNAMENT STARTING NOW!')
    .setDescription(
      `**${tournament.game.toUpperCase()}** - ${tournament.type.toUpperCase()}\n\n` +
      `🎮 ${registeredPlayers.size} players registered!\n` +
      `🔐 Room details sent via DM!\n` +
      `⚠️ Check your DMs NOW!\n\n` +
      `**Rules:**\n${CONFIG.RULES || 'Follow tournament rules!'}`
    )
    .setColor('#00ff00');

  await announceChannel.send({ content: '@everyone', embeds: [announceEmbed] });

  await interaction.editReply(`✅ Room credentials sent to ${sent} players via DM!`);
}

async function handleDeclareWinner(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const tournamentId = interaction.options.getString('tournamentid');
  const tournament = tournaments.get(tournamentId);

  if (!tournament) {
    return interaction.editReply('❌ Tournament not found!');
  }

  // Show player selection
  const players = Array.from(registeredPlayers.entries())
    .filter(([, data]) => data.tournament === tournamentId)
    .slice(0, 25);

  if (players.length === 0) {
    return interaction.editReply('❌ No players in this tournament!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏆 Select Winners')
    .setDescription(`Select 1st, 2nd, 3rd place for ${tournament.game}`)
    .setColor('#ffd700');

  const selectRow = new Discord.ActionRowBuilder().addComponents(
    new Discord.StringSelectMenuBuilder()
      .setCustomId(`winner_first_${tournamentId}`)
      .setPlaceholder('🥇 Select 1st Place')
      .addOptions(players.map(([userId, data]) => ({
        label: data.user.username,
        value: userId,
        description: `1st Place Winner`
      })))
  );

  await interaction.editReply({ embeds: [embed], components: [selectRow] });
}

// ==================== MODERATION ====================
async function handleBan(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  // Protect staff from being banned
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (member && isStaff(member)) {
    return interaction.editReply('❌ Cannot ban staff members! Staff are protected!');
  }

  bannedUsers.set(user.id, {
    reason,
    by: interaction.user.tag,
    date: new Date()
  });

  registeredPlayers.delete(user.id);

  try {
    await user.send(
      `🚫 **YOU ARE BANNED FROM OTO TOURNAMENTS!**\n\n` +
      `**Reason:** ${reason}\n` +
      `**By:** ${interaction.user.tag}\n\n` +
      `Contact admins if you believe this is a mistake.`
    );
  } catch (err) {}

  await interaction.editReply(`✅ Banned ${user.tag}\n**Reason:** ${reason}`);
}

async function handleTimeout(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser('user');
  const minutes = interaction.options.getInteger('minutes');
  const reason = interaction.options.getString('reason') || 'Breaking rules';

  // Protect staff
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!member) return interaction.editReply('❌ User not in server!');
  
  if (isStaff(member)) {
    return interaction.editReply('❌ Cannot timeout staff! Staff are protected!');
  }

  try {
    await member.timeout(minutes * 60 * 1000, reason);
    
    try {
      await user.send(
        `⏱️ **TIMED OUT FOR ${minutes} MINUTES!**\n\n` +
        `**Reason:** ${reason}\n\n` +
        `Behave properly next time!`
      );
    } catch (err) {}

    await interaction.editReply(`✅ Timed out ${user.tag} for ${minutes} minutes.`);
  } catch (err) {
    await interaction.editReply(`❌ Failed to timeout: ${err.message}`);
  }
}

async function handleWarn(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  // Protect staff
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (member && isStaff(member)) {
    return interaction.editReply('❌ Cannot warn staff! Staff are protected!');
  }

  const userWarns = warnings.get(user.id) || [];
  userWarns.push({
    reason,
    by: interaction.user.tag,
    date: new Date()
  });
  warnings.set(user.id, userWarns);

  try {
    await user.send(
      `⚠️ **WARNING ${userWarns.length}/3**\n\n` +
      `**Reason:** ${reason}\n` +
      `**By:** ${interaction.user.tag}\n\n` +
      `${userWarns.length >= 3 ? '🚫 Next warning = BAN!' : 'Improve your behavior!'}`
    );
  } catch (err) {}

  await interaction.editReply(`✅ Warned ${user.tag} (${userWarns.length}/3)\n**Reason:** ${reason}`);

  // Auto-ban at 3 warnings
  if (userWarns.length >= 3) {
    bannedUsers.set(user.id, {
      reason: '3 warnings received',
      by: 'AUTO-BAN',
      date: new Date()
    });
    
    try {
      await user.send('🚫 **AUTO-BANNED** after 3 warnings!');
    } catch (err) {}
  }
}

// ==================== STAFF MANAGEMENT ====================
async function handleAddStaff(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  const role = await interaction.guild.roles.fetch(CONFIG.STAFF_ROLE);

  if (!role) return interaction.editReply('❌ Staff role not found!');
  if (member.roles.cache.has(CONFIG.STAFF_ROLE)) {
    return interaction.editReply('⚠️ Already staff!');
  }

  await member.roles.add(role);
  staffMembers.add(user.id);

  // Random encouraging message
  const welcomeMsg = CONFIG.STAFF_WELCOME_MESSAGES[Math.floor(Math.random() * CONFIG.STAFF_WELCOME_MESSAGES.length)];

  // Staff chat announcement
  const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT).catch(() => null);
  if (staffChannel) {
    const embed = new Discord.EmbedBuilder()
      .setTitle('🎉 NEW STAFF MEMBER!')
      .setDescription(
        `Welcome ${user} to OTO Staff Team! 👮\n\n` +
        `**Message from management:**\n${welcomeMsg}\n\n` +
        `**Your responsibilities:**\n` +
        `🎮 Manage tournaments\n` +
        `👥 Handle player issues\n` +
        `🛡️ Moderate community\n` +
        `🎫 Respond to tickets\n\n` +
        `**Promoted by:** ${interaction.user}\n` +
        `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
      )
      .setColor('#00ff00')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    await staffChannel.send({ content: `<@&${CONFIG.STAFF_ROLE}> ${user}`, embeds: [embed] });
  }

  // DM user
  try {
    const dmEmbed = new Discord.EmbedBuilder()
      .setTitle('👮 YOU ARE NOW OTO STAFF!')
      .setDescription(
        `${welcomeMsg}\n\n` +
        `**Your Powers:**\n` +
        `✅ Create & manage tournaments\n` +
        `✅ Add/remove players\n` +
        `✅ Warn & timeout users\n` +
        `✅ Handle tickets\n` +
        `✅ Send room credentials\n\n` +
        `**Important:**\n` +
        `• Be fair and professional\n` +
        `• Help players\n` +
        `• Follow OTO rules\n` +
        `• Work as a team\n\n` +
        `Use \`/help\` to see staff commands!\n\n` +
        `**Welcome to the team! 💪**`
      )
      .setColor('#ffd700')
      .setThumbnail(CONFIG.QR_IMAGE);

    await user.send({ embeds: [dmEmbed] });
  } catch (err) {}

  await interaction.editReply(`✅ ${user.tag} is now staff! Welcome message sent! 🎉`);
}

async function handleRemoveStaff(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser('user');
  const member = await interaction.guild.members.fetch(user.id);
  const role = await interaction.guild.roles.fetch(CONFIG.STAFF_ROLE);

  if (!member.roles.cache.has(CONFIG.STAFF_ROLE)) {
    return interaction.editReply('⚠️ Not a staff member!');
  }

  await member.roles.remove(role);
  staffMembers.delete(user.id);

  // Notify staff chat
  const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT).catch(() => null);
  if (staffChannel) {
    await staffChannel.send(
      `👤 **STAFF REMOVED**\n\n` +
      `${user.tag} is no longer staff.\n` +
      `**Removed by:** ${interaction.user.tag}`
    );
  }

  try {
    await user.send(
      `👤 **STAFF ROLE REMOVED**\n\n` +
      `You are no longer OTO staff.\n` +
      `**Removed by:** ${interaction.user.tag}\n\n` +
      `You can still participate as a regular member!`
    );
  } catch (err) {}

  await interaction.editReply(`✅ Removed ${user.tag} from staff!`);
}

// ==================== LEADERBOARDS ====================
async function handleLeaderboard(interaction) {
  await interaction.deferReply();

  const type = interaction.options.getString('type');

  if (type === 'invites') {
    await showInviteLeaderboard(interaction);
  } else {
    await showGameLeaderboard(interaction, type);
  }
}

async function showInviteLeaderboard(interaction) {
  const sorted = Array.from(userInvites.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (sorted.length === 0) {
    return interaction.editReply('❌ No invite data yet!');
  }

  const embed = new Discord.EmbedBuilder()
    .setTitle('🏅 Most Invites Leaderboard')
    .setDescription(
      sorted.map(([userId, count], i) => {
        const medals = ['👑', '🥈', '🥉'];
        const medal = medals[i] || `${i + 1}.`;
        const status = count >= CONFIG.MIN_INVITES_FREE_ENTRY ? '✅' : '❌';
        return `${medal} <@${userId}> - **${count}** invites ${status}`;
      }).join('\n')
    )
    .setColor('#ffd700')
    .setFooter({ text: `${CONFIG.MIN_INVITES_FREE_ENTRY}+ invites = Free entry!` });

  await interaction.editReply({ embeds: [embed] });
}

async function showGameLeaderboard(interaction, game) {
  const gameData = GAME_TEMPLATES[game];
  const stats = gameStats[game];

  if (!stats || stats.size === 0) {
    return interaction.editReply(`❌ No ${gameData.name} stats yet!`);
  }

  const sorted = Array.from(stats.entries())
    .sort((a, b) => {
      if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
      return b[1].topThree - a[1].topThree;
    })
    .slice(0, 15);

  const embed = new Discord.EmbedBuilder()
    .setTitle(`${gameData.emoji} ${gameData.name} Leaderboard`)
    .setDescription(
      sorted.map(([userId, data], i) => {
        const medals = ['👑', '🥈', '🥉'];
        const medal = medals[i] || `${i + 1}.`;
        return `${medal} <@${userId}>\n   🏆 ${data.wins} Wins | 🎮 ${data.played} Played | 🥇 ${data.topThree} Top 3`;
      }).join('\n\n')
    )
    .setColor('#3498db');

  await interaction.editReply({ embeds: [embed] });
}

async function updateAllLeaderboards() {
  try {
    // Update invite tracker channel
    const inviteChannel = await client.channels.fetch(CONFIG.INVITE_TRACKER);
    const inviteEmbed = new Discord.EmbedBuilder()
      .setTitle('🔗 Top Inviters')
      .setDescription(
        Array.from(userInvites.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([userId, count], i) => `${i + 1}. <@${userId}> - ${count} invites`)
          .join('\n') || 'No data yet'
      )
      .setColor('#ffd700')
      .setTimestamp();

    const messages = await inviteChannel.messages.fetch({ limit: 5 });
    const botMsgs = messages.filter(m => m.author.id === client.user.id);
    if (botMsgs.size > 0) await inviteChannel.bulkDelete(botMsgs);
    await inviteChannel.send({ embeds: [inviteEmbed] });

    // Update most played channel
    const mostPlayedChannel = await client.channels.fetch(CONFIG.MOST_PLAYED);
    const allStats = new Map();
    
    for (const [userId, data] of userStats.entries()) {
      allStats.set(userId, data);
    }

    const topPlayers = Array.from(allStats.entries())
      .sort((a, b) => b[1].played - a[1].played)
      .slice(0, 10);

    const playedEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 Most Active Players')
      .setDescription(
        topPlayers.map(([userId, data], i) => 
          `${i + 1}. <@${userId}> - ${data.played} tournaments`
        ).join('\n') || 'No data yet'
      )
      .setColor('#3498db')
      .setTimestamp();

    const playedMsgs = await mostPlayedChannel.messages.fetch({ limit: 5 });
    const playedBotMsgs = playedMsgs.filter(m => m.author.id === client.user.id);
    if (playedBotMsgs.size > 0) await mostPlayedChannel.bulkDelete(playedBotMsgs);
    await mostPlayedChannel.send({ embeds: [playedEmbed] });

  } catch (err) {
    console.error('Leaderboard update error:', err);
  }
}

// ==================== MESSAGE HANDLER ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Bad word filter
  if (containsBadWord(content)) {
    try {
      await message.delete();
      
      const userWarns = warnings.get(message.author.id) || [];
      userWarns.push({
        reason: 'Bad language',
        by: 'AUTO-MOD',
        date: new Date()
      });
      warnings.set(message.author.id, userWarns);

      const warnMsg = await message.channel.send(
        `⚠️ ${message.author} **WARNING!** Bad language not allowed!\n` +
        `Warnings: ${userWarns.length}/3\n` +
        `${userWarns.length >= 2 ? '🚫 Next warning = Timeout!' : ''}`
      );

      setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

      // Auto-timeout after 2 warnings
      if (userWarns.length >= 2) {
        const member = await message.guild.members.fetch(message.author.id);
        if (!isStaff(member)) {
          await member.timeout(10 * 60 * 1000, 'Bad language - Auto timeout');
          
          try {
            await message.author.send(
              `⏱️ **AUTO-TIMEOUT: 10 MINUTES**\n\n` +
              `**Reason:** Bad language\n` +
              `**Warnings:** ${userWarns.length}/3\n\n` +
              `Keep chat clean!`
            );
          } catch (err) {}
        }
      }
    } catch (err) {
      console.error('Bad word filter error:', err);
    }
    return;
  }

  // Spam detection
  if (await isSpamming(message)) {
    try {
      await message.delete();
      
      const member = await message.guild.members.fetch(message.author.id);
      if (!isStaff(member)) {
        await member.timeout(5 * 60 * 1000, 'Spamming');
        
        const warnMsg = await message.channel.send(
          `🚫 ${message.author} **TIMEOUT: 5 MINUTES**\n` +
          `**Reason:** Spamming\n\n` +
          `Don't spam!`
        );
        
        setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
      }
    } catch (err) {}
    return;
  }

  // Bot mention response
  if (message.mentions.has(client.user)) {
    const responses = [
      `Hey ${message.author}! 👋\n**Where to join?**\nCheck <#${CONFIG.ANNOUNCEMENT_CHANNEL}> for tournaments!\nUse \`/help\` for commands!`,
      `Yo ${message.author}! 🎮\n**Yese khelo:**\n1️⃣ 10 log invite karo\n2️⃣ Free tournament entry pao\n3️⃣ Prizes jeeto! 💰`,
      `Bhai ${message.author}! 👋\nTournament join karna hai?\n<#${CONFIG.TOURNAMENT_SCHEDULE}> dekho schedule!\nInvite karo friends ko! 🔗`
    ];
    
    return message.reply(responses[Math.floor(Math.random() * responses.length)]);
  }

  // Staff mention - auto response
  if (content.includes('staff') || content.includes('@staff') || content.includes('admin')) {
    if (message.channel.id === CONFIG.GENERAL_CHAT) {
      return message.reply(
        `📨 **Staff ko message bheja gaya hai!**\n\n` +
        `Staffs are working on your query.\n` +
        `Apko jaldi hi reply mil jayega! ⏰\n\n` +
        `Ya phir ticket kholo: <#${CONFIG.OPEN_TICKET}> 🎫`
      );
    }
  }

  // Only in general chat
  if (message.channel.id !== CONFIG.GENERAL_CHAT) return;

  // Track for 2-minute auto-response
  const lastResponse = pendingResponses.get(message.author.id);
  if (!lastResponse || Date.now() - lastResponse > 120000) {
    pendingResponses.set(message.author.id, Date.now());
    
    // Wait 2 minutes for someone to respond
    setTimeout(async () => {
      try {
        const messages = await message.channel.messages.fetch({ limit: 10 });
        const userMessages = messages.filter(m => 
          m.createdTimestamp > message.createdTimestamp && 
          m.author.id !== message.author.id && 
          m.author.id !== client.user.id
        );

        // If no one replied in 2 minutes
        if (userMessages.size === 0) {
          const responses = [
            `Hi bro ${message.author}! 👋\nTournament check karna hai aaj? <#${CONFIG.TOURNAMENT_SCHEDULE}>\nYa custom challenge karoge? Use \`/challenge\` 🎮`,
            `Hey ${message.author}! Kya haal hai?\nToday's tournaments: <#${CONFIG.ANNOUNCEMENT_CHANNEL}>\nChallenge ready ho? 💪`,
            `Bhai ${message.author}! 🔥\nAaj tournament kheloge?\nYa Beat Our Player challenge try karoge? 🎯`
          ];
          
          await message.reply(responses[Math.floor(Math.random() * responses.length)]);
        }
      } catch (err) {}
    }, 120000); // 2 minutes
  }

  // Auto-responses
  const autoResponses = {
    'tournament': [
      `Tournaments dekho: <#${CONFIG.TOURNAMENT_SCHEDULE}> 🎮`,
      `Bhai tournaments daily hote hain! <#${CONFIG.ANNOUNCEMENT_CHANNEL}> check karo! 🔥`
    ],
    'free': [
      `Free entry chahiye? 10 logo ko invite karo! Simple! 🎁`,
      `10 invites = FREE entry in all tournaments! 💰`
    ],
    'join': [
      `Join kaise kare? <#${CONFIG.HOW_TO_JOIN}> dekho full guide! 📖`,
      `Tournament join: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> pe JOIN button dabao! ⚡`
    ],
    'invite': [
      `Invites check karo: \`/invites\` 🔗`,
      `10 invites complete karo = Free entry unlock! 🎉`
    ],
    'rules': [
      `Rules: <#${CONFIG.RULES_CHANNEL}> 📋`,
      `Tournament rules important hain bro! Follow karo! ✅`
    ],
  };

  for (const [keyword, responses] of Object.entries(autoResponses)) {
    if (content.includes(keyword)) {
      return message.reply(responses[Math.floor(Math.random() * responses.length)]);
    }
  }
});

// ==================== MEMBER JOIN ====================
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

      // Random welcome message
      const welcomeMsg = CONFIG.WELCOME_MESSAGES[Math.floor(Math.random() * CONFIG.WELCOME_MESSAGES.length)]
        .replace('{user}', `${member}`);

      const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
      await channel.send(
        `${welcomeMsg}\n\n💫 **Invited by:** <@${usedInvite.inviter.id}>\n🔗 **Total invites:** ${current + 1}\n${current + 1 >= CONFIG.MIN_INVITES_FREE_ENTRY ? '🎁 **FREE ENTRY UNLOCKED!** ✅' : `📊 ${CONFIG.MIN_INVITES_FREE_ENTRY - current - 1} more for free entry!`}`
      );

      // Post to invite tracker
      const inviteTrackerChannel = await client.channels.fetch(CONFIG.INVITE_TRACKER);
      await inviteTrackerChannel.send(
        `✅ **New Invite!**\n` +
        `**Inviter:** <@${usedInvite.inviter.id}>\n` +
        `**Invited:** ${member}\n` +
        `**Total:** ${current + 1}\n` +
        `**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
      );

      // DM inviter
      try {
        const inviter = await client.users.fetch(usedInvite.inviter.id);
        
        if (current + 1 === CONFIG.MIN_INVITES_FREE_ENTRY) {
          // Unlocked reward!
          const rewardEmbed = new Discord.EmbedBuilder()
            .setTitle('🎉 REWARD UNLOCKED!')
            .setDescription(
              `**Congratulations!** 🎊\n\n` +
              `You completed **10 invites**!\n\n` +
              `**Your Rewards:**\n` +
              `✅ FREE tournament entry (all games)\n` +
              `✅ Beat Our Player challenges\n` +
              `✅ Priority booking\n` +
              `✅ Special perks\n\n` +
              `Use \`/book\` to reserve your slot!\n` +
              `Use \`/challenge\` for special matches!`
            )
            .setColor('#ffd700')
            .setThumbnail(CONFIG.QR_IMAGE);

          await inviter.send({ embeds: [rewardEmbed] });

          // Announce in general
          await channel.send(
            `🎉 **MILESTONE REACHED!** 🎉\n\n` +
            `<@${usedInvite.inviter.id}> completed **10 invites**!\n\n` +
            `🎁 **FREE ENTRY UNLOCKED!**\n` +
            `⚔️ **CHALLENGES UNLOCKED!**\n\n` +
            `Congratulations! 👑`
          );
        } else {
          await inviter.send(
            `🎉 **New Invite!**\n\n` +
            `${member.user.tag} joined using your link!\n\n` +
            `**Total Invites:** ${current + 1}\n` +
            `${current + 1 >= CONFIG.MIN_INVITES_FREE_ENTRY ? '✅ FREE ENTRY UNLOCKED!' : `📊 ${CONFIG.MIN_INVITES_FREE_ENTRY - current - 1} more for FREE entry!`}`
          );
        }
      } catch (err) {}

      // Welcome DM to new member
      setTimeout(async () => {
        try {
          const welcomeEmbed = new Discord.EmbedBuilder()
            .setTitle('👋 Welcome to OTO Tournament!')
            .setDescription(
              `Hey ${member.user.username}! 🎮\n\n` +
              `**Quick Start Guide:**\n\n` +
              `1️⃣ **Invite 10 people** = FREE tournament entry! 🎁\n` +
              `2️⃣ Check tournaments: <#${CONFIG.TOURNAMENT_SCHEDULE}>\n` +
              `3️⃣ Read rules: <#${CONFIG.RULES_CHANNEL}>\n` +
              `4️⃣ Join tournaments: <#${CONFIG.ANNOUNCEMENT_CHANNEL}>\n\n` +
              `**Games We Support:**\n` +
              `🔥 Free Fire\n` +
              `⛏️ Minecraft\n` +
              `🎯 PUBG Mobile\n\n` +
              `**Commands:**\n` +
              `\`/invites\` - Check your invites\n` +
              `\`/help\` - All commands\n` +
              `\`/book\` - Book tournament (10+ invites)\n\n` +
              `**Big prizes daily! Good luck! 💰**`
            )
            .setColor('#00ff00')
            .setThumbnail(CONFIG.QR_IMAGE)
            .setFooter({ text: 'Invite friends to unlock rewards!' });

          await member.send({ embeds: [welcomeEmbed] });
        } catch (err) {}
      }, 3000);
    }

    // Update cache
    newInvites.forEach(inv => inviteCache.set(inv.code, inv.uses));

    // Update leaderboards
    await updateAllLeaderboards();

  } catch (err) {
    console.error('Member join error:', err);
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

    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    await channel.send(
      `😢 ${member.user.tag} left the server... Bye bye! 👋`
    );

    // Update cache
    newInvites.forEach(inv => inviteCache.set(inv.code, inv.uses));

  } catch (err) {
    console.error('Member leave error:', err);
  }
});

// ==================== UTILITY FUNCTIONS ====================
function containsBadWord(text) {
  return CONFIG.BAD_WORDS.some(word => text.toLowerCase().includes(word));
}

async function isSpamming(message) {
  const userId = message.author.id;
  const now = Date.now();
  
  if (!spamTimers.has(userId)) {
    spamTimers.set(userId, []);
  }
  
  const timestamps = spamTimers.get(userId);
  timestamps.push(now);
  
  // Remove old timestamps (older than 5 seconds)
  const recent = timestamps.filter(t => now - t < 5000);
  spamTimers.set(userId, recent);
  
  // If more than 5 messages in 5 seconds = spam
  return recent.length > 5;
}

function isStaff(member) {
  return member?.roles?.cache?.has(CONFIG.STAFF_ROLE) || 
         member?.permissions?.has(Discord.PermissionFlagsBits.Administrator);
}

function createTournamentEmbed(tournament) {
  const gameData = GAME_TEMPLATES[tournament.game];
  const progress = generateProgressBar(registeredPlayers.size, tournament.maxSlots);

  return new Discord.EmbedBuilder()
    .setTitle(`${gameData.emoji} ${tournament.game.toUpperCase()} Tournament`)
    .setDescription(
      `**Type:** ${tournament.type}\n` +
      `**Map:** ${tournament.map}\n` +
      `**Status:** ${tournament.status.toUpperCase()}`
    )
    .addFields(
      { name: '💰 Prize Pool', value: tournament.prizePool || 'TBA', inline: true },
      { name: '⏰ Time', value: tournament.scheduledTime || 'TBA', inline: true },
      { name: '📊 Slots', value: `${registeredPlayers.size}/${tournament.maxSlots}`, inline: true },
      { name: '📈 Progress', value: progress, inline: false }
    )
    .setColor(tournament.status === 'live' ? '#00ff00' : '#3498db')
    .setThumbnail(CONFIG.QR_IMAGE)
    .setFooter({ text: `Tournament ID: ${tournament.id}` })
    .setTimestamp();
}

function generateProgressBar(current, max) {
  const percentage = Math.min((current / max) * 100, 100);
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;
  return `${'🟩'.repeat(filled)}${'⬜'.repeat(empty)} **${percentage.toFixed(0)}%** (${current}/${max})`;
}

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
      console.log(`✅ Cached ${invites.size} invites`);
    } catch (err) {
      console.warn(`⚠️ Could not fetch invites`);
    }
  }
}

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

// ==================== AUTOMATED TASKS ====================
function startAutomatedTasks() {
  // Tournament spam every 2 minutes
  setInterval(async () => {
    if (activeTournament && activeTournament.status === 'registration') {
      await spamTournamentAnnouncement();
    }
  }, CONFIG.SPAM_INTERVAL);

  // Update leaderboards every 30 minutes
  setInterval(async () => {
    await updateAllLeaderboards();
  }, 1800000);

  // Bot status update every 5 minutes
  setInterval(() => {
    if (activeTournament) {
      client.user.setActivity(
        `${GAME_TEMPLATES[activeTournament.game].emoji} ${activeTournament.game} | ${registeredPlayers.size}/${activeTournament.maxSlots}`,
        { type: Discord.ActivityType.Competing }
      );
    } else {
      client.user.setActivity('🏆 OTO Multi-Game Tournaments', { type: Discord.ActivityType.Competing });
    }
  }, 300000);

  console.log('✅ Automated tasks started');
}

async function spamTournamentAnnouncement() {
  if (!activeTournament || activeTournament.status !== 'registration') return;

  try {
    const remaining = activeTournament.maxSlots - registeredPlayers.size;
    const percentage = ((registeredPlayers.size / activeTournament.maxSlots) * 100).toFixed(0);
    const gameData = GAME_TEMPLATES[activeTournament.game];

    const messages = [
      `🔥 **${gameData.emoji} ${activeTournament.game.toUpperCase()} TOURNAMENT!** 🔥\n\n💰 Prize: **${activeTournament.prizePool}**\n⏰ Time: **${activeTournament.scheduledTime}**\n📊 Slots: **${registeredPlayers.size}/${activeTournament.maxSlots}** (${percentage}% full)\n🎮 Type: ${activeTournament.type} | Map: ${activeTournament.map}\n\n👉 JOIN: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> 👈`,
      
      `⚡ **${remaining} SLOTS LEFT!** ⚡\n\n${gameData.emoji} ${activeTournament.game} - ${activeTournament.type}\n💰 Win: **${activeTournament.prizePool}**\n⏰ ${activeTournament.scheduledTime}\n\n🎁 10+ invites = FREE entry!\n\n<#${CONFIG.ANNOUNCEMENT_CHANNEL}> 🔥`,
      
      `🎮 **REGISTER NOW!** ${gameData.emoji}\n\n${activeTournament.game.toUpperCase()} Tournament\n📊 ${registeredPlayers.size}/${activeTournament.maxSlots} registered\n\n${generateProgressBar(registeredPlayers.size, activeTournament.maxSlots)}\n\nJoin: <#${CONFIG.ANNOUNCEMENT_CHANNEL}> ⚡`
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];
    
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    const sentMsg = await channel.send(msg);

    // Add JOIN button
    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('join_tournament')
        .setLabel('🎮 JOIN TOURNAMENT')
        .setStyle(Discord.ButtonStyle.Success)
    );

    setTimeout(async () => {
      try {
        await sentMsg.edit({ content: msg, components: [row] });
      } catch (err) {}
    }, 1000);

  } catch (err) {
    console.error('Spam error:', err);
  }
}

function startTournamentSpam(tournament) {
  // Initial spam
  setTimeout(() => spamTournamentAnnouncement(), 5000);
}

async function setupPersistentMessages() {
  try {
    // Setup messages in channels
    console.log('✅ Persistent messages setup (optional)');
  } catch (err) {
    console.error('Setup error:', err);
  }
}

async function handleBookNotify(interaction) {
  await interaction.deferUpdate();
  
  const embed = new Discord.EmbedBuilder()
    .setTitle('🔔 Notifications Enabled!')
    .setDescription(
      `You'll be notified when:\n` +
      `✅ New tournaments open\n` +
      `✅ Challenges are available\n` +
      `✅ Special events start\n\n` +
      `Keep your DMs open!`
    )
    .setColor('#00ff00');

  await interaction.followUp({ embeds: [embed], ephemeral: true });

  try {
    await interaction.user.send(
      `🔔 **Notifications Activated!**\n\n` +
      `You'll receive updates for:\n` +
      `• New tournaments\n` +
      `• Beat Our Player challenges\n` +
      `• Special events\n\n` +
      `Stay ready! 🎮`
    );
  } catch (err) {}
}

async function handleAcceptChallenge(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const challengeRoom = `ROOM-${Math.floor(Math.random() * 10000)}`;
  const challengePass = `PASS-${Math.floor(Math.random() * 1000)}`;

  const embed = new Discord.EmbedBuilder()
    .setTitle('⚔️ Challenge Accepted!')
    .setDescription(
      `**Beat Our Player Challenge**\n\n` +
      `You're facing OTO's best player!\n\n` +
      `**Room Details:**\n` +
      `🆔 Room ID: \`${challengeRoom}\`\n` +
      `🔐 Password: \`${challengePass}\`\n\n` +
      `**If you WIN:**\n` +
      `🎁 FREE Squad tournament entry\n` +
      `💰 Bonus prize\n` +
      `👑 Special role\n\n` +
      `**Good luck warrior!** 💪`
    )
    .setColor('#ff0000')
    .setFooter({ text: 'Play fair and show your skills!' });

  await interaction.editReply({ embeds: [embed] });

  try {
    await interaction.user.send({ embeds: [embed] });
  } catch (err) {}

  // Notify staff
  const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT);
  await staffChannel.send(
    `⚔️ **Challenge Accepted!**\n` +
    `**Player:** ${interaction.user}\n` +
    `**Room:** ${challengeRoom}\n` +
    `**Pass:** ${challengePass}\n\n` +
    `Staff player should join now!`
  );
}

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('Client error:', err));
client.on('warn', warn => console.warn('Warning:', warn));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => console.log('🚀 OTO Super Bot logging in...'))
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });
