// backend/src/routes/irrigationRoutes.js
const express = require('express');
const router = express.Router();
const irrigationController = require('../controllers/irrigationController');
const { auth } = require('../middleware/auth');

// Get irrigation schedule for user
router.get('/schedule/:userId', auth, irrigationController.getIrrigationSchedule);

// Get soil moisture readings
router.get('/soil-moisture/:deviceId', auth, irrigationController.getSoilMoisture);

// Update irrigation settings
router.put('/settings/:deviceId', auth, irrigationController.updateIrrigationSettings);

// Trigger manual irrigation
router.post('/trigger/:deviceId', auth, irrigationController.triggerIrrigation);

// Get irrigation history
router.get('/history', auth, irrigationController.getIrrigationHistory);

// Get water usage analytics
router.get('/analytics', auth, irrigationController.getWaterUsageAnalytics);

module.exports = router;
