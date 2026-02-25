const asyncHandler = require('../utils/asyncHandler');
const ratingService = require('../services/ratingService');

exports.getProjectRatings = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);
  const ratings = await ratingService.listProjectRatings(projectId, req.user.id);
  res.json({ ratings });
});

exports.submitProjectRating = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);
  const rating = await ratingService.submitProjectRating(projectId, req.user.id, req.body);
  res.status(201).json({ rating });
});

exports.getUserRatingSummary = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const summary = await ratingService.getUserRatingSummary(req.user.id, userId);
  res.json({ summary });
});
