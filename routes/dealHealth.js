const express = require('express');
const router = express.Router();
const dealHealthController = require('../controllers/dealHealthController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, dealHealthController.getDealHealthDashboard);
router.post('/recalculate/:quotationId', optionalAuth, dealHealthController.recalculateScore);

module.exports = router;
