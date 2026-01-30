/**
 * setup.js - Jest test setup
 * Configures test environment variables
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/healthcare_test';
process.env.MODERATION_ENABLED = 'false';
process.env.LOCAL_LLM_ENABLED = 'false';

// Increase timeout for database operations
jest.setTimeout(30000);

// Suppress console logs during tests
if (process.env.SUPPRESS_LOGS === 'true') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    };
}
