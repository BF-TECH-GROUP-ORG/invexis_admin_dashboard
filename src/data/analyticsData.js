// Revenue & Order Analytics Data
export const revenueOrderData = [
  { label: "Jan", revenue: 45000, orders: 320 },
  { label: "Feb", revenue: 52000, orders: 380 },
  { label: "Mar", revenue: 48000, orders: 350 },
  { label: "Apr", revenue: 61000, orders: 420 },
  { label: "May", revenue: 58000, orders: 410 },
  { label: "Jun", revenue: 72000, orders: 480 },
  { label: "Jul", revenue: 68000, orders: 450 },
  { label: "Aug", revenue: 79000, orders: 520 },
  { label: "Sep", revenue: 85000, orders: 580 },
  { label: "Oct", revenue: 92000, orders: 620 },
  { label: "Nov", revenue: 88000, orders: 590 },
  { label: "Dec", revenue: 105000, orders: 720 },
];

// Profitability Data
export const profitabilityData = [
  { label: "Jan", revenue: 45000, cost: 28000, profit: 17000, margin: 37.8 },
  { label: "Feb", revenue: 52000, cost: 32000, profit: 20000, margin: 38.5 },
  { label: "Mar", revenue: 48000, cost: 29000, profit: 19000, margin: 39.6 },
  { label: "Apr", revenue: 61000, cost: 36000, profit: 25000, margin: 41.0 },
  { label: "May", revenue: 58000, cost: 34000, profit: 24000, margin: 41.4 },
  { label: "Jun", revenue: 72000, cost: 42000, profit: 30000, margin: 41.7 },
  { label: "Jul", revenue: 68000, cost: 39000, profit: 29000, margin: 42.6 },
  { label: "Aug", revenue: 79000, cost: 45000, profit: 34000, margin: 43.0 },
  { label: "Sep", revenue: 85000, cost: 48000, profit: 37000, margin: 43.5 },
  { label: "Oct", revenue: 92000, cost: 51000, profit: 41000, margin: 44.6 },
  { label: "Nov", revenue: 88000, cost: 49000, profit: 39000, margin: 44.3 },
  { label: "Dec", revenue: 105000, cost: 58000, profit: 47000, margin: 44.8 },
];

// Payment Methods Data
export const paymentMethodsData = [
  { name: "Cash", value: 125000 },
  { name: "Card", value: 285000 },
  { name: "Mobile", value: 420000 },
  { name: "Other", value: 23000 },
];

// Inventory Movement Data
export const inventoryMovementData = [
  { label: "Jan", stockIn: 1500, stockOut: 1200, net: 300 },
  { label: "Feb", stockIn: 1800, stockOut: 1400, net: 400 },
  { label: "Mar", stockIn: 1600, stockOut: 1500, net: 100 },
  { label: "Apr", stockIn: 2200, stockOut: 1800, net: 400 },
  { label: "May", stockIn: 2000, stockOut: 1900, net: 100 },
  { label: "Jun", stockIn: 2500, stockOut: 2100, net: 400 },
  { label: "Jul", stockIn: 2300, stockOut: 2200, net: 100 },
  { label: "Aug", stockIn: 2800, stockOut: 2400, net: 400 },
  { label: "Sep", stockIn: 2600, stockOut: 2500, net: 100 },
  { label: "Oct", stockIn: 3000, stockOut: 2700, net: 300 },
  { label: "Nov", stockIn: 2900, stockOut: 2800, net: 100 },
  { label: "Dec", stockIn: 3500, stockOut: 3200, net: 300 },
];

// Category Trending Data (Treemap)
export const categoryTrendingData = [
  { name: "Electronics", value: 4500 },
  { name: "Groceries", value: 3800 },
  { name: "Clothing", value: 3200 },
  { name: "Home & Garden", value: 2100 },
  { name: "Sports", value: 1800 },
  { name: "Books", value: 1500 },
  { name: "Toys", value: 1200 },
  { name: "Beauty", value: 950 },
];

// Customer Activity Data (DAU/MAU)
export const customerActivityData = [
  { label: "Week 1", dau: 1200, mau: 8500 },
  { label: "Week 2", dau: 1350, mau: 8800 },
  { label: "Week 3", dau: 1280, mau: 9100 },
  { label: "Week 4", dau: 1450, mau: 9400 },
  { label: "Week 5", dau: 1520, mau: 9700 },
  { label: "Week 6", dau: 1680, mau: 10200 },
  { label: "Week 7", dau: 1750, mau: 10500 },
  { label: "Week 8", dau: 1820, mau: 10800 },
  { label: "Week 9", dau: 1900, mau: 11200 },
  { label: "Week 10", dau: 2050, mau: 11600 },
  { label: "Week 11", dau: 2100, mau: 12000 },
  { label: "Week 12", dau: 2250, mau: 12500 },
];

// Customer Acquisition Data
export const customerAcquisitionData = [
  { label: "Jan", newCustomers: 320 },
  { label: "Feb", newCustomers: 380 },
  { label: "Mar", newCustomers: 350 },
  { label: "Apr", newCustomers: 420 },
  { label: "May", newCustomers: 410 },
  { label: "Jun", newCustomers: 480 },
  { label: "Jul", newCustomers: 450 },
  { label: "Aug", newCustomers: 520 },
  { label: "Sep", newCustomers: 580 },
  { label: "Oct", newCustomers: 620 },
  { label: "Nov", newCustomers: 590 },
  { label: "Dec", newCustomers: 720 },
];

// Top Customers Data
export const topCustomersData = [
  { name: "John Doe", orders: 45, totalSpent: 12500, avgOrder: 278 },
  { name: "Jane Smith", orders: 38, totalSpent: 11200, avgOrder: 295 },
  { name: "Mike Johnson", orders: 42, totalSpent: 10800, avgOrder: 257 },
  { name: "Sarah Williams", orders: 35, totalSpent: 9500, avgOrder: 271 },
  { name: "David Brown", orders: 33, totalSpent: 8900, avgOrder: 270 },
  { name: "Emily Davis", orders: 31, totalSpent: 8200, avgOrder: 265 },
  { name: "Chris Wilson", orders: 29, totalSpent: 7800, avgOrder: 269 },
  { name: "Lisa Anderson", orders: 28, totalSpent: 7500, avgOrder: 268 },
  { name: "Tom Martinez", orders: 26, totalSpent: 7100, avgOrder: 273 },
  { name: "Anna Taylor", orders: 25, totalSpent: 6800, avgOrder: 272 },
];

// Employee Performance Data
export const employeePerformanceData = [
  { name: "Alice Cooper", sales: 85000, orders: 320 },
  { name: "Bob Martin", sales: 78000, orders: 295 },
  { name: "Carol White", sales: 72000, orders: 280 },
  { name: "Dan Green", sales: 68000, orders: 265 },
  { name: "Eve Black", sales: 65000, orders: 250 },
  { name: "Frank Blue", sales: 61000, orders: 240 },
  { name: "Grace Red", sales: 58000, orders: 230 },
  { name: "Henry Gold", sales: 55000, orders: 220 },
  { name: "Ivy Silver", sales: 52000, orders: 210 },
  { name: "Jack Bronze", sales: 48000, orders: 200 },
];

// Shop Performance Data
export const shopPerformanceData = [
  { name: "Downtown Store", revenue: 125000, orders: 850 },
  { name: "Mall Location", revenue: 118000, orders: 820 },
  { name: "Airport Shop", revenue: 95000, orders: 680 },
  { name: "Suburb Branch", revenue: 87000, orders: 620 },
  { name: "City Center", revenue: 82000, orders: 590 },
  { name: "West Side", revenue: 75000, orders: 540 },
  { name: "East End", revenue: 68000, orders: 490 },
  { name: "North Plaza", revenue: 62000, orders: 450 },
];

// Inventory Health Metrics
export const inventoryHealthData = {
  totalStock: 15420,
  lowStockItems: 23,
  outOfStock: 5,
  salesVelocity: 85.5,
  turnoverRate: 4.2,
  avgDaysToSell: 87,
};

// Platform Health Metrics
export const platformHealthData = {
  activeCompanies: 156,
  inactiveCompanies: 42,
  totalShops: 584,
  totalUsers: 9432,
  eventThroughput: 12500,
  avgResponseTime: 245,
};
