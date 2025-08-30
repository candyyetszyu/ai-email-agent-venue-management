/**
 * Utility functions for data validation
 */

/**
 * Validate an email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate that a string is not empty
 * @param {string} value - String to validate
 * @returns {boolean} True if string is not empty
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  return value.trim().length > 0;
};

/**
 * Validate a date string format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if date format is valid
 */
export const isValidDateFormat = (dateString) => {
  if (!dateString) return false;
  
  // Check format using regex (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate a time string format (HH:MM)
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if time format is valid
 */
export const isValidTimeFormat = (timeString) => {
  if (!timeString) return false;
  
  // Check format using regex (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

/**
 * Validate that a date is in the future
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false;
  
  const now = new Date();
  return dateObj > now;
};

/**
 * Validate that an end time is after a start time
 * @param {string|Date} startTime - Start time
 * @param {string|Date} endTime - End time
 * @returns {boolean} True if end time is after start time
 */
export const isEndTimeAfterStartTime = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  const startTimeObj = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const endTimeObj = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) return false;
  
  return endTimeObj > startTimeObj;
};

/**
 * Validate a URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL format is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};