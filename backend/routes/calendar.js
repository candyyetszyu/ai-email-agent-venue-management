const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
const { body, query, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Middleware to verify JWT token and set up OAuth client
const auth = require('../middleware/auth');

// Validation middleware
const validateEvents = [
  query('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .toDate()
    .withMessage('End date must be a valid ISO 8601 date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Get calendar events
router.get('/events', auth, authController.getGoogleOAuth2Client, validateEvents, async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: req.oauth2Client });
    
    const { startDate, endDate } = req.query;
    
    // Validate input parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    // Get calendar events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items.map(event => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      attendees: event.attendees,
      organizer: event.organizer,
      status: event.status,
    }));
    
    res.json({ events });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Validation middleware for availability check
const validateAvailability = [
  body('venue')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Venue name must be between 1 and 100 characters')
    .escape(),
  body('startTime')
    .isISO8601()
    .toDate()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End time must be a valid ISO 8601 date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Check venue availability
router.post('/check-availability', auth, authController.getGoogleOAuth2Client, validateAvailability, async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: req.oauth2Client });
    
    const { venue, startTime, endTime } = req.body;
    
    // Validate input parameters
    if (!venue || !startTime) {
      return res.status(400).json({ error: 'Venue and start time are required' });
    }

    // If endTime is not provided, default to 2 hours after startTime
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    
    // Get calendar events for the specified time range
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    // Filter events by venue (location)
    const conflictingEvents = response.data.items.filter(event => {
      // Check if the event location contains the requested venue name (case insensitive)
      return event.location && event.location.toLowerCase().includes(venue.toLowerCase());
    }).map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    }));
    
    const isAvailable = conflictingEvents.length === 0;
    
    res.json({
      isAvailable,
      venue,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      conflictingEvents,
    });
  } catch (err) {
    console.error('Error checking venue availability:', err);
    res.status(500).json({ error: 'Failed to check venue availability' });
  }
});

// Microsoft Graph calendar endpoints

// Get Microsoft calendar events
router.get('/microsoft/events', auth, authController.getMicrosoftGraphClient, validateEvents, async (req, res) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, req.msalToken);
      },
    });

    const { startDate, endDate } = req.query;
    
    // Validate input parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Get calendar events
    const response = await client
      .api('/me/calendar/events')
      .query({
        startDateTime: new Date(startDate).toISOString(),
        endDateTime: new Date(endDate).toISOString(),
        $orderby: 'start/dateTime',
      })
      .get();

    const events = response.value.map(event => ({
      id: event.id,
      summary: event.subject,
      description: event.bodyPreview,
      location: event.location?.displayName,
      start: event.start.dateTime,
      end: event.end.dateTime,
      attendees: event.attendees?.map(attendee => ({
        email: attendee.emailAddress.address,
        displayName: attendee.emailAddress.name,
        responseStatus: attendee.status.response
      })),
      organizer: event.organizer ? {
        email: event.organizer.emailAddress.address,
        displayName: event.organizer.emailAddress.name
      } : null,
      status: event.showAs,
    }));

    res.json({ events });
  } catch (err) {
    console.error('Error fetching Microsoft calendar events:', err);
    res.status(500).json({ error: 'Failed to fetch Microsoft calendar events' });
  }
});

// Check Microsoft calendar venue availability
router.post('/microsoft/check-availability', auth, authController.getMicrosoftGraphClient, validateAvailability, async (req, res) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, req.msalToken);
      },
    });

    const { venue, startTime, endTime } = req.body;
    
    // Validate input parameters
    if (!venue || !startTime) {
      return res.status(400).json({ error: 'Venue and start time are required' });
    }

    // If endTime is not provided, default to 2 hours after startTime
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    // Get calendar events for the specified time range
    const response = await client
      .api('/me/calendar/events')
      .query({
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        $orderby: 'start/dateTime',
      })
      .get();

    // Filter events by venue (location)
    const conflictingEvents = response.value.filter(event => {
      const location = event.location?.displayName || '';
      return location.toLowerCase().includes(venue.toLowerCase());
    }).map(event => ({
      id: event.id,
      summary: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
    }));

    const isAvailable = conflictingEvents.length === 0;

    res.json({
      isAvailable,
      venue,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      conflictingEvents,
    });
  } catch (err) {
    console.error('Error checking Microsoft calendar venue availability:', err);
    res.status(500).json({ error: 'Failed to check Microsoft calendar venue availability' });
  }
});

module.exports = router;