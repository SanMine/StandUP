const { Mentor, MentorSession, User } = require('../models');
const { Op } = require('sequelize');

// Get all mentors
const getAllMentors = async (req, res, next) => {
  try {
    const { search, expertise } = req.query;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } }
      ];
    }

    let mentors = await Mentor.findAll({
      where,
      order: [['rating', 'DESC'], ['sessions_count', 'DESC']]
    });

    // Filter by expertise if provided
    if (expertise) {
      const expertiseArray = expertise.split(',');
      mentors = mentors.filter(mentor => 
        mentor.expertise && 
        mentor.expertise.some(exp => 
          expertiseArray.some(e => exp.toLowerCase().includes(e.toLowerCase()))
        )
      );
    }

    res.status(200).json({
      success: true,
      data: mentors
    });
  } catch (error) {
    next(error);
  }
};

// Get single mentor
const getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mentor = await Mentor.findByPk(id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MENTOR_NOT_FOUND',
          message: 'Mentor not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: mentor
    });
  } catch (error) {
    next(error);
  }
};

// Book mentor session
const bookSession = async (req, res, next) => {
  try {
    const { mentorId, topic, preferredDate, preferredTime, message } = req.body;

    // Check if mentor exists
    const mentor = await Mentor.findByPk(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MENTOR_NOT_FOUND',
          message: 'Mentor not found'
        }
      });
    }

    // Create session
    const session = await MentorSession.create({
      user_id: req.session.userId,
      mentor_id: mentorId,
      topic,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      message: message || '',
      status: 'pending'
    });

    const sessionWithDetails = await MentorSession.findByPk(session.id, {
      include: [
        { model: Mentor, as: 'mentor' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Session request sent successfully',
      data: sessionWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Get user's mentor sessions
const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await MentorSession.findAll({
      where: { user_id: req.session.userId },
      include: [{ model: Mentor, as: 'mentor' }],
      order: [['preferred_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMentors,
  getMentorById,
  bookSession,
  getUserSessions
};
