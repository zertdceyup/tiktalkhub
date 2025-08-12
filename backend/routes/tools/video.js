import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import logger from '../../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads/video');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${Math.round(Math.random()*1e6)}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true); else cb(new Error('Invalid video file type'));
  }
});

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ff = spawn(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', ...args]);
    let stderr = '';
    ff.stderr.on('data', d => { stderr += d.toString(); });
    ff.on('close', code => {
      if (code === 0) resolve(stderr);
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
    });
  });
}

// Video Trimmer - real ffmpeg
router.post('/video-trimmer', upload.single('video'), [
  body('startTime').isFloat({ min: 0 }),
  body('endTime').isFloat({ min: 0 }),
  body('outputFormat').optional().isIn(['mp4', 'webm', 'mov'])
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { startTime: trimStart, endTime: trimEnd, outputFormat = 'mp4' } = req.body;
    const inputPath = req.file.path;
    const base = path.parse(inputPath).name;
    const outPath = path.join(uploadsDir, `${base}_trimmed.${outputFormat}`);
    await runFFmpeg(['-ss', String(trimStart), '-to', String(trimEnd), '-i', inputPath, '-c', 'copy', outPath]);
    const processingTime = Date.now() - startTime;
    if (req.trackUsage) req.trackUsage('video-trimmer', req.user?.id, req.ip, req.get('User-Agent'), { input: path.basename(inputPath), outputFormat }, { outPath: path.basename(outPath) }, processingTime);
    res.json({ success: true, data: { trimmedVideo: { url: `/uploads/video/${path.basename(outPath)}`, format: outputFormat }, processingTime } });
  } catch (error) {
    logger.error('Video trimmer error:', error);
    res.status(500).json({ success: false, message: 'Failed to trim video' });
  }
});

// Thumbnail Selector - real ffmpeg extracting N thumbs evenly
router.post('/thumbnail-selector', upload.single('video'), [
  body('count').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });
    const { count = 6 } = req.body;
    const inputPath = req.file.path;
    const base = path.parse(inputPath).name;
    // Probe duration
    const probe = spawn(process.env.FFPROBE_PATH || 'ffprobe', ['-v','error','-show_entries','format=duration','-of','default=nk=1:nw=1', inputPath]);
    const duration = await new Promise((resolve) => {
      let out=''; probe.stdout.on('data', d => out += d.toString());
      probe.on('close', () => resolve(parseFloat(out) || 60));
    });
    const thumbs = [];
    for (let i = 1; i <= Number(count); i++) {
      const ts = Math.max(0, (duration / (Number(count)+1)) * i);
      const outJpg = path.join(uploadsDir, `${base}_thumb_${i}.jpg`);
      await runFFmpeg(['-ss', String(ts), '-i', inputPath, '-frames:v','1','-q:v','2', outJpg]);
      thumbs.push({ id: i, timestamp: ts, url: `/uploads/video/${path.basename(outJpg)}`, width: 0, height: 0 });
    }
    const processingTime = Date.now() - startTime;
    if (req.trackUsage) req.trackUsage('thumbnail-selector', req.user?.id, req.ip, req.get('User-Agent'), { count: Number(count) }, { thumbnails: thumbs.length }, processingTime);
    res.json({ success: true, data: { thumbnails: thumbs, processingTime } });
  } catch (error) {
    logger.error('Thumbnail selector error:', error);
    res.status(500).json({ success: false, message: 'Failed to extract thumbnails' });
  }
});

// GIF Maker - real ffmpeg
router.post('/gif-maker', upload.single('video'), [
  body('startTime').optional().isFloat({ min: 0 }),
  body('duration').optional().isFloat({ min: 0.1, max: 10 }),
  body('quality').optional().isIn(['low', 'medium', 'high']),
  body('fps').optional().isInt({ min: 5, max: 30 })
], async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });
    const { startTime: gifStart = 0, duration = 3, quality = 'medium', fps = 15 } = req.body;
    const scale = quality === 'high' ? '480:-1' : quality === 'medium' ? '320:-1' : '240:-1';
    const inputPath = req.file.path;
    const base = path.parse(inputPath).name;
    const palette = path.join(uploadsDir, `${base}_palette.png`);
    const outGif = path.join(uploadsDir, `${base}.gif`);
    await runFFmpeg(['-ss', String(gifStart), '-t', String(duration), '-i', inputPath, '-vf', `fps=${fps},scale=${scale}:flags=lanczos,palettegen`, palette]);
    await runFFmpeg(['-ss', String(gifStart), '-t', String(duration), '-i', inputPath, '-i', palette, '-lavfi', `fps=${fps},scale=${scale}:flags=lanczos [x]; [x][1:v] paletteuse`, outGif]);
    const processingTime = Date.now() - startTime;
    if (req.trackUsage) req.trackUsage('gif-maker', req.user?.id, req.ip, req.get('User-Agent'), { duration, fps, quality }, { out: path.basename(outGif) }, processingTime);
    res.json({ success: true, data: { gif: { url: `/uploads/video/${path.basename(outGif)}` }, processingTime } });
  } catch (error) {
    logger.error('GIF maker error:', error);
    res.status(500).json({ success: false, message: 'Failed to create GIF' });
  }
});

// Caption Overlay - burn subtitles via ffmpeg using SRT
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
    if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    const { captions } = req.body;
    const list = Array.isArray(captions) ? captions : JSON.parse(captions);
    const srt = list.map((c, idx) => `${idx + 1}\n${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n${c.text}\n`).join('\n');
    const srtPath = path.join(uploadsDir, `${Date.now()}_${Math.round(Math.random()*1e6)}.srt`);
    fs.writeFileSync(srtPath, srt, 'utf8');
    const inputPath = req.file.path;
    const outPath = path.join(uploadsDir, `${path.parse(inputPath).name}_captioned.mp4`);
    await runFFmpeg(['-i', inputPath, '-vf', `subtitles='${srtPath.replace(/:/g, '\\:')}'`, '-c:a','copy', outPath]);
    const processingTime = Date.now() - startTime;
    if (req.trackUsage) req.trackUsage('caption-overlay', req.user?.id, req.ip, req.get('User-Agent'), { captionCount: list.length }, { out: path.basename(outPath) }, processingTime);
    res.json({ success: true, data: { output: { url: `/uploads/video/${path.basename(outPath)}` }, processingTime } });
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

router.post('/thumbnail-optimizer', upload.single('video'), [
  body('count').optional().isInt({ min: 1, max: 12 }),
  body('title').optional().isString(),
  body('style').optional().isIn(['clean','bold','minimal','vibrant']),
  body('colorScheme').optional().isString(),
  body('addBorder').optional().isBoolean(),
  body('badgeText').optional().isString()
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

    const { count = 6, title = '', style = 'bold', colorScheme = 'red', addBorder = false, badgeText = '' } = req.body;

    const candidates = [];
    const videoDuration = 120; // mock seconds
    for (let i = 0; i < Number(count); i++) {
      const timestamp = Math.round((videoDuration / Number(count)) * i);
      const score = Math.round(60 + Math.random() * 40); // 60-100 mock CTR score
      const textColor = style === 'bold' ? '#ffffff' : '#111111';
      const bgColor = colorScheme === 'red' ? '#E11D48' : colorScheme === 'blue' ? '#2563EB' : '#16A34A';
      candidates.push({
        id: i + 1,
        timestamp,
        url: `/api/thumbnails/optimized-${Date.now()}-${i}.jpg`,
        score,
        overlay: { title, style, textColor, bgColor, addBorder: addBorder === true || addBorder === 'true', badgeText },
        recommended: {
          textPosition: i % 2 === 0 ? 'top' : 'bottom',
          safeZone: { top: 0.1, bottom: 0.15, left: 0.05, right: 0.05 }
        },
        size: { width: 1280, height: 720 }
      });
    }

    const processingTime = Date.now() - startTime;

    if (req.trackUsage) {
      req.trackUsage(
        'thumbnail-optimizer',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { videoSize: req.file.size, count: Number(count), style, colorScheme },
        { candidates: candidates.length, topScore: Math.max(...candidates.map(c => c.score)) },
        processingTime
      );
    }

    res.json({ success: true, data: { video: { name: req.file.originalname, size: req.file.size }, candidates, processingTime, note: 'Demo implementation. In production, frames would be extracted and styled overlays applied.' } });
  } catch (error) {
    logger.error('Thumbnail optimizer error:', error);
    res.status(500).json({ success: false, message: 'Failed to optimize thumbnails' });
  }
});

router.post('/smart-caption-generator', upload.single('video'), [
  body('language').optional().isIn(['en','es','fr','de','it']),
  body('maxLineLength').optional().isInt({ min: 20, max: 80 }),
  body('includePunctuation').optional().isBoolean(),
], async (req, res) => {
  const started = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const language = req.body.language || 'en';
    const maxLineLength = req.body.maxLineLength ? Number(req.body.maxLineLength) : 42;
    const includePunctuation = req.body.includePunctuation === 'true' || req.body.includePunctuation === true;

    // Mock transcription segments
    const segments = [
      { start: 0.0, end: 2.8, text: 'welcome to tiktalkhub' },
      { start: 2.8, end: 6.2, text: 'today we are showing a demo of smart captions' },
      { start: 6.2, end: 9.0, text: 'everything runs locally with no paid apis' },
      { start: 9.0, end: 12.5, text: 'optimize your content with our tools' }
    ];

    const normalize = (t) => {
      const line = t.slice(0, maxLineLength);
      if (!includePunctuation) return line.replace(/[.,!?;:]/g, '');
      return line;
    };

    const captions = segments.map(s => ({ start: s.start, end: s.end, text: normalize(s.text) }));

    const toSrtTime = (seconds) => {
      const s = Number(seconds) || 0;
      const hh = String(Math.floor(s / 3600)).padStart(2, '0');
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss = String(Math.floor(s % 60)).padStart(2, '0');
      const ms = String(Math.floor((s - Math.floor(s)) * 1000)).padStart(3, '0');
      return `${hh}:${mm}:${ss},${ms}`;
    };

    const srt = captions.map((c, i) => `${i + 1}\n${toSrtTime(c.start)} --> ${toSrtTime(c.end)}\n${c.text}\n`).join('\n');

    const processingTime = Date.now() - started;

    if (req.trackUsage) {
      req.trackUsage('smart-caption-generator', req.user?.id, req.ip, req.get('User-Agent'), { size: req.file.size, language }, { captions: captions.length }, processingTime);
    }

    res.json({ success: true, data: { language, captions, srt, processingTime, note: 'Demo implementation. In production, local ASR (e.g., Whisper CPP) would be used.' } });
  } catch (error) {
    logger.error('Smart caption generator error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate captions' });
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