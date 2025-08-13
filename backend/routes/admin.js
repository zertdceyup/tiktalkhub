import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database/init.js';
import { requireAdmin } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', (req, res) => {
  try {
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users WHERE role != "admin"').get(),
      tools: db.prepare('SELECT COUNT(*) as count FROM tools WHERE is_active = 1').get(),
      blogPosts: db.prepare('SELECT COUNT(*) as count FROM blog_posts').get(),
      toolUsage: db.prepare('SELECT COUNT(*) as count FROM tool_usage WHERE created_at >= date("now", "-30 days")').get(),
      recentUsers: db.prepare(`
        SELECT id, email, username, first_name, last_name, created_at 
        FROM users WHERE role != "admin" 
        ORDER BY created_at DESC LIMIT 5
      `).all(),
      popularTools: db.prepare(`
        SELECT t.name, t.slug, t.category, COUNT(tu.id) as usage_count
        FROM tools t
        LEFT JOIN tool_usage tu ON t.id = tu.tool_id
        WHERE t.is_active = 1 AND tu.created_at >= date("now", "-30 days")
        GROUP BY t.id
        ORDER BY usage_count DESC
        LIMIT 5
      `).all()
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Site Settings Management
router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY category, key').all();
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      settings: groupedSettings
    });

  } catch (error) {
    logger.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

router.put('/settings', [
  body('settings').isArray()
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

    const { settings } = req.body;
    const updateSetting = db.prepare('UPDATE admin_settings SET value = ?, updated_at = ? WHERE key = ?');
    
    db.transaction(() => {
      for (const setting of settings) {
        updateSetting.run(setting.value, new Date().toISOString(), setting.key);
      }
    })();

    logger.info(`Admin settings updated by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    logger.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// User Management
router.get('/users', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT id, email, username, first_name, last_name, role, is_active, email_verified, created_at, updated_at
      FROM users
      WHERE role != 'admin'
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM users WHERE role != "admin"';
    const params = [];

    if (search) {
      query += ' AND (email LIKE ? OR username LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      countQuery += ' AND (email LIKE ? OR username LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = db.prepare(query).all(...params);
    const total = db.prepare(countQuery).get(...(search ? params.slice(0, 4) : []));

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    logger.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

router.put('/users/:id', [
  body('is_active').optional().isBoolean(),
  body('role').optional().isIn(['user', 'admin'])
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

    const { id } = req.params;
    const { is_active, role } = req.body;

    const updates = {};
    const params = [];

    if (is_active !== undefined) {
      updates.is_active = is_active;
      params.push(is_active);
    }

    if (role !== undefined) {
      updates.role = role;
      params.push(role);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    params.push(new Date().toISOString(), id);

    const result = db.prepare(`
      UPDATE users SET ${setClause}, updated_at = ? WHERE id = ? AND role != 'admin'
    `).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or cannot be modified'
      });
    }

    logger.info(`User ${id} updated by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    logger.error('User update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Tools Management
router.get('/tools', (req, res) => {
  try {
    const tools = db.prepare(`
      SELECT t.*, COUNT(tu.id) as usage_count
      FROM tools t
      LEFT JOIN tool_usage tu ON t.id = tu.tool_id
      GROUP BY t.id
      ORDER BY t.category, t.name
    `).all();

    res.json({
      success: true,
      tools
    });

  } catch (error) {
    logger.error('Tools fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tools'
    });
  }
});

router.put('/tools/:id', [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('is_active').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
  body('config').optional().isJSON()
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

    const { id } = req.params;
    const { name, description, is_active, is_featured, config } = req.body;

    const updates = {};
    const params = [];

    if (name !== undefined) {
      updates.name = name;
      params.push(name);
    }

    if (description !== undefined) {
      updates.description = description;
      params.push(description);
    }

    if (is_active !== undefined) {
      updates.is_active = is_active;
      params.push(is_active);
    }

    if (is_featured !== undefined) {
      updates.is_featured = is_featured;
      params.push(is_featured);
    }

    if (config !== undefined) {
      updates.config = config;
      params.push(config);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    params.push(new Date().toISOString(), id);

    const result = db.prepare(`
      UPDATE tools SET ${setClause}, updated_at = ? WHERE id = ?
    `).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    logger.info(`Tool ${id} updated by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Tool updated successfully'
    });

  } catch (error) {
    logger.error('Tool update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tool'
    });
  }
});

// Blog Management
router.get('/blog', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';

    let query = `
      SELECT bp.*, u.username as author_username
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM blog_posts';
    const params = [];

    if (status) {
      query += ' WHERE bp.status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY bp.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = db.prepare(query).all(...params);
    const total = db.prepare(countQuery).get(...(status ? [status] : []));

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
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

router.post('/blog', [
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1 }),
  body('excerpt').optional().isLength({ max: 500 }),
  body('status').isIn(['draft', 'published']),
  body('category').optional().isLength({ max: 50 }),
  body('tags').optional().isString(),
  body('meta_title').optional().isLength({ max: 200 }),
  body('meta_description').optional().isLength({ max: 300 })
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

    const { title, content, excerpt, status, category, tags, meta_title, meta_description, featured_image } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingPost = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'A post with this title already exists'
      });
    }

    const result = db.prepare(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, featured_image, author_id, status, 
        meta_title, meta_description, tags, category, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, slug, content, excerpt, featured_image, req.user.id, status,
      meta_title, meta_description, tags, category,
      status === 'published' ? new Date().toISOString() : null
    );

    logger.info(`New blog post created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      postId: result.lastInsertRowid
    });

  } catch (error) {
    logger.error('Blog post creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post'
    });
  }
});

router.put('/blog/:id', [
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('content').optional().isLength({ min: 1 }),
  body('excerpt').optional().isLength({ max: 500 }),
  body('status').optional().isIn(['draft', 'published']),
  body('category').optional().isLength({ max: 50 }),
  body('tags').optional().isString(),
  body('meta_title').optional().isLength({ max: 200 }),
  body('meta_description').optional().isLength({ max: 300 })
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

    const { id } = req.params;
    const updateData = req.body;

    // Get current post
    const currentPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const updates = {};
    const params = [];

    // Handle title and slug update
    if (updateData.title && updateData.title !== currentPost.title) {
      const newSlug = updateData.title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      const existingPost = db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ?').get(newSlug, id);
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: 'A post with this title already exists'
        });
      }

      updates.title = updateData.title;
      updates.slug = newSlug;
      params.push(updateData.title, newSlug);
    }

    // Handle other fields
    const fields = ['content', 'excerpt', 'featured_image', 'status', 'meta_title', 'meta_description', 'tags', 'category'];
    for (const field of fields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
        params.push(updateData[field]);
      }
    }

    // Handle published_at for status changes
    if (updateData.status === 'published' && currentPost.status !== 'published') {
      updates.published_at = new Date().toISOString();
      params.push(updates.published_at);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    params.push(new Date().toISOString(), id);

    db.prepare(`
      UPDATE blog_posts SET ${setClause}, updated_at = ? WHERE id = ?
    `).run(...params);

    logger.info(`Blog post ${id} updated by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Blog post updated successfully'
    });

  } catch (error) {
    logger.error('Blog post update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post'
    });
  }
});

router.delete('/blog/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    logger.info(`Blog post ${id} deleted by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    logger.error('Blog post deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post'
    });
  }
});

// Analytics
router.get('/analytics', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = {
      toolUsage: db.prepare(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM tool_usage
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `).all(startDate.toISOString()),
      
      userRegistrations: db.prepare(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= ? AND role != 'admin'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `).all(startDate.toISOString()),
      
      popularTools: db.prepare(`
        SELECT t.name, t.category, COUNT(tu.id) as usage_count
        FROM tools t
        LEFT JOIN tool_usage tu ON t.id = tu.tool_id
        WHERE tu.created_at >= ?
        GROUP BY t.id
        ORDER BY usage_count DESC
        LIMIT 10
      `).all(startDate.toISOString()),
      
      blogViews: db.prepare(`
        SELECT bp.title, bp.views
        FROM blog_posts bp
        WHERE bp.status = 'published'
        ORDER BY bp.views DESC
        LIMIT 10
      `).all()
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Notifications Management
router.get('/notifications', (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      notifications
    });

  } catch (error) {
    logger.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

router.post('/notifications', [
  body('title').isLength({ min: 1, max: 100 }),
  body('message').isLength({ min: 1, max: 500 }),
  body('type').isIn(['info', 'warning', 'success', 'error']),
  body('target_audience').isIn(['all', 'users', 'admins'])
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

    const { title, message, type, target_audience, scheduled_at } = req.body;

    const result = db.prepare(`
      INSERT INTO notifications (title, message, type, target_audience, scheduled_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, message, type, target_audience, scheduled_at || null);

    logger.info(`New notification created by admin: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notificationId: result.lastInsertRowid
    });

  } catch (error) {
    logger.error('Notification creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// Templates Management
router.get('/templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
    res.json({ success: true, templates });
  } catch (e) {
    logger.error('Templates fetch error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

router.post('/templates', [
  body('name').isLength({ min: 1, max: 100 }),
  body('type').isLength({ min: 1, max: 50 }),
  body('category').optional().isLength({ max: 50 }),
  body('file_path').optional().isString(),
  body('thumbnail_path').optional().isString(),
  body('config').optional().isString()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { name, type, category, file_path, thumbnail_path, config } = req.body;
    const result = db.prepare(`INSERT INTO templates (name, type, category, file_path, thumbnail_path, config) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(name, type, category || null, file_path || null, thumbnail_path || null, config || null);
    res.status(201).json({ success: true, templateId: result.lastInsertRowid });
  } catch (e) {
    logger.error('Template create error:', e);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

router.put('/templates/:id', [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('type').optional().isLength({ min: 1, max: 50 }),
  body('category').optional().isLength({ max: 50 }),
  body('file_path').optional().isString(),
  body('thumbnail_path').optional().isString(),
  body('config').optional().isString()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { id } = req.params;
    const updates = req.body;
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const params = [...Object.values(updates), new Date().toISOString(), id];
    const result = db.prepare(`UPDATE templates SET ${setClause}, updated_at = ? WHERE id = ?`).run(...params);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template updated' });
  } catch (e) {
    logger.error('Template update error:', e);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

router.delete('/templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template deleted' });
  } catch (e) {
    logger.error('Template delete error:', e);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

// Page Settings (design tokens per page)
router.get('/page-settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM page_settings').all();
    res.json({ success: true, pages: rows });
  } catch (e) {
    logger.error('Page settings fetch error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch page settings' });
  }
});

router.post('/page-settings', [ body('page_path').isLength({ min: 1 }), body('tokens_json').isString() ], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { page_path, tokens_json } = req.body;
    const result = db.prepare('INSERT OR REPLACE INTO page_settings (id, page_path, tokens_json, updated_at) VALUES ((SELECT id FROM page_settings WHERE page_path = ?), ?, ?, ?)')
      .run(page_path, page_path, tokens_json, new Date().toISOString());
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (e) {
    logger.error('Page settings save error:', e);
    res.status(500).json({ success: false, message: 'Failed to save page settings' });
  }
});

router.delete('/page-settings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM page_settings WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Page settings not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    logger.error('Page settings delete error:', e);
    res.status(500).json({ success: false, message: 'Failed to delete page settings' });
  }
});

// Brand kits
router.get('/brand-kits', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM brand_kits WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
    res.json({ success: true, brandKits: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch brand kits' });
  }
});

router.post('/brand-kits', [ body('name').isLength({ min: 1 }) ], (req, res) => {
  try {
    const { name, colors = {}, fonts = {}, logo_url = '', watermark_url = '' } = req.body;
    const r = db.prepare('INSERT INTO brand_kits (user_id, name, colors_json, fonts_json, logo_url, watermark_url) VALUES (?, ?, ?, ?, ?, ?)')
      .run(req.user.id, name, JSON.stringify(colors), JSON.stringify(fonts), logo_url, watermark_url);
    res.status(201).json({ success: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create brand kit' });
  }
});

router.put('/brand-kits/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const setClause = Object.keys(updates).map(k => `${k === 'colors' ? 'colors_json' : k === 'fonts' ? 'fonts_json' : k} = ?`).join(', ');
    const params = Object.entries(updates).map(([k, v]) => (k === 'colors' || k === 'fonts') ? JSON.stringify(v) : v);
    params.push(new Date().toISOString(), id, req.user.id);
    const result = db.prepare(`UPDATE brand_kits SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`).run(...params);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Brand kit not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update brand kit' });
  }
});

// Page blocks
router.get('/page-blocks', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM page_blocks ORDER BY page_path, position').all();
    res.json({ success: true, blocks: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch blocks' });
  }
});

router.post('/page-blocks', [ body('page_path').isLength({ min: 1 }), body('block_type').isLength({ min: 1 }), body('config').isObject(), body('position').optional().isInt() ], (req, res) => {
  try {
    const { page_path, block_type, config, position = 0 } = req.body;
    const r = db.prepare('INSERT INTO page_blocks (page_path, position, block_type, config_json) VALUES (?, ?, ?, ?)').run(page_path, position, block_type, JSON.stringify(config));
    res.status(201).json({ success: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create block' });
  }
});

router.put('/page-blocks/:id', [ body('config').optional().isObject(), body('position').optional().isInt() ], (req, res) => {
  try {
    const { id } = req.params; const updates = req.body;
    const setClause = Object.keys(updates).map(k => `${k === 'config' ? 'config_json' : k} = ?`).join(', ');
    const params = Object.entries(updates).map(([k, v]) => (k === 'config') ? JSON.stringify(v) : v);
    params.push(new Date().toISOString(), id);
    const result = db.prepare(`UPDATE page_blocks SET ${setClause}, updated_at = ? WHERE id = ?`).run(...params);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update block' });
  }
});

router.delete('/page-blocks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM page_blocks WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete block' });
  }
});

// Blog curation rules
router.get('/blog-curation', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM blog_curation ORDER BY updated_at DESC').all();
    res.json({ success: true, rules: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch curation rules' });
  }
});

router.post('/blog-curation', [ body('context').isLength({ min: 1 }), body('rule').isObject() ], (req, res) => {
  try {
    const { context, rule } = req.body;
    const r = db.prepare('INSERT INTO blog_curation (context, rule_json) VALUES (?, ?)').run(context, JSON.stringify(rule));
    res.status(201).json({ success: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create curation rule' });
  }
});

router.put('/blog-curation/:id', [ body('rule').isObject() ], (req, res) => {
  try {
    const { id } = req.params; const { rule } = req.body;
    const r = db.prepare('UPDATE blog_curation SET rule_json = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(rule), new Date().toISOString(), id);
    if (r.changes === 0) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update curation rule' });
  }
});

router.delete('/blog-curation/:id', (req, res) => {
  try {
    const { id } = req.params;
    const r = db.prepare('DELETE FROM blog_curation WHERE id = ?').run(id);
    if (r.changes === 0) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete curation rule' });
  }
});

export default router;