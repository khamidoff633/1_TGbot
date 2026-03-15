const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Data papkani yaratish
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Foydalanuvchilarni saqlash
function saveUser(userData) {
  ensureDataDir();
  
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (error) {
      console.error('Users faylini o\'qish xato:', error);
      users = [];
    }
  }
  
  const existingUserIndex = users.findIndex(u => u.id === userData.id);
  
  if (existingUserIndex >= 0) {
    // Mavjud foydalanuvchini yangilash
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...userData,
      lastSeen: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else {
    // Yangi foydalanuvchi qo'shish
    users.push({
      ...userData,
      joined: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Users faylini yozish xato:', error);
    return false;
  }
}

// Barcha foydalanuvchilarni olish
function getAllUsers() {
  ensureDataDir();
  
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return users.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  } catch (error) {
    console.error('Users faylini o\'qish xato:', error);
    return [];
  }
}

// Foydalanuvchini qidirish
function searchUser(query) {
  const users = getAllUsers();
  
  return users.filter(user => {
    const searchStr = query.toLowerCase();
    return (
      user.id.toString().includes(searchStr) ||
      (user.username && user.username.toLowerCase().includes(searchStr)) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchStr)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchStr))
    );
  });
}

// Faol foydalanuvchilarni olish (so'ngi 7 kun)
function getActiveUsers() {
  const users = getAllUsers();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return users.filter(user => {
    const lastSeen = new Date(user.lastSeen);
    return lastSe >= sevenDaysAgo;
  });
}

// Yangi foydalanuvchilarni olish (so'ngi 24 soat)
function getNewUsers() {
  const users = getAllUsers();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  return users.filter(user => {
    const joined = new Date(user.joined);
    return joined >= oneDayAgo;
  });
}

// Statistikani olish
function getStats() {
  const users = getAllUsers();
  const activeUsers = getActiveUsers();
  const newUsers = getNewUsers();
  
  return {
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    newUsers: newUsers.length,
    premiumUsers: users.filter(u => u.isPremium).length,
    blockedUsers: users.filter(u => u.isBlocked).length
  };
}

// Foydalanuvchini bloklash
function blockUser(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id.toString() === userId.toString());
  
  if (userIndex >= 0) {
    users[userIndex].isBlocked = true;
    users[userIndex].blockedAt = new Date().toISOString();
    users[userIndex].updatedAt = new Date().toISOString();
    
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Block user xato:', error);
      return false;
    }
  }
  
  return false;
}

// Foydalanuvchini blokdan chiqarish
function unblockUser(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id.toString() === userId.toString());
  
  if (userIndex >= 0) {
    delete users[userIndex].isBlocked;
    delete users[userIndex].blockedAt;
    users[userIndex].updatedAt = new Date().toISOString();
    
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Unblock user xato:', error);
      return false;
    }
  }
  
  return false;
}

module.exports = {
  saveUser,
  getAllUsers,
  searchUser,
  getActiveUsers,
  getNewUsers,
  getStats,
  blockUser,
  unblockUser
};
