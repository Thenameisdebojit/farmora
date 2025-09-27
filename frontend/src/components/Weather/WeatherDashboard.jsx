// src/components/Weather/WeatherDashboard.jsx - Enhanced Weather Dashboard for Farmora
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import EnhancedWeatherDashboard from './EnhancedWeatherDashboard';
import geolocationService from '../../services/geolocationService';

const WeatherDashboard = () => {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      
      // Try to get user's current location
      const userLocation = await geolocationService.getCurrentLocation();
      
      if (userLocation) {
        setLocation(userLocation);
        // Get location name from coordinates
        const locationInfo = await geolocationService.getLocationName(
          userLocation.latitude, 
          userLocation.longitude
        );
        setLocationName(locationInfo || 'Current Location');
      } else {
        // Fallback to default location (farm location)
        setLocation({ latitude: 20.2961, longitude: 85.8245 });
        setLocationName('Jatani, Odisha');
      }
    } catch (error) {
      console.error('Location initialization error:', error);
      // Use default location
      setLocation({ latitude: 20.2961, longitude: 85.8245 });
      setLocationName('Jatani, Odisha');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading weather dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Farmora Weather Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced weather analytics and agricultural insights powered by AI
          </p>
        </div>
        
        <EnhancedWeatherDashboard 
          latitude={location?.latitude}
          longitude={location?.longitude}
          locationName={locationName}
        />
      </div>
    </div>
  );
};

export default WeatherDashboard;
