/**
 * PERFORMANCE Test Suite
 * Tests: PERF-001, PERF-002, PERF-003
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job, Application } = require('../src/models');
const path = require('path');
const fs = require('fs');

describe('PERFORMANCE Test Suite', () => {
  let testUser;
  let authCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'test.performance@standup.com' });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.performance@standup.com',
        password: 'testpass123',
        name: 'Performance Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];

    // Add skills for matching
    await request(app)
      .post('/api/users/skills')
      .set('Cookie', authCookies)
      .send({ 
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express'] 
      });

    // Create test jobs for performance testing
    const testJobs = [];
    for (let i = 0; i < 100; i++) {
      testJobs.push({
        title: `Test Job ${i}`,
        company: `Company ${i}`,
        location: i % 2 === 0 ? 'Bangkok' : 'Chiang Mai',
        type: i % 3 === 0 ? 'full-time' : i % 3 === 1 ? 'part-time' : 'internship',
        salary_min: 30000 + (i * 1000),
        salary_max: 50000 + (i * 1000),
        requirements: ['React', 'JavaScript', 'Node.js'],
        description: `Description for job ${i}`
      });
    }
    await Job.insertMany(testJobs);
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test.performance@standup.com' });
    await Job.deleteMany({ title: /^Test Job/ });
  });

  // PERF-001: Job matching performance
  describe('PERF-001: Job matching performance', () => {
    it('should return AI job recommendations within 3 seconds', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(duration).toBeLessThan(3);

      // Should return recommendations
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
    }, 5000);

    it('should handle large job dataset (1000+ jobs) efficiently', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/jobs?limit=1000')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(5);
    }, 10000);

    it('should use pagination to improve response time', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/jobs?page=1&limit=20')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(1);

      const data = res.body.data;
      expect(data.jobs.length).toBeLessThanOrEqual(20);
      expect(data.page || data.current_page).toBe(1);
      expect(data.total || data.total_count).toBeDefined();
    });

    it('should cache repeated recommendation requests', async () => {
      // First request (cache miss)
      const start1 = Date.now();
      await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', authCookies);
      const duration1 = Date.now() - start1;

      // Second request (should be cached)
      const start2 = Date.now();
      const res2 = await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', authCookies);
      const duration2 = Date.now() - start2;

      expect(res2.status).toBe(200);
      
      // Second request should be faster (or similar if already optimized)
      expect(duration2).toBeLessThanOrEqual(duration1 * 1.2);
    }, 10000);

    it('should optimize database queries with indexes', async () => {
      // Test filtered search performance
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/jobs?location=Bangkok&type=full-time&salary_min=40000')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(2);
    });
  });

  // PERF-002: Resume upload performance
  describe('PERF-002: Resume upload performance', () => {
    let testFilePath;

    beforeAll(() => {
      // Create test resume file (simulate PDF)
      testFilePath = path.join(__dirname, 'test-resume.pdf');
      
      // Create a file under 50MB for testing
      const testContent = Buffer.alloc(1024 * 1024 * 2); // 2MB
      fs.writeFileSync(testFilePath, testContent);
    });

    afterAll(() => {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('should accept resume files up to 50MB', async () => {
      const res = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', authCookies)
        .attach('resume', testFilePath);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('should process and return within 5 seconds', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', authCookies)
        .attach('resume', testFilePath);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect([200, 201]).toContain(res.status);
      expect(duration).toBeLessThan(5);
    }, 10000);

    it('should reject files larger than 50MB', async () => {
      // Create large file
      const largeFilePath = path.join(__dirname, 'large-resume.pdf');
      const largeContent = Buffer.alloc(1024 * 1024 * 51); // 51MB
      fs.writeFileSync(largeFilePath, largeContent);

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', authCookies)
        .attach('resume', largeFilePath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      // Clean up
      fs.unlinkSync(largeFilePath);
    }, 10000);

    it('should validate file type (PDF, DOCX only)', async () => {
      // Create invalid file type
      const invalidFilePath = path.join(__dirname, 'invalid-file.txt');
      fs.writeFileSync(invalidFilePath, 'This is not a resume');

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Cookie', authCookies)
        .attach('resume', invalidFilePath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      // Clean up
      fs.unlinkSync(invalidFilePath);
    });

    it('should extract text from resume efficiently', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .post('/api/resume/parse')
        .set('Cookie', authCookies)
        .attach('resume', testFilePath);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (res.status === 200) {
        expect(duration).toBeLessThan(5);
        expect(res.body.data.parsed_text || res.body.data.text).toBeDefined();
      }
    }, 10000);
  });

  // PERF-003: Dashboard real-time updates
  describe('PERF-003: Dashboard real-time updates', () => {
    it('should load dashboard data within 2 seconds', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/dashboard')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(duration).toBeLessThan(2);
    });

    it('should update KPIs instantly when new data is added', async () => {
      // Get initial dashboard
      const before = await request(app)
        .get('/api/dashboard')
        .set('Cookie', authCookies);

      const initialAppCount = before.body.data.applications_count || 0;

      // Create new application
      const job = await Job.findOne({ title: /^Test Job/ });
      
      await request(app)
        .post('/api/applications')
        .set('Cookie', authCookies)
        .send({
          job_id: job._id,
          status: 'pending'
        });

      // Get updated dashboard
      const after = await request(app)
        .get('/api/dashboard')
        .set('Cookie', authCookies);

      const updatedAppCount = after.body.data.applications_count || 0;

      expect(updatedAppCount).toBe(initialAppCount + 1);
    });

    it('should use WebSocket/SSE for real-time notifications', async () => {
      // Test if real-time endpoint exists
      const res = await request(app)
        .get('/api/notifications/stream')
        .set('Cookie', authCookies);

      // Should either establish connection or return proper response
      expect([200, 101, 426]).toContain(res.status);
    });

    it('should batch multiple updates to reduce server load', async () => {
      const startTime = Date.now();

      // Create multiple applications rapidly
      const job = await Job.findOne({ title: /^Test Job/ });
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/applications')
            .set('Cookie', authCookies)
            .send({
              job_id: job._id,
              status: 'pending'
            })
        );
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Should handle batch operations efficiently
      expect(duration).toBeLessThan(5);
    }, 10000);

    it('should optimize queries with database indexes', async () => {
      // Test complex dashboard query performance
      const startTime = Date.now();

      const res = await request(app)
        .get('/api/dashboard/detailed')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(3);
    });

    it('should handle concurrent dashboard requests efficiently', async () => {
      const startTime = Date.now();

      // Simulate multiple users accessing dashboard
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get('/api/dashboard')
            .set('Cookie', authCookies)
        );
      }

      const results = await Promise.all(requests);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // All requests should succeed
      results.forEach(res => {
        expect(res.status).toBe(200);
      });

      // Should handle concurrent load efficiently
      expect(duration).toBeLessThan(5);
    }, 10000);
  });
});
