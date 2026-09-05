 // PHILIP-MD Base - Edited for Philip
'use strict';
require('dotenv').config();

module.exports = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
  OWNER_TELEGRAM_ID: process.env.OWNER_TELEGRAM_ID || '',
  OWNER_NAME: process.env.OWNER_NAME || 'Philip',
  SUDO_NUMBER: process.env.SUDO_NUMBER || '254115417774',
  
  BOT_NAME: process.env.BOT_NAME || 'MORARA-MD',
  BOT_VERSION: '1.0.0',
  COMPANY: 'Philip Tech',
  CREDITS: 'Philip',

  SESSION_DIR: './sessions',
  DEFAULT_PREFIX: '.',
  DEFAULT_MENU_IMG: process.env.MENU_IMG || 'https://files.catbox.moe/1g6k1a.jpg',

  REQUIRED_CHANNEL: process.env.REQUIRED_CHANNEL || '',
  REQUIRED_GROUP: process.env.REQUIRED_GROUP || '',
  REQUIRED_CHANNEL_LINK: process.env.REQUIRED_CHANNEL_LINK || '',
  REQUIRED_GROUP_LINK: process.env.REQUIRED_GROUP_LINK || '',
  REQUIRED_CHANNEL_ID: process.env.REQUIRED_CHANNEL_ID || '',
  REQUIRED_GROUP_ID: process.env.REQUIRED_GROUP_ID || '',

  AUTO_FOLLOW_NEWSLETTERS: [''],
  AUTO_JOIN_GROUPS: [],
};
