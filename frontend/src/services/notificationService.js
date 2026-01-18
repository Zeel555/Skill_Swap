import api from "./api";

// Get my notifications
export const getNotificationsAPI = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// Mark notification as read
export const markNotificationReadAPI = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}`);
  return response.data;
};

