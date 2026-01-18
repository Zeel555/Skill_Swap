import { createAsyncThunk } from "@reduxjs/toolkit";
import { rateUserAPI, getUserRatingsAPI } from "../../services/ratingService";

// Submit rating
export const rateUser = createAsyncThunk(
  "rating/rateUser",
  async (data, thunkAPI) => {
    try {
      const result = await rateUserAPI(data);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to rate user"
      );
    }
  }
);

// Get user ratings
export const getUserRatings = createAsyncThunk(
  "rating/getUserRatings",
  async (userId, thunkAPI) => {
    try {
      const data = await getUserRatingsAPI(userId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get ratings"
      );
    }
  }
);

