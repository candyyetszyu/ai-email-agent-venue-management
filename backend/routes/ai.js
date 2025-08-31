import { Hono } from 'hono';
import { 
  analyzeEmail, 
  generateResponse, 
  batchProcessEmails, 
  detectEmailLanguage 
} from '../controllers/aiController.js';

// Middleware to verify JWT token
import auth from '../middleware/auth.js';

const router = new Hono();

/**
 * @route   POST /api/ai/analyze-email
 * @desc    Analyze email content to extract booking information using bilingual AI
 * @access  Private
 */
router.post('/analyze-email', auth, async (c) => {
  try {
    const { emailContent, detectedLanguage } = await c.req.json();
    
    if (!emailContent) {
      return c.json({ 
        success: false,
        message: 'Missing email content',
        error: 'emailContent is required'
      }, 400);
    }

    const analysis = await analyzeEmail(emailContent, detectedLanguage);
    
    return c.json({
      success: true,
      analysis,
      language: analysis.language,
      confidence: analysis.confidence
    });
  } catch (err) {
    console.error('Error analyzing email:', err);
    return c.json({ 
      success: false,
      message: 'Error analyzing email',
      error: err.message
    }, 500);
  }
});

/**
 * @route   POST /api/ai/generate-response
 * @desc    Generate bilingual email response for venue booking inquiries
 * @access  Private
 */
router.post('/generate-response', auth, async (c) => {
  try {
    const { 
      originalEmail, 
      calendarData, 
      venueInfo, 
      senderName,
      targetLanguage 
    } = await c.req.json();
    
    if (!originalEmail) {
      return c.json({ 
        success: false,
        message: 'Missing original email content',
        error: 'originalEmail is required'
      }, 400);
    }

    const response = await generateResponse(
      originalEmail, 
      calendarData, 
      senderName, 
      venueInfo,
      targetLanguage
    );
    
    return c.json({
      success: true,
      response,
      language: response.primaryLanguage,
      availableIn: Object.keys(response).filter(key => ['en', 'zh'].includes(key))
    });
  } catch (err) {
    console.error('Error generating response:', err);
    return c.json({ 
      success: false,
      message: 'Error generating response',
      error: err.message
    }, 500);
  }
});

/**
 * @route   POST /api/ai/detect-language
 * @desc    Detect the language of email content
 * @access  Private
 */
router.post('/detect-language', auth, async (c) => {
  try {
    const { emailContent } = await c.req.json();
    
    if (!emailContent) {
      return c.json({ 
        success: false,
        message: 'Missing email content',
        error: 'emailContent is required'
      }, 400);
    }

    const language = await detectEmailLanguage(emailContent);
    
    return c.json({
      success: true,
      language,
      detected: true
    });
  } catch (err) {
    console.error('Error detecting language:', err);
    return c.json({ 
      success: false,
      message: 'Error detecting language',
      error: err.message
    }, 500);
  }
});

/**
 * @route   POST /api/ai/batch-process
 * @desc    Batch process multiple emails with bilingual AI
 * @access  Private
 */
router.post('/batch-process', auth, async (c) => {
  try {
    const { emails } = await c.req.json();
    
    if (!emails || !Array.isArray(emails)) {
      return c.json({ 
        success: false,
        message: 'Emails array is required',
        error: 'emails must be an array'
      }, 400);
    }

    if (emails.length === 0) {
      return c.json({ 
        success: false,
        message: 'Emails array cannot be empty',
        error: 'Provide at least one email to process'
      }, 400);
    }

    if (emails.length > 50) {
      return c.json({ 
        success: false,
        message: 'Too many emails',
        error: 'Maximum 50 emails per batch'
      }, 400);
    }

    const results = await batchProcessEmails(emails);
    
    const summary = {
      total: results.length,
      processed: results.filter(r => r.processed).length,
      failed: results.filter(r => !r.processed).length,
      languages: [...new Set(results.filter(r => r.analysis).map(r => r.analysis.language))]
    };
    
    return c.json({
      success: true,
      results,
      summary
    });
  } catch (err) {
    console.error('Error batch processing emails:', err);
    return c.json({ 
      success: false,
      message: 'Error batch processing emails',
      error: err.message
    }, 500);
  }
});

/**
 * @route   GET /api/ai/health
 * @desc    Health check for AI service
 * @access  Public
 */
router.get('/health', (c) => {
  return c.json({
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
router.get('/models', auth, (c) => {
  return c.json({
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

export default router;