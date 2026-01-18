import api from "./api";

// ⭐ Submit Rating
// POST /api/ratings
export const rateUserAPI = async (data) => {
  const response = await api.post("/ratings", data);
  return response.data;
};

// ⭐ Get User Ratings
// GET /api/ratings/:userId
export const getUserRatingsAPI = async (userId) => {
  const response = await api.get(`/ratings/${userId}`);
  return response.data;
};

