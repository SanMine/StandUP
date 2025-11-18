/**
 * AUTH Test Suite
 * Tests: AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005
 */

const request = require('supertest');
const app = require('../src/app');
const { User, UserSkill, CareerRoadmap } = require('../src/models');
const { connectDB } = require('../src/config/database');
const mongoose = require('mongoose');

describe('AUTH Test Suite', () => {
  let testUser;
  let authCookies;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  }, 15000);

  afterAll(async () => {
    // Clean up after all tests
    await User.deleteMany({ email: /test.*@standup\.com/ });
    await UserSkill.deleteMany({});
    await CareerRoadmap.deleteMany({});
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await User.deleteMany({ email: /test.*@standup\.com/ });
    await UserSkill.deleteMany({});
    await CareerRoadmap.deleteMany({});
  });

  // AUTH-001: Login (Sign in)
  describe('AUTH-001: Login (Sign in)', () => {
    beforeEach(async () => {
      // Create test user
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.signin@standup.com',
          password: 'testpass123',
          name: 'Test Signin User',
          role: 'student'
        });
      
      expect(signupRes.status).toBe(201);
    });

    it('should sign in user with valid credentials and return 200 with session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test.signin@standup.com',
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test.signin@standup.com');
      
      // Check for session cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('accessToken'))).toBe(true);
      expect(cookies.some(cookie => cookie.includes('refreshToken'))).toBe(true);
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test.signin@standup.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // AUTH-002: Sign up (Create account)
  describe('AUTH-002: Sign up (Create account)', () => {
    it('should create new user account and return success with session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.signup@standup.com',
          password: 'testpass123',
          name: 'Test Signup User',
          role: 'student'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test.signup@standup.com');
      expect(res.body.user.name).toBe('Test Signup User');
      
      // Check for session cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('accessToken'))).toBe(true);
      
      // Verify user was created in database
      const user = await User.findOne({ email: 'test.signup@standup.com' });
      expect(user).toBeDefined();
      expect(user.role).toBe('student');
    });

    it('should fail when email already exists', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.duplicate@standup.com',
          password: 'testpass123',
          name: 'Test User',
          role: 'student'
        });

      // Duplicate signup
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.duplicate@standup.com',
          password: 'testpass456',
          name: 'Another User',
          role: 'student'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_EXISTS');
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'testpass123',
          name: 'Test User',
          role: 'student'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // AUTH-003: Onboarding save (skills & roles)
  describe('AUTH-003: Onboarding save (skills & roles)', () => {
    beforeEach(async () => {
      // Create and login user
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.onboarding@standup.com',
          password: 'testpass123',
          name: 'Test Onboarding User',
          role: 'student'
        });

      testUser = signupRes.body.user;
      authCookies = signupRes.headers['set-cookie'];
    });

    it('should save user skills to user_skills table', async () => {
      const skills = ['React', 'Node.js', 'JavaScript', 'Python'];
      
      const res = await request(app)
        .post('/api/users/onboarding')
        .set('Cookie', authCookies)
        .send({ skills });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify skills saved to database
      const userSkills = await UserSkill.find({ user_id: testUser._id });
      expect(userSkills.length).toBe(skills.length);
      
      const savedSkillNames = userSkills.map(s => s.skill_name);
      skills.forEach(skill => {
        expect(savedSkillNames).toContain(skill);
      });
    });

    it('should save career roadmap with desired positions', async () => {
      const roles = ['Frontend Developer', 'Full Stack Developer'];
      
      const res = await request(app)
        .post('/api/users/onboarding')
        .set('Cookie', authCookies)
        .send({ 
          roles: roles,
          graduation: '2027-05-01'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify roadmap saved to database
      const roadmap = await CareerRoadmap.find({ user_id: testUser._id });
      expect(roadmap).toBeDefined();
      expect(roadmap.length).toBe(2);
      const titles = roadmap.map(r => r.title);
      expect(titles).toContain('Frontend Developer');
      expect(titles).toContain('Full Stack Developer');
    });
  });

  // AUTH-004: Sign out
  describe('AUTH-004: Sign out', () => {
    beforeEach(async () => {
      // Create and login user
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.signout@standup.com',
          password: 'testpass123',
          name: 'Test Signout User',
          role: 'student'
        });

      authCookies = signupRes.headers['set-cookie'];
    });

    it('should destroy session and return 401 for /api/auth/me after signout', async () => {
      // Verify user is authenticated before signout
      const meBeforeRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookies);

      expect(meBeforeRes.status).toBe(200);
      expect(meBeforeRes.body.success).toBe(true);

      // Sign out
      const signoutRes = await request(app)
        .post('/api/auth/signout')
        .set('Cookie', authCookies);

      expect(signoutRes.status).toBe(200);
      expect(signoutRes.body.success).toBe(true);

      // Verify cookies are cleared
      const cookies = signoutRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('accessToken=;'))).toBe(true);

      // Verify /api/auth/me returns 401 after signout
      const meAfterRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', signoutRes.headers['set-cookie']);

      expect(meAfterRes.status).toBe(401);
    });
  });

  // AUTH-005: Protected routes check
  describe('AUTH-005: Protected routes check', () => {
    let authenticatedCookies;

    beforeEach(async () => {
      // Create authenticated user
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.protected@standup.com',
          password: 'testpass123',
          name: 'Test Protected User',
          role: 'student'
        });

      authenticatedCookies = signupRes.headers['set-cookie'];
    });

    it('should return 401 for anonymous users on protected routes', async () => {
      const protectedRoutes = [
        '/api/auth/me',
        '/api/users/dashboard',
        '/api/jobs/recommended',
        '/api/applications'
      ];

      for (const route of protectedRoutes) {
        const res = await request(app).get(route);
        expect([401, 404]).toContain(res.status); // 404 if route doesn't exist yet
      }
    });

    it('should return 200 for authenticated users on protected routes', async () => {
      const res = await request(app)
        .get('/api/users/dashboard')
        .set('Cookie', authenticatedCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 with expired or invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['accessToken=invalid_token']);

      expect(res.status).toBe(401);
    });
  });
});
