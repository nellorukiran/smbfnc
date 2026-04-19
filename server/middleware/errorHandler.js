// Global error handler for authorization and other errors
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Handle authorization errors
    if (err.error === 'INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
            message: err.message || 'You do not have permission to perform this action.',
            error: 'INSUFFICIENT_PERMISSIONS',
            requiredRole: err.requiredRole,
            currentUserRole: err.currentUserRole,
            timestamp: new Date().toISOString()
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token. Please log in again.',
            error: 'INVALID_TOKEN',
            timestamp: new Date().toISOString()
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired. Please log in again.',
            error: 'TOKEN_EXPIRED',
            timestamp: new Date().toISOString()
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
            details: err.details,
            timestamp: new Date().toISOString()
        });
    }

    // Handle database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            message: 'Duplicate entry. This record already exists.',
            error: 'DUPLICATE_ENTRY',
            timestamp: new Date().toISOString()
        });
    }

    if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
            message: 'Database table not found. Please contact administrator.',
            error: 'DATABASE_ERROR',
            timestamp: new Date().toISOString()
        });
    }

    // Default error handler
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        message,
        error: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Custom error class for authorization errors
class AuthorizationError extends Error {
    constructor(message, requiredRole, currentUserRole) {
        super(message);
        this.name = 'AuthorizationError';
        this.error = 'INSUFFICIENT_PERMISSIONS';
        this.requiredRole = requiredRole;
        this.currentUserRole = currentUserRole;
        this.statusCode = 403;
    }
}

// Custom error class for validation errors
class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ValidationError';
        this.error = 'VALIDATION_ERROR';
        this.details = details;
        this.statusCode = 400;
    }
}

module.exports = {
    errorHandler,
    AuthorizationError,
    ValidationError
};
