const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, requireRole, SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = db.get(
      "SELECT * FROM users WHERE username = ? AND active = 1",
      [username]
    );

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Username, password, and full name are required.' });
    }
    if (!['admin', 'social_worker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    db.run(
      "INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
      [username, password_hash, full_name, role],
      function (err) {
        if (err) return res.status(400).json({ error: 'Username already exists.' });
        res.status(201).json({ id: this.lastID, username, full_name, role });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  const users = db.all("SELECT id, username, full_name, role, active, created_at FROM users ORDER BY id");
  res.json(users);
});

router.post('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!['admin', 'social_worker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const password_hash = bcrypt.hashSync(password, 10);
    db.run(
      "INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
      [username, password_hash, full_name, role],
      function (err) {
        if (err) return res.status(400).json({ error: 'Username already exists.' });
        res.status(201).json({ id: this.lastID, username, full_name, role });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
