const express = require('express');
const router = express.Router();
const discountRulesController = require('../controllers/discountRulesController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(requireAuth, requireRole('admin', 'sales_manager'));

router.get('/', discountRulesController.getDiscountRules);
router.put('/bulk', discountRulesController.updateBulk);
router.patch('/:id', discountRulesController.updateDiscountRule);

module.exports = router;
