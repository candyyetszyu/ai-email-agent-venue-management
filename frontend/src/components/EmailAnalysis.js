import React from 'react';
import { Box, Typography, Paper, Chip, Divider, List, ListItem, ListItemText } from '@mui/material';
import { formatDate, formatTime } from '../utils/dateUtils';

const EmailAnalysis = ({ analysis }) => {
  if (!analysis) {
    return null;
  }

  const {
    requestedVenue,
    requestedDate,
    requestedTime,
    attendees,
    eventType,
    confidence,
  } = analysis;

  // Helper function to determine confidence level color
  const getConfidenceColor = (level) => {
    if (!level) return 'default';
    if (level >= 0.8) return 'success';
    if (level >= 0.5) return 'warning';
    return 'error';
  };

  // Helper function to format confidence as percentage
  const formatConfidence = (level) => {
    if (!level && level !== 0) return 'Unknown';
    return `${Math.round(level * 100)}%`;
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Email Analysis</Typography>
        <Chip
          label={`Confidence: ${formatConfidence(confidence)}`}
          color={getConfidenceColor(confidence)}
          size="small"
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List dense disablePadding>
        {requestedVenue && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary="Requested Venue"
              secondary={requestedVenue}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        )}

        {requestedDate && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary="Requested Date"
              secondary={formatDate(requestedDate)}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        )}

        {requestedTime && requestedTime.start && requestedTime.end && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary="Requested Time"
              secondary={`${formatTime(requestedTime.start)} - ${formatTime(requestedTime.end)}`}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        )}

        {attendees && attendees.length > 0 && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary="Attendees"
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  {attendees.map((attendee, index) => (
                    <Chip
                      key={index}
                      label={attendee.name || attendee.email || attendee}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              }
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </ListItem>
        )}

        {eventType && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary="Event Type"
              secondary={eventType}
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body1' }}
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default EmailAnalysis;