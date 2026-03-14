const { getCreatorProfile } = require('../services/creator.service');

module.exports = (bot) => {
  bot.command('creator', async (ctx) => {
    const creator = getCreatorProfile();
    await ctx.reply(
      `👨‍💻 Creator\n\n` +
      `Ism: ${creator.name}\n` +
      `Username: ${creator.username}\n` +
      `Bio: ${creator.bio}\n` +
      `Stack: ${creator.stack}\n` +
      `Kanal: ${creator.channel}`
    );
  });
};
