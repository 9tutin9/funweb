/*
  Profile status API (Vercel serverless)
  - GET  /api/profile-status      → { status: 'online' | 'away' | 'offline', updatedAt }
  - POST /api/profile-status      → { ok: true }  (requires Authorization: Bearer <ADMIN_TOKEN>)

  Persistence strategy (in order):
  1) GitHub Gist (env: GITHUB_TOKEN with gist scope, GIST_ID)
  2) Local file during dev: ./.data/profile-status.json
  3) In-memory fallback (not persistent across cold starts)
*/

const fs = require('fs');
const path = require('path');

const VALID_STATUSES = new Set(['online', 'away', 'offline']);
const DEFAULT_STATUS = { status: 'online', updatedAt: new Date().toISOString() };

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GIST_ID = process.env.GIST_ID || '';

let inMemory = { ...DEFAULT_STATUS };

async function readFromGist(){
  if(!GITHUB_TOKEN || !GIST_ID) return null;
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
  });
  if(!res.ok) return null;
  const data = await res.json();
  const fileKey = Object.keys(data.files || {}).find(k => k.endsWith('profile-status.json')) || 'profile-status.json';
  const file = data.files && data.files[fileKey];
  if(!file || !file.content) return null;
  try {
    const parsed = JSON.parse(file.content);
    if(parsed && VALID_STATUSES.has(parsed.status)) return parsed;
    return null;
  } catch(_){
    return null;
  }
}

async function writeToGist(payload){
  if(!GITHUB_TOKEN || !GIST_ID) return false;
  const body = {
    files: {
      'profile-status.json': { content: JSON.stringify(payload, null, 2) }
    }
  };
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return res.ok;
}

function dataFilePath(){
  return path.join(process.cwd(), '.data', 'profile-status.json');
}

function readFromFile(){
  try {
    const p = dataFilePath();
    if(!fs.existsSync(p)) return null;
    const content = fs.readFileSync(p, 'utf8');
    const json = JSON.parse(content);
    if(json && VALID_STATUSES.has(json.status)) return json;
    return null;
  } catch(_){ return null; }
}

function writeToFile(payload){
  try {
    const dir = path.join(process.cwd(), '.data');
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataFilePath(), JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch(_){ return false; }
}

function parseBasic(header){
  if(!header || !header.startsWith('Basic ')) return null;
  try{
    const raw = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const i = raw.indexOf(':');
    if(i === -1) return null;
    return { user: raw.slice(0,i), pass: raw.slice(i+1) };
  }catch(_){ return null; }
}

async function getCurrentStatus(){
  // Try Gist
  const g = await readFromGist();
  if(g) return g;
  // Try file (dev)
  const f = readFromFile();
  if(f) return f;
  // Fallback in-memory
  return inMemory;
}

async function setCurrentStatus(next){
  // Try Gist
  if(await writeToGist(next)) return true;
  // Try file (dev)
  if(writeToFile(next)) return true;
  // Fallback in-memory
  inMemory = next;
  return true;
}

module.exports = async function handler(req, res){
  try {
    const method = (req.method || '').toUpperCase();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Robots-Tag', 'noindex');

    if(method === 'OPTIONS'){
      res.statusCode = 204; return res.end();
    }

    if(method === 'GET'){
      const current = await getCurrentStatus();
      res.statusCode = 200; return res.end(JSON.stringify(current));
    }

    if(method === 'POST'){
      const auth = req.headers['authorization'] || '';
      let isAuthorized = false;
      if(ADMIN_TOKEN && auth.startsWith('Bearer ')){
        const token = auth.slice(7);
        isAuthorized = token === ADMIN_TOKEN;
      }
      if(!isAuthorized && auth.startsWith('Basic ')){
        const creds = parseBasic(auth);
        const u = process.env.ADMIN_USER || '';
        const p = process.env.ADMIN_PASS || '';
        if(creds && u && p && creds.user === u && creds.pass === p){
          isAuthorized = true;
        }
      }
      if(!isAuthorized){
        res.statusCode = 401; return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }
      let body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if(!body){
        const raw = await new Promise((resolve, reject)=>{
          let d=''; req.on('data',c=>d+=c); req.on('end',()=>resolve(d)); req.on('error',reject);
        });
        body = raw ? JSON.parse(raw) : {};
      }
      const next = String(body.status || '').toLowerCase();
      if(!VALID_STATUSES.has(next)){
        res.statusCode = 400; return res.end(JSON.stringify({ error: 'Invalid status' }));
      }
      const payload = { status: next, updatedAt: new Date().toISOString() };
      await setCurrentStatus(payload);
      res.statusCode = 200; return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch(err){
    console.error('profile-status error', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Server error' }));
  }
}


