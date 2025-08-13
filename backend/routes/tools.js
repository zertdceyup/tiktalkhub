import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database/init.js';
import { optionalAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

// Import tool implementations
import smartbizTools from './tools/smartbiz.js';
import careerTools from './tools/career.js';
import contentTools from './tools/content.js';
import videoTools from './tools/video.js';
import socialTools from './tools/social.js';
import tiktokTools from './tools/tiktok.js';
import emotionalTools from './tools/emotional.js';
import utilityTools from './tools/utility.js';

const router = express.Router();

// Get all tools
router.get('/', (req, res) => {
  try {
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    
    let query = 'SELECT * FROM tools WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (featured) {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY usage_count DESC, name ASC';

    const tools = db.prepare(query).all(...params);

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

// Get tool by slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    
    const tool = db.prepare('SELECT * FROM tools WHERE slug = ? AND is_active = 1').get(slug);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Tool not found'
      });
    }

    res.json({
      success: true,
      tool
    });

  } catch (error) {
    logger.error('Tool fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tool'
    });
  }
});

// Track tool usage
const trackToolUsage = (toolSlug, userId, ipAddress, userAgent, inputData, outputData, processingTime) => {
  try {
    const tool = db.prepare('SELECT id FROM tools WHERE slug = ?').get(toolSlug);
    if (tool) {
      // Insert usage record
      db.prepare(`
        INSERT INTO tool_usage (tool_id, user_id, ip_address, user_agent, input_data, output_data, processing_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(tool.id, userId, ipAddress, userAgent, JSON.stringify(inputData), JSON.stringify(outputData), processingTime);

      // Update tool usage count
      db.prepare('UPDATE tools SET usage_count = usage_count + 1 WHERE id = ?').run(tool.id);
    }
  } catch (error) {
    logger.error('Tool usage tracking error:', error);
  }
};

// Mount tool category routes
router.use('/smartbiz', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, smartbizTools);

router.use('/career', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, careerTools);

router.use('/content', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, contentTools);

router.use('/video', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, videoTools);

router.use('/social', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, socialTools);

router.use('/tiktok', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, tiktokTools);

router.use('/emotional', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, emotionalTools);

router.use('/utility', optionalAuth, (req, res, next) => {
  req.trackUsage = trackToolUsage;
  next();
}, utilityTools);

// Get tool categories with counts
router.get('/categories/stats', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        category,
        COUNT(*) as tool_count,
        SUM(usage_count) as total_usage
      FROM tools 
      WHERE is_active = 1 
      GROUP BY category 
      ORDER BY total_usage DESC
    `).all();

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    logger.error('Categories stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics'
    });
  }
});

// Pipelines (CRUD minimal)
router.get('/pipelines', optionalAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM pipelines ORDER BY updated_at DESC').all();
  res.json({ success: true, data: { pipelines: rows } });
});

router.post('/pipelines', optionalAuth, [ body('name').isLength({ min: 1 }), body('schema').isObject() ], (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { name, description = '', schema } = req.body;
  const r = db.prepare('INSERT INTO pipelines (name, description, schema_json, is_active, created_by) VALUES (?, ?, ?, 1, ?)').run(name, description, JSON.stringify(schema), req.user.id);
  res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
});

// Pipeline run (enqueue job)
router.post('/pipelines/:id/run', optionalAuth, [ body('projectId').optional().isInt() ], (req, res) => {
  const { id } = req.params;
  const { projectId } = req.body || {};
  const job = db.prepare('INSERT INTO jobs (type, status, payload, max_retries) VALUES (?, ?, ?, ?)').run('pipeline_run', 'pending', JSON.stringify({ pipelineId: Number(id), projectId: projectId ? Number(projectId) : null, userId: req.user.id }), 3);
  res.json({ success: true, data: { jobId: job.lastInsertRowid } });
});

// Projects
router.get('/projects', optionalAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
  res.json({ success: true, data: { projects: rows } });
});

router.post('/projects', optionalAuth, [ body('name').isLength({ min: 1 }), body('data').optional().isObject() ], (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { name, data = {} } = req.body;
  const r = db.prepare('INSERT INTO projects (user_id, name, data_json) VALUES (?, ?, ?)').run(req.user.id, name, JSON.stringify(data));
  res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
});

router.put('/projects/:id', optionalAuth, [ body('data').isObject() ], (req, res) => {
  const { id } = req.params; const { data } = req.body;
  db.prepare('UPDATE projects SET data_json = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(JSON.stringify(data), new Date().toISOString(), id, req.user.id);
  res.json({ success: true });
});

// Jobs: status lookup
router.get('/jobs/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const row = db.prepare('SELECT id, type, status, retries, max_retries, result, created_at, updated_at FROM jobs WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ success: false, message: 'Job not found' });
  let parsed = null; try { parsed = row.result ? JSON.parse(row.result) : null; } catch { parsed = row.result; }
  res.json({ success: true, data: { job: { ...row, result: parsed } } });
});

export default router;