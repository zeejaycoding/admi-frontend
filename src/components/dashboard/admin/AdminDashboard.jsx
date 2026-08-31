import React, { useEffect, useMemo } from 'react';
import admiLogo from '../../../assets/logo-admi.png';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../ui';
import {
  fetchDashboardStats,
  fetchRecentActivity,
  clearError,
} from '../../../store/slices/dashboardSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, recentActivity, isLoading, isLoadingActivity, error } = useSelector(
    (state) => state.dashboard
  );
  const { hasPermission } = usePermissions();

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivity());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(clearError());
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivity());
  };

  const revenue = useMemo(() => {
    if (!stats.payments) return { ngn: 0, usd: 0 };

    return {
      ngn: stats.payments.totalRevenueNGN || 0,
      usd: stats.payments.totalRevenueUSD || 0,
    };
  }, [stats.payments]);

  const getStatsCard = (title, value, Icon, color = 'primary', onClick = null) => {
    const colorClasses = {
      primary: {
        bg: 'bg-primary-50',
        text: 'text-primary-500',
        icon: 'bg-primary-500',
      },
      success: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-600',
      },
      warning: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        icon: 'bg-yellow-600',
      },
      info: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-600',
      },
      purple: {
        bg: 'bg-primary-50',
        text: 'text-primary-700',
        icon: 'bg-primary-700',
      },
    };

    return (
      <div
        className={`
        ${colorClasses[color].bg}
        w-full
        h-24 sm:h-28 md:h-32
        p-3 sm:p-4
        rounded-lg
        border border-opacity-20
        transition-all duration-300 ease-in-out
        hover:-translate-y-0.5 hover:shadow-lg
        flex items-center justify-between
        shadow-sm
        ${onClick ? 'cursor-pointer' : ''}
      `}
        onClick={onClick}
      >
        <div className="flex-1">
          <div
            className={`
            ${colorClasses[color].text}
            text-xl sm:text-2xl md:text-3xl
            font-bold
            leading-tight
            mb-0.5 sm:mb-1
          `}
          >
            {value || 0}
          </div>
          <div
            className={`
            ${colorClasses[color].text}
            opacity-80
            text-xs sm:text-sm
            font-semibold
            leading-tight
            truncate
          `}
          >
            {title}
          </div>
        </div>
        <div
          className={`
          ${colorClasses[color].icon}
          rounded-lg
          p-2 sm:p-3
          flex items-center justify-center
          flex-shrink-0
          ml-2 sm:ml-3
          w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
        `}
        >
          <Icon className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </div>
      </div>
    );
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { NGN: '₦', USD: '$' };
    return `${symbols[currency] || currency}${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#fafafa',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2, md: 3 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <div className="flex items-center gap-4">
          <img src={admiLogo} alt="ADMI" className="h-12 w-auto object-contain hidden sm:block" />
          <div>
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
              Admin Dashboard
            </Typography>
            <Typography
              variant="body1"
              color="#6b7280"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Overview of your platform performance and activity
            </Typography>
          </div>
        </div>

        <Button
          variant="contained"
          startIcon={<RefreshCw size={18} />}
          onClick={handleRefresh}
          disabled={isLoading}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {getStatsCard('Total Users',   stats.users?.totalUsers || 0,  Users,        'primary', hasPermission('MENU_USERS')     ? () => navigate('/admin/users')    : null)}
        {getStatsCard('Total Books',   stats.books?.total || 0,       BookOpen,     'info',    hasPermission('MENU_BOOKS')     ? () => navigate('/admin/books')    : null)}
        {getStatsCard('Total Courses', stats.courses?.total || 0,     GraduationCap,'purple',  hasPermission('MENU_COURSES')   ? () => navigate('/admin/courses')  : null)}
        {getStatsCard('Campuses',      stats.campuses?.total || 0,    MapPin,       'warning', hasPermission('MENU_CAMPUSES')  ? () => navigate('/admin/campuses') : null)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {getStatsCard('Total Orders',   stats.orders?.totalOrders || 0,     ShoppingCart, 'info',    hasPermission('MENU_ORDERS')   ? () => navigate('/admin/orders')   : null)}
        {getStatsCard('Total Payments', stats.payments?.totalPayments || 0, CreditCard,   'primary', hasPermission('MENU_PAYMENTS') ? () => navigate('/admin/payments') : null)}
        {getStatsCard('NGN Revenue',    formatCurrency(revenue.ngn, 'NGN'), DollarSign,   'success')}
        {getStatsCard('USD Revenue',    formatCurrency(revenue.usd, 'USD'), DollarSign,   'success')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="600" color="#1f2937">
                Recent Orders
              </Typography>
              {hasPermission('MENU_ORDERS') && (
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="text-primary-600 hover:text-primary-800 font-semibold text-sm transition-colors"
                >
                  View All →
                </button>
              )}
            </Box>

            {isLoadingActivity ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : recentActivity.orders?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {order.orderNumber}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {order.customerName}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {formatCurrency(order.totalAmount, order.currency)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            size="small"
                            color={
                              order.status === 'COMPLETED'
                                ? 'success'
                                : order.status === 'PENDING'
                                ? 'warning'
                                : 'error'
                            }
                            sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="#6b7280" textAlign="center" py={4}>
                No recent orders
              </Typography>
            )}
          </Paper>
        </div>

        <div>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="600" color="#1f2937">
                Recent Payments
              </Typography>
              {hasPermission('MENU_PAYMENTS') && (
                <button
                  onClick={() => navigate('/admin/payments')}
                  className="text-primary-600 hover:text-primary-800 font-semibold text-sm transition-colors"
                >
                  View All →
                </button>
              )}
            </Box>

            {isLoadingActivity ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : recentActivity.payments?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.payments.slice(0, 5).map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {payment.customerName || payment.userName || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {payment.paymentMethod || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            size="small"
                            color={
                              payment.status === 'COMPLETED'
                                ? 'success'
                                : payment.status === 'PENDING'
                                ? 'warning'
                                : 'error'
                            }
                            sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="#6b7280" textAlign="center" py={4}>
                No recent payments
              </Typography>
            )}
          </Paper>
        </div>
      </div>

      <div className="w-full mb-4">
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="600" color="#1f2937">
                Recent Users
              </Typography>
              {hasPermission('MENU_USERS') && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-primary-600 hover:text-primary-800 font-semibold text-sm transition-colors"
                >
                  View All →
                </button>
              )}
            </Box>

            {isLoadingActivity ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : recentActivity.users?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Campus</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.users.slice(0, 5).map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          {user.fullName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.campusName || 'N/A'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.isActive ? 'success' : 'error'}
                            icon={
                              user.isActive ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )
                            }
                            sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="#6b7280" textAlign="center" py={4}>
                No recent users
              </Typography>
            )}
          </Paper>
      </div>

      {error && error.status !== 403 && (
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            backgroundColor: '#fee2e2',
            border: '1px solid #dc2626',
            borderRadius: 2,
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
            Error: {error.message || 'An error occurred while loading dashboard data'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdminDashboard;
