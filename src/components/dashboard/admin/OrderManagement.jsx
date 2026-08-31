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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  Search,
  RefreshCw,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';


import { DataGrid, Button, StatsCard } from '../../ui';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { ORDER_STATUSES, ORDER_STATUS_LIST, PAYMENT_STATUSES } from '../../../constants/statuses';
import {
  fetchAllOrders,
  fetchOrdersByStatus,
  searchOrders,
  clearError,
} from '../../../store/slices/orderSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, pagination, isLoading, error } = useSelector((state) => state.order);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const statuses = ORDER_STATUS_LIST;

  // Calculate statistics from actual order data
  const computedStats = React.useMemo(() => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return {
        totalOrders: pagination.totalElements || 0,
        pendingOrders: 0,
        completedOrders: 0,
        failedOrders: 0,
      };
    }

    return {
      totalOrders: pagination.totalElements || orders.length,
      pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
      completedOrders: orders.filter((o) => o.status === 'COMPLETED').length,
      failedOrders: orders.filter((o) => o.status === 'FAILED').length,
    };
  }, [orders, pagination]);

  // Fetch orders on component mount or when filters change
  useEffect(() => {
    const params = { page, size: pageSize };

    if (searchQuery.trim()) {
      dispatch(searchOrders({ searchTerm: searchQuery, params }));
    } else if (statusFilter !== 'ALL') {
      dispatch(fetchOrdersByStatus({ status: statusFilter, params }));
    } else {
      dispatch(fetchAllOrders(params));
    }
  }, [page, pageSize, statusFilter, searchQuery, dispatch]);

  const handleSearch = () => {
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPage(0);
    dispatch(clearError());
    dispatch(fetchAllOrders({ page: 0, size: pageSize }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
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
          Order Management
        </Typography>
        <Typography
          variant="body1"
          color="#6b7280"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Manage and track all customer orders
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
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Orders" value={computedStats.totalOrders} icon={Package} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Pending" value={computedStats.pendingOrders} icon={Clock} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Completed" value={computedStats.completedOrders} icon={CheckCircle} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Failed" value={computedStats.failedOrders} icon={XCircle} color="error" />
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
            placeholder="Search by order number, customer name, or email..."
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
            Error: {error.message || 'An error occurred while loading orders'}
          </Typography>
        </Paper>
      )}

      {/* Orders DataGrid */}
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
          rows={orders || []}
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
                <Box sx={{ py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {params.value}
                  </Typography>
                </Box>
              ),
            },
            {
              field: 'customerName',
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
              field: 'customerEmail',
              headerName: 'Email',
              flex: 1,
              minWidth: 200,
              headerAlign: 'center',
              renderCell: (params) => (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'totalAmount',
              headerName: 'Total',
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
                const statusEntry = ORDER_STATUSES[params.value];
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
                    onClick={() => handleViewOrder(params.row)}
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

      {/* Order Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#003999', color: 'white', fontWeight: 'bold' }}>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedOrder && (
            <Box>
              {/* Order Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Order Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Customer Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedOrder.customerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedOrder.customerEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedOrder.status}
                      size="small"
                      sx={{
                        backgroundColor: ORDER_STATUSES[selectedOrder.status]?.bg,
                        color: ORDER_STATUSES[selectedOrder.status]?.color,
                        fontWeight: 600,
                        mt: 0.5,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Payment Method
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedOrder.paymentMethod}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                      {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Created At
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDateTime(selectedOrder.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Order Items ({selectedOrder.orderItems?.length || 0})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Chip
                              label={item.productType}
                              size="small"
                              sx={{
                                backgroundColor: item.productType === 'COURSE' ? '#dbeafe' : '#fef3c7',
                                color: item.productType === 'COURSE' ? '#2563eb' : '#d97706',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {item.productType === 'COURSE' ? item.courseTitle : item.bookTitle}
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.unitPrice, item.currency)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(item.subtotal, item.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Payments */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1f2937' }}>
                  Payments ({selectedOrder.payments?.length || 0})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Gateway</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Completed At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.payments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.paymentGateway}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {payment.gatewayTransactionId || 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={payment.status}
                              size="small"
                              sx={{
                                backgroundColor: PAYMENT_STATUSES[payment.status]?.bg || '#f3f4f6',
                                color: PAYMENT_STATUSES[payment.status]?.color || '#6b7280',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#059669' }}>
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>{formatDateTime(payment.completedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
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

export default OrderManagement;
