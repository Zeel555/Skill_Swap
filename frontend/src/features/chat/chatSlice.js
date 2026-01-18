import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessageAPI, getChatAPI } from "../../services/chatService";

// Thunks
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (data, thunkAPI) => {
    try {
      const message = await sendMessageAPI(data);
      return message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

export const getChat = createAsyncThunk(
  "chat/getChat",
  async (userId, thunkAPI) => {
    try {
      const messages = await getChatAPI(userId);
      return { userId, messages };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get chat"
      );
    }
  }
);

const initialState = {
  chats: {}, // { userId: [messages] }
  activeChat: null,
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      const { userId, message } = action.payload;
      if (!state.chats[userId]) {
        state.chats[userId] = [];
      }
      state.chats[userId].push(message);
    },
    clearChat: (state) => {
      state.activeChat = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message = action.payload;
        const userId =
          message.receiver === state.activeChat
            ? message.receiver
            : message.sender;
        if (!state.chats[userId]) {
          state.chats[userId] = [];
        }
        state.chats[userId].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Chat
      .addCase(getChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChat.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, messages } = action.payload;
        state.chats[userId] = messages;
        state.activeChat = userId;
      })
      .addCase(getChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setActiveChat, addMessage, clearChat, clearError } =
  chatSlice.actions;
export default chatSlice.reducer;

