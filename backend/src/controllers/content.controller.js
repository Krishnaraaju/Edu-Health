/**
 * content.controller.js - Content management business logic
 * Handles CRUD operations for health and education content
 */

const Content = require('../models/Content');
const { ApiError, asyncHandler } = require('../middleware/error.middleware');

/**
 * Get all content with filtering and pagination
 * @route GET /api/content
 */
const getContent = asyncHandler(async (req, res) => {
    const {
        lang,
        type,
        tags,
        q,
        page = 1,
        limit = 10,
        verified,
        sort = 'createdAt'
    } = req.query;

    // Build query
    const query = { moderationStatus: 'approved' };

    if (lang && ['en', 'hi'].includes(lang)) {
        query.language = lang;
    }

    if (type && ['health', 'education'].includes(type)) {
        query.type = type;
    }

    if (tags) {
        const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
        query.tags = { $in: tagArray };
    }

    if (verified === 'true') {
        query.verified = true;
    }

    // Text search
    if (q) {
        query.$text = { $search: q };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort options
    let sortOptions = { createdAt: -1 };
    if (q) {
        sortOptions = { score: { $meta: 'textScore' } };
    } else if (sort === 'popular') {
        sortOptions = { 'metrics.views': -1 };
    } else if (sort === 'likes') {
        sortOptions = { 'metrics.likes': -1 };
    }

    let queryBuilder = Content.find(query);

    if (q) {
        queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
    }

    const [content, total] = await Promise.all([
        queryBuilder
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate('authorId', 'name'),
        Content.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: content,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

/**
 * Get single content by ID
 * @route GET /api/content/:id
 */
const getContentById = asyncHandler(async (req, res) => {
    const content = await Content.findById(req.params.id)
        .populate('authorId', 'name');

    if (!content) {
        throw ApiError.notFound('Content not found');
    }

    // Increment view count
    await Content.incrementViews(req.params.id);

    res.json({
        success: true,
        data: content
    });
});

/**
 * Create new content
 * @route POST /api/content
 * @access Admin/Curator
 */
const createContent = asyncHandler(async (req, res) => {
    const { title, bodyMarkdown, type, tags, language, sourceUrl, verified, summary } = req.body;

    const content = await Content.create({
        title,
        bodyMarkdown,
        type,
        tags: tags || [],
        language,
        sourceUrl,
        summary,
        verified: verified || false,
        authorId: req.userId,
        moderationStatus: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: content
    });
});

/**
 * Update content
 * @route PUT /api/content/:id
 * @access Admin/Curator (author or admin)
 */
const updateContent = asyncHandler(async (req, res) => {
    const content = await Content.findById(req.params.id);

    if (!content) {
        throw ApiError.notFound('Content not found');
    }

    // Check ownership (admin can edit any, curator can only edit their own)
    if (req.user.role !== 'admin' && content.authorId.toString() !== req.userId.toString()) {
        throw ApiError.forbidden('You can only edit your own content');
    }

    const allowedFields = ['title', 'bodyMarkdown', 'type', 'tags', 'language', 'sourceUrl', 'summary', 'verified'];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            content[field] = req.body[field];
        }
    });

    // If curator edits, reset moderation status
    if (req.user.role === 'curator') {
        content.moderationStatus = 'pending';
    }

    await content.save();

    res.json({
        success: true,
        message: 'Content updated successfully',
        data: content
    });
});

/**
 * Delete content
 * @route DELETE /api/content/:id
 * @access Admin only
 */
const deleteContent = asyncHandler(async (req, res) => {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
        throw ApiError.notFound('Content not found');
    }

    res.json({
        success: true,
        message: 'Content deleted successfully'
    });
});

/**
 * Like content
 * @route POST /api/content/:id/like
 */
const likeContent = asyncHandler(async (req, res) => {
    const content = await Content.findByIdAndUpdate(
        req.params.id,
        { $inc: { 'metrics.likes': 1 } },
        { new: true }
    );

    if (!content) {
        throw ApiError.notFound('Content not found');
    }

    res.json({
        success: true,
        data: { likes: content.metrics.likes }
    });
});

/**
 * Get content for admin/curator moderation
 * @route GET /api/content/pending
 * @access Admin/Curator
 */
const getPendingContent = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = { moderationStatus: 'pending' };

    // Curators only see their own pending content
    if (req.user.role === 'curator') {
        query.authorId = req.userId;
    }

    const [content, total] = await Promise.all([
        Content.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate('authorId', 'name'),
        Content.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: content,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

/**
 * Approve/reject content
 * @route PUT /api/content/:id/moderate
 * @access Admin only
 */
const moderateContent = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        throw ApiError.badRequest('Status must be approved or rejected');
    }

    const content = await Content.findByIdAndUpdate(
        req.params.id,
        {
            moderationStatus: status,
            ...(status === 'approved' && { verified: true })
        },
        { new: true }
    );

    if (!content) {
        throw ApiError.notFound('Content not found');
    }

    res.json({
        success: true,
        message: `Content ${status}`,
        data: content
    });
});

module.exports = {
    getContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    likeContent,
    getPendingContent,
    moderateContent
};
