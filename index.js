

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const os = require('os');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');

const QRCode = require('qrcode');
const fetch = require('node-fetch'); // v2
// Node 18+ has global fetch; node-fetch kept for portability

// ---------------------------
// Configuration & Constants
// ---------------------------

const ROOT_DIR = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TEMPLATE_DIR = path.join(ROOT_DIR, 'templates');
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages');
const UTILS_DIR = path.join(ROOT_DIR, 'utils');

const CONFIG_PATH = path.join(ROOT_DIR, 'config.json');

const DEFAULT_CONFIG = {
  prefix: '!',
  adminRoleName: 'Admin',
  staffRoles: ['Admin', 'Moderator', 'Support', 'Payment Verifier'],
  ownerId: '',
  channels: {
    general: '',
    tournaments: '',
    payments: '',
    staff: '',
    tickets: '',
    lobby: '',
    announcements: '',
  },
  autoSaveIntervalSec: 300,
  paymentTimeoutSec: 900,
  welcomeDm: true,
  languageDefault: 'en',
  maxTicketsPerUser: 3,
  timezone: 'Asia/Kolkata',
  autoApprovePaymentsUnder: 0, // amount under which payments auto-approve
  maxTournamentRecurrence: 365,
};

const DEFAULT_FILES = {
  'profiles.json': {},
  'invites.json': {},
  'tournaments.json': {},
  'tickets.json': {},
  'payments.json': {},
  'leaderboard.json': {},
  'moderation.json': {},
  'stats.json': {},
  'settings.json': {},
};

const DEFAULT_TEMPLATES = {
  'ff-solo.json': { id: 'ff-solo', name: 'Free Fire Solo', game: 'Free Fire', mode: 'Solo', slots: 100, entryFee: 20, prizeStructure: { 1: 0.5, 2: 0.3, 3: 0.2 }, rules: ['No cheating'], createdAt: new Date().toISOString() },
  'ff-squad.json': { id: 'ff-squad', name: 'Free Fire Squad', game: 'Free Fire', mode: 'Squad', slots: 40, entryFee: 60, prizeStructure: { 1: 0.6, 2: 0.25, 3: 0.15 }, rules: ['No cheating'], createdAt: new Date().toISOString() },
  'mc-team.json': { id: 'mc-team', name: 'Minecraft Team', game: 'Minecraft', mode: 'Team', slots: 32, entryFee: 0, prizeStructure: {}, rules: [], createdAt: new Date().toISOString() },
  'custom.json': { id: 'custom', name: 'Custom Tournament', game: 'Custom', mode: 'Custom', slots: 16, entryFee: 0, prizeStructure: {}, rules: [], createdAt: new Date().toISOString() },
};

const DEFAULT_MESSAGES = {
  'welcome.json': [
    '🔥 Yo! Welcome to OTO Tournaments! Ready to win big?',
    '💪 A new warrior has arrived! Let\'s goooo!',
    '🎮 Welcome bro! Your journey to ₹₹₹ starts now!',
    '⚡ New player detected! Tournament kheloge?',
    'Welcome! Please complete your profile to unlock channels.',
  ],
  'staff-welcome.json': [
    'Welcome to Staff Team! Let\'s keep things smooth and fair.',
    'You\'re now Staff. Use quick actions wisely.',
  ],
  'auto-responses.json': {
    greetings: ['hi', 'hello', 'hey', 'kya haal', 'sup'],
    answers: {
      'how to join': 'Use the /tournament join <id> command or press the JOIN button on the tournament message.',
      'when is tournament': 'Use /tournament list to see upcoming tournaments with times.',
      'what prizes': 'Prizes are shown on the tournament card. Use /tournament details <id>.',
      'how to invite': 'Use /invite link to get your referral link.',
      'payment kaise': 'Use /pay generate <tournamentId> to generate a QR with exact amount.',
    },
  },
  'announcements.json': [
    'New tournament live! Register now!',
    'Payment pending players: Please complete payment to confirm your slot.',
  ],
};

// Badges list
const BADGES = [
  { id: 'first_tournament', emoji: '🎖️', name: 'First Tournament', description: 'Played first match' },
  { id: 'hot_streak', emoji: '🔥', name: 'Hot Streak', description: 'Won 3 in a row' },
  { id: 'champion', emoji: '👑', name: 'Champion', description: 'Won 10+ tournaments' },
  { id: 'elite_inviter', emoji: '💎', name: 'Elite Inviter', description: '50+ invites' },
  { id: 'quick_draw', emoji: '⚡', name: 'Quick Draw', description: 'Registered in under 1 min' },
  { id: 'sharpshooter', emoji: '🎯', name: 'Sharpshooter', description: 'High kill average in FF' },
  { id: 'builder', emoji: '🏗️', name: 'Builder', description: 'High score in Minecraft' },
  { id: 'money_maker', emoji: '💰', name: 'Money Maker', description: 'Earned ₹5000+' },
  { id: 'early_bird', emoji: '📱', name: 'Early Bird', description: 'Registered in first 100 users' },
  { id: 'og_member', emoji: '🌟', name: 'OG Member', description: 'Joined in launch month' },
];

// ---------------------------
// Utility helpers
// ---------------------------

async function ensureDirsAndFiles() {
  const dirs = [DATA_DIR, TEMPLATE_DIR, MESSAGES_DIR, UTILS_DIR];
  for (const d of dirs) {
    try {
      await fsPromises.mkdir(d, { recursive: true });
    } catch (e) { /* ignore */ }
  }

  // default data files
  for (const [name, content] of Object.entries(DEFAULT_FILES)) {
    const filePath = path.join(DATA_DIR, name);
    try {
      await fsPromises.stat(filePath);
    } catch (e) {
      await writeJsonAtomic(filePath, content);
    }
  }

  // default templates
  for (const [name, content] of Object.entries(DEFAULT_TEMPLATES)) {
    const filePath = path.join(TEMPLATE_DIR, name);
    try {
      await fsPromises.stat(filePath);
    } catch (e) {
      await writeJsonAtomic(filePath, content);
    }
  }

  // default messages
  for (const [name, content] of Object.entries(DEFAULT_MESSAGES)) {
    const filePath = path.join(MESSAGES_DIR, name);
    try {
      await fsPromises.stat(filePath);
    } catch (e) {
      await writeJsonAtomic(filePath, content);
    }
  }

  // config
  try {
    await fsPromises.stat(CONFIG_PATH);
  } catch (e) {
    await writeJsonAtomic(CONFIG_PATH, DEFAULT_CONFIG);
  }
}

async function readJson(filePath, fallback = null) {
  try {
    const raw = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(raw || 'null');
  } catch (e) {
    return fallback;
  }
}

async function writeJsonAtomic(filePath, data) {
  const tmp = `${filePath}.tmp`;
  const str = JSON.stringify(data, null, 2);
  await fsPromises.writeFile(tmp, str, 'utf8');
  await fsPromises.rename(tmp, filePath);
}

// in-memory write lock map
const writeLocks = new Map();
async function lockedWrite(filePath, data) {
  // naive lock
  while (writeLocks.get(filePath)) {
    await new Promise((res) => setTimeout(res, 10));
  }
  writeLocks.set(filePath, true);
  try {
    await writeJsonAtomic(filePath, data);
  } finally {
    writeLocks.set(filePath, false);
  }
}

function shortId(prefix = '') {
  return prefix + uuidv4().split('-')[0];
}

function nowIso() {
  return new Date().toISOString();
}

// Safe fetch JSON wrapper
async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { raw: text };
    }
  } catch (e) {
    return null;
  }
}

// ---------------------------
// Bot Initialization
// ---------------------------

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!BOT_TOKEN) {
  console.error('Bot token missing. Set BOT_TOKEN or DISCORD_TOKEN or TOKEN in environment.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.custom = {
  config: DEFAULT_CONFIG,
  data: {}, // loaded JSON files
  templates: {},
  messages: {},
  cooldowns: new Map(),
  jobs: {}, // scheduled jobs
};

// ---------------------------
// Load / Save Data
// ---------------------------

async function loadAll() {
  await ensureDirsAndFiles();
  // load config
  client.custom.config = (await readJson(CONFIG_PATH, DEFAULT_CONFIG)) || DEFAULT_CONFIG;

  // load templates
  const tFiles = await fsPromises.readdir(TEMPLATE_DIR);
  client.custom.templates = {};
  for (const f of tFiles) {
    if (!f.endsWith('.json')) continue;
    const p = path.join(TEMPLATE_DIR, f);
    client.custom.templates[path.basename(f, '.json')] = await readJson(p, {});
  }

  // load messages
  const mFiles = await fsPromises.readdir(MESSAGES_DIR);
  client.custom.messages = {};
  for (const f of mFiles) {
    if (!f.endsWith('.json')) continue;
    const p = path.join(MESSAGES_DIR, f);
    client.custom.messages[path.basename(f, '.json')] = await readJson(p, {});
  }

  // load data files
  for (const [name] of Object.entries(DEFAULT_FILES)) {
    const p = path.join(DATA_DIR, name);
    client.custom.data[name] = (await readJson(p, DEFAULT_FILES[name])) || DEFAULT_FILES[name];
  }
}

async function saveAll() {
  // save config
  await lockedWrite(CONFIG_PATH, client.custom.config);
  // save data
  for (const [name, content] of Object.entries(client.custom.data)) {
    const p = path.join(DATA_DIR, name);
    await lockedWrite(p, content);
  }
  // note: templates and messages left untouched unless modified by bot
}

// schedule autosave
function scheduleAutosave() {
  const sec = client.custom.config.autoSaveIntervalSec || 300;
  setInterval(async () => {
    try {
      await saveAll();
      console.log('[AutoSave] Saved all JSON data at', nowIso());
    } catch (e) {
      console.error('[AutoSave] Failed', e);
    }
  }, sec * 1000);
}

// ---------------------------
// Embeds and UI helpers
// ---------------------------

function embed(opts = {}) {
  const e = new EmbedBuilder();
  if (opts.title) e.setTitle(opts.title);
  if (opts.description) e.setDescription(opts.description);
  if (opts.fields) e.addFields(opts.fields);
  if (opts.color) e.setColor(opts.color);
  if (opts.footer) e.setFooter({ text: opts.footer, iconURL: opts.footerIcon });
  if (opts.image) e.setImage(opts.image);
  if (opts.thumbnail) e.setThumbnail(opts.thumbnail);
  if (opts.timestamp) e.setTimestamp(opts.timestamp);
  return e;
}

// ---------------------------
// QR code generation
// ---------------------------

async function generateQr(amount, reference, note = '') {
  const payload = { amount: Number(amount || 0), ref: reference || shortId('REF-'), note, ts: nowIso() };
  try {
    const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), { margin: 1, scale: 6 });
    return { dataUrl, payload };
  } catch (e) {
    console.error('QR gen failed', e);
    return null;
  }
}

// ---------------------------
// Ticket management
// ---------------------------

function createTicket(userId, type = 'support', meta = {}) {
  const tickets = client.custom.data['tickets.json'];
  const id = shortId('TKT-');
  tickets[id] = {
    id,
    userId,
    type,
    meta,
    status: 'open',
    createdAt: nowIso(),
    messages: [],
    assignedTo: null,
    priority: meta.priority || 'medium',
  };
  return tickets[id];
}

function addTicketMessage(ticketId, authorId, content) {
  const tickets = client.custom.data['tickets.json'];
  if (!tickets[ticketId]) return null;
  const msg = { id: uuidv4(), authorId, content, ts: nowIso() };
  tickets[ticketId].messages.push(msg);
  return msg;
}

function closeTicket(ticketId, closedBy, reason = '') {
  const tickets = client.custom.data['tickets.json'];
  if (!tickets[ticketId]) return null;
  tickets[ticketId].status = 'closed';
  tickets[ticketId].closedAt = nowIso();
  tickets[ticketId].closedBy = closedBy;
  tickets[ticketId].closeReason = reason;
  return tickets[ticketId];
}

// ---------------------------
// Tournament system
// ---------------------------

function createTournament(templateId, overrides = {}) {
  const template = client.custom.templates[templateId] || client.custom.templates['custom'] || DEFAULT_TEMPLATES['custom.json'];
  const tournaments = client.custom.data['tournaments.json'];
  const id = shortId('TRN-');
  const t = {
    id,
    name: overrides.name || template.name || `${template.game} ${template.mode}`,
    game: template.game,
    mode: template.mode,
    templateId,
    slots: overrides.slots || template.slots || 16,
    slotsTaken: 0,
    entryFee: overrides.entryFee !== undefined ? overrides.entryFee : template.entryFee || 0,
    prizeStructure: overrides.prizeStructure || template.prizeStructure || {},
    status: overrides.status || 'upcoming',
    scheduledAt: overrides.scheduledAt || null,
    createdAt: nowIso(),
    creator: overrides.creator || 'bot',
    players: [],
    lobbyId: null,
    metadata: overrides.metadata || {},
    logs: [],
  };
  tournaments[id] = t;
  // update stats
  client.custom.data['stats.json'].lastTournamentCreated = nowIso();
  return t;
}

function listTournaments(filter = {}) {
  const tournaments = client.custom.data['tournaments.json'];
  return Object.values(tournaments).filter((t) => {
    if (filter.game && t.game !== filter.game) return false;
    if (filter.status && t.status !== filter.status) return false;
    if (filter.mode && t.mode !== filter.mode) return false;
    return true;
  });
}

function getTournamentById(id) {
  return client.custom.data['tournaments.json'][id] || null;
}

function registerForTournament(tournamentId, userProfile) {
  const tournaments = client.custom.data['tournaments.json'];
  const profiles = client.custom.data['profiles.json'];
  const t = tournaments[tournamentId];
  if (!t) throw new Error('Tournament not found');
  if (t.players.find((p) => p.userId === userProfile.userId)) throw new Error('Already registered');
  if (t.players.length >= t.slots) throw new Error('Tournament full');
  const playerObj = {
    userId: userProfile.userId,
    ign: userProfile.ign || '',
    registeredAt: nowIso(),
    payment: { status: t.entryFee > 0 ? 'pending' : 'free', amount: t.entryFee || 0, ref: null, verified: false },
    status: 'registered',
  };
  t.players.push(playerObj);
  t.slotsTaken = t.players.length;
  // ensure profile exists
  const p = profiles[userProfile.userId] || {
    userId: userProfile.userId,
    username: userProfile.username || '',
    language: userProfile.language || client.custom.config.languageDefault || 'en',
    createdAt: nowIso(),
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    badges: [],
    invites: 0,
    earnings: 0,
  };
  profiles[userProfile.userId] = p;
  return playerObj;
}

async function generatePaymentForPlayer(tournamentId, userId) {
  const tournaments = client.custom.data['tournaments.json'];
  const payments = client.custom.data['payments.json'];
  const t = tournaments[tournamentId];
  if (!t) throw new Error('Tournament not found');
  const player = t.players.find((p) => p.userId === userId);
  if (!player) throw new Error('Player not registered');
  if (player.payment.status === 'paid') return { already: true };
  const ref = shortId('PAY-');
  const amount = Number(player.payment.amount || 0);
  const qr = await generateQr(amount, ref, `Payment for ${t.name}`);
  payments[ref] = {
    id: ref,
    tournamentId,
    userId,
    amount,
    status: 'pending',
    generatedAt: nowIso(),
    expiresAt: new Date(Date.now() + (client.custom.config.paymentTimeoutSec || 900) * 1000).toISOString(),
    qr: qr?.dataUrl || null,
    payload: qr?.payload || null,
  };
  player.payment.ref = ref;
  return payments[ref];
}

function verifyPayment(ref, verifierId = 'system') {
  const payments = client.custom.data['payments.json'];
  if (!payments[ref]) return null;
  const payment = payments[ref];
  payment.status = 'processing';
  payment.verifiedAt = nowIso();
  payment.verifiedBy = verifierId;
  payment.status = 'paid';
  // update tournament player
  const tournaments = client.custom.data['tournaments.json'];
  const t = tournaments[payment.tournamentId];
  if (t) {
    const player = t.players.find((p) => p.userId === payment.userId);
    if (player) {
      player.payment.status = 'paid';
      player.payment.verified = true;
      player.payment.verifiedAt = payment.verifiedAt;
      player.payment.ref = payment.id;
    }
  }
  // update leaderboard and profiles
  const profiles = client.custom.data['profiles.json'];
  const lb = client.custom.data['leaderboard.json'];
  lb[payment.userId] = (lb[payment.userId] || 0) + payment.amount;
  if (profiles[payment.userId]) {
    profiles[payment.userId].earnings = (profiles[payment.userId].earnings || 0);
  }
  return payment;
}

// ---------------------------
// Leaderboards & Badges
// ---------------------------

function updateLeaderboardForWin(userId, amount) {
  const lb = client.custom.data['leaderboard.json'];
  lb[userId] = (lb[userId] || 0) + amount;
  client.custom.data['leaderboard.json'] = lb;
}

function awardBadge(userId, badgeId) {
  const profiles = client.custom.data['profiles.json'];
  const p = profiles[userId];
  if (!p) return false;
  p.badges = p.badges || [];
  if (!p.badges.includes(badgeId)) {
    p.badges.push(badgeId);
    return true;
  }
  return false;
}

function computeWinRate(profile) {
  const plays = profile.tournamentsPlayed || 0;
  const wins = profile.tournamentsWon || 0;
  if (plays === 0) return 0;
  return Number(((wins / plays) * 100).toFixed(2));
}

// ---------------------------
// Moderation & AutoMod
// ---------------------------

function warnUser(guildId, userId, reason, issuedBy) {
  const modLog = client.custom.data['moderation.json'];
  const id = shortId('WRN-');
  modLog[id] = { id, guildId, userId, reason, issuedBy, ts: nowIso(), action: 'warning' };
  return modLog[id];
}

function banUser(guild, userId, days = 0, reason = 'Violation') {
  try {
    guild.members.ban(userId, { days, reason }).catch(() => {});
  } catch (e) { /* ignore */ }
  const modLog = client.custom.data['moderation.json'];
  const id = shortId('BAN-');
  modLog[id] = { id, guildId: guild.id, userId, reason, ts: nowIso(), action: 'ban' };
  return modLog[id];
}

const BAD_WORDS = ['idiot', 'stupid', 'noob', 'trash', 'mc', 'bc'];

// ---------------------------
// Notifications & Reminders
// ---------------------------

async function sendTournamentReminder(tournament) {
  try {
    // DM all registered players 30 minutes before start
    const guildChannels = client.custom.config.channels;
    for (const player of (tournament.players || [])) {
      try {
        const user = await client.users.fetch(player.userId);
        await user.send(`Reminder: Tournament ${tournament.name} starts at ${tournament.scheduledAt || 'soon'}.`);
      } catch (e) {
        // ignore DM failures
      }
    }
  } catch (e) {
    console.error('sendTournamentReminder failed', e);
  }
}

// ---------------------------
// Command handling (prefix + slash)
// ---------------------------

client.prefixCommands = new Map();
client.slashCommandDefs = [];

// helper to register prefix command
function registerPrefixCommand(name, handler, meta = {}) {
  client.prefixCommands.set(name, { handler, meta });
}

// register slash commands in-memory
function registerSlashCommand(def) {
  client.slashCommandDefs.push(def);
}

// Example prefix commands

registerPrefixCommand('ping', async (message, args) => {
  const latency = Date.now() - message.createdTimestamp;
  const e = embed({ title: 'Pong!', description: `Latency: ${latency}ms\nWS: ${Math.round(client.ws.ping)}ms`, color: 0x00ff00 });
  await message.reply({ embeds: [e] });
});

registerPrefixCommand('help', async (message, args) => {
  const commands = Array.from(client.prefixCommands.keys()).join(', ');
  await message.reply(`Available commands: ${commands}\nSlash commands are also available. Use /help for detailed guide.`);
});

// tournament prefix: !tournament create/list/join/details
registerPrefixCommand('tournament', async (message, args) => {
  const sub = args[0];
  if (!sub) return message.reply('Usage: !tournament <create|list|join|details>');
  if (sub === 'list') {
    const tournaments = Object.values(client.custom.data['tournaments.json'] || {});
    if (!tournaments.length) return message.reply('No tournaments available.');
    const msg = tournaments.map(t => `${t.id} - ${t.name} [${t.slotsTaken}/${t.slots}] - ₹${t.entryFee} - ${t.status}`).join('\n');
    await message.reply(`Tournaments:\n${msg}`);
  } else if (sub === 'create') {
    // syntax: !tournament create <templateId> "Custom Name" slots entryFee
    const templateId = args[1];
    if (!templateId) return message.reply('Provide template id: ff-solo, ff-squad, mc-team, custom');
    const name = args[2] || undefined;
    const slots = args[3] ? Number(args[3]) : undefined;
    const entryFee = args[4] ? Number(args[4]) : undefined;
    try {
      const t = createTournament(templateId, { name, slots, entryFee, creator: message.author.id });
      await message.reply(`Tournament created: ${t.id} - ${t.name}`);
    } catch (e) {
      await message.reply('Failed to create tournament: ' + e.message);
    }
  } else if (sub === 'join') {
    const tid = args[1];
    if (!tid) return message.reply('Provide tournament id: !tournament join TRN-xxxx');
    try {
      // ensure profile exists
      const profiles = client.custom.data['profiles.json'];
      const p = profiles[message.author.id] || { userId: message.author.id, username: message.author.username, language: detectLanguageFromText('') };
      p.username = message.author.username;
      profiles[message.author.id] = p;
      const player = registerForTournament(tid, p);
      await message.reply(`Registered to ${tid}. Payment status: ${player.payment.status}`);
    } catch (e) {
      await message.reply('Failed to join: ' + e.message);
    }
  } else if (sub === 'details') {
    const tid = args[1];
    if (!tid) return message.reply('Provide tournament id: !tournament details TRN-xxxx');
    const t = getTournamentById(tid);
    if (!t) return message.reply('Tournament not found');
    const fields = [
      { name: 'Name', value: t.name, inline: true },
      { name: 'Slots', value: `${t.slotsTaken}/${t.slots}`, inline: true },
      { name: 'Entry Fee', value: `₹${t.entryFee}`, inline: true },
    ];
    await message.reply({ embeds: [embed({ title: `Tournament ${t.id}`, fields })] });
  } else {
    await message.reply('Unknown subcommand for tournament');
  }
});

// pay commands
registerPrefixCommand('pay', async (message, args) => {
  const sub = args[0];
  if (sub === 'generate') {
    const tid = args[1];
    if (!tid) return message.reply('Provide tournament id: !pay generate TRN-xxxx');
    try {
      const p = await generatePaymentForPlayer(tid, message.author.id);
      if (p.already) return message.reply('Payment already exists or paid.');
      const e = embed({ title: 'Payment QR', description: `Ref: ${p.id}\nAmount: ₹${p.amount}` });
      if (p.qr) e.setImage(p.qr);
      await message.reply({ embeds: [e] });
    } catch (e) {
      await message.reply('Failed to generate payment: ' + e.message);
    }
  } else if (sub === 'verify') {
    if (!hasStaff(message.member)) return message.reply('Staff only.');
    const ref = args[1];
    if (!ref) return message.reply('Provide payment ref: !pay verify PAY-xxxx');
    const p = verifyPayment(ref, message.author.id);
    if (!p) return message.reply('Payment not found');
    await message.reply(`Payment ${ref} verified for <@${p.userId}>`);
  } else {
    await message.reply('Usage: !pay generate <tournamentId> | !pay verify <ref> (staff)');
  }
});

// invite command
registerPrefixCommand('invite', async (message, args) => {
  const sub = args[0] || 'link';
  if (sub === 'link') {
    const base = 'https://discord.gg/'; // placeholder
    const ref = `?ref=${message.author.username}-${message.author.id}`;
    const link = base + ref;
    const invites = client.custom.data['invites.json'];
    invites[message.author.id] = invites[message.author.id] || { count: 0, links: [] };
    invites[message.author.id].links.push({ link, createdAt: nowIso() });
    await message.reply(`Your referral link: ${link}`);
  } else {
    await message.reply('Unknown invite subcommand');
  }
});

// leaderboard
registerPrefixCommand('leaderboard', async (message, args) => {
  const lb = client.custom.data['leaderboard.json'] || {};
  const arr = Object.entries(lb).map(([uid, amt]) => ({ uid, amt })).sort((a, b) => b.amt - a.amt).slice(0, 10);
  if (!arr.length) return message.reply('Leaderboard empty.');
  const lines = arr.map((e, i) => `${i + 1}. <@${e.uid}> — ₹${toFixedNumber(e.amt)}`).join('\n');
  await message.reply({ embeds: [embed({ title: 'Top Earners', description: lines })] });
});

// admin announce
registerPrefixCommand('announce', async (message, args) => {
  if (!hasStaff(message.member)) return message.reply('Staff only.');
  const channelId = args[0];
  const msg = args.slice(1).join(' ');
  if (!channelId || !msg) return message.reply('Usage: !announce <channelId> <message>');
  const ch = message.guild.channels.cache.get(channelId);
  if (!ch) return message.reply('Channel not found.');
  await ch.send(msg);
  await message.reply('Announcement sent.');
});

// helper for formatting numbers
function toFixedNumber(n, d = 2) {
  return Number.parseFloat(n || 0).toFixed(d);
}

// ---------------------------
// Language detection & translation (basic stubs)
// ---------------------------

function detectLanguageFromText(text) {
  if (!text) return client.custom.config.languageDefault || 'en';
  const lower = text.toLowerCase();
  const hindiWords = ['kya', 'kaise', 'kahan', 'bhai', 'bhaiya', 'namaste', 'dhanyavaad', 'shukriya'];
  for (const w of hindiWords) {
    if (lower.includes(w)) return 'hi';
  }
  return 'en';
}

function translate(text, to = 'en') {
  // naive replacements for demo only
  if (!text) return text;
  if (to === 'hi') {
    const map = { 'welcome': 'स्वागत है', 'tournament': 'टूर्नामेंट', 'join': 'जॉइन', 'payment': 'पेमेन्ट' };
    let out = text;
    for (const [k, v] of Object.entries(map)) {
      out = out.replace(new RegExp(k, 'ig'), v);
    }
    return out;
  }
  return text;
}

// ---------------------------
// Interaction (slash commands + buttons + modals)
// ---------------------------

// Build slash command definitions
const slashCommands = [
  new SlashCommandBuilder().setName('profile').setDescription('View profile').addUserOption(opt => opt.setName('user').setDescription('User to view')),
  new SlashCommandBuilder().setName('tournament').setDescription('Tournament ops')
    .addSubcommand(s => s.setName('create').setDescription('Create from template').addStringOption(o => o.setName('template').setDescription('Template id').setRequired(true)).addStringOption(o => o.setName('name').setDescription('Name')).addIntegerOption(o => o.setName('slots').setDescription('Slots')).addNumberOption(o => o.setName('entryfee').setDescription('Entry fee')))
    .addSubcommand(s => s.setName('list').setDescription('List tournaments').addStringOption(o => o.setName('status').setDescription('Status')))
    .addSubcommand(s => s.setName('join').setDescription('Join tournament').addStringOption(o => o.setName('id').setDescription('Tournament id').setRequired(true))),
  new SlashCommandBuilder().setName('ticket').setDescription('Ticket ops').addSubcommand(s => s.setName('open').setDescription('Open ticket').addStringOption(o => o.setName('type').setDescription('Type'))).addSubcommand(s => s.setName('close').setDescription('Close ticket').addStringOption(o => o.setName('id').setDescription('Ticket id').setRequired(true))),
  new SlashCommandBuilder().setName('pay').setDescription('Payment ops').addSubcommand(s => s.setName('generate').setDescription('Generate QR').addStringOption(o => o.setName('tournament').setDescription('Tournament id').setRequired(true))).addSubcommand(s => s.setName('verify').setDescription('Verify payment').addStringOption(o => o.setName('ref').setDescription('Payment ref').setRequired(true))),
  new SlashCommandBuilder().setName('invite').setDescription('Invite tools').addSubcommand(s => s.setName('link').setDescription('Get referral link')),
  new SlashCommandBuilder().setName('leaderboard').setDescription('Show leaderboard'),
  new SlashCommandBuilder().setName('announce').setDescription('Send announcement (staff)') .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)),
].map(c => c.toJSON());

// Register slash commands globally (best effort)
async function registerSlashCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
    console.log('Registering global slash commands...');
    await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands });
    console.log('Slash commands registered.');
  } catch (e) {
    console.warn('Failed to register slash commands globally', e);
  }
}

// Interaction handler
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = interaction.commandName;
      if (cmd === 'profile') {
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.options.getUser('user') || interaction.user;
        const profiles = client.custom.data['profiles.json'];
        const p = profiles[user.id] || { userId: user.id, username: user.username, tournamentsPlayed: 0, tournamentsWon: 0, badges: [], earnings: 0 };
        const embedMsg = embed({ title: `${p.username}'s Profile`, fields: [{ name: 'Played', value: String(p.tournamentsPlayed || 0), inline: true }, { name: 'Wins', value: String(p.tournamentsWon || 0), inline: true }, { name: 'Win Rate', value: `${computeWinRate(p)}%`, inline: true }, { name: 'Earnings', value: `₹${toFixedNumber(p.earnings || 0)}`, inline: true }], color: 0x00aaff });
        await interaction.editReply({ embeds: [embedMsg] });
      } else if (cmd === 'tournament') {
        const sub = interaction.options.getSubcommand();
        if (sub === 'create') {
          await interaction.deferReply({ ephemeral: true });
          const template = interaction.options.getString('template');
          const name = interaction.options.getString('name');
          const slots = interaction.options.getInteger('slots');
          const entryFee = interaction.options.getNumber('entryfee');
          try {
            const t = createTournament(template, { name, slots, entryFee, creator: interaction.user.id });
            await interaction.editReply({ embeds: [embed({ title: 'Tournament Created', description: `${t.name} (${t.id})`, fields: [{ name: 'Slots', value: `${t.slots}` }, { name: 'Entry Fee', value: `₹${t.entryFee}` }] })] });
          } catch (e) {
            await interaction.editReply('Failed: ' + e.message);
          }
        } else if (sub === 'list') {
          await interaction.deferReply();
          const status = interaction.options.getString('status');
          const ts = listTournaments({ status });
          if (!ts.length) return interaction.editReply('No tournaments found.');
          await interaction.editReply({ embeds: [embed({ title: 'Tournaments', description: ts.slice(0, 10).map(t => `${t.id} - ${t.name} [${t.slotsTaken}/${t.slots}] - ₹${t.entryFee}`).join('\n') })] });
        } else if (sub === 'join') {
          await interaction.deferReply({ ephemeral: true });
          const tid = interaction.options.getString('id');
          try {
            const profiles = client.custom.data['profiles.json'];
            const p = profiles[interaction.user.id] || { userId: interaction.user.id, username: interaction.user.username, language: detectLanguageFromText('') };
            p.username = interaction.user.username;
            profiles[interaction.user.id] = p;
            const player = registerForTournament(tid, p);
            await interaction.editReply(`Registered to ${tid}. Payment status: ${player.payment.status}`);
          } catch (e) {
            await interaction.editReply('Failed: ' + e.message);
          }
        }
      } else if (cmd === 'ticket') {
        const sub = interaction.options.getSubcommand();
        if (sub === 'open') {
          await interaction.deferReply({ ephemeral: true });
          const type = interaction.options.getString('type') || 'support';
          const t = createTicket(interaction.user.id, type, { openedBy: interaction.user.id });
          await interaction.editReply(`Ticket ${t.id} created.`);
        } else if (sub === 'close') {
          await interaction.deferReply({ ephemeral: true });
          const id = interaction.options.getString('id');
          const t = closeTicket(id, interaction.user.id, 'Closed via slash');
          if (!t) await interaction.editReply('Ticket not found.');
          else await interaction.editReply(`Ticket ${id} closed.`);
        }
      } else if (cmd === 'pay') {
        const sub = interaction.options.getSubcommand();
        if (sub === 'generate') {
          await interaction.deferReply({ ephemeral: true });
          const tid = interaction.options.getString('tournament');
          try {
            const p = await generatePaymentForPlayer(tid, interaction.user.id);
            if (p.already) {
              await interaction.editReply('Payment already exists or paid.');
              return;
            }
            const emb = embed({ title: 'Payment QR', description: `Ref: ${p.id}\nAmount: ₹${p.amount}` });
            if (p.qr) emb.setImage(p.qr);
            await interaction.editReply({ embeds: [emb] });
          } catch (e) {
            await interaction.editReply('Failed: ' + e.message);
          }
        } else if (sub === 'verify') {
          if (!hasStaff(interaction.member)) {
            await interaction.reply({ content: 'Staff only.', ephemeral: true });
            return;
          }
          await interaction.deferReply({ ephemeral: true });
          const ref = interaction.options.getString('ref');
          try {
            const p = verifyPayment(ref, interaction.user.id);
            if (!p) return interaction.editReply('Payment not found.');
            await interaction.editReply(`Payment ${ref} verified for <@${p.userId}>.`);
          } catch (e) {
            await interaction.editReply('Failed: ' + e.message);
          }
        }
      } else if (cmd === 'invite') {
        await interaction.deferReply({ ephemeral: true });
        const base = 'https://discord.gg/';
        const ref = `?ref=${interaction.user.username}-${interaction.user.id}`;
        const link = base + ref;
        const invites = client.custom.data['invites.json'];
        invites[interaction.user.id] = invites[interaction.user.id] || { count: 0, links: [] };
        invites[interaction.user.id].links.push({ link, createdAt: nowIso() });
        await interaction.editReply(`Your referral link: ${link}`);
      } else if (cmd === 'leaderboard') {
        await interaction.deferReply();
        const lb = client.custom.data['leaderboard.json'] || {};
        const arr = Object.entries(lb).map(([uid, amt]) => ({ uid, amt })).sort((a, b) => b.amt - a.amt).slice(0, 10);
        if (!arr.length) return interaction.editReply('Leaderboard empty.');
        const lines = arr.map((e, i) => `${i + 1}. <@${e.uid}> — ₹${toFixedNumber(e.amt)}`).join('\n');
        await interaction.editReply({ embeds: [embed({ title: 'Leaderboard', description: lines })] });
      } else if (cmd === 'announce') {
        if (!hasStaff(interaction.member)) {
          await interaction.reply({ content: 'Staff only.', ephemeral: true });
          return;
        }
        await interaction.deferReply({ ephemeral: true });
        const ch = interaction.options.getChannel('channel');
        const msg = interaction.options.getString('message');
        try {
          await ch.send(msg);
          await interaction.editReply('Announcement sent.');
        } catch (e) {
          await interaction.editReply('Failed: ' + e.message);
        }
      }
    } else if (interaction.isButton()) {
      const custom = interaction.customId;
      if (custom.startsWith('join_trn_')) {
        await interaction.deferReply({ ephemeral: true });
        const tid = custom.replace('join_trn_', '');
        try {
          const profiles = client.custom.data['profiles.json'];
          const p = profiles[interaction.user.id] || { userId: interaction.user.id, username: interaction.user.username };
          profiles[interaction.user.id] = p;
          const player = registerForTournament(tid, p);
          await interaction.editReply(`Registered to ${tid}. Payment status: ${player.payment.status}`);
        } catch (e) {
          await interaction.editReply('Failed to join: ' + e.message);
        }
      } else if (custom.startsWith('ticket_close_')) {
        const tid = custom.replace('ticket_close_', '');
        if (!hasStaff(interaction.member)) {
          await interaction.reply({ content: 'Staff only.', ephemeral: true });
          return;
        }
        const t = closeTicket(tid, interaction.user.id, 'Closed by staff via button');
        if (!t) return interaction.reply({ content: 'Ticket not found', ephemeral: true });
        await interaction.reply({ content: `Ticket ${tid} closed.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `Button ${custom} clicked`, ephemeral: true });
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'complete_profile_modal') {
        const name = interaction.fields.getTextInputValue('profile_name');
        const ign = interaction.fields.getTextInputValue('profile_ign');
        const game = interaction.fields.getTextInputValue('profile_game');
        const profiles = client.custom.data['profiles.json'];
        const p = profiles[interaction.user.id] || { userId: interaction.user.id };
        p.username = name || interaction.user.username;
        p.ign = ign;
        p.favoriteGame = game;
        p.profileCompleteAt = nowIso();
        profiles[interaction.user.id] = p;
        await interaction.reply({ content: 'Profile saved!', ephemeral: true });
      }
    }
  } catch (e) {
    console.error('interactionCreate failed', e);
    try {
      if (!interaction.replied) await interaction.reply({ content: 'Error handling interaction', ephemeral: true });
    } catch (e2) { /* ignore */ }
  }
});

// ---------------------------
// Message event: prefix commands, automod, tracking
// ---------------------------

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;

    // Auto-responses
    const auto = client.custom.messages['auto-responses.json'] || {};
    const content = (message.content || '').trim();
    if (content) {
      const l = content.toLowerCase();
      for (const g of (auto.greetings || [])) {
        if (l.includes(g)) {
          const reply = auto.answers['how to join'] || 'Use /tournament join';
          await message.reply(reply).catch(() => {});
          break;
        }
      }
    }

    // Prefix command handling
    const prefix = client.custom.config.prefix || '!';
    if (content.startsWith(prefix)) {
      const args = content.slice(prefix.length).trim().split(/\s+/);
      const cmd = args.shift().toLowerCase();
      const handler = client.prefixCommands.get(cmd);
      if (handler) {
        try {
          await handler.handler(message, args);
        } catch (e) {
          console.error('Handler error', e);
          await message.reply('Command failed: ' + e.message).catch(() => {});
        }
        return;
      }
    }

    // Moderation: bad words
    const lower = (message.content || '').toLowerCase();
    for (const w of BAD_WORDS) {
      if (lower.includes(w)) {
        // context allow
        if (w === 'mc' && lower.includes('minecraft')) continue;
        warnUser(message.guild ? message.guild.id : 'dm', message.author.id, `Used forbidden word: ${w}`, 'auto-mod');
        await message.reply({ content: 'Please avoid using that language. This is an automated warning.' }).catch(() => {});
        break;
      }
    }

    // Track messages for profile
    const profiles = client.custom.data['profiles.json'];
    const p = profiles[message.author.id] || { userId: message.author.id, username: message.author.username, createdAt: nowIso(), messages: 0 };
    p.username = message.author.username;
    p.language = p.language || detectLanguageFromText(message.content);
    p.messages = (p.messages || 0) + 1;
    profiles[message.author.id] = p;
  } catch (e) {
    // ignore
  }
});

// ---------------------------
// Guild member events: welcome, invite tracking, onboarding
// ---------------------------

client.on('guildMemberAdd', async (member) => {
  try {
    const welcome = client.custom.messages['welcome.json'] || [];
    const text = welcome[Math.floor(Math.random() * welcome.length)] || `Welcome ${member.user.username}!`;
    const chId = client.custom.config.channels.general;
    if (chId) {
      const ch = member.guild.channels.cache.get(chId);
      if (ch) ch.send(`${text} <@${member.user.id}>`).catch(() => {});
    }
    if (client.custom.config.welcomeDm) {
      try {
        const dm = await member.createDM();
        const embedMsg = embed({ title: 'Welcome to OTO!', description: 'Complete your profile to unlock channels.' });
        await dm.send({ embeds: [embedMsg] });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('onboard_tutorial').setLabel('Tutorial').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('onboard_profile').setLabel('Complete Profile').setStyle(ButtonStyle.Secondary),
        );
        await dm.send({ content: 'Quick actions:', components: [row] });
      } catch (e) { /* ignore */ }
    }
    // invites tracking stub
    const invites = client.custom.data['invites.json'];
    invites[member.user.id] = invites[member.user.id] || { joinedAt: nowIso() };
  } catch (e) {
    // ignore
  }
});

// ---------------------------
// Staff tools & quick actions
// ---------------------------

async function staffApprovePayment(paymentRef, staffUserId) {
  const p = verifyPayment(paymentRef, staffUserId);
  if (!p) throw new Error('Payment not found');
  try {
    const user = await client.users.fetch(p.userId);
    await user.send(`Your payment ${paymentRef} for ${p.tournamentId} has been approved.`);
  } catch (e) { /* ignore */ }
  return p;
}

// Quick action buttons builder for staff messages
function staffActionRow(paymentRef) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`approve_pay_${paymentRef}`).setLabel('✅ Approve').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`reject_pay_${paymentRef}`).setLabel('❌ Reject').setStyle(ButtonStyle.Danger),
  );
}

// handle staff quick action buttons
client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isButton()) return;
    const id = interaction.customId;
    if (id.startsWith('approve_pay_')) {
      if (!hasStaff(interaction.member)) return interaction.reply({ content: 'Staff only.', ephemeral: true });
      const ref = id.replace('approve_pay_', '');
      try {
        const p = verifyPayment(ref, interaction.user.id);
        await interaction.reply({ content: `Payment ${ref} approved for <@${p.userId}>.`, ephemeral: true });
      } catch (e) {
        await interaction.reply({ content: 'Failed: ' + e.message, ephemeral: true });
      }
    } else if (id.startsWith('reject_pay_')) {
      if (!hasStaff(interaction.member)) return interaction.reply({ content: 'Staff only.', ephemeral: true });
      const ref = id.replace('reject_pay_', '');
      // rejection logic stub
      const payments = client.custom.data['payments.json'];
      if (!payments[ref]) return interaction.reply({ content: 'Payment not found', ephemeral: true });
      payments[ref].status = 'rejected';
      await interaction.reply({ content: `Payment ${ref} rejected.`, ephemeral: true });
    }
  } catch (e) {
    // ignore
  }
});

// ---------------------------
// Misc utilities & features
// ---------------------------

function hasStaff(member) {
  if (!member) return false;
  const staffRoles = client.custom.config.staffRoles || [];
  if (member.permissions && member.permissions.has && member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  return member.roles?.cache.some(r => staffRoles.includes(r.name));
}

// Simple scheduler for recurring tournaments (naive)
function scheduleTournamentJobs() {
  // Clear existing jobs
  client.custom.jobs = client.custom.jobs || {};
  // For each recurring tournament metadata, create timers
  for (const t of Object.values(client.custom.data['tournaments.json'])) {
    if (t.metadata && t.metadata.recurring && t.status === 'upcoming') {
      const cron = t.metadata.cron; // naive ISO interval or seconds
      // For demo: if metadata.recurringIntervalSec exists, schedule a setTimeout
      if (t.metadata.recurringIntervalSec && !client.custom.jobs[t.id]) {
        const interval = t.metadata.recurringIntervalSec * 1000;
        client.custom.jobs[t.id] = setInterval(async () => {
          // On each tick, create a new instance of the tournament or mark live
          console.log(`[Scheduler] Recurring tournament job fired for ${t.id}`);
          // In a real implementation, clone the template or reset slots
        }, interval);
      }
    }
  }
}

// Utility: Pretty-print JSON for debug command
function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

// ---------------------------
// Advanced features: Analytics, Seasons, Hall of Fame stubs
// ---------------------------

function incrementStat(key, amount = 1) {
  const stats = client.custom.data['stats.json'];
  stats[key] = (stats[key] || 0) + amount;
  client.custom.data['stats.json'] = stats;
  return stats[key];
}

function startNewSeason(seasonName) {
  client.custom.data['leaderboard.json'] = {};
  client.custom.data['stats.json'].currentSeason = seasonName;
  client.custom.data['stats.json'].seasonStartedAt = nowIso();
  return client.custom.data['stats.json'];
}

// ---------------------------
// Graceful shutdown
// ---------------------------

async function shutdown() {
  console.log('Shutting down, saving data...');
  try {
    await saveAll();
    console.log('Data saved.');
  } catch (e) {
    console.error('Error saving data', e);
  }
  try {
    await client.destroy();
  } catch (e) {}
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ---------------------------
// Boot sequence
// ---------------------------

(async () => {
  try {
    await loadAll();
    scheduleAutosave();
    client.once('ready', async () => {
      console.log(`Logged in as ${client.user.tag}`);
      // Register slash commands best-effort
      await registerSlashCommands().catch(() => {});
      // Set presence
      try {
        await client.user.setPresence({ activities: [{ name: 'OTO Tournaments | !help' }], status: 'online' });
      } catch (e) { /* ignore */ }
      // schedule recurring tournament jobs
      scheduleTournamentJobs();
    });

    // Attach ready event
    client.login(BOT_TOKEN).catch((e) => {
      console.error('Login failed', e);
      process.exit(1);
    });
  } catch (e) {
    console.error('Failed to initialize bot', e);
    process.exit(1);
  }
})();
