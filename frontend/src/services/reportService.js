import api from "./api";

// Create a report
export const createReportAPI = async (reportData) => {
  const response = await api.post("/reports", reportData);
  return response.data;
};