 module.exports = async (sock, m) => {
try {
const msg = m.messages[0];
if(!msg.message) return;
const from = msg.key.remoteJid;
const isGroup = from.endsWith('@g.us');
const type = Object.keys(msg.message)[0];
const body = (type === 'conversation')? msg.message.conversation : (type === 'extendedTextMessage')? msg.message.extendedTextMessage.text : (type === 'imageMessage')? msg.message.imageMessage.caption : (type === 'videoMessage')? msg.message.videoMessage.caption : '';
const prefix = '.';
if(!body.startsWith(prefix)) return;
const cmd = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
const args = body.trim().split(/ +/).slice(1);
const q = args.join(' ');
const reply = (teks) => sock.sendMessage(from, { text: teks }, { quoted: msg });
const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
switch(cmd) {
case 'ping': reply(`Pong! ✅ Bot is alive!\nOwner: Philip Manani\nBot: Evolution.gntg`); break;
case 'alive': { let up = process.uptime(); let h=Math.floor(up/3600); let mm=Math.floor((up%3600)/60); let s=Math.floor(up%60); reply(`*Evolution.gntg Alive!* 🔥\n👤 Owner: Philip Manani Mokua\n⏰ Uptime: ${h}h ${mm}m ${s}s\n📍 Server: Render`); break; }
case 'menu': reply(`*EVOLUTION.GNTG MENU*\n\nBASIC\n.ping\n.alive\n.owner\n.runtime\n.time\n\nGROUP\n.tagall\n.hidetag\n.kick @user\n.add 254...\n.promote @user\n.demote @user\n.group open/close\n.link\n\nSTICKER\n.sticker - reply image\n.toimg - reply sticker\n\nTOOLS\n.calc 2+2*5\n.ai [swali]\n\nPrefix:.`); break;
case 'owner': reply(`*Owner: Philip Manani Mokua*\nBot: Evolution.gntg`); break;
case 'runtime': { let up=process.uptime(); let hh=Math.floor(up/3600); let mm=Math.floor((up%3600)/60); let ss=Math.floor(up%60); reply(`⏰ Uptime: ${hh}h ${mm}m ${ss}s`); break; }
case 'time': reply(`🕐 Nairobi: ${new Date().toLocaleString('en-KE',{timeZone:'Africa/Nairobi'})}`); break;
case 'tagall': { if(!isGroup) return reply('Group only!'); let meta = await sock.groupMetadata(from); let teks = `*📢 TAGALL*\n${q? q+'\n\n' : ''}`; let mems = []; for(let p of meta.participants){ teks+=`@${p.id.split('@')[0]} `; mems.push(p.id); } await sock.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg }); break; }
case 'hidetag': { if(!isGroup) return reply('Group only!'); let meta = await sock.groupMetadata(from); let mems = meta.participants.map(a=>a.id); await sock.sendMessage(from, { text: q || '🔥 Evolution.gntg', mentions: mems }, { quoted: msg }); break; }
case 'link': { if(!isGroup) return reply('Group only!'); let code=await sock.groupInviteCode(from); reply(`🔗 https://chat.whatsapp.com/${code}`); break; }
case 'kick': { if(!isGroup) return reply('Group only!'); if(mentions.length===0) return reply('Tag user:.kick @user'); await sock.groupParticipantsUpdate(from, mentions, 'remove'); reply('✅ Removed'); break; }
case 's': case 'sticker': { try { let qmsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage; let mediaMsg = qmsg? { message: qmsg } : msg; let mtype = Object.keys(mediaMsg.message || msg.message)[0]; let buffer; if(mtype==='imageMessage' || mtype==='videoMessage'){ buffer = await sock.downloadMediaMessage({ message: mediaMsg.message || msg.message }); } else return reply('Reply image/video with.sticker'); await sock.sendMessage(from, { sticker: buffer }, { quoted: msg }); } catch(e){ reply('Error: '+e.message); } break; }
case 'toimg': { try{ let qmsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage; if(!qmsg ||!qmsg.stickerMessage) return reply('Reply sticker with.toimg'); let buffer = await sock.downloadMediaMessage({ message: qmsg }); await sock.sendMessage(from, { image: buffer }, { quoted: msg }); }catch(e){ reply('Error: '+e.message); } break; }
case 'calc': { if(!q) return reply('.calc 2+2*5'); try{ let r=eval(q); reply(`🧮 ${q} = ${r}`); }catch(e){ reply('Invalid'); } break; }
}
} catch(e){ console.log('Case error:', e.message); }
};
