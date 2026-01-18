import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createReportAPI } from "../../services/reportService";
import {
    getProfileAPI,
    getMatchedUsersAPI,
    getRecommendedUsersAPI,
    getUserByIdAPI,
    getUserDashboardAPI,
    getUserHistoryAPI,
    searchUsersAPI,
    updateProfileAPI
} from "../../services/userService";

// Thunks
export const getProfile = createAsyncThunk(
  "user/getProfile",
  async (_, thunkAPI) => {
    try {
      const data = await getProfileAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get profile"
      );
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, thunkAPI) => {
    try {
      const data = await getUserByIdAPI(userId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get user"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, thunkAPI) => {
    try {
      const updated = await updateProfileAPI(data);
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (skill, thunkAPI) => {
    try {
      const data = await searchUsersAPI(skill);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to search users"
      );
    }
  }
);

export const getMatchedUsers = createAsyncThunk(
  "user/getMatchedUsers",
  async (_, thunkAPI) => {
    try {
      const data = await getMatchedUsersAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get matched users"
      );
    }
  }
);

export const getUserDashboard = createAsyncThunk(
  "user/getUserDashboard",
  async (_, thunkAPI) => {
    try {
      const data = await getUserDashboardAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get dashboard"
      );
    }
  }
);

export const getRecommendedUsers = createAsyncThunk(
  "user/getRecommendedUsers",
  async (_, thunkAPI) => {
    try {
      const data = await getRecommendedUsersAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get recommendations"
      );
    }
  }
);

export const getUserHistory = createAsyncThunk(
  "user/getUserHistory",
  async (_, thunkAPI) => {
    try {
      const data = await getUserHistoryAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get history"
      );
    }
  }
);

export const createReport = createAsyncThunk(
  "user/createReport",
  async (reportData, thunkAPI) => {
    try {
      const data = await createReportAPI(reportData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create report"
      );
    }
  }
);

const initialState = {
  profile: null,
  selectedUser: null,
  dashboard: null,
  searchResults: [],
  matchedUsers: [],
  recommendedUsers: [],
  history: [],
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Matched Users
      .addCase(getMatchedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMatchedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedUsers = action.payload;
      })
      .addCase(getMatchedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Dashboard
      .addCase(getUserDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(getUserDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Recommended Users
      .addCase(getRecommendedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecommendedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedUsers = action.payload;
      })
      .addCase(getRecommendedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User History
      .addCase(getUserHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getUserHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally show success message or update UI
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSearchResults, clearError } = userSlice.actions;
export default userSlice.reducer;

