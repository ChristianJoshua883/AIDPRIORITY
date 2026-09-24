const supabase = require('../db');

function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  supabase.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error || !user) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = { id: user.id, username: user.email, full_name: user.user_metadata?.full_name || user.email, role: user.user_metadata?.role || 'social_worker' };
    next();
  }).catch(() => res.status(500).json({ error: 'Token verification failed.' }));
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
