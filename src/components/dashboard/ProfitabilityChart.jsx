"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PRIMARY_COLORS = {
  revenue: "#ff782d",
  cost: "#ef4444",
  profit: "#10b981",
  margin: "#8b5cf6",
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
              {entry.name === "Margin" 
                ? `${entry.value || 0}%`
                : `$${(entry.value || 0).toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProfitabilityChart({ data = [], title = "Profitability Analysis" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">Revenue, costs, and profit margins</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No profitability data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Revenue, Cost, Profit breakdown with Gross Margin %
        </p>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
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
              label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
              label={{ value: "Margin (%)", angle: 90, position: "insideRight" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar
              yAxisId="left"
              dataKey="cost"
              name="Cost"
              stackId="a"
              fill={PRIMARY_COLORS.cost}
              radius={[0, 0, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Bar
              yAxisId="left"
              dataKey="profit"
              name="Profit"
              stackId="a"
              fill={PRIMARY_COLORS.profit}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              name="Margin"
              stroke={PRIMARY_COLORS.margin}
              strokeWidth={3}
              dot={{ fill: PRIMARY_COLORS.margin, r: 5 }}
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
