const express = require('express');
const router = express.Router();
const customerPortalController = require('../controllers/customerPortalController');
const { optionalAuth } = require('../middleware/auth');

router.get('/quotation/:id', optionalAuth, customerPortalController.getPortalQuotation);
router.post('/quotation/:id/accept', optionalAuth, customerPortalController.acceptQuotation);
router.post('/quotation/:id/reject', optionalAuth, customerPortalController.rejectQuotation);
router.post('/quotation/:id/negotiate', optionalAuth, customerPortalController.submitNegotiation);

module.exports = router;
