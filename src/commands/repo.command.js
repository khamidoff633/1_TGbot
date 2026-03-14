const { getRepoInfo } = require('../services/github.service');

module.exports = (bot) => {
  bot.command('repo', async (ctx) => {
    const repoName = ctx.message.text.replace(/^\/repo\s*/i, '').trim();

    if (!repoName) {
      return ctx.reply('Repo nomini yozing. Masalan: /repo expressjs/express');
    }

    try {
      const repo = await getRepoInfo(repoName);
      await ctx.reply(
        `📦 ${repo.fullName}\n\n` +
          `📝 ${repo.description}\n` +
          `⭐ Stars: ${repo.stars}\n` +
          `🍴 Forks: ${repo.forks}\n` +
          `🐞 Open Issues: ${repo.issues}\n` +
          `💻 Language: ${repo.language}\n` +
          `🕒 Updated: ${new Date(repo.updatedAt).toLocaleString()}\n` +
          `🔗 ${repo.url}`
      );
    } catch (error) {
      await ctx.reply(`Repo ma’lumotini olishda xato bo‘ldi: ${error.message}`);
    }
  });
};
