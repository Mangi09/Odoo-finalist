const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, fulfillmentController.getFulfillments);
router.get('/:id', optionalAuth, fulfillmentController.getFulfillmentById);
router.patch('/:id', optionalAuth, fulfillmentController.updateFulfillmentStatus);

module.exports = router;
