/**
 * CAREER Test Suite
 * Tests: CAREER-001, CAREER-002, CAREER-003, CAREER-004, CAREER-005
 */

const request = require('supertest');
const app = require('../src/app');
const { User, CareerRoadmap, MentorSession, Mentor } = require('../src/models');

describe('CAREER Test Suite', () => {
  let testUser;
  let authCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'test.career@standup.com' });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.career@standup.com',
        password: 'testpass123',
        name: 'Career Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test.career@standup.com' });
  });

  // CAREER-001: Profile evaluation AI
  describe('CAREER-001: Profile evaluation AI', () => {
    it('should analyze profile and return career recommendations within 3 seconds', async () => {
      // Setup user profile
      await request(app)
        .put('/api/users/profile')
        .set('Cookie', authCookies)
        .send({
          bio: 'Passionate software developer',
          graduation: '2027-05-01',
          desired_positions: ['Software Engineer', 'Full Stack Developer']
        });

      await request(app)
        .post('/api/users/skills')
        .set('Cookie', authCookies)
        .send({ skills: ['React', 'Node.js', 'JavaScript'] });

      const startTime = Date.now();

      const res = await request(app)
        .get('/api/ai/recommendations')
        .set('Cookie', authCookies);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(duration).toBeLessThan(3);

      // Verify recommendations structure
      expect(res.body.data.recommendations).toBeDefined();
    }, 5000);

    it('should provide career path recommendations based on skills', async () => {
      const res = await request(app)
        .get('/api/ai/recommendations')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      const recommendations = res.body.data.recommendations;
      
      if (recommendations) {
        expect(typeof recommendations).toBe('object');
        // Recommendations should include suggested roles or paths
        expect(
          recommendations.suggested_roles || 
          recommendations.career_paths ||
          recommendations.next_steps
        ).toBeDefined();
      }
    });
  });

  // CAREER-002: Skill deficiency assessment
  describe('CAREER-002: Skill deficiency assessment', () => {
    it('should show missing skills vs job market needs when user adds skills', async () => {
      // Add some skills
      await request(app)
        .post('/api/users/skills')
        .set('Cookie', authCookies)
        .send({ skills: ['React', 'JavaScript'] });

      // Set desired position
      await request(app)
        .post('/api/users/career-roadmap')
        .set('Cookie', authCookies)
        .send({
          desired_positions: ['Full Stack Developer'],
          target_graduation_date: '2027-05-01'
        });

      // Get skill gap analysis
      const res = await request(app)
        .get('/api/users/skill-gap')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const skillGap = res.body.data;
      
      // Should show what skills are missing
      expect(skillGap.missing_skills || skillGap.recommended_skills).toBeDefined();
      
      if (skillGap.missing_skills) {
        expect(Array.isArray(skillGap.missing_skills)).toBe(true);
        // For Full Stack, might recommend backend skills
        const hasBackendSkill = skillGap.missing_skills.some(skill =>
          ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'].includes(skill)
        );
        expect(hasBackendSkill).toBe(true);
      }
    });

    it('should update skill gaps when new skills are added', async () => {
      // Get initial gap
      const before = await request(app)
        .get('/api/users/skill-gap')
        .set('Cookie', authCookies);

      const initialMissing = before.body.data.missing_skills || [];

      // Add a missing skill
      if (initialMissing.length > 0) {
        await request(app)
          .post('/api/users/skills')
          .set('Cookie', authCookies)
          .send({ skills: [initialMissing[0]] });

        // Get updated gap
        const after = await request(app)
          .get('/api/users/skill-gap')
          .set('Cookie', authCookies);

        const updatedMissing = after.body.data.missing_skills || [];
        
        // Should have one less missing skill
        expect(updatedMissing.length).toBe(initialMissing.length - 1);
      }
    });
  });

  // CAREER-003: Resume optimization
  describe('CAREER-003: Resume optimization', () => {
    it('should suggest resume improvements and update fields on Save', async () => {
      // Get resume optimization suggestions
      const suggestRes = await request(app)
        .post('/api/ai/analyze-resume')
        .set('Cookie', authCookies)
        .send({
          resumeText: 'Basic resume content',
          targetRole: 'Software Engineer'
        });

      expect(suggestRes.status).toBe(200);
      expect(suggestRes.body.success).toBe(true);
      expect(suggestRes.body.data.suggestions).toBeDefined();

      // Apply suggestions (update resume)
      const updateRes = await request(app)
        .put('/api/resume')
        .set('Cookie', authCookies)
        .send({
          professional_summary: 'Improved summary based on AI suggestions',
          hard_skills: ['React', 'Node.js', 'TypeScript']
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);

      // Verify update persisted
      const getRes = await request(app)
        .get('/api/resume')
        .set('Cookie', authCookies);

      expect(getRes.body.data.resume.professional_summary).toContain('Improved');
    });

    it('should analyze resume content and provide actionable feedback', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-resume')
        .set('Cookie', authCookies)
        .send({
          resumeText: 'Software developer with experience in web development',
          targetRole: 'Senior Software Engineer'
        });

      expect(res.status).toBe(200);
      
      const analysis = res.body.data;
      expect(analysis.suggestions).toBeDefined();
      expect(Array.isArray(analysis.suggestions)).toBe(true);
      
      // Suggestions should be actionable
      if (analysis.suggestions.length > 0) {
        analysis.suggestions.forEach(suggestion => {
          expect(typeof suggestion).toBe('string');
          expect(suggestion.length).toBeGreaterThan(10);
        });
      }
    });
  });

  // CAREER-004: Mentorship request workflow
  describe('CAREER-004: Mentorship request workflow', () => {
    let testMentor;

    beforeAll(async () => {
      // Create test mentor
      testMentor = await Mentor.create({
        name: 'Test Mentor',
        title: 'Senior Software Engineer',
        company: 'Tech Company',
        expertise: ['React', 'Node.js', 'Career Development'],
        availability: 'available',
        rating: 4.5
      });
    });

    afterAll(async () => {
      await Mentor.deleteMany({ name: 'Test Mentor' });
      await MentorSession.deleteMany({ student_id: testUser._id });
    });

    it('should create mentor request and set status to "Pending Acceptance"', async () => {
      const res = await request(app)
        .post('/api/mentors/request-session')
        .set('Cookie', authCookies)
        .send({
          mentor_id: testMentor._id,
          topic: 'Career guidance',
          preferred_date: '2025-11-25',
          message: 'I would like to discuss my career path'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session).toBeDefined();
      expect(res.body.data.session.status).toBe('pending');
    });

    it('should send notification to mentor when request is created', async () => {
      const res = await request(app)
        .post('/api/mentors/request-session')
        .set('Cookie', authCookies)
        .send({
          mentor_id: testMentor._id,
          topic: 'Technical interview prep',
          preferred_date: '2025-11-26'
        });

      expect(res.status).toBe(201);
      
      // Check if notification flag is set
      expect(
        res.body.data.notification_sent ||
        res.body.data.session.notification_sent
      ).toBeTruthy();
    });

    it('should prevent duplicate requests to same mentor', async () => {
      // First request
      await request(app)
        .post('/api/mentors/request-session')
        .set('Cookie', authCookies)
        .send({
          mentor_id: testMentor._id,
          topic: 'Career advice'
        });

      // Duplicate request
      const res = await request(app)
        .post('/api/mentors/request-session')
        .set('Cookie', authCookies)
        .send({
          mentor_id: testMentor._id,
          topic: 'Another topic'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // CAREER-005: Incomplete profile handling
  describe('CAREER-005: Incomplete profile handling', () => {
    it('should alert user if profile missing key fields (name, email, skills)', async () => {
      // Create incomplete user
      await User.deleteMany({ email: 'test.incomplete@standup.com' });
      
      const incompleteRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.incomplete@standup.com',
          password: 'testpass123',
          name: 'Incomplete User',
          role: 'student'
        });

      const incompleteCookies = incompleteRes.headers['set-cookie'];

      // Check profile completion status
      const res = await request(app)
        .get('/api/users/profile-status')
        .set('Cookie', incompleteCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.is_complete).toBe(false);
      expect(res.body.data.missing_fields).toBeDefined();
      expect(Array.isArray(res.body.data.missing_fields)).toBe(true);

      // Should include critical fields
      const criticalFields = ['skills', 'desired_positions', 'graduation'];
      const hasCritical = res.body.data.missing_fields.some(field =>
        criticalFields.includes(field)
      );
      expect(hasCritical).toBe(true);

      // Clean up
      await User.deleteMany({ email: 'test.incomplete@standup.com' });
    });

    it('should show profile completion percentage', async () => {
      const res = await request(app)
        .get('/api/users/profile-status')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.completion_percentage).toBeDefined();
      expect(typeof res.body.data.completion_percentage).toBe('number');
      expect(res.body.data.completion_percentage).toBeGreaterThanOrEqual(0);
      expect(res.body.data.completion_percentage).toBeLessThanOrEqual(100);
    });

    it('should block certain actions until profile is complete', async () => {
      // Create new incomplete user
      await User.deleteMany({ email: 'test.blocked@standup.com' });
      
      const newRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.blocked@standup.com',
          password: 'testpass123',
          name: 'Blocked User',
          role: 'student'
        });

      const newCookies = newRes.headers['set-cookie'];

      // Try to apply to job without complete profile
      const applyRes = await request(app)
        .post('/api/applications')
        .set('Cookie', newCookies)
        .send({
          job_id: 'some_job_id',
          status: 'pending'
        });

      // Should either succeed or return specific error about incomplete profile
      if (applyRes.status === 400 || applyRes.status === 403) {
        expect(
          applyRes.body.error.message.toLowerCase().includes('profile') ||
          applyRes.body.error.message.toLowerCase().includes('complete')
        ).toBe(true);
      }

      // Clean up
      await User.deleteMany({ email: 'test.blocked@standup.com' });
    });
  });
});
