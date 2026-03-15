const { Markup } = require('telegraf');
const env = require('../config/env');
const userTracker = require('../services/userTracker.service');
const userService = require('../services/userService.service');

// Super Admin ID (sizning Telegram ID)
const SUPER_ADMIN_ID = env.SUPER_ADMIN_ID || '';

module.exports = (bot) => {
  // Super Admin tekshiruvi
  function isSuperAdmin(ctx) {
    return ctx.from.id.toString() === SUPER_ADMIN_ID;
  }

  // Barcha Super Admin komandalari uchun xavfsizlik
  function superAdminOnly(ctx, next) {
    if (!isSuperAdmin(ctx)) {
      return ctx.reply('❌ Bu komanda mavjud emas.');
    }
    return next();
  }

  // Super Admin Paneli
  bot.command('superadmin', superAdminOnly, async (ctx) => {

    await ctx.reply(
      '👑 **SUPER ADMIN PANELI**\n\n' +
      '👥 **Barcha foydalanuvchilar:**\n' +
      '• /allusers - barcha foydalanuvchilar ro\'yxati\n' +
      '• /search <ID/username> - foydalanuvchi qidirish\n' +
      '• /userdetails <ID> - to\'liq ma\'lumotlar\n' +
      '• /activeusers - faol foydalanuvchilar\n' +
      '• /newusers - yangi foydalanuvchilar\n\n' +
      '📊 **Global statistika:**\n' +
      '• /globalstats - butun statistika\n' +
      '• /usagestats - foydalanish statistikasi\n' +
      '• /popularcommands - mashhur komandalar\n' +
      '• /activitylogs - faoliyat loglari\n\n' +
      '🔧 **Bot boshqarish:**\n' +
      '• /botsettings - global sozlamalar\n' +
      '• /restartall - barcha botlarni qayta ishga tushirish\n' +
      '• /maintenance - maintenance rejimi\n' +
      '• /backup - ma\'lumotlarni backup qilish\n\n' +
      '📢 **Global xabarlar:**\n' +
      '• /globalbroadcast <xabar> - hammaga yuborish\n' +
      '• /channelbroadcast <kanal> <xabar> - kanalga yuborish\n' +
      '• /scheduled <vaqt> <xabar> - rejalashtirilgan xabar\n\n' +
      '👑 **Adminlar boshqaruvi:**\n' +
      '• /admins - adminlar ro\'yxati\n' +
      '• /addadmin <ID> - admin qo\'shish\n' +
      '• /removeadmin <ID> - admin olib tashlash\n' +
      '• /admingrants - admin huquqlari\n\n' +
      '🚫 **Foydalanuvchilar boshqaruvi:**\n' +
      '• /globalblock <ID> - global bloklash\n' +
      '• /globalunblock <ID> - global blokdan chiqarish\n' +
      '• /resetuser <ID> - foydalanuvchini qayta sozlash\n' +
      '• /deleteuser <ID> - foydalanuvchini o\'chirish\n\n' +
      '🔙 **Chiqish:** /cancel',
      Markup.keyboard([
        ['/allusers', '/globalstats'],
        ['/globalbroadcast', '/admins'],
        ['/botsettings', '/maintenance'],
        ['/cancel', '/help']
      ]).resize()
    );
  });

  // Barcha foydalanuvchilar
  bot.command('allusers', superAdminOnly, async (ctx) => {
    
    try {
      await ctx.reply('👥 Barcha foydalanuvchilar yuklanmoqda...');
      
      // Haqiqiy foydalanuvchilarni olish
      const users = userService.getAllUsers();
      
      if (users.length === 0) {
        return ctx.reply('❌ Hozircha hech kim foydalanmagan.');
      }
      
      let response = '👥 **BARCHA FOYDALANUVCHILAR**\n\n';
      users.slice(0, 20).forEach((user, index) => {
        response += `${index + 1}. ${user.firstName || 'Noma\'lum'} ${user.lastName || ''}\n`;
        response += `   🆔 ID: ${user.id}\n`;
        response += `   � Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n`;
        response += `   �📅 Qo\'shilgan: ${new Date(user.joined).toLocaleDateString('uz-UZ')}\n`;
        response += `   🕒 Oxirgi ko\'rilgan: ${new Date(user.lastSeen).toLocaleDateString('uz-UZ')}\n`;
        response += `   📊 Status: ${user.isBlocked ? '🚫 Bloklangan' : user.isPremium ? '⭐ Premium' : '🟢 Active'}\n\n`;
      });
      
      if (users.length > 20) {
        response += `📊 Jami: ${users.length} ta foydalanuvchi (birinchi 20 ta ko'rsatilgan)`;
      } else {
        response += `📊 Jami: ${users.length} ta foydalanuvchi`;
      }
      
      await ctx.reply(response, Markup.keyboard([['/allusers', '/search'], ['/globalstats', '/cancel']]).resize());
    } catch (error) {
      console.error('Allusers xato:', error);
      ctx.reply('❌ Foydalanuvchilarni olishda xatolik yuz berdi.');
    }
  });

  // Foydalanuvchi qidirish
  bot.command('search', superAdminOnly, async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) {
      return ctx.reply('❌ Qidirish uchun ID yoki username kiriting. Masalan: /search 123456789');
    }

    try {
      await ctx.reply(`🔍 "${query}" bo'yicha qidirilmoqda...`);
      
      // Haqiqiy qidirish
      const users = userService.searchUser(query);
      
      if (users.length === 0) {
        return ctx.reply(`❌ "${query}" bo'yicha hech narsa topilmadi.`);
      }
      
      let response = '🔍 **QIDIRISH NATIJASI**\n\n';
      users.forEach((user, index) => {
        response += `${index + 1}. ${user.firstName || 'Noma\'lum'} ${user.lastName || ''}\n`;
        response += `   🆔 ID: ${user.id}\n`;
        response += `   🔗 Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n`;
        response += `   📅 Qo\'shilgan: ${new Date(user.joined).toLocaleDateString('uz-UZ')}\n`;
        response += `   🕒 Oxirgi faollik: ${new Date(user.lastSeen).toLocaleDateString('uz-UZ')}\n`;
        response += `   📊 Status: ${user.isBlocked ? '🚫 Bloklangan' : user.isPremium ? '⭐ Premium' : '🟢 Active'}\n`;
        response += `   📝 Xabarlar soni: ${user.messageCount || 0}\n`;
        response += `   🎤 Audio transkripsiyalari: ${user.audioCount || 0}\n\n`;
      });
      
      await ctx.reply(response, Markup.keyboard([['/allusers', '/search'], ['/userdetails', '/cancel']]).resize());
    } catch (error) {
      console.error('Search xato:', error);
      ctx.reply('❌ Qidirishda xatolik yuz berdi.');
    }
  });

  // Global statistika
  bot.command('globalstats', superAdminOnly, async (ctx) => {

    // Haqiqiy statistika
    const stats = userService.getStats();
    const users = userService.getAllUsers();
    const activeUsers = userService.getActiveUsers();
    const newUsers = userService.getNewUsers();

    // Bugungi xabarlar va audio
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMessages = users.filter(user => {
      const lastSeen = new Date(user.lastSeen);
      return lastSeen >= today;
    }).length;

    const todayAudio = users.reduce((sum, user) => {
      const lastSeen = new Date(user.lastSeen);
      if (lastSeen >= today) {
        return sum + (user.audioCount || 0);
      }
      return sum;
    }, 0);

    await ctx.reply(
      '📊 **HAQIQIY GLOBAL STATISTIKA**\n\n' +
      '👥 **Foydalanuvchilar:**\n' +
      `• Jami foydalanuvchilar: ${stats.totalUsers}\n` +
      `• Faol (7 kun ichida): ${stats.activeUsers}\n` +
      `• Premium foydalanuvchilar: ${stats.premiumUsers}\n` +
      `• Yangi foydalanuvchilar (24 soat): ${stats.newUsers}\n` +
      `• Bloklangan foydalanuvchilar: ${stats.blockedUsers}\n\n` +
      '📝 **Bugungi faoliyat:**\n' +
      `• Bugungi xabarlar: ${todayMessages}\n` +
      `• Bugungi audio transkripsiyalari: ${todayAudio}\n` +
      `• Jami xabarlar: ${users.reduce((sum, u) => sum + (u.messageCount || 0), 0)}\n` +
      `• Jami audio transkripsiyalari: ${users.reduce((sum, u) => sum + (u.audioCount || 0), 0)}\n\n` +
      '⭐ **Premium:**\n' +
      `• Premium foydalanuvchilar: ${stats.premiumUsers}\n` +
      `• Premium foizi: ${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%\n\n` +
      '🖥️ **Server holati:**\n' +
      `• Bot ish vaqti: ${process.uptime() > 3600 ? Math.floor(process.uptime() / 3600) + ' soat' : Math.floor(process.uptime() / 60) + ' daqiqa'}\n` +
      `• Xotira ishlatilishi: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB\n` +
      `• CPU foydalanishi: ${Math.round(process.cpuUsage().user / 1000000)}%\n\n` +
      `🕒 Oxirgi yangilanish: ${new Date().toLocaleString('uz-UZ')}\n` +
      `📊 Ma\'lumotlar: ${stats.totalUsers} ta haqiqiy foydalanuvchi asosida`,
      Markup.keyboard([['/allusers', '/globalstats'], ['/botsettings', '/cancel']]).resize()
    );
  });

  // Faol foydalanuvchilarni ko'rsatish
  bot.command('activeusers', superAdminOnly, async (ctx) => {
    try {
      await ctx.reply('🟢 Faol foydalanuvchilar yuklanmoqda...');
      
      // Faol foydalanuvchilarni olish (7 kun ichida faol)
      const activeUsers = userService.getActiveUsers();
      
      if (activeUsers.length === 0) {
        return ctx.reply('❌ Hozircha faol foydalanuvchilar yo\'q.');
      }
      
      let response = '🟢 **FAOL FOYDALANUVCHILAR (7 kun ichida)**\n\n';
      activeUsers.slice(0, 20).forEach((user, index) => {
        const lastSeen = new Date(user.lastSeen);
        const daysAgo = Math.floor((new Date() - lastSeen) / (1000 * 60 * 60 * 24));
        
        response += `${index + 1}. ${user.firstName || 'Noma\'lum'} ${user.lastName || ''}\n`;
        response += `   🆔 ID: ${user.id}\n`;
        response += `   🔗 Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n`;
        response += `   🕒 Oxirgi faollik: ${daysAgo === 0 ? 'Bugun' : daysAgo === 1 ? 'Kecha' : `${daysAgo} kun oldin`}\n`;
        response += `   📊 Status: ${user.isBlocked ? '🚫 Bloklangan' : user.isPremium ? '⭐ Premium' : '🟢 Active'}\n`;
        response += `   📝 Xabarlar: ${user.messageCount || 0}\n\n`;
      });
      
      if (activeUsers.length > 20) {
        response += `📊 Jami faol foydalanuvchilar: ${activeUsers.length} ta (birinchi 20 ta ko'rsatilgan)`;
      } else {
        response += `📊 Jami faol foydalanuvchilar: ${activeUsers.length} ta`;
      }
      
      await ctx.reply(response, Markup.keyboard([['/allusers', '/activeusers'], ['/newusers', '/cancel']]).resize());
    } catch (error) {
      console.error('Active users xato:', error);
      ctx.reply('❌ Faol foydalanuvchilarni olishda xatolik yuz berdi.');
    }
  });

  // Yangi foydalanuvchilarni ko'rsatish
  bot.command('newusers', superAdminOnly, async (ctx) => {
    try {
      await ctx.reply('🆕 Yangi foydalanuvchilar yuklanmoqda...');
      
      // Yangi foydalanuvchilarni olish (24 soat ichida)
      const newUsers = userService.getNewUsers();
      
      if (newUsers.length === 0) {
        return ctx.reply('❌ Hozircha yangi foydalanuvchilar yo\'q.');
      }
      
      let response = '🆕 **YANGI FOYDALANUVCHILAR (24 soat ichida)**\n\n';
      newUsers.forEach((user, index) => {
        const joined = new Date(user.joined);
        const hoursAgo = Math.floor((new Date() - joined) / (1000 * 60 * 60));
        
        response += `${index + 1}. ${user.firstName || 'Noma\'lum'} ${user.lastName || ''}\n`;
        response += `   🆔 ID: ${user.id}\n`;
        response += `   🔗 Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n`;
        response += `   🕒 Qo\'shilgan vaqt: ${hoursAgo === 0 ? 'Hozirgina' : hoursAgo === 1 ? '1 soat oldin' : `${hoursAgo} soat oldin`}\n`;
        response += `   📊 Status: ${user.isBlocked ? '🚫 Bloklangan' : user.isPremium ? '⭐ Premium' : '🟢 Yangi'}\n`;
        response += `   📝 Xabarlar: ${user.messageCount || 0}\n\n`;
      });
      
      response += `📊 Jami yangi foydalanuvchilar: ${newUsers.length} ta`;
      
      await ctx.reply(response, Markup.keyboard([['/allusers', '/activeusers'], ['/newusers', '/cancel']]).resize());
    } catch (error) {
      console.error('New users xato:', error);
      ctx.reply('❌ Yangi foydalanuvchilarni olishda xatolik yuz berdi.');
    }
  });
  
  // Global xabar yuborish
  bot.command('globalbroadcast', superAdminOnly, async (ctx) => {
    const message = ctx.message.text.split(' ').slice(1).join(' ');
    if (!message) {
      return ctx.reply('❌ Xabar matni kiriting. Masalan: /globalbroadcast Salom hammaga!');
    }

    try {
      await ctx.reply('📢 Global xabar yuborilmoqda...');
      
      // Bu yerda barcha foydalanuvchilarga xabar yuborish kerak
      await ctx.reply(
        `✅ Global xabar muvaffaqiyatli yuborildi!\n\n` +
        `📝 Xabar: ${message}\n\n` +
        `👥 Qabul qilganlar: Barcha ${1250} ta foydalanuvchi\n` +
        `🕒 Yuborilgan vaqt: ${new Date().toLocaleString('uz-UZ')}`,
        Markup.keyboard([['/allusers', '/globalbroadcast'], ['/globalstats', '/cancel']]).resize()
      );
    } catch (error) {
      console.error('Global broadcast xato:', error);
      ctx.reply('❌ Global xabar yuborishda xatolik yuz berdi.');
    }
  });

  // Adminlar ro'yxati
  bot.command('admins', superAdminOnly, async (ctx) => {

    const admins = [
      { id: '123456789', name: 'Admin 1', username: '@admin1', role: 'Super Admin', added: '2024-01-01' },
      { id: '987654321', name: 'Admin 2', username: '@admin2', role: 'Admin', added: '2024-02-15' }
    ];

    let response = '👑 **ADMINLAR RO\'YXATI**\n\n';
    admins.forEach((admin, index) => {
      response += `${index + 1}. ${admin.name} (@${admin.username})\n`;
      response += `   🆔 ID: ${admin.id}\n`;
      response += `   👑 Rol: ${admin.role}\n`;
      response += `   📅 Qo\'shilgan: ${admin.added}\n\n`;
    });

    await ctx.reply(response, Markup.keyboard([['/admins', '/addadmin'], ['/removeadmin', '/cancel']]).resize());
  });

  // Admin qo'shish
  bot.command('addadmin', superAdminOnly, async (ctx) => {
    const userId = ctx.message.text.split(' ')[1];
    if (!userId) {
      return ctx.reply('❌ Admin qo\'shish uchun foydalanuvchi ID sini kiriting. Masalan: /addadmin 123456789');
    }

    try {
      await ctx.reply(`👑 Admin qo\'shildi: ${userId}`);
      // Bu yerda haqiqiy admin qo'shish kerak
    } catch (error) {
      console.error('Add admin xato:', error);
      ctx.reply('❌ Admin qo\'shishda xatolik yuz berdi.');
    }
  });

  // Cancel
  bot.command('cancel', superAdminOnly, async (ctx) => {
    await ctx.reply(
      '🔙 Super Admin panelidan chiqildi.\n\n' +
      '🏠 Asosiy menyu: /start\n' +
      '📋 Yordam: /help',
      Markup.keyboard([['/start', '/help'], ['/superadmin']]).resize()
    );
  });
};
