import api from "./api";

// Get user profile
export const getProfileAPI = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update user profile
export const updateProfileAPI = async (data) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

// Search users by skill
export const searchUsersAPI = async (skill) => {
  const response = await api.get(`/users/search?skill=${skill}`);
  return response.data;
};

// Get matched users (skill matching)
export const getMatchedUsersAPI = async () => {
  const response = await api.get("/users/match");
  return response.data;
};

// Get user dashboard stats
export const getUserDashboardAPI = async () => {
  const response = await api.get("/users/dashboard");
  return response.data;
};

// Get recommended users
export const getRecommendedUsersAPI = async () => {
  const response = await api.get("/users/recommendations");
  return response.data;
};

// Get user by ID
export const getUserByIdAPI = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Get user history
export const getUserHistoryAPI = async () => {
  const response = await api.get("/users/history");
  return response.data;
};

