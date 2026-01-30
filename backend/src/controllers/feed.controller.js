/**
 * feed.controller.js - Personalized feed generation
 * Uses rule-based scoring for content personalization
 */

const Content = require('../models/Content');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Personalization scoring weights
 */
const WEIGHTS = {
    TOPIC_MATCH: 3,
    LANGUAGE_MATCH: 2,
    RECENCY: 1,
    POPULARITY: 0.5,
    VERIFIED_BONUS: 0.5
};

/**
 * Calculate personalization score for content item
 * @param {Object} content - Content document
 * @param {Object} preferences - User preferences
 * @returns {number} Score
 */
const calculateScore = (content, preferences) => {
    let score = 0;

    // Topic match (content tags vs user preferred topics)
    if (preferences.topics && content.tags) {
        const matchingTopics = content.tags.filter(tag =>
            preferences.topics.some(topic =>
                tag.toLowerCase().includes(topic.toLowerCase()) ||
                topic.toLowerCase().includes(tag.toLowerCase())
            )
        );
        score += matchingTopics.length * WEIGHTS.TOPIC_MATCH;
    }

    // Type match (health/education based on topics)
    const typeMatch = preferences.topics?.includes(content.type);
    if (typeMatch) {
        score += WEIGHTS.TOPIC_MATCH;
    }

    // Language match
    if (preferences.languages && preferences.languages.includes(content.language)) {
        score += WEIGHTS.LANGUAGE_MATCH;
    }

    // Recency score (newer content scores higher)
    const ageInDays = (Date.now() - new Date(content.createdAt)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 30 - ageInDays) / 30; // Decay over 30 days
    score += recencyScore * WEIGHTS.RECENCY;

    // Popularity score (normalized)
    const views = content.metrics?.views || 0;
    const likes = content.metrics?.likes || 0;
    const popularityScore = Math.min(1, (views + likes * 3) / 1000);
    score += popularityScore * WEIGHTS.POPULARITY;

    // Verified content bonus
    if (content.verified) {
        score += WEIGHTS.VERIFIED_BONUS;
    }

    return score;
};

/**
 * Get personalized feed for user
 * @route GET /api/feed
 */
const getFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    // Get user preferences (use defaults for non-authenticated)
    const preferences = req.user?.preferences || {
        topics: ['health', 'education'],
        languages: ['en']
    };

    // Build base query
    const query = {
        moderationStatus: 'approved',
        language: { $in: preferences.languages || ['en'] }
    };

    // Fetch content (get more than needed for scoring)
    const fetchLimit = limitNum * 3;
    const allContent = await Content.find(query)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .populate('authorId', 'name');

    // Score and sort content
    const scoredContent = allContent.map(content => ({
        ...content.toObject(),
        personalizationScore: calculateScore(content, preferences)
    }));

    scoredContent.sort((a, b) => b.personalizationScore - a.personalizationScore);

    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedContent = scoredContent.slice(startIndex, startIndex + limitNum);

    // Remove score from response (internal use only)
    const responseContent = paginatedContent.map(({ personalizationScore, ...content }) => content);

    res.json({
        success: true,
        data: responseContent,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total: scoredContent.length,
            pages: Math.ceil(scoredContent.length / limitNum)
        },
        meta: {
            personalized: !!req.user,
            languages: preferences.languages,
            topics: preferences.topics
        }
    });
});

/**
 * Get trending content (not personalized, popularity-based)
 * @route GET /api/feed/trending
 */
const getTrending = asyncHandler(async (req, res) => {
    const { limit = 10, language } = req.query;
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const query = { moderationStatus: 'approved' };
    if (language && ['en', 'hi'].includes(language)) {
        query.language = language;
    }

    const content = await Content.find(query)
        .sort({ 'metrics.views': -1, 'metrics.likes': -1 })
        .limit(limitNum)
        .populate('authorId', 'name');

    res.json({
        success: true,
        data: content
    });
});

/**
 * Get recent content
 * @route GET /api/feed/recent
 */
const getRecent = asyncHandler(async (req, res) => {
    const { limit = 10, language, type } = req.query;
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const query = { moderationStatus: 'approved' };
    if (language && ['en', 'hi'].includes(language)) {
        query.language = language;
    }
    if (type && ['health', 'education'].includes(type)) {
        query.type = type;
    }

    const content = await Content.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .populate('authorId', 'name');

    res.json({
        success: true,
        data: content
    });
});

// Export scoring for testing
module.exports = {
    getFeed,
    getTrending,
    getRecent,
    calculateScore, // Exported for testing
    WEIGHTS
};
