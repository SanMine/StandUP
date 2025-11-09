const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const careerRoadmapSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  completed_date: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

careerRoadmapSchema.virtual('id').get(function() {
  return this._id;
});

const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);

module.exports = CareerRoadmap;