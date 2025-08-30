const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
const nodemailer = require('nodemailer');
const { Readable } = require('stream');

class EmailService {
  constructor() {
    this.gmailKeywords = [
      'booking', 'reservation', 'venue', 'wedding', 'event', 'party',
      'hall', 'space', 'rental', 'available', 'schedule', 'date', 'time'
    ];
    
    this.outlookKeywords = [
      'booking', 'reservation', 'venue', 'wedding', 'event', 'party',
      'hall', 'space', 'rental', 'available', 'schedule', 'date', 'time'
    ];
  }

  /**
   * Initialize Gmail client
   */
  getGmailClient(oauth2Client) {
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  /**
   * Initialize Outlook client
   */
  getOutlookClient(accessToken) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Filter emails for venue booking inquiries
   */
  filterBookingEmails(emails) {
    return emails.filter(email => {
      const content = this.getEmailContent(email).toLowerCase();
      return this.gmailKeywords.some(keyword => content.includes(keyword));
    });
  }

  /**
   * Extract email content for filtering
   */
  getEmailContent(email) {
    if (email.snippet) return email.snippet;
    if (email.bodyPreview) return email.bodyPreview;
    if (email.body?.content) return email.body.content;
    if (email.payload?.body?.data) {
      return Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
    }
    return '';
  }

  /**
   * Get Gmail messages with filtering and pagination
   */
  async getGmailMessages(oauth2Client, options = {}) {
    const {
      maxResults = 50,
      pageToken = null,
      query = 'is:inbox',
      includeSpamTrash = false,
      labelIds = []
    } = options;

    const gmail = this.getGmailClient(oauth2Client);

    try {
      const params = {
        userId: 'me',
        maxResults: Math.min(maxResults, 500), // Gmail API limit
        q: query,
        includeSpamTrash,
      };

      if (pageToken) params.pageToken = pageToken;
      if (labelIds.length > 0) params.labelIds = labelIds;

      const response = await gmail.users.messages.list(params);
      
      if (!response.data.messages || response.data.messages.length === 0) {
        return { messages: [], nextPageToken: null, resultSizeEstimate: 0 };
      }

      // Get full message details
      const messages = await Promise.all(
        response.data.messages.map(async (message) => {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });
          return this.formatGmailMessage(details.data);
        })
      );

      // Filter for booking-related emails
      const bookingEmails = this.filterBookingEmails(messages);

      return {
        messages: bookingEmails,
        nextPageToken: response.data.nextPageToken || null,
        resultSizeEstimate: response.data.resultSizeEstimate || 0,
        totalMessages: response.data.messages.length,
        filteredMessages: bookingEmails.length
      };
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw new Error(`Gmail API error: ${error.message}`);
    }
  }

  /**
   * Get Outlook messages with filtering and pagination
   */
  async getOutlookMessages(accessToken, options = {}) {
    const {
      top = 50,
      skip = 0,
      filter = '',
      search = '',
      orderBy = 'receivedDateTime desc'
    } = options;

    const client = this.getOutlookClient(accessToken);

    try {
      let query = client
        .api('/me/mailFolders/inbox/messages')
        .top(Math.min(top, 1000)) // Graph API limit
        .skip(skip)
        .select('id,subject,bodyPreview,receivedDateTime,from,toRecipients,ccRecipients,bccRecipients,isRead,hasAttachments,importance,webLink')
        .orderBy(orderBy);

      if (filter) query = query.filter(filter);
      if (search) query = query.search(search);

      const response = await query.get();
      
      if (!response.value || response.value.length === 0) {
        return { messages: [], skipToken: null, total: 0 };
      }

      // Format and filter messages
      const messages = response.value.map(email => this.formatOutlookMessage(email));
      const bookingEmails = this.filterBookingEmails(messages);

      return {
        messages: bookingEmails,
        skipToken: response['@odata.nextLink'] || null,
        total: response.value.length,
        filteredMessages: bookingEmails.length
      };
    } catch (error) {
      console.error('Error fetching Outlook messages:', error);
      throw new Error(`Outlook API error: ${error.message}`);
    }
  }

  /**
   * Format Gmail message for consistent response
   */
  formatGmailMessage(message) {
    const headers = message.payload?.headers || [];
    
    const getHeader = (name) => {
      const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    const extractBody = () => {
      if (message.payload?.body?.data) {
        return Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      }
      
      if (message.payload?.parts) {
        const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
        
        const htmlPart = message.payload.parts.find(part => part.mimeType === 'text/html');
        if (htmlPart?.body?.data) {
          return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
        }
      }
      
      return message.snippet || '';
    };

    return {
      id: message.id,
      threadId: message.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      date: getHeader('Date'),
      body: extractBody(),
      snippet: message.snippet || '',
      isRead: !message.labelIds?.includes('UNREAD'),
      hasAttachments: message.payload?.parts?.some(part => part.filename) || false,
      attachments: this.extractGmailAttachments(message),
      labels: message.labelIds || [],
      size: message.sizeEstimate || 0,
      provider: 'gmail'
    };
  }

  /**
   * Format Outlook message for consistent response
   */
  formatOutlookMessage(message) {
    return {
      id: message.id,
      subject: message.subject || '',
      from: message.from?.emailAddress?.address || '',
      fromName: message.from?.emailAddress?.name || '',
      to: message.toRecipients?.map(r => r.emailAddress?.address)?.join(', ') || '',
      cc: message.ccRecipients?.map(r => r.emailAddress?.address)?.join(', ') || '',
      bcc: message.bccRecipients?.map(r => r.emailAddress?.address)?.join(', ') || '',
      date: message.receivedDateTime || '',
      body: message.body?.content || '',
      snippet: message.bodyPreview || '',
      isRead: message.isRead || false,
      hasAttachments: message.hasAttachments || false,
      importance: message.importance || 'normal',
      webLink: message.webLink || '',
      provider: 'outlook'
    };
  }

  /**
   * Extract Gmail attachments
   */
  extractGmailAttachments(message) {
    const attachments = [];
    
    if (message.payload?.parts) {
      message.payload.parts.forEach(part => {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size || 0
          });
        }
      });
    }
    
    return attachments;
  }

  /**
   * Download Gmail attachment
   */
  async downloadGmailAttachment(oauth2Client, messageId, attachmentId) {
    const gmail = this.getGmailClient(oauth2Client);
    
    try {
      const response = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId,
      });
      
      return {
        data: response.data.data,
        size: response.data.size,
        filename: response.data.filename
      };
    } catch (error) {
      console.error('Error downloading Gmail attachment:', error);
      throw new Error(`Failed to download attachment: ${error.message}`);
    }
  }

  /**
   * Download Outlook attachment
   */
  async downloadOutlookAttachment(accessToken, messageId, attachmentId) {
    const client = this.getOutlookClient(accessToken);
    
    try {
      const response = await client
        .api(`/me/messages/${messageId}/attachments/${attachmentId}`)
        .get();
      
      return {
        data: response.contentBytes,
        name: response.name,
        contentType: response.contentType,
        size: response.size
      };
    } catch (error) {
      console.error('Error downloading Outlook attachment:', error);
      throw new Error(`Failed to download attachment: ${error.message}`);
    }
  }

  /**
   * Send email via Gmail with attachments
   */
  async sendGmailMessage(oauth2Client, options) {
    const { to, subject, body, attachments = [], cc = [], bcc = [] } = options;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: options.from,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: oauth2Client.credentials.refresh_token,
        accessToken: oauth2Client.credentials.access_token,
      },
    });

    const mailOptions = {
      from: options.from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: body,
      cc: Array.isArray(cc) ? cc.join(', ') : cc,
      bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc,
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      }))
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error('Error sending Gmail message:', error);
      throw new Error(`Failed to send Gmail message: ${error.message}`);
    }
  }

  /**
   * Send email via Outlook
   */
  async sendOutlookMessage(accessToken, options) {
    const { to, subject, body, attachments = [], cc = [], bcc = [] } = options;
    
    const client = this.getOutlookClient(accessToken);

    const message = {
      subject,
      body: {
        contentType: 'HTML',
        content: body,
      },
      toRecipients: Array.isArray(to) ? to.map(addr => ({
        emailAddress: { address: addr }
      })) : [{ emailAddress: { address: to } }],
      ccRecipients: Array.isArray(cc) ? cc.map(addr => ({
        emailAddress: { address: addr }
      })) : [],
      bccRecipients: Array.isArray(bcc) ? bcc.map(addr => ({
        emailAddress: { address: addr }
      })) : [],
      attachments: attachments.map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.filename,
        contentBytes: att.content,
        contentType: att.contentType
      }))
    };

    try {
      await client.api('/me/sendMail').post({
        message,
        saveToSentItems: true,
      });
      
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
   * Batch process multiple emails
   */
  async batchProcessEmails(provider, auth, emailIds) {
    const results = [];
    
    for (const emailId of emailIds) {
      try {
        let email;
        if (provider === 'gmail') {
          email = await this.getGmailMessage(auth, emailId);
        } else if (provider === 'outlook') {
          email = await this.getOutlookMessage(auth, emailId);
        }
        
        results.push({
          id: emailId,
          success: true,
          data: email
        });
      } catch (error) {
        results.push({
          id: emailId,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Get single Gmail message
   */
  async getGmailMessage(oauth2Client, messageId) {
    const gmail = this.getGmailClient(oauth2Client);
    
    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });
      
      return this.formatGmailMessage(response.data);
    } catch (error) {
      console.error('Error fetching Gmail message:', error);
      throw new Error(`Failed to fetch Gmail message: ${error.message}`);
    }
  }

  /**
   * Get single Outlook message
   */
  async getOutlookMessage(accessToken, messageId) {
    const client = this.getOutlookClient(accessToken);
    
    try {
      const response = await client
        .api(`/me/messages/${messageId}`)
        .select('id,subject,body,receivedDateTime,from,toRecipients,ccRecipients,bccRecipients,isRead,hasAttachments,importance,webLink')
        .get();
      
      return this.formatOutlookMessage(response);
    } catch (error) {
      console.error('Error fetching Outlook message:', error);
      throw new Error(`Failed to fetch Outlook message: ${error.message}`);
    }
  }

  /**
   * Create webhook subscription for Gmail
   */
  async createGmailWebhook(oauth2Client, webhookUrl) {
    const gmail = this.getGmailClient(oauth2Client);
    
    try {
      const watchResponse = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: process.env.GOOGLE_PUBSUB_TOPIC,
          labelIds: ['INBOX'],
          labelFilterAction: 'include',
        },
      });
      
      return {
        success: true,
        watchResponse,
        expires: watchResponse.data.expiration
      };
    } catch (error) {
      console.error('Error creating Gmail webhook:', error);
      throw new Error(`Failed to create Gmail webhook: ${error.message}`);
    }
  }

  /**
   * Create webhook subscription for Outlook
   */
  async createOutlookWebhook(accessToken, webhookUrl) {
    const client = this.getOutlookClient(accessToken);
    
    try {
      const subscription = await client.api('/subscriptions').post({
        changeType: 'created',
        notificationUrl: webhookUrl,
        resource: '/me/mailFolders/inbox/messages',
        expirationDateTime: new Date(Date.now() + 4230 * 60 * 1000).toISOString(), // Max 3 days
        clientState: 'email-agent-webhook'
      });
      
      return {
        success: true,
        subscriptionId: subscription.id,
        expires: subscription.expirationDateTime
      };
    } catch (error) {
      console.error('Error creating Outlook webhook:', error);
      throw new Error(`Failed to create Outlook webhook: ${error.message}`);
    }
  }
}

module.exports = EmailService;