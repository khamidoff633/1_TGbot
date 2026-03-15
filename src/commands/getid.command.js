const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.command('getid', async (ctx) => {
    try {
      const user = ctx.from;
      
      await ctx.reply(
        '🆔 **SIZNING TELEGRAM ID**\n\n' +
        `👤 Ism: ${user.first_name || 'Noma\'lum'} ${user.last_name || ''}\n` +
        `🆔 ID: ${user.id}\n` +
        `🔗 Username: ${user.username ? '@' + user.username : 'Yo\'q'}\n` +
        `🌐 Language: ${user.language_code || 'Noma\'lum'}\n\n` +
        `📝 Bu ID ni .env faylida SUPER_ADMIN_ID ga kiriting:\n` +
        `SUPER_ADMIN_ID=${user.id}\n\n` +
        `🔙 Orqaga qaytish: /cancel`,
        Markup.keyboard([['/superadmin', '/start'], ['/help']]).resize()
      );
    } catch (error) {
      console.error('Get ID xato:', error);
      ctx.reply('❌ ID ni olishda xatolik yuz berdi.');
    }
  });
};
