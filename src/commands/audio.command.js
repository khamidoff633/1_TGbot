const { transcribeAudio } = require('../services/transcribe.service');
const sendLongMessage = require('../utils/sendLongMessage');

module.exports = (bot) => {
  const handler = async (ctx) => {
    try {
      const voice = ctx.message.voice;
      const audio = ctx.message.audio;
      const document = ctx.message.document;
      const fileId = voice?.file_id || audio?.file_id || document?.file_id;

      if (!fileId) return;

      await ctx.reply('🎧 Audio qabul qilindi. Transcript tayyorlayapman...');
      await ctx.sendChatAction('typing');

      const mode = ctx.session?.transcribeMode || 'transcript';
      const result = await transcribeAudio(bot, fileId, mode);

      await sendLongMessage(ctx, `📝 Natija (${mode}):\n\n${result}`);
    } catch (error) {
      console.error('Audio transcript xato:', error.response?.data || error.message);
      await ctx.reply(`Audio/voice ni textga aylantirishda xato bo‘ldi.\nSabab: ${error.message || 'noma’lum xato'}\nQisqa va tiniq audio bilan qayta urinib ko‘ring.`);
    }
  };

  bot.on('voice', handler);
  bot.on('audio', handler);
  bot.on('document', async (ctx, next) => {
    const doc = ctx.message.document;
    const mime = doc?.mime_type || '';
    const name = (doc?.file_name || '').toLowerCase();
    if (!mime.startsWith('audio/') && !/\.(mp3|wav|ogg|oga|m4a)$/i.test(name)) return next();
    return handler(ctx);
  });
};
