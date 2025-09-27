// backend/src/routes/advisoryRoutes.js
const express = require('express');
const router = express.Router();
const advisoryController = require('../controllers/advisoryController');
const { auth } = require('../middleware/auth');

// Get personalized advisory
router.get('/personalized', advisoryController.getPersonalizedAdvisory);

// Get crop recommendations based on location and season
router.get('/crop-recommendations', advisoryController.getCropRecommendations);

// Get fertilizer recommendations
router.post('/fertilizer-recommendations', advisoryController.getFertilizerRecommendations);

// Save advisory feedback
router.post('/feedback', auth, advisoryController.saveAdvisoryFeedback);

// New AI-powered endpoints
// Chat with AI assistant
router.post('/chat', advisoryController.chatWithAssistant);

// Analyze pest/disease with AI
router.post('/pest-disease-analysis', advisoryController.analyzePestDisease);

// Generate comprehensive crop plan
router.post('/crop-plan', advisoryController.generateCropPlan);

// Get weather-based insights
router.post('/weather-insights', advisoryController.getWeatherBasedInsights);

// Get market analysis and insights
router.post('/market-insights', advisoryController.getMarketInsights);

// Get AI-powered general insights
router.post('/ai-insights', advisoryController.getAIInsights);

module.exports = router;

