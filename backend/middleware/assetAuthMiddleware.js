const jwt = require('jsonwebtoken');
const env = require('../config/env');

function readBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

function assetAuthMiddleware(req, res, next) {
  const token = readBearerToken(req) || String(req.query.token || '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = assetAuthMiddleware;
