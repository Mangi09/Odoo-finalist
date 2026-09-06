const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(requireAuth, requireRole('admin', 'sales_manager'));

router.get('/kpis', reportsController.getKpisReport);
router.get('/lifecycle', reportsController.getLifecycleReport);
router.get('/analytics', reportsController.getAnalyticsReport);
router.get('/attention', reportsController.getAttentionReport);
router.get('/activity', reportsController.getActivityReport);

module.exports = router;
