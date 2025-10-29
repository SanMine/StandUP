const request = require('supertest');
const express = require('express');

// We'll mount authRoutes with mocked models
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

const { User } = require('../src/models');
const authRoutes = require('../src/routes/authRoutes');

describe('POST /api/auth/signup - duplicate email error', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Simple error handler to return errors as JSON for assertions
    app.use('/api/auth', authRoutes);
    app.use((err, req, res, next) => {
      // mimic real error handler
      res.status(500).json({ success: false, message: err.message || 'Server Error' });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns 500 when User.create throws unique constraint error', async () => {
    // Simulate race: findOne returns null, but create throws unique constraint error
    User.findOne.mockResolvedValue(null);
    const uniqueErr = new Error('Unique constraint error');
    uniqueErr.name = 'SequelizeUniqueConstraintError';
    User.create.mockRejectedValue(uniqueErr);

    const payload = { email: 'exists@example.com', password: 'P@ssw0rd', name: 'Existing' };

    const res = await request(app).post('/api/auth/signup').send(payload);

    // Our controller calls next(error) so we expect our error handler to return 500
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/Unique constraint|Unique constraint error/);
  });

  test('returns 400 when user already exists (findOne found)', async () => {
    User.findOne.mockResolvedValue({ id: 1, email: 'exists@example.com' });

    const payload = { email: 'exists@example.com', password: 'P@ssw0rd', name: 'Existing' };
    const res = await request(app).post('/api/auth/signup').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('USER_EXISTS');
  });
});
