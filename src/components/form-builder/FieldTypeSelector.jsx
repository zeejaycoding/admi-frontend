import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import {
  Type,
  Mail,
  Phone,
  Globe,
  Hash,
  ChevronDown,
  Circle,
  CheckSquare,
  Upload,
  AlignLeft,
  Calendar,
  Rows3,
  Calculator,
} from 'lucide-react';

const FIELD_TYPES = [
  {
    type: 'text',
    label: 'Text',
    icon: Type,
    description: 'Single line text input',
    color: '#3b82f6',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email address input',
    color: '#8b5cf6',
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: Phone,
    description: 'International phone',
    color: '#10b981',
  },
  {
    type: 'country',
    label: 'Country',
    icon: Globe,
    description: 'Country selector',
    color: '#0ea5e9',
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric input',
    color: '#f59e0b',
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: AlignLeft,
    description: 'Multi-line text input',
    color: '#6366f1',
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: ChevronDown,
    description: 'Select from options',
    color: '#ec4899',
  },
  {
    type: 'radio',
    label: 'Radio',
    icon: Circle,
    description: 'Single choice',
    color: '#14b8a6',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: CheckSquare,
    description: 'Multiple choices',
    color: '#f97316',
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    description: 'Upload files',
    color: '#06b6d4',
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    description: 'Date picker',
    color: '#f43f5e',
  },
  {
    type: 'repeater',
    label: 'Repeater',
    icon: Rows3,
    description: 'Repeating rows (e.g. expenses)',
    color: '#0d9488',
  },
  {
    type: 'computed',
    label: 'Computed',
    icon: Calculator,
    description: 'Auto-calculated (e.g. balance)',
    color: '#7c3aed',
  },
];

const FieldTypeSelector = ({ onSelectType }) => {
  const createNewField = (fieldType) => {
    // Create a new field with default properties
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType.type,
      label: `New ${fieldType.label} Field`,
      placeholder: '',
      required: false,
      order: 0,
      validation: {},
    };

    // Add type-specific defaults
    if (fieldType.type === 'dropdown' || fieldType.type === 'radio' || fieldType.type === 'checkbox') {
      newField.options = ['Option 1', 'Option 2', 'Option 3'];
    }

    if (fieldType.type === 'textarea') {
      newField.rows = 4;
    }

    if (fieldType.type === 'file') {
      // Accept common documents by default: images, PDF, Word, Excel
      newField.acceptedTypes = [
        'image/*',
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
      ];
      newField.maxSize = 10; // MB
      newField.allowMultiple = false;
    }

    if (fieldType.type === 'country') {
      newField.searchable = true;
      newField.priorityCountries = ['US', 'GB', 'NG', 'GH', 'ZA'];
    }

    if (fieldType.type === 'phone') {
      newField.defaultCountry = 'us';
      newField.preferredCountries = ['us', 'gb', 'ng'];
    }

    if (fieldType.type === 'date') {
      newField.minDate = '';
      newField.maxDate = '';
    }

    if (fieldType.type === 'repeater') {
      // A repeating group of sub-fields the user can add/remove rows of.
      const base = Date.now();
      newField.subFields = [
        { id: `sub_${base}_1`, type: 'text', label: 'Description' },
        { id: `sub_${base}_2`, type: 'number', label: 'Amount' },
      ];
      newField.minRows = 1;
      newField.addButtonLabel = 'Add Row';
    }

    if (fieldType.type === 'computed') {
      // Read-only value = sum(addFieldIds) - sum(subtractFieldIds) - sum(repeater number columns)
      newField.addFieldIds = [];
      newField.subtractFieldIds = [];
      newField.subtractRepeaters = [];
      newField.decimals = 2;
    }

    return newField;
  };

  const handleSelectType = (fieldType) => {
    const newField = createNewField(fieldType);
    onSelectType(newField);
  };

  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', JSON.stringify(fieldType));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: '#1f2937',
        }}
      >
        Add Field
      </Typography>

      <Grid container spacing={1.5}>
        {FIELD_TYPES.map((fieldType) => {
          const Icon = fieldType.icon;
          return (
            <Grid item xs={6} sm={4} key={fieldType.type}>
              <Paper
                elevation={0}
                draggable
                onClick={() => handleSelectType(fieldType)}
                onDragStart={(e) => handleDragStart(e, fieldType)}
                sx={{
                  p: 1.5,
                  cursor: 'grab',
                  border: '2px solid',
                  borderColor: '#e5e7eb',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: fieldType.color,
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      backgroundColor: `${fieldType.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Icon size={20} style={{ color: fieldType.color }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#374151',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    {fieldType.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9ca3af',
                      fontSize: '0.65rem',
                      textAlign: 'center',
                    }}
                  >
                    {fieldType.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FieldTypeSelector;
