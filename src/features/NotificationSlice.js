import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  transformNotification,
} from "@/services/NotificationService";

// Async thunks
export const fetchNotificationsThunk = createAsyncThunk(
  "notifications/fetch",
  async ({ userId, options = {} }, { rejectWithValue }) => {
    try {
      const data = await fetchNotifications(userId, options);
      return { notifications: data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const markAsReadThunk = createAsyncThunk(
  "notifications/markAsRead",
  async ({ userId, notificationIds }, { rejectWithValue }) => {
    try {
      await markNotificationsAsRead(userId, notificationIds);
      return { notificationIds, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const markAllAsReadThunk = createAsyncThunk(
  "notifications/markAllAsRead",
  async ({ userId }, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead(userId);
      return { userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetched: null,
  currentUserId: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Add new notification from WebSocket
    addNotification: (state, action) => {
      const { notification, userId } = action.payload;
      const transformed = transformNotification(notification, userId);

      // Prevent duplicates
      const exists = state.notifications.some((n) => n.id === transformed.id);
      if (!exists) {
        state.notifications.unshift(transformed);
        if (transformed.unread) {
          state.unreadCount += 1;
        }
      }
    },
    // Mark single notification as read (local state)
    markRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find((n) => n.id === notificationId);
      if (notification && notification.unread) {
        notification.unread = false;
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    // Mark all as read (local state)
    markAllRead: (state) => {
      state.notifications.forEach((n) => {
        n.unread = false;
        n.read = true;
      });
      state.unreadCount = 0;
    },
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.lastFetched = null;
    },
    // Set current user ID
    setCurrentUserId: (state, action) => {
      state.currentUserId = action.payload;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        const { notifications, userId } = action.payload;
        state.loading = false;
        state.currentUserId = userId;
        state.notifications = Array.isArray(notifications)
          ? notifications.map((n) => transformNotification(n, userId))
          : [];
        state.unreadCount = state.notifications.filter((n) => n.unread).length;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const { notificationIds, userId } = action.payload;
        notificationIds.forEach((id) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && notification.unread) {
            notification.unread = false;
            notification.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      })
      // Mark all as read
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.unread = false;
          n.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const {
  addNotification,
  markRead,
  markAllRead,
  clearNotifications,
  setCurrentUserId,
  clearError,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;

export default notificationSlice.reducer;

