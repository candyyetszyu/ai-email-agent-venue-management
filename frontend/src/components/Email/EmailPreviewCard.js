import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  SmartToy as AIIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';

const EmailPreviewCard = ({ email, aiResponse, isProcessing, onAnalyze, onGenerateResponse }) => {
  const getEmailStatus = () => {
    if (isProcessing) return 'processing';
    if (aiResponse?.status === 'error') return 'error';
    if (aiResponse?.analysis) return 'analyzed';
    if (aiResponse?.response) return 'completed';
    return 'pending';
  };

  const getStatusChip = () => {
    const status = getEmailStatus();
    
    switch (status) {
      case 'processing':
        return (
          <Chip
            icon={<CircularProgress size={16} />}
            label="Processing"
            size="small"
            color="info"
            variant="outlined"
          />
        );
      case 'error':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Error"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      case 'analyzed':
        return (
          <Chip
            icon={<AIIcon />}
            label="Analyzed"
            size="small"
            color="primary"
            variant="filled"
          />
        );
      case 'completed':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Ready"
            size="small"
            color="success"
            variant="filled"
          />
        );
      default:
        return (
          <Chip
            icon={<EmailIcon />}
            label="New"
            size="small"
            color="default"
            variant="outlined"
          />
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getSenderName = () => {
    return email.from?.name || email.from?.email || 'Unknown Sender';
  };

  const getSenderEmail = () => {
    return email.from?.email || email.from?.address || 'unknown@email.com';
  };

  return (
    <ListItem
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        cursor: 'pointer',
        py: 2,
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: email.isUnread ? 'primary.main' : 'grey.500' }}>
          {getInitials(getSenderName())}
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: email.isUnread ? 'bold' : 'normal',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email.subject || 'No Subject'}
            </Typography>
            {getStatusChip()}
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {getSenderName()} ({getSenderEmail()})
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email.snippet || email.body?.substring(0, 100) || 'No preview available'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatDate(email.date || email.receivedDateTime)}
              </Typography>
              {email.isBookingRelated && (
                <Chip
                  label="Booking Inquiry"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
              {email.language && (
                <Chip
                  label={email.language.toUpperCase()}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        }
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 1 }}>
        {!aiResponse?.response && (
          <Tooltip title="Generate AI Response">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onGenerateResponse();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? <CircularProgress size={20} /> : <ReplyIcon />}
            </IconButton>
          </Tooltip>
        )}
        
        {!aiResponse?.analysis && (
          <Tooltip title="Analyze Email">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? <CircularProgress size={20} /> : <AIIcon />}
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to email detail view
            }}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </ListItem>
  );
};

export default EmailPreviewCard;