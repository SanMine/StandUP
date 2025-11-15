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
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
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
  },
  primary_goals: {
    type: [String],
    default: null
  },
  desired_positions: {
    type: [String],
    default: null
  },
  pending_payment: {
    orderId: String,
    planId: String,
    amount: Number,
    status: String,
    createdAt: Date
  },
  payment_history: [{
    orderId: String,
    planId: String,
    amount: Number,
    status: String,
    paymentMethod: String,
    paidAt: Date,
    paypalDetails: {
      email: String,
      payerId: String
    },
    stripeDetails: {
      sessionId: String,
      customerId: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id;
  delete obj.__v;
  return obj;
};

userSchema.virtual('id').get(function () {
  return this._id;
});

const User = mongoose.model('User', userSchema);

module.exports = User;