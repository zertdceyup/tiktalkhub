import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../database/init.js';
import { optionalAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply optional auth to all routes
router.use(optionalAuth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'text/plain', 'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { toolUsed = 'general' } = req.body;
    const userId = req.user?.id || null;

    // Save file info to database
    const result = db.prepare(`
      INSERT INTO user_files (user_id, filename, original_name, file_path, file_size, mime_type, tool_used)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      toolUsed
    );

    logger.info(`File uploaded: ${req.file.originalname} by user ${userId || 'anonymous'}`);

    res.json({
      success: true,
      data: {
        fileId: result.lastInsertRowid,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: `/api/files/${req.file.filename}`
      }
    });

  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// Get file
router.get('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file info from database
    const fileInfo = db.prepare('SELECT * FROM user_files WHERE filename = ?').get(filename);

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File record not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', fileInfo.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.original_name}"`);

    // Send file
    res.sendFile(filePath);

  } catch (error) {
    logger.error('File retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file'
    });
  }
});

// Download file
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file info from database
    const fileInfo = db.prepare('SELECT * FROM user_files WHERE filename = ?').get(filename);

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File record not found'
      });
    }

    // Set download headers
    res.setHeader('Content-Type', fileInfo.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.original_name}"`);

    // Send file for download
    res.sendFile(filePath);

  } catch (error) {
    logger.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
});

// Get user files
router.get('/user/files', (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const files = db.prepare(`
      SELECT id, filename, original_name, file_size, mime_type, tool_used, created_at
      FROM user_files 
      WHERE user_id = ? AND is_temporary = 0
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM user_files WHERE user_id = ? AND is_temporary = 0').get(req.user.id);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('User files retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user files'
    });
  }
});

// Delete file
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Get file info from database
    const fileInfo = db.prepare('SELECT * FROM user_files WHERE filename = ?').get(filename);

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user owns the file (if authenticated)
    if (req.user && fileInfo.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this file'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from database
    db.prepare('DELETE FROM user_files WHERE filename = ?').run(filename);

    logger.info(`File deleted: ${filename} by user ${req.user?.id || 'anonymous'}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Clean up temporary files (scheduled cleanup)
router.post('/cleanup', (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get expired temporary files
    const expiredFiles = db.prepare(`
      SELECT filename, file_path FROM user_files 
      WHERE is_temporary = 1 AND (expires_at < ? OR created_at < ?)
    `).all(oneDayAgo.toISOString(), oneDayAgo.toISOString());

    let deletedCount = 0;

    expiredFiles.forEach(file => {
      try {
        // Delete file from filesystem
        if (fs.existsSync(file.file_path)) {
          fs.unlinkSync(file.file_path);
        }

        // Delete record from database
        db.prepare('DELETE FROM user_files WHERE filename = ?').run(file.filename);
        deletedCount++;
      } catch (error) {
        logger.warn(`Failed to delete expired file: ${file.filename}`, error);
      }
    });

    logger.info(`Cleaned up ${deletedCount} expired temporary files`);

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired files`
    });

  } catch (error) {
    logger.error('File cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup files'
    });
  }
});

// Chunked upload: init
router.post('/chunks/init', (req, res) => {
  try {
    const { filename, size, mimeType, chunkSize = 5 * 1024 * 1024 } = req.body || {};
    if (!filename || !size || !mimeType) return res.status(400).json({ success: false, message: 'filename, size, mimeType required' });
    const uploadId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const tmpDir = path.join(__dirname, '../uploads/chunks', uploadId);
    fs.mkdirSync(tmpDir, { recursive: true });
    const chunks = Math.ceil(Number(size) / Number(chunkSize));
    fs.writeFileSync(path.join(tmpDir, 'meta.json'), JSON.stringify({ filename, size: Number(size), mimeType, chunkSize: Number(chunkSize), chunks }));
    res.json({ success: true, data: { uploadId, chunks, chunkSize } });
  } catch (e) {
    logger.error('Chunks init error:', e);
    res.status(500).json({ success: false, message: 'Failed to init upload' });
  }
});

const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.join(__dirname, '../uploads/chunks', req.params.uploadId);
    fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const idx = req.body.chunkIndex || '0';
    cb(null, `part_${idx}`);
  }
});
const uploadChunk = multer({ storage: chunkStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// Chunked upload: upload part
router.post('/chunks/:uploadId', uploadChunk.single('chunk'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No chunk' });
    res.json({ success: true });
  } catch (e) {
    logger.error('Chunk upload error:', e);
    res.status(500).json({ success: false, message: 'Failed to upload chunk' });
  }
});

// Chunked upload: complete
router.post('/chunks/:uploadId/complete', (req, res) => {
  try {
    const { uploadId } = req.params;
    const baseDir = path.join(__dirname, '../uploads/chunks', uploadId);
    const metaPath = path.join(baseDir, 'meta.json');
    if (!fs.existsSync(metaPath)) return res.status(400).json({ success: false, message: 'Upload not found' });
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const parts = Array.from({ length: meta.chunks }).map((_, i) => path.join(baseDir, `part_${i}`));
    const finalName = `file-${Date.now()}-${uploadId}${path.extname(meta.filename)}`;
    const finalPath = path.join(__dirname, '../uploads', finalName);
    const write = fs.createWriteStream(finalPath);
    for (const p of parts) {
      if (!fs.existsSync(p)) return res.status(400).json({ success: false, message: `Missing chunk ${path.basename(p)}` });
      const data = fs.readFileSync(p);
      write.write(data);
    }
    write.end();

    const userId = req.user?.id || null;
    const result = db.prepare(`INSERT INTO user_files (user_id, filename, original_name, file_path, file_size, mime_type, tool_used) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(userId, finalName, meta.filename, finalPath, meta.size, meta.mimeType, 'chunked');

    // Cleanup
    try { fs.rmSync(baseDir, { recursive: true, force: true }); } catch {}

    res.json({ success: true, data: { fileId: result.lastInsertRowid, filename: finalName, url: `/api/files/${finalName}`, size: meta.size, mimeType: meta.mimeType } });
  } catch (e) {
    logger.error('Chunks complete error:', e);
    res.status(500).json({ success: false, message: 'Failed to complete upload' });
  }
});

export default router;