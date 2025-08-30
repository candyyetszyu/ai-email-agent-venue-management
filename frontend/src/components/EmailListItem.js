import React from 'react';
import { ListItem, ListItemText, Typography, Box, Chip, Divider } from '@mui/material';
import { getRelativeTimeString, truncateEmailBody } from '../utils/dateUtils';

const EmailListItem = ({ email, onClick }) => {
  // Extract sender name or use email address
  const senderName = email.sender?.name || email.sender?.email || 'Unknown Sender';
  
  // Format the date
  const dateString = getRelativeTimeString(email.date || email.receivedAt);
  
  // Truncate the body text
  const truncatedBody = truncateEmailBody(email.body || email.snippet, 120);

  return (
    <>
      <ListItem 
        button 
        onClick={() => onClick(email)} 
        alignItems="flex-start"
        sx={{
          py: 1.5,
          px: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" component="span" sx={{ fontWeight: email.unread ? 700 : 400 }}>
                {senderName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dateString}
              </Typography>
            </Box>
          }
          secondary={
            <>
              <Typography
                variant="body2"
                component="span"
                sx={{ 
                  display: 'block', 
                  fontWeight: email.unread ? 600 : 400,
                  mb: 0.5
                }}
              >
                {email.subject || 'No Subject'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{ display: 'block' }}
              >
                {truncatedBody}
              </Typography>
              {email.hasAttachments && (
                <Chip 
                  label="Attachment" 
                  size="small" 
                  variant="outlined" 
                  sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </>
          }
        />
      </ListItem>
      <Divider component="li" />
    </>
  );
};

export default EmailListItem;