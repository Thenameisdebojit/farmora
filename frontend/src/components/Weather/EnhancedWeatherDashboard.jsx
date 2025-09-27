// src/components/Weather/EnhancedWeatherDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning,
  Eye, Droplets, Wind, Thermometer, Gauge, Activity,
  MapPin, Clock, Calendar, TrendingUp, TrendingDown,
  RefreshCw, Search, Navigation, AlertTriangle, Bot,
  Leaf, Zap, Target, BarChart3, ArrowUp, ArrowDown,
  CloudDrizzle, Snowflake, Moon, Sunrise, Sunset,
  Compass, Waves, Mountain, TreePine, Wheat, Sprout
} from 'lucide-react';
import GoogleWeatherUI from './GoogleWeatherUI';
import weatherService from '../../services/weatherService';

const EnhancedWeatherDashboard = ({ latitude, longitude, locationName }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsights, setAiInsights] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData();
      fetchAiInsights();
      fetchCropRecommendations();
    }
  }, [latitude, longitude]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentWeather, forecastData, historyData] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 14),
        weatherService.getWeatherHistory(latitude, longitude, 30)
      ]);

      if (currentWeather.success) {
        setWeatherData(currentWeather.data);
      }

      if (forecastData.success) {
        setForecast(forecastData.data.forecasts || []);
      }

      if (historyData.success) {
        setWeatherHistory(historyData.data.history || []);
      }

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    try {
      const response = await weatherService.getWeatherInsights(latitude, longitude);
      if (response.success) {
        setAiInsights(response.data);
      }
    } catch (err) {
      console.error('AI insights fetch error:', err);
    }
  };

  const fetchCropRecommendations = async () => {
    try {
      const response = await weatherService.getCropRecommendations(latitude, longitude);
      if (response.success) {
        setCropRecommendations(response.data.recommendations || []);
      }
    } catch (err) {
      console.error('Crop recommendations fetch error:', err);
    }
  };

  const getWeatherTrend = () => {
    if (weatherHistory.length < 7) return 'stable';
    
    const recent = weatherHistory.slice(-7);
    const avgTemp = recent.reduce((sum, day) => sum + day.temperature, 0) / 7;
    const earlier = weatherHistory.slice(-14, -7);
    const earlierAvgTemp = earlier.reduce((sum, day) => sum + day.temperature, 0) / 7;
    
    if (avgTemp > earlierAvgTemp + 2) return 'warming';
    if (avgTemp < earlierAvgTemp - 2) return 'cooling';
    return 'stable';
  };

  const getAgriculturalImpact = () => {
    if (!weatherData) return null;

    const impacts = [];
    
    // Temperature impacts
    if (weatherData.temperature > 35) {
      impacts.push({
        type: 'warning',
        icon: Thermometer,
        title: 'Heat Stress Risk',
        description: 'High temperatures may stress crops. Consider increasing irrigation.',
        severity: 'high'
      });
    }
    
    if (weatherData.temperature < 5) {
      impacts.push({
        type: 'warning',
        icon: Snowflake,
        title: 'Frost Risk',
        description: 'Low temperatures may damage sensitive crops. Consider protection measures.',
        severity: 'high'
      });
    }

    // Humidity impacts
    if (weatherData.humidity > 80) {
      impacts.push({
        type: 'caution',
        icon: Droplets,
        title: 'High Humidity',
        description: 'Increased risk of fungal diseases. Monitor crop health closely.',
        severity: 'medium'
      });
    }

    // Wind impacts
    if (weatherData.windSpeed > 25) {
      impacts.push({
        type: 'warning',
        icon: Wind,
        title: 'Strong Winds',
        description: 'High winds may damage crops. Secure loose structures.',
        severity: 'medium'
      });
    }

    // Precipitation impacts
    const todayForecast = forecast[0];
    if (todayForecast?.precipitation > 20) {
      impacts.push({
        type: 'info',
        icon: CloudRain,
        title: 'Heavy Rain Expected',
        description: 'Good for soil moisture but may delay field work.',
        severity: 'low'
      });
    }

    return impacts;
  };

  const renderOverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overview-tab"
    >
      <GoogleWeatherUI 
        latitude={latitude} 
        longitude={longitude} 
        locationName={locationName} 
      />

      {/* AI Insights Panel */}
      <motion.div 
        className="ai-insights-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="panel-header">
          <Bot className="w-6 h-6 text-blue-600" />
          <h3>AI Weather Insights</h3>
        </div>
        
        {aiInsights ? (
          <div className="insights-content">
            <div className="insight-item">
              <div className="insight-icon">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="insight-text">
                <h4>Weekly Outlook</h4>
                <p>{aiInsights.weeklyOutlook || 'Stable weather conditions expected'}</p>
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon">
                <Target className="w-5 h-5" />
              </div>
              <div className="insight-text">
                <h4>Best Field Work Days</h4>
                <p>{aiInsights.bestDays || 'Tuesday and Thursday look optimal'}</p>
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="insight-text">
                <h4>Irrigation Recommendation</h4>
                <p>{aiInsights.irrigation || 'Reduce watering by 30% this week'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="loading-insights">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="w-8 h-8 text-gray-400" />
            </motion.div>
            <p>AI analyzing weather patterns...</p>
          </div>
        )}
      </motion.div>

      {/* Agricultural Impact Alert */}
      {getAgriculturalImpact()?.length > 0 && (
        <motion.div 
          className="agricultural-alerts"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="alerts-header">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h3>Agricultural Impact Alerts</h3>
          </div>
          
          <div className="alerts-grid">
            {getAgriculturalImpact().map((impact, index) => (
              <motion.div
                key={index}
                className={`alert-card severity-${impact.severity}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <impact.icon className="w-5 h-5" />
                <div className="alert-content">
                  <h4>{impact.title}</h4>
                  <p>{impact.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderAnalyticsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="analytics-tab"
    >
      <div className="analytics-header">
        <div className="tab-controls">
          <button 
            className={selectedTimeframe === '7d' ? 'active' : ''}
            onClick={() => setSelectedTimeframe('7d')}
          >
            7 Days
          </button>
          <button 
            className={selectedTimeframe === '30d' ? 'active' : ''}
            onClick={() => setSelectedTimeframe('30d')}
          >
            30 Days
          </button>
          <button 
            className={selectedTimeframe === '90d' ? 'active' : ''}
            onClick={() => setSelectedTimeframe('90d')}
          >
            3 Months
          </button>
        </div>
      </div>

      {/* Weather Trends Chart */}
      <motion.div 
        className="chart-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="chart-header">
          <h3>Temperature & Precipitation Trends</h3>
          <div className="trend-indicator">
            {getWeatherTrend() === 'warming' && (
              <span className="trend warming">
                <ArrowUp className="w-4 h-4" /> Warming Trend
              </span>
            )}
            {getWeatherTrend() === 'cooling' && (
              <span className="trend cooling">
                <ArrowDown className="w-4 h-4" /> Cooling Trend
              </span>
            )}
            {getWeatherTrend() === 'stable' && (
              <span className="trend stable">
                <Activity className="w-4 h-4" /> Stable Pattern
              </span>
            )}
          </div>
        </div>
        
        <div className="chart-placeholder" ref={chartRef}>
          {/* Chart would be rendered here using Chart.js or similar */}
          <div className="chart-mock">
            <div className="chart-bars">
              {weatherHistory.slice(-7).map((day, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${Math.max(10, (day.temperature + 10) * 2)}px`,
                    backgroundColor: `hsl(${200 + day.temperature}, 70%, 50%)`
                  }}
                />
              ))}
            </div>
            <div className="chart-labels">
              {weatherHistory.slice(-7).map((day, index) => (
                <span key={index} className="chart-label">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weather Statistics */}
      <div className="weather-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Thermometer className="w-6 h-6 text-red-500" />
          </div>
          <div className="stat-content">
            <h4>Avg Temperature</h4>
            <div className="stat-value">
              {weatherHistory.length > 0 ? 
                Math.round(weatherHistory.reduce((sum, day) => sum + day.temperature, 0) / weatherHistory.length) 
                : 0}°C
            </div>
            <p className="stat-change">+2.1° vs last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CloudRain className="w-6 h-6 text-blue-500" />
          </div>
          <div className="stat-content">
            <h4>Total Rainfall</h4>
            <div className="stat-value">
              {weatherHistory.length > 0 ? 
                Math.round(weatherHistory.reduce((sum, day) => sum + (day.precipitation || 0), 0)) 
                : 0}mm
            </div>
            <p className="stat-change">-15mm vs last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Sun className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="stat-content">
            <h4>Sunny Days</h4>
            <div className="stat-value">
              {weatherHistory.filter(day => day.weather?.toLowerCase().includes('clear') || day.weather?.toLowerCase().includes('sunny')).length}
            </div>
            <p className="stat-change">+3 vs last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Eye className="w-6 h-6 text-purple-500" />
          </div>
          <div className="stat-content">
            <h4>Avg Humidity</h4>
            <div className="stat-value">
              {weatherHistory.length > 0 ? 
                Math.round(weatherHistory.reduce((sum, day) => sum + (day.humidity || 0), 0) / weatherHistory.length) 
                : 0}%
            </div>
            <p className="stat-change">-5% vs last month</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCropAdvisoryTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="crop-advisory-tab"
    >
      <div className="advisory-header">
        <Leaf className="w-6 h-6 text-green-600" />
        <h3>Weather-Based Crop Advisory</h3>
      </div>

      {/* Current Conditions Impact */}
      <div className="current-impact">
        <h4>Current Weather Impact on Crops</h4>
        <div className="impact-grid">
          <div className="impact-card positive">
            <Sprout className="w-8 h-8" />
            <div className="impact-content">
              <h5>Growth Conditions</h5>
              <p>Optimal temperature range for most crops</p>
              <span className="impact-score">Excellent</span>
            </div>
          </div>

          <div className="impact-card neutral">
            <Droplets className="w-8 h-8" />
            <div className="impact-content">
              <h5>Soil Moisture</h5>
              <p>Adequate moisture levels, monitor closely</p>
              <span className="impact-score">Good</span>
            </div>
          </div>

          <div className="impact-card warning">
            <Wind className="w-8 h-8" />
            <div className="impact-content">
              <h5>Wind Stress</h5>
              <p>Moderate winds may affect tall crops</p>
              <span className="impact-score">Caution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Recommendations */}
      <div className="crop-recommendations">
        <h4>Recommended Actions</h4>
        <div className="recommendations-list">
          {cropRecommendations.length > 0 ? cropRecommendations.map((rec, index) => (
            <motion.div
              key={index}
              className="recommendation-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="rec-priority">
                <span className={`priority-badge priority-${rec.priority}`}>
                  {rec.priority?.toUpperCase()}
                </span>
              </div>
              <div className="rec-content">
                <h5>{rec.title}</h5>
                <p>{rec.description}</p>
                {rec.weatherBased && (
                  <span className="weather-based-tag">
                    <Cloud className="w-4 h-4" />
                    Weather-based recommendation
                  </span>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="no-recommendations">
              <Leaf className="w-12 h-12 text-gray-300" />
              <p>No specific recommendations at this time. Current conditions are favorable.</p>
            </div>
          )}
        </div>
      </div>

      {/* Seasonal Planning */}
      <div className="seasonal-planning">
        <h4>Seasonal Planning Based on Weather Patterns</h4>
        <div className="planning-timeline">
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h5>Current Week</h5>
              <p>Focus on irrigation management and pest monitoring</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h5>Next 2 Weeks</h5>
              <p>Prepare for temperature changes, plan harvest timing</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h5>Next Month</h5>
              <p>Consider seasonal crop rotation based on climate trends</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'advisory', label: 'Crop Advisory', icon: Leaf }
  ];

  return (
    <div className="enhanced-weather-dashboard">
      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'advisory' && renderCropAdvisoryTab()}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .enhanced-weather-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-tabs {
          display: flex;
          gap: 4px;
          background: white;
          border-radius: 12px;
          padding: 6px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          color: #6b7280;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .tab-button:hover:not(.active) {
          background: #f3f4f6;
          color: #374151;
        }

        .tab-content {
          min-height: 600px;
        }

        .ai-insights-panel {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .insights-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #10b981;
        }

        .insight-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: #10b981;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .insight-text h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .insight-text p {
          margin: 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .loading-insights {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }

        .agricultural-alerts {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .alerts-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .alerts-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #d97706;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .alert-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .alert-card.severity-high {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .alert-card.severity-medium {
          background: #fffbeb;
          border: 1px solid #fed7aa;
          color: #d97706;
        }

        .alert-card.severity-low {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0369a1;
        }

        .alert-content h4 {
          margin: 0 0 4px 0;
          font-weight: 600;
        }

        .alert-content p {
          margin: 0;
          font-size: 0.875rem;
        }

        .analytics-tab {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .tab-controls {
          display: flex;
          gap: 8px;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .tab-controls button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .tab-controls button.active {
          background: white;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .trend.warming { color: #dc2626; }
        .trend.cooling { color: #2563eb; }
        .trend.stable { color: #059669; }

        .chart-mock {
          height: 200px;
          position: relative;
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .chart-bars {
          flex: 1;
          display: flex;
          align-items: end;
          justify-content: space-around;
          gap: 8px;
        }

        .chart-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          min-height: 20px;
          transition: all 0.3s ease;
        }

        .chart-bar:hover {
          opacity: 0.8;
        }

        .chart-labels {
          display: flex;
          justify-content: space-around;
          margin-top: 12px;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .weather-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .stat-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
        }

        .stat-content h4 {
          margin: 0 0 4px 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .stat-change {
          margin: 0;
          font-size: 0.75rem;
          color: #10b981;
        }

        .crop-advisory-tab {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .advisory-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .advisory-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .current-impact h4,
        .crop-recommendations h4,
        .seasonal-planning h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #111827;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .impact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid;
        }

        .impact-card.positive {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        }

        .impact-card.neutral {
          background: #fffbeb;
          border-color: #fed7aa;
          color: #d97706;
        }

        .impact-card.warning {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        .impact-content h5 {
          margin: 0 0 4px 0;
          font-weight: 600;
        }

        .impact-content p {
          margin: 0 0 8px 0;
          font-size: 0.875rem;
        }

        .impact-score {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .recommendation-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #10b981;
        }

        .rec-priority {
          flex-shrink: 0;
        }

        .priority-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-badge.priority-high {
          background: #dc2626;
          color: white;
        }

        .priority-badge.priority-medium {
          background: #d97706;
          color: white;
        }

        .priority-badge.priority-low {
          background: #10b981;
          color: white;
        }

        .rec-content h5 {
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .rec-content p {
          margin: 0 0 8px 0;
          color: #6b7280;
          line-height: 1.5;
        }

        .weather-based-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .no-recommendations {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .planning-timeline {
          position: relative;
        }

        .timeline-item {
          position: relative;
          padding-left: 40px;
          padding-bottom: 24px;
        }

        .timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 12px;
          top: 24px;
          bottom: -24px;
          width: 2px;
          background: #e5e7eb;
        }

        .timeline-marker {
          position: absolute;
          left: 0;
          top: 6px;
          width: 24px;
          height: 24px;
          background: #e5e7eb;
          border-radius: 50%;
        }

        .timeline-item.active .timeline-marker {
          background: #10b981;
        }

        .timeline-content h5 {
          margin: 0 0 8px 0;
          font-weight: 600;
        }

        .timeline-content p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .enhanced-weather-dashboard {
            padding: 16px;
          }

          .dashboard-tabs {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .dashboard-tabs::-webkit-scrollbar {
            display: none;
          }

          .tab-button {
            flex: none;
            white-space: nowrap;
          }

          .impact-grid,
          .weather-stats {
            grid-template-columns: 1fr;
          }

          .analytics-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedWeatherDashboard;