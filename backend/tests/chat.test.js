/**
 * chat.test.js - Tests for chat API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');

// Mock services before importing app
jest.mock('../src/services/llm.adapter', () => ({
    chat: jest.fn().mockResolvedValue({
        response: 'This is a test response about health.',
        tokensUsed: 100
    }),
    isHealthQuery: jest.fn().mockReturnValue(true),
    checkEmergency: jest.fn().mockReturnValue({ isEmergency: false })
}));

jest.mock('../src/services/moderation.service', () => ({
    moderateText: jest.fn().mockResolvedValue({ isSafe: true }),
    sanitizeText: jest.fn((text) => text)
}));

// Mock auth middleware
jest.mock('../src/middleware/auth.middleware', () => ({
    authenticate: (req, res, next) => {
        req.user = {
            _id: new mongoose.Types.ObjectId(),
            email: 'test@example.com',
            role: 'user',
            preferences: { languages: ['en'], voiceEnabled: false }
        };
        next();
    },
    requireRole: () => (req, res, next) => next()
}));

const app = require('../src/index');
const Conversation = require('../src/models/Conversation');
const llmAdapter = require('../src/services/llm.adapter');

describe('Chat API', () => {
    describe('POST /api/chat', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('sends message and receives response', async () => {
            jest.spyOn(Conversation, 'findOne').mockResolvedValue(null);
            jest.spyOn(Conversation.prototype, 'save').mockResolvedValue({
                _id: new mongoose.Types.ObjectId(),
                messages: []
            });

            const res = await request(app)
                .post('/api/chat')
                .send({ message: 'What are healthy foods?' })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.response).toBeDefined();
        });

        test('continues existing conversation', async () => {
            const conversationId = new mongoose.Types.ObjectId();

            jest.spyOn(Conversation, 'findOne').mockResolvedValue({
                _id: conversationId,
                messages: [{ role: 'assistant', content: 'Hello!' }],
                save: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .post('/api/chat')
                .send({
                    message: 'Tell me more',
                    conversationId: conversationId.toString()
                })
                .expect(200);

            expect(res.body.data.conversationId).toBeDefined();
        });

        test('rejects empty message', async () => {
            await request(app)
                .post('/api/chat')
                .send({ message: '' })
                .expect(400);
        });

        test('handles LLM service error gracefully', async () => {
            llmAdapter.chat.mockRejectedValueOnce(new Error('LLM service unavailable'));

            jest.spyOn(Conversation, 'findOne').mockResolvedValue(null);
            jest.spyOn(Conversation.prototype, 'save').mockResolvedValue({
                _id: new mongoose.Types.ObjectId(),
                messages: []
            });

            const res = await request(app)
                .post('/api/chat')
                .send({ message: 'Hello' })
                .expect(500);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/chat', () => {
        test('returns conversation history', async () => {
            jest.spyOn(Conversation, 'find').mockImplementation(() => ({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([
                    { _id: new mongoose.Types.ObjectId(), messages: [] }
                ])
            }));

            const res = await request(app)
                .get('/api/chat')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('POST /api/chat/emergency', () => {
        test('detects non-emergency', async () => {
            llmAdapter.checkEmergency.mockReturnValue({ isEmergency: false });

            const res = await request(app)
                .post('/api/chat/emergency')
                .send({ message: 'How do I eat healthy?' })
                .expect(200);

            expect(res.body.data.isEmergency).toBe(false);
        });

        test('detects emergency', async () => {
            llmAdapter.checkEmergency.mockReturnValue({
                isEmergency: true,
                keywords: ['heart attack']
            });

            const res = await request(app)
                .post('/api/chat/emergency')
                .send({ message: 'I think I am having a heart attack' })
                .expect(200);

            expect(res.body.data.isEmergency).toBe(true);
        });
    });
});
