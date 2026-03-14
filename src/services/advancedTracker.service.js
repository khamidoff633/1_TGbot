const axios = require('axios');
const userTracker = require('./userTracker.service');

class AdvancedTracker {
  constructor() {
    this.sessionData = new Map();
    this.groupData = new Map();
  }

  // Guruhdagi barcha foydalanuvchilarni olish
  async getGroupMembers(bot, chatId) {
    try {
      const admins = await bot.telegram.getChatAdministrators(chatId);
      const members = [];
      
      for (const admin of admins) {
        members.push({
          id: admin.user.id,
          name: admin.user.first_name + (admin.user.last_name ? ' ' + admin.user.last_name : ''),
          username: admin.user.username,
          status: admin.status,
          title: admin.custom_title || 'Admin'
        });
      }
      
      return members;
    } catch (error) {
      console.error('Group members olishda xato:', error);
      return [];
    }
  }

  // Foydalanuvchi haqida jamlangan ma'lumot
  async getComprehensiveUserInfo(bot, userId, username) {
    const userInfo = userTracker.getUserInfo(userId);
    const result = {
      id: userId,
      username: username,
      trackerInfo: userInfo,
      groups: [],
      activity: [],
      estimatedData: this.estimateUserData(userId, username)
    };

    // Guruhlardagi ma'lumotlarni yig'ish
    for (const [chatId, chatData] of this.groupData) {
      const member = chatData.members.find(m => m.id === userId);
      if (member) {
        result.groups.push({
          chatId,
          chatName: chatData.name,
          joinedAt: member.joinedAt,
          lastSeen: member.lastSeen,
          messageCount: member.messageCount
        });
      }
    }

    return result;
  }

  // Foydalanuvchi ma'lumotlarini taxmin qilish
  estimateUserData(userId, username) {
    const userInfo = userTracker.getUserInfo(userId);
    
    if (!userInfo) {
      return {
        estimatedJoinDate: 'Noma\'lum',
        estimatedUsernameChanges: 0,
        estimatedNameChanges: 0,
        confidence: 'low'
      };
    }

    const firstSeen = new Date(userInfo.firstSeen);
    const lastSeen = new Date(userInfo.lastSeen);
    const daysActive = Math.ceil((lastSeen - firstSeen) / (1000 * 60 * 60 * 24));
    
    return {
      estimatedJoinDate: firstSeen.toISOString().split('T')[0],
      estimatedUsernameChanges: userInfo.usernameHistory.length,
      estimatedNameChanges: userInfo.nameHistory.length,
      daysActive: daysActive,
      averageActivityPerDay: daysActive > 0 ? Math.round(daysActive / 7) : 0,
      confidence: 'high'
    };
  }

  // Guruh faoliyatini kuzatish
  trackGroupActivity(chatId, userId, action, data = {}) {
    if (!this.groupData.has(chatId)) {
      this.groupData.set(chatId, {
        id: chatId,
        name: data.chatName || 'Unknown',
        members: [],
        messages: []
      });
    }

    const group = this.groupData.get(chatId);
    
    let member = group.members.find(m => m.id === userId);
    if (!member) {
      member = {
        id: userId,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        messageCount: 0,
        actions: []
      };
      group.members.push(member);
    }

    member.lastSeen = new Date().toISOString();
    member.messageCount++;
    member.actions.push({
      action,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Username o'zgarishlarini kuzatish (faqat guruh ichida)
  trackUsernameChange(chatId, userId, oldUsername, newUsername) {
    this.trackGroupActivity(chatId, userId, 'username_change', {
      oldUsername,
      newUsername
    });
  }

  // Ism o'zgarishlarini kuzatish
  trackNameChange(chatId, userId, oldName, newName) {
    this.trackGroupActivity(chatId, userId, 'name_change', {
      oldName,
      newName
    });
  }

  // Kanallarni kuzatish (faqat admin bo'lgan kanallar uchun)
  async trackChannelActivity(bot, channelId) {
    try {
      const chat = await bot.telegram.getChat(channelId);
      return {
        id: chat.id,
        title: chat.title,
        type: chat.type,
        memberCount: chat.member_count || 'Noma\'lum',
        isBotAdmin: true,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      console.error('Channel info olishda xato:', error);
      return null;
    }
  }

  // Foydalanuvchi ma'lumotlarini eksport qilish
  exportUserData(userId) {
    const userInfo = userTracker.getUserInfo(userId);
    const comprehensive = this.getComprehensiveUserInfo(null, userId, userInfo?.currentUsername);
    
    return {
      exportDate: new Date().toISOString(),
      userId: userId,
      data: comprehensive,
      disclaimer: 'Bu ma\'lumotlar faqat bot bilan muloqot qilgan vaqtdagi kuzatuv asosida'
    };
  }
}

const advancedTracker = new AdvancedTracker();

module.exports = advancedTracker;
