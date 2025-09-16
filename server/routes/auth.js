const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Local registration
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Local login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Guest login (creates temporary user)
router.post('/guest', async (req, res) => {
  try {
    const guestUser = new User({
      username: `Guest_${Date.now()}`,
      email: `guest_${Date.now()}@fallout-companion.local`,
      role: 'guest'
    });
    
    await guestUser.save();
    const token = generateToken(guestUser._id);
    
    res.json({
      message: 'Guest session created',
      token,
      user: guestUser.toJSON()
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Server error creating guest session' });
  }
});

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// Discord OAuth routes
router.get('/discord',
  passport.authenticate('discord', { scope: ['identify', 'email'] })
);

router.get('/discord/callback',
  passport.authenticate('discord', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
);

// Get current user
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ user: req.user });
});

// Refresh token
router.post('/refresh', passport.authenticate('jwt', { session: false }), (req, res) => {
  const token = generateToken(req.user._id);
  res.json({ token });
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;