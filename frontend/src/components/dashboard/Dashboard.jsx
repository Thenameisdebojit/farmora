// frontend/src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CloudIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  SunIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import apiService from '../../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCrops: 0,
      activeConsultations: 0,
      weatherAlerts: 0,
      marketTrends: 0
    },
    weather: null,
    crops: [],
    recentActivity: [],
    alerts: [],
    loading: true
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const location = user.location?.coordinates || { latitude: 28.6139, longitude: 77.2090 };

      // Load multiple data sources concurrently
      const [weatherData, cropData, consultationData] = await Promise.allSettled([
        apiService.getCurrentWeather(location.latitude, location.longitude),
        apiService.getCropRecommendations({
          latitude: location.latitude,
          longitude: location.longitude,
          season: getCurrentSeason(),
          soilType: user.farmDetails?.soilType || 'loam'
        }),
        apiService.getUserConsultations(user.id)
      ]);

      // Process results
      const weather = weatherData.status === 'fulfilled' ? weatherData.value.data : null;
      const crops = cropData.status === 'fulfilled' ? cropData.value.data?.recommendations || [] : [];
      const consultations = consultationData.status === 'fulfilled' ? consultationData.value.data || [] : [];

      // Generate mock analytics data for demonstration
      const stats = {
        totalCrops: crops.length || 12,
        activeConsultations: consultations.filter(c => c.status === 'active').length || 3,
        weatherAlerts: weather?.alerts?.length || 1,
        marketTrends: Math.floor(Math.random() * 5) + 2
      };

      const alerts = generateMockAlerts();
      const recentActivity = generateMockActivity();

      setDashboardData({
        stats,
        weather,
        crops: crops.slice(0, 6),
        recentActivity,
        alerts,
        loading: false
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) return 'rabi';
    if (month >= 6 && month <= 9) return 'kharif';
    return 'zaid';
  };

  const generateMockAlerts = () => [
    {
      id: 1,
      type: 'weather',
      severity: 'high',
      title: 'Heavy Rain Alert',
      message: 'Heavy rainfall expected in next 24 hours. Secure your crops.',
      time: '2 hours ago',
      icon: CloudIcon,
      color: 'text-red-600'
    },
    {
      id: 2,
      type: 'pest',
      severity: 'medium',
      title: 'Pest Activity Detected',
      message: 'Increased aphid activity reported in your region.',
      time: '5 hours ago',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      type: 'market',
      severity: 'low',
      title: 'Price Increase',
      message: 'Wheat prices increased by 8% this week.',
      time: '1 day ago',
      icon: TrendingUpIcon,
      color: 'text-green-600'
    }
  ];

  const generateMockActivity = () => [
    {
      id: 1,
      type: 'consultation',
      title: 'Consultation with Dr. Sharma',
      description: 'Discussed soil health improvement strategies',
      time: '3 hours ago',
      icon: UserGroupIcon
    },
    {
      id: 2,
      type: 'advisory',
      title: 'New Advisory Received',
      description: 'Irrigation schedule updated for wheat crop',
      time: '6 hours ago',
      icon: CheckCircleIcon
    },
    {
      id: 3,
      type: 'market',
      title: 'Market Update',
      description: 'Rice prices trending upward in local market',
      time: '1 day ago',
      icon: TrendingUpIcon
    },
    {
      id: 4,
      type: 'weather',
      title: 'Weather Forecast Updated',
      description: 'Sunny weather expected for next 5 days',
      time: '1 day ago',
      icon: SunIcon
    }
  ];

  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'text-primary-600' }) => (
    <Card variant="default" size="md" className="hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  changeType === 'increase'
                    ? 'bg-green-100 text-green-800'
                    : changeType === 'decrease'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {changeType === 'increase' && <TrendingUpIcon className="w-3 h-3 mr-1" />}
                {changeType === 'decrease' && <TrendingDownIcon className="w-3 h-3 mr-1" />}
                {change}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );

  const AlertItem = ({ alert }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <alert.icon className={`w-5 h-5 mt-0.5 ${alert.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
        <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <activity.icon className="w-5 h-5 mt-0.5 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
      </div>
    </div>
  );

  const WeatherCard = () => {
    if (!dashboardData.weather) {
      return (
        <Card className="col-span-full lg:col-span-2">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </Card>
      );
    }

    const weather = dashboardData.weather;
    
    return (
      <Card variant="default" size="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <Card.Header>
          <Card.Title className="flex items-center gap-2 text-blue-900">
            <CloudIcon className="w-5 h-5" />
            Current Weather
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-900">{Math.round(weather.temperature)}°C</p>
              <p className="text-blue-700 capitalize">{weather.weather || weather.description}</p>
              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                Current Location
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700 space-y-1">
                <div>Humidity: {weather.humidity}%</div>
                <div>Wind: {weather.windSpeed} km/h</div>
                <div>Pressure: {weather.pressure} hPa</div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  };

  if (dashboardData.loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border h-64"></div>
            <div className="bg-white p-6 rounded-lg border h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening on your farm today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="input px-3 py-2 text-sm border-gray-300 rounded-md"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
          </select>
          <Button
            variant="primary"
            size="sm"
            onClick={loadDashboardData}
            leftIcon={<ChartBarIcon className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Crops"
          value={dashboardData.stats.totalCrops}
          change="+12%"
          changeType="increase"
          icon={BeakerIcon}
          color="text-green-600"
        />
        <StatCard
          title="Consultations"
          value={dashboardData.stats.activeConsultations}
          change="+5%"
          changeType="increase"
          icon={UserGroupIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Weather Alerts"
          value={dashboardData.stats.weatherAlerts}
          change="-2"
          changeType="decrease"
          icon={CloudIcon}
          color="text-orange-600"
        />
        <StatCard
          title="Market Trends"
          value={`+${dashboardData.stats.marketTrends}%`}
          change="Trending Up"
          changeType="increase"
          icon={TrendingUpIcon}
          color="text-emerald-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="lg:col-span-1">
          <WeatherCard />
        </div>

        {/* Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                Recent Alerts
              </Card.Title>
              <Button variant="ghost" size="sm">View All</Button>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                Recent Activity
              </Card.Title>
              <Button variant="ghost" size="sm">View All</Button>
            </Card.Header>
            <Card.Content>
              <div className="space-y-1">
                {dashboardData.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Crop Recommendations */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <BeakerIcon className="w-5 h-5 text-green-500" />
                Crop Suggestions
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {dashboardData.crops.slice(0, 4).map((crop, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{crop.name || `Crop ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">
                        Suitability: {crop.suitabilityScore || Math.floor(Math.random() * 20) + 80}%
                      </p>
                    </div>
                    <Card.Badge variant="success">Recommended</Card.Badge>
                  </div>
                ))}
              </div>
              <Card.Footer>
                <Button variant="outline" size="sm" fullWidth>
                  View All Recommendations
                </Button>
              </Card.Footer>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" size="lg" className="flex-col h-20">
              <CloudIcon className="w-6 h-6 mb-2" />
              Weather Forecast
            </Button>
            <Button variant="outline" size="lg" className="flex-col h-20">
              <CurrencyDollarIcon className="w-6 h-6 mb-2" />
              Market Prices
            </Button>
            <Button variant="outline" size="lg" className="flex-col h-20">
              <UserGroupIcon className="w-6 h-6 mb-2" />
              Book Consultation
            </Button>
            <Button variant="outline" size="lg" className="flex-col h-20">
              <ExclamationTriangleIcon className="w-6 h-6 mb-2" />
              Report Issue
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;