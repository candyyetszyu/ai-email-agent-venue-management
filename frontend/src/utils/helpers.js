/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {boolean} includeTime - Whether to include the time in the formatted string
 * @returns {string} The formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format a time string or Date object to a human-readable format
 * @param {string|Date} time - The time to format
 * @returns {string} The formatted time string
 */
export const formatTime = (time) => {
  if (!time) return 'N/A';
  
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  
  if (isNaN(dateObj.getTime())) return 'Invalid time';
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength = 100) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Extract the name from an email address
 * @param {string} email - The email address
 * @returns {string} The name extracted from the email address
 */
export const extractNameFromEmail = (email) => {
  if (!email) return '';
  
  // Check if email is in the format "Name <email@example.com>"
  const match = email.match(/^([^<]+)\s*<[^>]+>$/);
  if (match) {
    return match[1].trim();
  }
  
  // Otherwise, use the part before @ as the name
  const parts = email.split('@');
  if (parts.length > 1) {
    // Replace dots and underscores with spaces and capitalize each word
    return parts[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
  
  return email;
};

/**
 * Parse a Gmail message to extract relevant information
 * @param {Object} message - The Gmail message object
 * @returns {Object} The parsed message
 */
export const parseGmailMessage = (message) => {
  if (!message || !message.payload) {
    return null;
  }
  
  const headers = message.payload.headers || [];
  const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
  const from = headers.find(h => h.name === 'From')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';
  
  // Extract body
  let body = '';
  if (message.payload.body && message.payload.body.data) {
    // Decode base64url encoded data
    body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  } else if (message.payload.parts) {
    // Look for text/plain part
    const textPart = message.payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }
  
  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    sender: extractNameFromEmail(from),
    date: new Date(date),
    body: truncateString(body, 150),
    fullBody: body,
    unread: message.labelIds?.includes('UNREAD') || false,
  };
};

/**
 * Parse an Outlook message to extract relevant information
 * @param {Object} message - The Outlook message object
 * @returns {Object} The parsed message
 */
export const parseOutlookMessage = (message) => {
  if (!message) {
    return null;
  }
  
  return {
    id: message.id,
    subject: message.subject || 'No Subject',
    from: message.from?.emailAddress?.address || '',
    sender: message.from?.emailAddress?.name || extractNameFromEmail(message.from?.emailAddress?.address || ''),
    date: new Date(message.receivedDateTime),
    body: truncateString(message.body?.content || '', 150),
    fullBody: message.body?.content || '',
    unread: message.isRead === false,
  };
};