const { Hono } = require('hono');
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');

const router = new Hono();

/**
 * Gmail Routes
 */

// Get Gmail messages with filtering and pagination
router.get('/gmail/messages', auth, emailController.getGmailMessages);

// Get specific Gmail message details
router.get('/gmail/messages/:id', auth, emailController.getGmailMessage);

// Send Gmail message with attachments support
router.post('/gmail/send', auth, emailController.sendGmailMessage);

// Download Gmail attachment
router.get('/gmail/messages/:messageId/attachments/:attachmentId', auth, emailController.downloadGmailAttachment);

// Gmail webhook subscription
router.post('/gmail/webhook', auth, emailController.createWebhook);

// Gmail statistics
router.get('/gmail/stats', auth, emailController.getEmailStats);

/**
 * Outlook Routes
 */

// Get Outlook messages with filtering and pagination
router.get('/outlook/messages', auth, emailController.getOutlookMessages);

// Get specific Outlook message details
router.get('/outlook/messages/:id', auth, emailController.getOutlookMessage);

// Send Outlook message with attachments support
router.post('/outlook/send', auth, emailController.sendOutlookMessage);

// Download Outlook attachment
router.get('/outlook/messages/:messageId/attachments/:attachmentId', auth, emailController.downloadOutlookAttachment);

// Outlook webhook subscription
router.post('/outlook/webhook', auth, emailController.createWebhook);

// Outlook statistics
router.get('/outlook/stats', auth, emailController.getEmailStats);

/**
 * Universal Routes (work with both providers)
 */

// Batch process multiple emails
router.post('/batch-process', auth, emailController.batchProcessEmails);

// Webhook endpoint for receiving real-time notifications
router.post('/webhook/:provider', async (c) => {
  const { provider } = c.req.param();
  
  if (!['gmail', 'outlook'].includes(provider)) {
    return c.json({ 
      success: false, 
      error: 'Invalid provider. Use "gmail" or "outlook"' 
    }, 400);
  }
  
  // Handle webhook notifications
  const body = await c.req.json();
  console.log(`Received ${provider} webhook:`, body);
  
  // Acknowledge receipt
  return c.json({ success: true, message: 'Webhook received' });
});

/**
 * Health Check Routes
 */

// Check Gmail connection
router.get('/gmail/health', auth, async (c) => {
  try {
    const oauth2Client = c.req.oauth2Client;
    const { google } = require('googleapis');
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    await gmail.users.getProfile({ userId: 'me' });
    
    return c.json({ 
      success: true, 
      provider: 'gmail',
      status: 'connected',
      user: c.req.user.email 
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      provider: 'gmail',
      status: 'error',
      error: error.message 
    }, 500);
  }
});

// Check Outlook connection
router.get('/outlook/health', auth, async (c) => {
  try {
    const accessToken = c.req.msalToken;
    
    // Use fetch API instead of Microsoft Graph client
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect to Microsoft Graph API');
    }
    
    return c.json({ 
      success: true, 
      provider: 'outlook',
      status: 'connected',
      user: c.req.user.email 
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      provider: 'outlook',
      status: 'error',
      error: error.message 
    }, 500);
  }
});

/**
 * Search Routes
 */

// Search across Gmail messages
router.get('/gmail/search', auth, emailController.getGmailMessages);

// Search across Outlook messages
router.get('/outlook/search', auth, emailController.getOutlookMessages);

module.exports = router;