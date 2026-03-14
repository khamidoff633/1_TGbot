function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shorten(text = '', max = 280) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function normalize(text = '') {
  return String(text).trim().toLowerCase();
}

function toSlug(text = '') {
  return normalize(text)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

function removeCommand(text = '', command = '') {
  const regex = new RegExp(`^/${command}(?:@\\w+)?\\s*`, 'i');
  return String(text).replace(regex, '').trim();
}

module.exports = { escapeHtml, shorten, normalize, toSlug, formatNumber, removeCommand };
