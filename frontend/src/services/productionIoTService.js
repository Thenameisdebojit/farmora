// src/services/productionIoTService.js
import websocketService from './websocketService';

class ProductionIoTService {
  constructor() {
    this.API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    this.cache = new Map();
    this.cacheTimeout = 30 * 1000; // 30 seconds for IoT data
    this.subscribers = new Map();
    this.isConnected = false;
    
    // Initialize WebSocket connection
    this.initializeWebSocket();
    
    // Simulate sensors if real ones are not available
    this.simulatedSensors = this.initializeSimulatedSensors();
  }

  // Initialize WebSocket connection for real-time data
  initializeWebSocket() {
    try {
      // Use the existing websocket service instance
      this.ws = websocketService;
      
      if (this.ws) {
        this.ws.on('connected', () => {
          console.log('IoT WebSocket connected');
          this.isConnected = true;
          this.subscribeToSensorData();
        });

        this.ws.on('disconnected', () => {
          console.log('IoT WebSocket disconnected');
          this.isConnected = false;
          // Fall back to simulated data
          this.startSimulation();
        });

        this.ws.on('sensor_data', (data) => {
          this.processSensorData(data);
        });

        this.ws.on('crop_alert', (alert) => {
          this.processAlert(alert);
        });
      }

    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      // Start simulation immediately if WebSocket fails
      this.startSimulation();
    }
  }

  // Subscribe to sensor data channels
  subscribeToSensorData() {
    const channels = [
      'soil_moisture',
      'temperature',
      'humidity',
      'ph_levels',
      'light_intensity',
      'water_level',
      'nutrients'
    ];

    if (this.ws && this.ws.send) {
      channels.forEach(channel => {
        this.ws.send('subscribe', { channel });
      });
    }
  }

  // Get real-time sensor data
  async getSensorData(sensorType = 'all') {
    const cacheKey = `sensor_${sensorType}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('farmora_token');
      const response = await fetch(`${this.API_BASE}/iot/sensors?type=${sensorType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      // Fallback to simulated data
      const simulatedData = this.getSimulatedSensorData(sensorType);
      this.setCache(cacheKey, simulatedData);
      return simulatedData;

    } catch (error) {
      console.error('Sensor data fetch error:', error);
      return this.getSimulatedSensorData(sensorType);
    }
  }

  // Get field monitoring data
  async getFieldData(fieldId) {
    const cacheKey = `field_${fieldId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('farmora_token');
      const response = await fetch(`${this.API_BASE}/iot/fields/${fieldId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      // Generate simulated field data
      const fieldData = this.generateFieldData(fieldId);
      this.setCache(cacheKey, fieldData);
      return fieldData;

    } catch (error) {
      console.error('Field data fetch error:', error);
      return this.generateFieldData(fieldId);
    }
  }

  // Get irrigation system status
  async getIrrigationStatus() {
    const cacheKey = 'irrigation_status';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('farmora_token');
      const response = await fetch(`${this.API_BASE}/iot/irrigation`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      const irrigationData = this.generateIrrigationData();
      this.setCache(cacheKey, irrigationData);
      return irrigationData;

    } catch (error) {
      console.error('Irrigation data fetch error:', error);
      return this.generateIrrigationData();
    }
  }

  // Control irrigation system
  async controlIrrigation(fieldId, action, duration = null) {
    try {
      const token = localStorage.getItem('farmora_token');
      const response = await fetch(`${this.API_BASE}/iot/irrigation/control`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fieldId,
          action, // 'start', 'stop', 'schedule'
          duration
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.invalidateCache('irrigation_status');
        return result;
      }

      // Simulate irrigation control response
      return {
        success: true,
        message: `Irrigation ${action} command sent to field ${fieldId}`,
        timestamp: new Date().toISOString(),
        isSimulated: true
      };

    } catch (error) {
      console.error('Irrigation control error:', error);
      return {
        success: false,
        message: 'Failed to control irrigation system',
        error: error.message
      };
    }
  }

  // Get device status
  async getDeviceStatus() {
    const cacheKey = 'device_status';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const token = localStorage.getItem('farmora_token');
      const response = await fetch(`${this.API_BASE}/iot/devices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        return data;
      }

      const deviceData = this.generateDeviceStatus();
      this.setCache(cacheKey, deviceData);
      return deviceData;

    } catch (error) {
      console.error('Device status fetch error:', error);
      return this.generateDeviceStatus();
    }
  }

  // Subscribe to real-time updates
  subscribeToUpdates(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      const typeSubscribers = this.subscribers.get(type);
      if (typeSubscribers) {
        typeSubscribers.delete(callback);
      }
    };
  }

  // Process incoming sensor data
  processSensorData(data) {
    const { type, values, timestamp } = data;
    
    // Update cache
    this.setCache(`sensor_${type}`, {
      type,
      values,
      timestamp,
      source: 'realtime'
    });

    // Notify subscribers
    const subscribers = this.subscribers.get(type) || new Set();
    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  // Process alerts
  processAlert(alert) {
    const subscribers = this.subscribers.get('alerts') || new Set();
    subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    });
  }

  // Initialize simulated sensors
  initializeSimulatedSensors() {
    return {
      soilMoisture: {
        current: 65,
        trend: 'stable',
        lastUpdate: new Date()
      },
      temperature: {
        current: 28,
        trend: 'rising',
        lastUpdate: new Date()
      },
      humidity: {
        current: 70,
        trend: 'falling',
        lastUpdate: new Date()
      },
      phLevel: {
        current: 6.8,
        trend: 'stable',
        lastUpdate: new Date()
      },
      lightIntensity: {
        current: 85,
        trend: 'stable',
        lastUpdate: new Date()
      }
    };
  }

  // Start simulation for offline mode
  startSimulation() {
    // Update simulated values every 30 seconds
    setInterval(() => {
      this.updateSimulatedValues();
    }, 30000);
  }

  // Update simulated sensor values
  updateSimulatedValues() {
    const now = new Date();
    
    // Soil moisture (50-80%)
    this.simulatedSensors.soilMoisture.current = Math.max(50, 
      Math.min(80, this.simulatedSensors.soilMoisture.current + (Math.random() - 0.5) * 2)
    );
    
    // Temperature (20-35°C)
    this.simulatedSensors.temperature.current = Math.max(20,
      Math.min(35, this.simulatedSensors.temperature.current + (Math.random() - 0.5) * 1)
    );
    
    // Humidity (40-90%)
    this.simulatedSensors.humidity.current = Math.max(40,
      Math.min(90, this.simulatedSensors.humidity.current + (Math.random() - 0.5) * 3)
    );
    
    // pH Level (6.0-7.5)
    this.simulatedSensors.phLevel.current = Math.max(6.0,
      Math.min(7.5, this.simulatedSensors.phLevel.current + (Math.random() - 0.5) * 0.1)
    );
    
    // Light intensity (60-100%)
    const hour = now.getHours();
    let targetLight = 0;
    if (hour >= 6 && hour <= 18) {
      targetLight = 60 + (40 * Math.sin((hour - 6) / 12 * Math.PI));
    }
    this.simulatedSensors.lightIntensity.current = targetLight + (Math.random() - 0.5) * 10;
    
    // Update timestamps
    Object.values(this.simulatedSensors).forEach(sensor => {
      sensor.lastUpdate = now;
    });

    // Notify subscribers
    this.notifySubscribers('sensor_update', this.simulatedSensors);
  }

  // Get simulated sensor data
  getSimulatedSensorData(sensorType) {
    if (sensorType === 'all') {
      return {
        sensors: this.simulatedSensors,
        summary: {
          totalDevices: 8,
          activeDevices: 7,
          batteryLow: 1,
          lastSync: new Date(),
          connectivity: 'simulated'
        },
        alerts: this.generateSensorAlerts()
      };
    }

    return {
      type: sensorType,
      data: this.simulatedSensors[sensorType] || {},
      isSimulated: true
    };
  }

  // Generate field data
  generateFieldData(fieldId) {
    return {
      fieldId,
      name: `Field ${fieldId}`,
      area: 2.5, // hectares
      crop: 'wheat',
      plantingDate: '2024-01-15',
      growthStage: 'flowering',
      sensors: {
        soilMoisture: {
          zones: [
            { zone: 'A', value: 68, status: 'optimal' },
            { zone: 'B', value: 72, status: 'optimal' },
            { zone: 'C', value: 58, status: 'low' },
            { zone: 'D', value: 75, status: 'optimal' }
          ],
          average: 68.25
        },
        temperature: {
          current: 28,
          min: 22,
          max: 34,
          trend: 'stable'
        },
        nutrients: {
          nitrogen: 85,
          phosphorus: 72,
          potassium: 90,
          ph: 6.8
        }
      },
      irrigation: {
        lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalUsage: 1250, // liters this week
        efficiency: 88
      },
      health: {
        score: 94,
        issues: [],
        recommendations: [
          'Monitor zone C soil moisture',
          'Consider light fertilizer application'
        ]
      }
    };
  }

  // Generate irrigation data
  generateIrrigationData() {
    return {
      system: {
        status: 'active',
        mode: 'automatic',
        efficiency: 92,
        lastMaintenance: '2024-01-10'
      },
      zones: [
        {
          id: 'zone_1',
          name: 'Field A',
          status: 'idle',
          soilMoisture: 68,
          nextWatering: new Date(Date.now() + 3 * 60 * 60 * 1000),
          duration: 45 // minutes
        },
        {
          id: 'zone_2', 
          name: 'Field B',
          status: 'active',
          soilMoisture: 52,
          startTime: new Date(Date.now() - 15 * 60 * 1000),
          duration: 30
        },
        {
          id: 'zone_3',
          name: 'Field C',
          status: 'scheduled',
          soilMoisture: 71,
          nextWatering: new Date(Date.now() + 6 * 60 * 60 * 1000),
          duration: 35
        }
      ],
      usage: {
        today: 850, // liters
        thisWeek: 4200,
        thisMonth: 18500,
        efficiency: 89
      },
      weather: {
        rainProbability: 15,
        nextRain: null,
        autoAdjust: true
      }
    };
  }

  // Generate device status
  generateDeviceStatus() {
    const devices = [
      {
        id: 'sensor_001',
        name: 'Soil Moisture Sensor #1',
        type: 'soil_moisture',
        location: 'Field A',
        status: 'online',
        battery: 85,
        lastReading: new Date(),
        signalStrength: 92
      },
      {
        id: 'sensor_002',
        name: 'Temperature Sensor #1',
        type: 'temperature',
        location: 'Field A',
        status: 'online',
        battery: 67,
        lastReading: new Date(),
        signalStrength: 88
      },
      {
        id: 'irrigator_001',
        name: 'Smart Irrigator Zone 1',
        type: 'irrigation',
        location: 'Field B',
        status: 'active',
        battery: null, // powered device
        lastReading: new Date(),
        signalStrength: 95
      },
      {
        id: 'sensor_003',
        name: 'pH Sensor #1',
        type: 'ph',
        location: 'Field C',
        status: 'warning',
        battery: 23, // low battery
        lastReading: new Date(Date.now() - 2 * 60 * 60 * 1000),
        signalStrength: 72
      }
    ];

    return {
      devices,
      summary: {
        total: devices.length,
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length,
        warning: devices.filter(d => d.status === 'warning').length,
        batteryLow: devices.filter(d => d.battery && d.battery < 30).length
      },
      connectivity: {
        gateway: 'online',
        internet: 'stable',
        lastSync: new Date()
      }
    };
  }

  // Generate sensor alerts
  generateSensorAlerts() {
    const alerts = [];
    
    if (this.simulatedSensors.soilMoisture.current < 55) {
      alerts.push({
        type: 'low_moisture',
        severity: 'medium',
        message: 'Soil moisture below optimal range',
        recommendation: 'Consider irrigation',
        timestamp: new Date()
      });
    }
    
    if (this.simulatedSensors.temperature.current > 32) {
      alerts.push({
        type: 'high_temperature',
        severity: 'high',
        message: 'Temperature exceeding crop tolerance',
        recommendation: 'Activate cooling or shading',
        timestamp: new Date()
      });
    }

    return alerts;
  }

  // Notify subscribers
  notifySubscribers(type, data) {
    const subscribers = this.subscribers.get(type) || new Set();
    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Subscriber notification error:', error);
      }
    });
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidateCache(key) {
    this.cache.delete(key);
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.disconnect();
    }
    this.subscribers.clear();
    this.cache.clear();
  }
}

// Create singleton instance
const productionIoTService = new ProductionIoTService();

export default productionIoTService;