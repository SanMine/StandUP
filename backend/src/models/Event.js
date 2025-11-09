const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
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