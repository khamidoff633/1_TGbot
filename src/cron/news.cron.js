const cron = require('node-cron');
const env = require('../config/env');
const { getUnpostedNews, markAsPosted, formatNewsItem } = require('../services/news.service');
const { getChatsWithAutoNews } = require('../services/settings.service');

let started = false;

function initNewsCron(bot) {
  if (started) return;
  started = true;

  console.log(`News cron ishga tushdi: ${env.NEWS_CRON}`);

  cron.schedule(env.NEWS_CRON, async () => {
    const chats = getChatsWithAutoNews();
    if (!chats.length) return;

    for (const chat of chats) {
      try {
        const news = await getUnpostedNews(chat.newsCategory || 'uzbek', 1);
        if (!news.length) continue;

        const item = news[0];
        const text = `🗞 ${formatNewsItem(item)}\n\n#itnews #uztech`;
        await bot.telegram.sendMessage(chat.channelUsername, text, { disable_web_page_preview: false });
        markAsPosted([item.link]);
      } catch (error) {
        console.error(`Cron news xato (${chat.channelUsername}):`, error.message);
      }
    }
  });
}

module.exports = { initNewsCron };
