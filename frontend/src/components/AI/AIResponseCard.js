import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Collapse,
  TextField,
  Paper,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const AIResponseCard = ({ email, response, onSend, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(response?.response || '');
  const [expanded, setExpanded] = useState(false);

  const getConfidenceChip = () => {
    const confidence = response?.confidence || 0;
    
    if (confidence >= 0.8) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label={`${Math.round(confidence * 100)}% Confidence`}
          size="small"
          color="success"
          variant="outlined"
        />
      );
    } else if (confidence >= 0.6) {
      return (
        <Chip
          icon={<WarningIcon />}
          label={`${Math.round(confidence * 100)}% Confidence`}
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          icon={<InfoIcon />}
          label={`${Math.round(confidence * 100)}% Confidence`}
          size="small"
          color="error"
          variant="outlined"
        />
      );
    }
  };

  const getLanguageChip = () => {
    const detectedLang = response?.detectedLanguage || email?.language;
    if (!detectedLang) return null;
    
    return (
      <Chip
        label={detectedLang.toUpperCase()}
        size="small"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    );
  };

  const getBookingTypeChip = () => {
    const type = response?.analysis?.bookingType;
    if (!type) return null;
    
    const typeLabels = {
      'wedding': 'Wedding',
      'corporate': 'Corporate Event',
      'birthday': 'Birthday Party',
      'conference': 'Conference',
      'other': 'Other Event'
    };
    
    return (
      <Chip
        label={typeLabels[type] || type}
        size="small"
        color="primary"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    );
  };

  const formatResponse = (text) => {
    if (!text) return 'No response generated yet';
    
    // Add line breaks for better readability
    return text.split('\n').map((line, index) => (
      <Typography key={index} variant="body2" sx={{ mb: 1 }}>
        {line || <br />}
      </Typography>
    ));
  };

  const handleSaveEdit = () => {
    // Save the edited response
    setIsEditing(false);
    if (onEdit) {
      onEdit(email.id, editedResponse);
    }
  };

  const handleCancelEdit = () => {
    setEditedResponse(response?.response || '');
    setIsEditing(false);
  };

  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {email.subject || 'No Subject'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          {getConfidenceChip()}
          {getLanguageChip()}
          {getBookingTypeChip()}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          From: {email.from?.name || email.from?.email || 'Unknown Sender'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Analysis Summary */}
      {response?.analysis && (
        <Accordion expanded={expanded} onChange={(_, isExpanded) => setExpanded(isExpanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Analysis Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Intent: {response.analysis.intent}
              </Typography>
              
              {response.analysis.sentiment && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Sentiment: {response.analysis.sentiment}
                </Typography>
              )}
              
              {response.analysis.urgency && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Urgency: {response.analysis.urgency}
                </Typography>
              )}
              
              {response.analysis.entities && response.analysis.entities.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Key Information:
                  </Typography>
                  {response.analysis.entities.map((entity, index) => (
                    <Chip
                      key={index}
                      label={`${entity.type}: ${entity.value}`}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* AI Response */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          AI-Generated Response:
        </Typography>
        
        {isEditing ? (
          <Box>
            <TextField
              multiline
              fullWidth
              rows={8}
              value={editedResponse}
              onChange={(e) => setEditedResponse(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveEdit}
              >
                Save
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ 
              maxHeight: 200, 
              overflow: 'auto', 
              p: 2, 
              backgroundColor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {formatResponse(response?.response)}
            </Box>
            
            {response?.warning && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {response.warning}
              </Alert>
            )}
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      {!isEditing && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => onSend && onSend(email.id)}
            disabled={!response?.response}
          >
            Send Response
          </Button>
          
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default AIResponseCard;