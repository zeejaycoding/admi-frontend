import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Download } from 'lucide-react';
import Modal from '../../ui/Modal';
import { Button } from '../../ui';

const ExportModal = ({ open, onClose, onExport, isLoading = false, forms = null, defaultFormId = '' }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [useCurrentDate, setUseCurrentDate] = useState(true);
  const [format, setFormat] = useState('csv');
  const [selectedFormId, setSelectedFormId] = useState(defaultFormId);

  // Sync defaultFormId when modal opens
  useEffect(() => {
    if (open) setSelectedFormId(defaultFormId);
  }, [open, defaultFormId]);

  const selectedFormName = forms
    ? (forms.find((f) => String(f.id) === String(selectedFormId))?.title || '')
    : null;

  const canExport = !forms || !!selectedFormId;

  const handleExport = () => {
    const exportData = {
      formId: selectedFormId || null,
      dateFrom: dateFrom || null,
      dateTo: useCurrentDate ? new Date().toISOString().split('T')[0] : (dateTo || null),
      format,
    };
    onExport(exportData);
  };

  const handleClose = () => {
    setDateFrom('');
    setDateTo('');
    setUseCurrentDate(true);
    setFormat('csv');
    setSelectedFormId(defaultFormId);
    onClose();
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const actions = [
    <Button
      key="cancel"
      onClick={handleClose}
      disabled={isLoading}
      sx={{
        backgroundColor: '#6b7280',
        color: 'white',
        px: 3,
        py: 1,
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#4b5563',
        },
      }}
    >
      Cancel
    </Button>,
    <Button
      key="export"
      onClick={handleExport}
      disabled={isLoading || !canExport}
      startIcon={<Download size={18} />}
      sx={{
        backgroundColor: '#003999',
        color: 'white',
        px: 3,
        py: 1,
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#002d7a',
        },
        '&:disabled': {
          backgroundColor: '#9ca3af',
          color: '#6b7280',
        },
      }}
    >
      {isLoading ? 'Exporting...' : 'Download'}
    </Button>,
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Export Form Submissions"
      actions={actions}
      maxWidth="sm"
    >
      <Box sx={{ py: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Select date range and format to export form submissions
        </Typography>

        <Grid container spacing={3}>
          {/* Form selector — only shown when forms list is provided (SubmissionsOverview context) */}
          {forms && (
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 600 }}>Select Form *</InputLabel>
                <Select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  label="Select Form *"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    <em>Choose a form to export</em>
                  </MenuItem>
                  {forms.map((f) => (
                    <MenuItem key={f.id} value={String(f.id)}>
                      {f.title}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Only submissions for the selected form will be exported
                </Typography>
              </FormControl>
            </Grid>
          )}

          {/* Date From */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#1f2937',
                  fontSize: '0.875rem',
                }}
              >
                Date From
              </FormLabel>
              <TextField
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                fullWidth
                InputProps={{
                  inputProps: {
                    max: getTodayDate(),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                size="small"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Leave empty to include all submissions from the beginning
              </Typography>
            </FormControl>
          </Grid>

          {/* Date To */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#1f2937',
                  fontSize: '0.875rem',
                }}
              >
                Date To
              </FormLabel>
              <TextField
                type="date"
                value={useCurrentDate ? getTodayDate() : dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setUseCurrentDate(false);
                }}
                disabled={useCurrentDate}
                fullWidth
                InputProps={{
                  inputProps: {
                    max: getTodayDate(),
                    min: dateFrom || undefined,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                size="small"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useCurrentDate}
                    onChange={(e) => setUseCurrentDate(e.target.checked)}
                    sx={{
                      color: '#003999',
                      '&.Mui-checked': {
                        color: '#003999',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Use current date (today)
                  </Typography>
                }
                sx={{ mt: 1 }}
              />
            </FormControl>
          </Grid>

          {/* Export Format */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: '#1f2937',
                  fontSize: '0.875rem',
                }}
              >
                Export Format
              </FormLabel>
              <RadioGroup
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <FormControlLabel
                  value="csv"
                  control={
                    <Radio
                      sx={{
                        color: '#003999',
                        '&.Mui-checked': {
                          color: '#003999',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        CSV (Comma-Separated Values)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Compatible with Excel, Google Sheets, and most spreadsheet applications
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="excel"
                  control={
                    <Radio
                      sx={{
                        color: '#003999',
                        '&.Mui-checked': {
                          color: '#003999',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Excel (.xlsx)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Microsoft Excel format with enhanced formatting
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Summary */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#e6ecff',
                borderRadius: 2,
                border: '1px solid #b3c5ff',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="#003999"
                sx={{ mb: 1 }}
              >
                Export Summary
              </Typography>
              {forms && (
                <Typography variant="caption" color="text.secondary" component="div">
                  • Form: {selectedFormName || <em>Not selected</em>}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" component="div">
                • Date Range: {dateFrom || 'Beginning'} to {useCurrentDate ? 'Today' : (dateTo || 'Today')}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • Format: {format === 'csv' ? 'CSV' : 'Excel (.xlsx)'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ExportModal;
