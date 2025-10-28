const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const mentorController = require('../controllers/mentorController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isStudent } = require('../middlewares/auth');

// Get all mentors (public)
router.get('/', mentorController.getAllMentors);

// Get single mentor (public)
router.get('/:id', mentorController.getMentorById);

// Book mentor session (student only)
router.post(
  '/sessions',
  isAuthenticated,
  isStudent,
  [
    body('mentorId').notEmpty().withMessage('Mentor ID is required'),
    body('topic').notEmpty().withMessage('Session topic is required'),
    body('preferredDate').isISO8601().withMessage('Valid date is required'),
    body('preferredTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid time is required (HH:MM)')
  ],
  validate,
  mentorController.bookSession
);

// Get user's mentor sessions
router.get('/sessions/my', isAuthenticated, isStudent, mentorController.getUserSessions);

module.exports = router;
