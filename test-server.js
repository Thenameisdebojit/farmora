// Simple test server to verify basic functionality
const express = require('express');
const app = express();
const PORT = 5001;

console.log('Starting simple test server...');

app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test server is working!', 
    timestamp: new Date().toISOString() 
  });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/test`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Test server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Test server closed');
    process.exit(0);
  });
});