const express = require('express');
const bcrypt = require('bcrypt');
const supabase = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('active', 1)
      .single();

    if (error || !user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
      email: user.username,
      password: password
    });

    const token = session?.session?.access_token || null;

    res.json({
      token,
      user: { id: user.id, full_name: user.full_name, role: user.role, username: user.username }
    });
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
    const { data, error } = await supabase
      .from('users')
      .insert({ username, password_hash, full_name, role })
      .select()
      .single();

    if (error) return res.status(400).json({ error: 'Username already exists.' });

    await supabase.auth.signUp({
      email: username,
      password: password,
      options: { data: { full_name, role } }
    });

    res.status(201).json({ id: data.id, username, full_name, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, full_name, role, active, created_at')
    .eq('id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, full_name, role, active, created_at')
    .order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(users);
});

router.post('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Username, password, and full name are required.' });
    }
    if (!['admin', 'social_worker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const password_hash = bcrypt.hashSync(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ username, password_hash, full_name, role })
      .select()
      .single();
    if (error) return res.status(400).json({ error: 'Username already exists.' });
    res.status(201).json({ id: data.id, username, full_name, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
