#!/usr/bin/env node

/**
 * Standalone Server Starter
 * Handles proper process management and graceful shutdown
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Smart Crop Advisory Backend Server...');
console.log('📍 Working Directory:', process.cwd());
console.log('⏰ Timestamp:', new Date().toISOString());

// Start the server process
const serverProcess = spawn('node', ['src/server.js'], {
  stdio: 'inherit', // Forward all output
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    // Prevent automatic shutdown
    FORCE_COLOR: '1'
  }
});

// Handle server process events
serverProcess.on('spawn', () => {
  console.log('✅ Server process started successfully');
  console.log('🌐 Server should be available at: http://localhost:5000');
  console.log('📝 API Documentation: http://localhost:5000/api-docs');
  console.log('\n--- Server Output ---');
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server process:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`\n--- Server Process Ended ---`);
  console.log(`Exit code: ${code}`);
  console.log(`Signal: ${signal}`);
  
  if (code !== 0) {
    console.log('💡 Server exited unexpectedly. Check the logs above for errors.');
    console.log('💡 Common issues:');
    console.log('   - Port 5000 already in use');
    console.log('   - MongoDB connection issues');
    console.log('   - Missing environment variables');
    console.log('   - Dependency issues');
  }
  
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Received SIGINT. Stopping server gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Received SIGTERM. Stopping server gracefully...');
  serverProcess.kill('SIGTERM');
});

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception in starter:', error);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection in starter:', reason);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});