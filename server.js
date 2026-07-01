require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');

const PORT = process.env.PORT || 3000;

// ── Environment-based config ──────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'asangabandara8@gmail.com';
const ADMIN_CFG_FILE = path.join(__dirname, 'data', 'admin.json');
const TEACHERS_FILE  = path.join(__dirname, 'data', 'teachers.json');
const AUDIT_LOG_FILE = path.join(__dirname, 'data', 'audit.log');
const LOCKOUT_FILE   = path.join(__dirname, 'data', 'lockouts.json');

// ── CSRF token store ──────────────────────────────────────────────────────────
const csrfTokens = new Map(); // token -> { createdAt, expiresAt }
const CSRF_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

function generateCsrfToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  csrfTokens.set(token, { createdAt: now, expiresAt: now + CSRF_EXPIRY_MS });
  return token;
}

function validateCsrfToken(token) {
  const record = csrfTokens.get(token);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    csrfTokens.delete(token);
    return false;
  }
  csrfTokens.delete(token); // one-time use
  return true;
}

// Cleanup expired CSRF tokens every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [token, record] of csrfTokens) {
    if (now > record.expiresAt) csrfTokens.delete(token);
  }
}, 5 * 60 * 1000);

// ── Audit logging ─────────────────────────────────────────────────────────────
function auditLog(action, userId, role, status, details = '') {
  const log = JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    userId,
    role,
    status,
    details
  });
  fs.appendFileSync(AUDIT_LOG_FILE, log + '\n', 'utf8');
}

// ── Account lockout tracking ──────────────────────────────────────────────────
function readLockouts() {
  try { return JSON.parse(fs.readFileSync(LOCKOUT_FILE, 'utf8')); }
  catch(e) { return {}; }
}
function writeLockouts(lockouts) {
  const dir = path.dirname(LOCKOUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCKOUT_FILE, JSON.stringify(lockouts, null, 2));
}
function isAccountLocked(email) {
  const lockouts = readLockouts();
  const record = lockouts[email];
  if (!record) return false;
  const now = Date.now();
  if (now < record.expiresAt) return true;
  delete lockouts[email];
  writeLockouts(lockouts);
  return false;
}
function lockAccount(email, durationMs = 30 * 60 * 1000) {
  const lockouts = readLockouts();
  lockouts[email] = { lockedAt: new Date().toISOString(), expiresAt: Date.now() + durationMs };
  writeLockouts(lockouts);
  auditLog('ACCOUNT_LOCKED', email, 'unknown', 'locked', `Locked for ${durationMs / 1000}s after failed attempts`);
}
function clearAccountLock(email) {
  const lockouts = readLockouts();
  delete lockouts[email];
  writeLockouts(lockouts);
}

function readAdminCfg() {
  try { return JSON.parse(fs.readFileSync(ADMIN_CFG_FILE, 'utf8')); }
  catch(e) { return { pinHash: hashPin('sjc2024') }; }
}
function writeAdminCfg(cfg) {
  const dir = path.dirname(ADMIN_CFG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ADMIN_CFG_FILE, JSON.stringify(cfg, null, 2));
}

// ── Simple PIN hashing (not production bcrypt, but better than plaintext) ──────
function hashPin(pin) {
  return crypto.createHash('sha256').update(pin + 'sjc-salt-2024').digest('hex');
}
function verifyPin(pin, hash) {
  return hashPin(pin) === hash;
}
function readTeachers() {
  try { return JSON.parse(fs.readFileSync(TEACHERS_FILE, 'utf8')); } catch(e) { return []; }
}
function writeTeachers(t) {
  const dir = path.dirname(TEACHERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TEACHERS_FILE, JSON.stringify(t, null, 2));
}

// ── Session store ──────────────────────────────────────────────────────────────
const sessions = new Map(); // token -> { role, email, teacherId?, expiresAt, createdAt, lastActivity }
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validateAdmin(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  const now = Date.now();
  // Check expiration
  if (now > session.expiresAt) { sessions.delete(token); return null; }
  // Check inactivity
  if (now - session.lastActivity > INACTIVITY_TIMEOUT_MS) { sessions.delete(token); return null; }

  // Update activity timestamp and sliding window
  session.lastActivity = now;
  session.expiresAt = now + SESSION_DURATION_MS;
  return session;
}
// Sweep expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [tok, s] of sessions) { if (now > s.expiresAt) sessions.delete(tok); }
}, 60 * 60 * 1000);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.json': 'application/json'
};

// ── Email credentials from environment ────────────────────────────────────────
const GMAIL_USER = process.env.GMAIL_USER || 'sjc.counselling.anuradhpura@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || '';

// ── Security headers ──────────────────────────────────────────────────────────
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'"
};

const APT_FILE = path.join(__dirname, 'data', 'appointments.json');
function readApts() {
  try { return JSON.parse(fs.readFileSync(APT_FILE, 'utf8')); } catch(e) { return []; }
}
function writeApts(apts) {
  const dir = path.dirname(APT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(APT_FILE, JSON.stringify(apts, null, 2));
}

// ── Device / IP tracking for appointment limits ──────────────────────────────
const DEVICES_FILE = path.join(__dirname, 'data', 'used_devices.json');
function readDevices() {
  try { return JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8')); } catch(e) { return []; }
}
function writeDevices(d) {
  const dir = path.dirname(DEVICES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEVICES_FILE, JSON.stringify(d, null, 2));
}
// Real client IP. The site sits behind Cloudflare → nginx → node, so the socket
// IP is always 127.0.0.1. Cloudflare's CF-Connecting-IP is the most trustworthy
// real-visitor IP (set by Cloudflare, forwarded by nginx); fall back to XFF/socket.
function getClientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return cf.trim();
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || '';
}

// ── In-memory rate limiter (per-IP sliding window) ───────────────────────────
// Backstop against floods, PIN brute-force and OTP/email bombing that pass
// straight through Cloudflare. For true volumetric DDoS, Cloudflare is the shield.
const rateBuckets = new Map(); // key -> [timestamps]
function rateAllow(key, max, windowMs) {
  const now = Date.now();
  let arr = rateBuckets.get(key);
  if (!arr) { arr = []; rateBuckets.set(key, arr); }
  while (arr.length && arr[0] <= now - windowMs) arr.shift();
  if (arr.length >= max) return false;
  arr.push(now);
  return true;
}
function sendTooMany(res, retryAfterSec) {
  res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSec || 60) });
  res.end(JSON.stringify({ success: false, error: 'Too many requests — please slow down and try again in a moment.' }));
}
// Sweep idle buckets every 10 min so the map can't grow unbounded
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [k, arr] of rateBuckets) {
    while (arr.length && arr[0] <= cutoff) arr.shift();
    if (arr.length === 0) rateBuckets.delete(k);
  }
}, 10 * 60 * 1000);
// Booking-limit config lives inside admin.json. Default: 1 per device, forever.
function readBookingLimit() {
  const cfg = readAdminCfg();
  const bl = cfg.bookingLimit || {};
  const validPeriods = ['lifetime', 'day', 'week', 'month', 'year'];
  return {
    max: Number(bl.max) > 0 ? Math.floor(Number(bl.max)) : 1,
    period: validPeriods.includes(bl.period) ? bl.period : 'lifetime',
    enabled: bl.enabled !== false
  };
}
const PERIOD_MS = { day: 864e5, week: 7 * 864e5, month: 30 * 864e5, year: 365 * 864e5 };
// Returns the earliest timestamp that still counts toward the limit (0 = all time).
function bookingWindowStart(period) {
  if (period === 'lifetime') return 0;
  const ms = PERIOD_MS[period];
  return ms ? Date.now() - ms : null;
}
function limitMessage(limit) {
  const n = limit.max;
  const plural = n > 1 ? 's' : '';
  if (limit.period === 'lifetime') {
    return `This device has already submitted ${n} appointment request${plural}. Only ${n} request${plural} per person is allowed. If you believe this is a mistake, please contact the counselling unit directly.`;
  }
  const periodText = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[limit.period] || 'recently';
  return `This device has reached the limit of ${n} appointment request${plural} ${periodText}. Please try again later or contact the counselling unit directly.`;
}

// In-memory OTP store
const otps = new Map();

// ── Branded email builder ──────────────────────────────────────────────────
function buildEmail({ title, preheader = '', body, footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light only"/>
<meta name="supported-color-schemes" content="light only"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;mso-hide:all;">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;box-shadow:0 8px 30px rgba(42,8,8,0.10);border-radius:16px;">

      <!-- SLIM HEADER BAR -->
      <tr><td style="background:linear-gradient(135deg,#2a0808 0%,#4a1010 100%);border-radius:16px 16px 0 0;height:14px;line-height:14px;font-size:0;">&nbsp;</td></tr>

      <!-- GOLD BAR -->
      <tr><td style="height:4px;background:linear-gradient(90deg,#a07830,#e8c96a,#a07830);"></td></tr>

      <!-- BODY -->
      <tr><td style="background:#ffffff;padding:40px 40px 32px;">
        ${body}
      </td></tr>

      <!-- FOOTER TEXT -->
      <tr><td style="background:#faf6ee;padding:24px 40px 26px;text-align:center;border-top:1px solid #ede5d8;border-radius:0 0 16px 16px;">
        <p style="font-size:13px;font-weight:700;color:#5c0a0a;margin:0 0 6px;letter-spacing:0.02em;">
          SJC Counselling &amp; Career Guidance Unit
        </p>
        <p style="font-size:12px;color:#7a6868;line-height:1.7;margin:0 0 10px;">
          ${footerNote || "St. Joseph's College, Anuradhapura, Sri Lanka"}
        </p>
        <p style="font-size:12px;color:#8a7878;line-height:1.8;margin:0 0 4px;">
          <a href="tel:+94252225678" style="color:#a07830;text-decoration:none;">+94 25 222 5678</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:info@sjc.lk" style="color:#a07830;text-decoration:none;">info@sjc.lk</a>
        </p>
        <p style="font-size:11px;color:#a89898;margin:0;">
          <a href="https://cgu.jakenetwork.xyz" style="color:#a07830;text-decoration:none;">cgu.jakenetwork.xyz</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS }
});

async function getImapClient() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    logger: false
  });
  await client.connect();
  return client;
}

async function fetchMailbox(mailbox, limit = 50) {
  const client = await getImapClient();
  const msgs = [];
  try {
    await client.mailboxOpen(mailbox);
    const status = await client.status(mailbox, { messages: true });
    const total = status.messages || 0;
    if (total === 0) return msgs;
    const from = Math.max(1, total - limit + 1);
    for await (const msg of client.fetch(`${from}:${total}`, {
      envelope: true,
      bodyStructure: true,
      bodyParts: ['text']
    })) {
      const env = msg.envelope;
      let body = '';
      try {
        const raw = msg.bodyParts && msg.bodyParts.get('text');
        if (raw) body = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
      } catch(e) {}
      msgs.push({
        uid: msg.uid,
        subject: env.subject || '(no subject)',
        from: env.from && env.from[0] ? `${env.from[0].name || ''} <${env.from[0].address}>`.trim() : '',
        to: env.to && env.to[0] ? env.to[0].address : '',
        date: env.date ? env.date.toISOString() : new Date().toISOString(),
        snippet: body.replace(/\r?\n/g, ' ').slice(0, 160),
        body: body.slice(0, 8000)
      });
    }
    msgs.reverse();
  } finally {
    await client.logout();
  }
  return msgs;
}

async function fetchSingleEmail(mailbox, uid) {
  const client = await getImapClient();
  let result = null;
  try {
    await client.mailboxOpen(mailbox);
    for await (const msg of client.fetch(String(uid), {
      envelope: true,
      bodyParts: ['text', 'html']
    }, { uid: true })) {
      const env = msg.envelope;
      let body = '';
      try {
        const htmlPart = msg.bodyParts && msg.bodyParts.get('html');
        const textPart = msg.bodyParts && msg.bodyParts.get('text');
        if (htmlPart) body = Buffer.isBuffer(htmlPart) ? htmlPart.toString('utf8') : String(htmlPart);
        else if (textPart) body = Buffer.isBuffer(textPart) ? textPart.toString('utf8') : String(textPart);
      } catch(e) {}
      result = {
        uid: msg.uid,
        subject: env.subject || '(no subject)',
        from: env.from && env.from[0] ? `${env.from[0].name || ''} <${env.from[0].address}>`.trim() : '',
        to: env.to ? env.to.map(t => t.address).join(', ') : '',
        date: env.date ? env.date.toISOString() : new Date().toISOString(),
        body,
        isHtml: !!(msg.bodyParts && msg.bodyParts.get('html'))
      };
    }
  } finally {
    await client.logout();
  }
  return result;
}

const handleApiRequest = (req, res, urlPath) => {
  // Handle GET requests for email endpoints
  if (req.method === 'GET' && urlPath.startsWith('/api/admin/emails')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const folder = urlPath.includes('/sent') ? '[Gmail]/Sent Mail'
      : urlPath.includes('/drafts') ? '[Gmail]/Drafts'
      : 'INBOX';

    const uidMatch = urlPath.match(/\/message\/(\d+)/);
    if (uidMatch) {
      const uid = parseInt(uidMatch[1]);
      const box = urlPath.includes('/sent') ? '[Gmail]/Sent Mail' : 'INBOX';
      fetchSingleEmail(box, uid).then(msg => {
        if (!msg) { res.writeHead(404); return res.end(JSON.stringify({ error: 'Not found' })); }
        res.writeHead(200);
        res.end(JSON.stringify(msg));
      }).catch(e => {
        console.error('[IMAP]', e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      });
      return;
    }

    const limit = urlPath.includes('/sent') ? 30 : 50;
    fetchMailbox(folder, limit).then(msgs => {
      res.writeHead(200);
      res.end(JSON.stringify(msgs));
    }).catch(e => {
      console.error('[IMAP]', e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    });
    return;
  }

  // General API flood guard (per IP) — generous so it won't catch real users,
  // but cuts off scripted request storms hitting any /api/ endpoint.
  const reqIp = getClientIp(req);
  if (req.method !== 'OPTIONS' && !rateAllow('api:' + reqIp, 120, 10000)) {
    res.setHeader('Content-Type', 'application/json');
    return sendTooMany(res, 10);
  }

  let body = '';
  let aborted = false;
  req.on('data', chunk => {
    if (aborted) return;
    body += chunk.toString();
    // Cap request body at 100KB — block memory-exhaustion via huge payloads
    if (body.length > 100 * 1024) {
      aborted = true;
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Request too large' }));
      req.destroy();
    }
  });
  req.on('end', async () => {
    if (aborted) return;
    try {
      const data = JSON.parse(body || '{}');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      // ── Admin login (public — no token needed) ────────────────────────────
      if (urlPath === '/api/admin/login') {
        const { email, pin } = data;

        // Validate input
        if (!email || !pin) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Email and PIN required' }));
        }

        const safeEmail = String(email).toLowerCase().trim();

        // Check account lockout
        if (isAccountLocked(safeEmail)) {
          res.writeHead(423); // 423 Locked
          return res.end(JSON.stringify({ success: false, error: 'Account is temporarily locked due to too many failed attempts. Please try again in 30 minutes.' }));
        }

        // Rate limit by IP (separate from account lockout)
        if (!rateAllow('login:' + reqIp, 12, 5 * 60 * 1000)) {
          res.writeHead(429, { 'Retry-After': '300' });
          return res.end(JSON.stringify({ success: false, error: 'Too many login attempts from your IP. Please wait 5 minutes.' }));
        }

        const cfg = readAdminCfg();
        let loginSuccess = false;

        // Superadmin check
        if (safeEmail === ADMIN_EMAIL.toLowerCase() && verifyPin(pin, cfg.pinHash)) {
          loginSuccess = true;
        } else {
          // Teacher check
          const teachers = readTeachers();
          const teacher = teachers.find(t => t.email.toLowerCase() === safeEmail && verifyPin(pin, t.pinHash || t.pin));
          if (teacher) {
            if (!loginSuccess) {
              loginSuccess = true;
              const token = generateToken();
              const now = Date.now();
              sessions.set(token, {
                role: 'teacher',
                email: safeEmail,
                teacherId: teacher.id,
                expiresAt: now + SESSION_DURATION_MS,
                createdAt: now,
                lastActivity: now
              });
              clearAccountLock(safeEmail);
              auditLog('LOGIN_SUCCESS', safeEmail, 'teacher', 'success');
              res.writeHead(200);
              return res.end(JSON.stringify({ success: true, token, role: 'teacher', teacher: { id: teacher.id, name: teacher.name } }));
            }
          }
        }

        if (loginSuccess && safeEmail === ADMIN_EMAIL.toLowerCase()) {
          rateBuckets.delete('login:' + reqIp);
          clearAccountLock(safeEmail);
          const token = generateToken();
          const now = Date.now();
          sessions.set(token, {
            role: 'superadmin',
            email: safeEmail,
            expiresAt: now + SESSION_DURATION_MS,
            createdAt: now,
            lastActivity: now
          });
          auditLog('LOGIN_SUCCESS', safeEmail, 'superadmin', 'success');
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, token, role: 'superadmin' }));
        }

        // Failed login
        auditLog('LOGIN_FAILED', safeEmail, 'unknown', 'failure', `Invalid credentials from IP ${reqIp}`);

        // After 5 failed attempts, lock the account
        const loginAttempts = rateBuckets.get('login:' + reqIp) || [];
        if (loginAttempts.length >= 5) {
          lockAccount(safeEmail, 30 * 60 * 1000); // 30 minute lockout
        }

        // Constant-time response to prevent timing attacks
        res.writeHead(401);
        return res.end(JSON.stringify({ success: false, error: 'Invalid email or PIN' }));
      }

      if (urlPath === '/api/admin/logout') {
        const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
        const session = sessions.get(auth);
        if (session) {
          auditLog('LOGOUT', session.email, session.role, 'success');
          sessions.delete(auth);
        }
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true }));
      }

      // ── CSRF token generation (for all protected forms) ───────────────────
      if (urlPath === '/api/csrf-token' && req.method === 'GET') {
        const token = generateCsrfToken();
        res.writeHead(200);
        return res.end(JSON.stringify({ csrfToken: token }));
      }

      // ── All other /api/admin/* routes require a valid session ─────────────
      if (urlPath.startsWith('/api/admin/')) {
        const session = validateAdmin(req);
        if (!session) {
          res.writeHead(401);
          return res.end(JSON.stringify({ success: false, error: 'Unauthorized — please log in again' }));
        }

        if (urlPath === '/api/admin/update-pin') {
          if (session.role !== 'superadmin') { res.writeHead(403); return res.end(JSON.stringify({ error: 'Forbidden' })); }
          const { newPin, currentPin, csrfToken } = data;

          // CSRF validation
          if (!csrfToken || !validateCsrfToken(csrfToken)) {
            res.writeHead(403);
            return res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
          }

          // Input validation
          if (!newPin || newPin.length < 4) { res.writeHead(400); return res.end(JSON.stringify({ error: 'PIN must be at least 4 characters' })); }
          if (newPin === currentPin) { res.writeHead(400); return res.end(JSON.stringify({ error: 'New PIN must be different from current PIN' })); }

          // Rate limit PIN changes
          if (!rateAllow('pin-change:' + session.email, 3, 24 * 60 * 60 * 1000)) {
            res.writeHead(429);
            return res.end(JSON.stringify({ error: 'Too many PIN changes. Limit: 3 per day.' }));
          }

          const cfg = readAdminCfg();
          // Verify current PIN before allowing change
          if (!verifyPin(currentPin, cfg.pinHash)) {
            auditLog('PIN_CHANGE_FAILED', session.email, session.role, 'failure', 'Incorrect current PIN');
            res.writeHead(401);
            return res.end(JSON.stringify({ error: 'Current PIN is incorrect' }));
          }

          writeAdminCfg({ ...cfg, pinHash: hashPin(newPin) });
          auditLog('PIN_CHANGED', session.email, session.role, 'success');
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true }));
        }

        // ── Appointment booking-limit settings ────────────────────────────────
        if (urlPath === '/api/admin/booking-limit') {
          if (req.method === 'GET') {
            res.writeHead(200);
            return res.end(JSON.stringify({ ...readBookingLimit(), usedCount: readDevices().length }));
          }
          if (req.method === 'POST') {
            if (session.role !== 'superadmin') { res.writeHead(403); return res.end(JSON.stringify({ error: 'Forbidden' })); }
            const { max, period, enabled, csrfToken } = data;

            // CSRF validation
            if (!csrfToken || !validateCsrfToken(csrfToken)) {
              res.writeHead(403);
              return res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
            }

            // Input validation
            const validPeriods = ['lifetime', 'day', 'week', 'month', 'year'];
            const maxNum = Number(max);
            if (isNaN(maxNum) || maxNum < 1 || maxNum > 100) {
              res.writeHead(400);
              return res.end(JSON.stringify({ error: 'Max must be between 1 and 100' }));
            }

            const cfg = readAdminCfg();
            cfg.bookingLimit = {
              max: Math.floor(maxNum),
              period: validPeriods.includes(period) ? period : 'lifetime',
              enabled: enabled !== false
            };
            writeAdminCfg(cfg);
            auditLog('BOOKING_LIMIT_UPDATED', session.email, session.role, 'success', `Set to ${cfg.bookingLimit.max} per ${cfg.bookingLimit.period}`);
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, bookingLimit: cfg.bookingLimit }));
          }
        }

        // ── Clear all recorded devices (resets everyone's limit) ──────────────
        if (urlPath === '/api/admin/reset-devices' && req.method === 'POST') {
          if (session.role !== 'superadmin') { res.writeHead(403); return res.end(JSON.stringify({ error: 'Forbidden' })); }
          const { csrfToken } = data;

          // CSRF validation
          if (!csrfToken || !validateCsrfToken(csrfToken)) {
            res.writeHead(403);
            return res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
          }

          writeDevices([]);
          auditLog('DEVICES_RESET', session.email, session.role, 'success', 'Cleared all recorded devices');
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true }));
        }

        if (urlPath === '/api/admin/teachers') {
          if (session.role !== 'superadmin') { res.writeHead(403); return res.end(JSON.stringify({ error: 'Forbidden' })); }

          const teachers = readTeachers();
          if (req.method === 'GET') {
            res.writeHead(200);
            // Don't expose PIN hashes to frontend
            const safe = teachers.map(t => ({ id: t.id, email: t.email, name: t.name, perms: t.perms }));
            return res.end(JSON.stringify(safe));
          }
          if (req.method === 'POST') {
            const { id, email, name, pin: tPin, perms, csrfToken } = data;

            // CSRF validation
            if (!csrfToken || !validateCsrfToken(csrfToken)) {
              res.writeHead(403);
              return res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
            }

            // Input validation
            if (!email || !email.includes('@')) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Valid email required' })); }
            if (!name || name.length < 2) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Name must be at least 2 characters' })); }
            if (!tPin || tPin.length < 4) { res.writeHead(400); return res.end(JSON.stringify({ error: 'PIN must be at least 4 characters' })); }

            const safeEmail = email.toLowerCase().trim();
            const existing = teachers.find(t => t.email.toLowerCase() === safeEmail && t.id !== id);
            if (existing && !id) { res.writeHead(409); return res.end(JSON.stringify({ error: 'Teacher with this email already exists' })); }

            if (id) {
              const idx = teachers.findIndex(t => t.id === id);
              if (idx > -1) {
                teachers[idx] = { id, email: safeEmail, name: name.slice(0, 100), pinHash: hashPin(tPin), perms: perms || {} };
                auditLog('TEACHER_UPDATED', session.email, session.role, 'success', `Updated teacher ${safeEmail}`);
              }
            } else {
              teachers.push({ id: Date.now().toString(36), email: safeEmail, name: name.slice(0, 100), pinHash: hashPin(tPin), perms: perms || {} });
              auditLog('TEACHER_CREATED', session.email, session.role, 'success', `Created teacher ${safeEmail}`);
            }
            writeTeachers(teachers);
            res.writeHead(200);
            const safe = teachers.map(t => ({ id: t.id, email: t.email, name: t.name, perms: t.perms }));
            return res.end(JSON.stringify({ success: true, teachers: safe }));
          }
          if (req.method === 'DELETE') {
            const { id, csrfToken } = data;

            // CSRF validation
            if (!csrfToken || !validateCsrfToken(csrfToken)) {
              res.writeHead(403);
              return res.end(JSON.stringify({ error: 'Invalid CSRF token' }));
            }

            const teacher = teachers.find(t => t.id === id);
            if (teacher) auditLog('TEACHER_DELETED', session.email, session.role, 'success', `Deleted teacher ${teacher.email}`);

            writeTeachers(teachers.filter(t => t.id !== id));
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true }));
          }
        }
      }

      // ── /api/schedule-appointment requires admin auth ─────────────────────
      if (urlPath === '/api/schedule-appointment') {
        const session = validateAdmin(req);
        if (!session) {
          res.writeHead(401);
          return res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
        }
      }

      if (urlPath === '/api/auth/request-code') {
        const { email } = data;
        if (!email) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Email required' }));
        }
        // Anti-bombing: cap OTP emails per IP and per target address so nobody
        // can spam a victim's inbox or burn our Gmail send quota.
        if (!rateAllow('otpip:' + reqIp, 5, 15 * 60 * 1000) ||
            !rateAllow('otpem:' + String(email).toLowerCase(), 4, 15 * 60 * 1000)) {
          res.writeHead(429, { 'Retry-After': '900' });
          return res.end(JSON.stringify({ success: false, error: 'Too many code requests. Please wait a few minutes before trying again.' }));
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        otps.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
        console.log(`[OTP] Code for ${email} is ${code}`);
        try {
          await transporter.sendMail({
            from: `"SJC Counselling" <${GMAIL_USER}>`,
            to: email,
            subject: 'Your SJC Portal OTP Code',
            html: buildEmail({
              title: 'Your SJC Portal OTP Code',
              preheader: `Your verification code is ${code}. Valid for 10 minutes.`,
              body: `
                <h2 style="font-family:Georgia,serif;font-size:24px;color:#2a0808;margin:0 0 6px;">Verification Code</h2>
                <p style="font-size:14px;color:#7a6868;margin:0 0 32px;">Use this code to verify your identity on the SJC Portal.</p>
                <div style="text-align:center;margin:0 0 28px;">
                  <div style="display:inline-block;background:#faf6ee;border:2px solid #c9a84c;border-radius:14px;padding:22px 48px;">
                    <div style="font-size:40px;font-weight:800;letter-spacing:10px;color:#2a0808;font-family:'Courier New',monospace;">${code}</div>
                  </div>
                </div>
                <p style="font-size:13px;color:#7a6868;text-align:center;line-height:1.7;">
                  This code expires in <strong>10 minutes</strong>.<br/>
                  If you did not request this, please ignore this email.
                </p>
              `
            })
          });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (mailErr) {
          console.error('[OTP Email Error]', mailErr);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: 'Failed to send email' }));
        }
      }
      else if (urlPath === '/api/auth/confirm-code') {
        const { email } = data;
        const otp = data.otp || data.code;
        const stored = otps.get(email);
        if (!stored) { res.writeHead(400); return res.end(JSON.stringify({ success: false, error: 'No OTP requested for this email' })); }
        if (Date.now() > stored.expiresAt) { otps.delete(email); res.writeHead(400); return res.end(JSON.stringify({ success: false, error: 'OTP expired' })); }
        if (stored.code !== otp) { res.writeHead(400); return res.end(JSON.stringify({ success: false, error: 'Invalid OTP' })); }
        otps.delete(email);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      }
      else if (urlPath === '/api/admin/send-email') {
        const { to, subject, body: msgBody, replyTo } = data;
        if (!to || !subject || !msgBody) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Missing to, subject or body' }));
        }
        try {
          const safeMsg = msgBody.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>');
          const htmlBody = buildEmail({
            title: subject,
            body: '<div style="font-size:15px;color:#1a0e0e;line-height:1.8;white-space:pre-wrap;">' + safeMsg + '</div>'
          });
          await transporter.sendMail({
            from: `"SJC Counselling" <${GMAIL_USER}>`,
            to,
            subject,
            text: msgBody,
            html: htmlBody,
            ...(replyTo ? { inReplyTo: replyTo, references: replyTo } : {})
          });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          console.error('[Admin Email Error]', e);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      }
      else if (urlPath === '/api/appointments') {
        const clientIp = getClientIp(req);
        const fingerprint = (data.fingerprint || '').toString().slice(0, 200);

        // Anti-spam: cap appointment submissions per IP per hour (separate from
        // the per-device lifetime limit below — this stops rapid scripted floods).
        if (!rateAllow('apt:' + clientIp, 8, 60 * 60 * 1000)) {
          res.writeHead(429, { 'Retry-After': '3600' });
          return res.end(JSON.stringify({ success: false, error: 'Too many requests from your network. Please try again later.' }));
        }

        // ── Per-device appointment limit ─────────────────────────────────────
        const limit = readBookingLimit();
        if (limit.enabled && fingerprint) {
          const start = bookingWindowStart(limit.period);
          if (start !== null) {
            const used = readDevices().filter(d =>
              d.fingerprint && d.fingerprint === fingerprint &&
              new Date(d.at).getTime() >= start
            ).length;
            if (used >= limit.max) {
              res.writeHead(429);
              return res.end(JSON.stringify({ success: false, error: limitMessage(limit) }));
            }
          }
        }

        const apt = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        delete apt.fingerprint; // keep the appointment record clean
        const apts = readApts();
        apts.unshift(apt);
        writeApts(apts);

        // Record this device + IP against the limit
        if (fingerprint || clientIp) {
          const devices = readDevices();
          devices.push({ fingerprint, ip: clientIp, at: apt.createdAt, aptId: apt.id, name: data.name || '' });
          writeDevices(devices);
        }
        // Send confirmation email if student provided one
        if (data.email) {
          transporter.sendMail({
            from: `"SJC Counselling" <${GMAIL_USER}>`,
            to: data.email,
            subject: 'Appointment Request Received — SJC Counselling',
            html: buildEmail({
              title: 'Appointment Request Received',
              preheader: `We have received your counselling request, ${data.name}.`,
              body: `
                <h2 style="font-family:Georgia,serif;font-size:26px;color:#2a0808;margin:0 0 6px;">Request Received</h2>
                <p style="font-size:14px;color:#7a6868;margin:0 0 28px;">We'll be in touch shortly to confirm your session.</p>

                <p style="font-size:15px;color:#1a0e0e;margin:0 0 24px;">Dear <strong>${data.name}</strong>,</p>
                <p style="font-size:14px;color:#3a2828;line-height:1.75;margin:0 0 28px;">
                  Thank you for reaching out to the SJC Counselling &amp; Career Guidance Unit.
                  Your appointment request has been received and our counsellor will contact you
                  shortly to confirm the date and time.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ee;border:1px solid #ede5d8;border-radius:12px;padding:0;margin-bottom:28px;">
                  <tr><td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#7a6868;padding-bottom:14px;">Appointment Details</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#3a2828;padding:6px 0;border-bottom:1px solid #ede5d8;"><strong style="color:#7a1818;">Service Type</strong></td>
                        <td style="font-size:13px;color:#1a0e0e;padding:6px 0;border-bottom:1px solid #ede5d8;text-align:right;">${data.type || 'General Counselling'}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#3a2828;padding:6px 0;border-bottom:1px solid #ede5d8;"><strong style="color:#7a1818;">Preferred Date</strong></td>
                        <td style="font-size:13px;color:#1a0e0e;padding:6px 0;border-bottom:1px solid #ede5d8;text-align:right;">${(data.date && data.date !== 'TBD') ? data.date : 'To be confirmed'}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#3a2828;padding:6px 0;"><strong style="color:#7a1818;">Preferred Time</strong></td>
                        <td style="font-size:13px;color:#1a0e0e;padding:6px 0;text-align:right;">${(data.time && data.time !== 'TBD') ? data.time : 'To be confirmed'}</td>
                      </tr>
                    </table>
                  </td></tr>
                </table>

                <p style="font-size:13px;color:#7a6868;line-height:1.7;margin:0;">
                  If you have any questions, you can reply to this email or call us directly.
                  All sessions are <strong>free and fully confidential</strong> for every Josephian.
                </p>
              `,
              footerNote: 'You are receiving this email because you submitted an appointment request on the SJC Counselling portal.'
            })
          }).catch(e => console.error('[Apt Email]', e.message));
        }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, id: apt.id }));
      }
      else if (urlPath === '/api/schedule-appointment') {
        const { email, name, date, time, notes, type } = data;
        if (!email) {
          res.writeHead(400);
          return res.end(JSON.stringify({ success: false, error: 'Student email is required.' }));
        }
        try {
          await transporter.sendMail({
            from: `"SJC Counselling" <${GMAIL_USER}>`,
            to: email,
            subject: `Your Appointment is Confirmed — SJC Counselling`,
            html: buildEmail({
              title: 'Appointment Confirmed',
              preheader: `Your ${type} session has been scheduled for ${date} at ${time}.`,
              body: `
                <h2 style="font-family:Georgia,serif;font-size:26px;color:#2a0808;margin:0 0 6px;">Appointment Confirmed</h2>
                <p style="font-size:14px;color:#7a6868;margin:0 0 28px;">Your counselling session has been scheduled.</p>

                <p style="font-size:15px;color:#1a0e0e;margin:0 0 24px;">Dear <strong>${name}</strong>,</p>
                <p style="font-size:14px;color:#3a2828;line-height:1.75;margin:0 0 28px;">
                  Great news — your counselling appointment has been confirmed by the SJC Counselling Unit.
                  Please make sure to arrive a few minutes early. Your session is free and completely confidential.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ee;border:1px solid #ede5d8;border-radius:12px;margin-bottom:28px;">
                  <tr><td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#7a6868;padding-bottom:14px;">Session Details</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;padding:8px 0;border-bottom:1px solid #ede5d8;"><strong style="color:#7a1818;">Service</strong></td>
                        <td style="font-size:13px;color:#1a0e0e;padding:8px 0;border-bottom:1px solid #ede5d8;text-align:right;font-weight:600;">${type}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;padding:8px 0;border-bottom:1px solid #ede5d8;"><strong style="color:#7a1818;">Date</strong></td>
                        <td style="font-size:13px;color:#1a0e0e;padding:8px 0;border-bottom:1px solid #ede5d8;text-align:right;font-weight:600;">${date}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;padding:8px 0;${notes ? 'border-bottom:1px solid #ede5d8;' : ''}"><strong style="color:#7a1818;">Time</strong></td>
                        <td style="font-size:13px;color:#1a0e0e;padding:8px 0;${notes ? 'border-bottom:1px solid #ede5d8;' : ''}text-align:right;font-weight:600;">${time}</td>
                      </tr>
                      ${notes ? `<tr>
                        <td colspan="2" style="font-size:13px;padding:10px 0 0;">
                          <strong style="color:#7a1818;">Note from Counsellor:</strong><br>
                          <span style="color:#3a2828;line-height:1.6;">${notes}</span>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td></tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#2a0808,#4a1010);border-radius:10px;margin-bottom:24px;">
                  <tr><td style="padding:18px 24px;text-align:center;">
                    <p style="font-size:13px;color:rgba(250,246,238,0.75);margin:0 0 6px;">Location</p>
                    <p style="font-size:15px;font-weight:700;color:#e8c96a;margin:0;">SJC Counselling &amp; Career Guidance Unit</p>
                    <p style="font-size:13px;color:rgba(250,246,238,0.6);margin:4px 0 0;">St. Joseph's College, Anuradhapura</p>
                  </td></tr>
                </table>

                <p style="font-size:13px;color:#7a6868;line-height:1.7;margin:0;">
                  Need to reschedule? Reply to this email or visit
                  <a href="https://cgu.jakenetwork.xyz/appointments" style="color:#a07830;font-weight:600;">our appointments page</a>.
                </p>
              `,
              footerNote: 'You are receiving this because your appointment was confirmed by the SJC Counselling admin.'
            })
          });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (mailErr) {
          console.error('[Schedule Email Error]', mailErr);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: 'Failed to send email' }));
        }
      }
      else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
      }
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: 'Server error' }));
    }
  });
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath.startsWith('/api/')) {
    if (req.method === 'GET' && urlPath.startsWith('/api/admin/emails')) {
      // Auth check for email routes
      const session = validateAdmin(req);
      if (!session) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(401);
        return res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      }
      return handleApiRequest(req, res, urlPath);
    }
    if (req.method === 'GET' && urlPath === '/api/admin/appointments') {
      const session = validateAdmin(req);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (!session) { res.writeHead(401); return res.end(JSON.stringify({ error: 'Unauthorized' })); }
      res.writeHead(200);
      return res.end(JSON.stringify(readApts()));
    }
    if (req.method === 'GET' && urlPath === '/api/admin/teachers') {
      const session = validateAdmin(req);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (!session) { res.writeHead(401); return res.end(JSON.stringify({ error: 'Unauthorized' })); }
      res.writeHead(200);
      return res.end(JSON.stringify(readTeachers()));
    }
    if (req.method === 'POST' || req.method === 'OPTIONS') {
      return handleApiRequest(req, res, urlPath);
    }
  }

  if (urlPath === '/') urlPath = '/index.html';

  // Teacher panel was merged into /admin/ — redirect any old links/bookmarks.
  if (urlPath === '/teacher' || urlPath === '/teacher/' || urlPath === '/teacher/index.html') {
    res.writeHead(301, { Location: '/admin/' });
    return res.end();
  }

  if (!path.extname(urlPath)) {
    if (fs.existsSync(path.join(__dirname, urlPath + '.html'))) {
      urlPath = urlPath + '.html';
    } else if (fs.existsSync(path.join(__dirname, urlPath, 'index.html'))) {
      urlPath = path.join(urlPath, 'index.html');
    }
  }

  let filePath = path.join(__dirname, urlPath);

  // Path-traversal guard: never serve anything outside the site root
  const root = path.resolve(__dirname);
  if (path.resolve(filePath) !== root && !path.resolve(filePath).startsWith(root + path.sep)) {
    res.writeHead(403, { ...securityHeaders, 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const page404 = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Page Not Found — SJC Counselling</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#faf6ee;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.card{background:#fff;border-radius:18px;padding:48px 40px;max-width:440px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(42,8,8,0.10);border:1px solid rgba(122,24,24,0.08)}h1{font-size:4rem;font-weight:800;color:#2a0808;line-height:1}p{font-size:1rem;color:#7a6868;margin:16px 0 32px;line-height:1.7}a{display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#2a0808,#5a1010);color:#faf6ee;border-radius:10px;font-weight:600;font-size:0.9rem;text-decoration:none}</style></head><body><div class="card"><h1>404</h1><p>The page you're looking for doesn't exist or has been moved.</p><a href="/">Back to Home</a></div></body></html>`;
        res.writeHead(404, { ...securityHeaders, 'Content-Type': 'text/html' });
        return res.end(page404);
      } else {
        res.writeHead(500, { ...securityHeaders });
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { ...securityHeaders, 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at port ${PORT}`);
});
