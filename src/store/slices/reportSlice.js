import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/api/reportService';

export const fetchAllReports = createAsyncThunk(
  'report/fetchAllReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getAllReports();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch reports' });
    }
  }
);

export const getReportById = createAsyncThunk(
  'report/getReportById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reportService.getReportById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch report details' });
    }
  }
);

export const createReport = createAsyncThunk(
  'report/createReport',
  async ({ reportData, files }, { rejectWithValue }) => {
    try {
      const response = await reportService.createReport(reportData, files);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to submit report' });
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'report/updateReportStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await reportService.updateReportStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update report status' });
    }
  }
);

export const deleteReport = createAsyncThunk(
  'report/deleteReport',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reportService.deleteReport(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete report' });
    }
  }
);

export const getReportAnalytics = createAsyncThunk(
  'report/getReportAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportService.getReportAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch report analytics' });
    }
  }
);

const initialState = {
  reports: [],
  selectedReport: null,
  analytics: null,
  isLoading: false,
  error: null,
  success: false,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reports
      .addCase(fetchAllReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload || [];
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get report by ID
      .addCase(getReportById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedReport = action.payload;
      })
      .addCase(getReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create report
      .addCase(createReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update report status
      .addCase(updateReportStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        state.reports = state.reports.map((r) => (r.id === updated.id ? updated : r));
        if (state.selectedReport && state.selectedReport.id === updated.id) {
          state.selectedReport = updated;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete report
      .addCase(deleteReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = state.reports.filter((r) => r.id !== action.payload.id);
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get report analytics
      .addCase(getReportAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReportAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getReportAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedReport } = reportSlice.actions;
export default reportSlice.reducer;
