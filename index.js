 const http = require('http');
http.createServer((_,res)=>res.end('Bot Running')).listen(process.env.PORT||10000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const { File } = require('megajs');

async function downloadMegaSession(megaCode){
  const megaUrl = `https://mega.nz/file/${megaCode}`;
  const file = File.fromURL(megaUrl);
  return new Promise((resolve,reject)=>{
    let data='';
    file.download((err, stream)=>{
      if(err) return reject(err);
      stream.on('data', c=> data+=c.toString());
      stream.on('end', ()=> resolve(data));
      stream.on('error', reject);
    });
  });
}

async function bot(){
 if(process.env.SESSION_ID){
  try{
   let txt = process.env.SESSION_ID.trim();
   let credsData;
   if(txt.includes('MEGA-MD') || txt.includes('GlobalTechInfo')){
     let code = txt.split('/').pop().split('_').pop().replace('~','');
     if(txt.includes('~')) code = txt.split('~').pop();
     console.log('Downloading MEGA session...', code.slice(0,10));
     credsData = await downloadMegaSession(code);
   }else{
     credsData = Buffer.from(txt, 'base64').toString();
   }
   if(!fs.existsSync('./session')) fs.mkdirSync('./session');
   fs.writeFileSync('./session/creds.json', credsData);
   console.log('✅ Session loaded from ENV');
  }catch(e){ console.log('Session ENV error', e.message) }
 }
 const {state,saveCreds} = await useMultiFileAuthState('./session');
 const sock = makeWASocket({
   auth: state,
   logger: P({level: 'silent'}),
   syncFullHistory: false,
   markOnlineOnConnect: false,
   shouldSyncHistoryMessage: ()=> false
 });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{
  if(u.connection==='open') console.log('✅ MORARA CONNECTED & ACTIVE');
  if(u.connection==='close'){
    const r = u.lastDisconnect?.error?.output?.statusCode;
    console.log('Closed', r);
    if(r!==DisconnectReason.loggedOut) setTimeout(bot, 3000);
  }
 });
}
bot();
