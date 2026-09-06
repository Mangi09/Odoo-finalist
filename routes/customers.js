const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', requireAuth, requireRole('admin', 'sales_manager', 'salesperson', 'finance_ops'), customerController.getCustomers);
router.post('/', requireAuth, requireRole('admin', 'sales_manager', 'salesperson'), customerController.createCustomer);

module.exports = router;
