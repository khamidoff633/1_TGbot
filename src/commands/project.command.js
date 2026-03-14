const { generateProjectIdea } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('project', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'project');
    if (!topic) {
      return ctx.reply('Format: /project mavzu\nMasalan: /project nodejs telegram bot');
    }

    try {
      await ctx.sendChatAction('typing');
      const result = await generateProjectIdea(topic);
      await sendLongMessage(ctx, `🚀 Loyiha g‘oyasi:\n\n${result}`);
    } catch (error) {
      console.error('Project xato:', error.message);
      await ctx.reply('Loyiha g‘oyasi yaratishda xato bo‘ldi.');
    }
  });
};
