import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  Paper,
  Button as MuiButton,
  FormGroup,
} from '@mui/material';
import { Star } from 'lucide-react';
import { groupFieldsByRow } from '../../utils/formSchemaUtils';

const FormPreview = ({ settings, fields, rows = [] }) => {
  const sortedFields = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Group fields by rows for V2 rendering
  const rowsWithFields = useMemo(() => {
    return groupFieldsByRow(rows, fields);
  }, [rows, fields]);

  const hasRows = rows && rows.length > 0;

  const renderField = (field) => {
    const isRequired = field.required;

    const label = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {field.label}
        </Typography>
        {isRequired && <Star size={10} style={{ color: '#dc2626', fill: '#dc2626' }} />}
      </Box>
    );

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <TextField
              type={field.type}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              size="small"
              disabled
            />
          </FormControl>
        );

      case 'phone':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Select
                size="small"
                disabled
                defaultValue={field.defaultCountry || 'us'}
                sx={{ width: 120 }}
              >
                <MenuItem value="us">🇺🇸 +1</MenuItem>
                <MenuItem value="gb">🇬🇧 +44</MenuItem>
                <MenuItem value="ng">🇳🇬 +234</MenuItem>
              </Select>
              <TextField
                size="small"
                disabled
                placeholder={field.placeholder || 'Enter phone number'}
                sx={{ flex: 1 }}
              />
            </Box>
          </FormControl>
        );

      case 'country':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <Select
              size="small"
              disabled
              displayEmpty
              defaultValue=""
            >
              <MenuItem value="" disabled>
                {field.placeholder || 'Select country'}
              </MenuItem>
              <MenuItem value="US">🇺🇸 United States</MenuItem>
              <MenuItem value="GB">🇬🇧 United Kingdom</MenuItem>
              <MenuItem value="NG">🇳🇬 Nigeria</MenuItem>
              <MenuItem value="GH">🇬🇭 Ghana</MenuItem>
              <MenuItem value="ZA">🇿🇦 South Africa</MenuItem>
            </Select>
          </FormControl>
        );

      case 'number':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <TextField
              type="number"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              size="small"
              disabled
            />
          </FormControl>
        );

      case 'textarea':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <TextField
              multiline
              rows={field.rows || 4}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              size="small"
              disabled
            />
          </FormControl>
        );

      case 'dropdown':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <Select
              size="small"
              disabled
              displayEmpty
              defaultValue=""
            >
              <MenuItem value="" disabled>
                {field.placeholder || `Select ${field.label.toLowerCase()}`}
              </MenuItem>
              {(field.options || []).map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl key={field.id} sx={{ mb: 2 }}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup>
              {(field.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio disabled />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl key={field.id} sx={{ mb: 2 }}>
            <FormLabel>{field.label}</FormLabel>
            <FormGroup>
              {(field.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox disabled />}
                  label={option}
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 'file':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <MuiButton
              variant="outlined"
              component="span"
              disabled
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: '#6b7280',
                borderColor: '#d1d5db',
              }}
            >
              Choose File
            </MuiButton>
            {field.acceptedTypes && (
              <Typography variant="caption" sx={{ mt: 0.5, color: '#6b7280' }}>
                Accepted: {field.acceptedTypes.join(', ')} • Max: {field.maxSize || 5}MB
              </Typography>
            )}
          </FormControl>
        );

      case 'date':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <TextField
              type="date"
              size="small"
              disabled
              slotProps={{
                input: { min: field.minDate || undefined, max: field.maxDate || undefined },
                inputLabel: { shrink: true },
              }}
            />
          </FormControl>
        );

      case 'repeater':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 1.5, backgroundColor: '#f9fafb' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(field.subFields || []).map((sub) => (
                  <Box key={sub.id} sx={{ flex: 1, minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                      {sub.label}
                    </Typography>
                    <TextField
                      type={sub.type === 'number' ? 'number' : sub.type === 'date' ? 'date' : 'text'}
                      size="small"
                      fullWidth
                      disabled
                    />
                  </Box>
                ))}
              </Box>
              <MuiButton size="small" disabled sx={{ mt: 1 }}>
                + {field.addButtonLabel || 'Add Row'}
              </MuiButton>
            </Box>
          </FormControl>
        );

      case 'computed':
        return (
          <FormControl fullWidth key={field.id} sx={{ mb: 2 }}>
            {label}
            <TextField
              value="0.00"
              size="small"
              disabled
              helperText="Auto-calculated when the form is filled"
            />
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        backgroundColor: '#fafafa',
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
        Preview
      </Typography>
      <Typography variant="caption" sx={{ color: '#6b7280', mb: 3, display: 'block' }}>
        This is how your form will appear to users
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        {/* Form Title and Description */}
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {settings.title || 'Untitled Form'}
        </Typography>
        {settings.description && (
          <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
            {settings.description}
          </Typography>
        )}

        {/* Fields */}
        {sortedFields.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              color: '#9ca3af',
              border: '2px dashed #d1d5db',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2">
              No fields added yet. Add fields to see the preview.
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Render fields - V2 row-based or V1 sequential */}
            {hasRows ? (
              // V2: Row-based layout with grid
              <>
                {rowsWithFields.map((row) => {
                  const gridColumns = row.columns === 1 ? 1 : row.columns === 2 ? 2 : 3;

                  return (
                    <Box
                      key={row.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      {row.fields.map((field) => (
                        <Box key={field.id}>
                          {renderField(field)}
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </>
            ) : (
              // V1: Sequential rendering (backward compatibility)
              <>{sortedFields.map(renderField)}</>
            )}

            {/* Submit Button */}
            <MuiButton
              variant="contained"
              fullWidth
              disabled
              sx={{
                mt: 2,
                backgroundColor: '#003999',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#002d7a',
                },
              }}
            >
              Submit
            </MuiButton>

            {/* Success Message Preview */}
            {settings.successMessage && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: '#d1fae5',
                  border: '1px solid #059669',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Success Message:
                </Typography>
                <Typography variant="body2" sx={{ color: '#047857' }}>
                  {settings.successMessage}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Paper>
    </Paper>
  );
};

export default FormPreview;
