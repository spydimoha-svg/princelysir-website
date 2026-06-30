// serve.mjs — zero-dependency static file server for local preview.
// Serves the project root at http://127.0.0.1:3000 (loopback only by default).
// Start it in the background before screenshots. Never screenshot a file:/// URL.
//
//   node serve.mjs                 # serves ./ at http://127.0.0.1:3000
//   PORT=4000 node serve.mjs       # custom port
//   HOST=0.0.0.0 node serve.mjs    # expose on all interfaces (NOT recommended)
//
// Hardening (do not weaken without reason):
//   - binds loopback only, so a local preview is never reachable from the LAN
//   - GET/HEAD only
//   - refuses dotfiles (.env, .git, …), source (.mjs), manifests, and anything
//     outside a static-asset extension allowlist — so secrets/source never leak
//   - sends security headers (CSP, nosniff, frame-deny, referrer, permissions)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // loopback only unless overridden

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

// Only the asset types a static site needs are served. This refuses .mjs (server
// source), .json/.pdf, and extensionless files (e.g. .env, .git/HEAD) by default.
const ALLOWED_EXT = new Set([
  '.html', '.css', '.js', '.svg',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico',
  '.woff', '.woff2', '.ttf', '.txt',
]);

// Never serve these names, even if their extension were allowed.
const BLOCKED = new Set([
  'node_modules', 'package.json', 'package-lock.json', 'serve.mjs', 'screenshot.mjs',
]);

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': CSP,
});

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...securityHeaders(),
    ...headers,
  });
  res.end(body);
};

const server = createServer(async (req, res) => {
  try {
    // 1) Methods: GET/HEAD only.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
      return;
    }

    const urlPath = decodeURIComponent(
      new URL(req.url, `http://${HOST}:${PORT}`).pathname,
    );
    let filePath = normalize(join(ROOT, urlPath));

    // 2) Path traversal: the resolved path must stay within ROOT.
    let rel = relative(ROOT, filePath);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      send(res, 403, 'Forbidden');
      return;
    }

    // Directory → its index.html (stays within ROOT).
    let info = null;
    try {
      info = await stat(filePath);
    } catch {}
    if (info && info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      rel = relative(ROOT, filePath);
    }

    // 3) Refuse dotfiles and known-sensitive names anywhere in the path.
    const segments = rel.split(/[\\/]/).filter(Boolean);
    if (segments.some((s) => s.startsWith('.') || BLOCKED.has(s))) {
      send(res, 404, '404 Not Found');
      return;
    }

    // 4) Extension allowlist — only static-site assets.
    const ext = extname(filePath).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      send(res, 404, '404 Not Found');
      return;
    }

    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ...securityHeaders(),
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    send(res, 404, '404 Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`→ http://${HOST}:${PORT}`);
});
