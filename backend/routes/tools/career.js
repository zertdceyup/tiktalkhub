import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { generateText, analyzeSentiment } from '../../services/aiService.js';

const router = express.Router();

// Resume Builder
router.post('/resume-builder', [
  body('personalInfo').isObject(),
  body('experience').isArray(),
  body('education').isArray(),
  body('skills').isArray(),
  body('template').optional().isIn(['modern', 'classic', 'creative', 'professional'])
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

    const { personalInfo, experience, education, skills, template = 'modern' } = req.body;

    // Generate AI-enhanced descriptions if available
    const enhancedExperience = [];
    for (const exp of experience) {
      let enhancedDescription = exp.description;
      
      if (process.env.ENABLE_LOCAL_AI === 'true') {
        try {
          const prompt = `Enhance this job description for a resume: "${exp.description}". Make it more professional and impactful using action verbs and quantifiable achievements.`;
          enhancedDescription = await generateText(prompt) || exp.description;
        } catch (error) {
          logger.warn('AI enhancement failed for experience:', error.message);
        }
      }

      enhancedExperience.push({
        ...exp,
        originalDescription: exp.description,
        enhancedDescription: enhancedDescription.split('\n')[0] // Take first line
      });
    }

    // Generate professional summary
    let professionalSummary = `Experienced professional with ${experience.length} years of experience in ${skills.slice(0, 3).join(', ')}.`;
    
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Create a professional summary for a resume based on this information: 
        Name: ${personalInfo.name}
        Experience: ${experience.map(e => e.position + ' at ' + e.company).join(', ')}
        Skills: ${skills.join(', ')}
        Make it compelling and professional in 2-3 sentences.`;
        
        const aiSummary = await generateText(prompt);
        if (aiSummary) {
          professionalSummary = aiSummary.replace(/\n/g, ' ').trim();
        }
      } catch (error) {
        logger.warn('AI summary generation failed:', error.message);
      }
    }

    const resumeData = {
      personalInfo,
      professionalSummary,
      experience: enhancedExperience,
      education,
      skills,
      template,
      suggestions: [
        'Use action verbs to start each bullet point',
        'Quantify achievements with numbers and percentages',
        'Tailor your resume to each job application',
        'Keep it to 1-2 pages maximum',
        'Use consistent formatting throughout'
      ]
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'resume-builder',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { experienceCount: experience.length, skillsCount: skills.length, template },
        { summaryGenerated: true, experienceEnhanced: enhancedExperience.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        resume: resumeData,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Resume builder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to build resume'
    });
  }
});

// Cover Letter AI
router.post('/cover-letter-ai', [
  body('personalInfo').isObject(),
  body('jobTitle').isLength({ min: 1, max: 200 }),
  body('companyName').isLength({ min: 1, max: 100 }),
  body('jobDescription').optional().isLength({ max: 2000 }),
  body('experience').optional().isArray(),
  body('tone').optional().isIn(['professional', 'enthusiastic', 'confident', 'friendly'])
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

    const { personalInfo, jobTitle, companyName, jobDescription = '', experience = [], tone = 'professional' } = req.body;

    let coverLetter = generateFallbackCoverLetter(personalInfo, jobTitle, companyName, tone);

    // Generate AI-powered cover letter if available
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Write a ${tone} cover letter for ${personalInfo.name} applying for ${jobTitle} at ${companyName}. 
        ${jobDescription ? `Job description: ${jobDescription}` : ''}
        ${experience.length > 0 ? `Relevant experience: ${experience.map(e => e.position + ' at ' + e.company).join(', ')}` : ''}
        Make it compelling and tailored to the position.`;
        
        const aiCoverLetter = await generateText(prompt, { maxTokens: 300 });
        if (aiCoverLetter && aiCoverLetter.length > 100) {
          coverLetter = aiCoverLetter;
        }
      } catch (error) {
        logger.warn('AI cover letter generation failed:', error.message);
      }
    }

    // Analyze sentiment of the cover letter
    const sentiment = analyzeSentiment(coverLetter);

    const result = {
      coverLetter,
      personalInfo,
      jobTitle,
      companyName,
      tone,
      sentiment,
      suggestions: [
        'Customize the opening paragraph for each application',
        'Highlight specific achievements with numbers',
        'Research the company and mention specific details',
        'End with a strong call to action',
        'Keep it to one page maximum'
      ]
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'cover-letter-ai',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { jobTitle, companyName, tone, hasJobDescription: !!jobDescription },
        { letterLength: coverLetter.length, sentiment: sentiment.sentiment },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        ...result,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Cover letter AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter'
    });
  }
});

// LinkedIn Summary Generator
router.post('/linkedin-summary', [
  body('personalInfo').isObject(),
  body('currentRole').isLength({ min: 1, max: 100 }),
  body('industry').isLength({ min: 1, max: 100 }),
  body('experience').isArray(),
  body('skills').isArray(),
  body('goals').optional().isLength({ max: 500 }),
  body('tone').optional().isIn(['professional', 'personal', 'creative', 'executive'])
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

    const { personalInfo, currentRole, industry, experience, skills, goals = '', tone = 'professional' } = req.body;

    let linkedinSummary = generateFallbackLinkedInSummary(personalInfo, currentRole, industry, skills, tone);

    // Generate AI-powered LinkedIn summary if available
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Create a ${tone} LinkedIn summary for ${personalInfo.name}, a ${currentRole} in the ${industry} industry.
        Experience: ${experience.map(e => e.position).join(', ')}
        Skills: ${skills.join(', ')}
        ${goals ? `Career goals: ${goals}` : ''}
        Make it engaging and professional, 2-3 paragraphs.`;
        
        const aiSummary = await generateText(prompt, { maxTokens: 250 });
        if (aiSummary && aiSummary.length > 100) {
          linkedinSummary = aiSummary;
        }
      } catch (error) {
        logger.warn('AI LinkedIn summary generation failed:', error.message);
      }
    }

    // Analyze sentiment
    const sentiment = analyzeSentiment(linkedinSummary);

    const result = {
      linkedinSummary,
      personalInfo,
      currentRole,
      industry,
      tone,
      sentiment,
      suggestions: [
        'Start with a compelling hook about your expertise',
        'Include specific achievements and metrics',
        'Mention your key skills and specialties',
        'Add a call-to-action for networking',
        'Use first person and conversational tone',
        'Include relevant keywords for your industry'
      ]
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'linkedin-summary',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { currentRole, industry, tone, skillsCount: skills.length },
        { summaryLength: linkedinSummary.length, sentiment: sentiment.sentiment },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        ...result,
        processingTime
      }
    });

  } catch (error) {
    logger.error('LinkedIn summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate LinkedIn summary'
    });
  }
});

// Interview Coach
router.post('/interview-coach', [
  body('jobTitle').isLength({ min: 1, max: 200 }),
  body('industry').isLength({ min: 1, max: 100 }),
  body('interviewType').isIn(['behavioral', 'technical', 'case-study', 'general']),
  body('experience').optional().isArray(),
  body('difficulty').optional().isIn(['entry', 'mid', 'senior', 'executive'])
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

    const { jobTitle, industry, interviewType, experience = [], difficulty = 'mid' } = req.body;

    // Generate interview questions based on type and difficulty
    const questions = generateInterviewQuestions(jobTitle, industry, interviewType, difficulty);

    // Generate AI-powered questions if available
    let aiQuestions = [];
    if (process.env.ENABLE_LOCAL_AI === 'true') {
      try {
        const prompt = `Generate 5 ${interviewType} interview questions for a ${difficulty}-level ${jobTitle} position in ${industry}. Make them realistic and relevant.`;
        const aiResponse = await generateText(prompt);
        
        if (aiResponse) {
          aiQuestions = aiResponse.split('\n')
            .filter(q => q.trim().length > 0)
            .map(q => q.replace(/^\d+\.?\s*/, '').trim())
            .slice(0, 5);
        }
      } catch (error) {
        logger.warn('AI question generation failed:', error.message);
      }
    }

    // Combine AI and template questions
    const allQuestions = [...questions, ...aiQuestions].slice(0, 10);

    // Generate tips based on interview type
    const tips = generateInterviewTips(interviewType, difficulty);

    const result = {
      jobTitle,
      industry,
      interviewType,
      difficulty,
      questions: allQuestions,
      tips,
      preparationChecklist: [
        'Research the company thoroughly',
        'Review the job description and requirements',
        'Prepare specific examples using STAR method',
        'Practice common questions out loud',
        'Prepare thoughtful questions to ask the interviewer',
        'Plan your outfit and route to the interview',
        'Bring multiple copies of your resume'
      ]
    };

    const processingTime = Date.now() - startTime;

    // Track usage
    if (req.trackUsage) {
      req.trackUsage(
        'interview-coach',
        req.user?.id,
        req.ip,
        req.get('User-Agent'),
        { jobTitle, industry, interviewType, difficulty },
        { questionsGenerated: allQuestions.length, aiQuestionsCount: aiQuestions.length },
        processingTime
      );
    }

    res.json({
      success: true,
      data: {
        ...result,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Interview coach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview coaching'
    });
  }
});

// Helper functions
const generateFallbackCoverLetter = (personalInfo, jobTitle, companyName, tone) => {
  const toneAdjustments = {
    professional: {
      greeting: 'Dear Hiring Manager,',
      opening: 'I am writing to express my strong interest in',
      closing: 'I look forward to the opportunity to discuss how my skills and experience can contribute to your team.'
    },
    enthusiastic: {
      greeting: 'Dear Hiring Team,',
      opening: 'I am excited to apply for',
      closing: 'I would be thrilled to bring my passion and expertise to your organization!'
    },
    confident: {
      greeting: 'Dear Hiring Manager,',
      opening: 'I am confident that I am the ideal candidate for',
      closing: 'I am ready to make an immediate impact and would welcome the opportunity to discuss my qualifications.'
    },
    friendly: {
      greeting: 'Hello!',
      opening: 'I hope this letter finds you well. I am writing to apply for',
      closing: 'Thank you for your time and consideration. I hope to hear from you soon!'
    }
  };

  const adj = toneAdjustments[tone] || toneAdjustments.professional;

  return `${adj.greeting}

${adj.opening} the ${jobTitle} position at ${companyName}. With my background and experience, I believe I would be a valuable addition to your team.

My qualifications include:
• Proven track record in relevant field
• Strong technical and interpersonal skills
• Commitment to excellence and continuous learning
• Ability to work effectively in team environments

${adj.closing}

Best regards,
${personalInfo.name}`;
};

const generateFallbackLinkedInSummary = (personalInfo, currentRole, industry, skills, tone) => {
  const toneStyles = {
    professional: `${personalInfo.name} is a ${currentRole} with expertise in ${skills.slice(0, 3).join(', ')}. With a strong background in ${industry}, I focus on delivering exceptional results and driving innovation.`,
    personal: `Hi! I'm ${personalInfo.name}, a passionate ${currentRole} who loves working in ${industry}. My expertise includes ${skills.slice(0, 3).join(', ')}, and I'm always excited to take on new challenges.`,
    creative: `🚀 ${personalInfo.name} | ${currentRole} | Transforming ${industry} through ${skills[0]} and innovation. I believe in pushing boundaries and creating meaningful impact.`,
    executive: `${personalInfo.name} is a senior ${currentRole} with extensive experience in ${industry}. I specialize in ${skills.slice(0, 3).join(', ')} and have a proven track record of leading high-performing teams and driving strategic initiatives.`
  };

  return toneStyles[tone] || toneStyles.professional;
};

const generateInterviewQuestions = (jobTitle, industry, interviewType, difficulty) => {
  const questionSets = {
    behavioral: {
      entry: [
        'Tell me about a time when you had to learn something new quickly.',
        'Describe a situation where you worked as part of a team.',
        'Give me an example of a goal you set and how you achieved it.',
        'Tell me about a time when you received constructive feedback.'
      ],
      mid: [
        'Describe a time when you had to handle a difficult situation at work.',
        'Tell me about a project you led and how you managed it.',
        'Give me an example of when you had to adapt to a significant change.',
        'Describe a time when you had to influence someone without authority.'
      ],
      senior: [
        'Tell me about a time when you had to make a difficult decision with limited information.',
        'Describe how you handled a situation where your team was not meeting expectations.',
        'Give me an example of how you drove change in your organization.',
        'Tell me about a time when you had to manage competing priorities.'
      ]
    },
    technical: {
      entry: [
        'What programming languages are you most comfortable with?',
        'How do you approach debugging a problem?',
        'Explain the difference between a stack and a queue.',
        'What is your experience with version control systems?'
      ],
      mid: [
        'How do you ensure code quality in your projects?',
        'Describe your experience with database design and optimization.',
        'How do you approach system architecture decisions?',
        'What testing strategies do you implement?'
      ],
      senior: [
        'How do you evaluate and choose between different technologies?',
        'Describe your approach to technical mentoring.',
        'How do you handle technical debt in large systems?',
        'What is your experience with scalability challenges?'
      ]
    },
    general: [
      'Why are you interested in this position?',
      'What are your greatest strengths?',
      'Where do you see yourself in 5 years?',
      'Why are you leaving your current position?',
      'What motivates you in your work?'
    ]
  };

  if (interviewType === 'general') {
    return questionSets.general;
  }

  return questionSets[interviewType]?.[difficulty] || questionSets.behavioral.mid;
};

const generateInterviewTips = (interviewType, difficulty) => {
  const baseTips = [
    'Arrive 10-15 minutes early',
    'Maintain good eye contact and body language',
    'Listen carefully to each question',
    'Take a moment to think before answering'
  ];

  const typeTips = {
    behavioral: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Prepare specific examples from your experience',
      'Focus on your role and contributions',
      'Be honest about lessons learned'
    ],
    technical: [
      'Think out loud when solving problems',
      'Ask clarifying questions when needed',
      'Explain your reasoning step by step',
      'Discuss trade-offs in your solutions'
    ],
    'case-study': [
      'Structure your approach clearly',
      'Ask relevant questions to gather information',
      'Make reasonable assumptions when needed',
      'Present your conclusions confidently'
    ]
  };

  return [...baseTips, ...(typeTips[interviewType] || [])];
};

export default router;