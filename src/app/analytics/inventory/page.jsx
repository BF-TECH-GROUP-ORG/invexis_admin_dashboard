"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import InventoryMovementChart from "@/components/dashboard/InventoryMovementChart";
import CategoryTrendingChart from "@/components/dashboard/CategoryTrendingChart";
import MetricCard from "@/components/dashboard/MetricCard";
import { Package, TrendingDown, TrendingUp, Zap, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import {
  getInventoryMovement,
  getTrendingCategories,
} from "@/services/AnalyticsService";

export default function InventoryAnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");

  const [movementData, setMovementData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStock: 0,
    lowStockItems: 0,
    outOfStock: 0,
    salesVelocity: 0,
    avgDaysToSell: 0,
    turnoverRate: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          period,
          interval: period === "24h" ? "hour" : "day",
          companyId: session?.user?.companyId,
        };

        const [movementRes, categoryRes] = await Promise.allSettled([
          getInventoryMovement(filters),
          getTrendingCategories(filters),
        ]);

        if (movementRes.status === "fulfilled" && movementRes.value?.data) {
          setMovementData(movementRes.value.data);
        }

        if (categoryRes.status === "fulfilled" && categoryRes.value?.data) {
          setCategoryData(categoryRes.value.data);
        }

      } catch (err) {
        console.error("Failed to fetch inventory analytics:", err);
        setError("Failed to load analytics data from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Inventory & Operations Analytics</h1>
            <p className="text-neutral-600">
              Track stock movement, trending categories, and inventory health
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Stock"
          value={metrics.totalStock.toLocaleString()}
          subtitle="Units in inventory"
          icon={Package}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          subtitle={`${metrics.outOfStock} out of stock`}
          trend="down"
          trendValue="-15%"
          icon={AlertTriangle}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <MetricCard
          title="Sales Velocity"
          value={`${metrics.salesVelocity}%`}
          subtitle="Stock turnover rate"
          trend="up"
          trendValue="+5.2%"
          icon={TrendingUp}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <MetricCard
          title="Avg Days to Sell"
          value={metrics.avgDaysToSell}
          subtitle={`${metrics.turnoverRate}x turnover`}
          icon={Clock}
          color="#a855f7"
          bgColor="#faf5ff"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InventoryMovementChart data={movementData} />
          <CategoryTrendingChart data={categoryData} />
        </div>
      )}
    </div>
  );
}
