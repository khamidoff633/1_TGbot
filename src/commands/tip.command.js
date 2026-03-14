const tips = require('../data/tips');

module.exports = (bot) => {
  bot.command('tip', async (ctx) => {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    await ctx.reply(`💡 Programming Tip\n\n${tip}`);
  });
};
