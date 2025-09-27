// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  TrendingUp, 
  Bug, 
  Droplets, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Users,
  BarChart3,
  Calendar,
  MessageCircle
} from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import AdvisoryCard from '../components/AdvisoryCard';
import api from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    advisory: null,
    alerts: [],
    recentActivity: [],
    quickStats: {},
    upcomingTasks: [],
    marketSummary: null
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock coordinates (Delhi) - replace with user's location
      const latitude = 28.6139;
      const longitude = 77.2090;
      
      // Fetch weather data
      const weatherData = await api.getCurrentWeather(latitude, longitude);
      
      // Fetch advisory data
      const advisoryData = await api.getPersonalizedAdvisory({
        userId: 'demo-user',
        cropType: 'wheat',
        growthStage: 'flowering'
      });
      
      // Mock additional dashboard data
      setDashboardData({
        weather: weatherData.data,
        advisory: advisoryData.data?.advisory,
        alerts: [
          {
            id: 1,
            type: 'weather',
            severity: 'high',
            title: 'Heavy Rain Alert',
            message: 'Heavy rainfall expected tomorrow. Secure crops and check drainage.',
            time: '2 hours ago'
          },
          {
            id: 2,
            type: 'pest',
            severity: 'medium',
            title: 'Pest Outbreak Nearby',
            message: 'Aphid infestation reported 5km away. Monitor your crops.',
            time: '6 hours ago'
          }
        ],
        recentActivity: [
          { 
            id: 1, 
            type: 'irrigation', 
            message: 'Automated irrigation completed for Field A', 
            time: '30 minutes ago', 
            status: 'completed' 
          },
          { 
            id: 2, 
            type: 'consultation', 
            message: 'Consultation with Dr. Priya scheduled for tomorrow', 
            time: '2 hours ago', 
            status: 'scheduled' 
          },
          { 
            id: 3, 
            type: 'market', 
            message: 'Wheat prices increased by 3% in local market', 
            time: '5 hours ago', 
            status: 'info' 
          }
        ],
        quickStats: {
          temperature: weatherData.data?.temperature || 25,
          humidity: weatherData.data?.humidity || 65,
          soilMoisture: 45,
          cropHealth: 85,
          totalFields: 3,
          activeDevices: 5,
          todaysIrrigation: 2.5,
          weeklyConsultations: 1
        },
        upcomingTasks: [
          { id: 1, task: 'Apply fertilizer to Field B', due: 'Today', priority: 'high' },
          { id: 2, task: 'Pest inspection - Field A', due: 'Tomorrow', priority: 'medium' },
          { id: 3, task: 'Consultation with Dr. Priya', due: 'Dec 18', priority: 'low' }
        ],
        marketSummary: {
          wheat: { price: 2150, change: '+3.2%', trend: 'up' },
          rice: { price: 1850, change: '-1.5%', trend: 'down' },
          cotton: { price: 5200, change: '+5.1%', trend: 'up' }
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, unit, color = "text-blue-600", bgColor = "bg-blue-100" }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'irrigation':
          return <Droplets className="text-blue-500" size={16} />;
        case 'consultation':
          return <Users className="text-purple-500" size={16} />;
        case 'market':
          return <TrendingUp className="text-green-500" size={16} />;
        case 'pest':
          return <Bug className="text-red-500" size={16} />;
        default:
          return <Clock className="text-gray-500" size={16} />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'scheduled':
          return 'bg-blue-100 text-blue-800';
        case 'info':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-1">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-gray-500">{activity.time}</p>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
              {activity.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Farmer'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening on your farm today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Thermometer}
          label="Temperature"
          value={dashboardData.quickStats.temperature}
          unit="°C"
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatCard
          icon={Droplets}
          label="Soil Moisture"
          value={dashboardData.quickStats.soilMoisture}
          unit="%"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={CheckCircle}
          label="Crop Health"
          value={dashboardData.quickStats.cropHealth}
          unit="%"
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={Cloud}
          label="Humidity"
          value={dashboardData.quickStats.humidity}
          unit="%"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weather Card */}
          <WeatherCard weather={dashboardData.weather} loading={false} />
          
          {/* Advisory Card */}
          <AdvisoryCard advisory={dashboardData.advisory} loading={false} />
          
          {/* Market Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Market Summary</h3>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(dashboardData.marketSummary || {}).map(([crop, data]) => (
                  <div key={crop} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 capitalize">{crop}</span>
                      <span className={`text-sm font-medium ${
                        data.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ₹{data.price}
                      <span className="text-sm text-gray-500 font-normal">/quintal</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
                <span className="text-sm text-gray-500">{dashboardData.alerts.length} alerts</span>
              </div>
              
              <div className="space-y-3">
                {dashboardData.alerts.length > 0 ? (
                  dashboardData.alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'high' 
                          ? 'bg-red-50 border-red-400' 
                          : 'bg-yellow-50 border-yellow-400'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <AlertTriangle 
                          className={
                            alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                          } 
                          size={16} 
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            alert.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            {alert.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            alert.severity === 'high' ? 'text-red-700' : 'text-yellow-700'
                          }`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <p className="mt-2 text-sm text-gray-500">No active alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                <Calendar className="text-gray-400" size={20} />
              </div>
              
              <div className="space-y-3">
                {dashboardData.upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.task}</p>
                      <p className="text-xs text-gray-500">Due: {task.due}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-sm text-green-600 hover:text-green-800 font-medium">
                View All Tasks →
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Activity →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Bug className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Detect Pest Issue</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Schedule Irrigation</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Ask AI Assistant</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Check Market Prices</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
