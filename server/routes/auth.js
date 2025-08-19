const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'users.json');

function readUsers() {
  try {
    if (!fs.existsSync(USERS_PATH)) return [];
    const raw = fs.readFileSync(USERS_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verify;
}

function signToken(user) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const payload = { id: user.id, email: user.email, name: user.name };
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  const newUser = { id, name, email, passwordHash, createdAt: new Date().toISOString() };
  users.push(newUser);
  writeUsers(users);

  const token = signToken(newUser);
  return res.json({ token, user: { id, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    return res.json({ user: { id: payload.id, name: payload.name, email: payload.email } });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;


