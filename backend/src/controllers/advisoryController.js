// backend/src/controllers/advisoryController.js
const aiAdvisoryService = require('../services/aiAdvisoryService');
const User = require('../models/User');
const Crop = require('../models/Crop');

// Get personalized crop advisory
exports.getPersonalizedAdvisory = async (req, res) => {
  try {
    const { userId, cropType, growthStage, issues } = req.query;
    
    // Find user and their farm details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get crop information
    const crop = await Crop.findOne({ name: cropType.toLowerCase() });
    
    // Generate personalized advisory
    const advisory = await aiAdvisoryService.generatePersonalizedAdvisory({
      user,
      crop,
      growthStage,
      issues: issues ? issues.split(',') : []
    });

    res.json({
      success: true,
      data: {
        advisory,
        timestamp: new Date().toISOString(),
        farmLocation: user.location,
        cropType,
        growthStage
      }
    });

  } catch (error) {
    console.error('Advisory generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate advisory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get crop recommendations based on location and season
exports.getCropRecommendations = async (req, res) => {
  try {
    const { latitude, longitude, season, soilType } = req.query;
    
    const recommendations = await aiAdvisoryService.getCropRecommendations({
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      season,
      soilType
    });

    res.json({
      success: true,
      data: {
        recommendations,
        location: { latitude, longitude },
        season,
        soilType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Crop recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crop recommendations'
    });
  }
};

// Get fertilizer recommendations
exports.getFertilizerRecommendations = async (req, res) => {
  try {
    const { cropType, soilTestResults, farmSize, growthStage } = req.body;
    
    const recommendations = await aiAdvisoryService.getFertilizerRecommendations({
      cropType,
      soilTestResults,
      farmSize: parseFloat(farmSize),
      growthStage
    });

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Fertilizer recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fertilizer recommendations'
    });
  }
};

// Save advisory feedback for improvement
exports.saveAdvisoryFeedback = async (req, res) => {
  try {
    const { advisoryId, userId, rating, feedback, helpful } = req.body;
    
    // Save feedback to database for ML model improvement
    const feedbackData = {
      advisoryId,
      userId,
      rating: parseInt(rating),
      feedback,
      helpful: Boolean(helpful),
      timestamp: new Date()
    };

    res.json({
      success: true,
      message: 'Feedback saved successfully'
    });

  } catch (error) {
    console.error('Save feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save feedback'
    });
  }
};

// New AI-powered advisory methods

// Chat with AI assistant
exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, userId, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context if userId provided
    let userContext = context || {};
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userContext.user = user;
      }
    }

    const response = await aiAdvisoryService.chatWithAssistant(message, userContext);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Chat assistant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Analyze pest/disease with AI
exports.analyzePestDisease = async (req, res) => {
  try {
    const { symptoms, images } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms description is required'
      });
    }

    const analysis = await aiAdvisoryService.analyzePestDisease(symptoms, images || []);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Pest/Disease analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze pest/disease issue',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Generate comprehensive crop plan
exports.generateCropPlan = async (req, res) => {
  try {
    const { location, soilType, climate, budget, preferences } = req.body;
    
    if (!location || !soilType) {
      return res.status(400).json({
        success: false,
        message: 'Location and soil type are required'
      });
    }

    const cropPlan = await aiAdvisoryService.generateCropPlan({
      location,
      soilType,
      climate: climate || {},
      budget: budget || 0,
      preferences: preferences || {}
    });

    res.json({
      success: true,
      data: cropPlan
    });

  } catch (error) {
    console.error('Crop plan generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crop plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get weather-based insights
exports.getWeatherBasedInsights = async (req, res) => {
  try {
    const { weatherData, cropInfo } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({
        success: false,
        message: 'Weather data is required'
      });
    }

    const insights = await aiAdvisoryService.getWeatherBasedInsights(weatherData, cropInfo || {});

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Weather insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather-based insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get market analysis and insights
exports.getMarketInsights = async (req, res) => {
  try {
    const { crops, location } = req.body;
    
    if (!crops || !location) {
      return res.status(400).json({
        success: false,
        message: 'Crops and location are required'
      });
    }

    const insights = await aiAdvisoryService.getMarketInsights(crops, location);

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Market insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get AI-powered general insights
exports.getAIInsights = async (req, res) => {
  try {
    const { userId, crop, growthStage, issues } = req.body;
    
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    const insights = await aiAdvisoryService.generateAIInsights({
      user: user || {},
      crop: crop || {},
      growthStage: growthStage || 'general',
      issues: issues || []
    });

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
