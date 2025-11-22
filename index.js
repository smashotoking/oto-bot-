const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelType, Partials, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// ===========================
// 🌐 HTTP SERVER FOR RENDER
// ===========================
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <html>
            <head><title>OTO Bot</title></head>
            <body style="background:#1a1a2e;color:#fff;font-family:Arial;text-align:center;padding:50px;">
                <h1>🏆 OTO Tournament Bot</h1>
                <p>✅ Bot is running!</p>
                <p>Status: Online</p>
            </body>
        </html>
    `);
});
server.listen(process.env.PORT || 3000, () => {
    console.log(`🌐 HTTP Server running on port ${process.env.PORT || 3000}`);
});

// ===========================
// 🎯 BOT INITIALIZATION
// ===========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

// ===========================
// 📊 CONFIGURATION
// ===========================
const CONFIG = {
    CHANNELS: {
        GENERAL_CHAT: '1438482904018849835',
        TOURNAMENT_SCHEDULE: '1438482561679626303',
        HOW_TO_JOIN: '1438482512296022017',
        RULES_CHANNEL: '1438482342145687643',
        BOT_COMMANDS: '1438483009950191676',
        ANNOUNCEMENT: '1438484746165555243',
        OPEN_TICKET: '1438485759891079180',
        TICKET_LOG: '1438485821572518030',
        MATCH_REPORTS: '1438486113047150714',
        PAYMENT_PROOF: '1438486113047150714',
        PLAYER_FORM: '1438486008453660863',
        LEADERBOARD: '1438947356690223347',
        STAFF_TOOLS: '1438486059255336970',
        STAFF_CHAT: '1438486059255336970',
        PROFILE_SECTION: '1439542574066176020',
        INVITE_TRACKER: '1439216884774998107',
        MINECRAFT_CHANNEL: '1439223955960627421',
        MOST_PLAYER_LB: '1439226024863993988',
        CELEBRATION: '1441653083120603187',
        WELCOME_CHANNEL: '1438482904018849835',
        OWNER_TOOLS: '1438486059255336970'
    },
    ROLES: {
        OWNER: '1438443937588183110',
        ADMIN: '1438475461977047112',
        STAFF: '1438475461977047112',
        PLAYER: 'player_role_id',
        VERIFIED: 'verified_role_id'
    },
    OWNER_ID: '1369227604053463052',
    GAMES: [
        { label: '🔥 Free Fire', value: 'freefire', emoji: '🔥' },
        { label: '⛏️ Minecraft', value: 'minecraft', emoji: '⛏️' },
        { label: '🎮 BGMI', value: 'bgmi', emoji: '🎮' },
        { label: '🎯 COD Mobile', value: 'codm', emoji: '🎯' },
        { label: '⚽ FC Mobile', value: 'fcmobile', emoji: '⚽' },
        { label: '🏏 Cricket', value: 'cricket', emoji: '🏏' },
        { label: '🎲 Ludo', value: 'ludo', emoji: '🎲' },
        { label: '🃏 Teen Patti', value: 'teenpatti', emoji: '🃏' },
        { label: '🎮 Other Games', value: 'other', emoji: '🎮' }
    ],
    INDIAN_STATES: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
    ],
    TOURNAMENT_MODES: [
        { label: 'Solo', value: 'solo' },
        { label: 'Duo', value: 'duo' },
        { label: 'Squad', value: 'squad' },
        { label: 'Custom', value: 'custom' }
    ],
    MAPS: {
        freefire: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine'],
        bgmi: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'],
        minecraft: ['Survival', 'Bedwars', 'Skywars', 'PvP Arena'],
        codm: ['Crash', 'Crossfire', 'Firing Range', 'Nuketown']
    },
    BAD_WORDS: ['mc', 'bc', 'dm', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'madarchod', 'bhenchod', 'chutiya', 'fuck', 'shit', 'bitch']
};

// ===========================
// 💾 DATA STORAGE
// ===========================
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DB = {
    profiles: loadJSON('profiles.json'),
    tournaments: loadJSON('tournaments.json'),
    invites: loadJSON('invites.json'),
    warnings: loadJSON('warnings.json'),
    tickets: loadJSON('tickets.json'),
    leaderboard: loadJSON('leaderboard.json'),
    settings: loadJSON('settings.json'),
    stats: loadJSON('stats.json'),
    tempProfiles: {}
};

function loadJSON(filename) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        if (fs.existsSync(filepath)) {
            return JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
    } catch (err) {
        console.error(`Error loading ${filename}:`, err.message);
    }
    return {};
}

function saveJSON(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error saving ${filename}:`, err.message);
    }
}

function saveAllData() {
    saveJSON('profiles.json', DB.profiles);
    saveJSON('tournaments.json', DB.tournaments);
    saveJSON('invites.json', DB.invites);
    saveJSON('warnings.json', DB.warnings);
    saveJSON('tickets.json', DB.tickets);
    saveJSON('leaderboard.json', DB.leaderboard);
    saveJSON('settings.json', DB.settings);
    saveJSON('stats.json', DB.stats);
}

setInterval(saveAllData, 5 * 60 * 1000);

// ===========================
// 🎮 UTILITY FUNCTIONS
// ===========================
function generateOTOID() {
    return 'OTO' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function hasProfile(userId) {
    return DB.profiles[userId] !== undefined;
}

function isStaff(member) {
    if (!member) return false;
    return member.roles?.cache?.has(CONFIG.ROLES.STAFF) || 
           member.roles?.cache?.has(CONFIG.ROLES.ADMIN) || 
           member.id === CONFIG.OWNER_ID;
}

function isOwner(userId) {
    return userId === CONFIG.OWNER_ID;
}

function containsBadWord(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return CONFIG.BAD_WORDS.some(word => lower.includes(word));
}

function createEmbed(title, description, color = '#00FF00') {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: 'OTO Tournaments 🏆' });
}

// ===========================
// 🎨 BEAUTIFUL PROFILE CARD
// ===========================
function createProfileEmbed(profile, user) {
    const lb = DB.leaderboard[user.id] || { tournamentsWon: 0, tournamentsPlayed: 0, totalEarnings: 0, invites: 0 };
    const genderEmoji = profile.gender === 'male' ? '👨' : '👩';
    const gameEmoji = CONFIG.GAMES.find(g => g.value === profile.game)?.emoji || '🎮';
    
    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: `${profile.name}'s Profile`, 
            iconURL: user.displayAvatarURL({ dynamic: true }) 
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setColor('#9b59b6')
        .addFields(
            { name: '🆔 OTO ID', value: `\`${profile.otoId}\``, inline: true },
            { name: `${genderEmoji} Gender`, value: profile.gender === 'male' ? 'Male' : 'Female', inline: true },
            { name: '📍 State', value: profile.state, inline: true },
            { name: `${gameEmoji} Favorite Game`, value: profile.game.toUpperCase(), inline: true },
            { name: '📅 Joined', value: `<t:${Math.floor(profile.createdAt / 1000)}:R>`, inline: true },
            { name: '🎮 Level', value: '1', inline: true },
            { name: '\u200B', value: '**📊 Statistics**', inline: false },
            { name: '🏆 Wins', value: `${lb.tournamentsWon}`, inline: true },
            { name: '🎮 Played', value: `${lb.tournamentsPlayed}`, inline: true },
            { name: '💰 Earned', value: `₹${lb.totalEarnings}`, inline: true }
        )
        .setImage('https://i.imgur.com/AfFp7pu.png')
        .setFooter({ text: 'OTO Tournaments 🏆 | Profile Card' })
        .setTimestamp();
    
    return embed;
}

// ===========================
// 🎉 WELCOME EMBED
// ===========================
function createWelcomeEmbed(member) {
    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🎉 Welcome to OTO Family! 🎉')
        .setDescription(
            `## ${member.user.username}\n\n` +
            `**Welcome to OTO Tournaments!** 🏆\n\n` +
            `🎮 **Complete your profile** to unlock the server!\n` +
            `📩 Check your DMs for profile setup\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `👥 You are member **#${member.guild.memberCount}**\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage('https://i.imgur.com/YOUR_WELCOME_BANNER.png')
        .setFooter({ text: `Joined OTO Family`, iconURL: member.guild.iconURL() })
        .setTimestamp();
    
    return embed;
}

// ===========================
// 👑 OWNER PANEL
// ===========================
async function sendOwnerPanel(channel) {
    const embed = new EmbedBuilder()
        .setTitle('👑 Owner Control Panel')
        .setDescription(
            '**Welcome to the Owner Dashboard!**\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            '**🛠️ Quick Actions:**'
        )
        .setColor('#FFD700')
        .addFields(
            { name: '📊 Server Stats', value: 'View server statistics', inline: true },
            { name: '👥 Manage Staff', value: 'Add/Remove staff', inline: true },
            { name: '🏆 Tournaments', value: 'Manage tournaments', inline: true },
            { name: '💾 Backup', value: 'Backup all data', inline: true },
            { name: '🔧 Settings', value: 'Bot settings', inline: true },
            { name: '📢 Broadcast', value: 'Send announcements', inline: true }
        )
        .setFooter({ text: 'OTO Tournaments | Owner Panel' })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('owner_stats').setLabel('📊 Stats').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('owner_staff').setLabel('👥 Staff').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('owner_tournaments').setLabel('🏆 Tournaments').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('owner_backup').setLabel('💾 Backup').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('owner_broadcast').setLabel('📢 Broadcast').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('owner_clear').setLabel('🗑️ Clear Chat').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('owner_settings').setLabel('⚙️ Settings').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row1, row2] });
}

// ===========================
// 🏆 TOURNAMENT EMBED
// ===========================
function createTournamentEmbed(tournament) {
    const gameEmoji = CONFIG.GAMES.find(g => g.value === tournament.game)?.emoji || '🎮';
    
    const embed = new EmbedBuilder()
        .setTitle(`${gameEmoji} ${tournament.title}`)
        .setDescription(
            `**Registration is now OPEN!**\n\n` +
            `${tournament.description || ''}`
        )
        .setColor('#FFD700')
        .addFields(
            { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
            { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
            { name: '📊 Slots', value: `${tournament.currentSlots || 0}/${tournament.maxSlots}`, inline: true },
            { name: '⏰ Time', value: tournament.time || 'TBA', inline: true },
            { name: '🗺️ Map', value: tournament.map || 'TBA', inline: true },
            { name: '🎯 Mode', value: tournament.mode || 'Solo', inline: true }
        )
        .setFooter({ text: 'OTO Tournaments 🏆 | Click JOIN to register!' })
        .setTimestamp();

    if (tournament.prizeDistribution) {
        embed.addFields({
            name: '🏆 Prize Distribution',
            value: tournament.prizeDistribution,
            inline: false
        });
    }

    return embed;
}

// ===========================
// 🤖 BOT READY EVENT
// ===========================
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    client.user.setActivity('OTO Tournaments 🏆', { type: 'WATCHING' });
    
    const guild = client.guilds.cache.first();
    if (guild) {
        // Send Owner Panel
        const ownerChannel = guild.channels.cache.get(CONFIG.CHANNELS.OWNER_TOOLS);
        if (ownerChannel && isOwner(CONFIG.OWNER_ID)) {
            await sendOwnerPanel(ownerChannel).catch(console.error);
        }

        // Send Announcement
        const announcementChannel = guild.channels.cache.get(CONFIG.CHANNELS.ANNOUNCEMENT);
        if (announcementChannel) {
            const embed = createEmbed(
                '🤖 OTO Bot Online!',
                '**Bot is now fully operational!** 🚀\n\n' +
                `📋 Complete your profile to unlock all channels!\n` +
                `🎮 Join tournaments in <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>\n\n` +
                `**Didn't get DM?** Click button below! 👇`,
                '#2ecc71'
            );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('resend_profile_dm')
                    .setLabel('📩 Resend Profile DM')
                    .setStyle(ButtonStyle.Primary)
            );

            await announcementChannel.send({ embeds: [embed], components: [row] }).catch(console.error);
        }

        // Lock users without profiles
        const members = await guild.members.fetch();
        let lockedCount = 0;
        
        for (const [id, member] of members) {
            if (member.user.bot) continue;
            if (!hasProfile(id)) {
                await createProfilePrompt(member.user);
                lockedCount++;
            }
        }
        
        console.log(`🔒 Locked ${lockedCount} users without profiles`);
    }
});

// ===========================
// 📩 PROFILE PROMPT
// ===========================
async function createProfilePrompt(user) {
    const embed = createEmbed(
        '📋 Complete Your Profile',
        'Welcome to **OTO Tournaments!** 🎮\n\n' +
        'To unlock all channels and participate in tournaments, please complete your profile.\n\n' +
        '**Click the button below to get started!**',
        '#FF6B6B'
    );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start_profile')
            .setLabel('📝 Create Profile')
            .setStyle(ButtonStyle.Primary)
    );

    try {
        await user.send({ embeds: [embed], components: [row] });
        return true;
    } catch (error) {
        console.error('Could not send DM:', error.message);
        return false;
    }
}

// ===========================
// 👥 MEMBER JOIN EVENT
// ===========================
client.on('guildMemberAdd', async (member) => {
    // Send Welcome Message
    const welcomeChannel = member.guild.channels.cache.get(CONFIG.CHANNELS.WELCOME_CHANNEL);
    if (welcomeChannel) {
        const welcomeEmbed = createWelcomeEmbed(member);
        await welcomeChannel.send({ 
            content: `${member}`,
            embeds: [welcomeEmbed] 
        }).catch(console.error);
    }

    // Send Profile Prompt
    if (!hasProfile(member.id)) {
        await createProfilePrompt(member.user);
    }

    // Log to invite tracker
    const inviteTracker = member.guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
    if (inviteTracker) {
        const embed = createEmbed(
            '📨 New Member',
            `**User:** ${member.user.tag}\n` +
            `**ID:** ${member.id}\n` +
            `**Account Age:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
            `**Member #${member.guild.memberCount}**`,
            '#3498db'
        );
        await inviteTracker.send({ embeds: [embed] }).catch(console.error);
    }
});

// ===========================
// 💬 MESSAGE HANDLER
// ===========================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const guild = message.guild;
    const member = message.member;
    const content = message.content.toLowerCase();

    // Guild-only commands
    if (guild) {
        // Check profile
        if (!hasProfile(message.author.id) && !isStaff(member) && !isOwner(message.author.id)) {
            try {
                await message.delete();
                const dm = await message.author.send('⚠️ Complete your profile first! Check your DMs.');
                setTimeout(() => dm.delete().catch(() => {}), 5000);
            } catch (err) {}
            return;
        }

        // Bad words filter
        if (!isStaff(member) && !isOwner(message.author.id) && containsBadWord(content)) {
            await message.delete().catch(() => {});
            const warning = await message.channel.send(`⚠️ ${message.author}, watch your language!`);
            setTimeout(() => warning.delete().catch(() => {}), 3000);
            return;
        }

        // Staff Commands (-prefix)
        if (isStaff(member) && message.content.startsWith('-')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const cmd = args[0]?.toLowerCase();

            // -clear [amount]
            if (cmd === 'clear') {
                const amount = parseInt(args[1]) || 100;
                try {
                    const deleted = await message.channel.bulkDelete(Math.min(amount, 100), true);
                    const reply = await message.channel.send(`✅ Deleted ${deleted.size} messages!`);
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                } catch (err) {
                    message.reply('❌ Could not delete messages!');
                }
                return;
            }

            // -ct (Create Tournament with dropdown)
            if (cmd === 'ct' || cmd === 'create-tournament') {
                const embed = createEmbed(
                    '🏆 Create Tournament',
                    'Select the game for your tournament:',
                    '#FFD700'
                );

                const gameSelect = new StringSelectMenuBuilder()
                    .setCustomId('tournament_game_select')
                    .setPlaceholder('🎮 Select Game')
                    .addOptions(CONFIG.GAMES.map(g => ({
                        label: g.label,
                        value: g.value,
                        emoji: g.emoji
                    })));

                const row = new ActionRowBuilder().addComponents(gameSelect);
                await message.reply({ embeds: [embed], components: [row] });
                return;
            }

            // -custom (Custom tournament from text)
            if (cmd === 'custom') {
                const embed = createEmbed(
                    '📝 Custom Tournament',
                    'Paste your tournament details in the following format:\n\n' +
                    '```\n' +
                    'Title: Free Fire Solo Tournament\n' +
                    'Game: freefire\n' +
                    'Mode: Solo\n' +
                    'Map: Bermuda\n' +
                    'Slots: 12\n' +
                    'Entry: 50\n' +
                    'Prize: 500\n' +
                    'Time: 8:00 PM\n' +
                    'Distribution: 🥇 1st: ₹250, 🥈 2nd: ₹150, 🥉 3rd: ₹100\n' +
                    '```',
                    '#f39c12'
                );
                await message.reply({ embeds: [embed] });
                return;
            }

            // -list
            if (cmd === 'list' || cmd === 'tournaments') {
                const tournaments = Object.entries(DB.tournaments);
                if (tournaments.length === 0) {
                    await message.reply('No active tournaments!');
                    return;
                }

                const embed = createEmbed(
                    '📋 Active Tournaments',
                    tournaments.map(([id, t]) => 
                        `**${t.title}**\nID: \`${id}\` | Slots: ${t.currentSlots || 0}/${t.maxSlots} | Prize: ₹${t.prizePool}`
                    ).join('\n\n'),
                    '#3498db'
                );
                await message.reply({ embeds: [embed] });
                return;
            }

            // -delete [id]
            if (cmd === 'delete') {
                const id = args[1];
                if (!id || !DB.tournaments[id]) {
                    await message.reply('❌ Tournament not found! Use `-list` to see IDs.');
                    return;
                }
                delete DB.tournaments[id];
                saveJSON('tournaments.json', DB.tournaments);
                await message.reply('✅ Tournament deleted!');
                return;
            }
        }

        // Owner Commands (!prefix)
        if (isOwner(message.author.id) && message.content.startsWith('!')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const cmd = args[0]?.toLowerCase();

            // !panel
            if (cmd === 'panel') {
                await sendOwnerPanel(message.channel);
                await message.delete().catch(() => {});
                return;
            }

            // !add-staff @user
            if (cmd === 'add-staff') {
                const user = message.mentions.users.first();
                if (!user) {
                    await message.reply('❌ Mention a user!');
                    return;
                }
                try {
                    const targetMember = await guild.members.fetch(user.id);
                    await targetMember.roles.add(CONFIG.ROLES.STAFF);
                    await message.reply(`✅ ${user} is now a staff member!`);
                } catch (err) {
                    await message.reply('❌ Failed to add staff!');
                }
                return;
            }

            // !remove-staff @user
            if (cmd === 'remove-staff') {
                const user = message.mentions.users.first();
                if (!user) {
                    await message.reply('❌ Mention a user!');
                    return;
                }
                try {
                    const targetMember = await guild.members.fetch(user.id);
                    await targetMember.roles.remove(CONFIG.ROLES.STAFF);
                    await message.reply(`✅ ${user} is no longer staff!`);
                } catch (err) {
                    await message.reply('❌ Failed to remove staff!');
                }
                return;
            }

            // !backup
            if (cmd === 'backup') {
                saveAllData();
                await message.reply('✅ All data backed up!');
                return;
            }
        }

        // User Commands (/prefix)
        if (message.content.startsWith('/')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const cmd = args[0]?.toLowerCase();

            // /profile
            if (cmd === 'profile') {
                const profile = DB.profiles[message.author.id];
                if (!profile) {
                    await message.reply('❌ You don\'t have a profile! Check your DMs.');
                    return;
                }
                const embed = createProfileEmbed(profile, message.author);
                await message.reply({ embeds: [embed] });
                return;
            }

            // /help
            if (cmd === 'help') {
                const embed = createEmbed(
                    '❓ OTO Bot Commands',
                    '**User Commands:**\n' +
                    '`/profile` - View your profile\n' +
                    '`/help` - Show this message\n\n' +
                    '**Staff Commands:**\n' +
                    '`-ct` - Create tournament\n' +
                    '`-custom` - Custom tournament\n' +
                    '`-list` - List tournaments\n' +
                    '`-clear [amount]` - Clear messages\n' +
                    '`-delete [id]` - Delete tournament\n\n' +
                    '**Owner Commands:**\n' +
                    '`!panel` - Owner panel\n' +
                    '`!add-staff @user` - Add staff\n' +
                    '`!remove-staff @user` - Remove staff\n' +
                    '`!backup` - Backup data',
                    '#3498db'
                );
                await message.reply({ embeds: [embed] });
                return;
            }
        }

        // Custom Tournament Parser
        if (isStaff(member) && content.includes('title:') && content.includes('prize:')) {
            try {
                const lines = message.content.split('\n');
                const data = {};
                lines.forEach(line => {
                    const [key, ...valueParts] = line.split(':');
                    if (key && valueParts.length) {
                        data[key.trim().toLowerCase()] = valueParts.join(':').trim();
                    }
                });

                if (data.title && data.prize) {
                    const tournamentId = `tournament-${Date.now()}`;
                    const tournament = {
                        id: tournamentId,
                        title: data.title,
                        game: data.game || 'freefire',
                        mode: data.mode || 'Solo',
                        map: data.map || 'Bermuda',
                        maxSlots: parseInt(data.slots) || 12,
                        currentSlots: 0,
                        entryFee: parseInt(data.entry) || 0,
                        prizePool: parseInt(data.prize) || 0,
                        time: data.time || '8:00 PM',
                        prizeDistribution: data.distribution || '🥇 1st: Winner Takes All',
                        status: 'open',
                        participants: [],
                        createdAt: Date.now(),
                        createdBy: message.author.id
                    };

                    DB.tournaments[tournamentId] = tournament;
                    saveJSON('tournaments.json', DB.tournaments);

                    const embed = createTournamentEmbed(tournament);
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`join_tournament_${tournamentId}`)
                            .setLabel(`🎮 JOIN NOW (0/${tournament.maxSlots})`)
                            .setStyle(ButtonStyle.Success)
                    );

                    const tournamentChannel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
                    if (tournamentChannel) {
                        const msg = await tournamentChannel.send({ embeds: [embed], components: [row] });
                        tournament.messageId = msg.id;
                        DB.tournaments[tournamentId] = tournament;
                        saveJSON('tournaments.json', DB.tournaments);
                    }

                    await message.reply('✅ Tournament created successfully!');
                    await message.delete().catch(() => {});
                }
            } catch (err) {
                console.error('Error parsing custom tournament:', err.message);
            }
            return;
        }
    }
});

// ===========================
// 🔘 INTERACTION HANDLER
// ===========================
client.on('interactionCreate', async (interaction) => {
    try {
        // ===== BUTTON INTERACTIONS =====
        if (interaction.isButton()) {
            const customId = interaction.customId;

            // ----- START PROFILE -----
            if (customId === 'start_profile') {
                const modal = new ModalBuilder()
                    .setCustomId('profile_modal')
                    .setTitle('🎮 Create Your OTO Profile');

                const nameInput = new TextInputBuilder()
                    .setCustomId('profile_name')
                    .setLabel('Your Name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(50)
                    .setPlaceholder('Enter your real name');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nameInput)
                );

                await interaction.showModal(modal);
                return;
            }

            // ----- RESEND PROFILE DM -----
            if (customId === 'resend_profile_dm') {
                await interaction.deferReply({ flags: 64 });
                
                if (hasProfile(interaction.user.id)) {
                    await interaction.editReply({ content: '✅ You already have a profile!' });
                    return;
                }

                const sent = await createProfilePrompt(interaction.user);
                await interaction.editReply({ 
                    content: sent ? '✅ Check your DMs!' : '❌ Enable DMs from server members!' 
                });
                return;
            }

            // ----- GENDER SELECTION -----
            if (customId.startsWith('select_gender_')) {
                await interaction.deferUpdate();
                const gender = customId.replace('select_gender_', '');
                
                DB.tempProfiles[interaction.user.id] = DB.tempProfiles[interaction.user.id] || {};
                DB.tempProfiles[interaction.user.id].gender = gender;

                // Show Game Selection
                const gameSelect = new StringSelectMenuBuilder()
                    .setCustomId('profile_game_select')
                    .setPlaceholder('🎮 Select Your Favorite Game')
                    .addOptions(CONFIG.GAMES.map(g => ({
                        label: g.label,
                        value: g.value,
                        emoji: g.emoji
                    })));

                const row = new ActionRowBuilder().addComponents(gameSelect);
                const embed = createEmbed('🎮 Select Your Favorite Game', 'Choose from the dropdown below:', '#3498db');
                
                await interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }

            // ----- JOIN TOURNAMENT -----
            if (customId.startsWith('join_tournament_')) {
                await interaction.deferReply({ flags: 64 });
                
                const tournamentId = customId.replace('join_tournament_', '');
                const tournament = DB.tournaments[tournamentId];

                if (!tournament) {
                    await interaction.editReply({ content: '❌ Tournament not found!' });
                    return;
                }

                if (tournament.currentSlots >= tournament.maxSlots) {
                    await interaction.editReply({ content: '❌ Tournament is full!' });
                    return;
                }

                // Check existing ticket
                const existingTicket = Object.values(DB.tickets).find(
                    t => t.userId === interaction.user.id && t.tournamentId === tournamentId && t.status === 'open'
                );

                if (existingTicket) {
                    await interaction.editReply({ content: '⚠️ You already have a ticket for this tournament!' });
                    return;
                }

                // Create ticket channel
                const ticketChannel = await createTicketChannel(interaction.guild, interaction.user, tournament);
                
                if (ticketChannel) {
                    await interaction.editReply({ content: `✅ Ticket created! Check ${ticketChannel}` });
                } else {
                    await interaction.editReply({ content: '❌ Error creating ticket. Please try again!' });
                }
                return;
            }

            // ----- CLOSE TICKET -----
            if (customId === 'close_ticket') {
                await interaction.deferReply();
                
                const embed = createEmbed('🔒 Closing Ticket', 'This ticket will be deleted in 5 seconds...', '#e74c3c');
                await interaction.editReply({ embeds: [embed] });

                setTimeout(async () => {
                    // Find and delete ticket from DB
                    const ticketId = Object.keys(DB.tickets).find(id => DB.tickets[id].channelId === interaction.channel.id);
                    if (ticketId) {
                        delete DB.tickets[ticketId];
                        saveJSON('tickets.json', DB.tickets);
                    }
                    await interaction.channel.delete().catch(console.error);
                }, 5000);
                return;
            }

            // ----- CONFIRM PAYMENT -----
            if (customId.startsWith('confirm_payment_')) {
                if (!isStaff(interaction.member)) {
                    await interaction.reply({ content: '❌ Only staff can confirm payments!', flags: 64 });
                    return;
                }

                await interaction.deferUpdate();
                const ticketId = customId.replace('confirm_payment_', '');
                const ticket = DB.tickets[ticketId];

                if (!ticket) {
                    await interaction.followUp({ content: '❌ Ticket not found!', flags: 64 });
                    return;
                }

                const tournament = DB.tournaments[ticket.tournamentId];
                if (tournament) {
                    tournament.participants = tournament.participants || [];
                    tournament.participants.push(ticket.userId);
                    tournament.currentSlots = tournament.participants.length;
                    DB.tournaments[ticket.tournamentId] = tournament;
                    saveJSON('tournaments.json', DB.tournaments);

                    // Update tournament message
                    await updateTournamentMessage(interaction.guild, ticket.tournamentId);
                }

                ticket.status = 'confirmed';
                DB.tickets[ticketId] = ticket;
                saveJSON('tickets.json', DB.tickets);

                // Celebration
                const celebChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.CELEBRATION);
                if (celebChannel) {
                    const user = await client.users.fetch(ticket.userId);
                    const celebEmbed = createEmbed(
                        '🎉 PLAYER JOINED! 🎉',
                        `**${user.username}** joined **${tournament?.title}**!\n\n` +
                        `Slot: #${tournament?.currentSlots}/${tournament?.maxSlots}\n` +
                        `Prize Pool: ₹${tournament?.prizePool}`,
                        '#FFD700'
                    );
                    celebEmbed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
                    await celebChannel.send({ embeds: [celebEmbed] }).catch(console.error);
                }

                const embed = createEmbed(
                    '✅ Payment Confirmed!',
                    'Your registration is complete! 🎉\n\nRoom ID & Password will be shared before the match.',
                    '#2ecc71'
                );
                await interaction.editReply({ embeds: [embed], components: [] });

                setTimeout(async () => {
                    delete DB.tickets[ticketId];
                    saveJSON('tickets.json', DB.tickets);
                    await interaction.channel.delete().catch(() => {});
                }, 10000);
                return;
            }

            // ----- REJECT PAYMENT -----
            if (customId.startsWith('reject_payment_')) {
                if (!isStaff(interaction.member)) {
                    await interaction.reply({ content: '❌ Only staff can reject payments!', flags: 64 });
                    return;
                }

                await interaction.deferUpdate();
                const embed = createEmbed(
                    '❌ Payment Rejected',
                    'Your payment could not be verified. Please send a clear screenshot again.',
                    '#e74c3c'
                );
                await interaction.editReply({ embeds: [embed], components: [] });
                return;
            }

            // ----- OWNER PANEL BUTTONS -----
            if (customId === 'owner_stats') {
                if (!isOwner(interaction.user.id)) {
                    await interaction.reply({ content: '❌ Owner only!', flags: 64 });
                    return;
                }
                await interaction.deferReply({ flags: 64 });
                
                const guild = interaction.guild;
                const embed = createEmbed(
                    '📊 Server Statistics',
                    `**Members:** ${guild.memberCount}\n` +
                    `**Profiles:** ${Object.keys(DB.profiles).length}\n` +
                    `**Tournaments:** ${Object.keys(DB.tournaments).length}\n` +
                    `**Open Tickets:** ${Object.values(DB.tickets).filter(t => t.status === 'open').length}\n` +
                    `**Total Warnings:** ${Object.keys(DB.warnings).length}`,
                    '#3498db'
                );
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            if (customId === 'owner_backup') {
                if (!isOwner(interaction.user.id)) {
                    await interaction.reply({ content: '❌ Owner only!', flags: 64 });
                    return;
                }
                await interaction.deferReply({ flags: 64 });
                saveAllData();
                await interaction.editReply({ content: '✅ All data backed up!' });
                return;
            }

            if (customId === 'owner_clear') {
                if (!isOwner(interaction.user.id)) {
                    await interaction.reply({ content: '❌ Owner only!', flags: 64 });
                    return;
                }
                await interaction.deferReply({ flags: 64 });
                
                try {
                    const deleted = await interaction.channel.bulkDelete(100, true);
                    await interaction.editReply({ content: `✅ Deleted ${deleted.size} messages!` });
                } catch (err) {
                    await interaction.editReply({ content: '❌ Could not delete messages!' });
                }
                return;
            }
        }

        // ===== SELECT MENU INTERACTIONS =====
        if (interaction.isStringSelectMenu()) {
            const customId = interaction.customId;

            // ----- PROFILE GAME SELECT -----
            if (customId === 'profile_game_select') {
                await interaction.deferUpdate();
                const game = interaction.values[0];
                
                DB.tempProfiles[interaction.user.id] = DB.tempProfiles[interaction.user.id] || {};
                DB.tempProfiles[interaction.user.id].game = game;

                // Show State Selection
                const stateOptions = CONFIG.INDIAN_STATES.slice(0, 25).map(state => ({
                    label: state,
                    value: state
                }));

                const stateSelect = new StringSelectMenuBuilder()
                    .setCustomId('profile_state_select')
                    .setPlaceholder('📍 Select Your State')
                    .addOptions(stateOptions);

                const row = new ActionRowBuilder().addComponents(stateSelect);
                const embed = createEmbed('📍 Select Your State', 'Choose from the dropdown below:', '#3498db');
                
                await interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }

            // ----- PROFILE STATE SELECT -----
            if (customId === 'profile_state_select') {
                await interaction.deferUpdate();
                const state = interaction.values[0];
                
                const tempData = DB.tempProfiles[interaction.user.id] || {};
                tempData.state = state;

                // Save Profile
                const profile = {
                    name: tempData.name,
                    gender: tempData.gender,
                    game: tempData.game,
                    state: tempData.state,
                    otoId: generateOTOID(),
                    userId: interaction.user.id,
                    createdAt: Date.now()
                };

                DB.profiles[interaction.user.id] = profile;
                saveJSON('profiles.json', DB.profiles);

                // Send completion message
                const embed = createEmbed(
                    '✅ Profile Created!',
                    `**Name:** ${profile.name}\n` +
                    `**Gender:** ${profile.gender}\n` +
                    `**Game:** ${profile.game}\n` +
                    `**State:** ${profile.state}\n` +
                    `**OTO ID:** ${profile.otoId}\n\n` +
                    `🔓 Server unlocked! Enjoy OTO Tournaments!`,
                    '#2ecc71'
                );
                await interaction.editReply({ embeds: [embed], components: [] });

                // Post profile to profile channel
                const guild = client.guilds.cache.first();
                if (guild) {
                    const profileChannel = guild.channels.cache.get(CONFIG.CHANNELS.PROFILE_SECTION);
                    if (profileChannel) {
                        const profileEmbed = createProfileEmbed(profile, interaction.user);
                        await profileChannel.send({ embeds: [profileEmbed] }).catch(console.error);
                    }

                    // Announce in general
                    const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
                    if (generalChannel) {
                        const welcomeEmbed = createEmbed(
                            '🎉 New Player Joined!',
                            `Welcome **${profile.name}** to OTO Family! 🏆\n\n` +
                            `Check <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> for tournaments!`,
                            '#2ecc71'
                        );
                        await generalChannel.send({ content: `<@${interaction.user.id}>`, embeds: [welcomeEmbed] }).catch(console.error);
                    }
                }

                delete DB.tempProfiles[interaction.user.id];
                return;
            }

            // ----- TOURNAMENT GAME SELECT -----
            if (customId === 'tournament_game_select') {
                await interaction.deferUpdate();
                const game = interaction.values[0];
                
                DB.tempProfiles[`tournament_${interaction.user.id}`] = { game };

                // Show Mode Selection
                const modeSelect = new StringSelectMenuBuilder()
                    .setCustomId('tournament_mode_select')
                    .setPlaceholder('🎯 Select Mode')
                    .addOptions(CONFIG.TOURNAMENT_MODES.map(m => ({
                        label: m.label,
                        value: m.value
                    })));

                const row = new ActionRowBuilder().addComponents(modeSelect);
                const embed = createEmbed('🎯 Select Tournament Mode', 'Choose the mode:', '#FFD700');
                
                await interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }

            // ----- TOURNAMENT MODE SELECT -----
            if (customId === 'tournament_mode_select') {
                await interaction.deferUpdate();
                const mode = interaction.values[0];
                
                const tempKey = `tournament_${interaction.user.id}`;
                DB.tempProfiles[tempKey] = DB.tempProfiles[tempKey] || {};
                DB.tempProfiles[tempKey].mode = mode;

                // Show Map Selection
                const game = DB.tempProfiles[tempKey].game || 'freefire';
                const maps = CONFIG.MAPS[game] || ['Default'];
                
                const mapSelect = new StringSelectMenuBuilder()
                    .setCustomId('tournament_map_select')
                    .setPlaceholder('🗺️ Select Map')
                    .addOptions(maps.map(m => ({
                        label: m,
                        value: m.toLowerCase()
                    })));

                const row = new ActionRowBuilder().addComponents(mapSelect);
                const embed = createEmbed('🗺️ Select Map', 'Choose the map:', '#FFD700');
                
                await interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }

            // ----- TOURNAMENT MAP SELECT -----
            if (customId === 'tournament_map_select') {
                const map = interaction.values[0];
                const tempKey = `tournament_${interaction.user.id}`;
                DB.tempProfiles[tempKey] = DB.tempProfiles[tempKey] || {};
                DB.tempProfiles[tempKey].map = map;

                // Show Modal for remaining details
                const modal = new ModalBuilder()
                    .setCustomId('tournament_details_modal')
                    .setTitle('🏆 Tournament Details');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('tournament_title')
                            .setLabel('Tournament Title')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder('e.g., Friday Night Free Fire')
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('tournament_slots')
                            .setLabel('Max Slots')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder('e.g., 12')
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('tournament_entry')
                            .setLabel('Entry Fee (₹)')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder('e.g., 50 (0 for free)')
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('tournament_prize')
                            .setLabel('Prize Pool (₹)')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder('e.g., 500')
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('tournament_time')
                            .setLabel('Time')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder('e.g., 8:00 PM')
                    )
                );

                await interaction.showModal(modal);
                return;
            }
        }

        // ===== MODAL INTERACTIONS =====
        if (interaction.isModalSubmit()) {
            const customId = interaction.customId;

            // ----- PROFILE MODAL -----
            if (customId === 'profile_modal') {
                await interaction.deferReply({ flags: 64 });
                
                const name = interaction.fields.getTextInputValue('profile_name');

                DB.tempProfiles[interaction.user.id] = {
                    name,
                    createdAt: Date.now()
                };

                // Show Gender Selection
                const embed = createEmbed('👤 Select Your Gender', 'Click a button below:', '#3498db');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('select_gender_male')
                        .setLabel('👨 Male')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('select_gender_female')
                        .setLabel('👩 Female')
                        .setStyle(ButtonStyle.Primary)
                );

                await interaction.editReply({ embeds: [embed], components: [row] });
                return;
            }

            // ----- TOURNAMENT DETAILS MODAL -----
            if (customId === 'tournament_details_modal') {
                await interaction.deferReply({ flags: 64 });
                
                const tempKey = `tournament_${interaction.user.id}`;
                const tempData = DB.tempProfiles[tempKey] || {};

                const title = interaction.fields.getTextInputValue('tournament_title');
                const slots = parseInt(interaction.fields.getTextInputValue('tournament_slots')) || 12;
                const entry = parseInt(interaction.fields.getTextInputValue('tournament_entry')) || 0;
                const prize = parseInt(interaction.fields.getTextInputValue('tournament_prize')) || 0;
                const time = interaction.fields.getTextInputValue('tournament_time');

                const tournamentId = `tournament-${Date.now()}`;
                const tournament = {
                    id: tournamentId,
                    title,
                    game: tempData.game || 'freefire',
                    mode: tempData.mode || 'solo',
                    map: tempData.map || 'bermuda',
                    maxSlots: slots,
                    currentSlots: 0,
                    entryFee: entry,
                    prizePool: prize,
                    time,
                    prizeDistribution: `🥇 1st: ₹${Math.floor(prize * 0.5)}\n🥈 2nd: ₹${Math.floor(prize * 0.3)}\n🥉 3rd: ₹${Math.floor(prize * 0.2)}`,
                    status: 'open',
                    participants: [],
                    createdAt: Date.now(),
                    createdBy: interaction.user.id
                };

                DB.tournaments[tournamentId] = tournament;
                saveJSON('tournaments.json', DB.tournaments);

                // Post to tournament channel
                const guild = interaction.guild;
                const tournamentChannel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
                
                if (tournamentChannel) {
                    const embed = createTournamentEmbed(tournament);
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`join_tournament_${tournamentId}`)
                            .setLabel(`🎮 JOIN NOW (0/${slots})`)
                            .setStyle(ButtonStyle.Success)
                    );

                    const msg = await tournamentChannel.send({ embeds: [embed], components: [row] });
                    tournament.messageId = msg.id;
                    DB.tournaments[tournamentId] = tournament;
                    saveJSON('tournaments.json', DB.tournaments);
                }

                await interaction.editReply({ content: '✅ Tournament created successfully!' });
                delete DB.tempProfiles[tempKey];
                return;
            }
        }

    } catch (error) {
        console.error('Interaction error:', error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ An error occurred!', flags: 64 });
            }
        } catch (err) {}
    }
});

// ===========================
// 🎫 CREATE TICKET CHANNEL
// ===========================
async function createTicketChannel(guild, user, tournament) {
    try {
        const ticketId = `ticket-${Date.now()}`;
        
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`.substring(0, 100),
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                { id: CONFIG.ROLES.STAFF, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        DB.tickets[ticketId] = {
            channelId: channel.id,
            userId: user.id,
            tournamentId: tournament.id,
            status: 'open',
            createdAt: Date.now()
        };
        saveJSON('tickets.json', DB.tickets);

        const embed = createEmbed(
            '🎫 Tournament Registration',
            `Welcome ${user}!\n\n` +
            `**Tournament:** ${tournament.title}\n` +
            `**Entry Fee:** ₹${tournament.entryFee}\n` +
            `**Prize Pool:** ₹${tournament.prizePool}\n\n` +
            `📝 **Please provide:**\n` +
            `1️⃣ Your In-Game Name (IGN)\n` +
            `2️⃣ Payment Screenshot (if entry fee > 0)\n\n` +
            `⏳ Staff will verify and confirm your entry!`,
            '#3498db'
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('🔒 Close Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${user} | <@&${CONFIG.ROLES.STAFF}>`, embeds: [embed], components: [row] });

        if (tournament.entryFee > 0) {
            setTimeout(async () => {
                const paymentEmbed = createEmbed(
                    '💳 Payment Required',
                    `**Amount:** ₹${tournament.entryFee}\n\n` +
                    `📱 **UPI ID:** \`yourUPI@paytm\`\n\n` +
                    `📸 Upload clear payment screenshot with Transaction ID!`,
                    '#f39c12'
                );
                await channel.send({ embeds: [paymentEmbed] });
            }, 2000);
        }

        return channel;
    } catch (err) {
        console.error('Error creating ticket:', err.message);
        return null;
    }
}

// ===========================
// 🔄 UPDATE TOURNAMENT MESSAGE
// ===========================
async function updateTournamentMessage(guild, tournamentId) {
    const tournament = DB.tournaments[tournamentId];
    if (!tournament || !tournament.messageId) return;

    try {
        const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
        if (!channel) return;

        const message = await channel.messages.fetch(tournament.messageId);
        const embed = createTournamentEmbed(tournament);
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`join_tournament_${tournamentId}`)
                .setLabel(`🎮 JOIN NOW (${tournament.currentSlots}/${tournament.maxSlots})`)
                .setStyle(tournament.currentSlots >= tournament.maxSlots ? ButtonStyle.Secondary : ButtonStyle.Success)
                .setDisabled(tournament.currentSlots >= tournament.maxSlots)
        );

        await message.edit({ embeds: [embed], components: [row] });
    } catch (err) {
        console.error('Error updating tournament message:', err.message);
    }
}

// ===========================
// 📎 TICKET MESSAGE HANDLER
// ===========================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // Check if in ticket channel
    const ticketEntry = Object.entries(DB.tickets).find(([id, t]) => 
        t.channelId === message.channel.id && t.status === 'open'
    );

    if (ticketEntry && message.attachments.size > 0) {
        const [ticketId, ticket] = ticketEntry;
        
        if (message.author.id === ticket.userId) {
            const embed = createEmbed(
                '📸 Screenshot Received',
                'Staff will verify your payment shortly!',
                '#f39c12'
            );
            await message.react('✅').catch(() => {});

            const staffRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_payment_${ticketId}`)
                    .setLabel('✅ Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_payment_${ticketId}`)
                    .setLabel('❌ Reject')
                    .setStyle(ButtonStyle.Danger)
            );

            await message.channel.send({ 
                content: `<@&${CONFIG.ROLES.STAFF}> Payment received!`,
                embeds: [embed], 
                components: [staffRow] 
            });
        }
    }
});

// ===========================
// 🚀 ERROR HANDLERS & LOGIN
// ===========================
process.on('unhandledRejection', (error) => console.error('Unhandled rejection:', error));
process.on('uncaughtException', (error) => console.error('Uncaught exception:', error));

process.on('SIGINT', () => {
    console.log('Shutting down...');
    saveAllData();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    saveAllData();
    client.destroy();
    process.exit(0);
});

client.login(process.env.DISCORD_BOT_TOKEN);
