const fs = require('fs');
function normalizeJid(jid){ return jid; }
function ensureDir(dir){ try{ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); }catch{} }
function formatUptime(sec){ sec=Number(sec); const d=Math.floor(sec/86400); const h=Math.floor(sec%86400/3600); const m=Math.floor(sec%3600/60); const s=Math.floor(sec%60); return `${d}d ${h}h ${m}m ${s}s`; }
module.exports = { normalizeJid, ensureDir, formatUptime };
