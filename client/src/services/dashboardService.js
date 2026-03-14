import api from "./api";

export const dashboardService = {
  get: (userId) => api.get(`/api/dashboard/${userId}`),
};
