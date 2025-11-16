const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

// In-Memory Storage (No Database)
const storage = {
    users: new Map(),
    tournaments: new Map(),
    tickets: new Map(),
    invites: new Map(),
    pendingResponses: new Map(),
    userMessages: new Map(),
    warnings: new Map(),
    timeouts: new Map(),
    leaderboards: new Map()
};

client.storage = storage;

// Helper Functions
function generateOTOId() {
    return 'OTO' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateTicketId() {
    return 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateTournamentId() {
    return 'TOUR-' + Date.now();
}

function checkProfanity(message) {
    const profanityWords = config.PROFANITY_FILTER || ['mc', 'bc', 'bkl', 'tmkc', 'madarchod', 'behenchod', 'chutiya', 'fuck', 'shit', 'bitch'];
    const lowerMessage = message.toLowerCase();
    return profanityWords.some(word => lowerMessage.includes(word));
}

function detectGender(username, message) {
    const femaleIndicators = ['priya', 'anjali', 'sneha', 'riya', 'girl', 'sis', 'didi'];
    const nameLower = username.toLowerCase();
    const messageLower = message.toLowerCase();
    
    if (femaleIndicators.some(indicator => nameLower.includes(indicator) || messageLower.includes(indicator))) {
        return 'female';
    }
    return 'male';
}

function getRandomResponse(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Bot Ready Event
client.once('ready', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ${client.user.tag} is ONLINE!`);
    console.log(`🎮 OTO Tournament Bot v2.0`);
    console.log(`📊 Servers: ${client.guilds.cache.size}`);
    console.log(`👥 Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    client.user.setPresence({
        activities: [{ name: '🏆 OTO Tournaments | -help', type: 0 }],
        status: 'online'
    });

    // Cache invites
    const guild = client.guilds.cache.get(config.GUILD_ID);
    if (guild) {
        const invites = await guild.invites.fetch();
        invites.forEach(invite => {
            storage.invites.set(invite.code, { uses: invite.uses, inviter: invite.inviter.id });
        });
    }

    // Send bot online message to staff channel
    const staffChannel = guild.channels.cache.get(config.CHANNELS.STAFF_CHAT);
    if (staffChannel) {
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🤖 OTO Bot Online!')
            .setDescription('Bot is now active and ready to manage tournaments!')
            .addFields(
                { name: '🔄 Status', value: 'All systems operational', inline: true },
                { name: '⚡ Version', value: '2.0.0', inline: true }
            )
            .setTimestamp();
        staffChannel.send({ embeds: [embed] });
    }
});

// Member Join Event
client.on('guildMemberAdd', async (member) => {
    const generalChannel = member.guild.channels.cache.get(config.CHANNELS.GENERAL_CHAT);
    const inviteTracker = member.guild.channels.cache.get(config.CHANNELS.INVITE_TRACKER);
    
    // Track who invited
    const newInvites = await member.guild.invites.fetch();
    let inviter = null;
    
    newInvites.forEach(invite => {
        const oldInvite = storage.invites.get(invite.code);
        if (oldInvite && invite.uses > oldInvite.uses) {
            inviter = invite.inviter;
            storage.invites.set(invite.code, { uses: invite.uses, inviter: invite.inviter.id });
            
            // Update inviter stats
            let inviterData = storage.users.get(invite.inviter.id) || { invites: 0, invitedUsers: [] };
            inviterData.invites = (inviterData.invites || 0) + 1;
            inviterData.invitedUsers = inviterData.invitedUsers || [];
            inviterData.invitedUsers.push(member.id);
            storage.users.set(invite.inviter.id, inviterData);
            
            // Check for invite rewards
            checkInviteRewards(invite.inviter, inviterData.invites);
        }
    });

    // Welcome message in general
    if (generalChannel) {
        const welcomeMsg = getRandomResponse(config.AUTO_RESPONSES.NEW_MEMBER);
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎉 New Player Joined!')
            .setDescription(`${welcomeMsg}\n\nWelcome ${member}!`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '👤 Member', value: `${member}`, inline: true },
                { name: '📊 Member #', value: `${member.guild.memberCount}`, inline: true },
                { name: '📅 Joined', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            );

        if (inviter) {
            embed.addFields({ name: '🎯 Invited by', value: `${inviter}`, inline: true });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_profile')
                    .setLabel('📝 Create Profile')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('view_tournaments')
                    .setLabel('🏆 View Tournaments')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('how_to_join')
                    .setLabel('❓ How to Join')
                    .setStyle(ButtonStyle.Secondary)
            );

        generalChannel.send({ embeds: [embed], components: [row] });
    }

    // Log in invite tracker
    if (inviteTracker && inviter) {
        const embed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle('📊 Invite Tracked')
            .addFields(
                { name: '👤 New Member', value: `${member} (${member.user.tag})`, inline: false },
                { name: '🎯 Invited By', value: `${inviter} (${inviter.tag})`, inline: false },
                { name: '📈 Total Invites', value: `${storage.users.get(inviter.id)?.invites || 1}`, inline: true },
                { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setTimestamp();
        inviteTracker.send({ embeds: [embed] });
    }

    // Send DM for profile creation
    try {
        const dmEmbed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🎮 Welcome to OTO Tournaments!')
            .setDescription('Complete your profile to join tournaments and unlock exclusive features!')
            .addFields(
                { name: '📝 What you need', value: '• Your Name\n• Gender\n• State\n• Favorite Game\n• In-game Name', inline: false },
                { name: '🎁 Benefits', value: '• Join tournaments\n• Track your stats\n• Win prizes\n• Get special roles', inline: false }
            )
            .setFooter({ text: 'Click the button below to start!' });

        const dmRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_profile_creation')
                    .setLabel('🚀 Create Profile Now')
                    .setStyle(ButtonStyle.Success)
            );

        await member.send({ embeds: [dmEmbed], components: [dmRow] });
    } catch (error) {
        console.log(`Could not send DM to ${member.user.tag}`);
    }
});

// Message Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild && message.channel.type === ChannelType.DM) return;

    const userId = message.author.id;
    const channelId = message.channelId;

    // Profanity Filter
    if (checkProfanity(message.content)) {
        let warnings = storage.warnings.get(userId) || 0;
        warnings++;
        storage.warnings.set(userId, warnings);

        try {
            await message.delete();
            
            const warnEmbed = new EmbedBuilder()
                .setColor('#ff0055')
                .setTitle('⚠️ Warning: Profanity Detected')
                .setDescription(`${message.author}, please avoid using bad words!`)
                .addFields(
                    { name: '🔢 Warnings', value: `${warnings}/3`, inline: true },
                    { name: '⚡ Action', value: warnings >= 3 ? 'Timeout issued' : 'Message deleted', inline: true }
                )
                .setFooter({ text: '3 warnings = Automatic timeout' });

            const warning Msg = await message.channel.send({ embeds: [warnEmbed] });

            if (warnings >= 3) {
                const member = message.guild.members.cache.get(userId);
                if (member) {
                    await member.timeout(10 * 60 * 1000, 'Profanity - 3 warnings');
                    storage.warnings.set(userId, 0); // Reset warnings
                }
            }

            // Log to staff channel
            const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_TOOLS);
            if (staffChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff0055')
                    .setTitle('🚨 Profanity Alert')
                    .addFields(
                        { name: 'User', value: `${message.author} (${message.author.tag})`, inline: true },
                        { name: 'Channel', value: `<#${channelId}>`, inline: true },
                        { name: 'Warnings', value: `${warnings}/3`, inline: true },
                        { name: 'Message', value: message.content.substring(0, 100), inline: false }
                    )
                    .setTimestamp();
                staffChannel.send({ embeds: [logEmbed] });
            }

            setTimeout(() => warningMsg.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error('Error handling profanity:', error);
        }
        return;
    }

    // Spam Detection
    if (channelId === config.CHANNELS.GENERAL_CHAT) {
        let userMsgs = storage.userMessages.get(userId) || [];
        userMsgs.push(Date.now());
        userMsgs = userMsgs.filter(time => Date.now() - time < 10000); // Last 10 seconds

        if (userMsgs.length > 5) {
            const member = message.guild.members.cache.get(userId);
            if (member && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                try {
                    await member.timeout(5 * 60 * 1000, 'Spamming');
                    
                    const spamEmbed = new EmbedBuilder()
                        .setColor('#ff0055')
                        .setTitle('🚫 Spam Detected')
                        .setDescription(`${message.author} has been timed out for spamming!`)
                        .addFields({ name: '⏰ Duration', value: '5 minutes' })
                        .setTimestamp();
                    
                    message.channel.send({ embeds: [spamEmbed] });
                    storage.userMessages.delete(userId);
                } catch (error) {
                    console.error('Error timing out user:', error);
                }
            }
            return;
        }
        storage.userMessages.set(userId, userMsgs);
    }

    // Auto Response for unanswered messages
    if (channelId === config.CHANNELS.GENERAL_CHAT) {
        const msgContent = message.content.toLowerCase();
        
        // Detect greetings
        if (msgContent.match(/^(hi|hello|hey|sup|yo|kya|kese|kaise)/i)) {
            const userData = storage.users.get(userId) || {};
            const gender = userData.gender || detectGender(message.author.username, message.content);
            
            storage.pendingResponses.set(message.id, {
                userId: userId,
                timestamp: Date.now(),
                message: message.content,
                gender: gender
            });

            setTimeout(async () => {
                const pending = storage.pendingResponses.get(message.id);
                if (!pending) return;

                // Check if anyone replied
                const replies = await message.channel.messages.fetch({ after: message.id, limit: 10 });
                const hasReply = replies.some(m => 
                    m.reference?.messageId === message.id || 
                    m.content.includes(message.author.id) ||
                    m.createdTimestamp - message.createdTimestamp < 120000
                );

                if (!hasReply) {
                    const responses = gender === 'female' ? 
                        config.AUTO_RESPONSES.FEMALE_GREETINGS : 
                        config.AUTO_RESPONSES.MALE_GREETINGS;
                    
                    const response = getRandomResponse(responses);
                    
                    const embed = new EmbedBuilder()
                        .setColor('#00aaff')
                        .setDescription(`${message.author} ${response}`)
                        .setFooter({ text: 'OTO Bot Auto Response' });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('view_tournaments_auto')
                                .setLabel('🏆 View Tournaments')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('join_tournament_auto')
                                .setLabel('✅ Join Now')
                                .setStyle(ButtonStyle.Success)
                        );

                    message.reply({ embeds: [embed], components: [row] });
                }
                
                storage.pendingResponses.delete(message.id);
            }, 120000); // 2 minutes
        }

        // Bot mention response
        if (message.mentions.has(client.user)) {
            const embed = new EmbedBuilder()
                .setColor('#7289da')
                .setTitle('👋 Hey there!')
                .setDescription('Main OTO Tournament Bot hoon!')
                .addFields(
                    { name: '🏆 Tournaments', value: '<#' + config.CHANNELS.TOURNAMENT_SCHEDULE + '>', inline: true },
                    { name: '📖 How to Join', value: '<#' + config.CHANNELS.HOW_TO_JOIN + '>', inline: true },
                    { name: '📜 Rules', value: '<#' + config.CHANNELS.RULES + '>', inline: true },
                    { name: '🎫 Support', value: 'Open ticket: <#' + config.CHANNELS.OPEN_TICKET + '>', inline: false }
                )
                .setFooter({ text: 'Use -help for commands' });

            message.reply({ embeds: [embed] });
        }

        // "Staff" tag detection
        if (msgContent.includes('@staff') || msgContent.includes('staff') || msgContent.includes('admin')) {
            const embed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('⏳ Please Wait')
                .setDescription('Staff members ko notify kar diya hai! Jaldi hi reply mil jayega.')
                .setFooter({ text: 'Average response time: 5-10 minutes' });

            message.reply({ embeds: [embed] });

            // Notify staff
            const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_CHAT);
            if (staffChannel) {
                const notif = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🔔 Staff Needed')
                    .addFields(
                        { name: 'User', value: `${message.author}`, inline: true },
                        { name: 'Channel', value: `<#${channelId}>`, inline: true },
                        { name: 'Message', value: message.content.substring(0, 200), inline: false }
                    )
                    .setTimestamp();

                const staffRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Go to Message')
                            .setStyle(ButtonStyle.Link)
                            .setURL(message.url)
                    );

                staffChannel.send({ embeds: [notif], components: [staffRow] });
            }
        }
    }

    // Command Handler (Prefix based)
    if (!message.content.startsWith(config.SETTINGS.PREFIX)) return;

    const args = message.content.slice(config.SETTINGS.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Help Command
    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#7289da')
            .setTitle('🤖 OTO Bot Commands')
            .setDescription('Here are all available commands:')
            .addFields(
                { name: '👤 User Commands', value: '`-profile` - View/Create profile\n`-invites` - Check invite stats\n`-stats` - View your tournament stats\n`-tournaments` - View active tournaments\n`-join` - Join a tournament', inline: false },
                { name: '🎫 Ticket Commands', value: '`-ticket` - Open a support ticket\n`-close` - Close your ticket', inline: false },
                { name: '🏆 Tournament Commands', value: '`-create-tournament` - Create tournament (Staff)\n`-edit-tournament` - Edit tournament (Staff)\n`-delete-tournament` - Delete tournament (Staff)', inline: false },
                { name: '🛡️ Staff Commands', value: '`-ban @user [reason]` - Ban user\n`-timeout @user [duration] [reason]` - Timeout user\n`-warn @user [reason]` - Warn user\n`-unwarn @user` - Remove warnings', inline: false }
            )
            .setFooter({ text: 'OTO Tournaments Bot v2.0' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Profile Command
    if (commandName === 'profile') {
        const userData = storage.users.get(userId);
        
        if (!userData || !userData.profileCompleted) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ No Profile Found')
                .setDescription('You need to create a profile first!\nCheck your DMs or click the button below.')
                .setFooter({ text: 'Profile is required to join tournaments' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_profile')
                        .setLabel('📝 Create Profile')
                        .setStyle(ButtonStyle.Success)
                );

            return message.reply({ embeds: [embed], components: [row] });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(`👤 ${userData.name}'s Profile`)
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: '🆔 OTO ID', value: userData.otoId, inline: true },
                { name: '⚧️ Gender', value: userData.gender || 'Not set', inline: true },
                { name: '📍 State', value: userData.state || 'Not set', inline: true },
                { name: '🎮 Favorite Game', value: userData.game || 'Not set', inline: true },
                { name: '🎯 IGN', value: userData.ign || 'Not set', inline: true },
                { name: '🎟️ Invites', value: `${userData.invites || 0}`, inline: true },
                { name: '🏆 Tournaments Played', value: `${userData.tournamentsPlayed || 0}`, inline: true },
                { name: '👑 Tournaments Won', value: `${userData.tournamentsWon || 0}`, inline: true },
                { name: '💰 Total Earnings', value: `₹${userData.totalEarnings || 0}`, inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Invites Command
    if (commandName === 'invites' || commandName === 'i') {
        const userData = storage.users.get(userId) || { invites: 0, invitedUsers: [] };
        const invites = userData.invites || 0;
        const target = config.SETTINGS.FREE_TOURNAMENT_INVITES || 10;
        const remaining = Math.max(0, target - invites);

        const embed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle('🎯 Your Invite Stats')
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: '📊 Total Invites', value: `${invites}`, inline: true },
                { name: '🎯 Target', value: `${target}`, inline: true },
                { name: '⏳ Remaining', value: `${remaining}`, inline: true }
            )
            .setDescription(invites >= target ? 
                '🎉 **Congratulations!** You unlocked FREE tournament entry!' : 
                `Invite ${remaining} more friends to unlock FREE tournament!`
            )
            .setFooter({ text: 'Share your invite link to earn rewards!' })
            .setTimestamp();

        if (invites > 0) {
            embed.addFields({ 
                name: '👥 Invited Users', 
                value: userData.invitedUsers?.slice(0, 5).map(id => `<@${id}>`).join(', ') || 'None',
                inline: false 
            });
        }

        return message.reply({ embeds: [embed] });
    }

    // Tournaments Command
    if (commandName === 'tournaments' || commandName === 't') {
        const tournaments = Array.from(storage.tournaments.values()).filter(t => t.status === 'active');
        
        if (tournaments.length === 0) {
            return message.reply('❌ No active tournaments right now. Check <#' + config.CHANNELS.TOURNAMENT_SCHEDULE + '> for updates!');
        }

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🏆 Active Tournaments')
            .setDescription('Here are all currently active tournaments:')
            .setTimestamp();

        tournaments.forEach(tour => {
            embed.addFields({
                name: `${tour.title} (${tour.game})`,
                value: `💰 Prize: ₹${tour.prizePool}\n👥 Slots: ${tour.slotsBooked}/${tour.totalSlots}\n💳 Entry Fee: ₹${tour.entryFee}\n⏰ ${tour.scheduledTime}`,
                inline: true
            });
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('join_tournament_list')
                    .setLabel('✅ Join Tournament')
                    .setStyle(ButtonStyle.Success)
            );

        return message.reply({ embeds: [embed], components: [row] });
    }

    // Staff Commands - Ban
    if (commandName === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ You don\'t have permission to use this command!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Please mention a user to ban!');

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await target.ban({ reason: reason });
            
            const embed = new EmbedBuilder()
                .setColor('#ff0055')
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Log to staff tools
            const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_TOOLS);
            if (staffChannel) {
                staffChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            message.reply('❌ Failed to ban user: ' + error.message);
        }
        return;
    }

    // Staff Commands - Timeout
    if (commandName === 'timeout' || commandName === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ You don\'t have permission to use this command!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Please mention a user to timeout!');

        const duration = parseInt(args[1]) || 10;
        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await target.timeout(duration * 60 * 1000, reason);
            
            const embed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('⏰ User Timed Out')
                .addFields(
                    { name: 'User', value: `${target.user.tag}`, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Log to staff tools
            const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_TOOLS);
            if (staffChannel) {
                staffChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            message.reply('❌ Failed to timeout user: ' + error.message);
        }
        return;
    }

    // Warn Command
    if (commandName === 'warn') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ You don\'t have permission to use this command!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Please mention a user to warn!');

        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        let warnings = storage.warnings.get(target.id) || 0;
        warnings++;
        storage.warnings.set(target.id, warnings);

        const embed = new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: 'User', value: `${target.user.tag}`, inline: true },
                { name: 'Warnings', value: `${warnings}/3`, inline: true },
                { name: 'Moderator', value: `${message.author.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setFooter({ text: '3 warnings = Automatic timeout' })
            .setTimestamp();

        message.reply({ embeds: [embed] });

        // DM user
        try {
            target.send({ embeds: [embed] });
        } catch (e) {}

        // Auto timeout at 3 warnings
        if (warnings >= 3) {
            await target.timeout(30 * 60 * 1000, 'Reached 3 warnings');
            message.channel.send(`🔨 ${target} has been timed out for 30 minutes (3 warnings reached)`);
            storage.warnings.set(target.id, 0);
        }

        // Log to staff tools
        const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_TOOLS);
        if (staffChannel) {
            staffChannel.send({ embeds: [embed] });
        }
        return;
    }
});

// Interaction Handler (Buttons, Modals, Select Menus)
client.on('interactionCreate', async (interaction) => {
    try {
        // Button Interactions
        if (interaction.isButton()) {
            const { customId, user, guild, channel } = interaction;

            // Create Profile Button
            if (customId === 'create_profile' || customId === 'start_profile_creation') {
                const modal = new ModalBuilder()
                    .setCustomId('profile_modal')
                    .setTitle('📝 Create Your OTO Profile');

                const nameInput = new TextInputBuilder()
                    .setCustomId('profile_name')
                    .setLabel('Your Full Name')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your real name')
                    .setRequired(true)
                    .setMaxLength(50);

                const stateInput = new TextInputBuilder()
                    .setCustomId('profile_state')
                    .setLabel('Your State')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., Maharashtra, Delhi, UP')
                    .setRequired(true)
                    .setMaxLength(50);

                const ignInput = new TextInputBuilder()
                    .setCustomId('profile_ign')
                    .setLabel('In-Game Name')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Your gaming username')
                    .setRequired(true)
                    .setMaxLength(50);

                const ageInput = new TextInputBuilder()
                    .setCustomId('profile_age')
                    .setLabel('Your Age')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your age (13+)')
                    .setRequired(true)
                    .setMaxLength(2);

                const row1 = new ActionRowBuilder().addComponents(nameInput);
                const row2 = new ActionRowBuilder().addComponents(stateInput);
                const row3 = new ActionRowBuilder().addComponents(ignInput);
                const row4 = new ActionRowBuilder().addComponents(ageInput);

                modal.addComponents(row1, row2, row3, row4);
                await interaction.showModal(modal);
            }

            // View Tournaments Button
            if (customId === 'view_tournaments' || customId === 'view_tournaments_auto') {
                const tournaments = Array.from(storage.tournaments.values()).filter(t => t.status === 'active');
                
                if (tournaments.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('❌ No Active Tournaments')
                        .setDescription('Check back later or enable notifications to get alerted when new tournaments start!')
                        .setFooter({ text: 'Stay tuned!' });
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                const options = tournaments.map(t => ({
                    label: `${t.title} (${t.game})`,
                    description: `₹${t.entryFee} Entry | ₹${t.prizePool} Prize | ${t.totalSlots - t.slotsBooked} slots left`,
                    value: t.id,
                    emoji: config.GAMES[t.game]?.emoji || '🎮'
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_tournament')
                    .setPlaceholder('Choose a tournament to join')
                    .addOptions(options);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🏆 Select Tournament')
                    .setDescription('Choose the tournament you want to join from the dropdown below:')
                    .setFooter({ text: 'Make sure you have completed your profile!' });

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }

            // Join Tournament Button
            if (customId === 'join_tournament_auto' || customId === 'join_tournament_list') {
                const userData = storage.users.get(user.id);
                
                if (!userData || !userData.profileCompleted) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('❌ Profile Required')
                        .setDescription('Please create your profile first before joining tournaments!')
                        .setFooter({ text: 'Click "Create Profile" button' });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('create_profile')
                                .setLabel('📝 Create Profile')
                                .setStyle(ButtonStyle.Success)
                        );

                    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
                }

                // Show tournament selection
                const tournaments = Array.from(storage.tournaments.values()).filter(t => t.status === 'active');
                
                if (tournaments.length === 0) {
                    return interaction.reply({ content: '❌ No active tournaments available!', ephemeral: true });
                }

                const options = tournaments.map(t => ({
                    label: `${t.title} (${t.game})`,
                    description: `₹${t.entryFee} | Prize: ₹${t.prizePool} | ${t.totalSlots - t.slotsBooked}/${t.totalSlots} slots`,
                    value: t.id,
                    emoji: config.GAMES[t.game]?.emoji || '🎮'
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_tournament')
                    .setPlaceholder('Choose tournament')
                    .addOptions(options);

                const row = new ActionRowBuilder().addComponents(selectMenu);
                await interaction.reply({ content: '🏆 Select a tournament:', components: [row], ephemeral: true });
            }

            // How to Join Button
            if (customId === 'how_to_join') {
                const embed = new EmbedBuilder()
                    .setColor('#00aaff')
                    .setTitle('📖 How to Join OTO Tournaments')
                    .setDescription('Follow these simple steps to participate:')
                    .addFields(
                        { name: '1️⃣ Create Profile', value: 'Complete your profile with basic info', inline: false },
                        { name: '2️⃣ Choose Tournament', value: 'Browse active tournaments in <#' + config.CHANNELS.TOURNAMENT_SCHEDULE + '>', inline: false },
                        { name: '3️⃣ Join & Pay', value: 'Click join button and complete payment', inline: false },
                        { name: '4️⃣ Get Room Details', value: 'Receive room ID & password before match', inline: false },
                        { name: '5️⃣ Play & Win', value: 'Play your best and claim prizes!', inline: false }
                    )
                    .setFooter({ text: 'Good luck! 🍀' });

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Close Ticket Button
            if (customId === 'close_ticket') {
                if (!channel.name.startsWith('ticket-')) {
                    return interaction.reply({ content: '❌ This is not a ticket channel!', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setColor('#ff0055')
                    .setTitle('🔒 Ticket Closed')
                    .setDescription(`Ticket closed by ${user}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                setTimeout(async () => {
                    try {
                        await channel.delete();
                        storage.tickets.delete(channel.id);
                    } catch (error) {
                        console.error('Error deleting ticket:', error);
                    }
                }, 10000);
            }

            // Confirm Payment Button (Staff only)
            if (customId.startsWith('confirm_payment_')) {
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ content: '❌ Only staff can confirm payments!', ephemeral: true });
                }

                const ticketData = storage.tickets.get(channel.id);
                if (!ticketData) {
                    return interaction.reply({ content: '❌ Ticket data not found!', ephemeral: true });
                }

                const tournament = storage.tournaments.get(ticketData.tournamentId);
                if (!tournament) {
                    return interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
                }

                // Update tournament slots
                tournament.slotsBooked++;
                const slotNumber = tournament.slotsBooked;
                
                if (!tournament.participants) tournament.participants = [];
                tournament.participants.push({
                    userId: ticketData.userId,
                    slotNumber: slotNumber,
                    teamName: ticketData.teamName,
                    paidAt: Date.now()
                });

                storage.tournaments.set(tournament.id, tournament);

                // Update ticket
                ticketData.paymentConfirmed = true;
                ticketData.slotNumber = slotNumber;
                storage.tickets.set(channel.id, ticketData);

                const embed = new EmbedBuilder()
                    .setColor('#00ff88')
                    .setTitle('✅ Payment Confirmed!')
                    .setDescription(`Payment verified by ${interaction.user}`)
                    .addFields(
                        { name: '🎫 Slot Number', value: `#${slotNumber}`, inline: true },
                        { name: '🏆 Tournament', value: tournament.title, inline: true },
                        { name: '👤 Player', value: `<@${ticketData.userId}>`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                // Update tournament schedule
                const scheduleChannel = guild.channels.cache.get(config.CHANNELS.TOURNAMENT_SCHEDULE);
                if (scheduleChannel && tournament.messageId) {
                    try {
                        const msg = await scheduleChannel.messages.fetch(tournament.messageId);
                        const updatedEmbed = EmbedBuilder.from(msg.embeds[0])
                            .setFields(
                                { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                                { name: '💳 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                                { name: '👥 Slots', value: `${tournament.slotsBooked}/${tournament.totalSlots}`, inline: true }
                            );
                        await msg.edit({ embeds: [updatedEmbed] });
                    } catch (e) {
                        console.error('Failed to update tournament message:', e);
                    }
                }

                // Notify user
                try {
                    const member = await guild.members.fetch(ticketData.userId);
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#00ff88')
                        .setTitle('🎉 Payment Confirmed!')
                        .setDescription(`Your slot for **${tournament.title}** is confirmed!`)
                        .addFields(
                            { name: '🎫 Your Slot', value: `#${slotNumber}`, inline: true },
                            { name: '⏰ Match Time', value: tournament.scheduledTime, inline: true },
                            { name: '📢 Important', value: 'Room details will be shared 10 minutes before the match starts!', inline: false }
                        )
                        .setFooter({ text: 'Good luck! 🍀' });

                    await member.send({ embeds: [dmEmbed] });
                } catch (e) {
                    console.log('Could not DM user');
                }
            }

            // Reject Payment Button (Staff only)
            if (customId.startsWith('reject_payment_')) {
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ content: '❌ Only staff can reject payments!', ephemeral: true });
                }

                const modal = new ModalBuilder()
                    .setCustomId('reject_reason_modal')
                    .setTitle('Reject Payment');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reject_reason')
                    .setLabel('Reason for rejection')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Enter reason...')
                    .setRequired(true);

                const row = new ActionRowBuilder().addComponents(reasonInput);
                modal.addComponents(row);
                await interaction.showModal(modal);
            }
        }

        // Select Menu Interactions
        if (interaction.isStringSelectMenu()) {
            const { customId, values, user, guild } = interaction;

            // Tournament Selection
            if (customId === 'select_tournament') {
                const tournamentId = values[0];
                const tournament = storage.tournaments.get(tournamentId);

                if (!tournament) {
                    return interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
                }

                if (tournament.slotsBooked >= tournament.totalSlots) {
                    return interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
                }

                // Check if user already joined
                if (tournament.participants?.some(p => p.userId === user.id)) {
                    return interaction.reply({ content: '❌ You already joined this tournament!', ephemeral: true });
                }

                // Check for free entry (10 invites)
                const userData = storage.users.get(user.id) || {};
                const hasFreeEntry = (userData.invites || 0) >= config.SETTINGS.FREE_TOURNAMENT_INVITES && !userData.usedFreeEntry;

                // Create private ticket
                const ticketId = generateTicketId();
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    parent: config.CHANNELS.OPEN_TICKET,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        },
                        {
                            id: config.ROLES.STAFF,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
                        }
                    ]
                });

                storage.tickets.set(ticketChannel.id, {
                    ticketId: ticketId,
                    userId: user.id,
                    tournamentId: tournament.id,
                    createdAt: Date.now(),
                    type: 'tournament_entry'
                });

                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle(`🎫 Tournament Entry - ${tournament.title}`)
                    .setDescription(`Welcome ${user}! Complete the following to confirm your slot:`)
                    .addFields(
                        { name: '🏆 Tournament', value: tournament.title, inline: true },
                        { name: '🎮 Game', value: tournament.game, inline: true },
                        { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                        { name: '💳 Entry Fee', value: hasFreeEntry ? '~~₹' + tournament.entryFee + '~~ **FREE**' : `₹${tournament.entryFee}`, inline: true },
                        { name: '👥 Team Size', value: `${tournament.teamSize} players`, inline: true },
                        { name: '⏰ Match Time', value: tournament.scheduledTime, inline: true }
                    )
                    .setFooter({ text: 'Ticket ID: ' + ticketId });

                if (hasFreeEntry) {
                    embed.addFields({ 
                        name: '🎁 Free Entry Unlocked!', 
                        value: 'You earned free entry with 10+ invites!', 
                        inline: false 
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId(`team_details_${ticketChannel.id}`)
                    .setTitle('Enter Team Details');

                const teamNameInput = new TextInputBuilder()
                    .setCustomId('team_name')
                    .setLabel(`Team Name ${tournament.teamSize > 1 ? '(Squad)' : '(Solo)'}`)
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Enter your team name')
                    .setRequired(true);

                const idsInput = new TextInputBuilder()
                    .setCustomId('player_ids')
                    .setLabel(`In-Game IDs (${tournament.teamSize} ${tournament.teamSize > 1 ? 'players' : 'player'})`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder(tournament.teamSize > 1 ? 'ID1, ID2, ID3...' : 'Your game ID')
                    .setRequired(true);

                const row1 = new ActionRowBuilder().addComponents(teamNameInput);
                const row2 = new ActionRowBuilder().addComponents(idsInput);
                modal.addComponents(row1, row2);

                await interaction.showModal(modal);

                // Send initial message in ticket
                setTimeout(async () => {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('close_ticket')
                                .setLabel('🔒 Close Ticket')
                                .setStyle(ButtonStyle.Danger)
                        );

                    await ticketChannel.send({ content: `<@${user.id}> <@&${config.ROLES.STAFF}>`, embeds: [embed], components: [row] });
                }, 1000);

                await interaction.reply({ 
                    content: `✅ Ticket created! Go to ${ticketChannel} to complete your entry.`, 
                    ephemeral: true 
                });
            }

            // Game Selection for Profile
            if (customId === 'select_game') {
                const game = values[0];
                const userData = storage.users.get(user.id) || {};
                userData.game = game;
                storage.users.set(user.id, userData);

                await interaction.reply({ 
                    content: `✅ Game preference saved: **${config.GAMES[game]?.name || game}**`, 
                    ephemeral: true 
                });
            }

            // Gender Selection
            if (customId === 'select_gender') {
                const gender = values[0];
                const userData = storage.users.get(user.id) || {};
                userData.gender = gender;
                storage.users.set(user.id, userData);

                await interaction.reply({ 
                    content: `✅ Gender updated: **${gender}**`, 
                    ephemeral: true 
                });
            }
        }

        // Modal Submit Interactions
        if (interaction.isModalSubmit()) {
            const { customId, fields, user, guild } = interaction;

            // Profile Creation Modal
            if (customId === 'profile_modal') {
                const name = fields.getTextInputValue('profile_name');
                const state = fields.getTextInputValue('profile_state');
                const ign = fields.getTextInputValue('profile_ign');
                const age = parseInt(fields.getTextInputValue('profile_age'));

                if (age < 13) {
                    return interaction.reply({ 
                        content: '❌ You must be at least 13 years old to play!', 
                        ephemeral: true 
                    });
                }

                const otoId = generateOTOId();
                
                storage.users.set(user.id, {
                    discordId: user.id,
                    otoId: otoId,
                    name: name,
                    state: state,
                    ign: ign,
                    age: age,
                    profileCompleted: false, // Will complete after game selection
                    createdAt: Date.now(),
                    invites: 0,
                    tournamentsPlayed: 0,
                    tournamentsWon: 0,
                    totalEarnings: 0
                });

                const embed = new EmbedBuilder()
                    .setColor('#00ff88')
                    .setTitle('✅ Profile Created!')
                    .setDescription('Now select your favorite game:')
                    .addFields(
                        { name: '🆔 OTO ID', value: otoId, inline: true },
                        { name: '👤 Name', value: name, inline: true },
                        { name: '📍 State', value: state, inline: true },
                        { name: '🎯 IGN', value: ign, inline: true },
                        { name: '🎂 Age', value: age.toString(), inline: true }
                    );

                const gameOptions = Object.keys(config.GAMES).map(key => ({
                    label: config.GAMES[key].name,
                    value: key,
                    emoji: config.GAMES[key].emoji
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_game')
                    .setPlaceholder('Choose your favorite game')
                    .addOptions(gameOptions);

                const genderMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_gender')
                    .setPlaceholder('Select your gender')
                    .addOptions([
                        { label: 'Male', value: 'male', emoji: '👨' },
                        { label: 'Female', value: 'female', emoji: '👩' },
                        { label: 'Other', value: 'other', emoji: '🧑' }
                    ]);

                const row1 = new ActionRowBuilder().addComponents(selectMenu);
                const row2 = new ActionRowBuilder().addComponents(genderMenu);

                await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });

                // Give player role
                const member = guild.members.cache.get(user.id);
                if (member && config.ROLES.PLAYER) {
                    try {
                        await member.roles.add(config.ROLES.PLAYER);
                    } catch (e) {
                        console.log('Could not assign player role');
                    }
                }

                // Complete profile after selections
                setTimeout(() => {
                    const userData = storage.users.get(user.id);
                    if (userData && userData.game && userData.gender) {
                        userData.profileCompleted = true;
                        storage.users.set(user.id, userData);

                        // Announce in general
                        const generalChannel = guild.channels.cache.get(config.CHANNELS.GENERAL_CHAT);
                        if (generalChannel) {
                            const announce = new EmbedBuilder()
                                .setColor('#00ff88')
                                .setDescription(`🎉 ${user} completed their profile! Welcome to OTO Tournaments!`);
                            generalChannel.send({ embeds: [announce] });
                        }
                    }
                }, 5000);
            }

            // Team Details Modal
            if (customId.startsWith('team_details_')) {
                const channelId = customId.split('_')[2];
                const ticketData = storage.tickets.get(channelId);

                if (!ticketData) {
                    return interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
                }

                const teamName = fields.getTextInputValue('team_name');
                const playerIds = fields.getTextInputValue('player_ids');

                ticketData.teamName = teamName;
                ticketData.playerIds = playerIds;
                storage.tickets.set(channelId, ticketData);

                const tournament = storage.tournaments.get(ticketData.tournamentId);
                const userData = storage.users.get(user.id) || {};
                const hasFreeEntry = (userData.invites || 0) >= config.SETTINGS.FREE_TOURNAMENT_INVITES && !userData.usedFreeEntry;

                await interaction.reply({ 
                    content: '✅ Team details saved!', 
                    ephemeral: true 
                });

                // Generate payment QR or skip if free
                const ticketChannel = guild.channels.cache.get(channelId);
                if (!ticketChannel) return;

                if (hasFreeEntry) {
                    // Auto-confirm for free entry
                    tournament.slotsBooked++;
                    const slotNumber = tournament.slotsBooked;
                    
                    if (!tournament.participants) tournament.participants = [];
                    tournament.participants.push({
                        userId: user.id,
                        slotNumber: slotNumber,
                        teamName: teamName,
                        paidAt: Date.now()
                    });

                    storage.tournaments.set(tournament.id, tournament);
                    userData.usedFreeEntry = true;
                    storage.users.set(user.id, userData);

                    const confirmEmbed = new EmbedBuilder()
                        .setColor('#00ff88')
                        .setTitle('🎁 Free Entry Confirmed!')
                        .setDescription('Your slot is confirmed with free entry reward!')
                        .addFields(
                            { name: '🎫 Slot Number', value: `#${slotNumber}`, inline: true },
                            { name: '👥 Team Name', value: teamName, inline: true }
                        );

                    await ticketChannel.send({ embeds: [confirmEmbed] });
                } else {
                    // Request payment
                    const paymentEmbed = new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setTitle('💳 Payment Required')
                        .setDescription(`Please send payment screenshot for ₹${tournament.entryFee}`)
                        .addFields(
                            { name: '💰 Amount', value: `₹${tournament.entryFee}`, inline: true },
                            { name: '👥 Team', value: teamName, inline: true },
                            { name: '📱 Payment Methods', value: 'UPI, Paytm, PhonePe, GooglePay', inline: false },
                            { name: '📸 Next Step', value: 'Upload your payment screenshot here', inline: false }
                        )
                        .setFooter({ text: 'Staff will verify and confirm your slot' });

                    await ticketChannel.send({ embeds: [paymentEmbed] });
                }
            }

            // Reject Reason Modal
            if (customId === 'reject_reason_modal') {
                const reason = fields.getTextInputValue('reject_reason');
                const ticketData = storage.tickets.get(interaction.channel.id);

                if (!ticketData) {
                    return interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setColor('#ff0055')
                    .setTitle('❌ Payment Rejected')
                    .setDescription(`Rejected by ${interaction.user}`)
                    .addFields({ name: 'Reason', value: reason })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                // Notify user
                try {
                    const member = await guild.members.fetch(ticketData.userId);
                    await member.send({ embeds: [embed] });
                } catch (e) {
                    console.log('Could not DM user');
                }
            }
        }
    } catch (error) {
        console.error('Interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred!', ephemeral: true }).catch(() => {});
        }
    }
});

// Invite reward checker
function checkInviteRewards(inviter, inviteCount) {
    const rewards = config.INVITE_REWARDS || [];
    const reward = rewards.find(r => r.invites === inviteCount);
    
    if (reward) {
        inviter.send({
            embeds: [new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('🎁 Invite Reward Unlocked!')
                .setDescription(reward.message)
                .addFields({ name: '🎯 Milestone', value: `${inviteCount} invites` })
            ]
        }).catch(() => {});
    }
}

// Error handlers
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
// Add these commands to your message handler in index.js

// CREATE TOURNAMENT COMMAND
if (commandName === 'create-tournament' || commandName === 'ct') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Only staff can create tournaments!');
    }

    const modal = new ModalBuilder()
        .setCustomId('create_tournament_modal')
        .setTitle('🏆 Create New Tournament');

    const titleInput = new TextInputBuilder()
        .setCustomId('tournament_title')
        .setLabel('Tournament Title')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., Solo Rush Championship')
        .setRequired(true);

    const prizeInput = new TextInputBuilder()
        .setCustomId('tournament_prize')
        .setLabel('Prize Pool (₹)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., 5000')
        .setRequired(true);

    const feeInput = new TextInputBuilder()
        .setCustomId('tournament_fee')
        .setLabel('Entry Fee (₹)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., 50')
        .setRequired(true);

    const slotsInput = new TextInputBuilder()
        .setCustomId('tournament_slots')
        .setLabel('Total Slots')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., 100')
        .setRequired(true);

    const timeInput = new TextInputBuilder()
        .setCustomId('tournament_time')
        .setLabel('Match Time (e.g., 5:00 PM)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., Today 8:00 PM')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(prizeInput),
        new ActionRowBuilder().addComponents(feeInput),
        new ActionRowBuilder().addComponents(slotsInput),
        new ActionRowBuilder().addComponents(timeInput)
    );

    // Create interaction collector to show modal
    const embed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle('🎮 Tournament Creation')
        .setDescription('Choose tournament type or use custom template:')
        .setFooter({ text: 'Select from dropdown below' });

    const gameMenu = new StringSelectMenuBuilder()
        .setCustomId('select_tournament_game')
        .setPlaceholder('Select Game')
        .addOptions(
            Object.keys(config.GAMES).map(key => ({
                label: config.GAMES[key].name,
                value: key,
                emoji: config.GAMES[key].emoji,
                description: `Create ${config.GAMES[key].name} tournament`
            }))
        );

    const templateMenu = new StringSelectMenuBuilder()
        .setCustomId('select_tournament_template')
        .setPlaceholder('Or use Template (Optional)')
        .addOptions([
            { label: 'Solo Rush', value: 'SOLO_RUSH', description: '₹50 entry, ₹2000 prize, 100 slots', emoji: '🏃' },
            { label: 'Duo Classic', value: 'DUO_CLASSIC', description: '₹80 entry, ₹3000 prize, 50 teams', emoji: '👥' },
            { label: 'Squad Showdown', value: 'SQUAD_SHOWDOWN', description: '₹150 entry, ₹5000 prize, 25 squads', emoji: '👨‍👩‍👦‍👦' },
            { label: 'Custom', value: 'CUSTOM', description: 'Create your own settings', emoji: '⚙️' }
        ]);

    const row1 = new ActionRowBuilder().addComponents(gameMenu);
    const row2 = new ActionRowBuilder().addComponents(templateMenu);

    const reply = await message.reply({ embeds: [embed], components: [row1, row2] });

    // Collector for game and template selection
    const collector = reply.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({ content: '❌ Only the command author can use this!', ephemeral: true });
        }

        let tournamentData = {
            game: null,
            template: null
        };

        if (i.customId === 'select_tournament_game') {
            tournamentData.game = i.values[0];
            await i.reply({ content: `✅ Game selected: **${config.GAMES[i.values[0]].name}**`, ephemeral: true });
        }

        if (i.customId === 'select_tournament_template') {
            const template = i.values[0];
            
            if (template === 'CUSTOM') {
                // Show custom modal
                await i.showModal(modal);
                collector.stop();
            } else {
                // Use template
                const templateData = config.TOURNAMENT_TEMPLATES[template];
                if (!templateData) return i.reply({ content: '❌ Template not found!', ephemeral: true });

                const confirmEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle(`📋 Template: ${templateData.name}`)
                    .setDescription('Confirm tournament creation with these details:')
                    .addFields(
                        { name: '💰 Prize Pool', value: `₹${templateData.prize_pool}`, inline: true },
                        { name: '💳 Entry Fee', value: `₹${templateData.entry_fee}`, inline: true },
                        { name: '👥 Slots', value: `${templateData.slots}`, inline: true },
                        { name: '🎮 Game', value: tournamentData.game || 'Not selected', inline: true },
                        { name: '👨‍👩‍👦 Team Size', value: `${templateData.team_size}`, inline: true },
                        { name: '🏆 Type', value: templateData.type, inline: true }
                    );

                const confirmRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`confirm_tournament_${template}`)
                            .setLabel('✅ Create Tournament')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancel_tournament')
                            .setLabel('❌ Cancel')
                            .setStyle(ButtonStyle.Danger)
                    );

                await i.update({ embeds: [confirmEmbed], components: [confirmRow] });
            }
        }

        if (i.customId.startsWith('confirm_tournament_')) {
            const template = i.customId.split('_')[2];
            const templateData = config.TOURNAMENT_TEMPLATES[template];
            
            // Create tournament
            const tournamentId = generateTournamentId();
            const tournament = {
                id: tournamentId,
                title: templateData.name,
                game: tournamentData.game || 'FREEFIRE',
                prizePool: templateData.prize_pool,
                entryFee: templateData.entry_fee,
                totalSlots: templateData.slots,
                slotsBooked: 0,
                teamSize: templateData.team_size,
                type: templateData.type,
                status: 'active',
                createdBy: message.author.id,
                createdAt: Date.now(),
                scheduledTime: 'TBD',
                participants: []
            };

            storage.tournaments.set(tournamentId, tournament);

            // Post to tournament schedule
            const scheduleChannel = message.guild.channels.cache.get(config.CHANNELS.TOURNAMENT_SCHEDULE);
            if (scheduleChannel) {
                const tournamentEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle(`🏆 ${tournament.title}`)
                    .setDescription(`${config.GAMES[tournament.game]?.emoji || '🎮'} **${config.GAMES[tournament.game]?.name || tournament.game}**`)
                    .addFields(
                        { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                        { name: '💳 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                        { name: '👥 Slots', value: `${tournament.slotsBooked}/${tournament.totalSlots}`, inline: true },
                        { name: '👨‍👩‍👦 Team Size', value: `${tournament.teamSize}`, inline: true },
                        { name: '🏆 Type', value: tournament.type, inline: true },
                        { name: '⏰ Time', value: tournament.scheduledTime, inline: true },
                        { name: '📜 Rules', value: 'Check <#' + config.CHANNELS.RULES + '>', inline: false }
                    )
                    .setFooter({ text: `Tournament ID: ${tournamentId}` })
                    .setTimestamp();

                const joinRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`join_tournament_${tournamentId}`)
                            .setLabel('✅ Join Tournament')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel('📖 Rules')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/channels/${message.guild.id}/${config.CHANNELS.RULES}`)
                    );

                const msg = await scheduleChannel.send({ embeds: [tournamentEmbed], components: [joinRow] });
                tournament.messageId = msg.id;
                storage.tournaments.set(tournamentId, tournament);

                // Announcement
                const announceChannel = message.guild.channels.cache.get(config.CHANNELS.ANNOUNCEMENT);
                if (announceChannel) {
                    const announceEmbed = new EmbedBuilder()
                        .setColor('#00ff88')
                        .setTitle('🎉 NEW TOURNAMENT ALERT!')
                        .setDescription(`**${tournament.title}** is now open for registration!`)
                        .addFields(
                            { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                            { name: '💳 Entry', value: `₹${tournament.entryFee}`, inline: true },
                            { name: '👥 Slots', value: `${tournament.totalSlots}`, inline: true }
                        )
                        .setFooter({ text: 'Join now in #tournament-schedule!' });

                    announceChannel.send({ content: '@everyone', embeds: [announceEmbed] });
                }

                // Spam in general (every 2 minutes)
                const spamInterval = setInterval(() => {
                    const generalChannel = message.guild.channels.cache.get(config.CHANNELS.GENERAL_CHAT);
                    if (generalChannel && storage.tournaments.has(tournamentId)) {
                        const t = storage.tournaments.get(tournamentId);
                        if (t.status !== 'active' || t.slotsBooked >= t.totalSlots) {
                            clearInterval(spamInterval);
                            return;
                        }

                        const spamEmbed = new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('🔥 Tournament Starting Soon!')
                            .setDescription(`**${t.title}**\n💰 Prize: ₹${t.prizePool} | 💳 Entry: ₹${t.entryFee}\n👥 ${t.totalSlots - t.slotsBooked} slots remaining!`)
                            .setFooter({ text: 'Join now!' });

                        const spamRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`join_tournament_${tournamentId}`)
                                    .setLabel('⚡ Quick Join')
                                    .setStyle(ButtonStyle.Success)
                            );

                        generalChannel.send({ embeds: [spamEmbed], components: [spamRow] });
                    }
                }, 120000); // 2 minutes
            }

            await i.update({ 
                content: `✅ Tournament created successfully!\nID: \`${tournamentId}\`\nPosted in <#${config.CHANNELS.TOURNAMENT_SCHEDULE}>`, 
                embeds: [], 
                components: [] 
            });

            collector.stop();
        }

        if (i.customId === 'cancel_tournament') {
            await i.update({ content: '❌ Tournament creation cancelled.', embeds: [], components: [] });
            collector.stop();
        }
    });

    return;
}

// EDIT TOURNAMENT COMMAND
if (commandName === 'edit-tournament' || commandName === 'et') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Only staff can edit tournaments!');
    }

    const tournamentId = args[0];
    if (!tournamentId) {
        return message.reply('❌ Please provide tournament ID! Usage: `-edit-tournament TOUR-xxxxx`');
    }

    const tournament = storage.tournaments.get(tournamentId);
    if (!tournament) {
        return message.reply('❌ Tournament not found!');
    }

    const embed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle(`📝 Edit Tournament: ${tournament.title}`)
        .setDescription('What would you like to edit?')
        .addFields(
            { name: 'Current Details', value: `Prize: ₹${tournament.prizePool}\nFee: ₹${tournament.entryFee}\nSlots: ${tournament.totalSlots}\nTime: ${tournament.scheduledTime}`, inline: false }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`edit_field_${tournamentId}`)
                .setPlaceholder('Select field to edit')
                .addOptions([
                    { label: 'Title', value: 'title', emoji: '📝' },
                    { label: 'Prize Pool', value: 'prize', emoji: '💰' },
                    { label: 'Entry Fee', value: 'fee', emoji: '💳' },
                    { label: 'Total Slots', value: 'slots', emoji: '👥' },
                    { label: 'Match Time', value: 'time', emoji: '⏰' },
                    { label: 'Status', value: 'status', emoji: '🔄' }
                ])
        );

    await message.reply({ embeds: [embed], components: [row] });
    return;
}

// DELETE TOURNAMENT COMMAND
if (commandName === 'delete-tournament' || commandName === 'dt') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Only staff can delete tournaments!');
    }

    const tournamentId = args[0];
    if (!tournamentId) {
        return message.reply('❌ Please provide tournament ID! Usage: `-delete-tournament TOUR-xxxxx`');
    }

    const tournament = storage.tournaments.get(tournamentId);
    if (!tournament) {
        return message.reply('❌ Tournament not found!');
    }

    const embed = new EmbedBuilder()
        .setColor('#ff0055')
        .setTitle('⚠️ Confirm Deletion')
        .setDescription(`Are you sure you want to delete **${tournament.title}**?`)
        .addFields(
            { name: '📊 Stats', value: `Slots Booked: ${tournament.slotsBooked}/${tournament.totalSlots}`, inline: true },
            { name: '⚠️ Warning', value: 'This action cannot be undone!', inline: true }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`confirm_delete_${tournamentId}`)
                .setLabel('✅ Yes, Delete')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_delete')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Secondary)
        );

    await message.reply({ embeds: [embed], components: [row] });
    return;
}

// SEND ROOM DETAILS COMMAND
if (commandName === 'send-room' || commandName === 'sr') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Only staff can send room details!');
    }

    const tournamentId = args[0];
    const roomId = args[1];
    const password = args[2];

    if (!tournamentId || !roomId || !password) {
        return message.reply('❌ Usage: `-send-room TOUR-xxxxx <room_id> <password>`');
    }

    const tournament = storage.tournaments.get(tournamentId);
    if (!tournament) {
        return message.reply('❌ Tournament not found!');
    }

    tournament.roomId = roomId;
    tournament.password = password;
    tournament.status = 'live';
    storage.tournaments.set(tournamentId, tournament);

    // Send to all participants
    let sentCount = 0;
    let failCount = 0;

    for (const participant of tournament.participants || []) {
        try {
            const member = await message.guild.members.fetch(participant.userId);
            
            const roomEmbed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle(`🎮 ${tournament.title} - ROOM DETAILS`)
                .setDescription('**Tournament is LIVE! Join now!**')
                .addFields(
                    { name: '🆔 Room ID', value: `\`${roomId}\``, inline: false },
                    { name: '🔐 Password', value: `\`${password}\``, inline: false },
                    { name: '🎫 Your Slot', value: `#${participant.slotNumber}`, inline: true },
                    { name: '👥 Team', value: participant.teamName, inline: true },
                    { name: '⚠️ Important', value: '• Join immediately\n• Screenshot your results\n• Report in match-reports channel', inline: false }
                )
                .setFooter({ text: '⚔️ Best of luck!' })
                .setTimestamp();

            await member.send({ embeds: [roomEmbed] });
            sentCount++;
        } catch (error) {
            failCount++;
            console.error(`Failed to send room details to ${participant.userId}`);
        }
    }

    const resultEmbed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle('✅ Room Details Sent')
        .addFields(
            { name: '📨 Sent', value: `${sentCount}`, inline: true },
            { name: '❌ Failed', value: `${failCount}`, inline: true },
            { name: '🏆 Tournament', value: tournament.title, inline: false }
        );

    await message.reply({ embeds: [resultEmbed] });

    // Announce in general
    const generalChannel = message.guild.channels.cache.get(config.CHANNELS.GENERAL_CHAT);
    if (generalChannel) {
        const liveEmbed = new EmbedBuilder()
            .setColor('#ff0055')
            .setTitle('🔴 TOURNAMENT LIVE!')
            .setDescription(`**${tournament.title}** has started!\nRoom details sent to all participants!`)
            .setFooter({ text: 'Good luck to all players!' });

        generalChannel.send({ content: '@here', embeds: [liveEmbed] });
    }

    return;
}

// END TOURNAMENT & DECLARE WINNER COMMAND
if (commandName === 'declare-winner' || commandName === 'dw') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Only staff can declare winners!');
    }

    const tournamentId = args[0];
    if (!tournamentId) {
        return message.reply('❌ Usage: `-declare-winner TOUR-xxxxx`');
    }

    const tournament = storage.tournaments.get(tournamentId);
    if (!tournament) {
        return message.reply('❌ Tournament not found!');
    }

    const modal = new ModalBuilder()
        .setCustomId(`winner_modal_${tournamentId}`)
        .setTitle('🏆 Declare Winners');

    const winnersInput = new TextInputBuilder()
        .setCustomId('winners_list')
        .setLabel('Winners (format: rank:userId:prize)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('1:123456789:2000\n2:987654321:1000\n3:555555555:500')
        .setRequired(true);

    const imageInput = new TextInputBuilder()
        .setCustomId('leaderboard_image')
        .setLabel('Leaderboard Image URL (optional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://example.com/image.png')
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(winnersInput),
        new ActionRowBuilder().addComponents(imageInput)
    );

    // Need to trigger modal through interaction
    const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🏆 Declare Winners')
        .setDescription('Click button to enter winner details:');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`show_winner_modal_${tournamentId}`)
                .setLabel('📝 Enter Winners')
                .setStyle(ButtonStyle.Success)
        );

    await message.reply({ embeds: [embed], components: [row] });
    return;
}

// ADD STAFF COMMAND (Owner only)
if (commandName === 'add-staff' || commandName === 'as') {
    if (message.author.id !== message.guild.ownerId) {
        return message.reply('❌ Only the server owner can add staff!');
    }

    const target = message.mentions.members.first();
    if (!target) {
        return message.reply('❌ Please mention a user! Usage: `-add-staff @user`');
    }

    try {
        await target.roles.add(config.ROLES.STAFF);
        
        const welcomeMsg = getRandomResponse(config.STAFF_WELCOME_MESSAGES);
        
        const embed = new EmbedBuilder()
            .setColor('#4ecdc4')
            .setTitle('👨‍💼 New Staff Member!')
            .setDescription(`${target} has been added to the staff team!`)
            .addFields({ name: '💬 Welcome Message', value: welcomeMsg })
            .setTimestamp();

        await message.reply({ embeds: [embed] });

        // DM the new staff
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🎉 Welcome to OTO Staff Team!')
                .setDescription(welcomeMsg)
                .addFields(
                    { name: '📚 Your Responsibilities', value: '• Manage tournaments\n• Handle tickets\n• Verify payments\n• Moderate chat\n• Help players', inline: false },
                    { name: '🛠️ Staff Commands', value: '• `-create-tournament` - Create tournaments\n• `-edit-tournament` - Edit tournaments\n• `-send-room` - Send room details\n• `-ban/@timeout/@warn` - Moderation', inline: false },
                    { name: '📢 Staff Channel', value: `<#${config.CHANNELS.STAFF_CHAT}>`, inline: false }
                )
                .setFooter({ text: 'Let\'s make OTO the best!' });

            await target.send({ embeds: [dmEmbed] });
        } catch (e) {
            console.log('Could not DM new staff member');
        }

        // Log in staff channel
        const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_CHAT);
        if (staffChannel) {
            staffChannel.send({ content: `👋 Everyone welcome ${target} to the team!`, embeds: [embed] });
        }
    } catch (error) {
        message.reply('❌ Failed to add staff role: ' + error.message);
    }
    return;
}

// REMOVE STAFF COMMAND (Owner only)
if (commandName === 'remove-staff' || commandName === 'rs') {
    if (message.author.id !== message.guild.ownerId) {
        return message.reply('❌ Only the server owner can remove staff!');
    }

    const target = message.mentions.members.first();
    if (!target) {
        return message.reply('❌ Please mention a user! Usage: `-remove-staff @user`');
    }

    try {
        await target.roles.remove(config.ROLES.STAFF);
        
        const embed = new EmbedBuilder()
            .setColor('#ff0055')
            .setTitle('👋 Staff Member Removed')
            .setDescription(`${target} has been removed from the staff team.`)
            .setTimestamp();

        await message.reply({ embeds: [embed] });

        // Log in staff channel
        const staffChannel = message.guild.channels.cache.get(config.CHANNELS.STAFF_CHAT);
        if (staffChannel) {
            staffChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        message.reply('❌ Failed to remove staff role: ' + error.message);
    }
    return;
}

// VIEW ALL TOURNAMENTS COMMAND (Staff)
if (commandName === 'list-tournaments' || commandName === 'lt') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('❌ Only staff can use this command!');
    }

    const tournaments = Array.from(storage.tournaments.values());
    
    if (tournaments.length === 0) {
        return message.reply('❌ No tournaments found!');
    }

    const active = tournaments.filter(t => t.status === 'active');
    const live = tournaments.filter(t => t.status === 'live');
    const completed = tournaments.filter(t => t.status === 'completed');

    const embed = new EmbedBuilder()
        .setColor('#7289da')
        .setTitle('📊 All Tournaments')
        .setDescription(`Total: ${tournaments.length} | Active: ${active.length} | Live: ${live.length} | Completed: ${completed.length}`)
        .setTimestamp();

    if (active.length > 0) {
        embed.addFields({
            name: '🟢 Active Tournaments',
            value: active.map(t => `\`${t.id}\` - ${t.title} (${t.slotsBooked}/${t.totalSlots})`).join('\n').substring(0, 1024),
            inline: false
        });
    }

    if (live.length > 0) {
        embed.addFields({
            name: '🔴 Live Tournaments',
            value: live.map(t => `\`${t.id}\` - ${t.title}`).join('\n').substring(0, 1024),
            inline: false
        });
    }

    await message.reply({ embeds: [embed] });
    return;
}
client.login(config.TOKEN);
