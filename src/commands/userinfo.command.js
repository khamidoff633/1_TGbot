const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.command('userinfo', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const target = args[0];

    if (!target) {
      return ctx.reply(
        '❌ Foydalanuvchi ID yoki username kiriting.\n\n' +
        'Masalalar:\n' +
        '• /userinfo 123456789\n' +
        '• /userinfo @username\n' +
        '• /userinfo (javobsiz - o‘zingiz haqingizda)',
        Markup.keyboard([['/userinfo', '/help']]).resize()
      );
    }

    try {
      let targetId;
      let targetUsername;

      // Agar @username berilgan bo'lsa
      if (target.startsWith('@')) {
        targetUsername = target.substring(1);
        // Bot faqat umumiy ma'lumotlarni bera oladi
        return ctx.reply(
          `🔍 Foydalanuvchi: @${targetUsername}\n\n` +
          `⚠️ Telegram Bot API cheklovlari tufayli quyidagi ma'lumotlarni olish imkonsiz:\n` +
          `• Ism o'zgarishlari tarixi\n` +
          `• Username o'zgarishlari tarixi\n` +
          `• Qaysi kanallarga a'zo ekanligi\n` +
          `• Akkount ochilgan sana\n\n` +
          `✅ Faqat shu ma'lumotlar mavjud:\n` +
          `• Joriy username (agar public bo'lsa)\n` +
          `• Joriy ism (agar bir guruhda bo'lsa)\n\n` +
          `💡 To'liq ma'lumot olish uchun foydalanuvchi botga yozishi kerak.`,
          Markup.keyboard([['/userinfo', '/help']]).resize()
        );
      }

      // Agar ID berilgan bo'lsa
      if (/^\d+$/.test(target)) {
        targetId = target;
        
        try {
          // Bot foydalanuvchi ma'lumotlarini o'ga urinadi
          const chatMember = await ctx.telegram.getChatMember(targetId, targetId);
          
          return ctx.reply(
            `🔍 Foydalanuvchi ma'lumotlari (ID: ${targetId}):\n\n` +
            `⚠️ Cheklangan ma'lumotlar:\n` +
            `• Bot bilan aloqasi borligi: ${chatMember ? '✅ Ha' : '❌ Yo‘q'}\n\n` +
            `❌ Olinmaydigan ma'lumotlar:\n` +
            `• Ism o'zgarishlari tarixi\n` +
            `• Username o'zgarishlari tarixi\n` +
            `• Kanallarda a'zolik\n` +
            `• Akkount ochilgan vaqti\n\n` +
            `💡 Telegram Bot API bunday shaxsiy ma'lumotlarni taqdim etmaydi.`,
            Markup.keyboard([['/userinfo', '/help']]).resize()
          );
        } catch (error) {
          return ctx.reply(
            `❌ Foydalanuvchi (ID: ${targetId}) topilmadi yoki botga murojaat qilmagan.\n\n` +
            `Sabab: Foydalanuvchi avval botga yozishi kerak.`,
            Markup.keyboard([['/userinfo', '/help']]).resize()
          );
        }
      }

      // Noto'g'ri format
      return ctx.reply(
        '❌ Noto‘g‘ri format. ID yoki @username kiriting.\n\n' +
        'Masalalar:\n' +
        '• /userinfo 123456789\n' +
        '• /userinfo @username',
        Markup.keyboard([['/userinfo', '/help']]).resize()
      );

    } catch (error) {
      console.error('UserInfo xato:', error);
      ctx.reply(
        '❌ Xatolik yuz berdi. Qayta urinib ko‘ring.',
        Markup.keyboard([['/userinfo', '/help']]).resize()
      );
    }
  });

  // O'zining ma'lumotlarini ko'rish
  bot.command('me', async (ctx) => {
    try {
      const user = ctx.from;
      const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, user.id);
      
      let info = `👤 Sizning ma'lumotlaringiz:\n\n`;
      info += `🆔 ID: ${user.id}\n`;
      info += `👤 Ism: ${user.first_name || 'Noma’lum'}\n`;
      info += `🏷️ Familiya: ${user.last_name || 'Noma’lum'}\n`;
      info += `🔗 Username: ${user.username ? '@' + user.username : 'Yo‘q'}\n`;
      info += `🌐 Language: ${user.language_code || 'Noma’lum'}\n`;
      info += `🤖 Bot status: ${chatMember ? chatMember.status : 'Noma’lum'}\n\n`;
      
      info += `⚠️ Telegram Bot API cheklovlari tufayli quyidagi ma'lumotlar mavjud emas:\n`;
      info += `• Ism o'zgarishlari tarixi\n`;
      info += `• Username o'zgarishlari tarixi\n`;
      info += `• Qaysi kanallarga a'zo ekanligi\n`;
      info += `• Akkount ochilgan sana\n\n`;
      
      info += `💡 Bu ma'lumotlarni faqat Telegram o'zi taqdim etishi mumkin.`;

      ctx.reply(info, Markup.keyboard([['/userinfo', '/help']]).resize());
    } catch (error) {
      console.error('Me command xato:', error);
      ctx.reply('❌ Ma\'lumotlarni olishda xatolik yuz berdi.');
    }
  });
};
