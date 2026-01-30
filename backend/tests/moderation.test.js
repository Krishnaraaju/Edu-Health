/**
 * moderation.test.js - Moderation service tests
 * Tests for keyword blocklist and moderation pipeline
 */

const { checkBlocklist, checkMedicalMisinformation, moderate } = require('../src/services/moderation.service');

describe('Moderation Service', () => {
    // ==================
    // Blocklist Tests
    // ==================

    describe('checkBlocklist', () => {
        it('should block severe content', () => {
            const result = checkBlocklist('How to make bomb at home');
            expect(result.blocked).toBe(true);
            expect(result.severity).toBe(10);
        });

        it('should flag moderate content', () => {
            const result = checkBlocklist('This miracle cure will heal everything');
            expect(result.blocked).toBe(true);
            expect(result.severity).toBe(7);
        });

        it('should flag spam content', () => {
            const result = checkBlocklist('Click here now to win money');
            expect(result.flagged).toBe(true);
            expect(result.severity).toBeGreaterThanOrEqual(5);
        });

        it('should allow normal content', () => {
            const result = checkBlocklist('What are the symptoms of a common cold?');
            expect(result.blocked).toBe(false);
            expect(result.severity).toBe(0);
        });
    });

    // ==================
    // Medical Misinformation Tests
    // ==================

    describe('checkMedicalMisinformation', () => {
        it('should flag anti-vaccine content', () => {
            const result = checkMedicalMisinformation('Vaccines cause autism in children');
            expect(result.flagged).toBe(true);
            expect(result.reasons).toContain('Anti-vaccine misinformation');
        });

        it('should flag COVID misinformation', () => {
            const result = checkMedicalMisinformation('Covid is just a hoax by the government');
            expect(result.flagged).toBe(true);
        });

        it('should flag unproven cure claims', () => {
            const result = checkMedicalMisinformation('You can cure cancer naturally with this herb');
            expect(result.flagged).toBe(true);
        });

        it('should allow legitimate health questions', () => {
            const result = checkMedicalMisinformation('What vaccines are recommended for children?');
            expect(result.flagged).toBe(false);
        });
    });

    // ==================
    // Full Pipeline Tests
    // ==================

    describe('moderate', () => {
        it('should deny severe content', async () => {
            const result = await moderate('How to kill yourself', { useLLM: false });
            expect(result.action).toBe('DENY');
        });

        it('should allow safe content', async () => {
            const result = await moderate('What is the recommended vaccination schedule?', { useLLM: false });
            expect(result.action).toBe('ALLOW');
        });

        it('should flag medical misinformation', async () => {
            const result = await moderate('Doctors hide this cure because it works naturally', { useLLM: false });
            expect(['FLAG', 'DENY']).toContain(result.action);
        });
    });
});
