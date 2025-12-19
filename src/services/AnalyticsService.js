/**
 * Analytics Service
 * 
 * Provides functions to fetch analytics reports from the backend API.
 * Base URL: /api/analytics/reports/{category}/{reportName}
 */

import apiClient from "../../apiClient";

/**
 * Fetch analytics report from backend
 * @param {string} reportType - format: "{category}/{reportName}" (e.g., "sales/revenue")
 * @param {Object} filters - Filter object
 * @param {Object} filters.dateRange - Optional: { start: Date, end: Date }
 * @param {string} filters.period - Optional shortcut period: '24h', '7d', '30d', '90d', '1y'
 * @param {string} filters.interval - Optional interval: 'hour', 'day', 'week', 'month', 'year'
 * @param {string} filters.companyId - Optional company UUID filter
 * @returns {Promise<Object>} - JSON response from API
 */
export const getAnalyticsReport = async (reportType, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.dateRange?.start && filters.dateRange?.end) {
      params.append('startDate', filters.dateRange.start.toISOString());
      params.append('endDate', filters.dateRange.end.toISOString());
    } else if (filters.period) {
      params.append('period', filters.period);
    }

    if (filters.interval) params.append('interval', filters.interval);
    if (filters.companyId) params.append('companyId', filters.companyId);

    const url = `/analytics/reports/${reportType}${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log(`[Analytics Service] Fetching: ${url}`);
    const response = await apiClient.get(url);
    
    return response;
  } catch (error) {
    console.error(`[Analytics Service] Error fetching ${reportType}:`, error);
    throw error;
  }
};

/**
 * Fetch sales revenue report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Revenue data
 */
export const getSalesRevenue = async (filters = {}) => {
  return getAnalyticsReport('sales/revenue', filters);
};

/**
 * Fetch profitability report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Profitability data
 */
export const getProfitability = async (filters = {}) => {
  return getAnalyticsReport('sales/profitability', filters);
};

/**
 * Fetch payment methods report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Payment methods data
 */
export const getPaymentMethods = async (filters = {}) => {
  return getAnalyticsReport('sales/payment-methods', filters);
};

/**
 * Fetch top companies report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Top companies data
 */
export const getTopCompanies = async (filters = {}) => {
  return getAnalyticsReport('sales/top-companies', filters);
};

/**
 * Fetch inventory movement report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Inventory movement data
 */
export const getInventoryMovement = async (filters = {}) => {
  return getAnalyticsReport('inventory/movement', filters);
};

/**
 * Fetch inventory health report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Inventory health metrics
 */
export const getInventoryHealth = async (filters = {}) => {
  return getAnalyticsReport('inventory/health', filters);
};

/**
 * Fetch trending categories report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Category trending data
 */
export const getTrendingCategories = async (filters = {}) => {
  return getAnalyticsReport('categories/trending', filters);
};

/**
 * Fetch active customers report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Active customers data (DAU/MAU)
 */
export const getActiveCustomers = async (filters = {}) => {
  return getAnalyticsReport('customers/active', filters);
};

/**
 * Fetch customer acquisition report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Customer acquisition data
 */
export const getCustomerAcquisition = async (filters = {}) => {
  return getAnalyticsReport('customers/acquisition', filters);
};

/**
 * Fetch top customers report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Top customers data
 */
export const getTopCustomers = async (filters = {}) => {
  return getAnalyticsReport('customers/top', filters);
};

/**
 * Fetch employee performance report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Employee performance data
 */
export const getEmployeePerformance = async (filters = {}) => {
  return getAnalyticsReport('employees/performance', filters);
};

/**
 * Fetch shop performance report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Shop performance data
 */
export const getShopPerformance = async (filters = {}) => {
  return getAnalyticsReport('shops/performance', filters);
};

/**
 * Fetch platform health report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Platform health metrics
 */
export const getPlatformHealth = async (filters = {}) => {
  return getAnalyticsReport('platform/health', filters);
};

/**
 * Fetch company status report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Company status data
 */
export const getCompanyStatus = async (filters = {}) => {
  return getAnalyticsReport('companies/status', filters);
};

/**
 * Fetch tier distribution report
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Tier distribution data
 */
export const getTierDistribution = async (filters = {}) => {
  return getAnalyticsReport('companies/tiers', filters);
};

export default {
  getAnalyticsReport,
  getSalesRevenue,
  getProfitability,
  getPaymentMethods,
  getTopCompanies,
  getInventoryMovement,
  getInventoryHealth,
  getTrendingCategories,
  getActiveCustomers,
  getCustomerAcquisition,
  getTopCustomers,
  getEmployeePerformance,
  getShopPerformance,
  getPlatformHealth,
  getCompanyStatus,
  getTierDistribution,
};
