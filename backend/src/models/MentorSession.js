const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const mentorSessionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  mentor_id: {
    type: String,
    required: true,
    ref: 'Mentor'
  },
  topic: {
    type: String,
    required: true
  },
  preferred_date: {
    type: Date,
    required: true
  },
  preferred_time: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mentorSessionSchema.virtual('id').get(function() {
  return this._id;
});

const MentorSession = mongoose.model('MentorSession', mentorSessionSchema);

module.exports = MentorSession;