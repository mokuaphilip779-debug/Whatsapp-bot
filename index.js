 require('http').createServer((req,res)=>{res.writeHead(200);res.end("Morara Bot Active - Philip Wafula");}).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const settings = require('./settings');

console.log("=== BOT STARTING ===");
try { fs.mkdirSync(settings.SESSION_DIR || './sessions', { recursive: true }); } catch {}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(settings.SESSION_DIR || './sessions');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })) },
    browser: ["Ubuntu","Chrome","20.0"]
  });
  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    const phoneNumber = (process.env.PHONE_NUMBER || "254115417774").replace(/[^0-9]/g,'');
    console.log("Phone:", phoneNumber);
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\nPAIRING CODE: ${code}\n`);
      } catch(e){ console.log("Pairing error:", e.message); }
    }, 3000);
  }
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("Closed, reason:", reason);
      if (reason!== DisconnectReason.loggedOut) startBot();
    } else if (connection === 'open') {
      console.log("✅ WHATSAPP CONNECTED!");
    }
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    try {
      // FIX: Angalia case.js mahali sahihi
      const casePath = './case.js';
      if (fs.existsSync(casePath)) {
        delete require.cache[require.resolve(casePath)];
        const h = require(casePath);
        if (typeof h === 'function') await h(sock, m);
      } else {
        console.log("case.js NOT FOUND at", casePath);
      }
    } catch(e){ console.log("Case error:", e.message); }
  });
}
startBot();
