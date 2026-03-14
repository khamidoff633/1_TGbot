const bank = require('../data/interview');
const { normalize } = require('../utils/formatters');

function getInterviewTopics() {
  return Object.keys(bank);
}

function getRandomInterviewQuestion(topic = 'backend') {
  const key = normalize(topic);
  const pool = bank[key] || bank.backend;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { getInterviewTopics, getRandomInterviewQuestion };
