// ==================== BOT READY - ENHANCED ====================
client.once('ready', async () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          🎮 OTO TOURNAMENT BOT - FULLY LOADED           ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Bot: ${client.user.tag}`);
  console.log(`✅ Servers: ${client.guilds.cache.size}`);
  console.log(`✅ Users: ${client.users.cache.size}`);
  console.log('');
  console.log('🎯 ========== CORE FEATURES ==========');
  console.log('   ✅ Profile System (DM-based with gender detection)');
  console.log('   ✅ Invite Tracking (10 invites = FREE entry)');
  console.log('   ✅ Welcome Messages (50+ variations, context-aware)');
  console.log('   ✅ Enhanced Auto-Responses (Smart context detection)');
  console.log('   ✅ No Reply System (2-min auto-response)');
  console.log('   ✅ Bad Word Filter (Auto-delete + warnings)');
  console.log('   ✅ Spam Detection (Auto-timeout system)');
  console.log('');
  console.log('🎫 ========== TICKET SYSTEM ==========');
  console.log('   ✅ Category-based tickets (6 categories)');
  console.log('   ✅ Dropdown menu selection');
  console.log('   ✅ Auto-close (10 min with reopen option)');
  console.log('   ✅ Delete/Claim/Add user options');
  console.log('   ✅ Transcript saving');
  console.log('   ✅ Staff notifications');
  console.log('');
  console.log('🏆 ========== TOURNAMENT SYSTEM ==========');
  console.log('   ✅ Dropdown creation with templates');
  console.log('   ✅ Multi-channel auto-posting');
  console.log('   ✅ Registration tickets (Free/Paid)');
  console.log('   ✅ Payment verification system');
  console.log('   ✅ Room ID/Password distribution (protected)');
  console.log('   ✅ Winner announcement (50%/30%/20% prizes)');
  console.log('   ✅ Tournament management (edit/delete/start)');
  console.log('   ✅ Auto slot updates');
  console.log('   ✅ Beat Our Player challenges');
  console.log('');
  console.log('📊 ========== LEADERBOARD SYSTEMS ==========');
  console.log('   ✅ Invite leaderboard (auto-update)');
  console.log('   ✅ Tournament leaderboard (per game)');
  console.log('   ✅ Most played tracking');
  console.log('   ✅ Level system with XP');
  console.log('   ✅ Win/loss statistics');
  console.log('');
  console.log('🛡️ ========== MODERATION ==========');
  console.log('   ✅ Bad word filter (auto-delete)');
  console.log('   ✅ Warning system (3 strikes)');
  console.log('   ✅ Auto-timeout after warnings');
  console.log('   ✅ Spam detection');
  console.log('   ✅ Anti-link system');
  console.log('   ✅ Mass mention protection');
  console.log('   ✅ Room details protection');
  console.log('');
  console.log('🎮 ========== SERVER MANAGEMENT ==========');
  console.log('   ✅ Lock/Unlock channels');
  console.log('   ✅ Slowmode control');
  console.log('   ✅ Message purge/clear');
  console.log('   ✅ Kick/Ban/Timeout users');
  console.log('   ✅ Warning management');
  console.log('   ✅ Role management');
  console.log('   ✅ Server statistics');
  console.log('   ✅ Reaction roles');
  console.log('');
  console.log('🎉 ========== EXTRA FEATURES ==========');
  console.log('   ✅ Level system with XP rewards');
  console.log('   ✅ Bump reminder system');
  console.log('   ✅ Birthday announcements');
  console.log('   ✅ Suggestion system');
  console.log('   ✅ Poll creation');
  console.log('   ✅ Backup/Restore system');
  console.log('   ✅ Announcement system');
  console.log('');
  console.log('📋 ========== STAFF COMMANDS ==========');
  console.log('');
  console.log('   🎮 TOURNAMENT MANAGEMENT:');
  console.log('      !ct / !createtournament - Create with dropdown');
  console.log('      !startroom <ID> <roomID> <pass> - Start & send details');
  console.log('      !winners <ID> @1st @2nd @3rd - Declare winners');
  console.log('      !endtournament <ID> - End tournament');
  console.log('      !deletetournament <ID> - Delete tournament');
  console.log('      !tournaments - List active');
  console.log('      !leaderboard <game> - Show leaderboard');
  console.log('      !beatplayer - Create challenge');
  console.log('');
  console.log('   👮 MODERATION:');
  console.log('      !ban @user <reason> - Ban user');
  console.log('      !kick @user <reason> - Kick user');
  console.log('      !timeout @user <min> <reason> - Timeout');
  console.log('      !untimeout @user - Remove timeout');
  console.log('      !warn @user <reason> - Warn user');
  console.log('      !warnings @user - Check warnings');
  console.log('      !clearwarnings @user - Clear warnings');
  console.log('');
  console.log('   🔧 SERVER MANAGEMENT:');
  console.log('      !lock [#channel] - Lock channel');
  console.log('      !unlock [#channel] - Unlock channel');
  console.log('      !slowmode <seconds> - Set slowmode');
  console.log('      !clear <amount> - Delete messages');
  console.log('      !serverstats - Server statistics');
  console.log('      !roleinfo @role - Role information');
  console.log('      !roleall @role - Give role to everyone');
  console.log('      !removeroleall @role - Remove from everyone');
  console.log('');
  console.log('   👥 STAFF MANAGEMENT:');
  console.log('      !addstaff @user - Add staff role');
  console.log('      !removestaff @user - Remove staff role');
  console.log('');
  console.log('   📢 ANNOUNCEMENTS:');
  console.log('      !announce <message> - Post announcement');
  console.log('      !poll Question | Opt1 | Opt2 - Create poll');
  console.log('');
  console.log('   🎭 REACTION ROLES:');
  console.log('      !reactionrole <msgID> <emoji> @role - Setup');
  console.log('');
  console.log('   💾 BACKUP (Owner Only):');
  console.log('      !backup - Create backup');
  console.log('      !restore - Restore from backup');
  console.log('');
  console.log('💬 ========== USER COMMANDS ==========');
  console.log('   -i / !invites - Check invites');
  console.log('   -profile / !profile - View profile');
  console.log('   -level / !level - Check level/XP');
  console.log('   -help / !help - Bot help');
  console.log('   !suggest <text> - Submit suggestion');
  console.log('   !setbirthday DD-MM - Set birthday');
  console.log('   Hi/Hello/Bhai - Greeting responses');
  console.log('   Mention bot - Quick help');
  console.log('');
  console.log('🤖 ========== AUTO-RESPONSES ==========');
  console.log('   • Context-aware tournament help');
  console.log('   • Payment assistance');
  console.log('   • Invite guidance');
  console.log('   • Profile help');
  console.log('   • General support');
  console.log('   • Staff tag responses');
  console.log('   • 2-min no-reply system');
  console.log('');
  console.log('🔒 ========== AUTO-MODERATION ==========');
  console.log('   • Bad word detection & deletion');
  console.log('   • 3-strike warning system');
  console.log('   • Spam detection (5 msgs/5 sec)');
  console.log('   • Anti-link system');
  console.log('   • Mass mention protection (5+)');
  console.log('   • Room detail protection');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          ✅ ALL SYSTEMS OPERATIONAL!');
  console.log('          🚀 OTO TOURNAMENT BOT IS LIVE!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Set dynamic status
  client.user.setPresence({
    activities: [{ name: '🏆 OTO Tournaments | Say Hi!', type: Discord.ActivityType.Playing }],
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

  // Setup persistent messages after 5 seconds
  setTimeout(() => {
    setupPersistentMessages();
  }, 5000);

  console.log('');
  console.log('🎯 Bot is ready to manage tournaments!');
  console.log('💡 All features are working perfectly!');
  console.log('📞 Need help? Check the documentation above!');
  console.log('');
});

// Dynamic status rotation
const statuses = [
  '🏆 OTO Tournaments | Say Hi!',
  '🎮 Join tournaments & win!',
  '💰 Real money prizes daily!',
  '🔥 Invite 10 friends = FREE!',
  '⚡ Type -help for commands!',
  '🎯 Free Fire & Minecraft!',
  '💎 Active tournaments now!',
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

// ==================== ERROR HANDLING ====================
client.on('error', err => {
  console.error('═══════════════════════════════════');
  console.error('❌ CLIENT ERROR:', err);
  console.error('═══════════════════════════════════');
});

client.on('warn', warn => {
  console.warn('⚠️ WARNING:', warn);
});

process.on('unhandledRejection', err => {
  console.error('═══════════════════════════════════');
  console.error('❌ UNHANDLED REJECTION:', err);
  console.error('═══════════════════════════════════');
});

process.on('uncaughtException', err => {
  console.error('═══════════════════════════════════');
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  console.error('═══════════════════════════════════');
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
    console.log('═══════════════════════════════════════════');
    console.log('   ✅ BOT LOGIN SUCCESSFUL!');
    console.log('═══════════════════════════════════════════');
    console.log('');
  })
  .catch(err => {
    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('❌ LOGIN FAILED!');
    console.error('Error:', err.message);
    console.error('═══════════════════════════════════════════');
    console.error('');
    console.error('Please check:');
    console.error('1. BOT_TOKEN is correct in .env file');
    console.error('2. Bot has proper permissions');
    console.error('3. Internet connection is stable');
    console.error('');
    process.exit(1);
  });

// ==================== EXPORTS ====================
module.exports = {
  client,
  dataManager,
  CONFIG,
  ENHANCED_AUTO_RESPONSES,
  userLevels,
  reactionRoles,
  birthdays
};// ==================== REACTION ROLES SYSTEM ====================
const reactionRoles = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // Setup Reaction Roles
  if (command === '!reactionrole') {
    const messageId = args[1];
    const emoji = args[2];
    const role = message.mentions.roles.first();

    if (!messageId || !emoji || !role) {
      await message.reply('❌ Usage: `!reactionrole <messageID> <emoji> @role`');
      return;
    }

    try {
      const targetChannel = message.channel;
      const targetMessage = await targetChannel.messages.fetch(messageId);
      
      await targetMessage.react(emoji);
      
      reactionRoles.set(`${messageId}_${emoji}`, role.id);
      
      await message.reply(`✅ Reaction role setup!\n\nReact with ${emoji} on that message to get ${role}!`);
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }
});

// Handle Reaction Role Add
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  // Fetch partial reactions
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      return;
    }
  }

  const key = `${reaction.message.id}_${reaction.emoji.name}`;
  const roleId = reactionRoles.get(key);

  if (roleId) {
    try {
      const member = await reaction.message.guild.members.fetch(user.id);
      await member.roles.add(roleId);
      
      try {
        await user.send(`✅ You received the <@&${roleId}> role in ${reaction.message.guild.name}!`);
      } catch (err) {
        // DMs disabled
      }
    } catch (err) {
      console.error('Role add error:', err);
    }
  }
});

// Handle Reaction Role Remove
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      return;
    }
  }

  const key = `${reaction.message.id}_${reaction.emoji.name}`;
  const roleId = reactionRoles.get(key);

  if (roleId) {
    try {
      const member = await reaction.message.guild.members.fetch(user.id);
      await member.roles.remove(roleId);
    } catch (err) {
      console.error('Role remove error:', err);
    }
  }
});

// ==================== AUTO-MOD ANTI-LINK SYSTEM ====================
const antiLinkSettings = {
  enabled: true,
  whitelistedChannels: [CONFIG.STAFF_TOOLS, CONFIG.STAFF_CHAT],
  allowedDomains: ['discord.gg', 'discord.com']
};

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;
  if (antiLinkSettings.whitelistedChannels.includes(message.channel.id)) return;

  const linkRegex = /(https?:\/\/[^\s]+)/gi;
  const links = message.content.match(linkRegex);

  if (links && antiLinkSettings.enabled) {
    const hasDisallowedLink = links.some(link => {
      return !antiLinkSettings.allowedDomains.some(domain => link.includes(domain));
    });

    if (hasDisallowedLink) {
      try {
        await message.delete();
        
        const warning = await message.channel.send(
          `⚠️ <@${message.author.id}> Links are not allowed in this channel!\n` +
          `**Warning:** Repeated violations will result in timeout.`
        );

        setTimeout(() => warning.delete().catch(() => {}), 10000);

        const warnings = dataManager.addWarning(message.author.id, 'Posted unauthorized link');
        
        if (warnings >= 3) {
          await message.member.timeout(300000, 'Multiple link posting violations');
        }
      } catch (err) {
        console.error('Anti-link error:', err);
      }
    }
  }
});

// ==================== AUTO-MOD ANTI-SPAM MENTIONS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const mentionCount = message.mentions.users.size + message.mentions.roles.size;

  if (mentionCount >= 5) {
    try {
      await message.delete();
      await message.member.timeout(300000, 'Mass mention spam');
      
      const embed = new Discord.EmbedBuilder()
        .setTitle('🚨 Auto-Moderation Action')
        .setDescription(`**User:** ${message.author.tag}\n**Action:** 5-minute timeout\n**Reason:** Mass mention spam (${mentionCount} mentions)`)
        .setColor('#ff0000')
        .setTimestamp();

      const staffChat = await message.client.channels.fetch(CONFIG.STAFF_CHAT);
      await staffChat.send({ embeds: [embed] });

    } catch (err) {
      console.error('Anti-spam error:', err);
    }
  }
});

// ==================== WELCOME/GOODBYE CHANNEL SYSTEM ====================
const welcomeSettings = {
  channelId: CONFIG.GENERAL_CHAT,
  enabled: true
};

// This is already handled in the main member join event, but here's an enhanced version

// ==================== AUTO-ROLE ON JOIN ====================
client.on('guildMemberAdd', async (member) => {
  // Auto-assign member role after X seconds
  setTimeout(async () => {
    try {
      // This would be your default member role
      // await member.roles.add('DEFAULT_MEMBER_ROLE_ID');
    } catch (err) {
      console.error('Auto-role error:', err);
    }
  }, 5000);
});

// ==================== LEVEL SYSTEM (Simple) ====================
const userLevels = new Map();

function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.channel.id === CONFIG.STAFF_TOOLS) return;

  const userId = message.author.id;
  const userData = userLevels.get(userId) || { xp: 0, level: 0, lastMessage: 0 };

  // XP cooldown (1 minute)
  if (Date.now() - userData.lastMessage < 60000) return;

  // Random XP between 15-25
  const xpGain = Math.floor(Math.random() * 11) + 15;
  userData.xp += xpGain;
  userData.lastMessage = Date.now();

  const newLevel = calculateLevel(userData.xp);
  
  if (newLevel > userData.level) {
    userData.level = newLevel;
    userLevels.set(userId, userData);

    // Level up message
    const embed = new Discord.EmbedBuilder()
      .setTitle('🎉 Level Up!')
      .setDescription(`<@${userId}> just reached **Level ${newLevel}**!`)
      .setColor('#ffaa00')
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: '📊 Total XP', value: `${userData.xp}`, inline: true },
        { name: '🆙 Level', value: `${newLevel}`, inline: true }
      )
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });

    // Level rewards
    if (newLevel === 5) {
      try {
        await message.member.roles.add(CONFIG.PLAYER_ROLE);
        await message.reply('🎁 Level 5 reward: PLAYER role unlocked!');
      } catch (err) {}
    }
  } else {
    userLevels.set(userId, userData);
  }
});

// Check level command
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.content.toLowerCase() === '-level' || message.content.toLowerCase() === '!level') {
    const userId = message.author.id;
    const userData = userLevels.get(userId) || { xp: 0, level: 0 };
    const nextLevelXP = Math.pow((userData.level + 1) / 0.1, 2);
    
    const embed = new Discord.EmbedBuilder()
      .setTitle(`📊 Level Stats - ${message.author.username}`)
      .setThumbnail(message.author.displayAvatarURL())
      .setColor('#3498db')
      .addFields(
        { name: '🆙 Level', value: `${userData.level}`, inline: true },
        { name: '⭐ XP', value: `${userData.xp}`, inline: true },
        { name: '🎯 Next Level', value: `${Math.floor(nextLevelXP - userData.xp)} XP needed`, inline: true }
      )
      .setFooter({ text: 'Keep chatting to level up!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
});

// ==================== BUMP REMINDER SYSTEM ====================
let lastBumpTime = null;
const BUMP_COOLDOWN = 2 * 60 * 60 * 1000; // 2 hours

client.on('messageCreate', async (message) => {
  // Detect Disboard bump
  if (message.author.id === '302050872383242240' && message.embeds.length > 0) {
    const embed = message.embeds[0];
    
    if (embed.description && embed.description.includes('Bump done')) {
      lastBumpTime = Date.now();
      
      const thankEmbed = new Discord.EmbedBuilder()
        .setTitle('✅ Thanks for Bumping!')
        .setDescription(`Thanks for bumping the server!\n\nNext bump available <t:${Math.floor((lastBumpTime + BUMP_COOLDOWN)/1000)}:R>`)
        .setColor('#00ff00');

      await message.channel.send({ embeds: [thankEmbed] });

      // Set reminder
      setTimeout(async () => {
        const reminderEmbed = new Discord.EmbedBuilder()
          .setTitle('⏰ Bump Reminder')
          .setDescription('The server can be bumped again!\n\nUse `/bump` to bump the server!')
          .setColor('#ffaa00');

        await message.channel.send({ embeds: [reminderEmbed] });
      }, BUMP_COOLDOWN);
    }
  }
});

// ==================== BACKUP SYSTEM ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (message.author.id !== OWNER_ID) return;

  if (message.content.toLowerCase() === '!backup') {
    await message.reply('⏳ Creating backup...');

    const backupData = {
      timestamp: new Date().toISOString(),
      profiles: Array.from(dataManager.userProfiles.entries()),
      invites: Array.from(dataManager.userInvites.entries()),
      tournaments: Array.from(dataManager.tournaments.entries()).map(([id, t]) => [
        id, 
        { ...t, players: Array.from(t.players.entries()) }
      ]),
      warnings: Array.from(dataManager.warnings.entries()),
      levels: Array.from(userLevels.entries()),
      reactionRoles: Array.from(reactionRoles.entries())
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const buffer = Buffer.from(jsonData);

    await message.channel.send({
      content: '✅ Backup created successfully!',
      files: [{
        attachment: buffer,
        name: `oto-backup-${Date.now()}.json`
      }]
    });
  }

  if (message.content.toLowerCase() === '!restore' && message.attachments.size > 0) {
    await message.reply('⏳ Restoring from backup...');

    try {
      const attachment = message.attachments.first();
      const response = await fetch(attachment.url);
      const backupData = await response.json();

      // Restore data
      dataManager.userProfiles = new Map(backupData.profiles);
      dataManager.userInvites = new Map(backupData.invites);
      dataManager.warnings = new Map(backupData.warnings);
      userLevels.clear();
      backupData.levels.forEach(([k, v]) => userLevels.set(k, v));

      await message.reply('✅ Backup restored successfully!');
    } catch (err) {
      await message.reply(`❌ Restore failed: ${err.message}`);
    }
  }
});

// ==================== BIRTHDAY SYSTEM ====================
const birthdays = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith('!setbirthday')) {
    const args = message.content.split(' ');
    const date = args[1]; // Format: DD-MM

    if (!date || !date.match(/^\d{2}-\d{2}$/)) {
      await message.reply('❌ Usage: `!setbirthday DD-MM` (e.g., `!setbirthday 25-12`)');
      return;
    }

    birthdays.set(message.author.id, date);
    await message.reply(`✅ Your birthday has been set to ${date}! 🎂`);
  }
});

// Check birthdays daily
setInterval(async () => {
  const now = new Date();
  const today = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  for (const [userId, birthday] of birthdays.entries()) {
    if (birthday === today) {
      try {
        const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        const user = await client.users.fetch(userId);

        const embed = new Discord.EmbedBuilder()
          .setTitle('🎂 Happy Birthday!')
          .setDescription(`Today is <@${userId}>'s birthday! 🎉\n\nWish them a wonderful day! 🎈`)
          .setColor('#ff1493')
          .setThumbnail(user.displayAvatarURL())
          .setTimestamp();

        await channel.send({ embeds: [embed] });
        
        // Remove from map so we don't spam
        birthdays.delete(userId);
      } catch (err) {
        console.error('Birthday announcement error:', err);
      }
    }
  }
}, 86400000); // Check once per day

// ==================== SUGGESTION SYSTEM ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith('!suggest')) {
    const suggestion = message.content.slice(9).trim();

    if (!suggestion) {
      await message.reply('❌ Usage: `!suggest <your suggestion>`');
      return;
    }

    try {
      await message.delete();
    } catch (err) {}

    const embed = new Discord.EmbedBuilder()
      .setTitle('💡 New Suggestion')
      .setDescription(suggestion)
      .setColor('#3498db')
      .setFooter({ text: `Suggested by ${message.author.tag}` })
      .setTimestamp();

    const suggestionMsg = await message.channel.send({ embeds: [embed] });
    
    await suggestionMsg.react('👍');
    await suggestionMsg.react('👎');
    await suggestionMsg.react('🤷');

    await message.author.send(`✅ Your suggestion has been submitted!`).catch(() => {});
  }
});

// ==================== POLL SYSTEM ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  if (message.content.toLowerCase().startsWith('!poll')) {
    const args = message.content.slice(6).split('|').map(s => s.trim());
    
    if (args.length < 3) {
      await message.reply('❌ Usage: `!poll Question | Option 1 | Option 2 | Option 3...`');
      return;
    }

    const question = args[0];
    const options = args.slice(1);

    if (options.length > 10) {
      await message.reply('❌ Maximum 10 options allowed!');
      return;
    }

    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    const embed = new Discord.EmbedBuilder()
      .setTitle('📊 ' + question)
      .setDescription(options.map((opt, i) => `${numberEmojis[i]} ${opt}`).join('\n\n'))
      .setColor('#3498db')
      .setFooter({ text: `Poll by ${message.author.tag}` })
      .setTimestamp();

    const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
    const pollMsg = await announceChannel.send({ embeds: [embed] });

    for (let i = 0; i < options.length; i++) {
      await pollMsg.react(numberEmojis[i]);
    }

    await message.reply(`✅ Poll created in <#${CONFIG.ANNOUNCEMENT_CHANNEL}>!`);
  }
});// ==================== ENHANCED AUTO-RESPONSE SYSTEM ====================
const ENHANCED_AUTO_RESPONSES = {
  // Tournament related
  patterns: {
    tournament: {
      keywords: ['tournament', 'tourney', 'competition', 'match', 'game'],
      contexts: {
        when: ['kab', 'when', 'time', 'timing', 'schedule'],
        how: ['kaise', 'how', 'join', 'register', 'entry'],
        prize: ['prize', 'reward', 'money', 'winning', 'inam'],
        free: ['free', 'muft', 'without payment', 'bina paise']
      },
      responses: {
        when: [
          'Tournament schedule: <#' + CONFIG.TOURNAMENT_SCHEDULE + '> 📅\nDaily tournaments at multiple times! 🎮',
          'Check <#' + CONFIG.TOURNAMENT_SCHEDULE + '> for exact timings! ⏰\nNew tournaments daily! 🔥',
          'Multiple tournaments daily! 🎯\nSchedule: <#' + CONFIG.TOURNAMENT_SCHEDULE + '> ⚡'
        ],
        how: [
          'Easy steps to join:\n1️⃣ Complete profile\n2️⃣ Invite 10 friends OR pay entry\n3️⃣ Click JOIN button\n4️⃣ Win prizes! 🏆',
          'Tournament join karna hai? 🎮\n• Check <#' + CONFIG.TOURNAMENT_SCHEDULE + '>\n• Click JOIN button\n• Follow instructions! 💯',
          'Join process simple hai bro! ⚡\n1. Profile complete karo\n2. Tournament dekho\n3. JOIN button click karo! 🎯'
        ],
        prize: [
          'Prizes from ₹500 to ₹10,000! 💰\nWin real money playing games! 🏆',
          'Big cash prizes waiting! 💸\nCheck tournament details for prize pool! 🎮',
          'Daily cash rewards! 💰\n₹500, ₹1000, ₹2000, ₹5000, ₹10000 prizes! 🔥'
        ],
        free: [
          `FREE entry = Invite ${CONFIG.MIN_INVITES} friends! 🎁\nUse \`-i\` to check your invites! 📊`,
          `Want FREE tournaments? 🆓\nInvite ${CONFIG.MIN_INVITES} buddies and play FREE! 🎮`,
          'FREE entry system:\n• Invite 10 friends 👥\n• Get confirmed ✅\n• Play FREE! 🎯'
        ]
      }
    },
    
    payment: {
      keywords: ['payment', 'pay', 'paisa', 'money', 'transaction', 'upi', 'paytm'],
      contexts: {
        how: ['kaise', 'how', 'method', 'process'],
        not_verified: ['not verified', 'pending', 'waiting', 'nahi hua'],
        failed: ['failed', 'fail', 'error', 'problem', 'issue']
      },
      responses: {
        how: [
          'Payment methods available: 💳\n• UPI\n• PayTM\n• PhonePe\n• Google Pay\n\nSend screenshot in registration ticket! 📸',
          'Payment kaise karein? 💰\n1. Join tournament\n2. Upload payment proof\n3. Staff will verify ✅\n4. You\'re in! 🎮',
          'Easy payment process! 💳\n• Choose payment method\n• Pay entry fee\n• Screenshot lena\n• Upload in ticket! 📸'
        ],
        not_verified: [
          'Payment verification takes 5-15 minutes! ⏱️\nStaff working on it! Be patient! 💯',
          'Payment pending? 🕐\nStaff will verify soon! Usually 10 minutes max! ⚡',
          'Verification in progress! ⏳\nOur staff checking payments! Please wait! 🙏'
        ],
        failed: [
          'Payment issue? 🔧\nCreate ticket: Click button in <#' + CONFIG.HOW_TO_JOIN + '> 🎫',
          'Payment problem? ❌\nContact staff through ticket system! They\'ll help! 👨‍💼',
          'Transaction failed? 💔\nNo worries! Create support ticket for help! 🆘'
        ]
      }
    },

    invite: {
      keywords: ['invite', 'invites', 'refer', 'friend', 'link'],
      contexts: {
        check: ['check', 'kitne', 'how many', 'count', 'dekh'],
        get: ['kaise', 'how', 'get', 'milega', 'earn'],
        benefit: ['benefit', 'reward', 'prize', 'faida', 'kya milega']
      },
      responses: {
        check: [
          'Check invites anytime: Type `-i` command! 📊\nQuick and easy! ⚡',
          'Your invite count: Use `-i` command! 🔗\nSee progress towards FREE entry! 🎁',
          'Invites check karne ke liye: `-i` type karo! 📈\nInstant results! 💯'
        ],
        get: [
          'How to invite:\n1. Right-click server name 🖱️\n2. "Invite People" click karo 👥\n3. Share link with friends! 🔗\n4. When they join = +1 invite! ✅',
          'Invite kaise karein? 🔗\n• Server invite link generate karo\n• Friends ko bhejo\n• Jaise hi join karenge, count badhega! 📈',
          'Easy invite process! 👥\n1. Get invite link\n2. Share everywhere\n3. Track with `-i` command! 📊'
        ],
        benefit: [
          `${CONFIG.MIN_INVITES} invites = FREE tournament entry! 🎁\nNo payment needed! Play FREE! 🎮`,
          'Invite benefits:\n• 10 invites = FREE tournaments 🆓\n• Top inviters get special rewards! 🏆\n• Help grow community! 💪',
          'Rewards for inviting:\n✅ FREE entry after 10\n✅ Leaderboard fame\n✅ Exclusive perks! ⭐'
        ]
      }
    },

    profile: {
      keywords: ['profile', 'account', 'oto id', 'register', 'signup'],
      contexts: {
        create: ['create', 'banao', 'kaise', 'how', 'setup'],
        check: ['check', 'dekh', 'view', 'show', 'mera'],
        update: ['update', 'change', 'edit', 'modify', 'badal']
      },
      responses: {
        create: [
          'Profile create karna hai? 📝\nBot will DM you when you join!\nReply with:\n```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/Minecraft/PUBG\n```',
          'Setup profile: 👤\n• Bot sends DM when you join\n• Fill in your details\n• Get PLAYER role! ✅\n• Start gaming! 🎮',
          'Profile creation easy hai! 🚀\nJust follow bot\'s DM instructions!\nComplete in 1 minute! ⚡'
        ],
        check: [
          'Check your profile: Type `-profile` command! 👤\nSee all your stats! 📊',
          'Profile dekhna hai? 🔍\nCommand: `-profile`\nSee stats, OTO ID, everything! 💯',
          'View profile anytime: `-profile` command! 📱\nTrack progress! 📈'
        ],
        update: [
          'Update profile? 🔧\nCreate ticket for profile changes!\nStaff will help! 👨‍💼',
          'Profile change chahiye? ✏️\nTicket create karo!\nStaff update kar denge! ⚡',
          'Want to modify profile? 📝\nContact staff via ticket system! 🎫'
        ]
      }
    },

    help: {
      keywords: ['help', 'madad', 'support', 'assist', 'guide', 'kaise'],
      contexts: {
        general: ['help', 'madad', 'support'],
        commands: ['command', 'cmd', 'bot'],
        stuck: ['stuck', 'confused', 'samajh nahi', 'problem']
      },
      responses: {
        general: [
          'Need help? 🆘\n• Type `-help` for commands\n• Mention bot for quick guide\n• Create ticket for personal support! 🎫',
          'Help chahiye? 💡\n• Complete guide: <#' + CONFIG.HOW_TO_JOIN + '>\n• Commands: `-help`\n• Support: Create ticket! 🎫',
          'We\'re here to help! 🤝\n• Quick commands: `-help`\n• Detailed guide available\n• Staff support via tickets! 👨‍💼'
        ],
        commands: [
          'Bot commands: 🤖\n• `-i` - Check invites\n• `-profile` - Your profile\n• `-help` - This help\n• Just say "Hi" for greeting! 👋',
          'Available commands: ⚡\n`-i` - Invites\n`-profile` - Profile\n`-help` - Help\n\nOr mention the bot! 🤖',
          'Command list: 📋\n✅ `-i` for invites\n✅ `-profile` for stats\n✅ `-help` for guide\n✅ Mention bot for help! 💬'
        ],
        stuck: [
          'Feeling stuck? 😕\n1. Read guide: <#' + CONFIG.HOW_TO_JOIN + '>\n2. Try commands: `-help`\n3. Still stuck? Create ticket! 🎫',
          'Don\'t worry! We got you! 💪\n• Check pinned messages 📌\n• Use bot commands 🤖\n• Ask staff via ticket! 👨‍💼',
          'Confused? No problem! 🔧\n• Complete guide available\n• Bot can help (mention it)\n• Staff ready to assist! ⚡'
        ]
      }
    }
  }
};

// Smart Auto-Response Handler
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.type === Discord.ChannelType.DM) return;

  const content = message.content.toLowerCase().trim();
  
  // Skip if message is too short or too long
  if (content.length < 3 || content.length > 200) return;

  // Don't respond in staff channels
  if (message.channel.id === CONFIG.STAFF_TOOLS || message.channel.id === CONFIG.STAFF_CHAT) return;

  // Check each pattern
  for (const [category, data] of Object.entries(ENHANCED_AUTO_RESPONSES.patterns)) {
    // Check if message contains category keywords
    const hasKeyword = data.keywords.some(keyword => content.includes(keyword));
    
    if (hasKeyword) {
      // Find matching context
      for (const [context, contextKeywords] of Object.entries(data.contexts)) {
        const hasContext = contextKeywords.some(kw => content.includes(kw));
        
        if (hasContext && data.responses[context]) {
          const responses = data.responses[context];
          const response = responses[Math.floor(Math.random() * responses.length)];
          
          // Only respond if not recently responded (prevent spam)
          const lastResponse = dataManager.lastMessages.get(`auto_${message.channel.id}`);
          if (!lastResponse || Date.now() - lastResponse > 30000) { // 30 seconds cooldown
            await message.reply(response);
            dataManager.lastMessages.set(`auto_${message.channel.id}`, Date.now());
            return;
          }
        }
      }
      
      // If keyword matched but no specific context, give general response
      if (category === 'help') {
        const generalResponse = data.responses.general[0];
        await message.reply(generalResponse);
        return;
      }
    }
  }
});

// ==================== SERVER MANAGEMENT COMMANDS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.ADMIN_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // Lock Channel
  if (command === '!lock') {
    const channel = message.mentions.channels.first() || message.channel;
    
    try {
      await channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: false
      });
      
      const embed = new Discord.EmbedBuilder()
        .setTitle('🔒 Channel Locked')
        .setDescription(`${channel} has been locked.\n\nOnly staff can send messages now.`)
        .setColor('#ff0000')
        .setTimestamp();
      
      await channel.send({ embeds: [embed] });
      await message.reply('✅ Channel locked!');
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Unlock Channel
  if (command === '!unlock') {
    const channel = message.mentions.channels.first() || message.channel;
    
    try {
      await channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: null
      });
      
      const embed = new Discord.EmbedBuilder()
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`${channel} has been unlocked.\n\nEveryone can send messages now.`)
        .setColor('#00ff00')
        .setTimestamp();
      
      await channel.send({ embeds: [embed] });
      await message.reply('✅ Channel unlocked!');
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Slowmode
  if (command === '!slowmode') {
    const seconds = parseInt(args[1]) || 0;
    const channel = message.mentions.channels.first() || message.channel;
    
    try {
      await channel.setRateLimitPerUser(seconds);
      
      if (seconds === 0) {
        await message.reply(`✅ Slowmode disabled for ${channel}!`);
      } else {
        await message.reply(`✅ Slowmode set to ${seconds} seconds for ${channel}!`);
      }
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Clear Messages
  if (command === '!clear' || command === '!purge') {
    const amount = parseInt(args[1]) || 10;
    
    if (amount < 1 || amount > 100) {
      await message.reply('❌ Amount must be between 1 and 100!');
      return;
    }

    try {
      const deleted = await message.channel.bulkDelete(amount + 1, true);
      
      const reply = await message.channel.send(`✅ Deleted ${deleted.size - 1} messages!`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Kick User
  if (command === '!kick') {
    const user = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';
    
    if (!user) {
      await message.reply('❌ Mention a user to kick!');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.kick(reason);
      
      const embed = new Discord.EmbedBuilder()
        .setTitle('👢 User Kicked')
        .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}\n**By:** ${message.author.tag}`)
        .setColor('#ff9900')
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Warn User
  if (command === '!warn') {
    const user = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';
    
    if (!user) {
      await message.reply('❌ Mention a user to warn!');
      return;
    }

    const warnings = dataManager.addWarning(user.id, reason);
    
    try {
      await user.send(
        `⚠️ **You have been warned in ${message.guild.name}**\n\n` +
        `**Reason:** ${reason}\n` +
        `**Total Warnings:** ${warnings}\n` +
        `**Warned by:** ${message.author.tag}\n\n` +
        `Please follow server rules to avoid further action.`
      );
    } catch (err) {
      // User has DMs disabled
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('⚠️ User Warned')
      .setDescription(`**User:** ${user.tag}\n**Reason:** ${reason}\n**Total Warnings:** ${warnings}\n**By:** ${message.author.tag}`)
      .setColor('#ffaa00')
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });

    if (warnings >= 3) {
      await message.channel.send(`🚨 ${user.tag} has reached 3 warnings! Consider timeout or ban.`);
    }
  }

  // Check Warnings
  if (command === '!warnings') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Mention a user!');
      return;
    }

    const warnings = dataManager.getWarnings(user.id);
    
    if (warnings.length === 0) {
      await message.reply(`✅ ${user.tag} has no warnings!`);
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle(`⚠️ Warnings for ${user.tag}`)
      .setDescription(`Total: **${warnings.length}** warnings`)
      .setColor('#ffaa00');

    warnings.forEach((warn, index) => {
      embed.addFields({
        name: `Warning ${index + 1}`,
        value: `**Reason:** ${warn.reason}\n**Date:** <t:${Math.floor(warn.date.getTime()/1000)}:R>`,
        inline: false
      });
    });

    await message.reply({ embeds: [embed] });
  }

  // Clear Warnings
  if (command === '!clearwarnings') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Mention a user!');
      return;
    }

    dataManager.warnings.delete(user.id);
    await message.reply(`✅ Cleared all warnings for ${user.tag}!`);
  }

  // Server Stats
  if (command === '!serverstats') {
    const guild = message.guild;
    
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const textChannels = guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildVoice).size;
    const roles = guild.roles.cache.size;
    const boosts = guild.premiumSubscriptionCount;
    
    const embed = new Discord.EmbedBuilder()
      .setTitle(`📊 ${guild.name} Statistics`)
      .setThumbnail(guild.iconURL())
      .setColor('#3498db')
      .addFields(
        { name: '👥 Total Members', value: `${totalMembers}`, inline: true },
        { name: '🟢 Online', value: `${onlineMembers}`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:R>`, inline: true },
        { name: '💬 Text Channels', value: `${textChannels}`, inline: true },
        { name: '🔊 Voice Channels', value: `${voiceChannels}`, inline: true },
        { name: '🎭 Roles', value: `${roles}`, inline: true },
        { name: '⚡ Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: '💎 Boosts', value: `${boosts}`, inline: true },
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  // Role Info
  if (command === '!roleinfo') {
    const role = message.mentions.roles.first();
    
    if (!role) {
      await message.reply('❌ Mention a role!');
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle(`🎭 Role Information - ${role.name}`)
      .setColor(role.color || '#99AAB5')
      .addFields(
        { name: '🆔 Role ID', value: role.id, inline: true },
        { name: '👥 Members', value: `${role.members.size}`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp/1000)}:R>`, inline: true },
        { name: '🎨 Color', value: role.hexColor, inline: true },
        { name: '📊 Position', value: `${role.position}`, inline: true },
        { name: '🔖 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '🔗 Mention', value: `${role}`, inline: false }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  // Give Role to All
  if (command === '!roleall') {
    const role = message.mentions.roles.first();
    
    if (!role) {
      await message.reply('❌ Mention a role!');
      return;
    }

    await message.reply(`⏳ Adding ${role} to all members... This may take a while!`);

    let count = 0;
    for (const [, member] of message.guild.members.cache) {
      if (!member.roles.cache.has(role.id) && !member.user.bot) {
        try {
          await member.roles.add(role);
          count++;
        } catch (err) {
          // Ignore errors
        }
      }
    }

    await message.channel.send(`✅ Added ${role} to ${count} members!`);
  }

  // Remove Role from All
  if (command === '!removeroleall') {
    const role = message.mentions.roles.first();
    
    if (!role) {
      await message.reply('❌ Mention a role!');
      return;
    }

    await message.reply(`⏳ Removing ${role} from all members... This may take a while!`);

    let count = 0;
    for (const [, member] of role.members) {
      try {
        await member.roles.remove(role);
        count++;
      } catch (err) {
        // Ignore errors
      }
    }

    await message.channel.send(`✅ Removed ${role} from ${count} members!`);
  }
});// ==================== BOT READY ====================
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  console.log(`👥 Monitoring ${client.users.cache.size} users`);
  console.log('');
  console.log('🎯 FEATURES LOADED:');
  console.log('   ✅ Profile System (DM-based)');
  console.log('   ✅ Invite Tracking (10 invites = FREE)');
  console.log('   ✅ Welcome Messages (Gender-based)');
  console.log('   ✅ Auto-Responses (Hi, Hello, Tournament, etc.)');
  console.log('   ✅ No Reply System (2-min timeout)');
  console.log('   ✅ Bad Word Filter + Warnings');
  console.log('   ✅ Spam Detection + Auto-timeout');
  console.log('   ✅ Ticket System (Auto-close 10min)');
  console.log('   ✅ Tournament Creation (Dropdown)');
  console.log('   ✅ Tournament Registration (Free/Paid)');
  console.log('   ✅ Payment Verification System');
  console.log('   ✅ Room ID/Password Distribution');
  console.log('   ✅ Winner Announcement System');
  console.log('   ✅ Leaderboards (Invites, Tournaments)');
  console.log('   ✅ Most Played Tracking');
  console.log('   ✅ Staff Commands (Ban, Timeout, etc.)');
  console.log('   ✅ Beat Our Player Challenge');
  console.log('');

  // Set status
  client.user.setPresence({
    activities: [{ name: '🏆 OTO Tournaments | Say Hi!', type: Discord.ActivityType.Playing }],
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
      console.log(`✅ Loaded invites for: ${guild.name}`);
    } catch (err) {
      console.log(`⚠️ Could not fetch invites for ${guild.name}`);
    }
  }

  // Setup persistent messages
  setTimeout(() => {
    setupPersistentMessages();
  }, 5000);

  console.log('');
  console.log('✅ ALL SYSTEMS OPERATIONAL!');
  console.log('🚀 OTO Tournament Bot is LIVE!');
  console.log('');
  console.log('📋 STAFF COMMANDS:');
  console.log('   !ct or !createtournament - Create tournament');
  console.log('   !startroom <ID> <roomID> <password> - Start tournament');
  console.log('   !winners <ID> @user1 @user2 @user3 - Declare winners');
  console.log('   !endtournament <ID> - End tournament');
  console.log('   !deletetournament <ID> - Delete tournament');
  console.log('   !tournaments - List active tournaments');
  console.log('   !leaderboard <game> - Show leaderboard');
  console.log('   !beatplayer - Create challenge');
  console.log('   !ban @user <reason> - Ban user');
  console.log('   !timeout @user <minutes> <reason> - Timeout user');
  console.log('   !untimeout @user - Remove timeout');
  console.log('   !addstaff @user - Add staff role');
  console.log('   !removestaff @user - Remove staff role');
  console.log('');
  console.log('💬 USER COMMANDS:');
  console.log('   -i - Check invites');
  console.log('   Hi/Hello/Bhai - Greeting responses');
  console.log('   Mention bot - Get help');
  console.log('');
});

// ==================== ADDITIONAL FEATURES ====================

// Command to check user stats
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const content = message.content.toLowerCase().trim();
  
  // Check invites command
  if (content === '-i' || content === '!invites') {
    const invites = dataManager.getInvites(message.author.id);
    const needed = CONFIG.MIN_INVITES;
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('📊 Your Invite Status')
      .setDescription(`<@${message.author.id}>`)
      .setColor(invites >= needed ? '#00ff00' : '#ff0000')
      .addFields(
        { name: '🔗 Total Invites', value: `**${invites}**`, inline: true },
        { name: '🎯 Required', value: `**${needed}**`, inline: true },
        { name: '📈 Progress', value: `**${Math.min(100, (invites/needed * 100)).toFixed(0)}%**`, inline: true }
      );

    if (invites >= needed) {
      embed.addFields({
        name: '✅ FREE ENTRY UNLOCKED!',
        value: 'You can now join FREE tournaments! 🎉',
        inline: false
      });
    } else {
      embed.addFields({
        name: '🎁 Keep Inviting!',
        value: `Invite **${needed - invites}** more friends for FREE entry!\n\nShare this server with your friends! 🔗`,
        inline: false
      });
    }

    await message.reply({ embeds: [embed] });
  }

  // Check profile command
  if (content === '-profile' || content === '!profile') {
    const profile = dataManager.getProfile(message.author.id);
    
    if (!profile) {
      await message.reply('❌ You don\'t have a profile yet! Check your DMs to create one. 📩');
      return;
    }

    const invites = dataManager.getInvites(message.author.id);
    const embed = new Discord.EmbedBuilder()
      .setTitle(`👤 ${profile.name}'s Profile`)
      .setDescription(`**OTO ID:** \`${profile.otoId}\``)
      .setColor('#3498db')
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        { name: '🎮 Game', value: profile.game, inline: true },
        { name: '👤 Gender', value: profile.gender, inline: true },
        { name: '📍 State', value: profile.state, inline: true },
        { name: '🔗 Invites', value: `${invites}`, inline: true },
        { name: '🏆 Tournaments', value: `${profile.tournaments}`, inline: true },
        { name: '🥇 Wins', value: `${profile.wins}`, inline: true },
        { name: '📅 Member Since', value: `<t:${Math.floor(profile.createdAt.getTime()/1000)}:R>`, inline: false }
      )
      .setFooter({ text: 'Keep gaming and winning!' });

    await message.reply({ embeds: [embed] });
  }

  // Help command
  if (content === '-help' || content === '!help') {
    const embed = new Discord.EmbedBuilder()
      .setTitle('🤖 OTO Bot - Quick Help')
      .setDescription('Here are the commands you can use:')
      .setColor('#3498db')
      .addFields(
        { 
          name: '📊 User Commands', 
          value: '`-i` - Check your invites\n`-profile` - View your profile\n`-help` - This message\n`Hi/Hello/Bhai` - Friendly greetings', 
          inline: false 
        },
        { 
          name: '🎮 Getting Started', 
          value: '1. Complete profile (via DM)\n2. Invite 10 friends\n3. Join tournaments\n4. Win prizes!', 
          inline: false 
        },
        { 
          name: '💡 Quick Tips', 
          value: '• Mention the bot for instant help\n• Check <#' + CONFIG.TOURNAMENT_SCHEDULE + '> for tournaments\n• Create ticket if you need support', 
          inline: false 
        }
      )
      .setFooter({ text: 'Happy Gaming! 🎮' });

    await message.reply({ embeds: [embed] });
  }
});

// ==================== ROOM DETAILS PROTECTION ====================
// Prevent copying/forwarding room details
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.includes('Room ID') && !message.content.includes('Password')) return;

  // Check if message contains sensitive room info
  const hasRoomId = /room\s*id|roomid/i.test(message.content);
  const hasPassword = /password|pass/i.test(message.content);

  if (hasRoomId && hasPassword && message.channel.type !== Discord.ChannelType.DM) {
    try {
      await message.delete();
      await message.channel.send(
        `⚠️ <@${message.author.id}> Please don't share room details publicly! Check your DMs for room information. 🔒`
      );
    } catch (err) {
      console.error('Could not delete message:', err);
    }
  }
});

// ==================== STAFF TAG RESPONSE ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const content = message.content.toLowerCase();
  
  if (content.includes('staff') || content.includes('admin') || content.includes('help')) {
    if (message.mentions.roles.has(CONFIG.STAFF_ROLE) || content.includes('@staff')) {
      const responses = [
        'Staffs are working hard! 💪 Aapko jaldi hi reply mil jayega! ⚡',
        'Our team is on it! 🔥 Quick response incoming! 👨‍💼',
        'Staff members notified! ⚡ They\'ll help you ASAP! 💫',
        'Support team alerted! 🚨 Patience, help is coming! 🎯'
      ];
      
      await message.reply(responses[Math.floor(Math.random() * responses.length)]);
    }
  }
});

// ==================== ANNOUNCEMENT COMMAND ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // Announcement command
  if (command === '!announce') {
    const announcementText = args.slice(1).join(' ');
    
    if (!announcementText) {
      await message.reply('❌ Usage: `!announce <message>`');
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('📢 OFFICIAL ANNOUNCEMENT')
      .setDescription(announcementText)
      .setColor('#ff0000')
      .setFooter({ text: `Announced by ${message.author.username}` })
      .setTimestamp();

    const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
    await announceChannel.send({ 
      content: '@everyone',
      embeds: [embed] 
    });

    await message.reply('✅ Announcement posted!');
  }

  // Embed announcement with custom fields
  if (command === '!announceembed') {
    await message.reply(
      '📝 **Custom Announcement Creator**\n\n' +
      'Use: `!embedannounce <title> | <description> | <field1:value1> | <field2:value2>`\n\n' +
      'Example:\n' +
      '`!embedannounce New Update | We have exciting features! | Feature 1:Amazing stuff | Feature 2:More amazing`'
    );
  }
});

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('❌ Client error:', err));
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('❌ Uncaught exception:', err);
});

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('   🎮 OTO TOURNAMENT BOT - INITIALIZED     ');
    console.log('═══════════════════════════════════════════');
    console.log('');
  })
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });  // Add Staff
  if (command === '!addstaff') {
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply('❌ Mention a user!');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.roles.add(CONFIG.STAFF_ROLE);
      
      const welcomeMessages = [
        `Welcome to the team! 🎉 Tumhe hardwork karna hai!`,
        `New staff member! 💪 Time to show dedication!`,
        `Welcome aboard! 🚀 Let's make OTO better together!`,
        `Great addition! 🌟 Ready to help the community?`
      ];
      
      await message.reply(`✅ ${user.tag} is now staff!\n\n${welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]}`);
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Remove Staff
  if (command === '!removestaff') {
    const user = message.mentions.users.first();
    if (!user) {
      await message.reply('❌ Mention a user!');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.roles.remove(CONFIG.STAFF_ROLE);
      await message.reply(`✅ Removed staff role from ${user.tag}`);
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Beat Our Player Challenge
  if (command === '!beatplayer') {
    const challengeId = `BEAT-${Date.now()}`;
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('⚔️ BEAT OUR PLAYER CHALLENGE!')
      .setDescription('Think you can beat our best player? Prove it!')
      .setColor('#ff0000')
      .addFields(
        { name: '🏆 Prize', value: 'FREE Squad Entry + Bragging Rights', inline: true },
        { name: '🎮 Game', value: 'Free Fire / Minecraft', inline: true },
        { name: '📋 Challenge ID', value: challengeId, inline: true },
        { name: '✅ How to Join', value: '1. Click JOIN button\n2. Complete 10 invites first\n3. Receive room details\n4. Beat our player to win!', inline: false }
      )
      .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
      .setFooter({ text: 'Limited slots available!' })
      .setTimestamp();

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(`join_challenge_${challengeId}`)
          .setLabel('JOIN CHALLENGE')
          .setEmoji('⚔️')
          .setStyle(Discord.ButtonStyle.Danger)
      );

    const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
    await announceChannel.send({ 
      content: '@everyone\n\n⚔️ **SPECIAL CHALLENGE ALERT!** ⚔️',
      embeds: [embed], 
      components: [row] 
    });

    await message.reply('✅ Beat Our Player challenge posted!');
  }
});

// ==================== SETUP PERSISTENT MESSAGES ====================
async function setupPersistentMessages() {
  try {
    // Setup in How to Join channel
    const howToJoinChannel = await client.channels.fetch(CONFIG.HOW_TO_JOIN);
    
    const guideEmbed = new Discord.EmbedBuilder()
      .setTitle('📚 OTO Tournament Guide - Complete Walkthrough')
      .setDescription('Welcome to OTO Tournaments! Here\'s everything you need to know:')
      .setColor('#3498db')
      .addFields(
        { 
          name: '🚀 Step 1: Complete Your Profile', 
          value: 'When you first join, the bot will DM you.\nReply with:\n```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/Minecraft/PUBG\n```\n✅ You\'ll get PLAYER role automatically!',
          inline: false 
        },
        { 
          name: '🔗 Step 2: Invite Friends (FREE Entry)', 
          value: `Invite **${CONFIG.MIN_INVITES} friends** to unlock FREE tournament entry!\n\n**How to invite:**\n1. Right-click server name\n2. Click "Invite People"\n3. Share your link\n4. When ${CONFIG.MIN_INVITES} friends join = FREE ENTRY! 🎉\n\n*Check invites with:* \`-i\` command`,
          inline: false 
        },
        {
          name: '🎮 Step 3: Join Tournament',
          value: '1. Go to <#' + CONFIG.TOURNAMENT_SCHEDULE + '>\n2. Click **JOIN TOURNAMENT** button\n3. Follow ticket instructions\n4. For FREE tournaments: Auto-confirmed ✅\n5. For PAID tournaments: Upload payment proof 💳\n6. Wait for staff approval',
          inline: false
        },
        {
          name: '🎯 Step 4: Game Time!',
          value: 'When tournament starts:\n• You\'ll receive ROOM ID & PASSWORD via DM 📩\n• Join within 5 minutes ⏰\n• Play and WIN! 🏆\n• Screenshots required 📸',
          inline: false
        },
        {
          name: '💡 Pro Tips',
          value: '• Say "Hi" to the bot for instant help! 👋\n• Type `-i` to check your invites 📊\n• Create ticket if you need help 🎫\n• Follow all rules strictly 📋\n• Have fun and play fair! 🎮',
          inline: false
        }
      )
      .setImage('https://i.ibb.co/8XQkZhJ/freefire.png')
      .setFooter({ text: 'Need help? Just say "Hi" or mention the bot!' })
      .setTimestamp();

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Create Support Ticket')
          .setEmoji('🎫')
          .setStyle(Discord.ButtonStyle.Primary),
        new Discord.ButtonBuilder()
          .setLabel('Tournament Schedule')
          .setStyle(Discord.ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${howToJoinChannel.guild.id}/${CONFIG.TOURNAMENT_SCHEDULE}`)
      );

    await howToJoinChannel.send({ embeds: [guideEmbed], components: [row] });

    console.log('✅ Persistent messages setup complete!');
  } catch (error) {
    console.error('Setup error:', error);
  }
}

// ==================== GENDER-BASED GREETINGS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.GENERAL_CHAT) return;

  const content = message.content.toLowerCase().trim();
  const profile = dataManager.getProfile(message.author.id);

  // Gender-based greetings
  if (profile && (content === 'hi' || content === 'hello')) {
    const name = profile.name;
    const gender = profile.gender.toLowerCase();
    
    let response;
    if (gender === 'female') {
      const femaleGreetings = [
        `Hello ${name}! 👋 Aaj tournament kheloge? 🎮`,
        `Hi ${name}! 🌟 Ready for some gaming? 🏆`,
        `Hey ${name}! 💫 Tournament join karoge? ⚡`
      ];
      response = femaleGreetings[Math.floor(Math.random() * femaleGreetings.length)];
    } else {
      const maleGreetings = [
        `Hi ${name} bro! 👋 Aaj tournament kheloge? 🎮`,
        `Hello ${name} bhai! 🔥 Game time! 🏆`,
        `Hey ${name}! 💪 Ready to win? ⚡`
      ];
      response = maleGreetings[Math.floor(Math.random() * maleGreetings.length)];
    }
    
    await message.reply(response);
  }
});

// ==================== TOURNAMENT SLOT UPDATES ====================
setInterval(async () => {
  try {
    for (const [tournamentId, tournament] of dataManager.tournaments.entries()) {
      if (tournament.status !== 'registration') continue;

      // Find tournament message and update slot count
      const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
      const messages = await scheduleChannel.messages.fetch({ limit: 50 });
      
      const tournamentMsg = messages.find(m => 
        m.embeds[0]?.footer?.text?.includes('Click JOIN') && 
        m.embeds[0]?.fields?.find(f => f.value === tournamentId)
      );

      if (tournamentMsg) {
        const embed = tournamentMsg.embeds[0];
        const slotField = embed.fields.find(f => f.name === '📊 Slots');
        if (slotField) {
          slotField.value = `${tournament.players.size}/${tournament.maxSlots}`;
          await tournamentMsg.edit({ embeds: [embed] });
        }
      }
    }
  } catch (error) {
    console.error('Slot update error:', error);
  }
}, 30000); // Every 30 seconds

// ==================== MOST PLAYED LEADERBOARD ====================
setInterval(async () => {
  try {
    // Free Fire Most Played
    const ffChannel = await client.channels.fetch(CONFIG.MOST_PLAYED);
    
    const ffPlayers = Array.from(dataManager.tournamentLeaderboard.freefire.entries())
      .sort((a, b) => b[1].tournaments - a[1].tournaments)
      .slice(0, 10);

    const ffEmbed = new Discord.EmbedBuilder()
      .setTitle('🎮 Most Active Free Fire Players')
      .setDescription('Players with most tournament participation')
      .setColor('#00ff00')
      .setTimestamp();

    let ffDesc = '';
    for (let i = 0; i < ffPlayers.length; i++) {
      const [userId, stats] = ffPlayers[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      ffDesc += `${medal} <@${userId}> - **${stats.tournaments}** tournaments (${stats.wins} wins)\n`;
    }

    ffEmbed.setDescription(ffDesc || 'No data yet!');

    const messages = await ffChannel.messages.fetch({ limit: 1 });
    if (messages.size > 0 && messages.first().author.id === client.user.id) {
      await messages.first().edit({ embeds: [ffEmbed] });
    } else {
      await ffChannel.send({ embeds: [ffEmbed] });
    }

    // Minecraft Most Played
    const mcPlayers = Array.from(dataManager.tournamentLeaderboard.minecraft.entries())
      .sort((a, b) => b[1].tournaments - a[1].tournaments)
      .slice(0, 10);

    if (mcPlayers.length > 0) {
      const mcEmbed = new Discord.EmbedBuilder()
        .setTitle('⛏️ Most Active Minecraft Players')
        .setDescription('Players with most tournament participation')
        .setColor('#00ff00')
        .setTimestamp();

      let mcDesc = '';
      for (let i = 0; i < mcPlayers.length; i++) {
        const [userId, stats] = mcPlayers[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        mcDesc += `${medal} <@${userId}> - **${stats.tournaments}** tournaments (${stats.wins} wins)\n`;
      }

      mcEmbed.setDescription(mcDesc);
      await ffChannel.send({ embeds: [mcEmbed] });
    }

  } catch (error) {
    console.error('Most played leaderboard error:', error);
  }
}, 600000); // Every 10 minutes// ==================== OTO COMPLETE TOURNAMENT BOT ====================
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch (err) {}
}

const Discord = require('discord.js');
const express = require('express');
const moment = require('moment-timezone');

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const OWNER_ID = process.env.OWNER_ID || 'YOUR_DISCORD_ID';

// ==================== CONFIGURATION ====================
const CONFIG = {
  // Channels
  ANNOUNCEMENT_CHANNEL: '1438484746165555243',
  TOURNAMENT_SCHEDULE: '1438482561679626303',
  GENERAL_CHAT: '1438482904018849835',
  STAFF_TOOLS: '1438486059255336970',
  STAFF_CHAT: '1438486059255336970',
  INVITE_TRACKER: '1439216884774998107',
  MINECRAFT_CHANNEL: '1439223955960627421',
  MOST_PLAYED: '1439226024863993988',
  
  // Roles
  STAFF_ROLE: '1438475461977047112',
  ADMIN_ROLE: '1438475461977047112',
  PLAYER_ROLE: '1438475461977047114',
  FOUNDER_ROLE: '1438475461977047115',
  
  // Settings
  MIN_INVITES: 10,
  NO_REPLY_TIMEOUT: 120000, // 2 minutes
  SPAM_INTERVAL: 120000, // 2 minutes
  TICKET_AUTO_CLOSE: 600000, // 10 minutes
  
  // Bad Words
  BAD_WORDS: ['dm', 'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'chutiya', 'madarchod', 'bhenchod']
};

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
  ],
  partials: [Discord.Partials.Channel, Discord.Partials.Message]
});

// Express Server
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('OTO Tournament Bot Running!'));
app.listen(process.env.PORT || 3000);

// ==================== DATA MANAGER ====================
class DataManager {
  constructor() {
    this.userProfiles = new Map();
    this.userInvites = new Map();
    this.inviteCache = new Map();
    this.tournaments = new Map();
    this.tickets = new Map();
    this.warnings = new Map();
    this.timeouts = new Map();
    this.lastMessages = new Map();
    this.noReplyTimers = new Map();
    this.staffMembers = new Set();
    this.tournamentLeaderboard = { freefire: new Map(), minecraft: new Map() };
  }

  // Profile Management
  createProfile(userId, data) {
    const profile = {
      id: userId,
      name: data.name || 'Unknown',
      gender: data.gender || 'Not Set',
      state: data.state || 'Not Set',
      game: data.game || 'Not Set',
      otoId: `OTO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date(),
      invites: 0,
      tournaments: 0,
      wins: 0,
      verified: false
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

  // Invite Tracking
  addInvite(userId) {
    const current = this.userInvites.get(userId) || 0;
    this.userInvites.set(userId, current + 1);
    return current + 1;
  }

  getInvites(userId) {
    return this.userInvites.get(userId) || 0;
  }

  // Moderation
  addWarning(userId, reason) {
    if (!this.warnings.has(userId)) {
      this.warnings.set(userId, []);
    }
    this.warnings.get(userId).push({ reason, date: new Date() });
    return this.warnings.get(userId).length;
  }

  getWarnings(userId) {
    return this.warnings.get(userId) || [];
  }
}

const dataManager = new DataManager();

// ==================== GREETING SYSTEM ====================
const GREETINGS = {
  welcome: [
    '🔥 {user} apna bhai aa gaya! Machaenge now! 🎮',
    '⚡ {user} joined the arena! Tournament ready? 💪',
    '🎯 {user} entered! Let\'s win together! 🏆',
    '💫 Boss {user} aa gaye! Game on! 🎮',
    '🌟 {user} welcome to OTO! Big wins ahead! 💰'
  ],
  responses: {
    'hi': ['Hey! 👋 Tournament join karo! 🎮', 'Hi bro! 🔥 Aaj kheloge?', 'Hello! ⚡ Game time!'],
    'hello': ['Hello! 🎯 Ready to play? 🏆', 'Hey there! 🔥 Join tournament!', 'Hi! 💫 Let\'s game!'],
    'bhai': ['Bhai! 🎮 Tournament hai aaj! 🔥', 'Kya haal bhai? ⚡ Game ready?', 'Bhai! 💯 Join karo!'],
    'tournament': ['Check <#1438482561679626303>! 🎮', 'Tournament live hai! 🔥', 'Join now! ⚡']
  }
};

// ==================== AUTO RESPONSE SYSTEM ====================
const AUTO_RESPONSES = {
  tournament: [
    'Tournament info: <#1438482561679626303> 🎮',
    'Daily tournaments! Check schedule! 🔥',
    'Multiple games available! Join now! ⚡'
  ],
  'free entry': [
    `Invite ${CONFIG.MIN_INVITES} friends for FREE entry! 🎁`,
    `${CONFIG.MIN_INVITES} invites = FREE tournament! 🔗`,
    'Invite friends, play FREE! 💫'
  ],
  'how to join': [
    'Simple: Invite 10 friends → Join tournament → Win! 🏆',
    'Guide: <#1438482512296022017> 📚',
    'Easy steps: Check pins! 📌'
  ],
  payment: [
    'Payment help: Create ticket! 🎫',
    'Use UPI/PayTM/PhonePe! 💳',
    'Payment issues? Staff will help! 👨‍💼'
  ]
};

// ==================== BOT MENTION RESPONSE ====================
client.on('messageCreate', async (message) => {
  if (message.mentions.has(client.user)) {
    const embed = new Discord.EmbedBuilder()
      .setTitle('🤖 OTO Bot Help')
      .setDescription('Hey! Need help? Here\'s what you can do:')
      .setColor('#3498db')
      .addFields(
        { name: '🎮 Join Tournament', value: 'Go to <#1438482561679626303>', inline: true },
        { name: '📝 How to Join', value: 'Check <#1438482512296022017>', inline: true },
        { name: '🎫 Need Help', value: 'Create a ticket!', inline: true }
      );
    
    await message.reply({ embeds: [embed] });
  }
});

// ==================== MEMBER JOIN/LEAVE ====================
client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    
    // Track inviter
    let inviter = null;
    try {
      const newInvites = await guild.invites.fetch();
      const usedInvite = newInvites.find(inv => {
        const cached = dataManager.inviteCache.get(inv.code) || 0;
        return inv.uses > cached;
      });

      if (usedInvite?.inviter) {
        dataManager.inviteCache.set(usedInvite.code, usedInvite.uses);
        inviter = usedInvite.inviter;
        const count = dataManager.addInvite(inviter.id);

        // Notify inviter
        if (count === CONFIG.MIN_INVITES) {
          try {
            await inviter.send(
              `🎉 **Congratulations!** 🎉\n\n` +
              `You've completed **${CONFIG.MIN_INVITES} invites**!\n` +
              `✅ **FREE ENTRY UNLOCKED!**\n\n` +
              `You can now join FREE tournaments! 🎮\n` +
              `Use the "Book Your Match" button when available! 🏆`
            );
          } catch (err) {}
        }
      }

      // Update cache
      newInvites.forEach(inv => dataManager.inviteCache.set(inv.code, inv.uses));
    } catch (err) {
      console.log('Invite tracking error:', err.message);
    }

    // Welcome message
    const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
    const welcomeMsg = GREETINGS.welcome[Math.floor(Math.random() * GREETINGS.welcome.length)]
      .replace('{user}', `<@${member.id}>`);
    
    let finalMsg = welcomeMsg;
    if (inviter) {
      finalMsg += `\n💫 **Invited by:** <@${inviter.id}> (${dataManager.getInvites(inviter.id)} invites)`;
    }
    
    await channel.send(finalMsg);

    // Send profile DM after 3 seconds
    setTimeout(async () => {
      try {
        if (!dataManager.hasProfile(member.id)) {
          const embed = new Discord.EmbedBuilder()
            .setTitle('👋 Welcome to OTO Tournaments!')
            .setDescription(`Hey ${member.user.username}! Let's set up your profile!`)
            .setColor('#3498db')
            .addFields(
              { name: '📝 Complete Profile', value: 'Reply with your details in this format:\n```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/Minecraft/PUBG```', inline: false },
              { name: '🎮 Quick Start', value: `• Invite ${CONFIG.MIN_INVITES} friends for FREE entry\n• Check tournament schedule\n• Join and win prizes!`, inline: false }
            )
            .setFooter({ text: 'Reply to this message with your profile details!' });

          await member.send({ embeds: [embed] });
        }
      } catch (err) {
        console.log('DM disabled for user');
      }
    }, 3000);

  } catch (error) {
    console.error('Member join error:', error);
  }
});

// ==================== DM PROFILE SETUP ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.type !== Discord.ChannelType.DM) return;

  const content = message.content;
  
  // Check if user needs profile
  if (!dataManager.hasProfile(message.author.id)) {
    // Parse profile data
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
        .setDescription(`Welcome aboard, ${profile.name}! 🎉`)
        .setColor('#00ff00')
        .addFields(
          { name: '🆔 OTO ID', value: profile.otoId, inline: true },
          { name: '🎮 Game', value: profile.game, inline: true },
          { name: '📍 State', value: profile.state, inline: true },
          { name: '🎯 Next Steps', value: `• Invite ${CONFIG.MIN_INVITES} friends for FREE entry\n• Check #tournament-schedule\n• Join tournaments and win!`, inline: false }
        )
        .setFooter({ text: 'Happy Gaming! 🏆' });

      await message.reply({ embeds: [embed] });

      // Announce in general
      try {
        const channel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        await channel.send(`🎉 <@${message.author.id}> completed their profile! Welcome to OTO family! 🎮`);
      } catch (err) {}
    } else {
      await message.reply(
        '❌ Invalid format! Please use:\n```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/Minecraft/PUBG```'
      );
    }
  }
});

// ==================== GENERAL CHAT - GREETINGS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.GENERAL_CHAT) return;

  const content = message.content.toLowerCase().trim();

  // Greeting responses
  for (const [greeting, responses] of Object.entries(GREETINGS.responses)) {
    if (content === greeting || content.includes(greeting)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(response);
      return;
    }
  }

  // Auto responses for keywords
  for (const [keyword, responses] of Object.entries(AUTO_RESPONSES)) {
    if (content.includes(keyword)) {
      const response = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(response);
      return;
    }
  }
});

// ==================== NO REPLY TIMEOUT SYSTEM ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.GENERAL_CHAT) return;

  const userId = message.author.id;
  
  // Clear existing timer
  if (dataManager.noReplyTimers.has(userId)) {
    clearTimeout(dataManager.noReplyTimers.get(userId));
  }

  // Set new timer
  const timer = setTimeout(async () => {
    const lastMsg = dataManager.lastMessages.get(userId);
    if (lastMsg && lastMsg.id === message.id) {
      // Check if anyone replied
      const replies = await message.channel.messages.fetch({ after: message.id, limit: 10 });
      const hasReply = replies.some(m => 
        m.reference?.messageId === message.id || 
        m.content.includes(`<@${userId}>`)
      );

      if (!hasReply) {
        const responses = [
          `Hi <@${userId}>! 👋 Tournament check karna? Aaj kheloge? 🎮`,
          `Hey <@${userId}>! 🔥 Custom challenge karoge? Tournament bhi hai! 🏆`,
          `<@${userId}> bro! 💫 Tournaments live hain! Join karo! ⚡`
        ];
        
        await message.reply(responses[Math.floor(Math.random() * responses.length)]);
      }
    }
  }, CONFIG.NO_REPLY_TIMEOUT);

  dataManager.noReplyTimers.set(userId, timer);
  dataManager.lastMessages.set(userId, message);
});

// ==================== BAD WORD FILTER ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.toLowerCase();
  const hasBadWord = CONFIG.BAD_WORDS.some(word => content.includes(word));

  if (hasBadWord) {
    try {
      await message.delete();
      
      const warnings = dataManager.addWarning(message.author.id, 'Bad language');
      
      if (warnings >= 3) {
        await message.member.timeout(600000, 'Multiple warnings for bad language');
        await message.channel.send(
          `⚠️ <@${message.author.id}> has been timed out for 10 minutes due to repeated use of inappropriate language!`
        );
      } else {
        await message.channel.send(
          `⚠️ <@${message.author.id}> Warning ${warnings}/3: Please avoid using inappropriate language! Next warning will result in timeout.`
        );
      }
    } catch (err) {
      console.error('Moderation error:', err);
    }
  }
});

// ==================== SPAM DETECTION ====================
const messageTimestamps = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const now = Date.now();
  
  if (!messageTimestamps.has(userId)) {
    messageTimestamps.set(userId, []);
  }

  const timestamps = messageTimestamps.get(userId);
  timestamps.push(now);

  // Keep only last 5 messages
  const recentMessages = timestamps.filter(t => now - t < 5000);
  messageTimestamps.set(userId, recentMessages);

  // Check for spam (5 messages in 5 seconds)
  if (recentMessages.length >= 5) {
    try {
      await message.member.timeout(300000, 'Spamming');
      await message.channel.send(
        `⚠️ <@${userId}> has been timed out for 5 minutes for spamming!`
      );
      messageTimestamps.delete(userId);
    } catch (err) {
      console.error('Timeout error:', err);
    }
  }
});

// ==================== ADVANCED TICKET SYSTEM ====================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  // Create Ticket with Category Selection
  if (interaction.customId === 'create_ticket') {
    try {
      const row = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.StringSelectMenuBuilder()
            .setCustomId('ticket_category')
            .setPlaceholder('Select ticket category')
            .addOptions([
              {
                label: '💳 Payment Issue',
                description: 'Payment not verified, transaction problems',
                value: 'payment',
                emoji: '💳'
              },
              {
                label: '🎮 Tournament Issue',
                description: 'Registration, room details, gameplay issues',
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
                description: 'Profile issues, account problems',
                value: 'profile',
                emoji: '👤'
              },
              {
                label: '📢 Report User',
                description: 'Report rule violations, cheating',
                value: 'report',
                emoji: '📢'
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
        content: '🎫 **Create Support Ticket**\n\nPlease select the category that best matches your issue:',
        components: [row],
        ephemeral: true 
      });

    } catch (error) {
      console.error('Ticket creation error:', error);
      await interaction.reply({ 
        content: '❌ Failed to create ticket. Please try again!', 
        ephemeral: true 
      });
    }
  }

  // Ticket Category Selected
  if (interaction.customId === 'ticket_category') {
    const category = interaction.values[0];
    const categoryEmojis = {
      payment: '💳',
      tournament: '🎮',
      technical: '🔧',
      profile: '👤',
      report: '📢',
      general: '❓'
    };

    const categoryNames = {
      payment: 'Payment Issue',
      tournament: 'Tournament Issue',
      technical: 'Technical Support',
      profile: 'Profile/Account',
      report: 'Report User',
      general: 'General Help'
    };

    try {
      const ticketId = `ticket-${Date.now()}`;
      const ticketCategory = interaction.guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
      
      // Create ticket channel
      const ticketChannel = await interaction.guild.channels.create({
        name: `${categoryEmojis[category]}-${interaction.user.username}-${ticketId.slice(-6)}`,
        type: Discord.ChannelType.GuildText,
        parent: ticketCategory,
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
              Discord.PermissionFlagsBits.ManageMessages,
              Discord.PermissionFlagsBits.ManageChannels
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

      // Store ticket
      dataManager.tickets.set(ticketId, {
        id: ticketId,
        userId: interaction.user.id,
        channelId: ticketChannel.id,
        category: category,
        createdAt: new Date(),
        status: 'open',
        closeTimer: null,
        messages: []
      });

      // Category-specific information
      const categoryInfo = {
        payment: '💳 **Payment Issue Ticket**\n\nPlease provide:\n• Transaction ID/Screenshot\n• Amount paid\n• Payment method used\n• Date and time of payment',
        tournament: '🎮 **Tournament Issue Ticket**\n\nPlease provide:\n• Tournament ID or name\n• Description of your issue\n• Screenshots if applicable',
        technical: '🔧 **Technical Support Ticket**\n\nPlease describe:\n• What command/feature isn\'t working\n• Any error messages\n• What you were trying to do',
        profile: '👤 **Profile/Account Ticket**\n\nPlease describe:\n• Your account issue\n• What needs to be fixed\n• Your OTO ID (if applicable)',
        report: '📢 **User Report Ticket**\n\nPlease provide:\n• Username of reported user\n• Rule violation details\n• Evidence (screenshots/videos)\n• When it happened',
        general: '❓ **General Help Ticket**\n\nPlease describe your question or issue in detail.'
      };

      // Ticket embed
      const embed = new Discord.EmbedBuilder()
        .setTitle(`${categoryEmojis[category]} ${categoryNames[category]}`)
        .setDescription(`Welcome <@${interaction.user.id}>!\n\n${categoryInfo[category]}\n\n**Our staff will respond shortly!**`)
        .setColor('#3498db')
        .addFields(
          { name: '⏱️ Average Response Time', value: '5-10 minutes', inline: true },
          { name: '📋 Ticket ID', value: `\`${ticketId}\``, inline: true },
          { name: '📂 Category', value: categoryNames[category], inline: true },
          { name: '⚠️ Important', value: '• Be clear and detailed\n• Provide screenshots\n• Be patient and respectful\n• Wait for staff response', inline: false }
        )
        .setFooter({ text: 'Use buttons below to manage this ticket' })
        .setTimestamp();

      const row1 = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setEmoji('🔒')
            .setStyle(Discord.ButtonStyle.Danger),
          new Discord.ButtonBuilder()
            .setCustomId('ticket_solved')
            .setLabel('Mark as Solved')
            .setEmoji('✅')
            .setStyle(Discord.ButtonStyle.Success),
          new Discord.ButtonBuilder()
            .setCustomId('delete_ticket')
            .setLabel('Delete Ticket')
            .setEmoji('🗑️')
            .setStyle(Discord.ButtonStyle.Danger)
        );

      const row2 = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Claim Ticket')
            .setEmoji('👋')
            .setStyle(Discord.ButtonStyle.Primary),
          new Discord.ButtonBuilder()
            .setCustomId('add_user_ticket')
            .setLabel('Add User')
            .setEmoji('➕')
            .setStyle(Discord.ButtonStyle.Secondary),
          new Discord.ButtonBuilder()
            .setCustomId('ticket_transcript')
            .setLabel('Save Transcript')
            .setEmoji('💾')
            .setStyle(Discord.ButtonStyle.Secondary)
        );

      await ticketChannel.send({ 
        content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`,
        embeds: [embed], 
        components: [row1, row2] 
      });

      // Notify in staff chat
      const staffChat = await interaction.client.channels.fetch(CONFIG.STAFF_CHAT);
      const staffEmbed = new Discord.EmbedBuilder()
        .setTitle('🎫 New Ticket Created')
        .setDescription(`**Category:** ${categoryNames[category]}\n**User:** <@${interaction.user.id}>\n**Channel:** ${ticketChannel}`)
        .setColor('#ffaa00')
        .setTimestamp();
      
      await staffChat.send({ embeds: [staffEmbed] });

      await interaction.update({ 
        content: `✅ Ticket created successfully!\n\nGo to ${ticketChannel} and describe your issue.`, 
        components: []
      });

    } catch (error) {
      console.error('Ticket channel creation error:', error);
      await interaction.update({ 
        content: '❌ Failed to create ticket channel. Please contact an administrator!', 
        components: []
      });
    }
  }

  // Close Ticket Button
  if (interaction.customId === 'close_ticket') {
    const ticket = Array.from(dataManager.tickets.values()).find(t => t.channelId === interaction.channel.id);
    
    if (!ticket) {
      await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
      return;
    }

    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE) && ticket.userId !== interaction.user.id) {
      await interaction.reply({ content: '❌ Only staff or ticket owner can close!', ephemeral: true });
      return;
    }

    ticket.status = 'closing';
    
    const embed = new Discord.EmbedBuilder()
      .setTitle('🔒 Ticket Closing')
      .setDescription('This ticket will be deleted in **10 seconds**.\n\nClick "Reopen" to cancel.')
      .setColor('#ff0000')
      .setTimestamp();

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId('reopen_ticket')
          .setLabel('Reopen Ticket')
          .setEmoji('🔓')
          .setStyle(Discord.ButtonStyle.Success)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
    
    ticket.closeTimer = setTimeout(async () => {
      try {
        dataManager.tickets.delete(ticket.id);
        await interaction.channel.delete();
      } catch (err) {
        console.error('Channel delete error:', err);
      }
    }, 10000);
  }

  // Reopen Ticket
  if (interaction.customId === 'reopen_ticket') {
    const ticket = Array.from(dataManager.tickets.values()).find(t => t.channelId === interaction.channel.id);
    
    if (ticket && ticket.closeTimer) {
      clearTimeout(ticket.closeTimer);
      ticket.status = 'open';
      ticket.closeTimer = null;

      await interaction.update({ 
        content: '✅ Ticket reopened!',
        embeds: [],
        components: []
      });
    }
  }

  // Delete Ticket Immediately
  if (interaction.customId === 'delete_ticket') {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    const ticket = Array.from(dataManager.tickets.values()).find(t => t.channelId === interaction.channel.id);
    
    await interaction.reply('🗑️ Deleting ticket immediately...');
    
    setTimeout(async () => {
      try {
        if (ticket) dataManager.tickets.delete(ticket.id);
        await interaction.channel.delete();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }, 2000);
  }

  // Mark as Solved
  if (interaction.customId === 'ticket_solved') {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('✅ Ticket Solved')
      .setDescription('This ticket has been marked as solved!\n\nIf your issue is resolved, you can close the ticket.\nIf you need further help, please let us know.')
      .setColor('#00ff00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  // Claim Ticket
  if (interaction.customId === 'claim_ticket') {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    const ticket = Array.from(dataManager.tickets.values()).find(t => t.channelId === interaction.channel.id);
    
    if (ticket) {
      ticket.claimedBy = interaction.user.id;
      
      await interaction.reply({
        content: `✅ Ticket claimed by <@${interaction.user.id}>! They will handle this issue.`,
        allowedMentions: { parse: [] }
      });
    }
  }

  // Add User to Ticket
  if (interaction.customId === 'add_user_ticket') {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    await interaction.reply({ 
      content: '👤 **Add User to Ticket**\n\nMention the user in chat to add them to this ticket.',
      ephemeral: true 
    });
  }

  // Save Transcript
  if (interaction.customId === 'ticket_transcript') {
    if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
      await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
      return;
    }

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const transcript = messages.reverse().map(m => 
        `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`
      ).join('\n');

      const ticket = Array.from(dataManager.tickets.values()).find(t => t.channelId === interaction.channel.id);
      
      // Send to staff chat
      const staffChat = await interaction.client.channels.fetch(CONFIG.STAFF_CHAT);
      await staffChat.send({
        content: `📝 **Ticket Transcript** - ID: ${ticket?.id || 'Unknown'}`,
        files: [{
          attachment: Buffer.from(transcript),
          name: `ticket-${ticket?.id || Date.now()}.txt`
        }]
      });

      await interaction.reply({ content: '✅ Transcript saved to staff chat!', ephemeral: true });
    } catch (err) {
      console.error('Transcript error:', err);
      await interaction.reply({ content: '❌ Failed to save transcript!', ephemeral: true });
    }
  }

  // Tournament Join Button
  if (interaction.customId.startsWith('join_tournament_')) {
    const tournamentId = interaction.customId.replace('join_tournament_', '');
    const tournament = dataManager.tournaments.get(tournamentId);
    
    if (!tournament) {
      await interaction.reply({ 
        content: '❌ Tournament not found!', 
        ephemeral: true 
      });
      return;
    }

    // Check if user has profile
    if (!dataManager.hasProfile(interaction.user.id)) {
      await interaction.reply({ 
        content: '❌ Please complete your profile first! Check your DMs.', 
        ephemeral: true 
      });
      return;
    }

    // Check invites for free tournaments
    if (tournament.entry === 'Free') {
      const invites = dataManager.getInvites(interaction.user.id);
      if (invites < CONFIG.MIN_INVITES) {
        await interaction.reply({ 
          content: `❌ You need ${CONFIG.MIN_INVITES} invites for FREE entry! You have ${invites}.`, 
          ephemeral: true 
        });
        return;
      }
    }

    // Check if already registered
    if (tournament.players.has(interaction.user.id)) {
      await interaction.reply({ 
        content: '❌ You are already registered!', 
        ephemeral: true 
      });
      return;
    }

    // Check slots
    if (tournament.players.size >= tournament.maxSlots) {
      await interaction.reply({ 
        content: '❌ Tournament is full!', 
        ephemeral: true 
      });
      return;
    }

    // Create registration ticket
    const category = interaction.guild.channels.cache.get(CONFIG.STAFF_TOOLS)?.parent;
    const regChannel = await interaction.guild.channels.create({
      name: `reg-${interaction.user.username}-${tournamentId.slice(-6)}`,
      type: Discord.ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [Discord.PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages]
        },
        {
          id: CONFIG.STAFF_ROLE,
          allow: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages]
        }
      ]
    });

    // Registration embed
    const regEmbed = new Discord.EmbedBuilder()
      .setTitle(`🎮 Tournament Registration - ${tournament.title}`)
      .setDescription(`Welcome <@${interaction.user.id}>!`)
      .setColor('#00ff00')
      .addFields(
        { name: '🏆 Prize Pool', value: tournament.prize, inline: true },
        { name: '💰 Entry Fee', value: tournament.entry, inline: true },
        { name: '📊 Slots', value: `${tournament.players.size + 1}/${tournament.maxSlots}`, inline: true }
      );

    if (tournament.entry === 'Free') {
      regEmbed.addFields({ 
        name: '✅ Registration Confirmed', 
        value: 'You are registered! Wait for room details.', 
        inline: false 
      });
      
      tournament.players.set(interaction.user.id, {
        userId: interaction.user.id,
        username: interaction.user.username,
        status: 'confirmed',
        registeredAt: new Date()
      });
      
      await regChannel.send({ embeds: [regEmbed] });
      
    } else {
      regEmbed.addFields({ 
        name: '💳 Payment Required', 
        value: `Please send payment screenshot.\n**Amount:** ${tournament.entry}\n**UPI:** yourupi@okaxis\n\nStaff will verify and confirm your slot!`, 
        inline: false 
      });

      const approveRow = new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setCustomId(`approve_payment_${interaction.user.id}_${tournamentId}`)
            .setLabel('Approve Payment')
            .setEmoji('✅')
            .setStyle(Discord.ButtonStyle.Success),
          new Discord.ButtonBuilder()
            .setCustomId(`reject_payment_${interaction.user.id}_${tournamentId}`)
            .setLabel('Reject Payment')
            .setEmoji('❌')
            .setStyle(Discord.ButtonStyle.Danger)
        );

      await regChannel.send({ 
        content: `<@${interaction.user.id}> <@&${CONFIG.STAFF_ROLE}>`,
        embeds: [regEmbed], 
        components: [approveRow] 
      });
    }

    await interaction.reply({ 
      content: `✅ Registration started! Go to ${regChannel}`, 
      ephemeral: true 
    });
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

    if (tournament) {
      tournament.players.set(userId, {
        userId,
        status: 'confirmed',
        approvedBy: interaction.user.id,
        approvedAt: new Date()
      });

      await interaction.reply(`✅ Payment approved! <@${userId}> is now registered!`);
      
      // Update slot count
      await interaction.message.edit({
        embeds: [interaction.message.embeds[0].setColor('#00ff00')],
        components: []
      });
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

    await interaction.reply(`❌ Payment rejected for <@${userId}>. Please resubmit correct proof.`);
    await interaction.message.edit({
      embeds: [interaction.message.embeds[0].setColor('#ff0000')],
      components: []
    });
  }
});

// ==================== STAFF COMMANDS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // Create Tournament Command
  if (command === '!createtournament' || command === '!ct') {
    const embed = new Discord.EmbedBuilder()
      .setTitle('🎮 Create Tournament')
      .setDescription('Select tournament template:')
      .setColor('#3498db');

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId('tournament_template')
          .setPlaceholder('Select Template')
          .addOptions([
            {
              label: 'Free Fire Solo - ₹500 (Free Entry)',
              description: '50 slots, 7:00 PM IST',
              value: 'ff_solo_free'
            },
            {
              label: 'Free Fire Solo - ₹1000 (₹20 Entry)',
              description: '50 slots, 8:00 PM IST',
              value: 'ff_solo_20'
            },
            {
              label: 'Minecraft Build Contest - ₹1000',
              description: '30 slots, Free Entry',
              value: 'mc_build_free'
            },
            {
              label: 'Custom Tournament',
              description: 'Create with custom settings',
              value: 'custom'
            }
          ])
      );

    await message.reply({ embeds: [embed], components: [row] });
  }

  // Ban command
  if (command === '!ban') {
    const user = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';
    
    if (!user) {
      await message.reply('❌ Please mention a user to ban!');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.ban({ reason });
      await message.reply(`✅ Banned ${user.tag} for: ${reason}`);
    } catch (err) {
      await message.reply(`❌ Failed to ban user: ${err.message}`);
    }
  }

  // Timeout command
  if (command === '!timeout') {
    const user = message.mentions.users.first();
    const duration = parseInt(args[2]) * 60000 || 600000;
    const reason = args.slice(3).join(' ') || 'No reason provided';
    
    if (!user) {
      await message.reply('❌ Please mention a user!');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.timeout(duration, reason);
      await message.reply(`✅ Timed out ${user.tag} for ${args[2] || 10} minutes`);
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

  // Remove timeout
  if (command === '!untimeout') {
    const user = message.mentions.users.first();
    
    if (!user) {
      await message.reply('❌ Please mention a user!');
      return;
    }

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.timeout(null);
      await message.reply(`✅ Removed timeout from ${user.tag}`);
    } catch (err) {
      await message.reply(`❌ Failed: ${err.message}`);
    }
  }

// ==================== TOURNAMENT CREATION WITH SELECT MENU ====================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'tournament_template') {
    const template = interaction.values[0];
    
    let tournamentData = {};
    
    switch(template) {
      case 'ff_solo_free':
        tournamentData = {
          title: 'Free Fire Solo Tournament',
          game: 'Free Fire',
          type: 'Solo',
          prize: '₹500',
          entry: 'Free',
          maxSlots: 50,
          time: '7:00 PM IST',
          image: 'https://i.ibb.co/8XQkZhJ/freefire.png'
        };
        break;
      case 'ff_solo_20':
        tournamentData = {
          title: 'Free Fire Solo Tournament',
          game: 'Free Fire',
          type: 'Solo',
          prize: '₹1000',
          entry: '₹20',
          maxSlots: 50,
          time: '8:00 PM IST',
          image: 'https://i.ibb.co/8XQkZhJ/freefire.png'
        };
        break;
      case 'mc_build_free':
        tournamentData = {
          title: 'Minecraft Building Contest',
          game: 'Minecraft',
          type: 'Solo',
          prize: '₹1000',
          entry: 'Free',
          maxSlots: 30,
          time: '8:00 PM IST',
          image: 'https://i.ibb.co/VgTY8Lq/minecraft.png'
        };
        break;
      case 'custom':
        await interaction.reply({ 
          content: '🎮 **Custom Tournament Creation**\n\nUse: `!ct <title> <game> <prize> <entry> <slots> <time>`\nExample: `!ct "PUBG Squad" PUBG ₹2000 ₹50 100 9PM`', 
          ephemeral: true 
        });
        return;
    }

    // Create tournament
    const tournamentId = `T-${Date.now()}`;
    const tournament = {
      id: tournamentId,
      ...tournamentData,
      createdBy: interaction.user.id,
      createdAt: new Date(),
      status: 'registration',
      players: new Map(),
      roomDetails: null
    };

    dataManager.tournaments.set(tournamentId, tournament);

    // Post in Tournament Schedule
    const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
    const embed = new Discord.EmbedBuilder()
      .setTitle(`🏆 ${tournament.title}`)
      .setDescription(`**${tournament.game}** Tournament - ${tournament.type} Mode`)
      .setColor('#00ff00')
      .addFields(
        { name: '💰 Prize Pool', value: tournament.prize, inline: true },
        { name: '🎫 Entry Fee', value: tournament.entry, inline: true },
        { name: '📊 Slots', value: `0/${tournament.maxSlots}`, inline: true },
        { name: '⏰ Time', value: tournament.time, inline: true },
        { name: '📋 Tournament ID', value: tournamentId, inline: true },
        { name: '✅ Status', value: '🟢 Registration Open', inline: true }
      )
      .setImage(tournament.image)
      .setFooter({ text: 'Click JOIN to register!' })
      .setTimestamp();

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(`join_tournament_${tournamentId}`)
          .setLabel('JOIN TOURNAMENT')
          .setEmoji('🎮')
          .setStyle(Discord.ButtonStyle.Success)
      );

    const scheduleMsg = await scheduleChannel.send({ embeds: [embed], components: [row] });

    // Post in General Chat (spam every 2 minutes)
    const spamTournament = async () => {
      try {
        const generalChannel = await client.channels.fetch(CONFIG.GENERAL_CHAT);
        await generalChannel.send({ 
          content: `🚨 **NEW TOURNAMENT ALERT!** 🚨\n\n${tournament.title} is now OPEN!\n\nCheck <#${CONFIG.TOURNAMENT_SCHEDULE}> to JOIN! 🎮`,
          embeds: [embed.setColor('#ff0000')],
          components: [row]
        });
      } catch (err) {
        console.error('Spam error:', err);
      }
    };

    // Spam 3 times (0, 2min, 4min)
    spamTournament();
    setTimeout(spamTournament, CONFIG.SPAM_INTERVAL);
    setTimeout(spamTournament, CONFIG.SPAM_INTERVAL * 2);

    // Also post to Minecraft channel if Minecraft tournament
    if (tournament.game === 'Minecraft') {
      try {
        const mcChannel = await client.channels.fetch(CONFIG.MINECRAFT_CHANNEL);
        await mcChannel.send({ embeds: [embed], components: [row] });
      } catch (err) {}
    }

    await interaction.reply({ 
      content: `✅ Tournament created successfully!\n\n**ID:** ${tournamentId}\n**Posted to:** #tournament-schedule, #general-chat${tournament.game === 'Minecraft' ? ', #minecraft' : ''}`, 
      ephemeral: true 
    });
  }
});

// ==================== TOURNAMENT MANAGEMENT COMMANDS ====================
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.channel.id !== CONFIG.STAFF_TOOLS) return;
  if (!message.member.roles.cache.has(CONFIG.STAFF_ROLE)) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // Start Tournament & Send Room Details
  if (command === '!startroom') {
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

    // Send room details to all registered players
    for (const [userId, playerData] of tournament.players.entries()) {
      try {
        const user = await client.users.fetch(userId);
        
        const embed = new Discord.EmbedBuilder()
          .setTitle(`🎮 ${tournament.title} - ROOM DETAILS`)
          .setDescription('**Tournament is LIVE! Join now!**')
          .setColor('#00ff00')
          .addFields(
            { name: '🔑 Room ID', value: `\`\`\`${roomId}\`\`\``, inline: false },
            { name: '🔒 Password', value: `\`\`\`${password}\`\`\``, inline: false },
            { name: '⚠️ Important', value: '• Join within 5 minutes\n• Screenshots required\n• Follow all rules\n• Good luck!', inline: false }
          )
          .setFooter({ text: '⚠️ DO NOT SHARE THESE DETAILS!' })
          .setTimestamp();

        await user.send({ embeds: [embed] });
      } catch (err) {
        console.log(`Could not DM user ${userId}`);
      }
    }

    // Update tournament message
    const scheduleChannel = await client.channels.fetch(CONFIG.TOURNAMENT_SCHEDULE);
    const embed = new Discord.EmbedBuilder()
      .setTitle(`🎮 ${tournament.title} - LIVE NOW!`)
      .setDescription(`**${tournament.game}** Tournament - In Progress`)
      .setColor('#ff0000')
      .addFields(
        { name: '💰 Prize Pool', value: tournament.prize, inline: true },
        { name: '👥 Players', value: `${tournament.players.size}`, inline: true },
        { name: '✅ Status', value: '🔴 LIVE', inline: true }
      )
      .setImage(tournament.image)
      .setFooter({ text: 'Tournament in progress!' })
      .setTimestamp();

    await scheduleChannel.send({ embeds: [embed] });
    await message.reply(`✅ Room details sent to ${tournament.players.size} players!`);
  }

  // End Tournament & Declare Winners
  if (command === '!endtournament') {
    const tournamentId = args[1];
    const tournament = dataManager.tournaments.get(tournamentId);

    if (!tournament) {
      await message.reply('❌ Tournament not found!');
      return;
    }

    await message.reply('Please mention winners in order:\n`!winners <tournamentID> @first @second @third`');
  }

  // Declare Winners
  if (command === '!winners') {
    const tournamentId = args[1];
    const tournament = dataManager.tournaments.get(tournamentId);

    if (!tournament) {
      await message.reply('❌ Tournament not found!');
      return;
    }

    const winners = message.mentions.users.map((user, index) => ({
      position: index + 1,
      user: user
    }));

    if (winners.length === 0) {
      await message.reply('❌ Please mention at least one winner!');
      return;
    }

    tournament.status = 'completed';
    tournament.winners = winners;
    tournament.endedAt = new Date();

    // Calculate prizes
    const totalPrize = parseInt(tournament.prize.replace(/[^0-9]/g, ''));
    const prizeDistribution = {
      1: totalPrize * 0.5,  // 50%
      2: totalPrize * 0.3,  // 30%
      3: totalPrize * 0.2   // 20%
    };

    // Winner announcement embed
    const embed = new Discord.EmbedBuilder()
      .setTitle(`🏆 ${tournament.title} - RESULTS`)
      .setDescription('**Tournament Completed! Congratulations to all winners!**')
      .setColor('#ffd700')
      .setImage('https://i.ibb.co/jkBSmkM/qr.png');

    winners.forEach(winner => {
      const prize = prizeDistribution[winner.position] || 0;
      const medal = winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉';
      embed.addFields({
        name: `${medal} Position ${winner.position}`,
        value: `${winner.user}\n💰 Prize: ₹${prize.toFixed(0)}`,
        inline: true
      });

      // Update user stats
      const profile = dataManager.getProfile(winner.user.id);
      if (profile) {
        profile.tournaments++;
        if (winner.position === 1) profile.wins++;
      }
    });

    embed.addFields({
      name: '📊 Tournament Stats',
      value: `Total Players: ${tournament.players.size}\nPrize Pool: ${tournament.prize}\nGame: ${tournament.game}`,
      inline: false
    });

    // Post to announcements
    const announceChannel = await client.channels.fetch(CONFIG.ANNOUNCEMENT_CHANNEL);
    await announceChannel.send({ 
      content: '@everyone\n\n🎉 **TOURNAMENT RESULTS ANNOUNCED!** 🎉',
      embeds: [embed] 
    });

    // Update leaderboard
    winners.forEach(winner => {
      const game = tournament.game.toLowerCase().replace(' ', '');
      const leaderboard = game === 'freefire' ? dataManager.tournamentLeaderboard.freefire : 
                          game === 'minecraft' ? dataManager.tournamentLeaderboard.minecraft :
                          dataManager.tournamentLeaderboard.freefire;
      
      const current = leaderboard.get(winner.user.id) || { wins: 0, tournaments: 0, totalPrize: 0 };
      current.tournaments++;
      if (winner.position === 1) current.wins++;
      current.totalPrize += prizeDistribution[winner.position] || 0;
      leaderboard.set(winner.user.id, current);
    });

    await message.reply('✅ Winners announced successfully!');
  }

  // Show Tournament Leaderboard
  if (command === '!leaderboard') {
    const game = args[1]?.toLowerCase() || 'freefire';
    const leaderboard = game === 'freefire' ? dataManager.tournamentLeaderboard.freefire :
                        game === 'minecraft' ? dataManager.tournamentLeaderboard.minecraft :
                        dataManager.tournamentLeaderboard.freefire;

    const sorted = Array.from(leaderboard.entries())
      .sort((a, b) => b[1].wins - a[1].wins)
      .slice(0, 10);

    const embed = new Discord.EmbedBuilder()
      .setTitle(`🏆 ${game.toUpperCase()} Tournament Leaderboard`)
      .setDescription('Top 10 Players')
      .setColor('#ffd700');

    let description = '';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, stats] = sorted[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      description += `${medal} <@${userId}>\n`;
      description += `   Wins: ${stats.wins} | Tournaments: ${stats.tournaments} | Earned: ₹${stats.totalPrize.toFixed(0)}\n\n`;
    }

    embed.setDescription(description || 'No data yet!');

    // Post to leaderboard channel
    const leaderboardChannel = await client.channels.fetch(CONFIG.LEADERBOARD_CHANNEL);
    await leaderboardChannel.send({ embeds: [embed] });
    await message.reply('✅ Leaderboard posted!');
  }

  // Delete Tournament
  if (command === '!deletetournament') {
    const tournamentId = args[1];
    
    if (!tournamentId) {
      await message.reply('❌ Usage: `!deletetournament <tournamentID>`');
      return;
    }

    if (dataManager.tournaments.delete(tournamentId)) {
      await message.reply(`✅ Tournament ${tournamentId} deleted!`);
    } else {
      await message.reply('❌ Tournament not found!');
    }
  }

  // List Active Tournaments
  if (command === '!tournaments') {
    const active = Array.from(dataManager.tournaments.values());
    
    if (active.length === 0) {
      await message.reply('No active tournaments!');
      return;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('🎮 Active Tournaments')
      .setColor('#3498db');

    active.forEach(t => {
      embed.addFields({
        name: `${t.title} (${t.id})`,
        value: `Game: ${t.game} | Prize: ${t.prize} | Players: ${t.players.size}/${t.maxSlots} | Status: ${t.status}`,
        inline: false
      });
    });

    await message.reply({ embeds: [embed] });
  }
});

// ==================== INVITE TRACKER ====================
setInterval(async () => {
  try {
    for (const guild of client.guilds.cache.values()) {
      const inviteChannel = await client.channels.fetch(CONFIG.INVITE_TRACKER);
      
      // Get top inviters
      const invites = Array.from(dataManager.userInvites.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const embed = new Discord.EmbedBuilder()
        .setTitle('📊 Top Inviters - Leaderboard')
        .setDescription('Invite friends to climb the leaderboard!')
        .setColor('#f1c40f')
        .setTimestamp();

      let description = '';
      for (let i = 0; i < invites.length; i++) {
        const [userId, count] = invites[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        description += `${medal} <@${userId}> - **${count}** invites\n`;
      }

      embed.setDescription(description || 'No invites yet!');

      const messages = await inviteChannel.messages.fetch({ limit: 1 });
      if (messages.size > 0 && messages.first().author.id === client.user.id) {
        await messages.first().edit({ embeds: [embed] });
      } else {
        await inviteChannel.send({ embeds: [embed] });
      }
    }
  } catch (err) {
    console.error('Leaderboard update error:', err);
  }
}, 300000); // Every 5 minutes

// ==================== BOT READY ====================
client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  console.log(`👥 Monitoring ${client.users.cache.size} users`);

  // Set status
  client.user.setPresence({
    activities: [{ name: '🏆 OTO Tournaments | Say Hi!', type: Discord.ActivityType.Playing }],
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
    } catch (err) {
      console.log('Could not fetch invites for', guild.name);
    }
  }

  console.log('✅ All systems operational!');
});

// ==================== ERROR HANDLING ====================
client.on('error', err => console.error('Client error:', err));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));

// ==================== LOGIN ====================
client.login(BOT_TOKEN)
  .then(() => console.log('🚀 Bot logged in successfully!'))
  .catch(err => {
    console.error('❌ Login failed:', err);
    process.exit(1);
  });
