const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const jobSkillSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  job_id: {
    type: String,
    required: true,
    ref: 'Job'
  },
  skill_name: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

jobSkillSchema.virtual('id').get(function() {
  return this._id;
});

const JobSkill = mongoose.model('JobSkill', jobSkillSchema);

module.exports = JobSkill;