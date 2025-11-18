/**
 * EMPLOYER Test Suite
 * Tests: EMP-001, EMP-002, EMP-003, EMP-004
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job, Application } = require('../src/models');

describe('EMPLOYER Test Suite', () => {
  let employerUser;
  let employerCookies;
  let studentUser;
  let studentCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: { $in: ['employer@test.com', 'student.emp@test.com'] } });

    // Create employer user
    const employerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'employer@test.com',
        password: 'testpass123',
        name: 'Test Employer',
        role: 'employer',
        company_name: 'Test Company'
      });

    employerUser = employerRes.body.data.user;
    employerCookies = employerRes.headers['set-cookie'];

    // Create student user for testing
    const studentRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student.emp@test.com',
        password: 'testpass123',
        name: 'Student For Employer Test',
        role: 'student'
      });

    studentUser = studentRes.body.data.user;
    studentCookies = studentRes.headers['set-cookie'];

    // Add skills to student
    await request(app)
      .post('/api/users/skills')
      .set('Cookie', studentCookies)
      .send({ skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'] });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['employer@test.com', 'student.emp@test.com'] } });
    await Job.deleteMany({ posted_by: employerUser?._id });
  });

  // EMP-001: Create job posting
  describe('EMP-001: Create job posting', () => {
    it('should allow employer to create job with all fields and return 201', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookies)
        .send({
          title: 'Frontend Developer',
          company: 'Test Company',
          location: 'Bangkok, Thailand',
          type: 'full-time',
          salary_min: 40000,
          salary_max: 60000,
          description: 'We are looking for a frontend developer',
          requirements: ['React', 'JavaScript', 'CSS'],
          responsibilities: ['Build UI components', 'Collaborate with team']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job).toBeDefined();
      expect(res.body.data.job.title).toBe('Frontend Developer');
      expect(res.body.data.job.posted_by).toBe(employerUser._id.toString());
    });

    it('should validate required fields (title, company, location)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookies)
        .send({
          title: 'Invalid Job'
          // Missing company and location
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent non-employer users from creating jobs', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Cookie', studentCookies)
        .send({
          title: 'Unauthorized Job',
          company: 'Test Company',
          location: 'Bangkok'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should save job to database with correct employer reference', async () => {
      const createRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookies)
        .send({
          title: 'Backend Developer',
          company: 'Test Company',
          location: 'Chiang Mai',
          type: 'full-time',
          requirements: ['Node.js', 'Express', 'MongoDB']
        });

      const jobId = createRes.body.data.job._id;

      // Verify in database
      const job = await Job.findById(jobId);
      expect(job).toBeDefined();
      expect(job.posted_by.toString()).toBe(employerUser._id.toString());
      expect(job.title).toBe('Backend Developer');
    });
  });

  // EMP-002: Candidate search and filtering
  describe('EMP-002: Candidate search and filtering', () => {
    beforeAll(async () => {
      // Create more test students with different skills
      await User.create({
        email: 'student.react@test.com',
        password: 'hashed',
        name: 'React Student',
        role: 'student'
      });

      await User.create({
        email: 'student.python@test.com',
        password: 'hashed',
        name: 'Python Student',
        role: 'student'
      });
    });

    afterAll(async () => {
      await User.deleteMany({ email: { $regex: /student\.(react|python)@test\.com/ } });
    });

    it('should search candidates by skills (React, Node.js)', async () => {
      const res = await request(app)
        .get('/api/employer/candidates?skills=React,Node.js')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.candidates)).toBe(true);

      // Should include student with matching skills
      const hasMatchingStudent = res.body.data.candidates.some(
        candidate => candidate._id === studentUser._id.toString()
      );
      expect(hasMatchingStudent).toBe(true);
    });

    it('should filter candidates by location', async () => {
      // Update student location
      await request(app)
        .put('/api/users/profile')
        .set('Cookie', studentCookies)
        .send({ location: 'Bangkok' });

      const res = await request(app)
        .get('/api/employer/candidates?location=Bangkok')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.candidates)).toBe(true);

      // All candidates should have Bangkok location
      res.body.data.candidates.forEach(candidate => {
        if (candidate.location) {
          expect(candidate.location.toLowerCase()).toContain('bangkok');
        }
      });
    });

    it('should filter by graduation year', async () => {
      // Update student graduation
      await request(app)
        .put('/api/users/profile')
        .set('Cookie', studentCookies)
        .send({ graduation: '2027-05-01' });

      const res = await request(app)
        .get('/api/employer/candidates?graduation_year=2027')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.candidates)).toBe(true);

      // Should include students graduating in 2027
      res.body.data.candidates.forEach(candidate => {
        if (candidate.graduation) {
          const year = new Date(candidate.graduation).getFullYear();
          expect(year).toBe(2027);
        }
      });
    });

    it('should support combined filters (skills + location + year)', async () => {
      const res = await request(app)
        .get('/api/employer/candidates?skills=React&location=Bangkok&graduation_year=2027')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.candidates)).toBe(true);
    });

    it('should prevent non-employer users from searching candidates', async () => {
      const res = await request(app)
        .get('/api/employer/candidates?skills=React')
        .set('Cookie', studentCookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // EMP-003: Chat security
  describe('EMP-003: Chat security', () => {
    let testJob;

    beforeAll(async () => {
      // Create test job
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookies)
        .send({
          title: 'Test Job for Chat',
          company: 'Test Company',
          location: 'Bangkok',
          type: 'full-time'
        });

      testJob = jobRes.body.data.job;

      // Student applies to job
      await request(app)
        .post('/api/applications')
        .set('Cookie', studentCookies)
        .send({
          job_id: testJob._id,
          status: 'pending'
        });
    });

    it('should encrypt messages end-to-end', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Cookie', employerCookies)
        .send({
          recipient_id: studentUser._id,
          content: 'Hello, we would like to interview you',
          job_id: testJob._id
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      const message = res.body.data.message;
      
      // Check if encryption metadata exists
      expect(
        message.encrypted ||
        message.encryption_key ||
        res.body.data.encrypted
      ).toBeTruthy();
    });

    it('should only allow chat between employer and applicants', async () => {
      // Create random student who didn't apply
      await User.deleteMany({ email: 'random.student@test.com' });
      
      const randomRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'random.student@test.com',
          password: 'testpass123',
          name: 'Random Student',
          role: 'student'
        });

      const randomCookies = randomRes.headers['set-cookie'];

      // Random student tries to message employer
      const res = await request(app)
        .post('/api/messages')
        .set('Cookie', randomCookies)
        .send({
          recipient_id: employerUser._id,
          content: 'Hello employer',
          job_id: testJob._id
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Clean up
      await User.deleteMany({ email: 'random.student@test.com' });
    });

    it('should log all message access attempts', async () => {
      // Send message
      await request(app)
        .post('/api/messages')
        .set('Cookie', employerCookies)
        .send({
          recipient_id: studentUser._id,
          content: 'Test message for audit',
          job_id: testJob._id
        });

      // Check audit log
      const auditRes = await request(app)
        .get('/api/messages/audit-log')
        .set('Cookie', employerCookies);

      expect(auditRes.status).toBe(200);
      expect(Array.isArray(auditRes.body.data.logs)).toBe(true);
      
      // Should have recent log entry
      const recentLog = auditRes.body.data.logs[0];
      expect(recentLog).toBeDefined();
      expect(recentLog.action).toBe('message_sent');
      expect(recentLog.user_id).toBe(employerUser._id.toString());
    });

    it('should prevent access to messages not addressed to user', async () => {
      // Create message from employer to student
      const msgRes = await request(app)
        .post('/api/messages')
        .set('Cookie', employerCookies)
        .send({
          recipient_id: studentUser._id,
          content: 'Private message',
          job_id: testJob._id
        });

      const messageId = msgRes.body.data.message._id;

      // Create another student who shouldn't see this message
      await User.deleteMany({ email: 'another.student@test.com' });
      
      const anotherRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'another.student@test.com',
          password: 'testpass123',
          name: 'Another Student',
          role: 'student'
        });

      const anotherCookies = anotherRes.headers['set-cookie'];

      // Try to access message
      const accessRes = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Cookie', anotherCookies);

      expect(accessRes.status).toBe(403);
      expect(accessRes.body.success).toBe(false);

      // Clean up
      await User.deleteMany({ email: 'another.student@test.com' });
    });
  });

  // EMP-004: Analytics dashboard
  describe('EMP-004: Analytics dashboard', () => {
    let analyticsJob;

    beforeAll(async () => {
      // Create job for analytics
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookies)
        .send({
          title: 'Analytics Test Job',
          company: 'Test Company',
          location: 'Bangkok',
          type: 'full-time',
          requirements: ['React', 'Node.js']
        });

      analyticsJob = jobRes.body.data.job;

      // Create multiple applications
      for (let i = 0; i < 3; i++) {
        await Application.create({
          job_id: analyticsJob._id,
          student_id: studentUser._id,
          status: i === 0 ? 'pending' : i === 1 ? 'reviewing' : 'interview'
        });
      }
    });

    it('should display job posting metrics (views, applications, hires)', async () => {
      const res = await request(app)
        .get('/api/employer/analytics')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const analytics = res.body.data;
      
      expect(analytics.total_jobs).toBeDefined();
      expect(analytics.total_applications).toBeDefined();
      expect(analytics.application_stats).toBeDefined();
      
      expect(typeof analytics.total_applications).toBe('number');
      expect(analytics.total_applications).toBeGreaterThan(0);
    });

    it('should show application pipeline (pending, reviewing, interview, etc.)', async () => {
      const res = await request(app)
        .get('/api/employer/analytics/pipeline')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      
      const pipeline = res.body.data.pipeline;
      
      expect(pipeline).toBeDefined();
      expect(pipeline.pending).toBeDefined();
      expect(pipeline.reviewing).toBeDefined();
      expect(pipeline.interview).toBeDefined();

      // Should have at least one in each stage from our test data
      expect(pipeline.pending).toBeGreaterThanOrEqual(1);
      expect(pipeline.reviewing).toBeGreaterThanOrEqual(1);
      expect(pipeline.interview).toBeGreaterThanOrEqual(1);
    });

    it('should calculate time-to-hire metrics', async () => {
      const res = await request(app)
        .get('/api/employer/analytics/time-to-hire')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      
      const metrics = res.body.data;
      
      expect(metrics.average_time_to_hire).toBeDefined();
      expect(typeof metrics.average_time_to_hire).toBe('number');
      
      // Should be in reasonable range (days)
      if (metrics.average_time_to_hire > 0) {
        expect(metrics.average_time_to_hire).toBeLessThan(365);
      }
    });

    it('should show top candidate skills across applications', async () => {
      const res = await request(app)
        .get('/api/employer/analytics/skills')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(200);
      
      const skillsData = res.body.data;
      
      expect(skillsData.top_skills).toBeDefined();
      expect(Array.isArray(skillsData.top_skills)).toBe(true);

      // Should include skills from our test student
      const hasReact = skillsData.top_skills.some(
        skill => skill.name === 'React' || skill === 'React'
      );
      expect(hasReact).toBe(true);
    });

    it('should prevent non-employer users from viewing analytics', async () => {
      const res = await request(app)
        .get('/api/employer/analytics')
        .set('Cookie', studentCookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should only show analytics for employer\'s own jobs', async () => {
      // Create another employer
      await User.deleteMany({ email: 'employer2@test.com' });
      
      const emp2Res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'employer2@test.com',
          password: 'testpass123',
          name: 'Employer 2',
          role: 'employer'
        });

      const emp2Cookies = emp2Res.headers['set-cookie'];

      const res = await request(app)
        .get('/api/employer/analytics')
        .set('Cookie', emp2Cookies);

      expect(res.status).toBe(200);
      
      // Should have 0 jobs since this employer hasn't posted any
      expect(res.body.data.total_jobs).toBe(0);
      expect(res.body.data.total_applications).toBe(0);

      // Clean up
      await User.deleteMany({ email: 'employer2@test.com' });
    });
  });
});
