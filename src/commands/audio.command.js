const { transcribeAudio } = require('../services/transcribe.service');
const sendLongMessage = require('../utils/sendLongMessage');

function getReadableAudioError(error) {
  const status = error?.response?.status;
  const message = error?.message || 'noma’lum xato';

  if (status === 429 || message === '429_RATE_LIMIT') {
    return '⏳ Audio transcript limiti vaqtincha tugagan (429). Birozdan keyin qayta urinib ko‘ring.';
  }

  if (status === 401 || status === 403 || message === 'API_KEY_INVALID') {
    return '🔑 Gemini API key noto‘g‘ri, eskirgan yoki bloklangan.';
  }

  if (status === 400 || message.startsWith('400_BAD_REQUEST')) {
    return `⚠️ Audio so‘rovida xato bor.\nSabab: ${message.replace('400_BAD_REQUEST: ', '')}`;
  }

  if (message.includes('18MB') || message.includes('20 MB')) {
    return `📦 ${message}`;
  }

  if (message.includes('yuklab olinmadi')) {
    return '📥 Audio faylni Telegram’dan yuklab bo‘lmadi. Qayta yuborib ko‘ring.';
  }

  if (message.includes('file path')) {
    return '📎 Audio fayl manzili topilmadi. Boshqa audio yuborib ko‘ring.';
  }

  return `❌ Audio/voice ni textga aylantirishda xato bo‘ldi.\nSabab: ${message}`;
}

module.exports = (bot) => {
  const handler = async (ctx) => {
    try {
      const voice = ctx.message?.voice;
      const audio = ctx.message?.audio;
      const document = ctx.message?.document;
      const fileId = voice?.file_id || audio?.file_id || document?.file_id;

      if (!fileId) return;

      await ctx.reply('🎧 Audio qabul qilindi. Transcript tayyorlayapman...');
      await ctx.sendChatAction('typing');

      const mode = ctx.session?.transcribeMode || 'transcript';
      const result = await transcribeAudio(bot, fileId, mode);

      await sendLongMessage(ctx, `📝 Natija (${mode}):\n\n${result}`);
    } catch (error) {
      console.error('Audio transcript xato:', error?.response?.data || error.message || error);
      await ctx.reply(getReadableAudioError(error));
    }
  };

  bot.on('voice', handler);
  bot.on('audio', handler);

  bot.on('document', async (ctx, next) => {
    const doc = ctx.message?.document;
    const mime = doc?.mime_type || '';
    const name = (doc?.file_name || '').toLowerCase();

    const isAudioDoc =
      mime.startsWith('audio/') ||
      /\.(mp3|wav|ogg|oga|m4a|aac|flac|webm)$/i.test(name);

    if (!isAudioDoc) return next();
    return handler(ctx);
  });
};
