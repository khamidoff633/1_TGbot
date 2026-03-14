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
    const text = String(ctx.message?.text || '').trim();

    if (!text) return;
    if (text.startsWith('/')) return next();

    try {
      ctx.session = ctx.session || {};
      ctx.session.history = Array.isArray(ctx.session.history) ? ctx.session.history : [];

      const url = extractFirstUrl(text);
      if (url) {
        const result = scanLink(url);
        return ctx.reply(formatLinkScan(result), {
          disable_web_page_preview: true
        });
      }

      await ctx.sendChatAction('typing');

      const historyBefore = [...ctx.session.history];
      pushHistory(ctx.session, 'user', text);

      const reply = await askAssistant(text, {
        history: historyBefore
      });

      const safeReply =
        typeof reply === 'string' && reply.trim()
          ? reply.trim()
          : 'Savolingizni oldim, lekin hozir javob tayyor bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.';

      pushHistory(ctx.session, 'assistant', safeReply);

      await sendLongMessage(ctx, safeReply);
    } catch (error) {
      console.error('Chat AI xato:', error?.response?.data || error.message || error);
      await ctx.reply('❌ AI javob berishda xato bo‘ldi. Birozdan keyin qayta urinib ko‘ring.');
    }
  });
};