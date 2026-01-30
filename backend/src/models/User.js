/**
 * User.js - Mongoose model for users
 * Handles authentication, roles (user/curator/admin), and personalization preferences
 */

const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
    topics: {
        type: [String],
        enum: ['health', 'education', 'nutrition', 'mental-health', 'fitness', 'vaccination', 'first-aid'],
        default: ['health', 'education']
    },
    languages: {
        type: [String],
        enum: ['en', 'hi'],
        default: ['en']
    },
    voiceEnabled: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        select: false // Don't include in queries by default
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'curator', 'admin'],
            message: 'Role must be user, curator, or admin'
        },
        default: 'user'
    },
    preferences: {
        type: preferencesSchema,
        default: () => ({})
    },
    // Privacy & consent tracking
    consentGiven: {
        type: Boolean,
        default: false
    },
    consentDate: {
        type: Date
    },
    dataRetentionDays: {
        type: Number,
        default: 30 // Chat logs retained for 30 days by default
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: {
        transform: function (doc, ret) {
            delete ret.passwordHash;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Instance method to check if user has required role
userSchema.methods.hasRole = function (requiredRoles) {
    if (typeof requiredRoles === 'string') {
        return this.role === requiredRoles;
    }
    return requiredRoles.includes(this.role);
};

// Instance method to get safe user data (no sensitive info)
userSchema.methods.toSafeObject = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        preferences: this.preferences,
        createdAt: this.createdAt
    };
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+passwordHash');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
