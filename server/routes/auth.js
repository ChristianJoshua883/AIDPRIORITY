const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, requireRole, SECRET } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await db.get("SELECT * FROM users WHERE username = ? AND active = 1", [username]);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role, username: user.username } });
}));

router.post('/register', asyncHandler(async (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Username, password, and full name are required.' });
  }
  if (!['admin', 'social_worker'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const existing = await db.get("SELECT id FROM users WHERE username = ?", [username]);
  if (existing) return res.status(400).json({ error: 'Username already exists.' });

  const password_hash = bcrypt.hashSync(password, 10);
  const result = await db.run(
    "INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
    [username, password_hash, full_name, role]
  );
  res.status(201).json({ id: result.lastID, username, full_name, role });
}));

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await db.get(
    "SELECT id, username, full_name, role, active, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
}));

router.get('/users', authenticateToken, requireRole('admin'), asyncHandler(async (req, res) => {
  const users = await db.all(
    "SELECT id, username, full_name, role, active, created_at FROM users ORDER BY id"
  );
  res.json(users);
}));

router.post('/users', authenticateToken, requireRole('admin'), asyncHandler(async (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Username, password, and full name are required.' });
  }
  if (!['admin', 'social_worker'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  const existing = await db.get("SELECT id FROM users WHERE username = ?", [username]);
  if (existing) return res.status(400).json({ error: 'Username already exists.' });

  const password_hash = bcrypt.hashSync(password, 10);
  const result = await db.run(
    "INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
    [username, password_hash, full_name, role]
  );
  res.status(201).json({ id: result.lastID, username, full_name, role });
}));

module.exports = router;