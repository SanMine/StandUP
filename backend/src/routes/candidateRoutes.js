const express = require('express');
const router = express.Router();
const { isAuthenticated, isEmployer } = require('../middlewares/auth');
const {
  getCandidates,
  getCandidateById,
  getTopMatchedCandidates,
  updateCandidateStatus,
  updateCandidateNotes,
  updateCandidateRating,
  updateCandidateTags,
  scheduleInterview,
  getCandidateStats
} = require('../controllers/candidateController');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

// All routes require authentication and employer role
router.use(isAuthenticated, isEmployer);

/**
 * @route   GET /api/candidates/stats
 * @desc    Get candidate statistics
 * @access  Private (Employer)
 */
router.get(
  '/stats',
  getCandidateStats
);

/**
 * @route   GET /api/candidates/top-matches
 * @desc    Get top matched candidates using AI
 * @access  Private (Employer - Premium only)
 */
router.get(
  '/top-matches',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    validate
  ],
  getTopMatchedCandidates
);

/**
 * @route   GET /api/candidates
 * @desc    Get all candidates for employer
 * @access  Private (Employer)
 */
router.get(
  '/',
  [
    query('status').optional().isIn(['new', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected']),
    query('job_id').optional().isString(),
    query('search').optional().isString(),
    query('sort').optional().isIn(['match_score', 'last_activity', 'createdAt']),
    query('order').optional().isIn(['asc', 'desc']),
    validate
  ],
  getCandidates
);

/**
 * @route   GET /api/candidates/:id
 * @desc    Get single candidate by ID
 * @access  Private (Employer)
 */
router.get(
  '/:id',
  [
    param('id').isString().withMessage('Candidate ID is required'),
    validate
  ],
  getCandidateById
);

/**
 * @route   PUT /api/candidates/:id/status
 * @desc    Update candidate status
 * @access  Private (Employer)
 */
router.put(
  '/:id/status',
  [
    param('id').isString().withMessage('Candidate ID is required'),
    body('status').isIn(['new', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected']).withMessage('Invalid status'),
    validate
  ],
  updateCandidateStatus
);

/**
 * @route   PUT /api/candidates/:id/notes
 * @desc    Update candidate notes
 * @access  Private (Employer)
 */
router.put(
  '/:id/notes',
  [
    param('id').isString().withMessage('Candidate ID is required'),
    body('notes').isString().withMessage('Notes must be a string'),
    validate
  ],
  updateCandidateNotes
);

/**
 * @route   PUT /api/candidates/:id/rating
 * @desc    Update candidate rating
 * @access  Private (Employer)
 */
router.put(
  '/:id/rating',
  [
    param('id').isString().withMessage('Candidate ID is required'),
    body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    validate
  ],
  updateCandidateRating
);

/**
 * @route   PUT /api/candidates/:id/tags
 * @desc    Update candidate tags
 * @access  Private (Employer)
 */
router.put(
  '/:id/tags',
  [
    param('id').isString().withMessage('Candidate ID is required'),
    body('tags').isArray().withMessage('Tags must be an array'),
    validate
  ],
  updateCandidateTags
);

/**
 * @route   PUT /api/candidates/:id/interview
 * @desc    Schedule interview
 * @access  Private (Employer)
 */
router.put(
  '/:id/interview',
  [
    param('id').isString().withMessage('Candidate ID is required'),
    body('interview_date').isISO8601().withMessage('Valid interview date is required'),
    validate
  ],
  scheduleInterview
);

module.exports = router;