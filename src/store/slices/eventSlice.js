import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventService from '../../services/api/eventService';

export const fetchAllEvents = createAsyncThunk(
  'event/fetchAllEvents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await eventService.getAllEvents(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch events' });
    }
  }
);

export const getEventById = createAsyncThunk(
  'event/getEventById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch event' });
    }
  }
);

export const searchEvents = createAsyncThunk(
  'event/searchEvents',
  async ({ searchTerm, module, page, size }, { rejectWithValue }) => {
    try {
      const response = await eventService.searchEvents(searchTerm, module, page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to search events' });
    }
  }
);

export const createEvent = createAsyncThunk(
  'event/createEvent',
  async ({ eventData, thumbnailFile }, { rejectWithValue }) => {
    try {
      const response = await eventService.createEvent(eventData, thumbnailFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create event' });
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ id, updateData, thumbnailFile }, { rejectWithValue }) => {
    try {
      const response = await eventService.updateEvent(id, updateData, thumbnailFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update event' });
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'event/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventService.deleteEvent(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete event' });
    }
  }
);

export const getEventAnalytics = createAsyncThunk(
  'event/getEventAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

const initialState = {
  events: [],
  selectedEvent: null,
  analytics: null,
  isLoading: false,
  error: null,
  success: false,
  pagination: {
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0,
  },
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all events
      .addCase(fetchAllEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.content) {
          state.events = action.payload.content;
          state.pagination = {
            page: action.payload.pageable?.pageNumber || 0,
            size: action.payload.pageable?.pageSize || 25,
            totalElements: action.payload.totalElements || 0,
            totalPages: action.payload.totalPages || 0,
          };
        } else if (Array.isArray(action.payload)) {
          state.events = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch events';
      })

      // Get event by ID
      .addCase(getEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch event';
      })

      // Search events
      .addCase(searchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.content) {
          state.events = action.payload.content;
          state.pagination = {
            page: action.payload.pageable?.pageNumber || 0,
            size: action.payload.pageable?.pageSize || 25,
            totalElements: action.payload.totalElements || 0,
            totalPages: action.payload.totalPages || 0,
          };
        }
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to search events';
      })

      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.unshift(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create event';
        state.success = false;
      })

      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.selectedEvent = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update event';
        state.success = false;
      })

      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = state.events.filter((e) => e.id !== action.meta.arg);
        state.success = true;
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete event';
      })

      // Analytics
      .addCase(getEventAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEventAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getEventAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics';
      });
  },
});

export const { clearError, clearSuccess, clearSelectedEvent } = eventSlice.actions;
export default eventSlice.reducer;
