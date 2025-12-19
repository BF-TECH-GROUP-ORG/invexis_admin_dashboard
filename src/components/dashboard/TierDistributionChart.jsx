"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PRIMARY_COLORS = {
  orange: "#ff782d",
  purple: "#a855f7",
  blue: "#3b82f6",
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-900">{data.name}</p>
        <p className="text-sm font-bold text-neutral-700">{data.value} users</p>
        <p className="text-xs text-neutral-500">{percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export default function TierDistributionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white">
        <h2 className="text-lg font-semibold mb-1">Tier Distribution</h2>
        <p className="text-sm text-neutral-500 mb-4">INVEXIS tier breakdown</p>
        <div className="w-full h-72 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No tier data available</p>
        </div>
      </div>
    );
  }

  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <h2 className="text-lg font-semibold mb-1">Tier Distribution</h2>
      <p className="text-sm text-neutral-500 mb-4">INVEXIS tier breakdown</p>

      <div className="w-full h-72 flex justify-center">
        <ResponsiveContainer width="80%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip total={total} />} />
            <Pie
              data={data}
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
              <Cell fill={PRIMARY_COLORS.blue} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm mt-6 flex flex-col gap-2 pt-4 border-t border-neutral-200">
        {data.map((tier, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: [
                    PRIMARY_COLORS.orange,
                    PRIMARY_COLORS.purple,
                    PRIMARY_COLORS.blue,
                  ][i],
                }}
              ></span>
              <span className="text-neutral-700">{tier.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-neutral-900">
                {tier.value || 0}
              </span>
              <span className="text-neutral-500">
                ({total > 0 ? (((tier.value || 0) / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
