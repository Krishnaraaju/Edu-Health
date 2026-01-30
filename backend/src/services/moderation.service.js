/**
 * moderation.service.js - Content moderation pipeline
 * Combines keyword blocklist and LLM-based moderation
 */

const Flag = require('../models/Flag');
const { moderateWithLLM } = require('./llm.adapter');

/**
 * Keyword blocklist for immediate denial
 * Categories: hate speech, violence, self-harm, spam
 */
const BLOCKLIST = {
    severe: [
        'kill yourself', 'go die', 'suicide method',
        'how to make bomb', 'how to poison',
        'child abuse', 'child porn'
    ],
    moderate: [
        'fake medicine', 'miracle cure', 'doctors hate this',
        'guaranteed weight loss', 'instant cure'
    ],
    spam: [
        'click here now', 'limited time offer', 'act now',
        'congratulations you won', 'nigerian prince'
    ]
};

/**
 * Check text against keyword blocklist
 * @param {string} text - Text to check
 * @returns {Object} { blocked: boolean, severity: number, reasons: string[] }
 */
const checkBlocklist = (text) => {
    const lowerText = text.toLowerCase();
    const reasons = [];
    let maxSeverity = 0;

    // Check severe keywords (immediate block)
    for (const keyword of BLOCKLIST.severe) {
        if (lowerText.includes(keyword)) {
            reasons.push(`Blocked keyword detected: severe content`);
            maxSeverity = 10;
        }
    }

    // Check moderate keywords
    for (const keyword of BLOCKLIST.moderate) {
        if (lowerText.includes(keyword)) {
            reasons.push(`Potentially misleading health claim`);
            maxSeverity = Math.max(maxSeverity, 7);
        }
    }

    // Check spam keywords
    for (const keyword of BLOCKLIST.spam) {
        if (lowerText.includes(keyword)) {
            reasons.push(`Spam patterns detected`);
            maxSeverity = Math.max(maxSeverity, 5);
        }
    }

    return {
        blocked: maxSeverity >= 7,
        flagged: maxSeverity >= 5,
        severity: maxSeverity,
        reasons
    };
};

/**
 * Check for medical misinformation patterns
 * @param {string} text - Text to check
 * @returns {Object} { flagged: boolean, reasons: string[] }
 */
const checkMedicalMisinformation = (text) => {
    const lowerText = text.toLowerCase();
    const reasons = [];
    let flagged = false;

    const misinfoPatterns = [
        { pattern: /vaccines?\s+(cause|causes)\s+(autism|death)/i, reason: 'Anti-vaccine misinformation' },
        { pattern: /covid.*(hoax|fake|doesn't exist)/i, reason: 'COVID-19 misinformation' },
        { pattern: /cure\s+(cancer|diabetes|hiv)\s+naturally/i, reason: 'Unproven cure claims' },
        { pattern: /doctors?\s+(hide|hiding|don't want)/i, reason: 'Medical conspiracy theory' },
        { pattern: /bleach.*drink|drink.*bleach/i, reason: 'Dangerous remedy' }
    ];

    for (const { pattern, reason } of misinfoPatterns) {
        if (pattern.test(text)) {
            flagged = true;
            reasons.push(reason);
        }
    }

    return { flagged, reasons };
};

/**
 * Full moderation pipeline
 * @param {string} text - Text to moderate
 * @param {Object} options - Options including userId, contentId
 * @returns {Promise<Object>} Moderation result
 */
const moderate = async (text, options = {}) => {
    const { userId, contentId, conversationId, useLLM = true } = options;

    // Step 1: Keyword blocklist check
    const blocklistResult = checkBlocklist(text);

    if (blocklistResult.blocked) {
        // Log severe content
        await logFlag({
            contentId,
            conversationId,
            userId,
            reason: 'harmful_content',
            reasonDetails: blocklistResult.reasons.join('; '),
            severity: blocklistResult.severity,
            textSnippet: text.substring(0, 200),
            detectionMethod: 'keyword'
        });

        return {
            action: 'DENY',
            reasons: blocklistResult.reasons,
            severity: blocklistResult.severity,
            method: 'keyword'
        };
    }

    // Step 2: Medical misinformation check
    const misinfoResult = checkMedicalMisinformation(text);

    if (misinfoResult.flagged) {
        await logFlag({
            contentId,
            conversationId,
            userId,
            reason: 'medical_misinformation',
            reasonDetails: misinfoResult.reasons.join('; '),
            severity: 7,
            textSnippet: text.substring(0, 200),
            detectionMethod: 'keyword'
        });

        return {
            action: 'FLAG',
            reasons: misinfoResult.reasons,
            severity: 7,
            method: 'keyword'
        };
    }

    // Step 3: LLM-based moderation (if enabled and API available)
    if (useLLM && process.env.MODERATION_ENABLED === 'true') {
        try {
            const llmResult = await moderateWithLLM(text);

            if (llmResult.action === 'DENY' || llmResult.action === 'FLAG') {
                await logFlag({
                    contentId,
                    conversationId,
                    userId,
                    reason: 'harmful_content',
                    reasonDetails: llmResult.reasons.join('; '),
                    severity: llmResult.severity,
                    textSnippet: text.substring(0, 200),
                    detectionMethod: 'ml_model',
                    detectionScore: llmResult.severity / 10
                });
            }

            return {
                action: llmResult.action,
                reasons: llmResult.reasons,
                severity: llmResult.severity,
                method: 'ml_model'
            };
        } catch (error) {
            console.error('LLM moderation failed:', error.message);
            // Fall through to allow if LLM fails
        }
    }

    // Step 4: Keyword flagging (if not blocked)
    if (blocklistResult.flagged) {
        return {
            action: 'FLAG',
            reasons: blocklistResult.reasons,
            severity: blocklistResult.severity,
            method: 'keyword'
        };
    }

    // All checks passed
    return {
        action: 'ALLOW',
        reasons: [],
        severity: 0,
        method: 'combined'
    };
};

/**
 * Log a moderation flag to database
 * @param {Object} flagData - Flag data
 */
const logFlag = async (flagData) => {
    try {
        await Flag.create({
            ...flagData,
            flaggedBy: 'system'
        });
    } catch (error) {
        console.error('Failed to log flag:', error.message);
    }
};

/**
 * Sanitize text by removing blocked content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const sanitizeText = (text) => {
    let sanitized = text;

    // Remove severe blocked content
    for (const keyword of [...BLOCKLIST.severe, ...BLOCKLIST.moderate]) {
        const regex = new RegExp(keyword, 'gi');
        sanitized = sanitized.replace(regex, '[removed]');
    }

    return sanitized;
};

module.exports = {
    moderate,
    checkBlocklist,
    checkMedicalMisinformation,
    sanitizeText,
    logFlag,
    BLOCKLIST
};
