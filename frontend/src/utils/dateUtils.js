/**
 * Utility functions for date and time formatting
 */

/**
 * Format a date to a readable string (e.g., "Mon, Jan 1, 2023")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a time to a readable string (e.g., "9:30 AM")
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  
  if (isNaN(dateObj.getTime())) return 'Invalid time';
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format a date and time range (e.g., "Mon, Jan 1, 2023 9:30 AM - 10:30 AM")
 * @param {string|Date} startDateTime - Start date and time
 * @param {string|Date} endDateTime - End date and time
 * @returns {string} Formatted date and time range
 */
export const formatDateTimeRange = (startDateTime, endDateTime) => {
  if (!startDateTime || !endDateTime) return '';
  
  const startDate = typeof startDateTime === 'string' ? new Date(startDateTime) : startDateTime;
  const endDate = typeof endDateTime === 'string' ? new Date(endDateTime) : endDateTime;
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Invalid date range';
  
  // Check if start and end dates are the same day
  const sameDay = startDate.toDateString() === endDate.toDateString();
  
  if (sameDay) {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  } else {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
  }
};

/**
 * Get a relative time string (e.g., "2 hours ago", "Yesterday", "Last week")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }
  
  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};