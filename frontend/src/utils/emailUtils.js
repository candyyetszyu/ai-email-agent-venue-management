/**
 * Utility functions for email formatting and parsing
 */

/**
 * Extract email address from a string that might contain a name (e.g., "John Doe <john@example.com>")
 * @param {string} emailString - Email string that might include a name
 * @returns {string} Email address only
 */
export const extractEmailAddress = (emailString) => {
  if (!emailString) return '';
  
  // Check if the email string contains angle brackets (indicating a name + email format)
  const match = emailString.match(/<([^>]+)>/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no angle brackets, return the original string (assumed to be just an email)
  return emailString.trim();
};

/**
 * Extract display name from an email string (e.g., "John Doe <john@example.com>" -> "John Doe")
 * @param {string} emailString - Email string that might include a name
 * @returns {string} Display name or email address if no name is present
 */
export const extractDisplayName = (emailString) => {
  if (!emailString) return '';
  
  // Check if the email string contains angle brackets (indicating a name + email format)
  const match = emailString.match(/(.+)\s*<[^>]+>/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If no angle brackets, return the original string (assumed to be just an email)
  return emailString.trim();
};

/**
 * Format an email string with name and address (e.g., "John Doe <john@example.com>")
 * @param {string} name - Display name
 * @param {string} email - Email address
 * @returns {string} Formatted email string
 */
export const formatEmailWithName = (name, email) => {
  if (!email) return '';
  if (!name) return email;
  
  return `${name} <${email}>`;
};

/**
 * Truncate email body text to a specified length with ellipsis
 * @param {string} text - Email body text
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateEmailBody = (text, maxLength = 100) => {
  if (!text) return '';
  
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const trimmedText = plainText.replace(/\s+/g, ' ').trim();
  
  if (trimmedText.length <= maxLength) {
    return trimmedText;
  }
  
  return trimmedText.substring(0, maxLength) + '...';
};

/**
 * Format a reply subject line (adding Re: if not already present)
 * @param {string} subject - Original email subject
 * @returns {string} Formatted reply subject
 */
export const formatReplySubject = (subject) => {
  if (!subject) return 'Re: ';
  
  // Check if subject already starts with Re:
  if (subject.trim().toLowerCase().startsWith('re:')) {
    return subject.trim();
  }
  
  return `Re: ${subject.trim()}`;
};

/**
 * Parse email body to extract potential booking information
 * @param {string} emailBody - Email body text
 * @returns {Object} Extracted booking information (venue, date, time, attendees)
 */
export const parseBookingInfo = (emailBody) => {
  if (!emailBody) return {};
  
  const bookingInfo = {
    venue: null,
    date: null,
    time: null,
    attendees: null,
  };
  
  // This is a simplified example - in a real application, you would use more
  // sophisticated NLP techniques or AI to extract this information accurately
  
  // Simple regex patterns to match common formats
  const venuePattern = /(?:venue|location|place|at):\s*([^\n.,]+)/i;
  const datePattern = /(?:date|on):\s*([^\n.,]+)/i;
  const timePattern = /(?:time|from):\s*([^\n.,]+)/i;
  const attendeesPattern = /(?:attendees|participants|with):\s*([^\n.,]+)/i;
  
  // Extract information using regex
  const venueMatch = emailBody.match(venuePattern);
  const dateMatch = emailBody.match(datePattern);
  const timeMatch = emailBody.match(timePattern);
  const attendeesMatch = emailBody.match(attendeesPattern);
  
  if (venueMatch && venueMatch[1]) bookingInfo.venue = venueMatch[1].trim();
  if (dateMatch && dateMatch[1]) bookingInfo.date = dateMatch[1].trim();
  if (timeMatch && timeMatch[1]) bookingInfo.time = timeMatch[1].trim();
  if (attendeesMatch && attendeesMatch[1]) bookingInfo.attendees = attendeesMatch[1].trim();
  
  return bookingInfo;
};