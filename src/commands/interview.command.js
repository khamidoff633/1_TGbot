const { Markup } = require('telegraf');
const { getInterviewTopics, getRandomInterviewQuestion } = require('../services/interview.service');
const { registerAnswer } = require('../services/score.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('interview', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'interview') || 'backend';
    const question = getRandomInterviewQuestion(topic);
    if (!question) {
      return ctx.reply(`Topic topilmadi. Mavjud topiclar: ${getInterviewTopics().join(', ')}`);
    }

    const keyboard = question.options.map((option, index) => [
      Markup.button.callback(option, `interview:${topic}:${index}`)
    ]);

    ctx.session = ctx.session || {};
    ctx.session.currentInterview = { topic, question };

    await ctx.reply(
      `🧠 Interview mode (${topic})\n\n${question.question}\n\nVariantni tanlang:`,
      Markup.inlineKeyboard(keyboard)
    );
  });

  bot.action(/^interview:(.+?):(\d+)$/, async (ctx) => {
    const selectedIndex = Number(ctx.match[2]);
    const payload = ctx.session?.currentInterview;

    if (!payload) {
      await ctx.answerCbQuery('Avval /interview bilan savol oling.');
      return;
    }

    const { topic, question } = payload;
    const isCorrect = selectedIndex === question.answerIndex;
    const stats = registerAnswer(ctx.from, topic, isCorrect, 'interview');

    await ctx.answerCbQuery(isCorrect ? 'Zo‘r! ✅' : 'Bu safar xato ❌');
    await ctx.editMessageText(
      `${isCorrect ? '✅ To‘g‘ri' : '❌ Noto‘g‘ri'} javob\n\n` +
      `Topic: ${topic}\n` +
      `Savol: ${question.question}\n` +
      `To‘g‘ri javob: ${question.options[question.answerIndex]}\n` +
      `Izoh: ${question.explanation}\n` +
      `Umumiy ball: ${stats.totalScore + stats.totalInterviewScore}`
    );

    ctx.session.currentInterview = null;
  });
};
