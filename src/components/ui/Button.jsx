import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  sx = {},
  ...props
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return {
          backgroundColor: '#003999',
          color: 'white',
          '&:hover': {
            backgroundColor: '#2A004E',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        };
      case 'secondary':
        return {
          backgroundColor: '#FFD65A',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#fbbf24',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        };
      case 'success':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          '&:hover': {
            backgroundColor: '#059669',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          '&:hover': {
            backgroundColor: '#dc2626',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          color: 'white',
          '&:hover': {
            backgroundColor: '#d97706',
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          },
        };
      default:
        return {};
    }
  };

  const getVariantStyles = () => {
    if (variant === 'outlined') {
      return {
        borderColor: '#003999',
        color: '#003999',
        '&:hover': {
          backgroundColor: '#e6ecff',
          borderColor: '#2A004E',
        },
        '&:disabled': {
          borderColor: '#e5e7eb',
          color: '#9ca3af',
        },
      };
    }
    if (variant === 'text') {
      return {
        color: '#003999',
        '&:hover': {
          backgroundColor: '#e6ecff',
        },
        '&:disabled': {
          color: '#9ca3af',
        },
      };
    }
    return {};
  };

  return (
    <MuiButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: variant === 'contained' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        ...getColorStyles(),
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
