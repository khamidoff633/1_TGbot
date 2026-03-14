const env = require('../config/env');

function getCreatorProfile() {
  return {
    name: env.CREATOR_NAME,
    username: env.CREATOR_USERNAME,
    bio: env.CREATOR_BIO,
    stack: env.CREATOR_STACK,
    channel: env.CREATOR_CHANNEL
  };
}

module.exports = { getCreatorProfile };
