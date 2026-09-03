 module.exports = async (sock, msg) => {
try {
const from = msg.key.remoteJid;
const isGroup = from.endsWith('@g.us');
const type = Object.keys(msg.message || {})[0];
const body = (type === 'conversation')? msg.message.conversation : (type === 'extendedTextMessage')? msg.message.extendedTextMessage.text : (type === 'imageMessage' && msg.message.imageMessage.caption)? msg.message.imageMessage.caption : (type === 'videoMessage' && msg.message.videoMessage.caption)? msg.message.videoMessage.caption : '';
if(!body) return;
const prefix = '.';
if(!body.startsWith(prefix)) return;
const args = body.slice(prefix.length).trim().split(/ +/);
const cmd = args.shift().toLowerCase();
const q = args.join(' ');
const reply = (teks) => sock.sendMessage(from, { text: teks }, { quoted: msg });

switch(cmd) {
case 'ping':
reply(`Pong! ✅ Bot is alive!\nOwner: Philip Manani\nBot: Evolution.gntg`);
break;
case 'alive': {
let up = process.uptime();
let h=Math.floor(up/3600);
let mm=Math.floor((up%3600)/60);
let s=Math.floor(up%60);
reply(`*Evolution.gntg Alive!* 🔥\n👤 Owner: Philip Manani Mokua\n⏰ Uptime: ${h}h ${mm}m ${s}s`);
break;
}
case 'menu':
reply(`*EVOLUTION.GNTG MENU*\n\n.ping - check bot\n.alive - uptime\n.menu - this menu\n.owner\n.runtime\n.tagall [text] - group only\n.hidetag [text]\n.sticker - reply image\n.toimg - reply sticker\n.calc 2+2*5`);
break;
case 'owner':
reply(`*Owner: Philip Manani Mokua*\nBot: Evolution.gntg`);
break;
case 'runtime': {
let up=process.uptime();
let hh=Math.floor(up/3600);
let mm=Math.floor((up%3600)/60);
let ss=Math.floor(up%60);
reply(`⏰ Uptime: ${hh}h ${mm}m ${ss}s`);
break;
}
case 'tagall': {
if(!isGroup) return reply('Group only!');
let meta = await sock.groupMetadata(from);
let teks = `*📢 TAGALL*\n${q? q+'\n\n' : ''}`;
let mems = [];
for(let p of meta.participants){ teks+=`@${p.id.split('@')[0]} `; mems.push(p.id); }
await sock.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg });
break;
}
case 'sticker': case 's': {
try{
let qmsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
let media = qmsg? { message: qmsg } : msg;
let buff = await sock.downloadMediaMessage({ message: media.message || msg.message });
if(!buff) return reply('Reply image/video');
await sock.sendMessage(from, { sticker: buff }, { quoted: msg });
}catch(e){ reply('Error: '+e.message); }
break;
}
case 'calc': {
if(!q) return reply('.calc 2+2*5');
try{ let r=eval(q); reply(`${q} = ${r}`); }catch{ reply('Invalid'); }
break;
}
}
} catch(e){
console.log('Case error:', e.message);
}
};
