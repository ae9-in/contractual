class CreateJobUseCase {
  constructor({ jobRepository }) {
    this.jobRepository = jobRepository;
  }

  async execute(input) {
    return this.jobRepository.create({
      businessId: input.businessId,
      title: input.title,
      description: input.description,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
    });
  }
}

module.exports = CreateJobUseCase;
