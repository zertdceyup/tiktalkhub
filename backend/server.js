import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, registerFont } from 'canvas';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import toolRoutes from './routes/tools.js';
import blogRoutes from './routes/blog.js';
import fileRoutes from './routes/files.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Import database initialization
import { initializeDatabase, allSQL } from './database/init.js';
import { startQueue } from './services/queue.js';

// Import logger
import logger from './utils/logger.js';

// ES6 dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
await initializeDatabase();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/sitemap.xml`);
});

// sitemap.xml (basic)
app.get('/sitemap.xml', (req, res) => {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const urls = [
    '/', '/about','/contact','/blog',
    '/tools/smartbiz','/tools/career','/tools/video','/tools/social','/tools/tiktok','/tools/general','/tools/pdf',
    '/tools/smartbiz/business-name-generator','/tools/smartbiz/slogan-creator','/tools/smartbiz/logo-sketch-wizard','/tools/smartbiz/smart-flyer-designer','/tools/smartbiz/invoice-maker','/tools/smartbiz/business-plan-generator',
    '/tools/career/resume-builder','/tools/career/cover-letter-ai','/tools/career/linkedin-summary','/tools/career/interview-coach','/tools/career/job-match-optimizer',
    '/tools/video/trimmer','/tools/video/thumbnail-selector','/tools/video/gif-maker','/tools/video/shorts-vertical-cropper','/tools/video/caption-overlay','/tools/video/noise-remover','/tools/video/batch-trimmer','/tools/video/thumbnail-optimizer','/tools/video/smart-caption-generator',
    '/tools/social/hashtag-generator','/tools/social/twitter-thread-formatter','/tools/social/facebook-caption-creator','/tools/social/bio-link-builder','/tools/social/link-shortener',
    '/tools/utility/qr-code-generator','/tools/utility/image-optimizer','/tools/utility/pdf-merger','/tools/utility/youtube-thumbnail-downloader','/tools/utility/pdf-splitter','/tools/utility/pdf-password-protector','/tools/utility/pdf-to-image',
    '/tools/general/twitter-thread-previewer','/tools/general/image-remixer','/tools/content/text-summarizer','/tools/content/text-to-speech','/tools/content/blog-idea-generator','/tools/content/headline-analyzer','/tools/content/caption-generator'
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>`;
  res.type('application/xml').send(body);
});

// dynamic OG image endpoint (real rendering)
app.get('/api/og-image', async (req, res) => {
  try {
    const { title = 'Tiktalkhub', subtitle = '' } = req.query;
    const width = 1200, height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Arial';
    const t = String(title);
    const tw = ctx.measureText(t).width;
    ctx.fillText(t, (width - tw) / 2, height / 2 - 20);

    // Subtitle / brand
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'normal 32px Arial';
    const s = subtitle ? String(subtitle) : 'tiktalkhub.com';
    const sw = ctx.measureText(s).width;
    ctx.fillText(s, (width - sw) / 2, height / 2 + 40);

    const buf = canvas.toBuffer('image/png');
    res.setHeader('Content-Type', 'image/png');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to render OG image' });
  }
});

// Public settings (read-only subset)
app.get('/api/public/settings', async (req, res) => {
  try {
    const rows = await allSQL('SELECT key, value, category FROM admin_settings WHERE key IN ("site_name","site_description","enable_ai_features","enable_local_ai","tiko_persona","tiko_suggestions_enabled","posts_home_count","posts_sidebar_count","ad_header_code","ad_footer_code")');
    const settings = rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch public settings' });
  }
});

// Public page blocks
app.get('/api/public/page-blocks', async (req, res) => {
  try {
    const path = req.query.path || '';
    const sql = path ? 'SELECT * FROM page_blocks WHERE page_path = ? ORDER BY position' : 'SELECT * FROM page_blocks ORDER BY page_path, position';
    const rows = await allSQL(sql, path ? [path] : []);
    res.json({ success: true, blocks: rows.map(b => ({ ...b, config: safeParse(b.config_json) })) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch blocks' });
  }
});

// Public brand kit (simple: latest kit)
app.get('/api/public/brand-kit', async (req, res) => {
  try {
    const rows = await allSQL('SELECT * FROM brand_kits ORDER BY updated_at DESC LIMIT 1');
    const kit = rows[0] || null;
    if (!kit) return res.json({ success: true, kit: null });
    res.json({ success: true, kit: { id: kit.id, name: kit.name, colors: safeParse(kit.colors_json), fonts: safeParse(kit.fonts_json), logo_url: kit.logo_url, watermark_url: kit.watermark_url } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch brand kit' });
  }
});

// Public blog curation
app.get('/api/public/blog-curation', async (req, res) => {
  try {
    const context = String(req.query.context || '');
    if (!context) return res.json({ success: true, rules: [] });
    const rows = await allSQL('SELECT * FROM blog_curation WHERE context = ? ORDER BY updated_at DESC', [context]);
    res.json({ success: true, rules: rows.map(r => ({ id: r.id, context: r.context, rule: safeParse(r.rule_json) })) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch curation' });
  }
});

function safeParse(s) { try { return JSON.parse(s || '{}'); } catch { return {}; } }

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Tiktalkhub Backend Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  startQueue();
});

export default app;