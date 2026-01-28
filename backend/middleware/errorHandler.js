const env = require('../config/env');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle Cast Error (Invalid MongoDB ObjectId)
 */
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Handle Duplicate Field Error
 */
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value.`;
    return new AppError(message, 400);
};

/**
 * Handle Validation Error
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Handle JWT Error
 */
const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again.', 401);

/**
 * Handle Zod Validation Error
 */
const handleZodError = (err) => {
    const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    const message = `Validation failed. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Send Error Response in Development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

/**
 * Send Error Response in Production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Normalize error for shared processing
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types to ensure human-readable 'message'
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'ZodError' || err.constructor.name === 'ZodError') error = handleZodError(err);

    if (env.isDevelopment()) {
        // In development, we still send the full error but with the cleaned message
        res.status(error.statusCode).json({
            status: error.status,
            error: error,
            message: error.message,
            stack: err.stack,
        });
    } else {
        sendErrorProd(error, res);
    }
};

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
};
