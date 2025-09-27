// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5000/api/ai';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('farmora_token') || localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear all auth data
          localStorage.removeItem('farmora_token');
          localStorage.removeItem('farmora_user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Weather services
  async getCurrentWeather(latitude, longitude) {
    try {
      console.log('Fetching real weather data for:', latitude, longitude);
      
      // First try backend API
      try {
        const response = await this.api.get('/weather/current', {
          params: { latitude, longitude }
        });
        console.log('Backend weather API response:', response.data);
        return response.data;
      } catch (backendError) {
        console.log('Backend weather API unavailable, trying direct OpenWeatherMap API');
        
        // Fallback to direct OpenWeatherMap API call
        if (WEATHER_API_KEY && WEATHER_API_KEY !== 'your_openweathermap_api_key') {
          const directResponse = await fetch(
            `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          );
          
          if (directResponse.ok) {
            const weatherData = await directResponse.json();
            return {
              success: true,
              data: {
                temperature: weatherData.main.temp,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind?.speed || 0,
                pressure: weatherData.main.pressure,
                visibility: weatherData.visibility,
                weather: weatherData.weather[0]?.main || 'Clear',
                description: weatherData.weather[0]?.description || 'clear sky',
                timestamp: new Date().toISOString(),
                location: weatherData.name,
                country: weatherData.sys.country
              }
            };
          }
        }
        
        throw new Error('No weather data available');
      }
    } catch (error) {
      console.error('All weather APIs failed:', error.message);
      throw new Error('Unable to fetch weather data. Please check your API configuration.');
    }
  }

  async getWeatherForecast(latitude, longitude, days = 7) {
    try {
      console.log('Fetching real forecast data for:', latitude, longitude, days);
      
      // First try backend API
      try {
        const response = await this.api.get('/weather/forecast', {
          params: { latitude, longitude, days }
        });
        console.log('Backend forecast API response:', response.data);
        return response.data;
      } catch (backendError) {
        console.log('Backend forecast API unavailable, trying direct OpenWeatherMap API');
        
        // Fallback to direct OpenWeatherMap API call
        if (WEATHER_API_KEY && WEATHER_API_KEY !== 'your_openweathermap_api_key') {
          const directResponse = await fetch(
            `${WEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&cnt=${Math.min(days * 8, 40)}`
          );
          
          if (directResponse.ok) {
            const forecastData = await directResponse.json();
            const forecasts = [];
            
            // Group forecast data by day
            const dailyForecasts = {};
            forecastData.list.forEach(item => {
              const date = new Date(item.dt * 1000).toDateString();
              if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                  temps: [],
                  weather: item.weather[0],
                  precipitation: item.rain?.['3h'] || 0,
                  date: item.dt * 1000
                };
              }
              dailyForecasts[date].temps.push(item.main.temp);
            });
            
            // Convert to forecast format
            Object.values(dailyForecasts).slice(0, days).forEach(dayData => {
              forecasts.push({
                date: new Date(dayData.date).toISOString(),
                tempMax: Math.round(Math.max(...dayData.temps)),
                tempMin: Math.round(Math.min(...dayData.temps)),
                weather: dayData.weather.main,
                description: dayData.weather.description,
                precipitation: dayData.precipitation
              });
            });
            
            return {
              success: true,
              data: { forecasts }
            };
          }
        }
        
        throw new Error('No forecast data available');
      }
    } catch (error) {
      console.error('All forecast APIs failed:', error.message);
      throw new Error('Unable to fetch forecast data. Please check your API configuration.');
    }
  }

  async getWeatherAlerts(latitude, longitude) {
    const response = await this.api.get('/weather/alerts', {
      params: { lat: latitude, lon: longitude }
    });
    return response.data;
  }

  async getFarmingWeatherAdvisory(latitude, longitude, cropType) {
    const response = await this.api.get('/weather/farming-advisory', {
      params: { lat: latitude, lon: longitude, cropType }
    });
    return response.data;
  }

  // Advisory services
  async getPersonalizedAdvisory(params) {
    try {
      const response = await this.api.get('/advisory/personalized', { params });
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: {
          advisory: {
            title: 'Current Crop Advisory for ' + (params.cropType || 'Wheat'),
            recommendations: [
              'Monitor soil moisture levels regularly',
              'Apply fertilizer according to growth stage',
              'Check for pest activity in the morning',
              'Ensure proper drainage in fields'
            ],
            priority: 'medium',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      };
    }
  }

  async getCropRecommendations(params) {
    const response = await this.api.get('/advisory/crop-recommendations', { params });
    return response.data;
  }

  async getFertilizerRecommendations(data) {
    const response = await this.api.post('/advisory/fertilizer-recommendations', data);
    return response.data;
  }

  async saveAdvisoryFeedback(data) {
    const response = await this.api.post('/advisory/feedback', data);
    return response.data;
  }

  // Market services
  async getCurrentMarketPrices(params) {
    const response = await this.api.get('/market/prices', { params });
    return response.data;
  }

  async getMarketTrends(params) {
    const response = await this.api.get('/market/trends', { params });
    return response.data;
  }

  async getPricePredictions(params) {
    const response = await this.api.get('/market/predictions', { params });
    return response.data;
  }

  async setPriceAlert(data) {
    const response = await this.api.post('/market/price-alert', data);
    return response.data;
  }

  // Pest detection services
  async detectPest(imageFile, cropType) {
    const formData = new FormData();
    formData.append('pestImage', imageFile);
    formData.append('cropType', cropType);

    const response = await this.api.post('/pest/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getPestInfo(params) {
    const response = await this.api.get('/pest/info', { params });
    return response.data;
  }

  async getTreatmentRecommendations(params) {
    const response = await this.api.get('/pest/treatment', { params });
    return response.data;
  }

  async reportPestOutbreak(data) {
    const response = await this.api.post('/pest/report-outbreak', data);
    return response.data;
  }

  // Irrigation services
  async getIrrigationSchedule(userId) {
    const response = await this.api.get(`/irrigation/schedule/${userId}`);
    return response.data;
  }

  async getSoilMoisture(deviceId) {
    const response = await this.api.get(`/irrigation/soil-moisture/${deviceId}`);
    return response.data;
  }

  async updateIrrigationSettings(deviceId, settings) {
    const response = await this.api.put(`/irrigation/settings/${deviceId}`, settings);
    return response.data;
  }

  async triggerIrrigation(deviceId, duration) {
    const response = await this.api.post(`/irrigation/trigger/${deviceId}`, { duration });
    return response.data;
  }

  async getIrrigationHistory(params) {
    const response = await this.api.get('/irrigation/history', { params });
    return response.data;
  }

  // Consultation services - Real API calls only
  async bookConsultation(data) {
    const response = await this.api.post('/consultation/book', data);
    return response.data;
  }

  async getUserConsultations(userId) {
    const response = await this.api.get(`/consultation/user/${userId}`);
    return response.data;
  }

  async getAvailableExperts(params) {
    const response = await this.api.get('/consultation/experts', { params });
    return response.data;
  }

  async startConsultation(consultationId) {
    const response = await this.api.post(`/consultation/start/${consultationId}`);
    return response.data;
  }

  async endConsultation(consultationId) {
    const response = await this.api.post(`/consultation/end/${consultationId}`);
    return response.data;
  }

  // Real-time signaling for video consultation
  async getSignalingToken(consultationId) {
    const response = await this.api.post(`/consultation/signaling-token/${consultationId}`);
    return response.data;
  }

  async sendSignalingMessage(consultationId, message) {
    const response = await this.api.post(`/consultation/signaling/${consultationId}`, { message });
    return response.data;
  }

  // AI Chat services - Real backend processing
  async sendChatMessage(message, context = {}) {
    const response = await this.api.post('/ai/chat', {
      message,
      context,
      timestamp: new Date().toISOString()
    });
    return response.data;
  }

  async getChatHistory(userId, limit = 50) {
    const response = await this.api.get(`/ai/chat/history/${userId}`, {
      params: { limit }
    });
    return response.data;
  }

  async analyzeCropImage(imageFile, cropType) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('cropType', cropType);
    
    const response = await this.api.post('/ai/analyze-crop', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getAIRecommendations(farmData) {
    const response = await this.api.post('/ai/recommendations', farmData);
    return response.data;
  }

  // Comprehensive Notification services
  
  // Create a new notification
  async createNotification(notificationData) {
    try {
      const response = await this.api.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId, options = {}) {
    try {
      const params = {
        page: options.page || 1,
        limit: options.limit || 20,
        type: options.type,
        read: options.read,
        ...options
      };
      const response = await this.api.get(`/notifications/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get user notifications error:', error);
      return { notifications: [], pagination: {}, success: false };
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      const response = await this.api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  }

  // Mark multiple notifications as read
  async markNotificationsRead(notificationIds) {
    try {
      const response = await this.api.patch('/notifications/bulk-read', { 
        notificationIds 
      });
      return response.data;
    } catch (error) {
      console.error('Bulk mark read error:', error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const response = await this.api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId) {
    try {
      const response = await this.api.get(`/notifications/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get notification preferences error:', error);
      return {
        preferences: {
          email: true,
          sms: false,
          push: true,
          categories: {
            weather: true,
            advisory: true,
            market: true,
            pest: true,
            irrigation: true
          }
        }
      };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await this.api.put(`/notifications/preferences/${userId}`, {
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  // Register FCM token for push notifications
  async registerFCMToken(userId, token, deviceInfo = {}) {
    try {
      const response = await this.api.post('/notifications/register-token', {
        userId,
        token,
        deviceInfo: {
          platform: deviceInfo.platform || 'web',
          version: deviceInfo.version || '1.0.0',
          ...deviceInfo
        }
      });
      return response.data;
    } catch (error) {
      console.error('Register FCM token error:', error);
      throw error;
    }
  }

  // Unregister FCM token
  async unregisterFCMToken(userId, token) {
    try {
      const response = await this.api.delete('/notifications/unregister-token', {
        data: { userId, token }
      });
      return response.data;
    } catch (error) {
      console.error('Unregister FCM token error:', error);
      throw error;
    }
  }

  // Send test notification
  async sendTestNotification(userId, type = 'push') {
    try {
      const response = await this.api.post('/notifications/test', {
        userId,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Send test notification error:', error);
      throw error;
    }
  }

  // Get notification analytics
  async getNotificationAnalytics(userId, params = {}) {
    try {
      const response = await this.api.get(`/notifications/analytics/${userId}`, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get notification analytics error:', error);
      return {
        analytics: {
          totalSent: 0,
          totalRead: 0,
          byType: {},
          byCategory: {},
          readRate: 0,
          deliveryRate: 0
        }
      };
    }
  }

  // Schedule a notification
  async scheduleNotification(notificationData, scheduleTime) {
    try {
      const response = await this.api.post('/notifications/schedule', {
        ...notificationData,
        scheduleTime: scheduleTime.toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Schedule notification error:', error);
      throw error;
    }
  }

  // Get scheduled notifications
  async getScheduledNotifications(userId) {
    try {
      const response = await this.api.get(`/notifications/scheduled/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get scheduled notifications error:', error);
      return { notifications: [] };
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      const response = await this.api.delete(`/notifications/scheduled/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel scheduled notification error:', error);
      throw error;
    }
  }

  // Get notification templates
  async getNotificationTemplates(type = null) {
    try {
      const params = type ? { type } : {};
      const response = await this.api.get('/notifications/templates', { params });
      return response.data;
    } catch (error) {
      console.error('Get notification templates error:', error);
      return { templates: [] };
    }
  }

  // Chatbot services
  async chatWithBot(data) {
    const response = await this.api.post('/chatbot/chat', data);
    return response.data;
  }

  async getChatHistory(params) {
    const response = await this.api.get('/chatbot/history', { params });
    return response.data;
  }

  async getSuggestedQuestions(params) {
    const response = await this.api.get('/chatbot/suggestions', { params });
    return response.data;
  }

  // New AI-powered advisory services
  
  // Chat with advanced AI assistant
  async chatWithAIAssistant(message, userId = null, context = {}) {
    try {
      const response = await this.api.post('/advisory/chat', {
        message,
        userId,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI Chat error:', error);
      return {
        success: false,
        data: {
          response: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
          timestamp: new Date().toISOString(),
          confidence: 0,
          suggestions: ['Try rephrasing your question', 'Check basic crop information']
        }
      };
    }
  }

  // Advanced pest and disease analysis with AI
  async analyzeWithAI(symptoms, images = []) {
    try {
      const response = await this.api.post('/advisory/pest-disease-analysis', {
        symptoms,
        images
      });
      return response.data;
    } catch (error) {
      console.error('AI Pest/Disease analysis error:', error);
      return {
        success: false,
        data: {
          identification: 'Unable to identify specific pest/disease. Please consult local agricultural expert.',
          severity: 'unknown',
          treatment: 'Inspect plants carefully and consider contacting agricultural extension services.',
          management: 'Implement general IPM practices and monitor field regularly.',
          confidence: 0.1,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Generate comprehensive AI-powered crop plan
  async generateAICropPlan({ location, soilType, climate, budget, preferences }) {
    try {
      const response = await this.api.post('/advisory/crop-plan', {
        location,
        soilType,
        climate,
        budget,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('AI Crop planning error:', error);
      return {
        success: false,
        data: {
          recommendedCrops: ['wheat', 'rice', 'vegetables'],
          timeline: 'Consult local agricultural calendar',
          resources: 'Contact local agricultural suppliers',
          fullAnalysis: 'AI analysis temporarily unavailable. Please consult local agricultural extension services.',
          confidence: 0.1,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Get weather-based AI insights
  async getAIWeatherInsights(weatherData, cropInfo) {
    try {
      const response = await this.api.post('/advisory/weather-insights', {
        weatherData,
        cropInfo
      });
      return response.data;
    } catch (error) {
      console.error('AI Weather insights error:', error);
      return {
        success: false,
        data: {
          insights: 'Weather analysis temporarily unavailable. Monitor local weather forecasts and adjust farming activities accordingly.',
          priority: 'medium',
          actions: [
            'Check weather forecast regularly',
            'Adjust irrigation based on rainfall',
            'Protect crops from extreme weather'
          ],
          confidence: 0.1,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Get AI-powered market insights
  async getAIMarketInsights(crops, location) {
    try {
      const response = await this.api.post('/advisory/market-insights', {
        crops,
        location
      });
      return response.data;
    } catch (error) {
      console.error('AI Market insights error:', error);
      return {
        success: false,
        data: {
          analysis: 'Market analysis temporarily unavailable. Please check local market prices and consult with local traders.',
          trends: 'Contact local agricultural market committees for current trends',
          opportunities: ['Explore local markets', 'Consider value addition'],
          risks: ['Price volatility', 'Storage and transportation'],
          recommendations: [
            'Monitor local market prices',
            'Diversify crop portfolio',
            'Build relationships with buyers'
          ],
          confidence: 0.1,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Get general AI insights
  async getAIInsights({ userId, crop, growthStage, issues }) {
    try {
      const response = await this.api.post('/advisory/ai-insights', {
        userId,
        crop,
        growthStage,
        issues
      });
      return response.data;
    } catch (error) {
      console.error('AI General insights error:', error);
      return {
        success: false,
        data: {
          insights: 'Unable to generate AI insights at this time. Please check your connection and try again.',
          confidence: 0,
          source: 'fallback',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Batch AI analysis for multiple features
  async getBatchAIAnalysis({ weatherData, cropInfo, marketData, issues = [] }) {
    try {
      const [weatherInsights, marketInsights, generalInsights] = await Promise.allSettled([
        this.getAIWeatherInsights(weatherData, cropInfo),
        this.getAIMarketInsights(cropInfo?.crops || [], cropInfo?.location),
        this.getAIInsights({ crop: cropInfo, issues })
      ]);

      return {
        success: true,
        data: {
          weather: weatherInsights.status === 'fulfilled' ? weatherInsights.value.data : null,
          market: marketInsights.status === 'fulfilled' ? marketInsights.value.data : null,
          general: generalInsights.status === 'fulfilled' ? generalInsights.value.data : null,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Batch AI analysis error:', error);
      return {
        success: false,
        message: 'Failed to get comprehensive AI analysis',
        data: null
      };
    }
  }

  // Smart recommendations based on current context
  async getSmartRecommendations(userId) {
    try {
      // This could integrate multiple AI services to provide contextual recommendations
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const location = user.location || { latitude: 28.6139, longitude: 77.2090 }; // Default to Delhi
      
      const [weather, insights] = await Promise.allSettled([
        this.getCurrentWeather(location.latitude, location.longitude),
        this.getAIInsights({ 
          userId, 
          crop: user.currentCrop, 
          growthStage: user.currentGrowthStage 
        })
      ]);

      return {
        success: true,
        data: {
          weatherBased: weather.status === 'fulfilled' ? weather.value.data : null,
          aiBased: insights.status === 'fulfilled' ? insights.value.data : null,
          priority: 'high',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Smart recommendations error:', error);
      return {
        success: false,
        data: {
          recommendations: ['Monitor crop health regularly', 'Check weather updates', 'Maintain irrigation schedule'],
          priority: 'medium',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

export default new ApiService();
