const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const courseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  title: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    default: null
  },
  duration: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0.00,
    min: 0,
    max: 5
  },
  students_count: {
    type: Number,
    default: 0
  },
  topics: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseSchema.virtual('id').get(function() {
  return this._id;
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;