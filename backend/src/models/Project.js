const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const projectSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  github_url: {
    type: String,
    default: null
  },
  live_url: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

projectSchema.virtual('id').get(function() {
  return this._id;
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;