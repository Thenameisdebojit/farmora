// backend/src/routes/marketRoutes.js
const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { auth } = require('../middleware/auth');

// Get current market prices
router.get('/prices', marketController.getCurrentMarketPrices);

// Get market trends and analysis
router.get('/trends', marketController.getMarketTrends);

// Get price predictions
router.get('/predictions', marketController.getPricePredictions);

// Get selling recommendations
router.get('/selling-recommendations', auth, marketController.getSellingRecommendations);

// Set price alert
router.post('/price-alert', auth, marketController.setPriceAlert);

module.exports = router;
