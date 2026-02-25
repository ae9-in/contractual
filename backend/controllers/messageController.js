const asyncHandler = require('../utils/asyncHandler');
const messageService = require('../services/messageService');

exports.getProjectMessages = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);
  const messages = await messageService.listProjectMessages(projectId, req.user.id);
  res.json({ messages });
});

exports.sendProjectMessage = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.projectId);
  const message = await messageService.sendProjectMessage(projectId, req.user.id, req.body);
  res.status(201).json({ message });
});
