const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await userModel.findById(payload.sub);

    if (!user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Unauthorized'));
  }
}

module.exports = authMiddleware;
