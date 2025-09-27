// Quick script to clear authentication data from localStorage
// Run this in the browser console to clear auth data and see the login page

console.log('🧹 Clearing authentication data...');

// Clear all auth-related localStorage items
localStorage.removeItem('farmora_token');
localStorage.removeItem('farmora_user');
localStorage.removeItem('farmora_refresh_token');

console.log('✅ Authentication data cleared!');
console.log('🔄 Please refresh the page to see the login page');

// Show current localStorage contents
console.log('📊 Current localStorage contents:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}: ${localStorage.getItem(key)}`);
}