const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.use(authMiddleware);
router.get('/config', paymentController.getGatewayConfig);

module.exports = router;
