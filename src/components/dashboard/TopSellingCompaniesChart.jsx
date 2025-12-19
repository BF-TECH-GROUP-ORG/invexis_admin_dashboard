"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PRIMARY_COLORS = {
  orange: "#ff782d",
};

export default function TopSellingCompaniesChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">
            Top 20 Best-Selling Companies
          </h2>
          <p className="text-sm text-neutral-500">
            Companies with highest sales performance
          </p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No company data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">
          Top 20 Best-Selling Companies
        </h2>
        <p className="text-sm text-neutral-500">
          Companies with highest sales performance
        </p>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#9ca3af"
              style={{ fontSize: "11px" }}
              width={95}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
              }}
            />
            <Bar
              dataKey="revenue"
              fill={PRIMARY_COLORS.orange}
              radius={[0, 8, 8, 0]}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
