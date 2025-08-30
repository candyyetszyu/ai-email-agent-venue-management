const express = require('express');
const router = express.Router();
const { 
  analyzeEmail, 
  generateResponse, 
  batchProcessEmails, 
  detectEmailLanguage 
} = require('../controllers/aiController');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

/**
 * @route   POST /api/ai/analyze-email
 * @desc    Analyze email content to extract booking information using bilingual AI
 * @access  Private
 */
router.post('/analyze-email', auth, async (req, res) => {
  try {
    const { emailContent, detectedLanguage } = req.body;
    
    if (!emailContent) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing email content',
        error: 'emailContent is required'
      });
    }

    const analysis = await analyzeEmail(emailContent, detectedLanguage);
    
    res.json({
      success: true,
      analysis,
      language: analysis.language,
      confidence: analysis.confidence
    });
  } catch (err) {
    console.error('Error analyzing email:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error analyzing email',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/ai/generate-response
 * @desc    Generate bilingual email response for venue booking inquiries
 * @access  Private
 */
router.post('/generate-response', auth, async (req, res) => {
  try {
    const { 
      originalEmail, 
      calendarData, 
      venueInfo, 
      senderName,
      targetLanguage 
    } = req.body;
    
    if (!originalEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing original email content',
        error: 'originalEmail is required'
      });
    }

    const response = await generateResponse(
      originalEmail, 
      calendarData, 
      senderName, 
      venueInfo,
      targetLanguage
    );
    
    res.json({
      success: true,
      response,
      language: response.primaryLanguage,
      availableIn: Object.keys(response).filter(key => ['en', 'zh'].includes(key))
    });
  } catch (err) {
    console.error('Error generating response:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error generating response',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/ai/detect-language
 * @desc    Detect the language of email content
 * @access  Private
 */
router.post('/detect-language', auth, async (req, res) => {
  try {
    const { emailContent } = req.body;
    
    if (!emailContent) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing email content',
        error: 'emailContent is required'
      });
    }

    const language = await detectEmailLanguage(emailContent);
    
    res.json({
      success: true,
      language,
      detected: true
    });
  } catch (err) {
    console.error('Error detecting language:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error detecting language',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/ai/batch-process
 * @desc    Batch process multiple emails with bilingual AI
 * @access  Private
 */
router.post('/batch-process', auth, async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ 
        success: false,
        message: 'Emails array is required',
        error: 'emails must be an array'
      });
    }

    if (emails.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Emails array cannot be empty',
        error: 'Provide at least one email to process'
      });
    }

    if (emails.length > 50) {
      return res.status(400).json({ 
        success: false,
        message: 'Too many emails',
        error: 'Maximum 50 emails per batch'
      });
    }

    const results = await batchProcessEmails(emails);
    
    const summary = {
      total: results.length,
      processed: results.filter(r => r.processed).length,
      failed: results.filter(r => !r.processed).length,
      languages: [...new Set(results.filter(r => r.analysis).map(r => r.analysis.language))]
    };
    
    res.json({
      success: true,
      results,
      summary
    });
  } catch (err) {
    console.error('Error batch processing emails:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error batch processing emails',
      error: err.message
    });
  }
});

/**
 * @route   GET /api/ai/health
 * @desc    Health check for AI service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI service is running',
    timestamp: new Date().toISOString(),
    service: 'bilingual-ai-service',
    languages: ['en', 'zh']
  });
});

/**
 * @route   GET /api/ai/models
 * @desc    Get available AI models information
 * @access  Private
 */
router.get('/models', auth, (req, res) => {
  res.json({
    success: true,
    models: [
      {
        name: 'deepseek/deepseek-chat',
        provider: 'OpenRoute AI',
        languages: ['en', 'zh', 'zh-tw'],
        features: ['email-analysis', 'response-generation', 'language-detection']
      }
    ],
    current: 'deepseek/deepseek-chat'
  });
});

module.exports = router;