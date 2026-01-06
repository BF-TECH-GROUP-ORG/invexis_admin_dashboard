import apiClient from "@/lib/apiClient";

/**
 * CompanyUserService - Manages user-company relationship operations
 * Handles assigning users to companies, role management within companies,
 * and user status updates (suspend/activate/remove)
 */
const CompanyUserService = {
  /**
   * Assign a user to a company with a specific role
   * @param {Object} data - Assignment data
   * @param {string} data.company_id - Company ID
   * @param {string} data.user_id - User ID
   * @param {string} data.role_id - Role ID within the company
   * @param {string} [data.status='active'] - User status (active | suspended)
   * @param {string} [data.createdBy] - ID of admin who created the assignment
   * @returns {Promise<Object>} Created company-user relationship
   */
  assignUserToCompany: async (data) => {
    return apiClient.post("/company/company-users", data);
  },

  /**
   * Get all users assigned to a specific company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} List of users in the company
   */
  getUsersByCompany: async (companyId) => {
    return apiClient.get(`/company/company-users/company/${companyId}`);
  },

  /**
   * Get all company-user relationships (optionally paginated)
   * @param {Object} params - query params (page, limit, search, companyId)
   */
  getAll: async (params = {}) => {
    return apiClient.get(`/company/company-users`, { params });
  },

  /**
   * Get all companies a user is assigned to
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of companies the user belongs to
   */
  getCompaniesByUser: async (userId) => {
    return apiClient.get(`/company/company-users/user/${userId}`);
  },

  /**
   * Get specific user-company relationship details
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User-company relationship details
   */
  getUserCompanyRelation: async (companyId, userId) => {
    return apiClient.get(
      `/company/company-users/company/${companyId}/user/${userId}`
    );
  },

  /**
   * Update a user's role within a company
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @param {string} roleId - New role ID
   * @returns {Promise<Object>} Updated relationship
   */
  updateUserRole: async (companyId, userId, roleId) => {
    return apiClient.patch(
      `/company/company-users/company/${companyId}/user/${userId}/role`,
      {
        role_id: roleId,
      }
    );
  },

  /**
   * Suspend a user in a specific company
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated relationship with suspended status
   */
  suspendUser: async (companyId, userId) => {
    return apiClient.patch(
      `/company/company-users/company/${companyId}/user/${userId}/suspend`
    );
  },

  /**
   * Remove a user from a company (delete the relationship)
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  removeUserFromCompany: async (companyId, userId) => {
    return apiClient.delete(
      `/company/company-users/company/${companyId}/user/${userId}`
    );
  },
};

export default CompanyUserService;
