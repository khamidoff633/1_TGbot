const { askAssistant } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('ask', async (ctx) => {
    const question = removeCommand(ctx.message.text, 'ask');
    if (!question) {
      return ctx.reply('Format: /ask savol\nMasalan: /ask JWT bilan session farqi nima?');
    }

    try {
      ctx.session = ctx.session || {};
      ctx.session.history = Array.isArray(ctx.session.history) ? ctx.session.history : [];

      await ctx.sendChatAction('typing');
      const answer = await askAssistant(question, { history: ctx.session.history });

      ctx.session.history.push({ role: 'user', text: question, at: Date.now() });
      ctx.session.history.push({ role: 'assistant', text: answer, at: Date.now() });
      ctx.session.history = ctx.session.history.slice(-10);

      await sendLongMessage(ctx, `🤖 ${answer}`);
    } catch (error) {
      console.error('Ask xato:', error.response?.data || error.message);
      await ctx.reply('AI javob berishda xato bo‘ldi. Birozdan keyin qayta urinib ko‘ring.');
    }
  });
};
