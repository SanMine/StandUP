/**
 * JOBS Test Suite
 * Tests: JOBS-001, JOBS-002, JOBS-003
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job, Application, JobSkill } = require('../src/models');

describe('JOBS Test Suite', () => {
  let testUser;
  let authCookies;
  let testJobs = [];

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'test.jobs@standup.com' });
    await Job.deleteMany({ company: 'Test Company Jobs' });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.jobs@standup.com',
        password: 'testpass123',
        name: 'Jobs Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];

    // Create test jobs
    const job1 = await Job.create({
      title: 'Frontend Developer',
      company: 'Test Company Jobs',
      location: 'Bangkok, Thailand',
      type: 'full-time',
      salary_min: 30000,
      salary_max: 50000,
      description: 'Looking for a frontend developer with React experience',
      requirements: ['React', 'JavaScript', 'HTML/CSS'],
      status: 'active'
    });

    const job2 = await Job.create({
      title: 'Backend Developer',
      company: 'Test Company Jobs',
      location: 'Chiang Mai, Thailand',
      type: 'full-time',
      salary_min: 35000,
      salary_max: 55000,
      description: 'Looking for a backend developer with Node.js experience',
      requirements: ['Node.js', 'MongoDB', 'Express'],
      status: 'active'
    });

    testJobs = [job1, job2];
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test.jobs@standup.com' });
    await Job.deleteMany({ company: 'Test Company Jobs' });
    await Application.deleteMany({ user_id: testUser?._id });
  });

  // JOBS-001: Jobs list (live)
  describe('JOBS-001: Jobs list (live)', () => {
    it('should return list of jobs with titles, company, skills, and match score', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
      expect(res.body.data.jobs.length).toBeGreaterThan(0);

      // Verify job structure
      const job = res.body.data.jobs[0];
      expect(job.title).toBeDefined();
      expect(job.company).toBeDefined();
      expect(job.location).toBeDefined();
      expect(job.type).toBeDefined();
      
      // Skills should be present (either as array or through job_skills relation)
      expect(job.requirements || job.skills).toBeDefined();
    });

    it('should include match score when user has skills', async () => {
      // Add skills to user
      await request(app)
        .post('/api/users/skills')
        .set('Cookie', authCookies)
        .send({ skills: ['React', 'JavaScript'] });

      const res = await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      if (res.body.data.jobs && res.body.data.jobs.length > 0) {
        const job = res.body.data.jobs[0];
        expect(job.match_score).toBeDefined();
        expect(typeof job.match_score).toBe('number');
        expect(job.match_score).toBeGreaterThanOrEqual(0);
        expect(job.match_score).toBeLessThanOrEqual(100);
      }
    });
  });

  // JOBS-002: Apply to job (create application)
  describe('JOBS-002: Apply to job (create application)', () => {
    it('should create application and return 201 with application in list', async () => {
      const testJob = testJobs[0];

      // Apply to job
      const applyRes = await request(app)
        .post('/api/applications')
        .set('Cookie', authCookies)
        .send({
          job_id: testJob._id,
          cover_letter: 'I am very interested in this position',
          status: 'pending'
        });

      expect(applyRes.status).toBe(201);
      expect(applyRes.body.success).toBe(true);
      expect(applyRes.body.data.application).toBeDefined();
      expect(applyRes.body.data.application.job_id).toBe(testJob._id);

      // Verify application appears in applications list
      const listRes = await request(app)
        .get('/api/applications')
        .set('Cookie', authCookies);

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data.applications)).toBe(true);
      
      const application = listRes.body.data.applications.find(
        app => app.job_id === testJob._id
      );
      expect(application).toBeDefined();
    });

    it('should prevent duplicate applications to same job', async () => {
      const testJob = testJobs[1];

      // First application
      await request(app)
        .post('/api/applications')
        .set('Cookie', authCookies)
        .send({
          job_id: testJob._id,
          status: 'pending'
        });

      // Duplicate application
      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', authCookies)
        .send({
          job_id: testJob._id,
          status: 'pending'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // JOBS-003: Jobs filtering / search
  describe('JOBS-003: Jobs filtering / search', () => {
    it('should filter jobs by location and return correct subset', async () => {
      const res = await request(app)
        .get('/api/jobs?location=Bangkok')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      if (res.body.data.jobs.length > 0) {
        res.body.data.jobs.forEach(job => {
          expect(job.location.toLowerCase()).toContain('bangkok');
        });
      }
    });

    it('should search jobs by title and return matching results', async () => {
      const res = await request(app)
        .get('/api/jobs?search=frontend')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      if (res.body.data.jobs.length > 0) {
        const hasMatch = res.body.data.jobs.some(job =>
          job.title.toLowerCase().includes('frontend') ||
          job.description.toLowerCase().includes('frontend')
        );
        expect(hasMatch).toBe(true);
      }
    });

    it('should filter jobs by type (full-time, part-time, etc.)', async () => {
      const res = await request(app)
        .get('/api/jobs?type=full-time')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      if (res.body.data.jobs.length > 0) {
        res.body.data.jobs.forEach(job => {
          expect(job.type).toBe('full-time');
        });
      }
    });

    it('should filter jobs by salary range', async () => {
      const res = await request(app)
        .get('/api/jobs?salary_min=30000&salary_max=40000')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      if (res.body.data.jobs.length > 0) {
        res.body.data.jobs.forEach(job => {
          if (job.salary_min) {
            expect(job.salary_min).toBeGreaterThanOrEqual(30000);
          }
          if (job.salary_max) {
            expect(job.salary_max).toBeLessThanOrEqual(40000);
          }
        });
      }
    });

    it('should combine multiple filters correctly', async () => {
      const res = await request(app)
        .get('/api/jobs?location=Bangkok&type=full-time&search=developer')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
    });
  });
});
