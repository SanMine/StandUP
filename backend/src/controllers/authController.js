const jwt = require('jsonwebtoken');
const { User, UserSkill } = require('../models');

// Helper: generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1d' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Helper: set cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // can adjust if using different domains
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours (matches JWT expiration)
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// 🧩 SIGN UP
const signup = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists' }
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'student'
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// 🧩 SIGN IN
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// 🧩 SIGN OUT
const signout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// 🧩 GET CURRENT USER
const getMe = async (req, res, next) => {
  try {
    // Expect req.user to be set by auth middleware
    const user = await User.findById(req.user?.userId || req.session?.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    const skills = await UserSkill.find({ user_id: user._id });

    res.status(200).json({
      success: true,
      user: { ...user.toSafeObject(), skills }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, signin, signout, getMe };
