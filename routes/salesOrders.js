const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');
const { optionalAuth, requireAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', salesOrderController.getSalesOrders);
router.get('/:id', salesOrderController.getSalesOrderById);
router.patch('/:id/status', salesOrderController.updateSalesOrderStatus);

module.exports = router;
