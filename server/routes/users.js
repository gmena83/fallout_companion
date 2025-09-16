const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Build = require('../models/Build');
const router = express.Router();

// Middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('profile.favoriteBuilds', 'name buildType playStyle level')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's build count
    const buildCount = await Build.countDocuments({ author: req.user._id });

    res.json({
      user: {
        ...user,
        buildCount
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', requireAuth, [
  body('profile.level').optional().isInt({ min: 1, max: 1000 }),
  body('profile.platform').optional().isIn(['PC', 'PlayStation', 'Xbox']),
  body('preferences.theme').optional().isIn(['classic', 'amber', 'blue'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const allowedUpdates = ['profile', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('profile.favoriteBuilds', 'name buildType playStyle level');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add build to favorites
router.post('/favorites/:buildId', requireAuth, async (req, res) => {
  try {
    const buildId = req.params.buildId;
    
    // Check if build exists
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if already favorited
    if (user.profile.favoriteBuilds.includes(buildId)) {
      return res.status(400).json({ message: 'Build already in favorites' });
    }

    user.profile.favoriteBuilds.push(buildId);
    await user.save();

    res.json({ message: 'Build added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove build from favorites
router.delete('/favorites/:buildId', requireAuth, async (req, res) => {
  try {
    const buildId = req.params.buildId;
    
    const user = await User.findById(req.user._id);
    user.profile.favoriteBuilds = user.profile.favoriteBuilds.filter(
      id => id.toString() !== buildId
    );
    
    await user.save();

    res.json({ message: 'Build removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farming progress
router.put('/farming-progress', requireAuth, [
  body('item').isString().notEmpty(),
  body('collected').isInt({ min: 0 }),
  body('target').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { item, collected, target } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Find existing progress or create new
    let progressIndex = user.profile.farmingProgress.findIndex(
      progress => progress.item === item
    );

    if (progressIndex > -1) {
      user.profile.farmingProgress[progressIndex] = {
        item,
        collected,
        target,
        completed: collected >= target
      };
    } else {
      user.profile.farmingProgress.push({
        item,
        collected,
        target,
        completed: collected >= target
      });
    }

    await user.save();

    res.json({ 
      message: 'Farming progress updated',
      progress: user.profile.farmingProgress
    });
  } catch (error) {
    console.error('Error updating farming progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's farming progress
router.get('/farming-progress', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('profile.farmingProgress')
      .lean();

    res.json({ 
      progress: user.profile.farmingProgress || []
    });
  } catch (error) {
    console.error('Error fetching farming progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public user profile (for viewing other users)
router.get('/:userId/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username avatar profile.level profile.platform profile.playtime preferences.publicProfile')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.preferences.publicProfile) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    // Get user's public builds
    const builds = await Build.find({ 
      author: req.params.userId, 
      isPublic: true 
    })
    .select('name buildType playStyle level likes views createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    const buildCount = await Build.countDocuments({ 
      author: req.params.userId, 
      isPublic: true 
    });

    res.json({
      user: {
        ...user,
        buildCount
      },
      recentBuilds: builds
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;