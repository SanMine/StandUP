const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const mentorSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  expertise: {
    type: [String],
    required: true,
    default: []
  },
  languages: {
    type: [String],
    required: true,
    default: []
  },
  rating: {
    type: Number,
    default: 5.00,
    min: 0,
    max: 5
  },
  sessions_count: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: null
  },
  topics: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mentorSchema.virtual('id').get(function() {
  return this._id;
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;