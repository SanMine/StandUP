const { calculateJobMatch, analyzeResume, generateInterviewQuestions, getCareerRecommendations } = require('../config/gemini');
const { Job, JobSkill, User, UserSkill } = require('../models');

// AI-powered job matching
const matchJobs = async (req, res, next) => {
  try {
    const { skills, desiredRoles, experienceLevel } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Skills array is required'
        }
      });
    }

    // Get active jobs
    const jobs = await Job.findAll({
      where: { status: 'active' },
      include: [{ model: JobSkill, as: 'skills' }],
      limit: 10,
      order: [['posted_date', 'DESC']]
    });

    // Calculate match scores using Gemini AI
    const matches = await Promise.all(
      jobs.map(async (job) => {
        try {
          const matchData = await calculateJobMatch(
            {
              skills,
              desiredRoles: desiredRoles || [],
              experienceLevel: experienceLevel || 'entry-level'
            },
            {
              title: job.title,
              skills: job.skills.map(s => s.skill_name),
              type: job.type,
              mode: job.mode,
              requirements: job.requirements || []
            }
          );

          return {
            jobId: job.id,
            job: job.toJSON(),
            matchScore: matchData.matchScore,
            whyMatch: matchData.whyMatch,
            whyNotMatch: matchData.whyNotMatch,
            recommendation: matchData.recommendation
          };
        } catch (error) {
          console.error('Error matching job:', job.id, error);
          return null;
        }
      })
    );

    // Filter out failed matches and sort by score
    const validMatches = matches
      .filter(m => m !== null)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      matches: validMatches
    });
  } catch (error) {
    next(error);
  }
};

// Analyze resume with AI
const analyzeResumeAI = async (req, res, next) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || !targetRole) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Resume text and target role are required'
        }
      });
    }

    const analysis = await analyzeResume(resumeText, targetRole);

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

// Generate interview questions
const generateQuestions = async (req, res, next) => {
  try {
    const { role, level } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Role is required'
        }
      });
    }

    const questions = await generateInterviewQuestions(role, level || 'intermediate');

    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    next(error);
  }
};

// Get career recommendations
const getRecommendations = async (req, res, next) => {
  try {
    // Get user profile
    const user = await User.findByPk(req.session.userId, {
      include: [{ model: UserSkill, as: 'skills' }]
    });

    if (!user || !user.skills || user.skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INCOMPLETE_PROFILE',
          message: 'Please add skills to your profile to get recommendations'
        }
      });
    }

    const recommendations = await getCareerRecommendations({
      skills: user.skills.map(s => s.skill_name),
      desiredRoles: [], // Can be added to user model
      experienceLevel: 'entry-level'
    });

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchJobs,
  analyzeResumeAI,
  generateQuestions,
  getRecommendations
};
