import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import marriageCertificateService from '../../services/api/marriageCertificateService';

export const fetchAllCertificates = createAsyncThunk(
  'marriageCertificate/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marriageCertificateService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch marriage certificates' });
    }
  }
);

export const getCertificateById = createAsyncThunk(
  'marriageCertificate/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await marriageCertificateService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch marriage certificate' });
    }
  }
);

export const createCertificate = createAsyncThunk(
  'marriageCertificate/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await marriageCertificateService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create marriage certificate' });
    }
  }
);

export const deleteCertificate = createAsyncThunk(
  'marriageCertificate/delete',
  async (id, { rejectWithValue }) => {
    try {
      await marriageCertificateService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete marriage certificate' });
    }
  }
);

const initialState = {
  certificates: [],
  selectedCertificate: null,
  isLoading: false,
  error: null,
  success: false,
};

const marriageCertificateSlice = createSlice({
  name: 'marriageCertificate',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    clearSelected: (state) => { state.selectedCertificate = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCertificates.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAllCertificates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.certificates = action.payload;
      })
      .addCase(fetchAllCertificates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch marriage certificates';
      })
      .addCase(getCertificateById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(getCertificateById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCertificate = action.payload;
      })
      .addCase(getCertificateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch marriage certificate';
      })
      .addCase(createCertificate.pending, (state) => { state.isLoading = true; state.error = null; state.success = false; })
      .addCase(createCertificate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.certificates.unshift(action.payload);
      })
      .addCase(createCertificate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create marriage certificate';
      })
      .addCase(deleteCertificate.pending, (state) => { state.isLoading = true; })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.certificates = state.certificates.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCertificate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete marriage certificate';
      });
  },
});

export const { clearError, clearSuccess, clearSelected } = marriageCertificateSlice.actions;
export default marriageCertificateSlice.reducer;
