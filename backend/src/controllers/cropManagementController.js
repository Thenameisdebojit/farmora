// backend/src/controllers/cropManagementController.js
const CropManagement = require('../models/CropManagement');
const Crop = require('../models/Crop');
const User = require('../models/User');
const WeatherData = require('../models/WeatherData');
const aiAdvisoryService = require('../services/aiAdvisoryService');
const weatherService = require('../services/weatherService');
const axios = require('axios');

// Create new crop management record
exports.createCropManagement = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.farmer;
    
    // Validate required fields
    const requiredFields = ['crop', 'fieldName', 'variety', 'plantingInfo', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate crop exists
    const crop = await Crop.findById(req.body.crop);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Set default values and calculate expected harvest date
    const sowingDate = new Date(req.body.plantingInfo.sowingDate);
    const cropGrowthDays = crop.totalGrowthDays || 120; // Default to 120 days
    const expectedHarvestDate = new Date(sowingDate);
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + cropGrowthDays);

    // Determine season and crop year
    const season = getCurrentSeason(sowingDate);
    const cropYear = getCropYear(sowingDate);

    // Create crop management record
    const cropManagementData = {
      ...req.body,
      farmer: userId,
      season,
      cropYear,
      status: 'active',
      harvest: {
        ...req.body.harvest,
        expectedHarvestDate
      },
      currentStage: {
        stage: 'seed_preparation',
        startDate: sowingDate,
        completionPercentage: 0,
        notes: 'Crop planting initiated'
      }
    };

    const cropManagement = await CropManagement.create(cropManagementData);
    await cropManagement.populate(['crop', 'farmer']);

    // Get weather data for the location
    const { latitude, longitude } = req.body.location.coordinates;
    try {
      const weatherData = await getWeatherData(latitude, longitude);
      if (weatherData) {
        // Store weather impact if any extreme conditions
        const extremeEvents = checkExtremeWeatherConditions(weatherData);
        if (extremeEvents.length > 0) {
          cropManagement.weatherImpact = extremeEvents.map(event => ({
            date: new Date(),
            eventType: event.type,
            severity: event.severity,
            impact: event.description,
            damageAssessment: { areaAffected: 0, yieldLoss: 0, financialLoss: 0 }
          }));
          await cropManagement.save();
        }
      }
    } catch (weatherError) {
      console.warn('Weather data fetch failed:', weatherError.message);
    }

    // Generate AI insights for the new crop
    try {
      const user = await User.findById(userId);
      const aiInsights = await aiAdvisoryService.generateAIInsights({
        user,
        crop,
        growthStage: 'seed_preparation',
        issues: []
      });

      if (aiInsights && aiInsights.insights) {
        cropManagement.aiInsights.push({
          type: 'general',
          insight: aiInsights.insights,
          confidence: aiInsights.confidence || 0.8,
          source: 'ai_analysis'
        });
        await cropManagement.save();
      }
    } catch (aiError) {
      console.warn('AI insights generation failed:', aiError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Crop management record created successfully',
      data: cropManagement
    });

  } catch (error) {
    console.error('Create crop management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create crop management record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all crop management records for a farmer
exports.getFarmerCrops = async (req, res) => {
  try {
    const farmerId = req.user?.id || req.params.farmerId;
    const { status, season, year, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { farmer: farmerId };
    if (status) query.status = status;
    if (season) query.season = season;
    if (year) query.cropYear = year;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const crops = await CropManagement.find(query)
      .populate(['crop', 'farmer'])
      .sort({ 'plantingInfo.sowingDate': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CropManagement.countDocuments(query);

    // Get statistics
    const stats = await CropManagement.getCropStatistics(farmerId);

    res.json({
      success: true,
      data: {
        crops,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get active crops for dashboard
exports.getActiveCrops = async (req, res) => {
  try {
    const farmerId = req.user?.id || req.params.farmerId;

    const activeCrops = await CropManagement.findActiveCrops(farmerId);

    // Enhance with real-time data
    const enrichedCrops = await Promise.all(
      activeCrops.map(async (crop) => {
        const cropData = crop.toObject();
        
        // Add weather-based recommendations
        try {
          const { latitude, longitude } = crop.location.coordinates;
          const weatherData = await getWeatherData(latitude, longitude);
          if (weatherData) {
            cropData.currentWeather = {
              temperature: weatherData.temperature,
              humidity: weatherData.humidity,
              condition: weatherData.weather,
              recommendation: getWeatherRecommendation(weatherData, crop.currentStage.stage)
            };
          }
        } catch (error) {
          console.warn('Weather data enrichment failed:', error.message);
        }

        // Add growth stage insights
        cropData.stageProgress = calculateStageProgress(crop);
        cropData.nextMilestone = getNextMilestone(crop);
        cropData.urgentActions = getUrgentActions(crop);

        return cropData;
      })
    );

    res.json({
      success: true,
      data: enrichedCrops
    });

  } catch (error) {
    console.error('Get active crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active crops',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get specific crop management details
exports.getCropDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const crop = await CropManagement.findById(id)
      .populate(['crop', 'farmer', 'sharedWith.user']);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    // Check access permissions
    const userId = req.user?.id;
    const hasAccess = crop.farmer._id.toString() === userId ||
                     crop.sharedWith.some(share => share.user._id.toString() === userId) ||
                     crop.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Enhance with additional data
    const enrichedCrop = crop.toObject();
    
    // Add weather forecast for harvest planning
    if (crop.harvest.expectedHarvestDate && crop.location.coordinates) {
      try {
        const { latitude, longitude } = crop.location.coordinates;
        const forecast = await getWeatherForecast(latitude, longitude, 7);
        enrichedCrop.harvestWeatherForecast = forecast;
      } catch (error) {
        console.warn('Weather forecast fetch failed:', error.message);
      }
    }

    // Add market price data
    try {
      const marketData = await getMarketPrices(crop.crop.name, crop.location.address.state);
      enrichedCrop.marketPrices = marketData;
    } catch (error) {
      console.warn('Market data fetch failed:', error.message);
    }

    // Calculate analytics
    enrichedCrop.analytics = {
      daysFromSowing: crop.daysFromSowing,
      expectedHarvestDays: crop.expectedHarvestDays,
      profitMargin: crop.profitMargin,
      stageCompletion: calculateOverallProgress(crop),
      costPerDay: crop.economics.totalInvestment / (crop.daysFromSowing || 1),
      projectedROI: calculateProjectedROI(crop)
    };

    res.json({
      success: true,
      data: enrichedCrop
    });

  } catch (error) {
    console.error('Get crop details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update crop management record
exports.updateCropManagement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const crop = await CropManagement.findById(id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    // Check permissions
    const userId = req.user?.id;
    const canEdit = crop.farmer.toString() === userId ||
                   crop.sharedWith.some(share => 
                     share.user.toString() === userId && 
                     ['contributor', 'manager'].includes(share.role)
                   );

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Handle stage updates
    if (updates.currentStage && updates.currentStage.stage !== crop.currentStage.stage) {
      await crop.updateStage(updates.currentStage.stage, updates.currentStage.notes);
      delete updates.currentStage; // Remove from updates as it's handled by the method
    }

    // Update the record
    Object.assign(crop, updates);
    const updatedCrop = await crop.save();
    await updatedCrop.populate(['crop', 'farmer']);

    res.json({
      success: true,
      message: 'Crop record updated successfully',
      data: updatedCrop
    });

  } catch (error) {
    console.error('Update crop management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update crop record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Record an activity
exports.recordActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activity, cost, notes, photos } = req.body;

    if (!activity) {
      return res.status(400).json({
        success: false,
        message: 'Activity description is required'
      });
    }

    const crop = await CropManagement.findById(id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    await crop.recordActivity(activity, cost, notes, photos);

    res.json({
      success: true,
      message: 'Activity recorded successfully',
      data: crop
    });

  } catch (error) {
    console.error('Record activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Record harvest
exports.recordHarvest = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, quality, laborCost, transportCost, unit } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const crop = await CropManagement.findById(id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    // Update harvest unit if provided
    if (unit) {
      crop.harvest.totalYield.unit = unit;
    }

    await crop.recordHarvest(quantity, quality, laborCost || 0, transportCost || 0);

    // Calculate yield per unit area
    const totalYield = crop.harvest.totalYield.value;
    const area = crop.plantingInfo.area.value;
    crop.harvest.yieldPerUnit = totalYield / area;

    // Update status if harvest is complete
    const expectedYield = getExpectedYield(crop.crop, area);
    if (totalYield >= expectedYield * 0.8) { // 80% of expected yield
      crop.status = 'completed';
      crop.harvest.actualHarvestDate = new Date();
      
      // Update current stage to harvest
      if (crop.currentStage.stage !== 'harvest') {
        await crop.updateStage('harvest', 'Harvest completed');
      }
    }

    await crop.save();
    await crop.populate(['crop', 'farmer']);

    res.json({
      success: true,
      message: 'Harvest recorded successfully',
      data: crop
    });

  } catch (error) {
    console.error('Record harvest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record harvest',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add observation
exports.addObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { observation, severity, photos } = req.body;

    if (!observation) {
      return res.status(400).json({
        success: false,
        message: 'Observation description is required'
      });
    }

    const crop = await CropManagement.findById(id);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    await crop.addObservation(observation, severity || 'low', photos || []);

    res.json({
      success: true,
      message: 'Observation added successfully',
      data: crop
    });

  } catch (error) {
    console.error('Add observation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add observation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get crop analytics
exports.getCropAnalytics = async (req, res) => {
  try {
    const farmerId = req.user?.id || req.params.farmerId;
    const { period = '6months', cropId } = req.query;

    // Date range calculation
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '2years':
        startDate.setFullYear(endDate.getFullYear() - 2);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }

    // Build aggregation pipeline
    const matchStage = {
      farmer: mongoose.Types.ObjectId(farmerId),
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (cropId) {
      matchStage.crop = mongoose.Types.ObjectId(cropId);
    }

    // Get comprehensive analytics
    const analytics = await CropManagement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCrops: { $sum: 1 },
          totalArea: { $sum: '$plantingInfo.area.value' },
          totalInvestment: { $sum: '$economics.totalInvestment' },
          totalRevenue: { $sum: '$economics.revenue.totalSales' },
          avgYield: { $avg: '$harvest.yieldPerUnit' },
          completedCrops: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeCrops: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly breakdown
    const monthlyData = await CropManagement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$plantingInfo.sowingDate' },
            month: { $month: '$plantingInfo.sowingDate' }
          },
          crops: { $sum: 1 },
          investment: { $sum: '$economics.totalInvestment' },
          revenue: { $sum: '$economics.revenue.totalSales' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get crop-wise performance
    const cropWiseData = await CropManagement.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'crops', localField: 'crop', foreignField: '_id', as: 'cropInfo' } },
      { $unwind: '$cropInfo' },
      {
        $group: {
          _id: '$crop',
          cropName: { $first: '$cropInfo.displayName' },
          count: { $sum: 1 },
          avgYield: { $avg: '$harvest.yieldPerUnit' },
          totalRevenue: { $sum: '$economics.revenue.totalSales' },
          avgROI: { $avg: '$economics.roi' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const result = {
      summary: analytics[0] || {
        totalCrops: 0,
        totalArea: 0,
        totalInvestment: 0,
        totalRevenue: 0,
        avgYield: 0,
        completedCrops: 0,
        activeCrops: 0
      },
      monthlyData,
      cropWisePerformance: cropWiseData,
      period: {
        startDate,
        endDate,
        period
      }
    };

    // Calculate derived metrics
    if (result.summary.totalInvestment > 0) {
      result.summary.totalProfit = result.summary.totalRevenue - result.summary.totalInvestment;
      result.summary.avgROI = (result.summary.totalProfit / result.summary.totalInvestment) * 100;
    }

    result.summary.successRate = result.summary.totalCrops > 0 
      ? (result.summary.completedCrops / result.summary.totalCrops) * 100 
      : 0;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get crop analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper functions
const getCurrentSeason = (date) => {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  if (month >= 4 && month <= 9) return 'kharif';
  if (month >= 10 || month <= 3) return 'rabi';
  return 'zaid';
};

const getCropYear = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // Crop year starts from April
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const getWeatherData = async (latitude, longitude) => {
  try {
    // Try to get from our weather service first
    const response = await axios.get(`http://localhost:5000/api/weather/current`, {
      params: { latitude, longitude }
    });
    return response.data.data;
  } catch (error) {
    // Fallback to external weather API
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) return null;
      
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: apiKey,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        weather: response.data.weather[0].main,
        description: response.data.weather[0].description,
        windSpeed: response.data.wind?.speed * 3.6 || 0 // Convert m/s to km/h
      };
    } catch (externalError) {
      console.warn('External weather API failed:', externalError.message);
      return null;
    }
  }
};

const getWeatherForecast = async (latitude, longitude, days) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return null;
    
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: apiKey,
        units: 'metric',
        cnt: days * 8 // 8 forecasts per day (3-hour intervals)
      }
    });

    return response.data.list.map(item => ({
      date: item.dt_txt,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      weather: item.weather[0].main,
      description: item.weather[0].description,
      precipitation: item.rain?.['3h'] || 0
    }));
  } catch (error) {
    console.warn('Weather forecast fetch failed:', error.message);
    return null;
  }
};

const getMarketPrices = async (cropName, state) => {
  try {
    // This would integrate with real market price APIs
    // For now, return mock data with realistic values
    const basePrice = {
      wheat: 2000,
      rice: 1800,
      cotton: 5500,
      sugarcane: 280,
      corn: 1700
    };

    const price = basePrice[cropName.toLowerCase()] || 1500;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation

    return {
      currentPrice: Math.round(price * (1 + variation)),
      unit: 'per quintal',
      currency: 'INR',
      lastUpdated: new Date(),
      trend: variation > 0 ? 'up' : 'down',
      change: Math.abs(variation * 100).toFixed(1) + '%',
      marketCenter: `${state} Mandi`,
      weeklyAverage: Math.round(price * 0.98),
      monthlyAverage: Math.round(price * 0.95)
    };
  } catch (error) {
    console.warn('Market price fetch failed:', error.message);
    return null;
  }
};

const checkExtremeWeatherConditions = (weatherData) => {
  const extremeEvents = [];
  
  if (weatherData.temperature > 40) {
    extremeEvents.push({
      type: 'heat_wave',
      severity: 'high',
      description: `Extreme heat detected: ${weatherData.temperature}°C`
    });
  }
  
  if (weatherData.temperature < 5) {
    extremeEvents.push({
      type: 'frost',
      severity: 'high',
      description: `Frost risk detected: ${weatherData.temperature}°C`
    });
  }
  
  if (weatherData.windSpeed > 50) {
    extremeEvents.push({
      type: 'strong_wind',
      severity: 'medium',
      description: `Strong winds detected: ${weatherData.windSpeed} km/h`
    });
  }

  return extremeEvents;
};

const getWeatherRecommendation = (weatherData, stage) => {
  const recommendations = [];
  
  if (weatherData.temperature > 35) {
    recommendations.push('Increase irrigation frequency due to high temperature');
  }
  
  if (weatherData.humidity > 80 && ['flowering', 'fruit_formation'].includes(stage)) {
    recommendations.push('Monitor for fungal diseases due to high humidity');
  }
  
  if (weatherData.weather?.toLowerCase().includes('rain')) {
    recommendations.push('Postpone spraying activities due to expected rainfall');
  }

  return recommendations.length > 0 ? recommendations : ['Weather conditions are favorable for current growth stage'];
};

const calculateStageProgress = (crop) => {
  const totalDays = crop.daysFromSowing;
  const stageHistory = crop.stageHistory || [];
  const completedStages = stageHistory.length;
  const totalStages = 8; // Total number of growth stages
  
  return Math.round((completedStages / totalStages) * 100);
};

const getNextMilestone = (crop) => {
  const currentStage = crop.currentStage.stage;
  const stageSequence = [
    'seed_preparation', 'germination', 'seedling', 'vegetative', 
    'flowering', 'fruit_formation', 'maturation', 'harvest'
  ];
  
  const currentIndex = stageSequence.indexOf(currentStage);
  const nextStage = stageSequence[currentIndex + 1];
  
  if (!nextStage) return null;
  
  const estimatedDays = {
    germination: 5,
    seedling: 10,
    vegetative: 30,
    flowering: 15,
    fruit_formation: 20,
    maturation: 15,
    harvest: 5
  };
  
  return {
    stage: nextStage,
    estimatedDays: estimatedDays[nextStage] || 7,
    description: `Next: ${nextStage.replace('_', ' ')}`
  };
};

const getUrgentActions = (crop) => {
  const actions = [];
  const daysFromSowing = crop.daysFromSowing;
  
  // Check for overdue activities
  if (crop.currentStage.stage === 'vegetative' && daysFromSowing > 30) {
    actions.push({
      action: 'First top dressing fertilizer application overdue',
      priority: 'high',
      daysOverdue: daysFromSowing - 30
    });
  }
  
  // Check harvest timing
  if (crop.expectedHarvestDays <= 7 && crop.expectedHarvestDays > 0) {
    actions.push({
      action: 'Harvest preparation needed',
      priority: 'medium',
      daysRemaining: crop.expectedHarvestDays
    });
  }
  
  return actions;
};

const calculateOverallProgress = (crop) => {
  const stages = ['seed_preparation', 'germination', 'seedling', 'vegetative', 'flowering', 'fruit_formation', 'maturation', 'harvest'];
  const currentIndex = stages.indexOf(crop.currentStage.stage);
  const stageProgress = crop.currentStage.completionPercentage || 0;
  
  return Math.round(((currentIndex + stageProgress / 100) / stages.length) * 100);
};

const calculateProjectedROI = (crop) => {
  if (!crop.economics.totalInvestment || crop.economics.totalInvestment === 0) return null;
  
  // Estimate based on current progress and expected yield
  const progress = calculateOverallProgress(crop) / 100;
  const estimatedYield = getExpectedYield(crop.crop, crop.plantingInfo.area.value);
  const estimatedRevenue = estimatedYield * (crop.economics.revenue.averagePrice || 2000);
  const projectedProfit = estimatedRevenue - crop.economics.totalInvestment;
  
  return Math.round((projectedProfit / crop.economics.totalInvestment) * 100);
};

const getExpectedYield = (crop, area) => {
  // Default expected yield per unit area (this would come from crop database)
  const defaultYields = {
    wheat: 40, // quintal per acre
    rice: 50,
    cotton: 15,
    sugarcane: 400,
    corn: 45
  };
  
  const yieldPerUnit = defaultYields[crop?.name?.toLowerCase()] || 30;
  return yieldPerUnit * area;
};

module.exports = {
  createCropManagement: exports.createCropManagement,
  getFarmerCrops: exports.getFarmerCrops,
  getActiveCrops: exports.getActiveCrops,
  getCropDetails: exports.getCropDetails,
  updateCropManagement: exports.updateCropManagement,
  recordActivity: exports.recordActivity,
  recordHarvest: exports.recordHarvest,
  addObservation: exports.addObservation,
  getCropAnalytics: exports.getCropAnalytics
};