const jwt = require('jsonwebtoken');

// Middleware to verify user is authenticated
const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token using JWT_SECRET
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('WARNING: JWT_SECRET is not set in environment variables!');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        
        const decoded = jwt.verify(token, secret);

        // Add user from payload to request object
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};

// Middleware to verify user has admin role
const adminOnly = (req, res, next) => {
    // First verify user is authenticated
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token using JWT_SECRET
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('WARNING: JWT_SECRET is not set in environment variables!');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        
        const decoded = jwt.verify(token, secret);

        // Check if user has admin role
        if (decoded.role !== 'ROLE_ADMIN') {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action. Only admins can access this resource.',
                error: 'INSUFFICIENT_PERMISSIONS',
                requiredRole: 'ROLE_ADMIN',
                currentUserRole: decoded.role
            });
        }

        // Add user from payload to request object
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};

// Middleware for role-based access control
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            // Verify token using JWT_SECRET
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error('WARNING: JWT_SECRET is not set in environment variables!');
                return res.status(500).json({ message: 'Server configuration error' });
            }
            
            const decoded = jwt.verify(token, secret);

            // Check if user has required role
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    message: 'You do not have permission to perform this action.',
                    error: 'INSUFFICIENT_PERMISSIONS',
                    requiredRoles: allowedRoles,
                    currentUserRole: decoded.role
                });
            }

            // Add user from payload to request object
            req.user = decoded;
            next();
        } catch (err) {
            console.error('Token verification error:', err.message);
            res.status(401).json({ message: 'Token is not valid', error: err.message });
        }
    };
};

// Log CRUD operations for audit
const logCrudOperation = (operation, resource) => {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const auditLog = {
                    admin_id: req.user?.id || req.user?.user_id,
                    action: `${operation}_${resource}`,
                    timestamp: new Date(),
                    details: {
                        endpoint: req.originalUrl,
                        method: req.method,
                        userRole: req.user?.role,
                        requestData: req.body,
                        params: req.params
                    }
                };
                
                // Log to console (in production, this would go to database)
                console.log('CRUD AUDIT LOG:', JSON.stringify(auditLog, null, 2));
                
                // TODO: Save to database audit table
                // This would be implemented with actual database logging
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

module.exports = {
    authMiddleware,
    adminOnly,
    checkRole,
    logCrudOperation
};
