 module.exports = async (client, m, chatUpdate, store) => {
  try {
    const body = m.mtype === 'conversation' ? m.message.conversation : m.mtype === 'imageMessage' ? m.message.imageMessage.caption : m.mtype === 'videoMessage' ? m.message.videoMessage.caption : m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : m.mtype === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : m.mtype === 'messageContextInfo' ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : '';
    const budy = typeof m.text == 'string' ? m.text : '';
    const prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : '/';
    const isCmd = body.startsWith(prefix);
    const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    
    const from = m.chat;

    async function CardVisible(target) {
      const cards = [];
      for (let z = 0; z < 1; z++) {
        const header = {
          title: 'Evolution.gntg',
          videoMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/12145.mp4",
            mimetype: "video/mp4",
            fileLength: 999999,
            seconds: 999999,
            mediaKey: "fake",
            height: 999999,
            width: 999999
          }
        };
        cards.push(header);
      }
      return cards;
    }

    switch(command) {
      case 'ping':
        await client.sendMessage(from, { text: 'Pong! Bot is alive ✅\nEvolution.gntg' }, { quoted: m });
        break;
      case 'menu':
        await client.sendMessage(from, { text: '*Evolution.gntg Menu*\n\n/ping - check bot\n/menu - this menu' }, { quoted: m });
        break;
      default:
        break;
    }
  } catch (err) {
    console.log(err);
  }
};
