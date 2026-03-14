const { analyzeBug } = require('../services/bug.service');
const { askAssistant } = require('../services/ai.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('bug', async (ctx) => {
    const message = removeCommand(ctx.message.text, 'bug');
    if (!message) {
      return ctx.reply('Format: /bug xato matni\nMasalan: /bug Cannot read properties of undefined');
    }

    const analysis = analyzeBug(message);
    const aiExtra = await askAssistant(`Quyidagi backend xatoni qisqa tahlil qil va 3 ta fix ayt: ${message}`);

    await ctx.reply(
      `🛠 Xato turi: ${analysis.title}\n\n` +
      analysis.fix.map((item, index) => `${index + 1}. ${item}`).join('\n') +
      `\n\n🤖 AI tavsiya:\n${aiExtra}`
    );
  });
};
