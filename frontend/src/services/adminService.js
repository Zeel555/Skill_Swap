import api from "./api";

// Get admin dashboard stats
export const getAdminDashboardAPI = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// Get all swaps (with optional status filter)
export const getAllSwapsAPI = async (status) => {
  const url = status ? `/admin/swaps?status=${status}` : "/admin/swaps";
  const response = await api.get(url);
  return response.data;
};

// Delete swap
export const deleteSwapAPI = async (swapId) => {
  const response = await api.delete(`/admin/swaps/${swapId}`);
  return response.data;
};

// Update user role
export const updateUserRoleAPI = async (userId, role) => {
  const response = await api.put(`/admin/users/role/${userId}`, { role });
  return response.data;
};

// Get all users (admin)
export const getAllUsersAPI = async (page = 1, limit = 10) => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

// Block/Unblock user
export const blockUserAPI = async (userId, isBlocked) => {
  const response = await api.put(`/users/block/${userId}`, { isBlocked });
  return response.data;
};

// Get all reports
export const getAllReportsAPI = async (query = "") => {
  const response = await api.get(`/admin/reports${query}`);
  return response.data;
};

// Resolve report
export const resolveReportAPI = async (reportId, data) => {
  const response = await api.put(`/admin/reports/${reportId}/resolve`, data);
  return response.data;
};

// Delete user
export const deleteUserAPI = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Send admin notification to users
export const sendAdminNotificationAPI = async (data) => {
  const response = await api.post("/admin/notifications", data);
  return response.data;
};

// Get admin history
export const getAdminHistoryAPI = async () => {
  const response = await api.get("/admin/history");
  return response.data;
};

