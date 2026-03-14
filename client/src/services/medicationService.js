import api from "./api";

export const medicationService = {
  getInfo: (query) => api.get("/api/medications", { params: { q: query } }),
};
