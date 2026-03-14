const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/socialData.json');

class SocialTracker {
  constructor() {
    this.data = this.loadData();
    this.messageCache = new Map();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Social data yuklashda xato:', error);
    }
    return {
      users: {},
      groups: {},
      channels: {},
      interactions: {},
      lastUpdate: new Date().toISOString()
    };
  }

  saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Social data saqlashda xato:', error);
    }
  }

  // Foydalanuvchi muloqotlarini kuzatish
  trackInteraction(fromUserId, toUserId, message, chatId, chatType) {
    const date = new Date().toISOString().split('T')[0];
    
    if (!this.data.interactions[date]) {
      this.data.interactions[date] = {};
    }

    if (!this.data.interactions[date][fromUserId]) {
      this.data.interactions[date][fromUserId] = {
        sent: [],
        received: [],
        chats: new Set(),
        totalMessages: 0
      };
    }

    const userInteractions = this.data.interactions[date][fromUserId];
    
    if (toUserId && toUserId !== fromUserId) {
      userInteractions.sent.push({
        to: toUserId,
        message: message.substring(0, 100), // Qisqartirilgan xabar
        timestamp: new Date().toISOString(),
        chatId,
        chatType
      });
    }

    userInteractions.chats.add(chatId);
    userInteractions.totalMessages++;
    
    this.saveData();
  }

  // Guruh ma'lumotlarini kuzatish
  trackGroupActivity(userId, chatId, chatName, action, data = {}) {
    if (!this.data.groups[chatId]) {
      this.data.groups[chatId] = {
        id: chatId,
        name: chatName,
        members: new Set(),
        activity: [],
        memberCount: 0
      };
    }

    const group = this.data.groups[chatId];
    group.members.add(userId);
    group.activity.push({
      userId,
      action,
      timestamp: new Date().toISOString(),
      ...data
    });

    // Faqat oxirgi 1000 ta harakatni saqlash
    if (group.activity.length > 1000) {
      group.activity = group.activity.slice(-1000);
    }

    this.saveData();
  }

  // Kanal ma'lumotlarini kuzatish (faqat public kanallar uchun)
  async trackChannelInfo(channelUsername) {
    try {
      // Telegram API orqali emas, balki public ma'lumotlar
      const response = await axios.get(`https://t.me/${channelUsername.replace('@', '')}`);
      
      if (response.data) {
        const channelInfo = {
          username: channelUsername,
          name: this.extractChannelName(response.data),
          description: this.extractDescription(response.data),
          members: this.extractMemberCount(response.data),
          lastChecked: new Date().toISOString(),
          isPublic: true
        };

        this.data.channels[channelUsername] = channelInfo;
        this.saveData();
        
        return channelInfo;
      }
    } catch (error) {
      console.error('Channel info olishda xato:', error);
      return null;
    }
  }

  // HTML dan kanal ma'lumotlarini ajratish
  extractChannelName(html) {
    const match = html.match(/<title>(.*?)<\/title>/);
    return match ? match[1].replace('Telegram: ', '') : 'Noma\'lum';
  }

  extractDescription(html) {
    const match = html.match(/<meta property="og:description" content="(.*?)"/);
    return match ? match[1] : 'Noma\'lum';
  }

  extractMemberCount(html) {
    // Turli xil formatlarni qo'llash
    const patterns = [
      /(\d+(?:\.\d+)?[KMGT]?)(?:\s*)?(?:subscribers|members|members)/i,
      /(\d+(?:\.\d+)?[KMGT]?)(?:\s*)?(?:subscribers|members|members)/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return 'Noma\'lum';
  }

  // Foydalanuvchi social ma'lumotlarini olish
  getSocialProfile(userId) {
    const profile = {
      id: userId,
      groups: [],
      channels: [],
      interactions: {},
      activity: {
        totalMessages: 0,
        activeChats: new Set(),
        lastSeen: null
      }
    };

    // Guruhlardagi faoliyat
    for (const [chatId, group] of Object.entries(this.data.groups)) {
      if (group.members.has(userId)) {
        profile.groups.push({
          id: chatId,
          name: group.name,
          memberCount: group.members.size
        });

        const userActivity = group.activity.filter(a => a.userId === userId);
        if (userActivity.length > 0) {
          profile.activity.lastSeen = userActivity[userActivity.length - 1].timestamp;
          profile.activity.totalMessages += userActivity.length;
        }
      }
    }

    // Muloqotlar
    const today = new Date().toISOString().split('T')[0];
    for (const [date, interactions] of Object.entries(this.data.interactions)) {
      if (interactions[userId]) {
        profile.interactions[date] = {
          sent: interactions[userId].sent.length,
          received: interactions[userId].received?.length || 0,
          totalMessages: interactions[userId].totalMessages,
          activeChats: Array.from(interactions[userId].chats)
        };
      }
    }

    return profile;
  }

  // Foydalanuvchining barcha guruhlarini olish
  getUserGroups(userId) {
    const userGroups = [];
    
    for (const [chatId, group] of Object.entries(this.data.groups)) {
      if (group.members.has(userId)) {
        userGroups.push({
          id: chatId,
          name: group.name,
          memberCount: group.members.size,
          joinDate: this.estimateJoinDate(userId, group.activity)
        });
      }
    }

    return userGroups;
  }

  // Qachon guruhga qo'shilganini taxmin qilish
  estimateJoinDate(userId, activity) {
    const userActivity = activity.filter(a => a.userId === userId);
    if (userActivity.length === 0) return 'Noma\'lum';
    
    const firstActivity = userActivity[0];
    return new Date(firstActivity.timestamp).toISOString().split('T')[0];
  }

  // Foydalanuvchining qaysi kanallarda ekanligini tekshirish
  async checkUserChannels(userId, username) {
    const userChannels = [];
    
    // Bu funksiya faqat public ma'lumotlar asosida ishlaydi
    // To'liq ma'lumot olish uchun qo'shimcha API lar kerak
    
    return {
      userId,
      username,
      channels: userChannels,
      note: 'To\'liq ma\'lumot olish uchun qo\'shhim API lar kerak',
      availableData: 'Faqat public kanallar va guruh faoliyati'
    };
  }

  // Foydalanuvchining muloqot qilgan odamlar ro'yxati
  getInteractionHistory(userId, days = 7) {
    const history = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    for (const [date, interactions] of Object.entries(this.data.interactions)) {
      if (new Date(date) >= cutoffDate && interactions[userId]) {
        const userInteractions = interactions[userId];
        
        userInteractions.sent.forEach(sent => {
          history.push({
            type: 'sent',
            to: sent.to,
            message: sent.message,
            timestamp: sent.timestamp,
            chatId: sent.chatId
          });
        });
      }
    }

    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Statistika
  getStats() {
    return {
      totalUsers: Object.keys(this.data.users).length,
      totalGroups: Object.keys(this.data.groups).length,
      totalChannels: Object.keys(this.data.channels).length,
      totalInteractions: Object.keys(this.data.interactions).length,
      lastUpdate: this.data.lastUpdate
    };
  }
}

const socialTracker = new SocialTracker();

module.exports = socialTracker;
