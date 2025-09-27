// backend/src/controllers/weatherController.js
const weatherService = require('../services/weatherService');
const User = require('../models/User');

// Get current weather for user location
exports.getCurrentWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const weatherData = await weatherService.getCurrentWeather(
      parseFloat(latitude), 
      parseFloat(longitude)
    );

    res.json({
      success: true,
      data: weatherData
    });

  } catch (error) {
    console.error('Current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current weather'
    });
  }
};

// Get weather forecast
exports.getWeatherForecast = async (req, res) => {
  try {
    const { latitude, longitude, days = 7 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const forecastData = await weatherService.getWeatherForecast(
      parseFloat(latitude), 
      parseFloat(longitude),
      parseInt(days)
    );

    res.json({
      success: true,
      data: forecastData
    });

  } catch (error) {
    console.error('Weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast'
    });
  }
};

// Get farming-specific weather advisory
exports.getFarmingWeatherAdvisory = async (req, res) => {
  try {
    const { userId, cropType } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { latitude, longitude } = user.location.coordinates;
    const advisory = await weatherService.getFarmingWeatherAdvisory(
      latitude, 
      longitude, 
      cropType,
      user.farmingPractices
    );

    res.json({
      success: true,
      data: advisory
    });

  } catch (error) {
    console.error('Farming weather advisory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weather advisory'
    });
  }
};

// Get weather alerts for location
exports.getWeatherAlerts = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    const alerts = await weatherService.getWeatherAlerts(
      parseFloat(latitude), 
      parseFloat(longitude)
    );

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather alerts'
    });
  }
};

// Get historical weather data
exports.getHistoricalWeather = async (req, res) => {
  try {
    const { latitude, longitude, startDate, endDate } = req.query;
    
    if (!latitude || !longitude || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, start date, and end date are required'
      });
    }

    // For now, return mock historical data
    // In a real implementation, this would fetch from a weather service
    const historicalData = {
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      period: {
        start: startDate,
        end: endDate
      },
      data: [
        {
          date: startDate,
          temperature: { min: 22, max: 35, avg: 28.5 },
          humidity: 65,
          rainfall: 0,
          windSpeed: 12
        }
        // More historical data would be returned here
      ]
    };

    res.json({
      success: true,
      data: historicalData
    });

  } catch (error) {
    console.error('Historical weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical weather data'
    });
  }
};

// Get irrigation recommendations based on weather
exports.getIrrigationRecommendations = async (req, res) => {
  try {
    const { latitude, longitude, cropType, soilType } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Get current weather to base recommendations on
    const currentWeather = await weatherService.getCurrentWeather(
      parseFloat(latitude), 
      parseFloat(longitude)
    );

    const forecast = await weatherService.getWeatherForecast(
      parseFloat(latitude), 
      parseFloat(longitude),
      7
    );

    // Generate irrigation recommendations based on weather data
    const recommendations = {
      currentConditions: {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        rainfall: currentWeather.rainfall || 0
      },
      recommendation: {
        shouldIrrigate: currentWeather.humidity < 60 && currentWeather.rainfall < 1,
        frequency: 'Every 2-3 days',
        duration: '30-45 minutes',
        nextIrrigation: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        reasoning: 'Based on current weather conditions and forecast'
      },
      forecast: forecast
    };

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Irrigation recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate irrigation recommendations'
    });
  }
};
