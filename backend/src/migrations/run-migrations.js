const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const addPaymentFieldsToUsers = async () => {
  try {
    console.log('Starting payment fields migration...');

    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoURI) {
      console.error('MongoDB URI not found in environment variables!');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      {
        $or: [
          { pending_payment: { $exists: false } },
          { payment_history: { $exists: false } }
        ]
      },
      {
        $set: {
          pending_payment: null,
          payment_history: []
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with payment fields`);
    console.log('Migration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addPaymentFieldsToUsers();