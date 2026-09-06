const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', requireAuth, requireRole('admin', 'sales_manager', 'salesperson', 'finance_ops', 'customer'), quotationController.getQuotations);
router.get('/:id', requireAuth, requireRole('admin', 'sales_manager', 'salesperson', 'finance_ops', 'customer'), quotationController.getQuotationById);
router.post('/', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.createQuotation);
router.patch('/:id/archive', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.archiveQuotation);
router.delete('/:id', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.deleteQuotation);
router.put('/:id', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.updateQuotation);
router.patch('/:id', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.updateQuotation);
router.post('/:id/items', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.addItem);
router.post('/:id/submit', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), quotationController.submitQuotation);
router.post('/:id/accept', requireAuth, requireRole('admin', 'sales_manager', 'salesperson', 'customer'), quotationController.acceptQuotation);

module.exports = router;
