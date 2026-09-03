const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('<h1>Morara Bot V2 Active - Private Mode 🔥</h1>'));
app.listen(PORT, () => console.log(`Web server running on ${PORT}`));
// HAPA NDIPO CODE YANGU YA V2 INAANZIA const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')

// PRIVATE MODE
const MODE = "private" // private = wewe peke yako, public = kila mtu
const OWNER_NUMBER = "254115417774"

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        auth: state,
        browser: ["Morara Bot V2", "Chrome", "1.0"]
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) {
                startBot()
            }
        } else if (connection === 'open') {
            console.log('✅ MORARA BOT V2 CONNECTED!')
            console.log('✅ PRIVATE MODE ACTIVE')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message) return
        if (m.key.remoteJid === 'status@broadcast') return

        const isOwner = m.key.fromMe || m.key.remoteJid.includes(OWNER_NUMBER) || m.key.participant?.includes(OWNER_NUMBER)
        if (MODE === "private" &&!isOwner) return // PRIVATE MODE CHECK

        const msgType = Object.keys(m.message)[0]
        const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
        if (!body.startsWith('.')) return

        const args = body.slice(1).trim().split(/ +/)
        const command = args.shift().toLowerCase()
        const reply = (text) => sock.sendMessage(m.key.remoteJid, { text })

        // COMMANDS
        if (command === 'ping') return reply(`*Pong!*\nSpeed: ${Date.now() - m.messageTimestamp * 1000}ms\n*Morara Bot V2 - Private*`)
        if (command === 'alive') return reply(`*MORARA BOT V2 IS ALIVE!* 🔥\n\nOwner: Philip Wafula\nMode: Private\nVersion: V2\n\nType.menu`)
        if (command === 'menu') return reply(`*MORARA BOT V2 MENU* 🔥

*GROUP:*
.tagall,.hidetag,.kick,.add,.promote,.demote,.antilink,.group open/close

*DOWNLOAD:*
.play,.song,.video,.tiktok,.fb,.ig,.ytmp3,.ytmp4

*STICKER:*
.sticker,.s,.take,.toimg

*OWNER:*
.alive,.ping,.restart,.mode public/private,.block,.unblock

*FUN:*
.joke,.quote,.fact,.truth,.dare

Bot by Philip Wafula - Private Mode`)
        if (command === 'owner') return reply(`Owner: wa.me/254115417774`)
        if (command === 'tagall') {
            const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
            let txt = `*TAG ALL BY MORARA BOT*\n\n`
            groupMetadata.participants.forEach(p => txt += `@${p.id.split('@')[0]} `)
            return sock.sendMessage(m.key.remoteJid, { text: txt, mentions: groupMetadata.participants.map(p => p.id) })
        }
        if (command === 'sticker' || command === 's') {
            // sticker logic here
            return reply('Tuma picha na caption.sticker')
        }
        if (command === 'mode') {
            if (!isOwner) return
            if (args[0] === 'public') return reply('Bot is now PUBLIC')
            if (args[0] === 'private') return reply('Bot is now PRIVATE - only you!')
        }
    })
}
startBot()
