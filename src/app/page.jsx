"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import SalesAnalyticsChart from "@/components/dashboard/SalesAnalyticsChart";
import RevenueAnalyticsChart from "@/components/dashboard/RevenueAnalyticsChart";
import PaymentMethodsChart from "@/components/dashboard/PaymentMethodsChart";
import TrendingInsightsTable from "@/components/dashboard/TrendingInsightsTable";
import TopSellingCompaniesChart from "@/components/dashboard/TopSellingCompaniesChart";
import ActiveInactiveCompaniesChart from "@/components/dashboard/ActiveInactiveCompaniesChart";
import TierDistributionChart from "@/components/dashboard/TierDistributionChart";
import RecentCompaniesCard from "@/components/dashboard/RecentCompaniesCard";
import UserService from "@/services/UserService";
import CompanyService from "@/services/CompanyService";

import {
  salesDataMonthly,
  statsData as initialStatsData,
  topSellingCompanies,
  trendingData,
} from "@/data/mockData";
import { revenueOrderData, paymentMethodsData } from "@/data/analyticsData";

export default function DashboardHome() {
  const [salesPeriod, setSalesPeriod] = useState("monthly");
  const [trendsPeriod, setTrendsPeriod] = useState("yearly");
  const [companies, setCompanies] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch companies directly from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await CompanyService.getAll({ limit: 200 });
        setCompanies(data?.data || data || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch user count directly from API
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await UserService.getCompanyAdmins();
        setUserCount(res?.pagination?.totalItems || res?.data?.length || 0);
      } catch (error) {
        console.error("Failed to fetch user count:", error);
        setUserCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchUserCount();
  }, []);

  const getSalesData = () => salesDataMonthly;

  // Prepare chart data from real companies
  const totalCompanies = companies.length;
  const activeCount = companies.filter((c) => c.status === "active").length;
  const inactiveCount = totalCompanies - activeCount;
  const companyStatusData = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: inactiveCount },
  ];

  const tierCounts = companies.reduce((acc, c) => {
    const tier = (c.tier || "basic").toLowerCase();
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});
  const tierData = [
    { name: "Basic", value: tierCounts.basic || 0 },
    { name: "Mid", value: tierCounts.mid || 0 },
    { name: "Pro", value: tierCounts.pro || 0 },
  ];

  // Merge real data into statsData
  const statsData = initialStatsData.map((stat) => {
    if (stat.title === "Total Companies") {
      return { ...stat, value: totalCompanies.toString() };
    }
    if (stat.title === "Total Users") {
      return { ...stat, value: userCount.toLocaleString() };
    }
    return stat;
  });

  // Recent companies passed to RecentCompaniesCard
  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* MAIN DASHBOARD GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* SALES ANALYTICS CHART */}
          <SalesAnalyticsChart
            data={getSalesData()}
            period={salesPeriod}
            onPeriodChange={setSalesPeriod}
          />

          {/* REVENUE & ORDER ANALYTICS */}
          <RevenueAnalyticsChart data={revenueOrderData} />

          {/* TRENDING INSIGHTS TABLE */}
          <TrendingInsightsTable
            data={trendingData}
            period={trendsPeriod}
            onPeriodChange={setTrendsPeriod}
          />

          {/* TOP 20 SELLING COMPANIES CHART */}
          <TopSellingCompaniesChart data={topSellingCompanies} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* ACTIVE/INACTIVE COMPANIES */}
          <ActiveInactiveCompaniesChart data={companyStatusData} />

          {/* PAYMENT METHODS */}
          <PaymentMethodsChart data={paymentMethodsData} />

          {/* RECENT REGISTERED COMPANIES */}
          <RecentCompaniesCard companies={companies} />

          {/* TIER DISTRIBUTION */}
          <TierDistributionChart data={tierData} />
        </div>
      </div>
    </div>
  );
}
