# 📊 Invexis Admin Dashboard - Analytics Guide

## Overview

This dashboard provides comprehensive analytics across multiple domains with beautiful, interactive charts powered by Recharts.

## 🎨 Available Chart Components

### 1. **RevenueAnalyticsChart** - Dual-Axis Composed Chart
- **Type**: Bar + Line Chart (Composed)
- **Use Case**: Revenue & Order Count Analytics
- **Features**:
  - Bars for Revenue ($)
  - Line for Order Count (#)
  - Dual Y-axis for different scales
  - Gradient fills
  - Custom tooltips

### 2. **ProfitabilityChart** - Stacked Bar + Line
- **Type**: Stacked Bar + Line Chart
- **Use Case**: Revenue, Cost, Profit, Margin Analysis
- **Features**:
  - Stacked bars (Cost + Profit = Revenue)
  - Line overlay for Gross Margin %
  - Dual Y-axis ($ and %)
  - Color-coded segments

### 3. **PaymentMethodsChart** - Enhanced Donut Chart
- **Type**: Donut/Pie Chart
- **Use Case**: Payment Methods Distribution
- **Features**:
  - Percentage labels inside segments
  - Icon-based legend
  - "Most Popular" highlight card
  - Detailed breakdown grid

### 4. **InventoryMovementChart** - Grouped Bar Chart
- **Type**: Grouped Bar Chart
- **Use Case**: Stock In vs Stock Out vs Net Change
- **Features**:
  - Color-coded bars (Green=In, Red=Out, Blue=Net)
  - Reference line at zero
  - Grouped comparison

### 5. **CategoryTrendingChart** - Treemap
- **Type**: Treemap
- **Use Case**: Category Sales Volume
- **Features**:
  - Size proportional to sales volume
  - Color-coded categories
  - Interactive tooltips
  - Legend grid below

### 6. **CustomerActivityChart** - Area Chart
- **Type**: Smooth Area Chart
- **Use Case**: DAU/MAU Trends
- **Features**:
  - Dual area fills with gradients
  - Smooth curves
  - Activity pulse visualization

### 7. **EmployeePerformanceChart** - Leaderboard Bar Chart
- **Type**: Vertical Bar Chart with Podium
- **Use Case**: Staff Sales Performance
- **Features**:
  - Top 3 performers highlighted
  - Trophy/Medal/Award icons
  - Color-coded rankings
  - Angled labels for readability

### 8. **ShopPerformanceChart** - Multi-color Bar Chart
- **Type**: Vertical Bar Chart
- **Use Case**: Location Revenue Comparison
- **Features**:
  - Each bar different color
  - Angled labels for long names
  - Revenue + order count tooltips

### 9. **TopCustomersTable** - Interactive Table
- **Type**: Data Table with Icons
- **Use Case**: Top Spending Customers
- **Features**:
  - Crown icons for top 3
  - Avatar initials
  - Sortable columns
  - Hover effects

### 10. **MetricCard** - KPI Card
- **Type**: Stat Card
- **Use Case**: Key Performance Indicators
- **Features**:
  - Large value display
  - Trend indicators (up/down)
  - Icon with colored background
  - Subtitle and comparison text

## 📍 Analytics Pages

### `/analytics/sales` - Sales & Financial Analytics
**Metrics:**
- Total Revenue
- Gross Profit
- Total Orders
- Avg Order Value

**Charts:**
- Revenue & Order Analytics (Dual-axis)
- Payment Methods Distribution (Donut)
- Profitability Analysis (Stacked Bar + Line)

### `/analytics/inventory` - Inventory & Operations
**Metrics:**
- Total Stock
- Low Stock Items
- Sales Velocity
- Avg Days to Sell

**Charts:**
- Inventory Movement (Grouped Bars)
- Category Trending (Treemap)

### `/analytics/customers` - Customer Analytics
**Metrics:**
- Total Customers
- New Customers
- Daily Active Users
- Retention Rate

**Charts:**
- Customer Activity (Area Chart)
- Top Customers (Table)

### `/analytics/staff` - Staff & Shop Performance
**Metrics:**
- Total Staff
- Top Performer
- Total Shops
- Avg per Shop

**Charts:**
- Employee Performance (Leaderboard)
- Shop Performance (Multi-color Bars)

### `/analytics/platform` - Platform Health
**Metrics:**
- Active Companies
- Total Shops
- Event Throughput
- Avg Response Time

**Charts:**
- Active/Inactive Companies (Pie)
- Tier Distribution (Donut)
- Top Selling Companies (Horizontal Bar)

## 🎯 Chart Best Practices

### When to Use Each Chart Type

| Chart Type | Best For | Avoid For |
|------------|----------|-----------|
| **Bar Chart** | Comparing categories, rankings | Time series with many points |
| **Line Chart** | Trends over time, continuous data | Comparing discrete categories |
| **Area Chart** | Volume over time, cumulative data | Precise value comparison |
| **Pie/Donut** | Part-to-whole relationships (max 6 slices) | Comparing similar values |
| **Treemap** | Hierarchical data, proportions | Sequential data |
| **Composed** | Multiple metrics with different scales | Simple single-metric data |

### Color Palette

```javascript
const PRIMARY_COLORS = {
  orange: "#ff782d",   // Primary brand color
  purple: "#a855f7",   // Secondary
  blue: "#3b82f6",     // Info
  green: "#10b981",    // Success
  red: "#ef4444",      // Danger
  yellow: "#f59e0b",   // Warning
  violet: "#8b5cf6",   // Accent
  cyan: "#06b6d4",     // Accent
};
```

## 🔧 Customization

### Adding a New Chart

1. Create component in `src/components/dashboard/`
2. Import Recharts components
3. Add custom tooltip
4. Style with Tailwind
5. Export and use in pages

### Example:

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MyChart({ data }) {
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <h2 className="text-xl font-semibold mb-4">My Chart</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#ff782d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 📊 Data Format Examples

### Time Series Data
```javascript
const data = [
  { label: "Jan", value: 4500 },
  { label: "Feb", value: 5200 },
  // ...
];
```

### Multi-Series Data
```javascript
const data = [
  { label: "Jan", series1: 4500, series2: 3200 },
  { label: "Feb", series1: 5200, series2: 3800 },
  // ...
];
```

### Categorical Data
```javascript
const data = [
  { name: "Category A", value: 4500 },
  { name: "Category B", value: 3200 },
  // ...
];
```

## 🚀 Performance Tips

1. **Limit data points**: Max 50-100 points for smooth rendering
2. **Use ResponsiveContainer**: Always wrap charts
3. **Memoize data**: Use `useMemo` for expensive calculations
4. **Lazy load**: Load analytics pages on demand
5. **Debounce filters**: Avoid excessive re-renders

## 📱 Responsive Design

All charts are fully responsive:
- Mobile: Single column, reduced height
- Tablet: 2-column grid
- Desktop: Multi-column layouts with optimal spacing

## 🎨 Accessibility

- High contrast colors
- Clear labels and legends
- Keyboard navigation support
- Screen reader friendly tooltips

## 📚 Resources

- [Recharts Documentation](https://recharts.org/)
- [Chart Type Selection Guide](https://www.data-to-viz.com/)
- [Color Accessibility Checker](https://webaim.org/resources/contrastchecker/)
