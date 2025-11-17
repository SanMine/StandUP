const { generateText } = require('ai');
const { groq } = require('@ai-sdk/groq');

/**
 * Creates the system prompt for job matching AI (match percentage only)
 */
const createMatchPercentageSystemPrompt = () => {
    return `You are a precise, data-driven job matching algorithm that calculates compatibility scores between candidates and job positions.

Your role is to:
- Analyze skill overlap between candidate and job requirements
- Apply consistent scoring methodology across all evaluations
- Use deterministic calculation rules to ensure reproducibility
- Provide objective, unbiased percentage scores

You are NOT a career counselor or advisor in this context - you are a mathematical scoring system that applies the same rules every time.`.trim();
};

/**
 * Creates the prompt for calculating match percentage only
 */
const createMatchPercentagePrompt = (userSkills, jobData) => {
    const userSkillsList = userSkills.map(s => s.skill_name).join(', ');
    const jobSkillsList = jobData.skills.map(s => s.skill_name).join(', ');

    return `
Calculate the job match percentage between a candidate and job using the following STRICT RULES:

CANDIDATE SKILLS:
${userSkillsList || 'No skills listed'}

REQUIRED JOB SKILLS:
${jobSkillsList || 'Not specified'}

JOB TYPE: ${jobData.type}
JOB MODE: ${jobData.mode}

CALCULATION METHODOLOGY (apply consistently):

1. EXACT SKILL MATCH (70% weight):
   - Count exact matches between candidate skills and required job skills (case-insensitive)
   - Calculate: (matching_skills / total_required_skills) * 70
   - Examples:
     * 5 matches out of 5 required = 70 points
     * 3 matches out of 5 required = 42 points
     * 0 matches out of 5 required = 0 points

2. RELATED SKILL BONUS (20% weight):
   - Award points for related/transferable skills even if not exact matches
   - Frontend skills (React, Vue, Angular) are interchangeable: +15 points
   - Backend skills (Node.js, Python, Java) are interchangeable: +15 points
   - Database skills (MongoDB, PostgreSQL, MySQL) are interchangeable: +10 points
   - DevOps skills (Docker, Kubernetes, AWS, CI/CD) are interchangeable: +10 points
   - Design skills (Figma, Adobe XD, Sketch) are interchangeable: +10 points
   - Maximum 20 points from this category

3. JOB TYPE MODIFIER (10% weight):
   - Internship: More lenient, +10 points if candidate has ANY relevant skills
   - Full-time: Standard calculation, +5 points if well-matched
   - Part-time: Standard calculation, +5 points if well-matched
   - Contract: Requires stronger match, +10 points only if 60%+ skill match

FINAL SCORE = Exact Match Points + Related Skill Bonus + Job Type Modifier
- Round to nearest integer
- Cap at 100 maximum
- Minimum of 0

Respond with ONLY a JSON object in this exact format:
{
  "matchPercentage": 75
}

DO NOT include any explanation, markdown formatting, or additional text.
Apply the same calculation rules consistently for identical inputs.
`.trim();
};

/**
 * Creates the system prompt for full job matching AI analysis
 */
const createFullAnalysisSystemPrompt = () => {
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
- Culturally sensitive and professional
- Consistent in scoring methodology

When calculating match percentages, you apply the same deterministic rules every time to ensure consistency.`.trim();
};

/**
 * Creates the prompt for full job match analysis
 */
const createFullAnalysisPrompt = (userSkills, jobData, matchPercentage) => {
    const userSkillsList = userSkills.map(s => s.skill_name).join(', ');
    const jobSkillsList = jobData.skills.map(s => s.skill_name).join(', ');
    const requirements = jobData.requirements && jobData.requirements.length > 0
        ? jobData.requirements.join('\n- ')
        : 'No specific requirements listed';

    return `
Provide a detailed job matching analysis for a candidate with a ${matchPercentage}% match score.

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

CALCULATED MATCH PERCENTAGE: ${matchPercentage}%

Based on the ${matchPercentage}% match score, provide analysis in the following JSON format:

{
  "strongMatchFacts": [
    "Specific skill match explaining how candidate expertise aligns with job needs",
    "Another concrete match highlighting relevant experience or skills",
    "Third alignment showing why candidate is qualified for this role"
  ],
  "areasToImprove": [
    "Actionable skill gap with specific technology to learn",
    "Another improvement area with concrete development suggestion",
    "Third growth opportunity that would strengthen candidacy"
  ]
}

IMPORTANT GUIDELINES:

For strongMatchFacts:
- Each point must be ONE complete sentence (15-25 words)
- Reference ACTUAL skills the candidate has that match job requirements
- Be specific about WHY the skill is relevant
- If match is below 50%, provide only 1-2 facts (or encouraging general statements)
- If match is 50-74%, provide 2 facts
- If match is 75%+, provide 3 facts
- Examples:
  * "Your React.js expertise directly addresses the frontend framework requirement for building user interfaces"
  * "Experience with Node.js aligns perfectly with the backend development responsibilities listed"
  * "MongoDB knowledge matches the database technology stack used in this role"

For areasToImprove:
- Each point must be ONE complete sentence (15-25 words)
- Suggest SPECIFIC technologies, tools, or skills to develop
- Make recommendations actionable and realistic
- Focus on skills mentioned in job requirements that candidate lacks
- Always provide 2-3 improvement areas regardless of match score
- Examples:
  * "Learning Docker would enhance your deployment capabilities and match the DevOps requirements"
  * "Gaining TypeScript experience would strengthen your frontend development skills for this position"
  * "Developing AWS cloud platform knowledge would align with the infrastructure technologies used"

TONE GUIDELINES:
- Match 0-39%: Be encouraging but honest about significant gaps, focus on foundational skills to build
- Match 40-59%: Balanced tone, highlight existing strengths and clear paths to improvement
- Match 60-79%: Positive and encouraging, minor gaps to address for stronger candidacy
- Match 80-100%: Very positive, emphasize strong alignment with minor polish areas

Return ONLY valid JSON, no markdown formatting or code blocks.
Ensure facts and improvements are specific, actionable, and directly tied to the job requirements.
`.trim();
};

/**
 * Parse match percentage response
 */
const parseMatchPercentageResponse = (text) => {
    try {
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanText);

        if (typeof parsed.matchPercentage !== 'number') {
            throw new Error('Invalid match percentage format');
        }

        parsed.matchPercentage = Math.max(0, Math.min(100, Math.round(parsed.matchPercentage)));

        return parsed;
    } catch (error) {
        console.error('Error parsing match percentage response:', error);
        return { matchPercentage: 50 };
    }
};

/**
 * Parse full analysis response
 */
const parseFullAnalysisResponse = (text) => {
    try {
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanText);

        if (!Array.isArray(parsed.strongMatchFacts) || !Array.isArray(parsed.areasToImprove)) {
            throw new Error('Invalid response structure');
        }

        parsed.strongMatchFacts = parsed.strongMatchFacts
            .slice(0, 3)
            .map(fact => fact.length > 150 ? fact.substring(0, 147) + '...' : fact);

        parsed.areasToImprove = parsed.areasToImprove
            .slice(0, 3)
            .map(area => area.length > 150 ? area.substring(0, 147) + '...' : area);

        if (parsed.strongMatchFacts.length === 0) {
            parsed.strongMatchFacts = ['Review your profile to highlight relevant experience for this position'];
        }

        if (parsed.areasToImprove.length === 0) {
            parsed.areasToImprove = ['Continue developing skills relevant to this position'];
        }

        return parsed;
    } catch (error) {
        console.error('Error parsing full analysis response:', error);
        return {
            strongMatchFacts: ['Unable to analyze match - please review job requirements manually'],
            areasToImprove: ['Consider updating your skills profile for better matching']
        };
    }
};

/**
 * Calculate ONLY match percentage (fast, for job listings)
 */
const calculateMatchPercentageOnly = async (userSkills, jobData) => {
    try {
        if (!userSkills || userSkills.length === 0) {
            return { matchPercentage: 0 };
        }

        if (!jobData.skills || jobData.skills.length === 0) {
            return { matchPercentage: 60 };
        }

        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: createMatchPercentagePrompt(userSkills, jobData),
            system: createMatchPercentageSystemPrompt(),
            maxTokens: 50,
            temperature: 0.1
        });

        return parseMatchPercentageResponse(text);
    } catch (error) {
        console.error('Error calculating match percentage:', error);

        const userSkillNames = new Set(userSkills.map(s => s.skill_name.toLowerCase()));
        const jobSkillNames = jobData.skills.map(s => s.skill_name.toLowerCase());
        const matchingSkills = jobSkillNames.filter(skill => userSkillNames.has(skill));
        const matchPercentage = jobSkillNames.length > 0
            ? Math.round((matchingSkills.length / jobSkillNames.length) * 100)
            : 50;

        return { matchPercentage };
    }
};

/**
 * Calculate full job match analysis (detailed, for job details page)
 */
const calculateFullJobMatch = async (userSkills, jobData) => {
    try {
        if (!userSkills || userSkills.length === 0) {
            return {
                matchPercentage: 0,
                strongMatchFacts: ['Complete your skills profile to get personalized job matches'],
                areasToImprove: ['Add your skills to your profile to see how you match with this position']
            };
        }

        if (!jobData.skills || jobData.skills.length === 0) {
            return {
                matchPercentage: 60,
                strongMatchFacts: ['This position may be open to candidates with various skill sets'],
                areasToImprove: ['Review the full job description for additional requirements']
            };
        }

        const matchPercentageResult = await calculateMatchPercentageOnly(userSkills, jobData);
        const matchPercentage = matchPercentageResult.matchPercentage;

        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            prompt: createFullAnalysisPrompt(userSkills, jobData, matchPercentage),
            system: createFullAnalysisSystemPrompt(),
            maxTokens: 800,
            temperature: 0.3
        });

        const analysis = parseFullAnalysisResponse(text);

        return {
            matchPercentage,
            strongMatchFacts: analysis.strongMatchFacts,
            areasToImprove: analysis.areasToImprove
        };
    } catch (error) {
        console.error('Error calculating full job match:', error);

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
    calculateMatchPercentageOnly,
    calculateFullJobMatch,
    createMatchPercentageSystemPrompt,
    createMatchPercentagePrompt,
    createFullAnalysisSystemPrompt,
    createFullAnalysisPrompt,
    parseMatchPercentageResponse,
    parseFullAnalysisResponse
};