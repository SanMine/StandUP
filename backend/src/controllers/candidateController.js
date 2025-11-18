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
 * Calculate match score using AI
 * @param {Object} studentData - Student profile and resume data
 * @param {Array} jobs - Employer's job postings
 * @returns {Promise<number>} - Match score percentage (0-100)
 */
const calculateAIMatchScore = async (studentData, jobs) => {
  try {
    const prompt = `You are an expert HR analyst and recruitment AI. Analyze the candidate's profile and calculate their overall match percentage with the given job openings.

CANDIDATE PROFILE:
Name: ${studentData.name}
Bio: ${studentData.bio || 'Not provided'}
Profile Strength: ${studentData.profile_strength}%
Graduation: ${studentData.graduation || 'Not provided'}
Primary Goals: ${studentData.primary_goals?.join(', ') || 'Not provided'}
Desired Positions: ${studentData.desired_positions?.join(', ') || 'Not provided'}

RESUME DATA:
${studentData.resume ? `
Skills: ${studentData.resume.skills?.join(', ') || 'Not provided'}
Education: ${studentData.resume.education?.map(edu => `${edu.degree} in ${edu.field_of_study} from ${edu.institution}`).join('; ') || 'Not provided'}
Experience: ${studentData.resume.experience?.map(exp => `${exp.title} at ${exp.company} (${exp.duration || 'Duration not specified'})`).join('; ') || 'Not provided'}
Projects: ${studentData.resume.projects?.map(proj => proj.name).join(', ') || 'Not provided'}
Certifications: ${studentData.resume.certifications?.join(', ') || 'Not provided'}
` : 'No resume uploaded'}

AVAILABLE JOB OPENINGS:
${jobs.map((job, index) => `
Job ${index + 1}:
- Title: ${job.title}
- Type: ${job.type}
- Mode: ${job.mode}
- Location: ${job.location}
- Description: ${job.description}
- Requirements: ${job.requirements || 'Not specified'}
- Skills Required: ${job.skills_required?.join(', ') || 'Not specified'}
`).join('\n')}

INSTRUCTIONS:
1. Analyze how well the candidate's skills, experience, education, and goals match with ALL the job openings
2. Consider factors like:
   - Skills alignment
   - Experience relevance
   - Education fit
   - Career goals alignment
   - Location compatibility
   - Job type preferences
3. Calculate an overall match score considering the BEST matching job among all openings
4. Return ONLY a single number between 0 and 100 representing the match percentage
5. Be realistic and fair in your assessment

RESPONSE FORMAT:
Return ONLY the numeric match score (0-100). No explanations, no text, just the number.

Example valid responses: 85, 72, 91, 45

Match Score:`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 10,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    const matchScore = parseInt(responseText);

    // Validate the score
    if (isNaN(matchScore) || matchScore < 0 || matchScore > 100) {
      console.warn(`Invalid match score received: ${responseText}. Defaulting to 0`);
      return 0;
    }

    return matchScore;
  } catch (error) {
    console.error('Error calculating AI match score:', error);
    return 0; // Default to 0 if AI fails
  }
};

/**
 * Get top matched candidates using AI
 * @route GET /api/candidates/top-matches
 * @access Private (Employer only)
 */
const getTopMatchedCandidates = async (req, res, next) => {
  try {
    const employerId = req.user.userId;
    const { limit = 10 } = req.query;

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

    // Get all employer's active jobs
    const jobs = await Job.find({
      employer_id: employerId,
      status: 'active'
    });

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No active jobs found. Please post jobs to get matched candidates.'
      });
    }

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

    // Fetch resumes for all students and calculate match scores
    const candidatesWithScores = await Promise.all(
      students.map(async (student) => {
        try {
          // Fetch resume
          const resume = await Resume.findOne({ user_id: student._id }).lean();

          // Prepare student data with resume
          const studentData = {
            ...student,
            resume
          };

          // Calculate AI match score
          const matchScore = await calculateAIMatchScore(studentData, jobs);

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
            skills: resume?.skills || [],
            location: resume?.personal_info?.location || 'Not specified',
            match_score: matchScore,
            resume: resume
          };
        } catch (error) {
          console.error(`Error processing student ${student._id}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls and candidates with 0 match score
    const validCandidates = candidatesWithScores
      .filter(candidate => candidate !== null && candidate.match_score > 0);

    // Sort by match score descending
    validCandidates.sort((a, b) => b.match_score - a.match_score);

    // Limit results
    const topCandidates = validCandidates.slice(0, parseInt(limit));

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
  getTopMatchedCandidates,
  updateCandidateStatus,
  updateCandidateNotes,
  updateCandidateRating,
  updateCandidateTags,
  scheduleInterview,
  getCandidateStats
};