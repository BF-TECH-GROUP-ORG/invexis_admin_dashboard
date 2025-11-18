"use client";

import { Building2, Store, Users, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const iconMap = {
  Building2: Building2,
  Store: Store,
  Users: Users,
  DollarSign: DollarSign,
};

export default function StatCard({ title, value, icon, bgColor, color }) {
  const [displayValue, setDisplayValue] = useState(0);

  const IconComponent = iconMap[icon];

  useEffect(() => {
    // Extract numeric value for animation
    const numericValue = parseInt(value.replace(/[^0-9]/g, ""));

    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let currentValue = 0;
    const increment = numericValue / 30; // Animate over 30 steps
    const interval = setInterval(() => {
      currentValue += increment;
      if (currentValue >= numericValue) {
        setDisplayValue(numericValue.toLocaleString());
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(currentValue).toLocaleString());
      }
    }, 30);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors">
      <div className="flex flex-col">
        <span className="text-sm text-neutral-500">{title}</span>
        <span className="text-2xl font-bold mt-1">{displayValue || value}</span>
      </div>

      <div className="p-3 rounded-full" style={{ backgroundColor: bgColor }}>
        {IconComponent && (
          <IconComponent className="h-6 w-6" style={{ color }} />
        )}
      </div>
    </div>
  );
}
