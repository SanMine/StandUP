const { Resume } = require('../models');
const { User } = require('../models');
const { generateText } = require('ai');
const { createGroq } = require('@ai-sdk/groq');

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

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

// Calculate ATS score with AI analysis
const calculateATSScore = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user_id: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    // Try AI-powered analysis first
    try {
      const resumeAnalysisPrompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume and provide a detailed ATS compatibility score.

RESUME DATA:
Name: ${resume.full_name || 'Not provided'}
Email: ${resume.email || 'Not provided'}
Phone: ${resume.phone || 'Not provided'}
Location: ${resume.address?.city || 'Not provided'}, ${resume.address?.country || ''}

Professional Summary: ${resume.professional_summary || 'Not provided'}

Education: ${resume.education?.length || 0} entries
${resume.education?.map(edu => `- ${edu.degree || 'Degree'} in ${edu.major || 'N/A'} from ${edu.institute || 'N/A'} (GPA: ${edu.gpa || 'N/A'})`).join('\n') || 'None'}

Work Experience: ${resume.experience?.length || 0} entries
${resume.experience?.map(exp => `- ${exp.job_title || 'Position'} at ${exp.company_name || 'Company'} (${exp.start_date ? new Date(exp.start_date).getFullYear() : ''}-${exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''})`).join('\n') || 'None'}

Technical Skills: ${resume.hard_skills?.join(', ') || 'None'}
Soft Skills: ${resume.soft_skills?.join(', ') || 'None'}

Languages: ${resume.languages?.map(l => `${l.language} (${l.proficiency})`).join(', ') || 'None'}

Certifications: ${resume.certifications?.length || 0} entries
${resume.certifications?.map(cert => `- ${cert.name} by ${cert.issuing_organization || 'N/A'}`).join('\n') || 'None'}

Job Preferences: ${resume.looking_for?.positions?.join(', ') || 'Not specified'}

Analyze this resume and provide an ATS score (0-100) based on:
1. Completeness of information (contact info, summary, experience, education)
2. Keyword richness and relevance
3. Professional formatting and structure
4. Skills diversity and relevance
5. Experience quality and descriptions
6. Education credentials
7. Additional qualifications (certifications, languages)

Return ONLY a valid JSON object with this exact structure:
{
  "score": 85,
  "strengths": [
    "Specific strength point about the resume (one sentence)",
    "Another strength highlighting what's good",
    "Third strength showing resume advantages"
  ],
  "improvements": [
    "Specific actionable improvement suggestion (one sentence)",
    "Another concrete way to enhance ATS compatibility",
    "Third improvement recommendation"
  ],
  "summary": "Brief 2-3 sentence overall assessment of resume ATS compatibility"
}

IMPORTANT:
- Score should be realistic (0-100)
- Each strength/improvement should be ONE informative sentence
- Be specific and actionable
- Return ONLY valid JSON, no markdown or code blocks
- If resume is incomplete, score should reflect that (lower scores for missing sections)
`.trim();

      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: resumeAnalysisPrompt,
        maxTokens: 1000,
        temperature: 0.7
      });

      // Parse AI response
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiAnalysis = JSON.parse(cleanText);

      // Validate and ensure score is within range
      const atsScore = Math.max(0, Math.min(100, parseInt(aiAnalysis.score)));

      res.status(200).json({
        success: true,
        data: {
          score: atsScore,
          strengths: aiAnalysis.strengths?.slice(0, 3) || [],
          improvements: aiAnalysis.improvements?.slice(0, 3) || [],
          summary: aiAnalysis.summary || 'Resume analyzed successfully'
        }
      });

    } catch (aiError) {
      console.error('AI analysis failed, falling back to simple calculation:', aiError);
      
      // Fallback: Simple ATS score calculation
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
      
      const finalScore = Math.min(score, 100);

      res.status(200).json({
        success: true,
        data: {
          score: finalScore,
          strengths: ['Resume contains essential contact information'],
          improvements: ['Add more details to strengthen your profile'],
          summary: 'Basic ATS analysis completed'
        }
      });
    }
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
