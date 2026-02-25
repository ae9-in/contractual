const { z } = require('zod');

const createProposalSchema = z.object({
  jobId: z.number().int().positive(),
  coverLetter: z.string().min(30),
  bidAmount: z.number().positive(),
});

module.exports = {
  createProposalSchema,
};
