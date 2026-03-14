const axios = require('axios');
const path = require('path');
const env = require('../config/env');
const { analyzePermissionStrings } = require('./permissionAnalyzer');

function getTelegramFileUrl(filePath) {
  return `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${filePath}`;
}

function scoreToLevel(score) {
  if (score >= 5) return '🔴 Dangerous';
  if (score >= 2) return '🟡 Suspicious';
  return '🟢 Likely safe';
}

async function downloadTelegramDocument(bot, fileId) {
  const tgFile = await bot.telegram.getFile(fileId);
  const fileUrl = getTelegramFileUrl(tgFile.file_path);
  const response = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
    maxContentLength: 20 * 1024 * 1024,
    maxBodyLength: 20 * 1024 * 1024
  });

  return {
    buffer: Buffer.from(response.data),
    filePath: tgFile.file_path
  };
}

async function analyzeFileRisk({ bot, fileId, fileName, mimeType = '', fileSize = 0, extension = '' }) {
  const reasons = [];
  let score = 0;
  const lowerName = String(fileName || '').toLowerCase();
  const ext = extension || path.extname(lowerName).toLowerCase();

  if (ext === '.apk') {
    reasons.push('APK fayl aniqlandi.');
    score += 1;
  }

  if (/(mod|vip|panel|hack|premium|crack|inject)/i.test(lowerName)) {
    reasons.push('Fayl nomi shubhali ko‘rinmoqda.');
    score += 2;
  }

  if (['.exe', '.bat', '.cmd', '.scr', '.ps1', '.js'].includes(ext)) {
    reasons.push('Ishga tushiriladigan fayl turi topildi.');
    score += 3;
  }

  if (!mimeType) {
    reasons.push('Mime type aniqlanmadi.');
    score += 1;
  }

  if (fileSize > 50 * 1024 * 1024) {
    reasons.push('Fayl hajmi juda katta.');
    score += 1;
  }

  if (bot && fileId) {
    try {
      const { buffer } = await downloadTelegramDocument(bot, fileId);
      const textView = buffer.toString('latin1');

      if (ext === '.apk') {
        const perms = analyzePermissionStrings(textView);
        if (perms.length) {
          score += Math.min(3, perms.length);
          reasons.push(`Shubhali permissionlar topildi: ${perms.slice(0, 5).join(', ')}`);
        }
        if (textView.includes('classes.dex')) reasons.push('Android paket tuzilmasi topildi.');
      }

      if (/https?:\/\//i.test(textView) && /(grabify|ngrok|bit\.ly|tinyurl)/i.test(textView)) {
        score += 2;
        reasons.push('Fayl ichida shubhali tashqi linklar topildi.');
      }
    } catch (error) {
      reasons.push('Faylning ichki tarkibini to‘liq tekshirib bo‘lmadi.');
    }
  }

  const level = scoreToLevel(score);
  let advice = 'Katta xavf belgisi topilmadi. Baribir ehtiyot bo‘ling.';
  if (level === '🟡 Suspicious') advice = 'Fayl shubhali. Antivirus yoki sandbox bilan tekshirib keyin oching.';
  if (level === '🔴 Dangerous') advice = 'Faylni ochmang yoki o‘rnatmang. O‘chirib tashlash tavsiya qilinadi.';

  return {
    fileName,
    fileType: ext || mimeType || 'unknown',
    level,
    reasons: reasons.length ? reasons : ['Katta xavf belgisi topilmadi.'],
    advice,
    score
  };
}

module.exports = { analyzeFileRisk };
