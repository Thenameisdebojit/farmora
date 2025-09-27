// frontend/src/services/notificationService.js
// Real Firebase notification service
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import apiService from './api';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

class NotificationService {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.currentToken = null;
    this.isSupported = false;
    this.isInitialized = false;
    this.notificationListeners = new Set();
    this.permissionStatus = 'default';
    
    // Initialize service
    this.initialize();
  }

  // Initialize Firebase and messaging
  async initialize() {
    try {
      console.log('Firebase notification service initializing...');
      
      // Check if Firebase config is available
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('your_')) {
        console.warn('Firebase configuration missing or using placeholder values. Push notifications will be disabled.');
        this.isSupported = false;
        return;
      }

      // Check if push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported in this browser');
        this.isSupported = false;
        return;
      }

      // Initialize Firebase
      this.app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(this.app);
      this.isSupported = true;

      // Set up message listener
      this.setupMessageListener();

      // Check current permission status
      this.permissionStatus = await this.getPermissionStatus();

      this.isInitialized = true;
      console.log('Firebase notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase notification service:', error);
      this.isSupported = false;
    }
  }

  // Mock get permission status method
  async getPermissionStatus() {
    if (typeof Notification !== 'undefined') {
      return Notification.permission;
    }
    return 'default';
  }

  // Request notification permission and get FCM token
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    try {
      console.log('Requesting notification permission...');
      
      // Request permission
      const permission = await Notification.requestPermission();
      this.permissionStatus = permission;

      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get registration token
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const token = await getToken(this.messaging, {
        vapidKey: vapidKey
      });

      if (token) {
        this.currentToken = token;
        
        // Register token with backend - get user from localStorage for now
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        
        if (user && user.id) {
          await this.registerTokenWithServer(user.id, token);
        }

        console.log('FCM token generated and registered:', token);
        return token;
      } else {
        throw new Error('No registration token available');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  // Register FCM token with server
  async registerTokenWithServer(userId, token) {
    try {
      const deviceInfo = {
        platform: 'web',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await apiService.registerFCMToken(userId, token, deviceInfo);
      console.log('FCM token registered with server');
    } catch (error) {
      console.error('Error registering token with server:', error);
      throw error;
    }
  }

  // Unregister FCM token
  async unregisterToken() {
    if (!this.currentToken || !this.isSupported) {
      return;
    }

    try {
      console.log('Unregistering FCM token...');
      
      // Delete token from Firebase
      await deleteToken(this.messaging);

      // Unregister from server
      const savedUser = localStorage.getItem('user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      
      if (user && user.id) {
        await apiService.unregisterFCMToken(user.id, this.currentToken);
      }

      this.currentToken = null;
      console.log('FCM token unregistered successfully');
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
      throw error;
    }
  }

  // Set up message listener for foreground messages
  setupMessageListener() {
    if (!this.messaging) return;

    console.log('Setting up Firebase message listener...');
    
    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Handle the message
      this.handleForegroundMessage(payload);
      
      // Notify listeners
      this.notifyListeners('message', payload);
    });
  }

  // Handle foreground messages
  handleForegroundMessage(payload) {
    const { notification, data } = payload;
    
    if (notification) {
      // Show browser notification
      this.showBrowserNotification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icons/notification-icon.png',
        badge: notification.badge || '/icons/badge-icon.png',
        image: notification.image,
        data: data,
        tag: data?.notificationId || 'default',
        requireInteraction: data?.priority === 'high'
      });
    }
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if (this.permissionStatus !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        ...options,
        onclick: (event) => {
          event.preventDefault();
          
          // Handle notification click
          this.handleNotificationClick(event.target.data);
          
          // Close notification
          event.target.close();
        }
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  // Handle notification click
  handleNotificationClick(data) {
    try {
      // Focus the window
      window.focus();

      // Navigate based on notification data
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.action) {
        // Handle specific actions
        this.handleNotificationAction(data.action, data);
      }

      // Mark notification as read if ID is provided
      if (data?.notificationId) {
        this.markNotificationAsRead(data.notificationId);
      }

      // Notify listeners
      this.notifyListeners('click', data);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  }

  // Handle notification actions
  handleNotificationAction(action, data) {
    switch (action) {
      case 'view_weather':
        window.location.href = '/weather';
        break;
      case 'view_advisory':
        window.location.href = '/advisory';
        break;
      case 'view_market':
        window.location.href = '/market';
        break;
      case 'view_pest':
        window.location.href = '/pest-detection';
        break;
      case 'view_irrigation':
        window.location.href = '/irrigation';
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      await apiService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Get current permission status
  async getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Check if notifications are enabled
  isNotificationEnabled() {
    return this.permissionStatus === 'granted' && this.currentToken !== null;
  }

  // Get current token
  getCurrentToken() {
    return this.currentToken;
  }

  // Send test notification
  async sendTestNotification() {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      await apiService.sendTestNotification(user.id, 'push');
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.notificationListeners.add(callback);
    
    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.notificationListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  // Local notification management
  
  // Store notification locally
  storeNotificationLocally(notification) {
    try {
      const stored = JSON.parse(localStorage.getItem('localNotifications') || '[]');
      stored.unshift({
        ...notification,
        id: notification.id || Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false
      });
      
      // Keep only latest 50 notifications
      const limited = stored.slice(0, 50);
      localStorage.setItem('localNotifications', JSON.stringify(limited));
      
      return limited[0];
    } catch (error) {
      console.error('Error storing notification locally:', error);
      return null;
    }
  }

  // Get local notifications
  getLocalNotifications() {
    try {
      return JSON.parse(localStorage.getItem('localNotifications') || '[]');
    } catch (error) {
      console.error('Error getting local notifications:', error);
      return [];
    }
  }

  // Mark local notification as read
  markLocalNotificationRead(notificationId) {
    try {
      const notifications = this.getLocalNotifications();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('localNotifications', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error marking local notification as read:', error);
      return this.getLocalNotifications();
    }
  }

  // Clear all local notifications
  clearLocalNotifications() {
    localStorage.removeItem('localNotifications');
  }

  // Get unread notification count
  getUnreadCount() {
    const local = this.getLocalNotifications();
    return local.filter(n => !n.read).length;
  }

  // Notification preferences management
  
  // Get notification preferences
  async getPreferences() {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await apiService.getNotificationPreferences(user.id);
      return response.preferences;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      // Return default preferences
      return {
        email: true,
        sms: false,
        push: true,
        categories: {
          weather: true,
          advisory: true,
          market: true,
          pest: true,
          irrigation: true
        }
      };
    }
  }

  // Update notification preferences
  async updatePreferences(preferences) {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await apiService.updateNotificationPreferences(user.id, preferences);
      return response.preferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Utility methods
  
  // Check if service worker is registered
  async isServiceWorkerRegistered() {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    } catch (error) {
      console.error('Error checking service worker:', error);
      return false;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  // Get service information
  getServiceInfo() {
    return {
      isSupported: this.isSupported,
      isInitialized: this.isInitialized,
      permissionStatus: this.permissionStatus,
      hasToken: !!this.currentToken,
      tokenInfo: this.currentToken ? {
        length: this.currentToken.length,
        prefix: this.currentToken.substring(0, 10) + '...'
      } : null
    };
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Export utilities for notification handling
export const NotificationUtils = {
  // Format notification for display
  formatNotification: (notification) => ({
    ...notification,
    timestamp: new Date(notification.timestamp),
    timeAgo: NotificationUtils.getTimeAgo(notification.timestamp),
    isRecent: Date.now() - new Date(notification.timestamp).getTime() < 24 * 60 * 60 * 1000
  }),

  // Get relative time string
  getTimeAgo: (timestamp) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  },

  // Group notifications by date
  groupNotificationsByDate: (notifications) => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifications.forEach(notification => {
      const date = new Date(notification.timestamp).toDateString();
      let groupKey;

      if (date === today) {
        groupKey = 'Today';
      } else if (date === yesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = new Date(notification.timestamp).toLocaleDateString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  },

  // Get notification priority class
  getPriorityClass: (priority) => {
    switch (priority) {
      case 'high': return 'notification-high';
      case 'medium': return 'notification-medium';
      case 'low': return 'notification-low';
      default: return 'notification-normal';
    }
  },

  // Get notification type icon
  getTypeIcon: (type) => {
    const icons = {
      weather: '🌤️',
      advisory: '📋',
      market: '📈',
      pest: '🐛',
      irrigation: '💧',
      alert: '⚠️',
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || '🔔';
  }
};