const { Event, Enrollment, User } = require('../models');

// Create a new event (Employer only)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      date,
      time,
      type,
      location,
      description,
      presenter,
      company,
      target_audience,
      skills,
      image,
      attachments
    } = req.body;

    const event = await Event.create({
      employer_id: req.user.userId,
      title,
      date,
      time,
      type,
      location,
      description,
      presenter,
      company,
      target_audience,
      skills: Array.isArray(skills) ? skills : [],
      image,
      attachments: Array.isArray(attachments) ? attachments : []
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { ...event.toObject(), id: event._id }
    });
  } catch (error) {
    next(error);
  }
};

// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const query = {
      date: { $gte: new Date() }
    };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    const events = await Event.find(query)
      .sort({ date: 1, time: 1 })
      .lean();

    // Get enrollment counts for each event
    const eventsWithEnrollments = await Promise.all(
      events.map(async (event) => {
        const enrollmentCount = await Enrollment.countDocuments({
          event_id: event._id,
          status: 'enrolled'
        });
        return {
          ...event,
          id: event._id,
          enrollmentCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: eventsWithEnrollments
    });
  } catch (error) {
    next(error);
  }
};

// Get single event by ID
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    // Get enrollment count
    const enrollmentCount = await Enrollment.countDocuments({
      event_id: id,
      status: 'enrolled'
    });

    // Check if current user is enrolled (if user is authenticated)
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        event_id: id,
        student_id: req.user.userId,
        status: 'enrolled'
      });
      isEnrolled = !!enrollment;
    }

    res.status(200).json({
      success: true,
      data: {
        ...event,
        id: event._id,
        enrollmentCount,
        isEnrolled
      }
    });
  } catch (error) {
    next(error);
  }
};

// Enroll in an event (Student only)
const enrollInEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId;

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      event_id: id,
      student_id: studentId,
      status: 'enrolled'
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_ENROLLED',
          message: 'You are already enrolled in this event'
        }
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      event_id: id,
      student_id: studentId
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in event',
      data: { ...enrollment.toObject(), id: enrollment._id }
    });
  } catch (error) {
    next(error);
  }
};

// Get my enrollments (Student only)
const getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.userId;

    const enrollments = await Enrollment.find({
      student_id: studentId,
      status: 'enrolled'
    }).lean();

    // Get event details for each enrollment
    const enrollmentsWithEvents = await Promise.all(
      enrollments.map(async (enrollment) => {
        const event = await Event.findById(enrollment.event_id).lean();
        return {
          ...enrollment,
          id: enrollment._id,
          event: event ? { ...event, id: event._id } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrollmentsWithEvents
    });
  } catch (error) {
    next(error);
  }
};

// Get events created by employer (Employer only)
const getMyEvents = async (req, res, next) => {
  try {
    const employerId = req.user.userId;

    const events = await Event.find({ employer_id: employerId })
      .sort({ date: -1 })
      .lean();

    // Get enrollment counts for each event
    const eventsWithEnrollments = await Promise.all(
      events.map(async (event) => {
        const enrollmentCount = await Enrollment.countDocuments({
          event_id: event._id,
          status: 'enrolled'
        });
        return {
          ...event,
          id: event._id,
          enrollmentCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: eventsWithEnrollments
    });
  } catch (error) {
    next(error);
  }
};

// Update event (Employer only)
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employerId = req.user.userId;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    // Check if user is the owner
    if (event.employer_id !== employerId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this event'
        }
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { ...updatedEvent, id: updatedEvent._id }
    });
  } catch (error) {
    next(error);
  }
};

// Delete event (Employer only)
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employerId = req.user.userId;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    // Check if user is the owner
    if (event.employer_id !== employerId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this event'
        }
      });
    }

    await Event.findByIdAndDelete(id);

    // Also delete all enrollments for this event
    await Enrollment.deleteMany({ event_id: id });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  enrollInEvent,
  getMyEnrollments,
  getMyEvents,
  updateEvent,
  deleteEvent
};
