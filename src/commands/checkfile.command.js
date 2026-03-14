const path = require('path');
const { analyzeFileRisk } = require('../security/apkScanner');

module.exports = (bot) => {
  bot.command('checkfile', async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.pendingFileCheck = true;
    await ctx.reply('Fayl yuboring. Men uni tekshiraman.');
  });

  bot.on('document', async (ctx, next) => {
    try {
      const file = ctx.message.document;
      if (!file) return next();

      const fileName = file.file_name || 'unknown';
      const ext = path.extname(fileName).toLowerCase();
      const mime = file.mime_type || '';
      const isAudioDoc = mime.startsWith('audio/') || /\.(mp3|wav|ogg|oga|m4a)$/i.test(fileName);
      if (isAudioDoc) return next();

      const shouldScan = ctx.session?.pendingFileCheck || /\.(apk|zip|rar|exe|js|bat|cmd|scr|ps1)$/i.test(fileName);
      if (!shouldScan) return next();

      if (ctx.session) ctx.session.pendingFileCheck = false;
      await ctx.reply('Fayl tekshirilmoqda...');

      const result = await analyzeFileRisk({
        bot,
        fileId: file.file_id,
        fileName,
        mimeType: mime,
        fileSize: file.file_size || 0,
        extension: ext
      });

      await ctx.reply(
        `📦 Fayl: ${result.fileName}\n` +
        `📄 Turi: ${result.fileType}\n` +
        `🛡 Natija: ${result.level}\n\n` +
        `Sabablar:\n- ${result.reasons.join('\n- ')}\n\n` +
        `Tavsiya:\n${result.advice}`
      );
    } catch (error) {
      console.error('checkfile xato:', error.message);
      if (ctx.session) ctx.session.pendingFileCheck = false;
      await ctx.reply('Faylni tekshirishda xato bo‘ldi.');
    }
  });
};
