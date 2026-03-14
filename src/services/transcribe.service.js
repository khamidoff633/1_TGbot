const axios = require('axios');
const env = require('../config/env');
const { buildModelList, extractText } = require('./ai.service');

const MAX_AUDIO_BYTES = 18 * 1024 * 1024;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTelegramFileUrl(filePath) {
  return `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${filePath}`;
}

function guessMimeType(file = {}) {
  const mime = file.mime_type || '';
  if (mime) return mime;

  const path = String(file.file_path || '').toLowerCase();

  if (path.endsWith('.ogg') || path.endsWith('.oga')) return 'audio/ogg';
  if (path.endsWith('.mp3')) return 'audio/mpeg';
  if (path.endsWith('.wav')) return 'audio/wav';
  if (path.endsWith('.m4a')) return 'audio/mp4';
  if (path.endsWith('.aac')) return 'audio/aac';
  if (path.endsWith('.flac')) return 'audio/flac';
  if (path.endsWith('.webm')) return 'audio/webm';

  return 'audio/ogg';
}

async function fetchTelegramFile(bot, fileId) {
  const file = await bot.telegram.getFile(fileId);

  if (!file?.file_path) {
    throw new Error('Telegram file path topilmadi');
  }

  const fileUrl = getTelegramFileUrl(file.file_path);

  const response = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
    maxContentLength: 25 * 1024 * 1024,
    maxBodyLength: 25 * 1024 * 1024
  });

  const buffer = Buffer.from(response.data);

  if (!buffer.length) {
    throw new Error('Audio fayl yuklab olinmadi');
  }

  if (buffer.length > MAX_AUDIO_BYTES) {
    throw new Error('Audio fayl juda katta. 18MB dan kichikroq audio yuboring.');
  }

  return {
    buffer,
    mimeType: guessMimeType(file),
    filePath: file.file_path,
    fileSize: buffer.length
  };
}

function buildPrompt(mode = 'transcript') {
  if (mode === 'ielts') {
    return `
Ushbu audio transcriptini iloji boricha aniq yoz.
Keyin alohida bo‘limda 10 ta muhim so‘z yoki iborani ajratib ber.
Javob o‘zbek tilida bo‘lsin, lekin transcript asl tilda qolishi mumkin.

Format:
Transcript:
...

Muhim so‘zlar:
1. ...
2. ...
    `.trim();
  }

  if (mode === 'summary') {
    return `
Ushbu audio mazmunini avval transcript qil, keyin qisqa xulosa ber.
Transcript va xulosa alohida bo‘lsin.

Format:
Transcript:
...

Qisqa xulosa:
...
    `.trim();
  }

  return `
Ushbu audio yoki voice yozuvdagi gaplarni aniq transcript qilib ber.
Faqat mazmunli text qaytar.
Eshitilmagan joy bo‘lsa [eshitilmadi] deb belgilash mumkin.

Format:
Transcript:
...
  `.trim();
}

async function requestTranscription({ audioBase64, mimeType, prompt, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const { data } = await axios.post(
    url,
    {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2200
      }
    },
    {
      timeout: 120000,
      maxBodyLength: 30 * 1024 * 1024,
      maxContentLength: 30 * 1024 * 1024
    }
  );

  const text = extractText(data);
  if (!text || !text.trim()) {
    throw new Error(`${model} transcript qaytarmadi`);
  }

  return text.trim();
}

function normalizeTranscriptError(error) {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    'Noma’lum xato';

  if (status === 429) {
    const err = new Error('429_RATE_LIMIT');
    err.response = error.response;
    return err;
  }

  if (status === 401 || status === 403) {
    const err = new Error('API_KEY_INVALID');
    err.response = error.response;
    return err;
  }

  if (status === 400) {
    const err = new Error(`400_BAD_REQUEST: ${message}`);
    err.response = error.response;
    return err;
  }

  return error;
}

async function transcribeAudio(bot, fileId, mode = 'transcript') {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY yo‘q');
  }

  const file = await fetchTelegramFile(bot, fileId);
  const audioBase64 = file.buffer.toString('base64');
  const prompt = buildPrompt(mode);
  const models = buildModelList('gemini-2.5-flash');

  let lastError = null;

  for (const model of models) {
    try {
      const text = await requestTranscription({
        audioBase64,
        mimeType: file.mimeType,
        prompt,
        model
      });

      return text;
    } catch (error) {
      const normalized = normalizeTranscriptError(error);
      lastError = normalized;

      console.error(`Transcript xato [${model}]:`, error?.response?.data || error.message);

      if (normalized.message === '429_RATE_LIMIT') {
        await sleep(5000);
        continue;
      }

      if (
        normalized.message === 'API_KEY_INVALID' ||
        normalized.message.startsWith('400_BAD_REQUEST')
      ) {
        throw normalized;
      }
    }
  }

  throw lastError || new Error('Transcript yaratilmadi');
}

module.exports = { transcribeAudio };