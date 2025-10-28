const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');

// Get all courses (public)
router.get('/courses', learningController.getAllCourses);

// Get all events (public)
router.get('/events', learningController.getAllEvents);

module.exports = router;
