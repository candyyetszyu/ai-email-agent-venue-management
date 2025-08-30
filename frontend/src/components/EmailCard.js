import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActionArea,
} from '@mui/material';
import { formatDate } from '../utils/helpers';
import EmailIcon from '@mui/icons-material/Email';
import DraftsIcon from '@mui/icons-material/Drafts';

const EmailCard = ({ email, provider }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/email/${provider}/${email.id}`);
  };

  return (
    <Card 
      sx={{
        mb: 2,
        border: email.unread ? '1px solid #3f51b5' : 'none',
        boxShadow: email.unread ? 3 : 1,
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center">
              {email.unread ? (
                <EmailIcon color="primary" sx={{ mr: 1 }} />
              ) : (
                <DraftsIcon sx={{ mr: 1, color: 'text.secondary' }} />
              )}
              <Typography variant="subtitle1" fontWeight={email.unread ? 'bold' : 'normal'}>
                {email.sender || 'Unknown Sender'}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatDate(email.date, true)}
            </Typography>
          </Box>
          
          <Typography variant="body1" fontWeight={email.unread ? 'bold' : 'normal'} gutterBottom>
            {email.subject || 'No Subject'}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {email.snippet || email.body || 'No content'}
          </Typography>
          
          <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
            <Chip 
              size="small" 
              label={provider === 'gmail' ? 'Gmail' : 'Outlook'} 
              color={provider === 'gmail' ? 'primary' : 'secondary'}
              variant="outlined"
            />
            
            {email.unread && (
              <Chip 
                size="small" 
                label="Unread" 
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EmailCard;