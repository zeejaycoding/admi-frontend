import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import useRoleBase from '../../../hooks/useRoleBase';
import { Box, Typography, Tab, Tabs } from '@mui/material';
import { Save, X, Eye } from 'lucide-react';
import { Button } from '../../ui';
import { notify } from '../../../services/utils/authUtils';
import {
  createForm,
  updateForm,
  fetchFormById,
  clearError,
  clearSuccess,
} from '../../../store/slices/formSlice';

import FieldTypeSelector from '../../form-builder/FieldTypeSelector';
import FieldEditor from '../../form-builder/FieldEditor';
import FieldList from '../../form-builder/FieldList';
import FormSettings from '../../form-builder/FormSettings';
import FormPreview from '../../form-builder/FormPreview';
import {
  migrateFormSchema,
  buildFinalSchema,
  removeFieldFromRows,
  addFieldToRow,
  updateRowColumns,
} from '../../../utils/formSchemaUtils';
import { isMinistryForm } from '../../../constants/ministryForms';

const FormBuilder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rolePath } = useRoleBase();
  const { formId } = useParams();
  const { selectedForm, isLoading, error, success } = useSelector((state) => state.form);

  const [activeTab, setActiveTab] = useState(0);
  const [formSettings, setFormSettings] = useState({
    title: '',
    description: '',
    successMessage: 'Thank you for your submission!',
    requireAuthentication: false,
    isPublished: false,
  });
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Ministry forms are code-defined: only their settings are editable, not their fields.
  const ministryMode = !!formId && isMinistryForm(selectedForm);

  // Clear success/error state on mount to prevent stale notifications
  useEffect(() => {
    dispatch(clearSuccess());
    dispatch(clearError());
  }, [dispatch]);

  // Load form if editing
  useEffect(() => {
    if (formId) {
      dispatch(fetchFormById(formId));
    }
  }, [formId, dispatch]);

  // Populate form data when editing.
  // Load ALL settings (incl. codes + payment) so saving an edit never wipes them.
  useEffect(() => {
    if (selectedForm && formId) {
      setFormSettings({
        title: selectedForm.title || '',
        description: selectedForm.description || '',
        successMessage: selectedForm.successMessage || 'Thank you for your submission!',
        requireAuthentication: selectedForm.requireAuthentication || false,
        isPublished: selectedForm.isPublished || false,
        formCode: selectedForm.formCode || '',
        eventCode: selectedForm.eventCode || '',
        requiresPayment: selectedForm.requiresPayment || false,
        paymentAmount: selectedForm.paymentAmount ?? '',
        paymentCurrency: selectedForm.paymentCurrency || 'USD',
        paymentGateway: selectedForm.paymentGateway || 'STRIPE',
        paymentDescription: selectedForm.paymentDescription || '',
      });

      if (selectedForm.formSchema) {
        // Migrate V1 to V2 if needed
        const migratedSchema = migrateFormSchema(selectedForm.formSchema);
        setFields(migratedSchema.fields || []);
        setRows(migratedSchema.layout?.rows || []);
      }

      // Ministry forms are hardcoded — jump straight to Settings (the only editable part)
      if (isMinistryForm(selectedForm)) {
        setActiveTab(1);
      }
    }
  }, [selectedForm, formId]);

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      notify.success(formId ? 'Form updated successfully!' : 'Form created successfully!');
      dispatch(clearSuccess());
      navigate(rolePath('/admin/forms'));
    }
  }, [success, formId, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      notify.error(error.message || 'An error occurred');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddField = (newField, targetRowId = null) => {
    const fieldWithOrder = {
      ...newField,
      order: fields.length,
    };

    if (targetRowId) {
      // Add to existing row
      const targetRow = rows.find((r) => r.id === targetRowId);

      if (targetRow) {
        // Check if row has space
        const currentFieldCount = targetRow.fields?.length || 0;
        if (currentFieldCount >= targetRow.columns) {
          notify.error(`Row is full. Maximum ${targetRow.columns} field(s) allowed.`);
          return;
        }

        // Add field to existing row
        fieldWithOrder.rowId = targetRowId;
        setFields([...fields, fieldWithOrder]);
        setRows(rows.map((r) =>
          r.id === targetRowId
            ? { ...r, fields: [...(r.fields || []), fieldWithOrder.id] }
            : r
        ));
        return;
      }
    }

    // Create a new row for the field (default behavior)
    const newRow = {
      id: `row_${Date.now()}`,
      columns: 1,
      fields: [fieldWithOrder.id],
    };

    // Assign row to field
    fieldWithOrder.rowId = newRow.id;

    setFields([...fields, fieldWithOrder]);
    setRows([...rows, newRow]);
  };

  const handleEditField = (field) => {
    setSelectedField(field);
    setIsEditing(true);
  };

  const handleUpdateField = (updatedField) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    setSelectedField(null);
    setIsEditing(false);
  };

  const handleDeleteField = (fieldToDelete) => {
    setFields(fields.filter((f) => f.id !== fieldToDelete.id));
    // Remove field from rows (and delete empty rows)
    setRows(removeFieldFromRows(rows, fieldToDelete.id));
    if (selectedField?.id === fieldToDelete.id) {
      setSelectedField(null);
      setIsEditing(false);
    }
  };

  const handleReorderFields = (reorderedFields) => {
    setFields(reorderedFields);
  };

  const handleSelectField = (field) => {
    setSelectedField(field);
  };

  const handleCloseEditor = () => {
    setSelectedField(null);
    setIsEditing(false);
  };

  // Row management handlers
  const handleCreateRow = (columns = 1) => {
    const newRow = {
      id: `row_${Date.now()}`,
      columns,
      fields: [],
    };
    setRows([...rows, newRow]);
    return newRow.id;
  };

  const handleAssignFieldToRow = (fieldId, rowId, columns) => {
    if (rowId === 'new') {
      const newRowId = handleCreateRow(columns || 1);
      rowId = newRowId;
    }

    // Remove field from previous row
    const updatedRows = removeFieldFromRows(rows, fieldId);

    // Add field to new row
    const result = addFieldToRow(updatedRows, rowId, fieldId);

    if (result.success) {
      setRows(result.rows);
      // Update field with new rowId
      setFields(fields.map((f) => (f.id === fieldId ? { ...f, rowId } : f)));
    } else {
      notify.error(result.error);
    }
  };

  const handleChangeRowColumns = (rowId, newColumns) => {
    const result = updateRowColumns(rows, rowId, newColumns);

    if (result.success) {
      setRows(result.rows);
    } else {
      notify.error(result.error);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formSettings.title || formSettings.title.trim() === '') {
      notify.error('Form title is required');
      return;
    }

    if (!ministryMode && fields.length === 0) {
      notify.error('Please add at least one field to the form');
      return;
    }

    // Ministry forms keep their code-defined schema untouched; others rebuild from the editor.
    const formSchema = ministryMode
      ? selectedForm?.formSchema
      : buildFinalSchema(rows, fields);

    const formData = {
      ...formSettings,
      formSchema,
      formCode: formSettings.formCode?.trim() || null,
      eventCode: formSettings.eventCode?.trim() || null,
    };

    try {
      if (formId) {
        await dispatch(updateForm({ formId, updateData: formData })).unwrap();
      } else {
        await dispatch(createForm(formData)).unwrap();
      }
    } catch (error) {
      notify.error(error?.message || 'Failed to save form. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate(rolePath('/admin/forms'));
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight="600"
            color="#1f2937"
          >
            {formId ? 'Edit Form' : 'Create New Form'}
          </Typography>
          <Typography variant="body2" color="#6b7280">
            Build dynamic forms with drag-and-drop fields
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<X size={18} />}
            onClick={handleCancel}
            sx={{
              backgroundColor: '#6b7280',
              color: 'white',
              '&:hover': {
                backgroundColor: '#4b5563',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={18} />}
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              backgroundColor: '#003999',
              '&:hover': {
                backgroundColor: '#002d7a',
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Save Form'}
          </Button>
        </Box>
      </Box>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR: Field Type Selector - hidden for code-defined ministry forms */}
        {!ministryMode && (
          <Box
            sx={{
              width: 280,
              borderRight: '1px solid #e5e7eb',
              backgroundColor: 'white',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            <FieldTypeSelector onSelectType={handleAddField} />
          </Box>
        )}

        {/* RIGHT CONTENT: Tabs with Builder/Settings/Preview */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs (ministry forms only expose Settings — their fields are code-defined) */}
          <Box sx={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', flexShrink: 0 }}>
            {ministryMode ? (
              <Box sx={{ px: 3, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                  Form Settings
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  This is a built-in ministry form — its fields are fixed. You can edit its
                  settings (publish, share link, success message, payment) below.
                </Typography>
              </Box>
            ) : (
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
              >
                <Tab label="Builder" />
                <Tab label="Settings" />
                <Tab label="Preview" icon={<Eye size={16} />} iconPosition="end" />
              </Tabs>
            )}
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'hidden', backgroundColor: '#f9fafb' }}>
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', height: '100%' }}>
                <Box
                  sx={{
                    flex: isEditing ? 1 : 1,
                    borderRight: isEditing ? '1px solid #e5e7eb' : 'none',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                  }}
                >
                  <FieldList
                    fields={fields}
                    rows={rows}
                    onEdit={handleEditField}
                    onDelete={handleDeleteField}
                    onReorder={handleReorderFields}
                    onSelect={handleSelectField}
                    selectedFieldId={selectedField?.id}
                    onAddField={handleAddField}
                  />
                </Box>
                {isEditing && (
                  <Box sx={{ width: 350, overflowY: 'auto', backgroundColor: 'white' }}>
                    <FieldEditor
                      field={selectedField}
                      rows={rows}
                      fields={fields}
                      onUpdate={handleUpdateField}
                      onClose={handleCloseEditor}
                      onAssignToRow={handleAssignFieldToRow}
                      onChangeRowColumns={handleChangeRowColumns}
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ height: '100%', overflowY: 'auto', p: 3 }}>
                <FormSettings settings={formSettings} onChange={setFormSettings} />
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ height: '100%', overflowY: 'auto', p: 3 }}>
                <FormPreview settings={formSettings} fields={fields} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FormBuilder;
