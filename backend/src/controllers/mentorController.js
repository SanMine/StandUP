const { Mentor, MentorSession, User } = require('../models');

// Get all mentors
const getAllMentors = async (req, res, next) => {
  try {
    const { search, expertise } = req.query;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    let mentors = await Mentor.find(query)
      .sort({ rating: -1, sessions_count: -1 })
      .lean();

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

    // Add id field
    mentors = mentors.map(m => ({ ...m, id: m._id }));

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

    const mentor = await Mentor.findById(id).lean();

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
      data: { ...mentor, id: mentor._id }
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
    const mentor = await Mentor.findById(mentorId);
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

    // Get mentor and user details
    const mentorData = await Mentor.findById(mentorId).lean();
    const userData = await User.findById(req.session.userId).select('_id name email').lean();

    res.status(201).json({
      success: true,
      message: 'Session request sent successfully',
      data: {
        ...session.toObject(),
        id: session._id,
        mentor: mentorData ? { ...mentorData, id: mentorData._id } : null,
        user: userData ? { ...userData, id: userData._id } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's mentor sessions
const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await MentorSession.find({ user_id: req.session.userId })
      .sort({ preferred_date: -1 })
      .lean();

    // Populate mentor for each session
    const sessionsWithMentor = await Promise.all(
      sessions.map(async (session) => {
        const mentor = await Mentor.findById(session.mentor_id).lean();
        return {
          ...session,
          id: session._id,
          mentor: mentor ? { ...mentor, id: mentor._id } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: sessionsWithMentor
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
