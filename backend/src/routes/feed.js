/**
 * feed.js - Personalized feed routes
 * Delivers content based on user preferences
 */

const express = require('express');
const router = express.Router();

const feedController = require('../controllers/feed.controller');
const { optionalAuth, authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/feed
 * @desc    Get personalized feed
 * @access  Public (enhanced with auth)
 */
router.get('/', optionalAuth, feedController.getFeed);

/**
 * @route   GET /api/feed/trending
 * @desc    Get trending content
 * @access  Public
 */
router.get('/trending', feedController.getTrending);

/**
 * @route   GET /api/feed/recent
 * @desc    Get recent content
 * @access  Public
 */
router.get('/recent', feedController.getRecent);

module.exports = router;
