import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Send,
  Download,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useEmail } from '../context/EmailContext';
import { useAI } from '../context/AIContext';

const EmailResponse = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const { getEmail, sendEmail, loading: emailLoading, error: emailError } = useEmail();
  const { 
    aiResponses, 
    analyzeEmail, 
    generateResponse, 
    updateResponse,
    loading: aiLoading
  } = useAI();

  const [email, setEmail] = useState(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [emailProvider] = useState('gmail');

  const currentAIResponse = aiResponses[emailId];

  const loadEmail = useCallback(async () => {
    try {
      const emailData = await getEmail(emailProvider, emailId);
      setEmail(emailData);
      
      // Auto-analyze if not already analyzed
      if (!currentAIResponse?.analysis) {
        await analyzeEmail(emailProvider, emailId);
      }
    } catch (error) {
      console.error('Failed to load email:', error);
    }
  }, [getEmail, emailProvider, emailId, currentAIResponse?.analysis, analyzeEmail]);

  useEffect(() => {
    loadEmail();
  }, [emailId, loadEmail]);

  useEffect(() => {
    if (currentAIResponse?.response) {
      setEditedResponse(currentAIResponse.response);
    }
  }, [currentAIResponse?.response]);

  const handleGenerateResponse = async () => {
    try {
      await generateResponse(emailProvider, emailId, {
        tone: 'professional',
        includeCalendar: true
      });
    } catch (error) {
      console.error('Failed to generate response:', error);
    }
  };

  const handleSendResponse = async () => {
    try {
      setSendStatus('sending');
      
      const responseToSend = isEditing ? editedResponse : currentAIResponse?.response;
      
      await sendEmail(emailProvider, {
        to: email.from,
        subject: `Re: ${email.subject}`,
        body: responseToSend,
        inReplyTo: email.messageId,
        references: [email.messageId]
      });

      setSendStatus('sent');
    } catch (error) {
      setSendStatus('error');
      console.error('Failed to send response:', error);
    }
  };

  const handleSaveEdit = () => {
    updateResponse(emailId, editedResponse);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedResponse(currentAIResponse?.response || '');
    setIsEditing(false);
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      console.log('Downloading attachment:', attachment.filename);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  if (emailLoading || !email) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (emailError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">{emailError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Email Response</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadEmail}
            disabled={emailLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={handleSendResponse}
            disabled={!currentAIResponse?.response || sendStatus === 'sent'}
          >
            Send Response
          </Button>
        </Box>
      </Box>

      {/* Status Messages */}
      {sendStatus === 'sent' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Response sent successfully!
        </Alert>
      )}
      {sendStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to send response. Please try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Original Email */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Original Email
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  From: {email.from}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Subject: {email.subject}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Date: {new Date(email.date).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box 
                dangerouslySetInnerHTML={{ __html: email.body }} 
                sx={{ 
                  maxHeight: 400, 
                  overflow: 'auto',
                  '& img': { maxWidth: '100%', height: 'auto' }
                }}
              />
              
              {email.attachments && email.attachments.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments:
                  </Typography>
                  {email.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment.filename}
                      icon={<Download />}
                      onClick={() => handleDownloadAttachment(attachment)}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Analysis & Response */}
        <Grid item xs={12} md={6}>
          {/* AI Analysis */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">AI Analysis</Typography>
                {!currentAIResponse?.analysis && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => analyzeEmail(emailProvider, emailId)}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                )}
              </Box>
              
              {aiLoading && !currentAIResponse?.analysis && (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {currentAIResponse?.analysis && (
                <Box>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    <Chip 
                      label={`Language: ${currentAIResponse.detectedLanguage}`} 
                      size="small"
                      color="primary"
                    />
                    <Chip 
                      label={`Confidence: ${(currentAIResponse.confidence * 100).toFixed(0)}%`} 
                      size="small"
                      color="secondary"
                    />
                    <Chip 
                      label={currentAIResponse.analysis.type} 
                      size="small"
                      color="success"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary">
                    <strong>Category:</strong> {currentAIResponse.analysis.category}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Priority:</strong> {currentAIResponse.analysis.priority}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Key Points:</strong> {currentAIResponse.analysis.keyPoints?.join(', ')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* AI Response */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">AI Response</Typography>
                <Box display="flex" gap={1}>
                  {!currentAIResponse?.response && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleGenerateResponse}
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Generating...' : 'Generate'}
                    </Button>
                  )}
                  {currentAIResponse?.response && (
                    <>
                      {!isEditing ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </Box>
              </Box>

              {aiLoading && !currentAIResponse?.response && (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {currentAIResponse?.response && (
                <>
                  {isEditing ? (
                    <TextField
                      multiline
                      fullWidth
                      rows={10}
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      variant="outlined"
                    />
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {currentAIResponse.response}
                      </Typography>
                    </Paper>
                  )}
                  
                  {currentAIResponse?.warning && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {currentAIResponse.warning}
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmailResponse;