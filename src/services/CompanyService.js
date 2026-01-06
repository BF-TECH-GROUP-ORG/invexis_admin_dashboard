import apiClient from "@/lib/apiClient";

const CompanyService = {
  // Core CRUD
  getAll: async (params = {}) => {
    return apiClient.get("/company/companies", { params });
  },

  getById: async (id) => {
    return apiClient.get(`/company/companies/${id}`);
  },

  create: async (data) => {
    return apiClient.post("/company/companies", data);
  },

  update: async (id, data) => {
    return apiClient.put(`/company/companies/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/company/companies/${id}`);
  },

  // Status & Tier
  changeStatus: async (id, status) => {
    return apiClient.patch(`/company/companies/${id}/status`, { status });
  },

  changeTier: async (id, tier) => {
    return apiClient.patch(`/company/companies/${id}/tier`, { tier });
  },

  reactivate: async (id) => {
    return apiClient.patch(`/company/companies/${id}/reactivate`);
  },

  // Verification
  uploadVerificationDocs: async (id, formData) => {
    // formData should be an instance of FormData if sending files
    return apiClient.post(
      `/company/companies/${id}/verification-docs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  reviewVerification: async (id, decision, reviewNotes = "") => {
    return apiClient.patch(`/company/companies/${id}/verification`, {
      decision,
      reviewNotes,
    });
  },

  // Categories
  addCategories: async (id, categoryIds) => {
    return apiClient.post(`/company/companies/${id}/categories`, {
      categoryIds,
    });
  },

  setCategories: async (id, categoryIds) => {
    return apiClient.put(`/company/companies/${id}/categories`, {
      categoryIds,
    });
  },

  removeCategories: async (id, categoryIds) => {
    return apiClient.delete(`/company/companies/${id}/categories`, {
      data: { categoryIds },
    });
  },
};

export default CompanyService;
