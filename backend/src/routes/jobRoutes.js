const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isEmployer } = require('../middlewares/auth');

//Get current employer's jobs (must be BEFORE '/:id')
router.get('/my-jobs', isAuthenticated, isEmployer, jobController.getMyJobs);

// Get all jobs (public)
router.get('/', isAuthenticated, jobController.getAllJobs);

// Get single job (public)
router.get('/:id', isAuthenticated, jobController.getJobById);

// Create job (employer only)
router.post(
  '/',
  isAuthenticated,
  isEmployer,
  [
    body('title').notEmpty().withMessage('Job title is required'),
    body('company').notEmpty().withMessage('Company name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('type').isIn(['Internship', 'Full-time', 'Part-time', 'Contract']).withMessage('Invalid job type'),
    body('mode').isIn(['Onsite', 'Hybrid', 'Remote']).withMessage('Invalid work mode'),
    body('description').notEmpty().withMessage('Job description is required')
  ],
  validate,
  jobController.createJob
);

// Update job (employer only)
router.put('/:id', isAuthenticated, isEmployer, jobController.updateJob);

// Delete job (employer only)
router.delete('/:id', isAuthenticated, isEmployer, jobController.deleteJob);

module.exports = router;