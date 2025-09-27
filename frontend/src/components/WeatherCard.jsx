// frontend/src/components/WeatherCard.jsx
import React from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind,
  Eye,
  Gauge,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

const WeatherCard = ({ weather, forecast, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (weatherMain, size = 32) => {
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <Sun size={size} className="text-yellow-500" />;
      case 'clouds':
        return <Cloud size={size} className="text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain size={size} className="text-blue-500" />;
      default:
        return <Cloud size={size} className="text-gray-500" />;
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'text-red-600';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-green-600';
    return 'text-blue-600';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md overflow-hidden">
      {/* Current Weather Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Current Weather</h2>
          <span className="text-sm text-gray-500">
            Updated {weather?.timestamp ? formatTime(weather.timestamp) : 'Recently'}
          </span>
        </div>

        {weather && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Weather Display */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getWeatherIcon(weather.weather, 64)}
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                    {Math.round(weather.temperature)}°
                  </span>
                  <span className="text-gray-500">C</span>
                </div>
                <p className="text-gray-700 capitalize font-medium">
                  {weather.description}
                </p>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                <Droplets className="text-blue-500" size={18} />
                <div>
                  <p className="text-gray-500">Humidity</p>
                  <p className="font-semibold">{weather.humidity}%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                <Wind className="text-gray-600" size={18} />
                <div>
                  <p className="text-gray-500">Wind Speed</p>
                  <p className="font-semibold">{weather.windSpeed} km/h</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                <Eye className="text-purple-500" size={18} />
                <div>
                  <p className="text-gray-500">Visibility</p>
                  <p className="font-semibold">{weather.visibility / 1000} km</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                <Gauge className="text-green-600" size={18} />
                <div>
                  <p className="text-gray-500">Pressure</p>
                  <p className="font-semibold">{weather.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Farming Advisory */}
        {weather?.farmingAdvisory && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Farming Advisory</h4>
                <p className="text-yellow-700 text-sm">{weather.farmingAdvisory}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5-Day Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="border-t border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">5-Day Forecast</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {forecast.slice(0, 5).map((day, index) => (
              <div key={index} className="text-center p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">
                  {formatDate(day.date)}
                </p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.weather, 24)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {Math.round(day.tempMax)}°
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(day.tempMin)}°
                  </p>
                </div>
                {day.precipitation > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {Math.round(day.precipitation)}mm
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Alerts */}
      {weather?.alerts && weather.alerts.length > 0 && (
        <div className="border-t border-white/20 p-6">
          <h4 className="font-medium text-gray-900 mb-3">Weather Alerts</h4>
          <div className="space-y-2">
            {weather.alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'high' 
                    ? 'bg-red-50 border-red-400' 
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle 
                    className={
                      alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                    } 
                    size={16} 
                  />
                  <span className={`text-sm font-medium ${
                    alert.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  alert.severity === 'high' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
