const axios = require('axios');
const env = require('../config/env');
const { normalize } = require('../utils/formatters');
const { getCreatorProfile } = require('./creator.service');

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
      'Sequelize’da asosiy relationlar: hasOne, belongsTo, hasMany, belongsToMany. FK odatda belongsTo tomonda turadi.'
  },
  {
    patterns: ['mongodb nima'],
    answer:
      'MongoDB — document-based NoSQL ma’lumotlar bazasi. Ma’lumotlar collection ichida JSON’ga o‘xshash document ko‘rinishida saqlanadi.'
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
- Keraksiz uzrlar, “aniqroq yozing” kabi sovuq gaplarni ishlatma. Savol noaniq bo‘lsa, o‘zing eng ehtimoliy ma’noni tanlab foydali javob ber.
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
`;
}

function buildModelList(preferredModel) {
  const list = [
    preferredModel,
    env.GEMINI_MODEL,
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash'
  ].filter(Boolean);

  return [...new Set(list)];
}

function extractText(data) {
  const direct = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p?.text || '')
    .join('')
    .trim();

  if (direct) return direct;

  const alt = data?.candidates?.flatMap((candidate) => candidate?.content?.parts || [])
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
        { timeout: options.timeout ?? 45000 }
      );

      const text = extractText(data);
      if (text) return text;
      lastError = new Error(`${model} bo‘sh javob qaytardi`);
    } catch (error) {
      lastError = error;
      console.error(`Gemini xato [${model}]:`, error.response?.data || error.message);
    }
  }

  throw lastError || new Error('Gemini javob qaytarmadi');
}

function getFallbackAnswer(question = '') {
  const text = normalize(question);

  if (/^(salom|assalomu alaykum|hello|hi)\b/.test(text)) {
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

  if (text.includes('nima qila olasan') || text.includes('imkoniyat')) {
    return 'Men IT savollarga javob beraman, kodni tushuntiraman, xatoni topishga yordam beraman, tarjima, summary, roadmap, quiz va voice transcript qilaman.';
  }

  const matched = FALLBACK_KB.find((item) =>
    item.patterns.some((pattern) => text.includes(pattern))
  );

  if (matched) return matched.answer;

  return 'Savolingizni oldim. Hozir AI javobi olinmadi, lekin savolni aniqroq yoki to‘liqroq yozsangiz foydaliroq yordam bera olaman. Masalan: “Node.js nima?”, “MongoDB bilan SQL farqi”, “Express API misol ber”.';
}

async function askAssistant(question = '', options = {}) {
  try {
    if (env.GEMINI_API_KEY) {
      const prompt = buildConversationPrompt(question, options.history || []);
      const answer = await generateText(prompt, {
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens
      });
      if (answer) return answer;
    }
  } catch (error) {
    console.error('AI service xato:', error.response?.data || error.message);
  }

  return getFallbackAnswer(question);
}

async function translateText(text = '', targetLanguage = 'Uzbek') {
  return generateText(`Quyidagi matnni ${targetLanguage} tiliga tabiiy va aniq tarjima qil. Faqat tarjimani qaytar.\n\nMatn:\n${text}`, {
    temperature: 0.2,
    maxOutputTokens: 1200
  });
}

async function summarizeText(text = '') {
  return generateText(`Quyidagi matnni qisqa, tushunarli va foydali qilib o‘zbek tilida xulosa qil. 5-7 ta punktdan oshma.\n\nMatn:\n${text}`, {
    temperature: 0.3,
    maxOutputTokens: 1200
  });
}

async function createStudyPlan(goal = '') {
  return generateText(`Quyidagi maqsad uchun aniq, amaliy va bosqichma-bosqich reja tuz. Haftalar yoki bosqichlarga bo‘l.\n\nMaqsad:\n${goal}`, {
    temperature: 0.4,
    maxOutputTokens: 1400
  });
}

async function explainCode(code = '') {
  return generateText(`Quyidagi kodni o‘zbek tilida tushuntir. Nima qilishi, qanday ishlashi va muhim joylarini izohla. Kerak bo‘lsa qisqa yaxshilash tavsiyasi ham ber.\n\nKod:\n${code}`, {
    temperature: 0.3,
    maxOutputTokens: 1600
  });
}

async function reviewCode(code = '') {
  return generateText(`Quyidagi kodni senior dasturchi kabi review qil. Xatolar, code smell, xavfsizlik muammolari va yaxshilash tavsiyalarini ber. So‘ng to‘g‘rilangan variantni yoz.\n\nKod:\n${code}`, {
    temperature: 0.35,
    maxOutputTokens: 1800
  });
}

async function generateProjectIdea(topic = '') {
  return generateText(`Quyidagi mavzu bo‘yicha foydali loyiha g‘oyasi yarat. Nima qiladi, kimga foydali, asosiy funksiyalari, texnologiyalari va MVP rejasi bilan yoz.\n\nMavzu:\n${topic}`, {
    temperature: 0.7,
    maxOutputTokens: 1600
  });
}

async function createChallenge(topic = 'javascript') {
  return generateText(`Menga ${topic} bo‘yicha bitta coding challenge yarat. Format: nomi, shart, input/output, 2 ta misol, hint. O‘zbek tilida yoz.`, {
    temperature: 0.7,
    maxOutputTokens: 1400
  });
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
