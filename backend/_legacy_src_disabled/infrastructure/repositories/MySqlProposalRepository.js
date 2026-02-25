const Proposal = require('../../domain/entities/Proposal');

class MySqlProposalRepository {
  constructor({ db }) {
    this.db = db;
  }

  async create({ jobId, freelancerId, coverLetter, bidAmount }) {
    const [result] = await this.db.execute(
      'INSERT INTO proposals (job_id, freelancer_id, cover_letter, bid_amount) VALUES (?, ?, ?, ?)',
      [jobId, freelancerId, coverLetter, bidAmount],
    );

    const [rows] = await this.db.execute(
      'SELECT id, job_id AS jobId, freelancer_id AS freelancerId, cover_letter AS coverLetter, bid_amount AS bidAmount, created_at AS createdAt FROM proposals WHERE id = ? LIMIT 1',
      [result.insertId],
    );

    return new Proposal(rows[0]);
  }

  async existsForJobAndFreelancer(jobId, freelancerId) {
    const [rows] = await this.db.execute(
      'SELECT id FROM proposals WHERE job_id = ? AND freelancer_id = ? LIMIT 1',
      [jobId, freelancerId],
    );
    return Boolean(rows[0]);
  }

  async listByJobIds(jobIds) {
    const placeholders = jobIds.map(() => '?').join(',');
    const [rows] = await this.db.execute(
      `SELECT p.id, p.job_id AS jobId, p.freelancer_id AS freelancerId, p.cover_letter AS coverLetter,
       p.bid_amount AS bidAmount, p.created_at AS createdAt, u.name AS freelancerName, j.title AS jobTitle
       FROM proposals p
       INNER JOIN users u ON u.id = p.freelancer_id
       INNER JOIN jobs j ON j.id = p.job_id
       WHERE p.job_id IN (${placeholders})
       ORDER BY p.created_at DESC`,
      jobIds,
    );

    return rows;
  }
}

module.exports = MySqlProposalRepository;
