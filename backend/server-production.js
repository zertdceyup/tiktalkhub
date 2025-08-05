import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Import database initialization
import { initializeDatabase } from './database/init.js';

// Import logger
import logger from './utils/logger.js';

// ES6 dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database first
    logger.info('🗄️ Initializing database...');
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');

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
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true,
      optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
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

    // Load routes dynamically to avoid hanging
    logger.info('📦 Loading API routes...');
    
    try {
      const { default: authRoutes } = await import('./routes/auth.js');
      app.use('/api/auth', authRoutes);
      logger.info('✅ Auth routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load auth routes:', error);
    }

    try {
      const { default: adminRoutes } = await import('./routes/admin.js');
      app.use('/api/admin', authenticateToken, adminRoutes);
      logger.info('✅ Admin routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load admin routes:', error);
    }

    try {
      const { default: toolRoutes } = await import('./routes/tools.js');
      app.use('/api/tools', toolRoutes);
      logger.info('✅ Tool routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load tool routes:', error);
    }

    try {
      const { default: blogRoutes } = await import('./routes/blog.js');
      app.use('/api/blog', blogRoutes);
      logger.info('✅ Blog routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load blog routes:', error);
    }

    try {
      const { default: fileRoutes } = await import('./routes/files.js');
      app.use('/api/files', fileRoutes);
      logger.info('✅ File routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load file routes:', error);
    }

    try {
      const { default: aiRoutes } = await import('./routes/ai.js');
      app.use('/api/ai', aiRoutes);
      logger.info('✅ AI routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load AI routes:', error);
    }

    try {
      const { default: userRoutes } = await import('./routes/users.js');
      app.use('/api/users', authenticateToken, userRoutes);
      logger.info('✅ User routes loaded');
    } catch (error) {
      logger.error('❌ Failed to load user routes:', error);
    }

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
      console.log(`✅ Server started successfully on port ${PORT}`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();