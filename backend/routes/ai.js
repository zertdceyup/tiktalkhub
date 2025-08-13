import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init.js';
import { optionalAuth } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import logger from '../utils/logger.js';
import { allSQL } from '../database/init.js';

const router = express.Router();

// Apply optional auth to all routes
router.use(optionalAuth);

// Tiko AI Chat
router.post('/chat', [
  body('message').isLength({ min: 1, max: 1000 }),
  body('sessionId').optional().isUUID(),
  body('context').optional().isObject()
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { message, sessionId = uuidv4(), context = {} } = req.body;

    // Analyze sentiment of the message
    const sentimentAnalysis = await aiService.analyzeSentiment(message);
    
    // Get tool suggestions based on the message
    const toolSuggestion = await aiService.suggestTools(message);

    // Generate AI response
    let aiResponse;
    try {
      // Create a context-aware prompt
      const prompt = `User message: "${message}"
      
Context: The user is on Tiktalkhub, a platform with 50+ AI-powered tools for business, career, content creation, video editing, social media, TikTok, emotional wellness, and utility tasks.

Available tool categories:
- SmartBiz: Business Name Generator, Slogan Creator, Logo Wizard, Invoice Maker, Flyer Designer
- Career: Resume Builder, Cover Letter AI, LinkedIn Summary, Interview Coach
- Content: Blog Idea Generator, Text-to-Speech, Caption Generator, Headline Analyzer
- Video: Video Trimmer, Thumbnail Selector, GIF Maker
- Social: Hashtag Generator, Twitter Thread Formatter
- TikTok: Hashtag Heatmap, Viral Hook Generator
- Emotional: MindMirror (AI Journaling), Therapet (Virtual Pet), MoodBoard AI
- Utility: PDF Compressor, QR Generator, Image Optimizer, AI Meme Generator

Respond as Tiko, a friendly AI concierge. Be helpful, concise, and suggest relevant tools when appropriate. Keep responses under 200 words.`;

      aiResponse = await aiService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.7,
        category: 'chat'
      });
    } catch (error) {
      logger.error('AI response generation failed:', error);
      aiResponse = generateFallbackResponse(message, toolSuggestion);
    }

    // Save conversation to database
    try {
      db.prepare(`
        INSERT INTO ai_conversations (user_id, session_id, message, response, context, sentiment_score, suggested_tools)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || null,
        sessionId,
        message,
        aiResponse,
        JSON.stringify(context),
        sentimentAnalysis.score,
        JSON.stringify(toolSuggestion.tools)
      );
    } catch (dbError) {
      logger.error('Failed to save conversation:', dbError);
    }

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sessionId,
        sentiment: sentimentAnalysis,
        suggestedTools: toolSuggestion.tools,
        intent: toolSuggestion.intent,
        confidence: toolSuggestion.confidence,
        processingTime
      }
    });

  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message'
    });
  }
});

// Tool Suggestions
router.post('/suggest-tools', [
  body('query').isLength({ min: 1, max: 500 }),
  body('category').optional().isString(),
  body('userPreferences').optional().isObject()
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { query, category, userPreferences = {} } = req.body;

    // Get tool suggestions from AI service
    const suggestion = await aiService.suggestTools(query);
    
    // Get additional context from database
    let tools = [];
    if (suggestion.tools.length > 0) {
      const placeholders = suggestion.tools.map(() => '?').join(',');
      tools = db.prepare(`
        SELECT id, name, slug, description, category, icon, usage_count
        FROM tools 
        WHERE slug IN (${placeholders}) AND is_active = 1
        ORDER BY usage_count DESC
      `).all(...suggestion.tools);
    }

    // If no specific tools found, get popular tools from suggested category
    if (tools.length === 0 && category) {
      tools = db.prepare(`
        SELECT id, name, slug, description, category, icon, usage_count
        FROM tools 
        WHERE category = ? AND is_active = 1
        ORDER BY usage_count DESC
        LIMIT 5
      `).all(category);
    }

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        query,
        intent: suggestion.intent,
        confidence: suggestion.confidence,
        response: suggestion.response,
        tools,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Tool suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tool suggestions'
    });
  }
});

// AI Insights
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user?.id;
    const insights = {
      personalizedRecommendations: [],
      usageStats: {},
      trendingTools: [],
      tips: []
    };

    // Get user's tool usage if authenticated
    if (userId) {
      const userUsage = db.prepare(`
        SELECT t.name, t.slug, t.category, COUNT(tu.id) as usage_count
        FROM tool_usage tu
        JOIN tools t ON tu.tool_id = t.id
        WHERE tu.user_id = ? AND tu.created_at >= date('now', '-30 days')
        GROUP BY t.id
        ORDER BY usage_count DESC
        LIMIT 5
      `).all(userId);

      insights.usageStats = {
        favoriteTools: userUsage,
        totalUsage: userUsage.reduce((sum, tool) => sum + tool.usage_count, 0)
      };

      // Generate personalized recommendations based on usage
      if (userUsage.length > 0) {
        const categories = [...new Set(userUsage.map(tool => tool.category))];
        const recommendedTools = db.prepare(`
          SELECT name, slug, description, category, icon
          FROM tools 
          WHERE category IN (${categories.map(() => '?').join(',')}) 
          AND slug NOT IN (${userUsage.map(() => '?').join(',')})
          AND is_active = 1
          ORDER BY usage_count DESC
          LIMIT 3
        `).all(...categories, ...userUsage.map(tool => tool.slug));

        insights.personalizedRecommendations = recommendedTools;
      }
    }

    // Get trending tools
    insights.trendingTools = db.prepare(`
      SELECT t.name, t.slug, t.description, t.category, t.icon, COUNT(tu.id) as recent_usage
      FROM tools t
      LEFT JOIN tool_usage tu ON t.id = tu.tool_id AND tu.created_at >= date('now', '-7 days')
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY recent_usage DESC, t.usage_count DESC
      LIMIT 5
    `).all();

    // Generate AI-powered tips
    insights.tips = [
      "💡 Try combining multiple tools for better results - use the Business Name Generator with the Logo Sketch Wizard!",
      "🚀 Most successful users spend 5-10 minutes exploring different tool options before starting.",
      "✨ Save time by bookmarking your favorite tools for quick access.",
      "📈 Tools work best when you provide detailed, specific inputs rather than generic ones.",
      "🎯 Use the AI concierge (Tiko) to discover new tools based on your current projects."
    ];

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    logger.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
});

// Sentiment Analysis
router.post('/analyze-sentiment', [
  body('text').isLength({ min: 1, max: 5000 })
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { text } = req.body;
    
    const sentimentAnalysis = await aiService.analyzeSentiment(text);
    const keywords = await aiService.extractKeywords(text, 10);
    
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        sentiment: sentimentAnalysis,
        keywords,
        processingTime,
        textStats: {
          characterCount: text.length,
          wordCount: text.split(/\s+/).length,
          sentenceCount: text.split(/[.!?]+/).length - 1
        }
      }
    });

  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment'
    });
  }
});

// Generate Content
router.post('/generate-content', [
  body('type').isIn(['business_names', 'slogans', 'blog_ideas', 'social_captions', 'hashtags']),
  body('prompt').isLength({ min: 1, max: 1000 }),
  body('options').optional().isObject()
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { type, prompt, options = {} } = req.body;

    let content;
    switch (type) {
      case 'business_names':
        content = aiService.generateBusinessNames(prompt, options);
        break;
      case 'slogans':
        content = aiService.generateSlogans(prompt, options);
        break;
      case 'blog_ideas':
        content = aiService.generateBlogIdeas(prompt, options);
        break;
      case 'social_captions':
        content = aiService.generateSocialCaptions(prompt, options);
        break;
      case 'hashtags':
        content = aiService.generateHashtags(prompt, options);
        break;
      default:
        content = await aiService.generateText(prompt, { category: type, ...options });
    }

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        type,
        content,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content'
    });
  }
});

// RAG: upsert document
router.post('/rag/upsert', [ body('doc_type').isString(), body('doc_id').isString(), body('content').isString() ], async (req, res) => {
  try {
    const { doc_type, doc_id, content } = req.body;
    const embedding = Buffer.from(new TextEncoder().encode(content.slice(0, 512))); // placeholder embedding
    db.prepare('INSERT INTO rag_index (doc_type, doc_id, content, embedding) VALUES (?, ?, ?, ?)').run(doc_type, doc_id, content, embedding);
    res.json({ success: true });
  } catch (e) { logger.error('RAG upsert error', e); res.status(500).json({ success: false }); }
});

// RAG: search
router.post('/rag/search', [ body('query').isString(), body('limit').optional().isInt({ min: 1, max: 10 }) ], async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    const rows = await allSQL('SELECT id, doc_type, doc_id, content FROM rag_index ORDER BY created_at DESC LIMIT 200');
    // naive: rank by substring score
    const ranked = rows.map(r => ({ r, score: (r.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0) + (r.content.match(new RegExp(query, 'gi'))||[]).length })).sort((a,b)=>b.score-a.score).slice(0, limit).map(x=>x.r);
    res.json({ success: true, data: { results: ranked } });
  } catch (e) { logger.error('RAG search error', e); res.status(500).json({ success: false }); }
});

// Get conversation history
router.get('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    let conversations;
    if (req.user) {
      conversations = db.prepare(`
        SELECT message, response, sentiment_score, suggested_tools, created_at
        FROM ai_conversations
        WHERE session_id = ? AND (user_id = ? OR user_id IS NULL)
        ORDER BY created_at DESC
        LIMIT ?
      `).all(sessionId, req.user.id, limit);
    } else {
      conversations = db.prepare(`
        SELECT message, response, sentiment_score, suggested_tools, created_at
        FROM ai_conversations
        WHERE session_id = ? AND user_id IS NULL
        ORDER BY created_at DESC
        LIMIT ?
      `).all(sessionId, limit);
    }

    res.json({
      success: true,
      data: {
        sessionId,
        conversations: conversations.reverse(),
        count: conversations.length
      }
    });

  } catch (error) {
    logger.error('Conversation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history'
    });
  }
});

// Helper function for fallback responses
function generateFallbackResponse(message, toolSuggestion) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hi there! I'm Tiko, your AI assistant at Tiktalkhub! 👋 I'm here to help you discover the perfect tools for your needs. What would you like to work on today?";
  }
  
  if (lowerMessage.includes('help')) {
    return "I'd be happy to help! Tiktalkhub offers 50+ AI-powered tools across different categories:\n\n🏢 SmartBiz - Business names, logos, invoices\n💼 Career - Resumes, cover letters, LinkedIn\n📝 Content - Blog ideas, captions, headlines\n🎬 Video - Editing, thumbnails, GIFs\n📱 Social - Hashtags, Twitter threads\n🧠 Emotional - Journaling, mood tracking\n\nWhat type of project are you working on?";
  }
  
  if (lowerMessage.includes('business') || lowerMessage.includes('company')) {
    return "Great! I can help with business-related tasks. Try our SmartBiz tools:\n\n• Business Name Generator - Create unique business names\n• Slogan Creator - Craft catchy taglines\n• Logo Sketch Wizard - Design logo concepts\n• Invoice Maker - Generate professional invoices\n• Smart Flyer Designer - Create marketing materials\n\nWhich one interests you most?";
  }
  
  if (lowerMessage.includes('resume') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return "Perfect! Our Career toolkit can boost your professional profile:\n\n• Resume Builder - AI-powered resume creation\n• Cover Letter AI - Personalized cover letters\n• LinkedIn Summary Generator - Optimize your profile\n• Interview Coach - Practice with AI feedback\n\nLet's get your career moving forward! Which tool would you like to try?";
  }
  
  if (toolSuggestion.tools.length > 0) {
    return `${toolSuggestion.response}\n\nI recommend checking out these tools: ${toolSuggestion.tools.join(', ')}. Would you like me to tell you more about any of them?`;
  }
  
  return "I'm here to help you make the most of Tiktalkhub's 50+ AI-powered tools! Whether you need help with business, career, content creation, video editing, or emotional wellness, I can guide you to the right solution. What's your current project or goal?";
}

export default router;