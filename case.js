module.exports = async (client, m, chatUpdate, store) => {
  try {
    const from = m.chat || m.key.remoteJid;
    
    // Chukua message vizuri
    let body = '';
    if (m.mtype === 'conversation') body = m.message.conversation;
    else if (m.mtype === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
    else if (m.mtype === 'imageMessage') body = m.message.imageMessage.caption || '';
    else if (m.text) body = m.text;
    else body = '';

    if (!body) return;

    console.log(`[MESSAGE] ${from}: ${body}`);

    // Ondoa prefix / ! . # kama ipo, kama haipo tumia direct
    let command = body.trim().toLowerCase();
    command = command.replace(/^[./!#]/, '').split(/ +/).shift();

    console.log(`[COMMAND] ${command}`);

    switch(command) {
      case 'ping':
      case 'alive':
        await client.sendMessage(from, { text: 'Pong! Bot is alive ✅\nEvolution.gntg' });
        break;
      case 'menu':
        await client.sendMessage(from, { text: '*Evolution.gntg Menu*\n\n/ping - check bot\n/menu - this menu\n/alive - bot status\n\nBot by Philip Wafula 🔥' });
        break;
      default:
        // Auto reply kama si command
        if (body.toLowerCase().includes('hi') || body.toLowerCase().includes('hello')) {
          await client.sendMessage(from, { text: 'Hello! 👋 Send /menu' });
        }
        break;
    }
  } catch (err) {
    console.log('CASE ERROR:', err);
  }
}; 
