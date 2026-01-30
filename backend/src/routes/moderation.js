/**
 * moderation.js - Moderation routes
 * Handles content moderation and flag management
 */

const express = require('express');
const router = express.Router();

const moderationController = require('../controllers/moderation.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { moderateValidation } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/moderate
 * @desc    Moderate text content
 * @access  Public (for testing) / Private in production
 */
router.post('/', moderateValidation, moderationController.moderateText);

/**
 * @route   GET /api/moderate/flags
 * @desc    Get moderation flags
 * @access  Admin
 */
router.get('/flags', authenticate, requireRole('admin'), moderationController.getFlags);

/**
 * @route   PUT /api/moderate/flags/:id
 * @desc    Review a flag
 * @access  Admin
 */
router.put('/flags/:id', authenticate, requireRole('admin'), moderationController.reviewFlag);

/**
 * @route   GET /api/moderate/stats
 * @desc    Get moderation statistics
 * @access  Admin
 */
router.get('/stats', authenticate, requireRole('admin'), moderationController.getStats);

/**
 * @route   POST /api/moderate/report
 * @desc    Submit user report
 * @access  Authenticated
 */
router.post('/report', authenticate, moderationController.submitReport);

module.exports = router;
