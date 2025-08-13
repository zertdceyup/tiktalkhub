import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { generateText, extractKeywords } from '../../services/aiService.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Hashtag Generator
router.post('/hashtag-generator', [
  body('content').isLength({ min: 1, max: 500 }),
  body('platform').optional().isIn(['instagram', 'twitter', 'tiktok', 'linkedin', 'general']),
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

    const { content, platform = 'general', count = 20 } = req.body;

    // Extract keywords from content
    const keywords = extractKeywords(content, 10);

    // Generate hashtags based on content and platform
    const hashtags = generateHashtagsForPlatform(content, keywords, platform, count);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'hashtag-generator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { platform, contentLength: content.length, count },
        { hashtagsGenerated: hashtags.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        hashtags,
        keywords,
        platform,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Hashtag generator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hashtags'
    });
  }
});

// Twitter Thread Formatter
router.post('/twitter-thread-formatter', [
  body('content').isLength({ min: 1, max: 10000 }),
  body('maxTweetLength').optional().isInt({ min: 100, max: 280 })
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

    const { content, maxTweetLength = 280 } = req.body;

    // Format content into Twitter thread
    const thread = formatTwitterThread(content, maxTweetLength);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'twitter-thread-formatter',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { contentLength: content.length, maxTweetLength },
        { tweetCount: thread.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        thread,
        totalTweets: thread.length,
        originalLength: content.length,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Twitter thread formatter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to format Twitter thread'
    });
  }
});

// Facebook Caption Creator
router.post('/facebook-caption-creator', [
  body('topic').isLength({ min: 1, max: 200 }),
  body('tone').optional().isIn(['professional', 'casual', 'engaging', 'promotional']),
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

    const { topic, tone = 'engaging', includeEmojis = true, callToAction = '' } = req.body;

    // Generate Facebook caption
    const caption = generateFacebookCaption(topic, tone, includeEmojis, callToAction);

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'facebook-caption-creator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { tone, includeEmojis, hasCallToAction: !!callToAction },
        { captionLength: caption.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        caption,
        topic,
        tone,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Facebook caption creator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Facebook caption'
    });
  }
});

// Bio Link Builder
router.post('/bio-link-builder', [
  body('title').isLength({ min: 1, max: 80 }),
  body('bio').optional().isLength({ max: 200 }),
  body('theme').optional().isIn(['light','dark','neon']),
  body('links').isArray({ min: 1 }),
], async (req, res) => {
  const started = Date.now();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { title, bio = '', theme = 'light', links = [], socials = {} } = req.body;

    const shareId = `bio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const themeConfig = theme === 'neon' ? {
      bg: '#0b0b1f', text: '#ffffff', accent: '#a78bfa', button: '#22d3ee'
    } : theme === 'dark' ? {
      bg: '#111827', text: '#f9fafb', accent: '#6366f1', button: '#10b981'
    } : {
      bg: '#ffffff', text: '#111827', accent: '#7c3aed', button: '#2563eb'
    };

    const payload = { shareId, title, bio, theme, themeConfig, links, socials, createdAt: new Date().toISOString() };

    // Persist JSON (best-effort)
    try {
      const dir = path.join(process.cwd(), 'uploads', 'bio');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${shareId}.json`), JSON.stringify(payload, null, 2));
    } catch (e) {
      // ignore persistence failure in demo
    }

    const preview = {
      url: `/uploads/bio/${shareId}.json`,
      theme: themeConfig,
      linkCount: links.length
    };

    const processingTime = Date.now() - started;

    if (req.trackUsage) {
      req.trackUsage('bio-link-builder', req.user?.id, req.ip, req.get('User-Agent'), { theme, linkCount: links.length }, { shareId }, processingTime);
    }

    res.json({ success: true, data: { shareId, preview, processingTime, note: 'Demo implementation; JSON config persisted for preview.' } });
  } catch (error) {
    logger.error('Bio link builder error:', error);
    res.status(500).json({ success: false, message: 'Failed to build bio link' });
  }
});

// Link Shortener
router.post('/link-shortener', [
  body('url').isURL({ require_protocol: true }),
  body('customCode').optional().isLength({ min: 3, max: 20 }),
  body('expireDays').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  const started = Date.now();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { url, customCode, expireDays = 90 } = req.body;
    const code = (customCode || Math.random().toString(36).slice(2, 8)).toLowerCase();
    const shortBase = process.env.SHORT_BASE_URL || 'https://tiktalkhub.link';
    const shortUrl = `${shortBase}/s/${code}`;

    const expiresAt = new Date(Date.now() + Number(expireDays) * 86400000).toISOString();

    const processingTime = Date.now() - started;

    if (req.trackUsage) {
      req.trackUsage('link-shortener', req.user?.id, req.ip, req.get('User-Agent'), { expireDays }, { code }, processingTime);
    }

    res.json({ success: true, data: { shortCode: code, shortUrl, target: url, expiresAt, processingTime, note: 'Demo shortener; no redirect persistence in this demo.' } });
  } catch (error) {
    logger.error('Link shortener error:', error);
    res.status(500).json({ success: false, message: 'Failed to shorten link' });
  }
});

// Helper functions
const generateHashtagsForPlatform = (content, keywords, platform, count) => {
  const platformHashtags = {
    instagram: ['#instagood', '#photooftheday', '#beautiful', '#happy', '#love', '#instadaily', '#nature', '#art', '#style', '#life'],
    twitter: ['#trending', '#news', '#update', '#breaking', '#live', '#follow', '#retweet', '#discussion', '#community', '#thoughts'],
    tiktok: ['#fyp', '#viral', '#trending', '#foryou', '#challenge', '#dance', '#comedy', '#lifestyle', '#tips', '#hack'],
    linkedin: ['#professional', '#business', '#career', '#networking', '#leadership', '#innovation', '#growth', '#success', '#team', '#industry'],
    general: ['#content', '#social', '#media', '#digital', '#online', '#community', '#share', '#engage', '#connect', '#inspire']
  };

  const baseHashtags = platformHashtags[platform] || platformHashtags.general;
  
  // Generate hashtags from keywords
  const keywordHashtags = keywords.map(keyword => 
    `#${keyword.replace(/\s+/g, '').toLowerCase()}`
  );

  // Generate content-based hashtags
  const contentWords = content.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5);
  
  const contentHashtags = contentWords.map(word => 
    `#${word.replace(/[^a-z0-9]/g, '')}`
  );

  // Combine all hashtags
  const allHashtags = [...keywordHashtags, ...contentHashtags, ...baseHashtags]
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .filter(tag => tag.length > 2)
    .slice(0, count);

  return allHashtags;
};

const formatTwitterThread = (content, maxLength) => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const thread = [];
  let currentTweet = '';
  let tweetNumber = 1;

  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    const threadPrefix = tweetNumber === 1 ? '' : `${tweetNumber}/ `;
    const potentialTweet = currentTweet 
      ? `${currentTweet} ${cleanSentence}.`
      : `${threadPrefix}${cleanSentence}.`;

    if (potentialTweet.length <= maxLength) {
      currentTweet = potentialTweet;
    } else {
      if (currentTweet) {
        thread.push(currentTweet);
        tweetNumber++;
      }
      
      // Handle long sentences
      if (`${tweetNumber}/ ${cleanSentence}.`.length > maxLength) {
        const words = cleanSentence.split(' ');
        let chunk = `${tweetNumber}/ `;
        
        for (const word of words) {
          if (`${chunk} ${word}`.length <= maxLength - 1) {
            chunk += ` ${word}`;
          } else {
            thread.push(chunk.trim() + '...');
            tweetNumber++;
            chunk = `${tweetNumber}/ ${word}`;
          }
        }
        currentTweet = chunk + '.';
      } else {
        currentTweet = `${tweetNumber}/ ${cleanSentence}.`;
      }
    }
  }

  if (currentTweet) {
    thread.push(currentTweet);
  }

  return thread;
};

const generateFacebookCaption = (topic, tone, includeEmojis, callToAction) => {
  const emojis = includeEmojis ? ['✨', '🔥', '💡', '🚀', '💪', '🎯', '📈', '🌟'] : [];
  
  let caption = '';

  switch (tone) {
    case 'professional':
      caption = `We're excited to share insights about ${topic}. This represents an important development that could benefit many professionals in our industry.`;
      break;
    case 'casual':
      caption = `Hey everyone! Just wanted to share something cool about ${topic} that I discovered recently. Thought you might find it interesting too!`;
      break;
    case 'engaging':
      caption = `Let's talk about ${topic}! ${includeEmojis ? emojis[0] : ''} This is something that's been on my mind lately, and I'd love to hear your thoughts.`;
      break;
    case 'promotional':
      caption = `Don't miss out on this amazing opportunity related to ${topic}! This could be exactly what you've been looking for.`;
      break;
    default:
      caption = `Sharing some thoughts on ${topic}. What's your experience with this?`;
  }

  // Add engaging elements
  if (includeEmojis && emojis.length > 0) {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    caption += ` ${randomEmoji}`;
  }

  // Add call to action
  if (callToAction) {
    caption += `\n\n${callToAction}`;
  } else {
    caption += '\n\nWhat do you think? Share your thoughts in the comments below! 👇';
  }

  return caption;
};

export default router;