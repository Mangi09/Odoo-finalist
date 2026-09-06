const express = require('express');
const router = express.Router();
const dealHealthController = require('../controllers/dealHealthController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(requireAuth, requireRole('admin', 'sales_manager', 'finance_ops'));
router.get('/', dealHealthController.getDealHealthDashboard);
router.post('/:id/escalate', dealHealthController.escalateDeal);
router.post('/recalculate/:quotationId', dealHealthController.recalculateScore);

module.exports = router;
