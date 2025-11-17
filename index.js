const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');

// ==================== CONFIGURATION ====================
const CONFIG = {
    PREFIX: '-',
    CHANNELS: {
        ANNOUNCEMENT: '1438484746165555243',
        TOURNAMENT_SCHEDULE: '1438482561679626303',
        HOW_TO_JOIN: '1438482512296022017',
        RULES: '1438482342145687643',
        BOT_COMMANDS: '1438483009950191676',
        GENERAL_CHAT: '1438482904018849835',
        OPEN_TICKET: '1438485759891079180',
        MATCH_REPORTS: '1438486113047150714',
        LEADERBOARD: '1438947356690223347',
        STAFF_TOOLS: '1438486059255336970',
        STAFF_CHAT: '1438486059255336970',
        PAYMENT_PROOF: '1438486113047150714',
        PLAYER_FORM: '1438486008453660863',
        PROFILE_SECTION: '1439542574066176020',
        INVITE_TRACKER: '1439216884774998107',
        MINECRAFT_CHAT: '1439223955960627421',
        MINECRAFT_LEADERBOARD: '1439226024863993988'
    },
    ROLES: {
        STAFF: '1438475461977047112',
        ADMIN: '1438475461977047112',
        OWNER: '1438443937588183110',
        PLAYER: 'PLAYER_ROLE_ID'
    },
    OWNER_IDS: ['1438443937588183110', '1369227604053463052']
};

// ==================== IN-MEMORY DATA STORAGE ====================
const DATA = {
    profiles: new Map(),
    tournaments: new Map(),
    tickets: new Map(),
    invites: new Map(),
    warnings: new Map(),
    leaderboard: new Map(),
    lastMessages: new Map(),
    pendingProfiles: new Map(),
    tournamentSlots: new Map(),
    lobbyTickets: new Map(),
    inviteTracking: new Map(),
    autoResponses: new Map()
};

// ==================== DISCORD CLIENT INITIALIZATION ====================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
    generateOTOId() {
        return `OTO${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    },

    isStaff(member) {
        if (!member) return false;
        return member.roles.cache.has(CONFIG.ROLES.STAFF) || 
               member.roles.cache.has(CONFIG.ROLES.ADMIN) ||
               CONFIG.OWNER_IDS.includes(member.id);
    },

    isOwner(userId) {
        return CONFIG.OWNER_IDS.includes(userId);
    },

    detectBadWords(content) {
        const badWords = ['dm', 'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'chutiya', 'madarchod', 'bhenchod', 'fuck', 'bitch'];
        const lowerContent = content.toLowerCase();
        return badWords.some(word => lowerContent.includes(word));
    },

    createEmbed(title, description, color = '#00ff00') {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: 'OTO Tournament System | Powered by Innovation' });
    },

    getMaleGreeting(name) {
        const greetings = [
            `Kya haal bhai ${name}! Aaj tournament kheloge? 🔥`,
            `Aree bhai ${name}! Tournament ka maza lene aaye ho? 💪`,
            `Whatsup ${name} bro! Ready for some action? 🎮`,
            `Hello warrior ${name}! Tournament join karo aur jeet lo! 🏆`,
            `Ayo ${name} bhai! Let's dominate this tournament! ⚡`,
            `Bhai ${name}! Apna time aa gaya! Machayenge! 🚀`,
            `Kaise ho ${name} bhai! Tournament dekha kya? 🎯`,
            `${name} bhai! Aaj custom challenge karoge? 💥`,
            `Bhailog ${name} aa gaya! Tournament ready hai! 🌟`,
            `${name} bro! Squad ready hai kya? Chalte hain! 👊`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    },

    getFemaleGreeting(name) {
        const greetings = [
            `Hello ji ${name}! Aaj tournament kheloge? 🌟`,
            `Hey ${name}! Tournament mein participate karogi? 👑`,
            `Hi ${name} ji! Ready to show your gaming skills? 🎮`,
            `Welcome ${name}! Let's win this tournament! 💫`,
            `Hey queen ${name}! Tournament join karo aur shine karo! ✨`,
            `${name} ji! Aaj ka tournament ekdum mast hai! 🌸`,
            `Namaste ${name}! Ready for victory? 🏅`,
            `${name}! Squad join karogi? Mast tournament hai! 🎪`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    },

    getWelcomeMessage() {
        const welcomes = [
            "Welcome to OTO Tournament! 🎮 Tumhe hardwork karna hai aur jeetna hai!",
            "Arre bhai, OTO family mein aaye ho! Mehnat karo, jeeto aur maze karo! 🚀",
            "Welcome warrior! Yahaan skills test honge! Are you ready? 💪",
            "Namaste! OTO Tournament mein aapka swagat hai! Let's play and win! 🏆",
            "Hey champion! Dedication aur practice se jeet pakki hai! 🔥",
            "Welcome to the arena! Show karo apni gaming skills! ⚡",
            "OTO family mein welcome hai! Consistency is key! 🎯",
            "Ayo! New blood! Prove yourself in the battlefield! 💥",
            "Welcome aboard! Hard work + Skills = Victory! 🌟",
            "Namashkar! Let's create history together in OTO! 👑"
        ];
        return welcomes[Math.floor(Math.random() * welcomes.length)];
    },

    async createPrivateTicket(guild, userId, ticketName, tournamentData = null) {
        try {
            const user = await guild.members.fetch(userId);
            const timestamp = Date.now();
            
            const ticketChannel = await guild.channels.create({
                name: `${ticketName}-${user.user.username}`.toLowerCase().replace(/\s+/g, '-'),
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: userId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: CONFIG.ROLES.STAFF,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages]
                    }
                ]
            });

            const ticketId = `TICKET_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            
            DATA.tickets.set(ticketId, {
                channelId: ticketChannel.id,
                userId: userId,
                ticketName: ticketName,
                tournamentData: tournamentData,
                status: 'open',
                createdAt: timestamp,
                type: tournamentData ? 'tournament' : 'general'
            });

            return { ticketChannel, ticketId };
        } catch (error) {
            console.error('Error creating ticket:', error);
            return null;
        }
    },

    formatTime(date) {
        return new Date(date).toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    },

    generateQRCode() {
        return `UPI://pay?pa=ototournament@paytm&pn=OTO%20Tournament&am=${Math.random() * 1000}&cu=INR`;
    }
};

// ==================== PROFILE SYSTEM ====================
const ProfileSystem = {
    async initiateProfileCreation(user) {
        try {
            const embed = Utils.createEmbed(
                '🎮 Welcome to OTO Tournament!',
                `Hello ${user.username}! 👋\n\n` +
                `To unlock all features and start playing tournaments, you need to complete your profile!\n\n` +
                `**Click the button below to create your profile:**\n` +
                `✅ Takes only 1 minute\n` +
                `✅ Unlock chat channels\n` +
                `✅ Join tournaments\n` +
                `✅ Track your stats\n\n` +
                `Let's get started! 🚀`,
                '#FF6B6B'
            );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_profile_start')
                        .setLabel('Create Profile Now')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📝')
                );

            await user.send({ embeds: [embed], components: [row] });
            
            DATA.pendingProfiles.set(user.id, {
                stage: 'waiting',
                data: {},
                startedAt: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Error initiating profile creation:', error);
            return false;
        }
    },

    createProfileModal() {
        const modal = new ModalBuilder()
            .setCustomId('profile_creation_modal')
            .setTitle('Create Your OTO Profile');

        const nameInput = new TextInputBuilder()
            .setCustomId('profile_name')
            .setLabel('Your Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter your name')
            .setRequired(true)
            .setMaxLength(50);

        const stateInput = new TextInputBuilder()
            .setCustomId('profile_state')
            .setLabel('Your State')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., Maharashtra, Delhi, UP')
            .setRequired(true)
            .setMaxLength(50);

        const genderInput = new TextInputBuilder()
            .setCustomId('profile_gender')
            .setLabel('Gender (Male/Female/Other)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Male, Female, or Other')
            .setRequired(true)
            .setMaxLength(20);

        const gameInput = new TextInputBuilder()
            .setCustomId('profile_game')
            .setLabel('Primary Game')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., Free Fire, Minecraft, PUBG')
            .setRequired(true)
            .setMaxLength(50);

        const ageInput = new TextInputBuilder()
            .setCustomId('profile_age')
            .setLabel('Your Age')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter your age')
            .setRequired(false)
            .setMaxLength(3);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(stateInput),
            new ActionRowBuilder().addComponents(genderInput),
            new ActionRowBuilder().addComponents(gameInput),
            new ActionRowBuilder().addComponents(ageInput)
        );

        return modal;
    },

    async completeProfile(userId, profileData, guild) {
        const otoId = Utils.generateOTOId();
        
        const profile = {
            userId: userId,
            otoId: otoId,
            name: profileData.name,
            state: profileData.state,
            gender: profileData.gender.toLowerCase(),
            game: profileData.game,
            age: profileData.age || 'Not specified',
            createdAt: Date.now(),
            tournaments: 0,
            wins: 0,
            invites: 0
        };

        DATA.profiles.set(userId, profile);
        DATA.pendingProfiles.delete(userId);

        // Assign player role
        try {
            const member = await guild.members.fetch(userId);
            if (CONFIG.ROLES.PLAYER && CONFIG.ROLES.PLAYER !== 'PLAYER_ROLE_ID') {
                await member.roles.add(CONFIG.ROLES.PLAYER);
            }
        } catch (error) {
            console.error('Error assigning role:', error);
        }

        // Post to profile channel
        try {
            const profileChannel = guild.channels.cache.get(CONFIG.CHANNELS.PROFILE_SECTION);
            if (profileChannel) {
                const profileEmbed = Utils.createEmbed(
                    '🎮 New Player Profile',
                    `**Name:** ${profile.name}\n` +
                    `**OTO ID:** \`${profile.otoId}\`\n` +
                    `**State:** ${profile.state}\n` +
                    `**Gender:** ${profile.gender}\n` +
                    `**Primary Game:** ${profile.game}\n` +
                    `**Age:** ${profile.age}\n` +
                    `**Joined:** ${Utils.formatTime(profile.createdAt)}`,
                    '#4CAF50'
                );
                profileEmbed.setThumbnail(member.user.displayAvatarURL());
                await profileChannel.send({ embeds: [profileEmbed] });
            }
        } catch (error) {
            console.error('Error posting to profile channel:', error);
        }

        return profile;
    },

    hasProfile(userId) {
        return DATA.profiles.has(userId);
    },

    getProfile(userId) {
        return DATA.profiles.get(userId);
    }
};

// ==================== TOURNAMENT SYSTEM ====================
const TournamentSystem = {
    createTournamentEmbed(tournament) {
        const slotsText = tournament.currentSlots >= tournament.maxSlots ? '**FULL** ❌' : `${tournament.currentSlots}/${tournament.maxSlots}`;
        
        let prizeDistribution = '';
        if (tournament.prizes && tournament.prizes.length > 0) {
            tournament.prizes.forEach((prize, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[index] || '🏅';
                prizeDistribution += `${medal} ${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}: ₹${prize}\n`;
            });
        }

        const description = tournament.description || 'No description';
        const mapInfo = tournament.map ? `🗺️ **Map:** ${tournament.map}\n` : '';
        const modeInfo = tournament.mode ? `🎯 **Mode:** ${tournament.mode}\n` : '';
        const killPoints = tournament.perKill ? `🎯 **Per Kill:** ${tournament.perKill} points\n` : '';

        const embed = new EmbedBuilder()
            .setTitle(`${tournament.game} Tournament`)
            .setDescription(`**${tournament.title}**\n\n${description}`)
            .setColor(tournament.currentSlots >= tournament.maxSlots ? '#FF0000' : '#00FF00')
            .addFields(
                { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                { name: '📊 Slots', value: slotsText, inline: true },
                { name: '⏰ Time', value: tournament.time || 'TBA', inline: true },
                { name: '📅 Date', value: tournament.date || 'TBA', inline: true },
                { name: '🎮 Type', value: tournament.type || 'Standard', inline: true }
            )
            .setTimestamp();

        if (mapInfo || modeInfo) {
            embed.addFields({ name: '🎮 Game Details', value: `${mapInfo}${modeInfo}${killPoints}`, inline: false });
        }

        if (prizeDistribution) {
            embed.addFields({ name: '🏆 Prize Distribution', value: prizeDistribution, inline: false });
        }

        if (tournament.imageUrl) {
            embed.setImage(tournament.imageUrl);
        }

        embed.setFooter({ text: `Tournament ID: ${tournament.id} | ${tournament.status}` });

        return embed;
    },

    createTournamentButtons(tournamentId, isFull = false) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`join_tournament_${tournamentId}`)
                    .setLabel(isFull ? 'FULL' : 'Join Tournament')
                    .setStyle(isFull ? ButtonStyle.Danger : ButtonStyle.Success)
                    .setEmoji('🎮')
                    .setDisabled(isFull)
            );
        return row;
    },

    async createTournament(tournamentData) {
        const tournamentId = `TOUR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const tournament = {
            id: tournamentId,
            ...tournamentData,
            currentSlots: 0,
            participants: [],
            confirmedParticipants: [],
            status: 'Registration Open',
            createdAt: Date.now(),
            createdBy: tournamentData.createdBy
        };

        DATA.tournaments.set(tournamentId, tournament);
        DATA.tournamentSlots.set(tournamentId, new Map());

        return tournament;
    },

    getTournament(tournamentId) {
        return DATA.tournaments.get(tournamentId);
    },

    async updateTournamentSlots(tournamentId, increment = true) {
        const tournament = DATA.tournaments.get(tournamentId);
        if (!tournament) return false;

        if (increment) {
            tournament.currentSlots++;
        } else {
            tournament.currentSlots = Math.max(0, tournament.currentSlots - 1);
        }

        DATA.tournaments.set(tournamentId, tournament);
        return true;
    },

    async confirmParticipant(tournamentId, userId, paymentProof) {
        const tournament = DATA.tournaments.get(tournamentId);
        if (!tournament) return false;

        tournament.confirmedParticipants.push({
            userId: userId,
            confirmedAt: Date.now(),
            paymentProof: paymentProof
        });

        DATA.tournaments.set(tournamentId, tournament);
        return true;
    }
};

// ==================== INVITE SYSTEM ====================
const InviteSystem = {
    async trackInvite(inviterId, invitedId, guild) {
        if (!DATA.invites.has(inviterId)) {
            DATA.invites.set(inviterId, {
                count: 0,
                invited: [],
                rewards: []
            });
        }

        const inviteData = DATA.invites.get(inviterId);
        inviteData.count++;
        inviteData.invited.push({
            userId: invitedId,
            timestamp: Date.now()
        });

        DATA.invites.set(inviterId, inviteData);

        // Check for rewards
        const milestones = [10, 20, 30, 50, 100];
        if (milestones.includes(inviteData.count)) {
            await this.grantInviteReward(inviterId, inviteData.count, guild);
        }

        // Update leaderboard
        await this.updateInviteLeaderboard(guild);

        return inviteData.count;
    },

    async grantInviteReward(userId, milestone, guild) {
        try {
            const user = await client.users.fetch(userId);
            const member = await guild.members.fetch(userId);

            let rewardMessage = '';
            let rewardEmoji = '🎉';

            switch(milestone) {
                case 10:
                    rewardMessage = '🎁 **FREE TOURNAMENT ENTRY UNLOCKED!**\n\nYou\'ve invited 10 friends! Click below to claim your free tournament entry!';
                    rewardEmoji = '🎮';
                    break;
                case 20:
                    rewardMessage = '💎 **DOUBLE REWARDS UNLOCKED!**\n\nYou\'ve invited 20 friends! Your next tournament win will have DOUBLE rewards!';
                    rewardEmoji = '💰';
                    break;
                case 30:
                    rewardMessage = '👑 **VIP STATUS UNLOCKED!**\n\nYou\'ve invited 30 friends! You now have VIP priority in all tournaments!';
                    rewardEmoji = '⭐';
                    break;
                case 50:
                    rewardMessage = '🏆 **LEGEND STATUS!**\n\nYou\'ve invited 50 friends! You\'re now an OTO LEGEND with exclusive perks!';
                    rewardEmoji = '🌟';
                    break;
            }

            const embed = Utils.createEmbed(
                `${rewardEmoji} Invite Milestone Reached!`,
                rewardMessage,
                '#FFD700'
            );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`claim_reward_${milestone}_${userId}`)
                        .setLabel('Claim Reward')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎁')
                );

            await user.send({ embeds: [embed], components: [row] });

            // Notify staff channel
            const staffChannel = guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
            if (staffChannel) {
                const staffEmbed = Utils.createEmbed(
                    '📊 Invite Milestone Alert',
                    `<@${userId}> has reached **${milestone} invites**!\nReward: ${rewardMessage}`,
                    '#4CAF50'
                );
                await staffChannel.send({ embeds: [staffEmbed] });
            }
        } catch (error) {
            console.error('Error granting invite reward:', error);
        }
    },

    getInviteCount(userId) {
        const inviteData = DATA.invites.get(userId);
        return inviteData ? inviteData.count : 0;
    },

    async updateInviteLeaderboard(guild) {
        try {
            const leaderboardChannel = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
            if (!leaderboardChannel) return;

            // Sort by invite count
            const sortedInvites = Array.from(DATA.invites.entries())
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 20);

            let leaderboardText = '```\n';
            leaderboardText += '╔═══════════════════════════════════════╗\n';
            leaderboardText += '║     🏆 TOP INVITERS LEADERBOARD 🏆    ║\n';
            leaderboardText += '╠═══════════════════════════════════════╣\n';

            for (let i = 0; i < sortedInvites.length; i++) {
                const [userId, data] = sortedInvites[i];
                const member = await guild.members.fetch(userId).catch(() => null);
                const name = member ? member.user.username : 'Unknown';
                const rank = i + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
                
                leaderboardText += `║ ${medal} ${rank.toString().padStart(2)}. ${name.substring(0, 20).padEnd(20)} ${data.count.toString().padStart(3)} ║\n`;
            }

            leaderboardText += '╚═══════════════════════════════════════╝\n';
            leaderboardText += '```';

            const embed = Utils.createEmbed(
                '📊 OTO Tournament Invite Leaderboard',
                leaderboardText + '\n\n**How to invite?**\nShare your server invite link and earn rewards!\n\n' +
                '**Rewards:**\n' +
                '🎮 10 invites = Free Tournament Entry\n' +
                '💰 20 invites = Double Rewards\n' +
                '👑 30 invites = VIP Status\n' +
                '🏆 50 invites = Legend Status',
                '#FFD700'
            );

            // Try to find and edit existing message or send new one
            const messages = await leaderboardChannel.messages.fetch({ limit: 10 });
            const botMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);

            if (botMessage) {
                await botMessage.edit({ embeds: [embed] });
            } else {
                await leaderboardChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error updating invite leaderboard:', error);
        }
    }
};

// ==================== WARNING SYSTEM ====================
const ModerationSystem = {
    async warnUser(userId, reason, guild) {
        if (!DATA.warnings.has(userId)) {
            DATA.warnings.set(userId, []);
        }

        const warnings = DATA.warnings.get(userId);
        warnings.push({
            reason: reason,
            timestamp: Date.now()
        });

        DATA.warnings.set(userId, warnings);

        const member = await guild.members.fetch(userId);
        
        if (warnings.length >= 3) {
            // Timeout for 10 minutes
            await member.timeout(10 * 60 * 1000, 'Multiple warnings');
            
            try {
                await member.send({
                    embeds: [Utils.createEmbed(
                        '⚠️ You\'ve been timed out',
                        `You've received ${warnings.length} warnings and have been timed out for 10 minutes.\n\n**Reason:** ${reason}\n\nPlease follow the rules!`,
                        '#FF0000'
                    )]
                });
            } catch (error) {
                console.log('Could not DM user');
            }
        } else {
            try {
                await member.send({
                    embeds: [Utils.createEmbed(
                        '⚠️ Warning',
                        `You've received a warning (${warnings.length}/3)\n\n**Reason:** ${reason}\n\nNext warning will result in a timeout!`,
                        '#FFA500'
                    )]
                });
            } catch (error) {
                console.log('Could not DM user');
            }
        }

        return warnings.length;
    },

    getWarnings(userId) {
        return DATA.warnings.get(userId) || [];
    }
};

// ==================== AUTO RESPONSE SYSTEM ====================
const AutoResponseSystem = {
    lastResponseTime: new Map(),

    async handleMessage(message) {
        if (message.author.bot) return;
        if (message.channel.id !== CONFIG.CHANNELS.GENERAL_CHAT) return;

        const userId = message.author.id;
        const content = message.content.toLowerCase();
        const profile = ProfileSystem.getProfile(userId);

        // Check for bad words
        if (Utils.detectBadWords(content)) {
            await message.delete().catch(() => {});
            await ModerationSystem.warnUser(userId, 'Using inappropriate language', message.guild);
            return;
        }

        // Spam detection
        const lastMsg = DATA.lastMessages.get(userId);
        if (lastMsg && Date.now() - lastMsg.time < 2000 && lastMsg.content === content) {
            await message.delete().catch(() => {});
            await ModerationSystem.warnUser(userId, 'Spamming', message.guild);
            return;
        }

        DATA.lastMessages.set(userId, { content, time: Date.now() });

        // Check if someone replied in last 2 minutes
        const channelMessages = await message.channel.messages.fetch({ limit: 5 });
        const recentReplies = channelMessages.filter(m => 
            m.author.id !== userId && 
            m.createdTimestamp > Date.now() - 120000
        );

        // If no one replied and enough time passed, send auto response
        const lastResponse = this.lastResponseTime.get(userId);
        if (recentReplies.size === 0 && (!lastResponse || Date.now() - lastResponse > 120000)) {
            setTimeout(async () => {
                const newMessages = await message.channel.messages.fetch({ limit: 5 });
                const hasReply = newMessages.some(m => 
                    m.author.id !== userId && 
                    m.createdTimestamp > message.createdTimestamp
                );

                if (!hasReply) {
                    let response = '';
                    
                    if (profile) {
                        if (profile.gender === 'female') {
                            response = Utils.getFemaleGreeting(profile.name);
                        } else {
                            response = Utils.getMaleGreeting(profile.name);
                        }
                    } else {
                        response = `Hey there! 👋 Tournament dekhna hai? Aaj kheloge? Join karo aur maza lo! 🎮`;
                    }

                    await message.reply(response);
                    this.lastResponseTime.set(userId, Date.now());
                }
            }, 120000); // 2 minutes
        }

        // Bot mention responses
        if (message.mentions.has(client.user)) {
            const responses = [
                `Bhai yaha se khelo! Check karo <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> for tournaments! 🎮`,
                `Kya help chahiye bhai? Tournament join karna hai? <#${CONFIG.CHANNELS.HOW_TO_JOIN}> dekho! 📝`,
                `Main OTO bot hoon! Tournaments, prizes, aur maza! Check <#${CONFIG.CHANNELS.RULES}> 📋`,
                `Aree bhai! Tournament join karo <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> mein! 🏆`
            ];
            await message.reply(responses[Math.floor(Math.random() * responses.length)]);
        }

        // Specific queries
        if (content.includes('staff') || content.includes('help') || content.includes('admin')) {
            if (!recentReplies.size) {
                await message.reply('⏳ Staff members are working hard! Aapko jaldi hi reply mil jayega. Please be patient! 🙏');
            }
        }
    }
};

// ==================== BOT READY EVENT ====================
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    console.log(`👥 Managing ${client.users.cache.size} users`);
    
    client.user.setActivity('OTO Tournaments | -help', { type: 'PLAYING' });

    // Setup invite tracking
    client.guilds.cache.forEach(guild => {
        guild.invites.fetch().then(invites => {
            DATA.inviteTracking.set(guild.id, new Map(invites.map(invite => [invite.code, invite.uses])));
        });
    });
});

// ==================== GUILD MEMBER ADD (INVITE TRACKING) ====================
client.on('guildMemberAdd', async member => {
    try {
        const cachedInvites = DATA.inviteTracking.get(member.guild.id);
        const newInvites = await member.guild.invites.fetch();

        let usedInvite = null;
        newInvites.forEach(invite => {
            if (cachedInvites.has(invite.code)) {
                if (invite.uses > cachedInvites.get(invite.code)) {
                    usedInvite = invite;
                }
            }
        });

        DATA.inviteTracking.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));

        // Track inviter
        if (usedInvite && usedInvite.inviter) {
            const inviteCount = await InviteSystem.trackInvite(usedInvite.inviter.id, member.id, member.guild);
            
            // Post to invite tracker
            const inviteChannel = member.guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
            if (inviteChannel) {
                const embed = Utils.createEmbed(
                    '📨 New Member Invited!',
                    `**${member.user.tag}** was invited by **${usedInvite.inviter.tag}**\n\n` +
                    `📊 Total Invites: **${inviteCount}**\n` +
                    `⏰ Joined: ${Utils.formatTime(Date.now())}`,
                    '#4CAF50'
                );
                embed.setThumbnail(member.user.displayAvatarURL());
                await inviteChannel.send({ embeds: [embed] });
            }
        }

        // Send welcome message and profile creation
        setTimeout(async () => {
            if (!ProfileSystem.hasProfile(member.id)) {
                await ProfileSystem.initiateProfileCreation(member.user);

                // Post in general with greeting
                const generalChannel = member.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
                if (generalChannel) {
                    const welcomeEmbed = Utils.createEmbed(
                        '🎉 Welcome to OTO Tournament!',
                        `${member} has joined the server!\n\n` +
                        `${Utils.getWelcomeMessage()}\n\n` +
                        `📝 Check your DMs to complete your profile!\n` +
                        `🎮 Join tournaments: <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>\n` +
                        `📋 Read rules: <#${CONFIG.CHANNELS.RULES}>\n` +
                        `💬 Chat: <#${CONFIG.CHANNELS.GENERAL_CHAT}>`,
                        '#FF6B6B'
                    );
                    welcomeEmbed.setThumbnail(member.user.displayAvatarURL());
                    await generalChannel.send({ content: `${member}`, embeds: [welcomeEmbed] });
                }
            }
        }, 2000);
    } catch (error) {
        console.error('Error handling member join:', error);
    }
});

// ==================== MESSAGE CREATE EVENT ====================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Auto response system
    await AutoResponseSystem.handleMessage(message);

    // Command handler
    if (!message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ========== PROFILE COMMAND ==========
    if (command === 'profile' || command === 'p') {
        const profile = ProfileSystem.getProfile(message.author.id);
        if (!profile) {
            await message.reply({
                embeds: [Utils.createEmbed(
                    '❌ No Profile Found',
                    'You haven\'t created your profile yet! Check your DMs or use `-createprofile` to start!',
                    '#FF0000'
                )]
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Player Profile')
            .setColor('#4CAF50')
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: '👤 Name', value: profile.name, inline: true },
                { name: '🆔 OTO ID', value: `\`${profile.otoId}\``, inline: true },
                { name: '📍 State', value: profile.state, inline: true },
                { name: '⚧️ Gender', value: profile.gender, inline: true },
                { name: '🎮 Primary Game', value: profile.game, inline: true },
                { name: '🎂 Age', value: profile.age.toString(), inline: true },
                { name: '🏆 Tournaments', value: profile.tournaments.toString(), inline: true },
                { name: '👑 Wins', value: profile.wins.toString(), inline: true },
                { name: '📨 Invites', value: InviteSystem.getInviteCount(message.author.id).toString(), inline: true }
            )
            .setFooter({ text: `Member since ${Utils.formatTime(profile.createdAt)}` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // ========== CREATE PROFILE COMMAND ==========
    if (command === 'createprofile') {
        if (ProfileSystem.hasProfile(message.author.id)) {
            await message.reply('You already have a profile! Use `-profile` to view it.');
            return;
        }
        await ProfileSystem.initiateProfileCreation(message.author);
        await message.reply('Check your DMs to create your profile! 📝');
    }

    // ========== INVITE COUNT COMMAND ==========
    if (command === 'invites' || command === 'i') {
        const inviteCount = InviteSystem.getInviteCount(message.author.id);
        const nextMilestone = [10, 20, 30, 50, 100].find(m => m > inviteCount) || 100;
        const remaining = nextMilestone - inviteCount;

        const embed = Utils.createEmbed(
            '📨 Your Invite Stats',
            `**Total Invites:** ${inviteCount} 🎉\n\n` +
            `**Next Reward:** ${nextMilestone} invites\n` +
            `**Remaining:** ${remaining} invites\n\n` +
            `Keep inviting to unlock amazing rewards! 🏆`,
            '#FFD700'
        );
        await message.reply({ embeds: [embed] });
    }

    // ========== HELP COMMAND ==========
    if (command === 'help' || command === 'h') {
        const embed = new EmbedBuilder()
            .setTitle('🎮 OTO Tournament Bot Commands')
            .setColor('#00BFFF')
            .setDescription('Complete command list for OTO Tournament System')
            .addFields(
                { 
                    name: '👤 User Commands', 
                    value: '`-profile / -p` - View your profile\n' +
                           '`-createprofile` - Create your profile\n' +
                           '`-invites / -i` - Check invite count\n' +
                           '`-tournaments / -t` - View active tournaments\n' +
                           '`-leaderboard / -lb` - View leaderboard\n' +
                           '`-help / -h` - Show this message'
                },
                {
                    name: '🎮 Tournament Commands',
                    value: '`-jointournament <id>` - Join a tournament\n' +
                           '`-mytournaments` - View your tournaments\n' +
                           '`-tournamentinfo <id>` - Get tournament details'
                },
                {
                    name: '⚙️ Staff Commands',
                    value: '`-createtournament` - Create new tournament\n' +
                           '`-edittournament <id>` - Edit tournament\n' +
                           '`-deletetournament <id>` - Delete tournament\n' +
                           '`-sendroom <id>` - Send room details\n' +
                           '`-confirmslot <user>` - Confirm player slot\n' +
                           '`-ban <user> <reason>` - Ban user\n' +
                           '`-timeout <user> <time>` - Timeout user\n' +
                           '`-warn <user> <reason>` - Warn user'
                },
                {
                    name: '👑 Owner Commands',
                    value: '`-addstaff <user>` - Add staff member\n' +
                           '`-removestaff <user>` - Remove staff\n' +
                           '`-unban <user>` - Unban user\n' +
                           '`-stats` - Bot statistics\n' +
                           '`-announce <message>` - Make announcement'
                }
            )
            .setFooter({ text: 'OTO Tournament System | Play • Win • Dominate' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // ========== TOURNAMENTS LIST COMMAND ==========
    if (command === 'tournaments' || command === 't') {
        const activeTournaments = Array.from(DATA.tournaments.values()).filter(t => t.status === 'Registration Open');
        
        if (activeTournaments.length === 0) {
            await message.reply({
                embeds: [Utils.createEmbed(
                    '📅 No Active Tournaments',
                    `No tournaments are currently open for registration.\n\nCheck <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> for updates!`,
                    '#FFA500'
                )]
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Active Tournaments')
            .setColor('#00FF00')
            .setDescription(`Found ${activeTournaments.length} active tournament(s)`)
            .setTimestamp();

        activeTournaments.forEach(t => {
            embed.addFields({
                name: `${t.game} - ${t.title}`,
                value: `**ID:** \`${t.id}\`\n` +
                       `**Prize:** ₹${t.prizePool} | **Entry:** ₹${t.entryFee}\n` +
                       `**Slots:** ${t.currentSlots}/${t.maxSlots}\n` +
                       `**Time:** ${t.time || 'TBA'}`,
                inline: false
            });
        });

        await message.reply({ embeds: [embed] });
    }

    // ========== STAFF: CREATE TOURNAMENT ==========
    if (command === 'createtournament' || command === 'ct') {
        if (!Utils.isStaff(message.member)) {
            await message.reply('❌ You need staff permissions to use this command!');
            return;
        }

        const embed = Utils.createEmbed(
            '🎮 Create Tournament',
            'Click the button below to create a new tournament!',
            '#00FF00'
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tournament_create_start')
                    .setLabel('Create Tournament')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎮')
            );

        await message.reply({ embeds: [embed], components: [row] });
    }

    // ========== STAFF: BAN USER ==========
    if (command === 'ban') {
        if (!Utils.isStaff(message.member)) {
            await message.reply('❌ You need staff permissions!');
            return;
        }

        const user = message.mentions.members.first();
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (!user) {
            await message.reply('❌ Please mention a user to ban!');
            return;
        }

        if (Utils.isStaff(user)) {
            await message.reply('❌ Cannot ban staff members!');
            return;
        }

        try {
            await user.send({
                embeds: [Utils.createEmbed(
                    '🔨 You have been banned',
                    `**Reason:** ${reason}\n\nIf you believe this is a mistake, please contact the administrators.`,
                    '#FF0000'
                )]
            }).catch(() => {});

            await user.ban({ reason: reason });
            
            await message.reply({
                embeds: [Utils.createEmbed(
                    '✅ User Banned',
                    `**User:** ${user.user.tag}\n**Reason:** ${reason}\n**By:** ${message.author.tag}`,
                    '#FF0000'
                )]
            });

            // Log to staff chat
            const staffChannel = message.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
            if (staffChannel) {
                await staffChannel.send({
                    embeds: [Utils.createEmbed(
                        '🔨 Ban Action',
                        `**User:** ${user.user.tag}\n**Reason:** ${reason}\n**Staff:** ${message.author.tag}\n**Time:** ${Utils.formatTime(Date.now())}`,
                        '#FF0000'
                    )]
                });
            }
        } catch (error) {
            await message.reply('❌ Failed to ban user! Check my permissions.');
        }
    }

    // ========== STAFF: TIMEOUT USER ==========
    if (command === 'timeout' || command === 'mute') {
        if (!Utils.isStaff(message.member)) {
            await message.reply('❌ You need staff permissions!');
            return;
        }

        const user = message.mentions.members.first();
        const duration = parseInt(args[1]) || 10;
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (!user) {
            await message.reply('❌ Please mention a user to timeout!');
            return;
        }

        if (Utils.isStaff(user)) {
            await message.reply('❌ Cannot timeout staff members!');
            return;
        }

        try {
            await user.timeout(duration * 60 * 1000, reason);
            
            await message.reply({
                embeds: [Utils.createEmbed(
                    '⏰ User Timed Out',
                    `**User:** ${user.user.tag}\n**Duration:** ${duration} minutes\n**Reason:** ${reason}`,
                    '#FFA500'
                )]
            });
        } catch (error) {
            await message.reply('❌ Failed to timeout user!');
        }
    }

    // ========== STAFF: WARN USER ==========
    if (command === 'warn') {
        if (!Utils.isStaff(message.member)) {
            await message.reply('❌ You need staff permissions!');
            return;
        }

        const user = message.mentions.members.first();
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (!user) {
            await message.reply('❌ Please mention a user to warn!');
            return;
        }

        const warningCount = await ModerationSystem.warnUser(user.id, reason, message.guild);
        
        await message.reply({
            embeds: [Utils.createEmbed(
                '⚠️ User Warned',
                `**User:** ${user.user.tag}\n**Warnings:** ${warningCount}/3\n**Reason:** ${reason}`,
                '#FFA500'
            )]
        });
    }

    // ========== OWNER: ADD STAFF ==========
    if (command === 'addstaff') {
        if (!Utils.isOwner(message.author.id)) {
            await message.reply('❌ Only owners can use this command!');
            return;
        }

        const user = message.mentions.members.first();
        if (!user) {
            await message.reply('❌ Please mention a user!');
            return;
        }

        try {
            await user.roles.add(CONFIG.ROLES.STAFF);
            
            const welcomeMessages = [
                `Welcome to the OTO Staff Team! 🎉\nTumhe hardwork karna hai aur team ke saath milkar tournaments ko manage karna hai!`,
                `Congratulations ${user.user.username}! 🌟\nYou're now part of the elite OTO Staff! Dedication and teamwork is the key!`,
                `Welcome aboard ${user.user.username}! 🚀\nYour journey as OTO Staff begins now! Make us proud!`,
                `Hey ${user.user.username}! 👑\nYou're officially OTO Staff! Time to show your management skills!`
            ];

            const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

            await user.send({
                embeds: [Utils.createEmbed(
                    '🎊 Welcome to OTO Staff!',
                    welcomeMsg + '\n\n**Your Responsibilities:**\n' +
                    '✅ Manage tournaments\n' +
                    '✅ Help players\n' +
                    '✅ Moderate chat\n' +
                    '✅ Verify payments\n' +
                    '✅ Send room details\n\n' +
                    'Use `-help` to see staff commands!',
                    '#FFD700'
                )]
            }).catch(() => {});

            await message.reply({
                embeds: [Utils.createEmbed(
                    '✅ Staff Added',
                    `${user} has been added to the staff team! 🎉`,
                    '#00FF00'
                )]
            });
        } catch (error) {
            await message.reply('❌ Failed to add staff role!');
        }
    }

    // ========== OWNER: REMOVE STAFF ==========
    if (command === 'removestaff') {
        if (!Utils.isOwner(message.author.id)) {
            await message.reply('❌ Only owners can use this command!');
            return;
        }

        const user = message.mentions.members.first();
        if (!user) {
            await message.reply('❌ Please mention a user!');
            return;
        }

        try {
            await user.roles.remove(CONFIG.ROLES.STAFF);
            await message.reply({
                embeds: [Utils.createEmbed(
                    '✅ Staff Removed',
                    `${user} has been removed from the staff team.`,
                    '#FF0000'
                )]
            });
        } catch (error) {
            await message.reply('❌ Failed to remove staff role!');
        }
    }

    // ========== OWNER: UNBAN USER ==========
    if (command === 'unban') {
        if (!Utils.isOwner(message.author.id)) {
            await message.reply('❌ Only owners can use this command!');
            return;
        }

        const userId = args[0];
        if (!userId) {
            await message.reply('❌ Please provide a user ID!');
            return;
        }

        try {
            await message.guild.members.unban(userId);
            await message.reply({
                embeds: [Utils.createEmbed(
                    '✅ User Unbanned',
                    `User ID: ${userId} has been unbanned!`,
                    '#00FF00'
                )]
            });
        } catch (error) {
            await message.reply('❌ Failed to unban user!');
        }
    }

    // ========== BOT STATISTICS ==========
    if (command === 'stats') {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const embed = new EmbedBuilder()
            .setTitle('📊 OTO Bot Statistics')
            .setColor('#00BFFF')
            .addFields(
                { name: '👥 Total Profiles', value: DATA.profiles.size.toString(), inline: true },
                { name: '🎮 Active Tournaments', value: DATA.tournaments.size.toString(), inline: true },
                { name: '🎫 Open Tickets', value: DATA.tickets.size.toString(), inline: true },
                { name: '📨 Total Invites', value: Array.from(DATA.invites.values()).reduce((a, b) => a + b.count, 0).toString(), inline: true },
                { name: '⚠️ Total Warnings', value: Array.from(DATA.warnings.values()).reduce((a, b) => a + b.length, 0).toString(), inline: true },
                { name: '🏆 Leaderboard Entries', value: DATA.leaderboard.size.toString(), inline: true },
                { name: '⏰ Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
                { name: '🌐 Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: '👤 Users', value: client.users.cache.size.toString(), inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // ========== LEADERBOARD COMMAND ==========
    if (command === 'leaderboard' || command === 'lb') {
        const sortedProfiles = Array.from(DATA.profiles.values())
            .sort((a, b) => b.wins - a.wins)
            .slice(0, 15);

        if (sortedProfiles.length === 0) {
            await message.reply('No leaderboard data available yet!');
            return;
        }

        let leaderboardText = '```\n';
        leaderboardText += '╔══════════════════════════════════════╗\n';
        leaderboardText += '║     🏆 TOP PLAYERS LEADERBOARD 🏆    ║\n';
        leaderboardText += '╠══════════════════════════════════════╣\n';

        sortedProfiles.forEach((profile, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
            const name = profile.name.substring(0, 18).padEnd(18);
            const wins = profile.wins.toString().padStart(3);
            leaderboardText += `║ ${medal} ${rank.toString().padStart(2)}. ${name} ${wins} ║\n`;
        });

        leaderboardText += '╚══════════════════════════════════════╝\n';
        leaderboardText += '```';

        const embed = Utils.createEmbed(
            '🏆 OTO Tournament Leaderboard',
            leaderboardText,
            '#FFD700'
        );

        await message.reply({ embeds: [embed] });
    }
});

// ==================== INTERACTION CREATE (BUTTONS & MODALS) ====================
client.on('interactionCreate', async interaction => {
    try {
        // ========== BUTTON: CREATE PROFILE START ==========
        if (interaction.isButton() && interaction.customId === 'create_profile_start') {
            const modal = ProfileSystem.createProfileModal();
            await interaction.showModal(modal);
        }

        // ========== MODAL: PROFILE CREATION ==========
        if (interaction.isModalSubmit() && interaction.customId === 'profile_creation_modal') {
            const name = interaction.fields.getTextInputValue('profile_name');
            const state = interaction.fields.getTextInputValue('profile_state');
            const gender = interaction.fields.getTextInputValue('profile_gender');
            const game = interaction.fields.getTextInputValue('profile_game');
            const age = interaction.fields.getTextInputValue('profile_age') || 'Not specified';

            const profileData = { name, state, gender, game, age };
            const profile = await ProfileSystem.completeProfile(interaction.user.id, profileData, interaction.guild);

            const embed = Utils.createEmbed(
                '✅ Profile Created Successfully!',
                `Welcome ${profile.name}! Your OTO profile is ready! 🎉\n\n` +
                `**Your OTO ID:** \`${profile.otoId}\`\n` +
                `**Primary Game:** ${profile.game}\n` +
                `**State:** ${profile.state}\n\n` +
                `You can now:\n` +
                `✅ Join tournaments\n` +
                `✅ Chat in general\n` +
                `✅ Invite friends\n` +
                `✅ Win prizes!\n\n` +
                `Use \`-profile\` to view your full profile anytime!`,
                '#00FF00'
            );

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Send greeting in general chat
            const generalChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
            if (generalChannel) {
                let greeting = '';
                if (profile.gender === 'female') {
                    greeting = Utils.getFemaleGreeting(profile.name);
                } else {
                    greeting = Utils.getMaleGreeting(profile.name);
                }

                const welcomeEmbed = Utils.createEmbed(
                    '🎊 New Player Joined!',
                    `${greeting}\n\n<@${interaction.user.id}> has completed their profile and is ready to dominate! 🔥`,
                    '#4CAF50'
                );
                await generalChannel.send({ embeds: [welcomeEmbed] });
            }
        }

        // ========== BUTTON: CREATE TOURNAMENT START ==========
        if (interaction.isButton() && interaction.customId === 'tournament_create_start') {
            if (!Utils.isStaff(interaction.member)) {
                await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('tournament_creation_modal')
                .setTitle('Create New Tournament');

            const titleInput = new TextInputBuilder()
                .setCustomId('tournament_title')
                .setLabel('Tournament Title')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., Solo - Bermuda')
                .setRequired(true);

            const gameInput = new TextInputBuilder()
                .setCustomId('tournament_game')
                .setLabel('Game (Free Fire/Minecraft/PUBG)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., Free Fire')
                .setRequired(true);

            const prizeInput = new TextInputBuilder()
                .setCustomId('tournament_prize')
                .setLabel('Prize Pool (₹)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 500')
                .setRequired(true);

            const entryInput = new TextInputBuilder()
                .setCustomId('tournament_entry')
                .setLabel('Entry Fee (₹)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 50')
                .setRequired(true);

            const slotsInput = new TextInputBuilder()
                .setCustomId('tournament_slots')
                .setLabel('Max Slots')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 48')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(gameInput),
                new ActionRowBuilder().addComponents(prizeInput),
                new ActionRowBuilder().addComponents(entryInput),
                new ActionRowBuilder().addComponents(slotsInput)
            );

            await interaction.showModal(modal);
        }

        // ========== MODAL: TOURNAMENT CREATION ==========
        if (interaction.isModalSubmit() && interaction.customId === 'tournament_creation_modal') {
            const title = interaction.fields.getTextInputValue('tournament_title');
            const game = interaction.fields.getTextInputValue('tournament_game');
            const prizePool = parseInt(interaction.fields.getTextInputValue('tournament_prize'));
            const entryFee = parseInt(interaction.fields.getTextInputValue('tournament_entry'));
            const maxSlots = parseInt(interaction.fields.getTextInputValue('tournament_slots'));

            const tournamentData = {
                title,
                game,
                prizePool,
                entryFee,
                maxSlots,
                type: 'Solo',
                prizes: [prizePool * 0.5, prizePool * 0.3, prizePool * 0.2],
                description: 'Join now and win big!',
                time: 'TBA',
                date: new Date().toLocaleDateString('en-IN'),
                createdBy: interaction.user.id
            };

            const tournament = await TournamentSystem.createTournament(tournamentData);

            // Post to tournament schedule
            const scheduleChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
            if (scheduleChannel) {
                const embed = TournamentSystem.createTournamentEmbed(tournament);
                const buttons = TournamentSystem.createTournamentButtons(tournament.id);
                const message = await scheduleChannel.send({ 
                    content: '@everyone **🔥 New Tournament Alert! 🔥**',
                    embeds: [embed], 
                    components: [buttons] 
                });

                // Store message ID for updates
                tournament.messageId = message.id;
                DATA.tournaments.set(tournament.id, tournament);
            }

            // Post to general with spam
            const generalChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
            if (generalChannel) {
                const spamEmbed = Utils.createEmbed(
                    '🎮 TOURNAMENT ALERT! 🔥',
                    `**${game}** tournament is LIVE!\n\n` +
                    `💰 Win ₹${prizePool}!\n` +
                    `🎫 Entry: ₹${entryFee}\n` +
                    `📊 Slots: ${maxSlots}\n\n` +
                    `Jaldi karo! Limited slots! 🏃‍♂️`,
                    '#FF0000'
                );
                await generalChannel.send({ embeds: [spamEmbed] });

                // Spam after 2 minutes
                setTimeout(async () => {
                    await generalChannel.send({ embeds: [spamEmbed] });
                }, 120000);
            }

            await interaction.reply({ 
                content: `✅ Tournament created! ID: \`${tournament.id}\``, 
                ephemeral: true 
            });
        }

        // ========== BUTTON: JOIN TOURNAMENT ==========
        if (interaction.isButton() && interaction.customId.startsWith('join_tournament_')) {
            const tournamentId = interaction.customId.replace('join_tournament_', '');
            const tournament = TournamentSystem.getTournament(tournamentId);

            if (!tournament) {
                await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
                return;
            }

            if (tournament.currentSlots >= tournament.maxSlots) {
                await interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
                return;
            }

            // Check if user has profile
            if (!ProfileSystem.hasProfile(interaction.user.id)) {
                await interaction.reply({ 
                    content: '❌ Please create your profile first! Check your DMs or use `-createprofile`', 
                    ephemeral: true 
                });
                return;
            }

            // Create private ticket
            const ticketResult = await Utils.createPrivateTicket(
                interaction.guild,
                interaction.user.id,
                `tournament-${tournament.title}`,
                tournament
            );

            if (!ticketResult) {
                await interaction.reply({ content: '❌ Failed to create ticket!', ephemeral: true });
                return;
            }

            const { ticketChannel, ticketId } = ticketResult;

            // Welcome message in ticket
            const profile = ProfileSystem.getProfile(interaction.user.id);
            const welcomeEmbed = Utils.createEmbed(
                `🎮 Welcome to ${tournament.title}!`,
                `Hello ${profile.name}! 👋\n\n` +
                `Thanks for joining our tournament! Follow the steps below:\n\n` +
                `**Step 1:** Share your ${tournament.game} in-game name/ID\n` +
                `**Step 2:** Make payment of ₹${tournament.entryFee}\n` +
                `**Step 3:** Upload payment screenshot\n` +
                `**Step 4:** Wait for staff confirmation\n\n` +
                `Tournament Details:\n` +
                `💰 Prize Pool: ₹${tournament.prizePool}\n` +
                `📊 Slots: ${tournament.currentSlots + 1}/${tournament.maxSlots}\n` +
                `⏰ Time: ${tournament.time || 'TBA'}`,
                '#00FF00'
            );

            // Payment QR (dummy for now)
            const qrEmbed = Utils.createEmbed(
                '💳 Payment Information',
                `**Amount:** ₹${tournament.entryFee}\n` +
                `**UPI ID:** ototournament@paytm\n` +
                `**Phone:** +91-XXXXXXXXXX\n\n` +
                `After payment, upload screenshot here! 📸`,
                '#FFD700'
            );

            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_payment_${ticketId}_${tournamentId}`)
                        .setLabel('Confirm Payment (Staff Only)')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId(`close_ticket_${ticketId}`)
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await ticketChannel.send({ 
                content: `<@${interaction.user.id}> <@&${CONFIG.ROLES.STAFF}>`,
                embeds: [welcomeEmbed, qrEmbed], 
                components: [confirmRow] 
            });

            // Update slots
            await TournamentSystem.updateTournamentSlots(tournamentId, true);

            // Notify staff
            const staffChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
            if (staffChannel) {
                const staffEmbed = Utils.createEmbed(
                    '🎫 New Tournament Registration',
                    `**Player:** <@${interaction.user.id}>\n` +
                    `**Tournament:** ${tournament.title}\n` +
                    `**Entry Fee:** ₹${tournament.entryFee}\n` +
                    `**Ticket:** <#${ticketChannel.id}>\n` +
                    `**Slots:** ${tournament.currentSlots + 1}/${tournament.maxSlots}`,
                    '#4CAF50'
                );
                await staffChannel.send({ embeds: [staffEmbed] });
            }

            await interaction.reply({ 
                content: `✅ Ticket created! Please check <#${ticketChannel.id}>`, 
                ephemeral: true 
            });
        }

        // ========== BUTTON: CONFIRM PAYMENT ==========
        if (interaction.isButton() && interaction.customId.startsWith('confirm_payment_')) {
            if (!Utils.isStaff(interaction.member)) {
                await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
                return;
            }

            const parts = interaction.customId.split('_');
            const ticketId = parts[2];
            const tournamentId = parts[3];

            const ticket = DATA.tickets.get(ticketId);
            const tournament = DATA.tournaments.get(tournamentId);

            if (!ticket || !tournament) {
                await interaction.reply({ content: '❌ Invalid ticket/tournament!', ephemeral: true });
                return;
            }

            // Mark as confirmed
            ticket.status = 'confirmed';
            ticket.confirmedAt = Date.now();
            ticket.confirmedBy = interaction.user.id;
            DATA.tickets.set(ticketId, ticket);

            await TournamentSystem.confirmParticipant(tournamentId, ticket.userId, 'confirmed');

            // Send confirmation to user
            try {
                const user = await interaction.guild.members.fetch(ticket.userId);
                await user.send({
                    embeds: [Utils.createEmbed(
                        '✅ Payment Confirmed!',
                        `Your payment for **${tournament.title}** has been verified!\n\n` +
                        `You are now registered for the tournament! 🎉\n\n` +
                        `**Tournament Details:**\n` +
                        `🎮 Game: ${tournament.game}\n` +
                        `⏰ Time: ${tournament.time || 'TBA'}\n` +
                        `📅 Date: ${tournament.date}\n\n` +
                        `Room ID and password will be shared 10 minutes before the match!\n\n` +
                        `Good luck! 🏆`,
                        '#00FF00'
                    )]
                });
            } catch (error) {
                console.log('Could not DM user');
            }

            // Create lobby ticket for confirmed players
            const lobbyTicketId = `LOBBY_${tournamentId}_${ticket.userId}`;
            if (!DATA.lobbyTickets.has(tournamentId)) {
                DATA.lobbyTickets.set(tournamentId, []);
            }
            DATA.lobbyTickets.get(tournamentId).push(ticket.userId);

            await interaction.reply({ 
                content: `✅ Payment confirmed for <@${ticket.userId}>! They can now access the tournament lobby.`, 
                ephemeral: false 
            });

            // Update tournament message in schedule
            const scheduleChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
            if (scheduleChannel && tournament.messageId) {
                try {
                    const message = await scheduleChannel.messages.fetch(tournament.messageId);
                    const updatedEmbed = TournamentSystem.createTournamentEmbed(tournament);
                    const isFull = tournament.currentSlots >= tournament.maxSlots;
                    const buttons = TournamentSystem.createTournamentButtons(tournament.id, isFull);
                    await message.edit({ embeds: [updatedEmbed], components: [buttons] });
                } catch (error) {
                    console.log('Could not update tournament message');
                }
            }

            // Auto-close ticket after 10 minutes
            setTimeout(async () => {
                try {
                    const ticketChannel = interaction.guild.channels.cache.get(ticket.channelId);
                    if (ticketChannel) {
                        await ticketChannel.send({
                            embeds: [Utils.createEmbed(
                                '🔒 Auto-Closing Ticket',
                                'This ticket will be closed in 30 seconds...',
                                '#FFA500'
                            )]
                        });

                        setTimeout(async () => {
                            await ticketChannel.delete();
                            DATA.tickets.delete(ticketId);
                        }, 30000);
                    }
                } catch (error) {
                    console.log('Could not auto-close ticket');
                }
            }, 600000); // 10 minutes
        }

        // ========== BUTTON: CLOSE TICKET ==========
        if (interaction.isButton() && interaction.customId.startsWith('close_ticket_')) {
            const ticketId = interaction.customId.replace('close_ticket_', '');
            const ticket = DATA.tickets.get(ticketId);

            if (!ticket) {
                await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
                return;
            }

            const isOwner = ticket.userId === interaction.user.id;
            const isStaffMember = Utils.isStaff(interaction.member);

            if (!isOwner && !isStaffMember) {
                await interaction.reply({ content: '❌ You cannot close this ticket!', ephemeral: true });
                return;
            }

            await interaction.reply({
                embeds: [Utils.createEmbed(
                    '🔒 Closing Ticket',
                    'This ticket will be deleted in 10 seconds...',
                    '#FFA500'
                )]
            });

            setTimeout(async () => {
                try {
                    const channel = interaction.guild.channels.cache.get(ticket.channelId);
                    if (channel) {
                        await channel.delete();
                    }
                    DATA.tickets.delete(ticketId);
                } catch (error) {
                    console.log('Could not delete ticket channel');
                }
            }, 10000);
        }

        // ========== BUTTON: CLAIM INVITE REWARD ==========
        if (interaction.isButton() && interaction.customId.startsWith('claim_reward_')) {
            const parts = interaction.customId.split('_');
            const milestone = parseInt(parts[2]);
            const userId = parts[3];

            if (interaction.user.id !== userId) {
                await interaction.reply({ content: '❌ This is not your reward!', ephemeral: true });
                return;
            }

            // Create free tournament ticket
            if (milestone === 10) {
                const ticketResult = await Utils.createPrivateTicket(
                    interaction.guild,
                    userId,
                    'free-tournament-entry',
                    { title: 'Free Tournament Entry', entryFee: 0, prizePool: 500 }
                );

                if (ticketResult) {
                    const { ticketChannel } = ticketResult;
                    
                    const embed = Utils.createEmbed(
                        '🎁 Free Tournament Entry!',
                        `Congratulations on completing 10 invites! 🎉\n\n` +
                        `This is your **FREE TOURNAMENT ENTRY** reward!\n\n` +
                        `A staff member will assist you shortly. You can join any upcoming tournament for FREE!\n\n` +
                        `Keep inviting to unlock more rewards! 💪`,
                        '#FFD700'
                    );

                    await ticketChannel.send({ 
                        content: `<@${userId}> <@&${CONFIG.ROLES.STAFF}>`,
                        embeds: [embed] 
                    });

                    await interaction.reply({ 
                        content: `✅ Reward claimed! Check <#${ticketChannel.id}>`, 
                        ephemeral: true 
                    });
                }
            } else {
                await interaction.reply({ 
                    content: '✅ Reward claimed! Your special perks are now active!', 
                    ephemeral: true 
                });
            }
        }

    } catch (error) {
        console.error('Interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred!', ephemeral: true }).catch(() => {});
        }
    }
});

// ==================== ERROR HANDLING ====================
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// ==================== LOGIN ====================
client.login(CONFIG.TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});

// ==================== EXPORTS ====================
module.exports = {
    client,
    DATA,
    Utils,
    ProfileSystem,
    TournamentSystem,
    InviteSystem,
    ModerationSystem,
    AutoResponseSystem
};
