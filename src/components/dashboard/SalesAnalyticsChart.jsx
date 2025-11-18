"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import PeriodToggle from "./PeriodToggle";
import DateRangeInput from "./DateRangeInput";

const PRIMARY_COLORS = {
  orange: "#ff782d",
  purple: "#a855f7",
  blue: "#3b82f6",
};

export default function SalesAnalyticsChart({
  data,
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            Sales Analytics by Tier
          </h2>
          <p className="text-sm text-neutral-500">
            Track tier sales performance (Basic, Pro, Mid)
          </p>
        </div>
        <PeriodToggle value={period} onChange={onPeriodChange} />
      </div>

      <DateRangeInput
        startDate={startDate}
        endDate={endDate}
        onStartChange={onStartDateChange}
        onEndChange={onEndDateChange}
      />

      <div className="w-full h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id="colorBasicGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.orange}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.orange}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorProGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.purple}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.purple}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorMidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={PRIMARY_COLORS.blue}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={PRIMARY_COLORS.blue}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "13px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px",
              }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
            <Area
              type="natural"
              dataKey="Basic"
              stroke={PRIMARY_COLORS.orange}
              strokeWidth={3}
              fill="url(#colorBasicGradient)"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Area
              type="natural"
              dataKey="Pro"
              stroke={PRIMARY_COLORS.purple}
              strokeWidth={3}
              fill="url(#colorProGradient)"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Area
              type="natural"
              dataKey="Mid"
              stroke={PRIMARY_COLORS.blue}
              strokeWidth={3}
              fill="url(#colorMidGradient)"
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
