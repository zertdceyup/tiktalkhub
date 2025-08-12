import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'tiktalkhub.db');

// Create database connection
let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      }
    });
  });
};

// Helper function to run SQL with promise
const runSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get single row
const getSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get all rows
const allSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const initializeDatabase = async () => {
  try {
    logger.info('🗄️  Initializing database...');

    await initDatabase();

    // Users table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        is_active BOOLEAN DEFAULT 1,
        email_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin settings table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'string',
        category TEXT DEFAULT 'general',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blog posts table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image TEXT,
        author_id INTEGER,
        status TEXT DEFAULT 'draft',
        meta_title TEXT,
        meta_description TEXT,
        tags TEXT,
        category TEXT,
        views INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT 0,
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);

    // Tools table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        icon TEXT,
        is_active BOOLEAN DEFAULT 1,
        is_featured BOOLEAN DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tool usage tracking
    await runSQL(`
      CREATE TABLE IF NOT EXISTS tool_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool_id INTEGER NOT NULL,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        input_data TEXT,
        output_data TEXT,
        processing_time INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tool_id) REFERENCES tools (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Templates table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        file_path TEXT,
        thumbnail_path TEXT,
        config TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // AI conversations table (for Tiko)
    await runSQL(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        context TEXT,
        sentiment_score REAL,
        suggested_tools TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // User files table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS user_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        tool_used TEXT,
        is_temporary BOOLEAN DEFAULT 0,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Notifications table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        target_audience TEXT DEFAULT 'all',
        is_active BOOLEAN DEFAULT 1,
        scheduled_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics table
    await runSQL(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create indexes for better performance
    await runSQL('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_id ON tool_usage(tool_id)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)');

    // Insert default admin user if not exists
    const adminExists = await getSQL('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
    if (adminExists.count === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      await runSQL(`
        INSERT INTO users (email, password, username, first_name, last_name, role, is_active, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        process.env.ADMIN_EMAIL || 'admin@tiktalkhub.com',
        hashedPassword,
        'admin',
        'Admin',
        'User',
        'admin',
        1,
        1
      ]);
      logger.info('✅ Default admin user created');
    }

    // Insert default admin settings
    const defaultSettings = [
      { key: 'site_name', value: 'Tiktalkhub', category: 'general', description: 'Site name' },
      { key: 'site_description', value: 'AI-powered tools platform', category: 'general', description: 'Site description' },
      { key: 'header_logo', value: '/logo.png', category: 'appearance', description: 'Header logo URL' },
      { key: 'footer_text', value: '© 2024 Tiktalkhub. All rights reserved.', category: 'appearance', description: 'Footer text' },
      { key: 'enable_registrations', value: 'true', type: 'boolean', category: 'users', description: 'Allow user registrations' },
      { key: 'enable_ai_features', value: 'true', type: 'boolean', category: 'ai', description: 'Enable AI features' },
      { key: 'posts_per_page', value: '10', type: 'number', category: 'blog', description: 'Blog posts per page' },
      { key: 'adsense_code', value: '', category: 'monetization', description: 'Google AdSense code' },
      { key: 'analytics_code', value: '', category: 'analytics', description: 'Google Analytics code' }
    ];

    for (const setting of defaultSettings) {
      const exists = await getSQL('SELECT COUNT(*) as count FROM admin_settings WHERE key = ?', [setting.key]);
      if (exists.count === 0) {
        await runSQL('INSERT INTO admin_settings (key, value, type, category, description) VALUES (?, ?, ?, ?, ?)', 
          [setting.key, setting.value, setting.type || 'string', setting.category, setting.description]);
      }
    }

    // Insert default tools
    const defaultTools = [
      // SmartBiz Tools
      { name: 'Business Name Generator', slug: 'business-name-generator', category: 'smartbiz', description: 'Generate creative business names', icon: '🏢' },
      { name: 'Slogan Creator', slug: 'slogan-creator', category: 'smartbiz', description: 'Create catchy slogans', icon: '💡' },
      { name: 'Logo Sketch Wizard', slug: 'logo-sketch-wizard', category: 'smartbiz', description: 'Design logo concepts', icon: '🎨' },
      { name: 'Smart Flyer Designer', slug: 'smart-flyer-designer', category: 'smartbiz', description: 'Create professional flyers', icon: '📄' },
      { name: 'Invoice Maker', slug: 'invoice-maker', category: 'smartbiz', description: 'Generate professional invoices', icon: '📋' },
      { name: 'Business Plan Generator', slug: 'business-plan-generator', category: 'smartbiz', description: 'Generate complete business plans', icon: '🧭' },

      // Career Tools
      { name: 'Resume Builder', slug: 'resume-builder', category: 'career', description: 'Build professional resumes', icon: '📝' },
      { name: 'Cover Letter AI', slug: 'cover-letter-ai', category: 'career', description: 'AI-powered cover letters', icon: '✉️' },
      { name: 'LinkedIn Summary Generator', slug: 'linkedin-summary', category: 'career', description: 'Create LinkedIn summaries', icon: '💼' },
      { name: 'Interview Coach', slug: 'interview-coach', category: 'career', description: 'Practice interviews with AI', icon: '🎤' },

      // Content Tools
      { name: 'Blog Idea Generator', slug: 'blog-idea-generator', category: 'content', description: 'Generate blog post ideas', icon: '💭' },
      { name: 'Text to Speech', slug: 'text-to-speech', category: 'content', description: 'Convert text to speech', icon: '🔊' },
      { name: 'Caption Generator', slug: 'caption-generator', category: 'content', description: 'Generate social media captions', icon: '📱' },
      { name: 'Headline Analyzer', slug: 'headline-analyzer', category: 'content', description: 'Analyze headline effectiveness', icon: '📊' },

      // Video Tools
      { name: 'Video Trimmer', slug: 'video-trimmer', category: 'video', description: 'Trim video files', icon: '✂️' },
      { name: 'Thumbnail Selector', slug: 'thumbnail-selector', category: 'video', description: 'Extract video thumbnails', icon: '🖼️' },
      { name: 'GIF Maker', slug: 'gif-maker', category: 'video', description: 'Create GIFs from videos', icon: '🎬' },
      { name: 'Shorts Vertical Cropper', slug: 'shorts-vertical-cropper', category: 'video', description: 'Auto-crop landscape videos to vertical formats', icon: '📱' },
      { name: 'Noise Remover', slug: 'noise-remover', category: 'video', description: 'Clean audio with noise reduction', icon: '🔇' },
      { name: 'Batch Trimmer', slug: 'batch-trimmer', category: 'video', description: 'Trim multiple videos simultaneously', icon: '✂️' },

      // Social Tools
      { name: 'Hashtag Generator', slug: 'hashtag-generator', category: 'social', description: 'Generate trending hashtags', icon: '#️⃣' },
      { name: 'Twitter Thread Formatter', slug: 'twitter-thread-formatter', category: 'social', description: 'Format Twitter threads', icon: '🐦' },

      // TikTok Tools
      { name: 'TikTok Hashtag Heatmap', slug: 'tiktok-hashtag-heatmap', category: 'tiktok', description: 'Analyze TikTok hashtags', icon: '🔥' },
      { name: 'Viral Hook Generator', slug: 'viral-hook-generator', category: 'tiktok', description: 'Generate viral hooks', icon: '🎣' },

      // Emotional Tools
      { name: 'MindMirror', slug: 'mindmirror', category: 'emotional', description: 'AI-powered journaling', icon: '🪞' },
      { name: 'Therapet', slug: 'therapet', category: 'emotional', description: 'Mood-based virtual pet', icon: '🐾' },
      { name: 'MoodBoard AI', slug: 'moodboard-ai', category: 'emotional', description: 'Visual mood analysis', icon: '🎨' },

      // Utility Tools
      { name: 'PDF Compressor', slug: 'pdf-compressor', category: 'utility', description: 'Compress PDF files', icon: '📄' },
      { name: 'QR Code Generator', slug: 'qr-generator', category: 'utility', description: 'Generate QR codes', icon: '📱' },
      { name: 'Image Optimizer', slug: 'image-optimizer', category: 'utility', description: 'Optimize images', icon: '🖼️' },
      { name: 'AI Meme Generator', slug: 'ai-meme-generator', category: 'utility', description: 'Generate memes with AI', icon: '😂' }
    ];

    for (const tool of defaultTools) {
      const exists = await getSQL('SELECT COUNT(*) as count FROM tools WHERE slug = ?', [tool.slug]);
      if (exists.count === 0) {
        await runSQL('INSERT INTO tools (name, slug, category, description, icon) VALUES (?, ?, ?, ?, ?)',
          [tool.name, tool.slug, tool.category, tool.description, tool.icon]);
      }
    }

    logger.info('✅ Database initialized successfully');
    return { db, runSQL, getSQL, allSQL };

  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export { db, runSQL, getSQL, allSQL };
export default { db, runSQL, getSQL, allSQL };