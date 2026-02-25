class ListBusinessProposalsUseCase {
  constructor({ jobRepository, proposalRepository }) {
    this.jobRepository = jobRepository;
    this.proposalRepository = proposalRepository;
  }

  async execute(businessId) {
    const jobs = await this.jobRepository.listByBusinessId(businessId);
    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return [];
    }

    return this.proposalRepository.listByJobIds(jobIds);
  }
}

module.exports = ListBusinessProposalsUseCase;
