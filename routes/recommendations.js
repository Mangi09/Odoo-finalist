const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/auth');

router.get('/quotations/:id/recommendations', optionalAuth, recommendationController.getRecommendationsForQuotation);
router.post('/recommendations/:id/accept', optionalAuth, recommendationController.acceptRecommendation);
router.post('/recommendations/:id/reject', optionalAuth, recommendationController.rejectRecommendation);

module.exports = router;
