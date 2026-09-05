const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, quotationController.getQuotations);
router.get('/:id', optionalAuth, quotationController.getQuotationById);
router.post('/', optionalAuth, quotationController.createQuotation);
router.put('/:id', optionalAuth, quotationController.updateQuotation);
router.post('/:id/items', optionalAuth, quotationController.addItem);
router.post('/:id/submit', optionalAuth, quotationController.submitQuotation);

module.exports = router;
