const axios = require('axios');
const env = require('../config/env');

// OpenAI API orqali javob berish (agar Gemini ishlamasa)
async function askOpenAI(question = '', options = {}) {
  const safeQuestion = String(question || '').trim();
  
  if (!safeQuestion) {
    return 'Savolingizni yozing, men yordam beraman.';
  }

  if (!env.OPENAI_API_KEY) {
    return null; // OpenAI API kaliti yo'q
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Sen professional AI assistant botsan. O'zbek tilida javob ber. Dasturchilar uchun coding mentor, oddiy foydalanuvchilar uchun ham tushunarli yordamchi bo'l.`
          },
          {
            role: 'user',
            content: safeQuestion
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const answer = response.data.choices[0]?.message?.content;
    return answer && answer.trim() ? answer.trim() : null;
  } catch (error) {
    console.error('OpenAI xato:', error?.response?.data || error.message);
    return null;
  }
}

module.exports = {
  askOpenAI
};
