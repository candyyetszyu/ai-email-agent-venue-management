const BilingualAIService = require('../services/bilingualAIService');

// Initialize bilingual AI service
const aiService = new BilingualAIService();

/**
 * Analyze an email to extract booking-related information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeEmail = async (req, res) => {
  try {
    const { emailContent } = req.body;

    if (!emailContent) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    // Analyze email using bilingual AI service
    const analysis = await aiService.analyzeEmail(emailContent);
    
    // Ensure required fields are present with proper structure
    const enrichedAnalysis = {
      venue: analysis.venue || null,
      date: analysis.date || null,
      time: analysis.time || null,
      attendees: analysis.attendees || null,
      eventType: analysis.eventType || null,
      contactInfo: analysis.contactInfo || null,
      specialRequests: analysis.specialRequests || null,
      urgency: analysis.urgency || 'medium',
      language: analysis.language || 'en',
      confidence: analysis.confidence || 0.8
    };

    return res.json({ analysis: enrichedAnalysis });
  } catch (error) {
    console.error('Error analyzing email:', error);
    return res.status(500).json({ error: 'Failed to analyze email' });
  }
};

/**
 * Generate a response email based on the original email and calendar data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateResponse = async (req, res) => {
  try {
    const { originalEmail, calendarData, venueInfo } = req.body;

    if (!originalEmail) {
      return res.status(400).json({ error: 'Original email is required' });
    }

    // Use bilingual AI service to generate response
    const response = await aiService.generateResponse({
      originalEmail: {
        subject: originalEmail.subject || 'Venue Booking Inquiry',
        body: originalEmail.body || originalEmail
      },
      senderName: originalEmail.sender?.name || originalEmail.sender?.email || 'Valued Customer',
      venueInfo: venueInfo || {},
      calendarData: calendarData || {}
    });

    return res.json({ generatedResponse: response });
  } catch (error) {
    console.error('Error generating response:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
};

/**
 * Batch process multiple emails with bilingual AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.batchProcessEmails = async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    const results = await aiService.batchProcessEmails(emails);
    return res.json({ results });
  } catch (error) {
    console.error('Error batch processing emails:', error);
    return res.status(500).json({ error: 'Failed to process emails' });
  }
};

/**
 * Detect email language
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.detectEmailLanguage = async (req, res) => {
  try {
    const { emailContent } = req.body;

    if (!emailContent) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    const language = await aiService.detectLanguage(emailContent);
    return res.json({ language });
  } catch (error) {
    console.error('Error detecting language:', error);
    return res.status(500).json({ error: 'Failed to detect language' });
  }
};