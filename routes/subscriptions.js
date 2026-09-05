const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, subscriptionController.getSubscriptions);
router.get('/:id', optionalAuth, subscriptionController.getSubscriptionById);
router.patch('/:id', optionalAuth, subscriptionController.updateSubscription);

module.exports = router;
