// ==================== OTO TOURNAMENT BOT - COMPLETE SYSTEM ====================
// Professional Discord Tournament Management Bot
// Version: 2.1 - All Features Working

if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (err) {}
}

const Discord = require('discord.js');
const express = require('express');

// ==================== CONFIGURATION ====================
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
  INVITE_TRACKER: '1439216884774998107',
  MINECRAFT_CHANNEL: '1439223955960627421',
  MOST_PLAYED: '1439226024863993988',
  PROFILE_CHANNEL: '1439542574066176020',
  
  // Role IDs
  STAFF_ROLE: '1438475461977047112',
  ADMIN_ROLE: '1438475461977047112',
  PLAYER_ROLE: '1438475461977047114',
  FOUNDER_ROLE: '1438475461977047115',
  
  // Bot Settings
  MIN_INVITES: 10,
  NO_REPLY_TIMEOUT: 120000,
  SPAM_INTERVAL: 180000,
  TICKET_AUTO_CLOSE: 600000,
  SUPPORT_WAIT_TIME: 30000,
  
  // Payment QR Code
  PAYMENT_QR: 'https://i.ibb.co/jkBSmkM/qr.png',
  UPI_ID: 'yourpayment@upi',
  
  // YouTube & Links
  YOUTUBE_LINK: 'https://youtube.com/@OTOTournaments',
  
  // Bad Words List
  BAD_WORDS: ['dm', 'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'chutiya', 
              'madarchod', 'bhenchod', 'fuck', 'shit', 'bitch', 'asshole']
};

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || 'YOUR_DISCORD_ID';

// ==================== CLIENT SETUP ====================
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildPresences
  ],
  partials: [Discord.Partials.Channel, Discord.Partials.Message, Discord.Partials.User]
});

// Increase max listeners
client.setMaxListeners(20);

// Express Server
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('🎮 OTO Tournament Bot - Running Successfully!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web server started'));

// ==================== DATA MANAGER CLASS ====================
class DataManager {
  constructor() {
    this.userProfiles = new Map();
    this.userInvites = new Map();
    this.inviteCache = new Map();
    this.tournaments = new Map();
    this.tickets = new Map();
    this.warnings = new Map();
    this.lastMessages = new Map();
    this.noReplyTimers = new Map();
    this.messageCount = new Map();
    this.tournamentLeaderboard = { 
      freefire: new Map(), 
      minecraft: new Map(),
      pubg: new Map() 
    };
    this.lobbyChannels = new Map();
    this.beatPlayerChallenges = new Map();
    this.staffTicketTimers = new Map();
  }

  createProfile(userId, data) {
    const profile = {
      id: userId,
      name: data.name || 'Unknown',
      gender: data.gender?.toLowerCase() || 'male',
      state: data.state || 'Not Set',
      game: data.game || 'Not Set',
      otoId: `OTO${Date.now().toString().slice(-8)}`,
      createdAt: new Date(),
      invites: 0,
      tournaments: 0,
      wins: 0,
      totalEarnings: 0,
      verified: true,
      activity: 0
    };
    this.userProfiles.set(userId, profile);
    return profile;
  }

  getProfile(userId) {
    return this.userProfiles.get(userId);
  }

  hasProfile(userId) {
    return this.userProfiles.has(userId);
  }

  updateProfile(userId, updates) {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      Object.assign(profile, updates);
      return profile;
    }
    return null;
  }

  addInvite(userId) {
    const current = this.userInvites.get(userId) || 0;
    this.userInvites.set(userId, current + 1);
    const profile = this.getProfile(userId);
    if (profile) profile.invites = current + 1;
    return current + 1;
  }

  getInvites(userId) {
    return this.userInvites.get(userId) || 0;
  }

  addWarning(userId, reason) {
    if (!this.warnings.has(userId)) {
      this.warnings.set(userId, []);
    }
    this.warnings.get(userId).push({ 
      reason, 
      date: new Date(),
      id: `WARN-${Date.now()}`
    });
    return this.warnings.get(userId).length;
  }

  getWarnings(userId) {
    return this.warnings.get(userId) || [];
  }

  clearWarnings(userId) {
    this.warnings.delete(userId);
  }

  addActivity(userId) {
    const count = this.messageCount.get(userId) || 0;
    this.messageCount.set(userId, count + 1);
    const profile = this.getProfile(userId);
    if (profile) profile.activity = count + 1;
  }

  getTopActive(limit = 10) {
    return Array.from(this.messageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
}

const dataManager = new DataManager();

// ==================== INTERACTION HANDLER (BUTTONS & SELECTS) ====================
client.on('interactionCreate', async (interaction) => {
  try {
    // Defer reply immediately to prevent timeout
    if (!interaction.replied && !interaction.deferred) {
      if (interaction.isButton()) {
        await interaction.deferUpdate().catch(() => {});
      } else {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
      }
    }

    // Handle Select Menus
    if (interaction.isStringSelectMenu()) {
      
      // Tournament Creation - Mode Selection
      if (interaction.customId === 'tournament_mode') {
        const mode = interaction.values[0];
        const tournamentId = interaction.message.embeds[0].footer.text.split('ID: ')[1];
        const tournament = dataManager.tournaments.get(tournamentId);
        
        if (tournament) {
          tournament.mode = mode;
          
          const mapRow = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.StringSelectMenuBuilder()
                .setCustomId('tournament_map')
                .setPlaceholder('Select Map')
                .addOptions([
                  { label: 'Bermuda', value: 'Bermuda', emoji: '🏝️' },
                  { label: 'Purgatory', value: 'Purgatory', emoji: '🔥' },
                  { label: 'Kalahari', value: 'Kalahari', emoji: '🏜️' },
                  { label: 'Alps', value: 'Alps', emoji: '⛰️' },
                  { label: 'Nextera', value: 'Nextera', emoji: '🌆' }
                ])
            );

          await interaction.editReply({
            content: `✅ Mode selected: **${mode}**\n\n📍 Now select the map:`,
            components: [mapRow],
            embeds: []
          });
        }
        return;
      }

      // Tournament Creation - Map Selection
      if (interaction.customId === 'tournament_map') {
        const map = interaction.values[0];
        const tournamentId = interaction.message.embeds[0]?.footer?.text?.split('ID: ')[1] || 
                           Array.from(dataManager.tournaments.keys()).pop();
        const tournament = dataManager.tournaments.get(tournamentId);
        
        if (tournament) {
          tournament.map = map;
          tournament.status = 'draft';
          
          const embed = new Discord.EmbedBuilder()
            .setTitle('✅ Tournament Created Successfully!')
            .setDescription(`**${tournament.title}** is ready to publish!`)
            .setColor('#00ff00')
            .addFields(
              { name: '🎮 Game', value: tournament.game, inline: true },
              { name: '🎯 Mode', value: tournament.mode, inline: true },
              { name: '🗺️ Map', value: tournament.map, inline: true },
              { name: '💰 Prize', value: tournament.prize, inline: true },
              { name: '🎫 Entry', value: tournament.entry, inline: true },
              { name: '📊 Slots', value: `${tournament.maxSlots}`, inline: true },
              { name: '⏰ Time', value: tournament.time, inline: true },
              { name: '🆔 ID', value: `\`${tournamentId}\``, inline: true },
              { name: '📈 Status', value: '📝 Draft', inline: true }
            )
            .setFooter({ text: `Tournament ID: ${tournamentId}` })
            .setTimestamp();

          const row = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setCustomId(`publish_tournament_${tournamentId}`)
                .setLabel('Publish Tournament')
                .setEmoji('🚀')
                .setStyle(Discord.ButtonStyle.Success),
              new Discord.ButtonBuilder()
                .setCustomId(`delete_tournament_${tournamentId}`)
                .setLabel('Delete Draft')
                .setEmoji('🗑️')
                .setStyle(Discord.ButtonStyle.Danger)
            );

          await interaction.editReply({ content: null, embeds: [embed], components: [row] });
        }
        return;
      }

      // Support Category Selection
      if (interaction.customId === 'support_category') {
        const category = interaction.values[0];
        
        const categoryInfo = {
          payment: { emoji: '💳', name: 'Payment Issue' },
          tournament: { emoji: '🎮', name: 'Tournament Issue' },
          technical: { emoji: '🔧', name: 'Technical Support' },
          profile: { emoji: '👤', name: 'Profile/Account' },
          report: { emoji: '🚨', name: 'Report User' },
          general: { emoji: '❓', name: 'General Help' }
        };

        const info = categoryInfo[category];

        try {
          const ticketId = `TICKET${Date.now().toString().slice(-8)}`;
          const guild = interaction.guild;
          const categoryChannel = guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
          
          const ticketChannel = await guild.channels.create({
            name: `${info.emoji}-${interaction.user.username}`,
            type: Discord.ChannelType.GuildText,
            parent: categoryChannel,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [Discord.PermissionFlagsBits.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.ReadMessageHistory,
                  Discord.PermissionFlagsBits.AttachFiles
                ]
              },
              {
                id: CONFIG.STAFF_ROLE,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.ManageMessages
                ]
              }
            ]
          });

          dataManager.tickets.set(ticketId, {
            id: ticketId,
            type: 'support',
            category: category,
            userId: interaction.user.id,
            channelId: ticketChannel.id,
            createdAt: new Date(),
            status: 'open'
          });

          const embed = new Discord.EmbedBuilder()
            .setTitle(`${info.emoji} ${info.name}`)
            .setDescription(`Welcome <@${interaction.user.id}>!\n\nPlease describe your issue. Our staff will respond shortly!`)
            .setColor('#3498db')
            .addFields(
              { name: '⏱️ Response Time', value: '5-15 minutes', inline: true },
              { name: '🆔 Ticket ID', value: `\`${ticketId}\``, inline: true }
            )
            .setFooter({ text: 'Please be patient and respectful' })
            .setTimestamp();

          const row = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setCustomId(`close_ticket_${ticketId}`)
                .setLabel('Close Ticket')
                .setEmoji('🔒')
                .setStyle(Discord.ButtonStyle.Danger)
            );

          await ticketChannel.send({
            content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`,
            embeds: [embed],
            components: [row]
          });

          await interaction.editReply({
            content: `✅ Ticket created! Go to ${ticketChannel}`,
            components: [],
            embeds: []
          });

        } catch (error) {
          console.error('Ticket creation error:', error);
          await interaction.editReply({
            content: '❌ Failed to create ticket. Please try again!',
            components: [],
            embeds: []
          });
        }
        return;
      }
    }

    // Handle Buttons
    if (interaction.isButton()) {
      
      // Create Tournament Button
      if (interaction.customId === 'create_tournament') {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
          await interaction.editReply({ content: '❌ Staff only!' });
          return;
        }

        // Create tournament object FIRST
        const tournamentId = `TOUR${Date.now().toString().slice(-10)}`;
        dataManager.tournaments.set(tournamentId, {
          id: tournamentId,
          title: 'Free Fire Tournament',
          game: 'Free Fire',
          mode: null,
          map: null,
          prize: '₹500',
          entry: '₹50',
          maxSlots: 12,
          time: '8:00 PM',
          prizeDistribution: { first: 250, second: 150, third: 100 },
          image: 'https://i.ibb.co/8XQkZhJ/freefire.png',
          createdBy: interaction.user.id,
          createdAt: new Date(),
          status: 'creating',
          players: new Map(),
          confirmedPlayers: new Map(),
          slotsFilled: 0
        });

        await interaction.editReply({
          content: '🎮 **Creating Free Fire Tournament**\n\nSelect game mode:',
          components: [
            new Discord.ActionRowBuilder().addComponents(
              new Discord.StringSelectMenuBuilder()
                .setCustomId('tournament_mode')
                .setPlaceholder('Select Mode')
                .addOptions([
                  { label: 'Solo', value: 'Solo', emoji: '👤' },
                  { label: 'Duo', value: 'Duo', emoji: '👥' },
                  { label: 'Squad', value: 'Squad', emoji: '👨‍👩‍👦‍👦' },
                  { label: 'Clash Squad', value: 'Clash Squad', emoji: '⚔️' }
                ])
            )
          ],
          embeds: [
            new Discord.EmbedBuilder()
              .setTitle('🔥 Free Fire Tournament')
              .setDescription('**Default Settings:**\n💰 Prize: ₹500\n🎫 Entry: ₹50\n📊 Slots: 12\n⏰ Time: 8:00 PM')
              .setColor('#ff6600')
              .setFooter({ text: `ID: ${tournamentId}` })
          ]
        });
        return;
      }

      // Publish Tournament
      if (interaction.customId.startsWith('publish_tournament_')) {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
          await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
          return;
        }

        const tournamentId = interaction.customId.replace('publish_tournament_', '');
        const tournament = dataManager.tournaments.get(tournamentId);
        
        if (!tournament) {
          await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
          return;
        }

        tournament.status = 'registration';

        const embed = new Discord.EmbedBuilder()
          .setTitle(`🔥 ${tournament.title}`)
          .setDescription(`**${tournament.mode} - ${tournament.map}**\n\nRegistration is now OPEN!`)
          .setColor('#ff0000')
          .addFields(
            { name: '💰 Prize Pool', value: tournament.prize, inline: true },
            { name: '🎫 Entry Fee', value: tournament.entry, inline: true },
            { name: '📊 Slots', value: `0/${tournament.maxSlots}`, inline: true },
            { name: '⏰ Time', value: tournament.time, inline: true },
            { name: '🗺️ Map', value: tournament.map, inline: true },
            { name: '🎯 Mode', value: tournament.mode, inline: true },
            { name: '🏆 Prize Distribution', value: `🥇 1st: ₹${tournament.prizeDistribution.first}\n🥈 2nd: ₹${tournament.prizeDistribution.second}\n🥉 3rd: ₹${tournament.prizeDistribution.third}`, inline: false }
          )
          .setImage(tournament.image)
          .setFooter({ text: `Tournament ID: ${tournamentId} | Click JOIN to register` })
          .setTimestamp();

        const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
              .setCustomId(`join_tournament_${tournamentId}`)
              .setLabel('JOIN TOURNAMENT')
              .setEmoji('🎮')
              .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
              .setLabel('View Rules')
              .setStyle(Discord.ButtonStyle.Link)
              .setURL(`https://discord.com/channels/${interaction.guild.id}/${CONFIG.RULES_CHANNEL}`)
          );

        const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
        const msg = await scheduleChannel.send({ embeds: [embed], components: [row] });
        
        tournament.scheduleMessageId = msg.id;

        await interaction.update({
          content: '✅ Tournament published successfully!',
          embeds: [],
          components: []
        });

        // Announce
        const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
        await announceChannel.send({
          content: '@everyone\n\n🔥 **NEW TOURNAMENT ALERT!** 🔥',
          embeds: [embed],
          components: [row]
        });
        return;
      }

      // Delete Tournament
      if (interaction.customId.startsWith('delete_tournament_')) {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
          await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
          return;
        }

        const tournamentId = interaction.customId.replace('delete_tournament_', '');
        dataManager.tournaments.delete(tournamentId);
        
        await interaction.update({
          content: '🗑️ Tournament draft deleted!',
          embeds: [],
          components: []
        });
        return;
      }

      // Join Tournament
      if (interaction.customId.startsWith('join_tournament_')) {
        const tournamentId = interaction.customId.replace('join_tournament_', '');
        const tournament = dataManager.tournaments.get(tournamentId);
        
        if (!tournament) {
          await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
          return;
        }

        if (tournament.slotsFilled >= tournament.maxSlots) {
          await interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
          return;
        }

        if (tournament.players.has(interaction.user.id)) {
          await interaction.reply({ content: '❌ You already registered!', ephemeral: true });
          return;
        }

        const profile = dataManager.getProfile(interaction.user.id);
        if (!profile) {
          await interaction.reply({ content: '❌ Please complete your profile first! Check DMs.', ephemeral: true });
          return;
        }

        const invites = dataManager.getInvites(interaction.user.id);
        const isFree = invites >= CONFIG.MIN_INVITES;

        // Create registration ticket
        try {
          const ticketId = `REG${Date.now().toString().slice(-8)}`;
          const guild = interaction.guild;
          const categoryChannel = guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
          
          const ticketChannel = await guild.channels.create({
            name: `🎮-${interaction.user.username}-${tournamentId.slice(-4)}`,
            type: Discord.ChannelType.GuildText,
            parent: categoryChannel,
            permissionOverwrites: [
              {
                id: guild.id,
                deny: [Discord.PermissionFlagsBits.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.ReadMessageHistory,
                  Discord.PermissionFlagsBits.AttachFiles
                ]
              },
              {
                id: CONFIG.STAFF_ROLE,
                allow: [
                  Discord.PermissionFlagsBits.ViewChannel,
                  Discord.PermissionFlagsBits.SendMessages,
                  Discord.PermissionFlagsBits.ManageMessages
                ]
              }
            ]
          });

          tournament.players.set(interaction.user.id, {
            id: interaction.user.id,
            name: profile.name,
            otoId: profile.otoId,
            ticketChannelId: ticketChannel.id,
            status: 'pending',
            registeredAt: new Date(),
            isFreeEntry: isFree
          });

          const embed = new Discord.EmbedBuilder()
            .setTitle(`🎮 Tournament Registration`)
            .setDescription(`**${tournament.title}**\n${tournament.mode} - ${tournament.map}`)
            .setColor('#3498db')
            .addFields(
              { name: '👤 Player', value: profile.name, inline: true },
              { name: '🆔 OTO ID', value: profile.otoId, inline: true },
              { name: '💳 Entry', value: isFree ? '✅ FREE' : tournament.entry, inline: true },
              { name: '⏰ Time', value: tournament.time, inline: true },
              { name: '🗺️ Map', value: tournament.map, inline: true },
              { name: '📊 Slot', value: 'Pending verification', inline: true }
            )
            .setFooter({ text: `Ticket ID: ${ticketId}` })
            .setTimestamp();

          if (isFree) {
            // Auto-approve free entries
            tournament.players.get(interaction.user.id).status = 'confirmed';
            tournament.confirmedPlayers.set(interaction.user.id, tournament.players.get(interaction.user.id));
            tournament.slotsFilled++;

            embed.addFields({
              name: '✅ Status',
              value: `**CONFIRMED** - Slot #${tournament.slotsFilled}\n\nYou have FREE entry! Room details will be sent before match.`,
              inline: false
            });

            await ticketChannel.send({
              content: `<@${interaction.user.id}>`,
              embeds: [embed]
            });

            await interaction.reply({
              content: `✅ Registration successful! ${ticketChannel}\n\n🎁 **FREE ENTRY** - You're confirmed for slot #${tournament.slotsFilled}!`,
              ephemeral: true
            });

          } else {
            // Paid entry - need payment proof
            embed.addFields({
              name: '💳 Payment Required',
              value: `**Entry Fee:** ${tournament.entry}\n\n**Payment Methods:**\n• UPI: ${CONFIG.UPI_ID}\n• PhonePe / GPay / Paytm\n\n📸 **Upload payment screenshot here!**`,
              inline: false
            });

            embed.setImage(CONFIG.PAYMENT_QR);

            await ticketChannel.send({
              content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`,
              embeds: [embed]
            });

            await interaction.reply({
              content: `✅ Registration ticket created! ${ticketChannel}\n\n💳 Please upload payment proof to confirm your slot.`,
              ephemeral: true
            });
          }

          // Update tournament message slots
          if (tournament.scheduleMessageId) {
            try {
              const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
              const scheduleMsg = await scheduleChannel.messages.fetch(tournament.scheduleMessageId);
              const newEmbed = Discord.EmbedBuilder.from(scheduleMsg.embeds[0]);
              
              const slotsField = newEmbed.data.fields.find(f => f.name === '📊 Slots');
              if (slotsField) {
                slotsField.value = `${tournament.slotsFilled}/${tournament.maxSlots}`;
              }
              
              await scheduleMsg.edit({ embeds: [newEmbed] });
            } catch (err) {}
          }

        } catch (error) {
          console.error('Registration error:', error);
          await interaction.reply({ content: '❌ Failed to create registration ticket!', ephemeral: true });
        }
        return;
      }

      // Create Support Ticket
      if (interaction.customId === 'create_support_ticket') {
        const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.StringSelectMenuBuilder()
              .setCustomId('support_category')
              .setPlaceholder('Select issue category')
              .addOptions([
                { label: '💳 Payment Issue', value: 'payment', emoji: '💳' },
                { label: '🎮 Tournament Issue', value: 'tournament', emoji: '🎮' },
                { label: '🔧 Technical Support', value: 'technical', emoji: '🔧' },
                { label: '👤 Profile/Account', value: 'profile', emoji: '👤' },
                { label: '🚨 Report User', value: 'report', emoji: '🚨' },
                { label: '❓ General Help', value: 'general', emoji: '❓' }
              ])
          );

        await interaction.reply({
          content: '🎫 **Create Support Ticket**\n\nSelect the category:',
          components: [row],
          ephemeral: true
        });
        return;
      }

      // Close Ticket
      if (interaction.customId.startsWith('close_ticket_')) {
        const embed = new Discord.EmbedBuilder()
          .setTitle('🔒 Closing Ticket')
          .setDescription('This ticket will be deleted in **10 seconds**.')
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.update({ embeds: [embed], components: [] });

        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch (err) {}
        }, 10000);
        return;
      }

      // Approve Payment
      if (interaction.customId.startsWith('approve_payment_')) {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
          await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
          return;
        }

        const parts = interaction.customId.split('_');
        const userId = parts[2];
        const tournamentId = parts[3];
        
        const tournament = dataManager.tournaments.get(tournamentId);
        if (!tournament) {
          await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
          return;
        }

        const player = tournament.players.get(userId);
        if (player) {
          player.status = 'confirmed';
          tournament.confirmedPlayers.set(userId, player);
          tournament.slotsFilled++;

          const embed = new Discord.EmbedBuilder()
            .setTitle('✅ PAYMENT APPROVED!')
            .setDescription(`<@${userId}> your registration is confirmed!`)
            .setColor('#00ff00')
            .addFields(
              { name: '📊 Your Slot', value: `#${tournament.slotsFilled}`, inline: true },
              { name: '⏰ Time', value: tournament.time, inline: true },
              { name: '✅ Status', value: 'CONFIRMED', inline: true }
            )
            .setFooter({ text: `Approved by ${interaction.user.username}` })
            .setTimestamp();

          await interaction.message.edit({ embeds: [embed], components: [] });
          await interaction.reply(`✅ Payment approved! <@${userId}> is now confirmed for slot #${tournament.slotsFilled}!`);

          // Update tournament message slots
          if (tournament.scheduleMessageId) {
            try {
              const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
              const scheduleMsg = await scheduleChannel.messages.fetch(tournament.scheduleMessageId);
              const newEmbed = Discord.EmbedBuilder.from(scheduleMsg.embeds[0]);
              
              const slotsField = newEmbed.data.fields.find(f => f.name === '📊 Slots');
              if (slotsField) {
                slotsField.value = `${tournament.slotsFilled}/${tournament.maxSlots}`;
              }
              
              await scheduleMsg.edit({ embeds: [newEmbed] });
            } catch (err) {}
          }
        }
        return;
      }

      // Reject Payment
      if (interaction.customId.startsWith('reject_payment_')) {
        if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
          await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
          return;
        }

        const parts = interaction.customId.split('_');
        const userId = parts[2];

        const embed = new Discord.EmbedBuilder()
          .setTitle('❌ Payment Rejected')
          .setDescription(`<@${userId}>, please upload a clear payment screenshot.`)
          .setColor('#ff0000')
          .setFooter({ text: `Rejected by ${interaction.user.username}` })
          .setTimestamp();

        await interaction.message.edit({ embeds: [embed], components: [] });
        await interaction.reply(`❌ Payment rejected. User asked to resubmit.`);
        return;
      }

    }

  } catch (error) {
    console.error('Interaction error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred!', ephemeral: true }).catch(() => {});
    }
  }
});

// ==================== MESSAGE HANDLER ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Activity tracking
  dataManager.addActivity(message.author.id);

  // Bot mention response
  if (message.mentions.has(client.user) && message.channel.type !== Discord.ChannelType.DM) {
    const profile = dataManager.getProfile(message.author.id);
    const embed = new Discord.EmbedBuilder()
      .setTitle('🤖 OTO Bot - Quick Help')
      .setDescription(`Hey ${profile ? profile.name : message.author.username}! 👋`)
      .setColor('#3498db')
      .addFields(
        { name: '🎮 Tournaments', value: `<#${CONFIG.TOURNAMENT_SCHEDULE}>`, inline: true },
        { name: '📚 Guide', value: `<#${CONFIG.HOW_TO_JOIN}>`, inline: true },
        { name: '🎫 Support', value: 'Create a ticket!', inline: true },
        { name: '⚡ Commands', value: '`-i` `-profile` `-help`', inline: false }
      )
      .setFooter({ text: 'OTO Tournaments - Play & Win!' })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
    return;
  }

  // DM Profile Setup
  if (message.channel.type === Discord.ChannelType.DM) {
    const content = message.content;
    
    if (!dataManager.hasProfile(message.author.id)) {
      const nameMatch = content.match(/name:\s*(.+)/i);
      const genderMatch = content.match(/gender:\s*(male|female)/i);
      const stateMatch = content.match(/state:\s*(.+)/i);
      const gameMatch = content.match(/game:\s*(.+)/i);

      if (nameMatch && genderMatch && stateMatch && gameMatch) {
        const profile = dataManager.createProfile(message.author.id, {
          name: nameMatch[1].trim(),
          gender: genderMatch[1].trim(),
          state: stateMatch[1].trim(),
          game: gameMatch[1].trim()
        });

        // Give PLAYER role
        try {
          const guilds = client.guilds.cache;
          for (const guild of guilds.values()) {
            const member = await guild.members.fetch(message.author.id).catch(() => null);
            if (member) {
              await member.roles.add(CONFIG.PLAYER_ROLE).catch(() => {});
            }
          }
        } catch (err) {}

        const embed = new Discord.EmbedBuilder()
          .setTitle('✅ Profile Created Successfully!')
          .setDescription(`Welcome to OTO family, ${profile.name}! 🎉`)
          .setColor('#00ff00')
          .addFields(
            { name: '🆔 OTO ID', value: `\`${profile.otoId}\``, inline: true },
            { name: '🎮 Game', value: profile.game, inline: true },
            { name: '📍 State', value: profile.state, inline: true },
            { name: '🚀 Next Steps', value: `1️⃣ Invite ${CONFIG.MIN_INVITES} friends for FREE entry\n2️⃣ Join tournaments\n3️⃣ Win prizes!\n4️⃣ Type \`-profile\` to view`, inline: false }
          )
          .setThumbnail(message.author.displayAvatarURL())
          .setFooter({ text: 'Your gaming journey starts now! 🏆' })
          .setTimestamp();

        await message.reply({ embeds: [embed] });

        // Post to profile channel
        try {
          const profileChannel = await client.channels.fetch(CONFIG.PROFILE_CHANNEL);
          const publicEmbed = new Discord.EmbedBuilder()
            .setTitle('🎮 New Player Registered!')
            .setDescription(`**${profile.name}** joined OTO!`)
            .setColor('#3498db')
            .addFields(
              { name: '🆔 OTO ID', value: profile.otoId, inline: true },
              { name: '🎮 Game', value: profile.game, inline: true },
              { name: '📍 State', value: profile.state, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();
          await profileChannel.send({ embeds: [publicEmbed] });
        } catch (err) {}

        // Announce in general
        try {
          const guilds = client.guilds.cache;
          for (const guild of guilds.values()) {
            const channel = await guild.channels.fetch(CONFIG.GENERAL_CHAT);
            await channel.send(
              `🎉 **${profile.name}** completed their profile!\n` +
              `🆔 OTO ID: \`${profile.otoId}\`\n` +
              `🎮 Game: ${profile.game}\n` +
              `Welcome to OTO family! 💪`
            );
          }
        } catch (err) {}

      } else {
        await message.reply(
          '❌ **Invalid Format!**\n\n' +
          'Please use this exact format:\n' +
          '```\n' +
          'Name: Your Name\n' +
          'Gender: Male/Female\n' +
          'State: Your State\n' +
          'Game: Free Fire/Minecraft/PUBG\n' +
          '```\n' +
          'Copy and fill the format above!'
        );
      }
    }
    return;
  }

  // Payment screenshot detection in tickets
  if (message.attachments.size > 0 && message.channel.name?.includes('🎮-')) {
    const tournament = Array.from(dataManager.tournaments.values()).find(t => 
      t.players.has(message.author.id) && 
      t.players.get(message.author.id).ticketChannelId === message.channel.id
    );

    if (tournament) {
      const player = tournament.players.get(message.author.id);
      if (player && player.status === 'pending' && !player.isFreeEntry) {
        const embed = new Discord.EmbedBuilder()
          .setTitle('💳 Payment Verification')
          .setDescription(`Payment proof uploaded by <@${message.author.id}>`)
          .setColor('#ffaa00')
          .addFields(
            { name: '👤 Player', value: player.name, inline: true },
            { name: '🆔 OTO ID', value: player.otoId, inline: true },
            { name: '💰 Amount', value: tournament.entry, inline: true },
            { name: '🎮 Tournament', value: tournament.title, inline: false }
          )
          .setImage(message.attachments.first().url)
          .setFooter({ text: 'Staff: Verify and approve/reject' })
          .setTimestamp();

        const row = new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
              .setCustomId(`approve_payment_${message.author.id}_${tournament.id}`)
              .setLabel('Approve')
              .setEmoji('✅')
              .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
              .setCustomId(`reject_payment_${message.author.id}_${tournament.id}`)
              .setLabel('Reject')
              .setEmoji('❌')
              .setStyle(Discord.ButtonStyle.Danger)
          );

        await message.reply({ embeds: [embed], components: [row] });
      }
    }
  }

  // User Commands
  if (message.content === '-i') {
    const invites = dataManager.getInvites(message.author.id);
    const needed = Math.max(0, CONFIG.MIN_INVITES - invites);
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('🔗 Your Invite Stats')
      .setColor(invites >= CONFIG.MIN_INVITES ? '#00ff00' : '#ffaa00')
      .addFields(
        { name: '📊 Total Invites', value: `${invites}`, inline: true },
        { name: '🎯 Target', value: `${CONFIG.MIN_INVITES}`, inline: true },
        { name: '📈 Remaining', value: `${needed}`, inline: true },
        { name: '🎁 Status', value: invites >= CONFIG.MIN_INVITES ? '✅ FREE Entry Unlocked!' : `❌ Need ${needed} more`, inline: false }
      )
      .setFooter({ text: 'Invite friends to unlock FREE tournaments!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    return;
  }

  if (message.content === '-profile') {
    const profile = dataManager.getProfile(message.author.id);
    
    if (!profile) {
      await message.reply('❌ No profile found! Check your DMs to create one.');
      return;
    }

    const invites = dataManager.getInvites(message.author.id);
    const embed = new Discord.EmbedBuilder()
      .setTitle('👤 Your Profile')
      .setColor('#3498db')
      .addFields(
        { name: '🆔 OTO ID', value: `\`${profile.otoId}\``, inline: true },
        { name: '👤 Name', value: profile.name, inline: true },
        { name: '🎮 Game', value: profile.game, inline: true },
        { name: '📍 State', value: profile.state, inline: true },
        { name: '🔗 Invites', value: `${invites}`, inline: true },
        { name: '🏆 Tournaments', value: `${profile.tournaments}`, inline: true },
        { name: '🥇 Wins', value: `${profile.wins}`, inline: true },
        { name: '💰 Earnings', value: `₹${profile.totalEarnings}`, inline: true },
        { name: '✅ Status', value: invites >= CONFIG.MIN_INVITES ? 'FREE Entry' : 'Paid Entry', inline: true }
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: `Member since ${profile.createdAt.toLocaleDateString()}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    return;
  }

  if (message.content === '-help') {
    const embed = new Discord.EmbedBuilder()
      .setTitle('📚 OTO Bot Commands')
      .setColor('#3498db')
      .addFields(
        { name: '👥 User Commands', value: '`-i` - Check invites\n`-profile` - View profile\n`-help` - This message', inline: false },
        { name: '🎮 Channels', value: `<#${CONFIG.TOURNAMENT_SCHEDULE}> - Tournaments\n<#${CONFIG.HOW_TO_JOIN}> - Guide\n<#${CONFIG.RULES_CHANNEL}> - Rules`, inline: false },
        { name: '🎁 Free Entry', value: `Invite ${CONFIG.MIN_INVITES} friends to get FREE tournament access!`, inline: false }
      )
      .setFooter({ text: 'OTO Tournaments - Play & Win!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    return;
  }

  // ==================== STAFF COMMANDS ====================
  if (message.channel.id === CONFIG.STAFF_TOOLS && message.member?.roles.cache.has(CONFIG.STAFF_ROLE)) {
    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    // Start Tournament
    if (command === '!startroom' || command === '!start') {
      const tournamentId = args[1];
      const roomId = args[2];
      const password = args[3];

      if (!tournamentId || !roomId || !password) {
        await message.reply('❌ Usage: `!startroom <tournamentID> <roomID> <password>`');
        return;
      }

      const tournament = dataManager.tournaments.get(tournamentId);
      if (!tournament) {
        await message.reply('❌ Tournament not found!');
        return;
      }

      tournament.status = 'live';
      tournament.roomDetails = { roomId, password, startedAt: new Date() };

      // Send DM to all confirmed players
      let sentCount = 0;
      for (const [userId] of tournament.confirmedPlayers) {
        try {
          const user = await client.users.fetch(userId);
          const embed = new Discord.EmbedBuilder()
            .setTitle(`🔴 ${tournament.title} - STARTING NOW!`)
            .setDescription('**Tournament is LIVE! Join immediately!**')
            .setColor('#ff0000')
            .addFields(
              { name: '🔐 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
              { name: '🔑 Password', value: `\`\`\`${password}\`\`\``, inline: false },
              { name: '⚠️ IMPORTANT', value: '• Join within 5 minutes\n• Take screenshots\n• Good luck! 🏆', inline: false }
            )
            .setTimestamp();

          await user.send({ embeds: [embed] });
          sentCount++;
        } catch (err) {}
      }

      await message.reply(
        `✅ **Tournament Started!**\n\n` +
        `📊 Room details sent to ${sentCount} players\n` +
        `🔐 Room: ${roomId}\n` +
        `🔑 Pass: ${password}\n` +
        `🔴 Status: LIVE`
      );
      return;
    }

    // Declare Winners
    if (command === '!winners') {
      const tournamentId = args[1];
      const tournament = dataManager.tournaments.get(tournamentId);

      if (!tournament) {
        await message.reply('❌ Tournament not found! Use: `!winners <tournamentID> @1st @2nd @3rd`');
        return;
      }

      const winners = message.mentions.users;
      if (winners.size === 0) {
        await message.reply('❌ Mention winners! Usage: `!winners <tournamentID> @first @second @third`');
        return;
      }

      const winnerArray = Array.from(winners.values()).slice(0, 3);
      tournament.status = 'completed';
      tournament.winners = winnerArray;

      const prizes = [
        tournament.prizeDistribution.first,
        tournament.prizeDistribution.second,
        tournament.prizeDistribution.third
      ];

      const embed = new Discord.EmbedBuilder()
        .setTitle(`🏆 ${tournament.title} - RESULTS`)
        .setDescription('**🎉 Tournament Completed! Congratulations! 🎉**')
        .setColor('#ffd700');

      winnerArray.forEach((winner, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        const position = index + 1;
        const prize = prizes[index];

        embed.addFields({
          name: `${medal} ${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place`,
          value: `${winner}\n💰 Prize: ₹${prize}`,
          inline: true
        });

        // Update profile
        const profile = dataManager.getProfile(winner.id);
        if (profile) {
          profile.tournaments++;
          profile.totalEarnings += prize;
          if (position === 1) profile.wins++;
        }
      });

      const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
      await announceChannel.send({
        content: '@everyone\n\n🎉 **TOURNAMENT RESULTS!** 🎉',
        embeds: [embed]
      });

      await message.reply('✅ Winners announced successfully!');
      return;
    }

    // Stats Command
    if (command === '!stats') {
      const totalProfiles = dataManager.userProfiles.size;
      const totalInvites = Array.from(dataManager.userInvites.values()).reduce((a, b) => a + b, 0);
      const freeEntryUsers = Array.from(dataManager.userInvites.values()).filter(i => i >= CONFIG.MIN_INVITES).length;
      const activeTournaments = dataManager.tournaments.size;

      const embed = new Discord.EmbedBuilder()
        .setTitle('📊 OTO Bot Statistics')
        .setColor('#3498db')
        .addFields(
          { name: '👥 Total Profiles', value: `${totalProfiles}`, inline: true },
          { name: '🔗 Total Invites', value: `${totalInvites}`, inline: true },
          { name: '🎁 FREE Entry Users', value: `${freeEntryUsers}`, inline: true },
          { name: '🎮 Active Tournaments', value: `${activeTournaments}`, inline: true },
          { name: '📊 Server Members', value: `${message.guild.memberCount}`, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      return;
    }

    // List Tournaments
    if (command === '!tournaments' || command === '!list') {
      const active = Array.from(dataManager.tournaments.values());

      if (active.length === 0) {
        await message.reply('📊 No active tournaments!');
        return;
      }

      const embed = new Discord.EmbedBuilder()
        .setTitle('🎮 Active Tournaments')
        .setDescription(`Total: ${active.length}`)
        .setColor('#3498db');

      active.forEach(t => {
        embed.addFields({
          name: `${t.title}`,
          value: `**ID:** \`${t.id}\`\n**Slots:** ${t.slotsFilled}/${t.maxSlots}\n**Status:** ${t.status.toUpperCase()}`,
          inline: false
        });
      });

      await message.reply({ embeds: [embed] });
      return;
    }

    // Add Staff
    if (command === '!addstaff') {
      if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) {
        await message.reply('❌ Admin only!');
        return;
      }

      const user = message.mentions.users.first();
      if (!user) {
        await message.reply('❌ Usage: `!addstaff @user`');
        return;
      }

      try {
        const member = await message.guild.members.fetch(user.id);
        await member.roles.add(CONFIG.STAFF_ROLE);
        await message.reply(`✅ ${user.tag} added to staff team!`);
      } catch (error) {
        await message.reply(`❌ Failed: ${error.message}`);
      }
      return;
    }

    // Remove Staff
    if (command === '!removestaff') {
      if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) {
        await message.reply('❌ Admin only!');
        return;
      }

      const user = message.mentions.users.first();
      if (!user) {
        await message.reply('❌ Usage: `!removestaff @user`');
        return;
      }

      try {
        const member = await message.guild.members.fetch(user.id);
        await member.roles.remove(CONFIG.STAFF_ROLE);
        await message.reply(`✅ ${user.tag} removed from staff!`);
      } catch (error) {
        await message.reply(`❌ Failed: ${error.message}`);
      }
      return;
    }

    // Announce
    if (command === '!announce') {
      const announcement = args.slice(1).join(' ');
      if (!announcement) {
        await message.reply('❌ Usage: `!announce <message>`');
        return;
      }

      const embed = new Discord.EmbedBuilder()
        .setTitle('📢 OFFICIAL ANNOUNCEMENT')
        .setDescription(announcement)
        .setColor('#ff0000')
        .setFooter({ text: `By ${message.author.username}` })
        .setTimestamp();

      const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
      await announceChannel.send({ content: '@everyone', embeds: [embed] });
      await message.reply('✅ Announcement posted!');
      return;
    }

    // Sync Profiles to Profile Channel
    if (command === '!syncprofiles') {
      if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) {
        await message.reply('❌ Admin only!');
        return;
      }

      const profileChannel = await client.channels.fetch(CONFIG.PROFILE_CHANNEL);
      let count = 0;

      for (const [userId, profile] of dataManager.userProfiles) {
        try {
          const user = await client.users.fetch(userId);
          const invites = dataManager.getInvites(userId);

          const embed = new Discord.EmbedBuilder()
            .setTitle('👤 Player Profile')
            .setDescription(`**${profile.name}**`)
            .setColor('#3498db')
            .addFields(
              { name: '🆔 OTO ID', value: `\`${profile.otoId}\``, inline: true },
              { name: '🎮 Game', value: profile.game, inline: true },
              { name: '📍 State', value: profile.state, inline: true },
              { name: '🔗 Invites', value: `${invites}`, inline: true },
              { name: '✅ Status', value: invites >= CONFIG.MIN_INVITES ? 'FREE Entry' : 'Paid Entry', inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

          await profileChannel.send({ embeds: [embed] });
          count++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {}
      }

      await message.reply(`✅ Synced ${count} profiles!`);
      return;
    }
  }
});

// ==================== MEMBER JOIN ====================
client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    let inviter = null;
    let inviterCount = 0;
    
    try {
      const newInvites = await guild.invites.fetch();
      const usedInvite = newInvites.find(inv => {
        const cached = dataManager.inviteCache.get(inv.code) || 0;
        return inv.uses > cached;
      });

      if (usedInvite?.inviter) {
        dataManager.inviteCache.set(usedInvite.code, usedInvite.uses);
        inviter = usedInvite.inviter;
        inviterCount = dataManager.addInvite(inviter.id);

        if (inviterCount === CONFIG.MIN_INVITES) {
          const embed = new Discord.EmbedBuilder()
            .setTitle('🎉 CONGRATULATIONS! 🎉')
            .setDescription(`**You've unlocked FREE ENTRY!**`)
            .setColor('#00ff00')
            .addFields(
              { name: '✅ Achievement', value: `${CONFIG.MIN_INVITES} Invites!`, inline: false },
              { name: '🎁 Reward', value: 'FREE tournament entry forever!', inline: false }
            )
            .setTimestamp();

          try {
            await inviter.send({ embeds: [embed] });
          } catch (err) {}

          const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
          await channel.send(`🎉 <@${inviter.id}> unlocked **FREE ENTRY** by inviting ${CONFIG.MIN_INVITES} friends! 🏆`);
        }
      }

      newInvites.forEach(inv => dataManager.inviteCache.set(inv.code, inv.uses));
    } catch (err) {}

    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    let welcomeMsg = `🔥 <@${member.id}> joined! Welcome to OTO! 🎮`;
    
    if (inviter) {
      welcomeMsg += `\n\n💫 **Invited by:** <@${inviter.id}> (${inviterCount} invites)`;
    }
    
    welcomeMsg += `\n\n🎯 **Quick Start:**\n• Complete profile (check DM)\n• Invite ${CONFIG.MIN_INVITES} friends = FREE entry\n• Join tournaments!`;

    await channel.send(welcomeMsg);

    // Send DM for profile setup
    setTimeout(async () => {
      try {
        if (!dataManager.hasProfile(member.id)) {
          const embed = new Discord.EmbedBuilder()
            .setTitle('👋 Welcome to OTO Tournaments!')
            .setDescription(`Hey ${member.user.username}! Let's create your profile!`)
            .setColor('#3498db')
            .addFields(
              { name: '📝 Profile Format', value: '```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/Minecraft/PUBG\n```', inline: false },
              { name: '🎁 Benefits', value: '• PLAYER role\n• Track stats\n• Join tournaments\n• Win money!', inline: false }
            )
            .setFooter({ text: 'Reply with your details!' })
            .setTimestamp();

          await member.send({ embeds: [embed] });
        }
      } catch (err) {}
    }, 5000);

  } catch (error) {
    console.error('Member join error:', error);
  }
});

// ==================== BOT READY ====================
client.once('ready', async () => {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        🎮 OTO TOURNAMENT BOT - ONLINE                ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`✅ Bot: ${client.user.tag}`);
  console.log(`✅ Servers: ${client.guilds.cache.size}`);
  console.log(`✅ Users: ${client.users.cache.size}`);
  console.log('');

  client.user.setPresence({
    activities: [{ name: '🎮 OTO Tournaments | -help', type: Discord.ActivityType.Playing }],
    status: 'online'
  });

  // Load invite cache
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) {
          dataManager.inviteCache.set(inv.code, inv.uses);
        }
      });
      console.log(`✅ Loaded ${invites.size} invites for: ${guild.name}`);
    } catch (err) {}
  }

  console.log('');
  console.log('🚀 All systems operational!');
  console.log('');

  // Send help to staff-tools and owner-tool
  setTimeout(async () => {
    try {
      // Staff Tools Help
      const staffChannel = await client.channels.fetch(CONFIG.STAFF_TOOLS);
      const staffEmbed = new Discord.EmbedBuilder()
        .setTitle('📋 STAFF COMMANDS')
        .setDescription('**All available staff commands:**')
        .setColor('#3498db')
        .addFields(
          { 
            name: '🎮 Tournament Management', 
            value: '`!startroom <ID> <roomID> <pass>` - Start tournament\n`!winners <ID> @1st @2nd @3rd` - Declare winners\n`!tournaments` - List active tournaments', 
            inline: false 
          },
          { 
            name: '📊 Bot Management', 
            value: '`!stats` - Bot statistics\n`!announce <message>` - Post announcement\n`!addstaff @user` - Add staff member\n`!removestaff @user` - Remove staff', 
            inline: false 
          },
          {
            name: '🎮 Tournament Creation',
            value: 'Click the **Create Tournament** button below to start!',
            inline: false
          }
        )
        .setFooter({ text: 'Use these commands in this channel only' })
        .setTimestamp();

      const staffRow = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setCustomId('create_tournament')
            .setLabel('Create Tournament')
            .setEmoji('🎮')
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.ButtonBuilder()
            .setCustomId('create_support_ticket')
            .setLabel('Test Ticket System')
            .setEmoji('🎫')
            .setStyle(Discord.ButtonStyle.Secondary)
        );

      await staffChannel.send({ embeds: [staffEmbed], components: [staffRow] });
      console.log('✅ Staff commands posted to staff-tools');

      // Owner Tool Commands (if exists)
      try {
        const ownerChannels = client.channels.cache.filter(c => 
          c.name?.toLowerCase().includes('owner') && c.type === Discord.ChannelType.GuildText
        );

        for (const [id, ownerChannel] of ownerChannels) {
          const ownerEmbed = new Discord.EmbedBuilder()
            .setTitle('👑 OWNER COMMANDS')
            .setDescription('**Special owner-only commands:**')
            .setColor('#ffd700')
            .addFields(
              { 
                name: '🔧 System Commands', 
                value: '`!syncprofiles` - Sync all profiles to profile channel\n`!addstaff @user` - Add staff member\n`!removestaff @user` - Remove staff member', 
                inline: false 
              },
              { 
                name: '📊 Management', 
                value: '`!stats` - Full bot statistics\n`!tournaments` - List all tournaments\n`!announce <message>` - Server announcement', 
                inline: false 
              },
              { 
                name: '🎮 Tournament Control', 
                value: '`!startroom <ID> <roomID> <pass>` - Start tournament\n`!winners <ID> @1st @2nd @3rd` - Declare winners\nAll staff commands available', 
                inline: false 
              }
            )
            .setFooter({ text: 'Owner access only - Use responsibly' })
            .setTimestamp();

          await ownerChannel.send({ embeds: [ownerEmbed] });
          console.log(`✅ Owner commands posted to ${ownerChannel.name}`);
        }
      } catch (err) {
        console.log('⚠️ No owner-tool channel found');
      }

      // Post guide to How to Join
      const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
      const guideEmbed = new Discord.EmbedBuilder()
        .setTitle('🎮 OTO Tournament Guide')
        .setDescription('**Complete guide to join and win!**')
        .setColor('#3498db')
        .addFields(
          { name: '1️⃣ Create Profile', value: 'Check DMs from bot\nReply with your details', inline: false },
          { name: '2️⃣ Invite Friends', value: `Invite ${CONFIG.MIN_INVITES} friends = FREE entry!\nType \`-i\` to track`, inline: false },
          { name: '3️⃣ Join Tournament', value: `Go to <#${CONFIG.TOURNAMENT_SCHEDULE}>\nClick JOIN button`, inline: false },
          { name: '4️⃣ Win Prizes', value: 'Play fair, win big! 🏆\nGet paid instantly! 💰', inline: false }
        )
        .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
        .setFooter({ text: 'Need help? Create a support ticket!' })
        .setTimestamp();

      const guideRow = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setCustomId('create_support_ticket')
            .setLabel('Create Support Ticket')
            .setEmoji('🎫')
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.ButtonBuilder()
            .setLabel('View Tournaments')
            .setStyle(Discord.ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${howToJoinChannel.guild.id}/${CONFIG.TOURNAMENT_SCHEDULE}`)
        );

      await howToJoinChannel.send({ embeds: [guideEmbed], components: [guideRow] });
      console.log('✅ Guide posted to how-to-join');

    } catch (err) {
      console.log('⚠️ Could not post help messages:', err.message);
    }
  }, 5000);
});

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('❌ Client Error:', err));
client.on('warn', warn => console.warn('⚠️ Warning:', warn));

process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM...');
  client.destroy();
  process.exit(0);
});

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║         ✅ BOT LOGIN SUCCESSFUL!                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
  })
  .catch(err => {
    console.error('╔═══════════════════════════════════════════════════════╗');
    console.error('║         ❌ LOGIN FAILED!                              ║');
    console.error('╚═══════════════════════════════════════════════════════╝');
    console.error('Error:', err.message);
    console.error('');
    console.error('⚠️ PLEASE CHECK:');
    console.error('1. BOT_TOKEN is correct in environment variables');
    console.error('2. Enable ALL 3 Privileged Intents in Discord Portal:');
    console.error('   → Go to: https://discord.com/developers/applications');
    console.error('   → Select your bot → Bot tab → Privileged Gateway Intents');
    console.error('   → Enable: PRESENCE INTENT');
    console.error('   → Enable: SERVER MEMBERS INTENT');
    console.error('   → Enable: MESSAGE CONTENT INTENT');
    console.error('   → Click "Save Changes"');
    console.error('3. Bot has proper permissions in server');
    console.error('');
    process.exit(1);
  });

module.exports = { client, dataManager, CONFIG };
module.exports = { client, dataManager, CONFIG };
