import api from "../lib/axios";

const CategoryService = {
  // Primary API (original name kept for backward compatibility)
  getAll: async (params = {}) => {
    const res = await api.get("/inventory/v1/categories", { params });
    return res.data;
  },

  // Convenience alias used across the app
  getCategories: async (params = {}) => {
    return CategoryService.getAll(params);
  },

  getById: async (id) => {
    const res = await api.get(`/inventory/v1/categories/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/inventory/v1/categories", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/inventory/v1/categories/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/inventory/v1/categories/${id}`);
    return res.data;
  },

  // Alias expected by components
  deleteCategory: async (id) => {
    return CategoryService.delete(id);
  },

  getLevel3ByCompany: async (companyId) => {
    const res = await api.get(
      `/inventory/v1/categories/company/${companyId}/level3`
    );
    return res.data;
  },
};

export default CategoryService;
