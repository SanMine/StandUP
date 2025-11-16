const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const resumeController = require('../controllers/resumeController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isStudent } = require('../middlewares/auth');

// Get user's resume
router.get('/', isAuthenticated, isStudent, resumeController.getResume);

// Update resume
router.put('/', isAuthenticated, isStudent, resumeController.updateResume);

// Education routes
router.post('/education', isAuthenticated, isStudent, [
  body('institute').notEmpty().withMessage('Institute is required')
], validate, resumeController.addEducation);

router.put('/education/:id', isAuthenticated, isStudent, resumeController.updateEducation);
router.delete('/education/:id', isAuthenticated, isStudent, resumeController.deleteEducation);

// Experience routes
router.post('/experience', isAuthenticated, isStudent, [
  body('company_name').notEmpty().withMessage('Company name is required'),
  body('job_title').notEmpty().withMessage('Job title is required'),
  body('start_date').notEmpty().withMessage('Start date is required')
], validate, resumeController.addExperience);

router.put('/experience/:id', isAuthenticated, isStudent, resumeController.updateExperience);
router.delete('/experience/:id', isAuthenticated, isStudent, resumeController.deleteExperience);

// Calculate ATS score
router.get('/ats-score', isAuthenticated, isStudent, resumeController.calculateATSScore);

module.exports = router;
