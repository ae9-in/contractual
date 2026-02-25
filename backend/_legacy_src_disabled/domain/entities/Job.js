class Job {
  constructor({ id, businessId, title, description, budgetMin, budgetMax, status, createdAt }) {
    this.id = id;
    this.businessId = businessId;
    this.title = title;
    this.description = description;
    this.budgetMin = budgetMin;
    this.budgetMax = budgetMax;
    this.status = status;
    this.createdAt = createdAt;
  }
}

module.exports = Job;
