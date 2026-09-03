module.exports = async (m, sock, { args, pushName, prefix }) => {
const cmd = m.command || m.body?.toLowerCase().split(' ')[0].replace(prefix,'');
const q = args.join(' ');
const reply = (teks) => sock.sendMessage(m.chat, { text: teks }, { quoted: m });
const isGroup = m.isGroup;
try {
switch(cmd) {
case 'ping': { reply(`Pong! ✅ Bot is alive!\nSpeed: ${(Date.now() - m.timestamp)/1000}s\nOwner: Philip Manani Mokua\nBot: Evolution.gntg`); break; }
case 'alive': { let uptime = process.uptime(); let h = Math.floor(uptime/3600); let mm = Math.floor((uptime%3600)/60); let s = Math.floor(uptime%60); reply(`*Evolution.gntg Alive!* 🔥\n\n👤 Owner: Philip Manani Mokua\n⏰ Uptime: ${h}h ${mm}m ${s}s\n📍 Server: Render\n🔗 URL: https://whatsapp-bot-vjxa.onrender.com\n\nType ${prefix}menu for commands`); break; }
case 'menu': case 'help': {
let menu = `*╭───「 EVOLUTION.GNTG 」───╮*\n*│* 👤 Owner: Philip Manani\n*│* 🔥 Bot: Active 24/7\n*│* 📍 Render: Online\n*╰───────────────────╯*\n\n*📌 BASIC*\n${prefix}ping\n${prefix}alive\n${prefix}owner\n${prefix}runtime\n\n*👥 GROUP*\n${prefix}tagall\n${prefix}hidetag [text]\n${prefix}kick @user\n${prefix}add 254...\n${prefix}promote @user\n${prefix}demote @user\n${prefix}group open/close\n${prefix}link\n\n*🎨 STICKER*\n${prefix}sticker / s - reply image\n${prefix}toimg - sticker to image\n\n*🤖 AI & TOOLS*\n${prefix}ai [question]\n${prefix}calc [2+2]\n${prefix}time\n${prefix}date\n\nPowered by Philip Manani Mokua`; reply(menu); break; }
case 'owner': { reply(`*Owner: Philip Manani Mokua*\n📞 Number: Owner\n🤖 Bot: Evolution.gntg`); break; }
case 'runtime': { let up = process.uptime(); let hh = Math.floor(up/3600); let mm = Math.floor((up%3600)/60); let ss = Math.floor(up%60); reply(`⏰ Uptime: ${hh}h ${mm}m ${ss}s`); break; }
case 'tagall': { if(!isGroup) return reply('Group only!'); let participants = m.groupMetadata?.participants || (await sock.groupMetadata(m.chat)).participants; let teks = `*📢 TAGALL*\n\n${q? `${q}\n\n` : ''}`; let mentions = []; for(let mem of participants){ teks += `@${mem.id.split('@')[0]} `; mentions.push(mem.id); } await sock.sendMessage(m.chat, { text: teks, mentions }, { quoted: m }); break; }
case 'hidetag': { if(!isGroup) return reply('Group only!'); let participants = m.groupMetadata?.participants || (await sock.groupMetadata(m.chat)).participants; let mentions = participants.map(a=>a.id); await sock.sendMessage(m.chat, { text: q || '🔥 Evolution.gntg', mentions }, { quoted: m }); break; }
case 'link': { if(!isGroup) return reply('Group only!'); let code = await sock.groupInviteCode(m.chat); reply(`🔗 https://chat.whatsapp.com/${code}`); break; }
case 'kick': { if(!isGroup) return reply('Group only!'); if(!m.mentionedJid || m.mentionedJid.length===0) return reply(`Use: ${prefix}kick @user`); await sock.groupParticipantsUpdate(m.chat, m.mentionedJid, 'remove'); reply(`✅ Removed`); break; }
case 's': case 'sticker': { try { let quoted = m.quoted? m.quoted : m; let mime = (quoted.msg || quoted).mimetype || ''; if(!/image|video/.test(mime)) return reply(`Reply image with ${prefix}sticker`); let media = await quoted.download(); await sock.sendMessage(m.chat, { sticker: media }, { quoted: m }); } catch(e){ reply('Error: '+e.message); } break; }
case 'toimg': { try { let quoted = m.quoted? m.quoted : m; let media = await quoted.download(); await sock.sendMessage(m.chat, { image: media }, { quoted: m }); } catch(e){ reply('Error: '+e.message); } break; }
case 'calc': { if(!q) return reply(`Use: ${prefix}calc 2+2`); try { let res = eval(q); reply(`🧮 ${q} = ${res}`); } catch(e){ reply('Invalid'); } break; }
case 'ai': { if(!q) return reply(`Use: ${prefix}ai habari?`); reply(`🤖 You asked: "${q}"\nI'm Evolution.gntg by Philip! Full AI soon.`); break; }
}
} catch(err){ console.log('[CASE ERROR]', err); }
}; 
