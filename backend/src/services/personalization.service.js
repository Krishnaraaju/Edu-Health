/**
 * personalization.service.js - On-device and server personalization
 * Implements privacy-preserving content scoring algorithm
 */

/**
 * Calculate personalization score for content
 * Uses weighted factors based on user preferences
 * 
 * @param {Object} content - Content item
 * @param {Object} userPrefs - User preferences
 * @returns {number} Score between 0-100
 */
function calculateContentScore(content, userPrefs = {}) {
    let score = 50; // Base score
    const weights = {
        topicMatch: 20,
        languageMatch: 15,
        recency: 10,
        engagement: 10,
        verified: 10,
        completeness: 5
    };

    // Topic matching (highest weight)
    if (userPrefs.topics?.length > 0) {
        const contentTopics = [content.type, ...(content.tags || [])];
        const matchingTopics = userPrefs.topics.filter(t =>
            contentTopics.some(ct => ct.toLowerCase().includes(t.toLowerCase()))
        );
        score += (matchingTopics.length / userPrefs.topics.length) * weights.topicMatch;
    }

    // Language preference
    if (userPrefs.languages?.length > 0) {
        if (userPrefs.languages.includes(content.language)) {
            score += weights.languageMatch;
        }
    }

    // Recency boost (content < 7 days old gets full points)
    if (content.createdAt) {
        const ageInDays = (Date.now() - new Date(content.createdAt)) / (1000 * 60 * 60 * 24);
        if (ageInDays < 7) {
            score += weights.recency * (1 - ageInDays / 7);
        }
    }

    // Engagement score (likes and views)
    if (content.metrics) {
        const engagementScore = Math.min(
            ((content.metrics.likes || 0) * 2 + (content.metrics.views || 0) * 0.1) / 100,
            1
        );
        score += engagementScore * weights.engagement;
    }

    // Verified content bonus
    if (content.verified) {
        score += weights.verified;
    }

    // Content completeness
    if (content.summary && content.bodyMarkdown && content.sourceUrl) {
        score += weights.completeness;
    }

    return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Sort and filter content based on personalization
 * 
 * @param {Array} contents - Array of content items
 * @param {Object} userPrefs - User preferences
 * @param {Object} options - Sorting options
 * @returns {Array} Sorted content with scores
 */
function personalizeContent(contents, userPrefs = {}, options = {}) {
    const { limit = 20, minScore = 30 } = options;

    // Calculate scores
    const scoredContent = contents.map(content => ({
        ...content,
        personalizationScore: calculateContentScore(content, userPrefs)
    }));

    // Filter by minimum score
    const filteredContent = scoredContent.filter(c => c.personalizationScore >= minScore);

    // Sort by score (descending)
    filteredContent.sort((a, b) => b.personalizationScore - a.personalizationScore);

    // Apply limit
    return filteredContent.slice(0, limit);
}

/**
 * Generate user interest profile based on interactions
 * Privacy-preserving: only stores aggregated preferences
 * 
 * @param {Array} interactions - User interactions (views, likes)
 * @returns {Object} Interest profile
 */
function buildInterestProfile(interactions) {
    const topicCounts = {};
    const languageCounts = {};

    interactions.forEach(interaction => {
        // Count topics
        if (interaction.contentType) {
            topicCounts[interaction.contentType] = (topicCounts[interaction.contentType] || 0) + 1;
        }
        if (interaction.tags) {
            interaction.tags.forEach(tag => {
                topicCounts[tag] = (topicCounts[tag] || 0) + 1;
            });
        }
        // Count languages
        if (interaction.language) {
            languageCounts[interaction.language] = (languageCounts[interaction.language] || 0) + 1;
        }
    });

    // Sort and extract top interests
    const topTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic]) => topic);

    const topLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang);

    return {
        topics: topTopics,
        languages: topLanguages,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Merge explicit preferences with inferred interests
 * 
 * @param {Object} explicitPrefs - User-set preferences
 * @param {Object} inferredProfile - Inferred from behavior
 * @returns {Object} Combined preferences
 */
function mergePreferences(explicitPrefs, inferredProfile) {
    // Explicit preferences take priority
    const mergedTopics = [...new Set([
        ...(explicitPrefs.topics || []),
        ...(inferredProfile.topics || [])
    ])].slice(0, 15);

    const mergedLanguages = explicitPrefs.languages?.length > 0
        ? explicitPrefs.languages
        : inferredProfile.languages;

    return {
        topics: mergedTopics,
        languages: mergedLanguages,
        voiceEnabled: explicitPrefs.voiceEnabled || false
    };
}

module.exports = {
    calculateContentScore,
    personalizeContent,
    buildInterestProfile,
    mergePreferences
};
