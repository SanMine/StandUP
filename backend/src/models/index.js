const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Job = require('./Job');
const JobSkill = require('./JobSkill');
const UserSkill = require('./UserSkill');
const Application = require('./Application');
const Mentor = require('./Mentor');
const MentorSession = require('./MentorSession');
const Project = require('./Project');
const Course = require('./Course');
const Event = require('./Event');
const SavedJob = require('./SavedJob');
const CareerRoadmap = require('./CareerRoadmap');

// Define associations

// User associations
User.hasMany(Job, { foreignKey: 'employer_id', as: 'jobs' });
User.hasMany(Application, { foreignKey: 'user_id', as: 'applications' });
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
User.hasMany(SavedJob, { foreignKey: 'user_id', as: 'savedJobs' });
User.hasMany(UserSkill, { foreignKey: 'user_id', as: 'skills' });
User.hasMany(MentorSession, { foreignKey: 'user_id', as: 'mentorSessions' });
User.hasMany(CareerRoadmap, { foreignKey: 'user_id', as: 'roadmap' });

// Job associations
Job.belongsTo(User, { foreignKey: 'employer_id', as: 'employer' });
Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
Job.hasMany(SavedJob, { foreignKey: 'job_id', as: 'savedBy' });
Job.hasMany(JobSkill, { foreignKey: 'job_id', as: 'skills' });

// Application associations
Application.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// Mentor associations
Mentor.hasMany(MentorSession, { foreignKey: 'mentor_id', as: 'sessions' });

// MentorSession associations
MentorSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
MentorSession.belongsTo(Mentor, { foreignKey: 'mentor_id', as: 'mentor' });

// Project associations
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// SavedJob associations
SavedJob.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SavedJob.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// JobSkill associations
JobSkill.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// UserSkill associations
UserSkill.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// CareerRoadmap associations
CareerRoadmap.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export all models
module.exports = {
  sequelize,
  User,
  Job,
  JobSkill,
  UserSkill,
  Application,
  Mentor,
  MentorSession,
  Project,
  Course,
  Event,
  SavedJob,
  CareerRoadmap
};
