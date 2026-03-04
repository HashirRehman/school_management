/**
 * Centralized error handler
 * Prevents internal error leakage and maps errors to proper HTTP status codes
 */

const handleError = (err, req, res) => {
    // Log error for debugging (in production, use proper logging)
    console.error('Error:', err);

    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let errors = [];

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        errors = Object.values(err.errors).map(e => e.message);
    }
    // Mongoose duplicate key error
    else if (err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate entry';
        const field = Object.keys(err.keyPattern)[0];
        errors = [`${field} already exists`];
    }
    // Mongoose cast error (invalid ObjectId)
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        errors = ['Invalid ID provided'];
    }
    // JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        errors = ['Token is invalid'];
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        errors = ['Token has expired'];
    }
    // Custom application errors
    else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message || message;
        errors = err.errors || [message];
    }
    // Express validation errors
    else if (err.array && typeof err.array === 'function') {
        statusCode = 400;
        message = 'Validation error';
        errors = err.array().map(e => e.msg);
    }

    // Don't leak internal errors in production
    if (process.env.ENV === 'production' && statusCode === 500) {
        message = 'Internal server error';
        errors = ['An unexpected error occurred'];
    }

    return res.status(statusCode).json({
        ok: false,
        code: statusCode,
        message,
        errors: errors.length > 0 ? errors : [message]
    });
};

module.exports = {
    handleError
};
