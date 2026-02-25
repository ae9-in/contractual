class Proposal {
  constructor({ id, jobId, freelancerId, coverLetter, bidAmount, createdAt }) {
    this.id = id;
    this.jobId = jobId;
    this.freelancerId = freelancerId;
    this.coverLetter = coverLetter;
    this.bidAmount = bidAmount;
    this.createdAt = createdAt;
  }
}

module.exports = Proposal;
