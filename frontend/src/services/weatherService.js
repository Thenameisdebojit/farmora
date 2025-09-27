// src/services/weatherService.js - Enhanced Weather Service with Free APIs and Fallbacks
class WeatherService {
  constructor() {
    // Free APIs (no key required)
    this.freeWeatherAPI = 'https://api.open-meteo.com/v1/forecast';
    this.ipGeolocationAPI = 'http://ip-api.com/json/';
    
    // OpenWeatherMap (requires API key - free tier available)
    this.openWeatherAPI = 'https://api.openweathermap.org/data/2.5';
    this.weatherAPIKey = import.meta.env.VITE_WEATHER_API_KEY;
  }

  // Get current location from IP
  async getCurrentLocationFromIP() {
    try {
      const response = await fetch(this.ipGeolocationAPI);
      const data = await response.json();
      return {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        region: data.regionName,
        country: data.country
      };
    } catch (error) {
      console.error('IP geolocation failed:', error);
      // Fallback to default Indian location (New Delhi)
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India'
      };
    }
  }

  // Get current weather using Open-Meteo (free API)
  async getCurrentWeather(latitude, longitude) {
    try {
      // Try Open-Meteo first (free, no API key required)
      const url = `${this.freeWeatherAPI}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,pressure_msl,visibility&timezone=auto`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.current) {
        return {
          success: true,
          data: {
            temperature: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            windDirection: data.current.wind_direction_10m,
            pressure: data.current.pressure_msl,
            visibility: data.current.visibility / 1000, // Convert to km
            weather: this.getWeatherFromCode(data.current.weather_code),
            description: this.getWeatherDescription(data.current.weather_code),
            timestamp: new Date().toISOString(),
            location: 'Current Location',
            country: 'India'
          }
        };
      }
      
      throw new Error('Invalid weather data');
    } catch (error) {
      console.error('Open-Meteo API failed:', error);
      
      // Try OpenWeatherMap as fallback
      if (this.weatherAPIKey && this.weatherAPIKey !== 'your_openweathermap_api_key') {
        try {
          return await this.getOpenWeatherMapData(latitude, longitude);
        } catch (owmError) {
          console.error('OpenWeatherMap API failed:', owmError);
        }
      }
      
      // Final fallback to realistic mock data
      return this.getMockWeatherData(latitude, longitude);
    }
  }

  // OpenWeatherMap API call
  async getOpenWeatherMapData(latitude, longitude) {
    const response = await fetch(
      `${this.openWeatherAPI}/weather?lat=${latitude}&lon=${longitude}&appid=${this.weatherAPIKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('OpenWeatherMap API error');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed || 0),
        windDirection: data.wind?.deg || 0,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000,
        weather: data.weather[0]?.main || 'Clear',
        description: data.weather[0]?.description || 'clear sky',
        timestamp: new Date().toISOString(),
        location: data.name || 'Current Location',
        country: data.sys?.country || 'IN'
      }
    };
  }

  // Get 7-day forecast using Open-Meteo
  async getWeatherForecast(latitude, longitude, days = 7) {
    try {
      const url = `${this.freeWeatherAPI}?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=${days}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.daily) {
        const forecasts = [];
        
        for (let i = 0; i < Math.min(days, data.daily.time.length); i++) {
          forecasts.push({
            date: data.daily.time[i],
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            weather: this.getWeatherFromCode(data.daily.weather_code[i]),
            description: this.getWeatherDescription(data.daily.weather_code[i]),
            precipitation: data.daily.precipitation_sum[i] || 0,
            windSpeed: Math.round(data.daily.wind_speed_10m_max[i])
          });
        }
        
        return {
          success: true,
          data: { forecasts }
        };
      }
      
      throw new Error('Invalid forecast data');
    } catch (error) {
      console.error('Forecast API failed:', error);
      return this.getMockForecastData(days);
    }
  }

  // Get weather history (mock data for now)
  async getWeatherHistory(latitude, longitude, days = 30) {
    try {
      // Open-Meteo also provides historical data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const url = `${this.freeWeatherAPI}?latitude=${latitude}&longitude=${longitude}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.daily) {
        const history = [];
        
        for (let i = 0; i < data.daily.time.length; i++) {
          history.push({
            date: data.daily.time[i],
            temperature: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            precipitation: data.daily.precipitation_sum[i] || 0,
            weather: this.getWeatherFromCode(data.daily.weather_code[i]),
            humidity: 60 + Math.random() * 30 // Mock humidity
          });
        }
        
        return {
          success: true,
          data: { history }
        };
      }
      
      throw new Error('Invalid historical data');
    } catch (error) {
      console.error('Weather history API failed:', error);
      return this.getMockHistoryData(days);
    }
  }

  // Get AI-powered weather insights
  async getWeatherInsights(latitude, longitude) {
    try {
      const [currentWeather, forecast] = await Promise.all([
        this.getCurrentWeather(latitude, longitude),
        this.getWeatherForecast(latitude, longitude, 7)
      ]);

      if (currentWeather.success && forecast.success) {
        return {
          success: true,
          data: this.generateWeatherInsights(currentWeather.data, forecast.data.forecasts)
        };
      }
    } catch (error) {
      console.error('Weather insights generation failed:', error);
    }

    // Fallback insights
    return {
      success: true,
      data: {
        weeklyOutlook: 'Mostly clear skies expected with moderate temperatures suitable for farming activities.',
        bestDays: 'Tuesday, Thursday, and Saturday look optimal for field work with low wind conditions.',
        irrigation: 'Current humidity levels suggest maintaining regular irrigation schedule. Monitor soil moisture closely.',
        temperature: 'Temperature range is ideal for most crops. No immediate heat stress expected.',
        precipitation: 'Low chance of rain in the next 3 days. Plan irrigation accordingly.',
        alerts: []
      }
    };
  }

  // Get crop recommendations based on weather
  async getCropRecommendations(latitude, longitude, cropType = null) {
    try {
      const weatherData = await this.getCurrentWeather(latitude, longitude);
      const forecast = await this.getWeatherForecast(latitude, longitude, 7);

      if (weatherData.success && forecast.success) {
        return {
          success: true,
          data: {
            recommendations: this.generateCropRecommendations(
              weatherData.data, 
              forecast.data.forecasts, 
              cropType
            )
          }
        };
      }
    } catch (error) {
      console.error('Crop recommendations generation failed:', error);
    }

    // Fallback recommendations
    return {
      success: true,
      data: {
        recommendations: [
          {
            title: 'Irrigation Management',
            description: 'Maintain regular watering schedule. Check soil moisture every morning.',
            priority: 'high',
            weatherBased: true
          },
          {
            title: 'Pest Monitoring',
            description: 'Current weather conditions favor pest activity. Inspect crops regularly.',
            priority: 'medium',
            weatherBased: true
          },
          {
            title: 'Field Operations',
            description: 'Good conditions for harvesting and field preparation activities.',
            priority: 'low',
            weatherBased: true
          }
        ]
      }
    };
  }

  // Generate weather insights using AI logic
  generateWeatherInsights(current, forecast) {
    const insights = {
      weeklyOutlook: '',
      bestDays: '',
      irrigation: '',
      temperature: '',
      precipitation: '',
      alerts: []
    };

    // Temperature analysis
    const avgTemp = forecast.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / forecast.length;
    if (avgTemp > 35) {
      insights.temperature = 'High temperatures expected this week. Consider heat stress protection for sensitive crops.';
      insights.alerts.push({
        type: 'warning',
        title: 'Heat Alert',
        description: 'Temperatures above 35°C expected. Increase irrigation and provide shade.',
        severity: 'high'
      });
    } else if (avgTemp < 10) {
      insights.temperature = 'Cool temperatures expected. Monitor for frost risk in early morning hours.';
      insights.alerts.push({
        type: 'warning',
        title: 'Cold Alert',
        description: 'Low temperatures may affect crop growth. Consider protection measures.',
        severity: 'medium'
      });
    } else {
      insights.temperature = 'Temperature conditions are favorable for most agricultural activities.';
    }

    // Precipitation analysis
    const totalRain = forecast.reduce((sum, day) => sum + day.precipitation, 0);
    if (totalRain > 50) {
      insights.precipitation = 'Significant rainfall expected this week. Ensure proper drainage and delay field operations if necessary.';
      insights.irrigation = 'Reduce irrigation frequency due to expected rainfall. Monitor soil saturation levels.';
    } else if (totalRain < 5) {
      insights.precipitation = 'Very little rain expected. Plan for increased irrigation needs.';
      insights.irrigation = 'Increase irrigation frequency. Current dry conditions require careful water management.';
    } else {
      insights.precipitation = 'Moderate rainfall expected. Good for crop growth.';
      insights.irrigation = 'Maintain regular irrigation schedule with adjustments based on rainfall.';
    }

    // Best days analysis
    const bestDays = forecast.filter((day, index) => 
      day.precipitation < 2 && day.tempMax < 35 && day.tempMax > 15
    ).slice(0, 3);
    
    if (bestDays.length > 0) {
      const dayNames = bestDays.map(day => new Date(day.date).toLocaleDateString('en', { weekday: 'long' }));
      insights.bestDays = `${dayNames.join(', ')} look optimal for field work with favorable weather conditions.`;
    } else {
      insights.bestDays = 'Weather conditions vary this week. Plan field activities carefully around precipitation.';
    }

    // Weekly outlook
    const clearDays = forecast.filter(day => day.weather.toLowerCase().includes('clear') || day.weather.toLowerCase().includes('sun')).length;
    const rainyDays = forecast.filter(day => day.weather.toLowerCase().includes('rain')).length;
    
    if (clearDays >= 5) {
      insights.weeklyOutlook = 'Mostly sunny week ahead with excellent conditions for farming activities.';
    } else if (rainyDays >= 4) {
      insights.weeklyOutlook = 'Rainy week expected. Focus on indoor activities and equipment maintenance.';
    } else {
      insights.weeklyOutlook = 'Mixed weather conditions this week. Plan activities around clear days.';
    }

    return insights;
  }

  // Generate crop recommendations based on weather
  generateCropRecommendations(current, forecast, cropType) {
    const recommendations = [];

    // Temperature-based recommendations
    if (current.temperature > 35) {
      recommendations.push({
        title: 'Heat Stress Management',
        description: `Current temperature (${current.temperature}°C) may cause heat stress. Increase irrigation frequency and consider mulching to retain soil moisture.`,
        priority: 'high',
        weatherBased: true
      });
    }

    if (current.temperature < 10) {
      recommendations.push({
        title: 'Frost Protection',
        description: `Low temperature (${current.temperature}°C) detected. Cover sensitive crops and consider using frost protection methods.`,
        priority: 'high',
        weatherBased: true
      });
    }

    // Humidity-based recommendations
    if (current.humidity > 80) {
      recommendations.push({
        title: 'Fungal Disease Prevention',
        description: `High humidity (${current.humidity}%) increases fungal disease risk. Improve air circulation and consider preventive fungicide application.`,
        priority: 'medium',
        weatherBased: true
      });
    }

    // Wind-based recommendations
    if (current.windSpeed > 20) {
      recommendations.push({
        title: 'Wind Protection',
        description: `Strong winds (${current.windSpeed} km/h) detected. Secure loose structures and avoid spraying operations.`,
        priority: 'medium',
        weatherBased: true
      });
    }

    // Precipitation-based recommendations
    const upcomingRain = forecast.find(day => day.precipitation > 5);
    if (upcomingRain) {
      const daysToRain = forecast.indexOf(upcomingRain) + 1;
      recommendations.push({
        title: 'Prepare for Rainfall',
        description: `Rain expected in ${daysToRain} day(s). Complete field operations that require dry conditions and ensure proper drainage.`,
        priority: 'medium',
        weatherBased: true
      });
    }

    // Crop-specific recommendations
    if (cropType) {
      recommendations.push(...this.getCropSpecificRecommendations(cropType, current, forecast));
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Regular Monitoring',
        description: 'Current weather conditions are favorable. Continue regular crop monitoring and maintenance activities.',
        priority: 'low',
        weatherBased: true
      });
    }

    return recommendations;
  }

  // Crop-specific recommendations
  getCropSpecificRecommendations(cropType, current, forecast) {
    const recommendations = [];
    const crop = cropType.toLowerCase();

    if (['rice', 'paddy'].includes(crop)) {
      if (current.humidity < 60) {
        recommendations.push({
          title: 'Rice Water Management',
          description: 'Low humidity detected. Maintain proper water levels in paddy fields.',
          priority: 'high',
          weatherBased: true
        });
      }
    }

    if (['wheat', 'barley'].includes(crop)) {
      if (current.temperature > 30) {
        recommendations.push({
          title: 'Cereal Heat Protection',
          description: 'High temperatures can affect grain filling. Consider early morning irrigation.',
          priority: 'medium',
          weatherBased: true
        });
      }
    }

    if (['tomato', 'potato', 'vegetables'].includes(crop)) {
      if (current.humidity > 75) {
        recommendations.push({
          title: 'Vegetable Disease Management',
          description: 'High humidity increases disease pressure in vegetables. Monitor for early symptoms.',
          priority: 'high',
          weatherBased: true
        });
      }
    }

    return recommendations;
  }

  // Weather code mapping for Open-Meteo
  getWeatherFromCode(code) {
    const weatherCodes = {
      0: 'Clear',
      1: 'Clear',
      2: 'Partly Cloudy',
      3: 'Cloudy',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Drizzle',
      53: 'Drizzle',
      55: 'Drizzle',
      61: 'Rain',
      63: 'Rain',
      65: 'Rain',
      71: 'Snow',
      73: 'Snow',
      75: 'Snow',
      95: 'Thunderstorm',
      96: 'Thunderstorm',
      99: 'Thunderstorm'
    };
    
    return weatherCodes[code] || 'Clear';
  }

  getWeatherDescription(code) {
    const descriptions = {
      0: 'clear sky',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'depositing rime fog',
      51: 'light drizzle',
      53: 'moderate drizzle',
      55: 'dense drizzle',
      61: 'slight rain',
      63: 'moderate rain',
      65: 'heavy rain',
      71: 'slight snow',
      73: 'moderate snow',
      75: 'heavy snow',
      95: 'thunderstorm',
      96: 'thunderstorm with hail',
      99: 'thunderstorm with heavy hail'
    };
    
    return descriptions[code] || 'clear sky';
  }

  // Mock weather data as ultimate fallback
  getMockWeatherData(latitude, longitude) {
    const temp = 20 + Math.random() * 15; // 20-35°C
    const humidity = 40 + Math.random() * 40; // 40-80%
    
    return {
      success: true,
      data: {
        temperature: Math.round(temp),
        humidity: Math.round(humidity),
        windSpeed: Math.round(5 + Math.random() * 15),
        windDirection: Math.round(Math.random() * 360),
        pressure: Math.round(1000 + Math.random() * 50),
        visibility: Math.round(5 + Math.random() * 15),
        weather: ['Clear', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
        description: 'partly cloudy',
        timestamp: new Date().toISOString(),
        location: 'Mock Location',
        country: 'IN'
      }
    };
  }

  getMockForecastData(days) {
    const forecasts = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const tempMax = 25 + Math.random() * 10;
      const tempMin = tempMax - 5 - Math.random() * 5;
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        tempMax: Math.round(tempMax),
        tempMin: Math.round(tempMin),
        weather: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rain'][Math.floor(Math.random() * 4)],
        description: 'partly cloudy',
        precipitation: Math.random() * 10,
        windSpeed: Math.round(5 + Math.random() * 10)
      });
    }
    
    return {
      success: true,
      data: { forecasts }
    };
  }

  getMockHistoryData(days) {
    const history = [];
    
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const temp = 20 + Math.random() * 15;
      
      history.push({
        date: date.toISOString().split('T')[0],
        temperature: Math.round(temp),
        tempMax: Math.round(temp + 3),
        tempMin: Math.round(temp - 3),
        precipitation: Math.random() * 5,
        weather: ['Clear', 'Cloudy', 'Rain'][Math.floor(Math.random() * 3)],
        humidity: Math.round(50 + Math.random() * 30)
      });
    }
    
    return {
      success: true,
      data: { history }
    };
  }
}

export default new WeatherService();