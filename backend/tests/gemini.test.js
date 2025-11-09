// Mock the @google/generative-ai to avoid network calls during tests.
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: async () => {
          if (global.__GEMINI_SHOULD_THROW) throw new Error('AI mock error');
          return { response: Promise.resolve({ text: () => Promise.resolve(global.__GEMINI_MOCK_RESPONSE || '') }) };
        }
      })
    }))
  };
});

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
    // reset mock signals
    global.__GEMINI_MOCK_RESPONSE = undefined;
    global.__GEMINI_SHOULD_THROW = false;
  });

  test('parses AI JSON response and returns match object', async () => {
  const aiResponse = `Some analysis text... {"matchScore":92,"whyMatch":["Great JS","React experience"],"whyNotMatch":["Needs CSS"],"recommendation":"Apply with portfolio"} extra text`;
  // Set mocked AI response for the module-level mock above
  global.__GEMINI_MOCK_RESPONSE = aiResponse;

  const result = await gemini.calculateJobMatch(userProfile, jobRequirements);

    expect(result).toBeDefined();
    expect(typeof result.matchScore).toBe('number');
    expect(result.matchScore).toBe(92);
    expect(Array.isArray(result.whyMatch)).toBe(true);
    expect(result.recommendation).toContain('Apply');
  });

  test('returns default fallback when AI fails', async () => {
  // Make the underlying mock throw to simulate AI failure
  global.__GEMINI_SHOULD_THROW = true;

  const result = await gemini.calculateJobMatch(userProfile, jobRequirements);

    expect(result).toBeDefined();
    expect(result.matchScore).toBe(70); // default in code
    expect(Array.isArray(result.whyMatch)).toBe(true);
    expect(typeof result.recommendation).toBe('string');
  });
});
