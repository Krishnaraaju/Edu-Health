/**
 * moderation.controller.js - Moderation API endpoints
 * Handles text moderation requests and flag management
 */

const Flag = require('../models/Flag');
const { moderate } = require('../services/moderation.service');
const { ApiError, asyncHandler } = require('../middleware/error.middleware');

/**
 * Moderate text content
 * @route POST /api/moderate
 */
const moderateText = asyncHandler(async (req, res) => {
    const { text } = req.body;

    const result = await moderate(text, {
        userId: req.userId,
        useLLM: true
    });

    res.json({
        success: true,
        data: {
            action: result.action,
            reasons: result.reasons,
            severity: result.severity
        }
    });
});

/**
 * Get pending moderation flags (admin)
 * @route GET /api/moderate/flags
 */
const getFlags = asyncHandler(async (req, res) => {
    const { status = 'pending', page = 1, limit = 20, minSeverity = 0 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && ['pending', 'reviewed', 'removed', 'dismissed', 'escalated'].includes(status)) {
        query.action = status;
    }
    if (minSeverity) {
        query.severity = { $gte: parseInt(minSeverity) };
    }

    const [flags, total] = await Promise.all([
        Flag.find(query)
            .sort({ severity: -1, createdAt: 1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'name email')
            .populate('contentId', 'title type'),
        Flag.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: flags,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});

/**
 * Review a flag (admin)
 * @route PUT /api/moderate/flags/:id
 */
const reviewFlag = asyncHandler(async (req, res) => {
    const { action, notes } = req.body;

    if (!['reviewed', 'removed', 'dismissed', 'escalated'].includes(action)) {
        throw ApiError.badRequest('Invalid action');
    }

    const flag = await Flag.findById(req.params.id);
    if (!flag) {
        throw ApiError.notFound('Flag not found');
    }

    await flag.markReviewed(req.userId, action, notes);

    res.json({
        success: true,
        message: `Flag marked as ${action}`,
        data: flag
    });
});

/**
 * Get moderation statistics (admin)
 * @route GET /api/moderate/stats
 */
const getStats = asyncHandler(async (req, res) => {
    const [
        totalFlags,
        pendingFlags,
        severityStats,
        reasonStats
    ] = await Promise.all([
        Flag.countDocuments(),
        Flag.countDocuments({ action: 'pending' }),
        Flag.aggregate([
            { $group: { _id: null, avgSeverity: { $avg: '$severity' }, maxSeverity: { $max: '$severity' } } }
        ]),
        Flag.aggregate([
            { $group: { _id: '$reason', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])
    ]);

    res.json({
        success: true,
        data: {
            total: totalFlags,
            pending: pendingFlags,
            avgSeverity: severityStats[0]?.avgSeverity || 0,
            maxSeverity: severityStats[0]?.maxSeverity || 0,
            byReason: reasonStats.reduce((acc, r) => {
                acc[r._id] = r.count;
                return acc;
            }, {})
        }
    });
});

/**
 * Submit user report
 * @route POST /api/moderate/report
 */
const submitReport = asyncHandler(async (req, res) => {
    const { contentId, conversationId, reason, details } = req.body;

    if (!contentId && !conversationId) {
        throw ApiError.badRequest('Must specify contentId or conversationId');
    }

    if (!reason) {
        throw ApiError.badRequest('Reason is required');
    }

    const flag = await Flag.create({
        contentId,
        conversationId,
        userId: req.userId,
        flaggedBy: 'user',
        reason,
        reasonDetails: details,
        severity: 5, // Default for user reports
        detectionMethod: 'user_report'
    });

    res.status(201).json({
        success: true,
        message: 'Report submitted. Thank you for helping keep our community safe.',
        data: { flagId: flag._id }
    });
});

module.exports = {
    moderateText,
    getFlags,
    reviewFlag,
    getStats,
    submitReport
};
