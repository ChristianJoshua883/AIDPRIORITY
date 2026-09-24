const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const routes = require('./routes');
const supabase = require('./db');

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
  try {
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();
    if (!existingAdmin) {
      const hash = bcrypt.hashSync('admin123', 10);
      await supabase.from('users').insert({
        username: 'admin', password_hash: hash,
        full_name: 'System Administrator', role: 'admin', active: 1
      });
      console.log('Default admin user created.');
    }
    console.log('Supabase connection verified.');
  } catch (err) {
    console.error('Failed to initialize Supabase:', err.message);
    process.exit(1);
  }
}

init().then(() => {
  app.listen(PORT, () => {
    console.log(`AidPriority server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});
