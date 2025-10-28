const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const portfolioController = require('../controllers/portfolioController');
const validate = require('../middlewares/validate');
const { isAuthenticated, isStudent } = require('../middlewares/auth');

// Get user's projects
router.get('/projects', isAuthenticated, isStudent, portfolioController.getUserProjects);

// Add new project
router.post(
  '/projects',
  isAuthenticated,
  isStudent,
  [
    body('title').notEmpty().withMessage('Project title is required'),
    body('description').notEmpty().withMessage('Project description is required')
  ],
  validate,
  portfolioController.addProject
);

// Update project
router.put('/projects/:id', isAuthenticated, isStudent, portfolioController.updateProject);

// Delete project
router.delete('/projects/:id', isAuthenticated, isStudent, portfolioController.deleteProject);

module.exports = router;
