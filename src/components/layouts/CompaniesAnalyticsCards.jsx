"use client";

import { Users, Building2, TrendingUp, Award } from "lucide-react";

export default function CompaniesAnalyticsCards({ companies }) {
  // Calculate analytics
  const totalCompanies = companies.length;
  const totalEmployees = companies.reduce((sum, c) => sum + (c.employees || 0), 0);
  const avgEmployees = totalCompanies > 0 ? Math.round(totalEmployees / totalCompanies) : 0;

  // Count by tier
  const tierCounts = companies.reduce(
    (acc, c) => {
      const tier = c.tier?.toLowerCase() || "basic";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    {}
  );

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
      title: "Total Employees",
      value: totalEmployees.toLocaleString(),
      icon: Users,
      color: "#10b981",
      bgColor: "#f0fdf4",
      description: "Across all companies",
    },
    {
      title: "Avg Employees",
      value: avgEmployees,
      icon: TrendingUp,
      color: "#3b82f6",
      bgColor: "#eff6ff",
      description: "Per company",
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
                <p className="text-xs text-[#9ca3af]">
                  {card.description}
                </p>
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
