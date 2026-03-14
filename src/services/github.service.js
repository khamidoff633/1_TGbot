const axios = require('axios');
const { formatNumber } = require('../utils/formatters');

const api = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
  headers: {
    'User-Agent': 'it-news-bot'
  }
});

async function getRepoInfo(fullName) {
  const { data } = await api.get(`/repos/${fullName}`);
  return {
    fullName: data.full_name,
    description: data.description || 'Tavsif yo‘q',
    stars: formatNumber(data.stargazers_count),
    forks: formatNumber(data.forks_count),
    issues: formatNumber(data.open_issues_count),
    language: data.language || 'Unknown',
    updatedAt: new Date(data.updated_at).toLocaleString(),
    htmlUrl: data.html_url
  };
}

function daysAgoDate(days = 30) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now.toISOString().slice(0, 10);
}

async function getTrendingRepos(topic = 'javascript', limit = 5) {
  const q = `${topic} created:>${daysAgoDate(45)}`;
  const { data } = await api.get('/search/repositories', {
    params: {
      q,
      sort: 'stars',
      order: 'desc',
      per_page: limit
    }
  });

  return (data.items || []).map((repo) => ({
    fullName: repo.full_name,
    description: repo.description || 'Tavsif yo‘q',
    stars: formatNumber(repo.stargazers_count),
    language: repo.language || 'Unknown',
    url: repo.html_url
  }));
}

module.exports = { getRepoInfo, getTrendingRepos };
