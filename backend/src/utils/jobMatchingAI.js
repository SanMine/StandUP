const { generateText } = require('ai');
const { createGroq } = require('@ai-sdk/groq');

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Creates the system prompt for job matching AI
 */
const createJobMatchSystemPrompt = () => {
    return `You are an expert career counselor and job matching specialist with deep knowledge in:
- Skills assessment and gap analysis
- Career development and growth pathways
- Technical and soft skills evaluation
- Job market trends and requirements
- Resume and profile optimization

You provide precise, actionable job matching analysis based on candidate skills and job requirements. Your assessments are:
- Data-driven and objective
- Encouraging yet realistic
- Focused on growth opportunities
- Culturally sensitive and professional`.trim();
};

/**
 * Creates the prompt for analyzing job match
 */
const createJobMatchPrompt = (userSkills, jobData) => {
    const userSkillsList = userSkills.map(s => s.skill_name).join(', ');
    const jobSkillsList = jobData.skills.map(s => s.skill_name).join(', ');
    const requirements = jobData.requirements && jobData.requirements.length > 0
        ? jobData.requirements.join('\n- ')
        : 'No specific requirements listed';

    return `
Analyze the job match between a candidate and the following job opportunity:

JOB DETAILS:
- Position: ${jobData.title}
- Company: ${jobData.company}
- Type: ${jobData.type}
- Mode: ${jobData.mode}
- Location: ${jobData.location}

REQUIRED SKILLS:
${jobSkillsList || 'Not specified'}

JOB REQUIREMENTS:
- ${requirements}

CANDIDATE SKILLS:
${userSkillsList || 'No skills listed'}

Based on this information, provide a comprehensive job matching analysis in the following JSON format:

{
  "matchPercentage": 85,
  "strongMatchFacts": [
    "Specific skill match explaining how your expertise aligns with job needs (e.g., 'React.js proficiency directly matches the frontend development requirements')",
    "Another concrete match highlighting relevant experience or skills",
    "Third alignment showing why you're qualified for this role"
  ],
  "areasToImprove": [
    "Actionable skill gap with learning suggestion (e.g., 'Docker experience would enhance your deployment capabilities')",
    "Another improvement area with specific technology or skill to develop",
    "Third growth opportunity that would strengthen your candidacy"
  ]
}

IMPORTANT: Each point should be ONE complete sentence (15-20 words) that is informative yet concise.

CALCULATION RULES FOR MATCH PERCENTAGE:
- Calculate based on skill overlap between candidate and job requirements
- Consider both technical skills and job requirements alignment
- Range: 0-100%, where:
  * 90-100%: Excellent match, candidate has all or nearly all required skills
  * 70-89%: Good match, candidate has most required skills with minor gaps
  * 50-69%: Moderate match, candidate has some skills but significant gaps exist
  * 30-49%: Weak match, candidate lacks many required skills
  * 0-29%: Poor match, candidate has few relevant skills

IMPORTANT INSTRUCTIONS:
- Analyze the ACTUAL skills and requirements provided
- Each point should be ONE complete, informative sentence (15-20 words)
- Provide 2-3 strong match facts (only include if there are actual matches)
- Provide 2-3 areas to improve (be constructive and specific)
- If candidate has very few matching skills, be honest but encouraging
- Include actual skill names and explain WHY they match or what's missing
- Make recommendations actionable and realistic with specific technologies
- Return ONLY valid JSON, no markdown formatting or code blocks
- Ensure match percentage is realistic based on actual skill overlap
- Balance being informative with being concise - avoid fluff but provide context
`.trim();
};

/**
 * Parse and validate the AI response
 */
const parseJobMatchResponse = (text) => {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const parsed = JSON.parse(cleanText);

        // Validate structure
        if (!parsed.matchPercentage || !Array.isArray(parsed.strongMatchFacts) || !Array.isArray(parsed.areasToImprove)) {
            throw new Error('Invalid response structure');
        }

        // Ensure match percentage is within valid range
        parsed.matchPercentage = Math.max(0, Math.min(100, parseInt(parsed.matchPercentage)));

        // Trim and limit strongMatchFacts (max 3 items, max 120 chars each)
        parsed.strongMatchFacts = parsed.strongMatchFacts
            .slice(0, 3)
            .map(fact => fact.length > 120 ? fact.substring(0, 117) + '...' : fact);

        // Trim and limit areasToImprove (max 3 items, max 120 chars each)
        parsed.areasToImprove = parsed.areasToImprove
            .slice(0, 3)
            .map(area => area.length > 120 ? area.substring(0, 117) + '...' : area);

        // Ensure arrays have content
        if (parsed.strongMatchFacts.length === 0) {
            parsed.strongMatchFacts = ['Review your profile to highlight relevant experience'];
        }

        if (parsed.areasToImprove.length === 0) {
            parsed.areasToImprove = ['Continue developing skills relevant to this position'];
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing job match response:', error);
        // Return default structure if parsing fails
        return {
            matchPercentage: 50,
            strongMatchFacts: ['Unable to analyze match - please review job requirements manually'],
            areasToImprove: ['Consider updating your skills profile for better matching']
        };
    }
};

/**
 * Calculate job match score using AI
 */
const calculateJobMatchWithAI = async (userSkills, jobData) => {
    try {
        // If user has no skills, return low match immediately
        if (!userSkills || userSkills.length === 0) {
            return {
                matchPercentage: 0,
                strongMatchFacts: ['Complete your skills profile to get personalized job matches'],
                areasToImprove: ['Add your skills to your profile to see how you match with this position']
            };
        }

        // If job has no required skills, return moderate match
        if (!jobData.skills || jobData.skills.length === 0) {
            return {
                matchPercentage: 60,
                strongMatchFacts: ['This position may be open to candidates with various skill sets'],
                areasToImprove: ['Review the full job description for additional requirements']
            };
        }

        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: createJobMatchPrompt(userSkills, jobData),
            system: createJobMatchSystemPrompt(),
            maxTokens: 1000,
            temperature: 0.7
        });

        return parseJobMatchResponse(text);
    } catch (error) {
        console.error('Error calculating job match with AI:', error);

        // Fallback: Calculate simple percentage match
        const userSkillNames = new Set(userSkills.map(s => s.skill_name.toLowerCase()));
        const jobSkillNames = jobData.skills.map(s => s.skill_name.toLowerCase());
        const matchingSkills = jobSkillNames.filter(skill => userSkillNames.has(skill));
        const matchPercentage = jobSkillNames.length > 0
            ? Math.round((matchingSkills.length / jobSkillNames.length) * 100)
            : 50;

        return {
            matchPercentage,
            strongMatchFacts: matchingSkills.length > 0
                ? [`You have ${matchingSkills.length} matching skill(s) for this position`]
                : ['Review the job requirements to identify relevant experience'],
            areasToImprove: ['AI analysis temporarily unavailable - review job description for detailed requirements']
        };
    }
};

module.exports = {
    calculateJobMatchWithAI,
    createJobMatchSystemPrompt,
    createJobMatchPrompt,
    parseJobMatchResponse
};