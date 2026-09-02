 const fs = require('fs');
const path = require('path');
const settings = require('../settings');
function sessionDir(id){ return path.join(settings.SESSION_DIR || './sessions', id || ''); }
function sessionExists(id){ try{ return fs.existsSync(sessionDir(id)); }catch{ return false; } }
function listSessions(){ try{ const dir=settings.SESSION_DIR || './sessions'; if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir); }catch{ return []; } }
function deleteSession(id){ try{ fs.rmSync(sessionDir(id),{recursive:true,force:true}); return true; }catch{ return false; } }
function getWaSettings(){ return {}; }
function setWaSetting(){ return true; }
function getAllPairs(){ return []; }
function getUserPairs(){ return []; }
function addPair(){ return true; }
function removePair(){ return true; }
function getAllPairedSessions(){ return []; }
function registerUser(){ return true; }
function getAllUsers(){ return []; }
function numOf(){ return 0; }
module.exports = { sessionExists, listSessions, deleteSession, sessionDir, getWaSettings, setWaSetting, getAllPairs, getUserPairs, addPair, removePair, getAllPairedSessions, registerUser, getAllUsers, numOf };
