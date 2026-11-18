const crypto = require('crypto');
const Session = require('../models/Session');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required. Format: Bearer <token>',
      });
    }

    const rawToken = authHeader.split(' ')[1];
    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: 'Bearer token missing from Authorization header',
      });
    }

    // Hash the raw token using SHA-256 to compare with the stored session
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Find active non-expired session
    const session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Retrieve authenticated user
    const user = await User.findById(session.user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this session no longer exists',
      });
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    req.token = rawToken;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAuth;
