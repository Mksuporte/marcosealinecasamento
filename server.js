// Servidor apenas local, sem dependências. Inicie com: node server.js
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
http.createServer((req, res) => {
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.resolve(base, '.' + (requested === '/' ? '/index.html' : requested));
  if (!file.startsWith(base + path.sep) || !mime[path.extname(file)] || requested.split('/').some(part => part.startsWith('.'))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end('Arquivo não encontrado'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('Convite disponível em http://127.0.0.1:4173 · Ctrl+C para encerrar'));
