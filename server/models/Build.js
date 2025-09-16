const mongoose = require('mongoose');

const buildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Build configuration
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  
  // SPECIAL stats (Strength, Perception, Endurance, Charisma, Intelligence, Agility, Luck)
  special: {
    strength: { type: Number, min: 1, max: 15, default: 1 },
    perception: { type: Number, min: 1, max: 15, default: 1 },
    endurance: { type: Number, min: 1, max: 15, default: 1 },
    charisma: { type: Number, min: 1, max: 15, default: 1 },
    intelligence: { type: Number, min: 1, max: 15, default: 1 },
    agility: { type: Number, min: 1, max: 15, default: 1 },
    luck: { type: Number, min: 1, max: 15, default: 1 }
  },
  
  // Perk cards
  perks: [{
    name: String,
    category: {
      type: String,
      enum: ['strength', 'perception', 'endurance', 'charisma', 'intelligence', 'agility', 'luck']
    },
    rank: {
      type: Number,
      min: 1,
      max: 5
    },
    cost: Number
  }],
  
  // Equipment loadout
  equipment: {
    weapon1: String,
    weapon2: String,
    weapon3: String,
    armor: {
      head: String,
      chest: String,
      leftArm: String,
      rightArm: String,
      leftLeg: String,
      rightLeg: String
    },
    powerArmor: {
      frame: String,
      head: String,
      chest: String,
      leftArm: String,
      rightArm: String,
      leftLeg: String,
      rightLeg: String
    }
  },
  
  // Build metadata
  buildType: {
    type: String,
    enum: ['PvP', 'PvE', 'Solo', 'Team', 'Stealth', 'Tank', 'DPS', 'Support', 'Hybrid'],
    required: true
  },
  
  playStyle: {
    type: String,
    enum: ['Melee', 'Ranged', 'Heavy Weapons', 'Energy Weapons', 'Explosives', 'Stealth', 'Mixed']
  },
  
  tags: [String],
  
  // Community features
  isPublic: {
    type: Boolean,
    default: true
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  views: {
    type: Number,
    default: 0
  },
  
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Version control
  version: {
    type: String,
    default: '1.0.0'
  },
  
  gameVersion: {
    type: String,
    default: 'current'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
buildSchema.index({ author: 1, createdAt: -1 });
buildSchema.index({ buildType: 1, playStyle: 1 });
buildSchema.index({ tags: 1 });
buildSchema.index({ isPublic: 1, likes: -1 });

module.exports = mongoose.model('Build', buildSchema);