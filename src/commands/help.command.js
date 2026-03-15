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
        `👤 Foydalanuvchi ma'lumotlari\n` +
        `/me - o‘z ma'lumotlaringiz\n` +
        `/userinfo <ID/@username> - foydalanuvchi haqida ma'lumot\n` +
        `/scan - guruh a'zolarini skanlash\n` +
        `/fullinfo <ID> - to'liq ma'lumot olish\n` +
        `/channelinfo @channel - kanal ma'lumotlari\n` +
        `/export <ID> - ma'lumotlarni eksport qilish\n\n` +
        `🌐 Social tracking\n` +
        `/mygroups - mening guruhlari\n` +
        `/interactions [kunlar] - muloqot tarixi\n` +
        `/contacts [kunlar] - muloqot qilgan odamlar\n` +
        `/socialprofile [ID] - to'liq social profil\n` +
        `/checkchannel @channel - public kanal ma'lumotlari\n` +
        `/socialstats - global statistika\n\n` +
        `🔍 To'liq ma'lumotlar (chetlab o'tish)\n` +
        `/fullinfo <ID/@username> - to'liq ma'lumot (scraping orqali)\n` +
        `⚡ Bu komanda Telegram API cheklovlarini chetlab o'tib,\n` +
        `   public ma'lumotlarni yig'ish orqali ishlaydi.\n\n` +
        `🎯 Premium Audio Transkripsiya\n` +
        `/premium - 100% aniqlikda audio transkripsiya\n` +
        `✅ Har bir so'zni aniq eshitish\n` +
        `✅ Urg'u va pauzalarni aks ettirish\n` +
        `✅ Xatolarga yo'l qo'mash\n\n` +
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
        `✅ Bot boshqarish va sozlamalar\n\n` +
        `👑 Super Admin Paneli\n` +
        `/superadmin - super admin paneliga kirish\n` +
        `✅ Barcha foydalanuvchilar, statistika, global boshqarish\n\n` +
        `🆔 O'zing ID ni topish\n` +
        `/getid - o'zingizning Telegram ID ni ko'rish\n\n` +
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
        ['🎯 Premium transkripsiya', '🔧 Kod yordami'],
        ['🛡 Xavfsizlik', '/mygroups'],
        ['/interactions', '/contacts'],
        ['/socialprofile', '/fullinfo'],
        ['/premium', '/userinfo'],
        ['/admin', '/superadmin'],
        ['/getid', '/start'],
        ['/help', '/cancel']
      ]).resize()
    );
  });
};
