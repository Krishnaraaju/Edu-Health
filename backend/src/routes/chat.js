/**
 * chat.js - Chat routes
 * Handles LLM-powered conversations
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { chatValidation } = require('../middleware/validate.middleware');

// Rate limiting for chat endpoint
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.CHAT_RATE_LIMIT_MAX) || 20,
    message: {
        success: false,
        message: 'Too many messages, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * @route   POST /api/chat
 * @desc    Send message and get response
 * @access  Private
 */
// Debug logging middleware
const debugRequest = (req, res, next) => {
    console.log('[CHAT] Request body:', JSON.stringify(req.body));
    console.log('[CHAT] Content-Type:', req.get('Content-Type'));
    console.log('[CHAT] User ID:', req.userId);
    next();
};

router.post('/', authenticate, chatLimiter, debugRequest, chatController.sendMessage);

/**
 * @route   GET /api/chat
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/', authenticate, chatController.getConversations);

/**
 * @route   GET /api/chat/:conversationId
 * @desc    Get specific conversation
 * @access  Private
 */
router.get('/:conversationId', authenticate, chatController.getConversation);

/**
 * @route   DELETE /api/chat/:conversationId
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/:conversationId', authenticate, chatController.deleteConversation);

/**
 * @route   POST /api/chat/emergency
 * @desc    Quick emergency check
 * @access  Public
 */
router.post('/emergency', chatController.emergencyCheck);

module.exports = router;
