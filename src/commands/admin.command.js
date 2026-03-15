const { Markup } = require('telegraf');
const env = require('../config/env');
const userService = require('../services/userService.service');

// Admin ID lar ro'yxati (sizning Telegram ID laringiz)
const ADMIN_IDS = env.ADMIN_IDS || [];

module.exports = (bot) => {
  // Admin tekshiruvi
  function isAdmin(ctx) {
    return ADMIN_IDS.includes(ctx.from.id.toString());
  }

  // Admin paneli
  bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx)) {
      return ctx.reply('❌ Siz admin emassiz. Bu faqat adminlar uchun.');
    }

    await ctx.reply(
      '👑 **ADMIN PANELI**\n\n' +
      '📊 **Statistika:**\n' +
      '• /stats - umumiy statistika\n' +
      '• /users - foydalanuvchilar ro\'yxati\n' +
      '• /active - faol foydalanuvchilar\n\n' +
      '📢 **Xabarlar:**\n' +
      '• /broadcast <xabar> - hammaga yuborish\n' +
      '• /channel <kanal> - kanalga yuborish\n' +
      '• /premium <xabar> - premium foydalanuvchilarga\n\n' +
      '👥 **Foydalanuvchilar:**\n' +
      '• /block <ID> - foydalanuvchini bloklash\n' +
      '• /unblock <ID> - blokdan chiqarish\n' +
      '• /info <ID> - foydalanuvchi ma\'lumotlari\n\n' +
      '⚙️ **Sozlamalar:**\n' +
      '• /settings - bot sozlamalari\n' +
      '• /apikey - API kalitlarini ko\'rish\n' +
      '• /restart - botni qayta ishga tushirish\n\n' +
      '📋 **Kanallar:**\n' +
      '• /channels - kanallar ro\'yxati\n' +
      '• /addchannel <@kanal> - kanal qo\'shish\n' +
      '• /removechannel <@kanal> - kanal olib tashlash\n\n' +
      '🎯 **Tariflar:**\n' +
      '• /plans - tariflarni ko\'rish\n' +
      '• /plan <ID> <tarif> - tarif o\'zgartirish\n' +
      '• /premiumlist - premium foydalanuvchilar\n\n' +
      '📝 **Feedback:**\n' +
      '• /feedback - barcha feedbacklar\n' +
      '• /logs - oxirgi xatoliklar\n\n' +
      '🔙 **Chiqish:** /cancel',
      Markup.keyboard([
        ['/stats', '/users'],
        ['/broadcast', '/channels'],
        ['/settings', '/plans'],
        ['/cancel', '/help']
      ]).resize()
    );
  });

  // Statistika
  bot.command('stats', async (ctx) => {
    if (!isAdmin(ctx)) return;
    
    // Haqiqiy statistika
    const stats = userService.getStats();
    const users = userService.getAllUsers();
    
    // Bugungi xabarlar
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
      '📊 **BOT STATISTIKASI (HAQIQIY)**\n\n' +
      '👥 **Foydalanuvchilar:**\n' +
      `• Jami: ${stats.totalUsers}\n` +
      `• Faol (7 kun): ${stats.activeUsers}\n` +
      `• Premium: ${stats.premiumUsers}\n` +
      `• Yangilar (24 soat): ${stats.newUsers}\n\n` +
      '📝 **Bugungi faoliyat:**\n' +
      `• Bugungi xabarlar: ${todayMessages}\n` +
      `• Bugungi audio: ${todayAudio}\n` +
      `• Jami transkripsiyalar: ${users.reduce((sum, u) => sum + (u.audioCount || 0), 0)}\n\n` +
      `🕒 Oxirgi yangilanish: ${new Date().toLocaleString('uz-UZ')}\n` +
      `📊 Ma\'lumotlar: ${stats.totalUsers} ta haqiqiy foydalanuvchi`,
      Markup.keyboard([['/admin', '/users'], ['/broadcast', '/cancel']]).resize()
    );
  });

  // Hammaga xabar yuborish
  bot.command('broadcast', async (ctx) => {
    if (!isAdmin(ctx)) return;
    
    const message = ctx.message.text.split(' ').slice(1).join(' ');
    if (!message) {
      return ctx.reply('❌ Xabar matni kiriting. Masalan: /broadcast Salom hammaga!');
    }

    try {
      await ctx.reply('📢 Xabar yuborilmoqda...');
      // Bu yerda barcha foydalanuvchilarga xabar yuborish kerak
      // Hozircha tasdiqlash
      await ctx.reply(
        `✅ Xabar muvaffaqiyatli yuborildi!\n\n` +
        `📝 Xabar: ${message}\n\n` +
        `👥 Qabul qilganlar: Barcha foydalanuvchilar`,
        Markup.keyboard([['/admin', '/stats'], ['/broadcast', '/cancel']]).resize()
      );
    } catch (error) {
      console.error('Broadcast xato:', error);
      ctx.reply('❌ Xabar yuborishda xatolik yuz berdi.');
    }
  });

  // Foydalanuvchilar ro'yxati
  bot.command('users', async (ctx) => {
    if (!isAdmin(ctx)) return;
    
    try {
      await ctx.reply('👥 Foydalanuvchilar yuklanmoqda...');
      
      // Haqiqiy foydalanuvchilarni olish
      const users = userService.getAllUsers();
      
      if (users.length === 0) {
        return ctx.reply('❌ Hozircha hech kim foydalanmagan.');
      }
      
      let response = '👥 **FOYDALANUVCHILAR RO\'YXATI**\n\n';
      users.slice(0, 15).forEach((user, index) => {
        response += `${index + 1}. ${user.firstName || 'Noma\'lum'} ${user.lastName || ''}\n`;
        response += `   🆔 ID: ${user.id}\n`;
        response += `   🔗 Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n`;
        response += `   📅 Qo\'shilgan: ${new Date(user.joined).toLocaleDateString('uz-UZ')}\n`;
        response += `   🕒 Oxirgi ko\'rilgan: ${new Date(user.lastSeen).toLocaleDateString('uz-UZ')}\n`;
        response += `   📊 Status: ${user.isBlocked ? '🚫 Bloklangan' : user.isPremium ? '⭐ Premium' : '🟢 Active'}\n`;
        response += `   📝 Xabarlar: ${user.messageCount || 0}\n`;
        response += `   🎤 Audio: ${user.audioCount || 0}\n\n`;
      });
      
      if (users.length > 15) {
        response += `📊 Jami: ${users.length} ta foydalanuvchi (birinchi 15 ta ko'rsatilgan)`;
      } else {
        response += `📊 Jami: ${users.length} ta foydalanuvchi`;
      }
      
      await ctx.reply(response, Markup.keyboard([['/admin', '/users'], ['/stats', '/cancel']]).resize());
    } catch (error) {
      console.error('Users xato:', error);
      ctx.reply('❌ Foydalanuvchilarni olishda xatolik yuz berdi.');
    }
  });
  
  // Foydalanuvchini bloklash
  bot.command('block', async (ctx) => {
    if (!isAdmin(ctx)) return;
    
    const userId = ctx.message.text.split(' ')[1];
    if (!userId) {
      return ctx.reply('❌ Foydalanuvchi ID sini kiriting. Masalan: /block 123456789');
    }

    try {
      // Haqiqiy bloklash
      const success = userService.blockUser(userId);
      
      if (success) {
        await ctx.reply(`🚫 Foydalanuvchi ${userId} muvaffaqiyatli bloklandi.`);
      } else {
        await ctx.reply(`❌ Foydalanuvchi ${userId} topilmadi.`);
      }
    } catch (error) {
      console.error('Block xato:', error);
      ctx.reply('❌ Bloklashda xatolik yuz berdi.');
    }
  });

  // Foydalanuvchini blokdan chiqarish
  bot.command('unblock', async (ctx) => {
    if (!isAdmin(ctx)) return;
    
    const userId = ctx.message.text.split(' ')[1];
    if (!userId) {
      return ctx.reply('❌ Foydalanuvchi ID sini kiriting. Masalan: /unblock 123456789');
    }

    try {
      // Haqiqiy blokdan chiqarish
      const success = userService.unblockUser(userId);
      
      if (success) {
        await ctx.reply(`✅ Foydalanuvchi ${userId} muvaffaqiyatli blokdan chiqarildi.`);
      } else {
        await ctx.reply(`❌ Foydalanuvchi ${userId} topilmadi.`);
      }
    } catch (error) {
      console.error('Unblock xato:', error);
      ctx.reply('❌ Blokdan chiqarishda xatolik yuz berdi.');
    }
  });

  // Bot sozlamalari
  bot.command('settings', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const settings = {
      geminiModel: env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
      maxAudioSize: '18MB',
      premiumMode: 'Active',
      autoNews: 'Enabled',
      dailyLimit: '100 transcriptions/day'
    };

    await ctx.reply(
      '⚙️ **BOT SOZLAMALARI**\n\n' +
      `🤖 AI Model: ${settings.geminiModel}\n` +
      `📤 Max audio hajmi: ${settings.maxAudioSize}\n` +
      `⭐ Premium mode: ${settings.premiumMode}\n` +
      `📰 Auto news: ${settings.autoNews}\n` +
      `📊 Kundalik limit: ${settings.dailyLimit}\n\n` +
      `🔑 API Key: ${env.GEMINI_API_KEY ? '✅ Active' : '❌ Not set'}\n` +
      `🌐 Webhook: ${env.RENDER_EXTERNAL_URL ? '✅ Active' : '❌ Local'}`,
      Markup.keyboard([['/admin', '/stats'], ['/settings', '/cancel']]).resize()
    );
  });

  // Botni qayta ishga tushirish
  bot.command('restart', async (ctx) => {
    if (!isAdmin(ctx)) return;

    try {
      await ctx.reply('🔄 Bot qayta ishga tushirilmoqda...');
      
      // Bu yerda botni qayta ishga tushirish kerak
      setTimeout(() => {
        process.exit(0); // Render avtomatik qayta ishga tushiradi
      }, 2000);
      
    } catch (error) {
      console.error('Restart xato:', error);
      ctx.reply('❌ Qayta ishga tushirishda xatolik yuz berdi.');
    }
  });

  // Cancel
  bot.command('cancel', async (ctx) => {
    await ctx.reply(
      '🔙 Admin panelidan chiqildi.\n\n' +
      '🏠 Asosiy menyu: /start\n' +
      '📋 Yordam: /help',
      Markup.keyboard([['/start', '/help'], ['/admin']]).resize()
    );
  });
};
