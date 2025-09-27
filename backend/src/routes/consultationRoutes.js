// backend/src/routes/consultationRoutes.js
const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { auth } = require('../middleware/auth');

// Book a consultation
router.post('/book', auth, consultationController.bookConsultation);

// Get consultations for user
router.get('/user/:userId', auth, consultationController.getUserConsultations);

// Get available experts
router.get('/experts', consultationController.getAvailableExperts);

// Start consultation
router.post('/start/:consultationId', auth, consultationController.startConsultation);

// End consultation
router.post('/end/:consultationId', auth, consultationController.endConsultation);

// Cancel consultation
router.post('/cancel/:consultationId', auth, consultationController.cancelConsultation);

module.exports = router;
