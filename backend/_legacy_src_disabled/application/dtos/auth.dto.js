const { z } = require('zod');
const roles = require('../../config/roles');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum([roles.BUSINESS, roles.FREELANCER]),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
};
