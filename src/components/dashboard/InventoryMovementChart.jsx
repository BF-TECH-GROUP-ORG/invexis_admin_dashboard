"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const PRIMARY_COLORS = {
  stockIn: "#10b981",
  stockOut: "#ef4444",
  net: "#3b82f6",
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
              {(entry.value || 0).toLocaleString()} units
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function InventoryMovementChart({ data = [], title = "Inventory Movement" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">Stock in, out, and net change</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No inventory data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Stock In vs Stock Out with Net Change
        </p>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
              label={{ value: "Units", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
            <Bar
              dataKey="stockIn"
              name="Stock In"
              fill={PRIMARY_COLORS.stockIn}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Bar
              dataKey="stockOut"
              name="Stock Out"
              fill={PRIMARY_COLORS.stockOut}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Bar
              dataKey="net"
              name="Net Change"
              fill={PRIMARY_COLORS.net}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
