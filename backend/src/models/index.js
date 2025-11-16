const { mongoose } = require('../config/database');

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
const Enrollment = require('./Enrollment');
const Resume = require('./Resume');
const Candidate = require('./Candidate');

// Export all models
module.exports = {
  mongoose,
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
  CareerRoadmap,
  Enrollment,
  Resume,
  Candidate
};
