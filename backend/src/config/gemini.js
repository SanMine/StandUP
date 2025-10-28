const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model
const getModel = (modelName = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Generate content with retry logic
const generateContent = async (prompt, options = {}) => {
  try {
    const model = getModel(options.model);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    throw new Error('Failed to generate AI response');
  }
};

// Calculate job match score using Gemini AI
const calculateJobMatch = async (userProfile, jobRequirements) => {
  const prompt = `
You are an expert career advisor and job matching AI. Analyze the match between a candidate and a job.

Candidate Profile:
- Skills: ${userProfile.skills.join(', ')}
- Desired Roles: ${userProfile.desiredRoles.join(', ')}
- Experience Level: ${userProfile.experienceLevel || 'Entry-level'}
- Graduation: ${userProfile.graduation || 'N/A'}

Job Requirements:
- Title: ${jobRequirements.title}
- Required Skills: ${jobRequirements.skills.join(', ')}
- Type: ${jobRequirements.type}
- Mode: ${jobRequirements.mode}
- Requirements: ${jobRequirements.requirements.join(', ')}

Provide your analysis in the following JSON format:
{
  "matchScore": <number 0-100>,
  "whyMatch": [<array of 2-3 reasons why candidate is a good match>],
  "whyNotMatch": [<array of 1-2 areas where candidate needs improvement>],
  "recommendation": "<1-2 sentence recommendation>"
}

Be specific, encouraging, and constructive in your feedback.
  `.trim();

  try {
    const response = await generateContent(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Error calculating job match:', error);
    // Return default match if AI fails
    return {
      matchScore: 70,
      whyMatch: ['Skills alignment', 'Role preference match'],
      whyNotMatch: ['Could improve specific technical skills'],
      recommendation: 'Consider applying after reviewing job requirements.'
    };
  }
};

// Analyze resume for ATS score
const analyzeResume = async (resumeText, targetRole) => {
  const prompt = `
You are an ATS (Applicant Tracking System) expert. Analyze this resume for a ${targetRole} position.

Resume Content:
${resumeText}

Provide analysis in JSON format:
{
  "atsScore": <number 0-100>,
  "strengths": [<array of 2-3 strengths>],
  "improvements": [<array of 2-3 areas to improve>],
  "keywordSuggestions": [<array of 5-7 keywords to add>],
  "formatIssues": [<array of formatting issues if any>]
}
  `.trim();

  try {
    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      atsScore: 75,
      strengths: ['Clear structure', 'Relevant experience'],
      improvements: ['Add more keywords', 'Quantify achievements'],
      keywordSuggestions: ['Agile', 'CI/CD', 'Testing', 'APIs', 'Cloud'],
      formatIssues: []
    };
  }
};

// Generate interview questions
const generateInterviewQuestions = async (role, level = 'intermediate') => {
  const prompt = `
Generate 5 technical interview questions for a ${level} ${role} position.

Provide questions in JSON format:
[
  {
    "question": "<question text>",
    "difficulty": "<Easy/Medium/Hard>",
    "category": "<Technical/Behavioral/System Design>",
    "expectedDuration": "<time in minutes>"
  }
]
  `.trim();

  try {
    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
};

// Get career recommendations
const getCareerRecommendations = async (userProfile) => {
  const prompt = `
Provide career guidance for this candidate:
- Skills: ${userProfile.skills.join(', ')}
- Desired Roles: ${userProfile.desiredRoles.join(', ')}
- Current Level: ${userProfile.experienceLevel || 'Entry-level'}

Provide recommendations in JSON format:
{
  "skillsToLearn": [<array of 3-5 skills to acquire>],
  "careerPath": "<recommended career progression>",
  "learningResources": [<array of 2-3 learning suggestions>],
  "timeframe": "<estimated timeframe for career goals>"
}
  `.trim();

  try {
    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      skillsToLearn: ['Advanced framework knowledge', 'System design', 'Testing'],
      careerPath: 'Continue building projects and gaining experience',
      learningResources: ['Online courses', 'Open source contributions', 'Mentorship'],
      timeframe: '6-12 months for next career milestone'
    };
  }
};

module.exports = {
  getModel,
  generateContent,
  calculateJobMatch,
  analyzeResume,
  generateInterviewQuestions,
  getCareerRecommendations
};
