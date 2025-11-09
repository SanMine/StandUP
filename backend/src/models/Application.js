const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const applicationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
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
  status: {
    type: String,
    enum: ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  applied_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  last_update: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    default: null
  },
  timeline: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

applicationSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

applicationSchema.virtual('id').get(function() {
  return this._id;
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;