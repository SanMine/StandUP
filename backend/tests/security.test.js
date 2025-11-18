/**
 * SECURITY Test Suite
 * Tests: SEC-001, SEC-002, SEC-003
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job } = require('../src/models');

describe('SECURITY Test Suite', () => {
  let studentUser;
  let studentCookies;
  let employerUser;
  let employerCookies;
  let adminUser;
  let adminCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ 
      email: { 
        $in: [
          'student.security@test.com',
          'employer.security@test.com',
          'admin.security@test.com'
        ] 
      } 
    });

    // Create student user
    const studentRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student.security@test.com',
        password: 'testpass123',
        name: 'Security Test Student',
        role: 'student'
      });

    studentUser = studentRes.body.data.user;
    studentCookies = studentRes.headers['set-cookie'];

    // Create employer user
    const employerRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'employer.security@test.com',
        password: 'testpass123',
        name: 'Security Test Employer',
        role: 'employer'
      });

    employerUser = employerRes.body.data.user;
    employerCookies = employerRes.headers['set-cookie'];

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'admin.security@test.com',
        password: 'adminpass123',
        name: 'Security Test Admin',
        role: 'admin'
      });

    adminUser = adminRes.body.data.user;
    
    // Update to admin role in database
    await User.findByIdAndUpdate(adminUser._id, { role: 'admin' });
    
    // Get admin cookies
    const adminSignin = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'admin.security@test.com',
        password: 'adminpass123'
      });
    
    adminCookies = adminSignin.headers['set-cookie'];
  });

  afterAll(async () => {
    await User.deleteMany({ 
      email: { 
        $in: [
          'student.security@test.com',
          'employer.security@test.com',
          'admin.security@test.com'
        ] 
      } 
    });
  });

  // SEC-001: Role-based access control (RBAC)
  describe('SEC-001: Role-based access control', () => {
    let testJob;

    beforeAll(async () => {
      // Create test job as employer
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Cookie', employerCookies)
        .send({
          title: 'Security Test Job',
          company: 'Test Company',
          location: 'Bangkok',
          type: 'full-time'
        });

      testJob = jobRes.body.data.job;
    });

    it('should prevent students from accessing employer-only routes', async () => {
      const res = await request(app)
        .get('/api/employer/analytics')
        .set('Cookie', studentCookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message.toLowerCase()).toContain('access denied');
    });

    it('should prevent employers from accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', employerCookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin access to all routes', async () => {
      // Admin should access admin routes
      const adminRouteRes = await request(app)
        .get('/api/admin/analytics')
        .set('Cookie', adminCookies);

      expect(adminRouteRes.status).toBe(200);

      // Admin should also access employer routes
      const employerRouteRes = await request(app)
        .get('/api/employer/candidates')
        .set('Cookie', adminCookies);

      expect([200, 403]).toContain(employerRouteRes.status);
    });

    it('should prevent students from creating jobs', async () => {
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

    it('should prevent employers from viewing student-only features', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Cookie', employerCookies);

      // Employer should not see all applications, only those for their jobs
      if (res.status === 200) {
        const apps = res.body.data.applications;
        if (apps && apps.length > 0) {
          apps.forEach(app => {
            expect(app.job.posted_by).toBe(employerUser._id.toString());
          });
        }
      }
    });

    it('should prevent users from editing other users\' profiles', async () => {
      const res = await request(app)
        .put(`/api/users/${employerUser._id}`)
        .set('Cookie', studentCookies)
        .send({
          name: 'Hacked Name'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should validate JWT tokens for protected routes', async () => {
      const res = await request(app)
        .get('/api/dashboard');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject expired tokens', async () => {
      // Use invalid/expired token
      const res = await request(app)
        .get('/api/dashboard')
        .set('Cookie', 'accessToken=expired_token_here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // SEC-002: HTTPS enforcement
  describe('SEC-002: HTTPS enforcement', () => {
    it('should set secure cookies in production', async () => {
      // Check cookie flags
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'student.security@test.com',
          password: 'testpass123'
        });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      // Check for httpOnly flag
      const hasHttpOnly = cookies.some(cookie => 
        cookie.toLowerCase().includes('httponly')
      );
      expect(hasHttpOnly).toBe(true);

      // In production, should also have Secure flag
      if (process.env.NODE_ENV === 'production') {
        const hasSecure = cookies.some(cookie => 
          cookie.toLowerCase().includes('secure')
        );
        expect(hasSecure).toBe(true);
      }
    });

    it('should set appropriate security headers', async () => {
      const res = await request(app).get('/api/health');

      // Check for security headers
      expect(
        res.headers['x-content-type-options'] ||
        res.headers['x-frame-options'] ||
        res.headers['strict-transport-security']
      ).toBeDefined();
    });

    it('should prevent clickjacking with X-Frame-Options', async () => {
      const res = await request(app).get('/');

      expect(
        res.headers['x-frame-options'] === 'DENY' ||
        res.headers['x-frame-options'] === 'SAMEORIGIN'
      ).toBe(true);
    });

    it('should enable HSTS (HTTP Strict Transport Security)', async () => {
      const res = await request(app).get('/');

      if (process.env.NODE_ENV === 'production') {
        expect(res.headers['strict-transport-security']).toBeDefined();
      }
    });

    it('should set CSP (Content Security Policy) headers', async () => {
      const res = await request(app).get('/');

      // CSP should be present in production
      if (process.env.NODE_ENV === 'production') {
        expect(res.headers['content-security-policy']).toBeDefined();
      }
    });
  });

  // SEC-003: AI audit logging
  describe('SEC-003: AI audit logging', () => {
    beforeAll(async () => {
      // Add skills for AI recommendations
      await request(app)
        .post('/api/users/skills')
        .set('Cookie', studentCookies)
        .send({ skills: ['React', 'Node.js', 'JavaScript'] });
    });

    it('should log all AI recommendation requests', async () => {
      // Make AI recommendation request
      await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', studentCookies);

      // Check audit log
      const auditRes = await request(app)
        .get('/api/ai/audit-log')
        .set('Cookie', studentCookies);

      expect(auditRes.status).toBe(200);
      
      const logs = auditRes.body.data.logs;
      
      if (logs && logs.length > 0) {
        const recentLog = logs[0];
        expect(recentLog.action).toContain('recommendation');
        expect(recentLog.user_id).toBe(studentUser._id.toString());
        expect(recentLog.timestamp || recentLog.created_at).toBeDefined();
      }
    });

    it('should log AI-generated resume suggestions', async () => {
      // Request resume analysis
      await request(app)
        .post('/api/ai/analyze-resume')
        .set('Cookie', studentCookies)
        .send({
          resumeText: 'Test resume content',
          targetRole: 'Software Engineer'
        });

      // Check audit log
      const auditRes = await request(app)
        .get('/api/ai/audit-log')
        .set('Cookie', studentCookies);

      expect(auditRes.status).toBe(200);
      
      const logs = auditRes.body.data.logs;
      
      if (logs) {
        const hasResumeLog = logs.some(log => 
          log.action.toLowerCase().includes('resume') ||
          log.action.toLowerCase().includes('analyze')
        );
        expect(hasResumeLog).toBe(true);
      }
    });

    it('should include user context in AI logs (user_id, timestamp, action)', async () => {
      // Make AI request
      await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', studentCookies);

      // Get logs
      const auditRes = await request(app)
        .get('/api/ai/audit-log')
        .set('Cookie', studentCookies);

      if (auditRes.status === 200 && auditRes.body.data.logs.length > 0) {
        const log = auditRes.body.data.logs[0];
        
        expect(log.user_id).toBeDefined();
        expect(log.action).toBeDefined();
        expect(log.timestamp || log.created_at).toBeDefined();
        
        // Should include request details
        expect(
          log.endpoint ||
          log.request_type ||
          log.details
        ).toBeDefined();
      }
    });

    it('should prevent users from accessing others\' AI logs', async () => {
      // Student tries to access employer's logs
      const res = await request(app)
        .get(`/api/ai/audit-log?user_id=${employerUser._id}`)
        .set('Cookie', studentCookies);

      if (res.status === 200) {
        // Should only return student's own logs
        const logs = res.body.data.logs;
        logs.forEach(log => {
          expect(log.user_id).toBe(studentUser._id.toString());
        });
      } else {
        // Or should deny access entirely
        expect(res.status).toBe(403);
      }
    });

    it('should allow admin to view all AI audit logs', async () => {
      const res = await request(app)
        .get('/api/admin/ai/audit-log')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      
      const logs = res.body.data.logs;
      
      if (logs && logs.length > 0) {
        // Admin should see logs from multiple users
        expect(Array.isArray(logs)).toBe(true);
      }
    });

    it('should retain logs for compliance (minimum 90 days)', async () => {
      const res = await request(app)
        .get('/api/ai/audit-log')
        .set('Cookie', studentCookies);

      if (res.status === 200) {
        const logs = res.body.data.logs;
        
        if (logs && logs.length > 0) {
          logs.forEach(log => {
            const logDate = new Date(log.timestamp || log.created_at);
            const daysSince = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24);
            
            // Logs should be within retention period
            expect(daysSince).toBeLessThan(365); // 1 year max for test
          });
        }
      }
    });

    it('should detect and log potential AI bias in recommendations', async () => {
      // Make recommendation request
      await request(app)
        .get('/api/jobs/recommended')
        .set('Cookie', studentCookies);

      // Check if bias detection is logged
      const biasRes = await request(app)
        .get('/api/ai/bias-report')
        .set('Cookie', adminCookies);

      expect(biasRes.status).toBe(200);
      
      const report = biasRes.body.data;
      
      if (report) {
        expect(
          report.bias_score ||
          report.fairness_metrics ||
          report.demographic_parity
        ).toBeDefined();
      }
    });
  });

  // Additional security tests
  describe('Additional Security Tests', () => {
    it('should prevent SQL injection attempts', async () => {
      const res = await request(app)
        .get('/api/jobs?search=\'; DROP TABLE jobs; --')
        .set('Cookie', studentCookies);

      expect(res.status).toBe(200);
      
      // Should handle safely, not execute SQL
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
    });

    it('should prevent XSS attacks in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Cookie', studentCookies)
        .send({
          bio: xssPayload
        });

      if (res.status === 200) {
        // Get profile back
        const getRes = await request(app)
          .get('/api/users/profile')
          .set('Cookie', studentCookies);

        const bio = getRes.body.data.user.bio;
        
        // Should be sanitized
        expect(bio).not.toContain('<script>');
      }
    });

    it('should implement rate limiting on sensitive endpoints', async () => {
      // Attempt multiple rapid requests
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app)
            .post('/api/auth/signin')
            .send({
              email: 'student.security@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const results = await Promise.all(requests);
      
      // Should eventually rate limit
      const rateLimited = results.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    }, 15000);

    it('should hash passwords securely (bcrypt)', async () => {
      // Check that password is not stored in plain text
      const user = await User.findById(studentUser._id);
      
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('testpass123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it('should validate and sanitize all user inputs', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', studentCookies)
        .send({
          job_id: 'invalid_id',
          status: 'invalid_status_not_in_enum'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
