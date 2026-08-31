import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/api/dashboardService';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' });
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivity();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch recent activity' });
    }
  }
);

export const fetchRevenueTrends = createAsyncThunk(
  'dashboard/fetchRevenueTrends',
  async (period = 'daily', { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRevenueTrends(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch revenue trends' });
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      users: {},
      orders: {},
      payments: {},
      books: { total: 0, active: 0 },
      courses: { total: 0, active: 0 },
      campuses: { total: 0, active: 0 },
    },
    recentActivity: {
      orders: [],
      payments: [],
      users: [],
    },
    revenueTrends: {
      labels: [],
      ngnRevenue: [],
      usdRevenue: [],
    },
    isLoading: false,
    isLoadingActivity: false,
    isLoadingTrends: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch recent activity
      .addCase(fetchRecentActivity.pending, (state) => {
        state.isLoadingActivity = true;
        state.error = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.isLoadingActivity = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.isLoadingActivity = false;
        state.error = action.payload;
      })
      // Fetch revenue trends
      .addCase(fetchRevenueTrends.pending, (state) => {
        state.isLoadingTrends = true;
        state.error = null;
      })
      .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
        state.isLoadingTrends = false;
        state.revenueTrends = action.payload;
      })
      .addCase(fetchRevenueTrends.rejected, (state, action) => {
        state.isLoadingTrends = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
