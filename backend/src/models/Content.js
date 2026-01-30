/**
 * Content.js - Mongoose model for health and education content
 * Supports markdown body, bilingual content, tags, and metrics for personalization
 */

const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    shares: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    bodyMarkdown: {
        type: String,
        required: [true, 'Body content is required'],
        minlength: [10, 'Body must be at least 10 characters']
    },
    type: {
        type: String,
        required: [true, 'Content type is required'],
        enum: {
            values: ['education', 'health'],
            message: 'Type must be education or health'
        }
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Cannot have more than 10 tags'
        }
    },
    language: {
        type: String,
        required: [true, 'Language is required'],
        enum: {
            values: ['en', 'hi'],
            message: 'Language must be en (English) or hi (Hindi)'
        },
        default: 'en'
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID is required']
    },
    verified: {
        type: Boolean,
        default: false
    },
    sourceUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    },
    metrics: {
        type: metricsSchema,
        default: () => ({})
    },
    // For translations - links to original content
    originalContentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    // Moderation status
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending'
    },
    // SEO and summary
    summary: {
        type: String,
        maxlength: 500
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
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Text index for search functionality
contentSchema.index(
    { title: 'text', bodyMarkdown: 'text', tags: 'text' },
    {
        weights: { title: 10, tags: 5, bodyMarkdown: 1 },
        name: 'content_text_search'
    }
);

// Compound indexes for common queries
contentSchema.index({ type: 1, language: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ language: 1, createdAt: -1 });
contentSchema.index({ type: 1, language: 1, tags: 1 });
contentSchema.index({ verified: 1, moderationStatus: 1 });
contentSchema.index({ authorId: 1, createdAt: -1 });

// Virtual for popularity score (used in personalization)
contentSchema.virtual('popularityScore').get(function () {
    const views = this.metrics?.views || 0;
    const likes = this.metrics?.likes || 0;
    const shares = this.metrics?.shares || 0;
    // Weighted score: likes worth 3x, shares worth 5x
    return views + (likes * 3) + (shares * 5);
});

// Virtual for age in days (used in recency scoring)
contentSchema.virtual('ageDays').get(function () {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
contentSchema.pre('save', function (next) {
    // Normalize tags to lowercase
    if (this.tags && Array.isArray(this.tags)) {
        this.tags = this.tags.map(tag => tag.toLowerCase().trim());
    }
    this.updatedAt = new Date();
    next();
});

// Static method for text search
contentSchema.statics.searchContent = function (query, filters = {}) {
    const searchQuery = { $text: { $search: query } };

    if (filters.type) searchQuery.type = filters.type;
    if (filters.language) searchQuery.language = filters.language;
    if (filters.tags && filters.tags.length > 0) {
        searchQuery.tags = { $in: filters.tags };
    }
    if (filters.verified !== undefined) {
        searchQuery.verified = filters.verified;
    }

    return this.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
};

// Static method to increment view count
contentSchema.statics.incrementViews = function (contentId) {
    return this.findByIdAndUpdate(
        contentId,
        { $inc: { 'metrics.views': 1 } },
        { new: true }
    );
};

// Static method to get content by type with pagination
contentSchema.statics.getByType = function (type, options = {}) {
    const { page = 1, limit = 10, language } = options;
    const query = { type, moderationStatus: 'approved' };
    if (language) query.language = language;

    return this.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('authorId', 'name');
};

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
