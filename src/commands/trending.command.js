const { getTrendingRepos } = require('../services/github.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('trending', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'trending') || 'javascript';
    try {
      const repos = await getTrendingRepos(topic, 5);
      if (!repos.length) return ctx.reply('Trending repo topilmadi.');

      const text = repos.map((repo, index) => (
        `${index + 1}. ${repo.fullName}\n` +
        `⭐ ${repo.stars} | ${repo.language}\n` +
        `📝 ${repo.description}\n` +
        `🔗 ${repo.url}`
      )).join('\n\n');

      await ctx.reply(`🔥 Trending repos (${topic})\n\n${text}`);
    } catch (error) {
      await ctx.reply(`Trending olishda xato: ${error.message}`);
    }
  });
};
