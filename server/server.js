const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/api', routes);

const schemaPath = path.join(__dirname, 'database', 'schema.sql');
const seedPath = path.join(__dirname, 'database', 'seed.sql');

db.serialize(() => {
  if (fs.existsSync(schemaPath)) {
    db.exec(fs.readFileSync(schemaPath, 'utf8'));
  }
  const existingAdmin = db.get("SELECT id FROM users WHERE username = ?", ['admin']);
  if (!existingAdmin) {
    const bcrypt = require('bcrypt');
    const hash = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO users (username, password_hash, full_name, role, active) VALUES (?, ?, ?, ?, 1)", ['admin', hash, 'System Administrator', 'admin']);
  }
  if (fs.existsSync(seedPath)) {
    db.exec(fs.readFileSync(seedPath, 'utf8'));
  }
});

app.listen(PORT, () => {
  console.log(`AidPriority server running on http://localhost:${PORT}`);
});
