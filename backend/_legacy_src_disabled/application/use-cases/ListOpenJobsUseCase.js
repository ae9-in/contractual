class ListOpenJobsUseCase {
  constructor({ jobRepository }) {
    this.jobRepository = jobRepository;
  }

  async execute() {
    return this.jobRepository.listOpenJobs();
  }
}

module.exports = ListOpenJobsUseCase;
