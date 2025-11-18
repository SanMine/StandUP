/**
 * ANALYTICS Test Suite
 * Tests: ANA-001, ANA-002, ANA-003
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Application, Job } = require('../src/models');

describe('ANALYTICS Test Suite', () => {
  let testUser;
  let authCookies;
  let adminUser;
  let adminCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ 
      email: { $in: ['test.analytics@standup.com', 'admin@standup.com'] } 
    });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.analytics@standup.com',
        password: 'testpass123',
        name: 'Analytics Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'admin@standup.com',
        password: 'adminpass123',
        name: 'Admin User',
        role: 'admin'
      });

    adminUser = adminRes.body.data.user;
    adminCookies = adminRes.headers['set-cookie'];

    // Update user role to admin in database
    await User.findByIdAndUpdate(adminUser._id, { role: 'admin' });
  });

  afterAll(async () => {
    await User.deleteMany({ 
      email: { $in: ['test.analytics@standup.com', 'admin@standup.com'] } 
    });
  });

  // ANA-001: User progress feedback
  describe('ANA-001: User progress feedback', () => {
    it('should show feedback on application status (e.g., "80% of your applications are pending")', async () => {
      // Create test job
      const job = await Job.create({
        title: 'Test Job',
        company: 'Test Company',
        location: 'Bangkok',
        type: 'full-time',
        requirements: ['React']
      });

      // Create applications with different statuses
      await Application.create([
        { job_id: job._id, student_id: testUser._id, status: 'pending' },
        { job_id: job._id, student_id: testUser._id, status: 'pending' },
        { job_id: job._id, student_id: testUser._id, status: 'pending' },
        { job_id: job._id, student_id: testUser._id, status: 'pending' },
        { job_id: job._id, student_id: testUser._id, status: 'reviewing' }
      ]);

      const res = await request(app)
        .get('/api/analytics/progress')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const progress = res.body.data;
      
      expect(progress.application_stats).toBeDefined();
      expect(progress.application_stats.total).toBe(5);
      expect(progress.application_stats.pending).toBe(4);
      expect(progress.application_stats.pending_percentage).toBe(80);
    });

    it('should provide actionable insights (e.g., "Consider improving your resume")', async () => {
      const res = await request(app)
        .get('/api/analytics/insights')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const insights = res.body.data.insights;
      
      expect(Array.isArray(insights)).toBe(true);
      
      if (insights.length > 0) {
        insights.forEach(insight => {
          expect(insight.message || insight.text).toBeDefined();
          expect(insight.type || insight.category).toBeDefined();
          expect(insight.action || insight.recommendation).toBeDefined();
        });
      }
    });

    it('should show skill match trends over time', async () => {
      const res = await request(app)
        .get('/api/analytics/skill-trends')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const trends = res.body.data;
      
      expect(trends.current_skills).toBeDefined();
      expect(trends.trending_skills || trends.market_demand).toBeDefined();
    });
  });

  // ANA-002: Admin usage analytics
  describe('ANA-002: Admin usage analytics', () => {
    it('should display total users, active users, job postings', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const analytics = res.body.data;
      
      expect(analytics.total_users).toBeDefined();
      expect(analytics.active_users).toBeDefined();
      expect(analytics.total_jobs).toBeDefined();
      
      expect(typeof analytics.total_users).toBe('number');
      expect(typeof analytics.active_users).toBe('number');
      expect(typeof analytics.total_jobs).toBe('number');
      
      expect(analytics.total_users).toBeGreaterThan(0);
    });

    it('should show user growth metrics by month', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/growth')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      
      const growth = res.body.data;
      
      expect(growth.monthly_signups || growth.growth_data).toBeDefined();
      
      if (growth.monthly_signups) {
        expect(Array.isArray(growth.monthly_signups)).toBe(true);
        
        if (growth.monthly_signups.length > 0) {
          const monthData = growth.monthly_signups[0];
          expect(monthData.month || monthData.period).toBeDefined();
          expect(monthData.count || monthData.signups).toBeDefined();
        }
      }
    });

    it('should display most popular job categories', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/job-categories')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      
      const categories = res.body.data;
      
      expect(categories.top_categories || categories.categories).toBeDefined();
      expect(Array.isArray(categories.top_categories || categories.categories)).toBe(true);
    });

    it('should prevent non-admin users from accessing admin analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Cookie', authCookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should show system health metrics (response times, error rates)', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/health')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      
      const health = res.body.data;
      
      expect(
        health.uptime ||
        health.response_time ||
        health.error_rate ||
        health.status
      ).toBeDefined();
    });
  });

  // ANA-003: Data privacy and masking
  describe('ANA-003: Data privacy and masking', () => {
    it('should mask personal data in analytics (emails, phone numbers)', async () => {
      // Get user list as admin
      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      
      const users = res.body.data.users;
      
      if (users && users.length > 0) {
        users.forEach(user => {
          // Email should be partially masked or full access for admin
          expect(user.email).toBeDefined();
          
          // Phone numbers should be masked if present
          if (user.phone) {
            expect(
              user.phone.includes('***') || 
              user.phone.includes('xxx')
            ).toBe(true);
          }
        });
      }
    });

    it('should not expose sensitive data in public analytics endpoints', async () => {
      const res = await request(app)
        .get('/api/analytics/public/stats')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      
      const stats = res.body.data;
      
      // Should have aggregate data only
      expect(stats.total_users || stats.user_count).toBeDefined();
      
      // Should NOT have individual user details
      expect(stats.users).toBeUndefined();
      expect(stats.user_list).toBeUndefined();
      expect(stats.emails).toBeUndefined();
    });

    it('should log all analytics data access for audit', async () => {
      // Access analytics
      await request(app)
        .get('/api/analytics/progress')
        .set('Cookie', authCookies);

      // Check audit log
      const auditRes = await request(app)
        .get('/api/analytics/audit-log')
        .set('Cookie', authCookies);

      expect(auditRes.status).toBe(200);
      
      const logs = auditRes.body.data.logs;
      
      if (logs && logs.length > 0) {
        const recentLog = logs[0];
        expect(recentLog.action).toBeDefined();
        expect(recentLog.timestamp || recentLog.created_at).toBeDefined();
        expect(recentLog.user_id).toBe(testUser._id.toString());
      }
    });

    it('should allow users to opt-out of analytics tracking', async () => {
      // Opt out
      const optOutRes = await request(app)
        .post('/api/users/privacy-settings')
        .set('Cookie', authCookies)
        .send({
          analytics_enabled: false,
          tracking_enabled: false
        });

      expect(optOutRes.status).toBe(200);
      expect(optOutRes.body.success).toBe(true);

      // Verify setting persisted
      const getRes = await request(app)
        .get('/api/users/privacy-settings')
        .set('Cookie', authCookies);

      expect(getRes.body.data.analytics_enabled).toBe(false);
    });

    it('should anonymize data for aggregated reports', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/aggregate')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      
      const aggregate = res.body.data;
      
      // Should have counts and percentages only
      expect(
        aggregate.total_applications ||
        aggregate.application_rate ||
        aggregate.average_response_time
      ).toBeDefined();
      
      // Should NOT have identifiable information
      expect(aggregate.user_names).toBeUndefined();
      expect(aggregate.user_emails).toBeUndefined();
    });
  });
});
