const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(requireAuth, requireRole('admin'));

router.get('/', warehouseController.getWarehouses);
router.post('/', warehouseController.createWarehouse);
router.patch('/:id/archive', warehouseController.archiveWarehouse);
router.put('/:id', warehouseController.updateWarehouse);
router.patch('/:id', warehouseController.updateWarehouse);
router.delete('/:id', warehouseController.deleteWarehouse);

module.exports = router;
