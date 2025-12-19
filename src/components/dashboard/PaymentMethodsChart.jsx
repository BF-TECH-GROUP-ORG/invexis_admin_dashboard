"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CreditCard, Smartphone, Banknote, Award } from "lucide-react";

const COLORS = {
  cash: "#10b981",
  card: "#3b82f6",
  mobile: "#ff782d",
  other: "#8b5cf6",
};

const ICONS = {
  cash: Banknote,
  card: CreditCard,
  mobile: Smartphone,
  other: Award,
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = (payload[0].percent || 0) * 100;
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-900">{data.name || 'N/A'}</p>
        <p className="text-lg font-bold text-neutral-700">
          ${(data.value || 0).toLocaleString()}
        </p>
        <p className="text-xs text-neutral-500">{percentage.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PaymentMethodsChart({ data = [], title = "Payment Methods" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">Distribution by payment type</p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No payment data available</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const bestMethod = data.reduce((max, item) => (item.value > max.value ? item : max), data[0]);

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">Transaction volume by payment type</p>
      </div>

      {bestMethod && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-full">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-neutral-600 font-medium">Most Popular</p>
              <p className="text-lg font-bold text-neutral-900">
                {bestMethod.name} - {((bestMethod.value / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-72 flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip total={total} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              label={renderCustomLabel}
              labelLine={false}
              stroke="white"
              strokeWidth={3}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name.toLowerCase()] || COLORS.other}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {data.map((method, i) => {
          const Icon = ICONS[method.name.toLowerCase()] || ICONS.other;
          const color = COLORS[method.name.toLowerCase()] || COLORS.other;
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 transition"
            >
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-600">{method.name}</p>
                <p className="text-lg font-bold text-neutral-900">
                  ${(method.value || 0).toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500">
                  {total > 0 ? (((method.value || 0) / total) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
