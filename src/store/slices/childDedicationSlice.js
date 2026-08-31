import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import childDedicationService from '../../services/api/childDedicationService';

export const fetchAllDedications = createAsyncThunk(
  'childDedication/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await childDedicationService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch child dedications' });
    }
  }
);

export const getDedicationById = createAsyncThunk(
  'childDedication/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await childDedicationService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch child dedication' });
    }
  }
);

export const createDedication = createAsyncThunk(
  'childDedication/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await childDedicationService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create child dedication' });
    }
  }
);

export const updateDedicationStatus = createAsyncThunk(
  'childDedication/updateStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await childDedicationService.updateStatus(id, status, rejectionReason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update status' });
    }
  }
);

export const deleteDedication = createAsyncThunk(
  'childDedication/delete',
  async (id, { rejectWithValue }) => {
    try {
      await childDedicationService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete child dedication' });
    }
  }
);

const initialState = {
  dedications: [],
  selectedDedication: null,
  isLoading: false,
  error: null,
  success: false,
};

const childDedicationSlice = createSlice({
  name: 'childDedication',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    clearSelected: (state) => { state.selectedDedication = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDedications.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAllDedications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dedications = action.payload;
      })
      .addCase(fetchAllDedications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch child dedications';
      })
      .addCase(getDedicationById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getDedicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDedication = action.payload;
      })
      .addCase(getDedicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch child dedication';
      })
      .addCase(createDedication.pending, (state) => { state.isLoading = true; state.error = null; state.success = false; })
      .addCase(createDedication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.dedications.unshift(action.payload);
      })
      .addCase(createDedication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create child dedication';
      })
      .addCase(updateDedicationStatus.pending, (state) => { state.isLoading = true; })
      .addCase(updateDedicationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const idx = state.dedications.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.dedications[idx] = action.payload;
        if (state.selectedDedication?.id === action.payload.id) {
          state.selectedDedication = action.payload;
        }
      })
      .addCase(updateDedicationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update status';
      })
      .addCase(deleteDedication.pending, (state) => { state.isLoading = true; })
      .addCase(deleteDedication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.dedications = state.dedications.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDedication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete child dedication';
      });
  },
});

export const { clearError, clearSuccess, clearSelected } = childDedicationSlice.actions;
export default childDedicationSlice.reducer;
