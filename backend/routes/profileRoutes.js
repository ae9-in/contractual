const express = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Allow both freelancers AND business users to have profiles
router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/photo', uploadProfilePhoto, profileController.updateProfilePhoto);

module.exports = router;
