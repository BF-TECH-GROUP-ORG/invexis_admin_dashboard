import apiClient from "@/lib/apiClient";

const CategoryService = {
  // Primary API (original name kept for backward compatibility)
  getAll: async (params = {}) => {
    return apiClient.get("/inventory/v1/categories", { params });
  },

  // Convenience alias used across the app
  getCategories: async (params = {}) => {
    return CategoryService.getAll(params);
  },

  getById: async (id) => {
    return apiClient.get(`/inventory/v1/categories/${id}`);
  },

  create: async (data) => {
    return apiClient.post("/inventory/v1/categories", data);
  },

  update: async (id, data) => {
    return apiClient.put(`/inventory/v1/categories/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/inventory/v1/categories/${id}`);
  },

  // Alias expected by components
  deleteCategory: async (id) => {
    return CategoryService.delete(id);
  },

  getLevel3ByCompany: async (companyId) => {
    return apiClient.get(
      `/inventory/v1/categories/company/${companyId}/level3`
    );
  },
};

export default CategoryService;
