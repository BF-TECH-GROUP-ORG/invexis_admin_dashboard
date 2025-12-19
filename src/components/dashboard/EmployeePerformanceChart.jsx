"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Trophy, Medal, Award } from "lucide-react";

const COLORS = ["#ff782d", "#a855f7", "#3b82f6", "#10b981", "#f59e0b"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-900">{data.name || 'N/A'}</p>
        <p className="text-lg font-bold text-neutral-700">
          ${(data.sales || 0).toLocaleString()}
        </p>
        <p className="text-xs text-neutral-500">{data.orders || 0} orders</p>
      </div>
    );
  }
  return null;
};

export default function EmployeePerformanceChart({ data = [], title = "Employee Performance" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">Top performers by sales</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No employee data available</p>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => (b.sales || 0) - (a.sales || 0));
  const topPerformers = sortedData.slice(0, 3);

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Sales leaderboard - Top performing staff
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {topPerformers.map((employee, index) => {
          const icons = [Trophy, Medal, Award];
          const Icon = icons[index];
          const colors = ["#ff782d", "#a855f7", "#3b82f6"];
          return (
            <div
              key={index}
              className="p-4 rounded-lg border-2 transition hover:shadow-md"
              style={{ borderColor: colors[index] }}
            >
              <div className="flex items-center justify-center mb-2">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${colors[index]}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: colors[index] }} />
                </div>
              </div>
              <p className="text-xs text-center text-neutral-600 mb-1">
                #{index + 1} {employee.name}
              </p>
              <p className="text-lg font-bold text-center text-neutral-900">
                ${(employee.sales || 0).toLocaleString()}
              </p>
              <p className="text-xs text-center text-neutral-500">
                {employee.orders || 0} orders
              </p>
            </div>
          );
        })}
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "13px" }}
              label={{ value: "Sales ($)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="sales"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
