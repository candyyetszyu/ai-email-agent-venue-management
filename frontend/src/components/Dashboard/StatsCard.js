import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const StatsCard = ({ title, value, icon, color = 'primary', subtitle, onRefresh, loading }) => {
  const getColorStyles = (color) => {
    const colors = {
      primary: {
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      },
      secondary: {
        backgroundColor: 'secondary.main',
        color: 'secondary.contrastText',
      },
      success: {
        backgroundColor: 'success.main',
        color: 'success.contrastText',
      },
      warning: {
        backgroundColor: 'warning.main',
        color: 'warning.contrastText',
      },
      error: {
        backgroundColor: 'error.main',
        color: 'error.contrastText',
      },
      info: {
        backgroundColor: 'info.main',
        color: 'info.contrastText',
      },
      default: {
        backgroundColor: 'grey.500',
        color: 'white',
      }
    };
    
    return colors[color] || colors.default;
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    }
    return value || '0';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="overline"
              sx={{ fontSize: '0.75rem' }}
            >
              {title}
            </Typography>
            <Typography
              color="textPrimary"
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '1.75rem' }
              }}
            >
              {formatValue(value)}
            </Typography>
            {subtitle && (
              <Typography
                color="textSecondary"
                variant="caption"
                sx={{ fontSize: '0.75rem' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box
            sx={{
              ...getColorStyles(color),
              borderRadius: '50%',
              height: 48,
              width: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: (theme) => theme.shadows[2],
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {onRefresh && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                sx={{ p: 0.5 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;