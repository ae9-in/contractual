const express = require('express');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

module.exports = router;
