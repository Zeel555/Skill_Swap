import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationsAPI,
  markNotificationReadAPI
} from "../../services/notificationService";

// Thunks
export const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async (_, thunkAPI) => {
    try {
      const notifications = await getNotificationsAPI();
      return notifications;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get notifications"
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (notificationId, thunkAPI) => {
    try {
      const notification = await markNotificationReadAPI(notificationId);
      return notification;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark Notification Read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n._id === action.payload._id
        );
        if (index !== -1) {
          state.notifications[index] = action.payload;
          if (!action.payload.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  }
});

export const { addNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;

