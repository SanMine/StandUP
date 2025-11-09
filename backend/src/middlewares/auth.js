const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ✅ Verify and decode JWT from cookies
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token'
      }
    });
  }
};

// ✅ Role-based middlewares
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') return next();
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'This resource is only accessible to students'
    }
  });
};

const isEmployer = (req, res, next) => {
  if (req.user && req.user.role === 'employer') return next();
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'This resource is only accessible to employers'
    }
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'This resource is only accessible to administrators'
    }
  });
};

// ✅ Attach full user data (optional, for routes that need user details)
const attachUser = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) req.user = user.toSafeObject();
  } catch (error) {
    console.error('Error attaching user:', error);
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
