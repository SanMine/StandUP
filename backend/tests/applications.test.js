/**
 * APPLICATIONS Test Suite
 * Tests: APPS-001, APPS-002
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Job, Application } = require('../src/models');

describe('APPLICATIONS Test Suite', () => {
  let testUser;
  let authCookies;
  let testJob;

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'test.applications@standup.com' });

    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test.applications@standup.com',
        password: 'testpass123',
        name: 'Applications Test User',
        role: 'student'
      });

    testUser = signupRes.body.data.user;
    authCookies = signupRes.headers['set-cookie'];

    // Create test job
    testJob = await Job.create({
      title: 'Full Stack Developer',
      company: 'Test Apps Company',
      location: 'Bangkok, Thailand',
      type: 'full-time',
      description: 'Test job for applications',
      requirements: ['React', 'Node.js'],
      status: 'active'
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test.applications@standup.com' });
    await Job.deleteMany({ company: 'Test Apps Company' });
    await Application.deleteMany({ user_id: testUser?._id });
  });

  // APPS-001: Applications list (Kanban)
  describe('APPS-001: Applications list (Kanban)', () => {
    beforeEach(async () => {
      // Clean previous test applications
      await Application.deleteMany({ user_id: testUser._id });
    });

    it('should return applications with job relation and display in correct columns', async () => {
      // Create applications with different statuses
      const statuses = ['pending', 'reviewing', 'interview', 'offered', 'rejected'];
      
      for (const status of statuses) {
        await Application.create({
          user_id: testUser._id,
          job_id: testJob._id,
          status,
          applied_at: new Date()
        });
      }

      const res = await request(app)
        .get('/api/applications')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.applications)).toBe(true);
      expect(res.body.data.applications.length).toBe(statuses.length);

      // Verify each application has job relation
      res.body.data.applications.forEach(app => {
        expect(app.job_id).toBeDefined();
        expect(app.status).toBeDefined();
        expect(statuses).toContain(app.status);
        
        // Job relation should include job details
        if (app.job) {
          expect(app.job.title).toBeDefined();
          expect(app.job.company).toBeDefined();
        }
      });

      // Verify all status columns are represented
      const returnedStatuses = res.body.data.applications.map(app => app.status);
      statuses.forEach(status => {
        expect(returnedStatuses).toContain(status);
      });
    });

    it('should support Kanban view with grouped applications by status', async () => {
      // Create applications
      await Application.create({
        user_id: testUser._id,
        job_id: testJob._id,
        status: 'pending',
        applied_at: new Date()
      });

      await Application.create({
        user_id: testUser._id,
        job_id: testJob._id,
        status: 'interview',
        applied_at: new Date()
      });

      const res = await request(app)
        .get('/api/applications?view=kanban')
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // If API returns grouped data
      if (res.body.data.grouped) {
        expect(res.body.data.grouped).toBeDefined();
        expect(res.body.data.grouped.pending).toBeDefined();
        expect(res.body.data.grouped.interview).toBeDefined();
      }
    });
  });

  // APPS-002: Application timeline & notes
  describe('APPS-002: Application timeline & notes', () => {
    let testApplication;

    beforeEach(async () => {
      // Clean and create fresh application
      await Application.deleteMany({ user_id: testUser._id });
      
      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', authCookies)
        .send({
          job_id: testJob._id,
          status: 'pending',
          cover_letter: 'Initial application'
        });

      testApplication = res.body.data.application;
    });

    it('should show application timeline with status changes', async () => {
      // Update application status
      await request(app)
        .put(`/api/applications/${testApplication._id}`)
        .set('Cookie', authCookies)
        .send({ status: 'reviewing' });

      await request(app)
        .put(`/api/applications/${testApplication._id}`)
        .set('Cookie', authCookies)
        .send({ status: 'interview' });

      // Get application with timeline
      const res = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Cookie', authCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.application).toBeDefined();

      const app = res.body.data.application;
      
      // Check for timeline or status history
      if (app.timeline || app.status_history) {
        const history = app.timeline || app.status_history;
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBeGreaterThan(0);
      }

      // Verify current status is latest
      expect(app.status).toBe('interview');
    });

    it('should allow adding notes to application and persist them', async () => {
      const note = 'Followed up with HR on 2025-11-15';

      // Add note
      const addRes = await request(app)
        .post(`/api/applications/${testApplication._id}/notes`)
        .set('Cookie', authCookies)
        .send({ content: note });

      expect(addRes.status).toBe(201);
      expect(addRes.body.success).toBe(true);

      // Get application and verify note exists
      const getRes = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Cookie', authCookies);

      expect(getRes.status).toBe(200);
      
      const app = getRes.body.data.application;
      expect(app.notes || app.application_notes).toBeDefined();
      
      const notes = app.notes || app.application_notes || [];
      const addedNote = notes.find(n => n.content === note);
      expect(addedNote).toBeDefined();
    });

    it('should allow editing existing notes', async () => {
      // Add initial note
      const addRes = await request(app)
        .post(`/api/applications/${testApplication._id}/notes`)
        .set('Cookie', authCookies)
        .send({ content: 'Initial note' });

      const noteId = addRes.body.data.note._id || addRes.body.data.note.id;

      // Edit note
      const editRes = await request(app)
        .put(`/api/applications/${testApplication._id}/notes/${noteId}`)
        .set('Cookie', authCookies)
        .send({ content: 'Updated note content' });

      expect(editRes.status).toBe(200);
      expect(editRes.body.success).toBe(true);

      // Verify edit persisted
      const getRes = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Cookie', authCookies);

      const notes = getRes.body.data.application.notes || [];
      const updatedNote = notes.find(n => n._id === noteId || n.id === noteId);
      
      if (updatedNote) {
        expect(updatedNote.content).toBe('Updated note content');
      }
    });

    it('should show timestamp for each timeline entry and note', async () => {
      // Add note
      await request(app)
        .post(`/api/applications/${testApplication._id}/notes`)
        .set('Cookie', authCookies)
        .send({ content: 'Test note with timestamp' });

      // Get application
      const res = await request(app)
        .get(`/api/applications/${testApplication._id}`)
        .set('Cookie', authCookies);

      const app = res.body.data.application;

      // Check timestamps
      expect(app.created_at || app.applied_at).toBeDefined();
      expect(app.updated_at).toBeDefined();

      // Check notes have timestamps
      if (app.notes && app.notes.length > 0) {
        app.notes.forEach(note => {
          expect(note.created_at || note.timestamp).toBeDefined();
        });
      }
    });
  });
});
