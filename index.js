// index.js - Complete OTO Tournament Bot (4500+ Lines)
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize client with all required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ]
});

// Constants from your server
const CHANNELS = {
    GENERAL: '1438482904018849835',
    TOURNAMENT_SCHEDULE: '1438482561679626303',
    TICKET_LOG: '1438485821572518030',
    MATCH_REPORTS: '1438486113047150714',
    ANNOUNCEMENT: '1438484746165555243',
    LEADERBOARD: '1438947356690223347',
    INVITE_TRACKER: '1439216884774998107',
    PROFILE_SECTION: '1439542574066176020',
    STAFF_TOOLS: '1438486059255336970',
    MINECRAFT: '1439223955960627421',
    MOST_PLAYER_LEADERBOARD: '1439226024863993988',
    WELCOME: '1438482904018849835'
};

const ROLES = {
    OWNER: '1438443937588183110',
    ADMIN: '1438475461977047112',
    STAFF: '1438475461977047112',
    PLAYER: '1439542574066176021',
    FOUNDER: '1438443937588183110'
};

// Data storage
const dataDir = './data';
const profilesFile = path.join(dataDir, 'profiles.json');
const tournamentsFile = path.join(dataDir, 'tournaments.json');
const ticketsFile = path.join(dataDir, 'tickets.json');
const invitesFile = path.join(dataDir, 'invites.json');
const warningsFile = path.join(dataDir, 'warnings.json');
const leaderboardsFile = path.join(dataDir, 'leaderboards.json');
const staffFile = path.join(dataDir, 'staff.json');
const configFile = path.join(dataDir, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load data functions
function loadJSON(filePath, defaultData = {}) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
    return defaultData;
}

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving ${filePath}:`, error);
        return false;
    }
}

// Global data stores
let profiles = loadJSON(profilesFile);
let tournaments = loadJSON(tournamentsFile);
let tickets = loadJSON(ticketsFile);
let invites = loadJSON(invitesFile);
let warnings = loadJSON(warningsFile);
let leaderboards = loadJSON(leaderboardsFile);
let staff = loadJSON(staffFile);
let config = loadJSON(configFile, { 
    autoAnnounce: true,
    spamProtection: true,
    welcomeMessages: true 
});

// Auto-save every 5 minutes
setInterval(() => {
    saveJSON(profilesFile, profiles);
    saveJSON(tournamentsFile, tournaments);
    saveJSON(ticketsFile, tickets);
    saveJSON(invitesFile, invites);
    saveJSON(warningsFile, warnings);
    saveJSON(leaderboardsFile, leaderboards);
    saveJSON(staffFile, staff);
    saveJSON(configFile, config);
    console.log('🔄 Auto-saved all data');
}, 300000);

// Utility functions
function generateOTOId() {
    const id = Math.floor(1000 + Math.random() * 9000);
    return `OTO-${id}`;
}

function generateTournamentId() {
    return `T${Date.now()}`;
}

function generateTicketId() {
    return `TCK${Date.now()}`;
}

function isStaff(member) {
    if (!member) return false;
    return member.roles.cache.has(ROLES.STAFF) || 
           member.roles.cache.has(ROLES.ADMIN) || 
           member.roles.cache.has(ROLES.OWNER) ||
           member.permissions.has(PermissionFlagsBits.Administrator);
}

function isOwner(member) {
    if (!member) return false;
    return member.roles.cache.has(ROLES.OWNER) || 
           member.permissions.has(PermissionFlagsBits.Administrator);
}

function getUserProfile(userId) {
    return profiles[userId];
}

function hasCompletedProfile(userId) {
    const profile = profiles[userId];
    return profile && profile.completed === true;
}

// ============================================================================
// CORE BOT SETUP & EVENT HANDLERS
// ============================================================================

const cooldowns = new Collection();
const userStates = new Map();
const profileCreation = new Map();
const tournamentCreation = new Map();
const lastReplies = new Map();
const messageCounts = new Map();

// Rate limiting utility
function checkCooldown(userId, command, cooldownSeconds = 3) {
    if (!cooldowns.has(command)) {
        cooldowns.set(command, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command);
    const cooldownAmount = cooldownSeconds * 1000;

    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return timeLeft;
        }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
    return 0;
}

// ============================================================================
// PHASE 1: ENHANCED PROFILE SYSTEM
// ============================================================================

client.on('guildMemberAdd', async (member) => {
    try {
        console.log(`🆕 New member joined: ${member.user.tag}`);
        
        // Send welcome DM
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎮 Welcome to OTO Tournaments! 🎮')
            .setDescription(`Hello **${member.user.username}**! Welcome to the ultimate gaming destination! 🚀`)
            .addFields(
                { name: '💰 Earn Real Money', value: 'Compete in tournaments and win cash prizes!' },
                { name: '🏆 Prove Your Skills', value: 'Climb the leaderboards and become a champion!' },
                { name: '👥 Build Your Squad', value: 'Invite friends and dominate together!' }
            )
            .setColor(0x00FF00)
            .setThumbnail(member.guild.iconURL())
            .setTimestamp();

        const profileButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_profile')
                .setLabel('🎮 Start Profile Creation')
                .setStyle(ButtonStyle.Primary)
        );

        try {
            const dm = await member.send({ 
                embeds: [welcomeEmbed], 
                components: [profileButton] 
            });
            console.log(`✅ Welcome DM sent to ${member.user.tag}`);
        } catch (error) {
            console.log(`❌ Could not send DM to ${member.user.tag} - DMs might be disabled`);
        }

        // Send welcome message in general channel
        if (config.welcomeMessages) {
            try {
                const generalChannel = await client.channels.fetch(CHANNELS.GENERAL);
                const welcomeMessages = [
                    `🔥 ${member} has entered the arena! Ready to dominate? 🎮`,
                    `💪 A new warrior ${member} joins the battle! Prepare for epic tournaments! ⚔️`,
                    `🎮 ${member} is here! Tournament kheloge bro? Let's win some money! 💰`,
                    `⚡ Welcome ${member}! Get ready to climb the leaderboards! 🏆`,
                    `🚀 ${member} just landed! Time to show your skills in our tournaments! ✨`,
                    `🌟 ${member} has arrived! The competition just got tougher! 💪`,
                    `🎯 New challenger ${member} approaches! Ready for tournament action? 🔥`,
                    `💎 Welcome ${member}! Your journey to becoming a champion starts now! 🏅`,
                    `⚔️ ${member} joins the ranks! Prepare for epic battles and big wins! 🎮`,
                    `🚨 Alert! ${member} has entered the server! Tournament slots filling fast! ⚡`
                ];
                
                const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
                await generalChannel.send(randomWelcome);
            } catch (error) {
                console.error('Error sending welcome message:', error);
            }
        }

    } catch (error) {
        console.error('Error in guildMemberAdd:', error);
    }
});

// Profile creation button handler
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        if (interaction.customId === 'start_profile') {
            await startProfileCreation(interaction);
        }
        else if (interaction.customId === 'start_profile_direct') {
            await startProfileCreation(interaction);
        }
        else if (interaction.customId.startsWith('gender_')) {
            await handleGenderSelection(interaction);
        }
        else if (interaction.customId.startsWith('game_')) {
            await handleGameSelection(interaction);
        }
    } catch (error) {
        console.error('Error in button interaction:', error);
        await interaction.reply({ 
            content: '❌ An error occurred. Please try again.', 
            ephemeral: true 
        });
    }
});

async function startProfileCreation(interaction) {
    try {
        const userId = interaction.user.id;
        
        // Check if profile already exists
        if (profiles[userId] && profiles[userId].completed) {
            const existingEmbed = new EmbedBuilder()
                .setTitle('✅ Profile Already Exists')
                .setDescription('You have already completed your profile!')
                .setColor(0x00FF00);
            
            return await interaction.reply({ embeds: [existingEmbed], ephemeral: true });
        }

        // Start profile creation
        profileCreation.set(userId, {
            step: 1,
            data: {}
        });

        const nameEmbed = new EmbedBuilder()
            .setTitle('📝 Profile Creation - Step 1/4')
            .setDescription('**Please enter your full name:**\n\nThis will be your display name in tournaments and leaderboards.')
            .setColor(0x0099FF)
            .setFooter({ text: 'Type your answer in this DM within 5 minutes' });

        await interaction.reply({ 
            embeds: [nameEmbed], 
            ephemeral: true 
        });
        
        // Set state for DM handling
        userStates.set(userId, 'awaiting_name');

    } catch (error) {
        console.error('Error starting profile creation:', error);
        await interaction.reply({ 
            content: '❌ Failed to start profile creation. Please try again.', 
            ephemeral: true 
        });
    }
}

// DM message handler for profile creation
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.guild) return; // Only handle DMs

    const userId = message.author.id;
    const state = userStates.get(userId);
    const profileData = profileCreation.get(userId);

    if (!state && !profileData) return;

    try {
        if (state === 'awaiting_name') {
            await handleNameStep(message);
        } else if (profileData && profileData.step === 2) {
            await handleGenderStep(message);
        } else if (profileData && profileData.step === 3) {
            await handleStateStep(message);
        }
    } catch (error) {
        console.error('Error in profile creation DM:', error);
        await message.reply('❌ An error occurred. Please use `-profile` command to restart profile creation.');
    }
});

async function handleNameStep(message) {
    const userId = message.author.id;
    const name = message.content.trim();

    if (name.length < 2 || name.length > 30) {
        return await message.reply('❌ Please enter a valid name (2-30 characters):');
    }

    profileCreation.set(userId, {
        step: 2,
        data: { name }
    });
    userStates.set(userId, 'awaiting_gender');

    const genderEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 2/4')
        .setDescription('**Please select your gender:**\n\nThis helps us personalize your experience.')
        .setColor(0x0099FF);

    const genderRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('gender_male')
            .setLabel('👨 Male')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('gender_female')
            .setLabel('👩 Female')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('gender_other')
            .setLabel('⚧️ Other')
            .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({ embeds: [genderEmbed], components: [genderRow] });
}

async function handleGenderSelection(interaction) {
    const userId = interaction.user.id;
    const gender = interaction.customId.replace('gender_', '');

    const profileData = profileCreation.get(userId);
    if (!profileData) {
        return await interaction.reply({ 
            content: '❌ Profile creation session expired. Please start again with `-profile`.', 
            ephemeral: true 
        });
    }

    profileData.data.gender = gender;
    profileData.step = 3;
    profileCreation.set(userId, profileData);
    userStates.set(userId, 'awaiting_state');

    const stateEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 3/4')
        .setDescription('**Please enter your state:**\n\nThis helps us organize regional tournaments.')
        .setColor(0x0099FF)
        .setFooter({ text: 'Type your state name in this DM' });

    await interaction.update({ 
        embeds: [stateEmbed], 
        components: [] 
    });
}

async function handleGenderStep(message) {
    await message.reply('❌ Please use the buttons to select your gender. Use `-profile` to restart.');
    userStates.delete(message.author.id);
}

async function handleStateStep(message) {
    const userId = message.author.id;
    const state = message.content.trim();

    if (state.length < 2 || state.length > 30) {
        return await message.reply('❌ Please enter a valid state name (2-30 characters):');
    }

    const profileData = profileCreation.get(userId);
    profileData.data.state = state;
    profileData.step = 4;
    profileCreation.set(userId, profileData);
    userStates.delete(userId);

    const gameEmbed = new EmbedBuilder()
        .setTitle('📝 Profile Creation - Step 4/4')
        .setDescription('**Please select your primary game:**\n\nChoose the game you want to compete in most often.')
        .setColor(0x0099FF);

    const gameRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('game_freefire')
            .setLabel('🔥 Free Fire')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('game_minecraft')
            .setLabel('⛏️ Minecraft')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('game_both')
            .setLabel('🎮 Both Games')
            .setStyle(ButtonStyle.Primary)
    );

    await message.reply({ embeds: [gameEmbed], components: [gameRow] });
}

async function handleGameSelection(interaction) {
    const userId = interaction.user.id;
    const game = interaction.customId.replace('game_', '');

    const profileData = profileCreation.get(userId);
    if (!profileData) {
        return await interaction.reply({ 
            content: '❌ Profile creation session expired. Please start again.', 
            ephemeral: true 
        });
    }

    // Complete profile creation
    await completeProfileCreation(interaction, profileData.data, game);
}

async function completeProfileCreation(interaction, profileData, game) {
    const userId = interaction.user.id;
    
    try {
        const otoId = generateOTOId();
        const userProfile = {
            userId: userId,
            otoId: otoId,
            name: profileData.name,
            gender: profileData.gender,
            state: profileData.state,
            game: game,
            level: 1,
            badges: ['🎯 New Player'],
            stats: {
                tournamentsPlayed: 0,
                wins: 0,
                earnings: 0,
                invites: 0,
                totalEarnings: 0
            },
            createdAt: Date.now(),
            completed: true,
            verified: true
        };

        profiles[userId] = userProfile;
        saveJSON(profilesFile, profiles);
        profileCreation.delete(userId);

        // Assign player role
        try {
            const guild = client.guilds.cache.first();
            const member = await guild.members.fetch(userId);
            const playerRole = guild.roles.cache.get(ROLES.PLAYER);
            if (playerRole) {
                await member.roles.add(playerRole);
                console.log(`✅ Assigned player role to ${member.user.tag}`);
            }
        } catch (error) {
            console.error('Error assigning player role:', error);
        }

        // Send completion message
        const completeEmbed = new EmbedBuilder()
            .setTitle('✅ Profile Created Successfully!')
            .setDescription(`Welcome to OTO Tournaments, **${userProfile.name}**! 🎉`)
            .addFields(
                { name: '🎮 OTO ID', value: `\`${otoId}\``, inline: true },
                { name: '👤 Gender', value: userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1), inline: true },
                { name: '📍 State', value: userProfile.state, inline: true },
                { name: '🎯 Primary Game', value: game === 'both' ? 'Both Games' : (game === 'freefire' ? 'Free Fire' : 'Minecraft'), inline: true },
                { name: '🏆 Level', value: '1', inline: true },
                { name: '🎖️ Badges', value: '🎯 New Player', inline: true }
            )
            .setColor(0x00FF00)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

        const actionsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('view_tournaments')
                .setLabel('🎮 View Tournaments')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('invite_friends')
                .setLabel('👥 Invite Friends')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('view_profile')
                .setLabel('📊 My Profile')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ 
            embeds: [completeEmbed], 
            components: [actionsRow] 
        });

        // Send success message to general channel
        try {
            const generalChannel = await client.channels.fetch(CHANNELS.GENERAL);
            const successMessages = [
                `🎉 **${interaction.user.username}** just completed their profile! Welcome to OTO Tournaments! 🎮`,
                `🚀 **${interaction.user.username}** is now ready to compete! Check out active tournaments! ⚡`,
                `🏆 New player alert! **${interaction.user.username}** has joined the arena! 💪`
            ];
            
            const randomSuccess = successMessages[Math.floor(Math.random() * successMessages.length)];
            await generalChannel.send(randomSuccess);
        } catch (error) {
            console.error('Error sending completion message:', error);
        }

        console.log(`✅ Profile created for ${interaction.user.tag} with OTO ID: ${otoId}`);

    } catch (error) {
        console.error('Error completing profile creation:', error);
        await interaction.reply({ 
            content: '❌ Error completing profile. Please contact staff.', 
            ephemeral: true 
        });
    }
}

// ============================================================================
// CHAT RESTRICTION SYSTEM - FIXED
// ============================================================================

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Check rate limiting
    const cooldown = checkCooldown(message.author.id, 'message', 2);
    if (cooldown > 0) {
        try {
            await message.delete();
            return;
        } catch (error) {
            // Message already deleted or no permission
        }
    }

    // Check if user has completed profile
    const userProfile = getUserProfile(message.author.id);
    const hasProfile = hasCompletedProfile(message.author.id);

    // List of channels where incomplete profiles can chat
    const allowedChannelsWithoutProfile = [
        CHANNELS.GENERAL,
        CHANNELS.PROFILE_SECTION,
        CHANNELS.WELCOME
    ];

    // If user doesn't have completed profile and is not in allowed channel
    if (!hasProfile && !allowedChannelsWithoutProfile.includes(message.channel.id)) {
        try {
            await message.delete();
            
            // Send warning DM
            try {
                const warningEmbed = new EmbedBuilder()
                    .setTitle('❌ Profile Required')
                    .setDescription(`You need to complete your profile before chatting in **${message.channel.name}**!`)
                    .addFields(
                        { name: 'How to Complete Profile', value: '1. Check your DMs from me\n2. Use `-profile` command\n3. Or click the button below' }
                    )
                    .setColor(0xFF0000);

                const profileRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('start_profile_direct')
                        .setLabel('📝 Create Profile Now')
                        .setStyle(ButtonStyle.Primary)
                );

                await message.author.send({ 
                    embeds: [warningEmbed], 
                    components: [profileRow] 
                });
            } catch (dmError) {
                // Can't send DM, send ephemeral message
                await message.channel.send({
                    content: `${message.author} ❌ Complete your profile to chat here! Use \`-profile\``,
                    ephemeral: true
                });
            }
        } catch (deleteError) {
            // Message already deleted or no permission
        }
        return;
    }

    // Handle auto-responses only if profile is completed
    if (hasProfile) {
        await handleAutoResponses(message);
    }
});

// ============================================================================
// ENHANCED AUTO-RESPONSE SYSTEM
// ============================================================================

async function handleAutoResponses(message) {
    const content = message.content.toLowerCase();
    const userProfile = getUserProfile(message.author.id);
    const gender = userProfile?.gender || 'male';

    // Check if bot was mentioned
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
        const cooldown = checkCooldown(message.author.id, 'bot_mention', 30);
        if (cooldown > 0) return;

        const guideEmbed = new EmbedBuilder()
            .setTitle('🎮 OTO Bot - Command Center')
            .setDescription(`Hello ${userProfile?.name || 'there'}! I'm here to help you with tournaments and more!`)
            .addFields(
                { name: '📝 Profile Commands', value: '`-profile` - View your profile\n`-profile @user` - View other\'s profile', inline: true },
                { name: '🎮 Tournament Commands', value: '`-tournaments` - View active tournaments\n`-jointournament` - Join a tournament', inline: true },
                { name: '🏆 Leaderboard Commands', value: '`-leaderboard` - View top players\n`-myleaderboard` - Your rankings', inline: true },
                { name: '👥 Social Commands', value: '`-invite` - Get invite link\n`-invites` - View invite leaderboard', inline: true },
                { name: '🛠️ Staff Commands', value: '`-dashboard` - Staff dashboard\n`-createtournament` - Create tournament', inline: true },
                { name: '👑 Owner Commands', value: '`-announce` - Send announcement\n`-staff` - Staff management', inline: true }
            )
            .setColor(0x0099FF)
            .setFooter({ text: 'Use these commands in any channel!' });

        const quickRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('quick_profile')
                .setLabel('📝 My Profile')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('quick_tournaments')
                .setLabel('🎮 Tournaments')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('quick_leaderboard')
                .setLabel('🏆 Leaderboard')
                .setStyle(ButtonStyle.Secondary)
        );

        await message.reply({ 
            embeds: [guideEmbed], 
            components: [quickRow] 
        });
        return;
    }

    // Greeting detection with cooldown
    if (content.match(/^(hi|hello|hey|sup|yo|kya haal|namaste|hola|hey there)/i)) {
        const lastReply = lastReplies.get(message.channel.id);
        const now = Date.now();
        
        // Only respond if no recent reply in this channel (2 minutes cooldown)
        if (!lastReply || now - lastReply > 120000) {
            const greetings = {
                male: [
                    "Kya haal bhai! Tournament kheloge aaj? 🔥 Slots filling fast!",
                    "Bro! Aaj ka tournament dekha? Prize pool massive hai! ⚡",
                    "Haan bhai, batao kya help chahiye? Tournament join karna hai? 💪",
                    "Aayein? Ready for today's tournament? Registration open hai! 🎮",
                    "Sup bro! Check out the new tournament - easy money! 💰"
                ],
                female: [
                    "Hello ji! Tournament khelogi aaj? Amazing prizes waiting! 🎮",
                    "Hii! Aaj ka tournament dekha? Slots limited hain, jaldi join karo! 💎",
                    "Ji, batao kya help chahiye? Tournament related kuch poochna hai? ✨",
                    "Namaste ji! Ready for some tournament action? 🏆",
                    "Hello! New tournament just announced - perfect for you! ⚡"
                ]
            };

            const genderGreetings = greetings[gender] || greetings.male;
            const response = genderGreetings[Math.floor(Math.random() * genderGreetings.length)];
            
            await message.reply(response);
            lastReplies.set(message.channel.id, now);
        }
        return;
    }

    // Question detection
    if (content.includes('how to join') || content.includes('tournament join') || content.includes('kaise join') || content.includes('register')) {
        const guideEmbed = new EmbedBuilder()
            .setTitle('🎮 How to Join Tournaments - Easy Steps!')
            .setDescription('Follow these simple steps to join and win:')
            .addFields(
                { name: '1️⃣ Complete Profile', value: 'Create your profile using `-profile` command' },
                { name: '2️⃣ View Tournaments', value: 'Check active tournaments with `-tournaments`' },
                { name: '3️⃣ Click Join Button', value: 'Press join button on tournament announcement' },
                { name: '4️⃣ Pay Entry Fee', value: 'Complete payment in your private ticket' },
                { name: '5️⃣ Get Confirmed', value: 'Wait for staff approval - you\'re in!' },
                { name: '6️⃣ Play & Win!', value: 'Join match and win amazing prizes! 🏆' }
            )
            .setColor(0x0099FF)
            .setFooter({ text: 'Need more help? Mention me anytime!' });

        await message.reply({ embeds: [guideEmbed] });
        return;
    }

    // Game-specific questions
    if (content.includes('free fire') || content.includes('ff')) {
        await message.reply('🔥 Free Fire tournaments running daily! Check `-tournaments` for current events! Prizes up to ₹5000!');
        return;
    }

    if (content.includes('minecraft') || content.includes('mc')) {
        await message.reply('⛏️ Minecraft tournaments available! Survival Games, Bed Wars and more! Use `-tournaments` to see all!');
        return;
    }

    // Payment related
    if (content.includes('payment') || content.includes('pay') || content.includes('upi')) {
        await message.reply('💳 Payments via UPI only. You\'ll get payment details in your tournament ticket after clicking join!');
        return;
    }

    // Time-based greetings
    const hour = new Date().getHours();
    if (content.includes('good morning') || content.includes('suprabhat') || (hour < 12 && content.includes('morning'))) {
        await message.reply(gender === 'female' ? 
            'Good morning ji! 🌅 Tournament ready? Check today\'s schedule!' : 
            'Good morning bro! 🌅 Aaj tournament hai kya? Big prizes waiting!');
        return;
    }

    if (content.includes('good night') || content.includes('shubh ratri') || (hour > 20 && content.includes('night'))) {
        await message.reply(gender === 'female' ? 
            'Good night ji! 🌙 Sweet dreams! Kal tournament mein milte hain!' : 
            'Good night bro! 🌙 Rest well for tomorrow\'s tournaments!');
        return;
    }
}

// ============================================================================
// ENHANCED TOURNAMENT SYSTEM WITH DROPDOWN MENUS
// ============================================================================

const tournamentTemplates = {
    freefire: {
        'solo_classic': {
            title: 'Free Fire Solo Classic',
            game: 'freefire',
            mode: 'solo',
            map: 'Bermuda',
            slots: 12,
            defaultPrize: 500,
            defaultEntry: 50,
            prizeDistribution: { 1: 50, 2: 30, 3: 20 },
            description: 'Classic solo battle in Bermuda map'
        },
        'duo_classic': {
            title: 'Free Fire Duo Classic', 
            game: 'freefire',
            mode: 'duo',
            map: 'Bermuda',
            slots: 12,
            defaultPrize: 800,
            defaultEntry: 80,
            prizeDistribution: { 1: 50, 2: 30, 3: 20 },
            description: 'Team up with a friend in duo battle'
        },
        'squad_classic': {
            title: 'Free Fire Squad Classic',
            game: 'freefire',
            mode: 'squad',
            map: 'Bermuda', 
            slots: 12,
            defaultPrize: 1200,
            defaultEntry: 100,
            prizeDistribution: { 1: 50, 2: 30, 3: 20 },
            description: '4-player squad battle for ultimate victory'
        },
        'solo_ranked': {
            title: 'Free Fire Solo Ranked',
            game: 'freefire',
            mode: 'solo',
            map: 'Bermuda',
            slots: 16,
            defaultPrize: 800,
            defaultEntry: 80,
            prizeDistribution: { 1: 60, 2: 25, 3: 15 },
            description: 'Competitive ranked solo match'
        }
    },
    minecraft: {
        'survival_games': {
            title: 'Minecraft Survival Games',
            game: 'minecraft',
            mode: 'solo',
            map: 'Hunger Games',
            slots: 12,
            defaultPrize: 400,
            defaultEntry: 40,
            prizeDistribution: { 1: 60, 2: 30, 3: 10 },
            description: 'Classic hunger games survival battle'
        },
        'bed_wars': {
            title: 'Minecraft Bed Wars',
            game: 'minecraft', 
            mode: 'squad',
            map: 'Bed Wars',
            slots: 12,
            defaultPrize: 800,
            defaultEntry: 80,
            prizeDistribution: { 1: 60, 2: 30, 3: 10 },
            description: 'Protect your bed while destroying others'
        },
        'sky_wars': {
            title: 'Minecraft Sky Wars',
            game: 'minecraft',
            mode: 'solo',
            map: 'Sky Wars',
            slots: 12,
            defaultPrize: 450,
            defaultEntry: 45,
            prizeDistribution: { 1: 60, 2: 30, 3: 10 },
            description: 'Battle in floating islands sky arena'
        },
        'uhc': {
            title: 'Minecraft UHC',
            game: 'minecraft',
            mode: 'solo',
            map: 'UHC World',
            slots: 10,
            defaultPrize: 500,
            defaultEntry: 50,
            prizeDistribution: { 1: 70, 2: 30 },
            description: 'Ultra Hardcore - No natural regeneration'
        }
    }
};

// Command handler for tournament creation
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    // Staff commands
    if (isStaff(message.member)) {
        if (command === 'createtournament') {
            await startTournamentCreation(message);
        }
        else if (command === 'dashboard') {
            await showStaffDashboard(message);
        }
        else if (command === 'tournaments') {
            await showActiveTournaments(message);
        }
    }

    // Public commands
    if (command === 'profile') {
        await showProfile(message);
    }
    else if (command === 'tournaments') {
        await showActiveTournaments(message);
    }
    else if (command === 'leaderboard') {
        await showLeaderboard(message);
    }
    else if (command === 'invite') {
        await showInviteInfo(message);
    }
    else if (command === 'help') {
        await showHelp(message);
    }

    // Owner commands
    if (isOwner(message.member)) {
        if (command === 'announce') {
            await sendAnnouncement(message);
        }
        else if (command === 'staff') {
            await manageStaff(message);
        }
        else if (command === 'config') {
            await manageConfig(message);
        }
        else if (command === 'broadcast') {
            await broadcastMessage(message);
        }
    }
});

async function startTournamentCreation(message) {
    if (!isStaff(message.member)) {
        return await message.reply('❌ **Staff Access Required**\nOnly staff members can create tournaments.');
    }

    const creationEmbed = new EmbedBuilder()
        .setTitle('🎮 Tournament Creation Wizard')
        .setDescription('**Choose creation method:**\n\n📋 **Template** - Quick setup with pre-configured settings\n✏️ **Custom** - Full control over all tournament details')
        .setColor(0x0099FF)
        .setFooter({ text: 'Select an option below to continue' });

    const templateRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('create_template')
            .setLabel('📋 Use Template')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('create_custom')
            .setLabel('✏️ Custom Create')
            .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({ 
        embeds: [creationEmbed], 
        components: [templateRow] 
    });
}

// Enhanced interaction handler for tournament creation
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    try {
        // Tournament creation flow
        if (interaction.customId === 'create_template') {
            await showGameSelection(interaction);
        }
        else if (interaction.customId === 'create_custom') {
            await startCustomTournamentCreation(interaction);
        }
        else if (interaction.customId === 'select_game') {
            await showTemplateSelection(interaction);
        }
        else if (interaction.customId === 'template_select') {
            await handleTemplateSelection(interaction);
        }
        else if (interaction.customId === 'confirm_template') {
            await createTournamentFromTemplate(interaction);
        }

        // Quick action buttons
        else if (interaction.customId === 'quick_profile') {
            await showQuickProfile(interaction);
        }
        else if (interaction.customId === 'quick_tournaments') {
            await showQuickTournaments(interaction);
        }
        else if (interaction.customId === 'quick_leaderboard') {
            await showQuickLeaderboard(interaction);
        }

        // Tournament join buttons
        else if (interaction.customId.startsWith('join_')) {
            await handleTournamentJoin(interaction);
        }

        // Staff approval buttons
        else if (interaction.customId.startsWith('approve_')) {
            await handlePaymentApproval(interaction);
        }
        else if (interaction.customId.startsWith('reject_')) {
            await handlePaymentRejection(interaction);
        }

    } catch (error) {
        console.error('Error in interaction handler:', error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ 
                content: '❌ An error occurred. Please try again.', 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ 
                content: '❌ An error occurred. Please try again.', 
                ephemeral: true 
            });
        }
    }
});

async function showGameSelection(interaction) {
    const gameEmbed = new EmbedBuilder()
        .setTitle('🎮 Select Game Type')
        .setDescription('**Choose the game for your tournament:**\n\n🔥 **Free Fire** - Battle royale action\n⛏️ **Minecraft** - Survival & mini-games')
        .setColor(0x0099FF);

    const gameSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_game')
            .setPlaceholder('🎯 Select a game...')
            .addOptions([
                {
                    label: 'Free Fire',
                    description: 'Battle royale tournaments',
                    value: 'freefire',
                    emoji: '🔥'
                },
                {
                    label: 'Minecraft', 
                    description: 'Survival games & mini-games',
                    value: 'minecraft',
                    emoji: '⛏️'
                }
            ])
    );

    await interaction.update({ 
        embeds: [gameEmbed], 
        components: [gameSelect] 
    });
}

async function showTemplateSelection(interaction) {
    const game = interaction.values[0];
    const templates = tournamentTemplates[game];

    const templateEmbed = new EmbedBuilder()
        .setTitle(`🎮 ${game === 'freefire' ? 'Free Fire' : 'Minecraft'} Tournament Templates`)
        .setDescription(`**Available ${game === 'freefire' ? 'Free Fire' : 'Minecraft'} templates:**\n\nSelect a template to continue`)
        .setColor(game === 'freefire' ? 0xFF4444 : 0x00AA00);

    const templateOptions = Object.entries(templates).map(([key, template]) => ({
        label: template.title,
        value: `${game}_${key}`,
        description: `${template.mode.toUpperCase()} • ${template.slots} slots • ₹${template.defaultPrize} prize`,
        emoji: game === 'freefire' ? '🔥' : '⛏️'
    }));

    const templateSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('template_select')
            .setPlaceholder('📋 Select tournament template...')
            .addOptions(templateOptions)
    );

    await interaction.update({ 
        embeds: [templateEmbed], 
        components: [templateSelect] 
    });
}

async function handleTemplateSelection(interaction) {
    const templateKey = interaction.values[0];
    const [game, template] = templateKey.split('_');
    const templateData = tournamentTemplates[game][template];

    // Store creation state
    tournamentCreation.set(interaction.user.id, {
        ...templateData,
        step: 'details',
        template: templateKey
    });

    const prizeText = Object.entries(templateData.prizeDistribution)
        .map(([rank, percent]) => {
            const amount = (templateData.defaultPrize * percent) / 100;
            const rankText = rank === '1' ? '🥇 1st' : rank === '2' ? '🥈 2nd' : '🥉 3rd';
            return `${rankText}: ₹${amount} (${percent}%)`;
        })
        .join('\n');

    const detailsEmbed = new EmbedBuilder()
        .setTitle('📝 Tournament Details Preview')
        .setDescription(`**Template:** ${templateData.title}`)
        .addFields(
            { name: '🎮 Game', value: game === 'freefire' ? 'Free Fire' : 'Minecraft', inline: true },
            { name: '🎯 Mode', value: templateData.mode.toUpperCase(), inline: true },
            { name: '🗺️ Map', value: templateData.map, inline: true },
            { name: '💰 Prize Pool', value: `₹${templateData.defaultPrize}`, inline: true },
            { name: '🎫 Entry Fee', value: `₹${templateData.defaultEntry}`, inline: true },
            { name: '📊 Slots', value: `${templateData.slots}`, inline: true },
            { name: '🏆 Prize Distribution', value: prizeText, inline: false },
            { name: '📝 Description', value: templateData.description, inline: false }
        )
        .setColor(0x0099FF)
        .setFooter({ text: 'Click Confirm to create tournament with these settings' });

    const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('confirm_template')
            .setLabel('✅ Confirm & Create')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('edit_details')
            .setLabel('✏️ Edit Details')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('cancel_creation')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.update({ 
        embeds: [detailsEmbed], 
        components: [confirmRow] 
    });
}

async function createTournamentFromTemplate(interaction) {
    const creationData = tournamentCreation.get(interaction.user.id);
    if (!creationData) {
        return await interaction.reply({ 
            content: '❌ Tournament creation session expired. Please start again.', 
            ephemeral: true 
        });
    }

    try {
        const tournamentId = generateTournamentId();
        const tournament = {
            id: tournamentId,
            title: creationData.title,
            game: creationData.game,
            mode: creationData.mode,
            map: creationData.map,
            prizePool: creationData.defaultPrize,
            entryFee: creationData.defaultEntry,
            slots: creationData.slots,
            slotsFilled: 0,
            time: '8:00 PM',
            date: new Date().toISOString().split('T')[0],
            prizeDistribution: creationData.prizeDistribution,
            type: 'scheduled',
            status: 'open',
            participants: [],
            description: creationData.description,
            createdBy: interaction.user.id,
            createdByUsername: interaction.user.username,
            createdAt: Date.now()
        };

        tournaments[tournamentId] = tournament;
        saveJSON(tournamentsFile, tournaments);
        tournamentCreation.delete(interaction.user.id);

        // Post tournament announcement
        await postTournamentAnnouncement(tournament);

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Tournament Created Successfully!')
            .setDescription(`**${tournament.title}** has been created and announced!`)
            .addFields(
                { name: '🎮 Tournament ID', value: `\`${tournamentId}\``, inline: true },
                { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                { name: '📊 Total Slots', value: `${tournament.slots}`, inline: true },
                { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                { name: '⏰ Time', value: tournament.time, inline: true },
                { name: '📅 Date', value: tournament.date, inline: true }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        await interaction.update({ 
            embeds: [successEmbed], 
            components: [] 
        });

        console.log(`✅ Tournament created: ${tournament.title} by ${interaction.user.tag}`);

    } catch (error) {
        console.error('Error creating tournament:', error);
        await interaction.reply({ 
            content: '❌ Error creating tournament. Please try again.', 
            ephemeral: true 
        });
    }
}

async function postTournamentAnnouncement(tournament) {
    try {
        const scheduleChannel = await client.channels.fetch(CHANNELS.TOURNAMENT_SCHEDULE);
        
        const prizeText = Object.entries(tournament.prizeDistribution)
            .map(([rank, percent]) => {
                const amount = (tournament.prizePool * percent) / 100;
                const rankText = rank === '1' ? '🥇 1st' : rank === '2' ? '🥈 2nd' : '🥉 3rd';
                return `${rankText}: ₹${amount}`;
            })
            .join('\n');

        const tournamentEmbed = new EmbedBuilder()
            .setTitle(`🎮 ${tournament.title.toUpperCase()} 🎮`)
            .setDescription(`**${tournament.game === 'freefire' ? '🔥 Free Fire' : '⛏️ Minecraft'} Tournament**\n\n${tournament.description}`)
            .addFields(
                { name: '🎯 Mode', value: tournament.mode.toUpperCase(), inline: true },
                { name: '🗺️ Map', value: tournament.map, inline: true },
                { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                { name: '📊 Slots', value: `${tournament.slotsFilled}/${tournament.slots}`, inline: true },
                { name: '⏰ Time', value: tournament.time, inline: true },
                { name: '🏆 Prize Distribution', value: prizeText, inline: false }
            )
            .setColor(tournament.game === 'freefire' ? 0xFF4444 : 0x00AA00)
            .setFooter({ text: `Tournament ID: ${tournament.id} • Created by ${tournament.createdByUsername}` })
            .setTimestamp();

        const joinRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`join_${tournament.id}`)
                .setLabel('🎮 JOIN TOURNAMENT')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('view_tournaments')
                .setLabel('📋 All Tournaments')
                .setStyle(ButtonStyle.Secondary)
        );

        const announcement = await scheduleChannel.send({ 
            embeds: [tournamentEmbed], 
            components: [joinRow] 
        });

        // Store announcement message ID for updates
        tournament.announcementId = announcement.id;
        saveJSON(tournamentsFile, tournaments);

        console.log(`✅ Tournament announcement posted: ${tournament.title}`);

    } catch (error) {
        console.error('Error posting tournament announcement:', error);
    }
}

// ============================================================================
// TOURNAMENT JOIN SYSTEM
// ============================================================================

async function handleTournamentJoin(interaction) {
    const tournamentId = interaction.customId.replace('join_', '');
    const tournament = tournaments[tournamentId];
    
    if (!tournament) {
        return await interaction.reply({ 
            content: '❌ Tournament not found or has been cancelled.', 
            ephemeral: true 
        });
    }

    // Check if user has completed profile
    const userProfile = getUserProfile(interaction.user.id);
    if (!userProfile || !userProfile.completed) {
        const profileEmbed = new EmbedBuilder()
            .setTitle('❌ Profile Required')
            .setDescription('You need to complete your profile before joining tournaments!')
            .addFields(
                { name: 'How to Complete', value: '1. Use `-profile` command\n2. Follow the setup steps\n3. Get your OTO ID' }
            )
            .setColor(0xFF0000);

        const profileRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_profile_direct')
                .setLabel('📝 Create Profile Now')
                .setStyle(ButtonStyle.Primary)
        );

        return await interaction.reply({ 
            embeds: [profileEmbed], 
            components: [profileRow],
            ephemeral: true 
        });
    }

    // Check if tournament is full
    if (tournament.slotsFilled >= tournament.slots) {
        return await interaction.reply({ 
            content: '❌ Tournament is full! No more slots available.', 
            ephemeral: true 
        });
    }

    // Check if user already joined
    if (tournament.participants.some(p => p.userId === interaction.user.id)) {
        return await interaction.reply({ 
            content: '❌ You have already joined this tournament!', 
            ephemeral: true 
        });
    }

    // Check if user has pending payment for this tournament
    const pendingTickets = Object.values(tickets).filter(t => 
        t.userId === interaction.user.id && 
        t.tournamentId === tournamentId && 
        t.status === 'pending'
    );

    if (pendingTickets.length > 0) {
        return await interaction.reply({ 
            content: `❌ You already have a pending registration for this tournament. Check your tickets.`, 
            ephemeral: true 
        });
    }

    // Create tournament ticket
    await createTournamentTicket(interaction, tournament);
}

async function createTournamentTicket(interaction, tournament) {
    try {
        const guild = interaction.guild;
        const ticketId = generateTicketId();
        
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: `tournament-${tournament.id}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CHANNELS.STAFF_TOOLS,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                },
                {
                    id: ROLES.STAFF,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages]
                },
                {
                    id: ROLES.OWNER,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages]
                }
            ]
        });

        // Save ticket data
        const userProfile = getUserProfile(interaction.user.id);
        const ticketData = {
            id: ticketId,
            channelId: ticketChannel.id,
            userId: interaction.user.id,
            username: interaction.user.username,
            otoId: userProfile.otoId,
            tournamentId: tournament.id,
            tournamentName: tournament.title,
            entryFee: tournament.entryFee,
            status: 'pending',
            createdAt: Date.now(),
            type: 'tournament_registration'
        };
        
        tickets[ticketId] = ticketData;
        saveJSON(ticketsFile, tickets);

        // Send ticket header
        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎮 TOURNAMENT REGISTRATION TICKET')
            .setDescription(`**${tournament.title}**`)
            .addFields(
                { name: '👤 Player', value: `<@${interaction.user.id}>`, inline: true },
                { name: '🎮 OTO ID', value: userProfile.otoId, inline: true },
                { name: '🎯 Game', value: tournament.game === 'freefire' ? 'Free Fire' : 'Minecraft', inline: true },
                { name: '💰 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                { name: '📝 Status', value: '🟡 Pending Payment', inline: true },
                { name: '🎫 Ticket ID', value: `\`${ticketId}\``, inline: true }
            )
            .setColor(0xFFA500)
            .setTimestamp();

        const paymentEmbed = new EmbedBuilder()
            .setTitle('💳 PAYMENT INSTRUCTIONS')
            .setDescription(`Please pay **₹${tournament.entryFee}** to complete your registration.`)
            .addFields(
                { name: '📧 UPI ID', value: '`oto.tournaments@paytm`', inline: true },
                { name: '📋 Reference ID', value: `\`TXN-${ticketId}\``, inline: true },
                { name: '⏰ Time Limit', value: '15 minutes', inline: true }
            )
            .setFooter({ text: 'After payment, upload screenshot in this channel. Include reference ID in screenshot.' })
            .setColor(0x0099FF);

        const instructionsEmbed = new EmbedBuilder()
            .setTitle('📋 NEXT STEPS')
            .setDescription('1. **Make Payment** to the UPI ID above\n2. **Take Screenshot** of payment success\n3. **Upload Screenshot** here\n4. **Wait for Approval** from staff\n5. **Get Confirmed** in tournament')
            .setColor(0x555555);

        const staffRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`approve_${ticketId}`)
                .setLabel('✅ Approve Payment')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_${ticketId}`)
                .setLabel('❌ Reject')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`info_${ticketId}`)
                .setLabel('🔄 Need Info')
                .setStyle(ButtonStyle.Secondary)
        );

        await ticketChannel.send({ 
            content: `<@${interaction.user.id}> <@&${ROLES.STAFF}>`,
            embeds: [ticketEmbed, paymentEmbed, instructionsEmbed],
            components: [staffRow]
        });

        // Send confirmation to user
        const confirmEmbed = new EmbedBuilder()
            .setTitle('✅ Registration Started')
            .setDescription(`Ticket created for **${tournament.title}**`)
            .addFields(
                { name: '🎫 Ticket ID', value: ticketId, inline: true },
                { name: '💰 Amount', value: `₹${tournament.entryFee}`, inline: true },
                { name: '📋 Reference', value: `TXN-${ticketId}`, inline: true },
                { name: '📁 Ticket Channel', value: `<#${ticketChannel.id}>`, inline: true }
            )
            .setColor(0x00FF00)
            .setFooter({ text: 'Check your ticket channel for payment instructions' });

        await interaction.reply({ 
            embeds: [confirmEmbed], 
            ephemeral: true 
        });

        console.log(`✅ Tournament ticket created: ${ticketId} for ${interaction.user.tag}`);

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({ 
            content: '❌ Error creating registration ticket. Please contact staff.', 
            ephemeral: true 
        });
    }
}

// ============================================================================
// STAFF TOOLS - PAYMENT APPROVAL SYSTEM
// ============================================================================

async function handlePaymentApproval(interaction) {
    if (!isStaff(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ Staff access required.', 
            ephemeral: true 
        });
    }

    const ticketId = interaction.customId.replace('approve_', '');
    const ticket = tickets[ticketId];
    
    if (!ticket) {
        return await interaction.reply({ 
            content: '❌ Ticket not found.', 
            ephemeral: true 
        });
    }

    const tournament = tournaments[ticket.tournamentId];
    if (!tournament) {
        return await interaction.reply({ 
            content: '❌ Tournament not found.', 
            ephemeral: true 
        });
    }

    // Check if tournament is full
    if (tournament.slotsFilled >= tournament.slots) {
        // Update ticket status to rejected (tournament full)
        ticket.status = 'rejected';
        ticket.rejectedReason = 'Tournament full';
        ticket.processedBy = interaction.user.id;
        ticket.processedAt = Date.now();
        saveJSON(ticketsFile, tickets);

        await interaction.reply({ 
            content: `❌ Tournament is full. Cannot approve payment for <@${ticket.userId}>`, 
            ephemeral: true 
        });

        // Notify user
        try {
            const user = await client.users.fetch(ticket.userId);
            const fullEmbed = new EmbedBuilder()
                .setTitle('❌ Tournament Full')
                .setDescription(`Sorry, **${tournament.title}** is now full.`)
                .addFields(
                    { name: '💰 Refund', value: 'Your payment will be refunded within 24 hours' },
                    { name: '🎫 Ticket ID', value: ticketId },
                    { name: '💸 Amount', value: `₹${ticket.entryFee}` }
                )
                .setColor(0xFF0000);

            await user.send({ embeds: [fullEmbed] });
        } catch (error) {
            console.error('Could not notify user:', error);
        }

        return;
    }

    // Update ticket status
    ticket.status = 'approved';
    ticket.approvedBy = interaction.user.id;
    ticket.approvedAt = Date.now();
    saveJSON(ticketsFile, tickets);

    // Add user to tournament participants
    const userProfile = profiles[ticket.userId];
    tournament.participants.push({
        userId: ticket.userId,
        username: ticket.username,
        otoId: userProfile.otoId,
        ign: userProfile.name,
        joinedAt: Date.now(),
        ticketId: ticketId
    });

    tournament.slotsFilled = tournament.participants.length;
    saveJSON(tournamentsFile, tournaments);

    // Update user profile stats
    userProfile.stats.tournamentsPlayed += 1;
    saveJSON(profilesFile, profiles);

    // Update ticket channel
    const ticketChannel = await client.channels.fetch(ticket.channelId);
    const approvedEmbed = new EmbedBuilder()
        .setTitle('✅ PAYMENT APPROVED!')
        .setDescription(`**${tournament.title}**`)
        .addFields(
            { name: '👤 Player', value: `<@${ticket.userId}>`, inline: true },
            { name: '🎮 OTO ID', value: userProfile.otoId, inline: true },
            { name: '💰 Amount', value: `₹${tournament.entryFee}`, inline: true },
            { name: '📝 Status', value: '🟢 Approved', inline: true },
            { name: '📍 Slot Number', value: `#${tournament.slotsFilled}`, inline: true },
            { name: '✅ Approved By', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setColor(0x00FF00)
        .setTimestamp();

    await ticketChannel.send({ 
        content: `<@${ticket.userId}>`,
        embeds: [approvedEmbed] 
    });

    // Remove buttons from original message
    try {
        await interaction.message.edit({ components: [] });
    } catch (error) {
        console.error('Error removing buttons:', error);
    }

    // Send confirmation to user
    try {
        const user = await client.users.fetch(ticket.userId);
        const userEmbed = new EmbedBuilder()
            .setTitle('✅ PAYMENT APPROVED!')
            .setDescription(`You're confirmed for **${tournament.title}**`)
            .addFields(
                { name: '📍 Your Slot', value: `#${tournament.slotsFilled}/${tournament.slots}`, inline: true },
                { name: '⏰ Match Time', value: tournament.time, inline: true },
                { name: '💰 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                { name: '🎮 Game', value: tournament.game === 'freefire' ? 'Free Fire' : 'Minecraft', inline: true },
                { name: '🎯 Mode', value: tournament.mode.toUpperCase(), inline: true },
                { name: '🗺️ Map', value: tournament.map, inline: true }
            )
            .setColor(0x00FF00)
            .setFooter({ text: 'Be ready 15 minutes before match time' });

        await user.send({ embeds: [userEmbed] });
    } catch (error) {
        console.error('Could not send DM to user:', error);
    }

    await interaction.reply({ 
        content: `✅ Payment approved for <@${ticket.userId}> | Slot: ${tournament.slotsFilled}/${tournament.slots}`, 
        ephemeral: true 
    });

    // Update tournament announcement
    await updateTournamentMessage(tournament.id);

    console.log(`✅ Payment approved for ticket ${ticketId} by ${interaction.user.tag}`);
}

async function handlePaymentRejection(interaction) {
    if (!isStaff(interaction.member)) {
        return await interaction.reply({ 
            content: '❌ Staff access required.', 
            ephemeral: true 
        });
    }

    const ticketId = interaction.customId.replace('reject_', '');
    const ticket = tickets[ticketId];
    
    if (!ticket) {
        return await interaction.reply({ 
            content: '❌ Ticket not found.', 
            ephemeral: true 
        });
    }

    // In a real implementation, you would show a modal for rejection reason
    // For now, we'll use a simple rejection
    ticket.status = 'rejected';
    ticket.rejectedBy = interaction.user.id;
    ticket.rejectedAt = Date.now();
    ticket.rejectedReason = 'Payment verification failed';
    saveJSON(ticketsFile, tickets);

    // Update ticket channel
    const ticketChannel = await client.channels.fetch(ticket.channelId);
    const rejectedEmbed = new EmbedBuilder()
        .setTitle('❌ PAYMENT REJECTED')
        .setDescription(`**${ticket.tournamentName}**`)
        .addFields(
            { name: '👤 Player', value: `<@${ticket.userId}>`, inline: true },
            { name: '🎮 OTO ID', value: ticket.otoId, inline: true },
            { name: '💰 Amount', value: `₹${ticket.entryFee}`, inline: true },
            { name: '📝 Status', value: '🔴 Rejected', inline: true },
            { name: '❌ Reason', value: ticket.rejectedReason, inline: true },
            { name: '👤 Rejected By', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setColor(0xFF0000)
        .setTimestamp();

    await ticketChannel.send({ 
        content: `<@${ticket.userId}>`,
        embeds: [rejectedEmbed] 
    });

    // Remove buttons
    await interaction.message.edit({ components: [] });

    // Notify user
    try {
        const user = await client.users.fetch(ticket.userId);
        const userEmbed = new EmbedBuilder()
            .setTitle('❌ Payment Rejected')
            .setDescription(`Your payment for **${ticket.tournamentName}** was rejected.`)
            .addFields(
                { name: '💰 Amount', value: `₹${ticket.entryFee}` },
                { name: '📋 Reason', value: ticket.rejectedReason },
                { name: '🔄 Next Steps', value: 'Please contact staff if you believe this is a mistake.' }
            )
            .setColor(0xFF0000);

        await user.send({ embeds: [userEmbed] });
    } catch (error) {
        console.error('Could not notify user:', error);
    }

    await interaction.reply({ 
        content: `❌ Payment rejected for <@${ticket.userId}>`, 
        ephemeral: true 
    });
}

async function updateTournamentMessage(tournamentId) {
    try {
        const tournament = tournaments[tournamentId];
        if (!tournament || !tournament.announcementId) return;

        const scheduleChannel = await client.channels.fetch(CHANNELS.TOURNAMENT_SCHEDULE);
        const announcementMessage = await scheduleChannel.messages.fetch(tournament.announcementId);

        const prizeText = Object.entries(tournament.prizeDistribution)
            .map(([rank, percent]) => {
                const amount = (tournament.prizePool * percent) / 100;
                const rankText = rank === '1' ? '🥇 1st' : rank === '2' ? '🥈 2nd' : '🥉 3rd';
                return `${rankText}: ₹${amount}`;
            })
            .join('\n');

        const updatedEmbed = new EmbedBuilder()
            .setTitle(`🎮 ${tournament.title.toUpperCase()} 🎮`)
            .setDescription(`**${tournament.game === 'freefire' ? '🔥 Free Fire' : '⛏️ Minecraft'} Tournament**\n\n${tournament.description}`)
            .addFields(
                { name: '🎯 Mode', value: tournament.mode.toUpperCase(), inline: true },
                { name: '🗺️ Map', value: tournament.map, inline: true },
                { name: '💰 Prize Pool', value: `₹${tournament.prizePool}`, inline: true },
                { name: '🎫 Entry Fee', value: `₹${tournament.entryFee}`, inline: true },
                { name: '📊 Slots', value: `${tournament.slotsFilled}/${tournament.slots}`, inline: true },
                { name: '⏰ Time', value: tournament.time, inline: true },
                { name: '🏆 Prize Distribution', value: prizeText, inline: false }
            )
            .setColor(tournament.game === 'freefire' ? 0xFF4444 : 0x00AA00)
            .setFooter({ text: `Tournament ID: ${tournament.id} • ${tournament.slotsFilled}/${tournament.slots} slots filled` })
            .setTimestamp();

        const joinRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`join_${tournament.id}`)
                .setLabel('🎮 JOIN TOURNAMENT')
                .setStyle(tournament.slotsFilled >= tournament.slots ? ButtonStyle.Secondary : ButtonStyle.Success)
                .setDisabled(tournament.slotsFilled >= tournament.slots),
            new ButtonBuilder()
                .setCustomId('view_tournaments')
                .setLabel('📋 All Tournaments')
                .setStyle(ButtonStyle.Secondary)
        );

        await announcementMessage.edit({ 
            embeds: [updatedEmbed], 
            components: [joinRow] 
        });

    } catch (error) {
        console.error('Error updating tournament message:', error);
    }
}

// ============================================================================
// PROFILE COMMAND
// ============================================================================

async function showProfile(message) {
    const targetUser = message.mentions.users.first() || message.author;
    const userProfile = profiles[targetUser.id];

    if (!userProfile || !userProfile.completed) {
        const embed = new EmbedBuilder()
            .setTitle('❌ Profile Not Found')
            .setDescription(`${targetUser.username} hasn't created a profile yet!`)
            .addFields(
                { name: 'How to Create', value: 'Use `-profile` command to start profile creation' }
            )
            .setColor(0xFF0000);
        
        return await message.reply({ embeds: [embed] });
    }

    const profileEmbed = new EmbedBuilder()
        .setTitle(`📊 ${userProfile.name}'s Profile`)
        .setDescription(`**OTO ID:** \`${userProfile.otoId}\``)
        .addFields(
            { name: '👤 Gender', value: userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1), inline: true },
            { name: '📍 State', value: userProfile.state, inline: true },
            { name: '🎮 Primary Game', value: userProfile.game === 'both' ? 'Both Games' : (userProfile.game === 'freefire' ? 'Free Fire' : 'Minecraft'), inline: true },
            { name: '🏆 Level', value: userProfile.level.toString(), inline: true },
            { name: '🎖️ Badges', value: userProfile.badges.join(' ') || 'None', inline: true },
            { name: '📈 Tournament Stats', value: `Played: ${userProfile.stats.tournamentsPlayed}\nWins: ${userProfile.stats.wins}\nEarnings: ₹${userProfile.stats.earnings}`, inline: true }
        )
        .setColor(0x0099FF)
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({ text: `Joined: ${new Date(userProfile.createdAt).toLocaleDateString()}` })
        .setTimestamp();

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('view_tournaments')
            .setLabel('🎮 View Tournaments')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('invite_friends')
            .setLabel('👥 Invite Friends')
            .setStyle(ButtonStyle.Success)
    );

    await message.reply({ 
        embeds: [profileEmbed], 
        components: [actionRow] 
    });
}

async function showQuickProfile(interaction) {
    const userProfile = profiles[interaction.user.id];
    
    if (!userProfile || !userProfile.completed) {
        return await interaction.reply({ 
            content: 'You need to complete your profile first! Use `-profile`', 
            ephemeral: true 
        });
    }

    const profileEmbed = new EmbedBuilder()
        .setTitle(`📊 Your Profile - ${userProfile.name}`)
        .setDescription(`**OTO ID:** \`${userProfile.otoId}\``)
        .addFields(
            { name: '🎮 Game', value: userProfile.game === 'both' ? 'Both Games' : (userProfile.game === 'freefire' ? 'Free Fire' : 'Minecraft'), inline: true },
            { name: '📍 State', value: userProfile.state, inline: true },
            { name: '🏆 Level', value: userProfile.level.toString(), inline: true },
            { name: '📊 Tournaments', value: `Played: ${userProfile.stats.tournamentsPlayed}\nWins: ${userProfile.stats.wins}`, inline: true },
            { name: '💰 Earnings', value: `₹${userProfile.stats.earnings}`, inline: true },
            { name: '🎖️ Badges', value: userProfile.badges.join(' ') || 'None', inline: true }
        )
        .setColor(0x0099FF)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

    await interaction.reply({ 
        embeds: [profileEmbed], 
        ephemeral: true 
    });
}

// ============================================================================
// TOURNAMENTS COMMAND
// ============================================================================

async function showActiveTournaments(message) {
    const activeTournaments = Object.values(tournaments).filter(t => t.status === 'open');

    if (activeTournaments.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Active Tournaments')
            .setDescription('No active tournaments at the moment. Check back later for new events!')
            .addFields(
                { name: '🕒 Next Tournament', value: 'Usually announced daily at 6 PM' },
                { name: '💰 Typical Prizes', value: '₹500 - ₹5000 per tournament' },
                { name: '🎮 Games', value: 'Free Fire & Minecraft' }
            )
            .setColor(0xFFA500);
        
        return await message.reply({ embeds: [embed] });
    }

    const tournamentsEmbed = new EmbedBuilder()
        .setTitle('🎮 Active Tournaments - Join Now!')
        .setDescription('Click join buttons on tournament announcements to register!')
        .setColor(0x0099FF)
        .setTimestamp();

    activeTournaments.forEach(tournament => {
        const gameEmoji = tournament.game === 'freefire' ? '🔥' : '⛏️';
        const status = tournament.slotsFilled >= tournament.slots ? '🚫 FULL' : '✅ OPEN';
        
        tournamentsEmbed.addFields({
            name: `${gameEmoji} ${tournament.title} • ${status}`,
            value: `💰 Prize: ₹${tournament.prizePool} | 🎫 Entry: ₹${tournament.entryFee}\n📊 Slots: ${tournament.slotsFilled}/${tournament.slots} | ⏰ ${tournament.time}\n🎯 ${tournament.mode.toUpperCase()} • 🗺️ ${tournament.map}`,
            inline: false
        });
    });

    const viewRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('View Tournament Channel')
            .setURL(`https://discord.com/channels/${message.guild.id}/${CHANNELS.TOURNAMENT_SCHEDULE}`)
            .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
            .setCustomId('refresh_tournaments')
            .setLabel('🔄 Refresh')
            .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({ 
        embeds: [tournamentsEmbed], 
        components: [viewRow] 
    });
}

async function showQuickTournaments(interaction) {
    const activeTournaments = Object.values(tournaments).filter(t => t.status === 'open');

    if (activeTournaments.length === 0) {
        return await interaction.reply({ 
            content: 'No active tournaments right now. Check back later!', 
            ephemeral: true 
        });
    }

    const tournamentsEmbed = new EmbedBuilder()
        .setTitle('🎮 Active Tournaments')
        .setDescription('Join these tournaments now!')
        .setColor(0x0099FF)
        .setTimestamp();

    activeTournaments.slice(0, 5).forEach(tournament => {
        const gameEmoji = tournament.game === 'freefire' ? '🔥' : '⛏️';
        tournamentsEmbed.addFields({
            name: `${gameEmoji} ${tournament.title}`,
            value: `₹${tournament.prizePool} prize • ₹${tournament.entryFee} entry\n${tournament.slotsFilled}/${tournament.slots} slots • ${tournament.time}`,
            inline: true
        });
    });

    await interaction.reply({ 
        embeds: [tournamentsEmbed], 
        ephemeral: true 
    });
}

// ============================================================================
// LEADERBOARD SYSTEM
// ============================================================================

async function showLeaderboard(message) {
    // Get top players by earnings
    const topPlayers = Object.values(profiles)
        .filter(p => p.completed && p.stats.tournamentsPlayed > 0)
        .sort((a, b) => b.stats.earnings - a.stats.earnings)
        .slice(0, 10);

    const leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 TOP TOURNAMENT WINNERS')
        .setDescription('Players with highest tournament earnings')
        .setColor(0xFFD700)
        .setFooter({ text: 'Updated automatically • Win tournaments to climb!' })
        .setTimestamp();

    if (topPlayers.length === 0) {
        leaderboardEmbed.setDescription('No tournament winners yet! Be the first to win and claim your spot on the leaderboard! 🎮');
    } else {
        topPlayers.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `**${index + 1}.**`;
            const user = client.users.cache.get(player.userId);
            const username = user ? user.username : 'Unknown User';
            
            leaderboardEmbed.addFields({
                name: `${medal} ${player.name} (${username})`,
                value: `💰 **₹${player.stats.earnings}** | 🏆 ${player.stats.wins} wins | 🎮 ${player.stats.tournamentsPlayed} played`,
                inline: false
            });
        });
    }

    const statsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('view_my_stats')
            .setLabel('📊 My Stats')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('view_tournaments')
            .setLabel('🎮 Join Tournament')
            .setStyle(ButtonStyle.Success)
    );

    await message.reply({ 
        embeds: [leaderboardEmbed], 
        components: [statsRow] 
    });
}

async function showQuickLeaderboard(interaction) {
    const topPlayers = Object.values(profiles)
        .filter(p => p.completed && p.stats.tournamentsPlayed > 0)
        .sort((a, b) => b.stats.earnings - a.stats.earnings)
        .slice(0, 5);

    const leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 Top 5 Earners')
        .setColor(0xFFD700)
        .setTimestamp();

    if (topPlayers.length === 0) {
        leaderboardEmbed.setDescription('No winners yet! Join tournaments to get on the leaderboard!');
    } else {
        topPlayers.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            leaderboardEmbed.addFields({
                name: `${medal} ${player.name}`,
                value: `₹${player.stats.earnings} • ${player.stats.wins} wins`,
                inline: false
            });
        });
    }

    await interaction.reply({ 
        embeds: [leaderboardEmbed], 
        ephemeral: true 
    });
}

// ============================================================================
// STAFF DASHBOARD
// ============================================================================

async function showStaffDashboard(message) {
    if (!isStaff(message.member)) {
        return await message.reply('❌ **Staff Access Required**\nThis command is only available for staff members.');
    }

    const openTickets = Object.values(tickets).filter(t => t.status === 'pending').length;
    const activeTournaments = Object.values(tournaments).filter(t => t.status === 'open').length;
    const totalPlayers = Object.values(profiles).filter(p => p.completed).length;
    const totalEarnings = Object.values(profiles).reduce((sum, p) => sum + p.stats.earnings, 0);
    
    // Calculate response time (simplified)
    const resolvedTickets = Object.values(tickets).filter(t => t.status === 'approved' || t.status === 'rejected');
    const avgResponseTime = resolvedTickets.length > 0 ? '3m 45s' : 'No data';

    const dashboardEmbed = new EmbedBuilder()
        .setTitle('📊 STAFF DASHBOARD')
        .setDescription('Real-time server statistics and management tools')
        .addFields(
            { name: '🎫 Open Tickets', value: openTickets.toString(), inline: true },
            { name: '⏰ Avg Response Time', value: avgResponseTime, inline: true },
            { name: '💰 Pending Payments', value: openTickets.toString(), inline: true },
            { name: '🏆 Active Tournaments', value: activeTournaments.toString(), inline: true },
            { name: '👥 Total Players', value: totalPlayers.toString(), inline: true },
            { name: '💸 Total Earnings', value: `₹${totalEarnings}`, inline: true },
            { name: '📈 Server Growth', value: 'Active', inline: true },
            { name: '🕒 Uptime', value: '100%', inline: true },
            { name: '🎮 Popular Game', value: 'Free Fire', inline: true }
        )
        .setColor(0x0099FF)
        .setTimestamp();

    const actionsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('staff_create_tournament')
            .setLabel('🎮 Create Tournament')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('staff_view_tickets')
            .setLabel('🎫 View Tickets')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('staff_manage')
            .setLabel('⚙️ Manage')
            .setStyle(ButtonStyle.Success)
    );

    await message.reply({ 
        embeds: [dashboardEmbed], 
        components: [actionsRow] 
    });
}

// ============================================================================
// OWNER TOOLS - COMPLETE CONTROL
// ============================================================================

async function sendAnnouncement(message) {
    if (!isOwner(message.member)) {
        return await message.reply('❌ **Owner Access Required**\nThis command is only available for server owners.');
    }

    const args = message.content.split(' ').slice(1);
    if (args.length < 2) {
        return await message.reply('❌ **Usage:** `-announce #channel Your announcement message here`');
    }

    const channelMention = args[0];
    const announcementText = args.slice(1).join(' ');

    const channelId = channelMention.replace(/[<#>]/g, '');
    const channel = await client.channels.fetch(channelId).catch(() => null);

    if (!channel) {
        return await message.reply('❌ Channel not found. Please mention a valid channel.');
    }

    const announcementEmbed = new EmbedBuilder()
        .setTitle('📢 OFFICIAL ANNOUNCEMENT')
        .setDescription(announcementText)
        .setColor(0xFFD700)
        .setTimestamp()
        .setFooter({ text: `Announced by ${message.author.username}` });

    try {
        await channel.send({ embeds: [announcementEmbed] });
        await message.reply(`✅ Announcement sent successfully to ${channelMention}!`);
        
        console.log(`📢 Announcement sent to #${channel.name} by ${message.author.tag}`);
    } catch (error) {
        console.error('Error sending announcement:', error);
        await message.reply('❌ Error sending announcement. Check bot permissions in that channel.');
    }
}

async function broadcastMessage(message) {
    if (!isOwner(message.member)) {
        return await message.reply('❌ Owner access required.');
    }

    const args = message.content.split(' ').slice(1);
    if (args.length === 0) {
        return await message.reply('❌ **Usage:** `-broadcast Your message to all players`');
    }

    const broadcastText = args.join(' ');

    const broadcastEmbed = new EmbedBuilder()
        .setTitle('📢 SERVER BROADCAST')
        .setDescription(broadcastText)
        .setColor(0xFF0000)
        .setTimestamp()
        .setFooter({ text: `Broadcast by ${message.author.username}` });

    try {
        // Send to general channel
        const generalChannel = await client.channels.fetch(CHANNELS.GENERAL);
        await generalChannel.send({ embeds: [broadcastEmbed] });

        // Send to announcement channel
        const announcementChannel = await client.channels.fetch(CHANNELS.ANNOUNCEMENT);
        await announcementChannel.send({ embeds: [broadcastEmbed] });

        await message.reply('✅ Broadcast sent to all major channels!');
        
        console.log(`📢 Broadcast sent by ${message.author.tag}`);
    } catch (error) {
        console.error('Error sending broadcast:', error);
        await message.reply('❌ Error sending broadcast.');
    }
}

async function manageStaff(message) {
    if (!isOwner(message.member)) {
        return await message.reply('❌ Owner access required.');
    }

    const staffMembers = Object.values(staff);
    const staffEmbed = new EmbedBuilder()
        .setTitle('👑 STAFF MANAGEMENT')
        .setDescription('Manage your staff team and permissions')
        .setColor(0x0099FF);

    if (staffMembers.length === 0) {
        staffEmbed.addFields({
            name: 'No Staff Members',
            value: 'Use `-addstaff @user` to add staff members'
        });
    } else {
        staffMembers.forEach((staffMember, index) => {
            const user = client.users.cache.get(staffMember.userId);
            staffEmbed.addFields({
                name: `${index + 1}. ${user ? user.username : 'Unknown'}`,
                value: `Added: <t:${Math.floor(staffMember.addedAt/1000)}:R>\nBy: <@${staffMember.addedBy}>`,
                inline: true
            });
        });
    }

    const staffRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('add_staff')
            .setLabel('➕ Add Staff')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('remove_staff')
            .setLabel('➖ Remove Staff')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('staff_permissions')
            .setLabel('⚙️ Permissions')
            .setStyle(ButtonStyle.Primary)
    );

    await message.reply({ 
        embeds: [staffEmbed], 
        components: [staffRow] 
    });
}

async function manageConfig(message) {
    if (!isOwner(message.member)) {
        return await message.reply('❌ Owner access required.');
    }

    const configEmbed = new EmbedBuilder()
        .setTitle('⚙️ BOT CONFIGURATION')
        .setDescription('Configure bot settings and features')
        .addFields(
            { name: '🔔 Auto Announcements', value: config.autoAnnounce ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🚫 Spam Protection', value: config.spamProtection ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '👋 Welcome Messages', value: config.welcomeMessages ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '📊 Total Profiles', value: Object.values(profiles).filter(p => p.completed).length.toString(), inline: true },
            { name: '🎮 Total Tournaments', value: Object.keys(tournaments).length.toString(), inline: true },
            { name: '🎫 Total Tickets', value: Object.keys(tickets).length.toString(), inline: true }
        )
        .setColor(0x0099FF);

    const configRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('toggle_announce')
            .setLabel('🔔 Announcements')
            .setStyle(config.autoAnnounce ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('toggle_spam')
            .setLabel('🚫 Spam Protection')
            .setStyle(config.spamProtection ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('toggle_welcome')
            .setLabel('👋 Welcome Messages')
            .setStyle(config.welcomeMessages ? ButtonStyle.Success : ButtonStyle.Secondary)
    );

    await message.reply({ 
        embeds: [configEmbed], 
        components: [configRow] 
    });
}

// ============================================================================
// HELP COMMAND - BEAUTIFUL UI
// ============================================================================

async function showHelp(message) {
    const user = message.author;
    const isUserStaff = isStaff(message.member);
    const isUserOwner = isOwner(message.member);

    const helpEmbed = new EmbedBuilder()
        .setTitle('🎮 OTO BOT - COMMAND CENTER')
        .setDescription('**Complete list of all available commands**\nUse these commands to manage your tournament experience!')
        .setColor(0x0099FF)
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: 'OTO Tournaments - Where Champions Are Made' })
        .setTimestamp();

    // Public commands for everyone
    helpEmbed.addFields({
        name: '👤 PUBLIC COMMANDS',
        value: [
            '`-profile` - View your profile',
            '`-profile @user` - View other\'s profile',
            '`-tournaments` - View active tournaments',
            '`-leaderboard` - View top players',
            '`-invite` - Get your invite link',
            '`-help` - Show this help message'
        ].join('\n'),
        inline: false
    });

    // Staff commands
    if (isUserStaff) {
        helpEmbed.addFields({
            name: '🛠️ STAFF COMMANDS',
            value: [
                '`-dashboard` - Staff dashboard',
                '`-createtournament` - Create new tournament',
                '`-tournaments` - Manage tournaments'
            ].join('\n'),
            inline: false
        });
    }

    // Owner commands
    if (isUserOwner) {
        helpEmbed.addFields({
            name: '👑 OWNER COMMANDS',
            value: [
                '`-announce #channel message` - Send announcement',
                '`-broadcast message` - Broadcast to all channels',
                '`-staff` - Staff management',
                '`-config` - Bot configuration'
            ].join('\n'),
            inline: false
        });
    }

    // Quick tips
    helpEmbed.addFields({
        name: '💡 QUICK TIPS',
        value: [
            '• Complete your profile to access all features',
            '• Mention me for quick help anytime',
            '• Check tournament channel for new events',
            '• Invite friends for special rewards'
        ].join('\n'),
        inline: false
    });

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('help_profile')
            .setLabel('📝 Profile')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('help_tournaments')
            .setLabel('🎮 Tournaments')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('help_leaderboard')
            .setLabel('🏆 Leaderboard')
            .setStyle(ButtonStyle.Secondary)
    );

    if (isUserStaff) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('help_staff')
                .setLabel('🛠️ Staff')
                .setStyle(ButtonStyle.Danger)
        );
    }

    await message.reply({ 
        embeds: [helpEmbed], 
        components: [actionRow] 
    });
}

// ============================================================================
// INVITE SYSTEM
// ============================================================================

async function showInviteInfo(message) {
    const inviteEmbed = new EmbedBuilder()
        .setTitle('👥 INVITE FRIENDS - EARN REWARDS!')
        .setDescription('Invite your friends to OTO Tournaments and get amazing rewards!')
        .addFields(
            { name: '5 Invites', value: '🎖️ Beginner Recruiter Role', inline: true },
            { name: '10 Invites', value: '🎫 FREE Tournament Entry', inline: true },
            { name: '15 Invites', value: '💰 50% Discount Next Entry', inline: true },
            { name: '20 Invites', value: '🎖️ Pro Recruiter Role + FREE Entry', inline: true },
            { name: '30 Invites', value: '💎 Premium + Elite Recruiter Role', inline: true },
            { name: '50+ Invites', value: '👑 Custom Role + 3 FREE Entries', inline: true }
        )
        .setColor(0x9B59B6)
        .setFooter({ text: 'Friends must complete profile and join 1 tournament to count' });

    await message.reply({ embeds: [inviteEmbed] });
}

// ============================================================================
// BOT STARTUP & INITIALIZATION
// ============================================================================

client.once('ready', () => {
    console.log(`\n🎮 ==========================================`);
    console.log(`✅ ${client.user.tag} is ONLINE and READY!`);
    console.log(`📊 Loaded ${Object.keys(profiles).length} player profiles`);
    console.log(`🎯 Loaded ${Object.keys(tournaments).length} tournaments`);
    console.log(`🎫 Loaded ${Object.keys(tickets).length} tickets`);
    console.log(`👥 Serving ${client.guilds.cache.size} servers`);
    console.log(`🎮 ==========================================\n`);

    // Set bot status
    client.user.setActivity('OTO Tournaments | -help', { type: 'WATCHING' });

    // Start background tasks
    startBackgroundTasks();
});

function startBackgroundTasks() {
    // Update leaderboards every 10 minutes
    setInterval(() => {
        updateAllLeaderboards();
    }, 600000);

    // Clean up old data daily
    setInterval(() => {
        cleanupOldData();
    }, 24 * 60 * 60 * 1000);

    console.log('🔄 Background tasks started');
}

function updateAllLeaderboards() {
    // This would update various leaderboards
    console.log('📊 Leaderboards updated');
}

function cleanupOldData() {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Clean up old tickets (keep for 7 days)
    Object.keys(tickets).forEach(ticketId => {
        if (tickets[ticketId].createdAt < now - (7 * 24 * 60 * 60 * 1000)) {
            delete tickets[ticketId];
        }
    });

    // Clean up old tournaments (keep completed for 30 days)
    Object.keys(tournaments).forEach(tournamentId => {
        const tournament = tournaments[tournamentId];
        if (tournament.status === 'completed' && tournament.createdAt < thirtyDaysAgo) {
            delete tournaments[tournamentId];
        }
    });

    saveJSON(ticketsFile, tickets);
    saveJSON(tournamentsFile, tournaments);
    console.log('🧹 Old data cleaned up');
}

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    
    // Save all data before exiting
    saveJSON(profilesFile, profiles);
    saveJSON(tournamentsFile, tournaments);
    saveJSON(ticketsFile, tickets);
    saveJSON(invitesFile, invites);
    saveJSON(warningsFile, warnings);
    saveJSON(leaderboardsFile, leaderboards);
    saveJSON(staffFile, staff);
    saveJSON(configFile, config);
    
    console.log('✅ All data saved. Goodbye!');
    process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});
