const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/auth');

router.get('/summary', optionalAuth, dashboardController.getSummary);
router.get('/recent-deals', optionalAuth, dashboardController.getRecentDeals);

module.exports = router;
