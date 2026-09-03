 const http = require('http');
http.createServer((_,res)=>res.end('Bot Running')).listen(process.env.PORT||10000);

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

async function bot(){
 if(fs.existsSync('./session')) fs.rmSync('./session',{recursive:true,force:true});
 const {state,saveCreds} = await useMultiFileAuthState('./session');
 const sock = makeWASocket({
   auth: state,
   logger: P({level:'silent'}),
   printQRInTerminal: true,
   browser: ['Morara Bot','Chrome','121.0']
 });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{
   if(u.connection==='open') console.log('✅ CONNECTED SUCCESSFULLY');
   if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) bot();
 });
 sock.ev.on('messages.upsert', async({messages})=>{
   const m=messages[0]; if(!m.message) return;
   const txt = m.message.conversation || m.message.extendedTextMessage?.text || '';
   if(txt==='.ping') sock.sendMessage(m.key.remoteJid,{text:'*Pong! Morara Online 🔥*'},{quoted:m});
 });
}
bot();
