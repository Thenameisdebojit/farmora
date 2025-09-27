// src/pages/WorkingEnhancedDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cloud, TrendingUp, Droplets, AlertTriangle, CheckCircle, 
  Thermometer, BarChart3, Bell, Leaf, Activity, Sun, 
  ArrowRight, RefreshCw, MapPin, Signal, ChevronRight,
  WifiOff, Satellite, Battery
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const WorkingEnhancedDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    weather: null,
    market: null,
    iot: null,
    alerts: []
  });
  const [refreshing, setRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    setDashboardData(prev => ({ ...prev, loading: true }));

    try {
      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data that works
      const mockData = {
        loading: false,
        weather: {
          current: {
            temperature: 28,
            humidity: 65,
            windSpeed: 12,
            description: 'Partly cloudy',
            location: { name: 'Delhi' },
            farmingAdvisory: 'Perfect weather for harvesting. Consider early morning activities.'
          }
        },
        market: {
          data: {
            wheat: { price: 2250, changePercent: '+2.1%', trend: 'up', volume: '1.2K tons' },
            rice: { price: 1920, changePercent: '+1.5%', trend: 'up', volume: '850 tons' },
            cotton: { price: 5450, changePercent: '-1.8%', trend: 'down', volume: '340 tons' },
            tomato: { price: 45, changePercent: '+8.3%', trend: 'up', volume: '2.1K tons' }
          }
        },
        iot: {
          sensors: {
            soilMoisture: { current: 68, trend: 'stable' },
            temperature: { current: 28, trend: 'rising' },
            phLevel: { current: 6.8, trend: 'stable' }
          },
          summary: {
            totalDevices: 8,
            activeDevices: 7,
            batteryLow: 1
          }
        },
        alerts: [
          {
            id: 1,
            type: 'weather',
            severity: 'medium',
            title: 'Rain Expected',
            message: 'Light rain expected tomorrow afternoon',
            timestamp: new Date(),
            icon: Cloud
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to safely display location
  const getLocationDisplay = (location) => {
    if (!location) return 'Smart Farm';
    
    if (typeof location === 'string') {
      return location;
    }
    
    if (typeof location === 'object') {
      return location.address?.district || 
             location.address?.city || 
             location.name || 
             'Smart Farm';
    }
    
    return 'Smart Farm';
  };

  const StatCard = ({ icon: Icon, label, value, unit, color, bgColor, trend, onClick }) => (
    <motion.div
      className={`${bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-white/50`}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          <p className="text-gray-500 mt-2">Getting your farm data ready</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
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
                  {getLocationDisplay(user?.location)}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <Signal size={16} className="text-green-500" />
                  <span className="text-gray-600">Connected</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={fetchDashboardData}
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Thermometer}
            label="Temperature"
            value={dashboardData.weather?.current?.temperature || 0}
            unit="°C"
            color="text-orange-600"
            bgColor="bg-gradient-to-br from-orange-50 to-red-50"
            trend="Normal"
            onClick={() => navigate('/weather')}
          />
          <StatCard
            icon={Activity}
            label="Soil Moisture"
            value={dashboardData.iot?.sensors?.soilMoisture?.current || 0}
            unit="%"
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
            trend="Optimal"
            onClick={() => navigate('/irrigation')}
          />
          <StatCard
            icon={BarChart3}
            label="Market Trend"
            value="↗ Rising"
            unit=""
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-50 to-cyan-50"
            trend="Good"
            onClick={() => navigate('/market')}
          />
          <StatCard
            icon={Battery}
            label="Devices Online"
            value={`${dashboardData.iot?.summary?.activeDevices || 0}/${dashboardData.iot?.summary?.totalDevices || 0}`}
            unit=""
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-indigo-50"
            trend="Healthy"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Weather Card */}
          <div className="xl:col-span-2">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg border border-white/50 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/70 rounded-xl">
                    <Sun className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Weather Overview</h3>
                    <p className="text-blue-700 capitalize">{dashboardData.weather?.current?.description || 'Clear'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl font-bold text-blue-900">
                    {dashboardData.weather?.current?.temperature || 28}°
                  </div>
                  <div>
                    <p className="text-blue-800 font-semibold text-lg">
                      {dashboardData.weather?.current?.location?.name || 'Delhi'}
                    </p>
                    <p className="text-blue-600 text-sm">Perfect for farming</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Humidity</span>
                    </div>
                    <p className="font-semibold text-gray-900">{dashboardData.weather?.current?.humidity || 65}%</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Cloud className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Wind</span>
                    </div>
                    <p className="font-semibold text-gray-900">{dashboardData.weather?.current?.windSpeed || 12} km/h</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/weather"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Detailed Forecast</span>
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Market Overview */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Market Prices</h3>
                <Link to="/market" className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dashboardData.market?.data || {}).slice(0, 4).map(([crop, data]) => (
                  <div key={crop} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">{crop}</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        data.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {data.changePercent}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">₹{data.price}</p>
                        <p className="text-sm text-gray-500">{data.volume}</p>
                      </div>
                      <TrendingUp className={`w-6 h-6 ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Active Alerts</h3>
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{dashboardData.alerts?.length || 0}</span>
                </div>
              </div>

              <div className="space-y-3">
                {dashboardData.alerts?.length > 0 ? dashboardData.alerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border-l-4 bg-blue-50 border-blue-400">
                    <div className="flex items-start space-x-3">
                      <alert.icon className="w-4 h-4 mt-0.5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-800">{alert.title}</p>
                        <p className="text-xs mt-1 text-blue-700">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm">All systems optimal</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link to="/weather" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Cloud className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Weather Forecast</span>
                </Link>
                <Link to="/irrigation" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Droplets className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">Smart Irrigation</span>
                </Link>
                <Link to="/market" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">Market Prices</span>
                </Link>
                <Link to="/pest-detection" className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <Leaf className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-gray-900">Crop Health</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingEnhancedDashboard;