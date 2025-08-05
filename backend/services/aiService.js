import { GPT4All } from 'gpt4all';
import { NlpManager } from 'node-nlp';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIService {
  constructor() {
    this.gpt4all = null;
    this.nlpManager = new NlpManager({ languages: ['en'] });
    this.sentiment = new Sentiment();
    this.isLocalAIEnabled = process.env.ENABLE_LOCAL_AI === 'true';
    this.modelPath = process.env.AI_MODEL_PATH || path.join(__dirname, '../models');
    this.modelFile = process.env.GPT4ALL_MODEL || 'ggml-gpt4all-j-v1.3-groovy.bin';
    
    this.initializeAI();
  }

  async initializeAI() {
    try {
      if (this.isLocalAIEnabled) {
        await this.initializeLocalAI();
      }
      await this.initializeNLP();
      logger.info('AI Service initialized successfully');
    } catch (error) {
      logger.error('AI Service initialization failed:', error);
    }
  }

  async initializeLocalAI() {
    try {
      const modelFilePath = path.join(this.modelPath, this.modelFile);
      
      if (!fs.existsSync(modelFilePath)) {
        logger.warn(`GPT4All model not found at ${modelFilePath}. Using fallback methods.`);
        return;
      }

      this.gpt4all = new GPT4All(this.modelFile, {
        modelPath: this.modelPath,
        allowDownload: false
      });

      await this.gpt4all.init();
      logger.info('GPT4All model loaded successfully');
    } catch (error) {
      logger.error('Failed to initialize GPT4All:', error);
      this.gpt4all = null;
    }
  }

  async initializeNLP() {
    try {
      // Train basic intents for tool suggestions
      this.nlpManager.addLanguage('en');
      
      // Business intents
      this.nlpManager.addDocument('en', 'I need help with my business', 'business.help');
      this.nlpManager.addDocument('en', 'business name ideas', 'business.naming');
      this.nlpManager.addDocument('en', 'create a logo', 'business.branding');
      this.nlpManager.addDocument('en', 'make an invoice', 'business.invoice');
      this.nlpManager.addDocument('en', 'design a flyer', 'business.marketing');

      // Career intents
      this.nlpManager.addDocument('en', 'help with my resume', 'career.resume');
      this.nlpManager.addDocument('en', 'write a cover letter', 'career.cover_letter');
      this.nlpManager.addDocument('en', 'LinkedIn profile', 'career.linkedin');
      this.nlpManager.addDocument('en', 'job interview preparation', 'career.interview');

      // Content intents
      this.nlpManager.addDocument('en', 'blog post ideas', 'content.blog');
      this.nlpManager.addDocument('en', 'social media captions', 'content.social');
      this.nlpManager.addDocument('en', 'text to speech', 'content.tts');

      // Video intents
      this.nlpManager.addDocument('en', 'edit video', 'video.editing');
      this.nlpManager.addDocument('en', 'create gif', 'video.gif');
      this.nlpManager.addDocument('en', 'video thumbnail', 'video.thumbnail');

      // Emotional intents
      this.nlpManager.addDocument('en', 'feeling sad', 'emotional.support');
      this.nlpManager.addDocument('en', 'mental health', 'emotional.wellness');
      this.nlpManager.addDocument('en', 'mood tracking', 'emotional.tracking');

      // Add responses
      this.nlpManager.addAnswer('en', 'business.help', 'I can help you with business tools like name generation, logo design, invoicing, and marketing materials.');
      this.nlpManager.addAnswer('en', 'business.naming', 'Try our Business Name Generator to create unique names for your business.');
      this.nlpManager.addAnswer('en', 'career.resume', 'Our Resume Builder can help you create a professional resume with AI suggestions.');
      this.nlpManager.addAnswer('en', 'content.blog', 'Use our Blog Idea Generator to get inspired content ideas for your blog.');

      await this.nlpManager.train();
      this.nlpManager.save();
      
      logger.info('NLP Manager trained successfully');
    } catch (error) {
      logger.error('Failed to initialize NLP:', error);
    }
  }

  async generateText(prompt, options = {}) {
    const {
      maxTokens = 150,
      temperature = 0.7,
      category = 'general',
      fallbackType = 'template'
    } = options;

    try {
      // Try local AI first if available
      if (this.gpt4all) {
        const response = await this.gpt4all.generate(prompt, {
          max_tokens: maxTokens,
          temp: temperature
        });
        
        if (response && response.trim()) {
          logger.info('Generated text using GPT4All');
          return response.trim();
        }
      }

      // Fallback to category-specific generation
      return await this.generateWithFallback(prompt, category, options);

    } catch (error) {
      logger.error('Text generation error:', error);
      return await this.generateWithFallback(prompt, category, options);
    }
  }

  async generateWithFallback(prompt, category, options = {}) {
    try {
      switch (category) {
        case 'business_names':
          return this.generateBusinessNames(prompt, options);
        case 'slogans':
          return this.generateSlogans(prompt, options);
        case 'blog_ideas':
          return this.generateBlogIdeas(prompt, options);
        case 'social_captions':
          return this.generateSocialCaptions(prompt, options);
        case 'hashtags':
          return this.generateHashtags(prompt, options);
        case 'resume_content':
          return this.generateResumeContent(prompt, options);
        case 'cover_letter':
          return this.generateCoverLetter(prompt, options);
        default:
          return this.generateGenericContent(prompt, options);
      }
    } catch (error) {
      logger.error('Fallback generation error:', error);
      return this.generateTemplateResponse(category);
    }
  }

  generateBusinessNames(prompt, options = {}) {
    const { industry, keywords = [], style = 'modern', count = 10 } = options;
    const names = [];
    
    const prefixes = {
      modern: ['Neo', 'Pro', 'Smart', 'Digital', 'Cloud', 'Sync', 'Flow', 'Peak'],
      classic: ['Premier', 'Elite', 'Royal', 'Grand', 'Prime', 'Superior', 'Golden'],
      creative: ['Spark', 'Bloom', 'Zen', 'Vibe', 'Muse', 'Echo', 'Pulse', 'Flux'],
      tech: ['Byte', 'Code', 'Data', 'Cyber', 'Logic', 'Binary', 'Pixel', 'Node'],
      professional: ['Alpha', 'Apex', 'Summit', 'Core', 'Focus', 'Impact', 'Vision']
    };

    const suffixes = {
      modern: ['Hub', 'Lab', 'Works', 'Studio', 'Space', 'Zone', 'Collective'],
      classic: ['Associates', 'Partners', 'Group', 'Company', 'Enterprises'],
      creative: ['Creative', 'Design', 'Arts', 'Craft', 'Studio', 'Workshop'],
      tech: ['Tech', 'Systems', 'Solutions', 'Digital', 'Labs', 'Innovations'],
      professional: ['Consulting', 'Services', 'Solutions', 'Partners', 'Group']
    };

    const industryTerms = {
      technology: ['Tech', 'Digital', 'Cyber', 'Data', 'Cloud'],
      healthcare: ['Health', 'Care', 'Medical', 'Wellness', 'Life'],
      finance: ['Capital', 'Finance', 'Invest', 'Money', 'Bank'],
      education: ['Learn', 'Edu', 'Knowledge', 'Academy', 'Study'],
      retail: ['Shop', 'Store', 'Market', 'Trade', 'Commerce']
    };

    const styleTerms = prefixes[style] || prefixes.modern;
    const styleSuffixes = suffixes[style] || suffixes.modern;
    const industryWords = industryTerms[industry?.toLowerCase()] || [];

    // Generate names using different patterns
    for (let i = 0; i < count; i++) {
      let name = '';
      const pattern = i % 4;

      switch (pattern) {
        case 0: // Prefix + Industry + Suffix
          name = `${this.randomChoice(styleTerms)}${this.randomChoice(industryWords)}${this.randomChoice(styleSuffixes)}`;
          break;
        case 1: // Keyword + Suffix
          if (keywords.length > 0) {
            name = `${this.randomChoice(keywords)}${this.randomChoice(styleSuffixes)}`;
          } else {
            name = `${this.randomChoice(styleTerms)}${this.randomChoice(styleSuffixes)}`;
          }
          break;
        case 2: // Prefix + Keyword
          if (keywords.length > 0) {
            name = `${this.randomChoice(styleTerms)}${this.randomChoice(keywords)}`;
          } else {
            name = `${this.randomChoice(styleTerms)}${this.randomChoice(industryWords)}`;
          }
          break;
        case 3: // Creative combination
          const word1 = this.randomChoice([...styleTerms, ...industryWords, ...keywords]);
          const word2 = this.randomChoice(styleSuffixes);
          name = `${word1}${word2}`;
          break;
      }

      if (name && !names.includes(name)) {
        names.push(name);
      }
    }

    return names.slice(0, count);
  }

  generateSlogans(prompt, options = {}) {
    const { businessName, industry, tone = 'professional', keywords = [], count = 10 } = options;
    const slogans = [];

    const templates = {
      professional: [
        `${businessName} - Excellence in ${industry}`,
        `Your trusted ${industry} partner`,
        `${businessName} - Where quality meets innovation`,
        `Elevating ${industry} standards`,
        `${businessName} - Professional ${industry} solutions`
      ],
      friendly: [
        `${businessName} - Your friendly ${industry} experts`,
        `Making ${industry} simple and fun`,
        `${businessName} - We care about your success`,
        `Your ${industry} journey starts here`,
        `${businessName} - Always here to help`
      ],
      bold: [
        `${businessName} - Revolutionizing ${industry}`,
        `Break boundaries with ${businessName}`,
        `${businessName} - Dare to be different`,
        `Leading the ${industry} revolution`,
        `${businessName} - Bold solutions, brilliant results`
      ],
      creative: [
        `${businessName} - Where creativity meets ${industry}`,
        `Inspiring ${industry} innovation`,
        `${businessName} - Think different, achieve more`,
        `Creative solutions for ${industry}`,
        `${businessName} - Imagination in action`
      ]
    };

    const toneTemplates = templates[tone] || templates.professional;
    
    // Add keyword-based slogans
    if (keywords.length > 0) {
      keywords.forEach(keyword => {
        slogans.push(`${businessName} - ${keyword} redefined`);
        slogans.push(`Experience ${keyword} with ${businessName}`);
      });
    }

    // Add template-based slogans
    toneTemplates.forEach(template => {
      slogans.push(template);
    });

    // Add generic inspiring slogans
    const genericSlogans = [
      `${businessName} - Building tomorrow, today`,
      `Your success is our mission`,
      `${businessName} - Innovation you can trust`,
      `Empowering your ${industry} goals`,
      `${businessName} - Excellence delivered`
    ];

    slogans.push(...genericSlogans);

    return this.shuffleArray(slogans).slice(0, count);
  }

  generateBlogIdeas(prompt, options = {}) {
    const { industry, keywords = [], audience = 'general', count = 10 } = options;
    const ideas = [];

    const templates = [
      `10 Essential ${industry} Tips for Beginners`,
      `The Future of ${industry}: Trends to Watch`,
      `How to Choose the Right ${industry} Solution`,
      `Common ${industry} Mistakes and How to Avoid Them`,
      `${industry} Best Practices for ${audience}`,
      `The Ultimate Guide to ${industry}`,
      `${industry} Tools That Will Transform Your Business`,
      `Why ${industry} Matters in 2024`,
      `${industry} Success Stories: Real Examples`,
      `Getting Started with ${industry}: A Step-by-Step Guide`
    ];

    // Add keyword-based ideas
    keywords.forEach(keyword => {
      ideas.push(`How ${keyword} is Changing ${industry}`);
      ideas.push(`${keyword}: The Complete Guide`);
      ideas.push(`5 Ways ${keyword} Can Improve Your Business`);
    });

    // Add template-based ideas
    templates.forEach(template => {
      ideas.push(template);
    });

    return this.shuffleArray(ideas).slice(0, count);
  }

  generateSocialCaptions(prompt, options = {}) {
    const { platform = 'general', tone = 'engaging', hashtags = true, count = 5 } = options;
    const captions = [];

    const templates = {
      engaging: [
        "Ready to transform your day? ✨",
        "This is your sign to take that next step! 💪",
        "Small steps, big changes 🌟",
        "Your journey starts now! 🚀",
        "Making dreams happen, one day at a time ✨"
      ],
      professional: [
        "Excellence is not a skill, it's an attitude.",
        "Innovation drives everything we do.",
        "Building the future, together.",
        "Where expertise meets passion.",
        "Professional solutions for modern challenges."
      ],
      inspirational: [
        "Believe in yourself and magic happens ✨",
        "Every expert was once a beginner 🌱",
        "Your potential is limitless 🌟",
        "Success is a journey, not a destination 🚀",
        "Dream big, work hard, stay focused 💫"
      ]
    };

    const platformHashtags = {
      instagram: ['#instagood', '#photooftheday', '#beautiful', '#happy', '#love'],
      twitter: ['#motivation', '#success', '#inspiration', '#goals', '#mindset'],
      linkedin: ['#professional', '#career', '#business', '#networking', '#growth'],
      tiktok: ['#fyp', '#viral', '#trending', '#creative', '#fun']
    };

    const selectedTemplates = templates[tone] || templates.engaging;
    selectedTemplates.forEach(template => {
      let caption = template;
      
      if (hashtags) {
        const tags = platformHashtags[platform] || platformHashtags.instagram;
        caption += '\n\n' + tags.slice(0, 3).join(' ');
      }
      
      captions.push(caption);
    });

    return captions.slice(0, count);
  }

  generateHashtags(prompt, options = {}) {
    const { category, keywords = [], trending = true, count = 20 } = options;
    const hashtags = [];

    const categoryTags = {
      business: ['business', 'entrepreneur', 'startup', 'success', 'growth', 'innovation'],
      lifestyle: ['lifestyle', 'daily', 'life', 'inspiration', 'motivation', 'wellness'],
      technology: ['tech', 'innovation', 'digital', 'future', 'ai', 'automation'],
      fitness: ['fitness', 'health', 'workout', 'gym', 'strong', 'healthy'],
      food: ['food', 'foodie', 'delicious', 'recipe', 'cooking', 'yummy'],
      travel: ['travel', 'adventure', 'explore', 'wanderlust', 'vacation', 'journey']
    };

    const popularTags = ['instagood', 'photooftheday', 'beautiful', 'happy', 'love', 'follow', 'like4like'];
    const trendingTags = ['viral', 'trending', 'fyp', 'explore', 'discover', 'new'];

    // Add category-specific tags
    if (categoryTags[category]) {
      hashtags.push(...categoryTags[category].map(tag => `#${tag}`));
    }

    // Add keyword-based tags
    keywords.forEach(keyword => {
      hashtags.push(`#${keyword.toLowerCase().replace(/\s+/g, '')}`);
    });

    // Add popular tags
    hashtags.push(...popularTags.map(tag => `#${tag}`));

    // Add trending tags if requested
    if (trending) {
      hashtags.push(...trendingTags.map(tag => `#${tag}`));
    }

    return this.shuffleArray([...new Set(hashtags)]).slice(0, count);
  }

  async analyzeSentiment(text) {
    try {
      const result = this.sentiment.analyze(text);
      
      return {
        score: result.score,
        comparative: result.comparative,
        calculation: result.calculation,
        tokens: result.tokens,
        words: result.words,
        positive: result.positive,
        negative: result.negative,
        label: this.getSentimentLabel(result.score)
      };
    } catch (error) {
      logger.error('Sentiment analysis error:', error);
      return {
        score: 0,
        comparative: 0,
        label: 'neutral'
      };
    }
  }

  getSentimentLabel(score) {
    if (score > 2) return 'very positive';
    if (score > 0) return 'positive';
    if (score < -2) return 'very negative';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  async extractKeywords(text, count = 10) {
    try {
      const doc = nlp(text);
      const nouns = doc.nouns().out('array');
      const adjectives = doc.adjectives().out('array');
      const verbs = doc.verbs().out('array');
      
      const keywords = [...nouns, ...adjectives, ...verbs]
        .filter(word => word.length > 2)
        .reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});

      return Object.entries(keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, count)
        .map(([word]) => word);
    } catch (error) {
      logger.error('Keyword extraction error:', error);
      return [];
    }
  }

  async suggestTools(query) {
    try {
      const response = await this.nlpManager.process('en', query);
      const intent = response.intent;
      const confidence = response.score;

      const toolSuggestions = {
        'business.help': ['business-name-generator', 'slogan-creator', 'logo-sketch-wizard'],
        'business.naming': ['business-name-generator'],
        'business.branding': ['logo-sketch-wizard', 'slogan-creator'],
        'business.invoice': ['invoice-maker'],
        'business.marketing': ['smart-flyer-designer'],
        'career.resume': ['resume-builder'],
        'career.cover_letter': ['cover-letter-ai'],
        'career.linkedin': ['linkedin-summary'],
        'career.interview': ['interview-coach'],
        'content.blog': ['blog-idea-generator'],
        'content.social': ['caption-generator', 'hashtag-generator'],
        'content.tts': ['text-to-speech'],
        'video.editing': ['video-trimmer'],
        'video.gif': ['gif-maker'],
        'video.thumbnail': ['thumbnail-selector'],
        'emotional.support': ['mindmirror', 'therapet'],
        'emotional.wellness': ['moodboard-ai'],
        'emotional.tracking': ['mindmirror']
      };

      return {
        intent,
        confidence,
        tools: toolSuggestions[intent] || [],
        response: response.answer || "I can help you find the right tools for your needs!"
      };
    } catch (error) {
      logger.error('Tool suggestion error:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        tools: [],
        response: "I'm here to help! Try asking about business, career, content, or video tools."
      };
    }
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  generateTemplateResponse(category) {
    const templates = {
      business_names: ['InnovateCorp', 'NextGenSolutions', 'ProActiveGroup'],
      slogans: ['Excellence in Everything', 'Your Success, Our Mission', 'Innovation Delivered'],
      blog_ideas: ['10 Tips for Success', 'The Future is Now', 'Getting Started Guide'],
      default: ['AI service is temporarily unavailable. Please try again later.']
    };

    return templates[category] || templates.default;
  }

  async cleanup() {
    try {
      if (this.gpt4all) {
        await this.gpt4all.dispose();
      }
      logger.info('AI Service cleanup completed');
    } catch (error) {
      logger.error('AI Service cleanup error:', error);
    }
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;