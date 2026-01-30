/**
 * auth.test.js - Authentication endpoint tests
 * Tests for register, login, and profile endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');

// Test database URI
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/healthcare_test';

describe('Auth Endpoints', () => {
    // Setup: Connect to test database before all tests
    beforeAll(async () => {
        // Close any existing connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(TEST_MONGODB_URI);
    });

    // Cleanup: Clear users before each test
    beforeEach(async () => {
        await User.deleteMany({});
    });

    // Teardown: Disconnect after all tests
    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    // ==================
    // Register Tests
    // ==================

    describe('POST /api/auth/register', () => {
        const validUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test123!pass'
        };

        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(validUser.email);
            expect(res.body.data.user.name).toBe(validUser.name);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
            // Password should not be in response
            expect(res.body.data.user.passwordHash).toBeUndefined();
        });

        it('should reject duplicate email', async () => {
            // First registration
            await request(app).post('/api/auth/register').send(validUser);

            // Duplicate registration
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('already');
        });

        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, email: 'invalid-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, password: 'short' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject missing name', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: validUser.email, password: validUser.password });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should set default role as user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.body.data.user.role).toBe('user');
        });

        it('should not allow setting admin role via register', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, role: 'admin' });

            expect(res.body.data.user.role).toBe('user');
        });
    });

    // ==================
    // Login Tests
    // ==================

    describe('POST /api/auth/login', () => {
        const user = {
            name: 'Test User',
            email: 'login@example.com',
            password: 'Test123!pass'
        };

        beforeEach(async () => {
            // Register user before login tests
            await request(app).post('/api/auth/register').send(user);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: user.email, password: user.password });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.user.email).toBe(user.email);
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: user.email, password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should reject non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@example.com', password: user.password });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should update lastLoginAt on successful login', async () => {
            await request(app)
                .post('/api/auth/login')
                .send({ email: user.email, password: user.password });

            const dbUser = await User.findOne({ email: user.email });
            expect(dbUser.lastLoginAt).toBeDefined();
        });
    });

    // ==================
    // Profile Tests
    // ==================

    describe('GET /api/auth/me', () => {
        let authToken;
        const user = {
            name: 'Profile User',
            email: 'profile@example.com',
            password: 'Test123!pass'
        };

        beforeEach(async () => {
            const res = await request(app).post('/api/auth/register').send(user);
            authToken = res.body.data.accessToken;
        });

        it('should return user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(user.email);
        });

        it('should reject request without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should reject invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ==================
    // Preferences Tests
    // ==================

    describe('PUT /api/auth/preferences', () => {
        let authToken;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Pref User',
                    email: 'pref@example.com',
                    password: 'Test123!pass'
                });
            authToken = res.body.data.accessToken;
        });

        it('should update user preferences', async () => {
            const newPrefs = {
                preferences: {
                    topics: ['health', 'nutrition'],
                    languages: ['en', 'hi'],
                    voiceEnabled: true
                }
            };

            const res = await request(app)
                .put('/api/auth/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPrefs);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.preferences.topics).toContain('health');
            expect(res.body.data.preferences.voiceEnabled).toBe(true);
        });
    });
});
