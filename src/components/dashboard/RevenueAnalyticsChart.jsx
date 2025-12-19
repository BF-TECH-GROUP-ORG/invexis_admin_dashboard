"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PRIMARY_COLORS = {
  revenue: "#ff782d",
  orders: "#3b82f6",
  profit: "#10b981",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-900 mb-2">
          {payload[0].payload.label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-bold text-neutral-900">
              {entry.name === "Orders" 
                ? (entry.value || 0).toLocaleString()
                : `$${(entry.value || 0).toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueAnalyticsChart({ data = [], title = "Revenue & Orders" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">Daily revenue and order volume</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No revenue data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Dual-axis view: Revenue (bars) & Order Count (line)
        </p>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY_COLORS.revenue} stopOpacity={0.8} />
                <stop offset="100%" stopColor={PRIMARY_COLORS.revenue} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
              label={{ value: "Revenue ($)", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
              label={{ value: "Orders", angle: 90, position: "insideRight" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue"
              fill="url(#revenueGradient)"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke={PRIMARY_COLORS.orders}
              strokeWidth={3}
              dot={{ fill: PRIMARY_COLORS.orders, r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
