 import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const chalk = require('chalk');
const pino = require('pino');
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } from '@whiskeysockets/baileys';
import settings from './settings.js';
import { handleMessage } from './case.js';

import { sessionDir, getWaSettings, setWaSetting, getAllPairs, addPair, removePair } from './helper/function.js';
import { ensureDir } from './lib/utils.js';

global.botStartTime = Date.now();
ensureDir(settings.SESSION_DIR || './session');
ensureDir('./database');

const activeSockets = new Map();
const notifiedConnected = new Set();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir());
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'fatal' }))
    },
    logger: pino({ level: 'silent' }),
    browser: ['Philip Bot', 'Chrome', '1.0.0']
  });

  activeSockets.set('main', sock);
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log(chalk.green('BOT CONNECTED SUCCESSFULLY!'));
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message) return;
      await handleMessage(sock, msg);
    } catch (e) {
      console.log('Message error:', e.message);
    }
  });
}

startBot();

console.log('Starting bot...');
