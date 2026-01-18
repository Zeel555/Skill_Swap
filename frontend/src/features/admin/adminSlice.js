import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    blockUserAPI,
    deleteSwapAPI,
    getAdminDashboardAPI,
    getAdminHistoryAPI,
    getAllReportsAPI,
    getAllSwapsAPI,
    getAllUsersAPI,
    resolveReportAPI,
    sendAdminNotificationAPI,
    updateUserRoleAPI
} from "../../services/adminService";

// Thunks
export const getAdminDashboard = createAsyncThunk(
  "admin/getAdminDashboard",
  async (_, thunkAPI) => {
    try {
      const data = await getAdminDashboardAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get admin dashboard"
      );
    }
  }
);

export const getAllSwaps = createAsyncThunk(
  "admin/getAllSwaps",
  async (status, thunkAPI) => {
    try {
      const swaps = await getAllSwapsAPI(status);
      return swaps;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get swaps"
      );
    }
  }
);

export const deleteSwap = createAsyncThunk(
  "admin/deleteSwap",
  async (swapId, thunkAPI) => {
    try {
      await deleteSwapAPI(swapId);
      return swapId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete swap"
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, role }, thunkAPI) => {
    try {
      const user = await updateUserRoleAPI(userId, role);
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update user role"
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async ({ page, limit }, thunkAPI) => {
    try {
      const data = await getAllUsersAPI(page, limit);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get users"
      );
    }
  }
);

export const blockUser = createAsyncThunk(
  "admin/blockUser",
  async ({ userId, isBlocked }, thunkAPI) => {
    try {
      const user = await blockUserAPI(userId, isBlocked);
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to block user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, thunkAPI) => {
    try {
      await deleteUserAPI(userId);
      return userId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

export const getAllReports = createAsyncThunk(
  "admin/getAllReports",
  async (filters = {}, thunkAPI) => {
    try {
      const { status } = filters;
      const query = status ? `?status=${status}` : "";
      const response = await getAllReportsAPI(query);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get reports"
      );
    }
  }
);

export const resolveReport = createAsyncThunk(
  "admin/resolveReport",
  async ({ reportId, action }, thunkAPI) => {
    try {
      const response = await resolveReportAPI(reportId, { action });
      return response.report;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to resolve report"
      );
    }
  }
);

export const sendAdminNotification = createAsyncThunk(
  "admin/sendAdminNotification",
  async (data, thunkAPI) => {
    try {
      const result = await sendAdminNotificationAPI(data);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send notification"
      );
    }
  }
);

export const getAdminHistory = createAsyncThunk(
  "admin/getAdminHistory",
  async (_, thunkAPI) => {
    try {
      const data = await getAdminHistoryAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get admin history"
      );
    }
  }
);

const initialState = {
  dashboard: null,
  swaps: [],
  users: [],
  reports: [],
  history: {
    swaps: [],
    reports: []
  },
  pagination: {
    page: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  error: null
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Admin Dashboard
      .addCase(getAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(getAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Swaps
      .addCase(getAllSwaps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSwaps.fulfilled, (state, action) => {
        state.loading = false;
        state.swaps = action.payload;
      })
      .addCase(getAllSwaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Swap
      .addCase(deleteSwap.fulfilled, (state, action) => {
        state.swaps = state.swaps.filter((s) => s._id !== action.payload);
      })
      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        };
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Block User
      .addCase(blockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Get All Reports
      .addCase(getAllReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(getAllReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resolve Report
      .addCase(resolveReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      // Get Admin History
      .addCase(getAdminHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getAdminHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

