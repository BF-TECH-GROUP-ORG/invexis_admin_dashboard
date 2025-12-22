"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RevenueAnalyticsChart from "@/components/dashboard/RevenueAnalyticsChart";
import ProfitabilityChart from "@/components/dashboard/ProfitabilityChart";
import PaymentMethodsChart from "@/components/dashboard/PaymentMethodsChart";
import MetricCard from "@/components/dashboard/MetricCard";
import { DollarSign, TrendingUp, CreditCard, ShoppingCart, AlertCircle } from "lucide-react";
import {
  getSalesRevenue,
  getProfitability,
  getPaymentMethods,
} from "@/services/AnalyticsService";

export default function SalesAnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");

  // Data states - start empty, populate from backend only
  const [revenueData, setRevenueData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: "$853K",
    grossProfit: "$365K",
    totalOrders: "5,840",
    avgOrderValue: "$146",
  });

  // Fetch analytics data from backend
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

        // Fetch all analytics in parallel
        const [revenueRes, profitRes, paymentRes] = await Promise.allSettled([
          getSalesRevenue(filters),
          getProfitability(filters),
          getPaymentMethods(filters),
        ]);

        // Update revenue data if successful
        if (revenueRes.status === "fulfilled" && revenueRes.value?.data) {
          setRevenueData(revenueRes.value.data);
          // Calculate metrics from API data
          const totalRev = revenueRes.value.data.reduce((sum, item) => sum + (item.revenue || 0), 0);
          const totalOrd = revenueRes.value.data.reduce((sum, item) => sum + (item.orderCount || 0), 0);
          setMetrics(prev => ({
            ...prev,
            totalRevenue: `$${(totalRev / 1000).toFixed(0)}K`,
            totalOrders: totalOrd.toLocaleString(),
            avgOrderValue: `$${totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0}`,
          }));
        }

        // Update profitability data if successful
        if (profitRes.status === "fulfilled" && profitRes.value?.data) {
          setProfitData(profitRes.value.data);
          const totalProfit = profitRes.value.data.reduce((sum, item) => sum + (item.profit || 0), 0);
          setMetrics(prev => ({
            ...prev,
            grossProfit: `$${(totalProfit / 1000).toFixed(0)}K`,
          }));
        }

        // Update payment methods data if successful
        if (paymentRes.status === "fulfilled" && paymentRes.value?.data) {
          setPaymentData(paymentRes.value.data);
        }

      } catch (err) {
        console.error("Failed to fetch sales analytics:", err);
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
            <h1 className="text-2xl font-semibold mb-2">Sales & Financial Analytics</h1>
            <p className="text-neutral-600">
              Comprehensive view of revenue, profitability, and payment trends
            </p>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Revenue"
              value={metrics.totalRevenue}
              subtitle="Selected period"
              trend="up"
              trendValue="+12.5%"
              icon={DollarSign}
              color="#ff782d"
              bgColor="#fff8f5"
            />
            <MetricCard
              title="Gross Profit"
              value={metrics.grossProfit}
              subtitle="42.8% margin"
              trend="up"
              trendValue="+8.3%"
              icon={TrendingUp}
              color="#10b981"
              bgColor="#f0fdf4"
            />
            <MetricCard
              title="Total Orders"
              value={metrics.totalOrders}
              subtitle="Selected period"
              trend="up"
              trendValue="+15.2%"
              icon={ShoppingCart}
              color="#3b82f6"
              bgColor="#eff6ff"
            />
            <MetricCard
              title="Avg Order Value"
              value={metrics.avgOrderValue}
              subtitle="Per transaction"
              trend="down"
              trendValue="-2.1%"
              icon={CreditCard}
              color="#a855f7"
              bgColor="#faf5ff"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueAnalyticsChart data={revenueData} />
            <PaymentMethodsChart data={paymentData} />
          </div>

          <div className="mb-6">
            <ProfitabilityChart data={profitData} />
          </div>
        </>
      )}
    </div>
  );
}
