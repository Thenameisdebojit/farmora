import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, TrendingUp, Bug, Droplets, AlertTriangle, CheckCircle, Clock,
  Thermometer, Users, BarChart3, Calendar, MessageCircle, Bell, Eye,
  Leaf, Zap, Activity, Sun, CloudRain, Wind, Gauge, ArrowRight,
  Settings, Home, Smartphone, Wifi, MapPin, Plus, RefreshCw,
  Target, Award, TrendingDown, ChevronRight, Play, BookOpen,
  Camera, Lightbulb, PhoneCall, Video, ChevronDown, ChevronUp,
  ExternalLink, Star, ThumbsUp, Filter, Search, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const InteractiveDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    quickStats: {},
    alerts: [],
    recentActivity: [],
    upcomingTasks: [],
    marketSummary: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCard, setExpandedCard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDashboardData({
        weather: {
          temperature: 28,
          humidity: 65,
          windSpeed: 12,
          pressure: 1013,
          visibility: 10000,
          weather: 'Clear',
          description: 'Clear skies',
          timestamp: new Date().toISOString(),
          farmingAdvisory: 'Perfect weather for harvesting. Consider early morning activities to avoid afternoon heat.'
        },
        quickStats: {
          temperature: 28,
          humidity: 65,
          soilMoisture: 72,
          cropHealth: 94,
          totalFields: 4,
          activeDevices: 8,
          todaysIrrigation: 3.2,
          weeklyConsultations: 2,
          yieldPrediction: 2.8,
          efficiency: 88
        },
        alerts: [
          {
            id: 1,
            type: 'weather',
            severity: 'medium',
            title: 'Rain Expected',
            message: 'Light rain expected tomorrow afternoon. Good for crops, check drainage.',
            time: '1 hour ago',
            icon: CloudRain,
            color: 'blue'
          },
          {
            id: 2,
            type: 'market',
            severity: 'high',
            title: 'Price Surge',
            message: 'Wheat prices increased by 8% in local market. Consider selling.',
            time: '3 hours ago',
            icon: TrendingUp,
            color: 'green'
          },
          {
            id: 3,
            type: 'irrigation',
            severity: 'low',
            title: 'Irrigation Complete',
            message: 'Field C irrigation completed successfully.',
            time: '45 minutes ago',
            icon: Droplets,
            color: 'blue'
          }
        ],
        recentActivity: [
          { 
            id: 1, 
            type: 'pest_detection', 
            message: 'Pest scan completed - No threats detected in Field A', 
            time: '15 minutes ago', 
            status: 'completed',
            icon: Bug,
            color: 'green'
          },
          { 
            id: 2, 
            type: 'consultation', 
            message: 'Video consultation with Dr. Sarah booked for Dec 20, 2:00 PM', 
            time: '1 hour ago', 
            status: 'scheduled',
            icon: Video,
            color: 'purple'
          },
          { 
            id: 3, 
            type: 'ai_advisory', 
            message: 'New crop recommendations generated based on soil analysis', 
            time: '2 hours ago', 
            status: 'new',
            icon: Lightbulb,
            color: 'yellow'
          },
          { 
            id: 4, 
            type: 'market', 
            message: 'Market alert: Tomato prices peaked at ₹45/kg', 
            time: '4 hours ago', 
            status: 'info',
            icon: BarChart3,
            color: 'indigo'
          }
        ],
        upcomingTasks: [
          { id: 1, task: 'Harvest Field A - Wheat', due: 'Today 6:00 AM', priority: 'high', progress: 0 },
          { id: 2, task: 'Apply organic fertilizer - Field B', due: 'Tomorrow 8:00 AM', priority: 'medium', progress: 25 },
          { id: 3, task: 'Pest inspection - Field C', due: 'Dec 21', priority: 'medium', progress: 0 },
          { id: 4, task: 'Soil testing - Field D', due: 'Dec 22', priority: 'low', progress: 75 }
        ],
        marketSummary: {
          wheat: { price: 2280, change: '+8.2%', trend: 'up', volume: '1.2K tons' },
          rice: { price: 1920, change: '+2.1%', trend: 'up', volume: '850 tons' },
          cotton: { price: 5450, change: '-1.8%', trend: 'down', volume: '340 tons' },
          tomato: { price: 45, change: '+15.3%', trend: 'up', volume: '2.1K kg' }
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'pest_detection',
      title: 'Pest Detection',
      description: 'Scan crops for pests',
      icon: Bug,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      route: '/pest-detection'
    },
    {
      id: 'ai_advisory',
      title: 'AI Advisory',
      description: 'Get smart recommendations',
      icon: Lightbulb,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      route: '/advisory'
    },
    {
      id: 'irrigation',
      title: 'Smart Irrigation',
      description: 'Monitor soil moisture',
      icon: Droplets,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      route: '/irrigation'
    },
    {
      id: 'market',
      title: 'Market Prices',
      description: 'Check live rates',
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      route: '/market'
    },
    {
      id: 'consultation',
      title: 'Expert Call',
      description: 'Book consultation',
      icon: Video,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      route: '/consultation'
    },
    {
      id: 'weather',
      title: 'Weather Forecast',
      description: '7-day predictions',
      icon: Cloud,
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      route: '/weather'
    }
  ];

  if (loading) {
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
          <h2 className="text-xl font-semibold text-gray-700">Loading your farm data...</h2>
          <p className="text-gray-500 mt-2">Getting the latest updates</p>
        </motion.div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, unit, color, bgColor, trend, onClick, delay = 0 }) => (
    <motion.div
      className={`${bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-white/50`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-white/70`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
              {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
            </p>
            {trend && (
              <p className={`text-sm flex items-center mt-1 ${
                trend.includes('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.includes('+') ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {trend}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );

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
                Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'Farmer'}! 🌾
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <MapPin size={16} className="mr-1" />
                {user?.location?.address?.district || user?.location?.address?.city || user?.location || 'Smart Farm'} • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => fetchDashboardData()}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={20} />
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
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            icon={Thermometer}
            label="Temperature"
            value={dashboardData.quickStats.temperature}
            unit="°C"
            color="text-orange-600"
            bgColor="bg-gradient-to-br from-orange-50 to-red-50"
            trend="+2°C"
            delay={0}
            onClick={() => navigate('/weather')}
          />
          <StatCard
            icon={Droplets}
            label="Soil Moisture"
            value={dashboardData.quickStats.soilMoisture}
            unit="%"
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-50 to-cyan-50"
            trend="+5%"
            delay={0.1}
            onClick={() => navigate('/irrigation')}
          />
          <StatCard
            icon={Leaf}
            label="Crop Health"
            value={dashboardData.quickStats.cropHealth}
            unit="%"
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
            trend="+3%"
            delay={0.2}
            onClick={() => navigate('/advisory')}
          />
          <StatCard
            icon={TrendingUp}
            label="Yield Prediction"
            value={dashboardData.quickStats.yieldPrediction}
            unit="T/ha"
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-indigo-50"
            trend="+12%"
            delay={0.3}
            onClick={() => navigate('/market')}
          />
          <StatCard
            icon={Wifi}
            label="Active Sensors"
            value={dashboardData.quickStats.activeDevices}
            color="text-indigo-600"
            bgColor="bg-gradient-to-br from-indigo-50 to-purple-50"
            delay={0.4}
          />
          <StatCard
            icon={Target}
            label="Efficiency"
            value={dashboardData.quickStats.efficiency}
            unit="%"
            color="text-teal-600"
            bgColor="bg-gradient-to-br from-teal-50 to-green-50"
            trend="+4%"
            delay={0.5}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Cards */}
          <div className="xl:col-span-2 space-y-8">
            {/* Weather Card */}
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden shadow-lg border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/70 rounded-xl">
                      <Sun className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Weather Overview</h3>
                      <p className="text-blue-700">Perfect conditions for farming</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setWeatherExpanded(!weatherExpanded)}
                    className="p-2 rounded-lg bg-white/50 text-blue-600 hover:bg-white/70 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {weatherExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-5xl font-bold text-blue-900">
                      {dashboardData.weather.temperature}°
                    </div>
                    <div>
                      <p className="text-blue-800 font-semibold text-lg capitalize">
                        {dashboardData.weather.description}
                      </p>
                      <p className="text-blue-600 text-sm">Feels like 30°C</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Droplets className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Humidity</span>
                      </div>
                      <p className="font-semibold text-gray-900">{dashboardData.weather.humidity}%</p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Wind className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Wind</span>
                      </div>
                      <p className="font-semibold text-gray-900">{dashboardData.weather.windSpeed} km/h</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {weatherExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-white/30"
                    >
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Farm Advisory</h4>
                            <p className="text-yellow-700 text-sm">{dashboardData.weather.farmingAdvisory}</p>
                          </div>
                        </div>
                      </div>
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

            {/* Quick Actions Grid */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Link
                      to={action.route}
                      className={`block p-4 ${action.bgColor} rounded-xl hover:shadow-lg transition-all duration-300 border border-white/50 group`}
                    >
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

            {/* Market Summary */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Market Overview</h3>
                <Link 
                  to="/market"
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                >
                  View All Markets
                  <ExternalLink size={14} className="ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dashboardData.marketSummary || {}).map(([crop, data], index) => (
                  <motion.div
                    key={crop}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">{crop}</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        data.trend === 'up' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {data.change}
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{data.price}
                        </p>
                        <p className="text-sm text-gray-500">{data.volume}</p>
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
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alerts Card */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Active Alerts</h3>
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{dashboardData.alerts.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                {dashboardData.alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
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
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Today's Tasks</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                {dashboardData.upcomingTasks.slice(0, 4).map((task, index) => (
                  <motion.div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.task}</p>
                      <p className="text-xs text-gray-500">{task.due}</p>
                      {task.progress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-green-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 text-sm text-green-600 hover:text-green-800 font-medium py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                View All Tasks
              </button>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>

              <div className="space-y-4">
                {dashboardData.recentActivity.slice(0, 4).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                  >
                    <div className={`p-1.5 rounded-full bg-${activity.color}-100`}>
                      <activity.icon className={`w-3 h-3 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                          activity.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          activity.status === 'new' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                View All Activity
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDashboard;