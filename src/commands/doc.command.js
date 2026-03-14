const { getDoc, getDocTopics } = require('../services/doc.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('doc', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'doc') || 'nodejs';
    const doc = getDoc(topic);
    if (!doc) {
      return ctx.reply(`Mavzu topilmadi. Mavjudlari: ${getDocTopics().join(', ')}`);
    }

    await ctx.reply(`📚 ${doc.title}\n\n${doc.summary}\n\n🔗 ${doc.link}`);
  });
};
