const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        phone: {
            type: String,
            required: [true, 'Please provide your phone number'],
            trim: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.CUSTOMER,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for faster queries
userSchema.index({ role: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only run if password was modified
    if (!this.isModified('password')) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Update passwordChangedAt for password changes (not new users)
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for token timing
    }

    next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password changed after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Static method to find active users
userSchema.statics.findActive = function () {
    return this.find({ isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
