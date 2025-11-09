const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'employer', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  profile_strength: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  graduation: {
    type: Date,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  company_name: {
    type: String,
    default: null
  },
  company_size: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to validate password
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to get safe user data (without password)
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id;
  delete obj.__v;
  return obj;
};

// Virtual for id
userSchema.virtual('id').get(function() {
  return this._id;
});

const User = mongoose.model('User', userSchema);

module.exports = User;