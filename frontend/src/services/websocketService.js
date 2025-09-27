// src/services/websocketService.js
// Real-time WebSocket service for live data updates
import { useAuth } from '../hooks/useAuth.jsx';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
    this.pingInterval = 30000; // 30 seconds
    this.pingTimer = null;
    
    // Event listeners
    this.eventListeners = new Map();
    
    // Message queue for when disconnected
    this.messageQueue = [];
    
    this.connect();
  }

  // Connect to WebSocket server
  connect(userId = null) {
    try {
      // Get user ID from localStorage if not provided
      if (!userId) {
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        userId = user?.id;
      }

      const wsUrl = userId ? `${WS_URL}?userId=${userId}` : WS_URL;
      console.log('Connecting to WebSocket:', wsUrl);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Start ping/pong mechanism
        this.startPing();
        
        // Send queued messages
        this.sendQueuedMessages();
        
        // Emit connection event
        this.emit('connected', { timestamp: Date.now() });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopPing();
        
        // Emit disconnection event
        this.emit('disconnected', { 
          code: event.code, 
          reason: event.reason,
          timestamp: Date.now()
        });

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload, timestamp } = data;

    switch (type) {
      case 'weather_update':
        this.emit('weather_update', payload);
        break;
      
      case 'market_prices':
        this.emit('market_prices', payload);
        break;
      
      case 'crop_alert':
        this.emit('crop_alert', payload);
        break;
      
      case 'irrigation_status':
        this.emit('irrigation_status', payload);
        break;
      
      case 'consultation_request':
        this.emit('consultation_request', payload);
        break;
      
      case 'consultation_status':
        this.emit('consultation_status', payload);
        break;
      
      case 'ai_recommendation':
        this.emit('ai_recommendation', payload);
        break;
      
      case 'system_notification':
        this.emit('system_notification', payload);
        break;
      
      case 'pong':
        // Handle pong response
        console.log('Received pong from server');
        break;
      
      case 'user_joined':
        this.emit('user_joined', payload);
        break;
      
      case 'user_left':
        this.emit('user_left', payload);
        break;
      
      default:
        console.log('Unknown message type:', type, payload);
        this.emit('unknown_message', { type, payload });
    }

    // Emit general message event
    this.emit('message', { type, payload, timestamp });
  }

  // Send message to server
  send(type, payload = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now()
    };

    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
      console.log('WebSocket not connected, queuing message:', type);
    }
  }

  // Send queued messages
  sendQueuedMessages() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.socket.send(JSON.stringify(message));
    }
  }

  // Subscribe to weather updates for specific location
  subscribeToWeather(latitude, longitude) {
    this.send('subscribe_weather', { latitude, longitude });
  }

  // Subscribe to market price updates
  subscribeToMarketPrices(crops = []) {
    this.send('subscribe_market_prices', { crops });
  }

  // Subscribe to crop alerts
  subscribeToCropAlerts(userId, crops = []) {
    this.send('subscribe_crop_alerts', { userId, crops });
  }

  // Subscribe to irrigation updates
  subscribeToIrrigation(deviceIds = []) {
    this.send('subscribe_irrigation', { deviceIds });
  }

  // Subscribe to consultation updates
  subscribeToConsultations(userId) {
    this.send('subscribe_consultations', { userId });
  }

  // Join consultation room
  joinConsultation(consultationId, role = 'farmer') {
    this.send('join_consultation', { consultationId, role });
  }

  // Leave consultation room
  leaveConsultation(consultationId) {
    this.send('leave_consultation', { consultationId });
  }

  // Send chat message in consultation
  sendConsultationMessage(consultationId, message) {
    this.send('consultation_message', { consultationId, message });
  }

  // Request AI recommendations
  requestAIRecommendation(context) {
    this.send('request_ai_recommendation', context);
  }

  // Update user location
  updateLocation(latitude, longitude) {
    this.send('update_location', { latitude, longitude });
  }

  // Ping/Pong mechanism for connection health
  startPing() {
    this.pingTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('ping');
      }
    }, this.pingInterval);
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Reconnection logic
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        console.log(`Attempting WebSocket reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }
    }, delay);
  }

  // Disconnect and clean up
  disconnect() {
    console.log('Disconnecting WebSocket...');
    
    this.stopPing();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.eventListeners.clear();
    this.messageQueue = [];
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }

  // Utility method to check if specific feature is supported
  isFeatureSupported(feature) {
    const supportedFeatures = [
      'weather_updates',
      'market_prices', 
      'crop_alerts',
      'irrigation_status',
      'consultation_messages',
      'ai_recommendations',
      'system_notifications'
    ];
    
    return supportedFeatures.includes(feature);
  }
}

// Create and export singleton instance
const websocketService = new WebSocketService();

// Handle page visibility changes to manage connection
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !websocketService.isConnected) {
      console.log('Page became visible, reconnecting WebSocket...');
      websocketService.connect();
    }
  });
}

// Handle beforeunload to clean up
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    websocketService.disconnect();
  });
}

export default websocketService;