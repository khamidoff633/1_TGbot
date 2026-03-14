const snippets = require('../data/snippets');
const { normalize } = require('../utils/formatters');

module.exports = (bot) => {
  bot.command('code', async (ctx) => {
    const query = normalize(ctx.message.text.replace(/^\/code\s*/i, ''));

    if (!query) {
      return ctx.reply('Snippet nomini yozing. Masalan: /code binary search');
    }

    const exact = snippets[query];
    const matchedKey = exact ? query : Object.keys(snippets).find((key) => normalize(key).includes(query));

    if (!matchedKey) {
      return ctx.reply('Bu nomda snippet topilmadi. Masalan: binary search, fizzbuzz, debounce');
    }

    return ctx.reply(`🧩 Snippet: ${matchedKey}

${snippets[matchedKey]}`);
  });
};
