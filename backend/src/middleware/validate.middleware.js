/**
 * validate.middleware.js - Request validation using express-validator
 * Provides reusable validation schemas and error handling
 */

const { validationResult, body, param, query } = require('express-validator');

/**
 * Handle validation errors from express-validator
 * @middleware
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

// ==================
// Auth Validations
// ==================

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    body('role')
        .optional()
        .isIn(['user', 'curator']).withMessage('Invalid role'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// ==================
// Content Validations
// ==================

const createContentValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('bodyMarkdown')
        .notEmpty().withMessage('Body content is required')
        .isLength({ min: 10 }).withMessage('Body must be at least 10 characters'),
    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['education', 'health']).withMessage('Type must be education or health'),
    body('language')
        .notEmpty().withMessage('Language is required')
        .isIn(['en', 'hi']).withMessage('Language must be en or hi'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
    body('sourceUrl')
        .optional()
        .isURL().withMessage('Invalid source URL'),
    handleValidationErrors
];

const updateContentValidation = [
    param('id')
        .isMongoId().withMessage('Invalid content ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('bodyMarkdown')
        .optional()
        .isLength({ min: 10 }).withMessage('Body must be at least 10 characters'),
    body('type')
        .optional()
        .isIn(['education', 'health']).withMessage('Type must be education or health'),
    body('language')
        .optional()
        .isIn(['en', 'hi']).withMessage('Language must be en or hi'),
    handleValidationErrors
];

// ==================
// Chat Validations
// ==================

const chatValidation = [
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 2000 }).withMessage('Message too long (max 2000 characters)'),
    body('conversationId')
        .optional()
        .isMongoId().withMessage('Invalid conversation ID'),
    body('context')
        .optional()
        .isObject().withMessage('Context must be an object'),
    handleValidationErrors
];

// ==================
// Moderation Validations
// ==================

const moderateValidation = [
    body('text')
        .trim()
        .notEmpty().withMessage('Text is required')
        .isLength({ max: 5000 }).withMessage('Text too long (max 5000 characters)'),
    handleValidationErrors
];

// ==================
// Query Validations
// ==================

const contentQueryValidation = [
    query('lang')
        .optional()
        .isIn(['en', 'hi']).withMessage('Language must be en or hi'),
    query('type')
        .optional()
        .isIn(['education', 'health']).withMessage('Type must be education or health'),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
];

const preferencesValidation = [
    body('preferences.topics')
        .optional()
        .isArray().withMessage('Topics must be an array'),
    body('preferences.languages')
        .optional()
        .isArray().withMessage('Languages must be an array'),
    body('preferences.voiceEnabled')
        .optional()
        .isBoolean().withMessage('voiceEnabled must be a boolean'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    createContentValidation,
    updateContentValidation,
    chatValidation,
    moderateValidation,
    contentQueryValidation,
    preferencesValidation
};
