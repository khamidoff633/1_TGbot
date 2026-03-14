async function safeReply(ctx, text, extra = {}) {
  try {
    await ctx.reply(text, extra);
  } catch (error) {
    console.error('Javob yuborishda xato:', error.message);
  }
}

module.exports = { safeReply };
