import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import travelFormService from '../../services/api/travelFormService';

export const fetchAllTravelForms = createAsyncThunk(
  'travelForm/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await travelFormService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch travel forms' });
    }
  }
);

export const getTravelFormById = createAsyncThunk(
  'travelForm/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await travelFormService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch travel form' });
    }
  }
);

export const createTravelForm = createAsyncThunk(
  'travelForm/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await travelFormService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create travel form' });
    }
  }
);

export const updateTravelFormStatus = createAsyncThunk(
  'travelForm/updateStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await travelFormService.updateStatus(id, status, rejectionReason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update status' });
    }
  }
);

export const deleteTravelForm = createAsyncThunk(
  'travelForm/delete',
  async (id, { rejectWithValue }) => {
    try {
      await travelFormService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete travel form' });
    }
  }
);

export const fetchTravelFormStats = createAsyncThunk(
  'travelForm/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await travelFormService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch stats' });
    }
  }
);

const initialState = {
  travelForms: [],
  selectedTravelForm: null,
  stats: null,
  isLoading: false,
  error: null,
  success: false,
};

const travelFormSlice = createSlice({
  name: 'travelForm',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    clearSelected: (state) => { state.selectedTravelForm = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTravelForms.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAllTravelForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.travelForms = action.payload;
      })
      .addCase(fetchAllTravelForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch travel forms';
      })
      .addCase(getTravelFormById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getTravelFormById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTravelForm = action.payload;
      })
      .addCase(getTravelFormById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch travel form';
      })
      .addCase(createTravelForm.pending, (state) => { state.isLoading = true; state.error = null; state.success = false; })
      .addCase(createTravelForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.travelForms.unshift(action.payload);
      })
      .addCase(createTravelForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create travel form';
      })
      .addCase(updateTravelFormStatus.pending, (state) => { state.isLoading = true; })
      .addCase(updateTravelFormStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const idx = state.travelForms.findIndex((f) => f.id === action.payload.id);
        if (idx !== -1) state.travelForms[idx] = action.payload;
        if (state.selectedTravelForm?.id === action.payload.id) {
          state.selectedTravelForm = action.payload;
        }
      })
      .addCase(updateTravelFormStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update status';
      })
      .addCase(deleteTravelForm.pending, (state) => { state.isLoading = true; })
      .addCase(deleteTravelForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.travelForms = state.travelForms.filter((f) => f.id !== action.payload);
      })
      .addCase(deleteTravelForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete travel form';
      })
      .addCase(fetchTravelFormStats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTravelFormStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTravelFormStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch stats';
      });
  },
});

export const { clearError, clearSuccess, clearSelected } = travelFormSlice.actions;
export default travelFormSlice.reducer;
