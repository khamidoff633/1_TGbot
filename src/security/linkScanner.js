const { analyzeDomain } = require('./domainCheck');

function scanLink(raw = '') {
  let url = String(raw || '').trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const reasons = [];
  let score = 0;
  let hostname = '';
  let isHttps = false;
  let hasRedirectHint = false;

  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
    isHttps = parsed.protocol === 'https:';
    if (!isHttps) {
      score += 1;
      reasons.push('HTTPS ishlatilmagan.');
    }

    if (parsed.username || parsed.password) {
      score += 3;
      reasons.push('Link ichida username/password bor. Bu phishing belgisi bo‘lishi mumkin.');
    }

    if (parsed.search) {
      const q = parsed.search.toLowerCase();
      if (q.includes('redirect=') || q.includes('url=') || q.includes('next=')) {
        hasRedirectHint = true;
        score += 1;
        reasons.push('Redirect parametri topildi.');
      }
    }
  } catch {
    return {
      url: raw,
      hostname: '',
      level: '⚪ Unknown',
      reasons: ['Link formati noto‘g‘ri.'],
      advice: 'Linkni qayta tekshirib yuboring.',
      score: 4
    };
  }

  const domainInfo = analyzeDomain(url);
  score += domainInfo.score;
  reasons.push(...domainInfo.reasons);

  let level = '🟢 Likely safe';
  let advice = 'Katta xavf belgisi topilmadi. Baribir shaxsiy ma’lumot kiritishda ehtiyot bo‘ling.';

  if (score >= 5) {
    level = '🔴 Dangerous';
    advice = 'Linkni ochmang. Parol, SMS kod yoki karta ma’lumotini kiritmang.';
  } else if (score >= 2) {
    level = '🟡 Suspicious';
    advice = 'Link shubhali ko‘rinmoqda. Ochishdan oldin yaxshilab tekshiring.';
  }

  return {
    url,
    hostname,
    isHttps,
    hasRedirectHint,
    level,
    reasons: reasons.length ? reasons : ['Xavf belgisi topilmadi.'],
    advice,
    score,
    looksOfficial: domainInfo.looksOfficial
  };
}

function formatLinkScan(result) {
  return [
    `🔗 Link: ${result.url}`,
    `🌐 Domen: ${result.hostname || 'aniqlanmadi'}`,
    `🛡 Natija: ${result.level}`,
    '',
    'Sabablar:',
    `- ${result.reasons.join('\n- ')}`,
    '',
    `Tavsiya:\n${result.advice}`
  ].join('\n');
}

module.exports = { scanLink, formatLinkScan };
