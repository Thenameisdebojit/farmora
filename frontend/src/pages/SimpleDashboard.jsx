// src/pages/SimpleDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, MapPin } from 'lucide-react';

const SimpleDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper function to safely display object data
  const getLocationDisplay = (location) => {
    if (!location) return 'Smart Farm';
    
    if (typeof location === 'string') {
      return location;
    }
    
    if (typeof location === 'object') {
      // Try to extract a meaningful location string
      if (location.address) {
        return location.address.district || 
               location.address.city || 
               location.address.state || 
               'Smart Farm';
      }
      
      // If it's an object without address, try coordinates
      if (location.coordinates) {
        return `Lat: ${location.coordinates.latitude?.toFixed(2) || 'N/A'}, Lng: ${location.coordinates.longitude?.toFixed(2) || 'N/A'}`;
      }
      
      // Fallback for unknown object structure
      return 'Smart Farm';
    }
    
    return 'Smart Farm';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name || 'Farmer'}! 🌾
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <MapPin size={16} className="mr-1" />
                {getLocationDisplay(user?.location)}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User size={16} />
                <span>{user?.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* User Info Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Your Profile</h3>
              <div className="space-y-2">
                <p className="text-sm text-green-700">
                  <strong>Name:</strong> {user?.name || 'N/A'}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Email:</strong> {user?.email || 'N/A'}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Phone:</strong> {user?.phone || 'N/A'}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Role:</strong> {user?.role || 'Farmer'}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Location:</strong> {getLocationDisplay(user?.location)}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Farm Overview</h3>
              <div className="space-y-2">
                <p className="text-sm text-blue-700">Weather: Sunny</p>
                <p className="text-sm text-blue-700">Temperature: 28°C</p>
                <p className="text-sm text-blue-700">Humidity: 65%</p>
                <p className="text-sm text-blue-700">Soil Moisture: 72%</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm text-purple-700 hover:bg-purple-100 rounded transition-colors">
                  View Weather Forecast
                </button>
                <button className="w-full text-left p-2 text-sm text-purple-700 hover:bg-purple-100 rounded transition-colors">
                  Check Crop Health
                </button>
                <button className="w-full text-left p-2 text-sm text-purple-700 hover:bg-purple-100 rounded transition-colors">
                  Schedule Irrigation
                </button>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Authentication Status</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?._id || user?.id || 'N/A'}</p>
              <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;