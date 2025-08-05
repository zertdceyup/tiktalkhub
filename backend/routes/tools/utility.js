import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import logger from '../../utils/logger.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// QR Code Generator
router.post('/qr-generator', [
  body('text').isLength({ min: 1, max: 2000 }),
  body('size').optional().isInt({ min: 100, max: 1000 }),
  body('format').optional().isIn(['png', 'svg']),
  body('errorCorrectionLevel').optional().isIn(['L', 'M', 'Q', 'H']),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('backgroundColor').optional().matches(/^#[0-9A-F]{6}$/i)
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
      text, 
      size = 300, 
      format = 'png', 
      errorCorrectionLevel = 'M',
      color = '#000000',
      backgroundColor = '#FFFFFF'
    } = req.body;

    const qrOptions = {
      errorCorrectionLevel,
      type: format === 'svg' ? 'svg' : 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: color,
        light: backgroundColor
      },
      width: size
    };

    let qrCode;
    if (format === 'svg') {
      qrCode = await QRCode.toString(text, qrOptions);
    } else {
      qrCode = await QRCode.toDataURL(text, qrOptions);
    }

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'qr-generator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { textLength: text.length, size, format, errorCorrectionLevel },
        { qrGenerated: true },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        qrCode,
        format,
        size,
        text: text.length > 100 ? text.substring(0, 100) + '...' : text,
        processingTime
      }
    });

  } catch (error) {
    logger.error('QR generator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

// Image Optimizer
router.post('/image-optimizer', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { 
      quality = 80, 
      width, 
      height, 
      format = 'jpeg',
      maintainAspectRatio = true
    } = req.body;

    const originalBuffer = req.file.buffer;
    const originalSize = originalBuffer.length;

    let sharpImage = sharp(originalBuffer);
    
    // Get original image metadata
    const metadata = await sharpImage.metadata();

    // Resize if dimensions provided
    if (width || height) {
      const resizeOptions = {};
      if (width) resizeOptions.width = parseInt(width);
      if (height) resizeOptions.height = parseInt(height);
      if (!maintainAspectRatio) resizeOptions.fit = 'fill';
      
      sharpImage = sharpImage.resize(resizeOptions);
    }

    // Convert and optimize
    let optimizedBuffer;
    switch (format.toLowerCase()) {
      case 'png':
        optimizedBuffer = await sharpImage
          .png({ quality: parseInt(quality), compressionLevel: 9 })
          .toBuffer();
        break;
      case 'webp':
        optimizedBuffer = await sharpImage
          .webp({ quality: parseInt(quality) })
          .toBuffer();
        break;
      default:
        optimizedBuffer = await sharpImage
          .jpeg({ quality: parseInt(quality), progressive: true })
          .toBuffer();
    }

    const optimizedSize = optimizedBuffer.length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);

    // Convert to base64 for response
    const optimizedImage = `data:image/${format};base64,${optimizedBuffer.toString('base64')}`;

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'image-optimizer',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { originalSize, format, quality, hasResize: !!(width || height) },
        { optimizedSize, compressionRatio: parseFloat(compressionRatio) },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        optimizedImage,
        originalSize,
        optimizedSize,
        compressionRatio: `${compressionRatio}%`,
        format,
        dimensions: {
          original: { width: metadata.width, height: metadata.height },
          optimized: { width: width || metadata.width, height: height || metadata.height }
        },
        processingTime
      }
    });

  } catch (error) {
    logger.error('Image optimizer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize image'
    });
  }
});

// PDF Compressor
router.post('/pdf-compressor', upload.single('pdf'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided'
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'File must be a PDF'
      });
    }

    const originalBuffer = req.file.buffer;
    const originalSize = originalBuffer.length;

    // Load the PDF
    const pdfDoc = await PDFDocument.load(originalBuffer);
    
    // Get PDF info
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || 'Untitled';

    // Basic compression by removing unnecessary data
    // Note: For more advanced compression, you'd need additional libraries
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false
    });

    const compressedSize = compressedPdfBytes.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

    // Convert to base64 for response
    const compressedPdf = `data:application/pdf;base64,${Buffer.from(compressedPdfBytes).toString('base64')}`;

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'pdf-compressor',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { originalSize, pageCount },
        { compressedSize, compressionRatio: parseFloat(compressionRatio) },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        compressedPdf,
        originalSize,
        compressedSize,
        compressionRatio: `${compressionRatio}%`,
        pageCount,
        title,
        processingTime
      }
    });

  } catch (error) {
    logger.error('PDF compressor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compress PDF'
    });
  }
});

// AI Meme Generator
router.post('/ai-meme-generator', [
  body('topText').optional().isLength({ max: 100 }),
  body('bottomText').optional().isLength({ max: 100 }),
  body('template').optional().isIn(['drake', 'distracted-boyfriend', 'woman-yelling-cat', 'two-buttons', 'expanding-brain']),
  body('style').optional().isIn(['classic', 'modern', 'minimalist'])
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

    const { topText = '', bottomText = '', template = 'drake', style = 'classic' } = req.body;

    // Meme templates with dimensions and text positioning
    const memeTemplates = {
      'drake': {
        width: 600,
        height: 600,
        textAreas: [
          { x: 300, y: 150, width: 280, align: 'left' },
          { x: 300, y: 450, width: 280, align: 'left' }
        ]
      },
      'distracted-boyfriend': {
        width: 680,
        height: 500,
        textAreas: [
          { x: 340, y: 50, width: 300, align: 'center' },
          { x: 340, y: 450, width: 300, align: 'center' }
        ]
      },
      'woman-yelling-cat': {
        width: 680,
        height: 438,
        textAreas: [
          { x: 170, y: 50, width: 300, align: 'center' },
          { x: 510, y: 50, width: 150, align: 'center' }
        ]
      },
      'two-buttons': {
        width: 600,
        height: 908,
        textAreas: [
          { x: 300, y: 200, width: 250, align: 'center' },
          { x: 300, y: 800, width: 250, align: 'center' }
        ]
      },
      'expanding-brain': {
        width: 857,
        height: 1202,
        textAreas: [
          { x: 428, y: 150, width: 400, align: 'center' },
          { x: 428, y: 450, width: 400, align: 'center' },
          { x: 428, y: 750, width: 400, align: 'center' },
          { x: 428, y: 1050, width: 400, align: 'center' }
        ]
      }
    };

    const selectedTemplate = memeTemplates[template];

    // Create a simple meme representation (in a real implementation, you'd overlay text on actual images)
    const memeData = {
      template,
      style,
      topText,
      bottomText,
      dimensions: {
        width: selectedTemplate.width,
        height: selectedTemplate.height
      },
      textAreas: selectedTemplate.textAreas,
      // In a real implementation, this would be a base64 image with text overlaid
      imageUrl: `/api/memes/${template}.jpg`,
      suggestions: [
        'Keep text short and punchy',
        'Use contrasting colors for readability',
        'Consider your audience and context',
        'Test different templates for best fit',
        'Make sure text is legible at small sizes'
      ]
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'ai-meme-generator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { template, style, hasTopText: !!topText, hasBottomText: !!bottomText },
        { memeGenerated: true },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        meme: memeData,
        processingTime
      }
    });

  } catch (error) {
    logger.error('AI meme generator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meme'
    });
  }
});

// PDF Merger
router.post('/pdf-merger', upload.array('pdfs', 10), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 PDF files are required'
      });
    }

    // Verify all files are PDFs
    for (const file of req.files) {
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'All files must be PDFs'
        });
      }
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    let totalPages = 0;
    const fileInfo = [];

    // Process each PDF file
    for (const file of req.files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pageCount = pdfDoc.getPageCount();
      const pages = await mergedPdf.copyPages(pdfDoc, Array.from({ length: pageCount }, (_, i) => i));
      
      pages.forEach(page => mergedPdf.addPage(page));
      
      totalPages += pageCount;
      fileInfo.push({
        name: file.originalname,
        size: file.size,
        pages: pageCount
      });
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const mergedSize = mergedPdfBytes.length;

    // Convert to base64 for response
    const mergedPdfBase64 = `data:application/pdf;base64,${Buffer.from(mergedPdfBytes).toString('base64')}`;

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'pdf-merger',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { fileCount: req.files.length, totalPages },
        { mergedSize, totalPages },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        mergedPdf: mergedPdfBase64,
        fileCount: req.files.length,
        totalPages,
        mergedSize,
        fileInfo,
        processingTime
      }
    });

  } catch (error) {
    logger.error('PDF merger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge PDFs'
    });
  }
});

export default router;