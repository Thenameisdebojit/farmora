// backend/src/server.js
require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDatabase, seedDatabase } = require('./config/database');
const notificationScheduler = require('./services/notificationScheduler');

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io globally available
global.io = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Join user room for targeted notifications
  socket.on('join_user_room', (data) => {
    if (data.userId) {
      socket.join(`user_${data.userId}`);
      console.log(`👤 User ${data.userId} joined their room`);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to database only if not in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      await connectDatabase();
      
      // Seed database with initial data if needed
      if (process.env.SEED_DATABASE === 'true') {
        await seedDatabase();
      }
    } else {
      console.log('🎭 Running in DEMO MODE - Database connection skipped');
    }
    
    // Initialize notification scheduler if not in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      notificationScheduler.init();
    }
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    function gracefulShutdown(signal) {
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      
      // Stop notification scheduler
      if (process.env.DEMO_MODE !== 'true') {
        notificationScheduler.stop();
      }
      
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server close:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        console.log('👋 Goodbye!');
        process.exit(0);
      });
    }

    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
