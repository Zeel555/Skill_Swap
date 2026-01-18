import api from "./api";

// Send a message
export const sendMessageAPI = async (data) => {
  const response = await api.post("/chat", data);
  return response.data;
};

// Get chat with specific user
export const getChatAPI = async (userId) => {
  const response = await api.get(`/chat/${userId}`);
  return response.data;
};

