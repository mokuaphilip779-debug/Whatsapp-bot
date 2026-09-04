 const express = require("express");
const app = express();
app.get("/", (req,res)=> res.send("MORARA BOT LIVE ✅"));
app.listen(process.env.PORT || 10000, ()=> console.log("Port listening"));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({version, auth:state, logger:pino({level:"silent"}), browser:["MORARA","Chrome","1.0"]});
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async(u)=>{
    const {connection, lastDisconnect} = u;
    if(connection==="open") console.log("✅ MORARA CONNECTED & ACTIVE");
    if(connection==="close" && lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut){
      setTimeout(startBot, 3000);
    }
  });
  sock.ev.on("messages.upsert", async({messages})=>{
    const m=messages[0]; if(!m?.message) return;
    const txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(txt.toLowerCase()===".menu" || txt.toLowerCase()==="menu"){
      await sock.sendMessage(m.key.remoteJid,{text:"*MORARA LIVE ✅*\n\n.menu\n.ping\n.alive\n.owner"});
    }
    if(txt.toLowerCase()===".ping") await sock.sendMessage(m.key.remoteJid,{text:"Pong! 🏓"});
  });
}
startBot();
