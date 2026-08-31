import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search,
  RefreshCw,
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  X,
} from 'lucide-react';

import { DataGrid, Button, StatsCard } from '../../ui';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { PAYMENT_STATUSES, PAYMENT_STATUS_LIST } from '../../../constants/statuses';
import {
  fetchAllPayments,
  fetchPaymentsByStatus,
  searchPayments,
  clearError,
} from '../../../store/slices/paymentSlice';

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const { payments, pagination, isLoading, error } = useSelector((state) => state.payment);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const statuses = PAYMENT_STATUS_LIST;

  // Calculate statistics from actual payment data
  const computedStats = React.useMemo(() => {
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return {
        totalPayments: pagination.totalElements || 0,
        completedPayments: 0,
        failedPayments: 0,
        ngnRevenue: 0,
        usdRevenue: 0,
      };
    }

    const completed = payments.filter((p) => p.status === 'COMPLETED');
    const ngnRevenue = completed
      .filter((p) => p.currency === 'NGN')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const usdRevenue = completed
      .filter((p) => p.currency === 'USD')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalPayments: pagination.totalElements || payments.length,
      completedPayments: completed.length,
      failedPayments: payments.filter((p) => p.status === 'FAILED').length,
      ngnRevenue: ngnRevenue.toFixed(2),
      usdRevenue: usdRevenue.toFixed(2),
    };
  }, [payments, pagination]);

  // Fetch payments on component mount or when filters change
  useEffect(() => {
    const params = { page, size: pageSize };

    if (searchQuery.trim()) {
      dispatch(searchPayments({ searchTerm: searchQuery, params }));
    } else if (statusFilter !== 'ALL') {
      dispatch(fetchPaymentsByStatus({ status: statusFilter, params }));
    } else {
      dispatch(fetchAllPayments(params));
    }
  }, [page, pageSize, statusFilter, searchQuery, dispatch]);

  const handleSearch = () => {
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPage(0);
    dispatch(clearError());
    dispatch(fetchAllPayments({ page: 0, size: pageSize }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedPayment(null);
  };

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
      <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'left' }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#1f2937"
          gutterBottom
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            lineHeight: 1.2,
          }}
        >
          Payment Management
        </Typography>
        <Typography
          variant="body1"
          color="#6b7280"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Monitor and manage all payment transactions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        sx={{
          mb: { xs: 2, sm: 2.5 },
          width: '100%',
        }}
      >
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard title="Total Payments" value={computedStats.totalPayments} icon={CreditCard} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard title="Completed" value={computedStats.completedPayments} icon={CheckCircle} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatsCard title="Failed" value={computedStats.failedPayments} icon={XCircle} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={2.4}>
          <StatsCard title="NGN Revenue" value={`₦${computedStats.ngnRevenue}`} icon={DollarSign} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={2.4}>
          <StatsCard title="USD Revenue" value={`$${computedStats.usdRevenue}`} icon={DollarSign} color="success" />
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          p: 2,
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
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
            placeholder="Search by transaction ID, payment method, or gateway..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} style={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <X
                    size={20}
                    style={{ color: '#6b7280', cursor: 'pointer' }}
                    onClick={handleClearSearch}
                  />
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

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            size="small"
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<Search size={18} />}
            onClick={handleSearch}
            disabled={isLoading}
            size="small"
            sx={{
              backgroundColor: '#059669',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#047857',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#6b7280',
              },
            }}
          >
            Search
          </Button>

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
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            backgroundColor: '#fee2e2',
            border: '1px solid #dc2626',
            borderRadius: 2,
            width: '100%',
          }}
        >
          <Typography
            color="#dc2626"
            sx={{
              p: 2,
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            Error: {error.message || 'An error occurred while loading payments'}
          </Typography>
        </Paper>
      )}

      {/* Payments DataGrid */}
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <DataGrid
          rows={payments || []}
          getRowId={(row) => row.id}
          rowCount={pagination.totalElements}
          paginationMode="server"
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          columns={[
            {
              field: 'orderNumber',
              headerName: 'Order Number',
              flex: 1,
              minWidth: 150,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'userName',
              headerName: 'Customer Name',
              flex: 1,
              minWidth: 150,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'userEmail',
              headerName: 'Email',
              flex: 1,
              minWidth: 180,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'paymentMethod',
              headerName: 'Method',
              width: 100,
              headerAlign: 'center',
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  sx={{
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              ),
            },
            {
              field: 'paymentGateway',
              headerName: 'Gateway',
              width: 100,
              headerAlign: 'center',
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  sx={{
                    backgroundColor: '#dbeafe',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              ),
            },
            {
              field: 'amount',
              headerName: 'Amount',
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
                    label={formatCurrency(params.value, params.row.currency)}
                    size="small"
                    sx={{
                      backgroundColor: '#dcfce7',
                      color: '#059669',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              ),
            },
            {
              field: 'status',
              headerName: 'Status',
              width: 150,
              headerAlign: 'center',
              renderCell: (params) => {
                const statusEntry = PAYMENT_STATUSES[params.value];
                const StatusIcon = statusEntry?.icon;
                return (
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
                      label={params.value}
                      size="small"
                      icon={StatusIcon ? <StatusIcon size={14} /> : undefined}
                      sx={{
                        backgroundColor: statusEntry?.bg || '#f3f4f6',
                        color: statusEntry?.color || '#6b7280',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                );
              },
            },
            {
              field: 'createdAt',
              headerName: 'Date',
              width: 180,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {formatDateTime(params.value)}
                </Typography>
              ),
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 100,
              headerAlign: 'center',
              align: 'center',
              sortable: false,
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
                  <Box
                    sx={{
                      backgroundColor: '#e6ecff',
                      borderRadius: '6px',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#b3c5ff',
                      },
                    }}
                    onClick={() => handleViewPayment(params.row)}
                  >
                    <Eye size={18} style={{ color: '#003999' }} />
                  </Box>
                </Box>
              ),
            },
          ]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f3f4f6',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f9fafb',
              borderBottom: '2px solid #e5e7eb',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f9fafb',
            },
          }}
        />
      </Paper>

      {/* Payment Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#003999', color: 'white', fontWeight: 'bold' }}>
          Payment Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedPayment && (
            <Box>
              {/* Order Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Order Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Order Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPayment.orderNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Customer Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPayment.userName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPayment.userEmail}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Payment Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Transaction ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {selectedPayment.gatewayTransactionId || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Payment Method
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPayment.paymentMethod}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Gateway
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPayment.paymentGateway}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Amount
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669', fontSize: '1.1rem' }}>
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Currency
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPayment.currency}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Status & Dates */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Status & Timeline
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedPayment.status}
                      size="small"
                      sx={{
                        backgroundColor: PAYMENT_STATUSES[selectedPayment.status]?.bg,
                        color: PAYMENT_STATUSES[selectedPayment.status]?.color,
                        fontWeight: 600,
                        mt: 0.5,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Can Be Refunded
                    </Typography>
                    <Chip
                      label={selectedPayment.canBeRefunded ? 'Yes' : 'No'}
                      size="small"
                      sx={{
                        backgroundColor: selectedPayment.canBeRefunded ? '#dcfce7' : '#fee2e2',
                        color: selectedPayment.canBeRefunded ? '#059669' : '#dc2626',
                        fontWeight: 600,
                        mt: 0.5,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Created At
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDateTime(selectedPayment.createdAt)}
                    </Typography>
                  </Grid>
                  {selectedPayment.completedAt && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Completed At
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDateTime(selectedPayment.completedAt)}
                      </Typography>
                    </Grid>
                  )}
                  {selectedPayment.failedAt && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Failed At
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#dc2626' }}>
                        {formatDateTime(selectedPayment.failedAt)}
                      </Typography>
                    </Grid>
                  )}
                  {selectedPayment.refundedAt && (
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Refunded At
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDateTime(selectedPayment.refundedAt)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Fees & Refunds */}
              {(selectedPayment.gatewayFee > 0 || selectedPayment.processingFee > 0 || selectedPayment.refundAmount > 0) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                      Fees & Refunds
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedPayment.gatewayFee > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Gateway Fee
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(selectedPayment.gatewayFee, selectedPayment.currency)}
                          </Typography>
                        </Grid>
                      )}
                      {selectedPayment.processingFee > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Processing Fee
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(selectedPayment.processingFee, selectedPayment.currency)}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Net Amount
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                          {formatCurrency(selectedPayment.netAmount, selectedPayment.currency)}
                        </Typography>
                      </Grid>
                      {selectedPayment.refundAmount > 0 && (
                        <>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Refund Amount
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#dc2626' }}>
                              {formatCurrency(selectedPayment.refundAmount, selectedPayment.currency)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Remaining Refundable Amount
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(selectedPayment.remainingRefundableAmount, selectedPayment.currency)}
                            </Typography>
                          </Grid>
                          {selectedPayment.refundReason && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Refund Reason
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {selectedPayment.refundReason}
                              </Typography>
                            </Grid>
                          )}
                        </>
                      )}
                    </Grid>
                  </Box>
                </>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#6b7280' }}>
                      {selectedPayment.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f9fafb' }}>
          <Button
            variant="contained"
            onClick={handleCloseDetail}
            sx={{
              backgroundColor: '#003999',
              color: 'white',
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#002d7a',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagement;
