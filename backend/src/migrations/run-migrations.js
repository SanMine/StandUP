const { sequelize } = require('../models');

// Run migrations - sync all models
const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    // Use force: true to drop and recreate tables (CAUTION: data loss)
    // Use alter: true to update existing tables (safer)
    await sequelize.sync({ alter: true });
    
    console.log('✅ All models synchronized successfully');
    console.log('📋 Tables created:');
    console.log('   - users');
    console.log('   - jobs');
    console.log('   - job_skills');
    console.log('   - user_skills');
    console.log('   - applications');
    console.log('   - mentors');
    console.log('   - mentor_sessions');
    console.log('   - projects');
    console.log('   - courses');
    console.log('   - events');
    console.log('   - saved_jobs');
    console.log('   - career_roadmap');
    console.log('   - sessions (express-session store)');
    console.log('');
    console.log('✅ Database migrations completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
