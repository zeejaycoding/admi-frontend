import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Typography 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Modal = ({
  open = false,
  onClose,
  title = '',
  children,
  actions = [],
  maxWidth = 'sm',
  fullWidth = true,
  sx = {},
  ...props
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          ...sx,
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            backgroundColor: '#003999',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="h6" component="div" fontWeight="600">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      
      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          {Array.isArray(actions) ? actions : actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
