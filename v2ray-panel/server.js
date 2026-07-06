// V2Ray Vault — family config sharing panel (v2ray.jakenetwork.xyz)
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4600;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- tiny JSON store ----------
function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function saveJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

let users = loadJson(USERS_FILE, []);
let posts = loadJson(POSTS_FILE, []);

// ---------- password hashing (scrypt, no native deps) ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

// seed admin account on first run
if (users.length === 0) {
  users.push({
    id: crypto.randomUUID(),
    username: 'jake',
    passwordHash: hashPassword('changeme123'),
    isAdmin: true,
    createdAt: new Date().toISOString(),
  });
  saveJson(USERS_FILE, users);
  console.log('[seed] created admin account: jake / changeme123 — change it after first login!');
}

// ---------- sessions (in-memory, cookie token) ----------
const sessions = new Map(); // token -> { userId, expires }
const SESSION_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId, expires: Date.now() + SESSION_TTL });
  return token;
}
function getSessionUser(req) {
  const token = (req.headers.cookie || '')
    .split(';').map(s => s.trim())
    .find(s => s.startsWith('vv_session='));
  if (!token) return null;
  const sess = sessions.get(token.slice('vv_session='.length));
  if (!sess || sess.expires < Date.now()) return null;
  return users.find(u => u.id === sess.userId) || null;
}

// ---------- login rate limiting ----------
const attempts = new Map(); // ip -> { count, until }
function rateLimited(ip) {
  const a = attempts.get(ip);
  return a && a.count >= 8 && Date.now() < a.until;
}
function recordAttempt(ip, ok) {
  if (ok) { attempts.delete(ip); return; }
  const a = attempts.get(ip) || { count: 0, until: 0 };
  a.count += 1;
  a.until = Date.now() + 1000 * 60 * 10; // 10 min lockout window
  attempts.set(ip, a);
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '256kb' }));

function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'not logged in' });
  req.user = user;
  next();
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'admin only' });
    next();
  });
}

// ---------- auth ----------
app.post('/api/login', (req, res) => {
  const ip = req.ip;
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 10 minutes.' });
  const { username, password } = req.body || {};
  const user = users.find(u => u.username.toLowerCase() === String(username || '').toLowerCase());
  const ok = !!user && verifyPassword(String(password || ''), user.passwordHash);
  recordAttempt(ip, ok);
  if (!ok) return res.status(401).json({ error: 'Wrong username or password.' });
  const token = createSession(user.id);
  res.setHeader('Set-Cookie', `vv_session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL / 1000}; SameSite=Lax`);
  res.json({ ok: true, username: user.username, isAdmin: !!user.isAdmin });
});

app.post('/api/logout', (req, res) => {
  const token = (req.headers.cookie || '').split(';').map(s => s.trim())
    .find(s => s.startsWith('vv_session='));
  if (token) sessions.delete(token.slice('vv_session='.length));
  res.setHeader('Set-Cookie', 'vv_session=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username, isAdmin: !!req.user.isAdmin });
});

app.post('/api/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!verifyPassword(String(currentPassword || ''), req.user.passwordHash))
    return res.status(401).json({ error: 'Current password is wrong.' });
  if (!newPassword || String(newPassword).length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  req.user.passwordHash = hashPassword(String(newPassword));
  saveJson(USERS_FILE, users);
  res.json({ ok: true });
});

// ---------- posts ----------
app.get('/api/posts', requireAuth, (req, res) => {
  res.json(posts.slice().reverse().map(p => ({
    id: p.id, title: p.title, body: p.body, note: p.note || '', createdAt: p.createdAt,
  })));
});

app.post('/api/posts', requireAdmin, (req, res) => {
  const { title, body, note } = req.body || {};
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Title is required.' });
  if (!body || !String(body).trim()) return res.status(400).json({ error: 'Config text is required.' });
  const post = {
    id: crypto.randomUUID(),
    title: String(title).trim().slice(0, 200),
    body: String(body).trim().slice(0, 100000),
    note: String(note || '').trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  saveJson(POSTS_FILE, posts);
  res.json(post);
});

app.put('/api/posts/:id', requireAdmin, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  const { title, body, note } = req.body || {};
  if (title && String(title).trim()) post.title = String(title).trim().slice(0, 200);
  if (body && String(body).trim()) post.body = String(body).trim().slice(0, 100000);
  if (note !== undefined) post.note = String(note || '').trim().slice(0, 2000);
  saveJson(POSTS_FILE, posts);
  res.json(post);
});

app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  const before = posts.length;
  posts = posts.filter(p => p.id !== req.params.id);
  if (posts.length === before) return res.status(404).json({ error: 'Post not found.' });
  saveJson(POSTS_FILE, posts);
  res.json({ ok: true });
});

// ---------- user management (admin) ----------
app.get('/api/users', requireAdmin, (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, isAdmin: !!u.isAdmin, createdAt: u.createdAt })));
});

app.post('/api/users', requireAdmin, (req, res) => {
  const { username, password } = req.body || {};
  const name = String(username || '').trim();
  if (!/^[a-zA-Z0-9_.-]{2,30}$/.test(name))
    return res.status(400).json({ error: 'Username: 2-30 letters/numbers/._-' });
  if (!password || String(password).length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (users.some(u => u.username.toLowerCase() === name.toLowerCase()))
    return res.status(409).json({ error: 'That username already exists.' });
  const user = {
    id: crypto.randomUUID(),
    username: name,
    passwordHash: hashPassword(String(password)),
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveJson(USERS_FILE, users);
  res.json({ id: user.id, username: user.username, isAdmin: false });
});

app.delete('/api/users/:id', requireAdmin, (req, res) => {
  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.id === req.user.id) return res.status(400).json({ error: "You can't delete yourself." });
  users = users.filter(u => u.id !== target.id);
  for (const [tok, sess] of sessions) if (sess.userId === target.id) sessions.delete(tok);
  saveJson(USERS_FILE, users);
  res.json({ ok: true });
});

app.post('/api/users/:id/reset-password', requireAdmin, (req, res) => {
  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  const { password } = req.body || {};
  if (!password || String(password).length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  target.passwordHash = hashPassword(String(password));
  saveJson(USERS_FILE, users);
  res.json({ ok: true });
});

// ---------- pages ----------
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

function sendPage(res, file) {
  res.sendFile(path.join(__dirname, 'public', file));
}

app.get('/login', (req, res) => {
  if (getSessionUser(req)) return res.redirect('/');
  sendPage(res, 'login.html');
});

app.get('/', (req, res) => {
  if (!getSessionUser(req)) return res.redirect('/login');
  sendPage(res, 'app.html');
});

app.get('/admin', (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.redirect('/login');
  if (!user.isAdmin) return res.redirect('/');
  sendPage(res, 'admin.html');
});

app.listen(PORT, () => console.log(`V2Ray Vault running on http://localhost:${PORT}`));
