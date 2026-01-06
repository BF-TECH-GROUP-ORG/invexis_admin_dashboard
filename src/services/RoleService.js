import apiClient from "@/lib/apiClient";

/**
 * RoleService - Manages company-specific roles and permissions
 * Handles creating, updating, and managing roles within companies
 */
const RoleService = {
  /**
   * Create a new role for a company
   */
  create: async (data) => {
    return apiClient.post("/company/roles", data);
  },

  /**
   * Get all roles for a specific company
   */
  getRolesByCompany: async (companyId) => {
    return apiClient.get(`/company/roles/company/${companyId}`);
  },

  /**
   * Find a role by name within a company
   */
  getRoleByName: async (companyId, name) => {
    return apiClient.get(`/company/roles/company/${companyId}/name/${name}`);
  },

  /**
   * Get a specific role by ID
   */
  getById: async (id) => {
    return apiClient.get(`/company/roles/${id}`);
  },

  /**
   * Update a role
   */
  update: async (id, data) => {
    return apiClient.put(`/company/roles/${id}`, data);
  },

  /**
   * Delete a role
   */
  delete: async (id) => {
    return apiClient.delete(`/company/roles/${id}`);
  },

  /**
   * Add a permission to a role
   */
  addPermission: async (id, permission) => {
    return apiClient.post(`/company/roles/${id}/permissions`, { permission });
  },

  /**
   * Remove a permission from a role
   */
  removePermission: async (id, permission) => {
    return apiClient.delete(`/company/roles/${id}/permissions`, {
      data: { permission },
    });
  },
};

export default RoleService;
