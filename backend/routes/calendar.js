const { Hono } = require('hono');
const { google } = require('googleapis');
const authController = require('../controllers/authController');

// Middleware to verify JWT token and set up OAuth client
const auth = require('../middleware/auth');

const router = new Hono();

// Validation middleware
const validateEvents = async (c, next) => {
  const { startDate, endDate } = c.req.query();
  
  if (!startDate || !endDate) {
    return c.json({ error: 'Start date and end date are required' }, 400);
  }
  
  try {
    new Date(startDate);
    new Date(endDate);
  } catch (error) {
    return c.json({ error: 'Invalid date format' }, 400);
  }
  
  await next();
};

// Get calendar events
router.get('/events', auth, authController.getGoogleOAuth2Client, validateEvents, async (c) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: c.req.oauth2Client });
    
    const { startDate, endDate } = c.req.query();
    
    // Validate input parameters
    if (!startDate || !endDate) {
      return c.json({ error: 'Start date and end date are required' }, 400);
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
    
    return c.json({ events });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    return c.json({ error: 'Failed to fetch calendar events' }, 500);
  }
});

// Validation middleware for availability check
const validateAvailability = async (c, next) => {
  const { venue, startTime, endTime } = await c.req.json();
  
  if (!venue || venue.trim().length === 0 || venue.trim().length > 100) {
    return c.json({ error: 'Venue name must be between 1 and 100 characters' }, 400);
  }
  
  if (!startTime) {
    return c.json({ error: 'Start time is required' }, 400);
  }
  
  try {
    new Date(startTime);
    if (endTime) {
      new Date(endTime);
    }
  } catch (error) {
    return c.json({ error: 'Invalid date format' }, 400);
  }
  
  await next();
};

// Check venue availability
router.post('/check-availability', auth, authController.getGoogleOAuth2Client, validateAvailability, async (c) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: c.req.oauth2Client });
    
    const { venue, startTime, endTime } = await c.req.json();
    
    // Validate input parameters
    if (!venue || !startTime) {
      return c.json({ error: 'Venue and start time are required' }, 400);
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
    
    return c.json({
      isAvailable,
      venue,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      conflictingEvents,
    });
  } catch (err) {
    console.error('Error checking venue availability:', err);
    return c.json({ error: 'Failed to check venue availability' }, 500);
  }
});

// Microsoft Graph calendar endpoints

// Get Microsoft calendar events
router.get('/microsoft/events', auth, authController.getMicrosoftGraphClient, validateEvents, async (c) => {
  try {
    const { startDate, endDate } = c.req.query();
    
    // Validate input parameters
    if (!startDate || !endDate) {
      return c.json({ error: 'Start date and end date are required' }, 400);
    }

    // Get calendar events using fetch API
    const queryParams = new URLSearchParams({
      startDateTime: new Date(startDate).toISOString(),
      endDateTime: new Date(endDate).toISOString(),
      '$orderby': 'start/dateTime'
    });

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendar/events?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${c.req.msalToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const events = data.value.map(event => ({
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

    return c.json({ events });
  } catch (err) {
    console.error('Error fetching Microsoft calendar events:', err);
    return c.json({ error: 'Failed to fetch Microsoft calendar events' }, 500);
  }
});

// Check Microsoft calendar venue availability
router.post('/microsoft/check-availability', auth, authController.getMicrosoftGraphClient, validateAvailability, async (c) => {
  try {
    const { venue, startTime, endTime } = await c.req.json();
    
    // Validate input parameters
    if (!venue || !startTime) {
      return c.json({ error: 'Venue and start time are required' }, 400);
    }

    // If endTime is not provided, default to 2 hours after startTime
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    // Get calendar events for the specified time range using fetch API
    const queryParams = new URLSearchParams({
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      '$orderby': 'start/dateTime'
    });

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendar/events?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${c.req.msalToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Filter events by venue (location)
    const conflictingEvents = data.value.filter(event => {
      const location = event.location?.displayName || '';
      return location.toLowerCase().includes(venue.toLowerCase());
    }).map(event => ({
      id: event.id,
      summary: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
    }));

    const isAvailable = conflictingEvents.length === 0;

    return c.json({
      isAvailable,
      venue,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      conflictingEvents,
    });
  } catch (err) {
    console.error('Error checking Microsoft calendar venue availability:', err);
    return c.json({ error: 'Failed to check Microsoft calendar venue availability' }, 500);
  }
});

export default router;