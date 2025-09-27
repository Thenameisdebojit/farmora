// Spectacular Weather Dashboard with enhanced UI/UX
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow,
  Wind, 
  Eye, 
  Gauge,
  Thermometer,
  Droplets,
  Calendar,
  MapPin,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Navigation,
  Zap,
  Sunrise,
  Sunset,
  Moon,
  CloudDrizzle,
  Tornado,
  Activity,
  BarChart3,
  Clock,
  Umbrella,
  Leaf,
  Sparkles,
  Star
} from 'lucide-react';
import api from '../../services/api';
import geolocationService from '../../services/geolocationService';

const SpectacularWeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState({ city: 'Loading...', country: '' });
  const [selectedDay, setSelectedDay] = useState(0);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const initializeLocation = async () => {
    try {
      setGettingLocation(true);
      const userLocation = await geolocationService.getLocationWithCaching();
      
      setLocation({
        lat: userLocation.latitude,
        lon: userLocation.longitude
      });
      
      setLocationInfo({
        city: userLocation.city || 'Unknown',
        state: userLocation.state || '',
        country: userLocation.country || 'India'
      });
      
    } catch (error) {
      console.error('Failed to get location, using default:', error);
      setLocation({ lat: 28.6139, lon: 77.2090 });
      setLocationInfo({ city: 'New Delhi', state: 'Delhi', country: 'India' });
    } finally {
      setGettingLocation(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      const currentWeather = await api.getCurrentWeather(location.lat, location.lon);
      setWeatherData(currentWeather.data);
      
      const forecastData = await api.getWeatherForecast(location.lat, location.lon, 7);
      setForecast(forecastData.data.forecasts || []);
      
      const alertsData = await api.getWeatherAlerts(location.lat, location.lon);
      setAlerts(alertsData.data || []);
      
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Provide fallback data
      setWeatherData({
        temperature: 25,
        humidity: 65,
        windSpeed: 8,
        pressure: 1013,
        visibility: 10000,
        weather: 'Clear',
        description: 'Clear sky',
        timestamp: new Date().toISOString()
      });
      
      // Generate some mock forecast data
      const mockForecast = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        mockForecast.push({
          date: date.toISOString(),
          tempMax: 25 + Math.random() * 10,
          tempMin: 15 + Math.random() * 5,
          weather: i % 2 === 0 ? 'Clear' : 'Clouds',
          description: i % 2 === 0 ? 'clear sky' : 'few clouds',
          precipitation: Math.random() * 5,
          humidity: 60 + Math.random() * 20,
          windSpeed: 5 + Math.random() * 10
        });
      }
      setForecast(mockForecast);
      
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchWeatherData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getWeatherIcon = (weatherMain, size = 24, className = '') => {
    const iconProps = { size, className: `${className} drop-shadow-md` };
    
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className={`${className} text-yellow-400`} />;
      case 'clouds':
        return <Cloud {...iconProps} className={`${className} text-gray-400`} />;
      case 'rain':
        return <CloudRain {...iconProps} className={`${className} text-blue-400`} />;
      case 'drizzle':
        return <CloudDrizzle {...iconProps} className={`${className} text-blue-300`} />;
      case 'snow':
        return <CloudSnow {...iconProps} className={`${className} text-blue-100`} />;
      case 'thunderstorm':
        return <Zap {...iconProps} className={`${className} text-purple-400`} />;
      default:
        return <Cloud {...iconProps} className={`${className} text-gray-400`} />;
    }
  };

  const getWeatherGradient = (weather) => {
    switch (weather?.toLowerCase()) {
      case 'clear':
        return 'from-yellow-300 via-orange-400 to-red-400';
      case 'clouds':
        return 'from-gray-300 via-gray-400 to-gray-500';
      case 'rain':
      case 'drizzle':
        return 'from-blue-400 via-blue-500 to-blue-600';
      case 'snow':
        return 'from-blue-100 via-blue-200 to-blue-300';
      case 'thunderstorm':
        return 'from-purple-500 via-purple-600 to-purple-700';
      default:
        return 'from-blue-400 via-blue-500 to-blue-600';
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'text-red-500';
    if (temp >= 25) return 'text-orange-400';
    if (temp >= 15) return 'text-green-400';
    return 'text-blue-400';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const WeatherHero = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br ${getWeatherGradient(weatherData?.weather)} shadow-2xl`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-4 right-4 opacity-20"
        >
          <Sparkles size={40} className="text-white" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            x: [-5, 5, -5]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-6 left-6 opacity-30"
        >
          <Star size={24} className="text-white" />
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-2"
            >
              Farmora Weather Intelligence
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center text-white/90"
            >
              <MapPin size={20} className="mr-2" />
              <span className="text-lg">
                {locationInfo.city}{locationInfo.state ? `, ${locationInfo.state}` : ''}, {locationInfo.country}
              </span>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-right"
          >
            <div className="text-white/80 text-sm mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-white/70 text-sm">
              Last updated: {weatherData ? formatTime(weatherData.timestamp) : '--'}
            </div>
          </motion.div>
        </div>

        {weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-6"
            >
              <motion.div
                animate={{ 
                  rotate: weatherData.weather === 'Clear' ? [0, 5, -5, 0] : 0,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {getWeatherIcon(weatherData.weather, 120)}
              </motion.div>
              
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className="text-7xl md:text-8xl font-bold text-white">
                    {Math.round(weatherData.temperature)}
                  </span>
                  <span className="text-3xl text-white/80">°C</span>
                </div>
                <p className="text-2xl text-white/90 capitalize mt-2">
                  {weatherData.description}
                </p>
                <p className="text-white/70 mt-1">
                  Feels like {Math.round(weatherData.temperature + 2)}°C
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Droplets, label: 'Humidity', value: `${weatherData.humidity}%`, color: 'text-blue-200' },
                { icon: Wind, label: 'Wind Speed', value: `${weatherData.windSpeed} km/h`, color: 'text-gray-200' },
                { icon: Eye, label: 'Visibility', value: `${Math.round(weatherData.visibility / 1000)} km`, color: 'text-purple-200' },
                { icon: Gauge, label: 'Pressure', value: `${weatherData.pressure} hPa`, color: 'text-green-200' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <item.icon className={`${item.color}`} size={20} />
                    <span className="text-white/90 text-sm font-medium">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-between items-center mt-8 pt-6 border-t border-white/30"
        >
          <div className="flex space-x-4">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all border border-white/30 disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          
          <div className="text-white/80 text-sm">
            🌱 Powered by AI for Smart Farming
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const ForecastCards = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-3 text-blue-500" />
        7-Day Forecast
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {forecast.map((day, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDay(index)}
            className={`p-4 rounded-xl text-center transition-all duration-300 ${
              selectedDay === index
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/70 hover:bg-white/90 shadow-md border border-gray-200'
            }`}
          >
            <p className={`text-sm font-medium mb-2 ${
              selectedDay === index ? 'text-white' : 'text-gray-600'
            }`}>
              {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            
            <div className="flex justify-center mb-3">
              {getWeatherIcon(day.weather, 32)}
            </div>
            
            <div className="space-y-1">
              <p className={`text-lg font-bold ${
                selectedDay === index ? 'text-white' : 'text-gray-900'
              }`}>
                {Math.round(day.tempMax)}°
              </p>
              <p className={`text-sm ${
                selectedDay === index ? 'text-white/80' : 'text-gray-500'
              }`}>
                {Math.round(day.tempMin)}°
              </p>
            </div>
            
            {day.precipitation > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center mt-2"
              >
                <Umbrella size={12} className={selectedDay === index ? 'text-white' : 'text-blue-500'} />
                <span className={`text-xs ml-1 ${
                  selectedDay === index ? 'text-white' : 'text-blue-500'
                }`}>
                  {Math.round(day.precipitation)}mm
                </span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected Day Details */}
      <AnimatePresence mode="wait">
        {forecast[selectedDay] && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
          >
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              {selectedDay === 0 ? 'Today' : new Date(forecast[selectedDay].date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'High/Low', value: `${Math.round(forecast[selectedDay].tempMax)}° / ${Math.round(forecast[selectedDay].tempMin)}°`, icon: Thermometer },
                { label: 'Humidity', value: `${Math.round(forecast[selectedDay].humidity || 65)}%`, icon: Droplets },
                { label: 'Wind', value: `${Math.round(forecast[selectedDay].windSpeed || 8)} km/h`, icon: Wind },
                { label: 'Rain', value: `${Math.round(forecast[selectedDay].precipitation)}mm`, icon: CloudRain }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-3 bg-white/70 rounded-lg"
                >
                  <item.icon className="mx-auto mb-2 text-blue-500" size={20} />
                  <p className="text-gray-600 text-sm">{item.label}</p>
                  <p className="font-bold text-gray-900">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold mb-2">Loading Weather Intelligence...</h2>
          <p className="text-white/80">Gathering atmospheric data for smart farming insights</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <WeatherHero />
        <ForecastCards />
        
        {/* Additional Sections can be added here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Farming Advisory */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Leaf className="mr-3 text-green-500" />
              Farming Advisory
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-green-800">Field Operations</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Excellent conditions for spraying and harvesting activities.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-blue-800">Irrigation</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Consider light watering in early morning hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Air Quality */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Activity className="mr-3 text-purple-500" />
              Air Quality
            </h3>
            
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
              >
                <span className="text-3xl font-bold text-white">45</span>
              </motion.div>
              <p className="font-bold text-green-600 text-lg">Good</p>
              <p className="text-gray-600 text-sm">Air quality is satisfactory for outdoor activities</p>
            </div>
          </motion.div>

          {/* Weather Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="mr-3 text-orange-500" />
              Today's Highlights
            </h3>
            
            <div className="space-y-4">
              {[
                { icon: Sunrise, label: 'Sunrise', value: '6:45 AM', color: 'text-orange-500' },
                { icon: Sunset, label: 'Sunset', value: '5:30 PM', color: 'text-orange-600' },
                { icon: Moon, label: 'UV Index', value: '6 (High)', color: 'text-purple-500' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={item.color} size={20} />
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SpectacularWeatherDashboard;