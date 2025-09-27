// src/components/Weather/GoogleWeatherUI.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning,
  Eye, Droplets, Wind, Thermometer, Gauge,
  MapPin, Clock, Calendar, TrendingUp, TrendingDown,
  RefreshCw, Search, Navigation, AlertTriangle
} from 'lucide-react';
import weatherService from '../../services/weatherService';
import './GoogleWeatherUI.css';

const GoogleWeatherUI = ({ latitude, longitude, locationName }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentWeather, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 7)
      ]);

      if (currentWeather.success) {
        setWeatherData(currentWeather.data);
      }

      if (forecastData.success) {
        setForecast(forecastData.data.forecasts || []);
      }

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition, size = 'large') => {
    const iconProps = {
      small: { size: 24, strokeWidth: 2 },
      medium: { size: 32, strokeWidth: 2 },
      large: { size: 80, strokeWidth: 1.5 },
      xlarge: { size: 120, strokeWidth: 1 }
    };

    const props = iconProps[size];

    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun {...props} className="weather-icon sunny" />;
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud {...props} className="weather-icon cloudy" />;
      case 'rain':
      case 'rainy':
        return <CloudRain {...props} className="weather-icon rainy" />;
      case 'snow':
      case 'snowy':
        return <CloudSnow {...props} className="weather-icon snowy" />;
      case 'thunderstorm':
      case 'storm':
        return <CloudLightning {...props} className="weather-icon stormy" />;
      default:
        return <Sun {...props} className="weather-icon" />;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'temp-very-hot';
    if (temp >= 25) return 'temp-hot';
    if (temp >= 15) return 'temp-warm';
    if (temp >= 5) return 'temp-cool';
    return 'temp-cold';
  };

  const getWindDirection = (degree) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degree / 22.5) % 16];
  };

  if (loading) {
    return (
      <div className="google-weather-ui loading">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={40} />
        </motion.div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="google-weather-ui error">
        <AlertTriangle size={48} />
        <h2>Weather Unavailable</h2>
        <p>{error}</p>
        <button onClick={fetchWeatherData} className="retry-button">
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="google-weather-ui">
      {/* Header */}
      <motion.header 
        className="weather-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="location-info">
          <MapPin size={18} />
          <span className="location-name">
            {locationName || weatherData?.location || 'Current Location'}
          </span>
          <span className="country-name">
            {weatherData?.country && `, ${weatherData.country}`}
          </span>
        </div>
        
        <div className="current-time">
          <Clock size={16} />
          <span>{formatTime(currentTime)}</span>
        </div>

        <button 
          onClick={fetchWeatherData} 
          className="refresh-button"
          disabled={loading}
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
          >
            <RefreshCw size={16} />
          </motion.div>
        </button>
      </motion.header>

      {/* Main Weather Display */}
      <motion.div 
        className="main-weather"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="weather-icon-section">
          <motion.div
            className="weather-icon-container"
            animate={{ 
              rotateY: [0, 10, 0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {getWeatherIcon(weatherData?.weather, 'xlarge')}
          </motion.div>
        </div>

        <div className="temperature-section">
          <div className="main-temperature">
            <span className={`temperature-value ${getTemperatureColor(weatherData?.temperature)}`}>
              {Math.round(weatherData?.temperature || 0)}°
            </span>
            <span className="temperature-unit">C</span>
          </div>
          
          <div className="weather-description">
            <p className="condition">{weatherData?.weather || 'Clear'}</p>
            <p className="description">{weatherData?.description || 'Clear sky'}</p>
          </div>

          <div className="feels-like">
            Feels like {Math.round((weatherData?.temperature || 0) + 2)}°C
          </div>
        </div>
      </motion.div>

      {/* Weather Details Grid */}
      <motion.div 
        className="weather-details"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="detail-card">
          <div className="detail-icon">
            <Droplets size={24} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weatherData?.humidity || 0}%</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <Wind size={24} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Wind</span>
            <span className="detail-value">
              {Math.round(weatherData?.windSpeed || 0)} km/h
              <span className="wind-direction">
                {getWindDirection(weatherData?.windDirection || 0)}
              </span>
            </span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <Gauge size={24} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{weatherData?.pressure || 0} hPa</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <Eye size={24} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Visibility</span>
            <span className="detail-value">
              {Math.round((weatherData?.visibility || 0) / 1000)} km
            </span>
          </div>
        </div>
      </motion.div>

      {/* 7-Day Forecast */}
      <motion.div 
        className="forecast-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h3 className="forecast-title">
          <Calendar size={20} />
          7-Day Forecast
        </h3>

        <div className="forecast-list">
          <AnimatePresence>
            {forecast.map((day, index) => (
              <motion.div
                key={index}
                className={`forecast-item ${selectedDay === index ? 'selected' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setSelectedDay(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="forecast-day">
                  <span className="day-name">{formatDate(day.date)}</span>
                </div>

                <div className="forecast-icon">
                  {getWeatherIcon(day.weather, 'medium')}
                </div>

                <div className="forecast-temps">
                  <span className="temp-high">
                    {Math.round(day.tempMax)}°
                  </span>
                  <span className="temp-low">
                    {Math.round(day.tempMin)}°
                  </span>
                </div>

                <div className="forecast-condition">
                  <span className="condition-text">{day.weather}</span>
                  {day.precipitation > 0 && (
                    <span className="precipitation">
                      <Droplets size={14} />
                      {Math.round(day.precipitation)}mm
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Weather Alerts (if any) */}
      <AnimatePresence>
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <motion.div 
            className="weather-alerts"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="alerts-title">
              <AlertTriangle size={20} />
              Weather Alerts
            </h3>
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <span className="alert-title">{alert.title}</span>
                <span className="alert-description">{alert.description}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoogleWeatherUI;