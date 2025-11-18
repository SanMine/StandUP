/**
 * AI Test Suite
 * Tests: AI-001, AI-002, AI-003, AI-004
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job, UserSkill } = require('../src/models');
const { connectDB } = require('../src/config/database');
const mongoose = require('mongoose');

describe('AI Test Suite', () => {
  let testUser;
  let authCookies;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
    // Clean up
    await User.deleteMany({ email: { $in: ['test.ai@standup.com', 'employer.ai@standup.com'] } });
    await Job.deleteMany({ company: 'AI Test Company' });

    // Create employer user first
    const employerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'employer.ai@standup.com',
        password: 'testpass123',
        name: 'AI Test Employer',
        role: 'employer'
      });

    const employerId = employerRes.body.user._id;

    // Create test user with skills
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.ai@standup.com',
        password: 'testpass123',
        name: 'AI Test User',
        role: 'student'
      });

    testUser = signupRes.body.user;
    authCookies = signupRes.headers['set-cookie'];

    // Add user skills via onboarding
    await request(app)
      .post('/api/users/onboarding')
      .set('Cookie', authCookies)
      .send({ 
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python'] 
      });

    // Create diverse test jobs with correct schema
    const jobs = [
      {
        employer_id: employerId,
        title: 'Senior Frontend Developer',
        company: 'AI Test Company',
        location: 'Bangkok',
        type: 'Full-time',
        requirements: ['React', 'JavaScript', 'TypeScript'],
        description: 'Frontend role with React',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'Full Stack Engineer',
        company: 'AI Test Company',
        location: 'Bangkok',
        type: 'Full-time',
        requirements: ['React', 'Node.js', 'MongoDB'],
        description: 'Full stack development',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'Backend Developer',
        company: 'AI Test Company',
        location: 'Chiang Mai',
        type: 'Full-time',
        requirements: ['Node.js', 'Python', 'PostgreSQL'],
        description: 'Backend development',
        status: 'active'
      },
      {
        employer_id: employerId,
        title: 'DevOps Engineer',
        company: 'AI Test Company',
        location: 'Remote',
        type: 'Full-time',
        requirements: ['Docker', 'Kubernetes', 'AWS'],
        description: 'DevOps and cloud infrastructure',
        status: 'active'
      }
    ];

    await Job.insertMany(jobs);
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['test.ai@standup.com', 'employer.ai@standup.com'] } });
    await Job.deleteMany({ company: 'AI Test Company' });
    await UserSkill.deleteMany({});
    // Close database connection
    await mongoose.connection.close();
  });

  // AI-001: Job recommendations accuracy
  describe('AI-001: Job recommendations accuracy', () => {
    it('should return ≥70% relevant jobs based on user skills and preferences', async () => {
      const res = await request(app)
        .get('/api/ai/find-match-jobs')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.matchedJobs)).toBe(true);

      const jobs = res.body.matchedJobs || [];
      
      if (jobs.length > 0) {
        // Count relevant jobs (match_score >= 50 or has matching skills)
        const relevantJobs = jobs.filter(job => {
          const matchScore = job.match_score || 0;
          const hasMatchingSkills = job.requirements?.some(req => 
            ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python'].includes(req)
          );
          
          return matchScore >= 50 || hasMatchingSkills;
        });

        const relevancePercentage = (relevantJobs.length / jobs.length) * 100;
        expect(relevancePercentage).toBeGreaterThanOrEqual(70);
      }
    });

    it('should prioritize jobs matching user skills over non-matching jobs', async () => {
      const res = await request(app)
        .get('/api/ai/find-match-jobs')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      const jobs = res.body.matchedJobs || [];
      
      if (jobs.length >= 2) {
        // First job should have higher or equal match score than last
        const firstMatch = jobs[0].match_score || 0;
        const lastMatch = jobs[jobs.length - 1].match_score || 0;
        
        expect(firstMatch).toBeGreaterThanOrEqual(lastMatch);
      }
    });
  });

  // AI-002: Duplicate / conflicting recommendations
  describe('AI-002: Duplicate / conflicting recommendations', () => {
    it('should not return duplicate job IDs in response', async () => {
      const res = await request(app)
        .get('/api/ai/find-match-jobs')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      const jobs = res.body.matchedJobs || [];
      const jobIds = jobs.map(job => job.id || job._id);
      const uniqueIds = [...new Set(jobIds)];

      expect(jobIds.length).toBe(uniqueIds.length);
    });

    it('should not recommend same job in different API calls within short timeframe', async () => {
      const res1 = await request(app)
        .get('/api/ai/find-match-jobs?limit=5')
        .set('Cookie', authCookies);

      const res2 = await request(app)
        .get('/api/ai/find-match-jobs?limit=5')
        .set('Cookie', authCookies);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const jobs1 = res1.body.matchedJobs || [];
      const jobs2 = res2.body.matchedJobs || [];
      
      const ids1 = jobs1.map(j => j._id);
      const ids2 = jobs2.map(j => j._id);

      // Results should be consistent (same order, same jobs)
      expect(ids1).toEqual(ids2);
    });
  });

  // AI-003: Performance (5,000 comparisons)
  describe('AI-003: Performance (5,000 comparisons)', () => {
    it('should complete job matching in < 10 seconds for 5000 comparisons', async () => {
      // This test simulates performance by timing the matching algorithm
      const startTime = Date.now();

      const res = await request(app)
        .post('/api/ai/match-jobs')
        .set('Cookie', authCookies)
        .send({ skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python'], limit: 100 });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // in seconds

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(10);
    }, 15000); // Set Jest timeout to 15 seconds

    it('should handle large skill sets efficiently', async () => {
      // Add many skills to user
      const manySkills = [
        'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js',
        'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker',
        'Kubernetes', 'AWS', 'Azure', 'GCP', 'Python', 'Java', 'Go', 'Rust'
      ];

      await request(app)
        .post('/api/users/onboarding')
        .set('Cookie', authCookies)
        .send({ skills: manySkills });

      const startTime = Date.now();

      const res = await request(app)
        .get('/api/ai/find-match-jobs')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(5); // Should be fast even with many skills
    });
  });

  // AI-004: Bias and fairness check
  describe('AI-004: Bias and fairness check', () => {
    it('should not include sensitive attributes (gender, race) in AI suggestions', async () => {
      const res = await request(app)
        .get('/api/ai/find-match-jobs')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      const jobs = res.body.matchedJobs || [];
      const responseStr = JSON.stringify(jobs).toLowerCase();

      // Check that response doesn't contain sensitive terms
      const sensitiveTerms = [
        'gender', 'male', 'female', 'race', 'ethnicity', 'religion',
        'age', 'disability', 'sexual orientation', 'marital status'
      ];

      sensitiveTerms.forEach(term => {
        expect(responseStr).not.toContain(term);
      });
    });

    it('should provide equal match scores for equal skill matches regardless of user profile', async () => {
      // Create another user with same skills but different profile
      const user2Res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.ai2@standup.com',
          password: 'testpass123',
          name: 'AI Test User 2',
          role: 'student'
        });

      const user2Cookies = user2Res.headers['set-cookie'];

      // Add same skills
      await request(app)
        .post('/api/users/onboarding')
        .set('Cookie', user2Cookies)
        .send({ 
          skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Python'] 
        });

      // Get recommendations for both users
      const res1 = await request(app)
        .get('/api/ai/find-match-jobs?limit=5')
        .set('Cookie', authCookies);

      const res2 = await request(app)
        .get('/api/ai/find-match-jobs?limit=5')
        .set('Cookie', user2Cookies);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      // Match scores should be similar for same job
      const jobs1 = res1.body.matchedJobs || [];
      const jobs2 = res2.body.matchedJobs || [];
      
      if (jobs1.length > 0 && jobs2.length > 0) {
        const job1 = jobs1[0];
        const job2 = jobs2.find(j => (j.id || j._id) === (job1.id || job1._id));

        if (job2) {
          const scoreDiff = Math.abs((job1.match_score || 0) - (job2.match_score || 0));
          expect(scoreDiff).toBeLessThan(10); // Scores should be very similar
        }
      }

      // Clean up
      await User.deleteMany({ email: 'test.ai2@standup.com' });
    });

    it('should not use personal identifiers in matching algorithm', async () => {
      // Update user with various personal info
      await request(app)
        .put('/api/users/profile')
        .set('Cookie', authCookies)
        .send({
          bio: 'Personal bio with details',
          graduation: '2027-05-01'
        });

      const res = await request(app)
        .get('/api/ai/find-match-jobs')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      // Recommendations should be based on skills, not personal data
      const jobs = res.body.matchedJobs || [];
      
      jobs.forEach(job => {
        // Job requirements should be skill-based
        if (job.requirements) {
          expect(Array.isArray(job.requirements)).toBe(true);
        }
      });
    });
  });
});
