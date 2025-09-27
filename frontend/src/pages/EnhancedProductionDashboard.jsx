// src/pages/EnhancedProductionDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, TrendingUp, Bug, Droplets, AlertTriangle, CheckCircle, Clock,
  Thermometer, Users, BarChart3, Calendar, MessageCircle, Bell, Eye,
  Leaf, Zap, Activity, Sun, CloudRain, Wind, Gauge, ArrowRight,
  Settings, Home, Smartphone, Wifi, MapPin, Plus, RefreshCw,
  Target, Award, TrendingDown, ChevronRight, Play, BookOpen,
  Camera, Lightbulb, PhoneCall, Video, ChevronDown, ChevronUp,
  ExternalLink, Star, ThumbsUp, Filter, Search, MoreHorizontal,
  Satellite, Database, WifiOff, Signal, Battery
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import productionWeatherService from '../services/productionWeatherService';
import productionMarketService from '../services/productionMarketService';
import productionIoTService from '../services/productionIoTService';

const EnhancedProductionDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    market: null,
    iot: null,
    alerts: [],
    loading: true,
    error: null
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Real-time data subscriptions
  useEffect(() => {
    const unsubscribers = [];
    
    // Subscribe to IoT sensor updates
    const iotUnsub = productionIoTService.subscribeToUpdates('sensor_update', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        sensors: data
      }));
    });
    unsubscribers.push(iotUnsub);

    // Subscribe to alerts
    const alertsUnsub = productionIoTService.subscribeToUpdates('alerts', (alert) => {
      setDashboardData(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts.slice(0, 9)] // Keep last 10 alerts
      }));
    });
    unsubscribers.push(alertsUnsub);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllDashboardData();
  }, [user]);

  const fetchAllDashboardData = useCallback(async () => {
    setRefreshing(true);
    setDashboardData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [weatherData, marketData, iotData] = await Promise.allSettled([
        productionWeatherService.getWeatherForUser(user),
        productionMarketService.getMarketPrices(),
        productionIoTService.getSensorData('all')
      ]);

      // Process results
      const processedData = {
        weather: weatherData.status === 'fulfilled' ? weatherData.value : null,
        market: marketData.status === 'fulfilled' ? marketData.value : null,
        iot: iotData.status === 'fulfilled' ? iotData.value : null,
        alerts: await generateSmartAlerts(weatherData.value, marketData.value, iotData.value),
        loading: false,
        error: null,
        lastUpdated: new Date()
      };

      setDashboardData(processedData);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch dashboard data'
      }));
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Generate smart alerts based on all data sources
  const generateSmartAlerts = async (weather, market, iot) => {
    const alerts = [];
    
    // Weather-based alerts
    if (weather?.current) {
      const { temperature, humidity, weather: weatherType } = weather.current;
      
      if (temperature > 35) {
        alerts.push({
          id: `weather_temp_${Date.now()}`,
          type: 'weather',
          severity: 'high',
          title: 'High Temperature Alert',
          message: `Temperature ${temperature}°C exceeds safe farming range`,
          recommendation: 'Activate irrigation systems and provide crop shading',
          timestamp: new Date(),
          icon: Thermometer,
          color: 'red'
        });
      }
      
      if (weatherType.toLowerCase().includes('rain')) {
        alerts.push({
          id: `weather_rain_${Date.now()}`,
          type: 'weather',
          severity: 'medium',
          title: 'Rainfall Expected',
          message: 'Rain forecasted in next few hours',
          recommendation: 'Postpone field operations and check drainage',
          timestamp: new Date(),
          icon: CloudRain,
          color: 'blue'
        });
      }
    }
    
    // Market-based alerts
    if (market?.data) {
      Object.entries(market.data).forEach(([commodity, data]) => {
        const changePercent = parseFloat(data.changePercent?.replace(/[+%]/g, '') || 0);
        
        if (Math.abs(changePercent) > 5) {
          alerts.push({
            id: `market_${commodity}_${Date.now()}`,
            type: 'market',
            severity: changePercent > 5 ? 'high' : 'medium',
            title: `${commodity.charAt(0).toUpperCase() + commodity.slice(1)} Price ${changePercent > 0 ? 'Surge' : 'Drop'}`,
            message: `Prices ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent)}%`,
            recommendation: changePercent > 5 ? 'Consider selling if harvest ready' : 'Monitor market trends',
            timestamp: new Date(),
            icon: TrendingUp,
            color: changePercent > 0 ? 'green' : 'red'
          });
        }
      });
    }
    
    // IoT-based alerts
    if (iot?.sensors) {
      const { soilMoisture, temperature: sensorTemp, phLevel } = iot.sensors;
      
      if (soilMoisture?.current < 50) {
        alerts.push({
          id: `iot_moisture_${Date.now()}`,
          type: 'irrigation',
          severity: 'high',
          title: 'Low Soil Moisture',
          message: `Soil moisture at ${soilMoisture.current}% - below optimal range`,
          recommendation: 'Start irrigation immediately',
          timestamp: new Date(),
          icon: Droplets,
          color: 'blue'
        });
      }
      
      if (phLevel?.current < 6.0 || phLevel?.current > 7.5) {
        alerts.push({
          id: `iot_ph_${Date.now()}`,
          type: 'soil',
          severity: 'medium',
          title: 'Soil pH Imbalance',
          message: `Soil pH at ${phLevel.current} - outside optimal range`,
          recommendation: 'Consider soil treatment to adjust pH levels',
          timestamp: new Date(),
          icon: Activity,
          color: 'yellow'
        });
      }
    }
    
    return alerts.slice(0, 5); // Return top 5 most critical alerts
  };

  // Smart stats with real-time data integration
  const smartStats = useMemo(() => {
    const stats = [];
    
    // Weather stats
    if (dashboardData.weather?.current) {
      const weather = dashboardData.weather.current;
      stats.push(
        {
          icon: Thermometer,
          label: 'Temperature',
          value: weather.temperature,
          unit: '°C',
          color: 'text-orange-600',
          bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
          trend: weather.feelsLike > weather.temperature ? '+2°C feels like' : null,
          realTime: true
        },
        {
          icon: Droplets,
          label: 'Humidity',
          value: weather.humidity,
          unit: '%',
          color: 'text-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
          trend: weather.humidity > 70 ? 'High' : weather.humidity < 40 ? 'Low' : 'Normal',
          realTime: true
        }
      );
    }
    
    // IoT sensor stats
    if (dashboardData.iot?.sensors || realTimeData.sensors) {
      const sensors = realTimeData.sensors || dashboardData.iot.sensors;
      stats.push(
        {
          icon: Activity,
          label: 'Soil Moisture',
          value: Math.round(sensors.soilMoisture?.current || 0),
          unit: '%',
          color: 'text-green-600',
          bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
          trend: sensors.soilMoisture?.trend || 'stable',
          realTime: true
        },
        {
          icon: Gauge,
          label: 'Soil pH',
          value: sensors.phLevel?.current?.toFixed(1) || 0,
          unit: '',
          color: 'text-purple-600',
          bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
          trend: sensors.phLevel?.trend || 'stable',
          realTime: true
        }
      );
    }
    
    // Device connectivity
    if (dashboardData.iot?.summary) {
      const summary = dashboardData.iot.summary;
      stats.push(
        {
          icon: Wifi,
          label: 'Active Devices',
          value: summary.activeDevices || 0,
          unit: `/${summary.totalDevices || 0}`,
          color: 'text-indigo-600',
          bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
          trend: summary.activeDevices === summary.totalDevices ? 'All Online' : `${summary.totalDevices - summary.activeDevices} Offline`,
          realTime: true
        },
        {
          icon: Battery,
          label: 'Low Battery',
          value: summary.batteryLow || 0,
          unit: ' devices',
          color: 'text-yellow-600',
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          trend: summary.batteryLow === 0 ? 'All Good' : 'Needs Attention',
          realTime: true
        }
      );
    }
    
    return stats;
  }, [dashboardData, realTimeData]);

  // Enhanced quick actions with real functionality
  const enhancedQuickActions = [
    {
      id: 'weather_analysis',
      title: 'Weather Analysis',
      description: 'Detailed forecast & alerts',
      icon: Cloud,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      route: '/weather',
      badge: dashboardData.weather?.current?.isOffline ? 'Offline' : 'Live'
    },
    {
      id: 'market_intelligence',
      title: 'Market Intelligence',
      description: 'Real-time prices & trends',
      icon: TrendingUp,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      route: '/market',
      badge: dashboardData.market?.source === 'offline' ? 'Offline' : 'Live'
    },
    {
      id: 'iot_monitoring',
      title: 'IoT Monitoring',
      description: 'Sensor data & controls',
      icon: Satellite,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      route: '/iot-dashboard',
      badge: dashboardData.iot?.summary?.connectivity === 'simulated' ? 'Simulated' : 'Live'
    },
    {
      id: 'smart_irrigation',
      title: 'Smart Irrigation',
      description: 'Automated water management',
      icon: Droplets,
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      route: '/irrigation',
      badge: 'Auto'
    },
    {
      id: 'crop_health',
      title: 'Crop Health AI',
      description: 'AI-powered diagnostics',
      icon: Leaf,
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      route: '/pest-detection',
      badge: 'AI'
    },
    {
      id: 'expert_consultation',
      title: 'Expert Connect',
      description: 'Video consultations',
      icon: Video,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      route: '/consultation',
      badge: 'Available'
    }
  ];

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const StatCard = ({ icon: Icon, label, value, unit, color, bgColor, trend, realTime, onClick, delay = 0 }) => (
    <motion.div
      className={`${bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-white/50 relative`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {realTime && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-white/70">
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
              {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
            </p>
            {trend && (
              <p className="text-sm text-gray-600 mt-1">{trend}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl font-semibold text-gray-700">Loading Production Dashboard...</h2>
          <p className="text-gray-500 mt-2">Fetching real-time farm data</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Enhanced Header with Real-time Status */}
      <motion.div 
        className="bg-white/70 backdrop-blur-sm border-b border-white/20 sticky top-16 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Smart Farm Dashboard 🌾
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-gray-600 flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {user?.location?.address?.district || user?.location?.address?.city || 'Smart Farm'}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Signal size={16} className="text-green-500" />
                    <span className="text-gray-600">Connected</span>
                  </div>
                  {dashboardData.lastUpdated && (
                    <span className="text-gray-500">
                      • Updated {dashboardData.lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={fetchAllDashboardData}
                disabled={refreshing}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </motion.button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live • {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alerts Banner */}
        {dashboardData.alerts.length > 0 && (
          <motion.div
            className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Active Alerts ({dashboardData.alerts.length})</h3>
              </div>
              <Link to="/alerts" className="text-sm text-yellow-700 hover:text-yellow-900">
                View All <ExternalLink size={14} className="inline ml-1" />
              </Link>
            </div>
            <div className="mt-2 space-y-1">
              {dashboardData.alerts.slice(0, 2).map(alert => (
                <div key={alert.id} className="text-sm text-yellow-700">
                  • {alert.message}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Smart Stats Grid with Real-time Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {smartStats.map((stat, index) => (
            <StatCard
              key={`${stat.label}-${index}`}
              {...stat}
              delay={index * 0.1}
              onClick={() => navigate(stat.route || '/dashboard')}
            />
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Analytics */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Enhanced Weather Card with Real Data */}
            {dashboardData.weather?.current && (
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden shadow-lg border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-white/70 rounded-xl">
                        <Sun className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Live Weather Data</h3>
                        <p className="text-blue-700 capitalize">{dashboardData.weather.current.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {dashboardData.weather.current.isOffline && (
                        <WifiOff size={16} className="text-red-500" />
                      )}
                      <motion.button
                        onClick={() => toggleCardExpansion('weather')}
                        className="p-2 rounded-lg bg-white/50 text-blue-600 hover:bg-white/70 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        {expandedCards.has('weather') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-5xl font-bold text-blue-900">
                        {dashboardData.weather.current.temperature}°
                      </div>
                      <div>
                        <p className="text-blue-800 font-semibold text-lg">
                          Feels like {dashboardData.weather.current.feelsLike}°C
                        </p>
                        <p className="text-blue-600 text-sm">
                          {dashboardData.weather.current.location.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Humidity</span>
                        </div>
                        <p className="font-semibold text-gray-900">{dashboardData.weather.current.humidity}%</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Wind className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Wind</span>
                        </div>
                        <p className="font-semibold text-gray-900">{dashboardData.weather.current.windSpeed} km/h</p>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCards.has('weather') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-white/30"
                      >
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-800 mb-1">Smart Farm Advisory</h4>
                              <p className="text-green-700 text-sm">{dashboardData.weather.current.farmingAdvisory}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* 5-day forecast preview */}
                        {dashboardData.weather.forecast?.forecast && (
                          <div className="grid grid-cols-5 gap-2 mt-4">
                            {dashboardData.weather.forecast.forecast.slice(0, 5).map((day, index) => (
                              <div key={index} className="text-center bg-white/50 rounded-lg p-2">
                                <p className="text-xs text-gray-600">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                <p className="text-sm font-semibold">{day.maxTemp}°/{day.minTemp}°</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-6">
                    <Link
                      to="/weather"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Detailed Forecast</span>
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Quick Actions */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Smart Farm Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enhancedQuickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      to={action.route}
                      className={`block p-4 ${action.bgColor} rounded-xl hover:shadow-lg transition-all duration-300 border border-white/50 group relative`}
                    >
                      {action.badge && (
                        <div className="absolute top-2 right-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            action.badge === 'Live' ? 'bg-green-100 text-green-700' :
                            action.badge === 'Offline' ? 'bg-red-100 text-red-700' :
                            action.badge === 'Simulated' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {action.badge}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-white/70 rounded-lg group-hover:scale-110 transition-transform`}>
                          <action.icon className={`w-5 h-5 ${action.textColor}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Market Intelligence with Real Data */}
            {dashboardData.market?.data && (
              <motion.div
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Market Intelligence</h3>
                  <div className="flex items-center space-x-2">
                    {dashboardData.market.isOffline && (
                      <WifiOff size={16} className="text-red-500" />
                    )}
                    <Link 
                      to="/market"
                      className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                    >
                      View Analysis
                      <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(dashboardData.market.data).slice(0, 4).map(([crop, data], index) => (
                    <motion.div
                      key={crop}
                      className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 capitalize">{crop}</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          data.trend === 'up' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {data.changePercent}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{data.price}
                          </p>
                          <p className="text-sm text-gray-500">{data.volume || data.unit}</p>
                        </div>
                        {data.trend === 'up' ? 
                          <TrendingUp className="w-6 h-6 text-green-600" /> :
                          <TrendingDown className="w-6 h-6 text-red-600" />
                        }
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar - Alerts & Monitoring */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Smart Alerts</h3>
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{dashboardData.alerts.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                {dashboardData.alerts.slice(0, 3).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <div className="flex items-start space-x-3">
                      <alert.icon 
                        className={`w-4 h-4 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          alert.severity === 'high' ? 'text-red-800' :
                          alert.severity === 'medium' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          alert.severity === 'high' ? 'text-red-700' :
                          alert.severity === 'medium' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {dashboardData.alerts.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm">All systems optimal</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* IoT Device Status */}
            {dashboardData.iot?.summary && (
              <motion.div
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Device Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Devices</span>
                    <span className="font-semibold">{dashboardData.iot.summary.totalDevices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Online</span>
                    <span className="font-semibold text-green-600">{dashboardData.iot.summary.activeDevices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Battery</span>
                    <span className={`font-semibold ${dashboardData.iot.summary.batteryLow > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {dashboardData.iot.summary.batteryLow}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Last sync: {dashboardData.iot.summary.lastSync?.toLocaleTimeString() || 'Just now'}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductionDashboard;