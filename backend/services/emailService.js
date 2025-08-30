const { google } = require('googleapis');

class EmailService {
  constructor() {
    // Keywords for booking-related emails
    this.gmailKeywords = [
      'booking',
      'reservation',
      'venue',
      'event',
      'schedule',
      'appointment',
      'rental',
      'hire',
      'book',
      'reserve'
    ];

    this.outlookKeywords = [
      'booking',
      'reservation', 
      'venue',
      'event',
      'schedule',
      'appointment',
      'rental',
      'hire',
      'book',
      'reserve'
    ];
  }

  /**
   * Get Gmail messages with filtering and pagination
   * @param {Object} oauth2Client - Google OAuth2 client
   * @param {Object} options - Query options
   * @returns {Object} Messages and metadata
   */
  async getGmailMessages(oauth2Client, options = {}) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: options.maxResults || 20,
        pageToken: options.pageToken,
        q: options.query || 'is:inbox'
      });

      const messages = response.data.messages || [];
      const nextPageToken = response.data.nextPageToken;

      // Get full message details for each message
      const messagePromises = messages.map(message => 
        this.getGmailMessage(oauth2Client, message.id)
      );

      const fullMessages = await Promise.all(messagePromises);

      return {
        messages: fullMessages,
        nextPageToken,
        totalMessages: response.data.resultSizeEstimate || messages.length,
        filteredMessages: messages.length
      };
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw new Error(`Failed to fetch Gmail messages: ${error.message}`);
    }
  }

  /**
   * Get specific Gmail message with full details
   * @param {Object} oauth2Client - Google OAuth2 client
   * @param {string} messageId - Gmail message ID
   * @returns {Object} Full message details
   */
  async getGmailMessage(oauth2Client, messageId) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      
      // Parse headers
      const headers = message.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const cc = headers.find(h => h.name === 'Cc')?.value || '';
      const bcc = headers.find(h => h.name === 'Bcc')?.value || '';

      // Parse body
      const body = this.parseGmailBody(message.payload);

      // Parse attachments
      const attachments = this.parseGmailAttachments(message.payload);

      return {
        id: message.id,
        threadId: message.threadId,
        labelIds: message.labelIds || [],
        snippet: message.snippet,
        historyId: message.historyId,
        internalDate: message.internalDate,
        subject,
        from,
        to,
        date,
        cc,
        bcc,
        body,
        attachments,
        sizeEstimate: message.sizeEstimate
      };
    } catch (error) {
      console.error('Error fetching Gmail message:', error);
      throw new Error(`Failed to fetch Gmail message: ${error.message}`);
    }
  }

  /**
   * Send email via Gmail
   * @param {Object} oauth2Client - Google OAuth2 client
   * @param {Object} options - Email options
   * @returns {Object} Send result
   */
  async sendGmailMessage(oauth2Client, options) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      // Build email content
      const emailContent = this.buildGmailContent(options);
      const encodedEmail = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return {
        id: response.data.id,
        threadId: response.data.threadId,
        labelIds: response.data.labelIds,
        success: true
      };
    } catch (error) {
      console.error('Error sending Gmail message:', error);
      throw new Error(`Failed to send Gmail message: ${error.message}`);
    }
  }

  /**
   * Get Outlook messages with filtering and pagination
   * @param {string} accessToken - Microsoft access token
   * @param {Object} options - Query options
   * @returns {Object} Messages and metadata
   */
  async getOutlookMessages(accessToken, options = {}) {
    try {
      let query = 'https://graph.microsoft.com/v1.0/me/messages';
      const queryParams = [];
      
      if (options.top) queryParams.push(`$top=${options.top}`);
      if (options.skip) queryParams.push(`$skip=${options.skip}`);
      if (options.filter) queryParams.push(`$filter=${encodeURIComponent(options.filter)}`);
      if (options.orderBy) queryParams.push(`$orderBy=${encodeURIComponent(options.orderBy)}`);
      
      if (queryParams.length > 0) {
        query += '?' + queryParams.join('&');
      }

      const response = await fetch(query, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        messages: data.value || [],
        total: data['@odata.count'] || data.value?.length || 0,
        filteredMessages: data.value?.length || 0,
        nextLink: data['@odata.nextLink']
      };
    } catch (error) {
      console.error('Error fetching Outlook messages:', error);
      throw new Error(`Failed to fetch Outlook messages: ${error.message}`);
    }
  }

  /**
   * Get specific Outlook message with full details
   * @param {string} accessToken - Microsoft access token
   * @param {string} messageId - Outlook message ID
   * @returns {Object} Full message details
   */
  async getOutlookMessage(accessToken, messageId) {
    try {
      const query = `https://graph.microsoft.com/v1.0/me/messages/${messageId}?$select=id,subject,from,toRecipients,ccRecipients,bccRecipients,receivedDateTime,body,hasAttachments,attachments`;
      
      const response = await fetch(query, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const message = await response.json();

      return {
        id: message.id,
        subject: message.subject,
        from: message.from,
        toRecipients: message.toRecipients || [],
        ccRecipients: message.ccRecipients || [],
        bccRecipients: message.bccRecipients || [],
        receivedDateTime: message.receivedDateTime,
        body: message.body,
        hasAttachments: message.hasAttachments,
        attachments: message.attachments || []
      };
    } catch (error) {
      console.error('Error fetching Outlook message:', error);
      throw new Error(`Failed to fetch Outlook message: ${error.message}`);
    }
  }

  /**
   * Send email via Outlook
   * @param {string} accessToken - Microsoft access token
   * @param {Object} options - Email options
   * @returns {Object} Send result
   */
  async sendOutlookMessage(accessToken, options) {
    try {
      const message = {
        subject: options.subject,
        body: {
          contentType: 'HTML',
          content: options.body
        },
        toRecipients: options.to.map(email => ({ emailAddress: { address: email } })),
        ccRecipients: options.cc?.map(email => ({ emailAddress: { address: email } })) || [],
        bccRecipients: options.bcc?.map(email => ({ emailAddress: { address: email } })) || []
      };

      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          saveToSentItems: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending Outlook message:', error);
      throw new Error(`Failed to send Outlook message: ${error.message}`);
    }
  }

  /**
   * Download Gmail attachment
   * @param {Object} oauth2Client - Google OAuth2 client
   * @param {string} messageId - Gmail message ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Object} Attachment data
   */
  async downloadGmailAttachment(oauth2Client, messageId, attachmentId) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      const response = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId
      });

      return {
        data: response.data.data,
        size: response.data.size
      };
    } catch (error) {
      console.error('Error downloading Gmail attachment:', error);
      throw new Error(`Failed to download Gmail attachment: ${error.message}`);
    }
  }

  /**
   * Download Outlook attachment
   * @param {string} accessToken - Microsoft access token
   * @param {string} messageId - Outlook message ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Object} Attachment data
   */
  async downloadOutlookAttachment(accessToken, messageId, attachmentId) {
    try {
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments/${attachmentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data: data.contentBytes,
        name: data.name,
        contentType: data.contentType,
        size: data.size
      };
    } catch (error) {
      console.error('Error downloading Outlook attachment:', error);
      throw new Error(`Failed to download Outlook attachment: ${error.message}`);
    }
  }

  /**
   * Batch process multiple emails
   * @param {string} provider - Email provider ('gmail' or 'outlook')
   * @param {Object} auth - Authentication object
   * @param {Array} emailIds - Array of email IDs to process
   * @returns {Object} Batch processing results
   */
  async batchProcessEmails(provider, auth, emailIds) {
    try {
      const results = [];
      
      for (const emailId of emailIds) {
        try {
          let message;
          if (provider === 'gmail') {
            message = await this.getGmailMessage(auth, emailId);
          } else if (provider === 'outlook') {
            message = await this.getOutlookMessage(auth, emailId);
          }
          
          results.push({
            id: emailId,
            success: true,
            data: message
          });
        } catch (error) {
          results.push({
            id: emailId,
            success: false,
            error: error.message
          });
        }
      }
      
      return {
        total: emailIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Error in batch processing:', error);
      throw new Error(`Failed to batch process emails: ${error.message}`);
    }
  }

  /**
   * Create Gmail webhook for real-time notifications
   * @param {Object} oauth2Client - Google OAuth2 client
   * @param {string} webhookUrl - Webhook URL
   * @returns {Object} Webhook creation result
   */
  async createGmailWebhook(oauth2Client, webhookUrl) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      const response = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: 'projects/your-project/topics/gmail-notifications',
          labelIds: ['INBOX'],
          labelFilterAction: 'include'
        }
      });

      return {
        success: true,
        historyId: response.data.historyId,
        expiration: response.data.expiration
      };
    } catch (error) {
      console.error('Error creating Gmail webhook:', error);
      throw new Error(`Failed to create Gmail webhook: ${error.message}`);
    }
  }

  /**
   * Create Outlook webhook for real-time notifications
   * @param {string} accessToken - Microsoft access token
   * @param {string} webhookUrl - Webhook URL
   * @returns {Object} Webhook creation result
   */
  async createOutlookWebhook(accessToken, webhookUrl) {
    try {
      const subscription = {
        changeType: 'created,updated,deleted',
        notificationUrl: webhookUrl,
        resource: '/me/messages',
        expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        clientState: 'email-agent-webhook'
      };

      const response = await fetch('https://graph.microsoft.com/v1.0/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        id: data.id,
        expirationDateTime: data.expirationDateTime
      };
    } catch (error) {
      console.error('Error creating Outlook webhook:', error);
      throw new Error(`Failed to create Outlook webhook: ${error.message}`);
    }
  }



  /**
   * Parse Gmail message body
   * @param {Object} payload - Gmail message payload
   * @returns {string} Parsed body content
   */
  parseGmailBody(payload) {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }
    }
    
    return '';
  }

  /**
   * Parse Gmail attachments
   * @param {Object} payload - Gmail message payload
   * @returns {Array} Array of attachment objects
   */
  parseGmailAttachments(payload) {
    const attachments = [];
    
    const processPart = (part) => {
      if (part.filename && part.body && part.body.attachmentId) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size
        });
      }
      
      if (part.parts) {
        part.parts.forEach(processPart);
      }
    };
    
    processPart(payload);
    return attachments;
  }

  /**
   * Build Gmail email content
   * @param {Object} options - Email options
   * @returns {string} RFC 2822 formatted email
   */
  buildGmailContent(options) {
    const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);
    
    let content = '';
    content += `From: ${options.from}\r\n`;
    content += `To: ${options.to}\r\n`;
    if (options.cc && options.cc.length > 0) {
      content += `Cc: ${options.cc.join(', ')}\r\n`;
    }
    if (options.bcc && options.bcc.length > 0) {
      content += `Bcc: ${options.bcc.join(', ')}\r\n`;
    }
    content += `Subject: ${options.subject}\r\n`;
    content += `MIME-Version: 1.0\r\n`;
    content += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
    
    // Text body
    content += `--${boundary}\r\n`;
    content += `Content-Type: text/html; charset=UTF-8\r\n\r\n`;
    content += `${options.body}\r\n\r\n`;
    
    // Attachments
    if (options.attachments && options.attachments.length > 0) {
      for (const attachment of options.attachments) {
        content += `--${boundary}\r\n`;
        content += `Content-Type: ${attachment.mimeType}\r\n`;
        content += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
        content += `Content-Transfer-Encoding: base64\r\n\r\n`;
        content += `${attachment.data}\r\n\r\n`;
      }
    }
    
    content += `--${boundary}--\r\n`;
    return content;
  }
}

module.exports = EmailService;
