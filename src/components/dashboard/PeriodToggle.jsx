"use client";

export default function PeriodToggle({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
      {["daily", "weekly", "monthly", "yearly"].map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
            value === period
              ? "bg-white text-orange-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
