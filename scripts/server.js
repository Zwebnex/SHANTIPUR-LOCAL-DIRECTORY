// server.js - Shantipur Local Directory HTTP & Security Gateway Server
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 5173;
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// 1. Safe Environment Loader (.env.local)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.substring(0, eq).trim();
          let val = trimmed.substring(eq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bnlhqkcyqymsvtqblwkv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// 2. Strict In-Memory Rolling Rate Limiter Store
// Requirement: Maximum 5 failed attempts in 50 seconds
const RATE_LIMIT_WINDOW_MS = 50 * 1000; // 50 seconds
const MAX_FAILED_ATTEMPTS = 5;

// Map: key -> Array of timestamps [t1, t2, ...]
const failedAttemptsMap = new Map();

function hashEmail(email) {
  return crypto.createHash('sha256').update((email || '').trim().toLowerCase()).digest('hex');
}

function getRateLimitState(ip, emailHash) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Gather attempts for this IP and email hash
  const ipAttempts = (failedAttemptsMap.get(`ip:${ip}`) || []).filter(t => t > windowStart);
  const emailAttempts = (failedAttemptsMap.get(`email:${emailHash}`) || []).filter(t => t > windowStart);

  failedAttemptsMap.set(`ip:${ip}`, ipAttempts);
  failedAttemptsMap.set(`email:${emailHash}`, emailAttempts);

  // Total count is max of ip or email attempts
  const count = Math.max(ipAttempts.length, emailAttempts.length);
  const oldestInWindow = Math.min(...ipAttempts, ...emailAttempts);

  if (count >= MAX_FAILED_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return { isAllowed: false, count, retryAfterSeconds };
  }

  return { isAllowed: true, count, retryAfterSeconds: 0 };
}

function recordFailedAttempt(ip, emailHash) {
  const now = Date.now();
  const ipKey = `ip:${ip}`;
  const emailKey = `email:${emailHash}`;

  const ipList = (failedAttemptsMap.get(ipKey) || []).filter(t => t > (now - RATE_LIMIT_WINDOW_MS));
  ipList.push(now);
  failedAttemptsMap.set(ipKey, ipList);

  if (emailHash) {
    const emailList = (failedAttemptsMap.get(emailKey) || []).filter(t => t > (now - RATE_LIMIT_WINDOW_MS));
    emailList.push(now);
    failedAttemptsMap.set(emailKey, emailList);
  }
}

function clearAttempts(ip, emailHash) {
  failedAttemptsMap.delete(`ip:${ip}`);
  if (emailHash) failedAttemptsMap.delete(`email:${emailHash}`);
}

// 3. MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqPath = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API Route: Public Configuration
  if (req.method === 'GET' && reqPath === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_KEY,
      rateLimitWindowSeconds: 50,
      maxAllowedFailedAttempts: 5
    }));
  }

  // API Route: Secure Login Gateway (5-in-50s Rate Limiter)
  if (req.method === 'POST' && reqPath === '/api/auth/login-gateway') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
        const emailHash = hashEmail(email);

        // Check Rate Limit (5 failed attempts within rolling 50s)
        const rateCheck = getRateLimitState(clientIp, emailHash);
        if (!rateCheck.isAllowed) {
          res.writeHead(429, {
            'Content-Type': 'application/json; charset=utf-8',
            'Retry-After': String(rateCheck.retryAfterSeconds)
          });
          return res.end(JSON.stringify({
            error: 'Too many unsuccessful login attempts. Please try again after the cooldown.',
            retryAfterSeconds: rateCheck.retryAfterSeconds
          }));
        }

        // Validate basic parameters
        if (!email || !password || typeof password !== 'string' || password.length < 1) {
          recordFailedAttempt(clientIp, emailHash);
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Email or password is incorrect.' }));
        }

        // If configured with authentic Supabase credentials, verify against Supabase Auth
        if (SUPABASE_KEY && SUPABASE_KEY !== 'YOUR_SUPABASE_PUBLISHABLE_KEY' && !SUPABASE_KEY.startsWith('YOUR_')) {
          try {
            const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: email.trim().toLowerCase(), password })
            });

            const authData = await authRes.json();
            if (!authRes.ok || !authData.access_token) {
              recordFailedAttempt(clientIp, emailHash);
              res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
              return res.end(JSON.stringify({ error: 'Email or password is incorrect.' }));
            }

            // Authentic Success -> Atomically clear failed attempt strikes
            clearAttempts(clientIp, emailHash);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ session: authData, user: authData.user }));
          } catch (fetchErr) {
            recordFailedAttempt(clientIp, emailHash);
            res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ error: 'Unable to reach Supabase authentication server.' }));
          }
        } else {
          // Zero mock success: Record attempt and reject with standard 401 error
          recordFailedAttempt(clientIp, emailHash);
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Email or password is incorrect.' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Invalid request format.' }));
      }
    });
    return;
  }

  // 4. Static File Serving
  let cleanPath = reqPath;
  if (cleanPath === '/' || cleanPath === '') cleanPath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, cleanPath);

  // Security check: Path traversal prevention
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  // Check if directory with index.html, or if file exists directly, or with .html extension
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const idxPath = path.join(filePath, 'index.html');
    if (fs.existsSync(idxPath)) filePath = idxPath;
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Single Page Application fallback for routes (/routes, /routes/:slug, /login, /signup, etc.)
      const spaRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/routes'];
      if (cleanPath.startsWith('/routes') || spaRoutes.includes(cleanPath)) {
        filePath = path.join(PUBLIC_DIR, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found: ' + reqPath);
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Shantipur Security Engine running at http://127.0.0.1:${PORT}`);
});
