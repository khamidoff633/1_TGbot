const { Markup } = require('telegraf');
const { getRandomQuestion, getAvailableTopics } = require('../services/quiz.service');
const { registerAnswer } = require('../services/score.service');
const { removeCommand } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('quiz', async (ctx) => {
    const topic = removeCommand(ctx.message.text, 'quiz') || 'javascript';

    try {
      const quiz = getRandomQuestion(topic);
      const available = getAvailableTopics().join(', ');

      if (!quiz) {
        return ctx.reply(`Topic topilmadi. Mavjud topiclar: ${available}`);
      }

      const keyboard = quiz.options.map((option, index) => [
        Markup.button.callback(option, `quiz:${topic}:${index}`)
      ]);

      if (!ctx.session) ctx.session = {};
      ctx.session.currentQuiz = { topic, quiz };

      await ctx.reply(
        `🎯 Quiz (${topic})\n\n${quiz.question}\n\nBir variantni tanlang:`,
        Markup.inlineKeyboard(keyboard)
      );
    } catch (error) {
      console.error('Quiz command xato:', error);
      await ctx.reply(`Quizda xato bo‘ldi: ${error.message}`);
    }
  });

  bot.action(/^quiz:(.+?):(\d+)$/, async (ctx) => {
    try {
      const selectedIndex = Number(ctx.match[2]);
      const currentQuiz = ctx.session?.currentQuiz;

      if (!currentQuiz || !currentQuiz.quiz) {
        await ctx.answerCbQuery('Avval /quiz bilan yangi savol oling.');
        return;
      }

      const { topic, quiz } = currentQuiz;
      const isCorrect = selectedIndex === quiz.answerIndex;
      const userAnswer = quiz.options[selectedIndex] || 'Noma’lum javob';
      const correctAnswer = quiz.options[quiz.answerIndex];
      const stats = registerAnswer(ctx.from, topic, isCorrect, 'quiz');

      await ctx.answerCbQuery(isCorrect ? 'To‘g‘ri javob ✅' : 'Xato javob ❌');

      const text = isCorrect
        ? `🎉 Tabriklayman, javobingiz to‘g‘ri!\n\n📚 Topic: ${topic}\n❓ Savol: ${quiz.question}\n✅ Siz tanlagan javob: ${userAnswer}\n🏆 Umumiy ball: ${stats.totalScore + stats.totalInterviewScore}\n\n📘 Izoh: ${quiz.explanation}`
        : `❌ Afsus, javob noto‘g‘ri.\n\n📚 Topic: ${topic}\n❓ Savol: ${quiz.question}\n🫵 Siz tanlagan javob: ${userAnswer}\n✅ To‘g‘ri javob: ${correctAnswer}\n🏆 Umumiy ball: ${stats.totalScore + stats.totalInterviewScore}\n\n📘 Izoh: ${quiz.explanation}`;

      await ctx.editMessageText(text);
      ctx.session.currentQuiz = null;
    } catch (error) {
      console.error('Quiz callback xato:', error);
      try {
        await ctx.answerCbQuery('Quizni tekshirishda xato bo‘ldi.');
      } catch {}
    }
  });
};
