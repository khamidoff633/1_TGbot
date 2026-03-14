const { normalize } = require('../utils/formatters');

function getHumanLikeReply(message = '') {
  const text = normalize(message);

  if (/^(salom|assalomu alaykum|hello|hi)\b/.test(text)) {
    return 'Salom 👋 Men tayyorman. /help ni bosib barcha imkoniyatlarni ko‘rishingiz mumkin.';
  }

  if (text.includes('rahmat')) {
    return 'Arzimaydi 🤝 Yana yordam kerak bo‘lsa yozavering.';
  }

  if (text.includes('nima qila olasan') || text.includes('imkoniyat')) {
    return 'Men IT news, GitHub repo ma’lumoti, quiz, tiplar, snippetlar va kanal auto-post funksiyalarini bajaraman. /help ni yuboring.';
  }

  if (text.includes('yangilik')) {
    return 'IT yangiliklar kerak bo‘lsa /news yoki /news ai deb yozing 📰';
  }

  if (text.includes('quiz')) {
    return 'Quiz boshlash uchun /quiz javascript yoki /quiz nodejs deb yozing 🎯';
  }

  return 'Xabaringizni oldim ✅ Men buyruqlar bilan ancha kuchliman: /help';
}

module.exports = { getHumanLikeReply };
