const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isStudent } = require('../middlewares/auth');

// Get user's applications
router.get('/', isAuthenticated, isStudent, applicationController.getUserApplications);

// Apply for a job
router.post(
  '/',
  isAuthenticated,
  isStudent,
  [
    body('jobId').notEmpty().withMessage('Job ID is required')
  ],
  validate,
  applicationController.applyForJob
);

// Update application
router.put(
  '/:id',
  isAuthenticated,
  isStudent,
  [
    body('status').optional().isIn(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']).withMessage('Invalid status')
  ],
  validate,
  applicationController.updateApplication
);

// Delete/withdraw application
router.delete('/:id', isAuthenticated, isStudent, applicationController.deleteApplication);

// Get saved jobs
router.get('/saved/jobs', isAuthenticated, isStudent, applicationController.getSavedJobs);

// Save a job
router.post(
  '/saved',
  isAuthenticated,
  isStudent,
  [
    body('jobId').notEmpty().withMessage('Job ID is required')
  ],
  validate,
  applicationController.saveJob
);

// Unsave a job
router.delete('/saved/:jobId', isAuthenticated, isStudent, applicationController.unsaveJob);

module.exports = router;
