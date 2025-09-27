/*
  Admin gate with HTTP Basic Auth.
  - Protects admin UI by intercepting /admin and /admin.html (via vercel.json routes)
  - Credentials via env: ADMIN_USER, ADMIN_PASS (or single ADMIN_TOKEN as password)
  - On success, serves ./admin.html content with text/html
*/

const fs = require('fs');
const path = require('path');

function unauthorized(res){
  res.statusCode = 401;
  res.setHeader('WWW-Authenticate', 'Basic realm="Funweb Admin"');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Unauthorized');
}

function parseBasicAuth(header){
  if(!header || !header.startsWith('Basic ')) return null;
  try {
    const b64 = header.slice(6).trim();
    const raw = Buffer.from(b64, 'base64').toString('utf8');
    const idx = raw.indexOf(':');
    if(idx === -1) return null;
    const username = raw.slice(0, idx);
    const password = raw.slice(idx + 1);
    return { username, password };
  } catch(_){ return null; }
}

module.exports = async function handler(req, res){
  try {
    const method = (req.method || '').toUpperCase();
    if(method !== 'GET'){
      res.statusCode = 405;
      res.setHeader('Allow', 'GET');
      return res.end('Method Not Allowed');
    }

    const user = process.env.ADMIN_USER || '';
    const pass = process.env.ADMIN_PASS || '';
    const token = process.env.ADMIN_TOKEN || '';

    const creds = parseBasicAuth(req.headers['authorization']);
    if(!creds){
      return unauthorized(res);
    }

    const valid = (
      (user && pass && creds.username === user && creds.password === pass) ||
      (token && creds.password === token)
    );
    if(!valid){
      return unauthorized(res);
    }

    // Serve admin.html content
    const filePath = path.join(process.cwd(), 'admin.html');
    if(!fs.existsSync(filePath)){
      res.statusCode = 500;
      return res.end('Admin UI not found');
    }
    const html = fs.readFileSync(filePath, 'utf8');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(html);
  } catch (err){
    console.error('admin gate error', err);
    res.statusCode = 500;
    return res.end('Internal Server Error');
  }
}


