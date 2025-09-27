// Debug script to run in browser console
// Open DevTools (F12) and paste this in Console to debug

console.log('🔍 Smart Crop Advisory - Console Debug Check');
console.log('===========================================');

// Check for React
if (typeof React !== 'undefined') {
    console.log('✅ React is loaded');
} else {
    console.log('❌ React is NOT loaded');
}

// Check for route errors
if (window.location.pathname === '/') {
    console.log('✅ On homepage');
} else {
    console.log(`📍 Current path: ${window.location.pathname}`);
}

// Check for JavaScript errors
window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript Error:', e.error);
    console.error('📄 File:', e.filename);
    console.error('📍 Line:', e.lineno);
});

// Check for unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

// Check localStorage
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage is working');
} catch (e) {
    console.log('❌ localStorage error:', e.message);
}

// Check if user is authenticated
const token = localStorage.getItem('farmora_token');
const user = localStorage.getItem('farmora_user');
console.log('🔐 Auth Status:');
console.log(`  Token: ${token ? 'Present' : 'Missing'}`);
console.log(`  User: ${user ? 'Present' : 'Missing'}`);

// Check current React components
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
}

// Force navigate to dashboard
console.log('🔄 Attempting to navigate to dashboard...');
try {
    window.location.href = '/dashboard';
} catch (e) {
    console.error('❌ Navigation error:', e);
}

console.log('Debug check complete. Watch for errors above ☝️');