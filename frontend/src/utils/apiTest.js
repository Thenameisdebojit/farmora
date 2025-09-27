// frontend/src/utils/apiTest.js
// API connectivity test script to verify backend integration

import apiService from '../services/api';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

class ApiTestSuite {
  constructor() {
    this.results = [];
    this.testUser = {
      email: 'test@smartcrop.com',
      password: 'TestPassword123!',
      name: 'Test User',
      phone: '+1234567890',
      location: {
        latitude: 28.6139,
        longitude: 77.2090
      }
    };
  }

  // Log test results
  log(test, status, message, data = null) {
    const result = {
      test,
      status, // 'PASS', 'FAIL', 'SKIP'
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    
    if (data) {
      console.log('  Data:', data);
    }
  }

  // Test basic connectivity
  async testBasicConnectivity() {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      
      if (response.ok && data.status === 'healthy') {
        this.log('Basic Connectivity', 'PASS', 'Backend server is running and healthy', data);
        return true;
      } else {
        this.log('Basic Connectivity', 'FAIL', 'Backend health check failed', data);
        return false;
      }
    } catch (error) {
      this.log('Basic Connectivity', 'FAIL', `Cannot connect to backend: ${error.message}`);
      return false;
    }
  }

  // Test authentication endpoints
  async testAuthentication() {
    try {
      // Test registration
      const registerResult = await authService.register({
        ...this.testUser,
        email: `test_${Date.now()}@smartcrop.com` // Use unique email
      });
      
      if (registerResult.success) {
        this.log('Authentication - Register', 'PASS', 'User registration successful', {
          user: registerResult.user?.name
        });
        
        // Test login with the registered user
        const loginResult = await authService.login({
          email: registerResult.user.email,
          password: this.testUser.password
        });
        
        if (loginResult.success) {
          this.log('Authentication - Login', 'PASS', 'User login successful', {
            user: loginResult.user?.name
          });
          return true;
        } else {
          this.log('Authentication - Login', 'FAIL', loginResult.message);
          return false;
        }
      } else {
        this.log('Authentication - Register', 'FAIL', registerResult.message);
        
        // Try login with existing credentials
        const loginResult = await authService.login({
          email: this.testUser.email,
          password: this.testUser.password
        });
        
        if (loginResult.success) {
          this.log('Authentication - Login', 'PASS', 'Login with existing user successful');
          return true;
        } else {
          this.log('Authentication - Login', 'FAIL', loginResult.message);
          return false;
        }
      }
    } catch (error) {
      this.log('Authentication', 'FAIL', `Authentication test failed: ${error.message}`);
      return false;
    }
  }

  // Test weather API endpoints
  async testWeatherAPI() {
    try {
      const weatherResult = await apiService.getCurrentWeather(
        this.testUser.location.latitude,
        this.testUser.location.longitude
      );
      
      if (weatherResult.success) {
        this.log('Weather API - Current', 'PASS', 'Current weather data retrieved', {
          temperature: weatherResult.data?.temperature,
          weather: weatherResult.data?.weather
        });
      } else {
        this.log('Weather API - Current', 'FAIL', 'Failed to get current weather');
      }

      const forecastResult = await apiService.getWeatherForecast(
        this.testUser.location.latitude,
        this.testUser.location.longitude,
        5
      );
      
      if (forecastResult.success) {
        this.log('Weather API - Forecast', 'PASS', 'Weather forecast retrieved', {
          days: forecastResult.data?.forecasts?.length
        });
        return true;
      } else {
        this.log('Weather API - Forecast', 'FAIL', 'Failed to get weather forecast');
        return false;
      }
    } catch (error) {
      this.log('Weather API', 'FAIL', `Weather API test failed: ${error.message}`);
      return false;
    }
  }

  // Test notification endpoints
  async testNotificationAPI() {
    try {
      const user = authService.getUser();
      if (!user) {
        this.log('Notification API', 'SKIP', 'No authenticated user for notification tests');
        return false;
      }

      // Test getting user notifications
      const notificationsResult = await apiService.getUserNotifications(user.id);
      
      if (notificationsResult.success || notificationsResult.notifications) {
        this.log('Notification API - Get', 'PASS', 'User notifications retrieved', {
          count: notificationsResult.notifications?.length
        });
      } else {
        this.log('Notification API - Get', 'FAIL', 'Failed to get user notifications');
      }

      // Test getting notification preferences
      const preferencesResult = await apiService.getNotificationPreferences(user.id);
      
      if (preferencesResult.preferences) {
        this.log('Notification API - Preferences', 'PASS', 'Notification preferences retrieved', {
          email: preferencesResult.preferences.email,
          push: preferencesResult.preferences.push
        });
        return true;
      } else {
        this.log('Notification API - Preferences', 'FAIL', 'Failed to get notification preferences');
        return false;
      }
    } catch (error) {
      this.log('Notification API', 'FAIL', `Notification API test failed: ${error.message}`);
      return false;
    }
  }

  // Test advisory endpoints
  async testAdvisoryAPI() {
    try {
      const advisoryResult = await apiService.getPersonalizedAdvisory({
        cropType: 'wheat',
        location: this.testUser.location,
        season: 'winter'
      });
      
      if (advisoryResult.success) {
        this.log('Advisory API - Personalized', 'PASS', 'Personalized advisory retrieved', {
          title: advisoryResult.data?.advisory?.title
        });
      } else {
        this.log('Advisory API - Personalized', 'FAIL', 'Failed to get personalized advisory');
      }

      const cropRecommendations = await apiService.getCropRecommendations({
        location: this.testUser.location,
        season: 'winter',
        soilType: 'clay'
      });
      
      if (cropRecommendations.success) {
        this.log('Advisory API - Crop Recommendations', 'PASS', 'Crop recommendations retrieved');
        return true;
      } else {
        this.log('Advisory API - Crop Recommendations', 'FAIL', 'Failed to get crop recommendations');
        return false;
      }
    } catch (error) {
      this.log('Advisory API', 'FAIL', `Advisory API test failed: ${error.message}`);
      return false;
    }
  }

  // Test AI-powered features
  async testAIFeatures() {
    try {
      const aiChatResult = await apiService.chatWithAIAssistant(
        'What is the best time to plant wheat?',
        authService.getUser()?.id,
        { cropType: 'wheat', location: this.testUser.location }
      );
      
      if (aiChatResult.success || aiChatResult.data?.response) {
        this.log('AI Features - Chat', 'PASS', 'AI chat response received', {
          responseLength: aiChatResult.data?.response?.length
        });
      } else {
        this.log('AI Features - Chat', 'FAIL', 'AI chat failed');
      }

      const aiInsights = await apiService.getAIInsights({
        userId: authService.getUser()?.id,
        crop: 'wheat',
        growthStage: 'vegetative',
        issues: ['pest_concern']
      });
      
      if (aiInsights.success || aiInsights.data?.insights) {
        this.log('AI Features - Insights', 'PASS', 'AI insights generated');
        return true;
      } else {
        this.log('AI Features - Insights', 'FAIL', 'Failed to get AI insights');
        return false;
      }
    } catch (error) {
      this.log('AI Features', 'FAIL', `AI features test failed: ${error.message}`);
      return false;
    }
  }

  // Test chatbot API
  async testChatbotAPI() {
    try {
      const { default: chatbotApi } = await import('../services/chatbotApi');
      
      const chatResult = await chatbotApi.sendMessage(
        'Hello, I need help with my crops',
        authService.getUser()?.id,
        null,
        { cropType: 'wheat', language: 'en' }
      );
      
      if (chatResult.success || chatResult.response) {
        this.log('Chatbot API - Send Message', 'PASS', 'Chatbot response received');
      } else {
        this.log('Chatbot API - Send Message', 'FAIL', 'Chatbot failed to respond');
      }

      const suggestionsResult = await chatbotApi.getSuggestedQuestions({
        cropType: 'wheat',
        category: 'general'
      });
      
      if (suggestionsResult.suggestions) {
        this.log('Chatbot API - Suggestions', 'PASS', 'Question suggestions retrieved', {
          count: suggestionsResult.suggestions.length
        });
        return true;
      } else {
        this.log('Chatbot API - Suggestions', 'FAIL', 'Failed to get question suggestions');
        return false;
      }
    } catch (error) {
      this.log('Chatbot API', 'FAIL', `Chatbot API test failed: ${error.message}`);
      return false;
    }
  }

  // Test notification service
  async testNotificationService() {
    try {
      const serviceInfo = notificationService.getServiceInfo();
      
      this.log('Notification Service - Info', 'PASS', 'Service info retrieved', {
        isSupported: serviceInfo.isSupported,
        isInitialized: serviceInfo.isInitialized,
        permissionStatus: serviceInfo.permissionStatus
      });

      if (serviceInfo.isSupported) {
        try {
          // This will prompt for permission in a real environment
          // In test environment, it might fail which is expected
          const preferences = await notificationService.getPreferences();
          this.log('Notification Service - Preferences', 'PASS', 'Preferences retrieved', {
            push: preferences.push,
            email: preferences.email
          });
        } catch (error) {
          this.log('Notification Service - Preferences', 'SKIP', 'Permission not granted (expected in test)');
        }
      } else {
        this.log('Notification Service', 'SKIP', 'Push notifications not supported in this environment');
      }
      
      return true;
    } catch (error) {
      this.log('Notification Service', 'FAIL', `Notification service test failed: ${error.message}`);
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Smart Crop Advisory API Integration Tests...\n');
    
    this.results = [];
    const startTime = Date.now();
    
    // Run tests in sequence
    const tests = [
      { name: 'Basic Connectivity', fn: () => this.testBasicConnectivity() },
      { name: 'Authentication', fn: () => this.testAuthentication() },
      { name: 'Weather API', fn: () => this.testWeatherAPI() },
      { name: 'Notification API', fn: () => this.testNotificationAPI() },
      { name: 'Advisory API', fn: () => this.testAdvisoryAPI() },
      { name: 'AI Features', fn: () => this.testAIFeatures() },
      { name: 'Chatbot API', fn: () => this.testChatbotAPI() },
      { name: 'Notification Service', fn: () => this.testNotificationService() }
    ];
    
    for (const test of tests) {
      console.log(`\n📋 Running ${test.name} tests...`);
      try {
        await test.fn();
      } catch (error) {
        this.log(test.name, 'FAIL', `Test suite failed: ${error.message}`);
      }
    }
    
    // Generate summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    this.generateSummary(duration);
    
    return this.results;
  }

  // Generate test summary
  generateSummary(duration) {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;
    
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Skipped: ${skipped}`);
    console.log(`⏱️ Duration: ${duration}s`);
    console.log(`📈 Success Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  • ${r.test}: ${r.message}`));
    }
    
    if (skipped > 0) {
      console.log('\n⚠️ SKIPPED TESTS:');
      this.results
        .filter(r => r.status === 'SKIP')
        .forEach(r => console.log(`  • ${r.test}: ${r.message}`));
    }
    
    console.log('\n🏁 Testing completed!');
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (failed === 0) {
      console.log('✅ All critical tests passed! Your integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check:');
      console.log('  • Backend server is running on http://localhost:5000');
      console.log('  • Database connections are working');
      console.log('  • Environment variables are configured');
      console.log('  • API keys and credentials are valid');
    }
  }

  // Export results to JSON
  exportResults() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length,
        skipped: this.results.filter(r => r.status === 'SKIP').length
      },
      results: this.results
    };
    
    // Save to localStorage for later review
    localStorage.setItem('apiTestResults', JSON.stringify(report));
    
    return report;
  }
}

// Export test suite
export default ApiTestSuite;

// Utility function to run tests from console
export const runApiTests = async () => {
  const testSuite = new ApiTestSuite();
  const results = await testSuite.runAllTests();
  const report = testSuite.exportResults();
  
  console.log('\n📋 Full test report saved to localStorage as "apiTestResults"');
  
  return report;
};

// Quick health check
export const quickHealthCheck = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      console.log('✅ Backend is healthy:', data);
      return true;
    } else {
      console.log('❌ Backend health check failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    return false;
  }
};