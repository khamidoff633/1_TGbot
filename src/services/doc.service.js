const docs = {
  nodejs: {
    title: 'Node.js',
    summary: 'Server-side JavaScript runtime. Backend, scripts, bots va APIlar uchun juda qulay.',
    link: 'https://nodejs.org/en/docs'
  },
  express: {
    title: 'Express.js',
    summary: 'Node.js uchun minimal va tezkor web framework. REST API va backendlar uchun ishlatiladi.',
    link: 'https://expressjs.com/'
  },
  telegraf: {
    title: 'Telegraf',
    summary: 'Telegram botlar yaratish uchun kuchli Node.js kutubxonasi.',
    link: 'https://telegraf.js.org/'
  },
  sequelize: {
    title: 'Sequelize',
    summary: 'SQL database’lar bilan ORM usulida ishlashga yordam beradi.',
    link: 'https://sequelize.org/'
  },
  postgresql: {
    title: 'PostgreSQL',
    summary: 'Kuchli va professional open-source relational database.',
    link: 'https://www.postgresql.org/docs/'
  },
  mongodb: {
    title: 'MongoDB',
    summary: 'Document-based NoSQL database. JSONga o‘xshash ma’lumot saqlaydi.',
    link: 'https://www.mongodb.com/docs/'
  },
  git: {
    title: 'Git',
    summary: 'Versiya nazorati uchun standart vosita. Branch, merge, rebase kabi flowlarni boshqaradi.',
    link: 'https://git-scm.com/doc'
  },
  render: {
    title: 'Render',
    summary: 'Web service, cron va app deploy qilish uchun hosting platforma.',
    link: 'https://render.com/docs'
  }
};

function getDoc(topic = 'nodejs') {
  return docs[topic.toLowerCase()] || null;
}

function getDocTopics() {
  return Object.keys(docs);
}

module.exports = { getDoc, getDocTopics };
