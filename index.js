 const http = require('http');
http.createServer((_,res)=>res.end('Bot Running')).listen(process.env.PORT||10000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

async function bot(){
  // Kama kuna SESSION_ID kwenye Render, itengeneze files
  if(process.env.SESSION_ID){
    try{
      const b64 = process.env.SESSION_ID;
      const json = Buffer.from(b64, 'base64').toString();
      if(!fs.existsSync('./session')) fs.mkdirSync('./session');
      fs.writeFileSync('./session/creds.json', json);
      console.log('✅ Session loaded from ENV');
    }catch(e){ console.log('Session ENV error', e.message) }
  }

  const {state,saveCreds} = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser: ['Morara','Chrome','1.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    if(u.connection==='open') console.log('✅ MORARA CONNECTED - HAKUNA CODE TENA!');
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) bot();
  });
}
bot();
