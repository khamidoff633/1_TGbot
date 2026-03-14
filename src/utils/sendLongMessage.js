async function sendLongMessage(ctx, text) {
  const limit = 3900;

  if (!text || typeof text !== 'string') {
    return ctx.reply('Javob yaratishda xato bo‘ldi.');
  }

  const parts = [];
  let current = '';
  const lines = text.split('\n');

  for (const line of lines) {
    if ((current + line + '\n').length > limit) {
      if (current.trim()) parts.push(current.trim());
      current = line + '\n';
    } else {
      current += line + '\n';
    }
  }

  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    await ctx.reply(part, { disable_web_page_preview: true });
  }
}

module.exports = sendLongMessage;
