// src/components/Dashboard/EnhancedDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Sprout,
  Bug,
  MessageCircle,
  Video,
  Bell,
  Activity,
  Calendar,
  BarChart3,
  Zap,
  Users,
  Target,
  Leaf,
  DollarSign,
  RefreshCw,
  Maximize2,
  Plus
} from 'lucide-react';

// Services
import apiService from '../../services/api';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

// Styles
import './EnhancedDashboard.css';

const EnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    crops: [],
    marketPrices: [],
    notifications: [],
    irrigation: null,
    consultations: [],
    pestAlerts: [],
    aiInsights: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [activeWidgets, setActiveWidgets] = useState([
    'weather', 'crops', 'market', 'notifications', 'irrigation', 'ai-insights'
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const updateInterval = useRef(null);

  useEffect(() => {
    initializeDashboard();
    setupRealTimeUpdates();

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [user]);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      await loadDashboardData();
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    const location = user?.location || { latitude: 20.2961, longitude: 85.8245 };
    
    try {
      // Load all dashboard data in parallel
      const [
        weatherResponse,
        advisoryResponse,
        marketResponse,
        notificationsResponse,
        consultationsResponse,
        aiInsightsResponse
      ] = await Promise.allSettled([
        apiService.getCurrentWeather(location.latitude, location.longitude),
        apiService.getPersonalizedAdvisory({
          cropType: user?.currentCrop || 'wheat',
          location: location
        }),
        apiService.getCurrentMarketPrices({ location: location.state }),
        notificationService.getLocalNotifications(),
        apiService.getUserConsultations(user?.id),
        apiService.getSmartRecommendations(user?.id)
      ]);

      // Process responses and handle errors gracefully
      setDashboardData({
        weather: weatherResponse.status === 'fulfilled' ? weatherResponse.value.data : generateMockWeatherData(),
        crops: generateMockCropData(),
        marketPrices: marketResponse.status === 'fulfilled' ? marketResponse.value.data : generateMockMarketData(),
        notifications: notificationsResponse.status === 'fulfilled' ? notificationsResponse.value.slice(0, 5) : [],
        irrigation: generateMockIrrigationData(),
        consultations: consultationsResponse.status === 'fulfilled' ? consultationsResponse.value : [],
        pestAlerts: generateMockPestAlerts(),
        aiInsights: aiInsightsResponse.status === 'fulfilled' ? aiInsightsResponse.value.data : generateMockAIInsights()
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data as fallback
      setDashboardData({
        weather: generateMockWeatherData(),
        crops: generateMockCropData(),
        marketPrices: generateMockMarketData(),
        notifications: [],
        irrigation: generateMockIrrigationData(),
        consultations: [],
        pestAlerts: generateMockPestAlerts(),
        aiInsights: generateMockAIInsights()
      });
    }
  };

  const setupRealTimeUpdates = () => {
    // Set up periodic data refresh every 5 minutes
    updateInterval.current = setInterval(() => {
      loadDashboardData();
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);

    // Setup notification listener
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'message') {
        loadDashboardData();
      }
    });

    return () => {
      unsubscribe();
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const navigateToFeature = (path) => {
    navigate(path);
  };

  // Mock data generators for fallback
  const generateMockWeatherData = () => ({
    temperature: 28,
    humidity: 78,
    windSpeed: 12,
    pressure: 1013,
    weather: 'Partly Cloudy',
    feelsLike: 32,
    uvIndex: 6
  });

  const generateMockCropData = () => [
    {
      id: 1,
      name: 'Wheat',
      stage: 'Flowering',
      health: 85,
      area: 2.5,
      expectedYield: '2.8 tons/ha',
      daysToHarvest: 45,
      status: 'healthy'
    },
    {
      id: 2,
      name: 'Rice',
      stage: 'Vegetative',
      health: 92,
      area: 1.8,
      expectedYield: '3.2 tons/ha',
      daysToHarvest: 78,
      status: 'excellent'
    }
  ];

  const generateMockMarketData = () => [
    { crop: 'Wheat', price: 2100, change: 5.2, trend: 'up' },
    { crop: 'Rice', price: 1850, change: -2.1, trend: 'down' },
    { crop: 'Cotton', price: 5200, change: 8.7, trend: 'up' }
  ];

  const generateMockIrrigationData = () => ({
    status: 'optimal',
    soilMoisture: 68,
    nextScheduled: new Date(Date.now() + 6 * 60 * 60 * 1000),
    waterUsage: 12.5,
    efficiency: 94
  });

  const generateMockPestAlerts = () => [
    {
      id: 1,
      type: 'Aphids',
      severity: 'medium',
      crop: 'Wheat',
      detected: new Date(Date.now() - 2 * 60 * 60 * 1000),
      action: 'Apply neem oil spray'
    }
  ];

  const generateMockAIInsights = () => ({
    recommendations: [
      'Consider early irrigation for wheat crop',
      'Market prices for rice are declining - consider storage',
      'Weather conditions favor pest activity - monitor closely'
    ],
    confidence: 0.89,
    priority: 'high'
  });

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-500';
    if (health >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <div className="enhanced-dashboard loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your farm dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name || 'Farmer'}!</h1>
          <p className="subtitle">Here's what's happening on your farm today</p>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {formatTime(lastUpdated)}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
          >
            <RefreshCw className="refresh-icon" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon weather">
            <Thermometer />
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData.weather?.temperature}°C</span>
            <span className="stat-label">Temperature</span>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigateToFeature('/weather')}
          >
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon crop">
            <Sprout />
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData.crops.length}</span>
            <span className="stat-label">Active Crops</span>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigateToFeature('/advisory')}
          >
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon irrigation">
            <Droplets />
          </div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData.irrigation?.soilMoisture}%</span>
            <span className="stat-label">Soil Moisture</span>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigateToFeature('/irrigation')}
          >
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon market">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <span className="stat-value">₹{dashboardData.marketPrices[0]?.price}</span>
            <span className="stat-label">Wheat Price</span>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigateToFeature('/market')}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Weather Widget */}
        <motion.div 
          className="dashboard-widget weather-widget"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="widget-header">
            <div className="widget-title">
              <Cloud className="widget-icon" />
              <h3>Weather Overview</h3>
            </div>
            <button 
              className="widget-action"
              onClick={() => navigateToFeature('/weather')}
            >
              View Details
            </button>
          </div>
          <div className="weather-content">
            <div className="weather-main">
              <div className="temperature">
                {dashboardData.weather?.temperature}°C
              </div>
              <div className="weather-info">
                <p>{dashboardData.weather?.weather}</p>
                <p>Feels like {dashboardData.weather?.feelsLike}°C</p>
              </div>
            </div>
            <div className="weather-metrics">
              <div className="metric">
                <Droplets size={16} />
                <span>{dashboardData.weather?.humidity}%</span>
              </div>
              <div className="metric">
                <Wind size={16} />
                <span>{dashboardData.weather?.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Crop Status Widget */}
        <motion.div 
          className="dashboard-widget crop-widget"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="widget-header">
            <div className="widget-title">
              <Sprout className="widget-icon" />
              <h3>Crop Status</h3>
            </div>
            <button 
              className="widget-action"
              onClick={() => navigateToFeature('/advisory')}
            >
              Manage Crops
            </button>
          </div>
          <div className="crop-content">
            {dashboardData.crops.map((crop, index) => (
              <div key={crop.id} className="crop-item">
                <div className="crop-info">
                  <h4>{crop.name}</h4>
                  <p className="crop-stage">{crop.stage}</p>
                  <div className="crop-metrics">
                    <span className={`health ${getHealthColor(crop.health)}`}>
                      {crop.health}% Health
                    </span>
                    <span className="area">{crop.area} ha</span>
                  </div>
                </div>
                <div className="crop-status">
                  <div className={`status-indicator ${crop.status}`}></div>
                  <span className="harvest-days">{crop.daysToHarvest} days</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Market Prices Widget */}
        <motion.div 
          className="dashboard-widget market-widget"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="widget-header">
            <div className="widget-title">
              <BarChart3 className="widget-icon" />
              <h3>Market Prices</h3>
            </div>
            <button 
              className="widget-action"
              onClick={() => navigateToFeature('/market')}
            >
              View Market
            </button>
          </div>
          <div className="market-content">
            {dashboardData.marketPrices.map((item, index) => {
              const TrendIcon = getTrendIcon(item.trend);
              return (
                <div key={index} className="market-item">
                  <div className="market-info">
                    <h4>{item.crop}</h4>
                    <p className="price">₹{item.price}/quintal</p>
                  </div>
                  <div className={`trend ${item.trend}`}>
                    <TrendIcon size={16} />
                    <span>{Math.abs(item.change)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Irrigation Widget */}
        <motion.div 
          className="dashboard-widget irrigation-widget"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="widget-header">
            <div className="widget-title">
              <Droplets className="widget-icon" />
              <h3>Irrigation Status</h3>
            </div>
            <button 
              className="widget-action"
              onClick={() => navigateToFeature('/irrigation')}
            >
              Manage
            </button>
          </div>
          <div className="irrigation-content">
            <div className="irrigation-status">
              <div className={`status-indicator ${dashboardData.irrigation?.status}`}></div>
              <span className="status-text">{dashboardData.irrigation?.status}</span>
            </div>
            <div className="irrigation-metrics">
              <div className="metric">
                <span className="label">Soil Moisture</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${dashboardData.irrigation?.soilMoisture}%` }}
                  ></div>
                </div>
                <span className="value">{dashboardData.irrigation?.soilMoisture}%</span>
              </div>
              <div className="metric">
                <span className="label">Next Irrigation</span>
                <span className="value">
                  {formatTime(dashboardData.irrigation?.nextScheduled)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Insights Widget */}
        <motion.div 
          className="dashboard-widget ai-widget"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="widget-header">
            <div className="widget-title">
              <Zap className="widget-icon" />
              <h3>AI Insights</h3>
            </div>
            <button 
              className="widget-action"
              onClick={() => navigateToFeature('/chat')}
            >
              Ask AI
            </button>
          </div>
          <div className="ai-content">
            {dashboardData.aiInsights?.recommendations.map((rec, index) => (
              <div key={index} className="insight-item">
                <div className="insight-icon">
                  <Target size={16} />
                </div>
                <p>{rec}</p>
              </div>
            ))}
            <div className="confidence-indicator">
              <span>AI Confidence: {Math.round(dashboardData.aiInsights?.confidence * 100)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Widget */}
        <motion.div 
          className="dashboard-widget actions-widget"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="widget-header">
            <div className="widget-title">
              <Plus className="widget-icon" />
              <h3>Quick Actions</h3>
            </div>
          </div>
          <div className="actions-content">
            <button 
              className="action-btn"
              onClick={() => navigateToFeature('/chat')}
            >
              <MessageCircle size={20} />
              <span>Ask AI Assistant</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigateToFeature('/consultation')}
            >
              <Video size={20} />
              <span>Book Expert Call</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigateToFeature('/pest-detection')}
            >
              <Bug size={20} />
              <span>Detect Pest</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigateToFeature('/weather')}
            >
              <Sun size={20} />
              <span>Weather Forecast</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;