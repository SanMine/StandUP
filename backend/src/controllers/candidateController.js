const { Candidate, Application, User, Job, Resume, Project, UserSkill, JobSkill } = require('../models');
const { calculateStudentJobMatch } = require('../utils/jobMatchingAI');
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
      .populate('application_id', 'applied_date status notes timeline attachments');

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

    // Fetch projects for this candidate
    try {
      const projects = await Project.find({ user_id: candidate.user_id._id });
      candidateObj.projects = projects;
    } catch (err) {
      console.error(`Error fetching projects for user ${candidate.user_id._id}:`, err);
      candidateObj.projects = [];
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
 * Get top matched candidates using AI
 * @route GET /api/candidates/top-matches
 * @access Private (Employer only - Premium required)
 */
const getTopMatchedCandidates = async (req, res, next) => {
  try {
    const employerId = req.user.userId;
    const { limit = 3 } = req.query;

    // Check if employer has premium plan
    const employer = await User.findById(employerId);
    if (!employer || employer.plan !== 'premium') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PREMIUM_REQUIRED',
          message: 'Premium plan required to access top matched candidates'
        }
      });
    }

    // Get all employer's active jobs with skills
    const jobs = await Job.find({
      employer_id: employerId,
      status: 'active'
    }).lean();

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No active jobs found. Please post jobs to get matched candidates.'
      });
    }

    // Fetch skills for each job
    const jobsWithSkills = await Promise.all(
      jobs.map(async (job) => {
        const skills = await JobSkill.find({ job_id: job._id }).lean();
        return {
          ...job,
          skills
        };
      })
    );

    // Get all student users
    const students = await User.find({ role: 'student' })
      .select('name email avatar bio profile_strength graduation primary_goals desired_positions')
      .lean();

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No candidates found in the system.'
      });
    }

    console.log(`Analyzing ${students.length} students against ${jobsWithSkills.length} jobs...`);

    // Fetch skills and calculate AI match for each student
    const candidatesWithAnalysis = await Promise.all(
      students.map(async (student) => {
        try {
          // Fetch student's skills
          const userSkills = await UserSkill.find({ user_id: student._id }).lean();

          // Calculate simple skill-based match percentage
          let matchPercentage = 0;
          if (userSkills.length > 0 && jobsWithSkills.length > 0) {
            // Find best matching job based on skills
            const userSkillNames = new Set(userSkills.map(s => s.skill_name.toLowerCase()));

            let bestMatch = 0;
            for (const job of jobsWithSkills) {
              if (job.skills && job.skills.length > 0) {
                const jobSkillNames = job.skills.map(s => s.skill_name.toLowerCase());
                const matchingSkills = jobSkillNames.filter(skill => userSkillNames.has(skill));
                const currentMatch = Math.round((matchingSkills.length / jobSkillNames.length) * 100);
                bestMatch = Math.max(bestMatch, currentMatch);
              }
            }
            matchPercentage = bestMatch;
          }

          // Skip candidates with 0 match
          if (matchPercentage === 0) {
            return null;
          }

          // Prepare student data with skills
          const studentData = {
            ...student,
            skills: userSkills
          };

          // Get AI analysis (reasons, improvements, considerations)
          const matchAnalysis = await calculateStudentJobMatch(studentData, jobsWithSkills);

          return {
            id: student._id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            bio: student.bio,
            profile_strength: student.profile_strength,
            graduation: student.graduation,
            primary_goals: student.primary_goals,
            desired_positions: student.desired_positions,
            skills: userSkills.map(s => s.skill_name),
            match_percentage: matchPercentage, // From skill matching calculation
            matched_jobs: matchAnalysis.matched_jobs,
            strong_match_reasons: matchAnalysis.strong_match_reasons,
            areas_to_improve: matchAnalysis.areas_to_improve,
            key_considerations: matchAnalysis.key_considerations
          };
        } catch (error) {
          console.error(`Error processing student ${student._id}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls
    const validCandidates = candidatesWithAnalysis.filter(candidate => candidate !== null);

    // Sort by match percentage descending
    validCandidates.sort((a, b) => b.match_percentage - a.match_percentage);

    // Limit results
    const topCandidates = validCandidates.slice(0, parseInt(limit));

    console.log(`Returning top ${topCandidates.length} matched candidates`);

    return res.status(200).json({
      success: true,
      data: topCandidates,
      count: topCandidates.length,
      total_analyzed: students.length,
      message: `Top ${topCandidates.length} matched candidates based on AI analysis`
    });
  } catch (error) {
    console.error('Error fetching top matched candidates:', error);
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

    // Sync Application status with Candidate status
    // Mapping: Candidate status -> Application status
    const statusMapping = {
      'new': null, // Don't update application status
      'reviewing': 'screening',
      'shortlisted': 'screening',
      'interview_scheduled': 'interview',
      'interviewed': 'interview',
      'offer_extended': 'offer',
      'hired': 'offer',
      'rejected': 'rejected'
    };

    const applicationStatus = statusMapping[status];
    console.log(`[Status Sync] Candidate status changed to: ${status}`);
    console.log(`[Status Sync] Application ID: ${candidate.application_id}`);
    console.log(`[Status Sync] Mapped application status: ${applicationStatus}`);
    
    if (applicationStatus) {
      try {
        const application = await Application.findById(candidate.application_id);
        console.log(`[Status Sync] Application found:`, application ? 'Yes' : 'No');
        if (application) {
          console.log(`[Status Sync] Old application status: ${application.status}`);
          application.status = applicationStatus;
          application.last_update = new Date();
          await application.save();
          console.log(`[Status Sync] New application status: ${application.status}`);
        }
      } catch (err) {
        console.error('[Status Sync] Error updating application status:', err);
        // Don't fail the request if application update fails
      }
    }

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
 * Update interview link
 * @route PUT /api/candidates/:id/interview-link
 * @access Private (Employer only)
 */
const updateInterviewLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interview_link, interview_date } = req.body;
    const employerId = req.user.userId;

    if (!interview_link) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LINK',
          message: 'Interview link is required'
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

    candidate.interview_link = interview_link;
    if (interview_date) {
      candidate.interview_date = new Date(interview_date);
    }
    candidate.last_activity = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      data: candidate,
      message: 'Interview details updated successfully'
    });
  } catch (error) {
    console.error('Error updating interview details:', error);
    next(error);
  }
};

/**
 * Delete candidate
 * @route DELETE /api/candidates/:id
 * @access Private (Employer only)
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
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

    await Candidate.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
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
  getTopMatchedCandidates,
  updateCandidateStatus,
  updateCandidateNotes,
  updateCandidateRating,
  updateCandidateTags,
  scheduleInterview,
  updateInterviewLink,
  deleteCandidate,
  getCandidateStats
};