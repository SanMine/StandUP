const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { isAuthenticated } = require('../middlewares/auth');

// Get user profile
router.get('/profile', isAuthenticated, userController.getProfile);

// Update user profile
router.put(
  '/profile',
  isAuthenticated,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('graduation').optional().isISO8601().withMessage('Valid date is required')
  ],
  validate,
  userController.updateProfile
);

// Onboarding endpoint: profile + skills + desired roles
router.post(
  '/onboarding',
  isAuthenticated,
  [
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('roles').optional().isArray().withMessage('Roles must be an array'),
    body('graduation').optional().isISO8601().withMessage('Valid date is required')
  ],
  validate,
  userController.onboarding
);

// Get dashboard stats
router.get('/dashboard', isAuthenticated, userController.getDashboardStats);

module.exports = router;
