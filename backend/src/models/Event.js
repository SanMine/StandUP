const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  employer_id: {
    type: String,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Career Fair', 'Workshop', 'Interview', 'Webinar', 'Networking'],
    default: 'Webinar'
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  presenter: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  target_audience: {
    type: String,
    default: null
  },
  skills: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    default: null
  },
  attachments: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

eventSchema.virtual('id').get(function() {
  return this._id;
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;