"use client";

import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import SalesAnalyticsChart from "@/components/dashboard/SalesAnalyticsChart";
import TrendingInsightsTable from "@/components/dashboard/TrendingInsightsTable";
import TopSellingCompaniesChart from "@/components/dashboard/TopSellingCompaniesChart";
import ActiveInactiveCompaniesChart from "@/components/dashboard/ActiveInactiveCompaniesChart";
import TierDistributionChart from "@/components/dashboard/TierDistributionChart";
import RecentCompaniesCard from "@/components/dashboard/RecentCompaniesCard";

import {
  salesDataDaily,
  salesDataWeekly,
  salesDataMonthly,
  salesDataYearly,
  topSellingCompanies,
  trendingData,
  companyStatusData,
  tierData,
  statsData,
  recentCompanies,
} from "@/data/mockData";

export default function DashboardHome() {
  const [salesPeriod, setSalesPeriod] = useState("monthly");
  const [trendsPeriod, setTrendsPeriod] = useState("yearly");

  const [salesStartDate, setSalesStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [salesEndDate, setSalesEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [trendsStartDate, setTrendsStartDate] = useState(
    new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split("T")[0]
  );
  const [trendsEndDate, setTrendsEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Get sales data based on selected period
  const getSalesData = () => {
    if (salesPeriod === "daily") return salesDataDaily;
    if (salesPeriod === "weekly") return salesDataWeekly;
    if (salesPeriod === "monthly") return salesDataMonthly;
    return salesDataYearly;
  };

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
            startDate={salesStartDate}
            endDate={salesEndDate}
            onStartDateChange={setSalesStartDate}
            onEndDateChange={setSalesEndDate}
          />

          {/* TRENDING INSIGHTS TABLE */}
          <TrendingInsightsTable
            data={trendingData}
            period={trendsPeriod}
            onPeriodChange={setTrendsPeriod}
            startDate={trendsStartDate}
            endDate={trendsEndDate}
            onStartDateChange={setTrendsStartDate}
            onEndDateChange={setTrendsEndDate}
          />

          {/* TOP 20 SELLING COMPANIES CHART */}
          <TopSellingCompaniesChart data={topSellingCompanies} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* ACTIVE/INACTIVE COMPANIES */}
          <ActiveInactiveCompaniesChart data={companyStatusData} />

          {/* RECENT REGISTERED COMPANIES */}
          <RecentCompaniesCard companies={recentCompanies} />

          {/* TIER DISTRIBUTION */}
          <TierDistributionChart data={tierData} />
        </div>
      </div>
    </div>
  );
}
