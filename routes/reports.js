const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { optionalAuth } = require('../middleware/auth');

router.get('/kpis', optionalAuth, reportsController.getKpisReport);
router.get('/lifecycle', optionalAuth, reportsController.getLifecycleReport);
router.get('/analytics', optionalAuth, reportsController.getAnalyticsReport);
router.get('/attention', optionalAuth, reportsController.getAttentionReport);
router.get('/activity', optionalAuth, reportsController.getActivityReport);

module.exports = router;
