/**
 * safety.test.js - Tests for AI safety service
 */

const {
    checkEmergency,
    requiresConsultation,
    getDisclaimer,
    getEmergencyResponse,
    validateResponse,
    wrapResponse
} = require('../src/services/safety.service');

describe('Safety Service', () => {
    describe('checkEmergency', () => {
        test('detects suicide-related keywords', () => {
            const result = checkEmergency('I want to kill myself');
            expect(result.isEmergency).toBe(true);
            expect(result.keywords).toContain('kill myself');
        });

        test('detects medical emergency keywords', () => {
            const result = checkEmergency('I think I am having a heart attack');
            expect(result.isEmergency).toBe(true);
            expect(result.keywords).toContain('heart attack');
        });

        test('returns false for non-emergency', () => {
            const result = checkEmergency('What are some healthy foods?');
            expect(result.isEmergency).toBe(false);
        });

        test('handles empty input', () => {
            const result = checkEmergency('');
            expect(result.isEmergency).toBe(false);
        });

        test('handles null input', () => {
            const result = checkEmergency(null);
            expect(result.isEmergency).toBe(false);
        });

        test('detects multiple emergency keywords', () => {
            const result = checkEmergency('chest pain and I can\'t breathe');
            expect(result.isEmergency).toBe(true);
            expect(result.severity).toBe('high');
        });
    });

    describe('requiresConsultation', () => {
        test('returns true for pregnancy', () => {
            expect(requiresConsultation('I am pregnant and feeling dizzy')).toBe(true);
        });

        test('returns true for medication queries', () => {
            expect(requiresConsultation('What is the right medication dosage?')).toBe(true);
        });

        test('returns false for general health', () => {
            expect(requiresConsultation('How to eat healthy?')).toBe(false);
        });
    });

    describe('getDisclaimer', () => {
        test('returns medical disclaimer for symptom queries', () => {
            const result = getDisclaimer('What are the symptoms of diabetes?', 'en');
            expect(result.category).toBe('medical');
            expect(result.requiresProfessional).toBe(true);
        });

        test('returns mental health disclaimer', () => {
            const result = getDisclaimer('I am feeling very anxious', 'en');
            expect(result.category).toBe('mental');
        });

        test('returns Hindi disclaimer when specified', () => {
            const result = getDisclaimer('What is treatment for cold?', 'hi');
            expect(result.text).toContain('चिकित्सा सलाह');
        });

        test('returns general disclaimer for wellness queries', () => {
            const result = getDisclaimer('How to exercise regularly?', 'en');
            expect(result.category).toBe('general');
        });
    });

    describe('getEmergencyResponse', () => {
        test('returns English emergency response', () => {
            const result = getEmergencyResponse('en');
            expect(result).toContain('112');
            expect(result).toContain('emergency');
        });

        test('returns Hindi emergency response', () => {
            const result = getEmergencyResponse('hi');
            expect(result).toContain('112');
            expect(result).toContain('आपातकालीन');
        });
    });

    describe('validateResponse', () => {
        test('flags potentially harmful medication advice', () => {
            const result = validateResponse('Take 10 pills of aspirin', 'headache');
            expect(result.isValid).toBe(false);
            expect(result.issues.length).toBeGreaterThan(0);
        });

        test('passes valid response', () => {
            const result = validateResponse(
                'Drinking water and resting can help with headaches. If pain persists, consult a doctor.',
                'headache'
            );
            expect(result.isValid).toBe(true);
        });

        test('flags response ignoring emergency', () => {
            const result = validateResponse(
                'Here are some relaxation tips.',
                'I want to kill myself'
            );
            expect(result.isValid).toBe(false);
        });
    });

    describe('wrapResponse', () => {
        test('returns emergency response for crisis', () => {
            const result = wrapResponse('Some response', 'I want to end my life', 'en');
            expect(result.isEmergency).toBe(true);
            expect(result.text).toContain('emergency');
        });

        test('adds disclaimer for health queries', () => {
            const result = wrapResponse(
                'Vitamin C is important for immunity.',
                'How to treat a cold?',
                'en'
            );
            expect(result.hasDisclaimer).toBe(true);
        });

        test('preserves original response in metadata', () => {
            const original = 'Original response text';
            const result = wrapResponse(original, 'emergency help', 'en');
            expect(result.originalResponse).toBe(original);
        });
    });
});
