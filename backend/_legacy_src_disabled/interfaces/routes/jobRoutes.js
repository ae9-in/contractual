const express = require('express');
const jobController = require('../controllers/JobController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/rbacMiddleware');
const roles = require('../../config/roles');

const router = express.Router();

router.get('/open', authMiddleware, (req, res, next) => jobController.listOpen(req, res, next));
router.post('/', authMiddleware, allowRoles(roles.BUSINESS), (req, res, next) =>
  jobController.create(req, res, next),
);

module.exports = router;
