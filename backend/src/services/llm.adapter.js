/**
 * llm.adapter.js - LLM integration adapter
 * Provides unified interface for local and remote LLM providers
 */

const axios = require('axios');

/**
 * Health-aware assistant system prompt
 */
const SYSTEM_PROMPTS = {
    assistant: `You are a concise, cautious health & education assistant. Always include a short safety disclaimer for health-related queries. If the user asks for medical advice beyond general information, advise consulting a qualified professional and provide emergency contacts when indicated. Cite sources if available. Use simple language for non-specialists.

IMPORTANT RULES:
1. Never diagnose medical conditions
2. Always recommend professional consultation for health concerns
3. For emergencies, immediately advise calling emergency services
4. Provide factual, evidence-based information only
5. Acknowledge limitations in your knowledge`,

    moderation: `Classify the following text into one of: ALLOW, FLAG, DENY.
Return ONLY valid JSON: {"action":"ALLOW"|"FLAG"|"DENY","reasons":["..."],"severity":0-10}

Classification guidelines:
- ALLOW: Safe, appropriate content
- FLAG: Potentially concerning, needs human review
- DENY: Harmful, dangerous, or inappropriate content

Consider: hate speech, violence, self-harm, medical misinformation, spam.`,

    summarization: `Summarize the content into 3 bullet points in non-technical language. Be concise and focus on key takeaways.`
};

/**
 * Health disclaimer to append to health-related responses
 */
const HEALTH_DISCLAIMER = `

⚠️ **Health Disclaimer**: This information is for educational purposes only and should not replace professional medical advice. Please consult a qualified healthcare provider for any health concerns.`;

/**
 * Emergency escalation message
 */
const EMERGENCY_MESSAGE = `

🚨 **EMERGENCY**: If you or someone else is in immediate danger, please call emergency services immediately:
- India: 112 (Emergency) | 108 (Ambulance)
- For mental health crisis: iCall - 9152987821`;

/**
 * Build user prompt with metadata
 * @param {string} message - User's message
 * @param {Object} options - Additional options
 * @returns {string} Formatted prompt
 */
const buildUserPrompt = (message, options = {}) => {
    const { lang = 'en', prefs = {}, context = '' } = options;

    const prefsJson = JSON.stringify({
        topics: prefs.topics || [],
        voiceEnabled: prefs.voiceEnabled || false
    });

    return `[METADATA: lang=${lang}, user_prefs=${prefsJson}, context=${context}]
USER: ${message}
INSTRUCTIONS: Answer concisely. If the message appears to be an emergency, instruct user to seek immediate care. If content is beyond general info, refuse and suggest professional consultation.`;
};

/**
 * Detect if message is health-related
 * @param {string} message - User message
 * @returns {boolean}
 */
const isHealthRelated = (message) => {
    const healthKeywords = [
        'health', 'medical', 'doctor', 'medicine', 'symptom', 'disease', 'illness',
        'pain', 'treatment', 'diagnosis', 'hospital', 'sick', 'fever', 'infection',
        'स्वास्थ्य', 'डॉक्टर', 'दवा', 'बीमारी', 'इलाज', 'दर्द', 'बुखार'
    ];
    const lowerMessage = message.toLowerCase();
    return healthKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Detect emergency keywords
 * @param {string} message - User message
 * @returns {boolean}
 */
const isEmergency = (message) => {
    const emergencyKeywords = [
        'suicide', 'kill myself', 'want to die', 'end my life',
        'heart attack', 'stroke', 'can\'t breathe', 'severe bleeding',
        'unconscious', 'overdose', 'emergency',
        'आत्महत्या', 'मरना चाहता', 'दिल का दौरा', 'सांस नहीं'
    ];
    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Call remote LLM API (OpenAI compatible)
 * @param {string} prompt - User prompt
 * @param {Object} options - API options
 * @returns {Promise<string>} LLM response
 */
const callRemoteLLM = async (prompt, options = {}) => {
    const {
        systemPrompt = SYSTEM_PROMPTS.assistant,
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens = 500,
        temperature = 0.7
    } = options;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
        throw new Error('OpenAI API key not configured');
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                max_tokens: maxTokens,
                temperature
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Remote LLM error:', error.response?.data || error.message);
        throw new Error('Failed to get response from LLM');
    }
};

/**
 * Call local LLM (placeholder for on-device model)
 * @param {string} prompt - User prompt
 * @param {Object} options - Options
 * @returns {Promise<string>} LLM response
 */
const callLocalLLM = async (prompt, options = {}) => {
    const endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:8080/v1/chat/completions';

    // Check if local LLM is enabled
    if (process.env.LOCAL_LLM_ENABLED !== 'true') {
        throw new Error('Local LLM not enabled');
    }

    try {
        const response = await axios.post(
            endpoint,
            {
                messages: [
                    { role: 'system', content: options.systemPrompt || SYSTEM_PROMPTS.assistant },
                    { role: 'user', content: prompt }
                ],
                max_tokens: options.maxTokens || 500
            },
            { timeout: 60000 }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Local LLM error:', error.message);
        throw new Error('Failed to get response from local LLM');
    }
};

/**
 * Main LLM call function with fallback
 * @param {string} prompt - User prompt
 * @param {Object} options - Options including provider preference
 * @returns {Promise<Object>} Response with text and metadata
 */
const callLLM = async (prompt, options = {}) => {
    const { provider = process.env.LLM_PROVIDER || 'openai', userMessage = '' } = options;

    let response;
    let usedProvider;

    // Try local first if enabled
    if (provider === 'local' || process.env.LOCAL_LLM_ENABLED === 'true') {
        try {
            response = await callLocalLLM(prompt, options);
            usedProvider = 'local';
        } catch (error) {
            console.log('Local LLM unavailable, falling back to remote');
        }
    }

    // Fall back to remote
    if (!response) {
        try {
            response = await callRemoteLLM(prompt, options);
            usedProvider = 'remote';
        } catch (error) {
            // Return fallback response if all LLMs fail
            return {
                text: "I apologize, but I'm unable to process your request at the moment. Please try again later or consult a healthcare professional for health-related questions.",
                provider: 'fallback',
                hasDisclaimer: true,
                isEmergency: false
            };
        }
    }

    // Check for health content and emergencies
    const emergency = isEmergency(userMessage);
    const healthRelated = isHealthRelated(userMessage);

    // Append appropriate disclaimers
    let finalResponse = response;
    if (emergency) {
        finalResponse = EMERGENCY_MESSAGE + '\n\n' + response;
    } else if (healthRelated) {
        finalResponse = response + HEALTH_DISCLAIMER;
    }

    return {
        text: finalResponse,
        provider: usedProvider,
        hasDisclaimer: healthRelated || emergency,
        isEmergency: emergency
    };
};

/**
 * Moderation check using LLM
 * @param {string} text - Text to moderate
 * @returns {Promise<Object>} Moderation result
 */
const moderateWithLLM = async (text) => {
    try {
        const response = await callRemoteLLM(text, {
            systemPrompt: SYSTEM_PROMPTS.moderation,
            temperature: 0.1,
            maxTokens: 100
        });

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Default to allow if parsing fails
        return { action: 'ALLOW', reasons: [], severity: 0 };
    } catch (error) {
        console.error('LLM moderation error:', error);
        // Default to flag for manual review on error
        return { action: 'FLAG', reasons: ['LLM moderation unavailable'], severity: 5 };
    }
};

module.exports = {
    callLLM,
    callRemoteLLM,
    callLocalLLM,
    moderateWithLLM,
    buildUserPrompt,
    isHealthRelated,
    isEmergency,
    SYSTEM_PROMPTS,
    HEALTH_DISCLAIMER,
    EMERGENCY_MESSAGE
};
