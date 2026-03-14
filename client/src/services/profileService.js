import api from "./api";

export const profileService = {
  create: (data) => api.post("/api/profile", data),
  get: (id) => api.get(`/api/profile/${id}`),
  update: (id, data) => api.put(`/api/profile/${id}`, data),
};
