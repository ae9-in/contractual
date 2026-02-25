const express = require('express');
const proposalController = require('../controllers/ProposalController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/rbacMiddleware');
const roles = require('../../config/roles');

const router = express.Router();

router.post('/', authMiddleware, allowRoles(roles.FREELANCER), (req, res, next) =>
  proposalController.submit(req, res, next),
);
router.get('/business', authMiddleware, allowRoles(roles.BUSINESS), (req, res, next) =>
  proposalController.listForBusiness(req, res, next),
);

module.exports = router;
