const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const paymentController = require('../controllers/paymentController');
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
    body('graduation').optional({ checkFalsy: true }).isISO8601().withMessage('Valid date is required'),
    body('avatar').optional({ checkFalsy: true }),
    body('website').optional({ checkFalsy: true })
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

// * Payment routes
router.post(
  '/payment/create-paypal-order',
  isAuthenticated,
  [
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number')
  ],
  validate,
  paymentController.createPayPalOrder
);

router.post(
  '/payment/approve-paypal-order',
  isAuthenticated,
  [
    body('orderID').notEmpty().withMessage('Order ID is required')
  ],
  validate,
  paymentController.approvePayPalOrder
);

router.post(
  '/payment/create-stripe-payment-intent',
  isAuthenticated,
  [
    body('planId').notEmpty(),
    body('amount').isNumeric()
  ],
  validate,
  paymentController.createStripePaymentIntent
);

router.post(
  '/payment/confirm-stripe-payment',
  isAuthenticated,
  [
    body('paymentIntentId').notEmpty().withMessage('paymentIntentId is required')
  ],
  validate,
  paymentController.confirmStripePayment
);

module.exports = router;