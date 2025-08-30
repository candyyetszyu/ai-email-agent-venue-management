import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const EmptyState = ({
  title = 'No Data Available',
  message = 'There are no items to display at this time.',
  icon: Icon,
  actionText,
  onAction,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'background.default',
        borderRadius: 2,
        minHeight: '200px',
      }}
    >
      {Icon && (
        <Box sx={{ mb: 2, color: 'text.secondary' }}>
          <Icon sx={{ fontSize: 60 }} />
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        {message}
      </Typography>

      {actionText && onAction && (
        <Button
          variant="outlined"
          color="primary"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;