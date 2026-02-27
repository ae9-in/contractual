const asyncHandler = require('../utils/asyncHandler');
const profileService = require('../services/profileService');

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  res.json({ profile });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.upsertProfile(req.user.id, req.body);
  res.json({ profile });
});

exports.updateProfilePhoto = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfilePhoto(req.user.id, req.file);
  res.json({ profile });
});
