import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import swapReducer from "../features/swaps/swapSlice";
import chatReducer from "../features/chat/chatSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import adminReducer from "../features/admin/adminSlice";
import ratingReducer from "../features/ratings/ratingSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  swap: swapReducer,
  chat: chatReducer,
  notification: notificationReducer,
  admin: adminReducer,
  rating: ratingReducer
});

export default rootReducer;

