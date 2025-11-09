const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSkillSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
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

userSkillSchema.virtual('id').get(function() {
  return this._id;
});

const UserSkill = mongoose.model('UserSkill', userSkillSchema);

module.exports = UserSkill;