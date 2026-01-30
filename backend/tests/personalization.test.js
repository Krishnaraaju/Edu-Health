/**
 * personalization.test.js - Tests for personalization service
 */

const {
    calculateContentScore,
    personalizeContent,
    buildInterestProfile,
    mergePreferences
} = require('../src/services/personalization.service');

describe('Personalization Service', () => {
    describe('calculateContentScore', () => {
        const baseContent = {
            type: 'health',
            tags: ['nutrition', 'wellness'],
            language: 'en',
            verified: true,
            createdAt: new Date(),
            metrics: { likes: 50, views: 200 },
            summary: 'Test summary',
            bodyMarkdown: 'Test body',
            sourceUrl: 'https://example.com'
        };

        test('returns higher score for matching topics', () => {
            const prefs = { topics: ['health', 'nutrition'] };
            const score = calculateContentScore(baseContent, prefs);
            expect(score).toBeGreaterThan(70);
        });

        test('returns lower score for non-matching topics', () => {
            const prefs = { topics: ['fitness', 'yoga'] };
            const score = calculateContentScore(baseContent, prefs);
            expect(score).toBeLessThan(70);
        });

        test('boosts score for matching language', () => {
            const prefsMatch = { languages: ['en'] };
            const prefsNoMatch = { languages: ['hi'] };

            const scoreMatch = calculateContentScore(baseContent, prefsMatch);
            const scoreNoMatch = calculateContentScore(baseContent, prefsNoMatch);

            expect(scoreMatch).toBeGreaterThan(scoreNoMatch);
        });

        test('boosts score for verified content', () => {
            const verifiedContent = { ...baseContent, verified: true };
            const unverifiedContent = { ...baseContent, verified: false };

            const verifiedScore = calculateContentScore(verifiedContent, {});
            const unverifiedScore = calculateContentScore(unverifiedContent, {});

            expect(verifiedScore).toBeGreaterThan(unverifiedScore);
        });

        test('boosts score for recent content', () => {
            const recentContent = { ...baseContent, createdAt: new Date() };
            const oldContent = {
                ...baseContent,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            };

            const recentScore = calculateContentScore(recentContent, {});
            const oldScore = calculateContentScore(oldContent, {});

            expect(recentScore).toBeGreaterThan(oldScore);
        });

        test('returns score between 0 and 100', () => {
            const score = calculateContentScore(baseContent, {
                topics: ['health'],
                languages: ['en']
            });
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('personalizeContent', () => {
        const contents = [
            { _id: '1', type: 'health', tags: ['nutrition'], language: 'en', verified: true },
            { _id: '2', type: 'education', tags: ['science'], language: 'en', verified: false },
            { _id: '3', type: 'health', tags: ['fitness'], language: 'hi', verified: true }
        ];

        test('sorts content by score', () => {
            const prefs = { topics: ['health'], languages: ['en'] };
            const result = personalizeContent(contents, prefs);

            expect(result[0]._id).toBe('1'); // Best match
        });

        test('respects limit option', () => {
            const result = personalizeContent(contents, {}, { limit: 2 });
            expect(result.length).toBe(2);
        });

        test('filters by minimum score', () => {
            const result = personalizeContent(contents, { topics: ['yoga'] }, { minScore: 60 });
            // Most should be filtered out due to low score
            expect(result.length).toBeLessThan(contents.length);
        });

        test('adds personalizationScore to results', () => {
            const result = personalizeContent(contents, { topics: ['health'] });
            expect(result[0]).toHaveProperty('personalizationScore');
        });
    });

    describe('buildInterestProfile', () => {
        const interactions = [
            { contentType: 'health', tags: ['nutrition', 'diet'], language: 'en' },
            { contentType: 'health', tags: ['nutrition'], language: 'en' },
            { contentType: 'education', tags: ['science'], language: 'hi' }
        ];

        test('identifies top topics from interactions', () => {
            const profile = buildInterestProfile(interactions);
            expect(profile.topics).toContain('health');
            expect(profile.topics).toContain('nutrition');
        });

        test('identifies language preferences', () => {
            const profile = buildInterestProfile(interactions);
            expect(profile.languages[0]).toBe('en'); // Most common
        });

        test('limits topics to top 10', () => {
            const manyInteractions = Array(20).fill(null).map((_, i) => ({
                contentType: `topic${i}`,
                tags: [`tag${i}`],
                language: 'en'
            }));
            const profile = buildInterestProfile(manyInteractions);
            expect(profile.topics.length).toBeLessThanOrEqual(10);
        });

        test('includes timestamp', () => {
            const profile = buildInterestProfile(interactions);
            expect(profile.lastUpdated).toBeDefined();
        });
    });

    describe('mergePreferences', () => {
        test('prioritizes explicit preferences', () => {
            const explicit = { topics: ['health'], languages: ['en'] };
            const inferred = { topics: ['fitness', 'yoga'], languages: ['hi'] };

            const merged = mergePreferences(explicit, inferred);

            expect(merged.topics[0]).toBe('health');
            expect(merged.languages).toEqual(['en']);
        });

        test('adds inferred topics after explicit', () => {
            const explicit = { topics: ['health'] };
            const inferred = { topics: ['fitness', 'yoga'] };

            const merged = mergePreferences(explicit, inferred);

            expect(merged.topics).toContain('health');
            expect(merged.topics).toContain('fitness');
        });

        test('removes duplicate topics', () => {
            const explicit = { topics: ['health', 'fitness'] };
            const inferred = { topics: ['fitness', 'health', 'yoga'] };

            const merged = mergePreferences(explicit, inferred);
            const healthCount = merged.topics.filter(t => t === 'health').length;

            expect(healthCount).toBe(1);
        });

        test('limits merged topics to 15', () => {
            const explicit = { topics: Array(10).fill(null).map((_, i) => `topic${i}`) };
            const inferred = { topics: Array(10).fill(null).map((_, i) => `inferred${i}`) };

            const merged = mergePreferences(explicit, inferred);

            expect(merged.topics.length).toBeLessThanOrEqual(15);
        });
    });
});
