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
        '• /userinfo (javobsiz - o\'zingiz haqingizda)',
        Markup.keyboard([
          ['userinfo', '/help'],
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/start', '/me']
        ]).resize()
      );
    }

    try {
      let targetId;
      let targetUsername;

      if (target.startsWith('@')) {
        targetUsername = target.substring(1);
        
        let response = '🔍 Foydalanuvchi: @' + targetUsername + '\n\n';
        response += '⚠️ Telegram Bot API cheklovlari tufayli quyidagi ma\'lumotlarni olish imkonsiz:\n';
        response += '• Ism o\'zgarishlari tarixi\n';
        response += '• Username o\'zgarishlari tarixi\n';
        response += '• Qaysi kanallarga a\'zo ekanligi\n';
        response += '• Akkount ochilgan sana\n\n';
        response += '✅ Faqat shu ma\'lumotlar mavjud:\n';
        response += '• Joriy username (agar public bo\'lsa)\n';
        response += '• Joriy ism (agar bir guruhda bo\'lsa)\n\n';
        response += '💡 To\'liq ma\'lumot olish uchun foydalanuvchi botga yozishi kerak.';
        
        return ctx.reply(response, Markup.keyboard([
          ['userinfo', '/help'],
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/start', '/me']
        ]).resize());
      }

      if (/^\d+$/.test(target)) {
        targetId = target;
        
        let response = '🔍 Foydalanuvchi ma\'lumotlari (ID: ' + targetId + '):\n\n';
        response += '⚠️ Cheklangan ma\'lumotlar:\n';
        response += '• Bot bilan aloqasi: ❌ Tekshirish uchun botga yozishi kerak\n\n';
        response += '❌ Olinmaydigan ma\'lumotlar:\n';
        response += '• Ism o\'zgarishlari tarixi\n';
        response += '• Username o\'zgarishlari tarixi\n';
        response += '• Kanallarda a\'zolik\n';
        response += '• Akkount ochilgan vaqti\n\n';
        response += '💡 Telegram Bot API bunday shaxsiy ma\'lumotlarni taqdim etmaydi.';
        
        return ctx.reply(response, Markup.keyboard([
          ['userinfo', '/help'],
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/start', '/me']
        ]).resize());
      }

      return ctx.reply(
        '❌ Noto\'g\'ri format. ID yoki @username kiriting.\n\n' +
        'Masalalar:\n' +
        '• /userinfo 123456789\n' +
        '• /userinfo @username',
        Markup.keyboard([
          ['userinfo', '/help'],
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/start', '/me']
        ]).resize()
      );
    } catch (error) {
      console.error('UserInfo xato:', error);
      ctx.reply(
        '❌ Xatolik yuz berdi. Qayta urinib ko\'ring.',
        Markup.keyboard([
          ['userinfo', '/help'],
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/start', '/me']
        ]).resize()
      );
    }
  });

  bot.command('me', async (ctx) => {
    try {
      const user = ctx.from;
      
      let info = '👤 Sizning ma\'lumotlaringiz:\n\n';
      info += '🆔 ID: ' + user.id + '\n';
      info += '👤 Ism: ' + (user.first_name || 'Noma\'lum') + '\n';
      info += '🏷️ Familiya: ' + (user.last_name || 'Noma\'lum') + '\n';
      info += '🔗 Username: ' + (user.username ? '@' + user.username : 'Yo\'q') + '\n';
      info += '🌐 Language: ' + (user.language_code || 'Noma\'lum') + '\n\n';
      
      info += '⚠️ Telegram Bot API cheklovlari tufayli quyidagi ma\'lumotlar mavjud emas:\n';
      info += '• Ism o\'zgarishlari tarixi\n';
      info += '• Username o\'zgarishlari tarixi\n';
      info += '• Qaysi kanallarga a\'zo ekanligi\n';
      info += '• Akkount ochilgan sana\n\n';
      
      info += '💡 Bu ma\'lumotlarni faqat Telegram o\'zi taqdim etishi mumkin.';

      ctx.reply(info, Markup.keyboard([
          ['userinfo', '/help'],
          ['/fullinfo', '/mygroups'],
          ['/interactions', '/socialprofile'],
          ['/start', '/me']
        ]).resize());
    } catch (error) {
      console.error('Me command xato:', error);
      ctx.reply('❌ Ma\'lumotlarni olishda xatolik yuz berdi.');
    }
  });
};
