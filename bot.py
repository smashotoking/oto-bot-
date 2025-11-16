# ==================== OTO TOURNAMENT BOT - ULTIMATE PROFESSIONAL VERSION ====================
# Complete Discord Tournament Management System
# Version: 4.0 - Perfect Edition with All Advanced Features

import discord
from discord.ext import commands, tasks
from discord import app_commands
from discord.ui import Select, View, Button, Modal, TextInput
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import random
from collections import defaultdict
import qrcode
from io import BytesIO

# ==================== CONFIGURATION ====================
class Config:
    # Channel IDs
    ANNOUNCEMENT_CHANNEL = 1438484746165555243
    TOURNAMENT_SCHEDULE = 1438482561679626303
    HOW_TO_JOIN = 1438482512296022017
    RULES_CHANNEL = 1438482342145687643
    BOT_COMMANDS = 1438483009950191676
    GENERAL_CHAT = 1438482904018849835
    OPEN_TICKET = 1438485759891079180
    MATCH_REPORTS = 1438486113047150714
    LEADERBOARD_CHANNEL = 1438947356690223347
    STAFF_TOOLS = 1438486059255336970
    PAYMENT_PROOF = 1438486113047150714
    PROFILE_CHANNEL = 1439542574066176020
    
    # Role IDs
    STAFF_ROLE = 1438475461977047112
    ADMIN_ROLE = 1438475461977047112
    PLAYER_ROLE = 1438475461977047114
    FOUNDER_ROLE = 1438475461977047115
    
    # Bot Settings
    MIN_INVITES = 10
    
    # Payment
    PAYMENT_QR = 'https://i.ibb.co/jkBSmkM/qr.png'
    UPI_ID = 'yourpayment@upi'
    
    BAD_WORDS = ['dm', 'mc', 'bc', 'maa ki chut', 'tmkc', 'bkl', 'lawde', 'chutiya', 
                 'madarchod', 'bhenchod', 'fuck', 'shit', 'bitch', 'asshole']

# ==================== TOURNAMENT TEMPLATES ====================
TOURNAMENT_TEMPLATES = {
    'freefire_solo': {
        'name': 'Free Fire Solo Classic',
        'game': 'Free Fire',
        'mode': 'Solo',
        'map': 'Bermuda',
        'slots': 12,
        'entry': 50,
        'prize': 500,
        'prize_distribution': {'1st': 250, '2nd': 150, '3rd': 100},
        'image': 'https://i.ibb.co/8XQkZhJ/freefire.png',
        'rules': ['No hacks', 'No teaming', 'Screenshots required']
    },
    'freefire_squad': {
        'name': 'Free Fire Squad Wars',
        'game': 'Free Fire',
        'mode': 'Squad',
        'map': 'Bermuda',
        'slots': 12,
        'entry': 200,
        'prize': 2000,
        'prize_distribution': {'1st': 1000, '2nd': 600, '3rd': 400},
        'image': 'https://i.ibb.co/8XQkZhJ/freefire.png',
        'rules': ['No hacks', 'Team of 4', 'All screenshots needed', 'Squad ID required']
    },
    'clash_squad': {
        'name': 'Clash Squad Championship',
        'game': 'Free Fire',
        'mode': 'Clash Squad',
        'map': 'Factory',
        'slots': 8,
        'entry': 150,
        'prize': 1500,
        'prize_distribution': {'1st': 750, '2nd': 450, '3rd': 300},
        'image': 'https://i.ibb.co/8XQkZhJ/freefire.png',
        'rules': ['Best of 7', 'No hacks', 'Team verification needed']
    },
    'pubg_squad': {
        'name': 'PUBG Squad Championship',
        'game': 'PUBG',
        'mode': 'Squad',
        'map': 'Erangel',
        'slots': 25,
        'entry': 250,
        'prize': 5000,
        'prize_distribution': {'1st': 2500, '2nd': 1500, '3rd': 1000},
        'image': 'https://i.ibb.co/pubg.png',
        'rules': ['No emulator', 'Squad of 4', 'Fair play', 'Squad ID required']
    }
}

# ==================== SMART RESPONSES ====================
class SmartResponses:
    MALE_GREETINGS = {
        'hi': ['Kya haal bhai! 🔥', 'Sup bro! Tournament khelo! 🎮', 'Hey bhai! Ready for action? 💪'],
        'hello': ['Hello bhai! Khelne aaye ho? 🎯', 'Yo bro! Tournament dekho! 🏆', 'Hey buddy! Let\'s play! 🎮'],
        'kya haal': ['Badhiya bhai! Tum batao! 💪', 'Ekdum mast! Tournament join karo! 🔥', 'All good bro! Tu kaisa hai? 😎'],
        'kaise ho': ['Ekdum fit bhai! 💪', 'Mast hu! Tu batao! 😎', 'Badhiya bro! Game khelega? 🎮'],
    }
    
    FEMALE_GREETINGS = {
        'hi': ['Hello ji! Kaise hain aap? 🌸', 'Hi didi! Tournament dekhiye! 🎮', 'Namaste ji! Khelna hai? 💫'],
        'hello': ['Hello ji! Aap kaise hain? 🌺', 'Namaste didi! Tournament join kariye! 🏆', 'Hi ji! Ready to play? 🎯'],
        'kya haal': ['Sab badhiya ji! Aap batayiye! 😊', 'Mast hai! Aap kaise hain? 🌸'],
        'kaise ho': ['Theek hu ji! Aap? 😊', 'Badhiya didi! Aap khelogi? 🎮'],
    }
    
    @staticmethod
    def get_greeting(text: str, gender: str) -> Optional[str]:
        text_lower = text.lower().strip()
        responses = SmartResponses.FEMALE_GREETINGS if gender == 'female' else SmartResponses.MALE_GREETINGS
        for key, replies in responses.items():
            if key in text_lower:
                return random.choice(replies)
        return None

# ==================== DATA MANAGER ====================
class DataManager:
    def __init__(self):
        self.user_profiles = {}
        self.user_invites = defaultdict(int)
        self.invite_cache = {}
        self.tournaments = {}
        self.tickets = {}
        self.warnings = defaultdict(list)
        self.message_count = defaultdict(int)
        self.pending_dm_profiles = {}  # Users creating profile via DM
    
    def create_profile(self, user_id: int, data: dict):
        profile = {
            'id': user_id,
            'name': data.get('name', 'Unknown'),
            'gender': data.get('gender', 'male').lower(),
            'state': data.get('state', 'Not Set'),
            'game': data.get('game', 'Not Set'),
            'oto_id': f"OTO{str(datetime.now().timestamp()).replace('.', '')[-8:]}",
            'created_at': datetime.now(),
            'invites': 0,
            'tournaments': 0,
            'wins': 0,
            'total_earnings': 0,
            'verified': True,
            'activity': 0
        }
        self.user_profiles[user_id] = profile
        return profile
    
    def get_profile(self, user_id: int):
        return self.user_profiles.get(user_id)
    
    def has_profile(self, user_id: int):
        return user_id in self.user_profiles
    
    def add_invite(self, user_id: int):
        self.user_invites[user_id] += 1
        if user_id in self.user_profiles:
            self.user_profiles[user_id]['invites'] = self.user_invites[user_id]
        return self.user_invites[user_id]
    
    def get_invites(self, user_id: int):
        return self.user_invites[user_id]
    
    def add_activity(self, user_id: int):
        self.message_count[user_id] += 1
        if user_id in self.user_profiles:
            self.user_profiles[user_id]['activity'] = self.message_count[user_id]

data_manager = DataManager()

# ==================== BOT SETUP ====================
intents = discord.Intents.all()
bot = commands.Bot(command_prefix=['-', '!'], intents=intents, help_command=None)

# ==================== PROFILE CREATION MODAL ====================
class ProfileModal(Modal, title='Create Your OTO Profile'):
    name_input = TextInput(label='Your Name', placeholder='Enter your gaming name...', required=True, max_length=50)
    gender_input = TextInput(label='Gender', placeholder='Male or Female', required=True, max_length=10)
    state_input = TextInput(label='State', placeholder='Your state in India...', required=True, max_length=50)
    game_input = TextInput(label='Favorite Game', placeholder='Free Fire / PUBG / Minecraft', required=True, max_length=50)
    
    async def on_submit(self, interaction: discord.Interaction):
        gender = self.gender_input.value.lower()
        if gender not in ['male', 'female']:
            await interaction.response.send_message('❌ Gender must be either Male or Female!', ephemeral=True)
            return
        
        profile = data_manager.create_profile(interaction.user.id, {
            'name': self.name_input.value,
            'gender': gender,
            'state': self.state_input.value,
            'game': self.game_input.value
        })
        
        try:
            member = interaction.guild.get_member(interaction.user.id)
            if member:
                role = interaction.guild.get_role(Config.PLAYER_ROLE)
                if role:
                    await member.add_roles(role)
        except:
            pass
        
        embed = discord.Embed(
            title='✅ Profile Created Successfully!',
            description=f"Welcome to OTO family, **{profile['name']}**! 🎉",
            color=0x00ff00
        )
        embed.add_field(name='🆔 OTO ID', value=f"`{profile['oto_id']}`", inline=True)
        embed.add_field(name='🎮 Game', value=profile['game'], inline=True)
        embed.add_field(name='📍 State', value=profile['state'], inline=True)
        embed.add_field(
            name='🚀 Next Steps',
            value=f"1️⃣ Invite {Config.MIN_INVITES} friends for FREE entry\n"
                  f"2️⃣ Join tournaments in <#{Config.TOURNAMENT_SCHEDULE}>\n"
                  f"3️⃣ Win prizes! 💰",
            inline=False
        )
        embed.set_thumbnail(url=interaction.user.display_avatar.url)
        embed.timestamp = datetime.now()
        
        await interaction.response.send_message(embed=embed, ephemeral=True)
        
        # Announce
        try:
            channel = bot.get_channel(Config.GENERAL_CHAT)
            greeting = SmartResponses.FEMALE_GREETINGS['hi'][0] if gender == 'female' else SmartResponses.MALE_GREETINGS['hi'][0]
            await channel.send(
                f"🎉 **{profile['name']}** completed their profile!\n"
                f"🆔 OTO ID: `{profile['oto_id']}`\n"
                f"🎮 Game: {profile['game']}\n"
                f"{greeting}\n"
                f"Welcome to OTO family! 💪"
            )
        except:
            pass

# ==================== CUSTOM TOURNAMENT CREATION MODAL ====================
class CustomTournamentModal(Modal, title='Create Custom Tournament'):
    title_input = TextInput(label='Tournament Title', placeholder='e.g., Free Fire Championship', required=True)
    game_input = TextInput(label='Game', placeholder='Free Fire / PUBG / Minecraft', required=True)
    mode_input = TextInput(label='Mode', placeholder='Solo / Duo / Squad', required=True)
    map_input = TextInput(label='Map', placeholder='e.g., Bermuda, Erangel', required=True)
    slots_input = TextInput(label='Max Slots', placeholder='e.g., 12, 48, 100', required=True)
    
    async def on_submit(self, interaction: discord.Interaction):
        try:
            slots = int(self.slots_input.value)
            if slots < 1 or slots > 200:
                await interaction.response.send_message('❌ Slots must be between 1-200!', ephemeral=True)
                return
        except:
            await interaction.response.send_message('❌ Slots must be a number!', ephemeral=True)
            return
        
        tournament_id = f"TOUR{str(datetime.now().timestamp()).replace('.', '')[-10:]}"
        
        tournament = {
            'id': tournament_id,
            'title': self.title_input.value,
            'game': self.game_input.value,
            'mode': self.mode_input.value,
            'map': self.map_input.value,
            'prize': '₹500',
            'entry': '₹50',
            'max_slots': slots,
            'prize_distribution': {'1st': 250, '2nd': 150, '3rd': 100},
            'image': 'https://i.ibb.co/8XQkZhJ/freefire.png',
            'rules': ['No hacks', 'Screenshots required', 'Fair play'],
            'time': '8:00 PM',
            'created_by': interaction.user.id,
            'created_at': datetime.now(),
            'status': 'draft',
            'players': {},
            'confirmed_players': {},
            'slots_filled': 0,
            'tournament_channels': {}
        }
        
        data_manager.tournaments[tournament_id] = tournament
        
        embed = discord.Embed(
            title='✅ Custom Tournament Draft Created!',
            description=f"**{tournament['title']}** - Edit details before publishing",
            color=0x3498db
        )
        embed.add_field(name='🎮 Game', value=tournament['game'], inline=True)
        embed.add_field(name='🎯 Mode', value=tournament['mode'], inline=True)
        embed.add_field(name='🗺️ Map', value=tournament['map'], inline=True)
        embed.add_field(name='📊 Slots', value=str(tournament['max_slots']), inline=True)
        embed.add_field(name='🆔 ID', value=f"`{tournament_id}`", inline=True)
        embed.set_footer(text=f"Tournament ID: {tournament_id}")
        
        view = View(timeout=None)
        view.add_item(Button(label='Edit Settings', emoji='✏️', style=discord.ButtonStyle.primary, custom_id=f'edit_tournament_{tournament_id}'))
        view.add_item(Button(label='Publish', emoji='🚀', style=discord.ButtonStyle.success, custom_id=f'publish_tournament_{tournament_id}'))
        view.add_item(Button(label='Delete', emoji='🗑️', style=discord.ButtonStyle.danger, custom_id=f'delete_tournament_{tournament_id}'))
        
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

# ==================== EDIT TOURNAMENT MODAL ====================
class EditTournamentModal(Modal, title='Edit Tournament Settings'):
    def __init__(self, tournament_id):
        super().__init__()
        self.tournament_id = tournament_id
        tournament = data_manager.tournaments[tournament_id]
        
        self.prize_input = TextInput(label='Prize Pool', placeholder='e.g., 500', default=tournament['prize'].replace('₹', ''))
        self.entry_input = TextInput(label='Entry Fee', placeholder='e.g., 50', default=tournament['entry'].replace('₹', ''))
        self.time_input = TextInput(label='Tournament Time', placeholder='e.g., 8:00 PM', default=tournament['time'])
        self.add_item(self.prize_input)
        self.add_item(self.entry_input)
        self.add_item(self.time_input)
    
    async def on_submit(self, interaction: discord.Interaction):
        tournament = data_manager.tournaments[self.tournament_id]
        tournament['prize'] = f"₹{self.prize_input.value}"
        tournament['entry'] = f"₹{self.entry_input.value}"
        tournament['time'] = self.time_input.value
        
        await interaction.response.send_message(f'✅ Tournament settings updated!', ephemeral=True)

# ==================== INGAME INFO MODAL ====================
class IngameInfoModal(Modal, title='Enter Your In-Game Details'):
    def __init__(self, tournament_id, mode):
        super().__init__()
        self.tournament_id = tournament_id
        self.mode = mode
        
        self.ingame_name = TextInput(label='In-Game Name', placeholder='Your IGN', required=True)
        self.ingame_id = TextInput(label='In-Game ID', placeholder='Your numeric ID', required=True)
        
        self.add_item(self.ingame_name)
        self.add_item(self.ingame_id)
        
        if mode.lower() in ['squad', 'duo']:
            self.squad_id = TextInput(label='Squad/Team ID', placeholder='Your squad ID', required=True)
            self.squad_name = TextInput(label='Squad/Team Name', placeholder='Your squad name', required=True)
            self.add_item(self.squad_id)
            self.add_item(self.squad_name)
    
    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        
        tournament = data_manager.tournaments[self.tournament_id]
        profile = data_manager.get_profile(interaction.user.id)
        invites = data_manager.get_invites(interaction.user.id)
        is_free = invites >= Config.MIN_INVITES
        
        # Store ingame info
        ingame_data = {
            'ingame_name': self.ingame_name.value,
            'ingame_id': self.ingame_id.value,
        }
        
        if hasattr(self, 'squad_id'):
            ingame_data['squad_id'] = self.squad_id.value
            ingame_data['squad_name'] = self.squad_name.value
        
        # Create private ticket channel
        try:
            guild = interaction.guild
            category = guild.get_channel(Config.STAFF_TOOLS).category
            
            ticket_channel = await guild.create_text_channel(
                name=f'🎮-{interaction.user.name}-{tournament["id"][-4:]}',
                category=category,
                overwrites={
                    guild.default_role: discord.PermissionOverwrite(view_channel=False),
                    interaction.user: discord.PermissionOverwrite(view_channel=True, send_messages=True),
                    guild.get_role(Config.STAFF_ROLE): discord.PermissionOverwrite(view_channel=True, send_messages=True)
                }
            )
            
            tournament['players'][interaction.user.id] = {
                'name': profile['name'],
                'oto_id': profile['oto_id'],
                'status': 'pending',
                'is_free': is_free,
                'ticket_channel': ticket_channel.id,
                'ingame_info': ingame_data,
                'registered_at': datetime.now().isoformat()
            }
            
            embed = discord.Embed(
                title='🎮 Tournament Registration',
                description=f"**{tournament['title']}**",
                color=0x3498db
            )
            embed.add_field(name='👤 Player', value=profile['name'], inline=True)
            embed.add_field(name='🆔 OTO ID', value=profile['oto_id'], inline=True)
            embed.add_field(name='🎮 IGN', value=ingame_data['ingame_name'], inline=True)
            embed.add_field(name='🆔 Game ID', value=ingame_data['ingame_id'], inline=True)
            
            if 'squad_id' in ingame_data:
                embed.add_field(name='👥 Squad ID', value=ingame_data['squad_id'], inline=True)
                embed.add_field(name='🏷️ Squad Name', value=ingame_data['squad_name'], inline=True)
            
            if is_free:
                embed.add_field(name='💳 Entry', value='✅ **FREE ENTRY**', inline=False)
                embed.add_field(name='⏳ Status', value='⏳ **Waiting for Staff Confirmation**', inline=False)
                embed.color = 0x00ff00
                
                view = View(timeout=None)
                view.add_item(Button(
                    label='Confirm Slot',
                    emoji='✅',
                    style=discord.ButtonStyle.success,
                    custom_id=f'confirm_slot_{interaction.user.id}_{tournament["id"]}'
                ))
                
                await ticket_channel.send(
                    content=f"{interaction.user.mention} <@&{Config.STAFF_ROLE}>",
                    embed=embed,
                    view=view
                )
            else:
                embed.add_field(name='💳 Entry Fee', value=tournament['entry'], inline=False)
                embed.add_field(name='📸 Next Step', value='**Staff will generate payment QR code**', inline=False)
                embed.color = 0xffaa00
                
                view = View(timeout=None)
                view.add_item(Button(
                    label='Generate Payment QR',
                    emoji='💳',
                    style=discord.ButtonStyle.primary,
                    custom_id=f'generate_qr_{interaction.user.id}_{tournament["id"]}'
                ))
                
                await ticket_channel.send(
                    content=f"{interaction.user.mention} <@&{Config.STAFF_ROLE}>",
                    embed=embed,
                    view=view
                )
            
            await interaction.followup.send(
                f"✅ Registration ticket created! {ticket_channel.mention}",
                ephemeral=True
            )
            
        except Exception as e:
            await interaction.followup.send(f'❌ Failed to create ticket: {str(e)}', ephemeral=True)

# ==================== TOURNAMENT TEMPLATE SELECT ====================
class TournamentTemplateSelect(Select):
    def __init__(self):
        options = [
            discord.SelectOption(label='Free Fire Solo Classic', description='Solo | Bermuda | ₹500', emoji='👤', value='freefire_solo'),
            discord.SelectOption(label='Free Fire Squad Wars', description='Squad | Bermuda | ₹2000', emoji='👥', value='freefire_squad'),
            discord.SelectOption(label='Clash Squad Championship', description='Clash Squad | ₹1500', emoji='⚔️', value='clash_squad'),
            discord.SelectOption(label='PUBG Squad Championship', description='Squad | Erangel | ₹5000', emoji='🎯', value='pubg_squad'),
            discord.SelectOption(label='➕ Custom Tournament', description='Create from scratch', emoji='✨', value='custom')
        ]
        super().__init__(placeholder='🎮 Choose Tournament Type...', options=options, custom_id='tournament_template_select')
    
    async def callback(self, interaction: discord.Interaction):
        if self.values[0] == 'custom':
            await interaction.response.send_modal(CustomTournamentModal())
            return
        
        template = TOURNAMENT_TEMPLATES[self.values[0]].copy()
        tournament_id = f"TOUR{str(datetime.now().timestamp()).replace('.', '')[-10:]}"
        
        tournament = {
            'id': tournament_id,
            'title': template['name'],
            'game': template['game'],
            'mode': template['mode'],
            'map': template['map'],
            'prize': f"₹{template['prize']}",
            'entry': f"₹{template['entry']}",
            'max_slots': template['slots'],
            'prize_distribution': template['prize_distribution'],
            'image': template['image'],
            'rules': template['rules'],
            'time': '8:00 PM',
            'created_by': interaction.user.id,
            'created_at': datetime.now(),
            'status': 'draft',
            'players': {},
            'confirmed_players': {},
            'slots_filled': 0,
            'tournament_channels': {}
        }
        
        data_manager.tournaments[tournament_id] = tournament
        
        embed = discord.Embed(
            title='✅ Tournament Created from Template!',
            description=f"**{tournament['title']}**",
            color=0x00ff00
        )
        embed.add_field(name='🎮 Game', value=tournament['game'], inline=True)
        embed.add_field(name='🎯 Mode', value=tournament['mode'], inline=True)
        embed.add_field(name='🗺️ Map', value=tournament['map'], inline=True)
        embed.add_field(name='💰 Prize', value=tournament['prize'], inline=True)
        embed.add_field(name='🎫 Entry', value=tournament['entry'], inline=True)
        embed.add_field(name='📊 Slots', value=str(tournament['max_slots']), inline=True)
        embed.add_field(name='🆔 ID', value=f"`{tournament_id}`", inline=False)
        embed.set_image(url=tournament['image'])
        embed.set_footer(text=f"Tournament ID: {tournament_id}")
        
        view = View(timeout=None)
        view.add_item(Button(label='Edit Settings', emoji='✏️', style=discord.ButtonStyle.primary, custom_id=f'edit_tournament_{tournament_id}'))
        view.add_item(Button(label='Publish', emoji='🚀', style=discord.ButtonStyle.success, custom_id=f'publish_tournament_{tournament_id}'))
        view.add_item(Button(label='Delete', emoji='🗑️', style=discord.ButtonStyle.danger, custom_id=f'delete_tournament_{tournament_id}'))
        
        await interaction.response.edit_message(embed=embed, view=view)

# ==================== BUTTON HANDLERS ====================
@bot.event
async def on_interaction(interaction: discord.Interaction):
    if interaction.type != discord.InteractionType.component:
        return
    
    custom_id = interaction.data['custom_id']
    
    # Create Profile
    if custom_id == 'create_profile_btn':
        if data_manager.has_profile(interaction.user.id):
            await interaction.response.send_message('✅ You already have a profile!', ephemeral=True)
            return
        await interaction.response.send_modal(ProfileModal())
    
    # Create Tournament
    elif custom_id == 'create_tournament_btn':
        if not any(role.id == Config.STAFF_ROLE for role in interaction.user.roles):
            await interaction.response.send_message('❌ Staff only!', ephemeral=True)
            return
        
        embed = discord.Embed(
            title='🎮 Create Tournament',
            description='**Choose template or create custom:**',
            color=0x3498db
        )
        view = View(timeout=None)
        view.add_item(TournamentTemplateSelect())
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)
    
    # Edit Tournament
    elif custom_id.startswith('edit_tournament_'):
        tournament_id = custom_id.replace('edit_tournament_', '')
        await interaction.response.send_modal(EditTournamentModal(tournament_id))
    
    # Delete Tournament
    elif custom_id.startswith('delete_tournament_'):
        tournament_id = custom_id.replace('delete_tournament_', '')
        if tournament_id in data_manager.tournaments:
            del data_manager.tournaments[tournament_id]
        await interaction.response.edit_message(content='🗑️ Tournament deleted!', embed=None, view=None)
    
    # Publish Tournament
    elif custom_id.startswith('publish_tournament_'):
        tournament_id = custom_id.replace('publish_tournament_', '')
        tournament = data_manager.tournaments.get(tournament_id)
        if not tournament:
            return
        
        tournament['status'] = 'registration'
        
        embed = discord.Embed(
            title=f"🔥 {tournament['title']}",
            description=f"**{tournament['mode']} - {tournament['map']}**\n\nRegistration is OPEN!",
            color=0xff0000
        )
        embed.add_field(name='💰 Prize', value=tournament['prize'], inline=True)
        embed.add_field(name='🎫 Entry', value=tournament['entry'], inline=True)
        embed.add_field(name='📊 Slots', value=f"0/{tournament['max_slots']}", inline=True)
        embed.add_field(name='⏰ Time', value=tournament['time'], inline=True)
        
        prize_text = '\n'.join([f"🏆 {pos}: ₹{amt}" for pos, amt in tournament['prize_distribution'].items()])
        embed.add_field(name='🏆 Prizes', value=prize_text, inline=False)
        
        embed.set_image(url=tournament['image'])
        embed.set_footer(text=f"ID: {tournament_id}")
        
        view = View(timeout=None)
        view.add_item(Button(label='JOIN TOURNAMENT', emoji='🎮', style=discord.ButtonStyle.success, custom_id=f'join_tournament_{tournament_id}'))
        
        schedule_channel = bot.get_channel(Config.TOURNAMENT_SCHEDULE)
        msg = await schedule_channel.send(embed=embed, view=view)
        tournament['schedule_message_id'] = msg.id
        
        announce_channel = bot.get_channel(Config.ANNOUNCEMENT_CHANNEL)
        await announce_channel.send(content='@everyone\n\n🔥 **NEW TOURNAMENT!** 🔥', embed=embed, view=view)
        
        await interaction.response.edit_message(content='✅ Tournament published!', embed=None, view=None)
    
    # Join Tournament
    elif custom_id.startswith('join_tournament_'):
        tournament_id = custom_id.replace('join_tournament_', '')
        tournament = data_manager.tournaments.get(tournament_id)
        
        if not tournament:
            await interaction.response.send_message('❌ Tournament not found!', ephemeral=True)
            return
        
        if tournament['slots_filled'] >= tournament['max_slots']:
            await interaction.response.send_message('❌ Tournament full!', ephemeral=True)
            return
        
        if interaction.user.id in tournament['players']:
            await interaction.response.send_message('❌ Already registered!', ephemeral=True)
            return
        
        profile = data_manager.get_profile(interaction.user.id)
        if not profile:
            await interaction.response.send_message(
                f'❌ Create profile first! Check <#{Config.HOW_TO_JOIN}>',
                ephemeral=True
            )
            return
        
        # Ask for in-game details
        await interaction.response.send_modal(IngameInfoModal(tournament_id, tournament['mode']))
    
    # Generate Payment QR
    elif custom_id.startswith('generate_qr_'):
        if not any(role.id == Config.STAFF_ROLE for role in interaction.user.roles):
            await interaction.response.send_message('❌ Staff only!', ephemeral=True)
            return
        
        parts = custom_id.split('_')
        user_id = int(parts[2])
        tournament_id = parts[3]
        tournament = data_manager.tournaments.get(tournament_id)
        
        embed = discord.Embed(
            title='💳 Payment Required',
            description=f"**Entry Fee:** {tournament['entry']}\n\n**Pay via UPI:**",
            color=0xffaa00
        )
        embed.add_field(name='🆔 UPI ID', value=f"`{Config.UPI_ID}`", inline=False)
        embed.add_field(name='📸 After Payment', value='Upload screenshot here for verification', inline=False)
        embed.set_image(url=Config.PAYMENT_QR)
        embed.timestamp = datetime.now()
        
        await interaction.message.edit(embed=embed, view=None)
        await interaction.response.send_message('✅ Payment QR sent to player!', ephemeral=True)
    
    # Confirm Slot (for free entry or after payment)
    elif custom_id.startswith('confirm_slot_'):
        if not any(role.id == Config.STAFF_ROLE for role in interaction.user.roles):
            await interaction.response.send_message('❌ Staff only!', ephemeral=True)
            return
        
        parts = custom_id.split('_')
        user_id = int(parts[2])
        tournament_id = parts[3]
        tournament = data_manager.tournaments.get(tournament_id)
        
        if not tournament or user_id not in tournament['players']:
            await interaction.response.send_message('❌ Registration not found!', ephemeral=True)
            return
        
        player = tournament['players'][user_id]
        player['status'] = 'confirmed'
        tournament['confirmed_players'][user_id] = player
        tournament['slots_filled'] += 1
        
        slot_number = tournament['slots_filled']
        
        # Create tournament-specific channel for confirmed players
        try:
            guild = interaction.guild
            
            # Get or create tournament category
            if 'category_id' not in tournament['tournament_channels']:
                category = await guild.create_category(
                    name=f"🎮 {tournament['title'][:20]}",
                    overwrites={
                        guild.default_role: discord.PermissionOverwrite(view_channel=False),
                        guild.get_role(Config.STAFF_ROLE): discord.PermissionOverwrite(view_channel=True)
                    }
                )
                tournament['tournament_channels']['category_id'] = category.id
            else:
                category = guild.get_channel(tournament['tournament_channels']['category_id'])
            
            # Create player channel in tournament category
            user = await bot.fetch_user(user_id)
            player_channel = await guild.create_text_channel(
                name=f'slot-{slot_number}-{user.name}',
                category=category,
                overwrites={
                    guild.default_role: discord.PermissionOverwrite(view_channel=False),
                    user: discord.PermissionOverwrite(view_channel=True, send_messages=True),
                    guild.get_role(Config.STAFF_ROLE): discord.PermissionOverwrite(view_channel=True, send_messages=True)
                }
            )
            
            player['player_channel'] = player_channel.id
            
            # Send confirmation in player channel
            embed = discord.Embed(
                title='✅ SLOT CONFIRMED!',
                description=f"**{tournament['title']}**\n\nYour slot is confirmed!",
                color=0x00ff00
            )
            embed.add_field(name='📊 Your Slot', value=f"**#{slot_number}**", inline=True)
            embed.add_field(name='⏰ Time', value=tournament['time'], inline=True)
            embed.add_field(name='🎮 Mode', value=tournament['mode'], inline=True)
            embed.add_field(name='🗺️ Map', value=tournament['map'], inline=True)
            
            ingame = player['ingame_info']
            embed.add_field(name='👤 Your IGN', value=ingame['ingame_name'], inline=True)
            embed.add_field(name='🆔 Your ID', value=ingame['ingame_id'], inline=True)
            
            if 'squad_id' in ingame:
                embed.add_field(name='👥 Squad ID', value=ingame['squad_id'], inline=True)
                embed.add_field(name='🏷️ Squad Name', value=ingame['squad_name'], inline=True)
            
            embed.add_field(
                name='📢 Important',
                value='• Room details will be shared here\n• Stay active in this channel\n• Good luck! 🏆',
                inline=False
            )
            embed.timestamp = datetime.now()
            
            await player_channel.send(content=f"{user.mention}", embed=embed)
            
        except Exception as e:
            print(f"Error creating player channel: {e}")
        
        # Update original ticket
        confirm_embed = discord.Embed(
            title='✅ SLOT CONFIRMED!',
            description=f"<@{user_id}> is confirmed for **Slot #{slot_number}**!",
            color=0x00ff00
        )
        confirm_embed.set_footer(text=f"Confirmed by {interaction.user.name}")
        confirm_embed.timestamp = datetime.now()
        
        await interaction.message.edit(embed=confirm_embed, view=None)
        await interaction.response.send_message(f'✅ Slot #{slot_number} confirmed!', ephemeral=True)
        
        # Update tournament schedule message
        try:
            schedule_channel = bot.get_channel(Config.TOURNAMENT_SCHEDULE)
            schedule_msg = await schedule_channel.fetch_message(tournament['schedule_message_id'])
            embed = schedule_msg.embeds[0]
            
            for idx, field in enumerate(embed.fields):
                if field.name == '📊 Slots':
                    embed.set_field_at(idx, name='📊 Slots', value=f"{slot_number}/{tournament['max_slots']}", inline=True)
                    break
            
            await schedule_msg.edit(embed=embed)
        except:
            pass
        
        # Announce in general
        try:
            general = bot.get_channel(Config.GENERAL_CHAT)
            await general.send(
                f"🎉 <@{user_id}> confirmed **Slot #{slot_number}** in **{tournament['title']}**!\n"
                f"💰 Prize: {tournament['prize']} | 📊 Slots: {slot_number}/{tournament['max_slots']}"
            )
        except:
            pass
        
        # Notify player via DM
        try:
            user = await bot.fetch_user(user_id)
            dm_embed = discord.Embed(
                title='✅ Tournament Slot Confirmed!',
                description=f"**{tournament['title']}**",
                color=0x00ff00
            )
            dm_embed.add_field(name='📊 Your Slot', value=f"#{slot_number}", inline=True)
            dm_embed.add_field(name='⏰ Time', value=tournament['time'], inline=True)
            dm_embed.add_field(
                name='📢 Next Steps',
                value=f"• Check your private channel: <#{player_channel.id}>\n"
                      f"• Room details will be shared there\n"
                      f"• Be online 10 mins before start",
                inline=False
            )
            await user.send(embed=dm_embed)
        except:
            pass

# ==================== MESSAGE HANDLERS ====================
@bot.event
async def on_message(message):
    if message.author.bot:
        return
    
    data_manager.add_activity(message.author.id)
    
    # DM Profile Creation
    if message.channel.type == discord.ChannelType.private:
        if not data_manager.has_profile(message.author.id):
            content = message.content.strip()
            
            # Check format: Name: ... Gender: ... State: ... Game: ...
            if 'name:' in content.lower() and 'gender:' in content.lower():
                lines = content.split('\n')
                profile_data = {}
                
                for line in lines:
                    if ':' in line:
                        key, value = line.split(':', 1)
                        key = key.strip().lower()
                        value = value.strip()
                        
                        if key == 'name':
                            profile_data['name'] = value
                        elif key == 'gender':
                            profile_data['gender'] = value.lower()
                        elif key == 'state':
                            profile_data['state'] = value
                        elif key == 'game':
                            profile_data['game'] = value
                
                if all(k in profile_data for k in ['name', 'gender', 'state', 'game']):
                    if profile_data['gender'] not in ['male', 'female']:
                        await message.reply('❌ Gender must be Male or Female!')
                        return
                    
                    profile = data_manager.create_profile(message.author.id, profile_data)
                    
                    # Give role in all guilds
                    for guild in bot.guilds:
                        try:
                            member = guild.get_member(message.author.id)
                            if member:
                                role = guild.get_role(Config.PLAYER_ROLE)
                                if role:
                                    await member.add_roles(role)
                        except:
                            pass
                    
                    embed = discord.Embed(
                        title='✅ Profile Created!',
                        description=f"Welcome **{profile['name']}**! 🎉",
                        color=0x00ff00
                    )
                    embed.add_field(name='🆔 OTO ID', value=f"`{profile['oto_id']}`", inline=True)
                    embed.add_field(name='🎮 Game', value=profile['game'], inline=True)
                    embed.add_field(name='📍 State', value=profile['state'], inline=True)
                    embed.set_thumbnail(url=message.author.display_avatar.url)
                    
                    await message.reply(embed=embed)
                    
                    # Announce
                    for guild in bot.guilds:
                        try:
                            channel = guild.get_channel(Config.GENERAL_CHAT)
                            greeting = SmartResponses.get_greeting('hi', profile['gender']) or 'Welcome!'
                            await channel.send(
                                f"🎉 **{profile['name']}** completed profile!\n"
                                f"🆔 OTO ID: `{profile['oto_id']}`\n"
                                f"{greeting}"
                            )
                        except:
                            pass
                else:
                    await message.reply(
                        '❌ Invalid format! Use:\n```\n'
                        'Name: Your Name\n'
                        'Gender: Male/Female\n'
                        'State: Your State\n'
                        'Game: Free Fire/PUBG/Minecraft\n```'
                    )
        return
    
    # Payment screenshot detection in private tickets
    if message.attachments and message.channel.name and message.channel.name.startswith('🎮-'):
        for tournament in data_manager.tournaments.values():
            if message.author.id in tournament['players']:
                player = tournament['players'][message.author.id]
                if player.get('ticket_channel') == message.channel.id and player['status'] == 'pending' and not player['is_free']:
                    
                    embed = discord.Embed(
                        title='💳 Payment Proof Uploaded',
                        description=f"Player: <@{message.author.id}>",
                        color=0xffaa00
                    )
                    embed.add_field(name='👤 Name', value=player['name'], inline=True)
                    embed.add_field(name='💰 Amount', value=tournament['entry'], inline=True)
                    embed.set_image(url=message.attachments[0].url)
                    embed.timestamp = datetime.now()
                    
                    view = View(timeout=None)
                    view.add_item(Button(
                        label='Confirm Slot',
                        emoji='✅',
                        style=discord.ButtonStyle.success,
                        custom_id=f'confirm_slot_{message.author.id}_{tournament["id"]}'
                    ))
                    view.add_item(Button(
                        label='Reject Payment',
                        emoji='❌',
                        style=discord.ButtonStyle.danger,
                        custom_id=f'reject_payment_{message.author.id}_{tournament["id"]}'
                    ))
                    
                    await message.reply(embed=embed, view=view)
                    return
    
    # Smart greetings
    if not message.content.startswith(('-', '!')):
        profile = data_manager.get_profile(message.author.id)
        if profile:
            greeting = SmartResponses.get_greeting(message.content, profile['gender'])
            if greeting:
                await message.reply(greeting)
                return
    
    # Bot mention
    if bot.user.mentioned_in(message):
        profile = data_manager.get_profile(message.author.id)
        name = profile['name'] if profile else message.author.name
        
        embed = discord.Embed(
            title='🤖 OTO Bot',
            description=f"Hey {name}! 👋",
            color=0x3498db
        )
        embed.add_field(name='🎮 Tournaments', value=f"<#{Config.TOURNAMENT_SCHEDULE}>", inline=True)
        embed.add_field(name='📚 Guide', value=f"<#{Config.HOW_TO_JOIN}>", inline=True)
        embed.add_field(name='⚡ Commands', value='`-i` `-profile` `-help`', inline=False)
        
        await message.reply(embed=embed)
        return
    
    await bot.process_commands(message)

# ==================== USER COMMANDS ====================
@bot.command(name='i')
async def invites_cmd(ctx):
    invites = data_manager.get_invites(ctx.author.id)
    needed = max(0, Config.MIN_INVITES - invites)
    
    embed = discord.Embed(
        title='🔗 Your Invites',
        color=0x00ff00 if invites >= Config.MIN_INVITES else 0xffaa00
    )
    embed.add_field(name='📊 Total', value=str(invites), inline=True)
    embed.add_field(name='🎯 Target', value=str(Config.MIN_INVITES), inline=True)
    embed.add_field(name='📈 Need', value=str(needed), inline=True)
    embed.add_field(
        name='🎁 Status',
        value='✅ FREE Entry!' if invites >= Config.MIN_INVITES else f'❌ {needed} more',
        inline=False
    )
    
    await ctx.reply(embed=embed)

@bot.command(name='profile')
async def profile_cmd(ctx):
    profile = data_manager.get_profile(ctx.author.id)
    
    if not profile:
        await ctx.reply('❌ No profile! Create one in DM or buttons.')
        return
    
    invites = data_manager.get_invites(ctx.author.id)
    
    embed = discord.Embed(title='👤 Your Profile', color=0x3498db)
    embed.add_field(name='🆔 OTO ID', value=f"`{profile['oto_id']}`", inline=True)
    embed.add_field(name='👤 Name', value=profile['name'], inline=True)
    embed.add_field(name='🎮 Game', value=profile['game'], inline=True)
    embed.add_field(name='📍 State', value=profile['state'], inline=True)
    embed.add_field(name='🔗 Invites', value=str(invites), inline=True)
    embed.add_field(name='🏆 Tournaments', value=str(profile['tournaments']), inline=True)
    embed.add_field(name='🥇 Wins', value=str(profile['wins']), inline=True)
    embed.add_field(name='💰 Earnings', value=f"₹{profile['total_earnings']}", inline=True)
    embed.set_thumbnail(url=ctx.author.display_avatar.url)
    
    await ctx.reply(embed=embed)

@bot.command(name='help')
async def help_cmd(ctx):
    embed = discord.Embed(title='📚 OTO Bot Commands', color=0x3498db)
    embed.add_field(
        name='👥 User Commands',
        value='`-i` - Invites\n`-profile` - Profile\n`-help` - Help',
        inline=False
    )
    embed.add_field(
        name='🎮 Channels',
        value=f"<#{Config.TOURNAMENT_SCHEDULE}> - Tournaments\n<#{Config.HOW_TO_JOIN}> - Guide",
        inline=False
    )
    
    await ctx.reply(embed=embed)

# ==================== STAFF COMMANDS ====================
@bot.command(name='startroom')
async def start_room(ctx, tournament_id: str, room_id: str, password: str):
    if not any(role.id == Config.STAFF_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Staff only!')
        return
    
    tournament = data_manager.tournaments.get(tournament_id)
    if not tournament:
        await ctx.reply('❌ Tournament not found!')
        return
    
    tournament['status'] = 'live'
    tournament['room_details'] = {'room_id': room_id, 'password': password}
    
    # Send to all player channels
    sent = 0
    for user_id, player in tournament['confirmed_players'].items():
        try:
            if 'player_channel' in player:
                channel = bot.get_channel(player['player_channel'])
                
                embed = discord.Embed(
                    title=f"🔴 {tournament['title']} - LIVE!",
                    description='**JOIN NOW!**',
                    color=0xff0000
                )
                embed.add_field(name='🔐 Room ID', value=f"```{room_id}```", inline=False)
                embed.add_field(name='🔑 Password', value=f"```{password}```", inline=False)
                embed.add_field(name='⚠️ Important', value='• Join within 5 mins\n• Take screenshots\n• Good luck! 🏆', inline=False)
                
                await channel.send(content=f"<@{user_id}>", embed=embed)
                sent += 1
        except:
            pass
    
    await ctx.reply(f"✅ Room sent to {sent} players!\n🔐 Room: {room_id}\n🔑 Pass: {password}")

@bot.command(name='winners')
async def declare_winners(ctx, tournament_id: str, first: discord.Member, second: discord.Member = None, third: discord.Member = None):
    if not any(role.id == Config.STAFF_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Staff only!')
        return
    
    tournament = data_manager.tournaments.get(tournament_id)
    if not tournament:
        await ctx.reply('❌ Tournament not found!')
        return
    
    tournament['status'] = 'completed'
    winners = [w for w in [first, second, third] if w]
    
    embed = discord.Embed(
        title=f"🏆 {tournament['title']} - RESULTS",
        description='**🎉 Congratulations! 🎉**',
        color=0xffd700
    )
    
    medals = ['🥇', '🥈', '🥉']
    positions = ['1st', '2nd', '3rd']
    prizes = [
        tournament['prize_distribution'].get('1st', 0),
        tournament['prize_distribution'].get('2nd', 0),
        tournament['prize_distribution'].get('3rd', 0)
    ]
    
    for idx, winner in enumerate(winners):
        embed.add_field(
            name=f"{medals[idx]} {positions[idx]} Place",
            value=f"{winner.mention}\n💰 ₹{prizes[idx]}",
            inline=True
        )
        
        profile = data_manager.get_profile(winner.id)
        if profile:
            profile['tournaments'] += 1
            profile['total_earnings'] += prizes[idx]
            if idx == 0:
                profile['wins'] += 1
    
    announce_channel = bot.get_channel(Config.ANNOUNCEMENT_CHANNEL)
    await announce_channel.send(content='@everyone\n\n🎉 **RESULTS!** 🎉', embed=embed)
    await ctx.reply('✅ Winners announced!')

@bot.command(name='addstaff')
async def add_staff(ctx, member: discord.Member):
    if not any(role.id == Config.ADMIN_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Admin only!')
        return
    
    role = ctx.guild.get_role(Config.STAFF_ROLE)
    await member.add_roles(role)
    await ctx.reply(f'✅ {member.mention} added to staff!')

@bot.command(name='removestaff')
async def remove_staff(ctx, member: discord.Member):
    if not any(role.id == Config.ADMIN_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Admin only!')
        return
    
    role = ctx.guild.get_role(Config.STAFF_ROLE)
    await member.remove_roles(role)
    await ctx.reply(f'✅ {member.mention} removed from staff!')

@bot.command(name='stats')
async def bot_stats(ctx):
    if not any(role.id == Config.STAFF_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Staff only!')
        return
    
    embed = discord.Embed(title='📊 Bot Statistics', color=0x3498db)
    embed.add_field(name='👥 Profiles', value=str(len(data_manager.user_profiles)), inline=True)
    embed.add_field(name='🎮 Tournaments', value=str(len(data_manager.tournaments)), inline=True)
    embed.add_field(name='📊 Members', value=str(ctx.guild.member_count), inline=True)
    
    await ctx.reply(embed=embed)

@bot.command(name='tournaments', aliases=['list'])
async def list_tournaments(ctx):
    if not any(role.id == Config.STAFF_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Staff only!')
        return
    
    if not data_manager.tournaments:
        await ctx.reply('📊 No tournaments!')
        return
    
    embed = discord.Embed(title='🎮 Active Tournaments', color=0x3498db)
    
    for t in data_manager.tournaments.values():
        embed.add_field(
            name=t['title'],
            value=f"**ID:** `{t['id']}`\n**Slots:** {t['slots_filled']}/{t['max_slots']}\n**Status:** {t['status'].upper()}",
            inline=False
        )
    
    await ctx.reply(embed=embed)

@bot.command(name='announce')
async def announce_cmd(ctx, *, message: str):
    if not any(role.id == Config.STAFF_ROLE for role in ctx.author.roles):
        await ctx.reply('❌ Staff only!')
        return
    
    embed = discord.Embed(
        title='📢 ANNOUNCEMENT',
        description=message,
        color=0xff0000
    )
    embed.set_footer(text=f"By {ctx.author.name}")
    
    channel = bot.get_channel(Config.ANNOUNCEMENT_CHANNEL)
    await channel.send(content='@everyone', embed=embed)
    await ctx.reply('✅ Announced!')

# ==================== MEMBER JOIN ====================
@bot.event
async def on_member_join(member):
    try:
        # Track invites
        invites = await member.guild.invites()
        for invite in invites:
            if invite.inviter:
                cached = data_manager.invite_cache.get(invite.code, 0)
                if invite.uses > cached:
                    data_manager.invite_cache[invite.code] = invite.uses
                    inviter_count = data_manager.add_invite(invite.inviter.id)
                    
                    if inviter_count == Config.MIN_INVITES:
                        channel = bot.get_channel(Config.GENERAL_CHAT)
                        await channel.send(
                            f"🎉 {invite.inviter.mention} unlocked **FREE ENTRY**! 🏆"
                        )
                    break
        
        # Update cache
        for inv in invites:
            if inv.inviter:
                data_manager.invite_cache[inv.code] = inv.uses
        
        # Welcome
        channel = bot.get_channel(Config.GENERAL_CHAT)
        await channel.send(
            f"🔥 {member.mention} joined OTO! 🎮\n\n"
            f"🎯 **Quick Start:**\n"
            f"• Create profile in <#{Config.HOW_TO_JOIN}>\n"
            f"• Invite {Config.MIN_INVITES} friends = FREE entry!"
        )
        
        # Send DM
        await asyncio.sleep(5)
        try:
            embed = discord.Embed(
                title='👋 Welcome to OTO!',
                description=f"Hey {member.name}! Create your profile to get started!",
                color=0x3498db
            )
            embed.add_field(
                name='📝 Profile Format',
                value='```\nName: Your Name\nGender: Male/Female\nState: Your State\nGame: Free Fire/PUBG/Minecraft\n```',
                inline=False
            )
            embed.add_field(name='Or', value=f'Use buttons in <#{Config.HOW_TO_JOIN}>', inline=False)
            
            await member.send(embed=embed)
        except:
            pass
    except Exception as e:
        print(f"Member join error: {e}")

# ==================== BOT READY ====================
@bot.event
async def on_ready():
    print('╔═══════════════════════════════════════╗')
    print('║     🎮 OTO BOT ONLINE                ║')
    print('╚═══════════════════════════════════════╝')
    print(f'✅ Bot: {bot.user.name}')
    print(f'✅ Servers: {len(bot.guilds)}')
    print('')
    
    await bot.change_presence(
        activity=discord.Activity(type=discord.ActivityType.playing, name='🎮 OTO Tournaments | -help'),
        status=discord.Status.online
    )
    
    # Load invites
    for guild in bot.guilds:
        try:
            invites = await guild.invites()
            for invite in invites:
                if invite.inviter:
                    data_manager.invite_cache[invite.code] = invite.uses
        except:
            pass
    
    print('🚀 Ready!')
    await asyncio.sleep(5)
    await send_setup_messages()

async def send_setup_messages():
    try:
        # Staff tools
        staff_channel = bot.get_channel(Config.STAFF_TOOLS)
        if staff_channel:
            embed = discord.Embed(title='📋 STAFF PANEL', color=0x3498db)
            embed.add_field(
                name='🎮 Tournament Commands',
                value='`!startroom <ID> <roomID> <pass>`\n`!winners <ID> @1st @2nd @3rd`\n`!tournaments` - List all',
                inline=False
            )
            embed.add_field(
                name='👥 Management',
                value='`!addstaff @user`\n`!removestaff @user`\n`!stats` - Statistics',
                inline=False
            )
            
            view = View(timeout=None)
            view.add_item(Button(label='Create Tournament', emoji='🎮', style=discord.ButtonStyle.primary, custom_id='create_tournament_btn'))
            
            await staff_channel.send(embed=embed, view=view)
            print('✅ Staff panel posted')
        
        # How to join guide
        guide_channel = bot.get_channel(Config.HOW_TO_JOIN)
        if guide_channel:
            embed = discord.Embed(
                title='🎮 OTO Tournament Guide',
                description='**Complete guide to join and win!**',
                color=0x3498db
            )
            embed.add_field(
                name='1️⃣ Create Profile',
                value='Click button below or DM bot with format!',
                inline=False
            )
            embed.add_field(
                name='2️⃣ Invite Friends',
                value=f"Invite {Config.MIN_INVITES} friends = FREE entry forever!",
                inline=False
            )
            embed.add_field(
                name='3️⃣ Join Tournament',
                value=f"Go to <#{Config.TOURNAMENT_SCHEDULE}> and click JOIN!",
                inline=False
            )
            embed.add_field(
                name='4️⃣ Win Prizes',
                value='Play fair, win big! Get paid instantly! 💰',
                inline=False
            )
            embed.set_image(url='https://i.ibb.co/8XQkZhJ/freefire.png')
            
            view = View(timeout=None)
            view.add_item(Button(label='Create Profile', emoji='👤', style=discord.ButtonStyle.success, custom_id='create_profile_btn'))
            
            await guide_channel.send(embed=embed, view=view)
            print('✅ Guide posted')
    
    except Exception as e:
        print(f'⚠️ Setup messages error: {e}')

# ==================== ERROR HANDLING ====================
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        return
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.reply(f'❌ Missing: {error.param.name}')
    elif isinstance(error, commands.MemberNotFound):
        await ctx.reply('❌ Member not found!')
    else:
        await ctx.reply(f'❌ Error: {str(error)}')
        print(f'Error: {error}')

# ==================== RUN BOT ====================
if __name__ == '__main__':
    TOKEN = os.getenv('BOT_TOKEN') or os.getenv('DISCORD_TOKEN')
    
    if not TOKEN:
        print('❌ BOT_TOKEN not found!')
        print('Set BOT_TOKEN in environment or .env file')
        exit(1)
    
    try:
        bot.run(TOKEN)
    except Exception as e:
        print(f'❌ Failed to start: {e}')
        print('')
        print('⚠️ CHECK:')
        print('1. BOT_TOKEN is correct')
        print('2. All Privileged Intents enabled')
        print('3. Bot has proper permissions')
