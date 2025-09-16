const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const Build = require('../models/Build');
const router = express.Router();

// Middleware to check authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Middleware to check write permissions (authenticated users only)
const requireWrite = (req, res, next) => {
  if (req.user.role === 'guest') {
    return res.status(403).json({ message: 'Guests have read-only access' });
  }
  next();
};

// Get all public builds with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      buildType,
      playStyle,
      level,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isPublic: true };

    // Apply filters
    if (buildType) query.buildType = buildType;
    if (playStyle) query.playStyle = playStyle;
    if (level) {
      query.level = { 
        $gte: parseInt(level) - 10, 
        $lte: parseInt(level) + 10 
      };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const builds = await Build.find(query)
      .populate('author', 'username avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Build.countDocuments(query);

    res.json({
      builds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching builds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's builds
router.get('/my-builds', requireAuth, async (req, res) => {
  try {
    const builds = await Build.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ builds });
  } catch (error) {
    console.error('Error fetching user builds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get build by ID
router.get('/:id', async (req, res) => {
  try {
    const build = await Build.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    // Increment view count
    build.views += 1;
    await build.save();

    res.json({ build });
  } catch (error) {
    console.error('Error fetching build:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new build
router.post('/', [requireAuth, requireWrite], [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('level').isInt({ min: 1, max: 1000 }),
  body('buildType').isIn(['PvP', 'PvE', 'Solo', 'Team', 'Stealth', 'Tank', 'DPS', 'Support', 'Hybrid'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const buildData = {
      ...req.body,
      author: req.user._id
    };

    const build = new Build(buildData);
    await build.save();

    const populatedBuild = await Build.findById(build._id)
      .populate('author', 'username avatar');

    res.status(201).json({ 
      message: 'Build created successfully', 
      build: populatedBuild 
    });
  } catch (error) {
    console.error('Error creating build:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update build
router.put('/:id', [requireAuth, requireWrite], async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    // Check if user owns the build
    if (build.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this build' });
    }

    Object.assign(build, req.body);
    await build.save();

    const updatedBuild = await Build.findById(build._id)
      .populate('author', 'username avatar');

    res.json({ 
      message: 'Build updated successfully', 
      build: updatedBuild 
    });
  } catch (error) {
    console.error('Error updating build:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete build
router.delete('/:id', [requireAuth, requireWrite], async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    // Check if user owns the build or is admin
    if (build.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this build' });
    }

    await Build.findByIdAndDelete(req.params.id);

    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Error deleting build:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike build
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    const userIndex = build.likes.indexOf(req.user._id);
    
    if (userIndex > -1) {
      // Unlike
      build.likes.splice(userIndex, 1);
    } else {
      // Like
      build.likes.push(req.user._id);
    }

    await build.save();

    res.json({ 
      message: userIndex > -1 ? 'Build unliked' : 'Build liked',
      likes: build.likes.length 
    });
  } catch (error) {
    console.error('Error liking build:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to build
router.post('/:id/comments', [requireAuth, requireWrite], [
  body('content').isLength({ min: 1, max: 500 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const build = await Build.findById(req.params.id);

    if (!build) {
      return res.status(404).json({ message: 'Build not found' });
    }

    build.comments.push({
      author: req.user._id,
      content: req.body.content
    });

    await build.save();

    const updatedBuild = await Build.findById(build._id)
      .populate('comments.author', 'username avatar');

    res.json({ 
      message: 'Comment added successfully',
      comments: updatedBuild.comments 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;