const { createChallenge } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('challenge', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'challenge') || 'javascript';

    try {
      await ctx.sendChatAction('typing');
      const result = await createChallenge(topic);
      await sendLongMessage(ctx, `🏁 Coding challenge (${topic}):\n\n${result}`);
    } catch (error) {
      console.error('Challenge xato:', error.message);
      await ctx.reply('Challenge yaratishda xato bo‘ldi.');
    }
  });
};
