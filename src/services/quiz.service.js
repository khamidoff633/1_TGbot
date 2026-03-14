const quizBank = require('../data/quiz');
const { normalize } = require('../utils/formatters');

function getAvailableTopics() {
  return Object.keys(quizBank);
}

function getRandomQuestion(topic = 'javascript') {
  const key = normalize(topic);
  const pool = quizBank[key] || quizBank.javascript;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { getAvailableTopics, getRandomQuestion };
