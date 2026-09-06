const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/summary', requireAuth, dashboardController.getSummary);
router.get('/recent-deals', requireAuth, dashboardController.getRecentDeals);

module.exports = router;
