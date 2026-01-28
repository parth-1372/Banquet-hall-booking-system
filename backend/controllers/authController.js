const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');
const env = require('../config/env');

/**
 * Generate JWT token
 */
const signToken = (id) => {
    return jwt.sign({ id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

/**
 * Create and send token via cookie
 */
const createSendToken = (user, statusCode, res, message = 'Success') => {
    const token = signToken(user._id);

    // Cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Cannot be accessed by client-side JS
        secure: env.isProduction(), // Only send over HTTPS in production
        sameSite: env.isProduction() ? 'strict' : 'lax',
    };

    // Set cookie
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        message,
        data: {
            user,
        },
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already registered', 400));
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        phone,
        password,
    });

    createSendToken(user, 201, res, 'Registration successful');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    createSendToken(user, 200, res, 'Login successful');
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res, next) => {
    // Clear the JWT cookie
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/auth/update-profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
    const { name, phone } = req.body;

    // Build update object (only allowed fields)
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
            user,
        },
    });
});

/**
 * @desc    Change password
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
        return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send new token
    createSendToken(user, 200, res, 'Password changed successfully');
});

module.exports = {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
};
