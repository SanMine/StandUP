const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');

// Get all courses (public)
router.get('/courses', learningController.getAllCourses);

// Proxy Coursera courses (server-side) to avoid browser CORS and rate-limit issues
router.get('/courses/coursera', learningController.getCourseraCourses);

// Get all events (public)
router.get('/events', learningController.getAllEvents);

module.exports = router;
