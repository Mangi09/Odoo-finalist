const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, approvalController.getApprovals);
router.get('/:id', optionalAuth, approvalController.getApprovalById);
router.patch('/:id', optionalAuth, approvalController.decideApproval);

module.exports = router;
