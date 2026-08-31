import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  size = 'medium',
  startAdornment,
  endAdornment,
  multiline = false,
  rows = 1,
  maxRows,
  sx = {},
  ...props
}) => {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      size={size}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : undefined,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '& fieldset': {
            borderColor: '#d1d5db',
          },
          '&:hover fieldset': {
            borderColor: '#003999',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#003999',
          },
          '&.Mui-error fieldset': {
            borderColor: '#ef4444',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#6b7280',
          '&.Mui-focused': {
            color: '#003999',
          },
          '&.Mui-error': {
            color: '#ef4444',
          },
        },
        '& .MuiInputBase-input': {
          color: '#1f2937',
          '&::placeholder': {
            color: '#9ca3af',
            opacity: 1,
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default Input;
