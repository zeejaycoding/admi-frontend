import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/api/notificationService';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data?.unread ?? 0;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch unread count' });
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notification/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notifications read' });
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notification/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification read' });
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    upsertNotification: (state, action) => {
      const incoming = action.payload;
      if (!incoming) return;
      state.notifications = [
        incoming,
        ...state.notifications.filter((n) => n.id !== incoming.id),
      ].slice(0, 50);
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload ?? 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload || [];
        state.unreadCount = (action.payload || []).filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload ?? 0;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }));
        state.unreadCount = 0;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true, readAt: new Date().toISOString() } : n
        );
        state.unreadCount = Math.max(0, state.notifications.filter((n) => !n.read).length);
      });
  },
});

export const { clearError, upsertNotification, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
