 const http = require('http');
http.createServer((_,res)=>res.end('Bot Running')).listen(process.env.PORT||10000);

const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

const PHONE = (process.env.PHONE_NUMBER || '').replace(/[^0-9]/g,''); // 2547... bila +

async function bot(){
 if(fs.existsSync('./session')) fs.rmSync('./session',{recursive:true,force:true});
 const {state,saveCreds} = await useMultiFileAuthState('./session');
 const sock = makeWASocket({
   auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})) },
   logger: P({level:'silent'}),
   printQRInTerminal: false,
   browser: ['Ubuntu','Chrome','20.0.04']
 });

 if(!sock.authState.creds.registered && PHONE){
   await new Promise(r=>setTimeout(r,4000));
   try{
     const code = await sock.requestPairingCode(PHONE);
     console.log('====================================');
     console.log('PAIRING CODE YAKO:', code);
     console.log('Weka ndani ya WhatsApp > Linked devices > Link with phone number');
     console.log('====================================');
   }catch(e){ console.log('Pairing failed:', e.message) }
 }

 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{
   if(u.connection==='open') console.log('✅ CONNECTED - MORARA BOT ONLINE');
   if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) bot();
 });
 sock.ev.on('messages.upsert', async({messages})=>{
   const m=messages[0]; if(!m.message) return;
   const txt = m.message.conversation || m.message.extendedTextMessage?.text || '';
   if(txt.toLowerCase()==='.ping') await sock.sendMessage(m.key.remoteJid,{text:'*Pong! Morara Online 🔥*'},{quoted:m});
 });
}
bot();
