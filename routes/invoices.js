const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, invoiceController.getInvoices);
router.get('/:id', optionalAuth, invoiceController.getInvoiceById);
router.get('/:id/pdf', optionalAuth, invoiceController.getInvoicePdf);
router.post('/:id/payments', optionalAuth, invoiceController.recordPayment);

module.exports = router;
