const { getChatSettings, updateChatSettings } = require('../services/settings.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('settings', async (ctx) => {
    const settings = getChatSettings(String(ctx.chat.id));
    await ctx.reply(
      `⚙️ Sozlamalar\n\n` +
        `Channel: ${settings.channelUsername || 'ulanmagan'}\n` +
        `Auto news: ${settings.autoNews ? 'yoqilgan' : 'o‘chirilgan'}\n` +
        `Category: ${settings.newsCategory}\n` +
        `Cron: har 2 kunda 1 marta`
    );
  });

  bot.command('setchannel', async (ctx) => {
    const channelUsername = removeCommand(ctx.message.text, 'setchannel');

    if (!channelUsername.startsWith('@')) {
      return ctx.reply('Kanal username noto‘g‘ri. Masalan: /setchannel @backend_dev1');
    }

    updateChatSettings(String(ctx.chat.id), { channelUsername });
    await ctx.reply(`✅ Kanal saqlandi: ${channelUsername}\nBotni o‘sha kanalga admin qiling.`);
  });

  bot.command('autonews', async (ctx) => {
    const value = removeCommand(ctx.message.text, 'autonews').toLowerCase();

    if (!['on', 'off'].includes(value)) {
      return ctx.reply('To‘g‘ri format: /autonews on yoki /autonews off');
    }

    updateChatSettings(String(ctx.chat.id), { autoNews: value === 'on' });
    await ctx.reply(`✅ Auto news ${value === 'on' ? 'yoqildi' : 'o‘chirildi'}.`);
  });

  bot.command('setcategory', async (ctx) => {
    const category = removeCommand(ctx.message.text, 'setcategory').toLowerCase();
    const allowed = ['uzbek', 'general', 'ai', 'cybersecurity', 'javascript'];

    if (!allowed.includes(category)) {
      return ctx.reply(`To‘g‘ri kategoriya tanlang: ${allowed.join(', ')}`);
    }

    updateChatSettings(String(ctx.chat.id), { newsCategory: category });
    await ctx.reply(`✅ News kategoriyasi saqlandi: ${category}`);
  });
};
