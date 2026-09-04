 const express = require("express");
const app = express();
app.get("/", (req,res)=> res.send("MORARA BOT IS LIVE ✅"));
app.listen(process.env.PORT || 10000, ()=> console.log("Port listening"));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

async function loadSession(){
  const dir = path.join(__dirname,"session");
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  const credsPath = path.join(dir,"creds.json");
  const env = (process.env.SESSION_ID||"").trim();
  if(env.startsWith("{")){
    fs.writeFileSync(credsPath, env);
    console.log("✅ Session loaded from ENV (JSON)");
  } else if(env){
    // jaribu kama ni file creds.json ilikuwa base64
    try{
      const buff = Buffer.from(env, 'base64').toString();
      if(buff.trim().startsWith("{")){ fs.writeFileSync(credsPath, buff); console.log("✅ Session loaded BASE64"); return; }
    }catch{}
  }
}

async function startBot(){
  await loadSession();
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({version, auth:state, logger:pino({level:"silent"}), browser:["MORARA","Chrome","1.0"]});
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async(u)=>{
    const {connection, lastDisconnect} = u;
    if(connection==="open") console.log("✅ MORARA CONNECTED & ACTIVE");
    if(connection==="close"){
      if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut){
        setTimeout(startBot,3000);
      }
    }
  });
  sock.ev.on("messages.upsert", async({messages})=>{
    const m=messages[0]; if(!m.message) return;
    const txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const jid=m.key.remoteJid;
    if(txt.toLowerCase()==="menu" || txt.toLowerCase()===".menu"){
      await sock.sendMessage(jid,{text:"*MORARA BOT LIVE ✅*\n\n.menu\n.ping\n.alive"});
    }
    if(txt.toLowerCase()===".ping") await sock.sendMessage(jid,{text:"Pong! 🏓 Bot iko fiti"});
    if(txt.toLowerCase()===".alive") await sock.sendMessage(jid,{text:"MORARA is Alive ✅"});
  });
}
startBot();
