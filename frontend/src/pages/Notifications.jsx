// frontend/src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Filter,
  Search,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  Cloud,
  TrendingUp,
  Bug,
  Droplets,
  Video,
  Calendar,
  Trash2,
  MailOpen
} from 'lucide-react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const notificationTypes = [
    { id: 'all', label: 'All Notifications', icon: Bell },
    { id: 'weather', label: 'Weather Alerts', icon: Cloud },
    { id: 'market', label: 'Market Updates', icon: TrendingUp },
    { id: 'pest', label: 'Pest Alerts', icon: Bug },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets },
    { id: 'consultation', label: 'Consultations', icon: Video }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock notifications data
      const mockNotifications = [
        {
          id: '1',
          type: 'weather',
          title: 'Heavy Rainfall Alert',
          message: 'Heavy rainfall expected in your area tomorrow. Secure your crops and ensure proper drainage systems are in place.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          priority: 'high',
          actionUrl: '/weather'
        },
        {
          id: '2',
          type: 'market',
          title: 'Price Increase Alert',
          message: 'Wheat prices increased by 5% in your local market. Current rate: ₹2,150 per quintal.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          priority: 'medium',
          actionUrl: '/market'
        },
        {
          id: '3',
          type: 'irrigation',
          title: 'Low Soil Moisture Detected',
          message: 'Field A sensor shows soil moisture at 18%. Irrigation recommended within next 2 hours.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          priority: 'high',
          actionUrl: '/irrigation'
        },
        {
          id: '4',
          type: 'pest',
          title: 'Pest Outbreak Warning',
          message: 'Aphid infestation reported 5km from your location. Monitor your crops closely and consider preventive measures.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          priority: 'medium',
          actionUrl: '/pest-detection'
        },
        {
          id: '5',
          type: 'consultation',
          title: 'Upcoming Consultation',
          message: 'Your consultation with Dr. Priya Sharma is scheduled for tomorrow at 2:00 PM. Prepare your questions.',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          priority: 'low',
          actionUrl: '/consultation'
        },
        {
          id: '6',
          type: 'weather',
          title: 'Temperature Warning',
          message: 'High temperatures (42°C) expected for next 3 days. Increase irrigation frequency and provide shade.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          priority: 'medium',
          actionUrl: '/weather'
        },
        {
          id: '7',
          type: 'market',
          title: 'Best Time to Sell',
          message: 'Market analysis suggests selling your cotton stock within next week for optimal profits.',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          priority: 'low',
          actionUrl: '/market'
        },
        {
          id: '8',
          type: 'irrigation',
          title: 'Irrigation Schedule Complete',
          message: 'Automated irrigation for Field B completed successfully. 150L water used over 15 minutes.',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          priority: 'low',
          actionUrl: '/irrigation'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const typeMap = {
      weather: Cloud,
      market: TrendingUp,
      pest: Bug,
      irrigation: Droplets,
      consultation: Video
    };
    
    const IconComponent = typeMap[type] || Info;
    return <IconComponent size={20} />;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') {
      return 'text-red-600 bg-red-100';
    }
    
    const colorMap = {
      weather: 'text-blue-600 bg-blue-100',
      market: 'text-green-600 bg-green-100',
      pest: 'text-red-600 bg-red-100',
      irrigation: 'text-blue-600 bg-blue-100',
      consultation: 'text-purple-600 bg-purple-100'
    };
    
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - time) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      // In a real app, you'd make an API call here
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => 
        selectedNotifications.includes(notif.id) 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setSelectedNotifications([]);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with important alerts and updates ({unreadCount} unread)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedNotifications.length > 0 && (
            <>
              <button
                onClick={markSelectedAsRead}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Check size={14} />
                <span>Mark Read</span>
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={16} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            
            <div className="p-4">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filters */}
              <div className="space-y-2">
                {notificationTypes.map(type => {
                  const Icon = type.icon;
                  const count = type.id === 'all' 
                    ? notifications.length 
                    : notifications.filter(n => n.type === type.id).length;
                  
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFilter(type.id)}
                      className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
                        filter === type.id
                          ? 'bg-green-100 text-green-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3">
          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedNotifications([])}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border transition-all ${
                    !notification.isRead 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200'
                  } ${
                    selectedNotifications.includes(notification.id)
                      ? 'ring-2 ring-green-500'
                      : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />

                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'} mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatTime(notification.timestamp)}</span>
                              <span className="capitalize">{notification.type}</span>
                              <span className="capitalize">{notification.priority} priority</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete notification"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && (
                          <div className="mt-3">
                            <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                              View Details →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your filters or search terms.' 
                    : 'You\'ll see your notifications here when you receive them.'
                  }
                </p>
                {(searchTerm || filter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Load More */}
          {filteredNotifications.length > 0 && (
            <div className="mt-8 text-center">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Load More Notifications
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Weather Alerts</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Market Updates</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Pest Alerts</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Irrigation Reminders</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Consultation Reminders</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="ml-2 text-gray-700">Push Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="ml-2 text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="ml-2 text-gray-700">SMS</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
