const express = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('freelancer'));

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
