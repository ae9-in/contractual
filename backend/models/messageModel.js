const pool = require('../config/db');

async function listByProject(projectId) {
  const [rows] = await pool.execute(
    `SELECT m.id, m.project_id AS projectId, m.sender_id AS senderId, m.message_text AS messageText,
      m.created_at AS createdAt, u.name AS senderName, u.role AS senderRole
     FROM messages m
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.project_id = ?
     ORDER BY m.created_at ASC, m.id ASC`,
    [projectId],
  );
  return rows;
}

async function create({ projectId, senderId, messageText }) {
  const [result] = await pool.execute(
    'INSERT INTO messages (project_id, sender_id, message_text) VALUES (?, ?, ?)',
    [projectId, senderId, messageText],
  );
  const [rows] = await pool.execute(
    `SELECT m.id, m.project_id AS projectId, m.sender_id AS senderId, m.message_text AS messageText,
      m.created_at AS createdAt, u.name AS senderName, u.role AS senderRole
     FROM messages m
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.id = ? LIMIT 1`,
    [result.insertId],
  );
  return rows[0] || null;
}

module.exports = {
  listByProject,
  create,
};
