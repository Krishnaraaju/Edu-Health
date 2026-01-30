/**
 * chat.controller.js - Chat handling with LLM integration
 * Manages conversations and moderated LLM responses
 */

const Conversation = require('../models/Conversation');
const { callLLM, buildUserPrompt, isEmergency } = require('../services/llm.adapter');
const { moderate } = require('../services/moderation.service');
const { ApiError, asyncHandler } = require('../middleware/error.middleware');

/**
 * Send a chat message and get response
 * @route POST /api/chat
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { message, conversationId, context } = req.body;
    const userId = req.userId;

    // Validate message exists
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Message is required',
            errors: [{ field: 'message', message: 'Message is required' }]
        });
    }

    // Step 1: Moderate user input (with error handling)
    let moderationResult = { action: 'ALLOW', reasons: [] };
    try {
        moderationResult = await moderate(message, {
            userId,
            conversationId,
            useLLM: process.env.MODERATION_STRICT_MODE === 'true'
        });
    } catch (modError) {
        console.error('Moderation error:', modError.message);
        // Continue with ALLOW if moderation fails
    }

    if (moderationResult.action === 'DENY') {
        return res.status(400).json({
            success: false,
            message: 'Your message was blocked by our safety system.',
            reasons: moderationResult.reasons,
            moderated: true
        });
    }

    // Step 2: Get or create conversation
    let conversation;
    if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, userId });
        if (!conversation) {
            throw ApiError.notFound('Conversation not found');
        }
    } else {
        conversation = new Conversation({
            userId,
            messages: []
        });
    }

    // Step 3: Add user message to conversation
    conversation.messages.push({
        role: 'user',
        text: message,
        metadata: {
            moderated: moderationResult.action === 'FLAG',
            language: req.user?.preferences?.languages?.[0] || 'en'
        }
    });

    // Step 4: Build context from recent messages
    const recentMessages = conversation.getRecentContext(5);
    const contextString = recentMessages
        .map(m => `${m.role}: ${m.text}`)
        .join('\n');

    // Step 5: Call LLM
    const userPrompt = buildUserPrompt(message, {
        lang: req.user?.preferences?.languages?.[0] || 'en',
        prefs: req.user?.preferences || {},
        context: contextString
    });

    const llmResponse = await callLLM(userPrompt, {
        userMessage: message
    });

    // Step 6: Add assistant response to conversation
    conversation.messages.push({
        role: 'assistant',
        text: llmResponse.text,
        metadata: {
            hasHealthDisclaimer: llmResponse.hasDisclaimer,
            language: req.user?.preferences?.languages?.[0] || 'en',
            sources: [] // TODO: Add source attribution in Phase 5
        }
    });

    await conversation.save();

    // Step 7: Return response
    res.json({
        success: true,
        data: {
            conversationId: conversation._id,
            response: llmResponse.text,
            metadata: {
                hasDisclaimer: llmResponse.hasDisclaimer,
                isEmergency: llmResponse.isEmergency,
                provider: llmResponse.provider,
                flagged: moderationResult.action === 'FLAG'
            }
        }
    });
});

/**
 * Get conversation history
 * @route GET /api/chat/:conversationId
 */
const getConversation = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        userId: req.userId
    });

    if (!conversation) {
        throw ApiError.notFound('Conversation not found');
    }

    res.json({
        success: true,
        data: conversation
    });
});

/**
 * Get user's conversation list
 * @route GET /api/chat
 */
const getConversations = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const conversations = await Conversation.getUserConversations(req.userId, limitNum);

    // Get preview of last message for each
    const conversationsWithPreview = conversations.map(conv => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        return {
            _id: conv._id,
            title: conv.title,
            lastMessage: lastMessage?.text?.substring(0, 100) || '',
            lastRole: lastMessage?.role || 'user',
            messageCount: conv.messages.length,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        };
    });

    res.json({
        success: true,
        data: conversationsWithPreview
    });
});

/**
 * Delete conversation
 * @route DELETE /api/chat/:conversationId
 */
const deleteConversation = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOneAndUpdate(
        { _id: req.params.conversationId, userId: req.userId },
        { isActive: false },
        { new: true }
    );

    if (!conversation) {
        throw ApiError.notFound('Conversation not found');
    }

    res.json({
        success: true,
        message: 'Conversation deleted'
    });
});

/**
 * Quick health check / emergency response
 * @route POST /api/chat/emergency
 */
const emergencyCheck = asyncHandler(async (req, res) => {
    const { message } = req.body;

    const isEmergencyMessage = isEmergency(message);

    res.json({
        success: true,
        data: {
            isEmergency: isEmergencyMessage,
            message: isEmergencyMessage
                ? 'If you are experiencing a medical emergency, please call 112 (Emergency) or 108 (Ambulance) immediately.'
                : null
        }
    });
});

module.exports = {
    sendMessage,
    getConversation,
    getConversations,
    deleteConversation,
    emergencyCheck
};
