const jwt = require('jsonwebtoken');
const config = require('../config');

// Verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Check if user is super admin
function isSuperAdmin(req, res, next) {
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Access denied. Super admin only.' });
  }
  next();
}

// Check if user is organization admin
function isOrgAdmin(req, res, next) {
  if (req.user.role !== 'org-admin') {
    return res.status(403).json({ error: 'Access denied. Organization admin only.' });
  }
  next();
}

module.exports = {
  verifyToken,
  isSuperAdmin,
  isOrgAdmin
};
