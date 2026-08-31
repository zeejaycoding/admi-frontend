import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';

const Card = ({
  children,
  title,
  subtitle,
  action,
  actions = [],
  elevation = 1,
  sx = {},
  ...props
}) => {
  return (
    <MuiCard
      elevation={elevation}
      sx={{
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle || action) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={action}
          sx={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            '& .MuiCardHeader-title': {
              color: '#1f2937',
              fontWeight: 600,
              fontSize: '1.125rem',
            },
            '& .MuiCardHeader-subheader': {
              color: '#6b7280',
              fontSize: '0.875rem',
            },
          }}
        />
      )}
      
      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
      
      {actions.length > 0 && (
        <CardActions sx={{ p: 3, pt: 0, gap: 1, justifyContent: 'flex-end' }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card;
