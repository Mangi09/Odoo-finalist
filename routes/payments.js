const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/create-order', optionalAuth, paymentController.createPaymentOrder);
router.post('/verify', optionalAuth, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
