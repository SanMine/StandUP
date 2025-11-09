const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://sanmine:sanmine1234@cluster0.czqfdmt.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      dbName: 'standup_db'
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { mongoose, connectDB };