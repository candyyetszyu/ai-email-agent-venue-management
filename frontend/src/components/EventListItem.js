import React from 'react';
import { ListItem, ListItemText, Typography, Box, Chip, Divider } from '@mui/material';
import { formatTime, formatDate } from '../utils/dateUtils';

const EventListItem = ({ event }) => {
  // Format the start and end times
  const startTime = formatTime(event.start?.dateTime || event.start);
  const endTime = formatTime(event.end?.dateTime || event.end);
  const eventDate = formatDate(event.start?.dateTime || event.start);
  
  // Determine if the event is happening today
  const isToday = () => {
    const today = new Date();
    const eventDay = new Date(event.start?.dateTime || event.start);
    return (
      today.getDate() === eventDay.getDate() &&
      today.getMonth() === eventDay.getMonth() &&
      today.getFullYear() === eventDay.getFullYear()
    );
  };

  return (
    <>
      <ListItem 
        alignItems="flex-start"
        sx={{
          py: 1.5,
          px: 2,
        }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" component="span">
                {event.summary || 'Untitled Event'}
              </Typography>
              {isToday() && (
                <Chip 
                  label="Today" 
                  size="small" 
                  color="primary" 
                  sx={{ height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </Box>
          }
          secondary={
            <>
              <Typography
                variant="body2"
                component="span"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {eventDate} • {startTime} - {endTime}
              </Typography>
              
              {event.location && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                  sx={{ display: 'block' }}
                >
                  📍 {event.location}
                </Typography>
              )}
              
              {event.attendees && event.attendees.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  👥 {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                </Typography>
              )}
            </>
          }
        />
      </ListItem>
      <Divider component="li" />
    </>
  );
};

export default EventListItem;