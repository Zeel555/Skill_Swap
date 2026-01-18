/**
 * Get the API URL for the backend
 * Supports both localhost and network IP connections
 */
export const getApiUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== "") {
    return import.meta.env.VITE_API_URL.replace("/api", "");
  }

  // Check if we're accessing from a network IP (not localhost)
  const hostname = window.location.hostname;
  
  // If accessing via network IP, use that for backend too
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const port = window.location.port || (protocol === "https:" ? "443" : "80");
    // Backend typically runs on port 5000
    const backendPort = import.meta.env.VITE_BACKEND_PORT || "5000";
    return `${protocol}//${hostname}:${backendPort}`;
  }

  // Default to localhost
  return "http://localhost:5000";
};

/**
 * Get the API base URL with /api prefix
 */
export const getApiBaseUrl = () => {
  const baseUrl = getApiUrl();
  return `${baseUrl}/api`;
};

