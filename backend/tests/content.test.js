/**
 * content.test.js - Tests for content API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const Content = require('../src/models/Content');
const User = require('../src/models/User');

// Mock authentication
jest.mock('../src/middleware/auth.middleware', () => ({
    authenticate: (req, res, next) => {
        req.user = {
            _id: new mongoose.Types.ObjectId(),
            email: 'test@example.com',
            role: 'user'
        };
        next();
    },
    requireRole: () => (req, res, next) => next(),
    optionalAuth: (req, res, next) => next()
}));

describe('Content API', () => {
    const testContent = {
        title: 'Test Health Article',
        type: 'health',
        bodyMarkdown: '# Test Content\n\nThis is test content.',
        summary: 'A test summary',
        language: 'en',
        tags: ['health', 'test'],
        verified: true
    };

    describe('GET /api/content', () => {
        beforeEach(() => {
            jest.spyOn(Content, 'find').mockImplementation(() => ({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([testContent])
            }));
            jest.spyOn(Content, 'countDocuments').mockResolvedValue(1);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('returns content list with pagination', async () => {
            const res = await request(app)
                .get('/api/content')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('accepts type filter', async () => {
            await request(app)
                .get('/api/content?type=health')
                .expect(200);
        });

        test('accepts language filter', async () => {
            await request(app)
                .get('/api/content?language=en')
                .expect(200);
        });
    });

    describe('GET /api/content/:id', () => {
        test('returns content by ID', async () => {
            const contentId = new mongoose.Types.ObjectId();

            jest.spyOn(Content, 'findByIdAndUpdate').mockResolvedValue({
                ...testContent,
                _id: contentId
            });

            const res = await request(app)
                .get(`/api/content/${contentId}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(testContent.title);
        });

        test('returns 404 for non-existent content', async () => {
            const contentId = new mongoose.Types.ObjectId();
            jest.spyOn(Content, 'findByIdAndUpdate').mockResolvedValue(null);

            await request(app)
                .get(`/api/content/${contentId}`)
                .expect(404);
        });
    });

    describe('POST /api/content/:id/like', () => {
        test('increments like count', async () => {
            const contentId = new mongoose.Types.ObjectId();

            jest.spyOn(Content, 'findByIdAndUpdate').mockResolvedValue({
                ...testContent,
                _id: contentId,
                metrics: { likes: 1, views: 0, shares: 0 }
            });

            const res = await request(app)
                .post(`/api/content/${contentId}/like`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.metrics.likes).toBe(1);
        });
    });
});

describe('Content Model', () => {
    test('validates required fields', async () => {
        const content = new Content({});

        await expect(content.validate()).rejects.toThrow();
    });

    test('sets default values', () => {
        const content = new Content({
            title: 'Test',
            type: 'health',
            bodyMarkdown: 'Content',
            createdBy: new mongoose.Types.ObjectId()
        });

        expect(content.status).toBe('pending');
        expect(content.language).toBe('en');
        expect(content.verified).toBe(false);
    });
});
