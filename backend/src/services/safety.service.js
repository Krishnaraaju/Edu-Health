/**
 * safety.service.js - AI Safety and Health Disclaimer Service
 * Ensures safe, accurate, and responsible AI responses
 */

// Emergency keywords that require immediate escalation
const EMERGENCY_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'heart attack', 'stroke', 'can\'t breathe', 'chest pain',
    'overdose', 'poisoning', 'severe bleeding', 'unconscious',
    'emergency', 'ambulance', 'dying'
];

// Medical conditions requiring professional consultation
const CONSULT_KEYWORDS = [
    'pregnant', 'pregnancy', 'cancer', 'tumor', 'diabetes',
    'hiv', 'aids', 'hepatitis', 'surgery', 'transplant',
    'medication', 'prescription', 'dosage', 'chronic'
];

// Health topic categories for disclaimer matching
const HEALTH_CATEGORIES = {
    general: ['health', 'wellness', 'lifestyle', 'nutrition', 'exercise'],
    medical: ['disease', 'symptom', 'treatment', 'diagnosis', 'medicine'],
    mental: ['anxiety', 'depression', 'stress', 'mental health', 'therapy'],
    emergency: ['emergency', 'urgent', 'severe', 'critical']
};

/**
 * Check if message contains emergency keywords
 * @param {string} text - User message
 * @returns {Object} Emergency status and matched keywords
 */
function checkEmergency(text) {
    if (!text) return { isEmergency: false };

    const lowerText = text.toLowerCase();
    const matches = EMERGENCY_KEYWORDS.filter(keyword =>
        lowerText.includes(keyword.toLowerCase())
    );

    return {
        isEmergency: matches.length > 0,
        keywords: matches,
        severity: matches.length > 1 ? 'high' : matches.length === 1 ? 'medium' : 'low'
    };
}

/**
 * Check if text requires professional consultation disclaimer
 * @param {string} text - Text to check
 * @returns {boolean}
 */
function requiresConsultation(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return CONSULT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Get appropriate disclaimer based on content category
 * @param {string} text - Content text
 * @param {string} language - Language code (en/hi)
 * @returns {Object} Disclaimer info
 */
function getDisclaimer(text, language = 'en') {
    const disclaimers = {
        en: {
            general: '💡 This information is for educational purposes only.',
            medical: '⚕️ This is not medical advice. Please consult a healthcare professional for diagnosis and treatment.',
            mental: '🧠 If you\'re struggling, please reach out to a mental health professional. You\'re not alone.',
            emergency: '🚨 If this is an emergency, please call emergency services immediately: 112 (India) / 911 (US)'
        },
        hi: {
            general: '💡 यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है।',
            medical: '⚕️ यह चिकित्सा सलाह नहीं है। निदान और उपचार के लिए कृपया डॉक्टर से परामर्श लें।',
            mental: '🧠 यदि आप कठिनाई में हैं, कृपया मानसिक स्वास्थ्य विशेषज्ञ से संपर्क करें।',
            emergency: '🚨 यदि यह आपातकाल है, तो कृपया तुरंत 112 पर कॉल करें।'
        }
    };

    const lowerText = text.toLowerCase();
    let category = 'general';

    // Determine category
    if (EMERGENCY_KEYWORDS.some(k => lowerText.includes(k))) {
        category = 'emergency';
    } else if (HEALTH_CATEGORIES.medical.some(k => lowerText.includes(k))) {
        category = 'medical';
    } else if (HEALTH_CATEGORIES.mental.some(k => lowerText.includes(k))) {
        category = 'mental';
    }

    const lang = disclaimers[language] ? language : 'en';

    return {
        category,
        text: disclaimers[lang][category],
        requiresProfessional: category === 'medical' || category === 'emergency'
    };
}

/**
 * Generate emergency response with resources
 * @param {string} language - Language code
 * @returns {string} Emergency response text
 */
function getEmergencyResponse(language = 'en') {
    const responses = {
        en: `🚨 **I'm concerned about what you've shared.**

If you're in immediate danger, please:
- Call emergency services: **112** (India) / **911** (US)
- Go to the nearest emergency room
- Call a helpline:
  - Vandrevala Foundation: **1860-2662-345** (India, 24/7)
  - iCall: **9152987821** (India)
  - National Suicide Prevention: **988** (US)

You matter, and help is available. Please reach out to someone who can support you right now.`,

        hi: `🚨 **मुझे आपकी बात सुनकर चिंता हुई।**

यदि आप तत्काल खतरे में हैं, कृपया:
- आपातकालीन सेवा कॉल करें: **112**
- निकटतम अस्पताल जाएं
- हेल्पलाइन पर कॉल करें:
  - वंद्रेवाला फाउंडेशन: **1860-2662-345** (24/7)
  - iCall: **9152987821**

आप महत्वपूर्ण हैं। कृपया किसी से मदद लें।`
    };

    return responses[language] || responses.en;
}

/**
 * Validate response safety before sending to user
 * @param {string} response - AI response
 * @param {string} originalQuery - User's original query
 * @returns {Object} Validation result
 */
function validateResponse(response, originalQuery) {
    const issues = [];

    // Check for potential harmful advice
    const harmfulPatterns = [
        /take\s+\d+\s*(pills?|tablets?|mg)/i,
        /don't\s+(see|visit|consult)\s+a?\s*doctor/i,
        /guaranteed\s+cure/i,
        /100%\s+effective/i
    ];

    harmfulPatterns.forEach(pattern => {
        if (pattern.test(response)) {
            issues.push('Potentially harmful advice detected');
        }
    });

    // Check if response addresses emergency properly
    const queryEmergency = checkEmergency(originalQuery);
    if (queryEmergency.isEmergency && !response.includes('emergency') && !response.includes('112')) {
        issues.push('Emergency not properly addressed');
    }

    return {
        isValid: issues.length === 0,
        issues,
        needsReview: issues.length > 0
    };
}

/**
 * Add safety wrapper to AI response
 * @param {string} response - Raw AI response
 * @param {string} query - Original user query
 * @param {string} language - Language code
 * @returns {Object} Safe response with metadata
 */
function wrapResponse(response, query, language = 'en') {
    const emergency = checkEmergency(query);

    // If emergency, return emergency response
    if (emergency.isEmergency) {
        return {
            text: getEmergencyResponse(language),
            isEmergency: true,
            originalResponse: response,
            metadata: {
                emergency: true,
                severity: emergency.severity,
                keywords: emergency.keywords
            }
        };
    }

    // Get appropriate disclaimer
    const disclaimer = getDisclaimer(query, language);

    // Validate response
    const validation = validateResponse(response, query);

    // Build final response
    let finalResponse = response;

    // Add disclaimer if health-related
    if (disclaimer.category !== 'general') {
        finalResponse = `${response}\n\n---\n${disclaimer.text}`;
    }

    return {
        text: finalResponse,
        isEmergency: false,
        hasDisclaimer: disclaimer.category !== 'general',
        metadata: {
            category: disclaimer.category,
            requiresProfessional: disclaimer.requiresProfessional,
            validationIssues: validation.issues
        }
    };
}

module.exports = {
    checkEmergency,
    requiresConsultation,
    getDisclaimer,
    getEmergencyResponse,
    validateResponse,
    wrapResponse,
    EMERGENCY_KEYWORDS,
    CONSULT_KEYWORDS
};
