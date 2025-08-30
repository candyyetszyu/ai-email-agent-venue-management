import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add request interceptor to add auth token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
const authService = {
  checkAuth: () => API.get('/auth/verify'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('emailProvider');
  },
};

// Calendar services
const calendarService = {
  // Google Calendar services
  getGoogleEvents: (startDate, endDate) => API.get('/calendar/events', { params: { startDate, endDate } }),
  checkGoogleAvailability: (venue, startTime, endTime) => 
    API.post('/calendar/check-availability', { venue, startTime, endTime }),
  
  // Microsoft Calendar services
  getMicrosoftEvents: (startDate, endDate) => API.get('/calendar/microsoft/events', { params: { startDate, endDate } }),
  checkMicrosoftAvailability: (venue, startTime, endTime) => 
    API.post('/calendar/microsoft/check-availability', { venue, startTime, endTime }),
  
  // Generic methods that work with current provider
  getEvents: (startDate, endDate, provider = 'google') => {
    return provider === 'google' 
      ? calendarService.getGoogleEvents(startDate, endDate)
      : calendarService.getMicrosoftEvents(startDate, endDate);
  },
  
  checkAvailability: (venue, startTime, endTime, provider = 'google') => {
    return provider === 'google'
      ? calendarService.checkGoogleAvailability(venue, startTime, endTime)
      : calendarService.checkMicrosoftAvailability(venue, startTime, endTime);
  }
};

// Email services
const emailService = {
  // Gmail services
  getGmailMessages: () => API.get('/email/gmail/messages'),
  getGmailMessage: (id) => API.get(`/email/gmail/message/${id}`),
  sendGmailMessage: (to, subject, body) => API.post('/email/gmail/send', { to, subject, body }),
  
  // Outlook services
  getOutlookMessages: () => API.get('/email/outlook/messages'),
  getOutlookMessage: (id) => API.get(`/email/outlook/message/${id}`),
  sendOutlookMessage: (to, subject, body) => API.post('/email/outlook/send', { to, subject, body }),
};

// AI services
const aiService = {
  analyzeEmail: (emailContent) => API.post('/ai/analyze-email', { emailContent }),
  generateResponse: (originalEmail, calendarData, venueInfo) => 
    API.post('/ai/generate-response', { originalEmail, calendarData, venueInfo }),
};

export { API, authService, calendarService, emailService, aiService };