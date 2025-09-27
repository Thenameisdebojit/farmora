// src/services/productionWeatherService.js
import api from './api';

class ProductionWeatherService {
  constructor() {
    this.API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
    this.GEO_URL = 'https://api.openweathermap.org/geo/1.0';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get current weather data
  async getCurrentWeather(lat, lon) {
    const cacheKey = `current_${lat}_${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      const processedData = this.processCurrentWeather(data);
      
      this.setCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Current weather fetch error:', error);
      return this.getFallbackCurrentWeather();
    }
  }

  // Get 5-day weather forecast
  async getWeatherForecast(lat, lon) {
    const cacheKey = `forecast_${lat}_${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.statusText}`);
      }

      const data = await response.json();
      const processedData = this.processForecastData(data);
      
      this.setCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Weather forecast fetch error:', error);
      return this.getFallbackForecast();
    }
  }

  // Get air quality data
  async getAirQuality(lat, lon) {
    const cacheKey = `air_quality_${lat}_${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Air quality API error: ${response.statusText}`);
      }

      const data = await response.json();
      const processedData = this.processAirQualityData(data);
      
      this.setCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Air quality fetch error:', error);
      return this.getFallbackAirQuality();
    }
  }

  // Get weather alerts
  async getWeatherAlerts(lat, lon) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/onecall?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&exclude=minutely,hourly,daily`
      );

      if (!response.ok) {
        throw new Error(`Alerts API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Weather alerts fetch error:', error);
      return [];
    }
  }

  // Get location coordinates from city name
  async getCoordinatesFromCity(cityName) {
    try {
      const response = await fetch(
        `${this.GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.length > 0) {
        return {
          lat: data[0].lat,
          lon: data[0].lon,
          name: data[0].name,
          country: data[0].country
        };
      }
      
      throw new Error('Location not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Process current weather data
  processCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility / 1000, // Convert to km
      cloudiness: data.clouds.all,
      weather: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      timestamp: new Date(),
      farmingAdvisory: this.generateFarmingAdvisory(data)
    };
  }

  // Process forecast data
  processForecastData(data) {
    const dailyForecasts = new Map();
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, {
          date: new Date(item.dt * 1000),
          temps: [],
          humidity: [],
          weather: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0
        });
      }
      
      const dayData = dailyForecasts.get(date);
      dayData.temps.push(item.main.temp);
      dayData.humidity.push(item.main.humidity);
    });

    const processedForecast = Array.from(dailyForecasts.values()).slice(0, 5).map(day => ({
      ...day,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      farmingTips: this.generateDailyFarmingTips(day)
    }));

    return {
      location: {
        name: data.city.name,
        country: data.city.country
      },
      forecast: processedForecast
    };
  }

  // Process air quality data
  processAirQualityData(data) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    return {
      aqi,
      quality: this.getAQIDescription(aqi),
      components: {
        co: components.co,
        no2: components.no2,
        o3: components.o3,
        so2: components.so2,
        pm2_5: components.pm2_5,
        pm10: components.pm10
      },
      healthAdvice: this.getHealthAdvice(aqi),
      timestamp: new Date()
    };
  }

  // Generate farming advisory based on weather
  generateFarmingAdvisory(weatherData) {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const weather = weatherData.weather[0].main.toLowerCase();

    let advisory = '';

    // Temperature-based advice
    if (temp < 10) {
      advisory += 'Cold weather detected. Protect sensitive crops from frost. ';
    } else if (temp > 35) {
      advisory += 'High temperature alert. Ensure adequate irrigation and consider shade covers. ';
    } else if (temp >= 20 && temp <= 30) {
      advisory += 'Optimal temperature for most crop activities. ';
    }

    // Weather-based advice
    if (weather.includes('rain')) {
      advisory += 'Rain expected. Good for crops but check drainage systems. Avoid field operations. ';
    } else if (weather.includes('clear')) {
      advisory += 'Clear skies perfect for field work and harvesting. ';
    } else if (weather.includes('cloud')) {
      advisory += 'Cloudy conditions good for transplanting and reducing plant stress. ';
    }

    // Humidity-based advice
    if (humidity > 80) {
      advisory += 'High humidity may promote fungal diseases. Monitor crops closely. ';
    } else if (humidity < 30) {
      advisory += 'Low humidity detected. Increase irrigation frequency. ';
    }

    // Wind-based advice
    if (windSpeed > 10) {
      advisory += 'Strong winds detected. Secure loose structures and avoid spraying. ';
    }

    return advisory.trim() || 'Weather conditions are normal. Continue regular farm activities.';
  }

  // Generate daily farming tips
  generateDailyFarmingTips(dayData) {
    const tips = [];
    
    if (dayData.precipitation > 0) {
      tips.push('Rain expected - postpone irrigation and field spraying');
    }
    
    if (dayData.maxTemp > 35) {
      tips.push('Hot day - water early morning or evening');
    }
    
    if (dayData.avgHumidity > 80) {
      tips.push('High humidity - monitor for plant diseases');
    }
    
    if (dayData.windSpeed > 8) {
      tips.push('Windy conditions - avoid pesticide application');
    }

    return tips.length > 0 ? tips : ['Normal conditions - continue routine farm activities'];
  }

  // Get AQI description
  getAQIDescription(aqi) {
    const descriptions = {
      1: 'Good',
      2: 'Fair',
      3: 'Moderate',
      4: 'Poor',
      5: 'Very Poor'
    };
    return descriptions[aqi] || 'Unknown';
  }

  // Get health advice based on AQI
  getHealthAdvice(aqi) {
    const advice = {
      1: 'Air quality is good. Ideal for all outdoor farm activities.',
      2: 'Air quality is acceptable. Normal outdoor activities are fine.',
      3: 'Moderate air quality. Sensitive individuals should limit prolonged outdoor exposure.',
      4: 'Poor air quality. Limit outdoor activities and wear protective equipment.',
      5: 'Very poor air quality. Avoid outdoor activities when possible.'
    };
    return advice[aqi] || 'Air quality data unavailable.';
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fallback data methods
  getFallbackCurrentWeather() {
    return {
      temperature: 25,
      feelsLike: 27,
      humidity: 60,
      pressure: 1013,
      windSpeed: 5,
      windDirection: 180,
      visibility: 10,
      cloudiness: 20,
      weather: 'Clear',
      description: 'clear sky',
      icon: '01d',
      sunrise: new Date(),
      sunset: new Date(),
      location: {
        name: 'Farm Location',
        country: 'IN',
        coordinates: { lat: 28.6139, lon: 77.2090 }
      },
      timestamp: new Date(),
      farmingAdvisory: 'Weather data temporarily unavailable. Continue normal farm operations.',
      isOffline: true
    };
  }

  getFallbackForecast() {
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        maxTemp: 28 + (Math.random() * 6) - 3,
        minTemp: 18 + (Math.random() * 4) - 2,
        avgHumidity: 60 + (Math.random() * 20) - 10,
        weather: 'Clear',
        description: 'clear sky',
        icon: '01d',
        windSpeed: 5 + (Math.random() * 5),
        precipitation: 0,
        farmingTips: ['Weather data offline - use local observations']
      });
    }

    return {
      location: { name: 'Farm Location', country: 'IN' },
      forecast,
      isOffline: true
    };
  }

  getFallbackAirQuality() {
    return {
      aqi: 2,
      quality: 'Fair',
      components: {
        co: 200,
        no2: 20,
        o3: 60,
        so2: 5,
        pm2_5: 15,
        pm10: 25
      },
      healthAdvice: 'Air quality data temporarily unavailable.',
      timestamp: new Date(),
      isOffline: true
    };
  }

  // Get weather data for user's location
  async getWeatherForUser(user) {
    let lat, lon;

    if (user?.location?.coordinates) {
      lat = user.location.coordinates.latitude;
      lon = user.location.coordinates.longitude;
    } else {
      // Default to Delhi if no location
      lat = 28.6139;
      lon = 77.2090;
    }

    try {
      const [current, forecast, airQuality] = await Promise.allSettled([
        this.getCurrentWeather(lat, lon),
        this.getWeatherForecast(lat, lon),
        this.getAirQuality(lat, lon)
      ]);

      return {
        current: current.status === 'fulfilled' ? current.value : this.getFallbackCurrentWeather(),
        forecast: forecast.status === 'fulfilled' ? forecast.value : this.getFallbackForecast(),
        airQuality: airQuality.status === 'fulfilled' ? airQuality.value : this.getFallbackAirQuality()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return {
        current: this.getFallbackCurrentWeather(),
        forecast: this.getFallbackForecast(),
        airQuality: this.getFallbackAirQuality()
      };
    }
  }
}

// Create singleton instance
const productionWeatherService = new ProductionWeatherService();

export default productionWeatherService;