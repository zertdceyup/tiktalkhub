import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { generateText, analyzeSentiment, extractKeywords, analyzeReadability } from '../../services/aiService.js';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const audioStorage = multer.memoryStorage();
const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/webm','audio/ogg','audio/m4a'].includes(file.mimetype);
    if (ok) cb(null, true); else cb(new Error('Invalid audio type'));
  }
});

// Blog Idea Generator
router.post('/blog-idea-generator', [
  body('niche').isLength({ min: 1, max: 100 }),
  body('targetAudience').optional().isLength({ max: 200 }),
  body('contentType').optional().isIn(['how-to', 'listicle', 'review', 'tutorial', 'news', 'opinion']),
  body('keywords').optional().isArray(),
  body('count').optional().isInt({ min: 1, max: 50 })
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

    const { niche, targetAudience = 'general audience', contentType = 'how-to', keywords = [], count = 10 } = req.body;

    let blogIdeas = [];

    // Generate AI-powered ideas if available
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Generate ${count} ${contentType} blog post ideas for the ${niche} niche targeting ${targetAudience}. 
        ${keywords.length > 0 ? `Include these keywords: ${keywords.join(', ')}` : ''}
        Return only the titles, one per line. Make them engaging and SEO-friendly.`;
        
        const aiIdeas = await generateText(prompt);
        
        if (aiIdeas) {
          const aiIdeaList = aiIdeas.split('\n')
            .map(idea => idea.trim())
            .filter(idea => idea.length > 0)
            .slice(0, Math.floor(count / 2));
          
          blogIdeas.push(...aiIdeaList.map(idea => ({
            title: idea,
            type: contentType,
            difficulty: Math.random() > 0.5 ? 'intermediate' : 'beginner',
            estimatedWords: Math.floor(Math.random() * 1000) + 500,
            source: 'ai'
          })));
        }
      } catch (error) {
        logger.warn('AI blog idea generation failed:', error.message);
      }
    }

    // Generate template-based ideas as fallback or supplement
    const templateIdeas = generateTemplateBlogIdeas(niche, contentType, targetAudience, keywords, count - blogIdeas.length);
    blogIdeas.push(...templateIdeas);

    // Ensure we have the requested count
    blogIdeas = blogIdeas.slice(0, count);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'blog-idea-generator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { niche, contentType, keywordCount: keywords.length, count },
        { ideasGenerated: blogIdeas.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        niche,
        contentType,
        targetAudience,
        blogIdeas,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Blog idea generator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate blog ideas'
    });
  }
});

// Caption Generator
router.post('/caption-generator', [
  body('platform').isIn(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'general']),
  body('content').isLength({ min: 1, max: 500 }),
  body('tone').optional().isIn(['professional', 'casual', 'funny', 'inspirational', 'promotional']),
  body('includeHashtags').optional().isBoolean(),
  body('includeEmojis').optional().isBoolean(),
  body('callToAction').optional().isLength({ max: 100 })
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

    const { 
      platform, 
      content, 
      tone = 'casual', 
      includeHashtags = true, 
      includeEmojis = true,
      callToAction = ''
    } = req.body;

    // Extract keywords from content
    const keywords = extractKeywords(content, 5);

    let caption = '';
    let hashtags = [];

    // Generate AI-powered caption if available
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Create a ${tone} ${platform} caption about: "${content}"
        ${includeEmojis ? 'Include relevant emojis.' : 'No emojis.'}
        ${callToAction ? `Include this call to action: ${callToAction}` : ''}
        Keep it engaging and platform-appropriate.`;
        
        const aiCaption = await generateText(prompt);
        
        if (aiCaption && aiCaption.length > 20) {
          caption = aiCaption.trim();
        }
      } catch (error) {
        logger.warn('AI caption generation failed:', error.message);
      }
    }

    // Fallback to template-based generation
    if (!caption || caption.length < 20) {
      caption = generateTemplateCaption(platform, content, tone, includeEmojis, callToAction);
    }

    // Generate hashtags if requested
    if (includeHashtags) {
      hashtags = generateHashtags(platform, keywords, content);
    }

    // Analyze caption
    const analysis = {
      sentiment: analyzeSentiment(caption),
      readability: analyzeReadability(caption),
      characterCount: caption.length,
      wordCount: caption.split(' ').length,
      platformOptimized: isPlatformOptimized(platform, caption)
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'caption-generator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { platform, tone, contentLength: content.length, includeHashtags, includeEmojis },
        { captionLength: caption.length, hashtagCount: hashtags.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        caption,
        hashtags,
        analysis,
        platform,
        tone,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Caption generator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate caption'
    });
  }
});

// Headline Analyzer
router.post('/headline-analyzer', [
  body('headline').isLength({ min: 1, max: 200 }),
  body('type').optional().isIn(['blog', 'email', 'ad', 'social', 'news'])
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

    const { headline, type = 'blog' } = req.body;

    // Analyze headline components
    const analysis = analyzeHeadline(headline, type);

    // Generate improvement suggestions
    const suggestions = generateHeadlineImprovements(headline, analysis, type);

    // Generate alternative headlines
    let alternatives = [];
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Create 5 alternative ${type} headlines for: "${headline}". Make them more engaging and clickable. Return only the headlines, one per line.`;
        const aiAlternatives = await generateText(prompt);
        
        if (aiAlternatives) {
          alternatives = aiAlternatives.split('\n')
            .map(alt => alt.trim())
            .filter(alt => alt.length > 0)
            .slice(0, 5);
        }
      } catch (error) {
        logger.warn('AI headline alternatives generation failed:', error.message);
      }
    }

    // Fallback alternatives
    if (alternatives.length === 0) {
      alternatives = generateTemplateAlternatives(headline, type);
    }

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'headline-analyzer',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { type, headlineLength: headline.length },
        { score: analysis.overallScore, alternativesCount: alternatives.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        headline,
        type,
        analysis,
        suggestions,
        alternatives,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Headline analyzer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze headline'
    });
  }
});

// Text to Speech (Mock implementation - would use actual TTS service)
router.post('/text-to-speech', [
  body('text').isLength({ min: 1, max: 5000 }),
  body('voice').optional().isIn(['male', 'female', 'child']),
  body('speed').optional().isFloat({ min: 0.5, max: 2.0 }),
  body('language').optional().isIn(['en', 'es', 'fr', 'de', 'it'])
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

    const { text, voice = 'female', speed = 1.0, language = 'en' } = req.body;

    // In a real implementation, this would call a TTS service like Google Text-to-Speech
    // For now, we'll return mock data
    const audioData = {
      url: `/api/audio/tts-${Date.now()}.mp3`, // Mock URL
      duration: Math.ceil(text.length / 10), // Estimated duration in seconds
      format: 'mp3',
      bitrate: '128kbps',
      sampleRate: '44100Hz'
    };

    // Analyze text for TTS optimization
    const textAnalysis = {
      wordCount: text.split(' ').length,
      characterCount: text.length,
      estimatedDuration: `${Math.floor(audioData.duration / 60)}:${(audioData.duration % 60).toString().padStart(2, '0')}`,
      complexity: analyzeTextComplexity(text),
      readability: analyzeReadability(text)
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'text-to-speech',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { voice, speed, language, textLength: text.length },
        { duration: audioData.duration, wordCount: textAnalysis.wordCount },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        audioData,
        textAnalysis,
        settings: { voice, speed, language },
        processingTime,
        note: 'This is a demo implementation. In production, actual audio would be generated.'
      }
    });

  } catch (error) {
    logger.error('Text to speech error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert text to speech'
    });
  }
});

// Text Summarizer
router.post('/text-summarizer', [
  body('text').isLength({ min: 50 }),
  body('length').optional().isIn(['short','medium','long'])
], async (req, res) => {
  const startTime = Date.now();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { text, length = 'medium' } = req.body;

    let summary = '';
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Summarize the following text in a ${length} length with bullet key points.\n\n${text}`;
        summary = (await generateText(prompt)) || '';
      } catch (e) {}
    }
    if (!summary) {
      const sentences = text.split(/(?<=[.!?])\s+/).slice(0, length === 'short' ? 2 : length === 'medium' ? 4 : 6);
      summary = sentences.join(' ');
    }

    const keywords = extractKeywords(text, 10);

    const processingTime = Date.now() - startTime;
    if (req.trackUsage) req.trackUsage('text-summarizer', req.user?.id, req.ip, req.get('User-Agent'), { length, textLength: text.length }, { keywordCount: keywords.length }, processingTime);
    res.json({ success: true, data: { summary, keywords, processingTime } });
  } catch (error) {
    logger.error('Text summarizer error:', error);
    res.status(500).json({ success: false, message: 'Failed to summarize text' });
  }
});

// Voice Notes to Text (mock STT)
router.post('/voice-notes-to-text', uploadAudio.single('audio'), [
  body('language').optional().isIn(['en','es','fr','de','it'])
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No audio file provided' });
    const { language = 'en' } = req.body;

    // Mock transcript
    const transcript = `This is a mock transcription of your voice note (${req.file.originalname}).`;
    const wordCount = Math.floor(req.file.size / 2000) + 20;
    const confidence = 0.9;

    const processingTime = Date.now() - startTime;
    if (req.trackUsage) req.trackUsage('voice-notes-to-text', req.user?.id, req.ip, req.get('User-Agent'), { language, size: req.file.size }, { wordCount }, processingTime);
    res.json({ success: true, data: { transcript, language, confidence, wordCount, processingTime, note: 'Demo transcription. Integrate local ASR for production.' } });
  } catch (error) {
    logger.error('Voice notes to text error:', error);
    res.status(500).json({ success: false, message: 'Failed to transcribe audio' });
  }
});

// Whisper.cpp transcription (real) if enabled
router.post('/whisper-transcribe', uploadAudio.single('audio'), [ body('language').optional().isString() ], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No audio file provided' });
    const bin = process.env.WHISPER_BIN;
    const model = process.env.WHISPER_MODEL || 'ggml-base.en.bin';
    if (!bin || !fs.existsSync(bin)) return res.status(400).json({ success: false, message: 'Whisper binary not configured' });
    const tmpDir = path.join(process.cwd(), 'uploads', 'audio');
    fs.mkdirSync(tmpDir, { recursive: true });
    const audioPath = path.join(tmpDir, `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_')}`);
    fs.writeFileSync(audioPath, req.file.buffer);
    const args = ['-m', model, '-f', audioPath, '-of', 'json'];
    const proc = spawn(bin, args);
    let out = '', err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', code => {
      if (code !== 0) return res.status(500).json({ success: false, message: 'Whisper failed', error: err });
      try {
        const parsed = JSON.parse(out);
        const text = parsed.text || '';
        res.json({ success: true, data: { transcript: text, raw: parsed } });
      } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to parse whisper output' });
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Transcription failed' });
  }
});

// Coqui/Tortoise TTS integration (real) if enabled
router.post('/tts', [
  body('text').isLength({ min: 1 }),
  body('voice').optional().isString(),
  body('speed').optional().isFloat({ min: 0.5, max: 2.0 }),
  body('language').optional().isString()
], async (req, res) => {
  const start = Date.now();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { text, voice = process.env.TTS_VOICE || 'en_US', speed = 1.0, language = 'en' } = req.body;
    const bin = process.env.TTS_BIN;
    if (!bin || !fs.existsSync(bin)) return res.status(400).json({ success: false, message: 'TTS binary not configured' });
    const outDir = path.join(process.cwd(), 'uploads', 'audio');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `tts_${Date.now()}.wav`);
    // Example CLI args; adjust per your TTS engine
    // Expecting: tts --text "..." --out_path out.wav --voice VOICE --lang en --speed 1.0
    const args = [ '--text', text, '--out_path', outPath, '--voice', voice, '--lang', language, '--speed', String(speed) ];
    const proc = spawn(bin, args, { env: process.env });
    let err = '';
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', code => {
      if (code !== 0) return res.status(500).json({ success: false, message: 'TTS generation failed', error: err });
      const processingTime = Date.now() - start;
      res.json({ success: true, data: { audioUrl: `/uploads/audio/${path.basename(outPath)}`, settings: { voice, speed, language }, processingTime } });
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'TTS failed' });
  }
});

// Helper functions
const generateTemplateBlogIdeas = (niche, contentType, targetAudience, keywords, count) => {
  const templates = {
    'how-to': [
      `How to Get Started with ${niche} for Beginners`,
      `How to Master ${niche} in 30 Days`,
      `How to Avoid Common ${niche} Mistakes`,
      `How to Choose the Right ${niche} Strategy`,
      `How to Optimize Your ${niche} Results`
    ],
    'listicle': [
      `10 Essential ${niche} Tips for ${targetAudience}`,
      `5 ${niche} Trends to Watch This Year`,
      `7 ${niche} Tools Every Professional Needs`,
      `15 ${niche} Hacks That Actually Work`,
      `The Top 12 ${niche} Resources`
    ],
    'review': [
      `${niche} Tools Review: What Works Best`,
      `Comparing the Top ${niche} Solutions`,
      `Is ${niche} Worth the Investment? Honest Review`,
      `${niche} Platform Comparison Guide`,
      `The Best ${niche} Services Reviewed`
    ],
    'tutorial': [
      `Complete ${niche} Tutorial for Beginners`,
      `Step-by-Step ${niche} Implementation Guide`,
      `${niche} Walkthrough: From Setup to Success`,
      `Mastering ${niche}: A Comprehensive Tutorial`,
      `${niche} Best Practices Tutorial`
    ]
  };

  const typeTemplates = templates[contentType] || templates['how-to'];
  const ideas = [];

  for (let i = 0; i < count && i < typeTemplates.length; i++) {
    let title = typeTemplates[i];
    
    // Try to incorporate keywords
    if (keywords.length > 0 && Math.random() > 0.5) {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      title = title.replace(niche, `${niche} ${keyword}`);
    }

    ideas.push({
      title,
      type: contentType,
      difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
      estimatedWords: Math.floor(Math.random() * 1500) + 500,
      source: 'template'
    });
  }

  return ideas;
};

const generateTemplateCaption = (platform, content, tone, includeEmojis, callToAction) => {
  const emojis = includeEmojis ? getRelevantEmojis(content) : [];
  const platformSpecs = getPlatformSpecs(platform);
  
  let caption = '';

  switch (tone) {
    case 'professional':
      caption = `Excited to share insights about ${content}. This represents an important development in our field.`;
      break;
    case 'casual':
      caption = `Just discovered something amazing about ${content}! Had to share this with you all.`;
      break;
    case 'funny':
      caption = `When you realize ${content} is actually this interesting... Mind = blown! 🤯`;
      break;
    case 'inspirational':
      caption = `${content} reminds us that every journey begins with a single step. Keep pushing forward!`;
      break;
    case 'promotional':
      caption = `Don't miss out on ${content}! This is exactly what you've been looking for.`;
      break;
    default:
      caption = `Sharing some thoughts on ${content}. What do you think?`;
  }

  // Add emojis if requested
  if (includeEmojis && emojis.length > 0) {
    caption = `${emojis[0]} ${caption} ${emojis.slice(1, 3).join(' ')}`;
  }

  // Add call to action
  if (callToAction) {
    caption += `\n\n${callToAction}`;
  }

  // Trim to platform limits
  if (caption.length > platformSpecs.maxLength) {
    caption = caption.substring(0, platformSpecs.maxLength - 3) + '...';
  }

  return caption;
};

const generateHashtags = (platform, keywords, content) => {
  const platformHashtags = {
    instagram: ['#instagood', '#photooftheday', '#follow', '#like4like'],
    twitter: ['#trending', '#news', '#update'],
    linkedin: ['#professional', '#business', '#networking'],
    tiktok: ['#fyp', '#viral', '#trending'],
    facebook: ['#share', '#like'],
    general: ['#content', '#social', '#media']
  };

  const baseHashtags = platformHashtags[platform] || platformHashtags.general;
  const keywordHashtags = keywords.map(keyword => `#${keyword.replace(/\s+/g, '').toLowerCase()}`);
  
  // Generate content-based hashtags
  const contentWords = extractKeywords(content, 3);
  const contentHashtags = contentWords.map(word => `#${word.replace(/\s+/g, '').toLowerCase()}`);

  return [...keywordHashtags, ...contentHashtags, ...baseHashtags.slice(0, 3)]
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .slice(0, 10);
};

const analyzeHeadline = (headline, type) => {
  const words = headline.split(' ');
  const characters = headline.length;
  
  // Analyze different components
  const analysis = {
    length: {
      characters,
      words: words.length,
      score: getHeadlineLengthScore(characters, type)
    },
    sentiment: analyzeSentiment(headline),
    powerWords: countPowerWords(headline),
    emotionalWords: countEmotionalWords(headline),
    numbers: (headline.match(/\d+/g) || []).length,
    questions: headline.includes('?') ? 1 : 0,
    capitalization: analyzeCapitalization(headline),
    readability: analyzeReadability(headline)
  };

  // Calculate overall score
  analysis.overallScore = calculateHeadlineScore(analysis);

  return analysis;
};

const generateHeadlineImprovements = (headline, analysis, type) => {
  const suggestions = [];

  if (analysis.length.score < 70) {
    if (analysis.length.characters < 30) {
      suggestions.push('Consider making your headline longer for better SEO impact');
    } else {
      suggestions.push('Try shortening your headline for better readability');
    }
  }

  if (analysis.powerWords < 1) {
    suggestions.push('Add power words like "Ultimate", "Essential", "Proven" to increase engagement');
  }

  if (analysis.numbers === 0 && type === 'blog') {
    suggestions.push('Consider adding numbers (e.g., "5 Ways", "10 Tips") to improve click-through rates');
  }

  if (analysis.sentiment.sentiment === 'negative') {
    suggestions.push('Try using more positive language to improve appeal');
  }

  if (analysis.emotionalWords < 1) {
    suggestions.push('Include emotional words to create stronger connection with readers');
  }

  return suggestions;
};

const generateTemplateAlternatives = (headline, type) => {
  const alternatives = [];
  const baseWords = extractKeywords(headline, 3);
  
  const templates = {
    blog: [
      `The Ultimate Guide to ${baseWords[0]}`,
      `${baseWords[0]}: Everything You Need to Know`,
      `How to Master ${baseWords[0]} Like a Pro`,
      `${baseWords[0]} Secrets That Actually Work`,
      `The Complete ${baseWords[0]} Handbook`
    ],
    email: [
      `Don't Miss: ${baseWords[0]} Updates`,
      `Exclusive ${baseWords[0]} Insights Inside`,
      `Your ${baseWords[0]} Journey Starts Here`,
      `Breaking: ${baseWords[0]} News`,
      `Limited Time: ${baseWords[0]} Offer`
    ],
    social: [
      `${baseWords[0]} That Will Blow Your Mind`,
      `This ${baseWords[0]} Changed Everything`,
      `Why Everyone's Talking About ${baseWords[0]}`,
      `${baseWords[0]} Hack That Actually Works`,
      `The ${baseWords[0]} Secret Nobody Tells You`
    ]
  };

  return templates[type] || templates.blog;
};

// Utility functions
const getPlatformSpecs = (platform) => {
  const specs = {
    instagram: { maxLength: 2200, optimalLength: 150 },
    facebook: { maxLength: 63206, optimalLength: 80 },
    twitter: { maxLength: 280, optimalLength: 100 },
    linkedin: { maxLength: 3000, optimalLength: 150 },
    tiktok: { maxLength: 300, optimalLength: 100 },
    general: { maxLength: 1000, optimalLength: 150 }
  };
  return specs[platform] || specs.general;
};

const getRelevantEmojis = (content) => {
  const emojiMap = {
    'business': ['💼', '📈', '💰'],
    'tech': ['💻', '🚀', '⚡'],
    'food': ['🍕', '🍔', '🥗'],
    'travel': ['✈️', '🌍', '📸'],
    'fitness': ['💪', '🏃', '🏋️'],
    'education': ['📚', '🎓', '📝'],
    'default': ['✨', '🔥', '💡']
  };

  const lowerContent = content.toLowerCase();
  for (const [category, emojis] of Object.entries(emojiMap)) {
    if (lowerContent.includes(category)) {
      return emojis;
    }
  }
  return emojiMap.default;
};

const isPlatformOptimized = (platform, caption) => {
  const specs = getPlatformSpecs(platform);
  return {
    lengthOptimal: caption.length <= specs.optimalLength,
    withinLimits: caption.length <= specs.maxLength,
    hasHashtags: caption.includes('#'),
    hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(caption)
  };
};

const getHeadlineLengthScore = (characters, type) => {
  const optimal = {
    blog: { min: 50, max: 70 },
    email: { min: 30, max: 50 },
    ad: { min: 25, max: 40 },
    social: { min: 40, max: 100 },
    news: { min: 45, max: 65 }
  };

  const range = optimal[type] || optimal.blog;
  if (characters >= range.min && characters <= range.max) {
    return 100;
  } else if (characters < range.min) {
    return Math.max(0, (characters / range.min) * 100);
  } else {
    return Math.max(0, 100 - ((characters - range.max) / range.max) * 50);
  }
};

const countPowerWords = (text) => {
  const powerWords = ['ultimate', 'essential', 'proven', 'secret', 'exclusive', 'amazing', 'incredible', 'powerful', 'effective', 'guaranteed'];
  const lowerText = text.toLowerCase();
  return powerWords.filter(word => lowerText.includes(word)).length;
};

const countEmotionalWords = (text) => {
  const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'wonderful', 'awful', 'fantastic', 'horrible', 'brilliant', 'devastating'];
  const lowerText = text.toLowerCase();
  return emotionalWords.filter(word => lowerText.includes(word)).length;
};

const analyzeCapitalization = (text) => {
  const words = text.split(' ');
  const capitalizedWords = words.filter(word => word[0] && word[0] === word[0].toUpperCase()).length;
  return {
    capitalizedWords,
    percentage: (capitalizedWords / words.length) * 100,
    isAllCaps: text === text.toUpperCase(),
    isTitleCase: words.every(word => word[0] === word[0].toUpperCase())
  };
};

const calculateHeadlineScore = (analysis) => {
  let score = 0;
  
  // Length score (30% weight)
  score += analysis.length.score * 0.3;
  
  // Power words (20% weight)
  score += Math.min(analysis.powerWords * 20, 100) * 0.2;
  
  // Emotional words (15% weight)
  score += Math.min(analysis.emotionalWords * 25, 100) * 0.15;
  
  // Numbers (10% weight)
  score += Math.min(analysis.numbers * 50, 100) * 0.1;
  
  // Sentiment (15% weight)
  const sentimentScore = analysis.sentiment.sentiment === 'positive' ? 100 : 
                        analysis.sentiment.sentiment === 'neutral' ? 70 : 50;
  score += sentimentScore * 0.15;
  
  // Readability (10% weight)
  score += Math.min(analysis.readability.fleschScore, 100) * 0.1;
  
  return Math.round(score);
};

const analyzeTextComplexity = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;
  
  if (avgWordsPerSentence < 10) return 'simple';
  if (avgWordsPerSentence < 20) return 'moderate';
  return 'complex';
};

export default router;