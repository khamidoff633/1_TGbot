module.exports = (bot) => {
  bot.command('safehelp', async (ctx) => {
    await ctx.reply(
      '🛡 Xavfsizlik bo‘yicha qisqa yordam\n\n' +
      '• SMS kodni hech kimga bermang\n' +
      '• Noma’lum APK o‘rnatmang\n' +
      '• Short linklarni ehtiyotkorlik bilan oching\n' +
      '• Parol va karta ma’lumotlarini yubormang\n' +
      '• Shubhali xabarni /checkmsg bilan tekshiring\n' +
      '• Linkni /checklink bilan, faylni /checkfile bilan tekshiring'
    );
  });
};
