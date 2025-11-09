const { Course, Event } = require('../models');

// Get all courses
const getAllCourses = async (req, res, next) => {
  try {
    const { level, provider } = req.query;
    const query = {};

    if (level) {
      query.level = level;
    }

    if (provider) {
      query.provider = provider;
    }

    const courses = await Course.find(query)
      .sort({ rating: -1, students_count: -1 })
      .lean();

    // Add id field
    const coursesWithId = courses.map(c => ({ ...c, id: c._id }));

    res.status(200).json({
      success: true,
      data: coursesWithId
    });
  } catch (error) {
    next(error);
  }
};

// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = {
      date: { $gte: new Date() }
    };

    if (type) {
      query.type = type;
    }

    const events = await Event.find(query)
      .sort({ date: 1, time: 1 })
      .lean();

    // Add id field
    const eventsWithId = events.map(e => ({ ...e, id: e._id }));

    res.status(200).json({
      success: true,
      data: eventsWithId
    });
  } catch (error) {
    next(error);
  }
};

// Simple in-memory cache for Coursera proxy
let courseraCache = {
  ts: 0,
  data: []
};

// Fetch courses from Coursera server-side and map to UI shape
const getCourseraCourses = async (req, res, next) => {
  try {
    const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
    const now = Date.now();

    if (courseraCache.ts && (now - courseraCache.ts) < CACHE_TTL && Array.isArray(courseraCache.data) && courseraCache.data.length > 0) {
      return res.status(200).json({ success: true, data: courseraCache.data, source: 'coursera-cache' });
    }

    // Coursera public API endpoint
    const url = 'https://api.coursera.org/api/courses.v1?fields=name,photoUrl,shortDescription,primaryLanguages,slug&limit=24';

    const fetchRes = await fetch(url, { method: 'GET' });
    if (!fetchRes.ok) {
      throw new Error(`Coursera fetch failed with status ${fetchRes.status}`);
    }

    const json = await fetchRes.json();
    const elements = Array.isArray(json.elements) ? json.elements : [];

    const mapped = elements.map(el => ({
      id: el.id || el.slug || `${el.id}`,
      title: el.name || el.title || 'Untitled Course',
      thumbnail: el.photoUrl || (el.photo && el.photo.url) || '',
      provider: 'Coursera',
      instructor: '',
      topics: (el.primaryLanguages || []).slice(0, 4),
      rating: '—',
      duration: '—',
      students: 0,
      price: 'Free',
      level: 'All'
    }));

    // update cache
    courseraCache = { ts: Date.now(), data: mapped };

    res.status(200).json({ success: true, data: mapped, source: 'coursera' });
  } catch (error) {
    // don't throw — return error response so frontend can fallback
    console.error('Coursera proxy error', error?.message || error);
    res.status(502).json({ success: false, message: 'Failed to fetch Coursera courses', error: error?.message || String(error) });
  }
};

module.exports = {
  getAllCourses,
  getAllEvents,
  getCourseraCourses
};
