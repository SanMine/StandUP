/**
 * LEARNING Test Suite
 * Tests: LEARN-001
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Course, Enrollment } = require('../src/models');

describe('LEARNING Test Suite', () => {
  let testUser;
  let authCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'test.learning@standup.com' });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.learning@standup.com',
        password: 'testpass123',
        name: 'Learning Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test.learning@standup.com' });
  });

  // LEARN-001: Coursera integration
  describe('LEARN-001: Coursera integration', () => {
    it('should fetch Coursera courses via proxy and return valid course list', async () => {
      const res = await request(app)
        .get('/api/learning/courses/coursera')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.courses)).toBe(true);

      // Verify course structure
      if (res.body.data.courses.length > 0) {
        const course = res.body.data.courses[0];
        
        expect(course.id || course._id).toBeDefined();
        expect(course.title || course.name).toBeDefined();
        expect(course.provider || course.platform).toBe('Coursera');
        
        // Should have course details
        expect(
          course.description || 
          course.url || 
          course.duration
        ).toBeDefined();
      }
    });

    it('should search Coursera courses by keyword (e.g., "JavaScript")', async () => {
      const res = await request(app)
        .get('/api/learning/courses/coursera?search=JavaScript')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.courses)).toBe(true);

      // Courses should be relevant to JavaScript
      if (res.body.data.courses.length > 0) {
        const firstCourse = res.body.data.courses[0];
        const titleAndDesc = (
          (firstCourse.title || '') + 
          (firstCourse.description || '')
        ).toLowerCase();
        
        expect(
          titleAndDesc.includes('javascript') ||
          titleAndDesc.includes('js') ||
          titleAndDesc.includes('programming')
        ).toBe(true);
      }
    });

    it('should allow user to enroll in a course', async () => {
      // Get available courses
      const coursesRes = await request(app)
        .get('/api/learning/courses/coursera')
        .set('Cookie', authCookies);

      if (coursesRes.body.data.courses.length > 0) {
        const courseId = coursesRes.body.data.courses[0].id || coursesRes.body.data.courses[0]._id;

        // Enroll in course
        const enrollRes = await request(app)
          .post('/api/learning/enroll')
          .set('Cookie', authCookies)
          .send({
            course_id: courseId,
            platform: 'Coursera'
          });

        expect(enrollRes.status).toBe(201);
        expect(enrollRes.body.success).toBe(true);
        expect(enrollRes.body.data.enrollment).toBeDefined();
      }
    });

    it('should track enrolled courses for user', async () => {
      const res = await request(app)
        .get('/api/learning/my-courses')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.courses)).toBe(true);
    });

    it('should prevent duplicate enrollments', async () => {
      // Get a course
      const coursesRes = await request(app)
        .get('/api/learning/courses/coursera')
        .set('Cookie', authCookies);

      if (coursesRes.body.data.courses.length > 0) {
        const courseId = coursesRes.body.data.courses[0].id || coursesRes.body.data.courses[0]._id;

        // Enroll twice
        await request(app)
          .post('/api/learning/enroll')
          .set('Cookie', authCookies)
          .send({
            course_id: courseId,
            platform: 'Coursera'
          });

        const duplicateRes = await request(app)
          .post('/api/learning/enroll')
          .set('Cookie', authCookies)
          .send({
            course_id: courseId,
            platform: 'Coursera'
          });

        expect(duplicateRes.status).toBe(400);
        expect(duplicateRes.body.success).toBe(false);
      }
    });

    it('should handle Coursera API errors gracefully', async () => {
      // Test with invalid search that might cause error
      const res = await request(app)
        .get('/api/learning/courses/coursera?search=' + 'x'.repeat(1000))
        .set('Cookie', authCookies);

      // Should either return empty array or proper error
      expect([200, 400, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(Array.isArray(res.body.data.courses)).toBe(true);
      } else {
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBeDefined();
      }
    });

    it('should require authentication for course access', async () => {
      const res = await request(app)
        .get('/api/learning/courses/coursera');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
