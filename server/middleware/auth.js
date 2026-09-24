const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'aidpriority-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id, username: decoded.username, full_name: decoded.full_name, role: decoded.role };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, SECRET };