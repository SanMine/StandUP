const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isEmployer, isStudent } = require('../middlewares/auth');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Employer routes
router.post(
  '/',
  isAuthenticated,
  isEmployer,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('presenter').notEmpty().withMessage('Presenter name is required'),
    body('company').notEmpty().withMessage('Company name is required')
  ],
  validate,
  eventController.createEvent
);

router.get('/my/events', isAuthenticated, isEmployer, eventController.getMyEvents);
router.put('/:id', isAuthenticated, isEmployer, eventController.updateEvent);
router.delete('/:id', isAuthenticated, isEmployer, eventController.deleteEvent);

// Student routes
router.post('/:id/enroll', isAuthenticated, isStudent, eventController.enrollInEvent);
router.get('/my/enrollments', isAuthenticated, isStudent, eventController.getMyEnrollments);

module.exports = router;
