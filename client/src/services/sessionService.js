import api from "./api";

export const sessionService = {
  start: (data) => api.post("/api/session/start", data),
  checkIn: (data) => api.post("/api/session/checkin", data),
  end: (sessionId) => api.post("/api/session/end", { session_id: sessionId }),
  getReport: (sessionId) => api.get(`/api/session/report/${sessionId}`),
  breakdown: (task) => api.post("/api/session/breakdown", { task }),
};
