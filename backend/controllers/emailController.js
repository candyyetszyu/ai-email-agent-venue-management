import EmailService from '../services/emailService.js';
import { google } from 'googleapis';

const emailService = new EmailService();

/**
 * Get Gmail messages with advanced filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getGmailMessages = async (req, res) => {
  try {
    const oauth2Client = req.oauth2Client;
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      maxResults = 20,
      pageToken = null,
      filter = 'all',
      search = '',
      dateFrom = null,
      dateTo = null
    } = req.query;

    // Build query based on filters
    let query = 'is:inbox';
    
    if (filter === 'unread') query += ' is:unread';
    if (filter === 'booking') query += ` (${emailService.gmailKeywords.join(' OR ')})`;
    if (search) query += ` ${search}`;
    if (dateFrom) query += ` after:${dateFrom}`;
    if (dateTo) query += ` before:${dateTo}`;

    const options = {
      maxResults: parseInt(maxResults),
      pageToken,
      query
    };

    const result = await emailService.getGmailMessages(oauth2Client, options);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        maxResults: parseInt(maxResults),
        nextPageToken: result.nextPageToken,
        total: result.totalMessages,
        filtered: result.filteredMessages
      }
    });
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Gmail messages',
      details: error.message 
    });
  }
};

/**
 * Get specific Gmail message with full details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getGmailMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const oauth2Client = req.oauth2Client;
    
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    const message = await emailService.getGmailMessage(oauth2Client, id);
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching Gmail message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Gmail message',
      details: error.message 
    });
  }
};

/**
 * Send email via Gmail with attachments support
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendGmailMessage = async (req, res) => {
  try {
    const oauth2Client = req.oauth2Client;
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { to, subject, body, cc = [], bcc = [], attachments = [] } = req.body;

    const options = {
      from: req.user.email,
      to,
      subject,
      body,
      cc,
      bcc,
      attachments
    };

    const result = await emailService.sendGmailMessage(oauth2Client, options);
    
    res.json({
      success: true,
      data: result,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending Gmail message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send Gmail message',
      details: error.message 
    });
  }
};

/**
 * Get Outlook messages with advanced filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getOutlookMessages = async (req, res) => {
  try {
    const accessToken = req.msalToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      top = 20,
      skip = 0,
      filter = 'all',
      search = '',
      orderBy = 'receivedDateTime desc'
    } = req.query;

    let searchQuery = '';
    if (filter === 'unread') searchQuery += 'isRead eq false';
    if (filter === 'booking') searchQuery += `(${emailService.outlookKeywords.join(' OR ')})`;
    if (search) searchQuery += search;

    const options = {
      top: parseInt(top),
      skip: parseInt(skip),
      filter: searchQuery,
      orderBy
    };

    const result = await emailService.getOutlookMessages(accessToken, options);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        top: parseInt(top),
        skip: parseInt(skip),
        total: result.total,
        filtered: result.filteredMessages
      }
    });
  } catch (error) {
    console.error('Error fetching Outlook messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Outlook messages',
      details: error.message 
    });
  }
};

/**
 * Get specific Outlook message with full details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getOutlookMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.msalToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    const message = await emailService.getOutlookMessage(accessToken, id);
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching Outlook message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Outlook message',
      details: error.message 
    });
  }
};

/**
 * Send email via Outlook with attachments support
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const sendOutlookMessage = async (req, res) => {
  try {

      const accessToken = req.msalToken;
      if (!accessToken) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { to, subject, body, cc = [], bcc = [], attachments = [] } = req.body;

      const options = {
        to,
        subject,
        body,
        cc,
        bcc,
        attachments
      };

      const result = await emailService.sendOutlookMessage(accessToken, options);
      
      res.json({
        success: true,
        data: result,
        message: 'Email sent successfully'
      });
    } catch (error) {
      console.error('Error sending Outlook message:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send Outlook message',
        details: error.message 
      });
    }
  }

/**
 * Download Gmail attachment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const downloadGmailAttachment = async (req, res) => {
  try {
    const { messageId, attachmentId } = req.params;
    const oauth2Client = req.oauth2Client;
    
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const attachment = await emailService.downloadGmailAttachment(oauth2Client, messageId, attachmentId);
    
    res.json({
      success: true,
      data: attachment
    });
  } catch (error) {
    console.error('Error downloading Gmail attachment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to download attachment',
      details: error.message 
    });
  }
};

/**
 * Download Outlook attachment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const downloadOutlookAttachment = async (req, res) => {
  try {
    const { messageId, attachmentId } = req.params;
    const accessToken = req.msalToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const attachment = await emailService.downloadOutlookAttachment(accessToken, messageId, attachmentId);
    
    res.json({
      success: true,
      data: attachment
    });
  } catch (error) {
    console.error('Error downloading Outlook attachment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to download attachment',
      details: error.message 
    });
  }
};

/**
 * Batch process multiple emails
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const batchProcessEmails = async (req, res) => {
  try {
    const { provider, emailIds } = req.body;
    const auth = provider === 'gmail' ? req.oauth2Client : req.msalToken;
    
    if (!auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: 'Email IDs array is required' });
    }

    if (emailIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 emails per batch' });
    }

    const results = await emailService.batchProcessEmails(provider, auth, emailIds);
    
    res.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('Error in batch processing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process batch emails',
      details: error.message 
    });
  }
};

/**
 * Create webhook subscription for real-time notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createWebhook = async (req, res) => {
  try {
    const { provider, webhookUrl } = req.body;
    
    if (!provider || !['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({ error: 'Provider must be gmail or outlook' });
    }
    
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    let result;
    if (provider === 'gmail') {
      if (!req.oauth2Client) {
        return res.status(401).json({ error: 'Gmail authentication required' });
      }
      result = await emailService.createGmailWebhook(req.oauth2Client, webhookUrl);
    } else {
      if (!req.msalToken) {
        return res.status(401).json({ error: 'Outlook authentication required' });
      }
      result = await emailService.createOutlookWebhook(req.msalToken, webhookUrl);
    }

    res.json({
      success: true,
      data: result,
      message: 'Webhook subscription created successfully'
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create webhook',
      details: error.message 
    });
  }
};

/**
 * Get email statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getEmailStats = async (req, res) => {
  try {
    const { provider } = req.query;
    const auth = provider === 'gmail' ? req.oauth2Client : req.msalToken;
    
    if (!auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let stats = {};
    
    if (provider === 'gmail') {
      const gmail = google.gmail({ version: 'v1', auth: req.oauth2Client });
      const response = await gmail.users.getProfile({ userId: 'me' });
      stats = {
        provider: 'gmail',
        totalMessages: response.data.messagesTotal,
        totalThreads: response.data.threadsTotal,
        historyId: response.data.historyId
      };
    } else if (provider === 'outlook') {
      const client = emailService.getOutlookClient(req.msalToken);
      const response = await client.api('/me/mailFolders/inbox').get();
      stats = {
        provider: 'outlook',
        totalMessages: response.totalItemCount,
        unreadCount: response.unreadItemCount
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting email stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get email statistics',
      details: error.message 
    });
  }
};