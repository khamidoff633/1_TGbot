const { summarizeText } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('summary', async (ctx) => {
    const text = removeCommand(ctx.message.text, 'summary');
    if (!text) {
      return ctx.reply('Format: /summary matn\nMasalan: /summary uzun matningizni shu yerga yuboring');
    }

    try {
      await ctx.sendChatAction('typing');
      const summary = await summarizeText(text);
      await sendLongMessage(ctx, `📝 Qisqa xulosa:\n\n${summary}`);
    } catch (error) {
      console.error('Summary xato:', error.message);
      await ctx.reply('Matnni qisqartirishda xato bo‘ldi.');
    }
  });
};
