"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#ff782d",
  "#a855f7",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-900">{data.name || 'N/A'}</p>
        <p className="text-lg font-bold text-neutral-700">
          {(data.value || 0).toLocaleString()} units
        </p>
        <p className="text-xs text-neutral-500">
          {data.percentage || 0}% of total sales
        </p>
      </div>
    );
  }
  return null;
};

const CustomContent = ({ x, y, width, height, name, value, index }) => {
  const fontSize = Math.min(width / 8, height / 4, 16);
  const showValue = width > 80 && height > 60;
  const showName = width > 60 && height > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[(index || 0) % COLORS.length],
          stroke: "#fff",
          strokeWidth: 3,
          strokeOpacity: 1,
        }}
        rx={8}
      />
      {showName && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showValue ? 10 : 0)}
          textAnchor="middle"
          fill="#fff"
          fontSize={fontSize}
          fontWeight="bold"
        >
          {name || 'N/A'}
        </text>
      )}
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 15}
          textAnchor="middle"
          fill="#fff"
          fontSize={fontSize * 0.8}
        >
          {(value || 0).toLocaleString()}
        </text>
      )}
    </g>
  );
};

export default function CategoryTrendingChart({ data = [], title = "Trending Categories" }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <p className="text-sm text-neutral-500">
            Units sold by category (size = volume)
          </p>
        </div>
        <div className="w-full h-96 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">No category data available</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const enrichedData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    index,
  }));

  return (
    <div className="p-6 rounded-xl border border-neutral-300 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-neutral-500">
          Units sold by category (size = volume)
        </p>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={enrichedData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomContent />}
            animationDuration={1000}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {enrichedData.slice(0, 8).map((category, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200"
          >
            <span
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-600 truncate">{category.name || 'N/A'}</p>
              <p className="text-sm font-bold text-neutral-900">
                {(category.value || 0).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
