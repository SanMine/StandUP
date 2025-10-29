const gemini = require('../src/config/gemini');

describe('calculateJobMatch', () => {
  const userProfile = {
    skills: ['javascript', 'react'],
    desiredRoles: ['Frontend Developer'],
    experienceLevel: 'junior',
    graduation: '2024-05-01'
  };

  const jobRequirements = {
    title: 'Frontend Developer',
    skills: ['javascript', 'react', 'css'],
    type: 'full-time',
    mode: 'remote',
    requirements: ['3+ years', 'portfolio']
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('parses AI JSON response and returns match object', async () => {
    const aiResponse = `Some analysis text... {"matchScore":92,"whyMatch":["Great JS","React experience"],"whyNotMatch":["Needs CSS"],"recommendation":"Apply with portfolio"} extra text`;
    jest.spyOn(gemini, 'generateContent').mockResolvedValue(aiResponse);

    const result = await gemini.calculateJobMatch(userProfile, jobRequirements);

    expect(result).toBeDefined();
    expect(typeof result.matchScore).toBe('number');
    expect(result.matchScore).toBe(92);
    expect(Array.isArray(result.whyMatch)).toBe(true);
    expect(result.recommendation).toContain('Apply');
  });

  test('returns default fallback when AI fails', async () => {
    jest.spyOn(gemini, 'generateContent').mockRejectedValue(new Error('AI error'));

    const result = await gemini.calculateJobMatch(userProfile, jobRequirements);

    expect(result).toBeDefined();
    expect(result.matchScore).toBe(70); // default in code
    expect(Array.isArray(result.whyMatch)).toBe(true);
    expect(typeof result.recommendation).toBe('string');
  });
});
