const express = require('express');
const router = express.Router();
const customerPortalController = require('../controllers/customerPortalController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/admin/requests', requireAuth, requireRole('admin'), customerPortalController.getAdminRequests);

router.use(requireAuth, requireRole('customer'));
router.get('/quotation/:id', customerPortalController.getPortalQuotation);
router.post('/quotation/:id/accept', customerPortalController.acceptQuotation);
router.post('/quotation/:id/reject', customerPortalController.rejectQuotation);
router.post('/quotation/:id/negotiate', customerPortalController.submitNegotiation);

module.exports = router;
