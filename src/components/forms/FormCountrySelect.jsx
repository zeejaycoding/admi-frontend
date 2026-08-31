import React from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { COUNTRIES, sortWithPriority } from '../../constants/countries';

/**
 * Country selection component with searchable dropdown
 * Features: flag display, priority countries, virtual scrolling
 */
const FormCountrySelect = ({
  value,
  onChange,
  required = false,
  searchable = true,
  priorityCountries = [],
  placeholder = 'Select a country',
  className = '',
  error = false,
  helperText = '',
  disabled = false,
  label = '',
}) => {
  // Sort countries with priority countries at top
  const sortedCountries = React.useMemo(() => {
    return sortWithPriority(COUNTRIES, priorityCountries);
  }, [priorityCountries]);

  // Find selected country object (support both code and name for backward compatibility)
  const selectedCountry = React.useMemo(() => {
    if (!value) return null;
    // Try to find by code first (for old submissions)
    let country = COUNTRIES.find(c => c.code === value);
    // If not found, try by name (for new submissions)
    if (!country) {
      country = COUNTRIES.find(c => c.name === value);
    }
    return country || null;
  }, [value]);

  const handleChange = (event, newValue) => {
    // Save full country name instead of code for better readability in submissions
    onChange(newValue ? newValue.name : '');
  };

  return (
    <Autocomplete
      value={selectedCountry}
      onChange={handleChange}
      options={sortedCountries}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.code === value?.code}
      disabled={disabled}
      disableClearable={required}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          className={className}
          InputProps={{
            ...params.InputProps,
            startAdornment: selectedCountry ? (
              <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>
                {selectedCountry.flag}
              </Box>
            ) : null,
          }}
        />
      )}
      renderOption={(props, option) => {
        const isPriority = priorityCountries.includes(option.code);

        return (
          <Box
            component="li"
            {...props}
            key={option.code}
            sx={{
              display: 'flex !important',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: isPriority ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
              borderBottom: isPriority ? '1px solid rgba(99, 102, 241, 0.1)' : 'none',
              '&:hover': {
                backgroundColor: isPriority ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Typography component="span" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
              {option.flag}
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" component="span">
                {option.name}
              </Typography>
              {isPriority && (
                <Typography
                  variant="caption"
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: 'rgb(99, 102, 241)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                >
                  PRIORITY
                </Typography>
              )}
            </Box>
            <Typography
              variant="caption"
              component="span"
              sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
            >
              {option.phoneCode}
            </Typography>
          </Box>
        );
      }}
      ListboxProps={{
        style: { maxHeight: '300px' }, // Virtual scrolling kicks in
      }}
      sx={{
        '& .MuiAutocomplete-option': {
          padding: '8px 12px',
        },
      }}
    />
  );
};

FormCountrySelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  searchable: PropTypes.bool,
  priorityCountries: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

export default FormCountrySelect;
