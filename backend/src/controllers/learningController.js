const { Course, Event } = require('../models');

// Get all courses
const getAllCourses = async (req, res, next) => {
  try {
    const { level, provider } = req.query;
    const where = {};

    if (level) {
      where.level = level;
    }

    if (provider) {
      where.provider = provider;
    }

    const courses = await Course.findAll({
      where,
      order: [['rating', 'DESC'], ['students_count', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = {
      date: {
        [require('sequelize').Op.gte]: new Date()
      }
    };

    if (type) {
      where.type = type;
    }

    const events = await Event.findAll({
      where,
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getAllEvents
};
