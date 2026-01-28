const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');
const asyncHandler = require('./asyncHandler');
const env = require('../config/env');

/**
 * Protect routes - Verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1) Get token from cookie or authorization header
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in. Please log in to get access.', 401)
        );
    }

    // 2) Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired. Please log in again.', 401));
        }
        return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token no longer exists.', 401)
        );
    }

    // 4) Check if user is active
    if (!currentUser.isActive) {
        return next(
            new AppError('Your account has been deactivated. Please contact support.', 401)
        );
    }

    // 5) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password. Please log in again.', 401)
        );
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
});

/**
 * Authorize roles - Restrict access to certain roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action.', 403)
            );
        }
        next();
    };
};

/**
 * Optional auth - Attach user if token exists, but don't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            const currentUser = await User.findById(decoded.id);

            if (currentUser && currentUser.isActive && !currentUser.changedPasswordAfter(decoded.iat)) {
                req.user = currentUser;
            }
        } catch (error) {
            // Token invalid or expired - just continue without user
        }
    }

    next();
});

module.exports = {
    protect,
    authorize,
    optionalAuth,
};
