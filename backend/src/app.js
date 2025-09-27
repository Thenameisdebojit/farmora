// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const phoneAuthRoutes = require('./routes/phone-auth');
const googleAuthRoutes = require('./routes/google-auth');
const advisoryRoutes = require('./routes/advisoryRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const pestRoutes = require('./routes/pestRoutes');
const irrigationRoutes = require('./routes/irrigationRoutes');
const cropManagementRoutes = require('./routes/cropManagementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://smartcropadvisory.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Crop Advisory System API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Smart Crop Advisory System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      advisory: '/api/advisory',
      weather: '/api/weather',
      market: '/api/market',
      pest: '/api/pest',
      irrigation: '/api/irrigation',
      crops: '/api/crops',
      notifications: '/api/notifications',
      consultation: '/api/consultation',
      chatbot: '/api/chatbot'
    },
    documentation: 'https://docs.smartcropadvisory.com',
    support: 'support@smartcropadvisory.com'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/phone', phoneAuthRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/pest', pestRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/crops', cropManagementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Crop Advisory System API',
    version: '1.0.0',
    documentation: '/api/status',
    health: '/health'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: {
      health: 'GET /health',
      apiStatus: 'GET /api/status',
      advisory: 'GET|POST /api/advisory/*',
      weather: 'GET /api/weather/*',
      market: 'GET /api/market/*',
      pest: 'GET|POST /api/pest/*',
      irrigation: 'GET|POST|PUT /api/irrigation/*',
      notifications: 'GET|POST /api/notifications/*',
      consultation: 'GET|POST /api/consultation/*',
      chatbot: 'POST /api/chatbot/*'
    }
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Global Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${duplicateField} already exists`
    });
  }

  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error 
    })
  });
});

// Graceful shutdown handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;
