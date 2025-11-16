const { Resume } = require('../models');
const { User } = require('../models');

// Get user's resume
const getResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ user_id: req.user.userId });

    // If resume doesn't exist, create a default one
    if (!resume) {
      const user = await User.findById(req.user.userId);
      resume = await Resume.create({
        user_id: req.user.userId,
        full_name: user.name,
        email: user.email
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Update resume
const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ user_id: req.user.userId });

    if (!resume) {
      // Create new resume if it doesn't exist
      resume = await Resume.create({
        user_id: req.user.userId,
        ...req.body
      });
    } else {
      // Update existing resume
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          resume[key] = req.body[key];
        }
      });
      await resume.save();
    }

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Add education entry
const addEducation = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    resume.education.push(req.body);
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Education added successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Update education entry
const updateEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    const education = resume.education.id(id);
    if (!education) {
      return res.status(404).json({
        success: false,
        error: { code: 'EDUCATION_NOT_FOUND', message: 'Education entry not found' }
      });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        education[key] = req.body[key];
      }
    });

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Delete education entry
const deleteEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    resume.education.pull(id);
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Education deleted successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Add experience entry
const addExperience = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    resume.experience.push(req.body);
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Experience added successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Update experience entry
const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    const experience = resume.experience.id(id);
    if (!experience) {
      return res.status(404).json({
        success: false,
        error: { code: 'EXPERIENCE_NOT_FOUND', message: 'Experience entry not found' }
      });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        experience[key] = req.body[key];
      }
    });

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Delete experience entry
const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    resume.experience.pull(id);
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// Calculate ATS score
const calculateATSScore = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    // Simple ATS score calculation
    let score = 0;
    
    // Personal info (20 points)
    if (resume.full_name) score += 5;
    if (resume.email) score += 5;
    if (resume.phone) score += 5;
    if (resume.address?.city) score += 5;
    
    // Professional summary (15 points)
    if (resume.professional_summary && resume.professional_summary.length > 50) score += 15;
    
    // Education (15 points)
    if (resume.education && resume.education.length > 0) score += 15;
    
    // Experience (20 points)
    if (resume.experience && resume.experience.length > 0) {
      score += Math.min(resume.experience.length * 10, 20);
    }
    
    // Skills (15 points)
    const totalSkills = (resume.hard_skills?.length || 0) + (resume.soft_skills?.length || 0);
    if (totalSkills > 0) {
      score += Math.min(totalSkills * 3, 15);
    }
    
    // Languages (10 points)
    if (resume.languages && resume.languages.length > 0) {
      score += Math.min(resume.languages.length * 5, 10);
    }
    
    // Job preferences (5 points)
    if (resume.looking_for?.positions && resume.looking_for.positions.length > 0) score += 5;
    
    resume.ats_score = Math.min(score, 100);
    await resume.save();

    res.status(200).json({
      success: true,
      data: { ats_score: resume.ats_score }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResume,
  updateResume,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  calculateATSScore
};
