const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash AS passwordHash, role, created_at AS createdAt FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash, role }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role],
  );
  return findById(result.insertId);
}

module.exports = {
  findByEmail,
  findById,
  create,
};
