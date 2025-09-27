// backend/src/routes/cropManagementRoutes.js
const express = require('express');
const router = express.Router();
const cropManagementController = require('../controllers/cropManagementController');
const { auth, authorize } = require('../middleware/auth');

// Create new crop management record
router.post('/', auth, cropManagementController.createCropManagement);

// Get farmer's crop records
router.get('/farmer/:farmerId?', auth, cropManagementController.getFarmerCrops);

// Get active crops for dashboard
router.get('/active/:farmerId?', auth, cropManagementController.getActiveCrops);

// Get crop analytics
router.get('/analytics/:farmerId?', auth, cropManagementController.getCropAnalytics);

// Get specific crop details
router.get('/:id', auth, cropManagementController.getCropDetails);

// Update crop management record
router.put('/:id', auth, cropManagementController.updateCropManagement);

// Record activity
router.post('/:id/activities', auth, cropManagementController.recordActivity);

// Record harvest
router.post('/:id/harvest', auth, cropManagementController.recordHarvest);

// Add observation
router.post('/:id/observations', auth, cropManagementController.addObservation);

module.exports = router;