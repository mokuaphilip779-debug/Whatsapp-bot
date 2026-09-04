 const http = require('http');
http.createServer((_,res)=>res.end('Bot Running')).listen(process.env.PORT || 10000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

async function bot(){
 if(process.env.SESSION_ID){
  try{
   let b64 = process.env.SESSION_ID.trim();
   // Toa prefix kama ni MEGA-MD_ au GlobalTechInfo
   if(b64.includes('MEGA-MD_')) b64 = b64.split('MEGA-MD_')[1];
   if(b64.includes('~')) b64 = b64.split('~').pop();
   if(b64.includes('/')) b64 = b64.split('/').pop();
   const json = Buffer.from(b64, 'base64').toString();
   if(!fs.existsSync('./session')) fs.mkdirSync('./session');
   fs.writeFileSync('./session/creds.json', json);
   console.log('✅ Session loaded from ENV');
  }catch(e){ console.log('Session ENV error', e.message) }
 }

 const {state,saveCreds} = await useMultiFileAuthState('./session');
 const sock = makeWASocket({
   auth: state,
   logger: P({level: 'silent'}),
   syncFullHistory: false,
   markOnlineOnConnect: false,
   shouldSyncHistoryMessage: ()=> false,
   printQRInTerminal: false
 });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{
  if(u.connection==='open') console.log('✅ MORARA CONNECTED & ACTIVE');
  if(u.connection==='close'){
    const reason = u.lastDisconnect?.error?.output?.statusCode;
    console.log('Connection closed', reason);
    if(reason!== DisconnectReason.loggedOut) bot();
  }
 });
}
bot();
