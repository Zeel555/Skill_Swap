import api from "./api";

// Create swap request
export const createSwapAPI = async (data) => {
  const response = await api.post("/swaps", data);
  return response.data;
};

// Get my swaps
export const getMySwapsAPI = async () => {
  const response = await api.get("/swaps/my");
  return response.data;
};

// Get swap history
export const getSwapHistoryAPI = async () => {
  const response = await api.get("/swaps/history");
  return response.data;
};

// Update swap status (accept/reject/complete)
export const updateSwapStatusAPI = async (swapId, status) => {
  const response = await api.put(`/swaps/${swapId}`, { status });
  return response.data;
};

