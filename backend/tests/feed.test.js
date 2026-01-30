/**
 * feed.test.js - Feed endpoint and personalization tests
 * Tests for personalized feed and scoring algorithm
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const User = require('../src/models/User');
const Content = require('../src/models/Content');
const { calculateScore, WEIGHTS } = require('../src/controllers/feed.controller');

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/healthcare_test';

describe('Feed Endpoints', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(TEST_MONGODB_URI);
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Content.deleteMany({});

        // Create test user
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Feed Test User',
                email: 'feed@example.com',
                password: 'Test123!pass'
            });
        authToken = userRes.body.data.accessToken;
        userId = userRes.body.data.user.id;

        // Create test content
        const contentItems = [
            {
                title: 'Health Article EN',
                bodyMarkdown: 'Content about health in English',
                type: 'health',
                tags: ['health', 'wellness'],
                language: 'en',
                authorId: userId,
                verified: true,
                moderationStatus: 'approved',
                metrics: { views: 100, likes: 20 }
            },
            {
                title: 'Education Article EN',
                bodyMarkdown: 'Content about education in English',
                type: 'education',
                tags: ['education', 'learning'],
                language: 'en',
                authorId: userId,
                verified: true,
                moderationStatus: 'approved',
                metrics: { views: 50, likes: 10 }
            },
            {
                title: 'स्वास्थ्य लेख',
                bodyMarkdown: 'हिंदी में स्वास्थ्य सामग्री',
                type: 'health',
                tags: ['health', 'hindi'],
                language: 'hi',
                authorId: userId,
                verified: true,
                moderationStatus: 'approved',
                metrics: { views: 30, likes: 5 }
            }
        ];

        await Content.insertMany(contentItems);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Content.deleteMany({});
        await mongoose.disconnect();
    });

    // ==================
    // Feed Endpoint Tests
    // ==================

    describe('GET /api/feed', () => {
        it('should return feed without authentication', async () => {
            const res = await request(app).get('/api/feed');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.meta.personalized).toBe(false);
        });

        it('should return personalized feed with authentication', async () => {
            // First update preferences
            await request(app)
                .put('/api/auth/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    preferences: {
                        topics: ['health'],
                        languages: ['en']
                    }
                });

            const res = await request(app)
                .get('/api/feed')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.meta.personalized).toBe(true);
            // Health content should be prioritized
            expect(res.body.data[0].type).toBe('health');
        });

        it('should respect language filter', async () => {
            await request(app)
                .put('/api/auth/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    preferences: {
                        languages: ['hi']
                    }
                });

            const res = await request(app)
                .get('/api/feed')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.every(item => item.language === 'hi')).toBe(true);
        });

        it('should paginate results', async () => {
            const res = await request(app)
                .get('/api/feed?page=1&limit=2');

            expect(res.statusCode).toBe(200);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(2);
        });
    });

    // ==================
    // Trending Endpoint Tests
    // ==================

    describe('GET /api/feed/trending', () => {
        it('should return trending content by views', async () => {
            const res = await request(app).get('/api/feed/trending');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            // Most viewed should be first
            expect(res.body.data[0].metrics.views).toBeGreaterThanOrEqual(
                res.body.data[res.body.data.length - 1].metrics.views
            );
        });

        it('should filter by language', async () => {
            const res = await request(app).get('/api/feed/trending?language=hi');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.every(item => item.language === 'hi')).toBe(true);
        });
    });

    // ==================
    // Recent Endpoint Tests
    // ==================

    describe('GET /api/feed/recent', () => {
        it('should return recent content', async () => {
            const res = await request(app).get('/api/feed/recent');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should filter by type', async () => {
            const res = await request(app).get('/api/feed/recent?type=health');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.every(item => item.type === 'health')).toBe(true);
        });
    });

    // ==================
    // Scoring Algorithm Tests
    // ==================

    describe('Personalization Scoring', () => {
        const mockContent = {
            tags: ['health', 'nutrition'],
            type: 'health',
            language: 'en',
            verified: true,
            createdAt: new Date(),
            metrics: { views: 500, likes: 50 }
        };

        const mockPreferences = {
            topics: ['health', 'nutrition'],
            languages: ['en']
        };

        it('should score topic matches correctly', () => {
            const score = calculateScore(mockContent, mockPreferences);
            // Should have topic match bonus
            expect(score).toBeGreaterThan(0);
        });

        it('should give higher score to matching content', () => {
            const matchingScore = calculateScore(mockContent, mockPreferences);
            const nonMatchingScore = calculateScore(mockContent, {
                topics: ['education'],
                languages: ['hi']
            });

            expect(matchingScore).toBeGreaterThan(nonMatchingScore);
        });

        it('should factor in language preference', () => {
            const enScore = calculateScore(mockContent, { ...mockPreferences, languages: ['en'] });
            const hiScore = calculateScore(mockContent, { ...mockPreferences, languages: ['hi'] });

            expect(enScore).toBeGreaterThan(hiScore);
        });

        it('should give bonus for verified content', () => {
            const verifiedContent = { ...mockContent, verified: true };
            const unverifiedContent = { ...mockContent, verified: false };

            const verifiedScore = calculateScore(verifiedContent, mockPreferences);
            const unverifiedScore = calculateScore(unverifiedContent, mockPreferences);

            expect(verifiedScore).toBeGreaterThan(unverifiedScore);
        });

        it('should factor in recency', () => {
            const recentContent = { ...mockContent, createdAt: new Date() };
            const oldContent = { ...mockContent, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) };

            const recentScore = calculateScore(recentContent, mockPreferences);
            const oldScore = calculateScore(oldContent, mockPreferences);

            expect(recentScore).toBeGreaterThan(oldScore);
        });
    });
});
