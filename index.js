 const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

async function loadSession(){
  const sessionDir = path.join(__dirname, "session");
  if(!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir,{recursive:true});
  const credsPath = path.join(sessionDir,"creds.json");
  let txt = (process.env.SESSION_ID||"").trim();
  if(!txt) return;

  // Ondoa "KnightBot!" kama ipo
  if(txt.includes("KnightBot!")){
    txt = txt.split("\n").pop().trim(); // chukua line ya H4sI
  }
  if(txt.includes("~")) txt = txt.split("~")[1];

  try{
    console.log("Decoding Knight/BASE64 session...");
    let buffer = Buffer.from(txt, 'base64');
    // Jaribu ku-unzip kama ni H4sI (gzip)
    try{ buffer = zlib.gunzipSync(buffer); }catch(e){}
    let jsonStr = buffer.toString();
    // Kama bado ni base64 ndani
    if(!jsonStr.trim().startsWith("{")){
        try{
            let b2 = Buffer.from(jsonStr.trim(), 'base64').toString();
            if(b2.trim().startsWith("{")) jsonStr = b2;
        }catch{}
    }
    const data = JSON.parse(jsonStr);
    fs.writeFileSync(credsPath, JSON.stringify(data,null,2));
    console.log("✅ Session loaded from ENV (Knight/BASE64)");
  }catch(e){
    console.log("Session decode error:", e.message);
    // fallback: kama ni JSON direct
    try{ fs.writeFileSync(credsPath, txt); }catch{}
  }
}

async function startBot(){
  await loadSession();
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version, auth: state,
    logger: pino({level:"silent"}),
    printQRInTerminal:false,
    browser:["MORARA","Chrome","1.0"]
  });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async(update)=>{
    const { connection, lastDisconnect } = update;
    if(connection==="open"){ console.log("✅ MORARA CONNECTED & ACTIVE"); }
    if(connection==="close"){
      const reason = lastDisconnect?.error?.output?.statusCode;
      if(reason!==DisconnectReason.loggedOut){ console.log("Reconnecting..."); setTimeout(startBot,3000); }
    }
  });
  sock.ev.on("messages.upsert", async({messages})=>{
    const m = messages[0]; if(!m.message) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const jid = m.key.remoteJid;
    if(text.toLowerCase()==="menu" || text.toLowerCase()===".menu"){
      await sock.sendMessage(jid,{text:"*MORARA BOT*\n\n.menU\n.alive\n.ping\n.owner\n\nBot iko LIVE ✅"});
    }
    if(text.toLowerCase()===".ping"){ await sock.sendMessage(jid,{text:"Pong! 🏓 Speed: Active"}); }
    if(text.toLowerCase()===".alive"){ await sock.sendMessage(jid,{text:"MORARA is Alive ✅"}); }
  });
}
startBot();
