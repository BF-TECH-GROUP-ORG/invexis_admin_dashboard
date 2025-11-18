"use client";

import { Calendar } from "lucide-react";

export default function DateRangeInput({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-neutral-500" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <span className="text-neutral-400">to</span>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
    </div>
  );
}
