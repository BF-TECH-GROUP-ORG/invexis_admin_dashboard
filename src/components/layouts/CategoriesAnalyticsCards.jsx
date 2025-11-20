"use client";

import { Users, Layers, Tag, CurlyBraces } from "lucide-react";
import React from "react";

export default function CategoriesAnalyticsCards({
  categories = [],
  onFilter = () => {},
  activeFilters = {},
}) {
  const total = categories.length;
  const level1 = categories.filter((c) => c.level === 1).length;
  const level2 = categories.filter((c) => c.level === 2).length;
  const level3 = categories.filter((c) => c.level === 3).length;
  const empty = categories.filter(
    (c) => (c.statistics?.totalProducts ?? 0) === 0
  ).length;

  const cards = [
    {
      key: "total",
      title: "Total Categories",
      value: total,
      icon: Users,
      color: "#ff782d",
      bgColor: "#fff8f5",
      description: "All categories",
    },
    {
      key: "level1",
      title: "Top-level",
      value: level1,
      icon: Layers,
      color: "#10b981",
      bgColor: "#f0fdf4",
      description: "Level 1 categories",
    },
    {
      key: "level2",
      title: "Level 2",
      value: level2,
      icon: Tag,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      description: "Subcategories (level 2)",
    },
    {
      key: "level3",
      title: "Level 3",
      value: level3,
      icon: Tag,
      color: "#06b6d4",
      bgColor: "#ecfeff",
      description: "Subcategories (level 3)",
    },
    {
      key: "empty",
      title: "No Products",
      value: empty,
      icon: CurlyBraces,
      color: "#ef4444",
      bgColor: "#fff1f2",
      description: "Categories with no products",
    },
  ];

  const isActive = (key) => {
    if (key === "total")
      return !activeFilters.level && !activeFilters.emptyOnly;
    if (key === "level1") return String(activeFilters.level) === "1";
    if (key === "level2") return String(activeFilters.level) === "2";
    if (key === "level3") return String(activeFilters.level) === "3";
    if (key === "empty") return !!activeFilters.emptyOnly;
    return false;
  };

  const handleClick = (card) => {
    const active = isActive(card.key);
    if (active) {
      onFilter({ level: "", emptyOnly: false });
      return;
    }

    if (card.key === "total") onFilter({ level: "", emptyOnly: false });
    if (card.key === "level1") onFilter({ level: 1, emptyOnly: false });
    if (card.key === "level2") onFilter({ level: 2, emptyOnly: false });
    if (card.key === "level3") onFilter({ level: 3, emptyOnly: false });
    if (card.key === "empty") onFilter({ level: "", emptyOnly: true });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
            className={`border-2 rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all cursor-pointer ${
              active ? "border-[#ff782d] shadow-sm" : "border-[#d1d5db]"
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
