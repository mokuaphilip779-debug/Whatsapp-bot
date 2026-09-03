 module.exports = async (client, m, chatUpdate, store) => {
 try {
   const from = m.key.remoteJid;
   
   // Chukua body vizuri - inafanya kazi na Baileys zote
   let body = '';
   if (m.message) {
     if (m.message.conversation) body = m.message.conversation;
     else if (m.message.extendedTextMessage?.text) body = m.message.extendedTextMessage.text;
     else if (m.message.imageMessage?.caption) body = m.message.imageMessage.caption;
     else if (m.message.videoMessage?.caption) body = m.message.videoMessage.caption;
   }
   if (!body && m.text) body = m.text;
   
   if (!body) return;

   console.log(`[MESSAGE] ${from}: ${body}`);

   let command = body.trim().toLowerCase();
   command = command.replace(/^[./!#]/, '').split(/ +/).shift();

   console.log(`[COMMAND] ${command}`);

   switch(command) {
     case 'ping':
     case 'alive':
       await client.sendMessage(from, { text: 'Pong! ✅ Bot is alive! Evolution.gntg is running!' });
       break;
     case 'menu':
       await client.sendMessage(from, { text: '*Evolution.gntg Menu*\n\n• ping - check bot\n• menu - this menu\n• hi - hello' });
       break;
     default:
       if (body.toLowerCase().includes('hi')) {
         await client.sendMessage(from, { text: 'Hello! 👋 Niko hapa! Tuma ping au menu' });
       }
       break;
   }
 } catch (err) {
   console.log('CASE ERROR:', err);
 }
};
