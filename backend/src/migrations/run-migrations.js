const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('../models/Candidate');

const addMatchPercentagesToCandidates = async () => {
  try {
    console.log('Starting match_percentages field migration...');

    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoURI) {
      console.error('MongoDB URI not found in environment variables!');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const totalCandidates = await Candidate.countDocuments();
    console.log(`Found ${totalCandidates} candidates in database`);

    const result = await Candidate.updateMany(
      { match_percentages: { $exists: false } },
      { $set: { match_percentages: null } }
    );

    console.log(`Updated ${result.modifiedCount} candidates with match_percentages field`);

    const candidatesWithField = await Candidate.countDocuments({
      match_percentages: { $exists: true }
    });
    console.log(`Total candidates with match_percentages field: ${candidatesWithField}`);

    console.log('Migration completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

addMatchPercentagesToCandidates();