const fs = require('fs');
const path = require('path');

function getStorePath(fileName) {
  return path.join(__dirname, '..', 'store', fileName);
}

function readJson(fileName, fallback) {
  try {
    const filePath = getStorePath(fileName);
    if (!fs.existsSync(filePath)) {
      writeJson(fileName, fallback);
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`JSON o‘qishda xato (${fileName}):`, error.message);
    return fallback;
  }
}

function writeJson(fileName, data) {
  try {
    const filePath = getStorePath(fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`JSON yozishda xato (${fileName}):`, error.message);
  }
}

module.exports = { readJson, writeJson };
