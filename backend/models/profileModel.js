const pool = require('../config/db');

async function getByUserId(userId) {
  const [rows] = await pool.execute(
    'SELECT user_id AS userId, skills, bio, portfolio_link AS portfolioLink, experience_years AS experienceYears FROM freelancer_profiles WHERE user_id = ? LIMIT 1',
    [userId],
  );
  return rows[0] || null;
}

async function upsertByUserId(userId, profile) {
  await pool.execute(
    `INSERT INTO freelancer_profiles (user_id, skills, bio, portfolio_link, experience_years)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     skills = VALUES(skills),
     bio = VALUES(bio),
     portfolio_link = VALUES(portfolio_link),
     experience_years = VALUES(experience_years)`,
    [userId, profile.skills, profile.bio, profile.portfolioLink, profile.experienceYears],
  );
  return getByUserId(userId);
}

module.exports = {
  getByUserId,
  upsertByUserId,
};
