const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const candidateSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  application_id: {
    type: String,
    required: true,
    ref: 'Application'
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  job_id: {
    type: String,
    required: true,
    ref: 'Job'
  },
  employer_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected'],
    default: 'new'
  },
  match_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  match_percentages: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  employer_notes: {
    type: String,
    default: ''
  },
  resume_url: {
    type: String,
    default: null
  },
  cover_letter: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  interview_date: {
    type: Date,
    default: null
  },
  interview_link: {
    type: String,
    default: null
  },
  salary_expectation: {
    type: String,
    default: null
  },
  availability: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  viewed: {
    type: Boolean,
    default: false
  },
  viewed_at: {
    type: Date,
    default: null
  },
  last_activity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

candidateSchema.index({ employer_id: 1, status: 1 });
candidateSchema.index({ job_id: 1, status: 1 });
candidateSchema.index({ application_id: 1 }, { unique: true });
candidateSchema.index({ match_score: -1 });
candidateSchema.index({ match_percentages: -1 });

candidateSchema.virtual('id').get(function () {
  return this._id;
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;