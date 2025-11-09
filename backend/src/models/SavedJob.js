const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const savedJobSchema = new mongoose.Schema({
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
  saved_date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

savedJobSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

savedJobSchema.virtual('id').get(function() {
  return this._id;
});

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;