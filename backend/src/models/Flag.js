/**
 * Flag.js - Mongoose model for moderation flags
 * Tracks content and conversation flags for review
 */

const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
    // Reference to flagged content or conversation
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    messageIndex: {
        type: Number // Index of specific message in conversation if applicable
    },
    // Who triggered the flag (system, user, or moderator)
    flaggedBy: {
        type: String,
        enum: ['system', 'user', 'moderator'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // User who triggered (for user flags) or was involved
    },
    // Flag details
    reason: {
        type: String,
        required: true,
        enum: [
            'harmful_content',
            'medical_misinformation',
            'inappropriate_language',
            'spam',
            'harassment',
            'privacy_violation',
            'emergency_detected',
            'other'
        ]
    },
    reasonDetails: {
        type: String,
        maxlength: 1000
    },
    severity: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
    },
    // Flagged text snippet for context
    textSnippet: {
        type: String,
        maxlength: 500
    },
    // Moderation action taken
    action: {
        type: String,
        enum: ['pending', 'reviewed', 'removed', 'dismissed', 'escalated'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    reviewNotes: {
        type: String,
        maxlength: 1000
    },
    // Auto-detection metadata
    detectionMethod: {
        type: String,
        enum: ['keyword', 'ml_model', 'user_report', 'manual'],
        default: 'keyword'
    },
    detectionScore: {
        type: Number,
        min: 0,
        max: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
flagSchema.index({ contentId: 1 });
flagSchema.index({ conversationId: 1 });
flagSchema.index({ userId: 1 });
flagSchema.index({ action: 1, severity: -1 });
flagSchema.index({ createdAt: -1 });
flagSchema.index({ reason: 1, action: 1 });

// Validation: must have either contentId or conversationId
flagSchema.pre('validate', function (next) {
    if (!this.contentId && !this.conversationId) {
        next(new Error('Flag must reference either content or conversation'));
    } else {
        next();
    }
});

// Static method to get pending flags for review
flagSchema.statics.getPendingFlags = function (options = {}) {
    const { limit = 50, minSeverity = 0 } = options;
    return this.find({
        action: 'pending',
        severity: { $gte: minSeverity }
    })
        .populate('contentId', 'title type')
        .populate('userId', 'name email')
        .sort({ severity: -1, createdAt: 1 })
        .limit(limit);
};

// Static method to create a flag
flagSchema.statics.createFlag = function (data) {
    return this.create(data);
};

// Instance method to mark as reviewed
flagSchema.methods.markReviewed = function (reviewerId, action, notes = '') {
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.action = action;
    this.reviewNotes = notes;
    return this.save();
};

const Flag = mongoose.model('Flag', flagSchema);

module.exports = Flag;
