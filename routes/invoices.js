const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, invoiceController.getInvoices);
router.get('/:id', requireAuth, invoiceController.getInvoiceById);
router.get('/:id/pdf', requireAuth, invoiceController.getInvoicePdf);
router.post('/:id/payments', requireAuth, invoiceController.recordPayment);

module.exports = router;
