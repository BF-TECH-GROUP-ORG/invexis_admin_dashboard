"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = "#ff782d",
  bgColor = "#fff8f5",
}) {
  const isPositive = trend === "up";

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-neutral-900">{value}</h3>
        </div>
        {Icon && (
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: bgColor }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-neutral-500 mb-2">{subtitle}</p>
      )}

      {trendValue && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={`text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendValue}
          </span>
          <span className="text-xs text-neutral-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
