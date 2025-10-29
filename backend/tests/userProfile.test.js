const request = require('supertest');
const express = require('express');

// Mock models
jest.mock('../src/models', () => ({
  User: {
    findByPk: jest.fn()
  },
  UserSkill: {}
}));

const { User } = require('../src/models');
const userRoutes = require('../src/routes/userRoutes');

describe('GET /api/users/profile (supertest with fake session)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Fake session middleware: attach session object to req
    app.use((req, res, next) => {
      req.session = { userId: 123, userRole: 'student' };
      next();
    });

    // Mount the user routes under /api/users
    app.use('/api/users', userRoutes);

    // Simple error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns 200 and profile when User.findByPk returns user', async () => {
    const fakeUser = {
      id: 123,
      name: 'Test User',
      email: 'test@example.com',
      toSafeObject: function() { return { id: this.id, name: this.name, email: this.email }; },
      skills: [],
      projects: [],
      roadmap: []
    };

    User.findByPk.mockResolvedValue(fakeUser);

    const res = await request(app).get('/api/users/profile');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile).toHaveProperty('email', 'test@example.com');
  });

  test('returns 404 when user is not found', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/users/profile');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });
});
