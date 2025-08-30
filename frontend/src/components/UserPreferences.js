import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Button,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const UserPreferences = ({ 
  preferences = {}, 
  onSavePreferences,
  googleConnected = false,
  microsoftConnected = false,
}) => {
  // Initialize state with current preferences or defaults
  const [localPreferences, setLocalPreferences] = useState({
    autoAnalyzeEmails: preferences.autoAnalyzeEmails ?? true,
    defaultEmailProvider: preferences.defaultEmailProvider ?? 'gmail',
    ...preferences
  });

  // Handle preference changes
  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setLocalPreferences({
      ...localPreferences,
      [name]: value !== undefined ? value : checked,
    });
  };

  // Handle save button click
  const handleSave = () => {
    if (onSavePreferences) {
      onSavePreferences(localPreferences);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        User Preferences
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mt: 3 }}>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Email Analysis
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.autoAnalyzeEmails}
                onChange={handleChange}
                name="autoAnalyzeEmails"
                color="primary"
              />
            }
            label="Automatically analyze emails when opened"
          />
        </FormControl>
        
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Default Email Provider
          </Typography>
          
          <RadioGroup
            name="defaultEmailProvider"
            value={localPreferences.defaultEmailProvider}
            onChange={handleChange}
          >
            <FormControlLabel 
              value="gmail" 
              control={<Radio />} 
              label="Gmail" 
              disabled={!googleConnected}
            />
            <FormControlLabel 
              value="outlook" 
              control={<Radio />} 
              label="Outlook" 
              disabled={!microsoftConnected}
            />
          </RadioGroup>
        </FormControl>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Preferences
        </Button>
      </Box>
    </Paper>
  );
};

export default UserPreferences;