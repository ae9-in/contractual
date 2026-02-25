const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/projects/:projectId', messageController.getProjectMessages);
router.post('/projects/:projectId', messageController.sendProjectMessage);

module.exports = router;
