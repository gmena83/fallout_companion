const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user'
  },
  // OAuth fields
  googleId: String,
  discordId: String,
  
  // Game-related data
  profile: {
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 1000
    },
    platform: {
      type: String,
      enum: ['PC', 'PlayStation', 'Xbox'],
      default: 'PC'
    },
    playtime: {
      type: Number,
      default: 0
    },
    favoriteBuilds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Build'
    }],
    completedQuests: [String],
    farmingProgress: [{
      item: String,
      collected: Number,
      target: Number,
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Settings
  preferences: {
    theme: {
      type: String,
      enum: ['classic', 'amber', 'blue'],
      default: 'classic'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;
  delete user.discordId;
  return user;
};

module.exports = mongoose.model('User', userSchema);