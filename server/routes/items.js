const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const router = express.Router();

// Middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Get all items with filtering and search
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      rarity,
      level,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');
    if (rarity) query.rarity = rarity;
    if (level) {
      query.level = { 
        $gte: parseInt(level) - 5, 
        $lte: parseInt(level) + 5 
      };
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    if (search && !sortBy) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const items = await Item.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('userRatings.user', 'username');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items for farming checklist
router.get('/farming/checklist', async (req, res) => {
  try {
    const { difficulty, renewable } = req.query;
    
    const query = { 'farmingInfo.renewable': true };
    
    if (difficulty) {
      query['farmingInfo.difficulty'] = difficulty;
    }
    if (renewable !== undefined) {
      query['farmingInfo.renewable'] = renewable === 'true';
    }

    const items = await Item.find(query)
      .select('name type category rarity farmingInfo locations imageUrl')
      .sort({ name: 1 })
      .lean();

    res.json({ items });
  } catch (error) {
    console.error('Error fetching farming items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate an item
router.post('/:id/rate', requireAuth, [
  body('rating').isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Remove existing rating from this user
    item.userRatings = item.userRatings.filter(
      rating => rating.user.toString() !== req.user._id.toString()
    );

    // Add new rating
    item.userRatings.push({
      user: req.user._id,
      rating: req.body.rating
    });

    await item.save();

    res.json({ 
      message: 'Rating added successfully',
      averageRating: item.averageRating 
    });
  } catch (error) {
    console.error('Error rating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get item categories and types for filters
router.get('/meta/filters', async (req, res) => {
  try {
    const types = await Item.distinct('type');
    const categories = await Item.distinct('category');
    const rarities = await Item.distinct('rarity');

    res.json({
      types: types.sort(),
      categories: categories.sort(),
      rarities: ['common', 'uncommon', 'rare', 'epic', 'legendary']
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to create/update items (for data seeding)
router.post('/', requireAuth, async (req, res) => {
  try {
    // Only allow admins to create items
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const item = new Item(req.body);
    await item.save();

    res.status(201).json({ 
      message: 'Item created successfully', 
      item 
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;