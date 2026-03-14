const { getRoadmap, getTopics } = require('../services/roadmap.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('roadmap', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'roadmap') || 'backend';
    const roadmap = getRoadmap(topic);
    const text = roadmap.map((step, index) => `${index + 1}. ${step}`).join('\n');

    await ctx.reply(
      `🗺 Roadmap: ${topic}\n\n${text}\n\nMavjud topiclar: ${getTopics().join(', ')}`
    );
  });
};
