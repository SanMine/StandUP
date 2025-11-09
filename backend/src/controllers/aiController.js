const { calculateJobMatch, analyzeResume, generateInterviewQuestions, getCareerRecommendations } = require('../config/gemini');
const { Job, JobSkill, User, UserSkill } = require('../models');
const { generateText } = require('ai');
const { groq } = require('@ai-sdk/groq');
const { dummyJobs } = require('../config/constants');

/**
 * Controller to find matching jobs for a user using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const findMatchingJobs = async (req, res) => {
  try {
    // For testing: Use static data or from request body
    const userSkills = req.body.userSkills || ['React', 'JavaScript', 'HTML/CSS', 'TypeScript', 'Git', 'Responsive design'];
    const desiredPosition = req.body.desiredPosition || 'Frontend Developer';
    const allJobs = req.body.allJobs || dummyJobs;

    console.log('=== Testing Job Matching ===');
    console.log('User Skills:', userSkills);
    console.log('Desired Position:', desiredPosition);
    console.log('Total Jobs to analyze:', allJobs.length);

    // Format jobs data for the prompt
    const jobsData = allJobs.map(job => 
      `Job ID: ${job.id}, Title: ${job.title}, Required Skills: ${job.requirements ? job.requirements.join(', ') : 'N/A'}, Description: ${job.description}`
    ).join('\n');

    console.log('\n=== Formatted Jobs Data (First 500 chars) ===');
    console.log(jobsData.substring(0, 500) + '...');

    // System prompt for the AI
    const systemPrompt = `You are an expert employee recruiter with years of experience in matching candidates with suitable job positions. 
Your task is to analyze job listings and candidate profiles to find the best matches based on skills alignment and job requirements.
You must be thorough, fair, and focus on matching relevant skills with job requirements.
IMPORTANT: Return ONLY the matching Job IDs in the following format: [ID1, ID2, ID3]
Do not include any explanations, just the array of Job IDs.`;

    // User prompt with candidate and jobs data
    const userPrompt = `Based on the following candidate profile and available jobs, identify ALL jobs that match the candidate's skills and desired position.

Candidate Profile:
- Skills: ${Array.isArray(userSkills) ? userSkills.join(', ') : userSkills}
- Desired Position: ${desiredPosition}

Available Jobs:
${jobsData}

Return only the Job IDs of matching positions in this exact format: [ID1, ID2, ID3]`;

    // Generate text using Groq
    console.log('\n=== Sending request to Groq AI ===');
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'), // You can change the model as needed
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3, // Lower temperature for more consistent outputs
    });

    console.log('\n=== Raw AI Response ===');
    console.log(text);

    // Parse the response to extract Job IDs
    let matchedJobIds = [];
    
    try {
      // Try to find array pattern in the response
      const arrayMatch = text.match(/\[(.*?)\]/);
      
      if (arrayMatch) {
        // Extract content between brackets and parse
        const idsString = arrayMatch[1];
        matchedJobIds = idsString
          .split(',')
          .map(id => id.trim().replace(/["']/g, ''))
          .filter(id => id.length > 0);
      } else {
        // Fallback: try to extract IDs from text
        const ids = text.match(/\b[A-Za-z0-9-_]+\b/g);
        if (ids) {
          matchedJobIds = ids;
        }
      }

      console.log('\n=== Parsed Job IDs ===');
      console.log(matchedJobIds);

      // Filter to ensure we only return valid job IDs that exist in allJobs
      const validJobIds = matchedJobIds.filter(id => 
        allJobs.some(job => job.id.toString() === id.toString())
      );

      console.log('\n=== Valid Matched Job IDs ===');
      console.log(validJobIds);
      console.log('Total Valid Matches:', validJobIds.length);

      // Get the matched jobs with details
      const matchedJobs = allJobs.filter(job => 
        validJobIds.includes(job.id.toString())
      );

      console.log('\n=== Matched Job Titles ===');
      matchedJobs.forEach(job => {
        console.log(`- ${job.title} at ${job.company} (${job.type}, ${job.mode})`);
      });

      // Return the matched jobs
      return res.status(200).json({
        success: true,
        matchedJobIds: validJobIds,
        matchedJobs: matchedJobs,
        totalMatches: validJobIds.length
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse AI response',
        rawResponse: text
      });
    }

  } catch (error) {
    console.error('Error finding matching jobs:', error);
    return res.status(500).json({
      error: 'Failed to find matching jobs',
      details: error.message
    });
  }
};

// Example route setup (add this to your routes file)
// router.post('/jobs/match', findMatchingJobs);

// Example route setup (add this to your routes file)
// router.post('/jobs/match', findMatchingJobs);

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
  findMatchingJobs,
  matchJobs,
  analyzeResumeAI,
  generateQuestions,
  getRecommendations
};
