const { reviewCode } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('review', async (ctx) => {
    const code = removeCommand(ctx.message.text, 'review');
    if (!code) {
      return ctx.reply('Format: /review kod\nMasalan: /review function sum(a,b){return a+b}');
    }

    try {
      await ctx.sendChatAction('typing');
      const result = await reviewCode(code);
      await sendLongMessage(ctx, `🔍 Code review:\n\n${result}`);
    } catch (error) {
      console.error('Review xato:', error.message);
      await ctx.reply('Code review qilishda xato bo‘ldi.');
    }
  });
};
