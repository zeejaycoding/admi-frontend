import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/api/paymentService';

// Async thunks
export const fetchAllPayments = createAsyncThunk(
  'payment/fetchAllPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentService.getAllPayments(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch payments' });
    }
  }
);

export const fetchPaymentsByStatus = createAsyncThunk(
  'payment/fetchPaymentsByStatus',
  async ({ status, params }, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentsByStatus(status, params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch payments' });
    }
  }
);

export const searchPayments = createAsyncThunk(
  'payment/searchPayments',
  async ({ searchTerm, params }, { rejectWithValue }) => {
    try {
      const response = await paymentService.searchPayments(searchTerm, params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to search payments' });
    }
  }
);

export const fetchFailedPayments = createAsyncThunk(
  'payment/fetchFailedPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getFailedPayments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch failed payments' });
    }
  }
);

export const getPaymentAnalytics = createAsyncThunk(
  'payment/getPaymentAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [],
    analytics: null,
    pagination: {
      page: 0,
      size: 20,
      totalPages: 0,
      totalElements: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload?.content || [];
        state.pagination = {
          page: action.payload?.number || 0,
          size: action.payload?.size || 20,
          totalPages: action.payload?.totalPages || 0,
          totalElements: action.payload?.totalElements || 0,
        };
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch payments by status
      .addCase(fetchPaymentsByStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload?.content || [];
        state.pagination = {
          page: action.payload?.number || 0,
          size: action.payload?.size || 20,
          totalPages: action.payload?.totalPages || 0,
          totalElements: action.payload?.totalElements || 0,
        };
      })
      .addCase(fetchPaymentsByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search payments
      .addCase(searchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload?.content || [];
        state.pagination = {
          page: action.payload?.number || 0,
          size: action.payload?.size || 20,
          totalPages: action.payload?.totalPages || 0,
          totalElements: action.payload?.totalElements || 0,
        };
      })
      .addCase(searchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch failed payments
      .addCase(fetchFailedPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFailedPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload || [];
      })
      .addCase(fetchFailedPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get analytics
      .addCase(getPaymentAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload?.data || null;
      })
      .addCase(getPaymentAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
