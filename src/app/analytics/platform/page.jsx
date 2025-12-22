"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MetricCard from "@/components/dashboard/MetricCard";
import ActiveInactiveCompaniesChart from "@/components/dashboard/ActiveInactiveCompaniesChart";
import TierDistributionChart from "@/components/dashboard/TierDistributionChart";
import TopSellingCompaniesChart from "@/components/dashboard/TopSellingCompaniesChart";
import { Building2, Store, Activity, Clock, AlertCircle } from "lucide-react";
import {
  getCompanyStatus,
  getTierDistribution,
  getTopCompanies,
} from "@/services/AnalyticsService";

export default function PlatformAnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");

  const [companyStatusDataState, setCompanyStatusData] = useState([]);
  const [tierDataState, setTierData] = useState([]);
  const [topCompaniesState, setTopCompanies] = useState([]);
  const [metrics, setMetrics] = useState({
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalShops: 0,
    eventThroughput: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          period,
          interval: period === "24h" ? "hour" : "day"
        };

        const [statusRes, tierRes, topRes] = await Promise.allSettled([
          getCompanyStatus(filters),
          getTierDistribution(filters),
          getTopCompanies(filters),
        ]);

        if (statusRes.status === "fulfilled" && statusRes.value?.data) {
          setCompanyStatusData(statusRes.value.data);
        }

        if (tierRes.status === "fulfilled" && tierRes.value?.data) {
          setTierData(tierRes.value.data);
        }

        if (topRes.status === "fulfilled" && topRes.value?.data) {
          setTopCompanies(topRes.value.data);
        }
      } catch (err) {
        console.error("Failed to fetch platform analytics:", err);
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Platform Health & Overview</h1>
            <p className="text-neutral-600">
              Executive dashboard for platform-wide metrics
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Active Companies"
          value={metrics.activeCompanies}
          subtitle={`${metrics.inactiveCompanies} inactive`}
          trend="up"
          trendValue="+5.2%"
          icon={Building2}
          color="#ff782d"
          bgColor="#fff8f5"
        />
        <MetricCard
          title="Total Shops"
          value={metrics.totalShops.toLocaleString()}
          subtitle="Across all companies"
          trend="up"
          trendValue="+8.1%"
          icon={Store}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <MetricCard
          title="Event Throughput"
          value={`${(metrics.eventThroughput / 1000).toFixed(1)}K`}
          subtitle="Events per hour"
          icon={Activity}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}ms`}
          subtitle="API performance"
          trend="down"
          trendValue="-12%"
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ActiveInactiveCompaniesChart data={companyStatusDataState} />
            <TierDistributionChart data={tierDataState} />
          </div>

          <div className="mb-6">
            <TopSellingCompaniesChart data={topCompaniesState} />
          </div>
        </>
      )}
    </div>
  );
}
