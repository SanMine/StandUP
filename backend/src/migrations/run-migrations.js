const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateExistingUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://sanmine:sanmine1234@cluster0.czqfdmt.mongodb.net/?appName=Cluster");
    console.log('Connected to MongoDB');

    console.log('Updating existing users with plan field...');

    const result = await User.updateMany(
      { plan: { $exists: false } },
      { $set: { plan: 'free' } }
    );

    console.log(`Updated ${result.modifiedCount} users with default plan`);
    console.log('Migration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

updateExistingUsers();