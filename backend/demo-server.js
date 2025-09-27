#!/usr/bin/env node

/**
 * Demo Server for Smart Crop Advisory
 * Runs the backend in demo mode for frontend testing
 */

console.log('🎭 Starting Smart Crop Advisory Demo Server...');

// Set environment variables for demo mode
process.env.DEMO_MODE = 'true';
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Override signal handlers to prevent immediate shutdown
process.removeAllListeners('SIGINT');
process.removeAllListeners('SIGTERM');

// Handle graceful shutdown only on explicit request
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n🔄 Received ${signal}. Shutting down demo server...`);
  console.log('👋 Demo server stopped. Thanks for testing!');
  process.exit(0);
};

// Only handle explicit shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Prevent uncaught exceptions from crashing the demo
process.on('uncaughtException', (error) => {
  console.error('⚠️ Demo server error (continuing):', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Demo server promise rejection (continuing):', reason);
});

console.log('✅ Demo environment configured');
console.log('📍 Server will run on: http://localhost:5000');
console.log('🎯 Frontend connects to: http://localhost:3000');
console.log('🔧 Press Ctrl+C to stop the demo server\n');

// Start the actual server
require('./src/server.js');