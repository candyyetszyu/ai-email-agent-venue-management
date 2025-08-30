import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { CheckCircle, Cancel, HelpOutline } from '@mui/icons-material';
import { formatDateTimeRange } from '../utils/dateUtils';

const VenueAvailability = ({ availability, requestedTime }) => {
  if (!availability) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpOutline color="action" sx={{ mr: 1 }} />
          <Typography variant="body1">
            Venue availability information is not available
          </Typography>
        </Box>
      </Paper>
    );
  }

  const { isAvailable, venue, conflicts = [] } = availability;

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: isAvailable ? 'rgba(46, 125, 50, 0.08)' : 'rgba(211, 47, 47, 0.08)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {isAvailable ? (
          <CheckCircle color="success" sx={{ mr: 1 }} />
        ) : (
          <Cancel color="error" sx={{ mr: 1 }} />
        )}
        <Typography variant="h6">
          {venue || 'Requested Venue'} is {isAvailable ? 'Available' : 'Not Available'}
        </Typography>
      </Box>

      {requestedTime && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Requested time: {formatDateTimeRange(requestedTime.start, requestedTime.end)}
        </Typography>
      )}

      {!isAvailable && conflicts.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Conflicting Events:
          </Typography>
          {conflicts.map((conflict, index) => (
            <Box key={index} sx={{ mb: 1, pl: 2, borderLeft: '2px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="body2" gutterBottom>
                <strong>{conflict.summary || 'Untitled Event'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateTimeRange(conflict.start, conflict.end)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Chip 
          label={isAvailable ? 'Available for Booking' : 'Scheduling Conflict'} 
          color={isAvailable ? 'success' : 'error'}
          size="small"
        />
      </Box>
    </Paper>
  );
};

export default VenueAvailability;