const { createStudyPlan } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('plan', async (ctx) => {
    const goal = removeCommand(ctx.message.text, 'plan');
    if (!goal) {
      return ctx.reply('Format: /plan maqsad\nMasalan: /plan 3 oyda IELTS listeningni yaxshilamoqchiman');
    }

    try {
      await ctx.sendChatAction('typing');
      const plan = await createStudyPlan(goal);
      await sendLongMessage(ctx, `📅 Reja:\n\n${plan}`);
    } catch (error) {
      console.error('Plan xato:', error.message);
      await ctx.reply('Reja tuzishda xato bo‘ldi.');
    }
  });
};
