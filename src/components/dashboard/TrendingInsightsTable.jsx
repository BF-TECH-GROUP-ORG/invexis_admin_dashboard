"use client";

import { useState } from "react";
import PeriodToggle from "./PeriodToggle";
import DateRangeInput from "./DateRangeInput";
import TrendingDetailsModal from "./TrendingDetailsModal";

export default function TrendingInsightsTable({
  data,
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (trend) => {
    setSelectedTrend(trend);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTrend(null), 200);
  };
  return (
    <>
      <div className="p-6 rounded-xl border border-neutral-300 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Trending Insights</h2>
            <p className="text-sm text-neutral-500">
              Companies, Tiers & Categories Performance
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

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                  Trending Companies
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                  Popular Tier
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                  Industry
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((trend) => (
                <tr
                  key={trend.id}
                  onClick={() => handleRowClick(trend)}
                  className="border-b border-neutral-100 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-neutral-900 font-medium">
                    {trend.label}
                  </td>
                  <td className="py-3 px-4 text-neutral-700">
                    {trend.companies}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      {trend.tiers}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700">
                    {trend.category}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-semibold">
                      {trend.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending Details Modal */}
      <TrendingDetailsModal
        isOpen={isModalOpen}
        trend={selectedTrend}
        onClose={handleCloseModal}
      />
    </>
  );
}
