const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

router.use(authMiddleware);

router.get('/users/:userId/summary', ratingController.getUserRatingSummary);
router.get('/projects/:projectId', ratingController.getProjectRatings);
router.post('/projects/:projectId', roleMiddleware('business'), ratingController.submitProjectRating);

module.exports = router;
