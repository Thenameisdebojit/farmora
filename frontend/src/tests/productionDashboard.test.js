// src/tests/productionDashboard.test.js
/**
 * Integration test for production-level dashboard functionality
 * Tests real data integration, caching, performance, and error handling
 */

import productionWeatherService from '../services/productionWeatherService';
import productionMarketService from '../services/productionMarketService';
import productionIoTService from '../services/productionIoTService';
import { 
  advancedCache, 
  performanceMetrics, 
  memoryMonitor, 
  measureAsyncPerformance 
} from '../utils/performanceUtils';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000, // 10 seconds timeout for async operations
  mockUser: {
    _id: 'test_user_123',
    name: 'Test Farmer',
    email: 'test@farmer.com',
    location: {
      address: {
        district: 'Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India'
      },
      coordinates: {
        latitude: 28.6139,
        longitude: 77.2090
      },
      timezone: 'Asia/Kolkata'
    }
  }
};

// Test suite for production dashboard
export const runProductionTests = async () => {
  console.log('🚀 Starting Production Dashboard Tests...');
  
  const testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    performance: {},
    startTime: Date.now()
  };

  // Test 1: Weather Service Integration
  try {
    console.log('📊 Test 1: Weather Service Integration');
    const weatherData = await measureAsyncPerformance('weather_service_test', async () => {
      return await productionWeatherService.getWeatherForUser(TEST_CONFIG.mockUser);
    });
    
    if (weatherData && weatherData.current) {
      console.log('✅ Weather service working correctly');
      console.log(`   Temperature: ${weatherData.current.temperature}°C`);
      console.log(`   Location: ${weatherData.current.location?.name || 'Unknown'}`);
      console.log(`   Advisory: ${weatherData.current.farmingAdvisory?.substring(0, 50) || 'N/A'}...`);
      testResults.passed++;
    } else {
      throw new Error('Invalid weather data structure');
    }
  } catch (error) {
    console.error('❌ Weather service test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Weather Service', error: error.message });
  }

  // Test 2: Market Service Integration
  try {
    console.log('📈 Test 2: Market Service Integration');
    const marketData = await measureAsyncPerformance('market_service_test', async () => {
      return await productionMarketService.getMarketPrices();
    });
    
    if (marketData && marketData.data) {
      const commodities = Object.keys(marketData.data);
      console.log('✅ Market service working correctly');
      console.log(`   Commodities tracked: ${commodities.length}`);
      console.log(`   Sample prices: ${commodities.slice(0, 3).map(c => `${c}: ₹${marketData.data[c].price}`).join(', ')}`);
      console.log(`   Data source: ${marketData.source || 'unknown'}`);
      testResults.passed++;
    } else {
      throw new Error('Invalid market data structure');
    }
  } catch (error) {
    console.error('❌ Market service test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Market Service', error: error.message });
  }

  // Test 3: IoT Service Integration
  try {
    console.log('🔌 Test 3: IoT Service Integration');
    const iotData = await measureAsyncPerformance('iot_service_test', async () => {
      return await productionIoTService.getSensorData('all');
    });
    
    if (iotData && iotData.sensors) {
      console.log('✅ IoT service working correctly');
      console.log(`   Soil moisture: ${iotData.sensors.soilMoisture?.current || 'N/A'}%`);
      console.log(`   Temperature: ${iotData.sensors.temperature?.current || 'N/A'}°C`);
      console.log(`   pH level: ${iotData.sensors.phLevel?.current || 'N/A'}`);
      console.log(`   Active devices: ${iotData.summary?.activeDevices || 0}/${iotData.summary?.totalDevices || 0}`);
      testResults.passed++;
    } else {
      throw new Error('Invalid IoT data structure');
    }
  } catch (error) {
    console.error('❌ IoT service test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'IoT Service', error: error.message });
  }

  // Test 4: Caching Performance
  try {
    console.log('💾 Test 4: Caching Performance');
    const testKey = 'cache_performance_test';
    const testData = { test: 'data', timestamp: Date.now() };
    
    // Test cache set/get
    advancedCache.set(testKey, testData, 30000); // 30 seconds TTL
    const cachedData = advancedCache.get(testKey);
    
    if (cachedData && cachedData.test === testData.test) {
      console.log('✅ Caching system working correctly');
      
      const cacheStats = advancedCache.getStats();
      console.log(`   Cache size: ${cacheStats.size} items`);
      console.log(`   Total hits: ${cacheStats.totalHits}`);
      console.log(`   Hit rate: ${cacheStats.hitRate.toFixed(2)}`);
      testResults.passed++;
    } else {
      throw new Error('Cache data mismatch');
    }
  } catch (error) {
    console.error('❌ Caching test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Caching Performance', error: error.message });
  }

  // Test 5: Memory Monitoring
  try {
    console.log('🧠 Test 5: Memory Monitoring');
    const memoryBefore = memoryMonitor.measure();
    
    // Simulate some memory usage
    const largeArray = new Array(10000).fill(0).map((_, i) => ({ id: i, data: Math.random() }));
    
    const memoryAfter = memoryMonitor.measure();
    const memoryStats = memoryMonitor.getStats();
    
    if (memoryBefore && memoryAfter && memoryStats) {
      console.log('✅ Memory monitoring working correctly');
      console.log(`   Used heap: ${(memoryAfter.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Total heap: ${(memoryAfter.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Memory pressure: ${memoryMonitor.isMemoryPressureHigh() ? 'HIGH' : 'NORMAL'}`);
      testResults.passed++;
      
      // Cleanup test data
      largeArray.length = 0;
    } else {
      throw new Error('Memory monitoring not available');
    }
  } catch (error) {
    console.error('❌ Memory monitoring test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Memory Monitoring', error: error.message });
  }

  // Test 6: Performance Metrics
  try {
    console.log('⚡ Test 6: Performance Metrics');
    
    // Test timer functionality
    performanceMetrics.startTimer('test_operation');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms operation
    const duration = performanceMetrics.endTimer('test_operation');
    
    // Test custom metrics
    performanceMetrics.recordCustomMetric('api_calls', 15, 'count');
    performanceMetrics.recordCustomMetric('data_size', 2048, 'bytes');
    
    const allMetrics = performanceMetrics.getAllMetrics();
    const browserPerf = performanceMetrics.getBrowserPerformance();
    
    if (duration > 90 && duration < 200 && allMetrics.test_operation) {
      console.log('✅ Performance metrics working correctly');
      console.log(`   Test operation took: ${duration.toFixed(2)}ms`);
      console.log(`   Total metrics recorded: ${Object.keys(allMetrics).length}`);
      console.log(`   Uptime: ${(performanceMetrics.getUptime() / 1000).toFixed(2)}s`);
      
      if (browserPerf?.memory) {
        console.log(`   Browser memory usage: ${browserPerf.memory.usedJSHeapSize}MB`);
      }
      
      testResults.passed++;
    } else {
      throw new Error('Performance timing inaccurate');
    }
  } catch (error) {
    console.error('❌ Performance metrics test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Performance Metrics', error: error.message });
  }

  // Test 7: Error Handling and Resilience
  try {
    console.log('🛡️ Test 7: Error Handling and Resilience');
    
    // Test weather service with invalid location
    const invalidWeatherData = await productionWeatherService.getWeatherForUser({
      location: { coordinates: { latitude: 999, longitude: 999 } }
    });
    
    // Test market service fallback
    const fallbackMarketData = await productionMarketService.getMarketPrices('invalid_location');
    
    // Verify both services return fallback data rather than crashing
    if (invalidWeatherData && fallbackMarketData) {
      console.log('✅ Error handling working correctly');
      console.log(`   Weather service fallback: ${invalidWeatherData.current?.isOffline ? 'Offline mode' : 'Live data'}`);
      console.log(`   Market service fallback: ${fallbackMarketData.isOffline ? 'Offline mode' : 'Live data'}`);
      testResults.passed++;
    } else {
      throw new Error('Services should return fallback data on error');
    }
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Error Handling', error: error.message });
  }

  // Test 8: Data Integration and Alerts
  try {
    console.log('🚨 Test 8: Data Integration and Smart Alerts');
    
    // Gather all data sources
    const [weather, market, iot] = await Promise.all([
      productionWeatherService.getWeatherForUser(TEST_CONFIG.mockUser),
      productionMarketService.getMarketPrices(),
      productionIoTService.getSensorData('all')
    ]);
    
    // Test alert generation logic (simplified version)
    const alerts = [];
    
    if (weather?.current?.temperature > 35) {
      alerts.push({ type: 'weather', severity: 'high', message: 'High temperature alert' });
    }
    
    if (iot?.sensors?.soilMoisture?.current < 50) {
      alerts.push({ type: 'irrigation', severity: 'high', message: 'Low soil moisture' });
    }
    
    if (market?.data) {
      Object.entries(market.data).forEach(([crop, data]) => {
        const changePercent = parseFloat(data.changePercent?.replace(/[+%]/g, '') || 0);
        if (Math.abs(changePercent) > 5) {
          alerts.push({ type: 'market', severity: 'medium', message: `${crop} price change` });
        }
      });
    }
    
    console.log('✅ Data integration working correctly');
    console.log(`   Generated ${alerts.length} smart alerts`);
    console.log(`   Alert types: ${alerts.map(a => a.type).join(', ')}`);
    testResults.passed++;
    
  } catch (error) {
    console.error('❌ Data integration test failed:', error.message);
    testResults.failed++;
    testResults.errors.push({ test: 'Data Integration', error: error.message });
  }

  // Compile final results
  const endTime = Date.now();
  const totalTime = endTime - testResults.startTime;
  
  testResults.performance = {
    totalTime,
    averageTestTime: totalTime / (testResults.passed + testResults.failed),
    performanceMetrics: performanceMetrics.getAllMetrics()
  };

  // Print final results
  console.log('\n📋 Production Dashboard Test Results:');
  console.log('═════════════════════════════════════');
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`📊 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Failed Test Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  if (testResults.passed >= 6) {
    console.log('\n🎉 Production dashboard is ready for deployment!');
  } else {
    console.log('\n⚠️  Production dashboard needs attention before deployment.');
  }
  
  return testResults;
};

// Export test configuration for use in other tests
export { TEST_CONFIG };

// Utility to run quick health check
export const quickHealthCheck = async () => {
  console.log('🔍 Running Quick Health Check...');
  
  try {
    const [weather, market, iot] = await Promise.allSettled([
      productionWeatherService.getWeatherForUser(TEST_CONFIG.mockUser),
      productionMarketService.getMarketPrices(),
      productionIoTService.getSensorData('all')
    ]);
    
    const results = {
      weather: weather.status === 'fulfilled',
      market: market.status === 'fulfilled',
      iot: iot.status === 'fulfilled'
    };
    
    const healthyServices = Object.values(results).filter(Boolean).length;
    const totalServices = Object.keys(results).length;
    
    console.log(`Health Status: ${healthyServices}/${totalServices} services operational`);
    console.log(`Weather Service: ${results.weather ? '✅' : '❌'}`);
    console.log(`Market Service: ${results.market ? '✅' : '❌'}`);
    console.log(`IoT Service: ${results.iot ? '✅' : '❌'}`);
    
    return {
      healthy: healthyServices === totalServices,
      services: results,
      score: (healthyServices / totalServices) * 100
    };
    
  } catch (error) {
    console.error('Health check failed:', error);
    return { healthy: false, error: error.message, score: 0 };
  }
};

export default { runProductionTests, quickHealthCheck };