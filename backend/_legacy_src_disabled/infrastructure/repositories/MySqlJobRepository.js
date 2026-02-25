const Job = require('../../domain/entities/Job');

class MySqlJobRepository {
  constructor({ db }) {
    this.db = db;
  }

  async create({ businessId, title, description, budgetMin, budgetMax }) {
    const [result] = await this.db.execute(
      'INSERT INTO jobs (business_id, title, description, budget_min, budget_max, status) VALUES (?, ?, ?, ?, ?, ?)',
      [businessId, title, description, budgetMin, budgetMax, 'open'],
    );
    return this.findById(result.insertId);
  }

  async listOpenJobs() {
    const [rows] = await this.db.execute(
      `SELECT j.id, j.business_id AS businessId, j.title, j.description, j.budget_min AS budgetMin,
       j.budget_max AS budgetMax, j.status, j.created_at AS createdAt, u.name AS businessName
       FROM jobs j
       INNER JOIN users u ON u.id = j.business_id
       WHERE j.status = 'open'
       ORDER BY j.created_at DESC`,
    );
    return rows.map((row) => ({ ...new Job(row), businessName: row.businessName }));
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      'SELECT id, business_id AS businessId, title, description, budget_min AS budgetMin, budget_max AS budgetMax, status, created_at AS createdAt FROM jobs WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? new Job(rows[0]) : null;
  }

  async listByBusinessId(businessId) {
    const [rows] = await this.db.execute(
      'SELECT id, business_id AS businessId, title, description, budget_min AS budgetMin, budget_max AS budgetMax, status, created_at AS createdAt FROM jobs WHERE business_id = ? ORDER BY created_at DESC',
      [businessId],
    );
    return rows.map((row) => new Job(row));
  }
}

module.exports = MySqlJobRepository;
