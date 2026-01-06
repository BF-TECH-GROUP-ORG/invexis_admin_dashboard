import apiClient from "@/lib/apiClient";

const UserService = {
  // Public
  register: async (data) => {
    return apiClient.post("/auth/register", data);
  },
  login: async (data) => {
    return apiClient.post("/auth/login", data);
  },

  // Protected User Routes
  getMe: async () => {
    return apiClient.get("/auth/me");
  },
  updateProfile: async (data) => {
    return apiClient.put("/auth/me", data);
  },
  deleteAccount: async () => {
    return apiClient.delete("/auth/me");
  },

  // Admin Routes
  getById: async (id) => {
    return apiClient.get(`/auth/users/${id}`);
  },
  create: async (data) => {
    return apiClient.post("/auth/register", data);
  },
  update: async (id, data) => {
    return apiClient.put(`/auth/users/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/auth/users/${id}`);
  },
  bulkUpdate: async (data) => {
    return apiClient.post("/auth/users/bulk", data);
  },
  unlock: async (id) => {
    return apiClient.post(`/auth/users/${id}/unlock`);
  },
  verify: async (id) => {
    return apiClient.post(`/auth/verify/${id}`);
  },
  getCompanyAdmins: async () => {
    return apiClient.get("/auth/users/company-admins");
  },
};

export default UserService;
