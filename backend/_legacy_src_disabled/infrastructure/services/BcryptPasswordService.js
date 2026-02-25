const bcrypt = require('bcryptjs');

class BcryptPasswordService {
  async hash(rawPassword) {
    return bcrypt.hash(rawPassword, 10);
  }

  async compare(rawPassword, hashedPassword) {
    return bcrypt.compare(rawPassword, hashedPassword);
  }
}

module.exports = BcryptPasswordService;
