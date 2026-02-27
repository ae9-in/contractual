const { z } = require('zod');
const profileModel = require('../models/profileModel');
const ApiError = require('../utils/ApiError');

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() : value),
  z.string().url().or(z.literal('')).optional(),
);

const profileSchema = z.object({
  skills: z.string().trim().optional().default(''),
  bio: z.string().trim().max(2000).optional().default(''),
  portfolioLink: optionalUrlSchema.default(''),
  experienceYears: z.coerce.number().int().min(0).max(60).optional().default(0),
  profilePhotoUrl: z.string().trim().max(500).optional().default(''),
  organizationName: z.string().trim().max(150).optional().default(''),
  organizationWebsite: optionalUrlSchema.default(''),
  organizationIndustry: z.string().trim().max(120).optional().default(''),
});

async function getProfile(userId) {
  const profile = await profileModel.getByUserId(userId);
  return profile || {
    userId,
    skills: '',
    bio: '',
    portfolioLink: '',
    experienceYears: 0,
    profilePhotoUrl: '',
    organizationName: '',
    organizationWebsite: '',
    organizationIndustry: '',
  };
}

async function upsertProfile(userId, data) {
  const payload = profileSchema.parse(data);
  return profileModel.upsertByUserId(userId, payload);
}

async function updateProfilePhoto(userId, file) {
  if (!file) {
    throw new ApiError(400, 'Profile photo is required');
  }
  const profilePhotoUrl = `/uploads/profile-photos/${file.filename}`;
  return profileModel.updatePhotoByUserId(userId, profilePhotoUrl);
}

module.exports = {
  getProfile,
  upsertProfile,
  updateProfilePhoto,
};
