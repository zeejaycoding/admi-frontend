import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Search, RefreshCw, Download, FileText, ClipboardList } from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import ExportModal from './ExportModal';
import { fetchAllSubmissions } from '../../../store/slices/formSubmissionSlice';
import { fetchAllForms } from '../../../store/slices/formSlice';
import { notify } from '../../../services/utils/authUtils';
import apiClient from '../../../services/utils/apiClient';

// Extract submitter info from the submission object.
// The API returns userId/userEmail/userName as null for anonymous submissions —
// the real data lives inside submissionData.
const extractSubmitter = (s) => {
  const sd = s.submissionData || {};
  const firstName = (sd.firstName || sd['First Name'] || '').trim();
  const lastName = (sd.lastName || sd['Last Name'] || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  return {
    submitterName: fullName || s.userName || 'Anonymous',
    submitterEmail: sd.email || sd.Email || s.userEmail || '—',
    submitterPhone: sd.phone || sd.Phone || '—',
    submitterCountry: sd.country || sd.Country || '—',
  };
};

const PAYMENT_STATUS_COLORS = {
  COMPLETED: { bg: '#dcfce7', text: '#059669' },
  PENDING: { bg: '#fef9c3', text: '#92400e' },
  PENDING_TRANSFER: { bg: '#fff7ed', text: '#c2410c' },
  FAILED: { bg: '#fee2e2', text: '#dc2626' },
};

const SubmissionsOverview = () => {
  const dispatch = useDispatch();

  const { submissions, isLoading } = useSelector((state) => state.formSubmission);
  const { forms } = useSelector((state) => state.form);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllSubmissions({ page: 0, size: 500 }));
    dispatch(fetchAllForms());
  }, [dispatch]);

  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedFormId('');
    setPage(0);
    dispatch(fetchAllSubmissions({ page: 0, size: 500 }));
    notify.info('Submissions refreshed!');
  };

  const handleExport = async (exportData) => {
    const formId = exportData.formId || selectedFormId;
    if (!formId) return;
    setIsExporting(true);
    try {
      const { dateFrom, dateTo, format } = exportData;

      const selectedForm = formOptions.find((f) => String(f.id) === String(formId));
      const formTitle = selectedForm?.title || 'form';
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `${formTitle}-submissions-${timestamp}.${extension}`;

      const params = { format };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await apiClient.get(
        `/form-submissions/admin/form/${formId}/export`,
        { params, responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify.success(`Submissions exported successfully as ${format.toUpperCase()}`);
      setExportModalOpen(false);
    } catch (error) {
      notify.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formOptions = useMemo(() => {
    return Array.isArray(forms) ? forms : (forms?.content || []);
  }, [forms]);

  // Normalise each submission — pull actual person data from submissionData
  const allSubmissions = useMemo(() => {
    const raw = submissions?.content || (Array.isArray(submissions) ? submissions : []);
    return raw.map((s) => {
      const { submitterName, submitterEmail, submitterPhone, submitterCountry } = extractSubmitter(s);
      return {
        ...s,
        formName: s.formTitle || `Form #${s.formId}`,
        submitterName,
        submitterEmail,
        submitterPhone,
        submitterCountry,
      };
    });
  }, [submissions]);

  // Client-side filter
  const filteredSubmissions = useMemo(() => {
    let result = allSubmissions;
    if (selectedFormId) {
      result = result.filter((s) => String(s.formId) === String(selectedFormId));
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.submitterName || '').toLowerCase().includes(lower) ||
          (s.submitterEmail || '').toLowerCase().includes(lower) ||
          (s.formName || '').toLowerCase().includes(lower) ||
          (s.submitterCountry || '').toLowerCase().includes(lower)
      );
    }
    return result;
  }, [allSubmissions, searchTerm, selectedFormId]);

  const totalCount = submissions?.totalElements ?? allSubmissions.length;

  // Custom columns — use renderCell for compatibility with the custom DataGrid
  const submissionColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
      ),
    },
    {
      field: 'formName',
      headerName: 'Form',
      flex: 1,
      minWidth: 170,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500" sx={{ color: '#1f2937' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'submitterName',
      headerName: 'Submitted By',
      flex: 1,
      minWidth: 150,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: 'submitterEmail',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#2563eb' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'submitterPhone',
      headerName: 'Phone',
      flex: 0.7,
      minWidth: 130,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#6b7280' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'submitterCountry',
      headerName: 'Country',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const colors = PAYMENT_STATUS_COLORS[params.value] || { bg: '#f3f4f6', text: '#6b7280' };
        const label = params.value.replace('_', ' ');
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: '0.68rem',
              fontWeight: 600,
              height: 22,
            }}
          />
        );
      },
    },
    {
      field: 'paymentAmount',
      headerName: 'Amount',
      width: 110,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => {
        if (!params.value) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const currency = params.row?.paymentCurrency || '';
        return (
          <Typography variant="body2" fontWeight="500">
            {currency} {Number(params.value).toLocaleString()}
          </Typography>
        );
      },
    },
    {
      field: 'submittedAt',
      headerName: 'Submitted At',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const val = params.value || params.row?.createdAt;
        if (!val) return <Typography variant="body2" color="text.secondary">—</Typography>;
        try {
          const d = new Date(val);
          return (
            <Typography variant="body2">
              {d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              {' '}
              <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </Typography>
          );
        } catch {
          return <Typography variant="body2" color="text.secondary">—</Typography>;
        }
      },
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#1f2937"
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }, lineHeight: 1.2 }}
        >
          Submissions
        </Typography>
        <Typography variant="body1" color="#6b7280" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          All form submissions across the platform
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 2.5 }, width: '100%' }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Submissions" value={totalCount} icon={ClipboardList} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Forms" value={formOptions.length} icon={FileText} color="success" />
        </Grid>
      </Grid>

      {/* Search & filter bar */}
      <Paper elevation={1} sx={{ mb: 3, p: 2, width: '100%', backgroundColor: 'white', borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
          }}
        >
          <TextField
            placeholder="Search by name, email, country, or form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#6b7280" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            size="small"
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Form</InputLabel>
            <Select
              value={selectedFormId}
              onChange={(e) => { setSelectedFormId(e.target.value); setPage(0); }}
              label="Filter by Form"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Forms</MenuItem>
              {formOptions.map((f) => (
                <MenuItem key={f.id} value={String(f.id)}>
                  {f.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => setExportModalOpen(true)}
            size="small"
            sx={{
              borderColor: '#003999',
              color: '#003999',
              px: 2.5,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { borderColor: '#002d7a', backgroundColor: '#f0f4ff' },
            }}
          >
            <Download size={15} style={{ marginRight: 6 }} />
            Export
          </Button>

          <Button
            variant="contained"
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
              whiteSpace: 'nowrap',
              '&:hover': { backgroundColor: '#002d7a' },
              '&:disabled': { backgroundColor: '#9ca3af', color: '#6b7280' },
            }}
          >
            <RefreshCw size={15} style={{ marginRight: 6 }} />
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, backgroundColor: 'white' }}>
        <DataGrid
          rows={filteredSubmissions}
          columns={submissionColumns}
          loading={isLoading}
          pagination
          paginationMode="client"
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ height: 620 }}
        />
      </Paper>

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
        forms={formOptions}
        defaultFormId={selectedFormId}
      />
    </Box>
  );
};

export default SubmissionsOverview;
