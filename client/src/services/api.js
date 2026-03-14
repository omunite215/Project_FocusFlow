import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s — accounts for Render cold starts
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: integrate with toast notifications
    console.error("[API Error]", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
