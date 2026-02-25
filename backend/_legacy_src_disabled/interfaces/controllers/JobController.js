const { createJobSchema } = require('../../application/dtos/job.dto');
const { createJobUseCase, listOpenJobsUseCase } = require('../../config/container');

class JobController {
  async create(req, res, next) {
    try {
      const payload = createJobSchema.parse(req.body);
      const job = await createJobUseCase.execute({
        ...payload,
        businessId: req.user.id,
      });
      res.status(201).json({ job });
    } catch (error) {
      next(error);
    }
  }

  async listOpen(req, res, next) {
    try {
      const jobs = await listOpenJobsUseCase.execute();
      res.json({ jobs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();
