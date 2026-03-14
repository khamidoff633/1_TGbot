const axios = require('axios');
const env = require('../config/env');
const { normalize } = require('../utils/formatters');
const { getCreatorProfile } = require('./creator.service');
const { aiQueue } = require('./queue.service');
const { askOpenAI } = require('./openai.service');

const FALLBACK_KB = [
  {
    patterns: ['node js nima', 'nodejs nima'],
    answer:
      'Node.js — JavaScript’ni server tomonda ishlatadigan runtime. U API, Telegram bot, backend va CLI tool yozish uchun juda qulay.'
  },
  {
    patterns: ['express middleware nima', 'middleware nima'],
    answer:
      'Middleware — request va response orasida ishlaydigan funksiya. Log yozish, token tekshirish, validation qilish kabi ishlar shunda bajariladi.'
  },
  {
    patterns: ['jwt bilan session farqi', 'jwt session farqi'],
    answer:
      'JWT stateless usul: token clientda saqlanadi. Session esa serverda saqlanadi. JWT scale qilishda qulay, session esa revoke qilishda osonroq.'
  },
  {
    patterns: ['sequelize relation', 'sequelize relationlar'],
    answer:
      'Sequelize’da asosiy relationlar: hasOne, belongsTo, hasMany, belongsToMany. Foreign key odatda belongsTo tomonda bo‘ladi.'
  },
  {
    patterns: ['mongodb nima'],
    answer:
      'MongoDB — document-based NoSQL ma’lumotlar bazasi. Ma’lumotlar collection ichida JSON’ga o‘xshash document ko‘rinishida saqlanadi.'
  },
  {
    patterns: ['sen nimalar qila olasan', 'nima qila olasan', 'imkoniyatlaring'],
    answer:
      'Men IT va oddiy savollarga javob beraman, kodni tushuntiraman, xatoni topishga yordam beraman, roadmap, summary, tarjima, quiz va voice transcript bo‘yicha yordam bera olaman.'
  }
];

function buildSystemPrompt() {
  const creator = getCreatorProfile();

  return `
Sen professional AI assistant botsan.

Asosiy rol:
- Dasturchilar uchun coding mentor, debug helper va loyiha yordamchisi bo‘l.
- Oddiy foydalanuvchilar uchun ham tushunarli, foydali va muloyim javob ber.
- Asosiy til: o‘zbek (lotin). Kerak bo‘lsa inglizcha termin ishlat, lekin tushuntirishni o‘zbekcha qil.

Qoidalar:
- Javobni tabiiy, odamga o‘xshab, lekin aniq yoz.
- Qisqa savolga qisqa javob, murakkab savolga tartibli javob ber.
- Keraksiz uzrlar va sovuq iboralarni ishlatma.
- Savol noaniq bo‘lsa ham, imkon qadar eng foydali taxminiy javob ber.
- Kod kerak bo‘lsa ishlaydigan, chiroyli kod ber.
- Xatoni topish so‘ralsa: sabab + fix + misol bilan yoz.
- Roadmap so‘ralsa bosqichma-bosqich reja ber.
- Oddiy salomlashish bo‘lsa, qisqa samimiy javob ber.
- Agar foydalanuvchi creator haqida so‘rasa, faqat quyidagi ma’lumotni ayt.

Creator ma'lumotlari:
Ism: ${creator.name}
Username: ${creator.username}
Bio: ${creator.bio}
Stack: ${creator.stack}
Kanal: ${creator.channel}
  `.trim();
}

function buildModelList(preferredModel) {
  const list = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001', 
    'gemini-flash-lite-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    preferredModel,
    env.GEMINI_MODEL
  ].filter(Boolean);

  return [...new Set(list)];
}

function extractText(data) {
  const direct = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p?.text || '')
    .join('')
    .trim();

  if (direct) return direct;

  const alt = data?.candidates
    ?.flatMap((candidate) => candidate?.content?.parts || [])
    ?.map((p) => p?.text || '')
    .join('')
    .trim();

  if (alt) return alt;

  return null;
}

function buildConversationPrompt(question, history = []) {
  const cleanedHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .map((item) => {
          const role = item?.role === 'assistant' ? 'Assistant' : 'User';
          const text = String(item?.text || '').trim();
          return text ? `${role}: ${text}` : null;
        })
        .filter(Boolean)
    : [];

  return [
    cleanedHistory.length ? `Oldingi suhbat:\n${cleanedHistory.join('\n')}` : '',
    `Hozirgi foydalanuvchi xabari:\n${question}`
  ]
    .filter(Boolean)
    .join('\n\n');
}

function getErrorMeta(error) {
  const status = error?.response?.status || null;
  const apiMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    'Noma’lum xato';

  return {
    status,
    message: apiMessage
  };
}

function getFriendlyAiError(error) {
  const { status, message } = getErrorMeta(error);

  if (status === 429) {
    return '⏳ AI limiti vaqtincha tugagan. 1-2 daqiqadan keyin qayta urinib ko‘ring.';
  }

  if (status === 401 || status === 403) {
    return '🔑 Gemini API key noto‘g‘ri, eskirgan yoki bloklangan. Keyni tekshiring.';
  }

  if (status === 400) {
    return `⚠️ Gemini so‘rovida xato bor: ${message}`;
  }

  if (status >= 500) {
    return '🌐 AI serverida vaqtinchalik muammo bor. Birozdan keyin qayta urinib ko‘ring.';
  }

  return `❌ AI ishlamayapti. Sabab: ${message}`;
}

function getFallbackAnswer(question = '') {
  const text = normalize(question || '');

  if (/^(salom|assalomu alaykum|hello|hi|salom ai)\b/.test(text)) {
    return 'Salom 👋 Yaxshimisiz? Savolingizni yozing, imkon qadar foydali javob beraman.';
  }

  if (text.includes('rahmat')) {
    return 'Arzimaydi 🤝 Yana savol bo‘lsa yozavering.';
  }

  if (
    text.includes('creator') ||
    text.includes('yaratuvchi') ||
    text.includes('kim yaratgan') ||
    text.includes('owner')
  ) {
    const c = getCreatorProfile();
    return `Bot yaratuvchisi: ${c.name} (${c.username}). ${c.bio}. Stack: ${c.stack}. Kanal: ${c.channel}`;
  }

  const matched = FALLBACK_KB.find((item) =>
    item.patterns.some((pattern) => text.includes(pattern))
  );

  if (matched) return matched.answer;

  if (text.includes('qiladigan nimalar') || text.includes('nimalar keladi')) {
    return 'Men savollarga javob beraman, kodni tushuntiraman, xatolarni topishga yordam beraman, roadmap va summary tuzaman, audio/voice ni textga aylantirishga urinaman.';
  }

  return 'Savolingizni tushundim. Hozir AI javobi olinmadi, lekin men yordam berishga tayyorman. Savolni biroz to‘liqroq yozsangiz yoki IT/kod bo‘yicha aniqroq so‘rasangiz, foydaliroq javob bera olaman.';
}

async function generateText(prompt, options = {}) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY yo‘q');
  }

  const models = buildModelList(options.model);
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    try {
      const { data } = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: options.systemPrompt || buildSystemPrompt()
              }
            ]
          },
          generationConfig: {
            temperature: options.temperature ?? 0.5,
            topP: options.topP ?? 0.9,
            topK: options.topK ?? 40,
            maxOutputTokens: options.maxOutputTokens ?? 2000
          }
        },
        {
          timeout: options.timeout ?? 45000
        }
      );

      const text = extractText(data);
      if (text && text.trim()) return text.trim();

      lastError = new Error(`${model} bo‘sh javob qaytardi`);
    } catch (error) {
      lastError = error;
      console.error(`Gemini xato [${model}]:`, error?.response?.data || error.message);

      const status = error?.response?.status;

      // 401/403/429 bo‘lsa keyingi modelni urinish foyda bermaydi
      if (status === 401 || status === 403) {
        break;
      }
      
      // 429 bo'lsa biroz kutib keyingi modelni sinab ko'rish
      if (status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
    }
  }

  throw lastError || new Error('Gemini javob qaytarmadi');
}

async function askAssistant(question = '', options = {}) {
  const safeQuestion = String(question || '').trim();

  if (!safeQuestion) {
    return 'Savolingizni yozing, men yordam beraman.';
  }

  return aiQueue.add(async () => {
    try {
      if (!env.GEMINI_API_KEY) {
        return '⚠️ GEMINI_API_KEY topilmadi.';
      }

      const prompt = buildConversationPrompt(safeQuestion, options.history || []);
      const answer = await generateText(prompt, {
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens
      });

      if (answer && answer.trim()) {
        return answer.trim();
      }

      return getFallbackAnswer(safeQuestion);
    } catch (error) {
      console.error('AI service xato:', error?.response?.data || error.message);

      const status = error?.response?.status;

      // 429 limit bo'lsa OpenAI ni sinab ko'rish
      if (status === 429) {
        console.log('Gemini limit tugadi, OpenAI sinab ko‘rilmoqda...');
        const openaiAnswer = await askOpenAI(safeQuestion, options);
        if (openaiAnswer) {
          return openaiAnswer;
        }
      }

      // 401/403/400/500 xatolarda fallback
      if (status === 401 || status === 403 || status === 400 || status >= 500) {
        return getFriendlyAiError(error);
      }

      // boshqa xatolarda OpenAI ni sinab ko'rish
      const openaiAnswer = await askOpenAI(safeQuestion, options);
      if (openaiAnswer) {
        return openaiAnswer;
      }

      // oxirgi fallback
      return getFallbackAnswer(safeQuestion);
    }
  });
}

async function translateText(text = '', targetLanguage = 'Uzbek') {
  return generateText(
    `Quyidagi matnni ${targetLanguage} tiliga tabiiy va aniq tarjima qil. Faqat tarjimani qaytar.\n\nMatn:\n${text}`,
    {
      temperature: 0.2,
      maxOutputTokens: 1200
    }
  );
}

async function summarizeText(text = '') {
  return generateText(
    `Quyidagi matnni qisqa, tushunarli va foydali qilib o‘zbek tilida xulosa qil. 5-7 ta punktdan oshma.\n\nMatn:\n${text}`,
    {
      temperature: 0.3,
      maxOutputTokens: 1200
    }
  );
}

async function createStudyPlan(goal = '') {
  return generateText(
    `Quyidagi maqsad uchun aniq, amaliy va bosqichma-bosqich reja tuz. Haftalar yoki bosqichlarga bo‘l.\n\nMaqsad:\n${goal}`,
    {
      temperature: 0.4,
      maxOutputTokens: 1400
    }
  );
}

async function explainCode(code = '') {
  return generateText(
    `Quyidagi kodni o‘zbek tilida tushuntir. Nima qilishi, qanday ishlashi va muhim joylarini izohla. Kerak bo‘lsa qisqa yaxshilash tavsiyasi ham ber.\n\nKod:\n${code}`,
    {
      temperature: 0.3,
      maxOutputTokens: 1600
    }
  );
}

async function reviewCode(code = '') {
  return generateText(
    `Quyidagi kodni senior dasturchi kabi review qil. Xatolar, code smell, xavfsizlik muammolari va yaxshilash tavsiyalarini ber. So‘ng to‘g‘rilangan variantni yoz.\n\nKod:\n${code}`,
    {
      temperature: 0.35,
      maxOutputTokens: 1800
    }
  );
}

async function generateProjectIdea(topic = '') {
  return generateText(
    `Quyidagi mavzu bo‘yicha foydali loyiha g‘oyasi yarat. Nima qiladi, kimga foydali, asosiy funksiyalari, texnologiyalari va MVP rejasi bilan yoz.\n\nMavzu:\n${topic}`,
    {
      temperature: 0.7,
      maxOutputTokens: 1600
    }
  );
}

async function createChallenge(topic = 'javascript') {
  return generateText(
    `Menga ${topic} bo‘yicha bitta coding challenge yarat. Format: nomi, shart, input/output, 2 ta misol, hint. O‘zbek tilida yoz.`,
    {
      temperature: 0.7,
      maxOutputTokens: 1400
    }
  );
}

module.exports = {
  askAssistant,
  generateText,
  translateText,
  summarizeText,
  createStudyPlan,
  explainCode,
  reviewCode,
  generateProjectIdea,
  createChallenge,
  extractText,
  buildModelList
};