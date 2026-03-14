const { Markup } = require('telegraf');
const { transcribeAudioPremium } = require('../services/premiumTranscribe.service');

module.exports = (bot) => {
  bot.command('premium', async (ctx) => {
    try {
      await ctx.reply(
        '🎯 **Premium Audio Transkripsiya**\n\n' +
        '✅ 100% aniqlikda transkripsiya\n' +
        '✅ Har bir so\'zni aniq eshitish\n' +
        '✅ Urg\'u va pauzalarni aks ettirish\n' +
        '✅ Xatolarga yo\'l qo\'mash\n\n' +
        '📤 Endi audio yuboring va premium transkripsiyadan foydalaning!',
        Markup.keyboard([['/cancel', '/help']]).resize()
      );
    } catch (error) {
      console.error('Premium command xato:', error);
      ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
    }
  });

  // Premium audio handler
  bot.on(['voice', 'audio'], async (ctx, next) => {
    // Faqat premium komandasidan keyin ishlaydi
    if (!ctx.session?.premiumMode) {
      return next(); // Oddiy audio handlerga o'tadi
    }

    try {
      await ctx.reply('🎯 Premium audio qabul qilindi. 100% aniqlikda transkripsiya qilinmoqda...');

      const fileId = ctx.message.voice?.file_id || ctx.message.audio?.file_id;
      const mode = ctx.session?.transcribeMode || 'transcript';

      const transcript = await transcribeAudioPremium(ctx.bot, fileId, mode);

      await ctx.replyWithMarkdown(
        `🎯 **Premium Natija (transcript):**\n\n${transcript}`
      );

      // Premium mode ni o'chirish
      ctx.session.premiumMode = false;

      await ctx.reply(
        '✅ Premium transkripsiya tugadi!\n\n' +
        '🔄 Qayta premium transkripsiya uchun: /premium\n' +
        '📋 Oddiy transkripsiya uchun: audio yuboring\n' +
        '🏠 Asosiy menyu: /start',
        Markup.keyboard([['/premium', '/start'], ['/help', '/cancel']]).resize()
      );

    } catch (error) {
      console.error('Premium audio xato:', error);
      
      let errorMsg = '❌ Premium transkripsiya xatosi. ';
      
      if (error.message.includes('429_RATE_LIMIT')) {
        errorMsg += 'Juda ko\'p so\'rov. Kuting.';
      } else if (error.message.includes('API_KEY_INVALID')) {
        errorMsg += 'API muammosi. Admin bilan bog\'laning.';
      } else if (error.message.includes('400_BAD_REQUEST')) {
        errorMsg += 'Audio formati noto\'g\'ri.';
      } else if (error.message.includes('juday katta')) {
        errorMsg += 'Audio juda katta. 18MB dan kichikroq yuboring.';
      } else {
        errorMsg += 'Qayta urinib ko\'ring.';
      }

      ctx.reply(errorMsg, Markup.keyboard([['/premium', '/cancel']]).resize());
    }
  });

  // Premium mode ni yoqish
  bot.command('premium', async (ctx) => {
    ctx.session.premiumMode = true;
    
    await ctx.reply(
      '🎯 **Premium mode faol!**\n\n' +
      '✅ Endi audio yuboring - 100% aniqlikda transkripsiya qilinadi\n' +
      '🔊 Har bir so\'z, urg\'u, pauzalar aniq aks etiladi\n' +
      '⏱️ Biroz vaqt olishi mumkin (premium sifat uchun)\n\n' +
      '📤 Audio yuboring...',
      Markup.keyboard([['/cancel', '/help']]).resize()
    );
  });

  // Cancel premium mode
  bot.command('cancel', async (ctx) => {
    ctx.session.premiumMode = false;
    
    await ctx.reply(
      '❌ Premium mode bekor qilindi.\n\n' +
      '🏠 Asosiy menyu: /start\n' +
      '🔄 Premium uchun: /premium',
      Markup.keyboard([['/start', '/premium'], ['/help']]).resize()
    );
  });
};
