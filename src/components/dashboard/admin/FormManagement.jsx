import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  BarChart3,
  Settings,
  CreditCard,
  Link,
} from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';
import MinistryFormPaymentModal from './MinistryFormPaymentModal';
import AdminListLayout from './shared/AdminListLayout';
import {
  fetchAllForms,
  deleteForm,
  publishForm,
  clearError,
  clearSuccess,
} from '../../../store/slices/formSlice';
import { notify } from '../../../services/utils/authUtils';
import { isMinistryForm } from '../../../constants/ministryForms';

// Only these 2 get the Payment Settings button in admin
const PAID_MINISTRY_FORM_CODES = [
  'POWER_BIBLE_SCHOOL',
  'ABEL_DAMINA_MENTORING_ACADEMY',
];

const FormManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forms: formsFromState, isLoading, error } = useSelector((state) => state.form);
  const { canManage } = usePermissions();

  const forms = Array.isArray(formsFromState) ? formsFromState : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalForm, setPaymentModalForm] = useState(null);

  // Calculate statistics from actual form data
  const computedStats = React.useMemo(() => {
    if (!forms || !Array.isArray(forms) || forms.length === 0) {
      return {
        totalForms: 0,
        publishedForms: 0,
        totalSubmissions: 0,
        activeForms: 0,
      };
    }

    const publishedForms = forms.filter((form) => form.isPublished && form.isActive);
    const activeForms = forms.filter((form) => form.isActive);
    const totalSubmissions = forms.reduce((sum, form) => sum + (form.submissionCount || 0), 0);

    return {
      totalForms: forms.length,
      publishedForms: publishedForms.length,
      totalSubmissions,
      activeForms: activeForms.length,
    };
  }, [forms]);

  // Fetch forms on component mount
  useEffect(() => {
    dispatch(fetchAllForms({}));
  }, [dispatch]);

  // Filter forms based on search term
  useEffect(() => {
    if (!forms || !Array.isArray(forms)) {
      setFilteredForms([]);
      return;
    }

    if (searchTerm.trim()) {
      const filtered = forms.filter(
        (form) =>
          form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredForms(filtered);
      setPage(0);
    } else {
      setFilteredForms(forms);
    }
  }, [forms, searchTerm]);

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    dispatch(clearError());
    dispatch(clearSuccess());
    dispatch(fetchAllForms({}));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleCreateForm = () => {
    // Clear success/error state before navigating to prevent stale notifications
    dispatch(clearSuccess());
    dispatch(clearError());
    navigate('/admin/forms/builder');
  };

  const handleEditForm = (form) => {
    // Clear success/error state before navigating to prevent stale notifications
    dispatch(clearSuccess());
    dispatch(clearError());
    navigate(`/admin/forms/builder/${form.id}`);
  };

  const handleViewSubmissions = (form) => {
    navigate(`/admin/forms/${form.id}/submissions`);
  };

  const handleViewPayments = (form) => {
    navigate(`/admin/forms/${form.id}/payments`);
  };

  const handleTogglePublish = async (form) => {
    try {
      const newPublishStatus = !form.isPublished;
      await dispatch(
        publishForm({ formId: form.id, publish: newPublishStatus })
      ).unwrap();
      dispatch(fetchAllForms({}));
      notify.success(
        `Form ${newPublishStatus ? 'published' : 'unpublished'} successfully!`
      );
    } catch (error) {
      notify.error('Failed to update form status. Please try again.');
    }
  };

  const handleDeleteForm = (form) => {
    setFormToDelete(form);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;

    try {
      await dispatch(deleteForm(formToDelete.id)).unwrap();
      dispatch(fetchAllForms({}));
      setDeleteModalOpen(false);
      setFormToDelete(null);
      notify.success(`Form "${formToDelete.title}" deleted successfully!`);
    } catch (error) {
      notify.error('Failed to delete form. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const handlePaymentSettings = (form) => {
    setPaymentModalForm(form);
    setPaymentModalOpen(true);
  };

  const hasPaidMinistrySettings = (form) => PAID_MINISTRY_FORM_CODES.includes(form.eventCode);

  const handleCopyLink = (form) => {
    // Any form is shareable via its form code OR event code (the public page resolves both).
    const code = form.formCode || form.eventCode;
    if (!code) {
      notify.error('This form has no share code yet. Open it in the builder and add a Form Code.');
      return;
    }
    const link = `${window.location.origin}/forms/${code.toLowerCase()}`;
    navigator.clipboard.writeText(link).then(() => {
      notify.success('Form link copied to clipboard!');
    });
  };

  const dataGridActions = [
    ...(canManage ? [{
      icon: <Edit size={18} />,
      tooltip: 'Edit',
      onClick: handleEditForm,
      color: '#2563eb',
    }] : []),
    ...(canManage ? [{
      icon: <Settings size={18} />,
      tooltip: 'Payment Settings',
      onClick: handlePaymentSettings,
      color: '#7c3aed',
      condition: (row) => hasPaidMinistrySettings(row),
    }] : []),
    {
      icon: <Link size={18} />,
      tooltip: 'Copy Share Link',
      onClick: handleCopyLink,
      color: '#0891b2',
      condition: (row) => !isMinistryForm(row) && (!!row.formCode || !!row.eventCode),
    },
    {
      icon: <BarChart3 size={18} />,
      tooltip: 'View Submissions',
      onClick: handleViewSubmissions,
      color: '#7c3aed',
    },
    {
      icon: <CreditCard size={18} />,
      tooltip: 'View Payments',
      onClick: handleViewPayments,
      color: '#0369a1',
      condition: (row) => hasPaidMinistrySettings(row),
    },
    ...(canManage ? [{
      icon: <Send size={18} />,
      tooltip: 'Publish/Unpublish',
      onClick: handleTogglePublish,
      color: '#059669',
    }] : []),
    ...(canManage ? [{
      icon: <Trash2 size={18} />,
      tooltip: 'Delete Form',
      onClick: handleDeleteForm,
      color: '#dc2626',
      condition: (row) => !isMinistryForm(row),
    }] : []),
  ];

  // Paginate filtered forms client-side
  const paginatedForms = React.useMemo(() => {
    const startIndex = page * pageSize;
    return filteredForms.slice(startIndex, startIndex + pageSize);
  }, [filteredForms, page, pageSize]);

  const statsGrid = (
    <Grid
      container
      spacing={{ xs: 2, sm: 2, md: 3 }}
      sx={{
        mb: { xs: 2, sm: 2.5 },
        width: '100%',
      }}
    >
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Total Forms" value={computedStats.totalForms} icon={FileText} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Published" value={computedStats.publishedForms} icon={Send} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Active Forms" value={computedStats.activeForms} icon={CheckCircle} color="info" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard title="Submissions" value={computedStats.totalSubmissions} icon={BarChart3} color="warning" />
      </Grid>
    </Grid>
  );

  const toolbar = (
    <>
      <TextField
        placeholder="Search forms by title or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} style={{ color: '#6b7280' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          minWidth: 300,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
        size="small"
      />

      {canManage && (
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleCreateForm}
          size="small"
          sx={{
            backgroundColor: '#059669',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#047857' },
          }}
        >
          Create Form
        </Button>
      )}

      <Button
        variant="contained"
        startIcon={<RefreshCw size={18} />}
        onClick={handleRefresh}
        disabled={isLoading}
        size="small"
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
        Refresh
      </Button>
    </>
  );

  return (
    <AdminListLayout
      title="Form Management"
      subtitle="Create and manage dynamic forms for your programs and events"
      stats={statsGrid}
      toolbar={toolbar}
      error={error}
      errorMessage="An error occurred while loading forms"
      extra={
        <>
          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Delete Form"
            message="This will permanently delete the form and all associated submissions. This action cannot be undone."
            itemName={formToDelete?.title}
            isLoading={isLoading}
          />

          {/* Ministry Form Payment Settings Modal */}
          <MinistryFormPaymentModal
            open={paymentModalOpen}
            onClose={() => { setPaymentModalOpen(false); setPaymentModalForm(null); }}
            form={paymentModalForm}
          />
        </>
      }
    >
        <DataGrid
          key={`forms-${Array.isArray(filteredForms) ? filteredForms.length : 0}-${searchTerm}-${page}`}
          rows={paginatedForms}
          getRowId={(row) => row.id}
          rowCount={filteredForms.length}
          paginationMode="client"
          columns={[
            {
              field: 'title',
              headerName: 'Title',
              flex: 1,
              minWidth: 200,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {params.value}
                  </Typography>
                  {isMinistryForm(params.row) && (
                    <Chip
                      label="Ministry"
                      size="small"
                      sx={{
                        backgroundColor: '#ede9fe',
                        color: '#6d28d9',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                      }}
                    />
                  )}
                </Box>
              ),
            },
            {
              field: 'description',
              headerName: 'Description',
              flex: 1,
              minWidth: 200,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="caption" sx={{ color: '#6b7280', py: 1 }}>
                  {params.value ? (
                    <>
                      {params.value.substring(0, 60)}
                      {params.value.length > 60 ? '...' : ''}
                    </>
                  ) : (
                    <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description</span>
                  )}
                </Typography>
              ),
            },
            {
              field: 'submissionCount',
              headerName: 'Submissions',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={params.value || 0}
                    size="small"
                    sx={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'requireAuthentication',
              headerName: 'Auth Required',
              width: 130,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={params.value ? 'Yes' : 'No'}
                    size="small"
                    color={params.value ? 'warning' : 'default'}
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'isPublished',
              headerName: 'Published',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={params.value ? 'Yes' : 'No'}
                    size="small"
                    color={params.value ? 'success' : 'default'}
                    icon={
                      params.value ? (
                        <Send size={14} />
                      ) : (
                        <Eye size={14} />
                      )
                    }
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'isActive',
              headerName: 'Status',
              width: 120,
              headerAlign: 'center',
              renderCell: (params) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    size="small"
                    color={params.value ? 'success' : 'error'}
                    icon={
                      params.value ? (
                        <CheckCircle size={14} />
                      ) : (
                        <XCircle size={14} />
                      )
                    }
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              ),
            },
          ]}
          loading={isLoading}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
          actions={dataGridActions}
          getRowClassName={(params) => (!params.row.isActive ? 'inactive-form' : '')}
          sx={{
            height: 600,
            '& .inactive-form': {
              backgroundColor: '#fef2f2',
              '&:hover': {
                backgroundColor: '#fee2e2',
              },
            },
          }}
        />
    </AdminListLayout>
  );
};

export default FormManagement;
