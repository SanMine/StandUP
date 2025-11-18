/**
 * DASHBOARD Test Suite
 * Tests: DASH-001
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job, Application } = require('../src/models');

describe('DASH-001: Dashboard loads live data', () => {
  let testUser;
  let authCookies;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'test.dashboard@standup.com' });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.dashboard@standup.com',
        password: 'testpass123',
        name: 'Dashboard Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test.dashboard@standup.com' });
  });

  it('should request /api/users/dashboard and return real KPIs and lists (no mock data)', async () => {
    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Cookie', authCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    // Verify dashboard has expected structure
    const dashboard = res.body.data;
    
    // KPIs should be numbers
    expect(typeof dashboard.applications_count).toBe('number');
    expect(typeof dashboard.profile_strength).toBe('number');
    
    // Lists should be arrays (even if empty)
    expect(Array.isArray(dashboard.recommended_jobs || [])).toBe(true);
    expect(Array.isArray(dashboard.recent_applications || [])).toBe(true);
    expect(Array.isArray(dashboard.upcoming_events || [])).toBe(true);
    
    // Should not contain mock data indicators
    expect(JSON.stringify(dashboard)).not.toContain('mock');
    expect(JSON.stringify(dashboard)).not.toContain('dummy');
  });

  it('should show updated KPIs after user creates application', async () => {
    // Get initial dashboard
    const beforeRes = await request(app)
      .get('/api/users/dashboard')
      .set('Cookie', authCookies);

    const initialCount = beforeRes.body.data.applications_count || 0;

    // Find or create a test job
    let testJob = await Job.findOne({});
    if (!testJob) {
      testJob = await Job.create({
        title: 'Test Software Engineer',
        company: 'Test Company',
        location: 'Bangkok, Thailand',
        type: 'full-time',
        description: 'Test job for dashboard test',
        requirements: ['React', 'Node.js'],
        status: 'active'
      });
    }

    // Create application
    await request(app)
      .post('/api/applications')
      .set('Cookie', authCookies)
      .send({
        job_id: testJob._id,
        status: 'pending'
      });

    // Get updated dashboard
    const afterRes = await request(app)
      .get('/api/users/dashboard')
      .set('Cookie', authCookies);

    expect(afterRes.status).toBe(200);
    expect(afterRes.body.data.applications_count).toBe(initialCount + 1);
  });

  it('should update profile_strength when user completes profile', async () => {
    // Update user profile
    await request(app)
      .put('/api/users/profile')
      .set('Cookie', authCookies)
      .send({
        bio: 'I am a software developer',
        graduation: '2027-05-01',
        desired_positions: ['Software Engineer']
      });

    // Get dashboard
    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Cookie', authCookies);

    expect(res.status).toBe(200);
    expect(res.body.data.profile_strength).toBeGreaterThan(0);
    expect(res.body.data.profile_strength).toBeLessThanOrEqual(100);
  });
});
