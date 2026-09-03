 const http = require('http');
http.createServer((req,res)=>{
 res.writeHead(200,{'Content-Type':'text/html'});
 res.end('<h1>MORARA BOT V2 - PRIVATE MODE ACTIVE</h1>');
}).listen(process.env.PORT||10000,()=>console.log('Web server running'));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot(){
 const { state, saveCreds } = await useMultiFileAuthState('./session')
 const sock = makeWASocket({
  auth: state,
  logger: P({level:'silent'}),
  printQRInTerminal: false,
  browser: ['Morara V2','Chrome','1.0']
 })

 if(!sock.authState.creds.registered){
  const phone = '254115417774' // <-- WEKA NAMBA YAKO HAPA BILA +
  setTimeout(async()=>{
   let code = await sock.requestPairingCode(phone)
   console.log('PAIRING CODE YAKO: ' + code)
  },3000)
 }

 sock.ev.on('creds.update', saveCreds)
 sock.ev.on('connection.update', async(update)=>{
  const {connection, lastDisconnect} = update
  if(connection==='open') console.log('MORARA BOT V2 CONNECTED SUCCESSFULLY!')
  if(connection==='close'){
   if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut){
    startBot()
   }
  }
 })

 sock.ev.on('messages.upsert', async({messages})=>{
  const m = messages[0]
  if(!m.message) return
  const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
  if(!body.startsWith('.')) return
  const args = body.slice(1).trim().split(/ +/)
  const command = args.shift().toLowerCase()
  const reply = (text)=> sock.sendMessage(m.key.remoteJid,{text})

  if(command==='ping') return reply('*Pong!* Speed: Active\nMorara Bot V2')
  if(command==='alive') return reply('*MORARA BOT V2*\nOwner: Philip Wafula\nMode: Private\nStatus: Online 🔥')
  if(command==='menu') return reply(`*MORARA BOT V2 MENU*\n\n*GROUP:*\n.tagall,.hidetag,.kick,.add\n\n*DOWNLOAD:*\n.play,.tiktok,.fb,.ig\n\n*STICKER:*\n.sticker,.s\n\n*OWNER:*\n.alive,.ping,.mode\n\n*FUN:*\n.joke,.quote\n\nBot by Philip - Private Mode`)
 })
}
startBot()
