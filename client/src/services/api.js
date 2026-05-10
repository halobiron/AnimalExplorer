import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

export const identifyAPI = {
  identify: (formData) =>
    api.post("/identify", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const collectionAPI = {
  getCollection: () => api.get("/collection"),
};

export const animalAPI = {
  getAll: () => api.get("/animals"),
};

export default api;
