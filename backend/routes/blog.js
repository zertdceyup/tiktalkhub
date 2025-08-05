import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database/init.js';
import { optionalAuth } from '../middleware/auth.js';
import { generateText, analyzeSentiment, extractKeywords } from '../services/aiService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply optional auth to all routes
router.use(optionalAuth);

// Get all published blog posts
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    const offset = (page - 1) * limit;

    let query = `
      SELECT bp.*, u.username as author_username, u.first_name, u.last_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.status = 'published'
    `;
    
    const params = [];

    if (category) {
      query += ' AND bp.category = ?';
      params.push(category);
    }

    if (featured) {
      query += ' AND bp.featured = 1';
    }

    query += ' ORDER BY bp.published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM blog_posts WHERE status = "published"';
    const countParams = [];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (featured) {
      countQuery += ' AND featured = 1';
    }

    const total = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: {
        posts: posts.map(post => ({
          ...post,
          author: {
            username: post.author_username,
            name: `${post.first_name || ''} ${post.last_name || ''}`.trim() || post.author_username
          }
        })),
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Blog posts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts'
    });
  }
});

// Get blog post by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const post = db.prepare(`
      SELECT bp.*, u.username as author_username, u.first_name, u.last_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = ? AND bp.status = 'published'
    `).get(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    db.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?').run(post.id);

    // Get related posts
    const relatedPosts = db.prepare(`
      SELECT id, title, slug, excerpt, featured_image, published_at
      FROM blog_posts 
      WHERE status = 'published' AND id != ? AND (category = ? OR tags LIKE ?)
      ORDER BY published_at DESC 
      LIMIT 3
    `).all(post.id, post.category, `%${post.tags}%`);

    // Extract keywords from content for SEO
    const keywords = extractKeywords(post.content, 10);

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          author: {
            username: post.author_username,
            name: `${post.first_name || ''} ${post.last_name || ''}`.trim() || post.author_username
          },
          keywords,
          views: post.views + 1
        },
        relatedPosts
      }
    });

  } catch (error) {
    logger.error('Blog post fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post'
    });
  }
});

// Get blog categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        category,
        COUNT(*) as post_count
      FROM blog_posts 
      WHERE status = 'published' AND category IS NOT NULL
      GROUP BY category 
      ORDER BY post_count DESC
    `).all();

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    logger.error('Blog categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog categories'
    });
  }
});

// Search blog posts
router.get('/search', (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = `
      SELECT bp.*, u.username as author_username, u.first_name, u.last_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.status = 'published' 
        AND (bp.title LIKE ? OR bp.content LIKE ? OR bp.tags LIKE ?)
      ORDER BY bp.published_at DESC 
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${query}%`;
    const posts = db.prepare(searchQuery).all(
      searchPattern, 
      searchPattern, 
      searchPattern, 
      limit, 
      offset
    );

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM blog_posts 
      WHERE status = 'published' 
        AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)
    `;

    const total = db.prepare(countQuery).get(searchPattern, searchPattern, searchPattern);

    res.json({
      success: true,
      data: {
        query,
        posts: posts.map(post => ({
          ...post,
          author: {
            username: post.author_username,
            name: `${post.first_name || ''} ${post.last_name || ''}`.trim() || post.author_username
          }
        })),
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Blog search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search blog posts'
    });
  }
});

// Generate SEO-optimized blog post (AI-powered)
router.post('/generate', [
  body('topic').isLength({ min: 1, max: 200 }),
  body('keywords').optional().isArray(),
  body('targetAudience').optional().isLength({ max: 200 }),
  body('tone').optional().isIn(['professional', 'casual', 'technical', 'friendly']),
  body('length').optional().isIn(['short', 'medium', 'long'])
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
      topic, 
      keywords = [], 
      targetAudience = 'general audience', 
      tone = 'professional',
      length = 'medium'
    } = req.body;

    // Generate blog post content
    let generatedContent = await generateBlogContent(topic, {
      keywords,
      targetAudience,
      tone,
      length
    });

    // Generate SEO metadata
    const seoData = generateSEOMetadata(topic, generatedContent, keywords);

    // Analyze content
    const contentAnalysis = {
      sentiment: analyzeSentiment(generatedContent.content),
      keywords: extractKeywords(generatedContent.content, 15),
      wordCount: generatedContent.content.split(' ').length,
      readingTime: Math.ceil(generatedContent.content.split(' ').length / 200) // Average reading speed
    };

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        generatedContent,
        seoData,
        contentAnalysis,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Blog generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate blog post'
    });
  }
});

// Get trending topics
router.get('/trending/topics', async (req, res) => {
  try {
    // Get popular topics from recent posts
    const recentPosts = db.prepare(`
      SELECT tags, category, views
      FROM blog_posts 
      WHERE status = 'published' 
        AND published_at >= date('now', '-30 days')
      ORDER BY views DESC 
      LIMIT 50
    `).all();

    // Extract and count topics
    const topicCounts = {};
    
    recentPosts.forEach(post => {
      // Count categories
      if (post.category) {
        topicCounts[post.category] = (topicCounts[post.category] || 0) + post.views;
      }
      
      // Count tags
      if (post.tags) {
        const tags = post.tags.split(',').map(tag => tag.trim());
        tags.forEach(tag => {
          if (tag) {
            topicCounts[tag] = (topicCounts[tag] || 0) + Math.floor(post.views / 2);
          }
        });
      }
    });

    // Sort and get top topics
    const trendingTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([topic, score]) => ({ topic, score }));

    // Add some AI-generated trending topics if enabled
    let aiTrendingTopics = [];
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = "Generate 10 trending topics for a tech and productivity blog. Return only the topics, one per line.";
        const aiTopics = await generateText(prompt);
        
        if (aiTopics) {
          aiTrendingTopics = aiTopics.split('\n')
            .map(topic => topic.trim())
            .filter(topic => topic.length > 0)
            .slice(0, 10)
            .map(topic => ({ topic, score: Math.floor(Math.random() * 100) + 50, source: 'ai' }));
        }
      } catch (error) {
        logger.warn('AI trending topics generation failed:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        trendingTopics: [...trendingTopics, ...aiTrendingTopics]
          .sort((a, b) => b.score - a.score)
          .slice(0, 15)
      }
    });

  } catch (error) {
    logger.error('Trending topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending topics'
    });
  }
});

// Helper functions
const generateBlogContent = async (topic, options) => {
  const { keywords, targetAudience, tone, length } = options;
  
  let content = '';
  let title = '';
  let excerpt = '';

  // Generate AI content if available
  if (process.env.ENABLE_LOCAL_AI === 'true') {
    try {
      const wordCount = length === 'short' ? 500 : length === 'long' ? 1500 : 1000;
      
      const prompt = `Write a ${tone} blog post about "${topic}" for ${targetAudience}. 
      Include these keywords naturally: ${keywords.join(', ')}
      Target length: ${wordCount} words
      
      Structure:
      1. Compelling title
      2. Brief introduction
      3. Main content with subheadings
      4. Conclusion with call to action
      
      Make it engaging, informative, and SEO-friendly.`;
      
      const aiContent = await generateText(prompt, { maxTokens: wordCount });
      
      if (aiContent && aiContent.length > 200) {
        const lines = aiContent.split('\n').filter(line => line.trim());
        title = lines[0].replace(/^#+\s*/, '').trim();
        content = aiContent;
        excerpt = lines.find(line => line.length > 50 && line.length < 200) || 
                 content.substring(0, 150) + '...';
      }
    } catch (error) {
      logger.warn('AI blog content generation failed:', error.message);
    }
  }

  // Fallback to template-based generation
  if (!content || content.length < 200) {
    title = generateBlogTitle(topic, keywords);
    content = generateTemplateBlogContent(topic, keywords, targetAudience, tone, length);
    excerpt = `Discover everything you need to know about ${topic}. This comprehensive guide covers key insights and practical tips.`;
  }

  return {
    title,
    content,
    excerpt,
    suggestedTags: [...keywords, ...extractKeywords(content, 5)].slice(0, 10)
  };
};

const generateBlogTitle = (topic, keywords) => {
  const templates = [
    `The Ultimate Guide to ${topic}`,
    `${topic}: Everything You Need to Know`,
    `How to Master ${topic} in 2024`,
    `${topic} Best Practices and Tips`,
    `Complete ${topic} Tutorial for Beginners`,
    `${topic}: Tips, Tricks, and Strategies`
  ];

  let title = templates[Math.floor(Math.random() * templates.length)];
  
  // Try to incorporate a keyword if available
  if (keywords.length > 0 && Math.random() > 0.5) {
    title = title.replace(topic, `${topic} ${keywords[0]}`);
  }

  return title;
};

const generateTemplateBlogContent = (topic, keywords, targetAudience, tone, length) => {
  const wordTarget = length === 'short' ? 500 : length === 'long' ? 1500 : 1000;
  
  const introduction = `In today's digital landscape, understanding ${topic} is crucial for ${targetAudience}. This comprehensive guide will walk you through everything you need to know about ${topic}, including practical tips and best practices.`;

  const sections = [
    `## What is ${topic}?

${topic} refers to the practice and methodology of leveraging modern techniques to achieve optimal results. Whether you're a beginner or have some experience, understanding the fundamentals is essential.`,

    `## Key Benefits of ${topic}

When implemented correctly, ${topic} can provide numerous advantages:
- Improved efficiency and productivity
- Better results and outcomes
- Enhanced user experience
- Cost-effective solutions
- Scalable implementation`,

    `## Best Practices for ${topic}

To get the most out of ${topic}, consider these proven strategies:

1. **Start with clear objectives** - Define what you want to achieve
2. **Research thoroughly** - Understand your options and alternatives  
3. **Plan your approach** - Create a step-by-step implementation plan
4. **Monitor and adjust** - Track progress and make improvements
5. **Stay updated** - Keep learning about new developments`,

    `## Common Mistakes to Avoid

Many people make these errors when working with ${topic}:
- Rushing the implementation process
- Ignoring best practices and guidelines
- Failing to measure results
- Not adapting to changes
- Overlooking important details`,

    `## Getting Started with ${topic}

Ready to begin your ${topic} journey? Here's how to start:

1. Assess your current situation
2. Set realistic goals and expectations
3. Choose the right tools and resources
4. Create a timeline for implementation
5. Begin with small, manageable steps`
  ];

  let content = introduction + '\n\n' + sections.join('\n\n');

  // Add keyword integration
  if (keywords.length > 0) {
    content += `\n\n## Related Topics

Understanding ${topic} also involves familiarity with related concepts such as ${keywords.slice(0, 3).join(', ')}. These interconnected areas can enhance your overall knowledge and effectiveness.`;
  }

  // Add conclusion
  content += `\n\n## Conclusion

${topic} is an essential skill in today's environment. By following the guidelines and best practices outlined in this guide, you'll be well-equipped to achieve success. Remember to stay patient, keep learning, and don't hesitate to seek help when needed.

Ready to put your knowledge into practice? Start implementing these strategies today and see the difference they can make!`;

  return content;
};

const generateSEOMetadata = (topic, content, keywords) => {
  const title = content.title || `${topic} - Complete Guide`;
  const description = content.excerpt || `Learn everything about ${topic}. Comprehensive guide with tips, best practices, and practical advice.`;
  
  // Combine provided keywords with extracted ones
  const allKeywords = [...keywords, ...extractKeywords(content.content || content, 10)]
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index)
    .slice(0, 15);

  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    keywords: allKeywords,
    canonical: `/blog/${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    openGraph: {
      title,
      description,
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
};

export default router;