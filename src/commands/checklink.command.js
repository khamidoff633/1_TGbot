const { removeCommand } = require('../utils/formatters');
const { scanLink, formatLinkScan } = require('../security/linkScanner');

module.exports = (bot) => {
  bot.command('checklink', async (ctx) => {
    const text = removeCommand(ctx.message.text, 'checklink');
    if (!text) {
      return ctx.reply('Tekshirish uchun link yuboring.\nMasalan: /checklink https://instagram.com/example');
    }

    const result = scanLink(text);
    await ctx.reply(formatLinkScan(result), { disable_web_page_preview: true });
  });
};
