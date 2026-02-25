const { AppError } = require('../../shared/errors');

class SubmitProposalUseCase {
  constructor({ jobRepository, proposalRepository }) {
    this.jobRepository = jobRepository;
    this.proposalRepository = proposalRepository;
  }

  async execute(input) {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job || job.status !== 'open') {
      throw new AppError('Job is not available for proposals', 400);
    }

    const alreadyApplied = await this.proposalRepository.existsForJobAndFreelancer(
      input.jobId,
      input.freelancerId,
    );

    if (alreadyApplied) {
      throw new AppError('Proposal already submitted for this job', 409);
    }

    return this.proposalRepository.create({
      jobId: input.jobId,
      freelancerId: input.freelancerId,
      coverLetter: input.coverLetter,
      bidAmount: input.bidAmount,
    });
  }
}

module.exports = SubmitProposalUseCase;
