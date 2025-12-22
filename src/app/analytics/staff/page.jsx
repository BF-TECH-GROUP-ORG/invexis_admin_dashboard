"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import EmployeePerformanceChart from "@/components/dashboard/EmployeePerformanceChart";
import ShopPerformanceChart from "@/components/dashboard/ShopPerformanceChart";
import MetricCard from "@/components/dashboard/MetricCard";
import { Users, Award, Store, TrendingUp, AlertCircle } from "lucide-react";
import {
  getEmployeePerformance,
  getShopPerformance,
} from "@/services/AnalyticsService";

export default function StaffAnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");

  const [employeeData, setEmployeeData] = useState([]);
  const [shopData, setShopData] = useState([]);

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

        const [employeeRes, shopRes] = await Promise.allSettled([
          getEmployeePerformance(filters),
          getShopPerformance(filters),
        ]);

        if (employeeRes.status === "fulfilled" && employeeRes.value?.data) {
          setEmployeeData(employeeRes.value.data);
        }

        if (shopRes.status === "fulfilled" && shopRes.value?.data) {
          setShopData(shopRes.value.data);
        }

      } catch (err) {
        console.error("Failed to fetch staff analytics:", err);
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
            <h1 className="text-2xl font-semibold mb-2">Staff & Shop Performance</h1>
            <p className="text-neutral-600">
              Track employee productivity and shop-level metrics
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
          title="Total Staff"
          value="156"
          subtitle="Active employees"
          trend="up"
          trendValue="+8"
          icon={Users}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <MetricCard
          title="Top Performer"
          value="$85K"
          subtitle="Alice Cooper"
          icon={Award}
          color="#ff782d"
          bgColor="#fff8f5"
        />
        <MetricCard
          title="Total Shops"
          value="8"
          subtitle="Active locations"
          icon={Store}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <MetricCard
          title="Avg per Shop"
          value="$89K"
          subtitle="Monthly revenue"
          trend="up"
          trendValue="+12.3%"
          icon={TrendingUp}
          color="#a855f7"
          bgColor="#faf5ff"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployeePerformanceChart data={employeeData} />
          <ShopPerformanceChart data={shopData} />
        </div>
      )}
    </div>
  );
}
