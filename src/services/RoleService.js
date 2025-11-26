import api from "../lib/axios";

/**
 * RoleService - Manages company-specific roles and permissions
 * Handles creating, updating, and managing roles within companies
 */
const RoleService = {
  /**
   * Create a new role for a company
   * @param {Object} data - Role data
   * @param {string} data.name - Role name
   * @param {string} data.company_id - Company ID this role belongs to
   * @param {string} [data.description] - Role description
   * @param {Array<string>} [data.permissions] - Array of permission strings
   * @returns {Promise<Object>} Created role
   */
  create: async (data) => {
    const res = await api.post("/company/roles", data);
    return res.data;
  },

  /**
   * Get all roles for a specific company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} List of roles in the company
   */
  getRolesByCompany: async (companyId) => {
    const res = await api.get(`/company/roles/company/${companyId}`);
    return res.data;
  },

  /**
   * Find a role by name within a company
   * @param {string} companyId - Company ID
   * @param {string} name - Role name
   * @returns {Promise<Object>} Role matching the name
   */
  getRoleByName: async (companyId, name) => {
    const res = await api.get(`/company/roles/company/${companyId}/name/${name}`);
    return res.data;
  },

  /**
   * Get a specific role by ID
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Role details
   */
  getById: async (id) => {
    const res = await api.get(`/company/roles/${id}`);
    return res.data;
  },

  /**
   * Update a role
   * @param {string} id - Role ID
   * @param {Object} data - Updated role data
   * @returns {Promise<Object>} Updated role
   */
  update: async (id, data) => {
    const res = await api.put(`/company/roles/${id}`, data);
    return res.data;
  },

  /**
   * Delete a role
   * @param {string} id - Role ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  delete: async (id) => {
    const res = await api.delete(`/company/roles/${id}`);
    return res.data;
  },

  /**
   * Add a permission to a role
   * @param {string} id - Role ID
   * @param {string} permission - Permission to add
   * @returns {Promise<Object>} Updated role with new permission
   */
  addPermission: async (id, permission) => {
    const res = await api.post(`/company/roles/${id}/permissions`, { permission });
    return res.data;
  },

  /**
   * Remove a permission from a role
   * @param {string} id - Role ID
   * @param {string} permission - Permission to remove
   * @returns {Promise<Object>} Updated role without the permission
   */
  removePermission: async (id, permission) => {
    const res = await api.delete(`/company/roles/${id}/permissions`, { 
      data: { permission } 
    });
    return res.data;
  },
};

export default RoleService;
