// backend/src/controllers/irrigationController.js
const iotService = require('../services/iotService');
const IrrigationDevice = require('../models/IrrigationDevice');
const User = require('../models/User');

// Get irrigation schedule for user
exports.getIrrigationSchedule = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const devices = await IrrigationDevice.find({ userId });
    const schedule = await generateIrrigationSchedule(user, devices);

    res.json({
      success: true,
      data: {
        schedule,
        devices: devices.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Irrigation schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get irrigation schedule'
    });
  }
};

// Get soil moisture readings
exports.getSoilMoisture = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await IrrigationDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const moistureData = await iotService.getSoilMoistureData(device.sensorId);

    res.json({
      success: true,
      data: {
        deviceId,
        currentMoisture: moistureData.current,
        history: moistureData.history,
        threshold: device.moistureThreshold,
        status: moistureData.current < device.moistureThreshold ? 'needs_water' : 'adequate'
      }
    });

  } catch (error) {
    console.error('Soil moisture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get soil moisture data'
    });
  }
};

// Update irrigation settings
exports.updateIrrigationSettings = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { moistureThreshold, irrigationDuration, autoMode } = req.body;

    const device = await IrrigationDevice.findByIdAndUpdate(
      deviceId,
      {
        moistureThreshold: parseFloat(moistureThreshold),
        irrigationDuration: parseInt(irrigationDuration),
        autoMode: Boolean(autoMode),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Update IoT device settings
    await iotService.updateDeviceSettings(device.sensorId, {
      moistureThreshold,
      irrigationDuration,
      autoMode
    });

    res.json({
      success: true,
      message: 'Irrigation settings updated successfully',
      data: device
    });

  } catch (error) {
    console.error('Update irrigation settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update irrigation settings'
    });
  }
};

// Trigger manual irrigation
exports.triggerIrrigation = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { duration } = req.body;

    const device = await IrrigationDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const result = await iotService.triggerIrrigation(device.sensorId, duration || device.irrigationDuration);

    res.json({
      success: true,
      message: 'Irrigation triggered successfully',
      data: {
        deviceId,
        duration: duration || device.irrigationDuration,
        startTime: new Date().toISOString(),
        estimatedEndTime: new Date(Date.now() + (duration || device.irrigationDuration) * 60000).toISOString()
      }
    });

  } catch (error) {
    console.error('Trigger irrigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger irrigation'
    });
  }
};

// Get irrigation history
exports.getIrrigationHistory = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    const devices = await IrrigationDevice.find({ userId });
    const deviceIds = devices.map(d => d.sensorId);
    
    const history = await iotService.getIrrigationHistory(deviceIds, startDate, endDate);

    res.json({
      success: true,
      data: {
        history,
        totalEvents: history.length,
        totalWaterUsage: history.reduce((sum, event) => sum + (event.waterUsage || 0), 0),
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Irrigation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get irrigation history'
    });
  }
};

// Get water usage analytics
exports.getWaterUsageAnalytics = async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;
    
    const devices = await IrrigationDevice.find({ userId });
    const analytics = await generateWaterUsageAnalytics(devices, period);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Water usage analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get water usage analytics'
    });
  }
};

// Helper functions
async function generateIrrigationSchedule(user, devices) {
  // Mock schedule generation
  const schedule = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    schedule.push({
      date: date.toISOString().split('T')[0],
      slots: [
        {
          time: '06:00',
          duration: 30,
          zones: devices.slice(0, 2).map(d => d.name),
          type: 'automatic'
        },
        {
          time: '18:00',
          duration: 25,
          zones: devices.slice(2).map(d => d.name),
          type: 'automatic'
        }
      ]
    });
  }
  
  return schedule;
}

async function generateWaterUsageAnalytics(devices, period) {
  // Mock analytics data
  return {
    totalUsage: 1250, // liters
    averageDaily: 41.7,
    efficiency: 85, // percentage
    savings: 200, // liters saved compared to traditional irrigation
    trendData: [
      { date: '2024-12-01', usage: 45 },
      { date: '2024-12-02', usage: 38 },
      { date: '2024-12-03', usage: 42 },
      { date: '2024-12-04', usage: 39 },
      { date: '2024-12-05', usage: 44 }
    ],
    recommendations: [
      'Consider adjusting irrigation timing to early morning for better efficiency',
      'Zone 3 shows higher water usage - check for leaks',
      'Weather forecast shows rain in 2 days - reduce irrigation accordingly'
    ]
  };
}
