const { Telegraf } = require('telegraf');
const env = require('./env');

if (!env.BOT_TOKEN) {
  console.error('BOT_TOKEN topilmadi. .env faylni to‘ldiring.');
  process.exit(1);
}

const bot = new Telegraf(env.BOT_TOKEN);

module.exports = bot;
