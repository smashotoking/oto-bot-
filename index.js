const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionFlagsBits,
    Collection,
    Events,
    AttachmentBuilder
} = require('discord.js');
const moment = require('moment');
const cron = require('node-cron');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ==================== INITIALIZATION ====================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Health check server for Render
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        bot: 'OTO Tournament Bot', 
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
});

// ==================== CONFIGURATION ====================
const CONFIG = {
    CHANNELS: {
        ANNOUNCEMENT: '1438484746165555243',
        TOURNAMENT_SCHEDULE: '1438482561679626303',
        GENERAL_CHAT: '1438482904018849835',
        TICKET_LOGS: '1438485821572518030',
        MATCH_REPORTS: '1438486113047150714',
        LEADERBOARD: '1438947356690223347',
        INVITE_TRACKER: '1439216884774998107',
        PROFILE_SECTION: '1439542574066176020',
        STAFF_TOOLS: '1438486059255336970',
        STAFF_CHAT: '1438486059255336970',
        MINECRAFT_TOURNAMENT: '1439223955960627421',
        PLAYER_FORM: '1438486008453660863',
        BOT_COMMANDS: '1438483009950191676',
        FREE_FIRE_CHAT: '1438482904018849836',
        MINECRAFT_CHAT: '1439223955960627421'
    },
    ROLES: {
        STAFF: '1438475461977047112',
        ADMIN: '1438475461977047112',
        PLAYER: '1438475461977047113',
        FOUNDER: '1438475461977047114',
        VERIFIED: '1438475461977047115',
        PRO_PLAYER: '1438475461977047116',
        ELITE_INVITER: '1438475461977047117',
        CHAMPION: '1438475461977047118'
    },
    BADGE_EMOJIS: {
        FIRST_TOURNAMENT: '🎖️',
        HOT_STREAK: '🔥',
        CHAMPION: '👑',
        ELITE_INVITER: '💎',
        QUICK_DRAW: '⚡',
        SHARPSHOOTER: '🎯',
        BUILDER: '🏗️',
        MONEY_MAKER: '💰',
        EARLY_BIRD: '📱',
        OG_MEMBER: '🌟'
    },
    COLORS: {
        SUCCESS: 0x00FF00,
        ERROR: 0xFF0000,
        WARNING: 0xFFFF00,
        INFO: 0x0099FF,
        PREMIUM: 0xFFD700,
        STAFF: 0x9B59B6
    }
};

// ==================== DATA STORAGE ====================
class JSONDatabase {
    constructor() {
        this.dataDir = './data';
        this.ensureDataDir();
        this.data = {};
        this.loadAllData();
        this.setupAutoSave();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    loadAllData() {
        const files = {
            profiles: 'profiles.json',
            tournaments: 'tournaments.json',
            invites: 'invites.json',
            tickets: 'tickets.json',
            staffActions: 'staffActions.json',
            userStats: 'userStats.json',
            leaderboards: 'leaderboards.json',
            payments: 'payments.json',
            lobbies: 'lobbies.json',
            achievements: 'achievements.json',
            sessions: 'sessions.json'
        };

        for (const [key, filename] of Object.entries(files)) {
            const filepath = path.join(this.dataDir, filename);
            try {
                if (fs.existsSync(filepath)) {
                    this.data[key] = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                } else {
                    this.data[key] = {};
                    this.saveToFile(key, filename);
                }
            } catch (error) {
                console.error(`Error loading ${filename}:`, error);
                this.data[key] = {};
            }
        }
    }

    saveToFile(table, filename) {
        try {
            const filepath = path.join(this.dataDir, filename);
            fs.writeFileSync(filepath, JSON.stringify(this.data[table] || {}, null, 2));
        } catch (error) {
            console.error(`Error saving ${filename}:`, error);
        }
    }

    saveAllData() {
        const files = {
            profiles: 'profiles.json',
            tournaments: 'tournaments.json',
            invites: 'invites.json',
            tickets: 'tickets.json',
            staffActions: 'staffActions.json',
            userStats: 'userStats.json',
            leaderboards: 'leaderboards.json',
            payments: 'payments.json',
            lobbies: 'lobbies.json',
            achievements: 'achievements.json',
            sessions: 'sessions.json'
        };

        for (const [table, filename] of Object.entries(files)) {
            this.saveToFile(table, filename);
        }
    }

    setupAutoSave() {
        setInterval(() => {
            this.saveAllData();
            console.log('💾 Data auto-saved');
        }, 300000); // 5 minutes
    }

    get(table, key) {
        return this.data[table]?.[key];
    }

    set(table, key, value) {
        if (!this.data[table]) this.data[table] = {};
        this.data[table][key] = value;
        return value;
    }

    delete(table, key) {
        if (this.data[table]?.[key]) {
            delete this.data[table][key];
            return true;
        }
        return false;
    }

    getAll(table) {
        return this.data[table] || {};
    }

    push(table, key, value) {
        if (!this.data[table]) this.data[table] = {};
        if (!this.data[table][key]) this.data[table][key] = [];
        this.data[table][key].push(value);
        return this.data[table][key];
    }
}

const db = new JSONDatabase();

// ==================== UTILITY CLASSES ====================
class OTOUtils {
    static generateOTP(length = 6) {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < length; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }

    static generateOtoId(userId) {
        return `OTO${Date.now().toString().slice(-6)}${userId.slice(-4)}`;
    }

    static formatIndianRupees(amount) {
        return '₹' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    static getTimeRemaining(targetTime) {
        const now = moment();
        const target = moment(targetTime);
        const duration = moment.duration(target.diff(now));
        
        if (duration.asSeconds() <= 0) return 'Started';
        
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    static createProgressBar(current, max, length = 10) {
        const percentage = current / max;
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty) + ` ${Math.round(percentage * 100)}%`;
    }

    static detectLanguage(text) {
        const hindiRegex = /[\u0900-\u097F]/;
        return hindiRegex.test(text) ? 'hindi' : 'english';
    }

    static sanitizeInput(input) {
        return input.replace(/[`@#*_~]/g, '');
    }
}

class ResponseGenerator {
    static getWelcomeMessage(user, profile = null) {
        const messages = [
            `🔥 **Yo! Welcome to OTO Tournaments ${user.username}!** Ready to win big? 🏆`,
            `💪 **A new warrior has arrived!** Let's goooo ${user.username}! 🎮`,
            `🎮 **Welcome bro ${user.username}!** Your journey to ₹₹₹ starts now! 💰`,
            `⚡ **New player detected!** ${user.username}, tournament kheloge? 🔥`,
            `🚀 **Welcome to the arena ${user.username}!** Time to show your skills! 🏅`,
            `🌟 **Hey ${user.username}!** Get ready for epic tournaments! ⚔️`,
            `🎯 **Welcome champion ${user.username}!** Your first win awaits! 🏆`,
            `💥 **Boom! ${user.username} joined!** Let the games begin! 🎮`,
            `👑 **Royal welcome ${user.username}!** Prepare for battle! ⚔️`,
            `🚨 **Alert! Pro player ${user.username} entered!** Watch out! 🔥`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    static getTournamentResponse(gender = 'male') {
        if (gender === 'female') {
            const responses = [
                "Hello ji! Aaj tournament khelogi? 😊 Slots filling fast!",
                "Hi sister! Custom match khelogi? 🎮 Prize pool ₹500 hai!",
                "Hey! Tournament join karna hai? 🔥 Slot book karo!",
                "Hello! Aaj khel ke dikhao! 🏆 Registration open hai!",
                "Hi! FreeFire ya Minecraft? Dono ke tournaments chal rahe! 🎮"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        } else {
            const responses = [
                "Kya haal bhai! Tournament kheloge aaj? 😊 Slots kam hain!",
                "Hello bro! Slot book karo, tournament shuru hone wala hai! 🚀",
                "Hey bhai! Custom challenge karoge? 😎 Prize pool ₹500!",
                "Kya scene bhai? Aaj tournament hai, join karo! 🔥",
                "Hello brother! Machayenge kya aaj? 🏆 Registration open!"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    static getAchievementMessage(achievement, user) {
        const messages = {
            FIRST_TOURNAMENT: `🎖️ **Congratulations ${user.username}!** You've completed your first tournament!`,
            HOT_STREAK: `🔥 **Incredible ${user.username}!** 3 wins in a row! You're on fire!`,
            CHAMPION: `👑 **Legendary ${user.username}!** You've won 10+ tournaments!`,
            ELITE_INVITER: `💎 **Amazing ${user.username}!** You've invited 50+ friends!`,
            MONEY_MAKER: `💰 **Rich ${user.username}!** You've earned ₹5000+ from tournaments!`
        };
        return messages[achievement] || `🎉 **Achievement Unlocked!** ${user.username} earned: ${achievement}`;
    }
}

// ==================== SECURITY SYSTEMS ====================
class SecuritySystem {
    static BAD_WORDS = [
        'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'chod', 
        'lund', 'gandu', 'madarchod', 'behenchod', 'bhosdike'
    ];

    static SPAM_DETECTION = new Map();
    static WARNING_SYSTEM = new Map();

    static containsBadWords(content) {
        const lowerContent = content.toLowerCase();
        return this.BAD_WORDS.some(word => lowerContent.includes(word));
    }

    static detectSpam(userId) {
        const now = Date.now();
        const userData = this.SPAM_DETECTION.get(userId) || { messages: [], lastWarning: 0 };
        
        userData.messages = userData.messages.filter(time => now - time < 5000);
        userData.messages.push(now);
        
        this.SPAM_DETECTION.set(userId, userData);
        
        if (userData.messages.length > 8) return 'HIGH';
        if (userData.messages.length > 5) return 'MEDIUM';
        return 'LOW';
    }

    static addWarning(userId, reason) {
        const warnings = this.WARNING_SYSTEM.get(userId) || [];
        warnings.push({
            reason,
            timestamp: Date.now(),
            staff: 'AUTO_MOD'
        });
        this.WARNING_SYSTEM.set(userId, warnings);
        return warnings.length;
    }

    static getWarnings(userId) {
        return this.WARNING_SYSTEM.get(userId) || [];
    }

    static clearWarnings(userId) {
        this.WARNING_SYSTEM.delete(userId);
    }
}

// ==================== PROFILE SYSTEM ====================
class ProfileManager {
    static async createProfile(user, data) {
        const otoId = OTOUtils.generateOtoId(user.id);
        const profile = {
            otoId,
            name: OTOUtils.sanitizeInput(data.name),
            state: OTOUtils.sanitizeInput(data.state),
            game: data.game,
            gender: data.gender,
            level: 1,
            experience: 0,
            badges: ['FIRST_TOURNAMENT'],
            stats: {
                tournamentsPlayed: 0,
                tournamentsWon: 0,
                totalEarnings: 0,
                killCount: 0,
                winStreak: 0,
                bestWinStreak: 0
            },
            preferences: {
                language: 'english',
                notifications: true,
                autoJoin: false
            },
            createdAt: Date.now(),
            lastActive: Date.now()
        };

        db.set('profiles', user.id, profile);
        
        try {
            const guild = client.guilds.cache.first();
            const member = await guild.members.fetch(user.id);
            const verifiedRole = guild.roles.cache.get(CONFIG.ROLES.VERIFIED);
            if (verifiedRole) {
                await member.roles.add(verifiedRole);
            }
        } catch (error) {
            console.error('Error assigning verified role:', error);
        }

        return profile;
    }

    static getProfile(userId) {
        return db.get('profiles', userId);
    }

    static updateStats(userId, statsUpdate) {
        const profile = this.getProfile(userId);
        if (profile) {
            Object.keys(statsUpdate).forEach(key => {
                if (profile.stats[key] !== undefined) {
                    profile.stats[key] += statsUpdate[key];
                }
            });
            profile.lastActive = Date.now();
            db.set('profiles', userId, profile);
            
            this.checkAchievements(userId, profile);
            
            return profile;
        }
        return null;
    }

    static checkAchievements(userId, profile) {
        const achievements = [];
        const currentBadges = new Set(profile.badges);

        if (profile.stats.tournamentsPlayed >= 1 && !currentBadges.has('FIRST_TOURNAMENT')) {
            achievements.push('FIRST_TOURNAMENT');
            currentBadges.add('FIRST_TOURNAMENT');
        }

        if (profile.stats.winStreak >= 3 && !currentBadges.has('HOT_STREAK')) {
            achievements.push('HOT_STREAK');
            currentBadges.add('HOT_STREAK');
        }

        if (profile.stats.tournamentsWon >= 10 && !currentBadges.has('CHAMPION')) {
            achievements.push('CHAMPION');
            currentBadges.add('CHAMPION');
        }

        if (profile.stats.totalEarnings >= 5000 && !currentBadges.has('MONEY_MAKER')) {
            achievements.push('MONEY_MAKER');
            currentBadges.add('MONEY_MAKER');
        }

        if (achievements.length > 0) {
            profile.badges = Array.from(currentBadges);
            db.set('profiles', userId, profile);
            
            achievements.forEach(achievement => {
                this.notifyAchievement(userId, achievement);
            });
        }

        return achievements;
    }

    static async notifyAchievement(userId, achievement) {
        try {
            const user = await client.users.fetch(userId);
            const profile = this.getProfile(userId);
            const message = ResponseGenerator.getAchievementMessage(achievement, user);
            
            const embed = new EmbedBuilder()
                .setTitle('🎉 Achievement Unlocked!')
                .setDescription(message)
                .addFields(
                    { name: 'Badge', value: CONFIG.BADGE_EMOJIS[achievement] || '🎖️', inline: true },
                    { name: 'Your Level', value: `Level ${profile.level}`, inline: true },
                    { name: 'Tournaments Won', value: profile.stats.tournamentsWon.toString(), inline: true }
                )
                .setColor(CONFIG.COLORS.PREMIUM)
                .setTimestamp();

            await user.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending achievement notification:', error);
        }
    }

    static async generateProfileCard(userId) {
        // Simplified profile card without canvas
        const profile = this.getProfile(userId);
        if (!profile) return null;

        // Create a text-based profile card
        const profileText = `
🎮 OTO PROFILE CARD
━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${profile.name}
🆔 OTO ID: ${profile.otoId}
🎯 Level: ${profile.level}
⭐ Experience: ${profile.experience}
━━━━━━━━━━━━━━━━━━━━━━
📊 STATISTICS
🏆 Tournaments: ${profile.stats.tournamentsPlayed}
🥇 Wins: ${profile.stats.tournamentsWon}
💰 Earnings: ${OTOUtils.formatIndianRupees(profile.stats.totalEarnings)}
🎯 Kills: ${profile.stats.killCount}
🔥 Streak: ${profile.stats.winStreak}
━━━━━━━━━━━━━━━━━━━━━━
🎖️ BADGES: ${profile.badges.map(b => CONFIG.BADGE_EMOJIS[b]).join(' ')}
━━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        return profileText;
    }
}

// ==================== TOURNAMENT SYSTEM ====================
class TournamentManager {
    static createTournament(data) {
        const tournamentId = `T${Date.now()}`;
        const tournament = {
            id: tournamentId,
            title: data.title,
            game: data.game,
            mode: data.mode,
            prizePool: parseInt(data.prizePool),
            entryFee: parseInt(data.entryFee) || 50,
            totalSlots: parseInt(data.slots),
            filledSlots: 0,
            registeredPlayers: [],
            confirmedPlayers: [],
            status: 'OPEN',
            schedule: data.schedule || Date.now() + 3600000,
            createdBy: data.creatorId,
            createdAt: Date.now(),
            settings: {
                map: data.map || 'Bermuda',
                rules: data.rules || 'Standard tournament rules apply',
                prizeDistribution: data.prizeDistribution || this.getDefaultPrizeDistribution(data.prizePool, data.mode),
                perKillPrize: data.perKillPrize || 0,
                autoStart: data.autoStart || false
            }
        };

        db.set('tournaments', tournamentId, tournament);
        return tournament;
    }

    static getDefaultPrizeDistribution(prizePool, mode) {
        const pool = parseInt(prizePool);
        if (mode.toLowerCase().includes('solo')) {
            return {
                '1': Math.floor(pool * 0.5),
                '2': Math.floor(pool * 0.3),
                '3': Math.floor(pool * 0.2)
            };
        } else {
            return {
                '1': Math.floor(pool * 0.6),
                '2': Math.floor(pool * 0.3),
                '3': Math.floor(pool * 0.1)
            };
        }
    }

    static registerPlayer(tournamentId, userId) {
        const tournament = db.get('tournaments', tournamentId);
        if (!tournament || tournament.status !== 'OPEN') {
            return { success: false, error: 'Tournament not available' };
        }

        if (tournament.registeredPlayers.includes(userId)) {
            return { success: false, error: 'Already registered' };
        }

        if (tournament.filledSlots >= tournament.totalSlots) {
            return { success: false, error: 'Tournament full' };
        }

        tournament.registeredPlayers.push(userId);
        tournament.filledSlots = tournament.registeredPlayers.length;
        db.set('tournaments', tournamentId, tournament);

        return { success: true, tournament };
    }

    static confirmPlayer(tournamentId, userId) {
        const tournament = db.get('tournaments', tournamentId);
        if (!tournament) return false;

        if (!tournament.confirmedPlayers.includes(userId)) {
            tournament.confirmedPlayers.push(userId);
            db.set('tournaments', tournamentId, tournament);
        }
        return true;
    }

    static getTournamentEmbed(tournament) {
        const timeRemaining = OTOUtils.getTimeRemaining(tournament.schedule);
        const progressBar = OTOUtils.createProgressBar(tournament.filledSlots, tournament.totalSlots);

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${tournament.title}`)
            .setDescription(`**Registration is ${tournament.status === 'OPEN' ? 'OPEN' : 'CLOSED'}!**\n\n${tournament.settings.rules}`)
            .addFields(
                { name: '💰 Prize Pool', value: OTOUtils.formatIndianRupees(tournament.prizePool), inline: true },
                { name: '🎫 Entry Fee', value: OTOUtils.formatIndianRupees(tournament.entryFee), inline: true },
                { name: '📊 Slots', value: `${tournament.filledSlots}/${tournament.totalSlots}`, inline: true },
                { name: '⏰ Time', value: `<t:${Math.floor(tournament.schedule / 1000)}:R>`, inline: true },
                { name: '🎮 Game', value: tournament.game, inline: true },
                { name: '🎯 Mode', value: tournament.mode, inline: true },
                { name: '🗺️ Map', value: tournament.settings.map, inline: true },
                { name: 'Progress', value: progressBar, inline: false }
            )
            .setColor(tournament.status === 'OPEN' ? CONFIG.COLORS.SUCCESS : CONFIG.COLORS.ERROR)
            .setFooter({ text: `Tournament ID: ${tournament.id} • Starts ${timeRemaining}` })
            .setTimestamp();

        if (tournament.settings.prizeDistribution) {
            const prizeText = Object.entries(tournament.settings.prizeDistribution)
                .map(([rank, prize]) => `🥇 ${rank}${this.getRankSuffix(rank)}: ${OTOUtils.formatIndianRupees(prize)}`)
                .join('\n');
            embed.addFields({ name: '🏆 Prize Distribution', value: prizeText, inline: false });
        }

        return embed;
    }

    static getRankSuffix(rank) {
        if (rank === '1') return 'st';
        if (rank === '2') return 'nd';
        if (rank === '3') return 'rd';
        return 'th';
    }

    static getTournamentActions(tournamentId) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`join_${tournamentId}`)
                .setLabel('Join Tournament')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎮'),
            new ButtonBuilder()
                .setCustomId(`info_${tournamentId}`)
                .setLabel('Tournament Info')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('ℹ️'),
            new ButtonBuilder()
                .setCustomId(`players_${tournamentId}`)
                .setLabel('View Players')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👥')
        );

        return row;
    }
}

// ==================== TICKET SYSTEM ====================
class TicketManager {
    static async createTournamentTicket(user, tournamentId, isFreeEntry = false) {
        const guild = client.guilds.cache.first();
        const tournament = db.get('tournaments', tournamentId);
        
        if (!tournament) {
            throw new Error('Tournament not found');
        }

        let category = guild.channels.cache.find(ch => 
            ch.name === '🎫 TOURNAMENT TICKETS' && ch.type === ChannelType.GuildCategory
        );

        if (!category) {
            category = await guild.channels.create({
                name: '🎫 TOURNAMENT TICKETS',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: CONFIG.ROLES.STAFF,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                    }
                ]
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}-${OTOUtils.generateOTP(4)}`,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: `Tournament: ${tournament.title} | User: ${user.username} | Free: ${isFreeEntry}`,
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
                    id: CONFIG.ROLES.STAFF,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: CONFIG.ROLES.ADMIN,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                }
            ]
        });

        const ticketData = {
            id: ticketChannel.id,
            userId: user.id,
            tournamentId: tournamentId,
            type: isFreeEntry ? 'FREE_ENTRY' : 'PAID_ENTRY',
            status: 'OPEN',
            createdAt: Date.now(),
            paymentStatus: isFreeEntry ? 'FREE' : 'PENDING',
            paymentAmount: isFreeEntry ? 0 : tournament.entryFee
        };

        db.set('tickets', ticketChannel.id, ticketData);

        await this.sendTicketWelcome(ticketChannel, user, tournament, isFreeEntry);

        return ticketChannel;
    }

    static async sendTicketWelcome(channel, user, tournament, isFreeEntry) {
        const profile = ProfileManager.getProfile(user.id);
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 TOURNAMENT REGISTRATION TICKET')
            .setDescription(`Hello ${user.username}! Welcome to your tournament registration.`)
            .addFields(
                { name: 'Tournament', value: tournament.title, inline: true },
                { name: 'Game', value: tournament.game, inline: true },
                { name: 'Mode', value: tournament.mode, inline: true },
                { name: 'Entry Type', value: isFreeEntry ? '🎁 FREE Entry' : '💰 Paid Entry', inline: true },
                { name: 'Entry Fee', value: isFreeEntry ? 'FREE' : OTOUtils.formatIndianRupees(tournament.entryFee), inline: true },
                { name: 'Player OTO ID', value: profile?.otoId || 'Not set', inline: true }
            )
            .setColor(CONFIG.COLORS.INFO)
            .setTimestamp();

        const actions = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setCustomId('confirm_payment')
                .setLabel('Confirm Payment')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅')
                .setDisabled(isFreeEntry),
            new ButtonBuilder()
                .setCustomId('request_info')
                .setLabel('Request Info')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📋')
        );

        const guideEmbed = new EmbedBuilder()
            .setTitle('📋 Registration Steps')
            .setDescription(isFreeEntry ? 
                '**Free Entry Process:**\n1. Share your In-Game ID\n2. Wait for confirmation\n3. Get lobby details before match' :
                '**Paid Entry Process:**\n1. Share your In-Game ID\n2. Make payment ₹' + tournament.entryFee + '\n3. Share payment proof\n4. Get confirmation\n5. Receive lobby details'
            )
            .setColor(CONFIG.COLORS.INFO);

        await channel.send({ 
            content: `${user} <@&${CONFIG.ROLES.STAFF}>`,
            embeds: [embed, guideEmbed], 
            components: [actions] 
        });

        const idRequest = new EmbedBuilder()
            .setTitle('🎮 In-Game ID Required')
            .setDescription('Please share your **In-Game ID** in this ticket.\n\n' +
                (tournament.mode.toLowerCase().includes('squad') ? 
                 '**For Squad Tournaments:**\n• Share your In-Game ID\n• Share your Squad Name (if applicable)' :
                 '**For Solo Tournaments:**\n• Share your In-Game ID only'))
            .setColor(CONFIG.COLORS.WARNING);

        await channel.send({ embeds: [idRequest] });
    }

    static async closeTicket(channelId, closerId) {
        const ticketData = db.get('tickets', channelId);
        if (ticketData) {
            ticketData.status = 'CLOSED';
            ticketData.closedBy = closerId;
            ticketData.closedAt = Date.now();
            db.set('tickets', channelId, ticketData);

            setTimeout(async () => {
                try {
                    const channel = client.channels.cache.get(channelId);
                    if (channel) {
                        await channel.delete();
                        db.delete('tickets', channelId);
                    }
                } catch (error) {
                    console.error('Error deleting ticket channel:', error);
                }
            }, 600000);

            return true;
        }
        return false;
    }
}

// ==================== PAYMENT SYSTEM ====================
class PaymentManager {
    static generatePaymentQR(amount, reference) {
        const upiId = 'ototournaments@paytm';
        const upiLink = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=OTO Tournament Entry - ${reference}`;
        
        const qr_png = qr.imageSync(upiLink, { type: 'png' });
        return new AttachmentBuilder(qr_png, { name: `payment-qr-${reference}.png` });
    }

    static async sendPaymentRequest(channel, user, amount, tournament) {
        const reference = OTOUtils.generateOTP(8);
        const qrAttachment = this.generatePaymentQR(amount, reference);

        const embed = new EmbedBuilder()
            .setTitle('💰 Payment Request')
            .setDescription(`Please pay **${OTOUtils.formatIndianRupees(amount)}** to complete your registration for **${tournament.title}**`)
            .addFields(
                { name: 'Amount', value: OTOUtils.formatIndianRupees(amount), inline: true },
                { name: 'Reference ID', value: reference, inline: true },
                { name: 'UPI ID', value: '`ototournaments@paytm`', inline: true },
                { name: 'Payment Steps', value: '1. Scan QR code or use UPI ID\n2. Pay exact amount\n3. Take screenshot with UTR number\n4. Send screenshot here', inline: false }
            )
            .setColor(CONFIG.COLORS.INFO)
            .setTimestamp();

        await channel.send({ 
            content: `${user}`,
            embeds: [embed], 
            files: [qrAttachment] 
        });

        const paymentData = {
            userId: user.id,
            tournamentId: tournament.id,
            amount: amount,
            reference: reference,
            status: 'PENDING',
            createdAt: Date.now()
        };
        db.set('payments', reference, paymentData);

        return reference;
    }

    static confirmPayment(reference, confirmedBy) {
        const payment = db.get('payments', reference);
        if (payment && payment.status === 'PENDING') {
            payment.status = 'CONFIRMED';
            payment.confirmedBy = confirmedBy;
            payment.confirmedAt = Date.now();
            db.set('payments', reference, payment);

            TournamentManager.confirmPlayer(payment.tournamentId, payment.userId);

            return payment;
        }
        return null;
    }
}

// ==================== EVENT HANDLERS ====================
client.once('ready', async () => {
    console.log(`✅ OTO BOT#${client.user.tag} is online!`);
    console.log('🌐 Health check server running on port 10000');
    
    await initializeSystems();
    scheduleTasks();
    
    client.user.setPresence({
        activities: [{ name: 'OTO Tournaments | !help', type: 3 }],
        status: 'online'
    });
});

async function initializeSystems() {
    console.log('🔄 Initializing OTO Systems...');
    
    await ensureChannels();
    await sendTournamentGuide();
    await initializeInviteTracking();
    
    console.log('✅ OTO Systems initialized successfully!');
}

async function ensureChannels() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    for (const [name, channelId] of Object.entries(CONFIG.CHANNELS)) {
        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            console.warn(`⚠️ Channel ${name} (${channelId}) not found!`);
        }
    }
}

async function sendTournamentGuide() {
    const scheduleChannel = client.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    if (!scheduleChannel) return;

    const embed = new EmbedBuilder()
        .setTitle('🎮 OTO TOURNAMENT GUIDE')
        .setDescription('**Complete guide to join and win tournaments!**')
        .addFields(
            { 
                name: '1️⃣ Create Profile', 
                value: 'Check DMs from bot\nReply with your details\nGet your OTO ID', 
                inline: false 
            },
            { 
                name: '2️⃣ Invite Friends', 
                value: 'Invite 10 friends = FREE entry!\nType `!invites` to track\nEarn rewards at 5, 10, 15, 20+ invites', 
                inline: false 
            },
            { 
                name: '3️⃣ Join Tournament', 
                value: 'Check tournament schedule\nClick JOIN button\nComplete registration in ticket', 
                inline: false 
            },
            { 
                name: '4️⃣ Win Prizes', 
                value: 'Play fair, win big! 🏆\nGet paid instantly! 💰\nEarn badges and ranks!', 
                inline: false 
            }
        )
        .setColor(CONFIG.COLORS.INFO)
        .setFooter({ text: 'Need help? Create a ticket or ask in general chat!' });

    await scheduleChannel.send({ embeds: [embed] });
}

async function initializeInviteTracking() {
    const guild = client.guilds.cache.first();
    if (guild) {
        try {
            await guild.invites.fetch();
            console.log('✅ Invite tracking initialized');
        } catch (error) {
            console.error('Error initializing invite tracking:', error);
        }
    }
}

function scheduleTasks() {
    cron.schedule('* * * * *', async () => {
        await updateTournamentDisplays();
    });

    cron.schedule('*/5 * * * *', async () => {
        await updateLeaderboards();
    });

    cron.schedule('0 * * * *', async () => {
        await cleanupOldData();
    });

    cron.schedule('*/30 * * * *', async () => {
        await sendTournamentReminders();
    });

    console.log('✅ All scheduled tasks started successfully');
}

// ==================== MESSAGE HANDLING ====================
const messageCooldowns = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === ChannelType.DM) return;

    await handleSecurityChecks(message);
    
    if (message.channel.id === CONFIG.CHANNELS.GENERAL_CHAT) {
        await handleAutoResponse(message);
    }
    
    if (message.content.startsWith('!')) {
        await handleCommands(message);
    }
});

async function handleSecurityChecks(message) {
    if (SecuritySystem.containsBadWords(message.content)) {
        await message.delete();
        
        const warnings = SecuritySystem.addWarning(message.author.id, 'Inappropriate language');
        const warningMsg = await message.channel.send({
            content: `${message.author} ❌ Please maintain respectful language! Warning ${warnings}/3`
        });
        
        if (warnings >= 3) {
            try {
                const member = await message.guild.members.fetch(message.author.id);
                await member.timeout(10 * 60 * 1000, 'Repeated language violations');
                await message.channel.send({
                    content: `${message.author} has been timed out for 10 minutes due to repeated violations.`
                });
                SecuritySystem.clearWarnings(message.author.id);
            } catch (error) {
                console.error('Error timing out user:', error);
            }
        }
        
        setTimeout(() => warningMsg.delete(), 5000);
        return;
    }

    const spamLevel = SecuritySystem.detectSpam(message.author.id);
    if (spamLevel === 'HIGH') {
        await message.delete();
        const warning = await message.channel.send({
            content: `${message.author} ❌ Please don't spam!`
        });
        setTimeout(() => warning.delete(), 3000);
        return;
    }
}

async function handleAutoResponse(message) {
    const messages = await message.channel.messages.fetch({ limit: 10 });
    const recentUserMessages = messages.filter(msg => 
        !msg.author.bot && 
        msg.author.id !== message.author.id &&
        msg.createdTimestamp > Date.now() - 120000
    );

    if (recentUserMessages.size === 0) {
        const profile = ProfileManager.getProfile(message.author.id);
        let response;

        if (profile) {
            response = ResponseGenerator.getTournamentResponse(profile.gender);
        } else {
            response = ResponseGenerator.getTournamentResponse('male');
        }

        const delay = Math.random() * 3000 + 2000;
        
        setTimeout(async () => {
            try {
                await message.reply(response);
            } catch (error) {
                console.error('Error sending auto-response:', error);
            }
        }, delay);
    }
}

// ==================== COMMAND HANDLER ====================
async function handleCommands(message) {
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const cooldown = messageCooldowns.get(message.author.id);
    if (cooldown && Date.now() - cooldown < 2000) {
        return;
    }
    messageCooldowns.set(message.author.id, Date.now());

    try {
        switch (command) {
            case 'help':
                await showHelp(message);
                break;
            case 'profile':
                await handleProfileCommand(message);
                break;
            case 'tournament':
                await handleTournamentCommand(message, args);
                break;
            case 'invites':
                await showInviteStats(message);
                break;
            case 'leaderboard':
                await showLeaderboard(message, args);
                break;
            case 'stats':
                await showStats(message);
                break;
            default:
                await message.reply('Unknown command! Use `!help` for available commands.');
        }
    } catch (error) {
        console.error('Command error:', error);
        await message.reply('❌ An error occurred while processing your command.');
    }
}

async function showHelp(message) {
    const embed = new EmbedBuilder()
        .setTitle('🎮 OTO BOT COMMANDS')
        .setDescription('**Complete list of available commands:**')
        .addFields(
            { name: '🎯 Profile Commands', value: '`!profile` - Create/view profile\n`!stats` - View your statistics', inline: true },
            { name: '🏆 Tournament Commands', value: '`!tournament list` - View tournaments\n`!tournament create` - Create tournament (Staff)', inline: true },
            { name: '📊 Info Commands', value: '`!leaderboard` - View leaderboards\n`!invites` - Check invite stats', inline: true }
        )
        .setColor(CONFIG.COLORS.INFO)
        .setFooter({ text: 'Need help? Tag @Staff or create a ticket!' });

    await message.reply({ embeds: [embed] });
}

async function handleProfileCommand(message) {
    const profile = ProfileManager.getProfile(message.author.id);
    
    if (!profile) {
        await sendProfileCreationDM(message.author);
        await message.reply('📨 Check your DMs to create your profile!');
    } else {
        const profileText = await ProfileManager.generateProfileCard(message.author.id);
        
        const embed = new EmbedBuilder()
            .setTitle('👤 YOUR OTO PROFILE')
            .setDescription(`**${profile.name}** - ${profile.otoId}`)
            .addFields(
                { name: 'Level', value: profile.level.toString(), inline: true },
                { name: 'Game', value: profile.game, inline: true },
                { name: 'State', value: profile.state, inline: true },
                { name: 'Tournaments', value: profile.stats.tournamentsPlayed.toString(), inline: true },
                { name: 'Wins', value: profile.stats.tournamentsWon.toString(), inline: true },
                { name: 'Earnings', value: OTOUtils.formatIndianRupees(profile.stats.totalEarnings), inline: true },
                { name: 'Badges', value: profile.badges.map(b => CONFIG.BADGE_EMOJIS[b] || '🎖️').join(' ') || 'None', inline: false }
            )
            .setColor(CONFIG.COLORS.SUCCESS)
            .setTimestamp();

        const components = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('update_profile')
                .setLabel('Update Profile')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏️')
        );

        if (profileText) {
            embed.addFields({ name: 'Profile Card', value: '```' + profileText + '```', inline: false });
        }

        await message.reply({ embeds: [embed], components: [components] });
    }
}

async function sendProfileCreationDM(user) {
    try {
        const dmChannel = await user.createDM();
        
        const embed = new EmbedBuilder()
            .setTitle('🎮 OTO PROFILE SETUP')
            .setDescription('**Complete your profile to unlock tournament features!**\n\nPlease click the button below to start:')
            .addFields(
                { name: '📋 Required Information', value: '• Full Name\n• State\n• Preferred Game\n• Gender', inline: false },
                { name: '🎁 Benefits', value: '• Tournament Access\n• OTO ID Generation\n• Achievement Tracking\n• Personalized Experience', inline: false }
            )
            .setColor(CONFIG.COLORS.INFO)
            .setFooter({ text: 'Your information is secure and private' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_profile')
                .setLabel('Create Profile')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📝')
        );

        await dmChannel.send({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error('Error sending profile creation DM:', error);
    }
}

// ==================== INTERACTION HANDLING ====================
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    }
    
    if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
    }
});

async function handleButtonInteraction(interaction) {
    const { customId } = interaction;
    
    try {
        if (customId === 'create_profile') {
            await showProfileModal(interaction);
        }
        else if (customId.startsWith('join_')) {
            await handleTournamentJoin(interaction);
        }
        else if (customId === 'close_ticket') {
            await closeTicketInteraction(interaction);
        }
        else if (customId === 'confirm_payment') {
            await confirmPaymentInteraction(interaction);
        }
    } catch (error) {
        console.error('Button interaction error:', error);
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
}

async function showProfileModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('profile_modal')
        .setTitle('Complete Your OTO Profile');

    const nameInput = new TextInputBuilder()
        .setCustomId('profile_name')
        .setLabel('Full Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(50);

    const stateInput = new TextInputBuilder()
        .setCustomId('profile_state')
        .setLabel('State')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(30);

    const gameInput = new TextInputBuilder()
        .setCustomId('profile_game')
        .setLabel('Preferred Game')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('FreeFire, Minecraft, etc.')
        .setMaxLength(20);

    const genderInput = new TextInputBuilder()
        .setCustomId('profile_gender')
        .setLabel('Gender')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Male, Female, Other')
        .setMaxLength(10);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(stateInput),
        new ActionRowBuilder().addComponents(gameInput),
        new ActionRowBuilder().addComponents(genderInput)
    );

    await interaction.showModal(modal);
}

async function handleTournamentJoin(interaction) {
    const tournamentId = interaction.customId.replace('join_', '');
    const tournament = db.get('tournaments', tournamentId);
    
    if (!tournament) {
        await interaction.reply({ content: '❌ Tournament not found.', ephemeral: true });
        return;
    }

    const profile = ProfileManager.getProfile(interaction.user.id);
    if (!profile) {
        await interaction.reply({ 
            content: '❌ Please complete your profile first! Use `!profile`', 
            ephemeral: true 
        });
        return;
    }

    if (tournament.registeredPlayers.includes(interaction.user.id)) {
        await interaction.reply({ 
            content: '❌ You are already registered for this tournament.', 
            ephemeral: true 
        });
        return;
    }

    if (tournament.filledSlots >= tournament.totalSlots) {
        await interaction.reply({ 
            content: '❌ Tournament is full. Please try another one.', 
            ephemeral: true 
        });
        return;
    }

    try {
        const ticketChannel = await TicketManager.createTournamentTicket(
            interaction.user, 
            tournamentId, 
            false
        );

        TournamentManager.registerPlayer(tournamentId, interaction.user.id);

        await interaction.reply({ 
            content: `✅ Registration started! Check your ticket: ${ticketChannel}`, 
            ephemeral: true 
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({ 
            content: '❌ Error creating registration ticket. Please try again or contact staff.', 
            ephemeral: true 
        });
    }
}

async function handleModalSubmit(interaction) {
    if (interaction.customId === 'profile_modal') {
        await handleProfileSubmission(interaction);
    }
}

async function handleProfileSubmission(interaction) {
    const name = interaction.fields.getTextInputValue('profile_name');
    const state = interaction.fields.getTextInputValue('profile_state');
    const game = interaction.fields.getTextInputValue('profile_game');
    const gender = interaction.fields.getTextInputValue('profile_gender');

    const profileData = {
        name: OTOUtils.sanitizeInput(name),
        state: OTOUtils.sanitizeInput(state),
        game: OTOUtils.sanitizeInput(game),
        gender: OTOUtils.sanitizeInput(gender),
        creatorId: interaction.user.id
    };

    try {
        const profile = await ProfileManager.createProfile(interaction.user, profileData);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ PROFILE CREATED SUCCESSFULLY!')
            .setDescription(`Welcome to OTO Tournaments, **${profile.name}**!`)
            .addFields(
                { name: 'OTO ID', value: profile.otoId, inline: true },
                { name: 'Game', value: profile.game, inline: true },
                { name: 'State', value: profile.state, inline: true },
                { name: 'Level', value: profile.level.toString(), inline: true },
                { name: 'Next Steps', value: '• Check tournament schedule\n• Invite friends for rewards\n• Join your first tournament!', inline: false }
            )
            .setColor(CONFIG.COLORS.SUCCESS)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        const generalChannel = client.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
        if (generalChannel) {
            const welcomeMessage = ResponseGenerator.getWelcomeMessage(interaction.user, profile);
            await generalChannel.send(welcomeMessage);
        }

    } catch (error) {
        console.error('Error creating profile:', error);
        await interaction.reply({ 
            content: '❌ Error creating profile. Please try again or contact staff.', 
            ephemeral: true 
        });
    }
}

// ==================== SCHEDULED TASKS IMPLEMENTATION ====================
async function updateTournamentDisplays() {
    try {
        const scheduleChannel = client.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
        if (!scheduleChannel) return;

        const tournaments = db.getAll('tournaments');
        const activeTournaments = Object.values(tournaments).filter(t => 
            t.status === 'OPEN' && t.schedule > Date.now()
        );

        if (activeTournaments.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('📅 TOURNAMENT SCHEDULE')
                .setDescription('**No active tournaments at the moment.**\n\nCheck back soon or contact staff to create one!')
                .setColor(CONFIG.COLORS.WARNING)
                .setTimestamp();
            await scheduleChannel.send({ embeds: [embed] });
            return;
        }

        for (const tournament of activeTournaments.slice(0, 3)) {
            const embed = TournamentManager.getTournamentEmbed(tournament);
            const actions = TournamentManager.getTournamentActions(tournament.id);
            
            await scheduleChannel.send({ 
                embeds: [embed], 
                components: [actions] 
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error updating tournament displays:', error);
    }
}

async function updateLeaderboards() {
    try {
        const leaderboardChannel = client.channels.cache.get(CONFIG.CHANNELS.LEADERBOARD);
        
        if (leaderboardChannel) {
            await updateTournamentLeaderboard(leaderboardChannel);
        }
    } catch (error) {
        console.error('Error updating leaderboards:', error);
    }
}

async function updateTournamentLeaderboard(channel) {
    const profiles = db.getAll('profiles');
    const topPlayers = Object.entries(profiles)
        .map(([userId, profile]) => ({
            userId,
            ...profile
        }))
        .sort((a, b) => b.stats.totalEarnings - a.stats.totalEarnings)
        .slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle('🏆 TOURNAMENT LEADERBOARD')
        .setDescription('**Top Players by Earnings**')
        .setColor(CONFIG.COLORS.PREMIUM)
        .setTimestamp();

    if (topPlayers.length === 0) {
        embed.setDescription('No tournament data yet. Be the first to play!');
    } else {
        const leaderboardText = await Promise.all(
            topPlayers.map(async (player, index) => {
                try {
                    const user = await client.users.fetch(player.userId);
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    return `${medal} **${user.username}** - ${OTOUtils.formatIndianRupees(player.stats.totalEarnings)} (${player.stats.tournamentsWon} wins)`;
                } catch (error) {
                    return `${index + 1}. Unknown Player - ${OTOUtils.formatIndianRupees(player.stats.totalEarnings)}`;
                }
            })
        );
        
        embed.setDescription(leaderboardText.join('\n'));
    }

    await channel.send({ embeds: [embed] });
}

async function cleanupOldData() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    const tickets = db.getAll('tickets');
    Object.entries(tickets).forEach(([ticketId, ticket]) => {
        if (ticket.status === 'CLOSED' && now - ticket.createdAt > twentyFourHours) {
            db.delete('tickets', ticketId);
        }
    });
    
    const payments = db.getAll('payments');
    Object.entries(payments).forEach(([ref, payment]) => {
        if (now - payment.createdAt > 7 * twentyFourHours) {
            db.delete('payments', ref);
        }
    });
    
    console.log('🧹 Old data cleanup completed');
}

async function sendTournamentReminders() {
    const tournaments = db.getAll('tournaments');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const tournament of Object.values(tournaments)) {
        if (tournament.status === 'OPEN' && tournament.schedule - now <= oneHour && tournament.schedule > now) {
            for (const userId of tournament.registeredPlayers) {
                try {
                    const user = await client.users.fetch(userId);
                    const profile = ProfileManager.getProfile(userId);
                    
                    const embed = new EmbedBuilder()
                        .setTitle('⏰ TOURNAMENT REMINDER')
                        .setDescription(`**${tournament.title}** starts in 1 hour!`)
                        .addFields(
                            { name: 'Game', value: tournament.game, inline: true },
                            { name: 'Mode', value: tournament.mode, inline: true },
                            { name: 'Prize Pool', value: OTOUtils.formatIndianRupees(tournament.prizePool), inline: true }
                        )
                        .setColor(CONFIG.COLORS.WARNING)
                        .setFooter({ text: 'Get ready to play!' })
                        .setTimestamp();
                    
                    await user.send({ embeds: [embed] });
                } catch (error) {
                    console.error('Error sending reminder to user:', error);
                }
            }
        }
    }
}

// ==================== ADDITIONAL COMMAND HANDLERS ====================
async function handleTournamentCommand(message, args) {
    const subcommand = args[0]?.toLowerCase();
    
    if (!subcommand || subcommand === 'list') {
        await showTournamentList(message);
    } else {
        await message.reply('❌ Unknown tournament command. Use `!tournament list`');
    }
}

async function showTournamentList(message) {
    const tournaments = db.getAll('tournaments');
    const activeTournaments = Object.values(tournaments).filter(t => 
        t.status === 'OPEN' && t.schedule > Date.now()
    ).slice(0, 5);

    if (activeTournaments.length === 0) {
        await message.reply('🎯 No active tournaments at the moment. Check back soon!');
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('📅 ACTIVE TOURNAMENTS')
        .setDescription('Here are the currently active tournaments:')
        .setColor(CONFIG.COLORS.INFO)
        .setTimestamp();

    activeTournaments.forEach(tournament => {
        const timeRemaining = OTOUtils.getTimeRemaining(tournament.schedule);
        embed.addFields({
            name: `🏆 ${tournament.title}`,
            value: `**Game:** ${tournament.game} | **Mode:** ${tournament.mode}\n**Prize:** ${OTOUtils.formatIndianRupees(tournament.prizePool)} | **Slots:** ${tournament.filledSlots}/${tournament.totalSlots}\n**Starts:** ${timeRemaining}`,
            inline: false
        });
    });

    await message.reply({ embeds: [embed] });
}

async function showInviteStats(message) {
    const userStats = db.get('userStats', message.author.id) || { invites: 0 };
    
    const embed = new EmbedBuilder()
        .setTitle('📊 YOUR INVITE STATS')
        .setDescription(`You've invited **${userStats.invites}** friends to OTO Tournaments!`)
        .addFields(
            { name: 'Current Invites', value: userStats.invites.toString(), inline: true },
            { name: 'Free Entry Available', value: (userStats.invites >= 10 && !userStats.usedFreeEntry) ? '✅ YES' : '❌ NO', inline: true }
        )
        .setColor(CONFIG.COLORS.SUCCESS)
        .setFooter({ text: 'Keep inviting to earn more rewards!' });
    
    await message.reply({ embeds: [embed] });
}

async function showLeaderboard(message, args) {
    await showEarningsLeaderboard(message);
}

async function showEarningsLeaderboard(message) {
    const profiles = db.getAll('profiles');
    const topPlayers = Object.entries(profiles)
        .map(([userId, profile]) => ({
            userId,
            ...profile
        }))
        .sort((a, b) => b.stats.totalEarnings - a.stats.totalEarnings)
        .slice(0, 10);

    const embed = new EmbedBuilder()
        .setTitle('🏆 EARNINGS LEADERBOARD')
        .setDescription('**Top Players by Tournament Earnings**')
        .setColor(CONFIG.COLORS.PREMIUM)
        .setTimestamp();

    if (topPlayers.length === 0) {
        embed.setDescription('No players have earned from tournaments yet. Be the first!');
    } else {
        const leaderboardText = await Promise.all(
            topPlayers.map(async (player, index) => {
                try {
                    const user = await client.users.fetch(player.userId);
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**${index + 1}.**`;
                    const badges = player.badges.slice(0, 3).map(b => CONFIG.BADGE_EMOJIS[b]).join('');
                    return `${medal} ${user.username} ${badges}\n   💰 ${OTOUtils.formatIndianRupees(player.stats.totalEarnings)} | 🏆 ${player.stats.tournamentsWon} wins`;
                } catch (error) {
                    return `**${index + 1}.** Unknown Player\n   💰 ${OTOUtils.formatIndianRupees(player.stats.totalEarnings)} | 🏆 ${player.stats.tournamentsWon} wins`;
                }
            })
        );
        
        embed.setDescription(leaderboardText.join('\n'));
    }

    await message.reply({ embeds: [embed] });
}

async function showStats(message) {
    const profile = ProfileManager.getProfile(message.author.id);
    
    if (!profile) {
        await message.reply('❌ You need to create a profile first! Use `!profile`');
        return;
    }

    const winRate = profile.stats.tournamentsPlayed > 0 
        ? ((profile.stats.tournamentsWon / profile.stats.tournamentsPlayed) * 100).toFixed(1)
        : 0;

    const embed = new EmbedBuilder()
        .setTitle('📊 YOUR STATISTICS')
        .setDescription(`**${profile.name}** - ${profile.otoId}`)
        .addFields(
            { name: '🎯 Level', value: profile.level.toString(), inline: true },
            { name: '📈 Experience', value: profile.experience.toString(), inline: true },
            { name: '🏆 Tournaments', value: profile.stats.tournamentsPlayed.toString(), inline: true },
            { name: '🥇 Wins', value: profile.stats.tournamentsWon.toString(), inline: true },
            { name: '📊 Win Rate', value: `${winRate}%`, inline: true },
            { name: '🔥 Current Streak', value: profile.stats.winStreak.toString(), inline: true },
            { name: '💰 Total Earnings', value: OTOUtils.formatIndianRupees(profile.stats.totalEarnings), inline: true },
            { name: '🎯 Total Kills', value: profile.stats.killCount.toString(), inline: true },
            { name: '⭐ Badges', value: profile.badges.length.toString(), inline: true }
        )
        .setColor(CONFIG.COLORS.INFO)
        .setFooter({ text: 'Keep playing to improve your stats!' })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

// ==================== TICKET INTERACTION HANDLERS ====================
async function closeTicketInteraction(interaction) {
    const success = await TicketManager.closeTicket(interaction.channel.id, interaction.user.id);
    
    if (success) {
        await interaction.reply('🔒 Ticket closed! This channel will be deleted in 10 minutes.');
    } else {
        await interaction.reply({ content: '❌ Error closing ticket.', ephemeral: true });
    }
}

async function confirmPaymentInteraction(interaction) {
    if (!interaction.member.roles.cache.has(CONFIG.ROLES.STAFF)) {
        await interaction.reply({ content: '❌ Staff only!', ephemeral: true });
        return;
    }

    await interaction.reply('✅ Payment confirmed! Player slot has been booked.');
}

// ==================== GUILD MEMBER ADD HANDLER ====================
client.on('guildMemberAdd', async (member) => {
    console.log(`🆕 New member joined: ${member.user.tag}`);
    
    await sendProfileCreationDM(member.user);
    
    const generalChannel = client.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
    if (generalChannel) {
        const welcomeMessage = ResponseGenerator.getWelcomeMessage(member.user);
        await generalChannel.send(welcomeMessage);
    }
});

// ==================== ERROR HANDLING ====================
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

// ==================== BOT STARTUP ====================
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});

// Export for testing
module.exports = {
    client,
    db,
    CONFIG
};
