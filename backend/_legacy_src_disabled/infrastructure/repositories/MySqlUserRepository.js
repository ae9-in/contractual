const User = require('../../domain/entities/User');

class MySqlUserRepository {
  constructor({ db }) {
    this.db = db;
  }

  async findByEmail(email) {
    const [rows] = await this.db.execute(
      'SELECT id, name, email, password_hash AS passwordHash, role, created_at AS createdAt FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    return rows[0] ? new User(rows[0]) : null;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      'SELECT id, name, email, password_hash AS passwordHash, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? new User(rows[0]) : null;
  }

  async create({ name, email, passwordHash, role }) {
    const [result] = await this.db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role],
    );
    return this.findById(result.insertId);
  }
}

module.exports = MySqlUserRepository;
