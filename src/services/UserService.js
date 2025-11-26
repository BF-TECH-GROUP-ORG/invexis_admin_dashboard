import api from "../lib/axios";

const UserService = {
  // Public
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  // Protected User Routes
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put("/auth/me", data);
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete("/auth/me");
    return res.data;
  },

  // Admin Routes
  getAll: async (params = {}) => {
    // Allow callers to pass in params (including role) but do not force a default role here.
    // Forcing role='super_admin' caused 500s when the endpoint rejected that param from non-admin contexts.
    const res = await api.get("/auth/users", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/auth/users/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/auth/users", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/auth/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
  },
  bulkUpdate: async (data) => {
    const res = await api.post("/auth/users/bulk", data);
    return res.data;
  },
  unlock: async (id) => {
    const res = await api.post(`/auth/users/${id}/unlock`);
    return res.data;
  },
  verify: async (id) => {
    const res = await api.post(`/auth/verify/${id}`);
    return res.data;
  },
};

export default UserService;
