const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, fulfillmentController.getFulfillments);
router.get('/stock', requireAuth, fulfillmentController.getStock);
router.get('/:id', requireAuth, fulfillmentController.getFulfillmentById);
router.patch('/:id', requireAuth, fulfillmentController.updateFulfillmentStatus);

module.exports = router;
