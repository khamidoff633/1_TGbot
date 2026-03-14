const { getLatestNews, formatNewsItem } = require('../services/news.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('news', async (ctx) => {
    const category = removeCommand(ctx.message.text, 'news') || 'uzbek';

    try {
      const news = await getLatestNews(category, 3);

      if (!news.length) {
        return ctx.reply('Hozircha news topilmadi. Birozdan keyin yana urinib ko‘ring.');
      }

      const text = news.map((item, index) => formatNewsItem(item, index)).join('\n\n');
      await ctx.reply(`🗞 ${category.toUpperCase()} News\n\n${text}`);
    } catch (error) {
      await ctx.reply(`News olishda xato bo‘ldi: ${error.message}`);
    }
  });
};
