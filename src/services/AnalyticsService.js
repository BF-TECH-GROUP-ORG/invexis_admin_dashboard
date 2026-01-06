import apiClient from "@/lib/apiClient";

/**
 * Analytics Service for Company Admin & Super Admin Dashboard
 *
 * API Pattern: GET /analytics/reports/{category}/{reportName}
 *
 * Standard Query Parameters:
 * - startDate: ISO Date (e.g., 2024-01-01T00:00:00Z or YYYY-MM-DD)
 * - endDate: ISO Date (e.g., 2024-12-31T23:59:59Z or YYYY-MM-DD)
 * - interval: 'hour' | 'day' | 'week' | 'month' | 'year'
 * - period: Shortcut for recent timeframes ('24h' | '7d' | '30d' | '1y')
 * - companyId: UUID (auto-filtered by backend middleware for company_admin)
 */

/**
 * Protocol Stabilizer: Converts wss:// to https:// for fetch/axios requests
 */
const getApiBase = () => {
  let url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL_SW ||
    "http://localhost:8000";
  if (url.startsWith("wss://")) return url.replace("wss://", "https://");
  if (url.startsWith("ws://")) return url.replace("ws://", "http://");
  return url;
};

const BASE_API = getApiBase();

const AnalyticsService = {
  /**
   * Internal helper to fetch Analytics Reports
   * @param {string} reportPath - Path after /reports/ (e.g., 'sales/revenue')
   * @param {object} filters - Query parameters
   * @returns {Promise} Response from API
   */
  getReport: async (reportPath, filters = {}) => {
    const params = {};

    // Date filtering
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    // Interval (hour | day | week | month | year)
    if (filters.interval) params.interval = filters.interval;

    // Company filter (usually auto-applied by backend)
    if (filters.companyId) params.companyId = filters.companyId;

    // Period shortcut (24h | 7d | 30d | 1y) - overrides startDate/endDate
    if (filters.period) params.period = filters.period;

    // Legacy support: dateRange object
    if (filters.dateRange?.start) params.startDate = filters.dateRange.start;
    if (filters.dateRange?.end) params.endDate = filters.dateRange.end;

    const baseUrl = BASE_API.endsWith("/") ? BASE_API.slice(0, -1) : BASE_API;
    const fullPath = `${baseUrl}/analytics/reports/${reportPath}`;

    if (process.env.NODE_ENV === "development") {
      console.log(`[AnalyticsService] Requesting: ${fullPath}`, params);
    }

    const response = await apiClient.get(fullPath, { params, retries: 0 });

    // apiClient returns response.data (the backend JSON)
    // Backend reports usually return { success: true, data: [...] } or { ok: true, data: [...] }
    return response?.data || response?.reports || response || [];
  },

  // ========== COMPANY ADMIN ROUTES ==========

  // ---------- 1. Sales & Financial Performance ----------

  /**
   * Revenue & Order Count over time
   * Response: [{ date, revenue, orderCount }]
   * Chart: Dual-Axis Line/Bar Chart
   */
  getRevenueReport: (filters) =>
    AnalyticsService.getReport("sales/revenue", filters),

  /**
   * Revenue, Cost, Profit, Margin
   * Response: [{ date, revenue, cost, profit, grossMarginPercent }]
   * Chart: Stacked Bar Chart with Margin Line
   */
  getProfitabilityReport: (filters) =>
    AnalyticsService.getReport("sales/profitability", filters),

  /**
   * Payment Methods Distribution (Cash, Card, Mobile)
   * Response: [{ method, count, totalAmount }]
   * Chart: Donut Chart
   */
  getPaymentMethodStats: (filters) =>
    AnalyticsService.getReport("sales/payment-methods", filters),

  /**
   * Best performing payment method
   * Response: { method, count, percentage }
   * Display: Highlight Card
   */
  getBestPaymentMethod: (filters) =>
    AnalyticsService.getReport("sales/payment-methods/best", filters),

  // ---------- 2. Inventory & Operations ----------

  /**
   * Stock In vs Stock Out vs Net Flow
   * Response: [{ date, stockIn, stockOut, netFlow }]
   * Chart: Grouped Bar Chart or Diverging Bar Chart
   */
  getStockMovement: (filters) =>
    AnalyticsService.getReport("inventory/movement", filters),

  /**
   * Units sold by category
   * Response: [{ category, unitsSold, revenue }]
   * Chart: Treemap
   */
  getTrendingCategories: (filters) =>
    AnalyticsService.getReport("categories/trending", filters),

  /**
   * Sales Velocity & Total Stock
   * Response: { salesVelocity, totalStock, turnoverRate }
   * Chart: Gauge / Speedometer Chart
   */
  getInventoryHealth: (filters) =>
    AnalyticsService.getReport("inventory/health", filters),

  // ---------- 3. Customer & Growth ----------

  /**
   * Daily Active Users / Monthly Active Users over time
   * Response: [{ date, dau, mau }]
   * Chart: Smooth Area Chart
   */
  getActiveUsers: (filters) =>
    AnalyticsService.getReport("customers/active", filters),

  /**
   * New customer signups over time
   * Response: [{ date, newCustomers }]
   * Chart: Vertical Bar Chart
   */
  getNewCustomerStats: (filters) =>
    AnalyticsService.getReport("customers/acquisition", filters),

  /**
   * Top spending customers
   * Response: [{ customerId, customerName, orders, totalSpent }]
   * Display: Interactive Table with sorting & pagination
   */
  getTopCustomers: (filters) =>
    AnalyticsService.getReport("customers/top", filters),

  // ---------- 4. Staff & Shops Performance ----------

  /**
   * Revenue per shop
   * Response: [{ shopId, shopName, totalRevenue, orderCount }]
   * Chart: Vertical Bar Chart
   */
  getShopPerformance: (filters) =>
    AnalyticsService.getReport("shops/performance", filters),

  /**
   * Sales per employee
   * Response: [{ employeeId, employeeName, totalSales, orderCount }]
   * Display: Leaderboard / Ranked List
   */
  getEmployeePerformance: (filters) =>
    AnalyticsService.getReport("employees/performance", filters),

  // ---------- 5. Product Analytics ----------

  /**
   * Top selling products
   * Response: [{ productId, productName, totalQuantity, totalRevenue }]
   * Chart: Horizontal Bar Chart
   */
  getTopProducts: (filters) =>
    AnalyticsService.getReport("products/top", filters),

  /**
   * Product return rates
   * Response: [{ productId, productName, returnCount, returnRate }]
   * Chart: Bar Chart or Table
   */
  getReturnRates: (filters) =>
    AnalyticsService.getReport("products/returns", filters),

  // ========== SUPER ADMIN ROUTES ==========

  // ---------- 6. Platform Health & Overview ----------

  /**
   * Platform-wide health metrics
   * Response: { activeCompanies, totalShops, eventThroughput, avgResponseTime }
   * Display: Summary Cards
   */
  getPlatformHealth: (filters) =>
    AnalyticsService.getReport("platform/health", filters),

  /**
   * Active vs Inactive Companies
   * Response: [{ status: 'active', count }, { status: 'inactive', count }]
   * Chart: Pie Chart
   */
  getCompanyStatus: (filters) =>
    AnalyticsService.getReport("companies/status", filters),

  /**
   * Company Tier Distribution
   * Response: [{ tier: 'bronze', count }, { tier: 'silver', count }, { tier: 'gold', count }]
   * Chart: Donut Chart
   */
  getTierDistribution: (filters) =>
    AnalyticsService.getReport("companies/tiers", filters),

  /**
   * Top revenue-generating companies
   * Response: [{ companyId, companyName, totalRevenue, orderCount }]
   * Chart: Horizontal Bar Chart
   */
  getTopCompanies: (filters) =>
    AnalyticsService.getReport("sales/top-companies", filters),

  /**
   * Company growth trends
   * Response: [{ date, newCompanies, totalActiveCompanies }]
   * Chart: Line Chart with Area Fill
   */
  getCompanyGrowth: (filters) =>
    AnalyticsService.getReport("companies/growth", filters),

  /**
   * System-wide revenue trends
   * Response: [{ date, totalRevenue, totalOrders, averageOrderValue }]
   * Chart: Multi-Line Chart
   */
  getPlatformRevenue: (filters) =>
    AnalyticsService.getReport("platform/revenue", filters),

  /**
   * User activity across platform
   * Response: [{ date, totalUsers, activeUsers, newUsers }]
   * Chart: Stacked Area Chart
   */
  getPlatformUserActivity: (filters) =>
    AnalyticsService.getReport("platform/user-activity", filters),

  /**
   * API usage and service health
   * Response: { requestsPerMinute, errorRate, uptime, latencyP95 }
   * Display: Service Dashboard
   */
  getServiceMetrics: (filters) =>
    AnalyticsService.getReport("platform/service-metrics", filters),

  // ========== Dashboard Summary ==========

  /**
   * Dashboard Overview (Company Admin)
   * For company admins, this provides key metrics for the selected period
   */
  getDashboardSummary: async (filters) => {
    try {
      // Fetch multiple quick stats in parallel for the dashboard cards
      const [revenue, profitability, returns, categories] = await Promise.all([
        AnalyticsService.getRevenueReport(filters),
        AnalyticsService.getProfitabilityReport(filters),
        AnalyticsService.getReturnRates(filters).catch(() => ({ data: [] })),
        AnalyticsService.getPaymentMethodStats(filters).catch(() => ({
          data: [],
        })),
      ]);

      // Calculate summary metrics from the reports
      const totalRevenue = revenue.reduce(
        (sum, item) => sum + parseFloat(item.revenue || 0),
        0
      );
      const totalProfit = profitability.reduce(
        (sum, item) => sum + parseFloat(item.profit || 0),
        0
      );
      const totalReturns = Array.isArray(returns)
        ? returns.reduce(
            (sum, item) => sum + parseInt(item.returnCount || 0),
            0
          )
        : 0;
      const totalOrders = revenue.reduce(
        (sum, item) => sum + parseInt(item.orderCount || 0),
        0
      );

      return {
        totalDailySales: totalRevenue.toFixed(2),
        totalDailyProfit: totalProfit.toFixed(2),
        totalReturnedProducts: totalReturns,
        totalDiscounts: 0, // This would need a dedicated endpoint
        totalOrders: totalOrders,
        paymentMethods: categories,
      };
    } catch (error) {
      console.error("[AnalyticsService] Dashboard Summary Error:", error);
      return {
        totalDailySales: 0,
        totalDailyProfit: 0,
        totalReturnedProducts: 0,
        totalDiscounts: 0,
        totalOrders: 0,
      };
    }
  },

  /**
   * Super Admin Dashboard Overview
   * Platform-wide metrics for super admins
   */
  getSuperAdminDashboard: async (filters) => {
    try {
      const [health, companies, revenue, userActivity] = await Promise.all([
        AnalyticsService.getPlatformHealth(filters).catch(() => ({})),
        AnalyticsService.getCompanyStatus(filters).catch(() => []),
        AnalyticsService.getPlatformRevenue(filters).catch(() => []),
        AnalyticsService.getPlatformUserActivity(filters).catch(() => []),
      ]);

      return {
        platformHealth: health,
        companyStats: companies,
        revenueData: revenue,
        userActivity: userActivity,
      };
    } catch (error) {
      console.error("[AnalyticsService] Super Admin Dashboard Error:", error);
      return {
        platformHealth: {},
        companyStats: [],
        revenueData: [],
        userActivity: [],
      };
    }
  },

  // ========== Export ==========

  /**
   * Export analytics report
   * Response: File download or export URL
   */
  exportReport: (filters) => AnalyticsService.getReport("export", filters),
};

// Legacy named exports for backward compatibility
export const getAnalyticsReport = AnalyticsService.getReport;
export const getSalesRevenue = AnalyticsService.getRevenueReport;
export const getProfitability = AnalyticsService.getProfitabilityReport;
export const getPaymentMethods = AnalyticsService.getPaymentMethodStats;
export const getTopCompanies = AnalyticsService.getTopCompanies;
export const getInventoryMovement = AnalyticsService.getStockMovement;
export const getInventoryHealth = AnalyticsService.getInventoryHealth;
export const getTrendingCategories = AnalyticsService.getTrendingCategories;
export const getActiveCustomers = AnalyticsService.getActiveUsers;
export const getCustomerAcquisition = AnalyticsService.getNewCustomerStats;
export const getTopCustomers = AnalyticsService.getTopCustomers;
export const getEmployeePerformance = AnalyticsService.getEmployeePerformance;
export const getShopPerformance = AnalyticsService.getShopPerformance;
export const getPlatformHealth = AnalyticsService.getPlatformHealth;
export const getCompanyStatus = AnalyticsService.getCompanyStatus;
export const getTierDistribution = AnalyticsService.getTierDistribution;

export default AnalyticsService;
