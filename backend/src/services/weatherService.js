// backend/src/services/weatherService.js
const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(latitude, longitude) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        windSpeed: response.data.wind?.speed || 0,
        windDirection: response.data.wind?.deg || 0,
        visibility: response.data.visibility,
        cloudCover: response.data.clouds.all,
        weather: response.data.weather[0].main,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast(latitude, longitude, days = 7) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      // Process forecast data into daily summaries
      const dailyForecasts = this.processForecastData(response.data.list);
      
      return {
        location: {
          latitude,
          longitude,
          name: response.data.city.name,
          country: response.data.city.country
        },
        forecasts: dailyForecasts.slice(0, days),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Weather forecast error:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  async getFarmingWeatherAdvisory(latitude, longitude, cropType, farmingPractices) {
    try {
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      const forecast = await this.getWeatherForecast(latitude, longitude, 7);

      const advisory = {
        currentConditions: this.analyzeCurrentConditions(currentWeather, cropType),
        weeklyOutlook: this.analyzeWeeklyForecast(forecast.forecasts, cropType),
        recommendations: this.generateFarmingRecommendations(currentWeather, forecast.forecasts, cropType, farmingPractices),
        alerts: this.generateWeatherAlerts(currentWeather, forecast.forecasts),
        timestamp: new Date().toISOString()
      };

      return advisory;
    } catch (error) {
      console.error('Farming weather advisory error:', error);
      throw new Error('Failed to generate farming weather advisory');
    }
  }

  async getWeatherAlerts(latitude, longitude) {
    try {
      // Check if OpenWeather has alerts endpoint available
      const alerts = [];
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      const forecast = await this.getWeatherForecast(latitude, longitude, 3);

      // Generate alerts based on conditions
      if (currentWeather.temperature > 40) {
        alerts.push({
          type: 'extreme_heat',
          severity: 'high',
          message: 'Extreme heat warning. Protect crops and increase irrigation.',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Check for heavy rain in forecast
      const heavyRainDay = forecast.forecasts.find(day => day.precipitation > 50);
      if (heavyRainDay) {
        alerts.push({
          type: 'heavy_rain',
          severity: 'medium',
          message: 'Heavy rainfall expected. Ensure proper drainage and avoid field operations.',
          startTime: heavyRainDay.date,
          endTime: heavyRainDay.date
        });
      }

      return alerts;
    } catch (error) {
      console.error('Weather alerts error:', error);
      return [];
    }
  }

  async getHistoricalWeather(latitude, longitude, startDate, endDate) {
    // Mock implementation - would need historical weather API
    return {
      location: { latitude, longitude },
      period: { startDate, endDate },
      data: [],
      message: 'Historical weather data not available in demo version'
    };
  }

  async getIrrigationRecommendations(latitude, longitude, cropType, farmSize) {
    try {
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      const forecast = await this.getWeatherForecast(latitude, longitude, 7);

      const recommendations = {
        immediate: this.getImmediateIrrigationAdvice(currentWeather, cropType),
        weekly: this.getWeeklyIrrigationPlan(forecast.forecasts, cropType, farmSize),
        waterRequirement: this.calculateWaterRequirement(cropType, farmSize, currentWeather),
        timing: this.getOptimalIrrigationTiming(currentWeather, forecast.forecasts)
      };

      return recommendations;
    } catch (error) {
      console.error('Irrigation recommendations error:', error);
      throw new Error('Failed to generate irrigation recommendations');
    }
  }

  // Helper methods
  processForecastData(forecastList) {
    const dailyData = {};

    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          temperatures: [],
          humidity: [],
          precipitation: 0,
          windSpeed: [],
          weather: [],
          descriptions: []
        };
      }

      dailyData[date].temperatures.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].precipitation += item.rain?.['3h'] || 0;
      dailyData[date].windSpeed.push(item.wind?.speed || 0);
      dailyData[date].weather.push(item.weather[0].main);
      dailyData[date].descriptions.push(item.weather[0].description);
    });

    return Object.values(dailyData).map(day => ({
      date: day.date,
      tempMin: Math.min(...day.temperatures),
      tempMax: Math.max(...day.temperatures),
      tempAvg: day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length,
      humidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length,
      precipitation: day.precipitation,
      windSpeed: day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length,
      weather: day.weather[0], // Most frequent weather
      description: day.descriptions[0]
    }));
  }

  analyzeCurrentConditions(weather, cropType) {
    const analysis = {
      temperature: this.analyzeTemperature(weather.temperature, cropType),
      humidity: this.analyzeHumidity(weather.humidity, cropType),
      wind: this.analyzeWind(weather.windSpeed),
      overall: 'suitable' // default
    };

    // Determine overall suitability
    const factors = [analysis.temperature, analysis.humidity, analysis.wind];
    const unsuitable = factors.filter(f => f.status === 'unsuitable').length;
    const caution = factors.filter(f => f.status === 'caution').length;

    if (unsuitable > 0) {
      analysis.overall = 'unsuitable';
    } else if (caution > 1) {
      analysis.overall = 'caution';
    }

    return analysis;
  }

  analyzeWeeklyForecast(forecasts, cropType) {
    return forecasts.map(day => ({
      date: day.date,
      suitability: this.getDaySuitability(day, cropType),
      recommendations: this.getDayRecommendations(day, cropType)
    }));
  }

  generateFarmingRecommendations(current, forecasts, cropType, practices) {
    const recommendations = [];

    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push({
        category: 'irrigation',
        priority: 'high',
        message: 'Increase irrigation frequency due to high temperatures'
      });
    }

    // Rain-based recommendations
    const rainExpected = forecasts.some(day => day.precipitation > 10);
    if (rainExpected) {
      recommendations.push({
        category: 'field_operations',
        priority: 'medium',
        message: 'Postpone spraying and harvesting operations due to expected rainfall'
      });
    }

    // Wind-based recommendations
    if (current.windSpeed > 15) {
      recommendations.push({
        category: 'spraying',
        priority: 'high',
        message: 'Avoid pesticide/fertilizer spraying due to high wind speeds'
      });
    }

    return recommendations;
  }

  generateWeatherAlerts(current, forecasts) {
    const alerts = [];

    // High temperature alert
    if (current.temperature > 40) {
      alerts.push({
        type: 'extreme_heat',
        severity: 'critical',
        message: 'Extreme heat conditions. Take immediate protective measures.'
      });
    }

    // Heavy rain alert
    const heavyRain = forecasts.find(day => day.precipitation > 50);
    if (heavyRain) {
      alerts.push({
        type: 'heavy_rainfall',
        severity: 'high',
        message: `Heavy rainfall expected on ${heavyRain.date}. Prepare drainage systems.`
      });
    }

    return alerts;
  }

  analyzeTemperature(temp, cropType) {
    // Simplified temperature analysis
    if (temp < 10 || temp > 45) {
      return { status: 'unsuitable', message: 'Temperature is outside optimal range' };
    } else if (temp < 15 || temp > 40) {
      return { status: 'caution', message: 'Temperature requires monitoring' };
    }
    return { status: 'suitable', message: 'Temperature is optimal' };
  }

  analyzeHumidity(humidity, cropType) {
    if (humidity > 90) {
      return { status: 'caution', message: 'High humidity may increase disease risk' };
    } else if (humidity < 30) {
      return { status: 'caution', message: 'Low humidity may stress plants' };
    }
    return { status: 'suitable', message: 'Humidity levels are acceptable' };
  }

  analyzeWind(windSpeed) {
    if (windSpeed > 25) {
      return { status: 'unsuitable', message: 'High winds - avoid spraying operations' };
    } else if (windSpeed > 15) {
      return { status: 'caution', message: 'Moderate winds - exercise caution during operations' };
    }
    return { status: 'suitable', message: 'Wind conditions are favorable' };
  }

  getDaySuitability(day, cropType) {
    // Simplified suitability calculation
    let score = 100;

    if (day.tempMax > 40 || day.tempMin < 10) score -= 30;
    if (day.precipitation > 50) score -= 20;
    if (day.windSpeed > 20) score -= 15;
    if (day.humidity > 90) score -= 10;

    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getDayRecommendations(day, cropType) {
    const recommendations = [];

    if (day.precipitation > 20) {
      recommendations.push('Avoid field operations');
      recommendations.push('Check drainage systems');
    }

    if (day.tempMax > 35) {
      recommendations.push('Monitor crop stress');
      recommendations.push('Consider additional irrigation');
    }

    if (day.windSpeed > 15) {
      recommendations.push('Postpone spraying operations');
    }

    return recommendations;
  }

  getImmediateIrrigationAdvice(weather, cropType) {
    if (weather.temperature > 35 && weather.humidity < 50) {
      return {
        action: 'irrigate_now',
        reason: 'High temperature and low humidity detected',
        amount: 'full_irrigation'
      };
    } else if (weather.temperature > 30) {
      return {
        action: 'monitor_closely',
        reason: 'Moderate stress conditions',
        amount: 'light_irrigation'
      };
    }

    return {
      action: 'normal_schedule',
      reason: 'Weather conditions are suitable',
      amount: 'scheduled_irrigation'
    };
  }

  getWeeklyIrrigationPlan(forecasts, cropType, farmSize) {
    return forecasts.map(day => ({
      date: day.date,
      irrigationNeeded: day.precipitation < 5 && day.tempMax > 30,
      amount: this.calculateDailyWaterNeed(day, cropType, farmSize),
      timing: day.tempMax > 35 ? 'early_morning_evening' : 'morning'
    }));
  }

  calculateWaterRequirement(cropType, farmSize, weather) {
    // Simplified water requirement calculation
    const baseRequirement = {
      'rice': 1500,
      'wheat': 500,
      'cotton': 800,
      'tomato': 600
    };

    const cropBase = baseRequirement[cropType.toLowerCase()] || 600;
    const temperatureFactor = weather.temperature > 30 ? 1.2 : 1.0;
    const humidityFactor = weather.humidity < 50 ? 1.1 : 1.0;

    return {
      dailyRequirement: Math.round(cropBase * temperatureFactor * humidityFactor * farmSize),
      unit: 'liters',
      factors: {
        temperature: temperatureFactor,
        humidity: humidityFactor,
        cropType: cropBase
      }
    };
  }

  getOptimalIrrigationTiming(current, forecasts) {
    const recommendations = [];

    if (current.temperature > 35) {
      recommendations.push({
        time: '05:00-07:00',
        reason: 'Early morning irrigation to minimize evaporation'
      });
      recommendations.push({
        time: '18:00-20:00',
        reason: 'Evening irrigation when temperatures are cooler'
      });
    } else {
      recommendations.push({
        time: '06:00-09:00',
        reason: 'Morning irrigation for optimal water absorption'
      });
    }

    return recommendations;
  }

  calculateDailyWaterNeed(day, cropType, farmSize) {
    const baseNeed = 25; // liters per square meter
    const tempFactor = day.tempMax > 30 ? 1.2 : 1.0;
    const rainReduction = day.precipitation > 10 ? 0.5 : 1.0;

    return Math.round(baseNeed * farmSize * 4047 * tempFactor * rainReduction); // 4047 sq meters per acre
  }
}

module.exports = new WeatherService();
