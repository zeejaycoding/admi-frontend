import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/api/orderService';

// Async thunks
export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const fetchOrdersByStatus = createAsyncThunk(
  'order/fetchOrdersByStatus',
  async ({ status, params }, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrdersByStatus(status, params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const searchOrders = createAsyncThunk(
  'order/searchOrders',
  async ({ searchTerm, params }, { rejectWithValue }) => {
    try {
      const response = await orderService.searchOrders(searchTerm, params || {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to search orders' });
    }
  }
);

export const getOrderAnalytics = createAsyncThunk(
  'order/getOrderAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
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
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.content || [];
        state.pagination = {
          page: action.payload?.number || 0,
          size: action.payload?.size || 20,
          totalPages: action.payload?.totalPages || 0,
          totalElements: action.payload?.totalElements || 0,
        };
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch orders by status
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.content || [];
        state.pagination = {
          page: action.payload?.number || 0,
          size: action.payload?.size || 20,
          totalPages: action.payload?.totalPages || 0,
          totalElements: action.payload?.totalElements || 0,
        };
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search orders
      .addCase(searchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload?.content || [];
        state.pagination = {
          page: action.payload?.number || 0,
          size: action.payload?.size || 20,
          totalPages: action.payload?.totalPages || 0,
          totalElements: action.payload?.totalElements || 0,
        };
      })
      .addCase(searchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get analytics
      .addCase(getOrderAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload?.data || null;
      })
      .addCase(getOrderAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;
