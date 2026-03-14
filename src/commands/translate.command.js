const { translateText } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('translate', async (ctx) => {
    const text = removeCommand(ctx.message.text, 'translate');
    if (!text) {
      return ctx.reply('Format: /translate matn\nMasalan: /translate I am learning backend development');
    }

    try {
      await ctx.sendChatAction('typing');
      const translated = await translateText(text, 'Uzbek');
      await sendLongMessage(ctx, `🌐 Tarjima:\n\n${translated}`);
    } catch (error) {
      console.error('Translate xato:', error.message);
      await ctx.reply('Tarjima qilishda xato bo‘ldi.');
    }
  });
};
