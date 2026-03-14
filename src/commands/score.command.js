const { getLeaderboard, getUserStats } = require('../services/score.service');

module.exports = (bot) => {
  bot.command('top', async (ctx) => {
    const top = getLeaderboard(10);
    if (!top.length) return ctx.reply('Hali leaderboard bo‘sh. Quiz yoki interview ishlating.');

    const text = top.map((user, index) => {
      const name = user.username ? `@${user.username}` : user.firstName;
      return `${index + 1}. ${name} — ${user.totalScore + user.totalInterviewScore} ball`;
    }).join('\n');

    await ctx.reply(`🏆 Leaderboard\n\n${text}`);
  });

  bot.command('me', async (ctx) => {
    const stats = getUserStats(ctx.from);
    await ctx.reply(
      `👤 Sizning statistikangiz\n\n` +
      `Ball: ${stats.totalScore + stats.totalInterviewScore}\n` +
      `Quiz to‘g‘ri: ${stats.totalCorrect}\n` +
      `Quiz xato: ${stats.totalWrong}\n` +
      `Interview ball: ${stats.totalInterviewScore}`
    );
  });
};
