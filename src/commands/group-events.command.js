module.exports = (bot) => {
  bot.on('new_chat_members', async (ctx) => {
    const me = ctx.message.new_chat_members.find((member) => member.id === ctx.botInfo.id);
    if (!me) return;

    await ctx.reply(
      `Assalomu alaykum, men groupga qo‘shildim 🤖\n\n` +
        `Meni professional ishlatish uchun:\n` +
        `1. /setchannel @kanalingiz\n` +
        `2. Botni o‘sha kanalga admin qiling\n` +
        `3. /autonews on qiling\n\n` +
        `Shundan keyin men IT yangiliklarni avtomatik kanalga tashlayman.`
    );
  });
};
