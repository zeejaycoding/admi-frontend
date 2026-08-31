import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui';
import { getAvailableRows } from '../../utils/formSchemaUtils';

const FieldEditor = ({
  field,
  rows = [],
  fields = [],
  onUpdate,
  onClose,
  onAssignToRow,
  onChangeRowColumns,
}) => {
  const [editedField, setEditedField] = useState(field || {});
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (field) {
      setEditedField(field);
    }
  }, [field]);

  const handleChange = (property, value) => {
    const updated = { ...editedField, [property]: value };
    setEditedField(updated);
  };

  const handleValidationChange = (property, value) => {
    const updated = {
      ...editedField,
      validation: {
        ...editedField.validation,
        [property]: value,
      },
    };
    setEditedField(updated);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const options = editedField.options || [];
      handleChange('options', [...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    const options = [...(editedField.options || [])];
    options.splice(index, 1);
    handleChange('options', options);
  };

  // Repeater sub-field management
  const handleAddSubField = () => {
    const subFields = editedField.subFields || [];
    handleChange('subFields', [
      ...subFields,
      { id: `sub_${Date.now()}`, type: 'text', label: `Column ${subFields.length + 1}` },
    ]);
  };

  const handleUpdateSubField = (index, prop, value) => {
    const subFields = [...(editedField.subFields || [])];
    subFields[index] = { ...subFields[index], [prop]: value };
    handleChange('subFields', subFields);
  };

  const handleRemoveSubField = (index) => {
    const subFields = [...(editedField.subFields || [])];
    subFields.splice(index, 1);
    handleChange('subFields', subFields);
  };

  const handleSave = () => {
    onUpdate(editedField);
    onClose();
  };

  const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(editedField.type);

  return (
    <Box
      sx={{
        width: 350,
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
          Edit Field
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {/* Field Type Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={editedField.type}
            size="small"
            sx={{
              textTransform: 'capitalize',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Basic Properties */}
        <TextField
          fullWidth
          label="Field Label"
          value={editedField.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        <TextField
          fullWidth
          label="Placeholder"
          value={editedField.placeholder || ''}
          onChange={(e) => handleChange('placeholder', e.target.value)}
          sx={{ mb: 2 }}
          size="small"
        />

        <FormControlLabel
          control={
            <Switch
              checked={editedField.required || false}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
          }
          label="Required"
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Layout Configuration */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Layout Configuration
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Row Assignment</InputLabel>
          <Select
            value={editedField.rowId || 'new'}
            onChange={(e) => {
              const newRowId = e.target.value;
              if (onAssignToRow) {
                const columns = newRowId === 'new' ? 1 : undefined;
                onAssignToRow(editedField.id, newRowId, columns);
              }
            }}
            size="small"
          >
            <MenuItem value="new">New Row (Full Width)</MenuItem>
            {getAvailableRows(rows).map((row, index) => {
              const currentFieldCount = (row.fields || []).length;
              const isCurrentRow = row.id === editedField.rowId;
              const isFull = currentFieldCount >= row.columns && !isCurrentRow;

              return (
                <MenuItem key={row.id} value={row.id} disabled={isFull}>
                  Row {index + 1} - {row.columns} column{row.columns > 1 ? 's' : ''} ({currentFieldCount}
                  /{row.columns} {isFull ? '- Full' : 'filled'})
                </MenuItem>
              );
            })}
            {rows
              .filter((row) => !getAvailableRows(rows).find((ar) => ar.id === row.id))
              .map((row, index) => {
                const isCurrentRow = row.id === editedField.rowId;
                if (!isCurrentRow) return null;

                return (
                  <MenuItem key={row.id} value={row.id}>
                    Row {index + 1} - {row.columns} column{row.columns > 1 ? 's' : ''} (current row)
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>

        {editedField.rowId && editedField.rowId !== 'new' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Columns in Row</InputLabel>
            <Select
              value={rows.find((r) => r.id === editedField.rowId)?.columns || 1}
              onChange={(e) => {
                if (onChangeRowColumns) {
                  onChangeRowColumns(editedField.rowId, parseInt(e.target.value));
                }
              }}
              size="small"
              disabled={
                (rows.find((r) => r.id === editedField.rowId)?.fields || []).length > 1
              }
            >
              <MenuItem value={1}>1 Column (Full Width)</MenuItem>
              <MenuItem value={2}>2 Columns (50% / 50%)</MenuItem>
              <MenuItem value={3}>3 Columns (33% / 33% / 33%)</MenuItem>
            </Select>
            {(rows.find((r) => r.id === editedField.rowId)?.fields || []).length > 1 && (
              <FormHelperText>
                Cannot change columns while multiple fields are assigned
              </FormHelperText>
            )}
          </FormControl>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Type-Specific Properties */}
        {editedField.type === 'text' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Validation
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="Min Length"
              value={editedField.validation?.minLength || ''}
              onChange={(e) => handleValidationChange('minLength', parseInt(e.target.value) || undefined)}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              type="number"
              label="Max Length"
              value={editedField.validation?.maxLength || ''}
              onChange={(e) => handleValidationChange('maxLength', parseInt(e.target.value) || undefined)}
              sx={{ mb: 2 }}
              size="small"
            />
          </>
        )}

        {editedField.type === 'number' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Validation
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="Minimum Value"
              value={editedField.validation?.min || ''}
              onChange={(e) => handleValidationChange('min', parseInt(e.target.value) || undefined)}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              type="number"
              label="Maximum Value"
              value={editedField.validation?.max || ''}
              onChange={(e) => handleValidationChange('max', parseInt(e.target.value) || undefined)}
              sx={{ mb: 2 }}
              size="small"
            />
          </>
        )}

        {editedField.type === 'textarea' && (
          <TextField
            fullWidth
            type="number"
            label="Rows"
            value={editedField.rows || 4}
            onChange={(e) => handleChange('rows', parseInt(e.target.value) || 4)}
            sx={{ mb: 2 }}
            size="small"
          />
        )}

        {editedField.type === 'file' && (
          <>
            <TextField
              fullWidth
              label="Accepted File Types"
              value={(editedField.acceptedTypes || []).join(', ')}
              onChange={(e) =>
                handleChange(
                  'acceptedTypes',
                  e.target.value.split(',').map((t) => t.trim())
                )
              }
              helperText="Comma separated, e.g: image/*, .pdf, .docx"
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              type="number"
              label="Max File Size (MB)"
              value={editedField.maxSize || 5}
              onChange={(e) => handleChange('maxSize', parseInt(e.target.value) || 5)}
              sx={{ mb: 2 }}
              size="small"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!editedField.allowMultiple}
                  onChange={(e) => handleChange('allowMultiple', e.target.checked)}
                />
              }
              label="Allow multiple files"
              sx={{ mb: 1 }}
            />
          </>
        )}

        {/* Repeater Field Configuration */}
        {editedField.type === 'repeater' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Row Columns
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1.5 }}>
              Define the fields that make up each row. Users can add or remove rows when filling the form.
            </Typography>

            {(editedField.subFields || []).map((sub, index) => (
              <Box key={sub.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="Label"
                  size="small"
                  value={sub.label || ''}
                  onChange={(e) => handleUpdateSubField(index, 'label', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={sub.type || 'text'}
                    onChange={(e) => handleUpdateSubField(index, 'type', e.target.value)}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSubField(index)}
                  disabled={(editedField.subFields || []).length <= 1}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={handleAddSubField}
              startIcon={<Plus size={14} />}
              sx={{ mt: 0.5, mb: 2 }}
            >
              Add Column
            </Button>

            <TextField
              fullWidth
              type="number"
              label="Minimum Rows"
              value={editedField.minRows ?? 1}
              onChange={(e) => handleChange('minRows', Math.max(0, parseInt(e.target.value) || 0))}
              helperText="Rows shown by default (and the minimum required)"
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              label="Add Button Label"
              value={editedField.addButtonLabel || 'Add Row'}
              onChange={(e) => handleChange('addButtonLabel', e.target.value)}
              sx={{ mb: 2 }}
              size="small"
            />
          </>
        )}

        {/* Computed Field Configuration */}
        {editedField.type === 'computed' && (() => {
          const numberFields = (fields || []).filter((f) => f.type === 'number' && f.id !== editedField.id);
          const repeaterFields = (fields || []).filter((f) => f.type === 'repeater');
          const labelOf = (id) => (fields.find((f) => f.id === id)?.label || id);
          return (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Balance Calculation
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1.5 }}>
                Auto-calculated: add the income fields, then subtract other fields and the totals of expense repeaters.
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Add (income)</InputLabel>
                <Select
                  multiple
                  label="Add (income)"
                  value={editedField.addFieldIds || []}
                  onChange={(e) => handleChange('addFieldIds', e.target.value)}
                  renderValue={(sel) => sel.map(labelOf).join(', ')}
                >
                  {numberFields.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Subtract (fields)</InputLabel>
                <Select
                  multiple
                  label="Subtract (fields)"
                  value={editedField.subtractFieldIds || []}
                  onChange={(e) => handleChange('subtractFieldIds', e.target.value)}
                  renderValue={(sel) => sel.map(labelOf).join(', ')}
                >
                  {numberFields.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Subtract expense totals</InputLabel>
                <Select
                  multiple
                  label="Subtract expense totals"
                  value={editedField.subtractRepeaters || []}
                  onChange={(e) => handleChange('subtractRepeaters', e.target.value)}
                  renderValue={(sel) => sel.map(labelOf).join(', ')}
                >
                  {repeaterFields.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          );
        })()}

        {/* Country Field Configuration */}
        {editedField.type === 'country' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Country Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={editedField.searchable !== false}
                  onChange={(e) => handleChange('searchable', e.target.checked)}
                />
              }
              label="Enable Search"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Priority Countries"
              value={(editedField.priorityCountries || []).join(', ')}
              onChange={(e) =>
                handleChange(
                  'priorityCountries',
                  e.target.value.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
                )
              }
              helperText="ISO codes (e.g., US, GB, NG) shown at top"
              sx={{ mb: 2 }}
              size="small"
            />
          </>
        )}

        {/* Phone Field Configuration */}
        {editedField.type === 'phone' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Phone Settings
            </Typography>
            <TextField
              fullWidth
              label="Default Country"
              value={editedField.defaultCountry || 'us'}
              onChange={(e) => handleChange('defaultCountry', e.target.value.toLowerCase())}
              helperText="ISO code (e.g., us, gb, ng)"
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              label="Preferred Countries"
              value={(editedField.preferredCountries || []).join(', ')}
              onChange={(e) =>
                handleChange(
                  'preferredCountries',
                  e.target.value.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean)
                )
              }
              helperText="ISO codes shown at top of list"
              sx={{ mb: 2 }}
              size="small"
            />
          </>
        )}

        {editedField.type === 'date' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Date Settings
            </Typography>
            <TextField
              fullWidth
              type="date"
              label="Minimum Date"
              value={editedField.minDate || ''}
              onChange={(e) => handleChange('minDate', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              fullWidth
              type="date"
              label="Maximum Date"
              value={editedField.maxDate || ''}
              onChange={(e) => handleChange('maxDate', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ mb: 2 }}
              size="small"
            />
          </>
        )}

        {/* Options for dropdown, radio, checkbox */}
        {needsOptions && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Options
            </Typography>

            {/* Existing Options */}
            <Box sx={{ mb: 2 }}>
              {(editedField.options || []).map((option, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 1,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{option}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveOption(index)}
                    sx={{ color: '#dc2626' }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Paper>
              ))}
            </Box>

            {/* Add New Option */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="New option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddOption();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddOption}
                size="small"
                sx={{
                  minWidth: 40,
                  backgroundColor: '#059669',
                  '&:hover': {
                    backgroundColor: '#047857',
                  },
                }}
              >
                <Plus size={18} />
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          fullWidth
          sx={{
            borderColor: '#d1d5db',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f9fafb',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          fullWidth
          sx={{
            backgroundColor: '#003999',
            '&:hover': {
              backgroundColor: '#002d7a',
            },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default FieldEditor;
