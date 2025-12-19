"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PRIMARY_COLORS = {
  orange: "#ff782d",
  purple: "#a855f7",
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-900">{data.name}</p>
        <p className="text-sm font-bold text-neutral-700">{data.value}</p>
        <p className="text-xs text-neutral-500">
          {(
            (data.value /
              (data.value +
                (data.payload.name === "Active"
                  ? data.payload.totalInactive
                  : data.payload.totalActive))) *
            100
          ).toFixed(1)}
          %
        </p>
      </div>
    );
  }
  return null;
};

export default function ActiveInactiveCompaniesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white">
        <h2 className="text-lg font-semibold mb-4">
          Active / Inactive Companies
        </h2>
        <div className="w-full h-72 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No company data available</p>
        </div>
      </div>
    );
  }

  // Calculate totals for percentage calculation
  const totalActive = data[0]?.value || 0;
  const totalInactive = data[1]?.value || 0;
  const total = totalActive + totalInactive;

  // Prepare data with additional properties for tooltip
  const enhancedData = data.map((item) => ({
    ...item,
    totalActive,
    totalInactive,
  }));

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <h2 className="text-lg font-semibold mb-4">
        Active / Inactive Companies
      </h2>

      <div className="w-full h-72 flex justify-center">
        <ResponsiveContainer width="80%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={enhancedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={80}
              innerRadius={50}
              stroke="white"
              strokeWidth={3}
              cornerRadius={10}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              <Cell fill={PRIMARY_COLORS.orange} />
              <Cell fill={PRIMARY_COLORS.purple} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm mt-6 flex flex-col gap-2 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: PRIMARY_COLORS.orange }}
            ></span>
            <span className="text-neutral-700">Active</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-neutral-900">
              {data[0]?.value || 0}
            </span>
            <span className="text-neutral-500">
              ({total > 0 ? ((totalActive / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: PRIMARY_COLORS.purple }}
            ></span>
            <span className="text-neutral-700">Inactive</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-neutral-900">
              {data[1]?.value || 0}
            </span>
            <span className="text-neutral-500">
              ({total > 0 ? ((totalInactive / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
