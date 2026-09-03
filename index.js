require('http').createServer((req,res)=>res.end("Bot is running!")).listen(process.env.PORT||3000); const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const settings = require('./settings');
const readline = require('readline');

console.log("=== WHATSAPP BOT STARTING ===");
try { fs.mkdirSync(settings.SESSION_DIR || './sessions', {recursive:true}); } catch {}

function askQuestion(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(q, ans => { rl.close(); res(ans); }));
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(settings.SESSION_DIR || './sessions');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    browser: ["Ubuntu", "Chrome", "20.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  // PAIRING CODE LOGIC
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER || settings.OWNER_NUMBER || "254700000000";
    // clean number: only digits
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    console.log(`Requesting pairing code for: ${cleanNum}`);
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(cleanNum);
        console.log(`\n\n====================================`);
        console.log(`PAIRING CODE: ${code}`);
        console.log(`Go to WhatsApp > Linked Devices > Link with phone number > Enter this code`);
        console.log(`====================================\n\n`);
      } catch(e) { console.log("Pairing error:", e.message); }
    }, 3000);
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("Connection closed, reason:", reason, " reconnecting:", reason!== DisconnectReason.loggedOut);
      if (reason!== DisconnectReason.loggedOut) startBot();
    } else if (connection === 'open') {
      console.log("✅ WHATSAPP CONNECTED! Bot is LIVE!");
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    console.log("Message received");
    try {
      if (fs.existsSync('./src/case.js')) {
        delete require.cache[require.resolve('./case.js')];
        const handler = require('./case.js');
        if (typeof handler === 'function') await handler(sock, m);
      }
    } catch(e) { console.log("case error:", e.message); }
  });
}

startBot();
