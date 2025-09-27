// backend/src/services/iotService.js
const axios = require('axios');

class IoTService {
  constructor() {
    this.devices = new Map(); // In-memory device registry
    this.sensorData = new Map(); // Mock sensor data storage
    this.initializeMockData();
  }

  async getSoilMoistureData(sensorId) {
    try {
      // Mock implementation - in production, this would connect to IoT platform
      const deviceData = this.sensorData.get(sensorId);
      
      if (!deviceData) {
        throw new Error('Device not found');
      }

      const currentMoisture = this.generateRealisticMoisture(deviceData.lastMoisture);
      const history = this.generateMoistureHistory(currentMoisture);

      // Update last known value
      deviceData.lastMoisture = currentMoisture;
      deviceData.lastUpdate = new Date();

      return {
        current: currentMoisture,
        history: history,
        unit: 'percentage',
        timestamp: new Date().toISOString(),
        sensorStatus: 'active'
      };
    } catch (error) {
      console.error('Get soil moisture error:', error);
      throw new Error('Failed to retrieve soil moisture data');
    }
  }

  async updateDeviceSettings(sensorId, settings) {
    try {
      const device = this.devices.get(sensorId);
      
      if (!device) {
        throw new Error('Device not found');
      }

      // Mock device settings update
      Object.assign(device.settings, settings);
      device.lastUpdated = new Date();

      // In production, this would send commands to the physical device
      console.log(`Device ${sensorId} settings updated:`, settings);

      return {
        success: true,
        updatedSettings: device.settings,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Update device settings error:', error);
      throw new Error('Failed to update device settings');
    }
  }

  async triggerIrrigation(sensorId, duration) {
    try {
      const device = this.devices.get(sensorId);
      
      if (!device) {
        throw new Error('Device not found');
      }

      // Mock irrigation trigger
      const irrigationEvent = {
        sensorId,
        startTime: new Date(),
        duration: duration, // in minutes
        status: 'active',
        waterFlowRate: device.settings.waterFlowRate || 10 // liters per minute
      };

      // Store irrigation event
      if (!device.irrigationHistory) {
        device.irrigationHistory = [];
      }
      device.irrigationHistory.push(irrigationEvent);

      // Simulate irrigation completion after specified duration
      setTimeout(() => {
        irrigationEvent.endTime = new Date();
        irrigationEvent.status = 'completed';
        irrigationEvent.actualDuration = duration;
        irrigationEvent.waterUsed = duration * irrigationEvent.waterFlowRate;
        
        // Increase soil moisture after irrigation
        const sensorData = this.sensorData.get(sensorId);
        if (sensorData) {
          sensorData.lastMoisture = Math.min(100, sensorData.lastMoisture + 20);
        }
      }, duration * 1000); // Convert minutes to milliseconds for demo (in real scenario, this would be actual minutes)

      return {
        success: true,
        irrigationId: irrigationEvent.startTime.getTime().toString(),
        estimatedWaterUsage: duration * irrigationEvent.waterFlowRate,
        startTime: irrigationEvent.startTime.toISOString()
      };
    } catch (error) {
      console.error('Trigger irrigation error:', error);
      throw new Error('Failed to trigger irrigation');
    }
  }

  async getIrrigationHistory(deviceIds, startDate, endDate) {
    try {
      const history = [];
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      deviceIds.forEach(deviceId => {
        const device = this.devices.get(deviceId);
        if (device && device.irrigationHistory) {
          const deviceHistory = device.irrigationHistory.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= start && eventDate <= end;
          });

          history.push(...deviceHistory.map(event => ({
            ...event,
            deviceName: device.name
          })));
        }
      });

      return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    } catch (error) {
      console.error('Get irrigation history error:', error);
      throw new Error('Failed to retrieve irrigation history');
    }
  }

  async getDeviceStatus(sensorId) {
    try {
      const device = this.devices.get(sensorId);
      
      if (!device) {
        throw new Error('Device not found');
      }

      return {
        sensorId,
        name: device.name,
        status: device.status || 'online',
        batteryLevel: this.generateBatteryLevel(),
        signalStrength: this.generateSignalStrength(),
        lastPing: device.lastPing || new Date(),
        settings: device.settings,
        location: device.location
      };
    } catch (error) {
      console.error('Get device status error:', error);
      throw new Error('Failed to get device status');
    }
  }

  async registerDevice(deviceConfig) {
    try {
      const sensorId = deviceConfig.sensorId || this.generateSensorId();
      
      const device = {
        sensorId,
        name: deviceConfig.name,
        type: deviceConfig.type,
        location: deviceConfig.location,
        settings: {
          moistureThreshold: deviceConfig.moistureThreshold || 30,
          irrigationDuration: deviceConfig.irrigationDuration || 15,
          autoMode: deviceConfig.autoMode !== false,
          waterFlowRate: deviceConfig.waterFlowRate || 10,
          ...deviceConfig.settings
        },
        status: 'online',
        registeredAt: new Date(),
        lastPing: new Date(),
        irrigationHistory: []
      };

      this.devices.set(sensorId, device);
      
      // Initialize sensor data
      this.sensorData.set(sensorId, {
        lastMoisture: Math.random() * 80 + 10, // Random moisture between 10-90%
        lastUpdate: new Date()
      });

      return {
        success: true,
        sensorId,
        device
      };
    } catch (error) {
      console.error('Register device error:', error);
      throw new Error('Failed to register device');
    }
  }

  async getEnvironmentalData(sensorId) {
    try {
      // Mock environmental data - in production, this would come from sensors
      return {
        soilMoisture: await this.getSoilMoistureData(sensorId),
        soilTemperature: {
          value: Math.random() * 15 + 20, // 20-35°C
          unit: 'celsius',
          timestamp: new Date().toISOString()
        },
        ambientTemperature: {
          value: Math.random() * 20 + 15, // 15-35°C
          unit: 'celsius',
          timestamp: new Date().toISOString()
        },
        humidity: {
          value: Math.random() * 40 + 40, // 40-80%
          unit: 'percentage',
          timestamp: new Date().toISOString()
        },
        lightIntensity: {
          value: Math.random() * 100000, // Lux
          unit: 'lux',
          timestamp: new Date().toISOString()
        },
        pH: {
          value: Math.random() * 3 + 6, // 6.0-9.0 pH
          unit: 'pH',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get environmental data error:', error);
      throw new Error('Failed to retrieve environmental data');
    }
  }

  async calibrateDevice(sensorId, calibrationData) {
    try {
      const device = this.devices.get(sensorId);
      
      if (!device) {
        throw new Error('Device not found');
      }

      device.calibration = {
        ...calibrationData,
        calibratedAt: new Date(),
        calibratedBy: calibrationData.calibratedBy || 'system'
      };

      return {
        success: true,
        calibration: device.calibration,
        message: 'Device calibrated successfully'
      };
    } catch (error) {
      console.error('Calibrate device error:', error);
      throw new Error('Failed to calibrate device');
    }
  }

  // Helper methods
  initializeMockData() {
    // Create some mock devices for demonstration
    const mockDevices = [
      {
        sensorId: 'SENSOR_001',
        name: 'Field A - Moisture Sensor',
        type: 'soil_moisture',
        location: { fieldName: 'Field A', lat: 20.5937, lon: 78.9629 }
      },
      {
        sensorId: 'SENSOR_002',
        name: 'Field B - Irrigation Controller',
        type: 'irrigation_controller',
        location: { fieldName: 'Field B', lat: 20.5947, lon: 78.9639 }
      },
      {
        sensorId: 'SENSOR_003',
        name: 'Greenhouse - Environmental Monitor',
        type: 'environmental_monitor',
        location: { fieldName: 'Greenhouse', lat: 20.5957, lon: 78.9649 }
      }
    ];

    mockDevices.forEach(device => {
      this.devices.set(device.sensorId, {
        ...device,
        settings: {
          moistureThreshold: 30 + Math.random() * 20,
          irrigationDuration: 10 + Math.random() * 20,
          autoMode: true,
          waterFlowRate: 8 + Math.random() * 4
        },
        status: 'online',
        registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastPing: new Date(),
        irrigationHistory: this.generateMockIrrigationHistory()
      });

      this.sensorData.set(device.sensorId, {
        lastMoisture: Math.random() * 80 + 10,
        lastUpdate: new Date()
      });
    });
  }

  generateRealisticMoisture(lastMoisture) {
    // Generate realistic moisture changes
    const change = (Math.random() - 0.5) * 10; // ±5% change
    let newMoisture = lastMoisture + change;
    
    // Ensure moisture stays within realistic bounds
    newMoisture = Math.max(5, Math.min(95, newMoisture));
    
    // Add some time-based patterns (moisture decreases during day, might increase at night)
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 16) {
      // Daytime: moisture tends to decrease
      newMoisture -= Math.random() * 3;
    } else if (hour >= 20 || hour <= 6) {
      // Night/early morning: moisture might increase slightly
      newMoisture += Math.random() * 2;
    }
    
    return Math.round(Math.max(5, Math.min(95, newMoisture)) * 10) / 10; // Round to 1 decimal
  }

  generateMoistureHistory(currentMoisture) {
    const history = [];
    let moisture = currentMoisture;
    
    // Generate 48 hours of data (every 30 minutes)
    for (let i = 96; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 30 * 60 * 1000);
      moisture = this.generateRealisticMoisture(moisture);
      
      history.push({
        timestamp: timestamp.toISOString(),
        value: moisture,
        unit: 'percentage'
      });
    }
    
    return history;
  }

  generateMockIrrigationHistory() {
    const history = [];
    const events = Math.floor(Math.random() * 10) + 5; // 5-15 events
    
    for (let i = 0; i < events; i++) {
      const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 30) + 10; // 10-40 minutes
      const waterFlowRate = Math.random() * 5 + 8; // 8-13 L/min
      
      history.push({
        startTime,
        endTime: new Date(startTime.getTime() + duration * 60 * 1000),
        duration,
        actualDuration: duration + (Math.random() - 0.5) * 2, // Slight variation
        waterUsed: duration * waterFlowRate,
        status: 'completed',
        trigger: Math.random() > 0.3 ? 'automatic' : 'manual'
      });
    }
    
    return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }

  generateBatteryLevel() {
    // Generate realistic battery levels
    return Math.floor(Math.random() * 100);
  }

  generateSignalStrength() {
    // Generate realistic signal strength (0-100%)
    return Math.floor(Math.random() * 60) + 40; // 40-100% for decent connectivity
  }

  generateSensorId() {
    return 'SENSOR_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Utility methods for external use
  getAllDevices() {
    return Array.from(this.devices.values());
  }

  getDevicesByType(deviceType) {
    return Array.from(this.devices.values()).filter(device => device.type === deviceType);
  }

  getDevicesByLocation(latitude, longitude, radiusKm = 5) {
    return Array.from(this.devices.values()).filter(device => {
      if (!device.location || !device.location.lat || !device.location.lon) return false;
      
      const distance = this.calculateDistance(
        latitude, longitude,
        device.location.lat, device.location.lon
      );
      
      return distance <= radiusKm;
    });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

module.exports = new IoTService();
