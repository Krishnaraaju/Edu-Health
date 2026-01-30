/**
 * content.js - Content management routes
 * CRUD operations for health and education content
 */

const express = require('express');
const router = express.Router();

const contentController = require('../controllers/content.controller');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth.middleware');
const { createContentValidation, updateContentValidation, contentQueryValidation } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/content
 * @desc    Get all content with filtering
 * @access  Public
 */
router.get('/', contentQueryValidation, contentController.getContent);

/**
 * @route   GET /api/content/pending
 * @desc    Get content pending moderation
 * @access  Admin/Curator
 */
router.get('/pending', authenticate, requireRole('admin', 'curator'), contentController.getPendingContent);

/**
 * @route   GET /api/content/:id
 * @desc    Get single content by ID
 * @access  Public
 */
router.get('/:id', contentController.getContentById);

/**
 * @route   POST /api/content
 * @desc    Create new content
 * @access  Admin/Curator
 */
router.post('/', authenticate, requireRole('admin', 'curator'), createContentValidation, contentController.createContent);

/**
 * @route   PUT /api/content/:id
 * @desc    Update content
 * @access  Admin/Curator (owner or admin)
 */
router.put('/:id', authenticate, requireRole('admin', 'curator'), updateContentValidation, contentController.updateContent);

/**
 * @route   DELETE /api/content/:id
 * @desc    Delete content
 * @access  Admin only
 */
router.delete('/:id', authenticate, requireRole('admin'), contentController.deleteContent);

/**
 * @route   POST /api/content/:id/like
 * @desc    Like content
 * @access  Authenticated
 */
router.post('/:id/like', authenticate, contentController.likeContent);

/**
 * @route   PUT /api/content/:id/moderate
 * @desc    Approve or reject content
 * @access  Admin only
 */
router.put('/:id/moderate', authenticate, requireRole('admin'), contentController.moderateContent);

/**
 * @route   GET /api/content/:id/translate
 * @desc    Get translation of content
 * @access  Public
 * @note    Implementation in Phase 5
 */
router.get('/:id/translate', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Translation endpoint - implementation coming in Phase 5'
    });
});

module.exports = router;
