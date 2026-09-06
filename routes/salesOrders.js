const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', salesOrderController.getSalesOrders);
router.get('/:id', salesOrderController.getSalesOrderById);
router.patch('/:id/status', salesOrderController.updateSalesOrderStatus);

module.exports = router;
