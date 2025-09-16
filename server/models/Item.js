const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  // Basic item info
  type: {
    type: String,
    required: true,
    enum: [
      'weapon', 'armor', 'aid', 'misc', 'junk', 'ammo', 'mod', 'plan', 
      'apparel', 'consumable', 'holotape', 'note', 'key', 'powerarmor'
    ]
  },
  
  category: {
    type: String,
    required: true
  },
  
  subcategory: String,
  
  description: String,
  
  // Item properties
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  level: {
    type: Number,
    min: 1,
    max: 50
  },
  
  weight: {
    type: Number,
    default: 0
  },
  
  value: {
    type: Number,
    default: 0
  },
  
  // Weapon-specific properties
  weaponStats: {
    damage: Number,
    fireRate: Number,
    range: Number,
    accuracy: Number,
    ammoType: String,
    ammoCapacity: Number
  },
  
  // Armor-specific properties
  armorStats: {
    damageResist: Number,
    energyResist: Number,
    radiationResist: Number,
    durability: Number
  },
  
  // Consumable effects
  effects: [{
    type: String,
    value: Number,
    duration: Number,
    description: String
  }],
  
  // Crafting info
  craftable: {
    type: Boolean,
    default: false
  },
  
  materials: [{
    name: String,
    quantity: Number
  }],
  
  workbench: String,
  
  // Location and acquisition
  locations: [String],
  
  dropSources: [String],
  
  vendors: [{
    name: String,
    price: Number,
    currency: String
  }],
  
  // Wiki and external data
  wikiUrl: String,
  
  imageUrl: String,
  
  // Farming information
  farmingInfo: {
    renewable: {
      type: Boolean,
      default: true
    },
    respawnTime: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'very_hard'],
      default: 'medium'
    },
    notes: String
  },
  
  // Community data
  popularity: {
    type: Number,
    default: 0
  },
  
  userRatings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Data source tracking
  source: {
    type: String,
    enum: ['wiki', 'manual', 'api', 'community'],
    default: 'manual'
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ type: 1, category: 1 });
itemSchema.index({ rarity: 1, level: 1 });
itemSchema.index({ 'farmingInfo.difficulty': 1 });

// Virtual for average rating
itemSchema.virtual('averageRating').get(function() {
  if (this.userRatings.length === 0) return 0;
  const sum = this.userRatings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.userRatings.length) * 10) / 10;
});

module.exports = mongoose.model('Item', itemSchema);