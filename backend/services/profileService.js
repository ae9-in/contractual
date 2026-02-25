const { z } = require('zod');
const profileModel = require('../models/profileModel');

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().url().or(z.literal('')).optional(),
);

const profileSchema = z.object({
  skills: z.string().trim().min(1),
  bio: z.string().trim().max(2000).optional().default(''),
  portfolioLink: optionalUrlSchema.default(''),
  experienceYears: z.coerce.number().int().min(0).max(60),
});

async function getProfile(userId) {
  const profile = await profileModel.getByUserId(userId);
  return profile || { userId, skills: '', bio: '', portfolioLink: '', experienceYears: 0 };
}

async function upsertProfile(userId, data) {
  const payload = profileSchema.parse(data);
  return profileModel.upsertByUserId(userId, payload);
}

module.exports = {
  getProfile,
  upsertProfile,
};
