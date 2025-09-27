// backend/src/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { auth } = require('../middleware/auth');

// Chat with AI assistant
router.post('/chat', chatbotController.chatWithBot);

// Get chat history
router.get('/history', chatbotController.getChatHistory);

// Get suggested questions
router.get('/suggestions', chatbotController.getSuggestedQuestions);

// Process voice input
router.post('/voice', auth, chatbotController.processVoiceInput);

// Get farming tips
router.get('/tips', chatbotController.getFarmingTips);

module.exports = router;
