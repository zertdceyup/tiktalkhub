import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { analyzeSentiment, generateText } from '../../services/aiService.js';

const router = express.Router();

// MindMirror - AI-powered journaling
router.post('/mindmirror', [
  body('journalEntry').isLength({ min: 1, max: 5000 }),
  body('mood').optional().isIn(['happy', 'sad', 'anxious', 'excited', 'angry', 'calm', 'stressed', 'neutral'])
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

    const { journalEntry, mood } = req.body;

    // Analyze sentiment and emotional content
    const sentiment = analyzeSentiment(journalEntry);
    
    // Generate AI reflection
    let reflection = generateMindMirrorReflection(journalEntry, sentiment, mood);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'mindmirror',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { entryLength: journalEntry.length, mood },
        { sentiment: sentiment.sentiment, reflectionGenerated: true },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        originalEntry: journalEntry,
        sentiment,
        mood,
        reflection,
        suggestions: [
          'Continue journaling daily for better self-awareness',
          'Practice mindfulness meditation',
          'Consider talking to a friend or counselor',
          'Engage in physical activity to boost mood'
        ],
        processingTime
      }
    });

  } catch (error) {
    logger.error('MindMirror error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process journal entry'
    });
  }
});

// Therapet - Mood-based virtual pet
router.post('/therapet', [
  body('currentMood').isIn(['happy', 'sad', 'anxious', 'excited', 'angry', 'calm', 'stressed', 'neutral']),
  body('petType').optional().isIn(['cat', 'dog', 'bird', 'fish', 'hamster']),
  body('interaction').optional().isIn(['feed', 'play', 'pet', 'talk', 'exercise'])
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

    const { currentMood, petType = 'cat', interaction = 'talk' } = req.body;

    // Generate pet response based on mood and interaction
    const petResponse = generateTherapetResponse(currentMood, petType, interaction);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'therapet',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { currentMood, petType, interaction },
        { petResponseGenerated: true },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        pet: {
          type: petType,
          mood: petResponse.petMood,
          happiness: petResponse.happiness,
          energy: petResponse.energy
        },
        interaction,
        response: petResponse.message,
        moodBoost: petResponse.moodBoost,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Therapet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to interact with Therapet'
    });
  }
});

// MoodBoard AI - Visual mood analysis
router.post('/moodboard-ai', [
  body('colors').isArray({ min: 1, max: 10 }),
  body('images').optional().isArray(),
  body('description').optional().isLength({ max: 500 })
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

    const { colors, images = [], description = '' } = req.body;

    // Analyze mood from colors and description
    const moodAnalysis = analyzeMoodFromVisuals(colors, description);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'moodboard-ai',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { colorCount: colors.length, imageCount: images.length, hasDescription: !!description },
        { moodAnalyzed: true },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        moodAnalysis,
        recommendations: {
          music: moodAnalysis.suggestedMusic,
          activities: moodAnalysis.suggestedActivities,
          quotes: moodAnalysis.inspirationalQuotes
        },
        processingTime
      }
    });

  } catch (error) {
    logger.error('MoodBoard AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze mood board'
    });
  }
});

// CulturaCare - culture-specific mental health suggestions
router.post('/culturacare', [
  body('culture').isString(),
  body('concern').isLength({ min: 1, max: 1000 })
], async (req, res) => {
  const start = Date.now();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { culture, concern } = req.body;
    const baseTips = {
      general: ['Practice gratitude daily', 'Maintain social connection', 'Prioritize sleep hygiene', 'Regular physical activity'],
      east_asian: ['Balance work and rest; consider Tai Chi or meditation', 'Leverage community/family support', 'Herbal teas and warm foods for calming'],
      south_asian: ['Mindfulness and pranayama (breathing)', 'Ayurvedic routines for balance', 'Respect rest cycles and community rituals'],
      latinx: ['Family-oriented support and storytelling', 'Music/dance for mood elevation', 'Spiritual practices as desired'],
      african: ['Community engagement and faith-based support', 'Nature walks/grounding', 'Journaling and cultural music'],
    };
    const key = culture?.toLowerCase().replace(/[^a-z]/g,'_');
    const tips = baseTips[key] || baseTips.general;
    const processingTime = Date.now() - start;
    if (req.trackUsage) req.trackUsage('culturacare', req.user?.id, req.ip, req.get('User-Agent'), { culture }, { tips: tips.length }, processingTime);
    res.json({ success: true, data: { culture, concern, suggestions: tips, processingTime } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to provide cultura care tips' });
  }
});

// Mental Health Planner - AI plan based on mood/test results
router.post('/mental-health-planner', [
  body('mood').isIn(['happy','sad','anxious','excited','angry','calm','stressed','neutral']),
  body('goals').optional().isArray(),
  body('assessment').optional().isObject()
], async (req, res) => {
  const start = Date.now();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { mood, goals = [], assessment = {} } = req.body;
    const plan = {
      daily: ['10-min mindfulness practice', '15-min walk', 'Drink water regularly'],
      weekly: ['Connect with a friend/family', 'Journal 3x/week', 'Try a hobby session'],
      resources: ['Crisis hotline info', 'Local support groups', 'Cognitive behavioral exercises']
    };
    const adjustments = mood === 'anxious' ? ['Box breathing 4-4-4-4', 'Limit caffeine'] : mood === 'sad' ? ['Sunlight exposure', 'Gratitude list'] : [];
    const processingTime = Date.now() - start;
    if (req.trackUsage) req.trackUsage('mental-health-planner', req.user?.id, req.ip, req.get('User-Agent'), { mood }, { plan: true }, processingTime);
    res.json({ success: true, data: { mood, goals, assessment, plan: { ...plan, adjustments }, processingTime } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to generate plan' });
  }
});

// Helper functions
const generateMindMirrorReflection = (entry, sentiment, mood) => {
  const reflections = {
    positive: [
      "It's wonderful to see such positivity in your thoughts. This mindset can be a powerful foundation for continued growth and happiness.",
      "Your positive outlook shines through in your writing. Consider how you can maintain this energy throughout your day.",
      "The optimism in your entry is inspiring. Reflect on what specifically brought you to this positive state of mind."
    ],
    negative: [
      "I notice some challenging emotions in your entry. Remember that difficult feelings are temporary and part of the human experience.",
      "It takes courage to express difficult emotions. Consider what small step you might take today to nurture yourself.",
      "Your honesty about your struggles shows self-awareness. What support systems or coping strategies have helped you before?"
    ],
    neutral: [
      "Your entry shows a balanced perspective. Sometimes neutral moments offer space for reflection and planning.",
      "There's wisdom in accepting where you are right now. What would you like to focus your energy on today?",
      "Your thoughtful approach to processing your experiences is commendable. What insights are emerging for you?"
    ]
  };

  const sentimentCategory = sentiment.sentiment === 'positive' ? 'positive' : 
                           sentiment.sentiment === 'negative' ? 'negative' : 'neutral';
  
  const categoryReflections = reflections[sentimentCategory];
  return categoryReflections[Math.floor(Math.random() * categoryReflections.length)];
};

const generateTherapetResponse = (mood, petType, interaction) => {
  const petPersonalities = {
    cat: { base: 'independent', traits: ['curious', 'calm', 'mysterious'] },
    dog: { base: 'loyal', traits: ['energetic', 'loving', 'playful'] },
    bird: { base: 'social', traits: ['cheerful', 'talkative', 'bright'] },
    fish: { base: 'peaceful', traits: ['serene', 'flowing', 'meditative'] },
    hamster: { base: 'busy', traits: ['active', 'cute', 'determined'] }
  };

  const moodResponses = {
    happy: {
      message: "I can sense your joy! Let's celebrate together! 🎉",
      moodBoost: 5,
      petMood: 'excited'
    },
    sad: {
      message: "I'm here with you. Sometimes we all need a gentle companion. 💙",
      moodBoost: 15,
      petMood: 'comforting'
    },
    anxious: {
      message: "Take a deep breath with me. We'll get through this together. 🌸",
      moodBoost: 20,
      petMood: 'calming'
    },
    stressed: {
      message: "Let's take a moment to relax. You're doing better than you think. 🌿",
      moodBoost: 18,
      petMood: 'supportive'
    }
  };

  const response = moodResponses[mood] || moodResponses.sad;
  const personality = petPersonalities[petType];

  return {
    message: response.message,
    moodBoost: response.moodBoost,
    petMood: response.petMood,
    happiness: Math.floor(Math.random() * 30) + 70,
    energy: Math.floor(Math.random() * 40) + 60
  };
};

const analyzeMoodFromVisuals = (colors, description) => {
  const colorMoods = {
    red: { energy: 'high', emotion: 'passionate', intensity: 8 },
    blue: { energy: 'calm', emotion: 'peaceful', intensity: 4 },
    yellow: { energy: 'bright', emotion: 'happy', intensity: 7 },
    green: { energy: 'balanced', emotion: 'growth', intensity: 5 },
    purple: { energy: 'mysterious', emotion: 'creative', intensity: 6 },
    orange: { energy: 'warm', emotion: 'enthusiastic', intensity: 7 },
    pink: { energy: 'gentle', emotion: 'loving', intensity: 5 },
    black: { energy: 'strong', emotion: 'serious', intensity: 3 },
    white: { energy: 'pure', emotion: 'clean', intensity: 2 }
  };

  let dominantMood = 'balanced';
  let averageIntensity = 5;
  let energyLevel = 'moderate';

  if (colors.length > 0) {
    const colorAnalysis = colors.map(color => {
      const lowerColor = color.toLowerCase();
      return colorMoods[lowerColor] || { energy: 'neutral', emotion: 'balanced', intensity: 5 };
    });

    averageIntensity = colorAnalysis.reduce((sum, c) => sum + c.intensity, 0) / colorAnalysis.length;
    
    if (averageIntensity > 6) energyLevel = 'high';
    else if (averageIntensity < 4) energyLevel = 'low';
    
    dominantMood = colorAnalysis[0].emotion;
  }

  return {
    dominantMood,
    energyLevel,
    intensity: Math.round(averageIntensity),
    suggestedMusic: getSuggestedMusic(dominantMood, energyLevel),
    suggestedActivities: getSuggestedActivities(dominantMood, energyLevel),
    inspirationalQuotes: getInspirationalQuotes(dominantMood)
  };
};

const getSuggestedMusic = (mood, energy) => {
  const musicSuggestions = {
    peaceful: ['Ambient soundscapes', 'Classical piano', 'Nature sounds'],
    happy: ['Upbeat pop', 'Feel-good classics', 'Uplifting indie'],
    passionate: ['Energetic rock', 'Latin rhythms', 'Intense classical'],
    creative: ['Instrumental jazz', 'Electronic ambient', 'World music']
  };

  return musicSuggestions[mood] || musicSuggestions.peaceful;
};

const getSuggestedActivities = (mood, energy) => {
  const activities = {
    high: ['Dancing', 'Exercise', 'Creative projects', 'Social activities'],
    moderate: ['Walking', 'Reading', 'Cooking', 'Gentle yoga'],
    low: ['Meditation', 'Journaling', 'Breathing exercises', 'Listening to music']
  };

  return activities[energy] || activities.moderate;
};

const getInspirationalQuotes = (mood) => {
  const quotes = {
    peaceful: [
      "Peace comes from within. Do not seek it without. - Buddha",
      "In the midst of movement and chaos, keep stillness inside of you. - Deepak Chopra"
    ],
    happy: [
      "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
      "The purpose of our lives is to be happy. - Dalai Lama"
    ],
    passionate: [
      "Passion is energy. Feel the power that comes from focusing on what excites you. - Oprah Winfrey",
      "Nothing great in the world has ever been accomplished without passion. - Georg Wilhelm Friedrich Hegel"
    ],
    creative: [
      "Creativity takes courage. - Henri Matisse",
      "The creative adult is the child who survived. - Ursula K. Le Guin"
    ]
  };

  return quotes[mood] || quotes.peaceful;
};

export default router;