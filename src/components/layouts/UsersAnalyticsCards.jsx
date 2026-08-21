"use client";

import { Users, UserCheck, UserX, Briefcase } from "lucide-react";

export default function UsersAnalyticsCardsNew({
  users = [],
  onFilter = () => { },
  activeFilters = {},
}) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.accountStatus === "active").length;
  const companyAdmins = users.filter((u) => u.role === "company_admin").length;
  const suspendedUsers = users.filter((u) => u.accountStatus === "suspended" || u.accountStatus === false).length;

  const cards = [
    {
      key: "total",
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "#ff782d",
      bgColor: "#fff8f5",
      description: "All registered users",
    },
    {
      key: "active",
      title: "Active Users",
      value: activeUsers,
      icon: UserCheck,
      color: "#10b981",
      bgColor: "#f0fdf4",
      description: "Users currently active",
    },
    {
      key: "company_admin",
      title: "Company Admins",
      value: companyAdmins,
      icon: Briefcase,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      description: "Admins with company access",
    },
    {
      key: "suspended",
      title: "Suspended Users",
      value: suspendedUsers,
      icon: UserX,
      color: "#ef4444",
      bgColor: "#fff1f2",
      description: "Users currently suspended",
    },
  ];

  const isActive = (key) => {
    if (key === "total") return !activeFilters.role && !activeFilters.status;
    if (key === "active") return activeFilters.status === "active";
    if (key === "company_admin") return activeFilters.role === "company_admin";
    if (key === "suspended") return activeFilters.status === "suspended";
    return false;
  };

  const handleClick = (card) => {
    const active = isActive(card.key);
    if (active) {
      onFilter({ role: "", status: "" });
      return;
    }

    if (card.key === "total") onFilter({ role: "", status: "" });
    if (card.key === "active") onFilter({ status: "active" });
    if (card.key === "company_admin") onFilter({ role: "company_admin" });
    if (card.key === "suspended") onFilter({ status: "suspended" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const active = isActive(card.key);
        return (
          <div
            key={card.key}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(card);
              }
            }}
            onClick={() => handleClick(card)}
            className={`border-2 rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all cursor-pointer ${active ? "border-[#ff782d] shadow-sm" : "border-[#d1d5db]"
              }`}
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
