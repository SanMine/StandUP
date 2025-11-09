const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  employer_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Internship', 'Full-time', 'Part-time', 'Contract'],
    default: 'Full-time'
  },
  mode: {
    type: String,
    enum: ['Onsite', 'Hybrid', 'Remote'],
    default: 'Onsite'
  },
  salary: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    default: []
  },
  culture: {
    type: [String],
    default: []
  },
  posted_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

jobSchema.virtual('id').get(function() {
  return this._id;
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;