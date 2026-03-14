const { normalize } = require('../utils/formatters');

const KNOWN_BRANDS = {
  instagram: ['instagram.com', 'www.instagram.com'],
  tiktok: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
  telegram: ['telegram.org', 't.me', 'web.telegram.org'],
  google: ['google.com', 'accounts.google.com', 'mail.google.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
  whatsapp: ['whatsapp.com', 'web.whatsapp.com'],
  youtube: ['youtube.com', 'www.youtube.com', 'youtu.be']
};

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rb.gy', 'cutt.ly', 'tiny.cc', 'is.gd'];
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.fit', '.gq', '.cf', '.tk', '.ml', '.work', '.zip'];

function getHostname(value = '') {
  try {
    const url = new URL(value.trim());
    return normalize(url.hostname).replace(/^www\./, '');
  } catch {
    return '';
  }
}

function levenshtein(a = '', b = '') {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function detectBrandTypos(hostname = '') {
  const findings = [];
  const compact = hostname.replace(/[^a-z0-9]/g, '');
  for (const [brand, domains] of Object.entries(KNOWN_BRANDS)) {
    if (domains.includes(hostname) || domains.includes(`www.${hostname}`)) continue;
    const cleanBrand = brand.replace(/[^a-z0-9]/g, '');
    const distance = levenshtein(compact.slice(0, cleanBrand.length + 4), cleanBrand);
    if (compact.includes(cleanBrand)) continue;
    if (distance > 0 && distance <= 2 && hostname.includes(cleanBrand[0])) {
      findings.push(brand);
    }
  }
  return findings;
}

function analyzeDomain(url = '') {
  const hostname = getHostname(url);
  const reasons = [];
  let score = 0;

  if (!hostname) {
    return {
      hostname: '',
      score: 3,
      reasons: ['Link formati noto‘g‘ri yoki hostname aniqlanmadi.'],
      isShortener: false,
      looksOfficial: false
    };
  }

  const isShortener = SHORTENERS.includes(hostname);
  if (isShortener) {
    score += 2;
    reasons.push('Qisqartirilgan link. Asl manzil yashirilgan bo‘lishi mumkin.');
  }

  const tldHit = SUSPICIOUS_TLDS.find((tld) => hostname.endsWith(tld));
  if (tldHit) {
    score += 2;
    reasons.push(`Shubhali TLD ishlatilgan: ${tldHit}`);
  }

  const typoBrands = detectBrandTypos(hostname);
  if (typoBrands.length) {
    score += 3;
    reasons.push(`Domen mashhur servisga o‘xshatib yozilganga o‘xshaydi: ${typoBrands.join(', ')}`);
  }

  const looksOfficial = Object.values(KNOWN_BRANDS).some((domains) => domains.includes(hostname) || domains.includes(`www.${hostname}`));
  if (looksOfficial) reasons.push('Rasmiy yoki mashhur domen ko‘rinmoqda.');

  return { hostname, score, reasons, isShortener, looksOfficial };
}

module.exports = { analyzeDomain, getHostname, SHORTENERS, KNOWN_BRANDS };
