const { explainCode } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  bot.command('explain', async (ctx) => {
    const code = removeCommand(ctx.message.text, 'explain');
    if (!code) {
      return ctx.reply('Format: /explain kod\nMasalan: /explain const sum=(a,b)=>a+b');
    }

    try {
      await ctx.sendChatAction('typing');
      const result = await explainCode(code);
      await sendLongMessage(ctx, `🧠 Kod tushuntirishi:\n\n${result}`);
    } catch (error) {
      console.error('Explain xato:', error.message);
      await ctx.reply('Kod tushuntirishda xato bo‘ldi.');
    }
  });
};
