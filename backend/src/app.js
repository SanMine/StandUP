const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { sequelize } = require('./models');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { attachUser } = require('./middlewares/auth');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const learningRoutes = require('./routes/learningRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MySQL Session Store
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

// Session configuration
app.use(session({
  key: process.env.SESSION_NAME || 'standup.sid',
  secret: process.env.SESSION_SECRET || 'standup-secret-key-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax'
  }
}));

// Attach user to request
app.use(attachUser);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiting
const authLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  skipSuccessfulRequests: true
});

// Apply rate limiters
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync models with database
    await sequelize.sync({ alter: false }); // Use alter: true only in development
    console.log('✅ Database models synchronized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
