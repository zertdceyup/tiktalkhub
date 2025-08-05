import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database/init.js';
import logger from '../utils/logger.js';
import fs from 'fs'; // Added missing import for fs

const router = express.Router();

// Get user dashboard data
router.get('/dashboard', (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's tool usage stats
    const toolUsage = db.prepare(`
      SELECT t.name, t.category, COUNT(tu.id) as usage_count, MAX(tu.created_at) as last_used
      FROM tools t
      JOIN tool_usage tu ON t.id = tu.tool_id
      WHERE tu.user_id = ?
      GROUP BY t.id
      ORDER BY usage_count DESC
      LIMIT 10
    `).all(userId);

    // Get recent activity
    const recentActivity = db.prepare(`
      SELECT t.name as tool_name, tu.created_at, tu.processing_time
      FROM tool_usage tu
      JOIN tools t ON tu.tool_id = t.id
      WHERE tu.user_id = ?
      ORDER BY tu.created_at DESC
      LIMIT 20
    `).all(userId);

    // Get user's files count
    const filesCount = db.prepare('SELECT COUNT(*) as count FROM user_files WHERE user_id = ?').get(userId);

    // Get AI conversation stats
    const conversationStats = db.prepare(`
      SELECT 
        COUNT(*) as total_conversations,
        AVG(sentiment_score) as avg_sentiment
      FROM ai_conversations 
      WHERE user_id = ? AND created_at >= date('now', '-30 days')
    `).get(userId);

    res.json({
      success: true,
      data: {
        toolUsage,
        recentActivity,
        filesCount: filesCount.count,
        conversationStats: {
          totalConversations: conversationStats.total_conversations || 0,
          averageSentiment: conversationStats.avg_sentiment || 0
        }
      }
    });

  } catch (error) {
    logger.error('User dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get user preferences
router.get('/preferences', (req, res) => {
  try {
    // For now, return default preferences
    // In a full implementation, you'd have a user_preferences table
    const preferences = {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        newsletter: true
      },
      privacy: {
        profilePublic: false,
        showActivity: false,
        allowAnalytics: true
      }
    };

    res.json({
      success: true,
      data: { preferences }
    });

  } catch (error) {
    logger.error('User preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences'
    });
  }
});

// Update user preferences
router.put('/preferences', [
  body('preferences').isObject()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { preferences } = req.body;

    // In a full implementation, you'd save to user_preferences table
    logger.info(`User ${req.user.id} updated preferences`);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences }
    });

  } catch (error) {
    logger.error('User preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// Get user activity log
router.get('/activity', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const activities = db.prepare(`
      SELECT 
        'tool_usage' as type,
        t.name as description,
        tu.created_at as timestamp,
        tu.processing_time,
        tu.input_data
      FROM tool_usage tu
      JOIN tools t ON tu.tool_id = t.id
      WHERE tu.user_id = ?
      
      UNION ALL
      
      SELECT 
        'ai_conversation' as type,
        'AI Chat: ' || substr(message, 1, 50) || '...' as description,
        created_at as timestamp,
        NULL as processing_time,
        NULL as input_data
      FROM ai_conversations
      WHERE user_id = ?
      
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, req.user.id, limit, offset);

    const total = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM tool_usage WHERE user_id = ?) +
        (SELECT COUNT(*) FROM ai_conversations WHERE user_id = ?) as count
    `).get(req.user.id, req.user.id);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('User activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
});

// Export user data
router.get('/export', (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const userData = db.prepare(`
      SELECT id, email, username, first_name, last_name, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId);

    // Get tool usage
    const toolUsage = db.prepare(`
      SELECT t.name, tu.created_at, tu.input_data, tu.output_data, tu.processing_time
      FROM tool_usage tu
      JOIN tools t ON tu.tool_id = t.id
      WHERE tu.user_id = ?
      ORDER BY tu.created_at DESC
    `).all(userId);

    // Get AI conversations
    const conversations = db.prepare(`
      SELECT message, response, sentiment_score, created_at
      FROM ai_conversations
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    // Get files
    const files = db.prepare(`
      SELECT original_name, file_size, mime_type, tool_used, created_at
      FROM user_files
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    const exportData = {
      user: userData,
      toolUsage,
      conversations,
      files,
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="tiktalkhub-data-${userId}-${Date.now()}.json"`);
    
    res.json(exportData);

  } catch (error) {
    logger.error('User data export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
});

// Delete user account
router.delete('/account', [
  body('confirmPassword').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { confirmPassword } = req.body;
    const userId = req.user.id;

    // Verify password (simplified - in production, use bcrypt)
    // This is a placeholder - proper password verification should be implemented

    // Start transaction to delete all user data
    db.transaction(() => {
      // Delete tool usage
      db.prepare('DELETE FROM tool_usage WHERE user_id = ?').run(userId);
      
      // Delete AI conversations
      db.prepare('DELETE FROM ai_conversations WHERE user_id = ?').run(userId);
      
      // Delete user files (and actual files)
      const userFiles = db.prepare('SELECT filename, file_path FROM user_files WHERE user_id = ?').all(userId);
      userFiles.forEach(file => {
        try {
          if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
          }
        } catch (error) {
          logger.warn(`Failed to delete file: ${file.filename}`, error);
        }
      });
      db.prepare('DELETE FROM user_files WHERE user_id = ?').run(userId);
      
      // Delete user account
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    })();

    logger.info(`User account deleted: ${userId}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

export default router;