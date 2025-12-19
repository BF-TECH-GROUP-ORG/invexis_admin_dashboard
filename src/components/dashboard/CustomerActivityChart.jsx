"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PRIMARY_COLORS = {
  dau: "#ff782d",
  mau: "#a855f7",
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
              {(entry.value || 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CustomerActivityChart({ data = [], title = "Customer Activity" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">Daily and monthly active users</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No customer activity data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Daily & Monthly Active Users trends
        </p>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.dau}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.dau}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="mauGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.mau}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.mau}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
              label={{ value: "Users", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="dau"
              name="Daily Active Users"
              stroke={PRIMARY_COLORS.dau}
              strokeWidth={3}
              fill="url(#dauGradient)"
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="mau"
              name="Monthly Active Users"
              stroke={PRIMARY_COLORS.mau}
              strokeWidth={3}
              fill="url(#mauGradient)"
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
