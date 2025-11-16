const { Candidate, Application, User, Job, Resume } = require('../models');

/**
 * Get all candidates for employer
 * @route GET /api/candidates
 * @access Private (Employer only)
 */
const getCandidates = async (req, res, next) => {
  try {
    const employerId = req.user.userId;
    const { status, job_id, search, sort = 'match_score', order = 'desc' } = req.query;

    // Build query
    const query = { employer_id: employerId };
    
    if (status) {
      query.status = status;
    }
    
    if (job_id) {
      query.job_id = job_id;
    }

    // Get candidates with populated data
    let candidatesQuery = Candidate.find(query)
      .populate('user_id', 'name email avatar bio profile_strength')
      .populate('job_id', 'title type location')
      .populate('application_id', 'applied_date status');

    // Sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    candidatesQuery = candidatesQuery.sort({ [sort]: sortOrder });

    const candidates = await candidatesQuery;

    // Fetch resumes for all candidates
    const candidatesWithResumes = await Promise.all(
      candidates.map(async (candidate) => {
        const candidateObj = candidate.toObject();
        try {
          const resume = await Resume.findOne({ user_id: candidate.user_id._id });
          candidateObj.resume = resume;
        } catch (err) {
          console.error(`Error fetching resume for user ${candidate.user_id._id}:`, err);
          candidateObj.resume = null;
        }
        return candidateObj;
      })
    );

    // Search filter (if provided)
    let filteredCandidates = candidatesWithResumes;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCandidates = candidatesWithResumes.filter(candidate => 
        candidate.user_id?.name?.toLowerCase().includes(searchLower) ||
        candidate.user_id?.email?.toLowerCase().includes(searchLower) ||
        candidate.job_id?.title?.toLowerCase().includes(searchLower)
      );
    }

    return res.status(200).json({
      success: true,
      data: filteredCandidates,
      count: filteredCandidates.length
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    next(error);
  }
};

/**
 * Get single candidate by ID
 * @route GET /api/candidates/:id
 * @access Private (Employer only)
 */
const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employerId = req.user.userId;

    const candidate = await Candidate.findOne({ _id: id, employer_id: employerId })
      .populate('user_id', 'name email avatar bio profile_strength graduation')
      .populate('job_id', 'title description type location salary_range company_name')
      .populate('application_id', 'applied_date status notes timeline');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidate not found'
        }
      });
    }

    // Fetch resume for this candidate
    const candidateObj = candidate.toObject();
    try {
      const resume = await Resume.findOne({ user_id: candidate.user_id._id });
      candidateObj.resume = resume;
    } catch (err) {
      console.error(`Error fetching resume for user ${candidate.user_id._id}:`, err);
      candidateObj.resume = null;
    }

    // Mark as viewed if not already
    if (!candidate.viewed) {
      candidate.viewed = true;
      candidate.viewed_at = new Date();
      await candidate.save();
    }

    return res.status(200).json({
      success: true,
      data: candidateObj
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    next(error);
  }
};

/**
 * Update candidate status
 * @route PUT /api/candidates/:id/status
 * @access Private (Employer only)
 */
const updateCandidateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const employerId = req.user.userId;

    const validStatuses = ['new', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      });
    }

    const candidate = await Candidate.findOne({ _id: id, employer_id: employerId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidate not found'
        }
      });
    }

    candidate.status = status;
    candidate.last_activity = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      data: candidate,
      message: 'Candidate status updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate status:', error);
    next(error);
  }
};

/**
 * Update candidate notes
 * @route PUT /api/candidates/:id/notes
 * @access Private (Employer only)
 */
const updateCandidateNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const employerId = req.user.userId;

    const candidate = await Candidate.findOne({ _id: id, employer_id: employerId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidate not found'
        }
      });
    }

    candidate.employer_notes = notes;
    candidate.last_activity = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      data: candidate,
      message: 'Notes updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate notes:', error);
    next(error);
  }
};

/**
 * Update candidate rating
 * @route PUT /api/candidates/:id/rating
 * @access Private (Employer only)
 */
const updateCandidateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const employerId = req.user.userId;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'Rating must be between 0 and 5'
        }
      });
    }

    const candidate = await Candidate.findOne({ _id: id, employer_id: employerId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidate not found'
        }
      });
    }

    candidate.rating = rating;
    candidate.last_activity = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      data: candidate,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate rating:', error);
    next(error);
  }
};

/**
 * Update candidate tags
 * @route PUT /api/candidates/:id/tags
 * @access Private (Employer only)
 */
const updateCandidateTags = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    const employerId = req.user.userId;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TAGS',
          message: 'Tags must be an array'
        }
      });
    }

    const candidate = await Candidate.findOne({ _id: id, employer_id: employerId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidate not found'
        }
      });
    }

    candidate.tags = tags;
    candidate.last_activity = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      data: candidate,
      message: 'Tags updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate tags:', error);
    next(error);
  }
};

/**
 * Schedule interview
 * @route PUT /api/candidates/:id/interview
 * @access Private (Employer only)
 */
const scheduleInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interview_date } = req.body;
    const employerId = req.user.userId;

    if (!interview_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATE',
          message: 'Interview date is required'
        }
      });
    }

    const candidate = await Candidate.findOne({ _id: id, employer_id: employerId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidate not found'
        }
      });
    }

    candidate.interview_date = new Date(interview_date);
    candidate.status = 'interview_scheduled';
    candidate.last_activity = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      data: candidate,
      message: 'Interview scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    next(error);
  }
};

/**
 * Get candidate statistics
 * @route GET /api/candidates/stats
 * @access Private (Employer only)
 */
const getCandidateStats = async (req, res, next) => {
  try {
    const employerId = req.user.userId;

    const stats = await Candidate.aggregate([
      { $match: { employer_id: employerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Candidate.countDocuments({ employer_id: employerId });
    const avgMatchScore = await Candidate.aggregate([
      { $match: { employer_id: employerId } },
      { $group: { _id: null, avgScore: { $avg: '$match_score' } } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        avgMatchScore: avgMatchScore[0]?.avgScore || 0
      }
    });
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    next(error);
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  updateCandidateStatus,
  updateCandidateNotes,
  updateCandidateRating,
  updateCandidateTags,
  scheduleInterview,
  getCandidateStats
};
