// ==================== OTO TOURNAMENT BOT - COMPLETE SYSTEM ====================
// Professional Discord Tournament Management Bot
// Version: 2.0 - Full Featured

if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (err) {}
}

const Discord = require('discord.js');
const express = require('express');
const moment = require('moment-timezone');

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
  NO_REPLY_TIMEOUT: 120000, // 2 minutes
  SPAM_INTERVAL: 180000, // 3 minutes for tournament spam
  TICKET_AUTO_CLOSE: 600000, // 10 minutes
  SUPPORT_WAIT_TIME: 30000, // 30 seconds before auto-response
  
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
    this.messageCount = new Map(); // For activity tracking
    this.tournamentLeaderboard = { 
      freefire: new Map(), 
      minecraft: new Map(),
      pubg: new Map() 
    };
    this.lobbyChannels = new Map(); // Store lobby channels
    this.beatPlayerChallenges = new Map(); // Beat our player challenges
    this.staffTicketTimers = new Map(); // Support ticket auto-response
  }

  // Profile Management
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

  // Invite System
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

  // Warning System
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

  // Activity Tracking
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

// ==================== GREETING MESSAGES ====================
const GREETING_MESSAGES = {
  male: [
    '🔥 {name} bhai aa gaya! Machayenge now! 🎮',
    '⚡ Yo {name}! Tournament ready ho? 💪',
    '🎯 {name} bro! Let\'s win together! 🏆',
    '💫 {name} ka swagat hai! Game on! 🎮',
    '🌟 {name} joined! Big wins incoming! 💰',
    '🚀 {name} bhai! Tournament time! ⚡',
    '🎮 Welcome {name}! Aaj khelenge! 🔥',
    '💎 {name} entered the arena! Let\'s go! 🏆',
    '⭐ {name} aa gaye! Taiyaar ho jao! 💪',
    '🔰 {name} bro! Championship awaits! 🎯'
  ],
  female: [
    '💫 {name} aa gayi! Welcome queen! 👑',
    '🌟 Hello {name}! Ready to shine? ✨',
    '🎀 {name} joined! Let\'s rock! 🎮',
    '💖 Welcome {name}! Gaming time! 🎯',
    '✨ {name} is here! Tournament time! 🏆',
    '🌸 {name} ka swagat! Let\'s win! 💪',
    '🎭 {name} entered! Game on! 🎮',
    '💝 Hey {name}! Ready to dominate? 🔥',
    '🦋 {name} welcome! Tournament awaits! ⚡',
    '🌺 {name} aa gayi! Victory is near! 🏆'
  ],
  unknown: [
    '🔥 New warrior entered! Welcome! 🎮',
    '⚡ Fresh blood! Let\'s game! 💪',
    '🎯 Welcome to OTO! Tournament time! 🏆',
    '💫 New player! Ready to win? 🎮',
    '🌟 Welcome! Big wins ahead! 💰'
  ]
};

// ==================== AUTO RESPONSE SYSTEM ====================
const AUTO_RESPONSES = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'namaste', 'hola', 'sup', 'yo'],
    male: [
      'Hey bro! 👋 Tournament check karo! 🎮',
      'Yo! Aaj kheloge? Tournament live hai! 🔥',
      'Hi bhai! Custom challenge karoge? ⚡',
      'Hello! Tournament join karo! 💪',
      'Hey! Big prizes waiting! 🏆'
    ],
    female: [
      'Hello! 👋 Tournament check karo! 🎮',
      'Hi! Aaj kheloge? 🎯',
      'Hey! Ready for gaming? ⚡',
      'Hello dear! Tournament join karo! 💫',
      'Hi! Big wins await! 🏆'
    ],
    default: [
      'Hey! 👋 Check tournaments! 🎮',
      'Hi! Ready to play? 🎯',
      'Hello! Join tournament! 🏆',
      'Hey! Gaming time! ⚡',
      'Hi! Big prizes! 💰'
    ]
  },
  
  tournament: {
    patterns: ['tournament', 'tourney', 'competition', 'match', 'game', 'khelna'],
    responses: [
      '🎮 **Active Tournaments:**\nCheck <#1438482561679626303> for schedule!\n💰 Win real money daily! 🏆',
      '🔥 **Tournament Info:**\n• Free Fire tournaments daily\n• Minecraft build contests\n• Real cash prizes!\nJoin now: <#1438482561679626303>',
      '⚡ **Gaming Time!**\nMultiple tournaments live!\n📅 Schedule: <#1438482561679626303>\n🎯 Register & Win! 💎',
      '🏆 **Tournament Details:**\n• Daily competitions\n• Multiple games\n• Big prizes!\nCheck: <#1438482561679626303> 🎮',
      '💪 **Ready to Win?**\nActive tournaments waiting!\n📍 Go to: <#1438482561679626303>\n🎯 Register now! ⚡'
    ]
  },

  invite: {
    patterns: ['invite', 'refer', 'friend', 'link', 'invite kaise'],
    responses: [
      '🔗 **Free Entry System:**\n✅ Invite 10 friends = FREE tournaments!\n📊 Check invites: `-i` command\n💎 Start inviting now!',
      '💫 **Invite Benefits:**\n• 10 invites = FREE entry\n• Top inviters get rewards\n• Help grow community!\nType `-i` to check progress! 🎁',
      '🎁 **Get FREE Entry:**\n1️⃣ Invite 10 friends\n2️⃣ They join server\n3️⃣ You get FREE tournaments!\nCommand: `-i` to track! 🔥',
      '⚡ **Invitation System:**\nInvite friends → Get FREE entry!\nRequired: 10 invites\nCurrent: Use `-i` to check\nRewards waiting! 🏆',
      '🚀 **Quick Invite Guide:**\n• Right-click server name\n• Click "Invite People"\n• Share link everywhere!\n• 10 joins = FREE entry! 🎮'
    ]
  },

  payment: {
    patterns: ['payment', 'pay', 'paisa', 'transaction', 'upi', 'paytm', 'phonepe'],
    responses: [
      '💳 **Payment Methods:**\n✅ UPI / PayTM / PhonePe / GPay\n📸 Send screenshot in ticket\n⏱️ Verification: 5-15 min\n🎫 Create ticket for help!',
      '💰 **Payment Process:**\n1️⃣ Join tournament\n2️⃣ Upload payment proof\n3️⃣ Staff verifies (10 min)\n4️⃣ You\'re in!\nNeed help? Create ticket! 🎮',
      '🔐 **Payment Info:**\n• UPI ID available in registration\n• Send screenshot\n• Quick verification\n• Play immediately!\nIssues? Open ticket! ⚡',
      '📱 **How to Pay:**\nUse any UPI app → Pay → Screenshot → Upload in ticket → Get verified!\nStaff response: 5-10 minutes! 🏆',
      '✨ **Payment Help:**\nAll UPI methods accepted!\n📸 Screenshot required\n⚡ Fast verification\n🎫 Ticket for issues! 💎'
    ]
  },

  profile: {
    patterns: ['profile', 'oto id', 'account', 'register', 'signup'],
    responses: [
      '👤 **Profile System:**\nType `-profile` to view!\nBot will DM for setup if new.\n🆔 Your OTO ID shows there!\nNeed changes? Create ticket! 🎮',
      '🔐 **Profile Info:**\n• Check: `-profile` command\n• Update: Open ticket\n• OTO ID: Unique identifier\n• Shows all stats! ⚡',
      '📋 **Your Profile:**\nCommand: `-profile`\nIncludes:\n• OTO ID\n• Stats\n• Tournaments\n• Wins & Earnings! 🏆',
      '✨ **Profile Help:**\n`-profile` → View everything\nDM from bot → Setup\nTicket → Modify details\nAll stats tracked! 💪',
      '🎯 **Account Details:**\nType `-profile` anytime!\n📊 See complete stats\n🎮 Tournament history\n🏆 Your achievements! 🔥'
    ]
  },

  help: {
    patterns: ['help', 'madad', 'support', 'kaise', 'how', 'guide'],
    responses: [
      '🆘 **Need Help?**\n📚 Guide: <#1438482512296022017>\n💬 Commands: `-help`\n🎫 Ticket: Personal support\n🤖 Mention bot for quick help!',
      '💡 **Quick Help:**\n• `-i` → Check invites\n• `-profile` → Your stats\n• `-help` → All commands\n• Create ticket → Staff help\nWe\'re here for you! 🎮',
      '🎯 **Getting Started:**\n1️⃣ Complete profile\n2️⃣ Invite 10 friends\n3️⃣ Join tournaments\n4️⃣ Win prizes!\nQuestions? Mention bot! ⚡',
      '🔰 **Help Center:**\nCommands: `-help`\nGuide: Check pins 📌\nSupport: Create ticket 🎫\nStaff ready 24/7! 💪',
      '⭐ **Support Options:**\n• Bot commands (type `-help`)\n• Complete guide available\n• Staff support via tickets\n• Mention bot anytime! 🏆'
    ]
  },

  staff: {
    patterns: ['staff', 'admin', 'moderator', 'help staff', 'support team'],
    responses: [
      '👨‍💼 **Staff Team:**\nOur team is working hard!\n⚡ Quick response guaranteed!\n🎫 Create ticket for personal help!\nPatience appreciated! 💪',
      '🔔 **Staff Notified:**\nSupport team alerted!\n⏱️ Response time: 5-15 min\n🎫 Ticket = Faster help\nThank you for waiting! 🎮',
      '💼 **Staff Status:**\nTeam members active!\n✅ They\'ll respond ASAP\n🎯 Average wait: 10 min\nCreate ticket for priority! ⚡',
      '🎭 **Support Team:**\nStaff working on requests!\n📱 Quick response incoming\n🎫 Ticket = Better help\nWe\'re here for you! 🏆'
    ]
  }
};

// ==================== BOT MENTION RESPONSE ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.mentions.has(client.user)) {
    const profile = dataManager.getProfile(message.author.id);
    const hasProfile = profile !== null;
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('🤖 OTO Bot - Quick Help')
      .setDescription(`Hey ${hasProfile ? profile.name : message.author.username}! 👋`)
      .setColor('#3498db')
      .addFields(
        { 
          name: '🎮 Tournaments', 
          value: 'Active tournaments: <#1438482561679626303>', 
          inline: true 
        },
        { 
          name: '📚 How to Join', 
          value: 'Complete guide: <#1438482512296022017>', 
          inline: true 
        },
        { 
          name: '🎫 Support', 
          value: 'Need help? Create a ticket!', 
          inline: true 
        },
        {
          name: '⚡ Quick Commands',
          value: '`-i` - Check invites\n`-profile` - Your profile\n`-help` - All commands',
          inline: false
        }
      )
      .setFooter({ text: 'OTO Tournaments - Play & Win!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

// ==================== MEMBER JOIN EVENT ====================
client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    
    // Track inviter
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

        // Update invite leaderboard
        await updateInviteLeaderboard();

        // Check if inviter reached 10 invites
        if (inviterCount === CONFIG.MIN_INVITES) {
          const embed = new Discord.EmbedBuilder()
            .setTitle('🎉 CONGRATULATIONS! 🎉')
            .setDescription(`**You've unlocked FREE ENTRY!**`)
            .setColor('#00ff00')
            .addFields(
              { 
                name: '✅ Achievement Unlocked', 
                value: `**${CONFIG.MIN_INVITES} Invites Completed!**`, 
                inline: false 
              },
              { 
                name: '🎁 Your Reward', 
                value: '• FREE tournament entry forever!\n• Priority support\n• Special role coming soon!', 
                inline: false 
              },
              {
                name: '🎮 What\'s Next?',
                value: 'Join any tournament with **FREE entry**!\nClick "Join Tournament" in <#1438482561679626303>',
                inline: false
              }
            )
            .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
            .setFooter({ text: 'Thank you for growing our community! 💪' })
            .setTimestamp();

          const row = new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setLabel('View Tournaments')
                .setStyle(Discord.ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${guild.id}/${CONFIG.TOURNAMENT_SCHEDULE}`),
              new Discord.ButtonBuilder()
                .setCustomId('create_beat_player_ticket')
                .setLabel('Beat Our Player')
                .setEmoji('⚔️')
                .setStyle(Discord.ButtonStyle.Danger)
            );

          try {
            await inviter.send({ embeds: [embed], components: [row] });
          } catch (err) {
            console.log('Could not DM inviter');
          }

          // Announce in general
          const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
          await channel.send(`🎉 <@${inviter.id}> just unlocked **FREE ENTRY** by inviting ${CONFIG.MIN_INVITES} friends! 🏆`);
        }
      }

      // Update invite cache
      newInvites.forEach(inv => dataManager.inviteCache.set(inv.code, inv.uses));
    } catch (err) {
      console.log('Invite tracking error:', err.message);
    }

    // Send welcome message
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    
    // Random welcome message
    const welcomeArray = GREETING_MESSAGES.unknown;
    let welcomeMsg = welcomeArray[Math.floor(Math.random() * welcomeArray.length)]
      .replace('{name}', `<@${member.id}>`);
    
    if (inviter) {
      welcomeMsg += `\n\n💫 **Invited by:** <@${inviter.id}> (${inviterCount} total invites)`;
    }
    
    welcomeMsg += `\n\n🎯 **Quick Start:**\n• Complete your profile (check DM)\n• Invite ${CONFIG.MIN_INVITES} friends for FREE entry\n• Join tournaments & win prizes!`;

    await channel.send(welcomeMsg);

    // Update invite tracker
    if (inviter) {
      try {
        const inviteChannel = await client.channels.fetch(CONFIG.INVITE_TRACKER);
        await inviteChannel.send(
          `📊 **New Member via Invite**\n` +
          `👤 Member: ${member.user.tag}\n` +
          `🔗 Invited by: <@${inviter.id}>\n` +
          `📈 Inviter Total: ${inviterCount} invites`
        );
      } catch (err) {}
    }

    // Send profile setup DM after 5 seconds
    setTimeout(async () => {
      try {
        if (!dataManager.hasProfile(member.id)) {
          const embed = new Discord.EmbedBuilder()
            .setTitle('👋 Welcome to OTO Tournaments!')
            .setDescription(`Hey ${member.user.username}! Let's create your gaming profile!`)
            .setColor('#3498db')
            .addFields(
              { 
                name: '📝 Complete Your Profile', 
                value: 'Reply to this DM with your details in this format:\n```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/Minecraft/PUBG\n```', 
                inline: false 
              },
              { 
                name: '🎁 Benefits', 
                value: '• Get PLAYER role\n• Track your stats\n• Unique OTO ID\n• Join tournaments\n• Win real money!', 
                inline: false 
              },
              {
                name: '🚀 Quick Start',
                value: `• Invite ${CONFIG.MIN_INVITES} friends = FREE entry\n• Check <#${CONFIG.TOURNAMENT_SCHEDULE}>\n• Win big prizes daily!`,
                inline: false
              }
            )
            .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
            .setFooter({ text: 'Reply with your profile details to get started!' })
            .setTimestamp();

          await member.send({ embeds: [embed] });
        }
      } catch (err) {
        console.log('Could not DM new member:', err.message);
      }
    }, 5000);

  } catch (error) {
    console.error('Member join error:', error);
  }
});

// ==================== DM PROFILE SETUP ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.type !== Discord.ChannelType.DM) return;

  const content = message.content;
  
  // Profile creation
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
          { name: '👤 Gender', value: profile.gender === 'male' ? 'Male' : 'Female', inline: true },
          { name: '🎯 Invites Needed', value: `${CONFIG.MIN_INVITES} for FREE entry`, inline: true },
          { name: '✅ Status', value: 'Profile Active', inline: true },
          { 
            name: '🚀 Next Steps', 
            value: `1️⃣ Invite friends: \`-i\` to track\n2️⃣ Join tournaments: Check server\n3️⃣ Win prizes: Play & earn!\n4️⃣ View profile: Type \`-profile\``, 
            inline: false 
          }
        )
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: 'Your gaming journey starts now! 🏆' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      // Post profile to profile channel
      try {
        const profileChannel = await client.channels.fetch(CONFIG.PROFILE_CHANNEL);
        const publicEmbed = new Discord.EmbedBuilder()
          .setTitle('🎮 New Player Registered!')
          .setDescription(`**${profile.name}** joined OTO Tournaments!`)
          .setColor('#3498db')
          .addFields(
            { name: '🆔 OTO ID', value: profile.otoId, inline: true },
            { name: '🎮 Game', value: profile.game, inline: true },
            { name: '📍 State', value: profile.state, inline: true }
          )
          .setThumbnail(message.author.displayAvatarURL())
          .setFooter({ text: 'Welcome to the team!' })
          .setTimestamp();

        await profileChannel.send({ embeds: [publicEmbed] });
      } catch (err) {}

      // Announce in general
      try {
        const guilds = client.guilds.cache;
        for (const guild of guilds.values()) {
          const channel = await guild.channels.fetch(CONFIG.GENERAL_CHAT);
          const gender = profile.gender === 'female' ? '👸' : '🤴';
          await channel.send(
            `${gender} **${profile.name}** completed their profile! 🎉\n` +
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
});

// ==================== PAYMENT APPROVAL SYSTEM ====================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Approve Payment
  if (interaction.customId.startsWith('approve_payment_')) {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    const parts = interaction.customId.split('_');
    const userId = parts[2];
    const tournamentId = parts[3];
    const ticketId = parts[4];
    
    const tournament = dataManager.tournaments.get(tournamentId);
    if (!tournament) {
      await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
      return;
    }

    const player = tournament.players.get(userId);
    if (player) {
      player.status = 'confirmed';
      player.approvedBy = interaction.user.id;
      player.approvedAt = new Date();
      
      tournament.confirmedPlayers.set(userId, player);
      tournament.slotsFilled++;

      // Update tournament slots
      await updateTournamentSlots(tournament);

      const embed = new Discord.EmbedBuilder()
        .setTitle('✅ PAYMENT APPROVED!')
        .setDescription(`<@${userId}> your registration is confirmed!`)
        .setColor('#00ff00')
        .addFields(
          { name: '🎮 Tournament', value: tournament.title, inline: false },
          { name: '📊 Your Slot', value: `#${tournament.slotsFilled}`, inline: true },
          { name: '⏰ Time', value: tournament.time, inline: true },
          { name: '✅ Status', value: 'CONFIRMED', inline: true },
          {
            name: '📋 Next Steps',
            value: '• Stay in this ticket\n• Room details will be sent\n• Be ready 15 minutes before\n• Good luck! 🏆',
            inline: false
          }
        )
        .setFooter({ text: `Approved by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.message.edit({ embeds: [embed], components: [] });
      await interaction.reply(`✅ Payment approved! <@${userId}> is now confirmed for slot #${tournament.slotsFilled}!`);

      // DM user
      try {
        const user = await client.users.fetch(userId);
        await user.send({
          content: `✅ **Payment Approved!**\n\nYour registration for **${tournament.title}** is confirmed!\n\nStay in your ticket for room details. Good luck! 🎮`
        });
      } catch (err) {}

      // Check if tournament is full
      if (tournament.slotsFilled >= tournament.maxSlots) {
        const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        await generalChannel.send(
          `🚨 **${tournament.title} - SLOTS FULL!** 🚨\n\n` +
          `All ${tournament.maxSlots} slots filled!\n` +
          `Starting at ${tournament.time}\n` +
          `📺 Live: ${CONFIG.YOUTUBE_LINK}`
        );
      }
    }
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
      .setDescription(`<@${userId}>, your payment proof was rejected.`)
      .setColor('#ff0000')
      .addFields({
        name: '🔄 What to do?',
        value: 'Please upload a clear payment screenshot showing:\n• Transaction ID\n• Amount paid\n• Date & time\n• Payment method\n\nStaff will verify again!',
        inline: false
      })
      .setFooter({ text: `Rejected by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.message.edit({ embeds: [embed], components: [] });
    await interaction.reply(`❌ Payment rejected for <@${userId}>. Asked to resubmit.`);
  }
});

// ==================== UPDATE TOURNAMENT SLOTS ====================
async function updateTournamentSlots(tournament) {
  try {
    if (!tournament.scheduleMessageId) return;

    const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
    const message = await scheduleChannel.messages.fetch(tournament.scheduleMessageId);
    
    const embed = message.embeds[0];
    if (embed) {
      const slotField = embed.fields.find(f => f.name === '📊 Slots');
      if (slotField) {
        slotField.value = `${tournament.slotsFilled}/${tournament.maxSlots}`;
        await message.edit({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('Update slots error:', error);
  }
}

// ==================== START TOURNAMENT & SEND ROOM DETAILS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

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
    tournament.roomDetails = {
      roomId,
      password,
      startedAt: new Date(),
      startedBy: message.author.id
    };

    // Create lobby channel for all confirmed players
    try {
      const category = message.guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
      const lobbyChannel = await message.guild.channels.create({
        name: `🎮-${tournament.title.toLowerCase().replace(/\s+/g, '-')}-lobby`,
        type: Discord.ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: [Discord.PermissionFlagsBits.ViewChannel]
          },
          {
            id: CONFIG.STAFF_ROLE,
            allow: [
              Discord.PermissionFlagsBits.ViewChannel,
              Discord.PermissionFlagsBits.SendMessages,
              Discord.PermissionFlagsBits.ManageMessages
            ]
          },
          {
            id: CONFIG.ADMIN_ROLE,
            allow: [
              Discord.PermissionFlagsBits.ViewChannel,
              Discord.PermissionFlagsBits.SendMessages,
              Discord.PermissionFlagsBits.ManageMessages,
              Discord.PermissionFlagsBits.ManageChannels
            ]
          }
        ]
      });

      tournament.lobbyChannelId = lobbyChannel.id;
      dataManager.lobbyChannels.set(tournamentId, lobbyChannel.id);

      // Add all confirmed players to lobby
      for (const [userId] of tournament.confirmedPlayers) {
        try {
          const member = await message.guild.members.fetch(userId);
          await lobbyChannel.permissionOverwrites.create(member, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          });
        } catch (err) {}
      }

      // Lobby welcome message
      const lobbyEmbed = new Discord.EmbedBuilder()
        .setTitle(`🎮 ${tournament.title} - TOURNAMENT LOBBY`)
        .setDescription('**Welcome to the tournament lobby!**\n\nAll confirmed players are here!')
        .setColor('#00ff00')
        .addFields(
          { name: '📊 Total Players', value: `${tournament.confirmedPlayers.size}`, inline: true },
          { name: '⏰ Start Time', value: tournament.time, inline: true },
          { name: '💰 Prize Pool', value: tournament.prize, inline: true },
          {
            name: '🔐 Room Details',
            value: `**Room ID:** \`${roomId}\`\n**Password:** \`${password}\`\n\n⚠️ **DO NOT share these details!**`,
            inline: false
          },
          {
            name: '📋 Important Rules',
            value: '• Join room within 5 minutes\n• Take screenshots of results\n• Follow all tournament rules\n• Be respectful to all players\n• Report issues immediately',
            inline: false
          },
          {
            name: '🏆 Prize Distribution',
            value: `🥇 1st: ₹${tournament.prizeDistribution.first}\n🥈 2nd: ₹${tournament.prizeDistribution.second}\n🥉 3rd: ₹${tournament.prizeDistribution.third}`,
            inline: false
          }
        )
        .setImage(tournament.image)
        .setFooter({ text: 'Good luck to all participants! 🎮' })
        .setTimestamp();

      await lobbyChannel.send({
        content: Array.from(tournament.confirmedPlayers.keys()).map(id => `<@${id}>`).join(' '),
        embeds: [lobbyEmbed]
      });

      // Send DM to all players
      let sentCount = 0;
      for (const [userId] of tournament.confirmedPlayers) {
        try {
          const user = await client.users.fetch(userId);
          
          const dmEmbed = new Discord.EmbedBuilder()
            .setTitle(`🎮 ${tournament.title} - STARTING NOW!`)
            .setDescription('**Tournament is LIVE! Join immediately!**')
            .setColor('#ff0000')
            .addFields(
              { name: '🔐 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
              { name: '🔑 Password', value: `\`\`\`${password}\`\`\``, inline: false },
              { name: '⚠️ IMPORTANT', value: '• Join within 5 minutes\n• Take screenshots\n• Check lobby channel\n• Good luck! 🏆', inline: false }
            )
            .setFooter({ text: '🚫 DO NOT SHARE ROOM DETAILS!' })
            .setTimestamp();

          await user.send({ embeds: [dmEmbed] });
          sentCount++;
        } catch (err) {
          console.log(`Could not DM user ${userId}`);
        }
      }

      // Update tournament status in schedule
      try {
        const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
        
        const liveEmbed = new Discord.EmbedBuilder()
          .setTitle(`🔴 LIVE: ${tournament.title}`)
          .setDescription('**Tournament is currently in progress!**')
          .setColor('#ff0000')
          .addFields(
            { name: '👥 Players', value: `${tournament.confirmedPlayers.size}`, inline: true },
            { name: '💰 Prize', value: tournament.prize, inline: true },
            { name: '📺 Watch', value: `[YouTube](${CONFIG.YOUTUBE_LINK})`, inline: true }
          )
          .setThumbnail(tournament.image)
          .setFooter({ text: 'Tournament in progress...' })
          .setTimestamp();

        await scheduleChannel.send({ embeds: [liveEmbed] });
      } catch (err) {}

      // Announce in general
      const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
      await generalChannel.send(
        `🔴 **TOURNAMENT LIVE!** 🔴\n\n` +
        `**${tournament.title}** just started!\n\n` +
        `👥 ${tournament.confirmedPlayers.size} players competing\n` +
        `💰 Prize pool: ${tournament.prize}\n` +
        `📺 Watch live: ${CONFIG.YOUTUBE_LINK}`
      );

      await message.reply(
        `✅ **Tournament Started!**\n\n` +
        `📊 Room details sent to ${sentCount} players\n` +
        `🎮 Lobby: ${lobbyChannel}\n` +
        `🔴 Status: LIVE`
      );

    } catch (error) {
      console.error('Start tournament error:', error);
      await message.reply('❌ Failed to start tournament!');
    }
  }

  // Declare Winners
  if (command === '!winners' || command === '!declare') {
    const tournamentId = args[1];
    const tournament = dataManager.tournaments.get(tournamentId);

    if (!tournament) {
      await message.reply('❌ Tournament not found!');
      return;
    }

    const winners = message.mentions.users;
    if (winners.size === 0) {
      await message.reply('❌ Usage: `!winners <tournamentID> @first @second @third`');
      return;
    }

    const winnerArray = Array.from(winners.values()).slice(0, 3);
    tournament.status = 'completed';
    tournament.winners = winnerArray;
    tournament.endedAt = new Date();

    const prizes = [
      tournament.prizeDistribution.first,
      tournament.prizeDistribution.second,
      tournament.prizeDistribution.third
    ];

    // Winner announcement embed
    const embed = new Discord.EmbedBuilder()
      .setTitle(`🏆 ${tournament.title} - RESULTS`)
      .setDescription('**🎉 Tournament Completed! Congratulations to all winners! 🎉**')
      .setColor('#ffd700')
      .setImage('https://i.ibb.co/jkBSmkM/qr.png');

    winnerArray.forEach((winner, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      const position = index + 1;
      const prize = prizes[index];

      embed.addFields({
        name: `${medal} ${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place`,
        value: `${winner}\n💰 Prize: ₹${prize}`,
        inline: true
      });

      // Update user profile
      const profile = dataManager.getProfile(winner.id);
      if (profile) {
        profile.tournaments++;
        profile.totalEarnings += prize;
        if (position === 1) profile.wins++;
      }

      // Update game leaderboard
      const game = tournament.game.toLowerCase().replace(/\s+/g, '');
      const leaderboard = game.includes('fire') ? dataManager.tournamentLeaderboard.freefire :
                          game.includes('minecraft') ? dataManager.tournamentLeaderboard.minecraft :
                          game.includes('pubg') ? dataManager.tournamentLeaderboard.pubg :
                          dataManager.tournamentLeaderboard.freefire;

      const stats = leaderboard.get(winner.id) || { wins: 0, tournaments: 0, totalEarnings: 0 };
      stats.tournaments++;
      if (position === 1) stats.wins++;
      stats.totalEarnings += prize;
      leaderboard.set(winner.id, stats);
    });

    embed.addFields({
      name: '📊 Tournament Stats',
      value: `👥 Total Players: ${tournament.confirmedPlayers.size}\n💰 Prize Pool: ${tournament.prize}\n🎮 Game: ${tournament.game}\n🗺️ Map: ${tournament.map}`,
      inline: false
    });

    // Post to announcements
    const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
    await announceChannel.send({
      content: '@everyone\n\n🎉 **TOURNAMENT RESULTS!** 🎉',
      embeds: [embed]
    });

    // Post to lobby if exists
    if (tournament.lobbyChannelId) {
      try {
        const lobbyChannel = await client.channels.fetch(tournament.lobbyChannelId);
        await lobbyChannel.send({
          content: '🏆 **RESULTS ANNOUNCED!**',
          embeds: [embed]
        });
      } catch (err) {}
    }

    // DM winners
    for (let i = 0; i < winnerArray.length; i++) {
      const winner = winnerArray[i];
      const position = i + 1;
      const prize = prizes[i];

      try {
        const winnerEmbed = new Discord.EmbedBuilder()
          .setTitle(`🎉 CONGRATULATIONS! 🎉`)
          .setDescription(`You won **${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place** in ${tournament.title}!`)
          .setColor('#ffd700')
          .addFields(
            { name: '🏆 Position', value: `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'}`, inline: true },
            { name: '💰 Prize', value: `₹${prize}`, inline: true },
            { name: '🎮 Tournament', value: tournament.title, inline: false },
            {
              name: '💳 Prize Collection',
              value: 'Your prize will be transferred within 24 hours!\nCheck with staff if not received.',
              inline: false
            }
          )
          .setThumbnail(winner.displayAvatarURL())
          .setImage('https://i.ibb.co/jkBSmkM/qr.png')
          .setFooter({ text: 'Thank you for playing! 🎮' })
          .setTimestamp();

        await winner.send({ embeds: [winnerEmbed] });
      } catch (err) {}
    }

    await message.reply('✅ Winners announced successfully!');
  }

  // End/Delete Tournament
  if (command === '!endtournament' || command === '!deletetournament') {
    const tournamentId = args[1];
    
    if (!tournamentId) {
      await message.reply('❌ Usage: `!endtournament <tournamentID>`');
      return;
    }

    const tournament = dataManager.tournaments.get(tournamentId);
    if (!tournament) {
      await message.reply('❌ Tournament not found!');
      return;
    }

    // Delete lobby channel if exists
    if (tournament.lobbyChannelId) {
      try {
        const lobbyChannel = await message.guild.channels.fetch(tournament.lobbyChannelId);
        await lobbyChannel.delete();
      } catch (err) {}
    }

    // Close all registration tickets
    for (const [userId, player] of tournament.players) {
      if (player.ticketChannelId) {
        try {
          const ticketChannel = await message.guild.channels.fetch(player.ticketChannelId);
          await ticketChannel.delete();
        } catch (err) {}
      }
    }

    dataManager.tournaments.delete(tournamentId);
    await message.reply(`✅ Tournament ${tournamentId} ended and deleted!`);
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
      .setDescription(`Total: ${active.length} tournament${active.length > 1 ? 's' : ''}`)
      .setColor('#3498db')
      .setTimestamp();

    active.forEach(t => {
      const statusEmoji = t.status === 'draft' ? '📝' :
                         t.status === 'registration' ? '🟢' :
                         t.status === 'live' ? '🔴' : '✅';

      embed.addFields({
        name: `${statusEmoji} ${t.title}`,
        value: `**ID:** \`${t.id}\`\n**Game:** ${t.game} | **Mode:** ${t.mode}\n**Prize:** ${t.prize} | **Entry:** ${t.entry}\n**Slots:** ${t.slotsFilled}/${t.maxSlots} | **Status:** ${t.status.toUpperCase()}`,
        inline: false
      });
    });

    await message.reply({ embeds: [embed] });
  }
});

// ==================== LEADERBOARD COMMANDS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!leaderboard' || command === '!lb') {
    const game = args[1]?.toLowerCase() || 'freefire';
    
    const leaderboard = game.includes('fire') ? dataManager.tournamentLeaderboard.freefire :
                        game.includes('minecraft') ? dataManager.tournamentLeaderboard.minecraft :
                        game.includes('pubg') ? dataManager.tournamentLeaderboard.pubg :
                        dataManager.tournamentLeaderboard.freefire;

    const sorted = Array.from(leaderboard.entries())
      .sort((a, b) => b[1].wins - a[1].wins || b[1].totalEarnings - a[1].totalEarnings)
      .slice(0, 10);

    const embed = new Discord.EmbedBuilder()
      .setTitle(`🏆 ${game.toUpperCase()} Tournament Leaderboard`)
      .setDescription('**Top 10 Players - Most Wins**')
      .setColor('#ffd700')
      .setTimestamp();

    let description = '';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, stats] = sorted[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      
      try {
        const user = await client.users.fetch(userId);
        description += `${medal} ${user.username}\n`;
        description += `   🏆 Wins: ${stats.wins} | 🎮 Tournaments: ${stats.tournaments} | 💰 Earned: ₹${stats.totalEarnings}\n\n`;
      } catch (err) {
        description += `${medal} Unknown User\n`;
        description += `   🏆 Wins: ${stats.wins} | 🎮 Tournaments: ${stats.tournaments} | 💰 Earned: ₹${stats.totalEarnings}\n\n`;
      }
    }

    embed.setDescription(description || 'No data yet!');

    // Post to leaderboard channel
    const leaderboardChannel = await client.channels.fetch(CONFIG.LEADERBOARD_CHANNEL);
    await leaderboardChannel.send({ embeds: [embed] });
    await message.reply('✅ Leaderboard posted!');
  }
});

// ==================== AUTO-UPDATE INVITE LEADERBOARD ====================
async function updateInviteLeaderboard() {
  try {
    const inviteChannel = await client.channels.fetch(CONFIG.INVITE_TRACKER);
    
    const topInviters = Array.from(dataManager.userInvites.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const embed = new Discord.EmbedBuilder()
      .setTitle('🔗 Top Inviters - Leaderboard')
      .setDescription('**Invite friends to climb the ranks!**')
      .setColor('#f1c40f')
      .setFooter({ text: `Total invites tracked: ${Array.from(dataManager.userInvites.values()).reduce((a, b) => a + b, 0)}` })
      .setTimestamp();

    let description = '';
    for (let i = 0; i < topInviters.length; i++) {
      const [userId, count] = topInviters[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      
      description += `${medal} <@${userId}> - **${count}** invite${count > 1 ? 's' : ''}\n`;
    }

    embed.setDescription(description || 'No invites yet! Be the first to invite friends!');

    const messages = await inviteChannel.messages.fetch({ limit: 1 });
    if (messages.size > 0 && messages.first().author.id === client.user.id && messages.first().embeds[0]?.title?.includes('Top Inviters')) {
      await messages.first().edit({ embeds: [embed] });
    } else {
      await inviteChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Invite leaderboard error:', error);
  }
}

// Update invite leaderboard every 5 minutes
setInterval(updateInviteLeaderboard, 300000);

// ==================== MOST ACTIVE PLAYERS ====================
async function updateActivityLeaderboard() {
  try {
    const mostPlayedChannel = await client.channels.fetch(CONFIG.MOST_PLAYED);
    
    const topActive = dataManager.getTopActive(10);

    const embed = new Discord.EmbedBuilder()
      .setTitle('📊 Most Active Players')
      .setDescription('**Top contributors to our community!**')
      .setColor('#9b59b6')
      .setFooter({ text: 'Activity measured by messages sent' })
      .setTimestamp();

    let description = '';
    for (let i = 0; i < topActive.length; i++) {
      const [userId, count] = topActive[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      
      description += `${medal} <@${userId}> - **${count}** message${count > 1 ? 's' : ''}\n`;
    }

    embed.setDescription(description || 'No activity tracked yet!');

    await mostPlayedChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Activity leaderboard error:', error);
  }
}

// Update activity leaderboard every 10 minutes
setInterval(updateActivityLeaderboard, 600000);

// Continue to Part 3 for Support Tickets, Beat Player, Staff Commands...
    // ==================== SUPPORT TICKET SYSTEM ====================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  // Create Support Ticket
  if (interaction.customId === 'create_support_ticket') {
    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('support_category')
          .setPlaceholder('Select issue category')
          .addOptions([
            {
              label: '💳 Payment Issue',
              description: 'Payment not verified, transaction problems',
              value: 'payment',
              emoji: '💳'
            },
            {
              label: '🎮 Tournament Issue',
              description: 'Registration, room details, gameplay',
              value: 'tournament',
              emoji: '🎮'
            },
            {
              label: '🔧 Technical Support',
              description: 'Bot issues, commands not working',
              value: 'technical',
              emoji: '🔧'
            },
            {
              label: '👤 Profile/Account',
              description: 'Profile changes, account problems',
              value: 'profile',
              emoji: '👤'
            },
            {
              label: '🚨 Report User',
              description: 'Rule violations, cheating',
              value: 'report',
              emoji: '🚨'
            },
            {
              label: '❓ General Help',
              description: 'Other questions and support',
              value: 'general',
              emoji: '❓'
            }
          ])
      );

    await interaction.reply({
      content: '🎫 **Create Support Ticket**\n\nSelect the category that matches your issue:',
      components: [row],
      ephemeral: true
    });
  }

  // Support Category Selected
  if (interaction.customId === 'support_category') {
    const category = interaction.values[0];
    
    const categoryInfo = {
      payment: {
        emoji: '💳',
        name: 'Payment Issue',
        description: 'Please provide:\n• Transaction screenshot\n• Amount paid\n• Payment method\n• Tournament name'
      },
      tournament: {
        emoji: '🎮',
        name: 'Tournament Issue',
        description: 'Please provide:\n• Tournament name/ID\n• Issue description\n• Screenshots if applicable'
      },
      technical: {
        emoji: '🔧',
        name: 'Technical Support',
        description: 'Please describe:\n• What\'s not working\n• Command you tried\n• Error messages'
      },
      profile: {
        emoji: '👤',
        name: 'Profile/Account',
        description: 'Please provide:\n• What needs changing\n• Your OTO ID\n• Current vs desired info'
      },
      report: {
        emoji: '🚨',
        name: 'Report User',
        description: 'Please provide:\n• Username to report\n• Rule violation\n• Evidence (screenshots)\n• When it happened'
      },
      general: {
        emoji: '❓',
        name: 'General Help',
        description: 'Please describe your question or issue in detail.'
      }
    };

    const info = categoryInfo[category];

    try {
      const ticketId = `SUPPORT${Date.now().toString().slice(-8)}`;
      const categoryChannel = interaction.guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
      
      const ticketChannel = await interaction.guild.channels.create({
        name: `${info.emoji}-${interaction.user.username}-${ticketId.slice(-5)}`,
        type: Discord.ChannelType.GuildText,
        parent: categoryChannel,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
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

      // Store ticket
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
        .setDescription(`Welcome <@${interaction.user.id}>!\n\n${info.description}\n\n**Our staff will respond shortly!**`)
        .setColor('#3498db')
        .addFields(
          { name: '⏱️ Response Time', value: 'Usually 5-15 minutes', inline: true },
          { name: '🆔 Ticket ID', value: `\`${ticketId}\``, inline: true },
          { name: '📂 Category', value: info.name, inline: true }
        )
        .setFooter({ text: 'Please be patient and respectful' })
        .setTimestamp();

      const row = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setCustomId(`close_support_${ticketId}`)
            .setLabel('Close Ticket')
            .setEmoji('🔒')
            .setStyle(Discord.ButtonStyle.Danger),
          new Discord.ButtonBuilder()
            .setCustomId(`solved_support_${ticketId}`)
            .setLabel('Mark Solved')
            .setEmoji('✅')
            .setStyle(Discord.ButtonStyle.Success)
        );

      await ticketChannel.send({
        content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`,
        embeds: [embed],
        components: [row]
      });

      // Auto-response timer
      const timer = setTimeout(async () => {
        try {
          const messages = await ticketChannel.messages.fetch({ limit: 10 });
          const staffReplied = messages.some(m => 
            m.member?.roles.cache.has(CONFIG.STAFF_ROLE) && 
            m.author.id !== client.user.id &&
            m.createdTimestamp > Date.now() - CONFIG.SUPPORT_WAIT_TIME
          );

          if (!staffReplied) {
            await ticketChannel.send(
              `⏳ **Please wait!**\n\nOur staff team is currently busy.\n` +
              `Your ticket is in queue and will be answered soon!\n\n` +
              `Average wait time: 10-15 minutes\n` +
              `Thank you for your patience! 🙏`
            );
          }
        } catch (err) {}
      }, CONFIG.SUPPORT_WAIT_TIME);

      dataManager.staffTicketTimers.set(ticketId, timer);

      // Notify staff
      const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT);
      await staffChannel.send(
        `🎫 **New Support Ticket**\n` +
        `Category: ${info.name}\n` +
        `User: ${interaction.user.tag}\n` +
        `Ticket: ${ticketChannel}\n` +
        `ID: \`${ticketId}\``
      );

      await interaction.update({
        content: `✅ Support ticket created!\n\nGo to ${ticketChannel} and describe your issue.`,
        components: []
      });

    } catch (error) {
      console.error('Support ticket error:', error);
      await interaction.update({
        content: '❌ Failed to create ticket. Please try again!',
        components: []
      });
    }
  }

  // Close Support Ticket
  if (interaction.customId.startsWith('close_support_')) {
    const ticketId = interaction.customId.replace('close_support_', '');
    const ticket = dataManager.tickets.get(ticketId);

    if (!ticket) {
      await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('🔒 Closing Ticket')
      .setDescription('This ticket will be deleted in **10 seconds**.\n\nClick "Reopen" to cancel.')
      .setColor('#ff0000')
      .setTimestamp();

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(`reopen_support_${ticketId}`)
          .setLabel('Reopen Ticket')
          .setEmoji('🔓')
          .setStyle(Discord.ButtonStyle.Success)
      );

    await interaction.reply({ embeds: [embed], components: [row] });

    setTimeout(async () => {
      try {
        dataManager.tickets.delete(ticketId);
        await interaction.channel.delete();
      } catch (err) {}
    }, 10000);
  }

  // Reopen Ticket
  if (interaction.customId.startsWith('reopen_support_')) {
    await interaction.update({
      content: '✅ Ticket reopened! Staff will continue to assist you.',
      embeds: [],
      components: []
    });
  }

  // Mark Solved
  if (interaction.customId.startsWith('solved_support_')) {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('✅ Issue Resolved')
      .setDescription('This issue has been marked as solved!\n\nIf you need further help, please let us know.')
      .setColor('#00ff00')
      .setFooter({ text: `Marked by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// Staff message detection - clear auto-response timer
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  // Check if in support ticket
  const ticket = Array.from(dataManager.tickets.values()).find(t => t.channelId === message.channel.id);
  if (ticket && dataManager.staffTicketTimers.has(ticket.id)) {
    clearTimeout(dataManager.staffTicketTimers.get(ticket.id));
    dataManager.staffTicketTimers.delete(ticket.id);
  }
});

// ==================== BEAT OUR PLAYER CHALLENGE ====================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_beat_player_ticket') {
    const invites = dataManager.getInvites(interaction.user.id);
    
    if (invites < CONFIG.MIN_INVITES) {
      await interaction.reply({
        content: `❌ **Beat Our Player Requirements:**\n\nYou need **${CONFIG.MIN_INVITES} invites** to participate!\n\n**Your invites:** ${invites}/${CONFIG.MIN_INVITES}\n**Needed:** ${CONFIG.MIN_INVITES - invites} more\n\nInvite friends to unlock this challenge!`,
        ephemeral: true
      });
      return;
    }

    try {
      const challengeId = `BEAT${Date.now().toString().slice(-8)}`;
      const category = interaction.guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
      
      const challengeChannel = await interaction.guild.channels.create({
        name: `⚔️-${interaction.user.username}-challenge`,
        type: Discord.ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [Discord.PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              Discord.PermissionFlagsBits.ViewChannel,
              Discord.PermissionFlagsBits.SendMessages,
              Discord.PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: CONFIG.STAFF_ROLE,
            allow: [
              Discord.PermissionFlagsBits.ViewChannel,
              Discord.PermissionFlagsBits.SendMessages,
              Discord.PermissionFlagsBits.ManageMessages,
              Discord.PermissionFlagsBits.ManageChannels
            ]
          }
        ]
      });

      // Store challenge
      dataManager.beatPlayerChallenges.set(challengeId, {
        id: challengeId,
        userId: interaction.user.id,
        channelId: challengeChannel.id,
        createdAt: new Date(),
        attempts: 0,
        maxAttempts: 2,
        status: 'pending'
      });

      const embed = new Discord.EmbedBuilder()
        .setTitle('⚔️ BEAT OUR PLAYER CHALLENGE')
        .setDescription(`<@${interaction.user.id}> Welcome to the ultimate challenge!`)
        .setColor('#ff0000')
        .addFields(
          { name: '🎯 Challenge', value: 'Beat our best player in 1v1', inline: true },
          { name: '🎁 Reward', value: 'FREE Squad Entry', inline: true },
          { name: '🔢 Attempts', value: '2 chances', inline: true },
          {
            name: '📋 Rules',
            value: '• Best of 2 matches\n• Need to win 2-0 or 2-1\n• Fair play required\n• Screenshots mandatory',
            inline: false
          },
          {
            name: '🏆 Prize',
            value: 'If you WIN:\n✅ FREE entry to next Squad tournament\n✅ Special winner role\n✅ Bragging rights!',
            inline: false
          },
          {
            name: '⏳ Next Steps',
            value: 'Staff will:\n1. Assign our best player\n2. Create private room\n3. Send details here\n4. Watch the match live!',
            inline: false
          }
        )
        .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
        .setFooter({ text: 'Good luck! You\'ll need it! 🔥' })
        .setTimestamp();

      await challengeChannel.send({
        content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`,
        embeds: [embed]
      });

      // Notify staff
      const staffChannel = await client.channels.fetch(CONFIG.STAFF_CHAT);
      await staffChannel.send(
        `⚔️ **New Beat Our Player Challenge**\n` +
        `Player: ${interaction.user.tag}\n` +
        `Challenge: ${challengeChannel}\n` +
        `ID: \`${challengeId}\`\n\n` +
        `Assign our best player and create the match!`
      );

      await interaction.reply({
        content: `✅ Challenge accepted!\n\n${challengeChannel} - Wait for staff to setup the match!`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Beat player error:', error);
      await interaction.reply({
        content: '❌ Failed to create challenge. Please try again!',
        ephemeral: true
      });
    }
  }
});

// ==================== STAFF MANAGEMENT COMMANDS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // Add Staff
  if (command === '!addstaff') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Usage: `!addstaff @user`');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.roles.add(CONFIG.STAFF_ROLE);
      
      const welcomeMessages = [
        'Welcome to the team! 💪 Tumhe hardwork karna hai!',
        'New staff! 🌟 Show your dedication!',
        'Welcome aboard! 🚀 Let\'s make OTO better!',
        'Great addition! ⚡ Ready to help?',
        'Welcome! 🎯 Time to shine!',
        'New team member! 🔥 Give your best!',
        'Join the family! 💎 Work hard!',
        'Welcome warrior! ⚔️ Dedication needed!',
        'Staff team! 🏆 Prove yourself!',
        'Welcome hero! 🦸 Make us proud!'
      ];

      const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

      const embed = new Discord.EmbedBuilder()
        .setTitle('👨‍💼 New Staff Member!')
        .setDescription(`${user} joined the staff team!`)
        .setColor('#00ff00')
        .addFields(
          { name: '💬 Message', value: welcomeMsg, inline: false },
          { name: '📋 Responsibilities', value: '• Help users\n• Verify payments\n• Manage tournaments\n• Maintain rules\n• Be active!', inline: false }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      // DM welcome message
      try {
        await user.send(
          `🎉 **Congratulations!**\n\n` +
          `You've been added to the OTO Staff Team!\n\n` +
          `${welcomeMsg}\n\n` +
          `**Your Duties:**\n` +
          `• Help users in tickets\n` +
          `• Verify tournament payments\n` +
          `• Manage matches & tournaments\n` +
          `• Keep server safe & fun\n\n` +
          `Good luck! 💪`
        );
      } catch (err) {}

    } catch (error) {
      await message.reply(`❌ Failed: ${error.message}`);
    }
  }

  // Remove Staff
  if (command === '!removestaff') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Usage: `!removestaff @user`');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.roles.remove(CONFIG.STAFF_ROLE);
      await message.reply(`✅ Removed staff role from ${user.tag}`);
    } catch (error) {
      await message.reply(`❌ Failed: ${error.message}`);
    }
  }

  // Ban Command
  if (command === '!ban') {
    const user = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';
    
    if (!user) {
      await message.reply('❌ Usage: `!ban @user <reason>`');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.ban({ reason });
      
      const embed = new Discord.EmbedBuilder()
        .setTitle('🔨 User Banned')
        .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}\n**By:** ${message.author.tag}`)
        .setColor('#ff0000')
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed: ${error.message}`);
    }
  }

  // Timeout Command
  if (command === '!timeout') {
    const user = message.mentions.users.first();
    const duration = parseInt(args[2]) || 10;
    const reason = args.slice(3).join(' ') || 'No reason provided';
    
    if (!user) {
      await message.reply('❌ Usage: `!timeout @user <minutes> <reason>`');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.timeout(duration * 60000, reason);
      await message.reply(`✅ ${user.tag} timed out for ${duration} minutes`);
    } catch (error) {
      await message.reply(`❌ Failed: ${error.message}`);
    }
  }

  // Untimeout Command
  if (command === '!untimeout') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Usage: `!untimeout @user`');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.timeout(null);
      await message.reply(`✅ Timeout removed from ${user.tag}`);
    } catch (error) {
      await message.reply(`❌ Failed: ${error.message}`);
    }
  }

  // Announcement Command
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
    await announceChannel.send({
      content: '@everyone',
      embeds: [embed]
    });

    await message.reply('✅ Announcement posted!');
  }
});

// ==================== BOT READY EVENT ====================
client.once('ready', async () => {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        🎮 OTO TOURNAMENT BOT - FULLY LOADED          ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Bot: ${client.user.tag}`);
  console.log(`✅ Servers: ${client.guilds.cache.size}`);
  console.log(`✅ Users: ${client.users.cache.size}`);
  console.log('');
  console.log('🎯 ========== CORE FEATURES ==========');
  console.log('   ✅ Profile System (DM-based with gender detection)');
  console.log('   ✅ Invite Tracking (10 invites = FREE entry)');
  console.log('   ✅ Welcome Messages (50+ variations)');
  console.log('   ✅ Enhanced Auto-Responses (Context-aware)');
  console.log('   ✅ No Reply System (2-min auto-response)');
  console.log('   ✅ Bad Word Filter (Auto-delete + warnings)');
  console.log('   ✅ Spam Detection (Auto-timeout)');
  console.log('');
  console.log('🎫 ========== TICKET SYSTEM ==========');
  console.log('   ✅ Support tickets (6 categories)');
  console.log('   ✅ Registration tickets (Tournament)');
  console.log('   ✅ Auto-close with reopen option');
  console.log('   ✅ Staff auto-response (30 sec)');
  console.log('   ✅ Payment verification');
  console.log('');
  console.log('🏆 ========== TOURNAMENT SYSTEM ==========');
  console.log('   ✅ Template-based creation');
  console.log('   ✅ Draft → Registration → Live → Completed');
  console.log('   ✅ Auto slot updates');
  console.log('   ✅ Private lobby channels');
  console.log('   ✅ Room details distribution (DM + Lobby)');
  console.log('   ✅ Winner declaration');
  console.log('   ✅ Prize distribution tracking');
  console.log('   ✅ Multiple game support');
  console.log('');
  console.log('📊 ========== LEADERBOARDS ==========');
  console.log('   ✅ Invite leaderboard (auto-update)');
  console.log('   ✅ Tournament leaderboard (per game)');
  console.log('   ✅ Most active players');
  console.log('   ✅ Top earners tracking');
  console.log('');
  console.log('⚔️ ========== SPECIAL FEATURES ==========');
  console.log('   ✅ Beat Our Player Challenge');
  console.log('   ✅ 10 invites = FREE tournament access');
  console.log('   ✅ Gender-based greetings');
  console.log('   ✅ Profile display channel');
  console.log('   ✅ Activity tracking');
  console.log('');
  console.log('🛡️ ========== MODERATION ==========');
  console.log('   ✅ Bad word auto-delete');
  console.log('   ✅ 3-strike warning system');
  console.log('   ✅ Auto-timeout after warnings');
  console.log('   ✅ Spam detection (5 msgs/5 sec)');
  console.log('   ✅ Staff protection');
  console.log('');
  console.log('📋 ========== COMMANDS ==========');
  console.log('');
  console.log('   👥 USER COMMANDS:');
  console.log('      -i          Check invites');
  console.log('      -profile    View profile');
  console.log('      -help       Bot help');
  console.log('      Hi/Hello    Greeting responses');
  console.log('');
  console.log('   🎮 TOURNAMENT (Staff):');
  console.log('      !ct                Create tournament');
  console.log('      !startroom         Send room details');
  console.log('      !winners           Declare winners');
  console.log('      !endtournament     End tournament');
  console.log('      !tournaments       List active');
  console.log('      !leaderboard       Show leaderboard');
  console.log('');
  console.log('   👨‍💼 STAFF MANAGEMENT:');
  console.log('      !addstaff          Add staff role');
  console.log('      !removestaff       Remove staff');
  console.log('      !ban               Ban user');
  console.log('      !timeout           Timeout user');
  console.log('      !untimeout         Remove timeout');
  console.log('      !announce          Post announcement');
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        ✅ ALL SYSTEMS OPERATIONAL!                    ║');
  console.log('║        🚀 OTO TOURNAMENT BOT IS LIVE!                ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  // Set dynamic status
  client.user.setPresence({
    activities: [{ name: '🎮 OTO Tournaments | Type -help', type: Discord.ActivityType.Playing }],
    status: 'online'
  });

  // Initialize invite cache
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      invites.forEach(inv => {
        if (inv.inviter) {
          dataManager.inviteCache.set(inv.code, inv.uses);
        }
      });
      console.log(`✅ Loaded ${invites.size} invites for: ${guild.name}`);
    } catch (err) {
      console.log(`⚠️ Could not fetch invites for ${guild.name}`);
    }
  }

  console.log('');
  console.log('🎯 Bot is ready to manage tournaments!');
  console.log('💡 All features working perfectly!');
  console.log('');

  // Send existing member profiles to profile channel
  setTimeout(async () => {
    try {
      // Send persistent help message to How to Join
      const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
      
      const helpEmbed = new Discord.EmbedBuilder()
        .setTitle('🎮 OTO Tournament Guide')
        .setDescription('**Complete guide to join and win!**')
        .setColor('#3498db')
        .addFields(
          { name: '1️⃣ Create Profile', value: 'Check DMs from bot\nReply with your details', inline: false },
          { name: '2️⃣ Invite Friends', value: `Invite ${CONFIG.MIN_INVITES} friends = FREE entry!\nType \`-i\` to track`, inline: false },
          { name: '3️⃣ Join Tournament', value: 'Go to <#' + CONFIG.TOURNAMENT_SCHEDULE + '>\nClick JOIN button', inline: false },
          { name: '4️⃣ Win Prizes', value: 'Play fair, win big! 🏆\nGet paid instantly! 💰', inline: false }
        )
        .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
        .setFooter({ text: 'Need help? Create a support ticket!' });

      const row = new Discord.ActionRowBuilder()
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

      await howToJoinChannel.send({ embeds: [helpEmbed], components: [row] });
      console.log('✅ Help message posted to How to Join channel');

    } catch (err) {
      console.log('⚠️ Could not post help message:', err.message);
    }
  }, 5000);
});

// Rotating status messages
const statuses = [
  '🎮 OTO Tournaments | Type -help',
  '🏆 Join tournaments & win!',
  '💰 Real money prizes daily!',
  '🔥 Invite 10 = FREE entry!',
  '⚡ Active tournaments now!',
  '🎯 Free Fire & Minecraft!',
  '💎 Big prizes waiting!',
  '👥 Growing gaming community!'
];

let statusIndex = 0;
setInterval(() => {
  client.user.setPresence({
    activities: [{ name: statuses[statusIndex], type: Discord.ActivityType.Playing }],
    status: 'online'
  });
  statusIndex = (statusIndex + 1) % statuses.length;
}, 300000); // Change every 5 minutes

// ==================== SEND EXISTING PROFILES TO PROFILE CHANNEL ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) return;

  if (message.content.toLowerCase() === '!syncprofiles') {
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
            { name: '🏆 Tournaments', value: `${profile.tournaments}`, inline: true },
            { name: '🥇 Wins', value: `${profile.wins}`, inline: true },
            { name: '💰 Earnings', value: `₹${profile.totalEarnings}`, inline: true },
            { name: '📊 Activity', value: `${profile.activity} msgs`, inline: true },
            { name: '✅ Status', value: invites >= CONFIG.MIN_INVITES ? 'FREE Entry' : 'Paid Entry', inline: true }
          )
          .setThumbnail(user.displayAvatarURL())
          .setFooter({ text: `Joined: ${profile.createdAt.toLocaleDateString()}` })
          .setTimestamp();

        await profileChannel.send({ embeds: [embed] });
        count++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit protection
      } catch (err) {
        console.log(`Could not sync profile for ${userId}`);
      }
    }

    await message.reply(`✅ Synced ${count} profiles to profile channel!`);
  }
});

// ==================== MANUAL TOURNAMENT CREATION ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  if (message.content.toLowerCase().startsWith('!tournament ')) {
    const parts = message.content.slice(12).split('|').map(s => s.trim());
    
    if (parts.length < 7) {
      await message.reply(
        '❌ **Manual Tournament Creation**\n\n' +
        'Format: `!tournament <title> | <game> | <mode> | <prize> | <entry> | <slots> | <time> | [map]`\n\n' +
        'Example:\n' +
        '```!tournament PUBG Championship | PUBG | Squad | ₹5000 | ₹100 | 25 | 10:00 PM | Erangel```'
      );
      return;
    }

    const [title, game, mode, prize, entry, slots, time, map] = parts;
    const tournamentId = `TOUR${Date.now().toString().slice(-10)}`;

    // Calculate prize distribution (50%, 30%, 20%)
    const totalPrize = parseInt(prize.replace(/[^0-9]/g, ''));
    const prizeDistribution = {
      first: Math.floor(totalPrize * 0.5),
      second: Math.floor(totalPrize * 0.3),
      third: Math.floor(totalPrize * 0.2)
    };

    const tournament = {
      id: tournamentId,
      title: title,
      game: game,
      mode: mode,
      prize: prize,
      prizeDistribution: prizeDistribution,
      entry: entry,
      maxSlots: parseInt(slots),
      time: time,
      map: map || 'TBA',
      image: game.toLowerCase().includes('fire') ? 'https://i.ibb.co/8XQkZhJ/freefire.png' :
             game.toLowerCase().includes('minecraft') ? 'https://i.ibb.co/VgTY8Lq/minecraft.png' :
             'https://i.ibb.co/8XQkZhJ/freefire.png',
      createdBy: message.author.id,
      createdAt: new Date(),
      status: 'draft',
      players: new Map(),
      confirmedPlayers: new Map(),
      roomDetails: null,
      lobbyChannelId: null,
      slotsFilled: 0
    };

    dataManager.tournaments.set(tournamentId, tournament);

    const confirmEmbed = new Discord.EmbedBuilder()
      .setTitle('✅ Custom Tournament Created - DRAFT')
      .setDescription(`**${tournament.title}** is ready!`)
      .setColor('#ffaa00')
      .addFields(
        { name: '🆔 ID', value: `\`${tournamentId}\``, inline: true },
        { name: '🎮 Game', value: tournament.game, inline: true },
        { name: '🎯 Mode', value: tournament.mode, inline: true },
        { name: '💰 Prize', value: tournament.prize, inline: true },
        { name: '🎫 Entry', value: tournament.entry, inline: true },
        { name: '📊 Slots', value: `${tournament.maxSlots}`, inline: true },
        { name: '⏰ Time', value: tournament.time, inline: true },
        { name: '🗺️ Map', value: tournament.map, inline: true },
        { name: '📈 Status', value: '📝 Draft', inline: true },
        {
          name: '🏆 Prize Distribution',
          value: `🥇 1st: ₹${tournament.prizeDistribution.first}\n🥈 2nd: ₹${tournament.prizeDistribution.second}\n🥉 3rd: ₹${tournament.prizeDistribution.third}`,
          inline: false
        }
      )
      .setFooter({ text: 'Use buttons to publish or delete' })
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
          .setLabel('Delete')
          .setEmoji('🗑️')
          .setStyle(Discord.ButtonStyle.Danger)
      );

    await message.reply({ embeds: [confirmEmbed], components: [row] });
  }
});

// ==================== CLEAR WARNINGS COMMAND ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!clearwarnings') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Usage: `!clearwarnings @user`');
      return;
    }

    dataManager.clearWarnings(user.id);
    await message.reply(`✅ All warnings cleared for ${user.tag}!`);
  }

  if (command === '!warnings') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Usage: `!warnings @user`');
      return;
    }

    const warnings = dataManager.getWarnings(user.id);
    
    if (warnings.length === 0) {
      await message.reply(`✅ ${user.tag} has no warnings!`);
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle(`⚠️ Warnings for ${user.tag}`)
      .setDescription(`Total: **${warnings.length}** warning${warnings.length > 1 ? 's' : ''}`)
      .setColor('#ffaa00')
      .setThumbnail(user.displayAvatarURL());

    warnings.forEach((warn, index) => {
      embed.addFields({
        name: `Warning ${index + 1} - ${warn.id}`,
        value: `**Reason:** ${warn.reason}\n**Date:** <t:${Math.floor(warn.date.getTime()/1000)}:R>`,
        inline: false
      });
    });

    await message.reply({ embeds: [embed] });
  }
});

// ==================== BEAT OUR PLAYER COMMAND (Staff) ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  if (message.content.toLowerCase() === '!beatplayer') {
    const challengeId = `BEAT${Date.now().toString().slice(-8)}`;
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('⚔️ BEAT OUR PLAYER - SPECIAL CHALLENGE!')
      .setDescription('**Think you can defeat our best player? Prove it!**')
      .setColor('#ff0000')
      .addFields(
        { name: '🎯 Challenge', value: 'Beat our champion in 1v1', inline: true },
        { name: '🎁 Reward', value: 'FREE Squad Entry', inline: true },
        { name: '🔢 Attempts', value: '2 chances', inline: true },
        { name: '📋 Requirements', value: `✅ ${CONFIG.MIN_INVITES} invites completed\n✅ Active profile\n✅ Good standing`, inline: false },
        { name: '🏆 If You Win', value: '• FREE entry to next Squad tournament\n• Special winner role\n• Hall of fame mention\n• Bragging rights forever!', inline: false },
        { name: '⚔️ Rules', value: '• Best of 2 matches (need 2-0 or 2-1)\n• Fair play required\n• Screenshots mandatory\n• No exploits/cheats\n• Respectful behavior', inline: false }
      )
      .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
      .setFooter({ text: 'Click button to accept challenge!' })
      .setTimestamp();

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId('create_beat_player_ticket')
          .setLabel('ACCEPT CHALLENGE')
          .setEmoji('⚔️')
          .setStyle(Discord.ButtonStyle.Danger)
      );

    const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
    await announceChannel.send({
      content: '@everyone\n\n⚔️ **SPECIAL CHALLENGE ALERT!** ⚔️',
      embeds: [embed],
      components: [row]
    });

    const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    await generalChannel.send({
      content: '⚔️ **BEAT OUR PLAYER CHALLENGE!** ⚔️\n\nCheck announcements to participate!',
      embeds: [embed],
      components: [row]
    });

    await message.reply('✅ Beat Our Player challenge posted!');
  }
});

// ==================== QUICK STATS COMMAND ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  if (message.content.toLowerCase() === '!stats') {
    const totalProfiles = dataManager.userProfiles.size;
    const totalInvites = Array.from(dataManager.userInvites.values()).reduce((a, b) => a + b, 0);
    const freeEntryUsers = Array.from(dataManager.userInvites.values()).filter(i => i >= CONFIG.MIN_INVITES).length;
    const activeTournaments = dataManager.tournaments.size;
    const totalTickets = dataManager.tickets.size;

    const embed = new Discord.EmbedBuilder()
      .setTitle('📊 OTO Bot Statistics')
      .setDescription('**Current server statistics**')
      .setColor('#3498db')
      .addFields(
        { name: '👥 Total Profiles', value: `${totalProfiles}`, inline: true },
        { name: '🔗 Total Invites', value: `${totalInvites}`, inline: true },
        { name: '🎁 FREE Entry Users', value: `${freeEntryUsers}`, inline: true },
        { name: '🎮 Active Tournaments', value: `${activeTournaments}`, inline: true },
        { name: '🎫 Open Tickets', value: `${totalTickets}`, inline: true },
        { name: '📊 Server Members', value: `${message.guild.memberCount}`, inline: true }
      )
      .setFooter({ text: 'OTO Tournaments - Live Statistics' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

// ==================== ERROR HANDLING ====================
client.on('error', err => {
  console.error('╔═══════════════════════════════════════╗');
  console.error('║         ❌ CLIENT ERROR               ║');
  console.error('╚═══════════════════════════════════════╝');
  console.error(err);
});

client.on('warn', warn => {
  console.warn('⚠️ WARNING:', warn);
});

process.on('unhandledRejection', err => {
  console.error('╔═══════════════════════════════════════╗');
  console.error('║      ❌ UNHANDLED REJECTION           ║');
  console.error('╚═══════════════════════════════════════╝');
  console.error(err);
});

process.on('uncaughtException', err => {
  console.error('╔═══════════════════════════════════════╗');
  console.error('║      ❌ UNCAUGHT EXCEPTION            ║');
  console.error('╚═══════════════════════════════════════╝');
  console.error(err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('🛑 Received SIGTERM, shutting down...');
  client.destroy();
  process.exit(0);
});

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║         ✅ BOT LOGIN SUCCESSFUL!                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');
  })
  .catch(err => {
    console.error('');
    console.error('╔═══════════════════════════════════════════════════════╗');
    console.error('║         ❌ LOGIN FAILED!                              ║');
    console.error('╚═══════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', err.message);
    console.error('');
    console.error('Please check:');
    console.error('1. BOT_TOKEN is correct in .env file');
    console.error('2. Bot has proper permissions');
    console.error('3. Internet connection is stable');
    console.error('4. Discord API is operational');
    console.error('');
    process.exit(1);
  });

// ==================== EXPORTS ====================
module.exports = {
  client,
  dataManager,
  CONFIG
};
