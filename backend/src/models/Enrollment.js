const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const enrollmentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  student_id: {
    type: String,
    ref: 'User',
    required: true
  },
  event_id: {
    type: String,
    ref: 'Event',
    required: true
  },
  enrolled_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'cancelled'],
    default: 'enrolled'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id
enrollmentSchema.virtual('id').get(function() {
  return this._id;
});

// Index for faster queries
enrollmentSchema.index({ student_id: 1, event_id: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
