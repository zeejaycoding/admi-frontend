import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Search,
  RefreshCw,
  ArrowLeft,
  Download,
  CreditCard,
  Landmark,
  DollarSign,
  CheckCircle,
  Clock,
} from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import { formatDateTime } from '../../../utils/formatters';
import { fetchFormSubmissions } from '../../../store/slices/formSubmissionSlice';
import { fetchFormById } from '../../../store/slices/formSlice';
import { notify } from '../../../services/utils/authUtils';
import ExportModal from './ExportModal';
import apiClient from '../../../services/utils/apiClient';

// Tab indices
const TAB_ALL             = 0;
const TAB_STRIPE_COMPLETE = 1;
const TAB_STRIPE_PENDING  = 2;
const TAB_NGN             = 3;

// Maps tab → backend paymentMethod param for export
const exportPaymentMethod = (tab) => {
  if (tab === TAB_STRIPE_COMPLETE || tab === TAB_STRIPE_PENDING) return 'STRIPE';
  if (tab === TAB_NGN) return 'NGN_TRANSFER';
  return 'ALL';
};

// Helpers — stripeSessionId is not in the API response; use currency instead
const isStripe = (s) => s.paymentCurrency && s.paymentCurrency !== 'NGN';
const isNgn    = (s) => s.paymentCurrency === 'NGN';

const statusColor = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'COMPLETED':        return { bg: '#d1fae5', text: '#065f46' };
    case 'PENDING_TRANSFER': return { bg: '#fef3c7', text: '#92400e' };
    case 'PENDING':          return { bg: '#e0f2fe', text: '#075985' };
    case 'FAILED':           return { bg: '#fee2e2', text: '#991b1b' };
    default:                 return { bg: '#f3f4f6', text: '#374151' };
  }
};

const FormPayments = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { formId } = useParams();

  const { submissions, isLoading } = useSelector((s) => s.formSubmission);
  const { selectedForm }           = useSelector((s) => s.form);

  const [tab,         setTab]         = useState(TAB_ALL);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [exportOpen,  setExportOpen]  = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [page,        setPage]        = useState(0);
  const [pageSize,    setPageSize]    = useState(25);

  useEffect(() => {
    if (formId) {
      dispatch(fetchFormById(formId));
      loadData();
    }
  }, [formId]);

  const loadData = () => {
    dispatch(fetchFormSubmissions({ formId, params: { page: 0, size: 2000 } }));
  };

  const allSubmissions = submissions?.content || [];

  // Only entries that have payment data
  const withPayment = allSubmissions.filter((s) => s.paymentStatus || s.paymentAmount);

  // Segmented counts
  const stripeCompleted = withPayment.filter((s) => isStripe(s) && s.paymentStatus === 'COMPLETED');
  const stripePending   = withPayment.filter((s) => isStripe(s) && s.paymentStatus !== 'COMPLETED');
  const ngnAll          = withPayment.filter(isNgn);

  const byTab = (list) => {
    switch (tab) {
      case TAB_STRIPE_COMPLETE: return list.filter((s) => isStripe(s) && s.paymentStatus === 'COMPLETED');
      case TAB_STRIPE_PENDING:  return list.filter((s) => isStripe(s) && s.paymentStatus !== 'COMPLETED');
      case TAB_NGN:             return list.filter(isNgn);
      default:                  return list;
    }
  };

  const searched = byTab(withPayment).filter((s) => {
    if (!searchTerm.trim()) return true;
    const q     = searchTerm.toLowerCase();
    const d     = s.submissionData || {};
    const name  = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase();
    const email = (d.email || s.userEmail || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const paginated = searched.slice(page * pageSize, page * pageSize + pageSize);

  const handleExport = async ({ dateFrom, dateTo, format }) => {
    setIsExporting(true);
    try {
      const formTitle = selectedForm?.title || 'form';
      const timestamp = new Date().toISOString().split('T')[0];
      const ext       = format === 'excel' ? 'xlsx' : 'csv';
      const filename  = `${formTitle}-payments-${timestamp}.${ext}`;

      const params = { format, paymentMethod: exportPaymentMethod(tab) };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo)   params.dateTo   = dateTo;

      const response = await apiClient.get(
        `/form-submissions/admin/form/${formId}/export-payments`,
        { params, responseType: 'blob' }
      );

      const mimeType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
      const blob = new Blob([response.data], { type: mimeType });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify.success(`Payments exported as ${format.toUpperCase()}`);
      setExportOpen(false);
    } catch (err) {
      notify.error('Export failed: ' + (err.message || err));
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const d    = row.submissionData || {};
        const name = `${d.firstName || ''} ${d.lastName || ''}`.trim();
        return <span>{name || row.userName || '—'}</span>;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => {
        const d = row.submissionData || {};
        return <span>{d.email || row.userEmail || '—'}</span>;
      },
    },
    {
      field: 'phone',
      headerName: 'Phone',
      minWidth: 130,
      renderCell: ({ row }) => {
        const d = row.submissionData || {};
        return <span>{d.phone || '—'}</span>;
      },
    },
    {
      field: 'plan',
      headerName: 'Plan',
      minWidth: 150,
      renderCell: ({ row }) => {
        const d = row.submissionData || {};
        return <span>{d.paymentPlanLabel || d.paymentPlan || '—'}</span>;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 120,
      renderCell: ({ row }) => {
        if (!row.paymentAmount) return <span>—</span>;
        return (
          <span style={{ fontWeight: 600 }}>
            {row.paymentCurrency} {parseFloat(row.paymentAmount).toLocaleString()}
          </span>
        );
      },
    },
    {
      field: 'method',
      headerName: 'Method',
      minWidth: 140,
      renderCell: ({ row }) => {
        const stripe = isStripe(row);
        return (
          <Chip
            label={stripe ? 'Stripe' : 'Bank Transfer'}
            size="small"
            icon={stripe ? <CreditCard size={12} /> : <Landmark size={12} />}
            sx={{
              backgroundColor: stripe ? '#ede9fe' : '#fef3c7',
              color:           stripe ? '#5b21b6' : '#92400e',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        );
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      minWidth: 160,
      renderCell: ({ row }) => {
        const { bg, text } = statusColor(row.paymentStatus);
        const label = (row.paymentStatus || 'Unknown')
          .replaceAll('_', ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <Chip
            label={label}
            size="small"
            sx={{ backgroundColor: bg, color: text, fontWeight: 600, fontSize: '0.7rem' }}
          />
        );
      },
    },
    {
      field: 'submittedAt',
      headerName: 'Date',
      minWidth: 150,
      renderCell: ({ row }) => (
        <span>{row.submittedAt ? formatDateTime(row.submittedAt) : '—'}</span>
      ),
    },
  ];

  const tl = (label, count) => `${label} (${count})`;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minHeight: '100vh', backgroundColor: '#fafafa' }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="#1f2937" gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {selectedForm?.title || 'Form'} — Payments
        </Typography>
        <Typography variant="body1" color="#6b7280">
          View and export payment records for this form
        </Typography>
      </Box>

      {/* Stats — one card per segment */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total" value={withPayment.length} icon={DollarSign} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Stripe Completed" value={stripeCompleted.length} icon={CheckCircle} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Stripe Pending" value={stripePending.length} icon={Clock} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="NGN Bank Transfers" value={ngnAll.length} icon={Landmark} color="primary" />
        </Grid>
      </Grid>

      {/* Tabs + search + actions */}
      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setPage(0); }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minWidth: 140 },
            '& .Mui-selected': { color: '#003999' },
            '& .MuiTabs-indicator': { backgroundColor: '#003999' },
          }}
        >
          <Tab label={tl('All', withPayment.length)} />
          <Tab label={tl('Stripe — Completed', stripeCompleted.length)} />
          <Tab label={tl('Stripe — Pending', stripePending.length)} />
          <Tab label={tl('NGN Bank Transfers', ngnAll.length)} />
        </Tabs>

        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            size="small"
          />

          <Button
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/admin/forms')}
            size="small"
            sx={{ backgroundColor: '#6b7280', color: 'white', borderRadius: 2, fontWeight: 600,
              textTransform: 'none', '&:hover': { backgroundColor: '#4b5563' } }}
          >
            Back
          </Button>

          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={() => setExportOpen(true)}
            size="small"
            sx={{ backgroundColor: '#059669', color: 'white', borderRadius: 2, fontWeight: 600,
              textTransform: 'none', '&:hover': { backgroundColor: '#047857' } }}
          >
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<RefreshCw size={18} />}
            onClick={loadData}
            disabled={isLoading}
            size="small"
            sx={{ backgroundColor: '#003999', color: 'white', borderRadius: 2, fontWeight: 600,
              textTransform: 'none', '&:hover': { backgroundColor: '#002d7a' },
              '&:disabled': { backgroundColor: '#9ca3af', color: '#6b7280' } }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          key={`payments-${tab}-${searched.length}-${page}`}
          rows={paginated}
          getRowId={(row) => row.id}
          rowCount={searched.length}
          paginationMode="client"
          columns={columns}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          actions={[]}
        />
      </Paper>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </Box>
  );
};

export default FormPayments;
