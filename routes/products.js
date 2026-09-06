const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', requireAuth, requireRole('salesperson', 'sales_manager', 'finance_ops', 'admin'), productController.getProducts);
router.get('/:id', requireAuth, requireRole('salesperson', 'sales_manager', 'finance_ops', 'admin'), productController.getProductById);
router.post('/', requireAuth, requireRole('sales_manager', 'admin'), productController.createProduct);
router.put('/:id', requireAuth, requireRole('sales_manager', 'admin'), productController.updateProduct);

module.exports = router;
