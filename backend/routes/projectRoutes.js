const express = require('express');
const projectController = require('../controllers/projectController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadProjectReferenceFiles, uploadSubmissionFiles } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('business'), uploadProjectReferenceFiles, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/mine', roleMiddleware('business'), projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.post('/:id/apply', roleMiddleware('freelancer'), projectController.applyForProject);
router.get('/:id/applications', roleMiddleware('business'), projectController.getProjectApplications);
router.put('/:id/applications/:applicationId/accept', roleMiddleware('business'), projectController.acceptProjectApplication);
router.put('/:id/submit', roleMiddleware('freelancer'), uploadSubmissionFiles, projectController.submitProject);
router.put('/:id/complete', roleMiddleware('business'), projectController.completeProject);
router.get('/:id/payment', paymentController.getProjectPayment);
router.post('/:id/payment/order', roleMiddleware('business'), paymentController.createProjectGatewayOrder);
router.post('/:id/payment/verify', roleMiddleware('business'), paymentController.verifyProjectGatewayPayment);
router.put('/:id/fund', roleMiddleware('business'), paymentController.fundProjectEscrow);
router.put('/:id/release', roleMiddleware('business'), paymentController.releaseProjectEscrow);
router.put('/:id/tip', roleMiddleware('business'), paymentController.addProjectTip);

module.exports = router;
