import api from "./api";

export const loginAPI = async (data) => {
  const response = await api.post("/auth/login", data);
  // ✅ RETURN ONLY DATA (token saved in thunk)
  return response.data;
};

export const registerAPI = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordAPI = async (token, data) => {
  const response = await api.put(`/auth/reset-password/${token}`, data);
  return response.data;
};
