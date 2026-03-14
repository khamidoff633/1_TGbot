const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('transcribe', async (ctx) => {
    const mode = removeCommand(ctx.message.text, 'transcribe') || 'transcript';
    ctx.session = ctx.session || {};
    ctx.session.transcribeMode = mode.toLowerCase();

    await ctx.reply(
      `🎧 Transcribe rejimi saqlandi: ${ctx.session.transcribeMode}\n\n` +
        'Endi menga voice yoki audio yuboring.\n' +
        'Variantlar: transcript | ielts | summary'
    );
  });
};
