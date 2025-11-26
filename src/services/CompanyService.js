import api from "../lib/axios";

const CompanyService = {
  // Core CRUD
  getAll: async (params = {}) => {
    const res = await api.get("/company/companies", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/company/companies/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/company/companies", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/company/companies/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/company/companies/${id}`);
    return res.data;
  },

  // Status & Tier
  changeStatus: async (id, status) => {
    const res = await api.patch(`/company/companies/${id}/status`, { status });
    return res.data;
  },

  changeTier: async (id, tier) => {
    const res = await api.patch(`/company/companies/${id}/tier`, { tier });
    return res.data;
  },

  reactivate: async (id) => {
    const res = await api.patch(`/company/companies/${id}/reactivate`);
    return res.data;
  },

  // Verification
  uploadVerificationDocs: async (id, formData) => {
    // formData should be an instance of FormData if sending files
    const res = await api.post(`/company/companies/${id}/verification-docs`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  reviewVerification: async (id, decision, reviewNotes = "") => {
    const res = await api.patch(`/company/companies/${id}/verification`, { decision, reviewNotes });
    return res.data;
  },

  // Categories
  addCategories: async (id, categoryIds) => {
    const res = await api.post(`/company/companies/${id}/categories`, { categoryIds });
    return res.data;
  },

  setCategories: async (id, categoryIds) => {
    const res = await api.put(`/company/companies/${id}/categories`, { categoryIds });
    return res.data;
  },

  removeCategories: async (id, categoryIds) => {
    const res = await api.delete(`/company/companies/${id}/categories`, { data: { categoryIds } });
    return res.data;
  },
};

export default CompanyService;
