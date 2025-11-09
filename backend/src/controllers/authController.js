const { User, UserSkill } = require('../models');

// Sign up
const signup = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'student'
    });

    // Create session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// Sign in
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Create session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// Sign out
const signout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie(process.env.SESSION_NAME || 'standup.sid');
      res.status(200).json({
        success: true,
        message: 'Signed out successfully'
      });
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Get user skills
    const skills = await UserSkill.find({ user_id: user._id });

    res.status(200).json({
      success: true,
      user: {
        ...user.toSafeObject(),
        skills
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  signout,
  getMe
};
