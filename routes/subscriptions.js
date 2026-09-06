const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, subscriptionController.getSubscriptions);
router.get('/:id', requireAuth, subscriptionController.getSubscriptionById);
router.patch('/:id', requireAuth, subscriptionController.updateSubscription);

module.exports = router;
