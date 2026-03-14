const Parser = require('rss-parser');
const { normalize, shorten } = require('../utils/formatters');
const { readJson, writeJson } = require('../utils/storage');

const parser = new Parser({ timeout: 20000 });

const FEEDS = {
  uzbek: [
    'https://news.google.com/rss/search?q=texnologiya%20OR%20dasturlash%20OR%20sun%27iy%20intellekt&hl=uz&gl=UZ&ceid=UZ:uz',
    'https://news.google.com/rss/search?q=site:spot.uz%20texnologiya&hl=uz&gl=UZ&ceid=UZ:uz',
    'https://news.google.com/rss/search?q=site:kun.uz%20texnologiya&hl=uz&gl=UZ&ceid=UZ:uz',
    'https://news.google.com/rss/search?q=site:daryo.uz%20texnologiya&hl=uz&gl=UZ&ceid=UZ:uz',
    'https://news.google.com/rss/search?q=site:terabayt.uz%20texnologiya&hl=uz&gl=UZ&ceid=UZ:uz'
  ],
  general: [
    'https://news.google.com/rss/search?q=IT%20OR%20technology&hl=en-US&gl=US&ceid=US:en',
    'https://techcrunch.com/feed/'
  ],
  ai: [
    'https://news.google.com/rss/search?q=sun%27iy%20intellekt&hl=uz&gl=UZ&ceid=UZ:uz',
    'https://news.google.com/rss/search?q=artificial%20intelligence&hl=en-US&gl=US&ceid=US:en'
  ],
  javascript: [
    'https://news.google.com/rss/search?q=javascript%20OR%20node.js&hl=en-US&gl=US&ceid=US:en'
  ],
  cybersecurity: [
    'https://news.google.com/rss/search?q=kiberxavfsizlik&hl=uz&gl=UZ&ceid=UZ:uz',
    'https://feeds.feedburner.com/TheHackersNews'
  ]
};

function getFeedsByCategory(category = 'uzbek') {
  const key = normalize(category);
  return FEEDS[key] || FEEDS.uzbek;
}

function cleanTitle(title = '') {
  return String(title).replace(/\s+-\s+[^-]+$/, '').trim();
}

function isUzbekish(item) {
  const blob = normalize(`${item.title} ${item.contentSnippet} ${item.source}`);
  return /(oʻ|o‘|gʻ|g‘|sh|ch|texnolog|dastur|sun|yangilik|uz|spot|kun|daryo|terabayt)/.test(blob);
}

async function loadFeedItems(category = 'uzbek') {
  const feeds = getFeedsByCategory(category);
  const responses = await Promise.allSettled(feeds.map((feed) => parser.parseURL(feed)));
  const items = [];

  responses.forEach((response) => {
    if (response.status !== 'fulfilled') return;
    const feed = response.value;
    for (const item of feed.items || []) {
      items.push({
        title: cleanTitle(item.title || 'No title'),
        link: item.link || '',
        contentSnippet: shorten(item.contentSnippet || item.content || '', 220),
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.title || item.creator || 'Unknown source'
      });
    }
  });

  let output = items.filter((item) => item.link);
  if (normalize(category) === 'uzbek') {
    output = output.filter(isUzbekish);
  }

  return output.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${normalize(item.title)}|${item.link}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getLatestNews(category = 'uzbek', limit = 5) {
  const items = await loadFeedItems(category);
  return dedupeItems(items).slice(0, limit);
}

function getPostedNews() {
  return readJson('posted-news.json', []);
}

function markAsPosted(ids) {
  const current = new Set(getPostedNews());
  ids.forEach((id) => current.add(id));
  writeJson('posted-news.json', Array.from(current).slice(-1000));
}

async function getUnpostedNews(category = 'uzbek', limit = 1) {
  const news = await getLatestNews(category, 25);
  const posted = new Set(getPostedNews());
  return news.filter((item) => !posted.has(item.link)).slice(0, limit);
}

function formatNewsItem(item, index = null) {
  return [
    index !== null ? `${index + 1}️⃣ ${item.title}` : `📰 ${item.title}`,
    `Manba: ${item.source}`,
    item.contentSnippet ? `Qisqacha: ${shorten(item.contentSnippet, 180)}` : null,
    `Batafsil: ${item.link}`
  ].filter(Boolean).join('\n');
}

module.exports = { getLatestNews, getUnpostedNews, markAsPosted, getFeedsByCategory, formatNewsItem };
