const { z } = require('zod');

const createJobSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: 'budgetMax must be >= budgetMin',
  path: ['budgetMax'],
});

module.exports = {
  createJobSchema,
};
