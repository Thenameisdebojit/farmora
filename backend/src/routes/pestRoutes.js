// backend/src/routes/pestRoutes.js
const express = require('express');
const router = express.Router();
const pestController = require('../controllers/pestController');
const { auth } = require('../middleware/auth');

// Detect pest from uploaded image
router.post('/detect', auth, pestController.detectPestFromImage);

// Get pest information and treatment
router.get('/info', pestController.getPestInfo);

// Get common pests for a crop
router.get('/common', pestController.getCommonPests);

// Get treatment recommendations
router.get('/treatment', pestController.getTreatmentRecommendations);

// Report pest outbreak
router.post('/report-outbreak', auth, pestController.reportPestOutbreak);

// Get pest alerts for region
router.get('/alerts', pestController.getPestAlerts);

module.exports = router;
