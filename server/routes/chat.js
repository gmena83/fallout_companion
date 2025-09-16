const express = require('express');
const passport = require('passport');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Item = require('../models/Item');
const Build = require('../models/Build');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Simple RAG system for game data
class GameDataRAG {
  constructor() {
    this.gameData = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Get all items and builds for context
      const items = await Item.find({}).select('name type category description effects locations').lean();
      const builds = await Build.find({ isPublic: true }).select('name description buildType playStyle special perks').lean();

      this.gameData = {
        items,
        builds,
        lastUpdated: new Date()
      };

      this.initialized = true;
      console.log('Game data RAG initialized');
    } catch (error) {
      console.error('Error initializing RAG:', error);
    }
  }

  async searchRelevantData(query) {
    if (!this.initialized) {
      await this.initialize();
    }

    const lowerQuery = query.toLowerCase();
    const relevantItems = this.gameData.items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);

    const relevantBuilds = this.gameData.builds.filter(build =>
      build.name.toLowerCase().includes(lowerQuery) ||
      build.description?.toLowerCase().includes(lowerQuery) ||
      build.buildType.toLowerCase().includes(lowerQuery) ||
      build.playStyle?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    return { items: relevantItems, builds: relevantBuilds };
  }

  formatContextData(data) {
    let context = "Here's relevant Fallout 76 game data:\n\n";
    
    if (data.items.length > 0) {
      context += "ITEMS:\n";
      data.items.forEach(item => {
        context += `- ${item.name} (${item.type}/${item.category}): ${item.description || 'No description'}\n`;
        if (item.locations?.length > 0) {
          context += `  Locations: ${item.locations.join(', ')}\n`;
        }
      });
      context += "\n";
    }

    if (data.builds.length > 0) {
      context += "BUILDS:\n";
      data.builds.forEach(build => {
        context += `- ${build.name} (${build.buildType}/${build.playStyle}): ${build.description || 'No description'}\n`;
      });
      context += "\n";
    }

    return context;
  }
}

const gameRAG = new GameDataRAG();

// Chat with AI assistant
router.post('/message', requireAuth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Search for relevant game data
    const relevantData = await gameRAG.searchRelevantData(message);
    const contextData = gameRAG.formatContextData(relevantData);

    // Build conversation context
    let conversationContext = "You are a helpful Fallout 76 game assistant. You help players with builds, items, locations, and strategies. ";
    conversationContext += "Always be helpful, friendly, and provide accurate information based on the game data provided. ";
    conversationContext += "If you don't have specific information, say so and provide general helpful advice.\n\n";
    conversationContext += contextData;

    // Add conversation history
    if (conversationHistory.length > 0) {
      conversationContext += "Previous conversation:\n";
      conversationHistory.slice(-6).forEach(msg => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationContext += "\n";
    }

    conversationContext += `User: ${message}\nAssistant:`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const responseText = response.text();

    res.json({
      message: responseText,
      relevantData: {
        items: relevantData.items.length,
        builds: relevantData.builds.length
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Fallback response if AI fails
    const fallbackResponse = "I'm sorry, I'm having trouble connecting to my knowledge base right now. " +
      "Please try again in a moment, or check the items and builds sections for the information you need.";
    
    res.status(500).json({ 
      message: fallbackResponse,
      error: 'AI service temporarily unavailable'
    });
  }
});

// Get suggested questions
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "What's the best build for solo PvE content?",
    "Where can I find legendary weapons?",
    "How do I optimize my SPECIAL stats?",
    "What are the best locations for farming caps?",
    "Which perks are essential for a stealth build?",
    "How do I get better armor in Fallout 76?",
    "What's the difference between energy and ballistic damage?",
    "Where can I find plans for power armor mods?",
    "What are the best weapons for a heavy gunner build?",
    "How do I manage my carry weight effectively?"
  ];

  res.json({ suggestions });
});

// Refresh game data (admin only)
router.post('/refresh-data', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    gameRAG.initialized = false;
    await gameRAG.initialize();

    res.json({ 
      message: 'Game data refreshed successfully',
      itemCount: gameRAG.gameData.items.length,
      buildCount: gameRAG.gameData.builds.length
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;