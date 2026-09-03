const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

console.log("=== WHATSAPP BOT STARTING ===");

// Make sure folders exist
try { fs.mkdirSync(settings.SESSION_DIR || './sessions', {recursive:true}); } catch {}
try { fs.mkdirSync('./database', {recursive:true}); } catch {}
try { fs.mkdirSync('./src/database', {recursive:true}); } catch {}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(settings.SESSION_DIR || './sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    browser: ["WhatsApp Bot", "Chrome", "1.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR CODE GENERATED - Scan with WhatsApp!");
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      console.log("Connection closed, reconnecting:", shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log("✅ WHATSAPP BOT CONNECTED SUCCESSFULLY!");
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
      console.log("New message:", text);

      // Load your case.js if exists
      try {
        const caseFile = path.join(__dirname, 'case.js');
        if (fs.existsSync(caseFile)) {
          delete require.cache[require.resolve('./case.js')];
          const handler = require('./case.js');
          if (typeof handler === 'function') await handler(sock, m);
        }
      } catch(e) { console.log("case.js error:", e.message); }

    } catch(e) { console.log("Message error:", e.message); }
  });
}

startBot().catch(err => {
  console.log("Fatal error:", err);
  setTimeout(startBot, 5000);
});
// Keep alive - no express needed
console.log("Bot will stay alive on Render");
setInterval(() => {}, 1000 * 60 * 60);
