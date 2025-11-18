const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { mongoose } = require('./models');
const { connectDB } = require('./config/database');
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
const eventRoutes = require('./routes/eventRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());

// CORS configuration - FIXED: removed trailing slashes and used array format
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://stand-up-tau.vercel.app',
    'https://www.careerstandup.com',
    'https://careerstandup.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
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
app.use(cookieParser());

// MongoDB Session Store
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sanmine:sanmine1234@cluster0.czqfdmt.mongodb.net/?appName=Cluster0';

const sessionStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  dbName: 'standup_db',
  collectionName: 'sessions',
  ttl: 86400, // 24 hours in seconds
  autoRemove: 'native'
});

// Session configuration
// NOTE: For local development the frontend may run on a different origin (different port).
// Browsers restrict cookies for cross-site POST/XHR when SameSite is 'lax'. To allow
// credentialed requests from the dev frontend we set SameSite to 'none' in non-production
// and keep secure=true only in production. Adjust as appropriate for your deployment.
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'standup-secret-key-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
    httpOnly: true,
    secure: isProduction, // Only require HTTPS in production
    // In development allow cross-site requests from the frontend dev server
    // by using 'none'. In production prefer 'lax' for safety (or keep 'none' with secure=true).
    sameSite: isProduction ? 'lax' : 'none'
  },
  name: process.env.SESSION_NAME || 'standup.sid'
}));

// Attach user to request
app.use(attachUser);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        database: 'Connected',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('MongoDB not connected');
    }
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
app.use('/api/events', eventRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/candidates', candidateRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connection established successfully');

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
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;