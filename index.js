const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
    ]
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
        MOST_PLAYER_LB: '1439226024863993988'
    },
    ROLES: {
        OWNER: '1438443937588183110',
        ADMIN: '1438475461977047112',
        STAFF: '1438475461977047112',
        PLAYER: 'player_role_id',
        VERIFIED: 'verified_role_id',
        NEW_MEMBER: 'new_member_role_id'
    },
    OWNER_ID: '1369227604053463052',
    INDIAN_STATES: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
        'Andaman and Nicobar', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep'
    ],
    BAD_WORDS: ['mc', 'bc', 'dm', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'madarchod', 'bhenchod', 'chutiya'],
    WELCOME_MESSAGES: [
        '🔥 Yo {user}! Welcome to OTO Tournaments! Ready to win big?',
        '💪 A new warrior {user} has arrived! Let\'s goooo!',
        '🎮 Welcome bro {user}! Your journey to ₹₹₹ starts now!',
        '⚡ New player {user} detected! Tournament kheloge?',
        '🏆 {user} apna bhai aa gaya! Machayenge ab! 🔥',
        '👑 Welcome {user}! OTO family mein swagat hai!',
        '🎯 {user} joined the battle! Tournament ready ho?',
        '💎 Ayo {user}! Let\'s make some money together! 💰',
        '🌟 {user} ne entry maari! Ab maza aayega!',
        '🚀 Welcome aboard {user}! Tournaments await you!'
    ]
};

// ===========================
// 💾 DATA STORAGE (JSON FILES)
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
    stats: loadJSON('stats.json')
};

function loadJSON(filename) {
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    return {};
}

function saveJSON(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function saveAllData() {
    Object.keys(DB).forEach(key => saveJSON(`${key}.json`, DB[key]));
}

// Auto-save every 5 minutes
setInterval(saveAllData, 5 * 60 * 1000);

// ===========================
// 🎮 UTILITY FUNCTIONS
// ===========================
function generateOTOID() {
    return 'OTO' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getRandomWelcome(username) {
    const msg = CONFIG.WELCOME_MESSAGES[Math.floor(Math.random() * CONFIG.WELCOME_MESSAGES.length)];
    return msg.replace('{user}', username);
}

function hasRole(member, roleId) {
    return member.roles.cache.has(roleId);
}

function isStaff(member) {
    return hasRole(member, CONFIG.ROLES.STAFF) || hasRole(member, CONFIG.ROLES.ADMIN) || member.id === CONFIG.OWNER_ID;
}

function isOwner(userId) {
    return userId === CONFIG.OWNER_ID;
}

function containsBadWord(text) {
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
// 👤 PROFILE MANAGEMENT
// ===========================
async function hasProfile(userId) {
    return DB.profiles[userId] !== undefined;
}

async function createProfilePrompt(user) {
    const embed = createEmbed(
        '📋 Complete Your Profile',
        'Welcome to OTO Tournaments! 🎮\n\n' +
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
        console.error('Could not send DM to user:', error);
        return false;
    }
}

async function lockChannelsForUser(member) {
    const guild = member.guild;
    const channels = guild.channels.cache;
    
    for (const [id, channel] of channels) {
        if (channel.type === ChannelType.GuildText && !channel.name.includes('rules')) {
            try {
                await channel.permissionOverwrites.create(member, {
                    ViewChannel: false,
                    SendMessages: false
                });
            } catch (err) {
                console.error(`Could not lock channel ${channel.name}:`, err);
            }
        }
    }
}

async function unlockChannelsForUser(member) {
    const guild = member.guild;
    const channels = guild.channels.cache;
    
    for (const [id, channel] of channels) {
        if (channel.type === ChannelType.GuildText) {
            try {
                await channel.permissionOverwrites.delete(member);
            } catch (err) {
                console.error(`Could not unlock channel ${channel.name}:`, err);
            }
        }
    }
}

// ===========================
// 🎟️ TICKET SYSTEM
// ===========================
async function createTicket(guild, user, type, tournamentData = null) {
    const ticketId = `ticket-${Date.now()}`;
    const categoryId = CONFIG.CHANNELS.OPEN_TICKET;
    
    const channel = await guild.channels.create({
        name: `${type}-${user.username}`,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagBits.SendMessages]
            },
            {
                id: CONFIG.ROLES.STAFF,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagBits.SendMessages]
            }
        ]
    });

    DB.tickets[ticketId] = {
        channelId: channel.id,
        userId: user.id,
        type: type,
        status: 'open',
        createdAt: Date.now(),
        tournament: tournamentData
    };
    saveJSON('tickets.json', DB.tickets);

    const embed = createEmbed(
        `🎫 ${type.toUpperCase()} Ticket`,
        `Welcome ${user}!\n\n` +
        (type === 'tournament' ? 
            `**Tournament:** ${tournamentData?.title || 'N/A'}\n` +
            `**Entry Fee:** ₹${tournamentData?.entryFee || 0}\n\n` +
            `Please provide the following:\n` +
            `1️⃣ Your In-Game Name (IGN)\n` +
            `${tournamentData?.mode?.includes('Squad') ? '2️⃣ Squad ID & Squad Name\n' : ''}` +
            `${tournamentData?.entryFee > 0 ? '3️⃣ Payment Screenshot (will be generated)\n' : ''}\n\n` +
            `Staff will review and confirm your entry! ✅` :
            `Staff will assist you shortly!\n\nPlease describe your issue.`
        ),
        '#3498db'
    );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });
    
    // Log ticket creation
    const logChannel = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_LOG);
    if (logChannel) {
        const logEmbed = createEmbed(
            '📌 New Ticket Created',
            `**User:** ${user.tag}\n` +
            `**Type:** ${type}\n` +
            `**Channel:** ${channel}\n` +
            `**Time:** <t:${Math.floor(Date.now() / 1000)}:R>`,
            '#2ecc71'
        );
        await logChannel.send({ embeds: [logEmbed] });
    }

    return channel;
}

// ===========================
// 🏆 TOURNAMENT MANAGEMENT
// ===========================
function createTournamentEmbed(tournament) {
    const embed = new EmbedBuilder()
        .setTitle(`${tournament.game} Tournament`)
        .setDescription(`${tournament.title}\n\n${tournament.description || ''}`)
        .addFields(
            { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
            { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
            { name: '📊 Slots', value: `${tournament.currentSlots}/${tournament.maxSlots}`, inline: true },
            { name: '⏰ Time', value: tournament.time, inline: true },
            { name: '🗺️ Map/Mode', value: tournament.map || tournament.mode, inline: true },
            { name: '🎯 Type', value: tournament.mode, inline: true }
        )
        .setColor('#FFD700')
        .setTimestamp();

    if (tournament.prizeDistribution) {
        embed.addFields({
            name: '🏆 Prize Distribution',
            value: tournament.prizeDistribution
        });
    }

    if (tournament.imageUrl) {
        embed.setImage(tournament.imageUrl);
    }

    return embed;
}

async function updateTournamentMessage(guild, tournamentId) {
    const tournament = DB.tournaments[tournamentId];
    if (!tournament) return;

    const channel = guild.channels.cache.get(CONFIG.CHANNELS.TOURNAMENT_SCHEDULE);
    if (!channel) return;

    try {
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
    } catch (error) {
        console.error('Error updating tournament message:', error);
    }
}

// ===========================
// 📊 LEADERBOARD SYSTEM
// ===========================
function updateLeaderboard(userId, type, value = 1) {
    if (!DB.leaderboard[userId]) {
        DB.leaderboard[userId] = {
            tournamentsPlayed: 0,
            tournamentsWon: 0,
            totalEarnings: 0,
            totalKills: 0,
            invites: 0
        };
    }

    switch (type) {
        case 'tournament_played':
            DB.leaderboard[userId].tournamentsPlayed += value;
            break;
        case 'tournament_won':
            DB.leaderboard[userId].tournamentsWon += value;
            break;
        case 'earnings':
            DB.leaderboard[userId].totalEarnings += value;
            break;
        case 'kills':
            DB.leaderboard[userId].totalKills += value;
            break;
        case 'invite':
            DB.leaderboard[userId].invites += value;
            break;
    }

    saveJSON('leaderboard.json', DB.leaderboard);
}

// ===========================
// ⚠️ MODERATION SYSTEM
// ===========================
function addWarning(userId, reason) {
    if (!DB.warnings[userId]) {
        DB.warnings[userId] = [];
    }
    DB.warnings[userId].push({
        reason,
        timestamp: Date.now()
    });
    saveJSON('warnings.json', DB.warnings);
    return DB.warnings[userId].length;
}

// ===========================
// 🤖 BOT EVENTS
// ===========================
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    client.user.setActivity('OTO Tournaments 🏆', { type: 'WATCHING' });
    
    // Initialize existing members
    const guild = client.guilds.cache.first();
    if (guild) {
        const members = await guild.members.fetch();
        let lockedCount = 0;
        
        for (const [id, member] of members) {
            if (member.user.bot) continue;
            
            if (!await hasProfile(id)) {
                await lockChannelsForUser(member);
                await createProfilePrompt(member.user);
                lockedCount++;
            }
        }
        
        console.log(`🔒 Locked ${lockedCount} users without profiles`);
    }
});

// ===========================
// 👥 MEMBER JOIN EVENT
// ===========================
client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    
    // Check if profile exists
    if (!await hasProfile(member.id)) {
        // Lock all channels
        await lockChannelsForUser(member);
        
        // Send profile creation prompt
        await createProfilePrompt(member.user);
        
        // Send welcome to general (they can see but not send)
        const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
        if (generalChannel) {
            const welcomeMessages = [
                '🔥 Apna bhai aa gaya! Machayenge ab! Welcome {user}! 💪',
                '⚡ {user} joined the squad! Let\'s goooo! 🎮',
                '👑 Welcome {user}! OTO family mein swagat hai bhai! 🏆',
                '💎 {user} entered the arena! Tournament ready ho jao! 🔥',
                '🎯 New warrior {user} has arrived! Prizes await you! 💰',
                '🚀 {user} ne entry maari! Ab games shuru honge! 🎮',
                '🌟 Welcome bro {user}! Hardwork dikhaana ab! 💪',
                '🔥 {user} is here! Tournament kheloge? Let\'s play! ⚡',
                '👊 {user} joined! Bhai logo ko harana hai! 🏆',
                '💪 {user} aa gaya! Ab competition tough hoga! 🔥'
            ];
            
            const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)].replace('{user}', `<@${member.id}>`);
            
            const embed = createEmbed(
                '🎉 New Member Joined!',
                `${randomWelcome}\n\n` +
                `📩 Check your DMs to complete your profile and unlock the server! 🔓\n` +
                `Complete karo aur tournaments mein participate karo! 🏆`,
                '#2ecc71'
            );
            await generalChannel.send({ embeds: [embed] });
        }
    }

    // Track invite
    const invites = await guild.invites.fetch();
    const inviteTracker = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
    
    // Update invite stats (simplified - you can enhance this)
    if (inviteTracker) {
        const embed = createEmbed(
            '📨 Member Joined',
            `**User:** ${member.user.tag}\n` +
            `**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n` +
            `**Member Count:** ${guild.memberCount}`,
            '#3498db'
        );
        await inviteTracker.send({ embeds: [embed] });
    }
});

// ===========================
// 👋 MEMBER LEAVE EVENT
// ===========================
client.on('guildMemberRemove', async (member) => {
    const guild = member.guild;
    const profile = DB.profiles[member.id];
    
    const generalChannel = guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
    if (generalChannel) {
        let goodbyeMessage;
        
        if (profile) {
            const gender = profile.gender?.toLowerCase();
            if (gender === 'female') {
                const femaleGoodbyes = [
                    `👋 Goodbye ${profile.name}! We'll miss you ji! Come back soon! 💫`,
                    `😢 ${profile.name} left! Wapas aana zaroor! 🌟`,
                    `💔 ${profile.name} ne server leave kar diya! Miss you! ✨`,
                    `👋 Bye ${profile.name}! Tournaments miss karogi! Come back! 🎮`
                ];
                goodbyeMessage = femaleGoodbyes[Math.floor(Math.random() * femaleGoodbyes.length)];
            } else {
                const maleGoodbyes = [
                    `👋 Bhai ${profile.name} chala gaya! We'll miss you bro! 😢`,
                    `💔 ${profile.name} left the squad! Wapas aana bhai! 🔥`,
                    `😢 Goodbye ${profile.name}! Tournaments mein tera naam yaad rahega! 🏆`,
                    `👋 ${profile.name} ne bye-bye bol diya! Miss you bro! Come back! 💪`,
                    `💔 Bhai ${profile.name} chod ke chala gaya! Server empty lag raha hai! 😭`
                ];
                goodbyeMessage = maleGoodbyes[Math.floor(Math.random() * maleGoodbyes.length)];
            }
        } else {
            goodbyeMessage = `👋 ${member.user.tag} left the server! Goodbye! 😢`;
        }
        
        const embed = createEmbed(
            '😢 Member Left',
            goodbyeMessage + `\n\n**Members:** ${guild.memberCount}`,
            '#e74c3c'
        );
        
        await generalChannel.send({ embeds: [embed] });
    }
    
    // Log to invite tracker
    const inviteTracker = guild.channels.cache.get(CONFIG.CHANNELS.INVITE_TRACKER);
    if (inviteTracker) {
        const embed = createEmbed(
            '📤 Member Left',
            `**User:** ${member.user.tag}\n` +
            `**Member Count:** ${guild.memberCount}`,
            '#e74c3c'
        );
        await inviteTracker.send({ embeds: [embed] });
    }
});

// ===========================
// 💬 MESSAGE HANDLER
// ===========================
let lastMessages = new Map();
let noReplyUsers = new Map();

// Auto-response templates based on gender
const AUTO_RESPONSES = {
    male: {
        greetings: [
            'Hi bro! What\'s up? 🔥 Tournament kheloge aaj?',
            'Yo bro! Kya haal hai? Tournament check karo! 🎮',
            'Hey bro! Machayenge aaj? Tournament ready hai! 💪',
            'Bhai! Kaisa hai tu? Aaj tournament join karna? ⚡',
            'Sup bro! Tournament mein entry lelo, slots filling fast! 🏆'
        ],
        general: [
            'Bhai tournament dekho, mast prizes hain! 🎁',
            'Bro custom challenge bhi kar sakte ho! 🔥',
            'Tournament schedule check karo bhai! 📆',
            'Slots limited hain bro, jaldi join karo! ⚡'
        ]
    },
    female: {
        greetings: [
            'Hello ji! Tournament khelogi aaj? 🎮',
            'Hi! Kaisi ho? Tournament check karo! 🌟',
            'Hello! Aaj kheloge? Mast tournaments hain! 💫',
            'Hey! Tournament join karogi? Prizes achhe hain! 🎁',
            'Hi ji! Aaj ka tournament ready hai! ✨'
        ],
        general: [
            'Tournament schedule dekho ji! 📆',
            'Prizes kaafi achhe hain! 💰',
            'Entry fee bhi reasonable hai! 🎫',
            'Tournament join karo, mazaa aayega! 🎮'
        ]
    }
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const guild = message.guild;
    const member = message.member;
    const content = message.content.toLowerCase();
    const now = Date.now();

    // Check if user has profile for server messages
    if (guild && !await hasProfile(message.author.id)) {
        try {
            await message.delete();
            const dm = await message.author.send('⚠️ Please complete your profile first to chat in the server! Check your DMs for the profile form.');
            setTimeout(() => dm.delete(), 5000);
        } catch (err) {
            console.error('Could not send DM:', err);
        }
        return;
    }message) => {
    if (message.author.bot) return;
    
    const guild = message.guild;
    const member = message.member;
    const content = message.content.toLowerCase();
    const now = Date.now();

    // Check if user has profile for server messages
    if (guild && !await hasProfile(message.author.id)) {
        try {
            await message.delete();
            const dm = await message.author.send('⚠️ Please complete your profile first to chat in the server! Check your DMs for the profile form.');
            setTimeout(() => dm.delete(), 5000);
        } catch (err) {
            console.error('Could not send DM:', err);
        }
        return;
    }


    // Handle ticket messages separately
    const ticketEntry = Object.entries(DB.tickets).find(([id, ticket]) => 
        ticket.channelId === message.channel?.id && ticket.status === 'open'
    );

    if (ticketEntry) {
        await handleTicketMessages(message, ticketEntry);
        return;
    }

    // ===========================
    // 🚫 MODERATION - Bad Words

    // ===========================
    // 🚫 MODERATION - Bad Words
    // ===========================
    if (containsBadWord(content)) {
        await message.delete();
        const warningCount = addWarning(message.author.id, 'Bad language');
        
        const embed = createEmbed(
            '⚠️ Warning',
            `${message.author}, please avoid using inappropriate language!\n\n` +
            `**Warning Count:** ${warningCount}/3\n` +
            (warningCount >= 3 ? '❗ Next violation will result in a timeout!' : ''),
            '#e74c3c'
        );
        
        const warning = await message.channel.send({ embeds: [embed] });
        setTimeout(() => warning.delete(), 5000);

        if (warningCount >= 3) {
            try {
                await member.timeout(5 * 60 * 1000, 'Multiple bad language violations');
                const timeoutEmbed = createEmbed(
                    '🔇 User Timed Out',
                    `${message.author} has been timed out for 5 minutes due to repeated violations.`,
                    '#e74c3c'
                );
                await message.channel.send({ embeds: [timeoutEmbed] });
            } catch (err) {
                console.error('Could not timeout user:', err);
            }
        }
        return;
    }

    // ===========================
    // 🚫 SPAM DETECTION
    // ===========================
    const userKey = message.author.id;
    const now = Date.now();
    
    if (!lastMessages.has(userKey)) {
        lastMessages.set(userKey, []);
    }
    
    const userMessages = lastMessages.get(userKey);
    userMessages.push(now);
    
    // Keep only messages from last 3 seconds
    const recentMessages = userMessages.filter(time => now - time < 3000);
    lastMessages.set(userKey, recentMessages);
    
    if (recentMessages.length >= 5) {
        await message.delete();
        try {
            await member.timeout(2 * 60 * 1000, 'Spam');
            const embed = createEmbed(
                '🚫 Spam Detected',
                `${message.author} has been timed out for 2 minutes for spamming.`,
                '#e74c3c'
            );
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error('Could not timeout spammer:', err);
        }
        return;
    }

    // ===========================
    // 💬 AUTO RESPONSES (GENERAL CHAT)
    // ===========================
    if (message.channel.id === CONFIG.CHANNELS.GENERAL_CHAT) {
        const profile = DB.profiles[message.author.id];
        const gender = profile?.gender?.toLowerCase();
        
        // Immediate greeting responses
        const greetingWords = ['hi', 'hello', 'hey', 'sup', 'yo', 'kya haal', 'what\'s up', 'whats up', 'kaise ho'];
        const isGreeting = greetingWords.some(g => {
            const words = content.split(/\s+/);
            return words.includes(g) || content.includes(g);
        });

        if (isGreeting) {
            const responses = gender === 'female' ? AUTO_RESPONSES.female.greetings : AUTO_RESPONSES.male.greetings;
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            const embed = createEmbed(
                '👋 OTO Bot',
                response,
                '#3498db'
            );
            
            await message.reply({ embeds: [embed] });
            return;
        }
        
        // Track messages that got no reply for delayed response
        noReplyUsers.set(message.author.id, { time: Date.now(), messageId: message.id, content: message.content });
        
        setTimeout(async () => {
            const userEntry = noReplyUsers.get(message.author.id);
            if (userEntry && userEntry.messageId === message.id) {
                const generalResponses = gender === 'female' ? AUTO_RESPONSES.female.general : AUTO_RESPONSES.male.general;
                const response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
                
                const embed = createEmbed(
                    '💬 OTO Bot',
                    `${message.author} ${response}\n\nCheck <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> for tournaments!`,
                    '#f39c12'
                );
                
                try {
                    await message.reply({ embeds: [embed] });
                } catch (err) {
                    console.error('Could not send delayed response:', err);
                }
                noReplyUsers.delete(message.author.id);
            }
        }, 2 * 60 * 1000); // 2 minutes
    }

    // ===========================
    // 🤖 BOT MENTION RESPONSES
    // ===========================
    if (message.mentions.has(client.user)) {
        const embed = createEmbed(
            '🤖 OTO Tournament Bot',
            `Hey ${message.author}! 👋\n\n` +
            `**To Join Tournament:**\n` +
            `1️⃣ Complete your profile (if not done)\n` +
            `2️⃣ Go to <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>\n` +
            `3️⃣ Click JOIN button on any tournament\n` +
            `4️⃣ Follow instructions in ticket\n\n` +
            `**Need Help?**\n` +
            `Check <#${CONFIG.CHANNELS.HOW_TO_JOIN}> for detailed guide!\n` +
            `Read <#${CONFIG.CHANNELS.RULES_CHANNEL}> before playing!`,
            '#f39c12'
        );
        
        await message.reply({ embeds: [embed] });
        return;
    }

    // ===========================
    // ⚙️ STAFF COMMANDS
    // ===========================
    if (isStaff(member) && message.channel.id === CONFIG.CHANNELS.STAFF_TOOLS) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args[0]?.toLowerCase();

        if (message.content.startsWith('-')) {
            switch (command) {
                case 'create-tournament':
                    await handleCreateTournament(message);
                    break;
                case 'list-tournaments':
                    await handleListTournaments(message);
                    break;
                case 'ban':
                    await handleBan(message, args);
                    break;
                case 'timeout':
                    await handleTimeout(message, args);
                    break;
                case 'warn':
                    await handleWarn(message, args);
                    break;
                case 'stats':
                    await handleStats(message);
                    break;
                case 'help-staff':
                    await handleStaffHelp(message);
                    break;
            }
        }
    }

    // ===========================
    // 👑 OWNER COMMANDS
    // ===========================
    if (isOwner(message.author.id) && message.content.startsWith('!')) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args[0]?.toLowerCase();

        switch (command) {
            case 'add-staff':
                await handleAddStaff(message, args);
                break;
            case 'remove-staff':
                await handleRemoveStaff(message, args);
                break;
            case 'broadcast':
                await handleBroadcast(message);
                break;
            case 'bot-stats':
                await handleBotStats(message);
                break;
            case 'backup':
                await handleBackup(message);
                break;
            case 'help-owner':
                await handleOwnerHelp(message);
                break;
        }
    }

    // ===========================
    // 📊 USER COMMANDS
    // ===========================
    if (message.content.startsWith('/')) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args[0]?.toLowerCase();

        switch (command) {
            case 'profile':
                await handleShowProfile(message);
                break;
            case 'invites':
            case 'i':
                await handleInvites(message);
                break;
            case 'leaderboard':
            case 'lb':
                await handleLeaderboard(message);
                break;
            case 'help':
                await handleHelp(message);
                break;
        }
    }
});

// ===========================
// 🔘 INTERACTION HANDLER
// ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild) return;

    // ===========================
    // 🔘 BUTTON INTERACTIONS
    // ===========================
    if (interaction.isButton()) {
        const customId = interaction.customId;

        // Profile Creation Start
        if (customId === 'start_profile') {
            const modal = new ModalBuilder()
                .setCustomId('profile_modal')
                .setTitle('🎮 Create Your OTO Profile');

            const nameInput = new TextInputBuilder()
                .setCustomId('profile_name')
                .setLabel('Your Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(50);

            const gameInput = new TextInputBuilder()
                .setCustomId('profile_game')
                .setLabel('Favorite Game (Free Fire/Minecraft)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(gameInput)
            );

            await interaction.showModal(modal);
            return;
        }

        // Join Tournament
        if (customId.startsWith('join_tournament_')) {
            const tournamentId = customId.replace('join_tournament_', '');
            const tournament = DB.tournaments[tournamentId];

            if (!tournament) {
                await interaction.reply({ content: '❌ Tournament not found!', ephemeral: true });
                return;
            }

            if (tournament.currentSlots >= tournament.maxSlots) {
                await interaction.reply({ content: '❌ Tournament is full!', ephemeral: true });
                return;
            }

            // Check if user already has a ticket for this tournament
            const existingTicket = Object.values(DB.tickets).find(
                t => t.userId === interaction.user.id && 
                     t.tournament?.id === tournamentId && 
                     t.status === 'open'
            );

            if (existingTicket) {
                const channel = interaction.guild.channels.cache.get(existingTicket.channelId);
                await interaction.reply({ 
                    content: `⚠️ You already have an open ticket for this tournament! Check ${channel}`, 
                    ephemeral: true 
                });
                return;
            }

            // Create PRIVATE ticket for user
            const ticket = await createPrivateTicket(interaction.guild, interaction.user, 'tournament', tournament);
            await interaction.reply({ 
                content: `✅ Private ticket created! Check ${ticket} to complete your registration! 🎫`, 
                ephemeral: true 
            });
            return;
        }

        // Close Ticket
        if (customId === 'close_ticket') {
            const ticketEntry = Object.entries(DB.tickets).find(([id, ticket]) => 
                ticket.channelId === interaction.channel.id
            );

            if (!ticketEntry) {
                await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
                return;
            }

            const [ticketId, ticket] = ticketEntry;
            
            const embed = createEmbed(
                '🔒 Ticket Closing',
                'This ticket will be deleted in 10 seconds...',
                '#e74c3c'
            );

            await interaction.reply({ embeds: [embed] });

            setTimeout(async () => {
                try {
                    delete DB.tickets[ticketId];
                    saveJSON('tickets.json', DB.tickets);
                    await interaction.channel.delete();
                } catch (err) {
                    console.error('Error deleting ticket:', err);
                }
            }, 10000);
            return;
        }

        // Confirm Payment (Staff Only)
        if (customId.startsWith('confirm_payment_')) {
            if (!isStaff(interaction.member)) {
                await interaction.reply({ content: '❌ Only staff can confirm payments!', ephemeral: true });
                return;
            }

            const ticketId = customId.replace('confirm_payment_', '');
            const ticket = DB.tickets[ticketId];

            if (!ticket) {
                await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
                return;
            }

            const tournament = ticket.tournament;

            // Update tournament slots
            if (!tournament.participants) tournament.participants = [];
            tournament.participants.push(ticket.userId);
            tournament.currentSlots = tournament.participants.length;
            
            DB.tournaments[tournament.id] = tournament;
            saveJSON('tournaments.json', DB.tournaments);

            // Update ticket status
            ticket.status = 'confirmed';
            DB.tickets[ticketId].status = 'confirmed';
            saveJSON('tickets.json', DB.tickets);

            // Update leaderboard
            updateLeaderboard(ticket.userId, 'tournament_played');

            // Notify staff in staff chat
            const staffChat = interaction.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
            if (staffChat) {
                const staffEmbed = createEmbed(
                    '✅ Payment Confirmed',
                    `**Staff:** ${interaction.user.tag}\n` +
                    `**Player:** <@${ticket.userId}>\n` +
                    `**Tournament:** ${tournament.title}\n` +
                    `**Slots:** ${tournament.currentSlots}/${tournament.maxSlots}`,
                    '#2ecc71'
                );
                await staffChat.send({ embeds: [staffEmbed] });
            }

            // Create/Update lobby ticket
            const lobbyChannel = await createOrUpdateLobbyTicket(interaction.guild, ticket.userId, tournament);

            const embed = createEmbed(
                '✅ Payment Confirmed!',
                `Your payment has been verified! 🎉\n\n` +
                `**Tournament:** ${tournament.title}\n` +
                `**Your Slot:** #${tournament.currentSlots}/${tournament.maxSlots}\n\n` +
                `✅ You've been moved to ${lobbyChannel}!\n` +
                `🔐 Room ID and password will be shared 5 minutes before match!\n` +
                `🏆 Good luck and play fair!\n\n` +
                `*This ticket will close in 10 seconds...*`,
                '#2ecc71'
            );

            await interaction.update({ embeds: [embed], components: [] });

            // Update tournament schedule
            await updateTournamentMessage(interaction.guild, tournament.id);

            // Close registration ticket after 10 seconds
            setTimeout(async () => {
                try {
                    delete DB.tickets[ticketId];
                    saveJSON('tickets.json', DB.tickets);
                    await interaction.channel.delete();
                } catch (err) {
                    console.error('Error closing ticket:', err);
                }
            }, 10000);
            return;
        }

        // Reject Payment (Staff Only)
        if (customId.startsWith('reject_payment_')) {
            if (!isStaff(interaction.member)) {
                await interaction.reply({ content: '❌ Only staff can reject payments!', ephemeral: true });
                return;
            }

            const ticketId = customId.replace('reject_payment_', '');
            const ticket = DB.tickets[ticketId];

            if (!ticket) {
                await interaction.reply({ content: '❌ Ticket not found!', ephemeral: true });
                return;
            }

            const embed = createEmbed(
                '❌ Payment Rejected',
                `Your payment could not be verified.\n\n` +
                `**Possible Reasons:**\n` +
                `• Incorrect amount\n` +
                `• Invalid UTR/Transaction ID\n` +
                `• Unclear screenshot\n\n` +
                `Please send a clear payment screenshot again or contact staff for help.`,
                '#e74c3c'
            );

            await interaction.update({ embeds: [embed], components: [] });
            return;
        }

        // Gender Selection
        if (customId.startsWith('select_gender_')) {
            const gender = customId.replace('select_gender_', '');
            
            // Store temporarily and show state selection
            if (!interaction.client.tempProfiles) {
                interaction.client.tempProfiles = new Map();
            }
            
            const tempData = interaction.client.tempProfiles.get(interaction.user.id) || {};
            tempData.gender = gender;
            interaction.client.tempProfiles.set(interaction.user.id, tempData);

            // Show state selection
            await showStateSelection(interaction);
            return;
        }
    }

    // ===========================
    // 📝 SELECT MENU INTERACTIONS
    // ===========================
    if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;

        // State Selection
        if (customId === 'select_state') {
            const state = interaction.values[0];
            
            const tempData = interaction.client.tempProfiles.get(interaction.user.id) || {};
            tempData.state = state;
            interaction.client.tempProfiles.set(interaction.user.id, tempData);

            // Final confirmation
            const embed = createEmbed(
                '✅ Profile Complete!',
                `**Name:** ${tempData.name}\n` +
                `**Gender:** ${tempData.gender}\n` +
                `**State:** ${tempData.state}\n` +
                `**Game:** ${tempData.game}\n` +
                `**OTO ID:** ${tempData.otoId}\n\n` +
                `Unlocking server channels for you... 🔓`,
                '#2ecc71'
            );

            await interaction.update({ embeds: [embed], components: [] });

            // Save profile
            DB.profiles[interaction.user.id] = tempData;
            saveJSON('profiles.json', DB.profiles);

            // Unlock channels
            const member = await interaction.guild.members.fetch(interaction.user.id);
            await unlockChannelsForUser(member);

            // Post to profile channel
            const profileChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.PROFILE_SECTION);
            if (profileChannel) {
                const profileEmbed = createEmbed(
                    `👤 ${tempData.name}'s Profile`,
                    `**OTO ID:** ${tempData.otoId}\n` +
                    `**Gender:** ${tempData.gender === 'male' ? '👨 Male' : '👩 Female'}\n` +
                    `**State:** ${tempData.state}\n` +
                    `**Favorite Game:** ${tempData.game}\n` +
                    `**Joined:** <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
                    `**Stats:** 🏆 0 Wins | 🎮 0 Played | 💰 ₹0 Earned`,
                    '#9b59b6'
                );
                await profileChannel.send({ embeds: [profileEmbed] });
            }

            // Welcome in general
            const generalChannel = interaction.guild.channels.cache.get(CONFIG.CHANNELS.GENERAL_CHAT);
            if (generalChannel) {
                const welcomeEmbed = createEmbed(
                    '🎉 Welcome to OTO!',
                    `${getRandomWelcome(`<@${interaction.user.id}>`)}\n\n` +
                    `Profile unlocked! You can now access all channels! 🔓\n` +
                    `Check out <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}> to join tournaments!`,
                    '#2ecc71'
                );
                await generalChannel.send({ embeds: [welcomeEmbed] });
            }

            // Clear temp data
            interaction.client.tempProfiles.delete(interaction.user.id);
            return;
        }
    }

    // ===========================
    // 📋 MODAL INTERACTIONS
    // ===========================
    if (interaction.isModalSubmit()) {
        const customId = interaction.customId;

        // Profile Creation Modal
        if (customId === 'profile_modal') {
            const name = interaction.fields.getTextInputValue('profile_name');
            const game = interaction.fields.getTextInputValue('profile_game');
            const otoId = generateOTOID();

            // Store temporarily
            if (!interaction.client.tempProfiles) {
                interaction.client.tempProfiles = new Map();
            }

            interaction.client.tempProfiles.set(interaction.user.id, {
                name,
                game,
                otoId,
                userId: interaction.user.id,
                createdAt: Date.now()
            });

            // Show gender selection
            const embed = createEmbed(
                '👤 Select Your Gender',
                'Please select your gender to continue:',
                '#3498db'
            );

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

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            return;
        }
    }
});

// ===========================
// 🎫 HELPER FUNCTIONS
// ===========================
async function createPrivateTicket(guild, user, type, tournamentData = null) {
    const ticketId = `ticket-${Date.now()}-${user.id}`;
    
    // Create private ticket channel
    const channel = await guild.channels.create({
        name: `${type}-${user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
            },
            {
                id: CONFIG.ROLES.STAFF,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
            },
            {
                id: CONFIG.ROLES.ADMIN,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
            }
        ]
    });

    // Save ticket data
    DB.tickets[ticketId] = {
        channelId: channel.id,
        userId: user.id,
        type: type,
        status: 'open',
        createdAt: Date.now(),
        tournament: tournamentData,
        gameInfo: null,
        paymentProof: null
    };
    saveJSON('tickets.json', DB.tickets);

    // Send welcome message based on type
    if (type === 'tournament') {
        const isSquad = tournamentData?.mode?.toLowerCase().includes('squad');
        const hasFee = tournamentData?.entryFee > 0;

        const embed = createEmbed(
            `🎫 Tournament Registration`,
            `Welcome ${user}! 🎮\n\n` +
            `**Tournament:** ${tournamentData?.title || 'N/A'}\n` +
            `**Mode:** ${tournamentData?.mode || 'N/A'}\n` +
            `**Entry Fee:** ₹${tournamentData?.entryFee || 0}\n` +
            `**Prize Pool:** ₹${tournamentData?.prizePool || 0}\n\n` +
            `📝 **Please provide the following information:**\n\n` +
            `1️⃣ **Your In-Game Name (IGN)**\n` +
            (isSquad ? `2️⃣ **Squad ID**\n3️⃣ **Squad Name**\n` : '') +
            (hasFee ? `${isSquad ? '4️⃣' : '2️⃣'} **Payment Screenshot** (After receiving QR code)\n` : '') +
            `\n⚠️ Staff will review your information and confirm your entry!`,
            '#3498db'
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('🔒 Close Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ 
            content: `${user} | <@&${CONFIG.ROLES.STAFF}>`,
            embeds: [embed], 
            components: [row] 
        });

        // If entry fee, generate payment QR/instructions
        if (hasFee) {
            setTimeout(async () => {
                const paymentEmbed = createEmbed(
                    '💳 Payment Required',
                    `**Amount:** ₹${tournamentData.entryFee}\n\n` +
                    `📱 **Payment Methods:**\n` +
                    `• UPI ID: \`yourUPI@paytm\`\n` +
                    `• Phone Pe / Google Pay\n` +
                    `• Paytm\n\n` +
                    `📸 **After payment:**\n` +
                    `1. Take a clear screenshot showing:\n` +
                    `   - Amount paid\n` +
                    `   - Transaction ID/UTR\n` +
                    `   - Date & Time\n` +
                    `2. Upload the screenshot here\n` +
                    `3. Wait for staff confirmation\n\n` +
                    `⚠️ **Note:** Screenshot must be clear and show all details!`,
                    '#f39c12'
                );
                await channel.send({ embeds: [paymentEmbed] });
            }, 2000);
        }

        // Staff notification in staff chat
        const staffChat = guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
        if (staffChat) {
            const staffEmbed = createEmbed(
                '🎫 New Tournament Registration',
                `**Player:** ${user.tag} (${user})\n` +
                `**Tournament:** ${tournamentData.title}\n` +
                `**Entry Fee:** ₹${tournamentData.entryFee}\n` +
                `**Ticket:** ${channel}\n\n` +
                `⚠️ Waiting for player to provide game info and payment!`,
                '#3498db'
            );
            await staffChat.send({ embeds: [staffEmbed] });
        }

    } else {
        // Support ticket
        const embed = createEmbed(
            `🎫 Support Ticket`,
            `Welcome ${user}!\n\n` +
            `Staff will assist you shortly. Please describe your issue clearly.\n\n` +
            `**Average Response Time:** 2-5 minutes`,
            '#3498db'
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('🔒 Close Ticket')
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [row] });
    }
    
    // Log ticket creation
    const logChannel = guild.channels.cache.get(CONFIG.CHANNELS.TICKET_LOG);
    if (logChannel) {
        const logEmbed = createEmbed(
            '📌 New Ticket Created',
            `**User:** ${user.tag}\n` +
            `**Type:** ${type}\n` +
            `**Channel:** ${channel}\n` +
            `**Time:** <t:${Math.floor(Date.now() / 1000)}:R>`,
            '#2ecc71'
        );
        await logChannel.send({ embeds: [logEmbed] });
    }

    return channel;
}

// Separate message handler for ticket updates
async function handleTicketMessages(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Check if message is in a ticket channel
    const ticketEntry = Object.entries(DB.tickets).find(([id, ticket]) => 
        ticket.channelId === message.channel.id && ticket.status === 'open'
    );

    if (ticketEntry) {
        const [ticketId, ticket] = ticketEntry;

        // If user sends a message with IGN info
        if (message.author.id === ticket.userId && !ticket.gameInfo) {
            ticket.gameInfo = {
                message: message.content,
                timestamp: Date.now()
            };
            DB.tickets[ticketId] = ticket;
            saveJSON('tickets.json', DB.tickets);

            const embed = createEmbed(
                '✅ Information Received',
                `Thank you! We've received your game information.\n\n` +
                (ticket.tournament?.entryFee > 0 ? 
                    `📸 Please upload your payment screenshot now!` : 
                    `⏳ Staff will review and confirm your entry shortly!`
                ),
                '#2ecc71'
            );
            await message.react('✅');
            await message.channel.send({ embeds: [embed] });
        }

        // If user sends payment screenshot
        if (message.author.id === ticket.userId && message.attachments.size > 0 && !ticket.paymentProof) {
            ticket.paymentProof = {
                url: message.attachments.first().url,
                timestamp: Date.now()
            };
            DB.tickets[ticketId] = ticket;
            saveJSON('tickets.json', DB.tickets);

            const embed = createEmbed(
                '📸 Payment Screenshot Received',
                `Thank you! Staff is reviewing your payment...\n\n` +
                `⏳ You'll be confirmed within 2-5 minutes!`,
                '#f39c12'
            );
            await message.react('✅');
            await message.channel.send({ embeds: [embed] });

            // Show staff confirmation buttons
            const staffRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_payment_${ticketId}`)
                    .setLabel('✅ Confirm Payment')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_payment_${ticketId}`)
                    .setLabel('❌ Reject Payment')
                    .setStyle(ButtonStyle.Danger)
            );

            const staffEmbed = createEmbed(
                '👨‍💼 Staff Action Required',
                `**Player:** <@${ticket.userId}>\n` +
                `**Tournament:** ${ticket.tournament?.title}\n` +
                `**Entry Fee:** ₹${ticket.tournament?.entryFee}\n\n` +
                `**Game Info:** ${ticket.gameInfo?.message || 'Not provided'}\n` +
                `**Payment Screenshot:** [View](${ticket.paymentProof.url})\n\n` +
                `⚠️ **Please verify and confirm or reject the payment!**`,
                '#f39c12'
            );

            await message.channel.send({ embeds: [staffEmbed], components: [staffRow] });

            // Notify staff chat
            const staffChat = message.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
            if (staffChat) {
                const notifEmbed = createEmbed(
                    '⚠️ Payment Pending Verification',
                    `**Player:** <@${ticket.userId}>\n` +
                    `**Tournament:** ${ticket.tournament?.title}\n` +
                    `**Ticket:** ${message.channel}\n\n` +
                    `🔔 Action required!`,
                    '#e74c3c'
                );
                await staffChat.send({ content: `<@&${CONFIG.ROLES.STAFF}>`, embeds: [notifEmbed] });
            }
        }
    }
});

async function createOrUpdateLobbyTicket(guild, userId, tournament) {
    const user = await client.users.fetch(userId);
    const lobbyName = `lobby-${tournament.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.substring(0, 100);
    
    // Check if lobby already exists
    let lobbyChannel = guild.channels.cache.find(ch => ch.name === lobbyName);
    
    if (!lobbyChannel) {
        // Create new lobby
        lobbyChannel = await guild.channels.create({
            name: lobbyName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: CONFIG.ROLES.STAFF,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: CONFIG.ROLES.ADMIN,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
                }
            ]
        });

        const lobbyEmbed = createEmbed(
            `🎮 ${tournament.title} - Tournament Lobby`,
            `**Tournament Details:**\n` +
            `🎯 **Mode:** ${tournament.mode}\n` +
            `⏰ **Time:** ${tournament.time}\n` +
            `🗺️ **Map:** ${tournament.map || tournament.mode}\n` +
            `💰 **Prize Pool:** ₹${tournament.prizePool}\n` +
            `📊 **Slots:** ${tournament.currentSlots}/${tournament.maxSlots}\n\n` +
            `✅ **All confirmed players will appear below!**\n` +
            `🔐 Room ID & Password will be shared 5 minutes before match start!\n\n` +
            `**Players:**`,
            '#9b59b6'
        );

        await lobbyChannel.send({ embeds: [lobbyEmbed] });
    }

    // Add user permission
    await lobbyChannel.permissionOverwrites.create(userId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
    });

    // Welcome user to lobby
    const welcomeEmbed = createEmbed(
        '✅ Player Confirmed!',
        `Welcome ${user} to the tournament lobby! 🎉\n\n` +
        `You're all set for **${tournament.title}**!\n` +
        `Get ready to compete! 🔥\n\n` +
        `**Remember:**\n` +
        `• Be online 10 minutes before start time\n` +
        `• Room credentials will be shared here\n` +
        `• Play fair and have fun! 🏆`,
        '#2ecc71'
    );

    await lobbyChannel.send({ embeds: [welcomeEmbed] });

    return lobbyChannel;
}
    const stateOptions = CONFIG.INDIAN_STATES.slice(0, 25).map(state => ({
        label: state,
        value: state
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_state')
        .setPlaceholder('🗺️ Select your state')
        .addOptions(stateOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = createEmbed(
        '🗺️ Select Your State',
        'Please select your state from the dropdown:',
        '#3498db'
    );

    await interaction.update({ embeds: [embed], components: [row] });
}

async function createLobbyTicket(guild, userId, tournament) {
    const user = await client.users.fetch(userId);
    const lobbyId = `lobby-${tournament.id}`;
    
    // Check if lobby already exists
    let lobbyChannel = guild.channels.cache.find(ch => ch.name === `lobby-${tournament.title.toLowerCase().replace(/ /g, '-')}`);
    
    if (!lobbyChannel) {
        lobbyChannel = await guild.channels.create({
            name: `lobby-${tournament.title.toLowerCase().replace(/ /g, '-')}`,
            type: ChannelType.GuildText,
            parent: CONFIG.CHANNELS.OPEN_TICKET,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: CONFIG.ROLES.STAFF,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagBits.SendMessages]
                }
            ]
        });

        const lobbyEmbed = createEmbed(
            `🎮 ${tournament.title} - Lobby`,
            `**Tournament:** ${tournament.title}\n` +
            `**Time:** ${tournament.time}\n` +
            `**Map:** ${tournament.map || tournament.mode}\n\n` +
            `All confirmed players will be added here!\n` +
            `Room credentials will be shared 5 minutes before start! 🔐`,
            '#9b59b6'
        );

        await lobbyChannel.send({ embeds: [lobbyEmbed] });
    }

    // Add user permission
    await lobbyChannel.permissionOverwrites.create(userId, {
        ViewChannel: true,
        SendMessages: true
    });

    // Notify user
    const embed = createEmbed(
        '✅ Added to Lobby!',
        `Welcome ${user}!\n\n` +
        `You've been added to the tournament lobby.\n` +
        `Get ready for an epic match! 🔥`,
        '#2ecc71'
    );

    await lobbyChannel.send({ embeds: [embed] });

    return lobbyChannel;
}

// ===========================
// ⚙️ STAFF COMMAND HANDLERS
// ===========================
async function handleCreateTournament(message) {
    const embed = createEmbed(
        '🏆 Create Tournament',
        '**Tournament Creation Menu**\n\n' +
        'Use the following format:\n' +
        '```-create-tournament\n' +
        'Title: Free Fire Solo\n' +
        'Game: Free Fire\n' +
        'Mode: Solo\n' +
        'Prize Pool: 500\n' +
        'Entry Fee: 50\n' +
        'Slots: 12\n' +
        'Time: 8:00 PM\n' +
        'Map: Bermuda\n' +
        'Prize Distribution: 1st: ₹250, 2nd: ₹150, 3rd: ₹100```',
        '#f39c12'
    );

    await message.reply({ embeds: [embed] });
}

async function handleListTournaments(message) {
    const tournaments = Object.values(DB.tournaments);
    
    if (tournaments.length === 0) {
        await message.reply('No tournaments created yet!');
        return;
    }

    const embed = createEmbed(
        '📋 Active Tournaments',
        tournaments.map((t, i) => 
            `**${i + 1}. ${t.title}**\n` +
            `Slots: ${t.currentSlots}/${t.maxSlots} | Prize: ₹${t.prizePool}\n`
        ).join('\n'),
        '#3498db'
    );

    await message.reply({ embeds: [embed] });
}

async function handleBan(message, args) {
    const user = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!user) {
        await message.reply('❌ Please mention a user to ban!');
        return;
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        await member.ban({ reason });

        const embed = createEmbed(
            '🔨 User Banned',
            `**User:** ${user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Moderator:** ${message.author.tag}`,
            '#e74c3c'
        );

        await message.reply({ embeds: [embed] });
    } catch (err) {
        await message.reply('❌ Failed to ban user!');
    }
}

async function handleTimeout(message, args) {
    const user = message.mentions.users.first();
    const duration = parseInt(args[2]) || 5;
    const reason = args.slice(3).join(' ') || 'No reason provided';

    if (!user) {
        await message.reply('❌ Please mention a user to timeout!');
        return;
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        await member.timeout(duration * 60 * 1000, reason);

        const embed = createEmbed(
            '⏰ User Timed Out',
            `**User:** ${user.tag}\n` +
            `**Duration:** ${duration} minutes\n` +
            `**Reason:** ${reason}\n` +
            `**Moderator:** ${message.author.tag}`,
            '#f39c12'
        );

        await message.reply({ embeds: [embed] });
    } catch (err) {
        await message.reply('❌ Failed to timeout user!');
    }
}

async function handleWarn(message, args) {
    const user = message.mentions.users.first();
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!user) {
        await message.reply('❌ Please mention a user to warn!');
        return;
    }

    const warningCount = addWarning(user.id, reason);

    const embed = createEmbed(
        '⚠️ User Warned',
        `**User:** ${user.tag}\n` +
        `**Reason:** ${reason}\n` +
        `**Warning Count:** ${warningCount}\n` +
        `**Moderator:** ${message.author.tag}`,
        '#f39c12'
    );

    await message.reply({ embeds: [embed] });

    try {
        await user.send(`⚠️ You have been warned in OTO Tournaments!\n**Reason:** ${reason}\n**Warning Count:** ${warningCount}/3`);
    } catch (err) {
        console.error('Could not DM user:', err);
    }
}

async function handleStats(message) {
    const guild = message.guild;
    const tournaments = Object.values(DB.tournaments);
    const profiles = Object.values(DB.profiles);
    const tickets = Object.values(DB.tickets);

    const embed = createEmbed(
        '📊 OTO Bot Statistics',
        `**Server Stats:**\n` +
        `👥 Total Members: ${guild.memberCount}\n` +
        `👤 Profiles: ${profiles.length}\n\n` +
        `**Tournament Stats:**\n` +
        `🏆 Active Tournaments: ${tournaments.length}\n` +
        `🎫 Open Tickets: ${tickets.filter(t => t.status === 'open').length}\n\n` +
        `**Today's Activity:**\n` +
        `📈 New Registrations: ${DB.stats.todayRegistrations || 0}\n` +
        `💰 Revenue: ₹${DB.stats.todayRevenue || 0}`,
        '#2ecc71'
    );

    await message.reply({ embeds: [embed] });
}

async function handleStaffHelp(message) {
    const embed = createEmbed(
        '⚙️ Staff Commands',
        '**Tournament Management:**\n' +
        '`-create-tournament` - Create new tournament\n' +
        '`-list-tournaments` - List all tournaments\n' +
        '`-edit-tournament [id]` - Edit tournament\n' +
        '`-delete-tournament [id]` - Delete tournament\n\n' +
        '**Moderation:**\n' +
        '`-ban @user [reason]` - Ban user\n' +
        '`-timeout @user [minutes] [reason]` - Timeout user\n' +
        '`-warn @user [reason]` - Warn user\n' +
        '`-unban [user_id]` - Unban user\n\n' +
        '**Utilities:**\n' +
        '`-stats` - View bot statistics\n' +
        '`-help-staff` - Show this message',
        '#3498db'
    );

    await message.reply({ embeds: [embed] });
}

// ===========================
// 👑 OWNER COMMAND HANDLERS
// ===========================
async function handleAddStaff(message, args) {
    const user = message.mentions.users.first();
    
    if (!user) {
        await message.reply('❌ Please mention a user to add as staff!');
        return;
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        await member.roles.add(CONFIG.ROLES.STAFF);

        const welcomeMessages = [
            `Tumhe hardwork karna hai! 💪`,
            `OTO family mein welcome! Let's grow together! 🚀`,
            `責responsibility sambhalo, best do! 🏆`,
            `Staff ban gaye, ab dikhaao apna talent! ⚡`,
            `Welcome to the team! Make us proud! 🌟`
        ];

        const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        const embed = createEmbed(
            '⭐ New Staff Member!',
            `Welcome ${user} to the OTO Staff Team!\n\n` +
            `${welcomeMsg}\n\n` +
            `Check <#${CONFIG.CHANNELS.STAFF_TOOLS}> for your commands!`,
            '#2ecc71'
        );

        const staffChat = message.guild.channels.cache.get(CONFIG.CHANNELS.STAFF_CHAT);
        if (staffChat) {
            await staffChat.send({ embeds: [embed] });
        }

        await message.reply('✅ Staff member added successfully!');
    } catch (err) {
        await message.reply('❌ Failed to add staff member!');
    }
}

async function handleRemoveStaff(message, args) {
    const user = message.mentions.users.first();
    
    if (!user) {
        await message.reply('❌ Please mention a user to remove from staff!');
        return;
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        await member.roles.remove(CONFIG.ROLES.STAFF);

        const embed = createEmbed(
            '❌ Staff Member Removed',
            `${user.tag} has been removed from staff team.`,
            '#e74c3c'
        );

        await message.reply({ embeds: [embed] });
    } catch (err) {
        await message.reply('❌ Failed to remove staff member!');
    }
}

async function handleBroadcast(message) {
    const embed = createEmbed(
        '📢 Broadcast Message',
        'Reply to this message with the announcement you want to broadcast.\n\n' +
        'Format: `[channel_id] Your message here`\n' +
        'Example: `1438482904018849835 New tournament starting soon!`',
        '#f39c12'
    );

    await message.reply({ embeds: [embed] });
}

async function handleBotStats(message) {
    const guild = message.guild;
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const embed = createEmbed(
        '🤖 Bot Statistics',
        `**System Info:**\n` +
        `⏰ Uptime: ${days}d ${hours}h ${minutes}m\n` +
        `💾 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
        `📊 Servers: ${client.guilds.cache.size}\n\n` +
        `**Database Stats:**\n` +
        `👤 Profiles: ${Object.keys(DB.profiles).length}\n` +
        `🏆 Tournaments: ${Object.keys(DB.tournaments).length}\n` +
        `🎫 Tickets: ${Object.keys(DB.tickets).length}\n` +
        `⚠️ Warnings: ${Object.keys(DB.warnings).length}\n` +
        `📈 Leaderboard Entries: ${Object.keys(DB.leaderboard).length}`,
        '#9b59b6'
    );

    await message.reply({ embeds: [embed] });
}

async function handleBackup(message) {
    try {
        saveAllData();
        
        const embed = createEmbed(
            '💾 Backup Complete',
            'All data has been saved successfully!\n\n' +
            `**Files Saved:**\n` +
            `✅ profiles.json\n` +
            `✅ tournaments.json\n` +
            `✅ invites.json\n` +
            `✅ warnings.json\n` +
            `✅ tickets.json\n` +
            `✅ leaderboard.json\n` +
            `✅ settings.json\n` +
            `✅ stats.json`,
            '#2ecc71'
        );

        await message.reply({ embeds: [embed] });
    } catch (err) {
        await message.reply('❌ Backup failed!');
    }
}

async function handleOwnerHelp(message) {
    const embed = createEmbed(
        '👑 Owner Commands',
        '**Staff Management:**\n' +
        '`!add-staff @user` - Add staff member\n' +
        '`!remove-staff @user` - Remove staff member\n\n' +
        '**System:**\n' +
        '`!broadcast` - Broadcast message\n' +
        '`!bot-stats` - View detailed bot stats\n' +
        '`!backup` - Manual backup\n' +
        '`!restart` - Restart bot (if supported)\n\n' +
        '`!help-owner` - Show this message',
        '#FFD700'
    );

    await message.reply({ embeds: [embed] });
}

// ===========================
// 👤 USER COMMAND HANDLERS
// ===========================
async function handleShowProfile(message) {
    const profile = DB.profiles[message.author.id];
    
    if (!profile) {
        await message.reply('❌ You don\'t have a profile yet! Complete it via DM.');
        return;
    }

    const lb = DB.leaderboard[message.author.id] || {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        totalEarnings: 0,
        invites: 0
    };

    const embed = createEmbed(
        `👤 ${profile.name}'s Profile`,
        `**OTO ID:** ${profile.otoId}\n` +
        `**Gender:** ${profile.gender === 'male' ? '👨 Male' : '👩 Female'}\n` +
        `**State:** ${profile.state}\n` +
        `**Favorite Game:** ${profile.game}\n\n` +
        `**Statistics:**\n` +
        `🏆 Tournaments Won: ${lb.tournamentsWon}\n` +
        `🎮 Tournaments Played: ${lb.tournamentsPlayed}\n` +
        `💰 Total Earnings: ₹${lb.totalEarnings}\n` +
        `👥 Invites: ${lb.invites}\n` +
        `⚡ Win Rate: ${lb.tournamentsPlayed > 0 ? ((lb.tournamentsWon / lb.tournamentsPlayed) * 100).toFixed(1) : 0}%`,
        '#9b59b6'
    );

    await message.reply({ embeds: [embed] });
}

async function handleInvites(message) {
    const lb = DB.leaderboard[message.author.id];
    const inviteCount = lb?.invites || 0;

    const rewards = [
        { at: 5, reward: '🌱 Beginner Recruiter Role' },
        { at: 10, reward: '🎮 FREE Tournament Entry' },
        { at: 15, reward: '💎 50% Discount' },
        { at: 20, reward: '🎁 FREE Tournament + Pro Recruiter Role' },
        { at: 30, reward: '👑 FREE Premium Tournament' },
        { at: 50, reward: '🔥 Custom Role + 3 FREE Entries' },
        { at: 100, reward: '💫 Lifetime 50% Discount' }
    ];

    const nextReward = rewards.find(r => r.at > inviteCount);

    const embed = createEmbed(
        '👥 Your Invite Stats',
        `**Total Invites:** ${inviteCount}\n\n` +
        `**Next Reward:** ${nextReward ? `${nextReward.reward} (${nextReward.at - inviteCount} more invites needed)` : 'All rewards unlocked! 🎉'}\n\n` +
        `**Invite Rewards:**\n` +
        rewards.map(r => `${inviteCount >= r.at ? '✅' : '🔒'} ${r.at} invites - ${r.reward}`).join('\n'),
        '#3498db'
    );

    await message.reply({ embeds: [embed] });
}

async function handleLeaderboard(message) {
    const leaderboardData = Object.entries(DB.leaderboard)
        .sort((a, b) => b[1].tournamentsWon - a[1].tournamentsWon)
        .slice(0, 10);

    if (leaderboardData.length === 0) {
        await message.reply('No leaderboard data yet!');
        return;
    }

    const leaderboardText = await Promise.all(
        leaderboardData.map(async ([userId, data], index) => {
            const user = await client.users.fetch(userId).catch(() => null);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `${medal} **${user?.username || 'Unknown'}** - ${data.tournamentsWon} wins | ₹${data.totalEarnings}`;
        })
    );

    const embed = createEmbed(
        '🏆 Tournament Leaderboard',
        leaderboardText.join('\n'),
        '#FFD700'
    );

    await message.reply({ embeds: [embed] });
}

async function handleHelp(message) {
    const embed = createEmbed(
        '❓ OTO Bot Commands',
        '**Player Commands:**\n' +
        '`/profile` - View your profile\n' +
        '`/invites` or `/i` - Check your invites\n' +
        '`/leaderboard` or `/lb` - View leaderboard\n' +
        '`/help` - Show this message\n\n' +
        '**How to Play:**\n' +
        '1️⃣ Complete your profile (check DMs)\n' +
        '2️⃣ Go to <#${CONFIG.CHANNELS.TOURNAMENT_SCHEDULE}>\n' +
        '3️⃣ Click JOIN on any tournament\n' +
        '4️⃣ Follow ticket instructions\n' +
        '5️⃣ Win prizes! 🏆\n\n' +
        '**Need Support?**\n' +
        'Tag @Staff or create a support ticket!',
        '#3498db'
    );

    await message.reply({ embeds: [embed] });
}

// ===========================
// 🚀 BOT LOGIN
// ===========================
client.login(process.env.DISCORD_BOT_TOKEN);
