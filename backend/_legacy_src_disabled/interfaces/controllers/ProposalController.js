const { createProposalSchema } = require('../../application/dtos/proposal.dto');
const { submitProposalUseCase, listBusinessProposalsUseCase } = require('../../config/container');

class ProposalController {
  async submit(req, res, next) {
    try {
      const payload = createProposalSchema.parse(req.body);
      const proposal = await submitProposalUseCase.execute({
        ...payload,
        freelancerId: req.user.id,
      });
      res.status(201).json({ proposal });
    } catch (error) {
      next(error);
    }
  }

  async listForBusiness(req, res, next) {
    try {
      const proposals = await listBusinessProposalsUseCase.execute(req.user.id);
      res.json({ proposals });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProposalController();
