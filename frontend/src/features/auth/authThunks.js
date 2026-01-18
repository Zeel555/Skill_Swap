import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    forgotPasswordAPI,
    loginAPI,
    registerAPI,
    resetPasswordAPI
} from "../../services/authService";
import { mapLoginError } from "../../utils/errorMessages";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await loginAPI(data);
      localStorage.setItem("token", res.token);
      return res;
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Login failed";
      const userFriendlyMessage = mapLoginError(backendMessage);
      return thunkAPI.rejectWithValue(userFriendlyMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await registerAPI(data);
      localStorage.setItem("token", res.token);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Register failed"
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await forgotPasswordAPI(email);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, thunkAPI) => {
    try {
      const res = await resetPasswordAPI(token, { password });
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);
