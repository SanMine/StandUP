// Authentication middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    }
  });
};

// Check if user is a student
const isStudent = (req, res, next) => {
  if (req.session && req.session.userRole === 'student') {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'This resource is only accessible to students'
    }
  });
};

// Check if user is an employer
const isEmployer = (req, res, next) => {
  if (req.session && req.session.userRole === 'employer') {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'This resource is only accessible to employers'
    }
  });
};

// Check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'This resource is only accessible to administrators'
    }
  });
};

// Attach user to request object
const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const { User } = require('../models');
      const user = await User.findByPk(req.session.userId);
      if (user) {
        req.user = user.toSafeObject();
      }
    } catch (error) {
      console.error('Error attaching user:', error);
    }
  }
  next();
};

module.exports = {
  isAuthenticated,
  isStudent,
  isEmployer,
  isAdmin,
  attachUser
};
