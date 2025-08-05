import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logger from '../utils/logger.js';
import { generateText } from './aiService.js';

// Business name generation patterns and suffixes
const businessPatterns = {
  modern: ['Tech', 'Digital', 'Smart', 'Pro', 'Elite', 'Prime', 'Max', 'Plus'],
  classic: ['Co', 'Corp', 'Inc', 'Ltd', 'Group', 'Associates', 'Partners'],
  creative: ['Studio', 'Lab', 'Works', 'Craft', 'Design', 'Creative', 'Art'],
  tech: ['Sys', 'Net', 'Code', 'Data', 'Cloud', 'Cyber', 'AI', 'Bot'],
  professional: ['Solutions', 'Services', 'Consulting', 'Advisors', 'Experts']
};

const businessPrefixes = {
  modern: ['Next', 'Future', 'Smart', 'Digital', 'Cyber', 'Meta', 'Ultra'],
  classic: ['Premier', 'Superior', 'Excellence', 'Quality', 'Reliable'],
  creative: ['Innovative', 'Creative', 'Artistic', 'Unique', 'Original'],
  tech: ['Tech', 'Data', 'Cloud', 'AI', 'Digital', 'Cyber', 'Code'],
  professional: ['Professional', 'Expert', 'Premier', 'Elite', 'Advanced']
};

export const generateBusinessNames = async (options) => {
  try {
    const { industry, keywords, style, length, count } = options;
    const names = [];

    // Generate AI-powered names if available
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const aiPrompt = `Generate ${count} creative business names for a ${industry} company. Style: ${style}. Keywords: ${keywords.join(', ')}. Return only the names, one per line.`;
        const aiNames = await generateText(aiPrompt);
        
        if (aiNames) {
          const aiNameList = aiNames.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0)
            .slice(0, Math.floor(count / 2));
          
          names.push(...aiNameList);
        }
      } catch (error) {
        logger.warn('AI name generation failed, using fallback:', error.message);
      }
    }

    // Generate pattern-based names as fallback or supplement
    const patterns = businessPatterns[style] || businessPatterns.modern;
    const prefixes = businessPrefixes[style] || businessPrefixes.modern;
    
    const industryWords = industry.split(' ');
    const allKeywords = [...keywords, ...industryWords];

    while (names.length < count) {
      let name = '';
      
      if (Math.random() > 0.5 && allKeywords.length > 0) {
        // Use keyword-based generation
        const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
        const suffix = patterns[Math.floor(Math.random() * patterns.length)];
        
        if (length === 'short') {
          name = `${keyword}${suffix}`;
        } else if (length === 'long') {
          const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
          name = `${prefix} ${keyword} ${suffix}`;
        } else {
          name = Math.random() > 0.5 ? `${keyword} ${suffix}` : `${keyword}${suffix}`;
        }
      } else {
        // Use prefix + industry + suffix pattern
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = patterns[Math.floor(Math.random() * patterns.length)];
        const industryWord = industryWords[Math.floor(Math.random() * industryWords.length)];
        
        if (length === 'short') {
          name = `${industryWord}${suffix}`;
        } else if (length === 'long') {
          name = `${prefix} ${industryWord} ${suffix}`;
        } else {
          name = `${prefix} ${industryWord}`;
        }
      }

      // Clean up and validate name
      name = name.replace(/\s+/g, ' ').trim();
      if (name && !names.includes(name) && name.length >= 3) {
        names.push(name);
      }
    }

    return names.slice(0, count);

  } catch (error) {
    logger.error('Business name generation error:', error);
    throw new Error('Failed to generate business names');
  }
};

export const generateSlogans = async (options) => {
  try {
    const { businessName, industry, targetAudience, tone, keywords, count } = options;
    const slogans = [];

    // Generate AI-powered slogans if available
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const aiPrompt = `Generate ${count} ${tone} slogans for "${businessName}", a ${industry} business. Target audience: ${targetAudience}. Keywords: ${keywords.join(', ')}. Make them catchy and memorable. Return only the slogans, one per line.`;
        const aiSlogans = await generateText(aiPrompt);
        
        if (aiSlogans) {
          const aiSloganList = aiSlogans.split('\n')
            .map(slogan => slogan.trim().replace(/^["']|["']$/g, ''))
            .filter(slogan => slogan.length > 0)
            .slice(0, Math.floor(count / 2));
          
          slogans.push(...aiSloganList);
        }
      } catch (error) {
        logger.warn('AI slogan generation failed, using fallback:', error.message);
      }
    }

    // Generate template-based slogans as fallback or supplement
    const sloganTemplates = {
      professional: [
        `${businessName} - Excellence in ${industry}`,
        `Your trusted ${industry} partner`,
        `Professional ${industry} solutions`,
        `Quality ${industry} services`,
        `${businessName} - Where quality meets service`
      ],
      friendly: [
        `${businessName} - Your friendly ${industry} experts`,
        `Making ${industry} simple and fun`,
        `${businessName} - We care about your success`,
        `Friendly ${industry} solutions`,
        `${businessName} - Always here to help`
      ],
      bold: [
        `${businessName} - Revolutionizing ${industry}`,
        `Bold solutions for ${industry}`,
        `${businessName} - Leading the ${industry} revolution`,
        `Unleash your ${industry} potential`,
        `${businessName} - Dare to be different`
      ],
      creative: [
        `${businessName} - Where creativity meets ${industry}`,
        `Innovative ${industry} solutions`,
        `${businessName} - Think outside the box`,
        `Creative ${industry} excellence`,
        `${businessName} - Imagination in action`
      ],
      trustworthy: [
        `${businessName} - Your reliable ${industry} partner`,
        `Trust, quality, excellence`,
        `${businessName} - Built on trust`,
        `Dependable ${industry} solutions`,
        `${businessName} - Your success is our promise`
      ]
    };

    const templates = sloganTemplates[tone] || sloganTemplates.professional;
    
    // Add template-based slogans
    while (slogans.length < count && templates.length > 0) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      if (!slogans.includes(template)) {
        slogans.push(template);
      }
    }

    // Generate keyword-based slogans
    if (keywords.length > 0) {
      const keywordSlogans = [
        `${businessName} - ${keywords[0]} excellence`,
        `Your ${keywords[0]} solution`,
        `${businessName} - Where ${keywords[0]} meets innovation`,
        `Professional ${keywords[0]} services`,
        `${businessName} - ${keywords[0]} you can trust`
      ];

      keywordSlogans.forEach(slogan => {
        if (slogans.length < count && !slogans.includes(slogan)) {
          slogans.push(slogan);
        }
      });
    }

    return slogans.slice(0, count);

  } catch (error) {
    logger.error('Slogan generation error:', error);
    throw new Error('Failed to generate slogans');
  }
};

export const createInvoicePDF = async (invoiceData) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const primaryColor = rgb(0.2, 0.3, 0.5);
    const textColor = rgb(0.1, 0.1, 0.1);
    const lightGray = rgb(0.9, 0.9, 0.9);

    let yPosition = height - 50;

    // Header
    page.drawText('INVOICE', {
      x: 50,
      y: yPosition,
      size: 28,
      font: boldFont,
      color: primaryColor
    });

    page.drawText(`#${invoiceData.invoiceNumber}`, {
      x: width - 200,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: textColor
    });

    yPosition -= 60;

    // Business Info
    page.drawText(invoiceData.businessInfo.name || 'Business Name', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textColor
    });

    yPosition -= 20;

    const businessAddress = [
      invoiceData.businessInfo.address,
      invoiceData.businessInfo.city,
      invoiceData.businessInfo.email,
      invoiceData.businessInfo.phone
    ].filter(Boolean);

    businessAddress.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: textColor
      });
      yPosition -= 15;
    });

    // Invoice Details (right side)
    let rightYPosition = height - 110;
    
    page.drawText(`Date: ${invoiceData.date}`, {
      x: width - 200,
      y: rightYPosition,
      size: 10,
      font: font,
      color: textColor
    });

    rightYPosition -= 20;

    page.drawText(`Due Date: ${invoiceData.dueDate}`, {
      x: width - 200,
      y: rightYPosition,
      size: 10,
      font: font,
      color: textColor
    });

    yPosition -= 40;

    // Bill To
    page.drawText('Bill To:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: textColor
    });

    yPosition -= 20;

    page.drawText(invoiceData.clientInfo.name || 'Client Name', {
      x: 50,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: textColor
    });

    yPosition -= 20;

    const clientAddress = [
      invoiceData.clientInfo.address,
      invoiceData.clientInfo.city,
      invoiceData.clientInfo.email
    ].filter(Boolean);

    clientAddress.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: textColor
      });
      yPosition -= 15;
    });

    yPosition -= 40;

    // Items Table Header
    const tableStartY = yPosition;
    
    page.drawRectangle({
      x: 50,
      y: yPosition - 5,
      width: width - 100,
      height: 25,
      color: lightGray
    });

    page.drawText('Description', {
      x: 60,
      y: yPosition + 5,
      size: 10,
      font: boldFont,
      color: textColor
    });

    page.drawText('Qty', {
      x: 350,
      y: yPosition + 5,
      size: 10,
      font: boldFont,
      color: textColor
    });

    page.drawText('Rate', {
      x: 400,
      y: yPosition + 5,
      size: 10,
      font: boldFont,
      color: textColor
    });

    page.drawText('Total', {
      x: 480,
      y: yPosition + 5,
      size: 10,
      font: boldFont,
      color: textColor
    });

    yPosition -= 30;

    // Items
    invoiceData.items.forEach((item, index) => {
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: yPosition - 5,
          width: width - 100,
          height: 20,
          color: rgb(0.98, 0.98, 0.98)
        });
      }

      page.drawText(item.description || 'Item', {
        x: 60,
        y: yPosition,
        size: 9,
        font: font,
        color: textColor
      });

      page.drawText(item.quantity.toString(), {
        x: 360,
        y: yPosition,
        size: 9,
        font: font,
        color: textColor
      });

      page.drawText(`$${item.rate}`, {
        x: 400,
        y: yPosition,
        size: 9,
        font: font,
        color: textColor
      });

      page.drawText(`$${item.total}`, {
        x: 480,
        y: yPosition,
        size: 9,
        font: font,
        color: textColor
      });

      yPosition -= 25;
    });

    yPosition -= 20;

    // Totals
    page.drawText(`Subtotal: $${invoiceData.subtotal}`, {
      x: 400,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor
    });

    yPosition -= 20;

    page.drawText(`Tax: $${invoiceData.tax}`, {
      x: 400,
      y: yPosition,
      size: 10,
      font: font,
      color: textColor
    });

    yPosition -= 20;

    page.drawText(`Total: $${invoiceData.total}`, {
      x: 400,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: primaryColor
    });

    // Notes
    if (invoiceData.notes) {
      yPosition -= 60;
      
      page.drawText('Notes:', {
        x: 50,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: textColor
      });

      yPosition -= 20;

      const notes = invoiceData.notes.split('\n');
      notes.forEach(note => {
        page.drawText(note, {
          x: 50,
          y: yPosition,
          size: 9,
          font: font,
          color: textColor
        });
        yPosition -= 15;
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);

  } catch (error) {
    logger.error('PDF generation error:', error);
    throw new Error('Failed to generate invoice PDF');
  }
};