const userService = require('../services/userService.service');

module.exports = (bot) => {
  // Har bir xabarda foydalanuvchini kuzatish
  bot.use(async (ctx, next) => {
    try {
      // Foydalanuvchi ma'lumotlarini olish
      const user = ctx.from;
      
      if (user) {
        // Foydalanuvchi ma'lumotlarini saqlash
        const userData = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isBot: user.is_bot,
          messageCount: 1,
          audioCount: 0
        };
        
        // Avvalgi ma'lumotlarni olish
        const existingUsers = userService.getAllUsers();
        const existingUser = existingUsers.find(u => u.id === user.id);
        
        if (existingUser) {
          // Mavjud foydalanuvchini yangilash
          userData.messageCount = (existingUser.messageCount || 0) + 1;
          userData.audioCount = existingUser.audioCount || 0;
          userData.isPremium = existingUser.isPremium;
          userData.isBlocked = existingUser.isBlocked;
        }
        
        // Audio yuborilgani
        if (ctx.message?.voice || ctx.message?.audio) {
          userData.audioCount = (userData.audioCount || 0) + 1;
        }
        
        // Saqlash
        userService.saveUser(userData);
      }
    } catch (error) {
      console.error('User tracker xato:', error);
    }
    
    return next();
  });
};
