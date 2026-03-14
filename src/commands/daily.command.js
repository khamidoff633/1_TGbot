module.exports = (bot) => {
  const tips = [
    '💡 Bugungi maslahat: telefonni emas, maqsadingizni ko‘proq oching.',
    '💡 Har kuni 20 daqiqa o‘qish bir yilda katta natija beradi.',
    '💡 IELTS listening uchun qisqa audio tinglab, keyin transcript bilan solishtiring.',
    '💡 Kod yozishda avval ishlaydigan variant, keyin chiroyli variant yozing.',
    '💡 Zeriksangiz, kichik challenge yoki mini loyiha qilib ko‘ring.'
  ];

  bot.command('daily', async (ctx) => {
    const item = tips[Math.floor(Math.random() * tips.length)];
    await ctx.reply(item);
  });
};
