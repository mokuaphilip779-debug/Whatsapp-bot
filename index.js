 const http = require('http');
http.createServer((_,res)=>res.end('Bot Running')).listen(process.env.PORT||10000);

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const fs = require('fs');

async function bot(){
 if(fs.existsSync('./session')) fs.rmSync('./session',{recursive:true,force:true});
 const {state,saveCreds} = await useMultiFileAuthState('./session');
 const sock = makeWASocket({
   auth: state,
   logger: P({level:'silent'}),
   browser: ['Morara Bot','Chrome','1.0']
 });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', async(up)=>{
   const {connection, lastDisconnect, qr} = up;
   if(qr){
     console.log('--- SCAN HII QR KWENYE WHATSAPP ---');
     qrcode.generate(qr, {small:true});
   }
   if(connection==='open') console.log('✅ MORARA CONNECTED!');
   if(connection==='close' && lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) bot();
 });
 sock.ev.on('messages.upsert', async({messages})=>{
   const m=messages[0]; if(!m.message) return;
   const txt = m.message.conversation || m.message.extendedTextMessage?.text || '';
   if(txt==='.ping') await sock.sendMessage(m.key.remoteJid,{text:'*Pong! Morara V3 Online 🔥*'},{quoted:m});
 });
}
bot();
