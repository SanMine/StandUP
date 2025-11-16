const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const resumeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  // Personal Information
  full_name: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  date_of_birth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', null],
    default: null
  },
  nationality: {
    type: String,
    default: null
  },
  religion: {
    type: String,
    default: null
  },
  address: {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    postal_code: { type: String, default: null },
    country: { type: String, default: null }
  },
  
  // Professional Summary
  professional_summary: {
    type: String,
    default: null
  },
  
  // Education
  education: [{
    institute: { type: String, required: true },
    faculty: { type: String, default: null },
    major: { type: String, default: null },
    degree: { type: String, default: null },
    gpa: { type: Number, default: null },
    year_of_graduation: { type: Number, default: null },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    current: { type: Boolean, default: false }
  }],
  
  // Job Preferences
  looking_for: {
    job_type: { 
      type: [String], 
      default: [] // e.g., ['full-time', 'part-time', 'internship', 'contract']
    },
    positions: { 
      type: [String], 
      default: [] // e.g., ['Frontend Developer', 'Software Engineer']
    }
  },
  
  // Skills
  hard_skills: {
    type: [String],
    default: []
  },
  soft_skills: {
    type: [String],
    default: []
  },
  
  // Languages
  languages: [{
    language: { type: String, required: true },
    proficiency: { 
      type: String, 
      enum: ['basic', 'intermediate', 'advanced', 'native', 'fluent'],
      default: 'intermediate'
    }
  }],
  
  // Work Experience
  experience: [{
    company_name: { type: String, required: true },
    job_title: { type: String, required: true },
    employment_type: { 
      type: String, 
      enum: ['internship', 'full-time', 'part-time', 'contract', 'freelance'],
      default: 'full-time'
    },
    type_of_work: { type: String, default: null }, // e.g., 'Software Development', 'Marketing'
    start_date: { type: Date, required: true },
    end_date: { type: Date, default: null },
    current: { type: Boolean, default: false },
    description: { type: String, default: null },
    achievements: { type: [String], default: [] }
  }],
  
  // Certifications
  certifications: [{
    name: { type: String, required: true },
    issuing_organization: { type: String, default: null },
    issue_date: { type: Date, default: null },
    expiry_date: { type: Date, default: null },
    credential_id: { type: String, default: null }
  }],
  
  // References
  references: [{
    name: { type: String, required: true },
    title: { type: String, default: null },
    company: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null }
  }],
  
  // ATS Score
  ats_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

resumeSchema.virtual('id').get(function() {
  return this._id;
});

resumeSchema.virtual('age').get(function() {
  if (!this.date_of_birth) return null;
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
