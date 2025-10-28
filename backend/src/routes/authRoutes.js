const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { isAuthenticated } = require('../middlewares/auth');

// Sign up
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['student', 'employer']).withMessage('Role must be student or employer')
  ],
  validate,
  authController.signup
);

// Sign in
router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.signin
);

// Sign out
router.post('/signout', authController.signout);

// Get current user
router.get('/me', isAuthenticated, authController.getMe);

module.exports = router;
