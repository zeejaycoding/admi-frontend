import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', bg: '#fef3c7', color: '#d97706', icon: Clock },
  PROCESSING: { label: 'Processing', bg: '#dbeafe', color: '#2563eb', icon: AlertCircle },
  COMPLETED: { label: 'Completed', bg: '#dcfce7', color: '#059669', icon: CheckCircle },
  FAILED: { label: 'Failed', bg: '#fee2e2', color: '#dc2626', icon: XCircle },
  REFUNDED: { label: 'Refunded', bg: '#f3f4f6', color: '#6b7280', icon: XCircle },
};

export const PAYMENT_STATUS_LIST = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];

export const ORDER_STATUSES = {
  PENDING: { label: 'Pending', bg: '#fef3c7', color: '#d97706', icon: Clock },
  PROCESSING: { label: 'Processing', bg: '#dbeafe', color: '#2563eb', icon: AlertCircle },
  COMPLETED: { label: 'Completed', bg: '#dcfce7', color: '#059669', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', bg: '#f3f4f6', color: '#6b7280', icon: XCircle },
  FAILED: { label: 'Failed', bg: '#fee2e2', color: '#dc2626', icon: XCircle },
};

export const ORDER_STATUS_LIST = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED'];

export const USER_STATUSES = {
  ACTIVE: { label: 'Active', bg: '#dcfce7', color: '#059669' },
  INACTIVE: { label: 'Inactive', bg: '#f3f4f6', color: '#6b7280' },
  LOCKED: { label: 'Locked', bg: '#fee2e2', color: '#dc2626' },
};

export const STATS_CARD_COLORS = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-500', icon: 'bg-primary-500' },
  success: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-600' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'bg-yellow-600' },
  error: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-600' },
  info: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-600' },
};
