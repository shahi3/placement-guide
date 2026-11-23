const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        req.user = jwt.verify(token, process.env.JWT_SECRETE_KEY);
        next();
    } catch (error) {
        // 401 (not 400) so the frontend knows it must log in again
        const message = error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token';
        res.status(401).json({ success: false, message });
    }
};

// Run AFTER authMiddleware on any route only admins should reach.
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

module.exports = authMiddleware;
module.exports.requireAdmin = requireAdmin;
