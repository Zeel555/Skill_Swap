import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSwapAPI,
  getMySwapsAPI,
  getSwapHistoryAPI,
  updateSwapStatusAPI
} from "../../services/swapService";

// Thunks
export const createSwap = createAsyncThunk(
  "swap/createSwap",
  async (data, thunkAPI) => {
    try {
      const swap = await createSwapAPI(data);
      return swap;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create swap"
      );
    }
  }
);

export const getMySwaps = createAsyncThunk(
  "swap/getMySwaps",
  async (_, thunkAPI) => {
    try {
      const swaps = await getMySwapsAPI();
      return swaps;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get swaps"
      );
    }
  }
);

export const getSwapHistory = createAsyncThunk(
  "swap/getSwapHistory",
  async (_, thunkAPI) => {
    try {
      const swaps = await getSwapHistoryAPI();
      return swaps;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get swap history"
      );
    }
  }
);

export const updateSwapStatus = createAsyncThunk(
  "swap/updateSwapStatus",
  async ({ swapId, status }, thunkAPI) => {
    try {
      const swap = await updateSwapStatusAPI(swapId, status);
      return swap;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update swap"
      );
    }
  }
);

const initialState = {
  swaps: [],
  history: [],
  loading: false,
  error: null
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addSwap: (state, action) => {
      state.swaps.unshift(action.payload);
    },
    updateSwap: (state, action) => {
      const index = state.swaps.findIndex(
        (s) => s._id === action.payload._id
      );
      if (index !== -1) {
        state.swaps[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Swap
      .addCase(createSwap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSwap.fulfilled, (state, action) => {
        state.loading = false;
        state.swaps.unshift(action.payload);
      })
      .addCase(createSwap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Swaps
      .addCase(getMySwaps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMySwaps.fulfilled, (state, action) => {
        state.loading = false;
        state.swaps = action.payload;
      })
      .addCase(getMySwaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Swap History
      .addCase(getSwapHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSwapHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getSwapHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Swap Status
      .addCase(updateSwapStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSwapStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.swaps.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.swaps[index] = action.payload;
        }
      })
      .addCase(updateSwapStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, addSwap, updateSwap } = swapSlice.actions;
export default swapSlice.reducer;

