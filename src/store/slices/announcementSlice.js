import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import announcementService from '../../services/api/announcementService';

export const fetchAllAnnouncements = createAsyncThunk(
  'announcement/fetchAllAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await announcementService.getAllAnnouncements();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch announcements' });
    }
  }
);

export const fetchRecipientAnnouncements = createAsyncThunk(
  'announcement/fetchRecipientAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await announcementService.getRecipientAnnouncements();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch announcements' });
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcement/createAnnouncement',
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await announcementService.createAnnouncement(announcementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send announcement' });
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcement/deleteAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      await announcementService.deleteAnnouncement(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete announcement' });
    }
  }
);

const initialState = {
  announcements: [],
  recipientAnnouncements: [],
  isLoading: false,
  error: null,
  success: false,
};

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAnnouncements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.announcements = action.payload || [];
      })
      .addCase(fetchAllAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecipientAnnouncements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipientAnnouncements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipientAnnouncements = action.payload || [];
      })
      .addCase(fetchRecipientAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createAnnouncement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        if (action.payload) {
          state.announcements.unshift(action.payload);
        }
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteAnnouncement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.announcements = state.announcements.filter((a) => a.id !== action.payload);
        state.recipientAnnouncements = state.recipientAnnouncements.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = announcementSlice.actions;
export default announcementSlice.reducer;
