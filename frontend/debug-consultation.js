// Debug script for consultation feature
// Paste this into browser console to test consultation routes

console.log('🔧 Debugging Consultation Feature');

// Check if React Router is working
const currentPath = window.location.pathname;
console.log('📍 Current path:', currentPath);

// Test navigation to consultation
const testNavigation = () => {
  console.log('🧪 Testing navigation...');
  
  // Try to navigate to consultation page
  window.history.pushState({}, '', '/consultation');
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  setTimeout(() => {
    console.log('📍 New path:', window.location.pathname);
    console.log('✅ Navigation test completed');
  }, 100);
};

// Check for errors
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error);
});

// Check for unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason);
});

// Test React components
const testComponents = () => {
  console.log('🧩 Testing React components...');
  
  // Check if main app is rendered
  const appRoot = document.getElementById('root');
  if (appRoot && appRoot.children.length > 0) {
    console.log('✅ App root is rendered');
  } else {
    console.error('❌ App root is empty');
  }
  
  // Check for consultation-related elements
  const consultationElements = document.querySelectorAll('[class*="consultation"]');
  console.log(`📊 Found ${consultationElements.length} consultation-related elements`);
  
  // Check for video elements
  const videoElements = document.querySelectorAll('video');
  console.log(`📹 Found ${videoElements.length} video elements`);
};

// Run tests
console.log('🚀 Running consultation debug tests...');
testNavigation();
setTimeout(testComponents, 500);

console.log('🔧 Debug script loaded. Check console for results.');
console.log('📋 Available functions:');
console.log('  - testNavigation(): Test route navigation');
console.log('  - testComponents(): Check component rendering');