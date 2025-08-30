import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import { useAI } from '../context/AIContext';
import EmailPreviewCard from '../components/Email/EmailPreviewCard';
import AIResponseCard from '../components/AI/AIResponseCard';
import StatsCard from '../components/Dashboard/StatsCard';
import EmailFilters from '../components/Email/EmailFilters';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    emails, 
    loading, 
    error, 
    fetchEmails, 
    fetchStats, 
    stats,
    selectedProvider,
    setSelectedProvider
  } = useEmail();
  const { 
    aiResponses, 
    analyzeEmail, 
    generateResponse,
    batchProcessEmails 
  } = useAI();

  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [processingEmails, setProcessingEmails] = useState([]);

  useEffect(() => {
    fetchEmails(selectedProvider, { filter: filterType, search: searchQuery });
    fetchStats(selectedProvider);
  }, [selectedProvider, filterType, searchQuery, fetchEmails, fetchStats]);

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    setTabValue(0);
  };

  const handleRefresh = async () => {
    await fetchEmails(selectedProvider, { filter: filterType, search: searchQuery });
    await fetchStats(selectedProvider);
  };

  const handleBatchProcess = async () => {
    const unprocessedEmails = emails.filter(email => !aiResponses[email.id]);
    if (unprocessedEmails.length === 0) {
      return;
    }

    setProcessingEmails(unprocessedEmails.map(e => e.id));
    try {
      await batchProcessEmails(selectedProvider, unprocessedEmails.map(e => e.id));
    } finally {
      setProcessingEmails([]);
    }
  };

  const handleAnalyzeSingle = async (emailId) => {
    setProcessingEmails(prev => [...prev, emailId]);
    try {
      await analyzeEmail(selectedProvider, emailId);
    } finally {
      setProcessingEmails(prev => prev.filter(id => id !== emailId));
    }
  };

  const handleGenerateResponse = async (emailId) => {
    setProcessingEmails(prev => [...prev, emailId]);
    try {
      await generateResponse(selectedProvider, emailId);
    } finally {
      setProcessingEmails(prev => prev.filter(id => id !== emailId));
    }
  };

  const filteredEmails = emails.filter(email => {
    if (filterType === 'unread' && !email.isUnread) return false;
    if (filterType === 'booking' && !email.isBookingRelated) return false;
    if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircleIcon color="success" />;
      case 'pending': return <ScheduleIcon color="warning" />;
      case 'error': return <EmailIcon color="error" />;
      default: return <EmailIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading && emails.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Email Agent Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome, {user?.name || user?.email}
        </Typography>
      </Box>

      {/* Provider Selection */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedProvider === 'gmail' ? 0 : 1} onChange={(_, value) => handleProviderChange(value === 0 ? 'gmail' : 'outlook')}>
          <Tab label="Gmail" />
          <Tab label="Outlook" />
        </Tabs>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Emails"
            value={stats?.totalEmails || 0}
            icon={<EmailIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Unread"
            value={stats?.unreadEmails || 0}
            icon={<EmailIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Booking Inquiries"
            value={stats?.bookingEmails || 0}
            icon={<StarIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="AI Processed"
            value={stats?.processedEmails || 0}
            icon={<CheckCircleIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <EmailFilters
            filterType={filterType}
            setFilterType={setFilterType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleBatchProcess}
            disabled={processingEmails.length > 0 || emails.filter(e => !aiResponses[e.id]).length === 0}
          >
            {processingEmails.length > 0 ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Batch Process'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Email List */}
        <Grid item xs={12} md={6}>
          <Paper>
            <CardHeader
              title={`${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} Emails`}
              subheader={`${filteredEmails.length} emails found`}
              action={
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <Divider />
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {filteredEmails.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No emails found
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredEmails.map((email) => (
                    <EmailPreviewCard
                      key={email.id}
                      email={email}
                      aiResponse={aiResponses[email.id]}
                      isProcessing={processingEmails.includes(email.id)}
                      onAnalyze={() => handleAnalyzeSingle(email.id)}
                      onGenerateResponse={() => handleGenerateResponse(email.id)}
                    />
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* AI Responses */}
        <Grid item xs={12} md={6}>
          <Paper>
            <CardHeader
              title="AI-Generated Responses"
              subheader="Review and edit responses before sending"
            />
            <Divider />
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              {Object.keys(aiResponses).length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    No AI responses generated yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {Object.entries(aiResponses).map(([emailId, response]) => {
                    const email = emails.find(e => e.id === emailId);
                    if (!email) return null;
                    
                    return (
                      <AIResponseCard
                        key={emailId}
                        email={email}
                        response={response}
                        onSend={() => console.log('Send response for', emailId)}
                        onEdit={() => console.log('Edit response for', emailId)}
                      />
                    );
                  })}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;