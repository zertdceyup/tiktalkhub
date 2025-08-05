import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { generateText, extractKeywords } from '../../services/aiService.js';

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