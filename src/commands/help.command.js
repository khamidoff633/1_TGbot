const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📘 Buyruqlar ro‘yxati\n\n` +
        `🤖 AI va umumiy yordam\n` +
        `/ask <savol> - AI yordamchi\n` +
        `/translate <matn> - tarjima\n` +
        `/summary <matn> - qisqa xulosa\n` +
        `/plan <maqsad> - o‘quv yoki ish rejasi\n` +
        `/daily - kunlik foydali maslahat\n\n` +
        `💻 Developer tools\n` +
        `/bug <xato> - bug helper\n` +
        `/explain <kod> - kodni tushuntirish\n` +
        `/review <kod> - code review va fix\n` +
        `/project <mavzu> - loyiha g‘oyasi\n` +
        `/challenge [topic] - coding challenge\n` +
        `/roadmap <topic> - o‘rganish rejasi\n` +
        `/interview [topic] - interview savol\n` +
        `/doc <topic> - docs helper\n` +
        `/trending [topic] - GitHub trending\n` +
        `/repo <owner/repo> - GitHub repo info\n` +
        `/code <nom> - snippet olish\n` +
        `/tip - random programming tip\n\n` +
        `🧠 Practice va stats\n` +
        `/quiz [topic] - quiz boshlash\n` +
        `/top - leaderboard\n` +
        `/me - statistika\n\n` +
        `🎧 Audio tools\n` +
        `/transcribe [transcript|ielts|summary] - voice/audio rejimi\n` +
        `Keyin voice yoki audio yuboring, bot textga aylantiradi\n\n` +
        `🛡 Security tools\n` +
        `/checklink <url> - linkni tekshirish\n` +
        `/checkmsg <matn> - scam xabarni tekshirish\n` +
        `/checkfile - keyin fayl yuboring\n` +
        `/safehelp - xavfsizlik bo‘yicha yordam\n\n` +
        `📰 News va sozlamalar\n` +
        `/news [category] - IT news olish\n` +
        `/settings - hozirgi sozlamalar\n` +
        `/setchannel @username - auto-post uchun kanal ulash\n` +
        `/autonews on|off - auto news yoqish/o‘chirish\n` +
        `/setcategory uzbek|general|ai|cybersecurity|javascript - news turi\n` +
        `/creator - creator info`,
      Markup.keyboard([
        ['/ask Node.js nima?', '/quiz javascript'],
        ['/interview backend', '/top'],
        ['🎧 Audio transkripsiya', '📚 IT yangiliklari'],
        ['🔧 Kod yordami', '🛡 Xavfsizlik'],
        ['/start', '/help']
      ]).resize()
    );
  });
};
