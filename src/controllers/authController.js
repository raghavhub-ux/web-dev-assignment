const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    if (username.trim().length < 2 || username.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 2 and 30 characters',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email.toLowerCase().trim()
            ? 'Email is already registered'
            : 'Username is already taken',
      });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user & create database-backed session
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate random 64-character hex bearer token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // SHA-256 hash stored in MongoDB
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token valid for 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
      tokenHash,
      user: user._id,
      expiresAt,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: rawToken,
      data: {
        token: rawToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & revoke bearer token session
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Delete session from database
    await Session.findByIdAndDelete(req.session._id);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Session revoked.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
