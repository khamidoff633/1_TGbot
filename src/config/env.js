require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  BOT_USERNAME: process.env.BOT_USERNAME || '',
  DEFAULT_CHANNEL_USERNAME: process.env.DEFAULT_CHANNEL_USERNAME || '',
  NEWS_CRON: process.env.NEWS_CRON || '0 10 */2 * *',
  AUTOPOST_ENABLED: String(process.env.AUTOPOST_ENABLED || 'true').toLowerCase() === 'true',
  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || '',
  PORT: Number(process.env.PORT || 10000),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  CREATOR_NAME: process.env.CREATOR_NAME || 'Bahriddin Hamidov',
  CREATOR_USERNAME: process.env.CREATOR_USERNAME || '@bakhridd1n_dev',
  CREATOR_BIO: process.env.CREATOR_BIO || 'Node.js backend o‘rganuvchi va IT kontent yaratuvchi.',
  CREATOR_STACK: process.env.CREATOR_STACK || 'Node.js, Express, Telegram Bot, JavaScript',
  CREATOR_CHANNEL: process.env.CREATOR_CHANNEL || '@backend_dev1'
};
