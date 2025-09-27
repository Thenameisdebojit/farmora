// backend/src/routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Get current weather
router.get('/current', weatherController.getCurrentWeather);

// Get weather forecast
router.get('/forecast', weatherController.getWeatherForecast);

// Get farming weather advisory
router.get('/farming-advisory', weatherController.getFarmingWeatherAdvisory);

// Get weather alerts
router.get('/alerts', weatherController.getWeatherAlerts);

// Get historical weather data
router.get('/historical', weatherController.getHistoricalWeather);

// Get irrigation recommendations based on weather
router.get('/irrigation-recommendations', weatherController.getIrrigationRecommendations);

module.exports = router;
