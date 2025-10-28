import api from "@/lib/axios";

export const login = (credentials) => api.post("/auth/login", credentials);
export const registerSuperAdmin = (payload) =>
  api.post("/auth/register", payload);
