const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();
const routes = require('./routes');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
  await db.exec(schema);

  const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
  await db.exec(seed);

  const admin = await db.get("SELECT id FROM users WHERE username = 'admin'");
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.run(
      "INSERT INTO users (username, password_hash, full_name, role, active) VALUES (?, ?, ?, ?, 1)",
      ['admin', hash, 'System Administrator', 'admin']
    );
    console.log('Default admin user created.');
  }
  console.log('SQLite database ready.');
}

init().then(() => {
  app.listen(PORT, () => {
    console.log(`AidPriority server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});