const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isStudent } = require('../middlewares/auth');


router.get("/find-match-jobs", 
  aiController.findMatchingJobs
)

// AI-po.ered job matching
router.post(
  '/match-jobs',
  isAuthenticated,
  isStudent,
  [
    body('skills').isArray().withMessage('Skills must be an array'),
    body('skills.*').notEmpty().withMessage('Skill name cannot be empty')
  ],
  validate,
  aiController.matchJobs
);
// Analyze resumed
router.post(
  '/analyze-resume',
  isAuthenticated,
  isStudent,
  [
    body('resumeText').notEmpty().withMessage('Resume text is required'),
    body('targetRole').notEmpty().withMessage('Target role is required')
  ],
  validate,
  aiController.analyzeResumeAI
);

// Generate interview questions
router.post(
  '/interview-questions',
  isAuthenticated,
  [
    body('role').notEmpty().withMessage('Role is required')
  ],
  validate,
  aiController.generateQuestions
);

// Get career recommendations
router.get('/recommendations', isAuthenticated, isStudent, aiController.getRecommendations);

module.exports = router;
