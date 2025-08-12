import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import logger from '../../utils/logger.js';

const router = express.Router();

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video file type'), false);
    }
  }
});

// Video Trimmer (Mock implementation)
router.post('/video-trimmer', upload.single('video'), [
  body('startTime').isFloat({ min: 0 }),
  body('endTime').isFloat({ min: 0 }),
  body('outputFormat').optional().isIn(['mp4', 'webm', 'mov'])
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { startTime: trimStart, endTime: trimEnd, outputFormat = 'mp4' } = req.body;

    // Mock video processing
    const originalDuration = 120; // Mock duration in seconds
    const trimmedDuration = trimEnd - trimStart;

    const result = {
      originalFile: {
        name: req.file.originalname,
        size: req.file.size,
        duration: originalDuration
      },
      trimmedVideo: {
        url: `/api/video/trimmed-${Date.now()}.${outputFormat}`,
        format: outputFormat,
        duration: trimmedDuration,
        startTime: trimStart,
        endTime: trimEnd,
        estimatedSize: Math.floor(req.file.size * (trimmedDuration / originalDuration))
      }
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'video-trimmer',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { originalSize: req.file.size, outputFormat, duration: trimmedDuration },
        { trimmedSize: result.trimmedVideo.estimatedSize },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        ...result,
        processingTime,
        note: 'This is a demo implementation. In production, actual video processing would occur.'
      }
    });

  } catch (error) {
    logger.error('Video trimmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trim video'
    });
  }
});

// Thumbnail Selector (Mock implementation)
router.post('/thumbnail-selector', upload.single('video'), [
  body('count').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const { count = 6 } = req.body;

    // Mock thumbnail extraction
    const thumbnails = [];
    const videoDuration = 120; // Mock duration
    
    for (let i = 0; i < count; i++) {
      const timestamp = (videoDuration / count) * i;
      thumbnails.push({
        id: i + 1,
        timestamp,
        url: `/api/thumbnails/thumb-${Date.now()}-${i}.jpg`,
        width: 1920,
        height: 1080
      });
    }

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'thumbnail-selector',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { videoSize: req.file.size, count },
        { thumbnailsGenerated: thumbnails.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        videoInfo: {
          name: req.file.originalname,
          size: req.file.size,
          duration: videoDuration
        },
        thumbnails,
        processingTime,
        note: 'This is a demo implementation. In production, actual thumbnails would be extracted.'
      }
    });

  } catch (error) {
    logger.error('Thumbnail selector error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract thumbnails'
    });
  }
});

// GIF Maker (Mock implementation)
router.post('/gif-maker', upload.single('video'), [
  body('startTime').optional().isFloat({ min: 0 }),
  body('duration').optional().isFloat({ min: 0.1, max: 10 }),
  body('quality').optional().isIn(['low', 'medium', 'high']),
  body('fps').optional().isInt({ min: 5, max: 30 })
], async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const { 
      startTime: gifStart = 0, 
      duration = 3, 
      quality = 'medium', 
      fps = 15 
    } = req.body;

    // Mock GIF creation
    const qualityMultiplier = { low: 0.3, medium: 0.6, high: 1.0 };
    const estimatedSize = Math.floor(req.file.size * 0.1 * qualityMultiplier[quality]);

    const gifData = {
      url: `/api/gifs/generated-${Date.now()}.gif`,
      originalVideo: req.file.originalname,
      settings: {
        startTime: gifStart,
        duration,
        quality,
        fps
      },
      output: {
        size: estimatedSize,
        width: quality === 'high' ? 480 : quality === 'medium' ? 320 : 240,
        height: quality === 'high' ? 270 : quality === 'medium' ? 180 : 135,
        frames: Math.floor(duration * fps)
      }
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'gif-maker',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { videoSize: req.file.size, quality, duration, fps },
        { gifSize: estimatedSize, frames: gifData.output.frames },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        gif: gifData,
        processingTime,
        note: 'This is a demo implementation. In production, actual GIF would be created.'
      }
    });

  } catch (error) {
    logger.error('GIF maker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create GIF'
    });
  }
});

// Caption Overlay (Mock implementation)
router.post('/caption-overlay', upload.single('video'), [
  body('captions').isArray({ min: 1 }),
  body('font').optional().isString(),
  body('size').optional().isInt({ min: 10, max: 96 }),
  body('color').optional().isString(),
  body('background').optional().isString(),
  body('position').optional().isIn(['top','bottom','middle']),
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }
    const { captions, font = 'Inter', size = 24, color = '#ffffff', background = 'rgba(0,0,0,0.5)', position = 'bottom' } = req.body;

    // Mock: build SRT from captions
    const srt = captions.map((c, idx) => `${idx + 1}\n${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n${c.text}\n`).join('\n');

    const output = {
      url: `/api/video/captioned-${Date.now()}.mp4`,
      style: { font, size, color, background, position },
      srt,
      captionCount: captions.length
    };

    const processingTime = Date.now() - startTime;

    if (req.trackUsage) {
      req.trackUsage('caption-overlay', req.user?.id, req.ip, req.get('User-Agent'), { style: { font, size, position } }, { captionCount: captions.length }, processingTime);
    }

    res.json({ success: true, data: { output, processingTime, note: 'Demo implementation. In production, burn-in rendering would occur.' } });
  } catch (error) {
    logger.error('Caption overlay error:', error);
    res.status(500).json({ success: false, message: 'Failed to overlay captions' });
  }
});

router.post('/shorts-vertical-cropper', upload.single('video'), [
  body('aspect').optional().isIn(['9:16','1:1','4:5']),
  body('strategy').optional().isIn(['center','smart-face','smart-motion','manual']),
  body('gravity').optional().isIn(['center','top','bottom','left','right']),
  body('background').optional().isIn(['blur','black','white']),
  body('resolution').optional().isIn(['720x1280','1080x1920','1440x2560']),
  body('startTime').optional().isFloat({ min: 0 }),
  body('endTime').optional().isFloat({ min: 0 }),
  body('safeZones').optional().isString(), // JSON string
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const {
      aspect = '9:16',
      strategy = 'center',
      gravity = 'center',
      background = 'blur',
      resolution = '1080x1920',
      startTime: cropStart = 0,
      endTime: cropEnd = 0,
      safeZones: safeZonesJson
    } = req.body;

    let safeZones = { top: 0, bottom: 0, left: 0, right: 0 };
    if (safeZonesJson) {
      try {
        const parsed = JSON.parse(safeZonesJson);
        safeZones = {
          top: Number(parsed.top) || 0,
          bottom: Number(parsed.bottom) || 0,
          left: Number(parsed.left) || 0,
          right: Number(parsed.right) || 0,
        };
      } catch (_) {
        // ignore parse error; keep defaults
      }
    }

    // Mock crop timeline (e.g., every second, a crop box)
    const duration = cropEnd > cropStart ? (cropEnd - cropStart) : 15; // 15s default
    const frames = Math.min(30, Math.ceil(duration));
    const cropTimeline = Array.from({ length: frames }).map((_, i) => ({
      t: cropStart + i,
      box: {
        // normalized [0..1] crop box for the source video
        x: 0.1 + 0.02 * Math.sin(i / 3),
        y: 0.1 + 0.02 * Math.cos(i / 4),
        w: aspect === '9:16' ? 0.5625 : aspect === '4:5' ? 0.8 : 1.0,
        h: 1.0,
      }
    }));

    const output = {
      url: `/api/video/shorts-crop-${Date.now()}.mp4`,
      aspect,
      strategy,
      gravity,
      background,
      resolution,
      duration,
      safeZones,
      cropTimeline,
    };

    const processingTime = Date.now() - startTime;

    if (req.trackUsage) {
      req.trackUsage(
        'shorts-vertical-cropper',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { size: req.file.size, aspect, strategy, resolution },
        { duration, frames: cropTimeline.length },
        processingTime
      );
    }

    res.json({ success: true, data: { output, processingTime, note: 'Demo implementation. In production, actual smart framing and crop rendering would occur.' } });
  } catch (error) {
    logger.error('Shorts vertical cropper error:', error);
    res.status(500).json({ success: false, message: 'Failed to crop video' });
  }
});

router.post('/noise-remover', upload.single('video'), [
  body('mode').optional().isIn(['mild','moderate','aggressive']),
  body('humHz').optional().isFloat({ min: 20, max: 20000 }),
  body('dereverb').optional().isBoolean(),
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const mode = req.body.mode || 'moderate';
    const humHz = req.body.humHz ? Number(req.body.humHz) : null;
    const dereverb = req.body.dereverb === 'true' || req.body.dereverb === true;

    // Mock stats
    const baselineNoiseDb =  -32; // dBFS
    const reductionDb = mode === 'aggressive' ? 12 : mode === 'moderate' ? 8 : 4;
    const postNoiseDb = baselineNoiseDb - reductionDb;
    const humRemoved = Boolean(humHz);
    const dereverbApplied = dereverb;

    const output = {
      url: `/api/video/noise-removed-${Date.now()}.mp4`,
      settings: { mode, humHz, dereverb },
      stats: {
        baselineNoiseDb,
        reductionDb,
        postNoiseDb,
        humRemoved,
        dereverbApplied
      }
    };

    const processingTime = Date.now() - startTime;

    if (req.trackUsage) {
      req.trackUsage(
        'noise-remover',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { size: req.file.size, mode, humHz, dereverb },
        { reductionDb },
        processingTime
      );
    }

    res.json({ success: true, data: { output, processingTime, note: 'Demo implementation. In production, spectral denoise and hum notch filtering would run.' } });
  } catch (error) {
    logger.error('Noise remover error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove noise' });
  }
});

router.post('/batch-trimmer', upload.array('videos', 10), [
  body('startTime').isFloat({ min: 0 }),
  body('endTime').isFloat({ min: 0 }),
  body('outputFormat').optional().isIn(['mp4','webm','mov'])
], async (req, res) => {
  const started = Date.now();
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No video files provided' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { startTime: trimStart, endTime: trimEnd, outputFormat = 'mp4' } = req.body;
    const originalDuration = 120; // mock
    const trimmedDuration = trimEnd - trimStart;

    const results = files.map((f, i) => ({
      id: i + 1,
      original: { name: f.originalname, size: f.size, duration: originalDuration },
      trimmed: {
        url: `/api/video/batch-trimmed-${Date.now()}-${i}.${outputFormat}`,
        format: outputFormat,
        duration: trimmedDuration,
        startTime: Number(trimStart),
        endTime: Number(trimEnd),
        estimatedSize: Math.floor(f.size * (trimmedDuration / originalDuration))
      }
    }));

    const processingTime = Date.now() - started;

    if (req.trackUsage) {
      req.trackUsage(
        'batch-trimmer',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { fileCount: files.length, outputFormat, duration: trimmedDuration },
        { totalEstimated: results.reduce((s, r) => s + r.trimmed.estimatedSize, 0) },
        processingTime
      );
    }

    res.json({ success: true, data: { items: results, processingTime, note: 'Demo implementation. In production, each video would be trimmed.' } });
  } catch (error) {
    logger.error('Batch trimmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to batch trim videos' });
  }
});

function formatSrtTime(seconds) {
  const s = Number(seconds) || 0;
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  const ms = String(Math.floor((s - Math.floor(s)) * 1000)).padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
}

export default router;