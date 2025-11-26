"use client";

import { Users, Building2, TrendingUp, Award } from "lucide-react";

export default function CompaniesAnalyticsCards({ companies }) {
  // Calculate analytics
  const totalCompanies = companies.length;
  // remove employees aggregation — employees no longer tracked in UI
  const activeCompaniesCount = companies.filter(
    (c) => c.status === "active"
  ).length;
  const totalEmployees = 0;
  const pendingVerificationCount = companies.filter(
    (c) => c.metadata?.verification?.status === "pending"
  ).length;
  const avgEmployees = 0;

  // Count by tier
  const tierCounts = companies.reduce((acc, c) => {
    const tier = c.tier?.toLowerCase() || "basic";
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const proCount = tierCounts["pro"] || 0;
  const midCount = tierCounts["mid"] || 0;
  const basicCount = tierCounts["basic"] || 0;

  const cards = [
    {
      title: "Total Companies",
      value: totalCompanies,
      icon: Building2,
      color: "#ff782d",
      bgColor: "#fff8f5",
      description: "Active companies in system",
    },
    {
      title: "Active Companies",
      value: activeCompaniesCount,
      icon: Users,
      color: "#10b981",
      bgColor: "#f0fdf4",
      description: "Companies with active status",
    },
    {
      title: "Pending Verification",
      value: pendingVerificationCount,
      icon: TrendingUp,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      description: "Companies awaiting verification",
    },
    {
      title: "Premium Tier",
      value: proCount,
      icon: Award,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      description: "Pro plan subscribers",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="border-2 border-[#d1d5db] rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b7280] font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-[#081422] mb-2">
                  {card.value}
                </p>
                <p className="text-xs text-[#9ca3af]">{card.description}</p>
              </div>
              <div
                className="p-3 rounded-xl flex-shrink-0"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
