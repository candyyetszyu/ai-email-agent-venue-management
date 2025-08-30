import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Chip,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EmailFilters = ({ 
  filterType, 
  setFilterType, 
  searchQuery, 
  setSearchQuery, 
  dateRange, 
  setDateRange,
  onClearFilters
}) => {
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setSearchQuery('');
    setDateRange({ from: null, to: null });
    if (onClearFilters) onClearFilters();
  };

  const hasActiveFilters = () => {
    return filterType !== 'all' || searchQuery || dateRange.from || dateRange.to;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Filter Type */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Filter"
            startAdornment={<FilterIcon fontSize="small" />}
          >
            <MenuItem value="all">All Emails</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="booking">Booking Inquiries</MenuItem>
            <MenuItem value="processed">AI Processed</MenuItem>
            <MenuItem value="pending">Pending Review</MenuItem>
            <MenuItem value="sent">Sent Responses</MenuItem>
          </Select>
        </FormControl>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" />,
            endAdornment: searchQuery && (
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        {/* Date Range */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <DatePicker
            label="From"
            value={dateRange.from}
            onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
            maxDate={dateRange.to || new Date()}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 120 }
              }
            }}
          />
          
          <DatePicker
            label="To"
            value={dateRange.to}
            onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
            minDate={dateRange.from}
            maxDate={new Date()}
            slotProps={{
              textField: {
                size: "small",
                sx: { width: 120 }
              }
            }}
          />
        </Box>

        {/* Clear Filters */}
        {hasActiveFilters() && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            variant="outlined"
            color="secondary"
          >
            Clear Filters
          </Button>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {filterType !== 'all' && (
              <Chip
                label={`Filter: ${filterType}`}
                size="small"
                onDelete={() => setFilterType('all')}
                variant="outlined"
              />
            )}
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                size="small"
                onDelete={handleClearSearch}
                variant="outlined"
              />
            )}
            {(dateRange.from || dateRange.to) && (
              <Chip
                label={`Date: ${dateRange.from ? dateRange.from.toLocaleDateString() : ''} - ${dateRange.to ? dateRange.to.toLocaleDateString() : ''}`}
                size="small"
                onDelete={() => setDateRange({ from: null, to: null })}
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default EmailFilters;