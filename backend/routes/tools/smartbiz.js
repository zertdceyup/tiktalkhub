import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { generateBusinessNames, generateSlogans, createInvoicePDF } from '../../services/smartbizService.js';

const router = express.Router();

// Business Name Generator
router.post('/business-name-generator', [
  body('industry').isLength({ min: 1, max: 100 }),
  body('keywords').optional().isArray(),
  body('style').optional().isIn(['modern', 'classic', 'creative', 'tech', 'professional']),
  body('length').optional().isIn(['short', 'medium', 'long'])
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

    const { industry, keywords = [], style = 'modern', length = 'medium' } = req.body;

    const businessNames = await generateBusinessNames({
      industry,
      keywords,
      style,
      length,
      count: 20
    });

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'business-name-generator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { industry, keywords, style, length },
        { businessNames },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        businessNames,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Business name generator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate business names'
    });
  }
});

// Slogan Creator
router.post('/slogan-creator', [
  body('businessName').isLength({ min: 1, max: 100 }),
  body('industry').isLength({ min: 1, max: 100 }),
  body('targetAudience').optional().isLength({ max: 200 }),
  body('tone').optional().isIn(['professional', 'friendly', 'bold', 'creative', 'trustworthy']),
  body('keywords').optional().isArray()
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

    const { businessName, industry, targetAudience, tone = 'professional', keywords = [] } = req.body;

    const slogans = await generateSlogans({
      businessName,
      industry,
      targetAudience,
      tone,
      keywords,
      count: 15
    });

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'slogan-creator',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { businessName, industry, targetAudience, tone, keywords },
        { slogans },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        slogans,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Slogan creator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate slogans'
    });
  }
});

// Logo Sketch Wizard
router.post('/logo-sketch-wizard', [
  body('businessName').isLength({ min: 1, max: 100 }),
  body('industry').isLength({ min: 1, max: 100 }),
  body('style').optional().isIn(['minimalist', 'modern', 'vintage', 'playful', 'elegant']),
  body('colors').optional().isArray(),
  body('symbols').optional().isArray()
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

    const { businessName, industry, style = 'modern', colors = [], symbols = [] } = req.body;

    // Generate logo concepts and suggestions
    const logoConcepts = [
      {
        id: 1,
        type: 'text-based',
        description: `Modern text logo for ${businessName}`,
        suggestions: {
          fonts: ['Montserrat', 'Roboto', 'Open Sans', 'Lato'],
          colors: colors.length > 0 ? colors : ['#2563eb', '#7c3aed', '#059669', '#dc2626'],
          layout: 'horizontal'
        }
      },
      {
        id: 2,
        type: 'icon-text',
        description: `Icon with text logo for ${businessName}`,
        suggestions: {
          icons: symbols.length > 0 ? symbols : ['circle', 'square', 'triangle', 'star'],
          fonts: ['Poppins', 'Inter', 'Nunito'],
          colors: colors.length > 0 ? colors : ['#1f2937', '#3b82f6', '#10b981'],
          layout: 'left-icon'
        }
      },
      {
        id: 3,
        type: 'emblem',
        description: `Emblem style logo for ${businessName}`,
        suggestions: {
          shapes: ['shield', 'badge', 'crest', 'seal'],
          fonts: ['Serif', 'Playfair Display', 'Merriweather'],
          colors: colors.length > 0 ? colors : ['#991b1b', '#1e40af', '#065f46'],
          layout: 'centered'
        }
      }
    ];

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'logo-sketch-wizard',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { businessName, industry, style, colors, symbols },
        { logoConcepts },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        logoConcepts,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Logo sketch wizard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate logo concepts'
    });
  }
});

// Smart Flyer Designer
router.post('/smart-flyer-designer', [
  body('title').isLength({ min: 1, max: 200 }),
  body('description').isLength({ min: 1, max: 1000 }),
  body('contactInfo').isObject(),
  body('template').optional().isIn(['business', 'event', 'promotion', 'service']),
  body('colors').optional().isObject()
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

    const { title, description, contactInfo, template = 'business', colors = {} } = req.body;

    // Generate flyer design suggestions
    const flyerDesign = {
      template: template,
      layout: {
        header: {
          title: title,
          fontSize: '32px',
          fontWeight: 'bold',
          color: colors.primary || '#1f2937'
        },
        body: {
          description: description,
          fontSize: '16px',
          color: colors.text || '#374151'
        },
        footer: {
          contactInfo: contactInfo,
          fontSize: '14px',
          color: colors.secondary || '#6b7280'
        }
      },
      colorScheme: {
        primary: colors.primary || '#3b82f6',
        secondary: colors.secondary || '#e5e7eb',
        accent: colors.accent || '#f59e0b',
        background: colors.background || '#ffffff'
      },
      suggestions: [
        'Add a compelling call-to-action',
        'Include your logo for brand recognition',
        'Use high-quality images relevant to your message',
        'Keep text concise and easy to read',
        'Ensure contact information is prominently displayed'
      ]
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'smart-flyer-designer',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { title, description, contactInfo, template, colors },
        { flyerDesign },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        flyerDesign,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Smart flyer designer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate flyer design'
    });
  }
});

// Invoice Maker
router.post('/invoice-maker', [
  body('invoiceNumber').isLength({ min: 1, max: 50 }),
  body('businessInfo').isObject(),
  body('clientInfo').isObject(),
  body('items').isArray({ min: 1 }),
  body('dueDate').isISO8601(),
  body('notes').optional().isLength({ max: 500 }),
  body('currency').optional().isIn(['USD','EUR','GBP','CAD','AUD','INR','JPY','CNY','ZAR','NGN','BRL','MXN']),
  body('taxMode').optional().isIn(['exclusive','inclusive']),
  body('discount').optional().isFloat({ min: 0, max: 100 }),
  body('businessInfo.logoDataUrl').optional().isString(),
  body('items.*.discount').optional().isFloat({ min: 0, max: 100 })
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
      invoiceNumber,
      businessInfo,
      clientInfo,
      items,
      dueDate,
      notes = '',
      currency = 'USD',
      taxMode = 'exclusive',
      discount = 0
    } = req.body;

    const currencySymbol = getCurrencySymbol(currency);

    // Calculate totals with per-line and overall discounts and tax modes
    let rawSubtotal = 0;
    const processedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const lineSubtotal = quantity * rate;
      const lineDiscountPct = Number(item.discount) || 0; // percent
      const lineDiscountAmount = lineSubtotal * (lineDiscountPct / 100);
      const lineTotal = lineSubtotal - lineDiscountAmount;
      rawSubtotal += lineTotal;
      return {
        description: item.description,
        quantity,
        rate: rate.toFixed(2),
        discountPct: lineDiscountPct,
        discountAmount: lineDiscountAmount.toFixed(2),
        total: lineTotal.toFixed(2)
      };
    });

    // Apply overall discount (percent)
    const overallDiscountPct = Number(discount) || 0;
    const overallDiscountAmount = rawSubtotal * (overallDiscountPct / 100);
    const subtotalAfterDiscount = rawSubtotal - overallDiscountAmount;

    const taxRate = Number(businessInfo.taxRate || 0);
    let tax = 0;
    let preTaxSubtotal = subtotalAfterDiscount;
    let grandTotal = 0;

    if (taxMode === 'inclusive' && taxRate > 0) {
      // Prices include tax already
      preTaxSubtotal = subtotalAfterDiscount / (1 + taxRate / 100);
      tax = subtotalAfterDiscount - preTaxSubtotal;
      grandTotal = subtotalAfterDiscount;
    } else {
      // Exclusive tax
      tax = subtotalAfterDiscount * (taxRate / 100);
      grandTotal = subtotalAfterDiscount + tax;
    }

    const invoiceData = {
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      businessInfo,
      clientInfo,
      items: processedItems,
      currency,
      currencySymbol,
      taxMode,
      subtotal: preTaxSubtotal.toFixed(2),
      discountPct: overallDiscountPct,
      discountAmount: overallDiscountAmount.toFixed(2),
      taxRate,
      tax: tax.toFixed(2),
      total: grandTotal.toFixed(2),
      notes
    };

    // Generate PDF if requested
    let pdfBuffer = null;
    let pdfUrl = null;
    if (req.body.generatePDF) {
      pdfBuffer = await createInvoicePDF(invoiceData);
      // Persist PDF to disk and return a URL
      try {
        const { default: path } = await import('path');
        const { default: fs } = await import('fs');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const safeInvoiceNum = String(invoiceNumber).replace(/[^a-zA-Z0-9-_]/g, '_');
        const fileName = `invoice_${safeInvoiceNum}_${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);
        pdfUrl = `/uploads/invoices/${fileName}`;
      } catch (fsErr) {
        logger.error('Failed to persist invoice PDF:', fsErr);
      }
    }

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'invoice-maker',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { invoiceNumber, businessInfo, clientInfo, items: items.length },
        { total: grandTotal, itemCount: items.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        invoice: invoiceData,
        pdfGenerated: !!pdfBuffer,
        pdfUrl,
        breakdown: {
          rawSubtotal: rawSubtotal.toFixed(2),
          overallDiscountPct: overallDiscountPct,
          overallDiscountAmount: overallDiscountAmount.toFixed(2)
        },
        processingTime
      }
    });

  } catch (error) {
    logger.error('Invoice maker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

function getCurrencySymbol(code) {
  const map = {
    USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', INR: '₹', JPY: '¥', CNY: '¥', ZAR: 'R', NGN: '₦', BRL: 'R$', MXN: '$'
  };
  return map[code] || '$';
}

export default router;