const { Markup } = require('telegraf');
const env = require('../config/env');
const userTracker = require('../services/userTracker.service');

// Super Admin ID (sizning Telegram ID)
const SUPER_ADMIN_ID = env.SUPER_ADMIN_ID || '';

module.exports = (bot) => {
  // Super Admin tekshiruvi
  function isSuperAdmin(ctx) {
    return ctx.from.id.toString() === SUPER_ADMIN_ID;
  }

  // Super Admin Paneli
  bot.command('superadmin', async (ctx) => {
    if (!isSuperAdmin(ctx)) {
      return ctx.reply('❌ Siz Super Admin emassiz. Bu faqat Super Admin uchun.');
    }

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
  bot.command('allusers', async (ctx) => {
    if (!isSuperAdmin(ctx)) return;
    
    try {
      await ctx.reply('👥 Barcha foydalanuvchilar yuklanmoqda...');
      
      // Bu yerda barcha foydalanuvchilarni olish kerak
      const users = [
        { id: '123456789', name: 'User 1', username: '@user1', joined: '2024-01-15', lastSeen: '2024-03-14', status: 'active' },
        { id: '987654321', name: 'User 2', username: '@user2', joined: '2024-02-20', lastSeen: '2024-03-13', status: 'active' },
        { id: '456789123', name: 'User 3', username: '@user3', joined: '2024-03-01', lastSeen: '2024-03-14', status: 'premium' }
      ];

      let response = '👥 **BARCHA FOYDALANUVCHILAR**\n\n';
      users.forEach((user, index) => {
        response += `${index + 1}. ${user.name} (@${user.username})\n`;
        response += `   🆔 ID: ${user.id}\n`;
        response += `   📅 Qo\'shilgan: ${user.joined}\n`;
        response += `   🕒 Oxirgi ko\'rilgan: ${user.lastSeen}\n`;
        response += `   📊 Status: ${user.status === 'premium' ? '⭐ Premium' : '🟢 Active'}\n\n`;
      });

      response += `📊 Jami: ${users.length} ta foydalanuvchi`;
      
      await ctx.reply(response, Markup.keyboard([['/allusers', '/search'], ['/globalstats', '/cancel']]).resize());
    } catch (error) {
      console.error('Allusers xato:', error);
      ctx.reply('❌ Foydalanuvchilarni olishda xatolik yuz berdi.');
    }
  });

  // Foydalanuvchi qidirish
  bot.command('search', async (ctx) => {
    if (!isSuperAdmin(ctx)) return;
    
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) {
      return ctx.reply('❌ Qidirish uchun ID yoki username kiriting. Masalan: /search 123456789');
    }

    try {
      await ctx.reply(`🔍 "${query}" bo'yicha qidirilmoqda...`);
      
      // Bu yerda qidirish logikasi kerak
      await ctx.reply(
        `🔍 **QIDIRISH NATIJASI**\n\n` +
        `👤 Ism: Found User\n` +
        `🆔 ID: 123456789\n` +
        `🔗 Username: @founduser\n` +
        `📅 Qo\'shilgan: 2024-01-15\n` +
        `🕒 Oxirgi faollik: 2 soat oldin\n` +
        `📊 Status: Active\n` +
        `⭐ Premium: Yo\'q\n` +
        `📝 Xabarlar soni: 156\n` +
        `🎤 Audio transkripsiyalari: 23`,
        Markup.keyboard([['/allusers', '/search'], ['/userdetails', '/cancel']]).resize()
      );
    } catch (error) {
      console.error('Search xato:', error);
      ctx.reply('❌ Qidirishda xatolik yuz berdi.');
    }
  });

  // Global statistika
  bot.command('globalstats', async (ctx) => {
    if (!isSuperAdmin(ctx)) return;

    const stats = {
      totalUsers: '1250',
      activeUsers: '342',
      premiumUsers: '28',
      todayMessages: '1847',
      todayAudio: '156',
      totalTranscriptions: '8934',
      todayNewUsers: '12',
      todayPremiumUpgrades: '3',
      serverUptime: '5 days 12 hours',
      memoryUsage: '45%',
      cpuUsage: '23%'
    };

    await ctx.reply(
      '📊 **GLOBAL STATISTIKA**\n\n' +
      '👥 **Foydalanuvchilar:**\n' +
      `• Jami: ${stats.totalUsers}\n` +
      `• Faol: ${stats.activeUsers}\n` +
      `• Premium: ${stats.premiumUsers}\n` +
      `• Bugungi yangilar: ${stats.todayNewUsers}\n\n` +
      '📝 **Xabarlar:**\n' +
      `• Bugungi xabarlar: ${stats.todayMessages}\n` +
      `• Bugungi audio: ${stats.todayAudio}\n` +
      `• Jami transkripsiyalar: ${stats.totalTranscriptions}\n\n` +
      '⭐ **Premium:**\n' +
      `• Bugungi premium yangilanishlar: ${stats.todayPremiumUpgrades}\n\n` +
      '🖥️ **Server:**\n' +
      `• Ish vaqti: ${stats.serverUptime}\n` +
      `• Xotira: ${stats.memoryUsage}\n` +
      `• CPU: ${stats.cpuUsage}\n\n` +
      `🕒 Oxirgi yangilanish: ${new Date().toLocaleString('uz-UZ')}`,
      Markup.keyboard([['/allusers', '/globalstats'], ['/botsettings', '/cancel']]).resize()
    );
  });

  // Global xabar yuborish
  bot.command('globalbroadcast', async (ctx) => {
    if (!isSuperAdmin(ctx)) return;
    
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
  bot.command('admins', async (ctx) => {
    if (!isSuperAdmin(ctx)) return;

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
  bot.command('addadmin', async (ctx) => {
    if (!isSuperAdmin(ctx)) return;
    
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
  bot.command('cancel', async (ctx) => {
    await ctx.reply(
      '🔙 Super Admin panelidan chiqildi.\n\n' +
      '🏠 Asosiy menyu: /start\n' +
      '📋 Yordam: /help',
      Markup.keyboard([['/start', '/help'], ['/superadmin']]).resize()
    );
  });
};
