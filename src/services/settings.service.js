const { readJson, writeJson } = require('../utils/storage');
const env = require('../config/env');

const SETTINGS_FILE = 'settings.json';

function getAllSettings() {
  return readJson(SETTINGS_FILE, {});
}

function getDefaultSettings() {
  return {
    channelUsername: env.DEFAULT_CHANNEL_USERNAME || '',
    autoNews: env.AUTOPOST_ENABLED,
    newsCategory: 'uzbek'
  };
}

function getChatSettings(chatId) {
  const settings = getAllSettings();
  return settings[chatId] || getDefaultSettings();
}

function updateChatSettings(chatId, patch) {
  const settings = getAllSettings();
  settings[chatId] = { ...getChatSettings(chatId), ...patch };
  writeJson(SETTINGS_FILE, settings);
  return settings[chatId];
}

function getChatsWithAutoNews() {
  const settings = getAllSettings();
  return Object.entries(settings)
    .filter(([, value]) => value.autoNews && value.channelUsername)
    .map(([chatId, value]) => ({ chatId, ...value }));
}

module.exports = { getChatSettings, updateChatSettings, getChatsWithAutoNews };
