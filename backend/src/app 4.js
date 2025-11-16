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

const paymentController = require('./controllers/paymentController');

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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.post(
  '/api/users/payment/stripe-webhook',
  express.raw({ type: 'application/json' }),
  paymentController.stripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://sanmine:sanmine1234@cluster0.czqfdmt.mongodb.net/?appName=Cluster0';

const sessionStore = MongoStore.create({
  mongoUrl: MONGODB_URI,
  dbName: 'standup_db',
  collectionName: 'sessions',
  ttl: 86400,
  autoRemove: 'native',
});

const isProduction = process.env.NODE_ENV === 'production';
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      'standup-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'none',
    },
    name: process.env.SESSION_NAME || 'standup.sid',
  })
);

app.use(attachUser);

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

app.get('/api/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        database: 'Connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('MongoDB not connected');
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(
        `💚 Health Check: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received: shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received: shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

module.exports = app;