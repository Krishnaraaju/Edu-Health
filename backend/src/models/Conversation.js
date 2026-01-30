/**
 * Conversation.js - Mongoose model for chat conversations
 * Stores user-assistant message exchanges for context and history
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    text: {
        type: String,
        required: true,
        maxlength: 10000
    },
    metadata: {
        // For tracking moderation, sources, etc.
        moderated: {
            type: Boolean,
            default: false
        },
        sources: [{
            title: String,
            url: String
        }],
        language: {
            type: String,
            enum: ['en', 'hi'],
            default: 'en'
        },
        hasHealthDisclaimer: {
            type: Boolean,
            default: false
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Conversation'
    },
    messages: [messageSchema],
    // For context window management
    tokenCount: {
        type: Number,
        default: 0
    },
    // Retention policy
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
conversationSchema.index({ userId: 1, isActive: 1 });

// Pre-save to update title from first user message
conversationSchema.pre('save', function (next) {
    if (this.isNew && this.messages.length > 0) {
        const firstUserMessage = this.messages.find(m => m.role === 'user');
        if (firstUserMessage) {
            // Truncate to first 50 characters for title
            this.title = firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '');
        }
    }
    this.updatedAt = new Date();
    next();
});

// Instance method to add a message
conversationSchema.methods.addMessage = function (role, text, metadata = {}) {
    this.messages.push({ role, text, metadata });
    return this.save();
};

// Instance method to get recent messages for context
conversationSchema.methods.getRecentContext = function (maxMessages = 10) {
    return this.messages.slice(-maxMessages);
};

// Static method to get user's conversations
conversationSchema.statics.getUserConversations = function (userId, limit = 20) {
    return this.find({ userId, isActive: true })
        .select('title messages.text messages.role createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(limit);
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
