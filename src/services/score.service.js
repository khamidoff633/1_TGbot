const { readJson, writeJson } = require('../utils/storage');

const FILE = 'scores.json';

function getAllScores() {
  return readJson(FILE, {});
}

function getUserStats(user) {
  const all = getAllScores();
  const key = String(user.id);
  return all[key] || {
    userId: key,
    firstName: user.first_name || 'User',
    username: user.username || '',
    totalScore: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalInterviewScore: 0,
    topics: {}
  };
}

function saveUserStats(stats) {
  const all = getAllScores();
  all[String(stats.userId)] = stats;
  writeJson(FILE, all);
}

function registerAnswer(user, topic, isCorrect, mode = 'quiz') {
  const stats = getUserStats(user);
  stats.firstName = user.first_name || stats.firstName;
  stats.username = user.username || stats.username;
  stats.topics[topic] = stats.topics[topic] || { correct: 0, wrong: 0 };

  if (isCorrect) {
    stats.totalCorrect += 1;
    stats.topics[topic].correct += 1;
    if (mode === 'quiz') stats.totalScore += 5;
    if (mode === 'interview') stats.totalInterviewScore += 10;
  } else {
    stats.totalWrong += 1;
    stats.topics[topic].wrong += 1;
  }

  saveUserStats(stats);
  return stats;
}

function getLeaderboard(limit = 10) {
  const all = Object.values(getAllScores());
  return all
    .sort((a, b) => (b.totalScore + b.totalInterviewScore) - (a.totalScore + a.totalInterviewScore))
    .slice(0, limit);
}

module.exports = { getUserStats, registerAnswer, getLeaderboard };
