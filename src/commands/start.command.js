const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.start(async (ctx) => {
    await ctx.reply(
      `Salom, ${ctx.from.first_name || 'do‘st'} 👋\n\n` +
        `Men ko‘p funksiyali AI yordamchi botman.\n\n` +
        `Nimalar qila olaman:\n` +
        `• IT va oddiy savollarga javob beraman\n` +
        `• Kodni tushuntiraman va xatoni topaman\n` +
        `• Tarjima, summary va reja tuzaman\n` +
        `• Voice/audio ni textga aylantiraman\n` +
        `• Quiz, roadmap, interview va GitHub funksiyalari bor\n\n` +
        `Buyruqlarni ko‘rish uchun /help yozing.`,
      Markup.keyboard([
        ['/help', '/news uzbek'],
        ['/ask Node.js nima?', '/quiz javascript'],
        ['/interview backend', '/top'],
        ['🎧 Audio transkripsiya', '🤖 AI chat'],
        ['📚 IT yangiliklari', '🔧 Kod yordami']
      ]).resize()
    );
  });
};
