const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticateGmail, authenticateOutlook } = require('../middleware/auth');

/**
 * Gmail Routes
 */

// Get Gmail messages with filtering and pagination
router.get('/gmail/messages', authenticateGmail, emailController.getGmailMessages);

// Get specific Gmail message details
router.get('/gmail/messages/:id', authenticateGmail, emailController.getGmailMessage);

// Send Gmail message with attachments support
router.post('/gmail/send', authenticateGmail, emailController.sendGmailMessage);

// Download Gmail attachment
router.get('/gmail/messages/:messageId/attachments/:attachmentId', authenticateGmail, emailController.downloadGmailAttachment);

// Gmail webhook subscription
router.post('/gmail/webhook', authenticateGmail, emailController.createWebhook);

// Gmail statistics
router.get('/gmail/stats', authenticateGmail, emailController.getEmailStats);

/**
 * Outlook Routes
 */

// Get Outlook messages with filtering and pagination
router.get('/outlook/messages', authenticateOutlook, emailController.getOutlookMessages);

// Get specific Outlook message details
router.get('/outlook/messages/:id', authenticateOutlook, emailController.getOutlookMessage);

// Send Outlook message with attachments support
router.post('/outlook/send', authenticateOutlook, emailController.sendOutlookMessage);

// Download Outlook attachment
router.get('/outlook/messages/:messageId/attachments/:attachmentId', authenticateOutlook, emailController.downloadOutlookAttachment);

// Outlook webhook subscription
router.post('/outlook/webhook', authenticateOutlook, emailController.createWebhook);

// Outlook statistics
router.get('/outlook/stats', authenticateOutlook, emailController.getEmailStats);

/**
 * Universal Routes (work with both providers)
 */

// Batch process multiple emails
router.post('/batch-process', (req, res, next) => {
  const { provider } = req.body;
  
  if (!provider) {
    return res.status(400).json({ 
      success: false, 
      error: 'Provider parameter is required (gmail or outlook)' 
    });
  }
  
  if (provider === 'gmail') {
    authenticateGmail(req, res, next);
  } else if (provider === 'outlook') {
    authenticateOutlook(req, res, next);
  } else {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid provider. Use "gmail" or "outlook"' 
    });
  }
}, emailController.batchProcessEmails);

// Webhook endpoint for receiving real-time notifications
router.post('/webhook/:provider', (req, res) => {
  const { provider } = req.params;
  
  if (!['gmail', 'outlook'].includes(provider)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid provider. Use "gmail" or "outlook"' 
    });
  }
  
  // Handle webhook notifications
  console.log(`Received ${provider} webhook:`, req.body);
  
  // Acknowledge receipt
  res.status(200).json({ success: true, message: 'Webhook received' });
});

/**
 * Health Check Routes
 */

// Check Gmail connection
router.get('/gmail/health', authenticateGmail, async (req, res) => {
  try {
    const oauth2Client = req.oauth2Client;
    const { google } = require('googleapis');
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    await gmail.users.getProfile({ userId: 'me' });
    
    res.json({ 
      success: true, 
      provider: 'gmail',
      status: 'connected',
      user: req.user.email 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      provider: 'gmail',
      status: 'error',
      error: error.message 
    });
  }
});

// Check Outlook connection
router.get('/outlook/health', authenticateOutlook, async (req, res) => {
  try {
    const accessToken = req.msalToken;
    const client = require('../services/emailService').getOutlookClient(accessToken);
    
    await client.api('/me').get();
    
    res.json({ 
      success: true, 
      provider: 'outlook',
      status: 'connected',
      user: req.user.email 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      provider: 'outlook',
      status: 'error',
      error: error.message 
    });
  }
});

/**
 * Search Routes
 */

// Search across Gmail messages
router.get('/gmail/search', authenticateGmail, emailController.getGmailMessages);

// Search across Outlook messages
router.get('/outlook/search', authenticateOutlook, emailController.getOutlookMessages);

/**
 * Rate Limiting and Error Handling Middleware
 */

// Global error handler for email routes
router.use((error, req, res, next) => {
  console.error('Email route error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

module.exports = router;