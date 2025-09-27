// frontend/src/pages/Irrigation.jsx
import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Gauge,
  Clock,
  Play,
  Pause,
  Settings,
  Plus,
  MapPin,
  Battery,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import api from '../services/api';

const Irrigation = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [moistureData, setMoistureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [irrigationHistory, setIrrigationHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.id);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      
      // Mock devices data - replace with actual API call
      const mockDevices = [
        {
          id: 'SENSOR_001',
          name: 'Field A - Moisture Sensor',
          type: 'soil_moisture',
          location: { fieldName: 'Field A', lat: 20.5937, lon: 78.9629 },
          status: 'online',
          batteryLevel: 85,
          lastPing: new Date().toISOString(),
          settings: {
            moistureThreshold: 30,
            irrigationDuration: 15,
            autoMode: true
          },
          currentMoisture: 25
        },
        {
          id: 'SENSOR_002',
          name: 'Field B - Irrigation Controller',
          type: 'irrigation_controller',
          location: { fieldName: 'Field B', lat: 20.5947, lon: 78.9639 },
          status: 'online',
          batteryLevel: 92,
          lastPing: new Date().toISOString(),
          settings: {
            moistureThreshold: 35,
            irrigationDuration: 20,
            autoMode: false
          },
          currentMoisture: 42
        },
        {
          id: 'SENSOR_003',
          name: 'Greenhouse - Environmental Monitor',
          type: 'environmental_monitor',
          location: { fieldName: 'Greenhouse', lat: 20.5957, lon: 78.9649 },
          status: 'offline',
          batteryLevel: 15,
          lastPing: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          settings: {
            moistureThreshold: 40,
            irrigationDuration: 10,
            autoMode: true
          },
          currentMoisture: null
        }
      ];
      
      setDevices(mockDevices);
      if (mockDevices.length > 0) {
        setSelectedDevice(mockDevices[0]);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceData = async (deviceId) => {
    try {
      // Mock moisture data
      const mockMoistureData = {
        current: 25,
        history: generateMockHistory(),
        unit: 'percentage',
        timestamp: new Date().toISOString()
      };
      
      setMoistureData(mockMoistureData);
      
      // Mock irrigation history
      const mockHistory = [
        {
          id: 1,
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 5.75 * 60 * 60 * 1000).toISOString(),
          duration: 15,
          waterUsed: 150,
          trigger: 'automatic',
          status: 'completed'
        },
        {
          id: 2,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 23.67 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          waterUsed: 200,
          trigger: 'manual',
          status: 'completed'
        }
      ];
      
      setIrrigationHistory(mockHistory);
      
      // Mock analytics
      const mockAnalytics = {
        totalUsage: 1250,
        averageDaily: 41.7,
        efficiency: 85,
        savings: 200,
        recommendations: [
          'Consider adjusting irrigation timing to early morning for better efficiency',
          'Zone 3 shows higher water usage - check for leaks',
          'Weather forecast shows rain in 2 days - reduce irrigation accordingly'
        ]
      };
      
      setAnalytics(mockAnalytics);
      
    } catch (error) {
      console.error('Failed to fetch device data:', error);
    }
  };

  const generateMockHistory = () => {
    const history = [];
    for (let i = 48; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 30 * 60 * 1000);
      const baseValue = 30;
      const variation = Math.sin(i / 8) * 10 + Math.random() * 5;
      history.push({
        timestamp: timestamp.toISOString(),
        value: Math.max(10, Math.min(90, baseValue + variation)),
        unit: 'percentage'
      });
    }
    return history;
  };

  const triggerIrrigation = async (deviceId, duration) => {
    try {
      const result = await api.triggerIrrigation(deviceId, duration);
      
      // Update device status
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: 'irrigating' }
          : device
      ));
      
      // Refresh data after a delay
      setTimeout(() => {
        fetchDeviceData(deviceId);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to trigger irrigation:', error);
      alert('Failed to start irrigation');
    }
  };

  const updateDeviceSettings = async (deviceId, settings) => {
    try {
      await api.updateIrrigationSettings(deviceId, settings);
      
      // Update local device settings
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, settings: { ...device.settings, ...settings } }
          : device
      ));
      
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(prev => ({
          ...prev,
          settings: { ...prev.settings, ...settings }
        }));
      }
      
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  const getDeviceStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'irrigating':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={16} />;
      case 'offline':
        return <AlertTriangle size={16} />;
      case 'irrigating':
        return <Droplets size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getMoistureColor = (moisture, threshold) => {
    if (moisture < threshold) return 'text-red-600';
    if (moisture < threshold + 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const DeviceCard = ({ device }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selectedDevice?.id === device.id
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedDevice(device)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{device.name}</h3>
          <p className="text-sm text-gray-600">{device.location.fieldName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
            {getDeviceStatusIcon(device.status)}
            <span className="capitalize">{device.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-600">Soil Moisture</p>
          <p className={`font-semibold ${getMoistureColor(device.currentMoisture, device.settings.moistureThreshold)}`}>
            {device.currentMoisture !== null ? `${device.currentMoisture}%` : '--'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Battery</p>
          <div className="flex items-center space-x-1">
            <Battery size={14} className={device.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'} />
            <span className="font-semibold">{device.batteryLevel}%</span>
          </div>
        </div>
      </div>

      {device.currentMoisture !== null && device.currentMoisture < device.settings.moistureThreshold && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-xs font-medium">⚠️ Low moisture - irrigation needed</p>
        </div>
      )}
    </div>
  );

  const MoistureChart = ({ data }) => {
    if (!data || !data.history) return null;

    const chartData = data.history.slice(-24); // Last 24 readings (12 hours)
    
    return (
      <div className="h-64 flex items-end space-x-1">
        {chartData.map((point, index) => {
          const height = (point.value / 100) * 100; // Convert to percentage height
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
                title={`${point.value.toFixed(1)}% at ${new Date(point.timestamp).toLocaleTimeString()}`}
              ></div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Smart Irrigation</h1>
          <p className="text-gray-600 mt-2">
            Monitor and control your irrigation systems remotely
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={16} />
          <span>Add Device</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Device List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Devices ({devices.length})</h2>
          {devices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {selectedDevice ? (
            <>
              {/* Device Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedDevice.name}</h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{selectedDevice.location.fieldName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {selectedDevice.status === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span className="capitalize">{selectedDevice.status}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>Last update: {new Date(selectedDevice.lastPing).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Current Readings */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="text-blue-600" size={20} />
                      <span className="font-medium text-blue-800">Soil Moisture</span>
                    </div>
                    <p className={`text-3xl font-bold ${getMoistureColor(selectedDevice.currentMoisture, selectedDevice.settings.moistureThreshold)}`}>
                      {selectedDevice.currentMoisture !== null ? `${selectedDevice.currentMoisture}%` : '--'}
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Threshold: {selectedDevice.settings.moistureThreshold}%
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="text-green-600" size={20} />
                      <span className="font-medium text-green-800">Temperature</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {25 + Math.random() * 10}°C
                    </p>
                    <p className="text-green-700 text-sm mt-1">Optimal range</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gauge className="text-purple-600" size={20} />
                      <span className="font-medium text-purple-800">Pressure</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      {(1013 + Math.random() * 20).toFixed(0)}
                    </p>
                    <p className="text-purple-700 text-sm mt-1">hPa</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Battery className="text-orange-600" size={20} />
                      <span className="font-medium text-orange-800">Battery</span>
                    </div>
                    <p className={`text-3xl font-bold ${selectedDevice.batteryLevel > 20 ? 'text-orange-600' : 'text-red-600'}`}>
                      {selectedDevice.batteryLevel}%
                    </p>
                    <p className="text-orange-700 text-sm mt-1">
                      {selectedDevice.batteryLevel > 20 ? 'Good' : 'Low - Replace soon'}
                    </p>
                  </div>
                </div>

                {/* Manual Controls */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Manual Control</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => triggerIrrigation(selectedDevice.id, selectedDevice.settings.irrigationDuration)}
                      disabled={selectedDevice.status === 'offline'}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Play size={16} />
                      <span>Start Irrigation</span>
                    </button>
                    <button
                      disabled={selectedDevice.status === 'offline'}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Pause size={16} />
                      <span>Stop</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Duration:</label>
                      <select 
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        defaultValue={selectedDevice.settings.irrigationDuration}
                      >
                        <option value="5">5 min</option>
                        <option value="10">10 min</option>
                        <option value="15">15 min</option>
                        <option value="20">20 min</option>
                        <option value="30">30 min</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moisture Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Soil Moisture Trend (12 Hours)</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Moisture Level</span>
                  </div>
                </div>
                
                <MoistureChart data={moistureData} />
                
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Current</p>
                    <p className="font-semibold text-blue-600">
                      {moistureData?.current || '--'}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Average (24h)</p>
                    <p className="font-semibold text-gray-900">
                      {moistureData?.history ? 
                        (moistureData.history.reduce((sum, p) => sum + p.value, 0) / moistureData.history.length).toFixed(1) 
                        : '--'}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Threshold</p>
                    <p className="font-semibold text-orange-600">
                      {selectedDevice.settings.moistureThreshold}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics & History */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Water Usage Analytics */}
                {analytics && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Water Usage Analytics</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Usage (Month)</span>
                        <span className="font-semibold">{analytics.totalUsage}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Average Daily</span>
                        <span className="font-semibold">{analytics.averageDaily}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Efficiency</span>
                        <span className="font-semibold text-green-600">{analytics.efficiency}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Water Saved</span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="text-green-500" size={14} />
                          <span className="font-semibold text-green-600">{analytics.savings}L</span>
                        </div>
                      </div>
                    </div>
                    
                    {analytics.recommendations && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {analytics.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                  </div>
                  
                  <div className="space-y-3">
                    {irrigationHistory.map(event => (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Droplets className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            Irrigation {event.trigger}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {event.duration}min • Water: {event.waterUsed}L
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.startTime).toLocaleString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Droplets className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Device Selected</h3>
              <p className="text-gray-600">Select a device from the list to view its details and controls.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Irrigation;
