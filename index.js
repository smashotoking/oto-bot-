const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, ButtonStyle, TextInputStyle, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages
    ]
});

// Configuration
const CHANNELS = {
    ANNOUNCEMENT: '1438484746165555243',
    TOURNAMENT_SCHEDULE: '1438482561679626303',
    HOW_TO_JOIN: '1438482512296022017',
    RULES: '1438482342145687643',
    BOT_COMMANDS: '1438483009950191676',
    GENERAL: '1438482904018849835',
    OPEN_TICKET: '1438485759891079180',
    MATCH_REPORTS: '1438486113047150714',
    LEADERBOARD: '1438947356690223347',
    STAFF_TOOLS: '1438486059255336970',
    STAFF_CHAT: '1438486059255336970',
    PAYMENT_PROOF: '1438486113047150714',
    INVITE_TRACKER: '1439216884774998107',
    MINECRAFT_CHANNEL: '1439223955960627421',
    PROFILE_CHANNEL: '1439226024863993988'
};

const ROLES = {
    STAFF: '1438475461977047112',
    ADMIN: '1438475461977047112',
    PLAYER: 'PLAYER_ROLE_ID', // Add your player role ID
    FOUNDER: 'FOUNDER_ROLE_ID' // Add your founder role ID
};

// Data Storage
let userProfiles = {};
let tournaments = {};
let invitesData = {};
let userMessages = {};
let guildInvites = new Map();

const BAD_WORDS = ['dm', 'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'madarchod', 'bhenchod', 'chutiya'];

// Greeting Messages
const GREETING_MESSAGES = [
    "Apna bhai aa gaya! 🔥 Machayenge!",
    "Welcome bro! Tournament mein aag lagane aaye ho? 💪",
    "Swagat hai boss! Aaj khelne ka mood hai? 🎮",
    "Bhai sahab aagaye! Tournament join karo aur jito! 🏆",
    "Welcome champion! Apna game dikhane ka time! ⚡",
    "Arre bhai! Kaisa hai? Tournament dekha? 🔥",
    "Welcome boss! Aaj jeetne ka plan hai? 💰",
    "Bro aagaye! Chaliye tournament mein dhamaal karte hai! 🎯",
    "Kya scene hai bhai! Gaming time! 🎮",
    "Welcome warrior! Ready to dominate? 👑"
];

const AUTO_RESPONSES = [
    "Hi bro! Tournament check karna? Aaj kheloge? 🎮",
    "Kya haal bhai! Custom challenge karoge? 💪",
    "Hello! Tournament join karo, maza aayega! 🔥",
    "Bro, aaj ka tournament dekha? Slot book kar lo! ⚡",
    "Hi! Khelne ka mood hai? Tournament chal raha hai! 🏆",
    "Hey! Tournament schedule check karo, bahut saare matches hai! 🎯",
    "Bhai! Aaj entry fee kam hai, jaldi join karo! 💰",
    "Kya haal! Squad ready hai kya? Tournament join karo! 👥",
    "Hello bro! Free Fire ya Minecraft, kya kheloge aaj? 🎮",
    "Hi! Tournament mein slot kam hai, jaldi book karo! ⏰"
];

const STAFF_WELCOME = [
    "Welcome to the team! Tumhe hardwork karna hai, lekin maza bhi aayega! 💪",
    "Congratulations! Ab tum staff member ho. Apna best do! 🌟",
    "Welcome aboard! Players ki help karna aur tournaments manage karna hai! 🎮",
    "Great to have you! Staff ke rules follow karo aur enjoy karo! ⚡",
    "Welcome! Tumhara kaam players ko best experience dena hai! 🏆",
    "Badhai ho! Ab tum team ka part ho. Mehnat karo aur grow karo! 🚀",
    "Welcome bro! Staff ban gaye, ab responsibility sambhalo! 💼",
    "Great! Ab tournaments smoothly chalane mein help karo! 🎯",
    "Congratulations! Players ki problems solve karna tumhara kaam! 🛠️",
    "Welcome! Ab tum OTO family ka important part ho! 👨‍👩‍👧‍👦"
];

// Load data from files
function loadData() {
    try {
        if (fs.existsSync('userProfiles.json')) {
            userProfiles = JSON.parse(fs.readFileSync('userProfiles.json', 'utf8'));
        }
        if (fs.existsSync('tournaments.json')) {
            tournaments = JSON.parse(fs.readFileSync('tournaments.json', 'utf8'));
        }
        if (fs.existsSync('invitesData.json')) {
            invitesData = JSON.parse(fs.readFileSync('invitesData.json', 'utf8'));
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to files
function saveData() {
    try {
        fs.writeFileSync('userProfiles.json', JSON.stringify(userProfiles, null, 2));
        fs.writeFileSync('tournaments.json', JSON.stringify(tournaments, null, 2));
        fs.writeFileSync('invitesData.json', JSON.stringify(invitesData, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Generate OTO ID
function generateOTOId() {
    return 'OTO' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Create Profile Setup Components
function createProfileSetup() {
    const genderSelect = new StringSelectMenuBuilder()
        .setCustomId('profile_gender')
        .setPlaceholder('Select Your Gender')
        .addOptions([
            { label: 'Male', value: 'male', emoji: '👨' },
            { label: 'Female', value: 'female', emoji: '👩' },
            { label: 'Other', value: 'other', emoji: '🧑' }
        ]);

    const gameSelect = new StringSelectMenuBuilder()
        .setCustomId('profile_game')
        .setPlaceholder('Select Your Main Game')
        .addOptions([
            { label: 'Free Fire', value: 'freefire', emoji: '🔥' },
            { label: 'Minecraft', value: 'minecraft', emoji: '⛏️' },
            { label: 'Both', value: 'both', emoji: '🎮' }
        ]);

    return {
        genderRow: new ActionRowBuilder().addComponents(genderSelect),
        gameRow: new ActionRowBuilder().addComponents(gameSelect)
    };
}

// Create Profile Modal
function createProfileModal() {
    const modal = new ModalBuilder()
        .setCustomId('profile_modal')
        .setTitle('Complete Your Profile');

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
        .setPlaceholder('Enter your state')
        .setRequired(true)
        .setMaxLength(50);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(stateInput)
    );

    return modal;
}

// Create Tournament Creation Components
function createTournamentComponents() {
    const gameSelect = new StringSelectMenuBuilder()
        .setCustomId('tournament_game')
        .setPlaceholder('Select Game Type')
        .addOptions([
            { label: 'Free Fire', value: 'freefire', emoji: '🔥' },
            { label: 'Minecraft', value: 'minecraft', emoji: '⛏️' }
        ]);

    const typeSelect = new StringSelectMenuBuilder()
        .setCustomId('tournament_type')
        .setPlaceholder('Select Match Type')
        .addOptions([
            { label: 'Solo', value: 'solo', emoji: '👤' },
            { label: 'Duo', value: 'duo', emoji: '👥' },
            { label: 'Squad', value: 'squad', emoji: '👨‍👩‍👧‍👦' },
            { label: '1v1', value: '1v1', emoji: '⚔️' },
            { label: 'Custom', value: 'custom', emoji: '⚙️' }
        ]);

    return {
        gameRow: new ActionRowBuilder().addComponents(gameSelect),
        typeRow: new ActionRowBuilder().addComponents(typeSelect)
    };
}

// Create Tournament Modal
function createTournamentModal() {
    const modal = new ModalBuilder()
        .setCustomId('tournament_modal')
        .setTitle('Create Tournament');

    const titleInput = new TextInputBuilder()
        .setCustomId('tournament_title')
        .setLabel('Tournament Title')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const prizeInput = new TextInputBuilder()
        .setCustomId('tournament_prize')
        .setLabel('Prize Pool')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., ₹5000')
        .setRequired(true);

    const slotsInput = new TextInputBuilder()
        .setCustomId('tournament_slots')
        .setLabel('Total Slots')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., 100')
        .setRequired(true);

    const entryFeeInput = new TextInputBuilder()
        .setCustomId('tournament_entry')
        .setLabel('Entry Fee')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g., ₹50')
        .setRequired(true);

    const descInput = new TextInputBuilder()
        .setCustomId('tournament_desc')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(prizeInput),
        new ActionRowBuilder().addComponents(slotsInput),
        new ActionRowBuilder().addComponents(entryFeeInput),
        new ActionRowBuilder().addComponents(descInput)
    );

    return modal;
}

// Create Join Button
function createJoinButton(tournamentId) {
    const button = new ButtonBuilder()
        .setCustomId(`join_tournament_${tournamentId}`)
        .setLabel('Join Tournament')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎮');

    return new ActionRowBuilder().addComponents(button);
}

// Create Ticket Control Buttons
function createTicketButtons(tournamentId) {
    const confirmButton = new ButtonBuilder()
        .setCustomId(`confirm_entry_${tournamentId}`)
        .setLabel('Confirm Entry')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

    const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');

    return new ActionRowBuilder().addComponents(confirmButton, closeButton);
}

// Bot Ready Event
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    loadData();

    // Cache invites
    client.guilds.cache.forEach(async guild => {
        const invites = await guild.invites.fetch();
        guildInvites.set(guild.id, new Map(invites.map(invite => [invite.code, invite.uses])));
    });

    // Auto-response check every 2 minutes
    setInterval(checkInactiveMessages, 120000);

    // Spam tournament announcements
    setInterval(spamTournamentAnnouncement, 120000);
});

// Member Join Event
client.on('guildMemberAdd', async member => {
    try {
        // Send profile setup in DM
        const embed = new EmbedBuilder()
            .setTitle('🎮 Welcome to OTO Tournament!')
            .setDescription('Complete your profile to unlock all channels and features!')
            .setColor('#0099ff')
            .addFields(
                { name: '📝 Step 1', value: 'Select your gender', inline: false },
                { name: '🎮 Step 2', value: 'Select your main game', inline: false },
                { name: '✍️ Step 3', value: 'Fill in your details', inline: false }
            );

        const { genderRow, gameRow } = createProfileSetup();

        await member.send({ embeds: [embed], components: [genderRow, gameRow] }).catch(console.error);

        // Track invites
        const cachedInvites = guildInvites.get(member.guild.id);
        const newInvites = await member.guild.invites.fetch();

        const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code) < inv.uses);

        if (usedInvite) {
            const inviter = usedInvite.inviter;

            if (!invitesData[inviter.id]) {
                invitesData[inviter.id] = { count: 0, users: [] };
            }

            invitesData[inviter.id].count++;
            invitesData[inviter.id].users.push(member.id);
            saveData();

            // Update cache
            guildInvites.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));

            // Notify in invite tracker
            const inviteChannel = member.guild.channels.cache.get(CHANNELS.INVITE_TRACKER);
            if (inviteChannel) {
                await inviteChannel.send(
                    `✅ ${member} was invited by ${inviter}\n` +
                    `📊 Total invites: **${invitesData[inviter.id].count}**`
                );
            }

            // Check for rewards
            const inviteCount = invitesData[inviter.id].count;
            if (inviteCount === 10) {
                const button = new ButtonBuilder()
                    .setCustomId('book_free_tournament')
                    .setLabel('Book Your Free Entry')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎁');

                const row = new ActionRowBuilder().addComponents(button);

                await inviter.send({
                    content: '🎉 **Congratulations!** You\'ve completed 10 invites!\n' +
                             '🎁 You\'ve unlocked a **FREE tournament entry!**\n' +
                             'Click the button below to book your slot!',
                    components: [row]
                }).catch(console.error);
            } else if (inviteCount === 20) {
                await inviter.send('🎉 **20 invites!** Another free tournament entry unlocked! 🔥').catch(console.error);
            } else if (inviteCount === 30) {
                await inviter.send('🏆 **30 invites!** You\'re now a legend! Check the leaderboard! 👑').catch(console.error);
            }
        }
    } catch (error) {
        console.error('Error in guildMemberAdd:', error);
    }
});

// Message Event
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    try {
        // Bad word filter
        const contentLower = message.content.toLowerCase();
        for (const word of BAD_WORDS) {
            if (contentLower.includes(word)) {
                await message.delete().catch(console.error);
                await message.member.timeout(5 * 60 * 1000, 'Bad language').catch(console.error);
                const warnMsg = await message.channel.send(
                    `⚠️ ${message.author} has been warned and timed out for using inappropriate language!`
                );
                setTimeout(() => warnMsg.delete().catch(console.error), 5000);
                return;
            }
        }

        // Track messages for auto-response
        if (message.channel.id === CHANNELS.GENERAL) {
            userMessages[message.author.id] = Date.now();

            // Greeting response
            const greetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'namaste'];
            if (greetings.some(word => contentLower.includes(word))) {
                const profile = userProfiles[message.author.id] || {};
                const gender = profile.gender || 'male';

                let response;
                if (gender === 'female') {
                    const femaleResponses = [
                        `Hello ${message.author.displayName} ji! Tournament kheloge aaj? 💕`,
                        `Hi ${message.author.displayName}! Aaj gaming mood hai? 🎮`,
                        `Namaste ${message.author.displayName} ji! Kya haal hai? Tournament join karo! 🌸`,
                        `Hey ${message.author.displayName}! Aaj jeetne ka plan? 👑`
                    ];
                    response = femaleResponses[Math.floor(Math.random() * femaleResponses.length)];
                } else {
                    const maleResponses = [
                        `Kya haal bhai ${message.author.displayName}! Aaj tournament kheloge? 🔥`,
                        `Hey bro! Tournament join karo, maza aayega! 💪`,
                        `Bhai! Aaj ka tournament check kiya? 🎯`,
                        `Kaise ho bhai! Gaming time hai! 🎮`
                    ];
                    response = maleResponses[Math.floor(Math.random() * maleResponses.length)];
                }

                setTimeout(async () => {
                    await message.channel.send(response).catch(console.error);
                }, 2000);
            }
        }

        // OTO Bot mention
        if (message.mentions.has(client.user)) {
            const embed = new EmbedBuilder()
                .setTitle('🎮 How to Join Tournaments')
                .setDescription('**Bhai yese khelo:**')
                .setColor('#00ff00')
                .addFields(
                    { name: '📝 Step 1', value: 'Complete your profile (if not done)', inline: false },
                    { name: '📅 Step 2', value: `Check <#${CHANNELS.TOURNAMENT_SCHEDULE}> for tournaments`, inline: false },
                    { name: '✅ Step 3', value: 'Click Join button and follow instructions', inline: false },
                    { name: '💰 Step 4', value: 'Pay entry fee and get confirmed!', inline: false }
                )
                .setFooter({ text: 'Good luck! 🍀' });

            await message.reply({ embeds: [embed] });
        }

        // Staff tag
        if (contentLower.includes('staff') || contentLower.includes('@staff')) {
            await message.channel.send(
                '📢 **Staffs are working on it!** Apko jaldi hi reply mil jayega. Please wait! ⏰'
            );
        }

    } catch (error) {
        console.error('Error in messageCreate:', error);
    }
});

// Interaction Handler
client.on('interactionCreate', async interaction => {
    try {
        // Handle Select Menus
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'profile_gender') {
                const gender = interaction.values[0];
                if (!userProfiles[interaction.user.id]) {
                    userProfiles[interaction.user.id] = {};
                }
                userProfiles[interaction.user.id].gender = gender;
                saveData();
                await interaction.reply({ content: '✅ Gender selected! Now select your game.', ephemeral: true });
            }

            if (interaction.customId === 'profile_game') {
                const game = interaction.values[0];
                userProfiles[interaction.user.id].game = game;
                saveData();
                await interaction.showModal(createProfileModal());
            }

            if (interaction.customId === 'tournament_game') {
                await interaction.reply({ content: `✅ Game selected: ${interaction.values[0]}`, ephemeral: true });
            }

            if (interaction.customId === 'tournament_type') {
                await interaction.reply({ content: `✅ Match type: ${interaction.values[0]}`, ephemeral: true });
            }
        }

        // Handle Modals
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'profile_modal') {
                const name = interaction.fields.getTextInputValue('profile_name');
                const state = interaction.fields.getTextInputValue('profile_state');

                userProfiles[interaction.user.id] = {
                    ...userProfiles[interaction.user.id],
                    name,
                    state,
                    otoId: generateOTOId(),
                    createdAt: new Date().toISOString()
                };
                saveData();

                // Add player role
                const member = interaction.member;
                const playerRole = interaction.guild.roles.cache.get(ROLES.PLAYER);
                if (playerRole) {
                    await member.roles.add(playerRole).catch(console.error);
                }

                // Send confirmation
                const embed = new EmbedBuilder()
                    .setTitle('✅ Profile Created Successfully!')
                    .setColor('#00ff00')
                    .addFields(
                        { name: '👤 Name', value: name, inline: true },
                        { name: '📍 State', value: state, inline: true },
                        { name: '🎮 Game', value: userProfiles[interaction.user.id].game, inline: true },
                        { name: '🆔 OTO ID', value: userProfiles[interaction.user.id].otoId, inline: false }
                    )
                    .setFooter({ text: 'Welcome to OTO Tournament!' });

                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Send to profile channel
                const profileChannel = interaction.guild.channels.cache.get(CHANNELS.PROFILE_CHANNEL);
                if (profileChannel) {
                    await profileChannel.send({ embeds: [embed] });
                }

                // Welcome in general chat
                const generalChannel = interaction.guild.channels.cache.get(CHANNELS.GENERAL);
                if (generalChannel) {
                    const welcomeMsg = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
                    await generalChannel.send(`${interaction.user} ${welcomeMsg}`);
                }
            }

            if (interaction.customId === 'tournament_modal') {
                const title = interaction.fields.getTextInputValue('tournament_title');
                const prize = interaction.fields.getTextInputValue('tournament_prize');
                const slots = parseInt(interaction.fields.getTextInputValue('tournament_slots'));
                const entryFee = interaction.fields.getTextInputValue('tournament_entry');
                const description = interaction.fields.getTextInputValue('tournament_desc') || 'No description';

                const tournamentId = Object.keys(tournaments).length + 1;
                tournaments[tournamentId] = {
                    title,
                    prize,
                    slots,
                    entryFee,
                    description,
                    participants: [],
                    confirmed: [],
                    createdBy: interaction.user.id,
                    createdAt: new Date().toISOString(),
                    status: 'upcoming'
                };
                saveData();

                const embed = new EmbedBuilder()
                    .setTitle(`🏆 ${title}`)
                    .setDescription(description)
                    .setColor('#ffd700')
                    .addFields(
                        { name: '💰 Prize Pool', value: prize, inline: true },
                        { name: '🎫 Entry Fee', value: entryFee, inline: true },
                        { name: '👥 Slots', value: `0/${slots}`, inline: true }
                    )
                    .setFooter({ text: `Tournament ID: ${tournamentId}` })
                    .setTimestamp();

                const scheduleChannel = interaction.guild.channels.cache.get(CHANNELS.TOURNAMENT_SCHEDULE);
                if (scheduleChannel) {
                    await scheduleChannel.send({
                        embeds: [embed],
                        components: [createJoinButton(tournamentId)]
                    });
                }

                await interaction.reply({
                    content: `✅ Tournament created successfully! ID: ${tournamentId}`,
                    ephemeral: true
                });
            }
        }

        // Handle Buttons
        if (interaction.isButton()) {
            // Join Tournament
            if (interaction.customId.startsWith('join_tournament_')) {
                const tournamentId = interaction.customId.split('_')[2];

                // Check profile
                if (!userProfiles[interaction.user.id]) {
                    return await interaction.reply({
                        content: '⚠️ Please complete your profile first! Check your DMs.',
                        ephemeral: true
                    });
                }

                // Create private ticket
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: ROLES.STAFF,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                });

                const tournament = tournaments[tournamentId];
                const embed = new EmbedBuilder()
                    .setTitle('🎫 Tournament Registration')
                    .setDescription(
                        `**Tournament:** ${tournament.title}\n` +
                        `**Entry Fee:** ${tournament.entryFee}`
                    )
                    .setColor('#0099ff')
                    .addFields(
                        { name: '📝 Step 1', value: 'Share your in-game name', inline: false },
                        { name: '💳 Step 2', value: 'Share screenshot of payment', inline: false },
                        { name: '⏳ Step 3', value: 'Wait for staff confirmation', inline: false }
                    );

                await ticketChannel.send({
                    content: `${interaction.user}`,
                    embeds: [embed],
                    components: [createTicketButtons(tournamentId)]
                });

                // Notify staff
                const staffChannel = interaction.guild.channels.cache.get(CHANNELS.STAFF_CHAT);
                if (staffChannel) {
                    await staffChannel.send(
                        `🎫 **New Ticket Created**\n` +
                        `👤 User: ${interaction.user}\n` +
                        `🏆 Tournament: ${tournament.title}\n` +
                        `📍 Channel: ${ticketChannel}`
                    );
                }

                await interaction.reply({
                    content: `✅ Ticket created! Go to ${ticketChannel}`,
                    ephemeral: true
                });
            }

            // Confirm Entry
            if (interaction.customId.startsWith('confirm_entry_')) {
                const hasStaffRole = interaction.member.roles.cache.has(ROLES.STAFF);
                if (!hasStaffRole) {
                    return await interaction.reply({
                        content: '⚠️ Only staff can confirm entries!',
                        ephemeral: true
                    });
                }

                await interaction.reply('✅ Entry confirmed! Slot updated in tournament schedule.');
            }

            // Close Ticket
            if (interaction.customId === 'close_ticket') {
                await interaction.reply('🔒 Ticket will be deleted in 10 seconds...');
                setTimeout(async () => {
                    await interaction.channel.delete().catch(console.error);
                }, 10000);
            }

            // Book Free Tournament
            if (interaction.customId === 'book_free_tournament') {
                await interaction.reply({
                    content: '✅ Your free tournament slot is being processed! Staff will contact you soon.',
                    ephemeral: true
                });
            }
        }

        // Handle Slash Commands
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;

            if (commandName === 'create_tournament') {
                const hasStaffRole = interaction.member.roles.cache.has(ROLES.STAFF);
                if (!hasStaffRole) {
                    return await interaction.reply({
                        content: '⚠️ Only staff can create tournaments!',
                        ephemeral: true
                    });
                }
                await interaction.showModal(createTournamentModal());
            }

            if (commandName === 'add_staff') {
                const hasAdminRole = interaction.member.roles.cache.has(ROLES.ADMIN);
                if (!hasAdminRole) {
                    return await interaction.reply({
                        content: '⚠️ Only admins can add staff!',
                        ephemeral: true
                    });
                }

                const member = interaction.options.getMember('user');
                const staffRole = interaction.guild.roles.cache.get(ROLES.STAFF);
                await member.roles.add(staffRole);

                const welcomeMsg = STAFF_WELCOME[Math.floor(Math.random() * STAFF_WELCOME.length)];
                await member.send(welcomeMsg).catch(console.error);

                await interaction.reply({
                    content: `✅ ${member} added as staff!`,
                    ephemeral: true
                });
            }

            if (commandName === 'remove_staff') {
                const hasAdminRole = interaction.member.roles.cache.has(ROLES.ADMIN);
                if (!hasAdminRole) {
                    return await interaction.reply({
                        content: '⚠️ Only admins can remove staff!',
                        ephemeral: true
                    });
                }

                const member = interaction.options.getMember('user');
                const staffRole = interaction.guild.roles.cache.get(ROLES.STAFF);
                await member.roles.remove(staffRole);

                await interaction.reply({
                    content: `✅ ${member} removed from staff!`,
                    ephemeral: true
                });
            }

            if (commandName === 'ban_player') {
                const hasStaffRole = interaction.member.roles.cache.has(ROLES.STAFF);
                if (!hasStaffRole) {
                    return await interaction.reply({
                        content: '⚠️ Only staff can ban players!',
                        ephemeral: true
                    });
                }

                const member = interaction.options.getMember('user');
                const reason = interaction.options.getString('reason') || 'No reason provided';

                await member.ban({ reason });

                await interaction.reply({
                    content: `✅ ${member.user.tag} banned! Reason: ${reason}`,
                    ephemeral: true
                });
            }

            if (commandName === 'timeout_player') {
                const hasStaffRole = interaction.member.roles.cache.has(ROLES.STAFF);
                if (!hasStaffRole) {
                    return await interaction.reply({
                        content: '⚠️ Only staff can timeout players!',
                        ephemeral: true
                    });
                }

                const member = interaction.options.getMember('user');
                const minutes = interaction.options.getInteger('minutes');
                const reason = interaction.options.getString('reason') || 'No reason provided';

                await member.timeout(minutes * 60 * 1000, reason);

                await interaction.reply({
                    content: `✅ ${member} timed out for ${minutes} minutes! Reason: ${reason}`,
                    ephemeral: true
                });
            }

            if (commandName === 'remove_timeout') {
                const hasAdminRole = interaction.member.roles.cache.has(ROLES.ADMIN);
                if (!hasAdminRole) {
                    return await interaction.reply({
                        content: '⚠️ Only admins can remove timeouts!',
                        ephemeral: true
                    });
                }

                const member = interaction.options.getMember('user');
                await member.timeout(null);

                await interaction.reply({
                    content: `✅ Timeout removed from ${member}!`,
                    ephemeral: true
                });
            }

            if (commandName === 'leaderboard') {
                const sortedInvites = Object.entries(invitesData)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 10);

                const embed = new EmbedBuilder()
                    .setTitle('🏆 Invite Leaderboard')
                    .setDescription('**Top inviters of the server!**')
                    .setColor('#ffd700')
                    .setTimestamp();

                if (sortedInvites.length === 0) {
                    embed.addFields({ name: 'No Data', value: 'No invites recorded yet!' });
                } else {
                    sortedInvites.forEach(([userId, data], index) => {
                        const user = interaction.client.users.cache.get(userId);
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                        embed.addFields({
                            name: `${medal} ${user ? user.tag : 'Unknown User'}`,
                            value: `📊 Invites: **${data.count}**`,
                            inline: false
                        });
                    });
                }

                await interaction.reply({ embeds: [embed] });
            }

            if (commandName === 'tournament_list') {
                const tournamentList = Object.entries(tournaments)
                    .filter(([_, t]) => t.status === 'upcoming')
                    .slice(0, 10);

                const embed = new EmbedBuilder()
                    .setTitle('📅 Upcoming Tournaments')
                    .setColor('#00ff00')
                    .setTimestamp();

                if (tournamentList.length === 0) {
                    embed.setDescription('No upcoming tournaments! Check back later.');
                } else {
                    tournamentList.forEach(([id, tournament]) => {
                        embed.addFields({
                            name: `🏆 ${tournament.title}`,
                            value: `💰 Prize: ${tournament.prize}\n🎫 Entry: ${tournament.entryFee}\n👥 Slots: ${tournament.participants.length}/${tournament.slots}\n🆔 ID: ${id}`,
                            inline: true
                        });
                    });
                }

                await interaction.reply({ embeds: [embed] });
            }

            if (commandName === 'edit_tournament') {
                const hasStaffRole = interaction.member.roles.cache.has(ROLES.STAFF);
                if (!hasStaffRole) {
                    return await interaction.reply({
                        content: '⚠️ Only staff can edit tournaments!',
                        ephemeral: true
                    });
                }

                const tournamentId = interaction.options.getString('tournament_id');
                const field = interaction.options.getString('field');
                const value = interaction.options.getString('value');

                if (!tournaments[tournamentId]) {
                    return await interaction.reply({
                        content: '⚠️ Tournament not found!',
                        ephemeral: true
                    });
                }

                tournaments[tournamentId][field] = value;
                saveData();

                await interaction.reply({
                    content: `✅ Tournament ${tournamentId} updated! ${field} = ${value}`,
                    ephemeral: true
                });
            }

            if (commandName === 'delete_tournament') {
                const hasAdminRole = interaction.member.roles.cache.has(ROLES.ADMIN);
                if (!hasAdminRole) {
                    return await interaction.reply({
                        content: '⚠️ Only admins can delete tournaments!',
                        ephemeral: true
                    });
                }

                const tournamentId = interaction.options.getString('tournament_id');

                if (!tournaments[tournamentId]) {
                    return await interaction.reply({
                        content: '⚠️ Tournament not found!',
                        ephemeral: true
                    });
                }

                delete tournaments[tournamentId];
                saveData();

                await interaction.reply({
                    content: `✅ Tournament ${tournamentId} deleted!`,
                    ephemeral: true
                });
            }

            if (commandName === 'send_room_details') {
                const hasStaffRole = interaction.member.roles.cache.has(ROLES.STAFF);
                if (!hasStaffRole) {
                    return await interaction.reply({
                        content: '⚠️ Only staff can send room details!',
                        ephemeral: true
                    });
                }

                const tournamentId = interaction.options.getString('tournament_id');
                const roomId = interaction.options.getString('room_id');
                const password = interaction.options.getString('password');

                const tournament = tournaments[tournamentId];
                if (!tournament) {
                    return await interaction.reply({
                        content: '⚠️ Tournament not found!',
                        ephemeral: true
                    });
                }

                // Send to all confirmed participants
                for (const userId of tournament.confirmed) {
                    const user = await interaction.client.users.fetch(userId).catch(() => null);
                    if (user) {
                        const embed = new EmbedBuilder()
                            .setTitle(`🎮 ${tournament.title} - Room Details`)
                            .setDescription('**Your tournament is starting soon!**')
                            .setColor('#ff0000')
                            .addFields(
                                { name: '🆔 Room ID', value: `\`${roomId}\``, inline: true },
                                { name: '🔑 Password', value: `\`${password}\``, inline: true },
                                { name: '⚠️ Important', value: 'Do not share these details with anyone!', inline: false }
                            )
                            .setFooter({ text: 'Good luck! 🍀' })
                            .setTimestamp();

                        await user.send({ embeds: [embed] }).catch(console.error);
                    }
                }

                await interaction.reply({
                    content: `✅ Room details sent to ${tournament.confirmed.length} participants!`,
                    ephemeral: true
                });
            }

            if (commandName === 'user_info') {
                const user = interaction.options.getUser('user') || interaction.user;
                const profile = userProfiles[user.id];

                const embed = new EmbedBuilder()
                    .setTitle(`📊 User Information - ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL())
                    .setColor('#0099ff')
                    .setTimestamp();

                if (!profile) {
                    embed.setDescription('⚠️ User has not completed their profile yet!');
                } else {
                    embed.addFields(
                        { name: '👤 Name', value: profile.name || 'Not set', inline: true },
                        { name: '📍 State', value: profile.state || 'Not set', inline: true },
                        { name: '🎮 Game', value: profile.game || 'Not set', inline: true },
                        { name: '🆔 OTO ID', value: profile.otoId || 'Not generated', inline: true },
                        { name: '👥 Invites', value: `${invitesData[user.id]?.count || 0}`, inline: true },
                        { name: '📅 Joined', value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown', inline: true }
                    );
                }

                await interaction.reply({ embeds: [embed] });
            }

            if (commandName === 'setup_profile') {
                const { genderRow, gameRow } = createProfileSetup();
                const embed = new EmbedBuilder()
                    .setTitle('📝 Complete Your Profile')
                    .setDescription('Select your gender and game to get started!')
                    .setColor('#0099ff');

                await interaction.reply({
                    embeds: [embed],
                    components: [genderRow, gameRow],
                    ephemeral: true
                });
            }
        }

    } catch (error) {
        console.error('Error in interactionCreate:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ An error occurred while processing your request!',
                ephemeral: true
            }).catch(console.error);
        }
    }
});

// Auto-response function
async function checkInactiveMessages() {
    const generalChannel = client.channels.cache.get(CHANNELS.GENERAL);
    if (!generalChannel) return;

    try {
        const messages = await generalChannel.messages.fetch({ limit: 10 });
        const now = Date.now();

        for (const [msgId, message] of messages) {
            if (message.author.bot) continue;

            // Check if message is older than 2 minutes and has no replies
            const messageAge = now - message.createdTimestamp;
            if (messageAge > 120000 && messageAge < 300000) { // 2-5 minutes old
                const replies = messages.filter(m =>
                    m.reference?.messageId === msgId && !m.author.bot
                );

                if (replies.size === 0 && !userMessages[`replied_${msgId}`]) {
                    const response = AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
                    await message.reply(response).catch(console.error);
                    userMessages[`replied_${msgId}`] = true;
                }
            }
        }
    } catch (error) {
        console.error('Error in checkInactiveMessages:', error);
    }
}

// Spam tournament announcement
async function spamTournamentAnnouncement() {
    const generalChannel = client.channels.cache.get(CHANNELS.GENERAL);
    if (!generalChannel) return;

    const upcomingTournaments = Object.entries(tournaments)
        .filter(([_, t]) => t.status === 'upcoming')
        .slice(0, 3);

    if (upcomingTournaments.length === 0) return;

    const [tournamentId, tournament] = upcomingTournaments[Math.floor(Math.random() * upcomingTournaments.length)];

    const embed = new EmbedBuilder()
        .setTitle(`🔥 ${tournament.title} - Join Now!`)
        .setDescription(tournament.description)
        .setColor('#ff6600')
        .addFields(
            { name: '💰 Prize Pool', value: tournament.prize, inline: true },
            { name: '🎫 Entry Fee', value: tournament.entryFee, inline: true },
            { name: '👥 Slots Available', value: `${tournament.slots - tournament.participants.length}/${tournament.slots}`, inline: true }
        )
        .setFooter({ text: 'Jaldi join karo! Limited slots!' })
        .setTimestamp();

    try {
        await generalChannel.send({
            content: '@everyone **Tournament Alert!** 🚨',
            embeds: [embed],
            components: [createJoinButton(tournamentId)]
        });
    } catch (error) {
        console.error('Error in spamTournamentAnnouncement:', error);
    }
}

// Register Slash Commands
async function registerCommands() {
    const commands = [
        {
            name: 'create_tournament',
            description: 'Create a new tournament (Staff Only)'
        },
        {
            name: 'add_staff',
            description: 'Add a staff member (Admin Only)',
            options: [{
                name: 'user',
                type: 6, // USER type
                description: 'User to add as staff',
                required: true
            }]
        },
        {
            name: 'remove_staff',
            description: 'Remove a staff member (Admin Only)',
            options: [{
                name: 'user',
                type: 6,
                description: 'User to remove from staff',
                required: true
            }]
        },
        {
            name: 'ban_player',
            description: 'Ban a player (Staff Only)',
            options: [
                {
                    name: 'user',
                    type: 6,
                    description: 'User to ban',
                    required: true
                },
                {
                    name: 'reason',
                    type: 3, // STRING type
                    description: 'Reason for ban',
                    required: false
                }
            ]
        },
        {
            name: 'timeout_player',
            description: 'Timeout a player (Staff Only)',
            options: [
                {
                    name: 'user',
                    type: 6,
                    description: 'User to timeout',
                    required: true
                },
                {
                    name: 'minutes',
                    type: 4, // INTEGER type
                    description: 'Duration in minutes',
                    required: true
                },
                {
                    name: 'reason',
                    type: 3,
                    description: 'Reason for timeout',
                    required: false
                }
            ]
        },
        {
            name: 'remove_timeout',
            description: 'Remove timeout from a player (Admin Only)',
            options: [{
                name: 'user',
                type: 6,
                description: 'User to remove timeout from',
                required: true
            }]
        },
        {
            name: 'leaderboard',
            description: 'Show invite leaderboard'
        },
        {
            name: 'tournament_list',
            description: 'List all upcoming tournaments'
        },
        {
            name: 'edit_tournament',
            description: 'Edit tournament details (Staff Only)',
            options: [
                {
                    name: 'tournament_id',
                    type: 3,
                    description: 'Tournament ID',
                    required: true
                },
                {
                    name: 'field',
                    type: 3,
                    description: 'Field to edit',
                    required: true,
                    choices: [
                        { name: 'Title', value: 'title' },
                        { name: 'Prize', value: 'prize' },
                        { name: 'Entry Fee', value: 'entryFee' },
                        { name: 'Description', value: 'description' },
                        { name: 'Status', value: 'status' }
                    ]
                },
                {
                    name: 'value',
                    type: 3,
                    description: 'New value',
                    required: true
                }
            ]
        },
        {
            name: 'delete_tournament',
            description: 'Delete a tournament (Admin Only)',
            options: [{
                name: 'tournament_id',
                type: 3,
                description: 'Tournament ID to delete',
                required: true
            }]
        },
        {
            name: 'send_room_details',
            description: 'Send room ID and password to participants (Staff Only)',
            options: [
                {
                    name: 'tournament_id',
                    type: 3,
                    description: 'Tournament ID',
                    required: true
                },
                {
                    name: 'room_id',
                    type: 3,
                    description: 'Room ID',
                    required: true
                },
                {
                    name: 'password',
                    type: 3,
                    description: 'Room Password',
                    required: true
                }
            ]
        },
        {
            name: 'user_info',
            description: 'Get user profile information',
            options: [{
                name: 'user',
                type: 6,
                description: 'User to check (leave empty for yourself)',
                required: false
            }]
        },
        {
            name: 'setup_profile',
            description: 'Setup or update your profile'
        }
    ];

    try {
        console.log('Registering slash commands...');
        await client.application.commands.set(commands);
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// When bot is ready, register commands
client.once('ready', () => {
    registerCommands();
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n💾 Saving data...');
    saveData();
    console.log('✅ Data saved! Shutting down...');
    process.exit(0);
});

// Login to Discord
client.login('YOUR_BOT_TOKEN_HERE');
