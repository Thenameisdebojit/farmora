#!/usr/bin/env node
// Startup script to launch server and test APIs

const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// Function to check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Function to wait for server to be ready
async function waitForServer(maxAttempts = 30) {
  console.log('⏳ Waiting for server to start...');
  
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServer()) {
      console.log('✅ Server is ready!');
      return true;
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ Server failed to start within timeout');
  return false;
}

// Main function
async function main() {
  console.log('🚀 Starting Smart Crop Advisory Backend...\n');
  
  // Check if server is already running
  if (await checkServer()) {
    console.log('✅ Server is already running!');
    return runAPITests();
  }
  
  // Start the server
  console.log('📡 Starting server...');
  const serverProcess = spawn('node', ['src/server.js'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // Handle server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running on port')) {
      console.log('🎉 Server started successfully!');
    }
    if (output.includes('Error') || output.includes('error')) {
      console.log('❌ Server error:', output.trim());
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('Warning') && !error.includes('deprecated')) {
      console.log('🚨 Server stderr:', error.trim());
    }
  });
  
  serverProcess.on('close', (code) => {
    console.log(`\n🔄 Server process closed with code ${code}`);
  });
  
  // Wait for server to be ready
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.log('❌ Cannot proceed with tests - server not responding');
    serverProcess.kill();
    process.exit(1);
  }
  
  // Run API tests
  await runAPITests();
  
  // Keep server running
  console.log('\n🎯 Server is running at: http://localhost:5000');
  console.log('📊 API Status: http://localhost:5000/api/status');
  console.log('🏥 Health Check: http://localhost:5000/health');
  console.log('\nPress Ctrl+C to stop the server');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down...');
    serverProcess.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down...');
    serverProcess.kill();
    process.exit(0);
  });
}

// Run API tests
async function runAPITests() {
  try {
    console.log('\n🧪 Running API Tests...\n');
    
    const { runTests } = require('./test-apis');
    await runTests();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Test execution failed:', error.message);
  }
}

// Display banner
function displayBanner() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             🌾 Smart Crop Advisory System 🌾                ║
║                                                              ║
║              Backend API Server & Test Suite                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

// Run if called directly
if (require.main === module) {
  displayBanner();
  main().catch(console.error);
}

module.exports = { main, checkServer, waitForServer };