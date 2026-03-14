const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Foydalanuvchi ma'lumotlarini saqlash
class UserTracker {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('User data yuklashda xato:', error);
    }
    return {};
  }

  saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('User data saqlashda xato:', error);
    }
  }

  // Foydalanuvchi ma'lumotlarini yangilash
  updateUser(userInfo) {
    const userId = userInfo.id;
    
    if (!this.data[userId]) {
      this.data[userId] = {
        id: userId,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        nameHistory: [],
        usernameHistory: [],
        currentName: userInfo.first_name,
        currentUsername: userInfo.username
      };
    }

    const user = this.data[userId];
    const now = new Date().toISOString();
    
    // Ism o'zgarishini kuzatish
    if (userInfo.first_name !== user.currentName) {
      user.nameHistory.push({
        name: user.currentName,
        changedAt: user.lastSeen
      });
      user.currentName = userInfo.first_name;
    }

    // Username o'zgarishini kuzatish
    if (userInfo.username !== user.currentUsername) {
      if (user.currentUsername) {
        user.usernameHistory.push({
          username: user.currentUsername,
          changedAt: user.lastSeen
        });
      }
      user.currentUsername = userInfo.username;
    }

    user.lastSeen = now;
    this.saveData();
    
    return user;
  }

  // Foydalanuvchi ma'lumotlarini olish
  getUserInfo(userId) {
    return this.data[userId] || null;
  }

  // Barcha foydalanuvchilar ro'yxati
  getAllUsers() {
    return Object.values(this.data);
  }

  // Foydalanuvchi statistikasi
  getUserStats(userId) {
    const user = this.data[userId];
    if (!user) return null;

    return {
      id: user.id,
      firstSeen: user.firstSeen,
      lastSeen: user.lastSeen,
      totalNameChanges: user.nameHistory.length,
      totalUsernameChanges: user.usernameHistory.length,
      currentName: user.currentName,
      currentUsername: user.currentUsername,
      nameHistory: user.nameHistory,
      usernameHistory: user.usernameHistory
    };
  }
}

const userTracker = new UserTracker();

module.exports = userTracker;
