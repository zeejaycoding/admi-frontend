import React, { useMemo } from 'react';
import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import {
  GripVertical,
  Edit,
  Trash2,
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
  Star,
} from 'lucide-react';
import { groupFieldsByRow } from '../../utils/formSchemaUtils';

const FIELD_ICONS = {
  text: Type,
  email: Mail,
  phone: Phone,
  country: Globe,
  number: Hash,
  textarea: AlignLeft,
  dropdown: ChevronDown,
  radio: Circle,
  checkbox: CheckSquare,
  file: Upload,
  date: Calendar,
};

const FieldList = ({
  fields,
  rows = [],
  onEdit,
  onDelete,
  onReorder,
  onSelect,
  selectedFieldId,
  onAddField,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [dragOverSlot, setDragOverSlot] = React.useState(null); // Track which slot is being dragged over

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);

    // Update order property
    const updatedFields = newFields.map((field, idx) => ({
      ...field,
      order: idx,
    }));

    onReorder(updatedFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle drop from FieldTypeSelector
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const fieldTypeData = e.dataTransfer.getData('fieldType');
    if (fieldTypeData) {
      const fieldType = JSON.parse(fieldTypeData);

      // Create a new field
      const newField = {
        id: `field_${Date.now()}`,
        type: fieldType.type,
        label: `New ${fieldType.label} Field`,
        placeholder: '',
        required: false,
        order: fields.length,
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
        newField.acceptedTypes = ['image/*', 'application/pdf'];
        newField.maxSize = 5;
      }

      if (fieldType.type === 'date') {
        newField.minDate = '';
        newField.maxDate = '';
      }

      onAddField(newField);
    }
  };

  // Handle drop on empty slot
  const handleSlotDrop = (e, rowId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);

    const fieldTypeData = e.dataTransfer.getData('fieldType');
    if (fieldTypeData) {
      const fieldType = JSON.parse(fieldTypeData);

      // Create a new field
      const newField = {
        id: `field_${Date.now()}`,
        type: fieldType.type,
        label: `New ${fieldType.label} Field`,
        placeholder: '',
        required: false,
        order: fields.length,
        validation: {},
        rowId: rowId, // Assign to specific row
      };

      // Add type-specific defaults
      if (fieldType.type === 'dropdown' || fieldType.type === 'radio' || fieldType.type === 'checkbox') {
        newField.options = ['Option 1', 'Option 2', 'Option 3'];
      }

      if (fieldType.type === 'textarea') {
        newField.rows = 4;
      }

      if (fieldType.type === 'file') {
        newField.acceptedTypes = ['image/*', 'application/pdf'];
        newField.maxSize = 5; // MB
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

      onAddField(newField, rowId);

    }
  };

  // Handle drag over empty slot
  const handleSlotDragOver = (e, slotKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(slotKey);
  };

  // Handle drag leave empty slot
  const handleSlotDragLeave = (e, slotKey) => {
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setDragOverSlot(null);
    }
  };

  const handleDragOverContainer = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only set isDragOver to false if we're leaving the container entirely
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  // Group fields by rows
  const rowsWithFields = useMemo(() => {
    return groupFieldsByRow(rows, fields);
  }, [rows, fields]);

  // Render individual field card
  const renderFieldCard = (field, index, inRow = false) => {
    const Icon = FIELD_ICONS[field.type] || Type;
    const isSelected = field.id === selectedFieldId;

    return (
      <Paper
              key={field.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelect(field)}
              elevation={isSelected ? 3 : 0}
              sx={{
                p: inRow ? 1.5 : 2,
                display: 'flex',
                alignItems: 'center',
                gap: inRow ? 1 : 2,
                cursor: 'move',
                border: '2px solid',
                borderColor: isSelected ? '#003999' : '#e5e7eb',
                borderRadius: 2,
                backgroundColor: isSelected ? '#e6ecff' : 'white',
                transition: 'all 0.2s',
                height: '100%',
                '&:hover': {
                  borderColor: '#003999',
                  boxShadow: 2,
                },
              }}
            >
              {/* Drag Handle */}
              <GripVertical size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />

              {/* Field Icon */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} style={{ color: '#1e40af' }} />
              </Box>

              {/* Field Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#1f2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {field.label}
                  </Typography>
                  {field.required && (
                    <Star size={12} style={{ color: '#dc2626', fill: '#dc2626' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={field.type}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      textTransform: 'capitalize',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  />
                  {field.placeholder && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#9ca3af',
                        fontSize: '0.7rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {field.placeholder}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Actions */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton
                  size="small"
                  onClick={() => onEdit(field)}
                  sx={{
                    color: '#2563eb',
                    '&:hover': {
                      backgroundColor: '#dbeafe',
                    },
                  }}
                >
                  <Edit size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(field)}
                  sx={{
                    color: '#dc2626',
                    '&:hover': {
                      backgroundColor: '#fee2e2',
                    },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            </Paper>
          );
  };

  if (!fields || fields.length === 0) {
    return (
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOverContainer}
        onDragLeave={handleDragLeave}
        sx={{
          p: 4,
          textAlign: 'center',
          color: '#9ca3af',
          border: '2px dashed',
          borderColor: isDragOver ? '#003999' : '#e5e7eb',
          borderRadius: 2,
          backgroundColor: isDragOver ? '#e6ecff' : 'transparent',
          transition: 'all 0.2s',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2">
          {isDragOver
            ? 'Drop field here to add'
            : 'No fields yet. Drag fields from the left panel or click to add.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ p: 2 }}
      onDrop={handleDrop}
      onDragOver={handleDragOverContainer}
      onDragLeave={handleDragLeave}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: '#1f2937',
        }}
      >
        Form Fields ({fields.length})
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: isDragOver ? '2px dashed #003999' : 'none',
          borderRadius: 2,
          padding: isDragOver ? 2 : 0,
          backgroundColor: isDragOver ? '#e6ecff' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        {rowsWithFields.map((row, rowIndex) => (
          <Paper key={row.id} sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
            {/* Row Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.75rem' }}>
                Row {row.displayOrder} - {row.columns} Column{row.columns > 1 ? 's' : ''}
              </Typography>
              <Chip
                label={`${row.fields.length}/${row.columns} filled`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  backgroundColor: row.fields.length === row.columns ? '#d1fae5' : '#f3f4f6',
                  color: row.fields.length === row.columns ? '#065f46' : '#6b7280',
                  fontWeight: 600,
                }}
              />
            </Box>

            {/* Fields in Row (Grid Layout) */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${row.columns}, 1fr)`,
                gap: 1.5,
              }}
            >
              {row.fields.map((field, fieldIndex) => (
                <Box key={field.id}>{renderFieldCard(field, fieldIndex, true)}</Box>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: row.columns - row.fields.length }).map((_, idx) => {
                const slotKey = `${row.id}-slot-${idx}`;
                const isSlotDragOver = dragOverSlot === slotKey;

                return (
                  <Box
                    key={`empty-${idx}`}
                    onDrop={(e) => handleSlotDrop(e, row.id)}
                    onDragOver={(e) => handleSlotDragOver(e, slotKey)}
                    onDragLeave={(e) => handleSlotDragLeave(e, slotKey)}
                    sx={{
                      border: '2px dashed',
                      borderColor: isSlotDragOver ? '#003999' : '#d1d5db',
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'center',
                      color: isSlotDragOver ? '#003999' : '#9ca3af',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '80px',
                      backgroundColor: isSlotDragOver ? '#e6ecff' : '#fafafa',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    {isSlotDragOver ? 'Drop field here' : 'Empty Slot'}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FieldList;
