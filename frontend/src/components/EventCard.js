import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { formatDate, formatTime } from '../utils/helpers';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const EventCard = ({ event }) => {
  // Parse dates
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  
  // Check if it's an all-day event
  const isAllDay = !event.start.includes('T');
  
  // Check if it's today
  const today = new Date();
  const isToday = startDate.toDateString() === today.toDateString();

  return (
    <Card 
      sx={{
        mb: 2,
        border: isToday ? '1px solid #4caf50' : 'none',
        boxShadow: isToday ? 3 : 1,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center">
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              {event.summary || 'Untitled Event'}
            </Typography>
          </Box>
          
          {isToday && (
            <Chip 
              size="small" 
              label="Today" 
              color="success"
              variant="outlined"
            />
          )}
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="body2">
            <strong>Date:</strong> {formatDate(startDate)}
          </Typography>
          
          {!isAllDay && (
            <Typography variant="body2">
              <strong>Time:</strong> {formatTime(startDate)} - {formatTime(endDate)}
            </Typography>
          )}
          
          {isAllDay && (
            <Typography variant="body2">
              <strong>Duration:</strong> All day
            </Typography>
          )}
          
          {event.location && (
            <Box display="flex" alignItems="center">
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
            </Box>
          )}
          
          {event.attendees && event.attendees.length > 0 && (
            <Box display="flex" alignItems="center">
              <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;