/**
 * index.js - Express server bootstrap
 * Main entry point for the Healthcare API backend
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const feedRoutes = require('./routes/feed');
const chatRoutes = require('./routes/chat');
const moderationRoutes = require('./routes/moderation');

// Import error handling middleware
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===================
// Middleware Setup
// ===================

// Trust proxy (required for Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration - allow frontend origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:19006',
    'https://edu-health-sigma.vercel.app',
    // Allow all Vercel preview deployments
    /\.vercel\.app$/
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed list
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now, restrict in production
        }
    },
    credentials: true
}));

// Request logging (mask PII in production)
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        skip: (req, res) => res.statusCode < 400
    }));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // Increased for production
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/health'
});
app.use(globalLimiter);

// ===================
// Health Check
// ===================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

// ===================
// API Routes
// ===================

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/moderate', moderationRoutes);

// Legacy route aliases
app.use('/api/users/me', (req, res, next) => {
    req.url = '/me';
    authRoutes(req, res, next);
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Healthcare Assistant API',
        version: '1.0.0',
        description: 'Privacy-first Health & Education Assistant',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                preferences: 'PUT /api/auth/preferences'
            },
            content: {
                list: 'GET /api/content',
                get: 'GET /api/content/:id',
                create: 'POST /api/content',
                update: 'PUT /api/content/:id',
                delete: 'DELETE /api/content/:id'
            },
            feed: {
                personalized: 'GET /api/feed',
                trending: 'GET /api/feed/trending',
                recent: 'GET /api/feed/recent'
            },
            chat: {
                send: 'POST /api/chat',
                history: 'GET /api/chat',
                conversation: 'GET /api/chat/:id',
                emergency: 'POST /api/chat/emergency'
            },
            moderation: {
                check: 'POST /api/moderate',
                report: 'POST /api/moderate/report'
            }
        }
    });
});

// ===================
// Error Handling
// ===================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===================
// Database Connection & Server Start
// ===================

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════╗
║  🏥 Healthcare Assistant API                       ║
║  ─────────────────────────────────────────────     ║
║  Environment: ${NODE_ENV.padEnd(35)}║
║  Port: ${PORT.toString().padEnd(42)}║
║  MongoDB: Connected                                ║
║  ─────────────────────────────────────────────     ║
║  API: http://localhost:${PORT}/api${' '.repeat(22)}║
║  Health: http://localhost:${PORT}/health${' '.repeat(18)}║
╚════════════════════════════════════════════════════╝

📚 Available Routes:
  POST   /api/auth/register     - Register new user
  POST   /api/auth/login        - Login user
  GET    /api/auth/me           - Get profile
  PUT    /api/auth/preferences  - Update preferences
  
  GET    /api/content           - List content
  GET    /api/content/:id       - Get content
  POST   /api/content           - Create content (admin/curator)
  
  GET    /api/feed              - Personalized feed
  GET    /api/feed/trending     - Trending content
  
  POST   /api/chat              - Send message
  GET    /api/chat              - Get conversations
  
  POST   /api/moderate          - Check moderation
    `);
    });
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app; // Export for testing
