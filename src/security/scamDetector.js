const { normalize } = require('../utils/formatters');

const PATTERNS = [
  { re: /(kodni yubor|sms kod|otp|tasdiqlash kodi)/i, score: 3, reason: 'Tasdiqlash kodi yoki OTP so‘ralmoqda.' },
  { re: /(tezda|darhol|shoshilinch|zudlik bilan)/i, score: 1, reason: 'Bosim qiluvchi uslub ishlatilgan.' },
  { re: /(pul yubor|karta|plastik|click|payme|uzcard|humo)/i, score: 2, reason: 'Pul yoki karta bilan bog‘liq iboralar bor.' },
  { re: /(adminman|supportman|tex yordam|operator)/i, score: 1, reason: 'O‘zini admin yoki support sifatida tanishtirmoqda.' },
  { re: /(parol|password|login qilib bering)/i, score: 3, reason: 'Parol yoki login ma’lumot so‘ralmoqda.' }
];

function scanMessageRisk(text = '') {
  const value = normalize(text);
  const reasons = [];
  let score = 0;

  for (const item of PATTERNS) {
    if (item.re.test(value)) {
      score += item.score;
      reasons.push(item.reason);
    }
  }

  let level = '🟢 Likely safe';
  let advice = 'Katta scam belgisi topilmadi. Baribir ehtiyot bo‘ling.';

  if (score >= 5) {
    level = '🔴 Dangerous';
    advice = 'Bu xabar firibgarlikka o‘xshaydi. Kod, parol yoki pul yubormang.';
  } else if (score >= 2) {
    level = '🟡 Suspicious';
    advice = 'Xabar shubhali ko‘rinmoqda. Tasdiqlash kodini hech kimga bermang.';
  }

  return {
    level,
    score,
    reasons: reasons.length ? reasons : ['Aniq scam belgisi topilmadi.'],
    advice
  };
}

module.exports = { scanMessageRisk };
