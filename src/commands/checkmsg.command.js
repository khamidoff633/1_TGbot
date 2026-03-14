const { removeCommand } = require('../utils/formatters');
const { scanMessageRisk } = require('../security/scamDetector');

module.exports = (bot) => {
  bot.command('checkmsg', async (ctx) => {
    const text = removeCommand(ctx.message.text, 'checkmsg');
    if (!text) {
      return ctx.reply('Tekshirish uchun xabar matnini yuboring.\nMasalan: /checkmsg Adminman, kodni yuboring');
    }

    const result = scanMessageRisk(text);
    await ctx.reply(
      `💬 Xabar tekshiruvi\n🛡 Natija: ${result.level}\n\nSabablar:\n- ${result.reasons.join('\n- ')}\n\nTavsiya:\n${result.advice}`
    );
  });
};
