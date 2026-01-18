import axios from "axios";

// ✅ Get backend URL (supports localhost and network IP)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== "") {
    return import.meta.env.VITE_API_URL;
  }
  
  // If accessing from network IP, use that for backend
  const hostname = window.location.hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const backendPort = import.meta.env.VITE_BACKEND_PORT || "5000";
    return `${protocol}//${hostname}:${backendPort}/api`;
  }
  
  return "http://localhost:5000/api";
};

const BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Handle expired token (but allow login failure)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
