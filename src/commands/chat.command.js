const { askAssistant } = require('../services/ai.service');
const sendLongMessage = require('../utils/sendLongMessage');
const { scanLink, formatLinkScan } = require('../security/linkScanner');

function pushHistory(session, role, text) {
  session.history = Array.isArray(session.history) ? session.history : [];
  session.history.push({ role, text, at: Date.now() });
  session.history = session.history.slice(-10);
}

function extractFirstUrl(text = '') {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
}

module.exports = (bot) => {
  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text || '';

    if (text.startsWith('/')) return next();

    try {
      ctx.session = ctx.session || {};

      const url = extractFirstUrl(text);
      if (url) {
        const result = scanLink(url);
        return ctx.reply(formatLinkScan(result), { disable_web_page_preview: true });
      }

      await ctx.sendChatAction('typing');
      pushHistory(ctx.session, 'user', text);
      const reply = await askAssistant(text, { history: ctx.session.history.slice(0, -1) });
      pushHistory(ctx.session, 'assistant', reply);

      await sendLongMessage(ctx, reply);
    } catch (error) {
      console.error('AI error:', error.response?.data || error.message);
      await ctx.reply('AI javob berishda xato bo‘ldi. Birozdan keyin qayta urinib ko‘ring.');
    }
  });
};
