"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CustomerActivityChart from "@/components/dashboard/CustomerActivityChart";
import TopCustomersTable from "@/components/dashboard/TopCustomersTable";
import MetricCard from "@/components/dashboard/MetricCard";
import { Users, UserPlus, Activity, Heart, AlertCircle } from "lucide-react";
import {
  getActiveCustomers,
  getTopCustomers,
} from "@/services/AnalyticsService";

export default function CustomerAnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");
  
  const [activityData, setActivityData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          period,
          interval: "day",
          companyId: session?.user?.companyId,
        };

        const [activityRes, topRes] = await Promise.allSettled([
          getActiveCustomers(filters),
          getTopCustomers(filters),
        ]);

        if (activityRes.status === "fulfilled" && activityRes.value?.data) {
          setActivityData(activityRes.value.data);
        }

        if (topRes.status === "fulfilled" && topRes.value?.data) {
          setTopCustomers(topRes.value.data);
        }

      } catch (err) {
        console.error("Failed to fetch customer analytics:", err);
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
            <h1 className="text-2xl font-semibold mb-2">Customer Analytics</h1>
            <p className="text-neutral-600">
              Monitor customer activity, acquisition, and engagement
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
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
          title="Total Customers"
          value="12,500"
          subtitle="Active accounts"
          trend="up"
          trendValue="+18.2%"
          icon={Users}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <MetricCard
          title="New Customers"
          value="720"
          subtitle="This month"
          trend="up"
          trendValue="+22.1%"
          icon={UserPlus}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <MetricCard
          title="Daily Active"
          value="2,250"
          subtitle="Last 24 hours"
          trend="up"
          trendValue="+7.5%"
          icon={Activity}
          color="#ff782d"
          bgColor="#fff8f5"
        />
        <MetricCard
          title="Retention Rate"
          value="87.3%"
          subtitle="Monthly retention"
          trend="up"
          trendValue="+3.2%"
          icon={Heart}
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
          <CustomerActivityChart data={activityData} />
          <TopCustomersTable customers={topCustomers} />
        </div>
      )}
    </div>
  );
}
