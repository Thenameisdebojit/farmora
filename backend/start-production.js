#!/usr/bin/env node

/**
 * Production Server Starter for Smart Crop Advisory
 * Loads production environment and starts the server
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Smart Crop Advisory in Production Mode...');
console.log('📍 Working Directory:', process.cwd());
console.log('⏰ Timestamp:', new Date().toISOString());

// Load production environment
const envFile = path.join(__dirname, '.env.production');
if (fs.existsSync(envFile)) {
  console.log('✅ Loading production environment variables...');
  require('dotenv').config({ path: envFile });
} else {
  console.warn('⚠️ Production .env file not found. Using system environment variables.');
}

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please configure these variables in .env.production or your system environment.');
  process.exit(1);
}

// Check optional but recommended variables
const optionalVars = {
  'TWILIO_ACCOUNT_SID': 'SMS/OTP functionality',
  'TWILIO_AUTH_TOKEN': 'SMS/OTP functionality',
  'GOOGLE_CLIENT_ID': 'Google OAuth authentication',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth authentication'
};

console.log('\n🔍 Checking optional services...');
Object.entries(optionalVars).forEach(([varName, feature]) => {
  if (!process.env[varName] || process.env[varName].includes('your_')) {
    console.warn(`⚠️ ${varName} not configured - ${feature} will be disabled`);
  } else {
    console.log(`✅ ${varName} configured - ${feature} enabled`);
  }
});

// Set production defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '5000';
process.env.DEMO_MODE = 'false';

console.log('\n📊 Production Configuration:');
console.log(`   Node Environment: ${process.env.NODE_ENV}`);
console.log(`   Server Port: ${process.env.PORT}`);
console.log(`   Demo Mode: ${process.env.DEMO_MODE}`);
console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

// Start the server process
console.log('\n🌟 Starting production server...');

const serverProcess = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'production',
    DEMO_MODE: 'false'
  }
});

// Handle server process events
serverProcess.on('spawn', () => {
  console.log('✅ Production server started successfully');
  console.log(`🌐 Server URL: http://localhost:${process.env.PORT}`);
  console.log('📝 Health Check: http://localhost:' + process.env.PORT + '/health');
  console.log('📊 API Status: http://localhost:' + process.env.PORT + '/api/status');
  console.log('\n--- Production Server Logs ---');
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start production server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`\n--- Production Server Ended ---`);
  console.log(`Exit code: ${code}`);
  console.log(`Signal: ${signal}`);
  
  if (code !== 0) {
    console.log('💡 Server exited unexpectedly. Common issues:');
    console.log('   - Database connection failed');
    console.log('   - Port already in use');
    console.log('   - Missing environment variables');
    console.log('   - Invalid configuration');
    console.log('\n📋 Troubleshooting steps:');
    console.log('   1. Check MongoDB connection string');
    console.log('   2. Verify all required environment variables');
    console.log('   3. Check if port 5000 is available');
    console.log('   4. Review server logs above');
  }
  
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Received SIGINT. Stopping production server gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM. Stopping production server gracefully...');
  serverProcess.kill('SIGTERM');
});

// Prevent uncaught exceptions from crashing
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception in production starter:', error);
  serverProcess.kill('SIGTERM');
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection in production starter:', reason);
  serverProcess.kill('SIGTERM');
  setTimeout(() => process.exit(1), 1000);
});