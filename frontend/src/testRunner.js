// src/testRunner.js
// Simple test runner to validate production dashboard functionality

// Simple health check without imports
const simpleHealthCheck = async () => {
  console.log('🔍 Smart Crop Advisory - Basic Health Check');
  console.log('════════════════════════════════════════════');
  
  try {
    // Test basic functionality
    const isLocalStorageWorking = typeof localStorage !== 'undefined';
    const isDateWorking = new Date().getTime() > 0;
    const isFetchWorking = typeof fetch !== 'undefined';
    
    console.log(`Local Storage: ${isLocalStorageWorking ? '✅' : '❌'}`);
    console.log(`Date Functions: ${isDateWorking ? '✅' : '❌'}`);
    console.log(`Fetch API: ${isFetchWorking ? '✅' : '❌'}`);
    
    const allWorking = isLocalStorageWorking && isDateWorking && isFetchWorking;
    
    if (allWorking) {
      console.log('\n✅ Basic systems operational!');
    } else {
      console.log('\n⚠️  Some basic systems have issues.');
    }
    
    return { healthy: allWorking, score: allWorking ? 100 : 50 };
  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    return { healthy: false, error: error.message };
  }
};

// Only run if in browser environment
if (typeof window !== 'undefined') {
  simpleHealthCheck();
}

export default simpleHealthCheck;
