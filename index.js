// index.js - fixed ready event + env name + verbose logs
require('dotenv').config();
const Discord = require('discord.js');
const express = require('express');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
if (!BOT_TOKEN) {
  console.error('ERROR: No bot token found. Set BOT_TOKEN (or DISCORD_TOKEN) in env.');
  process.exit(1);
}

// ---------- Client
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    // GuildInvites may not be needed; keep only if your bot has permission to fetch invites
    Discord.GatewayIntentBits.GuildInvites
  ],
});

// ---------- Minimal express so Render accepts web process
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('OTO BOT running'));
app.listen(PORT, () => console.log(`✅ Express listening on ${PORT}`));

// ---------- In-memory state (your existing)
let activeTournament = null;
let slots = 0;
const MAX_SLOTS = 48;
let pendingTickets = new Map();
let userInvites = new Map();
let tournamentMessages = { updates: null, general: null };
let tournamentParticipants = [];

// CONFIG (keep your IDs)
const CONFIG = {
  STAFF_TOOL_CHANNEL: '1438486059255336970',
  TOURNAMENT_UPDATES: '1438484997177606145',
  GENERAL_CHANNEL: '1438482904018849835',
  WINNERS_CHANNEL: '1438485128698658919',
  STAFF_ROLE: '1438475461977047112',
  QR_IMAGE: 'https://i.ibb.co/rGWqc0xm/qr.png',
  RULES: `📜 **TOURNAMENT RULES:**\n1️⃣ No teaming/camping\n2️⃣ No hacking/cheating\n3️⃣ Follow room ID exactly\n4️⃣ Screenshot required\n5️⃣ Decision is final`
};

// ---------- READY
client.once('ready', async () => {
  console.log(`🚀 Discord client ready: ${client.user.tag}`);
  try {
    await client.user.setActivity('OTO Tournaments', { type: Discord.ActivityType.Competing });
  } catch (e) { /* ignore */ }

  // Register commands (you already have function below)
  try {
    await registerCommands();
    console.log('✅ Commands registered (attempted)');
  } catch (err) {
    console.warn('⚠️ registerCommands failed:', err);
  }

  // fetch invites for tracking (optional)
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) userInvites.set(inv.inviter.id, inv.uses ?? 0);
      });
    } catch (err) {
      console.warn(`Unable to fetch invites for guild ${guild.id}:`, err.message);
    }
  }

  // start interval announcements (if you use)
  setInterval(() => {
    try { autoSlotAnnouncements().catch(e=>console.warn('autoAnn err',e)); } catch {}
  }, 60000);

});

// ---------- COMMANDS: keep your registerCommands function (unchanged except usage)
async function registerCommands() {
  const { REST, Routes, SlashCommandBuilder } = Discord;
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  const commands = [
    new SlashCommandBuilder().setName('create-tournament').setDescription('Create tournament (staff)').addStringOption(opt=>opt.setName('title').setDescription('name').setRequired(true)),
    new SlashCommandBuilder().setName('check-invites').setDescription('Check invites'),
    new SlashCommandBuilder().setName('reset-tournament').setDescription('Reset tournament (staff)')
  ].map(c=>c.toJSON());

  // if GUILD_ID provided, register there for instant use:
  if (process.env.GUILD_ID) {
    console.log('Registering commands to guild', process.env.GUILD_ID);
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID || process.env.APP_ID || client.user.id, process.env.GUILD_ID), { body: commands });
  } else {
    console.log('Registering global commands (may take up to 1 hour)');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID || process.env.APP_ID || client.user.id), { body: commands });
  }
}

// ---------- INTERACTIONS handler (your existing code is fine) - defer quickly if long processing
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const name = interaction.commandName;
      if (name === 'check-invites') {
        const inviteCount = userInvites.get(interaction.user.id) || 0;
        return interaction.reply({ content: `You have ${inviteCount} invites`, ephemeral: true });
      }
      if (name === 'create-tournament') {
        // sample: defer then run
        await interaction.deferReply({ ephemeral: true });
        // do your create logic here...
        return interaction.editReply({ content: 'Tournament created (placeholder)' });
      }
      if (name === 'reset-tournament') {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) return interaction.reply({ content: 'Staff only', ephemeral: true });
        activeTournament = null; slots = 0; tournamentParticipants = [];
        return interaction.reply({ content: 'Tournament reset', ephemeral: true });
      }
    }

    if (interaction.isButton()) {
      // handle button interactions (join/approve/reject)
      // IMPORTANT: respond/defer quickly to avoid "application did not respond"
      await interaction.deferReply({ ephemeral: true }).catch(()=>{});
      // handle...
      return interaction.editReply({ content: 'Button pressed (placeholder)' });
    }
  } catch (err) {
    console.error('Interaction handling error:', err);
    try {
      if (!interaction.replied) await interaction.reply({ content: 'Internal error', ephemeral: true });
    } catch {}
  }
});

// ---------- other functions (reuse your existing ones) ----------
async function autoSlotAnnouncements() {
  if (!activeTournament || slots >= MAX_SLOTS) return;
  try {
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHANNEL).catch(()=>null);
    if (!channel) return;
    const remaining = MAX_SLOTS - slots;
    if (slots === 0) {
      await channel.send(`🔥 ${activeTournament?.title || 'Tournament'} is live!\n${generateSlotUI()}`);
    } else if (remaining <= 10) {
      await channel.send(`🚨 Hurry! ${remaining} slots left!\n${generateSlotUI()}`);
    }
  } catch (err) {
    console.warn('autoSlotAnnouncements error', err?.message || err);
  }
}

function generateSlotUI() {
  const filled = Math.floor((slots / MAX_SLOTS) * 10);
  const empty = 10 - filled;
  return '🟩'.repeat(filled) + '⬜'.repeat(empty) + `\n**${slots}/${MAX_SLOTS}**`;
}

// ---------- login
client.login(BOT_TOKEN).then(() => console.log('Login called')).catch(err => {
  console.error('Login failed:', err);
  process.exit(1);
});
