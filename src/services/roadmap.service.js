const roadmaps = {
  backend: [
    'JavaScript syntax va ES6',
    'Node.js core modullar',
    'Express.js va REST API',
    'Database: PostgreSQL yoki MongoDB',
    'Auth: JWT, cookies, sessions',
    'Validation, logging, error handling',
    'Deployment: Render, Railway, VPS',
    'Testing va clean architecture'
  ],
  nodejs: [
    'Core JS',
    'Async/await, Promises, event loop',
    'Node modules, fs, path, os',
    'Express va middleware',
    'Database ulash',
    'Authentication',
    'File upload, cron, webhooks',
    'Production deployment'
  ],
  frontend: [
    'HTML',
    'CSS / responsive design',
    'JavaScript DOM',
    'Async fetch API',
    'React basics',
    'State management',
    'Routing',
    'Deployment'
  ],
  telegrambot: [
    'BotFather va webhook/polling',
    'Telegraf basics',
    'Commands va callbacks',
    'Session/state management',
    'JSON/DB storage',
    'Channel/group automation',
    'External API integration',
    'Deploy and monitoring'
  ]
};

function getRoadmap(topic = 'backend') {
  return roadmaps[topic.toLowerCase()] || roadmaps.backend;
}

function getTopics() {
  return Object.keys(roadmaps);
}

module.exports = { getRoadmap, getTopics };
