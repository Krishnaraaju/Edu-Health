/**
 * auth.controller.js - Authentication business logic
 * Handles user registration, login, token refresh, and profile management
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth.middleware');
const { ApiError, asyncHandler } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, preferences } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.badRequest('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (role defaults to 'user', ignore role if trying to set admin)
    const userRole = role === 'curator' ? 'curator' : 'user';

    const user = await User.create({
        name,
        email,
        passwordHash,
        role: userRole,
        preferences: preferences || {}
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: user.toSafeObject(),
            accessToken,
            refreshToken
        }
    });
});

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
        throw ApiError.unauthorized('Account is deactivated');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: user.toSafeObject(),
            accessToken,
            refreshToken
        }
    });
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw ApiError.badRequest('Refresh token required');
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'refresh') {
            throw ApiError.unauthorized('Invalid token type');
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw ApiError.unauthorized('User not found or inactive');
        }

        const newAccessToken = generateAccessToken(user);

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.toSafeObject()
        }
    });
});

/**
 * Update user profile
 * @route PUT /api/auth/me
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { name, preferences, consentGiven } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (preferences) {
        user.preferences = { ...user.preferences.toObject(), ...preferences };
    }
    if (typeof consentGiven === 'boolean') {
        user.consentGiven = consentGiven;
        if (consentGiven) {
            user.consentDate = new Date();
        }
    }

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated',
        data: {
            user: user.toSafeObject()
        }
    });
});

/**
 * Update user preferences
 * @route PUT /api/auth/preferences
 */
const updatePreferences = asyncHandler(async (req, res) => {
    const { topics, languages, voiceEnabled } = req.body.preferences || req.body;
    const user = req.user;

    if (topics) user.preferences.topics = topics;
    if (languages) user.preferences.languages = languages;
    if (typeof voiceEnabled === 'boolean') {
        user.preferences.voiceEnabled = voiceEnabled;
    }

    await user.save();

    res.json({
        success: true,
        message: 'Preferences updated',
        data: {
            preferences: user.preferences
        }
    });
});

/**
 * Logout (client-side token removal, but log the event)
 * @route POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
    // In a production app, you might want to:
    // 1. Add the token to a blacklist
    // 2. Clear refresh tokens from database
    // For now, we just acknowledge the logout
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    updatePreferences,
    logout
};
