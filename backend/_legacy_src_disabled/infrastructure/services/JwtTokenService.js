const jwt = require('jsonwebtoken');
const env = require('../../config/env');

class JwtTokenService {
  sign(payload) {
    return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, env.jwt.secret);
  }
}

module.exports = JwtTokenService;
