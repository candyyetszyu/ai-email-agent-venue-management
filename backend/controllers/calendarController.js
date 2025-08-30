const { google } = require('googleapis');

/**
 * Get events from Google Calendar
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate input parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Get OAuth2 client from the request (set by auth middleware)
    const oauth2Client = req.oauth2Client;
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Create Google Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get events from primary calendar
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

    return res.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

/**
 * Check venue availability for a specific time period
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { venue, startTime, endTime } = req.body;
    
    // Validate input parameters
    if (!venue || !startTime) {
      return res.status(400).json({ error: 'Venue and start time are required' });
    }

    // If endTime is not provided, default to 2 hours after startTime
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    // Get OAuth2 client from the request (set by auth middleware)
    const oauth2Client = req.oauth2Client;
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Create Google Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get events from primary calendar for the specified time period
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

    // Determine if the venue is available
    const isAvailable = conflictingEvents.length === 0;

    return res.json({
      isAvailable,
      venue,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      conflictingEvents,
    });
  } catch (error) {
    console.error('Error checking venue availability:', error);
    return res.status(500).json({ error: 'Failed to check venue availability' });
  }
};