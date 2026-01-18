import { createSlice } from "@reduxjs/toolkit";
import { rateUser, getUserRatings } from "./ratingThunks";

const initialState = {
  loading: false,
  error: null,
  success: false,
  userRatings: null, // { avgRating, reviews }
  loadingRatings: false
};

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Rate User
      .addCase(rateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(rateUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(rateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User Ratings
      .addCase(getUserRatings.pending, (state) => {
        state.loadingRatings = true;
        state.error = null;
      })
      .addCase(getUserRatings.fulfilled, (state, action) => {
        state.loadingRatings = false;
        state.userRatings = action.payload;
      })
      .addCase(getUserRatings.rejected, (state, action) => {
        state.loadingRatings = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = ratingSlice.actions;
export default ratingSlice.reducer;

